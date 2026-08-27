import { slugify } from './utils.js';

export const STORAGE_KEY = 'cpp_dsa_tracker_v2';

export const appState = {
    problems: [],
    tracker: {},
    navHistory: [],
    activeStatusFilters: ['solved', 'progress', 'todo'],
    activeDiffFilters: ['Easy', 'Medium', 'Hard'],
    activePopover: null,
    lastScrollY: 0,
    shouldRestoreScroll: false,
    isRestoringScroll: false
};

try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        appState.tracker = JSON.parse(saved);
    }
} catch (err) {
    console.warn('failed to parse tracker state:', err);
}

export function saveTracker() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.tracker));
    } catch (err) {
        console.warn('failed to save tracker state:', err);
    }
}

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
