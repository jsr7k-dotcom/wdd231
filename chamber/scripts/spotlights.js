async function loadSpotlights() {
    const response = await fetch("data/members.json");
    const data = await response.json();

    const spotlightMembers = data.members.filter(m => m.membership ==="Gold");

    const selected = spotlightMembers.sort(() => 0.5 - Math.random()).slice(0, 3);

    const container = document.querySelector("#spotlight-container");

    selected.forEach(member => {
        const card = document.createElement("div");
        card.classList.add("spotlight-card");

        const tagline = generateTagline(member.main);

        const email = member.name.toLowerCase().replace(/\s+/g, "") + "@gmail.com";

        card.innerHTML = `
        <div class="spotlight-header">
            <h3>${member.company_name}</h3>
            <p class="spotlight-tagline">${tagline}</p>
        </div>

        <div class="spotlight-divider"></div>

        <div class="spotlight-body">
            <img src="images/${member.image}" alt=:${member.name} logo">

            <div class="spotlight-info">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${member.phone}</p>
                <p><strong>Website:</strong> <a href="${member.website}" target="_blank">${member.website}</a></p>
            </div>
        </div>
        `;

        container.appendChild(card);
    });
}

function generateTagline(name) {
    const taglines = [
        "Serving Querétaro with excellence",
        "Your trusted local partner",
        "Committed to community growth",
        "Quality and service you can count on",
        "Empowering local success"
    ];

    return taglines[Math.floor(Math.random() * taglines.length)];
}

loadSpotlights();