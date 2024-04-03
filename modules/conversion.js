// Color and text conversion from objects
window.CONVERSION_LOADED = true;
import * as Global from "./global.js"
import * as CourseData from "./courseData.js"
export function convertCreditToText(credit) {
    let result = "Unknown";
    switch (credit) {
        case CourseData.MATH_CREDIT:
            result = "Math";
            break;
        case CourseData.HEALTH_CREDIT:
            result = "Health";
            break;
        case CourseData.ENGLISH_CREDIT:
            result = "English";
            break;
        case CourseData.SCIENCE_CREDIT:
            result = "Science";
            break;
        case CourseData.SOCIAL_STUDY_CREDIT:
            result = "Social Studies";
            break;
        case CourseData.GENERAL_MUSIC_CREDIT:
            result = "Music";
            break;
        case CourseData.PHYSICAL_EDUCATION_CREDIT:
            result = "P.E.";
            break;
        case CourseData.MUSIC_SKILLS_DEVELOPMENT_CREDIT:
            result = "Music (S Dev.)";
            break;
        case CourseData.MUSICAL_KNOWLEDGE_ATTITUDE_DEVELOPMENT_CREDIT:
            result = "Music (K/A Dev.)";
            break;
        case CourseData.MEETS_COMMENCEMENT_CREDIT:
            result = "Commencement";
            break;
        default:
            break;
    }
    return result;
}
export function convertExamToText(exam) {
    let result = "";
    switch (exam) {
        case CourseData.LOCAL_EXAM:
            result = "Local";
            break;
        case CourseData.REGENTS_EXAM:
            result = "Regents";
            break;
        case CourseData.REGENTS_EXAM_JANUARY:
            result = "January Regents";
            break;
        case CourseData.AP_EXAM:
            result = "AP";
            break;
        case CourseData.AP_EXAM_ENCOURAGED:
            result = "Encouraged AP";
            break;
        default:
            break;
    }
    return result;
}
export function convertPrerequisiteTypeToText(pretype) {
    let result = "";
    switch (pretype) {
        case CourseData.PREREQUISITE_REQUIRED:
            result = "Required";
            break;
        case CourseData.PREREQUISITE_OR:
            result = "Or";
            break;
        case CourseData.PREREQUISITE_RECOMMENDED:
            result = "Recommended";
            break;
        default:
            break;
    }
    return result;
}
export function convertPrerequisiteTypeToColor(pretype) {
    let result = "";
    switch (pretype) {
        case CourseData.PREREQUISITE_REQUIRED:
            result = "red";
            break;
        case CourseData.PREREQUISITE_OR:
            result = "blue";
            break;
        case CourseData.PREREQUISITE_RECOMMENDED:
            result = "yellow";
            break;
        case CourseData.PREREQUISITE_NONE:
            result = LIGHT_GREY;
            break;
        default:
            break;
    }
    return result;
}
export function convertPrerequisiteTypeToColorDark(pretype) {
    if (!Global.isDarkMode.value) {
        return convertPrerequisiteTypeToColorLight(pretype);
    }
    let result = "";
    switch (pretype) {
        case CourseData.PREREQUISITE_REQUIRED:
            result = "#aa4444";
            break;
        case CourseData.PREREQUISITE_OR:
            result = "#4444aa";
            break;
        case CourseData.PREREQUISITE_RECOMMENDED:
            result = "#aaaa44";
            break;
        case CourseData.PREREQUISITE_NONE:
            result = LIGHT_GREY;
            break;
        default:
            break;
    }
    return result;
}
export function convertPrerequisiteTypeToColorLight(pretype) {
    if (Global.isDarkMode.value) {
        return convertPrerequisiteTypeToColorDark(pretype);
    }
    let result = "";
    switch (pretype) {
        case CourseData.PREREQUISITE_REQUIRED:
            result = "#ffaaaa";
            break;
        case CourseData.PREREQUISITE_OR:
            result = "#aaaaff";
            break;
        case CourseData.PREREQUISITE_RECOMMENDED:
            result = "#ffffaa";
            break;
        case CourseData.PREREQUISITE_NONE:
            result = LIGHT_GREY;
            break;
        default:
            break;
    }
    return result;
}