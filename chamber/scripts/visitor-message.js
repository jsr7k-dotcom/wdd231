const messageArea = document.querySelector("#visitor-message");
const lastVisit = Number(localStorage.getItem("lastVisit"));
const now = Date.now();

if (!lastVisit) {
    messageArea.textContent = "Welcome! Let us know if you have questions."
} else {
    const msInDay = 1000 * 60 * 60 * 24;
    const daysBetween = Math.floor((now - lastVisit) / msInDay);

    if (daysBetween < 1) {
        messageArea.textContent = "Back so soon! Awesome!";
    } else if (daysBetween === 1) {
        messageArea.textContent = "You last visited 1 day ago.";
    } else {
        messageArea.textContent = `You last visited ${daysBetween} days ago.`;
    }
}

localStorage.setItem("lastVisit", now);