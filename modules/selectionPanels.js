export function loadCall() {
    document.querySelectorAll(".accordion").forEach((e, i, p) => {
        e.addEventListener('show.bs.collapse', (ev) => {
            ev.target.parentElement.classList.add('show')
        })
        e.addEventListener('hide.bs.collapse', (ev) => {
            ev.target.parentElement.classList.remove('show')
        })
    })
}