const yearSpan = document.getElementById('currentyear');
const now = new Date();
yearSpan.textContent = now.getFullYear();

const lastmod = document.getElementById('lastmodified');
lastmod.textContent = `Last modified: ${document.lastModified}`;

const navbutton = document.querySelector('#ham-btn');
const navbar = document.querySelector('#nav-btn');

navbutton.addEventListener('click', () => {
    navbutton.classList.toggle('show');
    navbar.classList.toggle('show');
});

const cards = document.querySelector('#cards');
const gridBtn = document.querySelector('#gridBtn');
const listBtn = document.querySelector('#listBtn');

const dataUrl = 'data/members.json';

async function getCompanies() {
    try {
        const response = await fetch(dataUrl);
        const data = await response.json();
        displayCompanies(data.companies); 
    } catch (error){
        console.error('Error fetching company data:', error);
    }
}

function displayCompanies (companies) {
    cards.innerHTML = '';

    companies.forEach(company => {
        const card = document.createElement('section');
        card.classList.add('card');

        const img = document.createElement('img');
        img.src = `images/${company.image_file}`;
        img.alt = `Logo of ${company.company_name}`;
        img.loading = 'lazy';
        img.width = 200;
        img.height = 150;

        const name = document.createElement('h2');
        name.textContent = company.company_name;

        const address = document.createElement('p');
        address.textContent = company.company_address;

        const phone = document.createElement('p');
        phone.textContent = company.phone_number;

        const link = document.createElement('a');
        link.href = company.website_url;
        link.target = '_blank';
        link.textContent = company.website_url;

        const membership = document.createElement('p');
        membership.textContent = `Membership Level: ${company.membership_level}`;

        card.append(img, name, address, phone, link, membership);
        cards.appendChild(card);
    });
};

gridBtn.addEventListener('click', () =>{
    cards.classList.add('grid');
    cards.classList.remove('list');
});

listBtn.addEventListener('click', () =>{
    cards.classList.add('list');
    cards.classList.remove('grid');
});

getCompanies();