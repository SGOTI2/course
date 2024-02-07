// Color and text conversion from objects
window.CONVERSION_LOADED = true;
function convertCreditToText(credit) {
    let result = "Unknown";
    switch (credit) {
        case MATH_CREDIT:
            result = "Math";
            break;
        case HEALTH_CREDIT:
            result = "Health";
            break;
        case ENGLISH_CREDIT:
            result = "English";
            break;
        case SCIENCE_CREDIT:
            result = "Science";
            break;
        case SOCIAL_STUDY_CREDIT:
            result = "Social Studies";
            break;
        case GENERAL_MUSIC_CREDIT:
            result = "Music";
            break;
        case PHYSICAL_EDUCATION_CREDIT:
            result = "P.E.";
            break;
        case MUSIC_SKILLS_DEVELOPMENT_CREDIT:
            result = "Music (S Dev.)";
            break;
        case MUSICAL_KNOWLEDGE_ATTITUDE_DEVELOPMENT_CREDIT:
            result = "Music (K/A Dev.)";
            break;
        case MEETS_COMMENCEMENT_CREDIT:
            result = "Commencement";
            break;
        default:
            break;
    }
    return result;
}
function convertExamToText(exam) {
    let result = "";
    switch (exam) {
        case LOCAL_EXAM:
            result = "Local";
            break;
        case REGENTS_EXAM:
            result = "Regents";
            break;
        case REGENTS_EXAM_JANUARY:
            result = "January Regents";
            break;
        case AP_EXAM:
            result = "AP";
            break;
        case AP_EXAM_ENCOURAGED:
            result = "Encouraged AP";
            break;
        default:
            break;
    }
    return result;
}
function convertPrerequisiteTypeToText(pretype) {
    let result = "";
    switch (pretype) {
        case PREREQUISITE_REQUIRED:
            result = "Required";
            break;
        case PREREQUISITE_OR:
            result = "Or";
            break;
        case PREREQUISITE_RECOMMENDED:
            result = "Recommended";
            break;
        default:
            break;
    }
    return result;
}
function convertPrerequisiteTypeToColor(pretype) {
    let result = "";
    switch (pretype) {
        case PREREQUISITE_REQUIRED:
            result = "red";
            break;
        case PREREQUISITE_OR:
            result = "blue";
            break;
        case PREREQUISITE_RECOMMENDED:
            result = "yellow";
            break;
        case PREREQUISITE_NONE:
            result = LIGHT_GREY;
            break;
        default:
            break;
    }
    return result;
}
function convertPrerequisiteTypeToColorDark(pretype) {
    if (!isDarkMode) {
        return convertPrerequisiteTypeToColorLight(pretype);
    }
    let result = "";
    switch (pretype) {
        case PREREQUISITE_REQUIRED:
            result = "#aa4444";
            break;
        case PREREQUISITE_OR:
            result = "#4444aa";
            break;
        case PREREQUISITE_RECOMMENDED:
            result = "#aaaa44";
            break;
        case PREREQUISITE_NONE:
            result = LIGHT_GREY;
            break;
        default:
            break;
    }
    return result;
}
function convertPrerequisiteTypeToColorLight(pretype) {
    if (isDarkMode) {
        return convertPrerequisiteTypeToColorDark(pretype);
    }
    let result = "";
    switch (pretype) {
        case PREREQUISITE_REQUIRED:
            result = "#ffaaaa";
            break;
        case PREREQUISITE_OR:
            result = "#aaaaff";
            break;
        case PREREQUISITE_RECOMMENDED:
            result = "#ffffaa";
            break;
        case PREREQUISITE_NONE:
            result = LIGHT_GREY;
            break;
        default:
            break;
    }
    return result;
}