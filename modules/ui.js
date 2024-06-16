window.UI_LOADED = true;
import * as Global from "./global.js"
import * as Graphing from "./graphing.js"
import * as Conversion from "./conversion.js"
import * as FilterSearch from "./filterSearch.js";
import * as Data from "./data.js";
import * as CourseData from "./courseData.js";

const takenCoursesSelectedIndex = new Global.State(-1);

/**
 * Display a course on the screen
 * 
 * @param {course} course - The course to display
 * @returns {void}
 */
export function showCourse(course) {
    document.querySelector("h5#courseInfoLabel").innerHTML = `<span class="text-secondary">${course.cid}&nbsp-</span> ${course.name}`; // Set the course name
    let credits = ""; // HTML of credits to display
    for (var i = 0; i < course.credits.length; i++) { // For all credits
        let thisCredit = course.credits[i];
        let creditName = Conversion.convertCreditToText(thisCredit[0]); // Get credit name in text
        credits += `${i === 0 ? "" : ", "}${creditName === "Commencement" ? 1 :thisCredit[1]} ${creditName} Credit`; // Add the credit to the list, if it's a commencement credit set the number of credits to 1 (The default is 0)
    }
    document.querySelector('input#courseInfoCredits').value = credits; // Display credits
    let exams = ""; // HTML of exams to display
    for (var i = 0; i < course.exams.length; i++) { // For all exams
        exams += `${i === 0 ? "" : ", "}${Conversion.convertExamToText(course.exams[i])} Exam`; // Add the exam to the list
    }
    if (course.exams.length === 0) {
        exams = "No Exams"
    }
    document.querySelector('input#courseInfoExams').value = exams; // Display exams
    
    let examScore = Data.getRegentsExamScore(course.cid)
    if (examScore[0]) {
        document.querySelector('input#courseInfoRegentsScore').parentElement.classList.remove("d-none")
        document.querySelector('input#courseInfoRegentsScore').value = examScore[1]
    } else {
        document.querySelector('input#courseInfoRegentsScore').parentElement.classList.add("d-none")
        document.querySelector('input#courseInfoRegentsScore').value = ""
    }

    let prerequisites = ""; // HTML of prerequisites to display
    let prerequisitesOrComplete = FilterSearch.coursePrerequisitesMet(course, true)[1]; // Variable to track if prerequisites are complete
    let prerequisites_complete = true;
    for (var i = 0; i < course.prerequisites.length; i++) { // Go through all the prerequisites
        let svg = ""; // The SVG to add to the end of the prerequisite
        if (FilterSearch.wasNotTakenByName(course.prerequisites[i])) { // If the course is NOT complete
            if (prerequisitesOrComplete && course.prerequisite_types[i] === CourseData.PREREQUISITE_OR) { // If it's a OR and we know that there is another one, display an N/A symbol
                svg = NA_SVG;
            } else if (course.prerequisite_types[i] === CourseData.PREREQUISITE_RECOMMENDED) { // If it's a recommend course display an N/A symbol because it's not required
                svg = NA_SVG;
            } else { // If it's just not done
                svg = X_SVG;
                prerequisites_complete = false;
            }
        } else {
            svg = CHECKMARK_SVG; // Prerequisite is complete and can be marked with a check
        }
        prerequisites += `<li>${course.prerequisites[i]} ${svg}</li>`; // Add the prerequisite with the SVG
    }
    if (course.prerequisites.length === 0) {
        prerequisites = "No Prerequisites"
    }
    document.querySelector("ul#courseInfoPrerequisites").innerHTML = prerequisites; // Display all the prerequisites
    let prerequisiteStatus = document.querySelector("div#courseInfoPrerequisiteStatus"); // The element for if all the prerequisites are met
    prerequisiteStatus.innerHTML = prerequisites_complete ? "Complete " + CHECKMARK_SVG : "Incomplete " + X_SVG;
    Global.errorHandle(Graphing.GeneratePrerequisiteGraph, course);
}

