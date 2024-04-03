window.GRAPHING_LOADED = true;
import * as Global from "./global.js"
import * as PlotlyDark from "./PlotlyDark.js"
import * as FilterSearch from "./filterSearch.js"
import * as CourseData from "./courseData.js"
import * as Conversion from "./conversion.js";
/**
 * Generate the Prerequisite graph for a course
 * 
 * @param {course} course - The course to generate the graph for
 * @returns {void}
 */
export function GeneratePrerequisiteGraph(course) {
    var layout = {
        font: {
            size: 10,
        },
        margin: {
            t: 0,
            l: 0,
            r: 0,
            b: 0,
        },
        template: Global.isDarkMode.value ? PlotlyDark.plotly_dark : {},
    }; // The layout and theme for the graph
    var data = [];
    try {
        FilterSearch.scannedCourses.value = [];
        data = FilterSearch.preSearch(course.name, course.prerequisites, course.prerequisite_types);
    } catch (e2) {
        presentError(e2, e2, " - Data Parsing");
    }
    var label = [];
    var color = [];
    var linkcolor = [];
    var source = [];
    var target = [];
    var value = [];
    for (var i = 0; i < data.length; i++) { // Go through the prerequisite data
        var inID = label.findIndex((e) => {
            return e === data[i][0] || e === data[i][0] + " &#10003;";
        }); // The index of the label (part) if it was already generated
        let greyify = false;
        if (inID === -1) { // If the label (part) was not generated, generate it
            let taken = FilterSearch.wasTakenByName(data[i][0]); // Was the course taken before?
            label.push(taken ? data[i][0] : data[i][0] + " &#10003;"); // If taken label it with a checkmark and add it to labels
            let or_check = FilterSearch.coursePrerequisitesMet(
                CourseData.Courses[
                    CourseData.Courses.findIndex((e) => {
                        return e.name === data[i][1] || e.name === data[i][1] + " &#10003;";
                    })
                ], // The root course that this prerequisite is required for
                true
            ); // Is there a OR part in the prerequisites for the root course?
            if (or_check[0] && data[i][2] === CourseData.PREREQUISITE_OR && or_check[1]) { // If there is a OR prerequisite and the current prerequisite is part of it
                color.push(taken ? LIGHT_GREY : LIGHT_GREEN); // Make the label green if it's taken and grey if it's not
                if (taken) {
                    greyify = true; // Make the link grey
                }
            } else {
                color.push(taken ? Conversion.convertPrerequisiteTypeToColor(data[i][2]) : LIGHT_GREEN); // If the prerequisite is not part of a OR set it's color accordingly
            }
            inID = label.length - 1; // The label is now generated and is at the end of the label array
        }
        var outID = label.findIndex((e) => {
            return e === data[i][1] || e === data[i][1] + " &#10003;";
        }); // The index of the label (part) if it was already generated
        if (outID === -1) { // If the label (part) was not generated, generate it
            let taken = FilterSearch.wasTakenByName(data[i][1]) // Was the course taken before?
            label.push(taken ? data[i][1] : data[i][1] + " &#10003;"); // If taken label it with a checkmark and add it to labels
            color.push(taken ? Conversion.convertPrerequisiteTypeToColor(data[i][2]) : LIGHT_GREEN); // If the course is complete color the label gray, if not color it the way it should be
            outID = label.length - 1; // The label is now generated and is at the end of the label array
        }
        source.push(inID); // Create a link from the root course
        target.push(outID); // To the prerequisite
        let lnc = ""; // Link color
        if (FilterSearch.wasTakenByName(data[i][0])) { // If not taken
            if (greyify) {
                lnc = LIGHT_GREY; // If prerequisite is handled by another color it grey, (only for OR)
            } else {
                lnc = Conversion.convertPrerequisiteTypeToColorLight(data[i][2]); // Color it accordingly
            }
        } else {
            lnc = LIGHT_GREEN; // We have met the prerequisite, color the link green
        }
        linkcolor.push(lnc); // Add the link color to the link
        value.push(1); // Make sure all links are at the same scale
    }
    var dataObj = {
        type: "sankey",
        orientation: "h",
        node: {
            pad: 10,
            thickness: 10,
            line: {
                color: "black",
                width: 0,
            },
            label: label,
            color: color,
        },

        link: {
            source: source,
            target: target,
            value: value,
            color: linkcolor,
        },
        //arrangement: 'snap',
        hoverinfo: false,
    }; // The data that we are adding in a format that Plotly can understand
    var dataObj = [dataObj]; // Put it in a array so Plotly can use it
    Plotly.react("preflow", dataObj, layout, {
        scrollZoom: true,
        responsive: true,
        modebar_add: ["zoom", "pan"],
    }); // Generate the graph in div#preflow (found in: index.html > html > body > div#infobox > div > div#preflow)
}
/**
 * Update the course chart
 * 
 * @returns {void}
*/
export function PropagateCourseChart() {
    var layout = {
        font: {
            size: 10,
        },
        margin: {
            t: 10,
            l: 10,
            r: 10,
            b: 10,
        },
        template: Global.isDarkMode.value ? PlotlyDark.plotly_dark : {},
    };
    var appendData = [];
    try {
        FilterSearch.scannedCourses.value = [];
        for (let i = 0; i < CourseData.Courses.length; i++) {
            appendData.push(
                ...FilterSearch.preSearch(
                    CourseData.Courses[i].name,
                    CourseData.Courses[i].prerequisites,
                    CourseData.Courses[i].prerequisite_types,
                    true
                )
            );
        }
    } catch (e2) {
        presentError(e2, e2, " - Data Parsing");
    }
    var label = [];
    var color = [];
    var linkcolor = [];
    var source = [];
    var target = [];
    var value = [];
    for (var i = 0; i < appendData.length; i++) {
        var inID = label.findIndex((e) => {
            return e === appendData[i][0] || e === appendData[i][0] + " &#10003;";
        });
        let inCourseID = CourseData.Courses.findIndex((e) => {
            return e.name === appendData[i][1] || e.name === appendData[i][1] + " &#10003;";
        });
        if (FilterSearch.FilterCourse(CourseData.Courses[inCourseID])) {
            continue;
        }
        let greyify = false;
        if (inID === -1) {
            let taken = FilterSearch.wasTakenByName(appendData[i][0]);
            label.push(taken ? appendData[i][0] : appendData[i][0] + " &#10003;");
            let or_check = FilterSearch.coursePrerequisitesMet(CourseData.Courses[inCourseID], true);
            if (or_check[0] && appendData[i][2] === CourseData.PREREQUISITE_OR && or_check[1]) {
                color.push(taken ? LIGHT_GREY : LIGHT_GREEN);
                if (taken) {
                    greyify = true;
                }
            } else {
                color.push(taken ? Conversion.convertPrerequisiteTypeToColor(appendData[i][2]) : LIGHT_GREEN);
            }
            inID = label.length - 1;
        }
        var outID = label.findIndex((e) => {
            return e === appendData[i][1] || e === appendData[i][1] + " &#10003;";
        });
        if (outID === -1) {
            let taken = FilterSearch.wasTakenByName(appendData[i][1]);
            label.push(taken ? appendData[i][1] : appendData[i][1] + " &#10003;");
            color.push(taken ? Conversion.convertPrerequisiteTypeToColor(appendData[i][2]) : LIGHT_GREEN);
            outID = label.length - 1;
        }
        source.push(inID);
        target.push(outID);
        let lnc = "";
        if (FilterSearch.wasTakenByName(appendData[i][0])) {
            if (greyify) {
                lnc = LIGHT_GREY;
            } else {
                lnc = Conversion.convertPrerequisiteTypeToColorLight(appendData[i][2]);
            }
        } else {
            lnc = LIGHT_GREEN;
        }
        linkcolor.push(lnc);
        value.push(1);
    }
    var data = {
        type: "sankey",
        orientation: "h",
        node: {
            pad: 10,
            thickness: 5,
            line: {
                color: "black",
                width: 0,
            },
            label: label,
            color: color,
        },

        link: {
            source: source,
            target: target,
            value: value,
            color: linkcolor,
        },
        //arrangement: 'snap',
        hoverinfo: false,
    };
    var data = [data];
    Plotly.react("allc", data, layout, {
        scrollZoom: true,
        responsive: true,
        modebar_add: ["zoom", "pan"],
    });
}