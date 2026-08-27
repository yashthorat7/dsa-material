export function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    const isLight = saved === 'light';

    document.documentElement.classList.toggle('light-theme', isLight);
    document.documentElement.classList.toggle('dark-theme', !isLight);
    if (document.body) {
        document.body.classList.toggle('light-theme', isLight);
        document.body.classList.toggle('dark-theme', !isLight);
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isCurrentlyLight = document.documentElement.classList.contains('light-theme');
            const nextLight = !isCurrentlyLight;

            document.documentElement.classList.toggle('light-theme', nextLight);
            document.documentElement.classList.toggle('dark-theme', !nextLight);
            if (document.body) {
                document.body.classList.toggle('light-theme', nextLight);
                document.body.classList.toggle('dark-theme', !nextLight);
            }
            localStorage.setItem('theme', nextLight ? 'light' : 'dark');
        });
    }
}
