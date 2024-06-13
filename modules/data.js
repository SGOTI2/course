window.DATA_LOADED = true;
import * as FilterSearch from "./filterSearch.js";
import * as CourseData from "./courseData.js";
import * as Global from "./global.js"
import * as UI from "./ui.js";
export const data = new Global.State({});
export const takenCourses = new Global.State([]);
export const starredCourses = new Global.State([]);
export const GradeExamCount = new Global.State({
    math: [],
    science: [],
    english: [],
    social_studies: [],
    additional: [],
    world_language: [],
});
/**
 * Add the exam and score to the credit type
 * 
 * @param {course} cc - The course to add the score for
 * @param {number} score - The score on the exam
 * @param {credit} type - The credit type for the course
 * @returns {void}
*/
export function pushRegentsExamScore(cc, score, type) {
    let addingData = [cc.cid, score] // The data being added
    switch (type) {
        case CourseData.MATH_CREDIT:
            GradeExamCount.value.math.push(addingData) // Add to math exams
            return
    }
}
/**
 * Add a course to taken courses from a click event
 * 
 * @param {MouseEvent} e - The event from the click listener
 * @returns {void}
*/
export async function addTakenCourse(e) {
    e.preventDefault();
    var cc = CourseData.Courses[parseInt(e.currentTarget.id.split("atcid")[1])]; // Get the course index and get the course from the element ID
    if (e.target.id === "ell") { // If the event is triggered for the info button show the course and return
        UI.showCourse(cc);
        return;
    }
    if (FilterSearch.wasNotTaken(cc)) { // If the course has not been taken
        var ev = e.currentTarget; // Get the event target
        await UI.promptForRegentsExamScore(cc, e.currentTarget.id); // See if we need a score
        takenCourses.value.push(cc); // Add the course to taken courses
        ev.firstChild.innerHTML = ev.firstChild.innerHTML + TAKEN; // Add a checkmark to the start of the info area
        Global.errorHandle(() => {
            UI.PropagateTakenCourses(); // Update the list of taken courses
            //Graphing.PropagateCourseChart(); // Update the main graph
        });
    } else { // If we have taken the course
        takenCourses.value.splice(takenCourses.value.indexOf(cc), 1); // Remove it from taken courses
        e.currentTarget.firstChild.lastChild.remove(); // Remove the checkmark
        Global.errorHandle(() => {
            UI.PropagateTakenCourses(); // Update the list of taken courses
            //Graphing.PropagateCourseChart(); // Update the main graph
        });
    }
}
