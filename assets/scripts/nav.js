import { appState } from './state.js';
import { closeAllPopovers, showProblemsTable } from './tracker.js';

// smart header auto-hide on scroll down and reveal on scroll up
export function setupSmartScrollHeader() {
    const header = document.querySelector('.header-trigger-zone');
    if (!header) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const modal = document.getElementById('tracker-modal');
                const isModalOpen = modal && modal.style.display === 'flex';

                if (!isModalOpen) {
                    if (currentScrollY > 80 && currentScrollY > appState.lastScrollY + 10) {
                        header.classList.add('header-hidden');
                        closeAllPopovers();
                    } else if (currentScrollY < appState.lastScrollY - 10 || currentScrollY <= 40) {
                        header.classList.remove('header-hidden');
                    }
                }
                appState.lastScrollY = Math.max(0, currentScrollY);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // reveal header on cursor near top of viewport
    document.addEventListener('mousemove', (e) => {
        if (e.clientY <= 50) {
            header.classList.remove('header-hidden');
        }
    });
}

// bind click handlers for header navigation buttons
export function setupHeaderButtons(isSolutionRoute) {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const hash = window.location.hash || '';
            if (isSolutionRoute && isSolutionRoute(hash)) {
                window.location.hash = '#problems';
            } else {
                window.location.hash = '#index';
            }
        });
    }

    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            window.location.hash = '#index';
        });
    }

    const csBtn = document.getElementById('cs-btn');
    if (csBtn) {
        csBtn.addEventListener('click', () => {
            window.location.hash = '#cheatsheet';
        });
    }

    const trackerBtn = document.getElementById('tracker-btn');
    if (trackerBtn) {
        trackerBtn.addEventListener('click', () => {
            if (window.location.hash === '#problems') {
                showProblemsTable();
            } else {
                window.location.hash = '#problems';
            }
        });
    }

    // close modal when clicking overlay backdrop
    const modal = document.getElementById('tracker-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                const prev = appState.navHistory.length > 1 ? appState.navHistory[appState.navHistory.length - 2] : '#index';
                window.location.hash = (prev && prev !== '#problems') ? prev : '#index';
            }
        });
    }
}

// update active button indicators based on current route
export function updateHeaderActiveState(hash, isSolutionRoute, isChapterRoute) {
    const homeBtn = document.getElementById('home-btn');
    const trackerBtn = document.getElementById('tracker-btn');
    const csBtn = document.getElementById('cs-btn');
    const backBtn = document.getElementById('back-btn');

    const isHome = !hash || hash === '#' || hash === '#index' || hash === '#welcome';
    const isProblemsTable = hash === '#problems' || hash === '#tracker' || hash === '#note-problems.md' || hash === '#note-docs/problems.md';
    const isCs = hash === '#cheatsheet' || hash === '#note-cheatsheet.md';

    const isSolution = isSolutionRoute ? isSolutionRoute(hash) : false;
    const isChapter = isChapterRoute ? (isChapterRoute(hash) || (hash.startsWith('#note-') && !isHome && !isProblemsTable && !isCs && !isSolution)) : false;
    const shouldShowBackBtn = (isSolution || isChapter) && !isHome && !isProblemsTable && !isCs;

    if (homeBtn) homeBtn.classList.toggle('active', isHome);
    if (trackerBtn) trackerBtn.classList.toggle('active', isProblemsTable);
    if (csBtn) csBtn.classList.toggle('active', isCs);
    if (backBtn) backBtn.style.display = shouldShowBackBtn ? 'inline-flex' : 'none';

    const header = document.querySelector('.header-trigger-zone');
    if (header) header.classList.remove('header-hidden');
}
