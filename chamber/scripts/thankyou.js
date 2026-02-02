const params = new URLSearchParams(window.location.search);

const fields = [
    { key: "fname", label: "First Name" },
    { key: "lname", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Mobile Phone" },
    { key: "organization", label: "Business / Organization" },
    { key: "timestamp", label: "Submission Timestamp" }
];

const output = document.getElementById("output");

fields.forEach(field => {
    let value = params.get(field.key) || "(not provided)";

    if (field.key === "timestamp" && value !== "(not provided)") {
        const date = new Date(value);

        const options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        };

        value = date.toLocaleString("en-US", options);
    }
    
    const div = document.createElement("div");
    div.classList.add("field");
    div.innerHTML = `<span class="label">${field.label}:</span> ${value}`;
    output.appendChild(div);
});