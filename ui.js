window.UI_LOADED = true;
/**
 * Display a course on the screen
 * 
 * @param {course} course - The course to display
 * @returns {void}
 */
function showCourse(course) {
    document.getElementById("infobox").style.display = "flex"; // The default display is none, set it so it's visible
    document.querySelector("#infobox > #infoboxdata > h3").innerHTML = course.name; // Set the course name
    let divs = document.querySelectorAll("#infobox > #infoboxdata > div"); // A list of div's in infoboxdata
    divs[0].innerHTML = course.cid; // Set the course ID
    let credits = ""; // HTML of credits to display
    for (var i = 0; i < course.credits.length; i++) { // For all credits
        let creditName = convertCreditToText(course.credits[i][0]); // Get credit name in text
        credits += `${i === 0 ? "" : ", "}<span>${creditName === "Commencement" ? 1 : course.credits[i][1]} ${creditName} Credit</span>`; // Add the credit to the list, if it's a commencement credit set the number of credits to 1 (The default is 0)
    }
    divs[1].innerHTML = credits; // Display credits
    let exams = ""; // HTML of exams to display
    for (var i = 0; i < course.exams.length; i++) { // For all exams
        exams += `${i === 0 ? "" : ", "}<span>${convertExamToText(course.exams[i])} Exam</span>`; // Add the exam to the list
    }
    divs[2].innerHTML = exams; // Display exams
    let prerequisites = ""; // HTML of prerequisites to display
    let prerequisitesOrComplete = coursePrerequisitesMet(course, true)[1]; // Variable to track if prerequisites are complete
    let prerequisites_complete = true;
    for (var i = 0; i < course.prerequisites.length; i++) { // Go through all the prerequisites
        let svg = ""; // The SVG to add to the end of the prerequisite
        if (
            takenCourses.findIndex((e) => {
                return e.name === course.prerequisites[i];
            }) === -1
        ) { // If the course is NOT complete
            if (prerequisitesOrComplete && course.prerequisite_types[i] === PREREQUISITE_OR) { // If it's a OR and we know that there is another one, display an N/A symbol
                svg = NA_SVG;
            } else if (course.prerequisite_types[i] === PREREQUISITE_RECOMMENDED) { // If it's a recommend course display an N/A symbol because it's not required
                svg = NA_SVG;
            } else { // If it's just not done
                svg = X_SVG;
                prerequisites_complete = false;
            }
        } else {
            svg = CHECKMARK_SVG; // Prerequisite is complete and can be marked with a check
        }
        prerequisites += `${i === 0 ? "" : ",&nbsp"}<span>${course.prerequisites[i]}</span>${svg}`; // Add the prerequisite with the SVG
    }
    document.getElementById("pres").innerHTML = prerequisites; // Display all the prerequisites
    let prerequisiteTitle = document.getElementById("pretitle"); // The element for if all the prerequisites are met
    prerequisiteTitle.innerHTML = prerequisites_complete ? "COMPLETE " + CHECKMARK_SVG : "INCOMPLETE " + X_SVG;
    prerequisiteTitle.className = prerequisites_complete ? "accepted" : "failed";
    errorHandle(GeneratePrerequisiteGraph, course);
}
/**
 * Update the search results for taken courses
 * 
 * @returns {void}
 */
function PropagateTakenCourseSearchResults() {
    document.getElementById("addcompletesugglist").innerHTML = ""; // Clear the results
    let results = searchCourses(
        document.getElementById("addcompletename").value,
        document.getElementById("addcompletecid").value
        ); // Search courses with the user's search
    if (results.length === 0) {
        if (document.getElementById("addcompletename").value === "" && document.getElementById("addcompletecid").value === "") {
            document.getElementById("addcompletesugglist").innerHTML = "<p>Start Typing...</p>"; // If the search areas are blank, ask the user to start typing
            return
        }
        document.getElementById("addcompletesugglist").innerHTML = "<p>No Results</p>"; // If there are no results, show that
        return;
    }
    var frag = document.createDocumentFragment(); // Fragment of what we are filling the results with
    for (var i = 0; i < results.length; i++) { // Go through all the courses matching the users input
        let credits = "";
        for (var creditIndex = 0; creditIndex < results[i].credits.length; creditIndex++) { // Go through all the credits
            let creditName = convertCreditToText(results[i].credits[creditIndex][0]); // Get credit name in text
            credits += `${creditIndex === 0 ? "" : DIVIDER_SVG+" "}<span>${creditName === "Commencement" ? "" : results[i].credits[creditIndex][1]} ${creditName} Credit</span>`; // Add the credit to the list, if it's a commencement credit don't display a number
        }
        let tmp = `
            <div class="tcf">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16" id="ell" style="overflow: visible; ">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                </svg>
                <h5>${results[i].name}</h5>
            </div>
            <div class="tcf">
                ${
                    takenCourses.findIndex((e) => {
                        return e === results[i];
                    }) === -1
                        ? ""
                        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>'
                }
                <div class="cid">${results[i].cid}</div>
                ${DIVIDER_SVG}
                ${credits}
            </div>`; // Generate the HTML
        let temp = document.createElement("li"); // The element we are making
        temp.innerHTML = tmp; // Set the html to what we have before
        temp.id =
            "atcid" +
            Courses.findIndex((e) => {
                return e === results[i];
            }); // Set it's ID to it's course id so we can add it later
        temp.addEventListener("click", addTakenCourse); // Make it work 
        frag.appendChild(temp); // Add it to the list
    }
    document.getElementById("addcompletesugglist").appendChild(frag); // Add all the results to the HTML
}
/**
 * Display the taken courses on the screen
 * 
 * @returns {void}
 */