// Simple for if a course was take add the badge and add the regents score if available
export function takenComponent(course) {
    var titleAppendix = ""
    if (!FilterSearch.wasNotTaken(course)) {
        titleAppendix = TAKEN
        if (Data.getRegentsExamScore(course.cid)[0]) {
            titleAppendix = `<div class="badge text-bg-success">Taken | ${Data.getRegentsExamScore(course.cid)[1]}%</div>`;
        }
    }
    return titleAppendix
}

/**
 * Update the search results for taken courses
 * 
 * @returns {void}
 */
export function PropagateTakenCourseSearchResults() {
    document.querySelector("ul#addCourseSearchResults").innerHTML = ""; // Clear the results
    let results = FilterSearch.searchCourses(
        document.querySelector("input#addCourseNameSearch").value,""
        //document.querySelector("input#addCourseCIDSearch").value
        ); // Search courses with the user's search
    if (results.length === 0) {
        if (document.querySelector("input#addCourseNameSearch").value === "") { //&& document.getElementById("addcompletecid").value === "") {
            return;
        }
        document.querySelector("ul#addCourseSearchResults").innerHTML = "<p>No Results</p>"; // If there are no results, show that
        return;
    }
    var frag = document.createDocumentFragment(); // Fragment of what we are filling the results with
    for (var i = 0; i < results.length; i++) { // Go through all the courses matching the users input
        let thisResult = results[i];
        let credits = "";
        for (var creditIndex = 0; creditIndex < thisResult.credits.length; creditIndex++) { // Go through all the credits
            let creditName = Conversion.convertCreditToText(thisResult.credits[creditIndex][0]); // Get credit name in text
            credits += `${creditIndex === 0 ? "" : DIVIDER_SVG+" "}<span>${creditName === "Commencement" ? "" : thisResult.credits[creditIndex][1]} ${creditName} Credit</span>`; // Add the credit to the list, if it's a commencement credit don't display a number
        }
        let tmp = `<div class="d-flex justify-content-between align-items-center">
                <div class="fw-bold">${thisResult.name}</div>
                ${takenComponent(thisResult)}
            </div>
            <small class="d-flex gap-2">${thisResult.cid}</div><span class="text-body-secondary d-flex gap-2">${credits}</small>`
        let temp = document.createElement("a"); // The element that we are making
        temp.href = "#"
        temp.className = "list-group-item list-group-item-action"; // Styling
        temp.id =
            "atcid" +
            CourseData.Courses.indexOf(thisResult) // Set it's ID to it's course id so we can add it later
        temp.innerHTML = tmp; // Set the html to what we have before
        temp.addEventListener("click", Data.addTakenCourse); // Make it work 
        frag.appendChild(temp); // Add it to the list
    }
    document.querySelector("ul#addCourseSearchResults").appendChild(frag); // Add all the results to the HTML
}
function generateCourseFragment(thisTakenCourse, extras, clickHandle) {
    let credits = ""; // The credits for the course
    for (var creditIndex = 0; creditIndex < thisTakenCourse.credits.length; creditIndex++) { // Go through all the credits
        let thisCredit = thisTakenCourse.credits[creditIndex];
        let creditName = Conversion.convertCreditToText(thisCredit[0]); // Get credit name in text
        credits += `<div class="vr"></div>${creditName === "Commencement" ? "" : thisCredit[1]} ${creditName} Credit`; // Add the credit to the list, if it's a commencement credit don't display a number
    }
    let tmp = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="fw-bold">${thisTakenCourse.name}</div>
            <div class="d-flex gap-2">${extras()}</div>
        </div>
        <small class="d-flex gap-2">${thisTakenCourse.cid}</div><span class="text-body-secondary d-flex gap-2">${credits}</small>`
    let temp = document.createElement("a"); // The element that we are making
    temp.href = "#"
    temp.className = "list-group-item list-group-item-action"; // Styling
    temp.id =
        "tcipu" +
        CourseData.Courses.indexOf(thisTakenCourse) // Set it's ID to it's course id so we can view it later
    temp.innerHTML = tmp; // Set the html to what we have before
    temp.setAttribute("role", "button");
    temp.setAttribute("aria-selected", "false");
    temp.addEventListener("click", clickHandle);
    return temp;
}
/**
 * Display the taken courses on the screen
 * 
 * @returns {void}
 */
export function PropagateTakenCourses() {
    document.getElementById("takenCourses").innerHTML = ""; // Clear the list of taken courses
    if (Data.takenCourses.value.length === 0) {
        document.getElementById("takenCourses").innerHTML = '<small>Click "Add" to add a course</small>'; // Show how to add a course
        PropagateAvailableCourses();
        return
    }
    var frag = document.createDocumentFragment(); // Create a HTML fragment that will be added
    for (let i = 0; i < Data.takenCourses.value.length; i++) { // Go through all taken courses
        let thisTakenCourse = Data.takenCourses.value[i]
        frag.appendChild(generateCourseFragment(thisTakenCourse, () => {
            let returning = ""
            returning += !FilterSearch.coursePrerequisitesMet(thisTakenCourse) ? `<span class="badge text-bg-danger rounded-pill">Prerequisite Warning</span>` : ``
            returning += Data.getRegentsExamScore(thisTakenCourse.cid)[0] ? `<span class="badge text-bg-success rounded-pill">${Data.getRegentsExamScore(thisTakenCourse.cid)[1]}%</span>` : ""
            return returning
        }, (e) => {
            e.preventDefault();
            let hasPrimary = e.currentTarget.classList.contains("active")
            e.currentTarget.parentElement.childNodes.forEach((element, index, array) => {
                element.classList.remove("active") // Clear all existing active elements
            })
            const viewButton = document.querySelector("button#takenViewButton")
            const removeButton = document.querySelector("button#takenRemoveButton")
            if (hasPrimary) {
                e.currentTarget.classList.remove("active")
                e.currentTarget.setAttribute("aria-selected", "false")


                viewButton.classList.remove("btn-info")
                viewButton.classList.add("btn-disabled")
                viewButton.setAttribute("disabled", undefined)

                removeButton.classList.remove("btn-danger")
                removeButton.classList.add("btn-disabled")
                removeButton.setAttribute("disabled", undefined)

                takenCoursesSelectedIndex.value = -1;
            } else {
                e.currentTarget.classList.add("active")
                e.currentTarget.setAttribute("aria-selected", "true")


                viewButton.classList.remove("btn-disabled")
                viewButton.classList.add("btn-info")
                viewButton.removeAttribute("disabled")

                removeButton.classList.remove("btn-disabled")
                removeButton.classList.add("btn-danger")
                removeButton.removeAttribute("disabled")

                takenCoursesSelectedIndex.value = i
            }
            //showCourse(CourseData.Courses[parseInt(e.currentTarget.id.split("tcipu")[1])]); // Show the course if not trashing it
        }));
    }
    document.getElementById("takenCourses").appendChild(frag); // Show the new HTML
    PropagateAvailableCourses();
    // CalculateDiploma();
}

export function PropagateAvailableCourses() {
    document.getElementById("availableCourses").innerHTML = ""; // Clear the list of taken courses
    const availableCourses = FilterSearch.filterAvailableCourses(document.querySelector("input#availableCourseNameSearch").value, "", FilterSearch.fetchAvailableCourses());
    var frag = document.createDocumentFragment(); // Create a HTML fragment that will be added
    for (let i = 0; i < availableCourses.length; i++) { // Go through all taken courses
        let thisCourse = availableCourses[i];
        frag.appendChild(generateCourseFragment(thisCourse, () => {
            return FilterSearch.isStarred(thisCourse) ? `<i class="bi bi-star-fill text-warning"></i>` : ``
        }, (e) => {
            e.preventDefault();
            var cc = CourseData.Courses[parseInt(e.currentTarget.id.split("tcipu")[1])]; // Get the course index and get the course from the element ID
            if (FilterSearch.isStarred(cc)) {
                Data.starredCourses.value.splice(Data.starredCourses.value.indexOf(cc), 1);
            } else {
                Data.starredCourses.value.push(cc);
            }
            PropagateAvailableCourses();
        }));
    }
    document.getElementById("availableCourses").appendChild(frag);
}

export function AvailableCoursesSubjectsCallback(e) {
    const hadPrimary = e.currentTarget.classList.contains("active")
    document.querySelectorAll("ul#subjectsDropdown > li > button").forEach((element) => {
        element.classList.remove("active") // Clear all existing active elements
        element.setAttribute("aria-current", "false")
    })
    if (!hadPrimary) {
        e.currentTarget.classList.add("active")
        e.currentTarget.setAttribute("aria-current", "true")
        FilterSearch.filterSubjects.value = e.currentTarget.innerText
    } else {
        const anyElement = document.querySelector("ul#subjectsDropdown > li > button#subjectsDropdownAny")
        anyElement.classList.add("active")
        anyElement.setAttribute("aria-current", "true")
        FilterSearch.filterSubjects.value = anyElement.innerText
    }
    PropagateAvailableCourses();
}

/**
 * Check and prompt if needed for a regents exam score
 * 
 * @param {course} cc - The course to check and prompt for
 * @param {String} listItemElementID - The ID of the element clicked, the prompt box will appear inside this element
 * @returns {Promise | void} - Promise for when the score is complete
*/
export async function promptForRegentsExamScore(cc, listItemElementID) {
    return new Promise((resolve, reject) => {
        let checkResult = FilterSearch.checkIfExamScoreRequired(cc) // Check if we need the score
        if (!checkResult[0]) {
            resolve(listItemElementID); // If we don't need a score, don't continue
            return;
        }
        let final = (e) => {
            if (e.key != "Enter") {
                return
            }
            e.currentTarget.removeEventListener("keydown", final)
            let inputElement = document.querySelector(`#${listItemElementID} > .res > input`) // Get the input box
            let matched = inputElement.value.match(/\d+/g) // Get the numbers in the box
            let score = ""
            for (let i = 0; i < matched.length; i++) { // Go through all of the numbers in the input box
                score += (matched[i]).toString() // This needs to be a string because we need to add all of the digits next to each other and not together. ex. ("1"+"5"="15") instead of (1+5 = 6)
            }
            Data.pushRegentsExamScore(cc, score, checkResult[1]) // checkResult[1] = creditType
            inputElement.parentElement.remove()
            resolve(listItemElementID) // We now have the exam score and can return
        }
        let courseElement = document.getElementById(listItemElementID)
        if (document.querySelector(`#${listItemElementID} > .res`) != null) {
            reject("Cannot Prompt Twice")
            return
        }

        let inp_box = document.createElement("div")
        inp_box.classList.add("res")
        inp_box.classList.add("pt-2")
        inp_box.classList.add("input-group")
        inp_box.classList.add("flex-nowrap")

        let inp = document.createElement("input")
        inp.type = "number"
        inp.classList.add("form-control")
        inp.ariaLabel = "Regents Exam Score"
        inp.placeholder = "Regents Exam Score"
        inp.setAttribute("aria-describedby", "res-percent")
        inp.addEventListener("keypress", final)

        let percentSign = document.createElement("span")
        percentSign.innerText = "%"
        percentSign.classList.add("input-group-text")
        percentSign.id = "res-percent"

        inp_box.appendChild(inp)
        inp_box.appendChild(percentSign)
        courseElement.appendChild(inp_box)

    })
}
/**
 * Load event listeners that need the DOM to finish loading
 * 
 * @returns {void}
 */
