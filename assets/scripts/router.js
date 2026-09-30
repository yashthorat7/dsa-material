import { appState } from './state.js';
import { normalizeStr, slugify } from './utils.js';
import { closeAllPopovers, showProblemsTable } from './tracker.js';
import { updateHeaderActiveState } from './nav.js';
import { enhanceLeetCodeLinks, wrapTables } from './markdown.js?v=2.0';

export function isChapterRoute(hash) {
    if (!hash) return false;
    const h = hash.toLowerCase();
    return /^#chapter-\d+/i.test(h)
        || h.startsWith('#note-chapters/')
        || h.startsWith('#note-chapter-')
        || h.startsWith('#note-docs/chapters/');
}

export function isSolutionRoute(hash) {
    if (!hash) return false;
    const h = hash.toLowerCase();
    if (
        /^#problem-\d+/i.test(h) ||
        h.startsWith('#note-solutions/') ||
        h.startsWith('#note-docs/solutions/') ||
        h.startsWith('#note-lc-')
    ) {
        return true;
    }
    const slug = h.replace(/^#note-/, '').replace(/\.md$/, '').replace(/:.*$/, '');
    const problems = appState.problems || [];
    return problems.some(p => {
        const pSlug = slugify(p.name);
        return pSlug === slug || `lc-${String(p.id).padStart(4, '0')}` === slug;
    });
}

// client-side route dispatcher
export function handleRoute(hash) {
    closeAllPopovers();

    const modal = document.getElementById('tracker-modal');
    const isHome = !hash || hash === '#' || hash === '#index' || hash === '#welcome';
    const isProblemsTable = hash === '#problems' || hash === '#tracker' || hash === '#note-problems.md' || hash === '#note-docs/problems.md';

    updateHeaderActiveState(hash, isSolutionRoute, isChapterRoute);

    if (!isProblemsTable && modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    const cleanHash = isHome ? '#index' : hash;
    localStorage.setItem('cpp_dsa_last_hash', cleanHash);

    if (!appState.navHistory.length || appState.navHistory[appState.navHistory.length - 1] !== hash) {
        appState.navHistory.push(hash);
    }

    if (isHome) return loadMarkdown('docs/index.md');
    if (hash === '#cheatsheet' || hash === '#cheatsheets' || hash === '#cheatsheet-index') return loadMarkdown('docs/cheatsheet.md');
    if (isProblemsTable) return showProblemsTable();
    if (hash === '#roadmap') return loadMarkdown('docs/roadmap.md');

    const cm = hash.match(/^#chapter-(\d+)$/);
    if (cm) return loadMarkdown(`docs/chapters/chapter-${cm[1]}.md`);

    const csm = hash.match(/^#cheatsheet-(\d+)$/);
    if (csm) return loadMarkdown('docs/cheatsheet.md', `${csm[1]}-chapter-${csm[1]}`);

    if (hash.startsWith('#note-')) {
        let route = hash.slice(6);
        let anchor = '';
        if (route.includes(':')) [route, anchor] = route.split(':');
        if (route.startsWith('chapters/') || route.startsWith('solutions/')) {
            return loadMarkdown(`docs/${route}`, anchor);
        }
        if (route.startsWith('notes/') || route.startsWith('docs/') || route.startsWith('index/') || route.startsWith('assets/')) {
            return loadMarkdown(route, anchor);
        }
        if (route.startsWith('chapter-')) {
            return loadMarkdown(`docs/chapters/${route}`, anchor);
        }
        if (route.startsWith('cheatsheet')) {
            return loadMarkdown('docs/cheatsheet.md', anchor);
        }
        return loadMarkdown(`docs/${route}`, anchor);
    }

    const pm = hash.match(/^#problem-(\d+)$/);
    if (pm) {
        const problems = appState.problems || [];
        const p = problems.find(x => String(x.id) === pm[1]);
        if (p) return loadMarkdown(p.markdown || `docs/solutions/lc-${String(p.id).padStart(4, '0')}.md`);
    }
}

export function onMarkdownClick(e) {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#') || !href.includes('.md')) return;

    e.preventDefault();
    let [filename, anchor] = href.split('#');
    filename = filename.replace(/^(notes|docs)\//, '');
    let hash = `#note-${filename}`;
    if (anchor) hash += `:${anchor}`;
    window.location.hash = hash;
}

export function loadMarkdown(filepath, anchor = '') {
    const container = document.getElementById('markdown-container');
    if (!container) return;
    container.innerHTML = '';

    fetch(filepath, { cache: 'no-cache' })
        .then(r => {
            if (!r.ok) throw new Error('Document not found');
            return r.text();
        })
        .then(text => {
            const normalized = text.replace(/\r\n/g, '\n');
            container.innerHTML = marked.parse(normalized);

            if (typeof renderMathInElement === 'function') {
                renderMathInElement(container, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false },
                        { left: '\\(', right: '\\)', display: false },
                        { left: '\\[', right: '\\]', display: true }
                    ],
                    output: 'html',
                    throwOnError: false
                });
            }

            const isIndex = filepath.toLowerCase().endsWith('index.md');
            container.classList.toggle('is-index', isIndex);

            if (window.Prism) {
                Prism.highlightAllUnder(container);
            }

            enhanceLeetCodeLinks(filepath, container);
            wrapTables(container);

            // scroll restoration
            appState.isRestoringScroll = true;
            if (appState.shouldRestoreScroll) {
                appState.shouldRestoreScroll = false;
                const savedScroll = parseInt(localStorage.getItem('cpp_dsa_last_scroll') || '0', 10);
                if (savedScroll > 0) {
                    setTimeout(() => {
                        window.scrollTo(0, savedScroll);
                        appState.lastScrollY = Math.max(0, window.scrollY);
                        const header = document.querySelector('.header-trigger-zone');
                        if (header) header.classList.remove('header-hidden');
                        appState.isRestoringScroll = false;
                    }, 100);
                } else if (anchor) {
                    scrollToAnchor(anchor, container);
                } else {
                    window.scrollTo(0, 0);
                    appState.lastScrollY = 0;
                    const header = document.querySelector('.header-trigger-zone');
                    if (header) header.classList.remove('header-hidden');
                    appState.isRestoringScroll = false;
                }
            } else if (anchor) {
                scrollToAnchor(anchor, container);
            } else {
                window.scrollTo(0, 0);
                appState.lastScrollY = 0;
                const header = document.querySelector('.header-trigger-zone');
                if (header) header.classList.remove('header-hidden');
                setTimeout(() => {
                    appState.isRestoringScroll = false;
                }, 100);
            }
        })
        .catch(() => {
            container.innerHTML = `<div style="padding:3rem 1rem;text-align:center;color:var(--text-secondary)">Content not found.</div>`;
        });
}

export function scrollToAnchor(anchor, container) {
    appState.isRestoringScroll = true;
    setTimeout(() => {
        const targetId = normalizeStr(anchor);
        let el = document.getElementById(anchor) || document.getElementById(targetId);

        if (!el) {
            for (const h of container.querySelectorAll('h1,h2,h3,h4')) {
                const slug = normalizeStr(h.innerText);
                if (slug === targetId || (targetId && (slug.includes(targetId) || targetId.includes(slug)))) {
                    el = h;
                    break;
                }
            }
        }
        if (el) {
            window.scrollTo({
                top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 70),
                behavior: 'smooth'
            });
        }
        setTimeout(() => {
            appState.lastScrollY = Math.max(0, window.scrollY);
            const header = document.querySelector('.header-trigger-zone');
            if (header) header.classList.remove('header-hidden');
            appState.isRestoringScroll = false;
        }, 350);
    }, 120);
}
