// form timestamp
document.getElementById("timestamp").value = new Date().toISOString();

// modals
document.querySelectorAll("[data-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = document.getElementById(btn.dataset.modal);
        modal.showModal();
    });
});

document.querySelectorAll("dialog .close").forEach(btn => {
    btn.addEventListener("click", () => {
        btn.closest("dialog").close();
    });
});