function PropagateTakenCourses() {
    document.getElementById("takenCourses").innerHTML = ""; // Clear the list of taken courses
    if (takenCourses.length === 0) {
        document.getElementById("takenCourses").innerHTML = "<p>Click + to add a Course</p>"; // Show how to add a course
        return
    }
    var frag = document.createDocumentFragment(); // Create a HTML fragment that will be added
    for (let i = 0; i < takenCourses.length; i++) { // Go through all taken courses
        let credits = ""; // The credits for the course
        for (var creditIndex = 0; creditIndex < takenCourses[i].credits.length; creditIndex++) { // Go through all the credits
            let creditName = convertCreditToText(takenCourses[i].credits[creditIndex][0]); // Get credit name in text
            credits += `${DIVIDER_SVG} <span>${creditName === "Commencement" ? "" : takenCourses[i].credits[creditIndex][1]} ${creditName} Credit</span>`; // Add the credit to the list, if it's a commencement credit don't display a number
        }
        let tmp = `
        <div>
            <h5>${takenCourses[i].name}<span>${
            coursePrerequisitesMet(takenCourses[i])
                ? ""
                : "" + WARNING_SVG + " Prerequisites Incomplete"
        }</span></h5>
            <div class="tcf">
                <div class="cid">${takenCourses[i].cid}</div>
                ${credits}
            </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16" id="trash">
            <path id="trash" d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path id="trash" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>`; // Generate the HTML
        let temp = document.createElement("li"); // The element that we are making
        temp.innerHTML = tmp; // Set the html to what we have before
        temp.id =
            "tcipu" +
            Courses.findIndex((e) => {
                return e === takenCourses[i];
            }); // Set it's ID to it's course id so we can view it later
        temp.className = "tcf"; // Styling
        temp.addEventListener("click", (e) => {
            if (e.target.id === "trash") { // If the user clicks the trash button
                console.log(i);
                takenCourses.splice(i, 1); // Remove the course from taken courses
                PropagateTakenCourseSearchResults(); // Update UI
                PropagateTakenCourses();
                PropagateCourseChart();
            } else {
                showCourse(Courses[parseInt(e.currentTarget.id.split("tcipu")[1])]); // Show the course if not trashing it
            }
        });
        frag.appendChild(temp); // Add it to the list of taken courses
    }
    document.getElementById("takenCourses").appendChild(frag); // Show the new HTML
    CalculateDiploma();
}
/**
 * Check and prompt if needed for a regents exam score
 * 
 * @param {course} cc - The course to check and prompt for
 * @returns {Promise | void} - Promise for when the score is complete
*/
async function promptForRegentsExamScore(cc) {
    let checkResult = checkIfExamScoreRequired(cc) // Check if we need the score
    if (!checkResult[0]) {
        return; // If we don't need a score, don't continue
    }
    return new Promise((resolve) => {
        document.getElementById("res").style.display = "block"; // Unhide the prompt
        let rescalcElement = document.getElementById("rescalc"); // Get the calculate button
        rescalcElement.addEventListener("click", () => { // When clicked
            let input = document.getElementById("resinp") // Get the input box
            let matched = input.value.match(/\d+/g) // Get the numbers in the box
            let out = "" // The output score
            for (let i = 0; i < matched.length; i++) { // Go through all of the numbers in the input box
                out += (matched[i]).toString() // This needs to be a string because we need to add all of the digits next to each other and not together. ex. ("1"+"5"="15") instead of (1+5 = 6)
            }
            pushRegentsExamScore(cc, out, parseInt(checkResult[1])) // Add it to the exam scores
            document.getElementById("res").style.display = "none"; // Hide the prompt
            resolve("") // We now have the exam score and can return
        }, { once: true })
    })
}
/**
				 * Load event listeners that need the DOM to finish loading
				 * 
				 * @returns {void}
				 */
