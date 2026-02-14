import { discoverItems } from "../data/discover.mjs";

const grid = document.querySelector(".discover-grid");

function createDiscoverCard(item, index) {
    const card = document.createElement("article");
    card.classList.add("discover-card", `item${index + 1}`, "card-base");

    card.innerHTML = `
    <h2>${item.title}</h2>

    <figure>
        <img
            src="images/${item.image}"
            alt="${item.title}"
            loading="lazy"
        >
    </figure>

    <address>${item.address}</address>

    <p>${item.description}</p>

    <button class="learn-more" onclick="window.location.href='${item.url}'">
        Learn More
    </button>
    `;

    return card;
}

discoverItems.forEach((item, index) => {
    const card = createDiscoverCard(item, index);
    grid.appendChild(card);
});