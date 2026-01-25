// chamber/scripts/spotlights.js

const spotlightContainer = document.querySelector('#spotlight-container');
const membersUrl = 'data/members.json'; // Renamed to avoid conflict with directory.js

async function getSpotlights() {
    try {
        const response = await fetch(membersUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Filter for Gold members (Level 3)
        // Note: Change to 'member.membership_level >= 2' to include Silver members if desired.
        const goldMembers = data.companies.filter(member => member.membership_level === "Gold");
        
        // Randomly shuffle the array to pick random members
        const shuffled = goldMembers.sort(() => 0.5 - Math.random());
        
        // Select the top 2 or 3 members from the shuffled list
        // (Adjust the slice second argument to change the quantity)
        const selected = shuffled.slice(0, 3);
        
        displaySpotlights(selected);
    } catch (error) {
        console.error('Error fetching spotlight data:', error);
    }
}

function displaySpotlights(members) {
    // if (!spotlightContainer) return;
    
    spotlightContainer.innerHTML = ''; // Clear container

    members.forEach(member => {
        // Create card element
        const card = document.createElement('div');
        card.classList.add('spotlight-card');
        
        // Company Name
        const name = document.createElement('h3');
        name.textContent = member.company_name;

        // Logo
        const img = document.createElement('img');
        img.src = `images/${member.image_file}`;
        img.alt = `${member.company_name} Logo`;
        img.loading = 'lazy';
        img.width = 150;
        img.height = "auto";

        // Contact Info
        const phone = document.createElement('p');
        phone.textContent = member.phone_number;

        const address = document.createElement('p');
        address.textContent = member.company_address;

        // Website Link
        const link = document.createElement('a');
        link.href = member.website_url;
        link.target = '_blank';
        link.textContent = 'Website';

        // Membership Level Label
        const level = document.createElement('p');
        level.textContent = 'Gold Member';
        level.classList.add('membership-level');

        // Append elements to card
        card.appendChild(name);
        card.appendChild(img);
        card.appendChild(phone);
        card.appendChild(address);
        card.appendChild(link);
        card.appendChild(level);

        // Append card to container
        spotlightContainer.appendChild(card);
    });
}

// Initialize
getSpotlights();
