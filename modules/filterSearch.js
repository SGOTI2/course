window.FILTER_SEARCH_LOADED = true;
import * as Conversion from "./conversion.js"
import * as Global from "./global.js"
import * as CourseData from "./courseData.js"
import * as Data from "./data.js"
export const filterGrades = new Global.State([9,10,11,12])
/**
 * Search Courses for a course
 * 
 * Either name, cid, or both can be passed to find a course
 * @param {string} name - The name of the course to search for
 * @param {string} cid - The courseID of the course to search for
 * @returns {course} - A course object (from courseData)
 */
function searchCourses(name = "", cid = "") {
    let foundCourses = [];
    for (let i = 0; i < CourseData.Courses.length; i++) { // Iterate through courses
        if (
            (CourseData.Courses[i].name.toLowerCase().search(name.toLowerCase()) != -1 && name != "") ||
            (CourseData.Courses[i].cid.toLowerCase().search(cid.toLowerCase()) != -1 && cid != "")
        ) { // Test if the name or cid matches
            foundCourses.push(CourseData.Courses[i]); // Add course to found courses
        }
    }
    return foundCourses;
}
export const scannedCourses = new Global.State([]);
/**
 * Search Prerequisites for a course and output them as a graph relation list
 * 
 * Graph Relation list - [PrerequisiteName, StartingCourseName, PrerequisiteType]
 * @param {string} inname - The name of the course
 * @param {[String]} prerequisites - A list of prerequisites to search through
 * @param {[PREREQUISITE]} prerequisite_types - A list of prerequisites types that match prerequisites argument
 * @param {boolean} displayNoPrerequisite - Should the 'No Prerequisite' be returned
 * @param {number} recursion - The depth of recursion that the function is at, prevents infinite loops
 * @returns {[[string, string, number]]} - Graph Relation list - [PrerequisiteName, StartingCourseName, PrerequisiteType], used for generation of graphs
 */
export function preSearch(inname, prerequisites, prerequisite_types, displayNoPrerequisite = false, recursion = 0) {
    let coursePrerequisites = [];
    if (prerequisites.length === 0 && displayNoPrerequisite) { // If there are no prerequisites and displayNoPrerequisite = true
        return [["No Prerequisite", inname, CourseData.PREREQUISITE_NONE]]; // Return relation to no prerequisites
    }
    for (let i = 0; i < prerequisites.length; i++) {
        let prerequisite = [prerequisites[i], inname, prerequisite_types[i]]; // The value we will add if it's not already scanned
        if (
            scannedCourses.value.findIndex((e) => {
                return e[0] === prerequisite[0] && e[1] === prerequisite[1] && e[2] === prerequisite[2];
            }) === -1
        ) { // Test if the prerequisite matches a already scanned prerequisite
            coursePrerequisites.push(prerequisite); // Add to course prerequisites
            let results = searchCourses(prerequisites[i]); // Search for the prerequisite course
            if (results.length >= 1 && recursion <= 10) { // If it exists and we have not hit max recursion
                if (results[0].prerequisites.length > 0) { // If it has prerequisites
                    for (var prerequisiteIndex = 0; prerequisiteIndex < results.length; prerequisiteIndex++) { // Go through each prerequisite
                        if (results[prerequisiteIndex].prerequisites.length > 0) { // If it has prerequisites
                            let out = preSearch(
                                prerequisites[i],
                                results[prerequisiteIndex].prerequisites,
                                results[prerequisiteIndex].prerequisite_types,
                                displayNoPrerequisite,
                                recursion + 1
                                ); // Search through it's prerequisites
                            coursePrerequisites = coursePrerequisites.concat(out); // Add them to coursePrerequisites
                        }
                    }
                }
            }
            scannedCourses.value.push(prerequisite); // Add to scanned prerequisites
        }
    }
    return coursePrerequisites;
}
/**
 * Checks if the prerequisites are met for a course
 * 
 * @param {course} inname - The name of the course
 * @param {boolean} just_or - Should only prerequisites that are marked with OR should be checked
 * @returns {boolean | [boolean, boolean]} - If just_or is true return if there was an OR and if it is satisfied, If just_or is false return if all prerequisites are met
 */
export function coursePrerequisitesMet(course, just_or = false) {
    if (course === undefined) {
        ERep.Log("It appears that a undefined course was passed to check Pre-Req's");
        return false;
    }
    let presOrComplete = false;
    let containedOr = false;
    for (var i = 0; i < course.prerequisites.length; i++) { // Search through prerequisites
        if (course.prerequisite_types[i] === CourseData.PREREQUISITE_OR) {
            containedOr = true; // There is a OR in the prerequisites
        }
        if (
            course.prerequisite_types[i] === CourseData.PREREQUISITE_OR &&
            wasTakenByName(course.prerequisites[i])
        ) { // Is one of the OR prerequisites complete? If complete break
            presOrComplete = true;
            break;
        }
    }
    if (just_or) {
        return [containedOr, presOrComplete]; // See @returns
    }
    if (!presOrComplete && containedOr) {
        return false; // If the OR prerequisites are not satisfied prerequisites are not complete
    }
    for (var i = 0; i < course.prerequisites.length; i++) { // Go through all prerequisites
        if (course.prerequisites[i]) { // If the course was not taken
            if (presOrComplete && course.prerequisite_types[i] === CourseData.PREREQUISITE_OR) { // If OR we have another one that is satisfied
                continue;
            } else if (course.prerequisite_types[i] === CourseData.PREREQUISITE_RECOMMENDED) { // If it's only recommended it's not required to complete
                continue;
            } else { // If it's not complete and it's required, the prerequisites are not complete
                return false;
            }
        }
    }
    return true; // All the prerequisites are complete
}
/**
 * Check if the user needs to input their regents score for the course to calculate diploma progress
 * 
 * @param {course} course - Course to test
 * @returns {[boolean, number]} - Do we need to prompt for score and for what credit type
*/
export function checkIfExamScoreRequired(course) {
    switch (course.cid) {
        case "0406":
            return [true, MATH_CREDIT]
        case "0411":
            return [true, MATH_CREDIT]
        case "0442":
            return [true, MATH_CREDIT]
        case "0440":
            return [true, MATH_CREDIT]
        case "0443":
            return [true, MATH_CREDIT]
        default:
            return [false, 0] // It does not match a course we need a grade for
    }
}
/**
 * Filter the courses based on search inputs
 * 
 * @param {course} course - The course to check and prompt for
 * @returns {boolean}
*/
export function FilterCourse(course) {
    if (course === undefined) {
        return false;
    } // If there is no course, don't search it
    let selectedCredit = document.getElementById("creditFilter").value;
    let creditText = Conversion.convertCreditToText(course.credits[0][0]);
    if (selectedCredit != "Any Credit") {
        if (selectedCredit != creditText) {
            if (selectedCredit != "Music") {
                return true;
            } else if (creditText != "Music (S Dev.)" && creditText != "Music (K/A Dev.)") {
                return true;
            }
        }
    }
    var continued = false
    for (let i = 0; i < course.grade.length; i++) {
        if (filterGrades.value.findIndex((e) => e === course.grade[i]) != -1) {
            continued = true
            break
        }
    } // Search all of the grades we are going to display and filter them
    if (!continued) return true
    return false;
}
/**
 * Return true if the course has been taken before
 * 
 * @param {string} courseName - The course name to search for
 * @returns {boolean}
*/
export function wasTakenByName(courseName) {
    return Data.takenCourses.value.findIndex((element) => {
        return element.name === courseName;
    }) === -1
}