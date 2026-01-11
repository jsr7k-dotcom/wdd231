const d = new Date();
const hoursBase = d.getHours();
const minutesBase = d.getMinutes();
const secondsBase = d.getSeconds();


const year = d.getFullYear();

document.getElementById("currentYear").innerHTML = "&copy; " + year;
document.getElementById("lastModified").innerHTML = "Last Modification: " + document.lastModified;