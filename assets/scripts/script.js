import { appState, loadProblems } from './state.js';
import { initTheme } from './theme.js';
import { initMarkdownRenderer } from './markdown.js';
import { setupSmartScrollHeader, setupHeaderButtons } from './nav.js';
import { setupSearch, setupTrackerFilters, setupGlobalClickListeners } from './tracker.js';
import { handleRoute, onMarkdownClick, isSolutionRoute } from './router.js';

// bootstrap application modules on dom ready
document.addEventListener('DOMContentLoaded', async () => {
    // initialize theme and markdown plugins
    initTheme();
    initMarkdownRenderer();

    // register navigation and scroll header
    setupHeaderButtons(isSolutionRoute);
    setupSmartScrollHeader();

    // register tracker controls and global listeners
    setupSearch();
    setupTrackerFilters();
    setupGlobalClickListeners();

    // load dataset
    await loadProblems();

    // bind hash routing
    window.addEventListener('hashchange', () => handleRoute(window.location.hash));

    // intercept internal markdown links
    const markdownContainer = document.getElementById('markdown-container');
    if (markdownContainer) {
        markdownContainer.addEventListener('click', onMarkdownClick);
    }

    // configure scroll restoration
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    window.addEventListener('scroll', () => {
        if (!appState.isRestoringScroll && !appState.shouldRestoreScroll) {
            localStorage.setItem('cpp_dsa_last_scroll', window.scrollY);
        }
    }, { passive: true });

    // handle initial route or restore previous page
    const savedHash = localStorage.getItem('cpp_dsa_last_hash');
    let initialHash = window.location.hash;
    if (!initialHash || initialHash === '#' || initialHash === '#index') {
        if (savedHash && savedHash !== '#index' && savedHash !== '#') {
            initialHash = savedHash;
            window.location.hash = savedHash;
        }
    }

    if (initialHash) {
        appState.shouldRestoreScroll = true;
    }
    handleRoute(initialHash);
});
