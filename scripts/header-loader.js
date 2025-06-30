export async function loadHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;
    try {
        const resp = await fetch('templates/header.html');
        if (!resp.ok) throw new Error('Failed to load header template');
        const html = await resp.text();
        placeholder.outerHTML = html;

        const toggleBtn = document.getElementById('sidebarToggle');
        const headerNav = document.getElementById('mainNav');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isMobile = window.innerWidth <= 991;
                const sidebar = document.querySelector('.app-sidebar');

                if (isMobile) {
                    if (headerNav) headerNav.classList.toggle('show');
                } else {
                    if (sidebar) sidebar.classList.toggle('show');
                }
            });
        }

        // Collapse the mobile dropdown after navigating
        if (headerNav) {
            headerNav.addEventListener('click', (e) => {
                if (e.target.closest('a') && window.innerWidth <= 991) {
                    headerNav.classList.remove('show');
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);
