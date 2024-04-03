import * as Global from "./global.js"
import * as UI from "./ui.js"
if (window.ERep === undefined) {
    window.ERep = {
        Log: (v, l) => {
            console.log(v);
        },
    };
}
/*Error Handling*/ var l = false;
window.presentError = function(m, oe, t = "") {
    if (!l) {
        window.onload = () => {
            l = true;
            presentError(m, oe, t);
        };
        return;
    }
    document.getElementById("errormessage").innerHTML = m;
    document.getElementById("errortype").innerHTML = t;
    document.getElementById("errorbox").removeAttribute("style");
    throw oe;
}
window.onload = () => {
    l = true;
    Global.errorHandle(UI.loadCall);
};
class NotFound extends Error {
    constructor(message) {
        super(message);
    }
}
try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        Global.isDarkMode.value = true;
    }
    // Generate Build ID
    //(()=>{let d=new Date();let bi=d.getMonth()+""+d.getDate()+""+d.getFullYear()+""+d.getHours()+""+d.getMinutes()+""+d.getSeconds();presentError(bi,""," - BuildID");})()
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
    );
}