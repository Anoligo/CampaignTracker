export async function loadHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;
    try {
        const resp = await fetch('templates/header.html');
        if (!resp.ok) throw new Error('Failed to load header template');
        const html = await resp.text();
        placeholder.outerHTML = html;

        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.app-sidebar');
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);