export function loadCall() {
    // Activate all the tabs
    const triggerTabList = document.querySelectorAll('#tabs button')
    triggerTabList.forEach(triggerEl => {
        const tabTrigger = new bootstrap.Tab(triggerEl)

        triggerEl.addEventListener('click', event => {
            event.preventDefault()
            tabTrigger.show()
        })
    })
    document.querySelector('#tabs button[data-bs-target="#taken-tab-pane"').addEventListener("hide.bs.tab", () => {
        if (Data.takenCourses.value.length === 0) {
            bootstrap.Toast.getOrCreateInstance(document.querySelector("div#takenDoubleCheck")).show()
        }
    })
    // Make the get started button unhide the tabs and move to the first one
    document.querySelector("#getStarted").addEventListener("click", () => {
        const triggerEl = document.querySelector('#tabs button[data-bs-target="#taken-tab-pane"')
        const tabs = document.querySelector("#tabs")
        tabs.classList.remove("hide")
        tabs.classList.add("show")
        bootstrap.Tab.getInstance(triggerEl).show()
    })

    document.querySelector("input#addCourseNameSearch").addEventListener("keyup", () => {
        Global.errorHandle(PropagateTakenCourseSearchResults);
    })

    document.querySelector("button#takenRemoveButton").addEventListener("click", () => {
        if (takenCoursesSelectedIndex.value !== -1) {
            Data.removeRegentsScore(Data.takenCourses.value[takenCoursesSelectedIndex.value].cid)
            Data.takenCourses.value.splice(takenCoursesSelectedIndex.value, 1); // Remove the course from taken courses
            
            // Reset button states
            const viewButton = document.querySelector("button#takenViewButton")
            const removeButton = document.querySelector("button#takenRemoveButton")

            viewButton.classList.remove("btn-info")
            viewButton.classList.add("btn-disabled")
            viewButton.setAttribute("disabled", undefined)

            removeButton.classList.remove("btn-danger")
            removeButton.classList.add("btn-disabled")
            removeButton.setAttribute("disabled", undefined)

            takenCoursesSelectedIndex.value = -1;

            Global.errorHandle(() => {
                PropagateTakenCourses(); // Update UI
                PropagateTakenCourseSearchResults();
                //Graphing.PropagateCourseChart();
            });
        }
    })

    document.querySelector('div#courseInfo').addEventListener('show.bs.offcanvas', () => {
        if (Data.takenCourses.value[takenCoursesSelectedIndex.value] !== -1) {
            showCourse(Data.takenCourses.value[takenCoursesSelectedIndex.value])
        } else {
            console.error("Premature course info launch, Data not propagated!")
        }
    })

    document.querySelector("input#availableCourseNameSearch").addEventListener('keyup', () => {
        Global.errorHandle(PropagateAvailableCourses);
    })

    document.querySelectorAll("ul#subjectsDropdown > li > button").forEach((element) => {
        element.addEventListener("click", AvailableCoursesSubjectsCallback)
    })

    document.querySelector("input#availableShowOnlyCompletePrerequisites").addEventListener('change', () => {
        PropagateAvailableCourses();
    })
    PropagateTakenCourses();
    // document.getElementById("addcomplete").addEventListener("click", () => { // + Button
    //     document.getElementById("addcompletebox").style.display = "flex"; // Unhide the search panel
    //     document.getElementById("addcompletename").focus() // Focus the name search box
    //     Global.errorHandle(PropagateTakenCourseSearchResults);
    // });
    // document.getElementById("addcompleteclose").addEventListener("click", () => { // Close button on search panel
    //     document.getElementById("addcompletebox").style.display = "none"; // Hide the panel
    // });
    // document.getElementById("addcompletename").addEventListener("keyup", () => { // Name search box
    //     Global.errorHandle(PropagateTakenCourseSearchResults);
    // });
    // document.getElementById("addcompletecid").addEventListener("keyup", () => { // Course ID search box
    //     Global.errorHandle(PropagateTakenCourseSearchResults);
    // });
    // document.getElementById("infoclose").addEventListener("click", () => { // Course panel hide
    //     document.getElementById("infobox").style.display = "none";
    // });
    // document.getElementById("creditFilter").addEventListener("change", () => { // Credit type dropdown
    //     Global.errorHandle(Graphing.PropagateCourseChart);
    // });
    // document.getElementById("darkLightToggle").addEventListener("change", (e) => { // Dark button toggle
    //     if (e.target.checked) {
    //         document.documentElement.setAttribute("data-theme", "dark");
    //         Global.isDarkMode.value = true;
    //     } else {
    //         document.documentElement.setAttribute("data-theme", "light");
    //         Global.isDarkMode.value = false;
    //     }
    //     PropagateTakenCourses(); // Update the UI to dark mode
    //     Graphing.PropagateCourseChart();
    // });
    // // GLFI = Grade Level Filter Index
    // let gradeFilters = document.getElementsByClassName("glfi") // Grade level filters, list of the elements
    // for (let glfi = 0; glfi < gradeFilters.length; glfi++) { // Go through all of the filters
    //     gradeFilters[glfi].addEventListener("change", (e) => { // Add a listener to each one if they get clicked
    //         FilterSearch.filterGrades.value = [] // Reset the filters
    //         let gradeFilters = document.getElementsByClassName("glfi") // Get all of the filter elements
    //         let overrideFalse = false // Set all the filters to unchecked
    //         if (gradeFilters[0].checked && e.target.checked && e.target != gradeFilters[0]) { // If any element is checked other than the first one (All Grades), uncheck the first one (All Grades).
    //             gradeFilters[0].checked = false // Uncheck the the first one (All Grades)
    //         } else if (gradeFilters[0].checked) { // If the first one (All Grades) is checked, uncheck all the other filters
    //             FilterSearch.filterGrades.value = [9,10,11,12] // Reset the grades allowed
    //             overrideFalse = true // Uncheck the rest
    //         }
    //         for (let glfi = 0; glfi < gradeFilters.length; glfi++) { // Go through all the filters
    //             if (overrideFalse && glfi != 0) { // If the uncheck variable is on and the element is not the first one (All Grades), uncheck it.
    //                 gradeFilters[glfi].checked = false // Set filter to unchecked
    //                 continue
    //             }
    //             if (gradeFilters[glfi].checked) { // If it is checked and we are not setting it to false, add the id to the list of filters.
    //                 FilterSearch.filterGrades.value.push(8+glfi) // Add to the filter
    //             }
    //         }
    //         Graphing.PropagateCourseChart() // Update the course chart
    //     })
    // }
    // gradeFilters[0].checked = true // Set the All Courses checkbox to checked initially
    // if (Global.isDarkMode.value) {
    //     document.getElementById("darkLightToggle").checked = true; // If we are in dark mode update the toggle
    // }
    // Global.errorHandle(CalculateDiploma);
    // Global.errorHandle(Graphing.PropagateCourseChart);
}
/**
 * Calculate all diploma progresses
 * 
 * @returns {void}
 */
