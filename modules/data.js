window.DATA_LOADED = true;
import * as Global from "./global.js"
export const data = new Global.State({});
export const takenCourses = new Global.State([]);
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
        case MATH_CREDIT:
            GradeExamCount.math.push(addingData) // Add to math exams
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
    var cc = Courses[parseInt(e.currentTarget.id.split("atcid")[1])]; // Get the course index and get the course from the element ID
    if (e.target.id === "ell") { // If the event is triggered for the info button show the course and return
        showCourse(cc);
        return;
    }
    if (
        takenCourses.findIndex((e) => {
            return e === cc;
        }) === -1
    ) { // If the course has not been taken
        var ev = e.currentTarget; // Get the event target
        await promptForRegentsExamScore(cc); // See if we need a score
        takenCourses.push(cc); // Add the course to taken courses
        ev.lastChild.innerHTML = CHECKMARK_SVG + ev.lastChild.innerHTML; // Add a checkmark to the start of the info area
        PropagateTakenCourses(); // Update the list of taken courses
        PropagateCourseChart(); // Update the main graph
    } else { // If we have taken the course
        takenCourses.splice(
            takenCourses.findIndex((e) => {
                return e === cc;
            }),
            1
        ); // Remove it from taken courses
        e.currentTarget.lastChild.firstChild.remove(); // Remove the checkmark
        PropagateTakenCourses(); // Update the list of taken courses
        PropagateCourseChart(); // Update the main graph
    }
}
