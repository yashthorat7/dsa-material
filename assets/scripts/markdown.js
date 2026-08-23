import { escapeHtml, slugify } from './utils.js';
import { appState } from './state.js';

// configure custom marked extensions for alert callouts and code blocks
export function initMarkdownRenderer() {
    if (typeof marked === 'undefined') return;

    const renderer = new marked.Renderer();

    // render github style alert callout boxes
    renderer.blockquote = function (token) {
        const text = typeof token === 'object' ? this.parser.parse(token.tokens) : token;
        const match = text.match(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
        if (match) {
            const type = match[1].toUpperCase();
            const body = text.replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, '').trim();
            const titles = {
                NOTE: 'Note',
                TIP: 'Tip',
                IMPORTANT: 'Important',
                WARNING: 'Warning',
                CAUTION: 'Caution'
            };
            return `<div class="alert-box alert-${type.toLowerCase()}">
                <div class="alert-header">${titles[type] || 'Note'}</div>
                ${body}
            </div>`;
        }
        return `<blockquote>${text}</blockquote>`;
    };

    // wrap pre and code blocks with syntax class
    renderer.code = function (codeObj) {
        const text = typeof codeObj === 'object' ? codeObj.text : codeObj;
        const lang = (typeof codeObj === 'object' ? codeObj.lang : '') || 'cpp';
        const escaped = escapeHtml(text);
        return `<pre><code class="language-${lang.toLowerCase()}">${escaped}</code></pre>`;
    };

    marked.use({ renderer });
}

// wrap html tables in a scroll container for mobile screens
export function wrapTables(container) {
    if (!container) return;
    container.querySelectorAll('table').forEach(t => {
        if (t.parentElement?.classList.contains('table-scroll-wrap')) return;
        const w = document.createElement('div');
        w.className = 'table-scroll-wrap';
        t.parentNode.insertBefore(w, t);
        w.appendChild(t);
    });
}

// convert raw problem links into interactive capsule badges
export function enhanceLeetCodeLinks(filepath = '', targetContainer = null) {
    const container = targetContainer || document.getElementById('markdown-container');
    if (!container) return;

    const problems = appState.problems || [];
    const sorted = [...problems].sort((a, b) => b.name.length - a.name.length);
    const isProblemFile = filepath.includes('problems/') || filepath.includes('solutions/');

    container.querySelectorAll('a').forEach(link => {
        if (
            link.classList.contains('lc-problem-capsule') ||
            link.closest('.lc-problem-capsule') ||
            link.closest('.alert-box') ||
            link.closest('blockquote')
        ) return;

        const href = link.getAttribute('href') || '';
        if (
            href.startsWith('#') ||
            href.includes('chapters/') ||
            href.includes('chapter-') ||
            href.includes('index.md') ||
            href.includes('cheatsheet.md') ||
            href.includes('roadmap.md')
        ) return;

        const text = link.innerText.trim();
        let prob = null;

        // match by leetcode number pattern
        const lcMatch = text.match(/LC\s*#?(\d+)/i) || href.match(/lc-?0*(\d+)\.md/i);
        if (lcMatch) prob = problems.find(p => String(p.id) === parseInt(lcMatch[1], 10).toString());

        // match by problem title
        if (!prob) {
            const lower = text.toLowerCase();
            prob = sorted.find(p => p.name.toLowerCase() === lower) || sorted.find(p => lower.startsWith(p.name.toLowerCase()));
        }

        // match by leetcode url slug
        if (!prob && href.includes('leetcode.com/problems/')) {
            const m = href.match(/problems\/([^\/\?#]+)/i);
            if (m) {
                const slug = m[1].toLowerCase();
                prob = sorted.find(p => {
                    const pSlugMatch = p.leetcode.match(/problems\/([^\/\?#]+)/i);
                    const pSlug = pSlugMatch ? pSlugMatch[1].toLowerCase() : '';
                    const nameSlug = slugify(p.name);
                    return slug === pSlug || slug === nameSlug;
                });
            }
        }

        if (!prob) return;

        // build badge status icon
        const state = appState.tracker[prob.id]?.status || 'todo';
        const statusHtml = state === 'solved'
            ? `<i class="fa-regular fa-circle-check" style="color:var(--easy-color);font-size:.8rem"></i>`
            : state === 'progress'
            ? `<i class="fa-regular fa-circle-dot" style="color:var(--medium-color);font-size:.8rem"></i>`
            : '';

        const capsule = document.createElement('a');
        capsule.className = 'lc-problem-capsule';

        if (isProblemFile) {
            capsule.href = prob.leetcode || href;
            capsule.target = '_blank';
            capsule.rel = 'noopener noreferrer';
        } else {
            capsule.href = prob.markdown ? `#note-${prob.markdown.replace(/^(notes|docs)\//, '')}` : `#problem-${prob.id}`;
        }

        capsule.innerHTML = `
            <div class="lc-capsule-left">
                <i class="fa-regular fa-file-code lc-icon"></i>
                <span>${prob.id}. ${escapeHtml(prob.name)}</span>
            </div>
            <div class="lc-capsule-right">
                <span class="lc-diff ${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
                ${statusHtml}
            </div>`;

        link.replaceWith(capsule);
    });
}