function loadCall() {
    document.getElementById("addcomplete").addEventListener("click", () => { // + Button
        document.getElementById("addcompletebox").style.display = "flex"; // Unhide the search panel
        document.getElementById("addcompletename").focus() // Focus the name search box
        errorHandle(PropagateTakenCourseSearchResults);
    });
    document.getElementById("addcompleteclose").addEventListener("click", () => { // Close button on search panel
        document.getElementById("addcompletebox").style.display = "none"; // Hide the panel
    });
    document.getElementById("addcompletename").addEventListener("keyup", () => { // Name search box
        errorHandle(PropagateTakenCourseSearchResults);
    });
    document.getElementById("addcompletecid").addEventListener("keyup", () => { // Course ID search box
        errorHandle(PropagateTakenCourseSearchResults);
    });
    document.getElementById("infoclose").addEventListener("click", () => { // Course panel hide
        document.getElementById("infobox").style.display = "none";
    });
    document.getElementById("creditFilter").addEventListener("change", () => { // Credit type dropdown
        errorHandle(PropagateCourseChart);
    });
    document.getElementById("darkLightToggle").addEventListener("change", (e) => { // Dark button toggle
        if (e.target.checked) {
            document.documentElement.setAttribute("data-theme", "dark");
            isDarkMode = true;
        } else {
            document.documentElement.setAttribute("data-theme", "light");
            isDarkMode = false;
        }
        PropagateTakenCourses(); // Update the UI to dark mode
        PropagateCourseChart();
    });
    // GLFI = Grade Level Filter Index
    let gradeFilters = document.getElementsByClassName("glfi") // Grade level filters, list of the elements
    for (let glfi = 0; glfi < gradeFilters.length; glfi++) { // Go through all of the filters
        gradeFilters[glfi].addEventListener("change", (e) => { // Add a listener to each one if they get clicked
            filterGrades = [] // Reset the filters
            let gradeFilters = document.getElementsByClassName("glfi") // Get all of the filter elements
            let overrideFalse = false // Set all the filters to unchecked
            if (gradeFilters[0].checked && e.target.checked && e.target != gradeFilters[0]) { // If any element is checked other than the first one (All Grades), uncheck the first one (All Grades).
                gradeFilters[0].checked = false // Uncheck the the first one (All Grades)
            } else if (gradeFilters[0].checked) { // If the first one (All Grades) is checked, uncheck all the other filters
                filterGrades = [9,10,11,12] // Reset the grades allowed
                overrideFalse = true // Uncheck the rest
            }
            for (let glfi = 0; glfi < gradeFilters.length; glfi++) { // Go through all the filters
                if (overrideFalse && glfi != 0) { // If the uncheck variable is on and the element is not the first one (All Grades), uncheck it.
                    gradeFilters[glfi].checked = false // Set filter to unchecked
                    continue
                }
                if (gradeFilters[glfi].checked) { // If it is checked and we are not setting it to false, add the id to the list of filters.
                    filterGrades.push(8+glfi) // Add to the filter
                }
            }
            PropagateCourseChart() // Update the course chart
        })
    }
    gradeFilters[0].checked = true // Set the All Courses checkbox to checked initially
    if (isDarkMode) {
        document.getElementById("darkLightToggle").checked = true; // If we are in dark mode update the toggle
    }
    errorHandle(CalculateDiploma);
    errorHandle(PropagateCourseChart);
}
/**
 * Calculate all diploma progresses
 * 
 * @returns {void}
 */
function CalculateDiploma() {
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
    for (let i = 0; i < takenCourses.length; i++) {
        for (let ci = 0; ci < takenCourses[i].credits.length; ci++) {
            let ca = takenCourses[i].credits[ci][1];
            e("rd-tc", ca);
            switch (takenCourses[i].credits[ci][0]) {
                case ENGLISH_CREDIT:
                    e("rd-ec", ca);
                    break;
                case SOCIAL_STUDY_CREDIT:
                    e("rd-ssc", ca);
                    break;
                case MATH_CREDIT:
                    e("rd-mc", ca);
                    break;
                case SCIENCE_CREDIT:
                    e("rd-sc", ca);
                    break;
                case PHYSICAL_EDUCATION_CREDIT:
                    e("rd-pec", ca);
                    break;
                case WORLD_LANGUAGE_CREDIT:
                    e("rd-wlc", ca);
                    break;
                case HEALTH_CREDIT:
                    e("rd-hc", ca);
                    break;
                case MEETS_COMMENCEMENT_CREDIT:
                    e("rd-cc", 1);
                    break;
            }
        }
    }
}
