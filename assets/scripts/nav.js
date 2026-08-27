import { appState } from './state.js';
import { closeAllPopovers, showProblemsTable } from './tracker.js';

export function setupSmartScrollHeader() {
    const header = document.querySelector('.header-trigger-zone');
    if (!header) return;

    let ticking = false;
    let lastModalScrollY = 0;

    const handleScrollUpdate = (currentY, lastY) => {
        if (currentY > 70 && currentY > lastY + 8) {
            header.classList.add('header-hidden');
            closeAllPopovers();
        } else if (currentY < lastY - 8 || currentY <= 30) {
            header.classList.remove('header-hidden');
        }
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const modal = document.getElementById('tracker-modal');
                const isModalOpen = modal && modal.style.display === 'flex';

                if (!isModalOpen && !appState.isRestoringScroll) {
                    handleScrollUpdate(currentScrollY, appState.lastScrollY);
                }
                appState.lastScrollY = Math.max(0, currentScrollY);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    const modal = document.getElementById('tracker-modal');
    if (modal) {
        modal.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = modal.scrollTop;
                    handleScrollUpdate(currentScrollY, lastModalScrollY);
                    lastModalScrollY = Math.max(0, currentScrollY);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    document.addEventListener('mousemove', (e) => {
        if (e.clientY <= 50) {
            header.classList.remove('header-hidden');
        }
    });

    document.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0] && e.touches[0].clientY <= 60) {
            header.classList.remove('header-hidden');
        }
    }, { passive: true });
}

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
