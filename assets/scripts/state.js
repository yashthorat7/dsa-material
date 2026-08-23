import { slugify } from './utils.js';

// storage key for tracker data
export const STORAGE_KEY = 'cpp_dsa_tracker_v2';

// reactive application state container
export const appState = {
    problems: [],
    tracker: {},
    navHistory: [],
    activeFilter: 'all',
    activeDiff: 'all',
    activePopover: null,
    lastScrollY: 0,
    shouldRestoreScroll: false,
    isRestoringScroll: false
};

// restore tracker status from localstorage
try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        appState.tracker = JSON.parse(saved);
    }
} catch (err) {
    console.warn('failed to parse tracker state:', err);
}

// persist tracker changes to localstorage
export function saveTracker() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.tracker));
    } catch (err) {
        console.warn('failed to save tracker state:', err);
    }
}

// fetch problem dataset and initialize missing statuses
export async function loadProblems() {
    try {
        const res = await fetch('docs/problems.json');
        if (res.ok) {
            const data = await res.json();
            for (const p of data) {
                const slug = slugify(p.name);
                p.leetcode = p.leetcode_url || `https://leetcode.com/problems/${slug}/`;
                p.markdown = `docs/solutions/lc-${String(p.id).padStart(4, '0')}.md`;
                p.topic = p.topic || p.pattern || `Chapter ${p.chapter || ''}`;
                if (!appState.tracker[p.id]) {
                    appState.tracker[p.id] = { status: 'todo' };
                }
            }
            appState.problems = data;
            saveTracker();
            return appState.problems;
        }
    } catch (err) {
        console.error('failed to load problems:', err);
    }
    return [];
}
