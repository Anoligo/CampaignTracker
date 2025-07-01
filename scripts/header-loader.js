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
                if (headerNav) headerNav.classList.toggle('show');
            });
        }

        // Collapse the mobile dropdown after navigating
        if (headerNav) {
            const collapseMenu = () => {
                if (window.innerWidth <= 991) {
                    headerNav.classList.remove('show');
                }
            };

            headerNav.addEventListener('click', (e) => {
                if (e.target.closest('a')) {
                    collapseMenu();
                }
            });

            // Support closing the menu when navigation changes without a click
            window.addEventListener('hashchange', collapseMenu);
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);
