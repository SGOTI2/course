export function loadCall() {
    const split = window.Split(document.querySelector("div#splitPane").children, {
        direction: 'vertical',
        elementStyle: function (dimension, size, gutterSize) {
            return {
                'flex-basis': 'calc(' + size + '% - ' + gutterSize + 'px)',
            }
        },
        gutterStyle: function (dimension, gutterSize) {
            return {
                'flex-basis': gutterSize + 'px',
            }
        },
    })
}