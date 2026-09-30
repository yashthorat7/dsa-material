import { appState, loadProblems } from './state.js';
import { initTheme } from './theme.js';
import { initMarkdownRenderer } from './markdown.js?v=2.0';
import { setupSmartScrollHeader, setupHeaderButtons } from './nav.js';
import { setupSearch, setupTrackerFilters, setupGlobalClickListeners } from './tracker.js';
import { handleRoute, onMarkdownClick, isSolutionRoute } from './router.js?v=2.0';

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initMarkdownRenderer();
    setupHeaderButtons(isSolutionRoute);
    setupSmartScrollHeader();
    setupSearch();
    setupTrackerFilters();
    setupGlobalClickListeners();

    await loadProblems();

    window.addEventListener('hashchange', () => handleRoute(window.location.hash));

    const markdownContainer = document.getElementById('markdown-container');
    if (markdownContainer) {
        markdownContainer.addEventListener('click', onMarkdownClick);
    }

    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    window.addEventListener('scroll', () => {
        if (!appState.isRestoringScroll && !appState.shouldRestoreScroll) {
            localStorage.setItem('cpp_dsa_last_scroll', window.scrollY);
        }
    }, { passive: true });

    // restore last visited route or load default
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
