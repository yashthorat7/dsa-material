// initialize color theme and toggle listener
export function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.body.className = saved === 'light' ? 'light-theme' : 'dark-theme';

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            document.body.classList.toggle('dark-theme', !isLight);
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
}