export function CalculateDiploma() {
    let e = (id, value) => {
        let cv = parseFloat(document.getElementById(id).innerText) + value;
        document.getElementById(id).innerText = cv;
        if (cv >= parseFloat(document.getElementById(id + "-t").innerText)) {
            document.getElementById(id).className = "accepted";
            document.getElementById(id + "-s").innerHTML = CHECKMARK_SVG + "&nbsp;";
        }
        if (cv < parseFloat(document.getElementById(id + "-t").innerText)) {
            document.getElementById(id).className = "failed";
            document.getElementById(id + "-s").innerHTML = X_SVG + "&nbsp;";
        }
    }; // Update and increment the amount of credits earned
    let r = (id) => {
        document.getElementById(id).innerText = 0;
        document.getElementById(id).className = "failed";
        document.getElementById(id + "-s").innerHTML = X_SVG + "&nbsp;";
    }; // Reset
    r("rd-tc");
    r("rd-ec");
    r("rd-ssc");
    r("rd-mc");
    r("rd-sc");
    r("rd-pec");
    r("rd-wlc");
    r("rd-hc");
    r("rd-cc");
    for (let i = 0; i < Data.takenCourses.value.length; i++) {
        for (let ci = 0; ci < Data.takenCourses.value[i].credits.length; ci++) {
            let thisCredit = Data.takenCourses.value[i].credits[ci];
            let ca = thisCredit[1];
            e("rd-tc", ca);
            switch (thisCredit[0]) {
                case CourseData.ENGLISH_CREDIT:
                    e("rd-ec", ca);
                    break;
                case CourseData.SOCIAL_STUDY_CREDIT:
                    e("rd-ssc", ca);
                    break;
                case CourseData.MATH_CREDIT:
                    e("rd-mc", ca);
                    break;
                case CourseData.SCIENCE_CREDIT:
                    e("rd-sc", ca);
                    break;
                case CourseData.PHYSICAL_EDUCATION_CREDIT:
                    e("rd-pec", ca);
                    break;
                case CourseData.WORLD_LANGUAGE_CREDIT:
                    e("rd-wlc", ca);
                    break;
                case CourseData.HEALTH_CREDIT:
                    e("rd-hc", ca);
                    break;
                case CourseData.MEETS_COMMENCEMENT_CREDIT:
                    e("rd-cc", 1);
                    break;
            }
        }
    }
}
