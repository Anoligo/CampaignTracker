export async function loadHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;
    try {
        const resp = await fetch('templates/header.html');
        if (!resp.ok) throw new Error('Failed to load header template');
        const html = await resp.text();
        placeholder.outerHTML = html;

        const toggleBtn = document.getElementById('sidebarToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const sidebar = document.querySelector('.app-sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('show');
                }

                const headerNav = document.getElementById('mainNav');
                if (headerNav && window.innerWidth <= 991) {
                    headerNav.classList.toggle('show');
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);
