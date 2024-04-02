export class State {
    constructor(value) {
        this.value = value;
    }
}

/**
 * Run a function and handle the errors produced by running it
 * 
 * @param {(...args) => void} func - The function to execute
 * @param {any} - Arguments to pass the function
 * @returns {void}
 */
export function errorHandle(func, ...args) {
    try {
        func(...args); // Run the function
    } catch (e) {
        presentError(
            "Unknown Error - Contact Creator! <br><br><pre>Name: " +
                e.name +
                "<br>Message: " +
                e.message +
                "<br>Stack: " +
                e.stack +
                "</pre>",
            e
        ); // Present an error if caught
    }
}
export const isDarkMode = new State(false);