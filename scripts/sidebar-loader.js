export async function loadSidebar() {
    const placeholder = document.getElementById('sidebar-placeholder');
    if (!placeholder) return;

    try {
        const resp = await fetch('templates/sidebar.html');
        if (!resp.ok) throw new Error('Failed to load sidebar template');
        const html = await resp.text();
        // Replace the placeholder with the sidebar markup
        placeholder.outerHTML = html;

        // If this page specifies a data-page attribute, adjust links
        const page = document.body.dataset.page;
        if (page === 'data-management') {
            document.querySelectorAll('nav.sidebar a[href^="#"]').forEach(a => {
                a.setAttribute('href', `index.html${a.getAttribute('href')}`);
            });
            const dmLink = document.querySelector('nav.sidebar a[href="data-management.html"]');
            if (dmLink) dmLink.classList.add('active');
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadSidebar);
