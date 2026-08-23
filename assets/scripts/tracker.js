import { escapeHtml, toTitleCase, slugify } from './utils.js';
import { appState, saveTracker } from './state.js';

// close active popover overlays
export function closeAllPopovers() {
    if (appState.activePopover) {
        if (appState.activePopover._triggerBtn) {
            appState.activePopover._triggerBtn.classList.remove('popover-open');
        }
        appState.activePopover.remove();
        appState.activePopover = null;
    }
}

// setup global outside click and escape key listeners
export function setupGlobalClickListeners() {
    document.addEventListener('click', (e) => {
        if (
            appState.activePopover &&
            !appState.activePopover.contains(e.target) &&
            !e.target.closest('.status-cb-btn') &&
            !e.target.closest('.companies-btn')
        ) {
            closeAllPopovers();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllPopovers();
    });

    window.addEventListener('resize', closeAllPopovers);
}

// open status selection popover
export function openStatusPopover(triggerBtn, problemId) {
    if (appState.activePopover && appState.activePopover._triggerBtn === triggerBtn) {
        closeAllPopovers();
        return;
    }
    closeAllPopovers();

    const currentStatus = appState.tracker[problemId]?.status || 'todo';

    const popover = document.createElement('div');
    popover.className = 'status-popover';
    popover._triggerBtn = triggerBtn;
    triggerBtn.classList.add('popover-open');

    popover.innerHTML = `
        <button class="status-popover-item ${currentStatus === 'todo' ? 'active' : ''}" data-status="todo">
            <span class="status-marker todo"></span>
            <span>To Do</span>
        </button>
        <button class="status-popover-item ${currentStatus === 'progress' ? 'active' : ''}" data-status="progress">
            <span class="status-marker progress"><i class="fa-solid fa-minus"></i></span>
            <span>In Progress</span>
        </button>
        <button class="status-popover-item ${currentStatus === 'solved' ? 'active' : ''}" data-status="solved">
            <span class="status-marker solved"><i class="fa-solid fa-check"></i></span>
            <span>Solved</span>
        </button>
    `;

    document.body.appendChild(popover);
    appState.activePopover = popover;

    // calculate popover viewport placement
    const rect = triggerBtn.getBoundingClientRect();
    let top = rect.bottom + 6;
    let left = rect.left;

    if (top + 130 > window.innerHeight) top = rect.top - 130;
    if (left + 150 > window.innerWidth) left = window.innerWidth - 160;
    if (left < 10) left = 10;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    // handle status selection
    popover.querySelectorAll('.status-popover-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            let selectedStatus = item.getAttribute('data-status');
            if (currentStatus === selectedStatus && selectedStatus !== 'todo') {
                selectedStatus = 'todo';
            }
            appState.tracker[problemId] = { status: selectedStatus };
            saveTracker();
            refreshTrackerStats();
            closeAllPopovers();

            if (appState.activeFilter !== 'all') {
                renderTrackerTable();
            } else {
                updateStatusButton(triggerBtn, selectedStatus);
            }
        });
    });
}

// update status button icon and styling
export function updateStatusButton(btn, status) {
    if (!btn) return;
    btn.className = `status-cb-btn ${status}`;
    if (status === 'solved') {
        btn.innerHTML = `<i class="fa-solid fa-check"></i>`;
    } else if (status === 'progress') {
        btn.innerHTML = `<i class="fa-solid fa-minus"></i>`;
    } else {
        btn.innerHTML = ``;
    }
}

// open company list popover
export function openCompaniesPopover(triggerBtn, problem) {
    if (appState.activePopover && appState.activePopover._triggerBtn === triggerBtn) {
        closeAllPopovers();
        return;
    }
    closeAllPopovers();

    const popover = document.createElement('div');
    popover.className = 'companies-popover';
    popover._triggerBtn = triggerBtn;
    triggerBtn.classList.add('popover-open');

    const companiesHtml = (problem.companies || [])
        .map(c => `<span class="company-tag">${escapeHtml(c)}</span>`)
        .join('');

    popover.innerHTML = `
        <div class="companies-popover-body">
            ${companiesHtml || '<span style="color:var(--text-tertiary);font-size:0.75rem">No companies recorded</span>'}
        </div>
    `;

    document.body.appendChild(popover);
    appState.activePopover = popover;

    // mobile centered placement vs desktop anchor placement
    if (window.innerWidth <= 600) {
        popover.style.top = '50%';
        popover.style.left = '50%';
        popover.style.transform = 'translate(-50%, -50%)';
        popover.style.width = 'calc(100vw - 32px)';
        popover.style.maxWidth = '280px';
    } else {
        const rect = triggerBtn.getBoundingClientRect();
        let top = rect.top;
        let left = rect.right + 8;

        if (left + 260 > window.innerWidth) left = rect.left - 265;
        if (left < 10) left = 10;
        if (top + 180 > window.innerHeight) top = window.innerHeight - 190;
        if (top < 10) top = 10;

        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
    }
}

// bind filter segment clicks and mobile filter toggle
export function setupTrackerFilters() {
    document.querySelectorAll('.filter-chip[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveFilter(btn.getAttribute('data-filter'));
        });
    });

    document.querySelectorAll('.diff-chip[data-diff]').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveDiff(btn.getAttribute('data-diff'));
        });
    });

    const mobileToggle = document.getElementById('mobile-filter-toggle');
    const collapsible = document.getElementById('toolbar-collapsible-filters');
    if (mobileToggle && collapsible) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = collapsible.classList.toggle('open');
            mobileToggle.classList.toggle('open', isOpen);
        });
    }

    appState.activeFilter = localStorage.getItem('cpp_dsa_filter_status') || 'all';
    appState.activeDiff = localStorage.getItem('cpp_dsa_filter_diff') || 'all';
    updateFilterChipsActiveState();
}

// set active problem status filter
export function setActiveFilter(filterVal) {
    appState.activeFilter = filterVal;
    localStorage.setItem('cpp_dsa_filter_status', appState.activeFilter);
    updateFilterChipsActiveState();
    closeAllPopovers();
    renderTrackerTable();
}

// set active difficulty filter
export function setActiveDiff(diffVal) {
    appState.activeDiff = diffVal;
    localStorage.setItem('cpp_dsa_filter_diff', appState.activeDiff);
    updateFilterChipsActiveState();
    closeAllPopovers();
    renderTrackerTable();
}

// update active classes on filter buttons
export function updateFilterChipsActiveState() {
    document.querySelectorAll('.filter-chip[data-filter]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === appState.activeFilter);
    });
    document.querySelectorAll('.diff-chip[data-diff]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-diff') === appState.activeDiff);
    });

    const dot = document.getElementById('filter-indicator-dot');
    if (dot) {
        dot.style.display = (appState.activeFilter !== 'all' || appState.activeDiff !== 'all') ? 'block' : 'none';
    }
}

// bind live search input and clear button
export function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    if (!searchInput) return;

    const savedSearch = localStorage.getItem('cpp_dsa_search') || '';
    searchInput.value = savedSearch;
    if (clearBtn) clearBtn.style.display = savedSearch ? 'flex' : 'none';

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        localStorage.setItem('cpp_dsa_search', val);
        if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
        closeAllPopovers();
        renderTrackerTable();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            localStorage.setItem('cpp_dsa_search', '');
            clearBtn.style.display = 'none';
            searchInput.focus();
            closeAllPopovers();
            renderTrackerTable();
        });
    }
}

// recalculate problem counts and progress bar fill
export function refreshTrackerStats() {
    let solved = 0;
    let progress = 0;
    let todo = 0;
    const problems = appState.problems || [];

    problems.forEach(p => {
        const s = appState.tracker[p.id]?.status || 'todo';
        if (s === 'solved') solved++;
        else if (s === 'progress') progress++;
        else todo++;
    });

    const total = problems.length;
    const doneCount = solved + progress;
    const statTotal = document.getElementById('stat-total');
    const statSolved = document.getElementById('stat-solved');
    const statSolvedCount = document.getElementById('stat-solved-count');
    const statProgressCount = document.getElementById('stat-progress-count');
    const statTodoCount = document.getElementById('stat-todo-count');
    const progressFill = document.getElementById('tracker-progress-fill');

    if (statTotal) statTotal.innerText = total;
    if (statSolved) statSolved.innerText = doneCount;
    if (statSolvedCount) statSolvedCount.innerText = solved;
    if (statProgressCount) statProgressCount.innerText = progress;
    if (statTodoCount) statTodoCount.innerText = todo;

    if (progressFill) {
        const pct = total > 0 ? (doneCount / total) * 100 : 0;
        progressFill.style.width = `${pct.toFixed(1)}%`;
    }
}

// render problem table rows with topic grouping and filters
export function renderTrackerTable() {
    const tbody = document.getElementById('problems-tbody');
    if (!tbody) return;

    const searchEl = document.getElementById('search-input');
    const search = searchEl ? searchEl.value.toLowerCase().trim() : '';

    tbody.innerHTML = '';

    const problems = appState.problems || [];
    const filtered = problems.filter(p => {
        const status = appState.tracker[p.id]?.status || 'todo';
        if (appState.activeFilter !== 'all' && status !== appState.activeFilter) return false;
        if (appState.activeDiff !== 'all' && p.difficulty !== appState.activeDiff) return false;
        if (search) {
            const q = search;
            const matchesId = String(p.id).includes(q);
            const matchesName = p.name.toLowerCase().includes(q);
            const matchesTopic = (p.topic || '').toLowerCase().includes(q);
            const matchesPattern = (p.pattern || '').toLowerCase().includes(q);
            const matchesCompany = p.companies && p.companies.some(c => c.toLowerCase().includes(q));
            if (!matchesId && !matchesName && !matchesTopic && !matchesPattern && !matchesCompany) return false;
        }
        return true;
    });

    // empty results feedback
    if (!filtered.length) {
        tbody.innerHTML = `<tr class="no-problems-row"><td colspan="5"><div class="empty-tracker-message">No problems found matching the selected filter.</div></td></tr>`;
        return;
    }

    // group problems by pattern or topic
    const grouped = {};
    filtered.forEach(p => {
        const key = p.pattern || p.topic || 'Other';
        (grouped[key] = grouped[key] || []).push(p);
    });

    Object.keys(grouped).forEach(topic => {
        const htr = document.createElement('tr');
        htr.className = 'topic-row';
        htr.innerHTML = `<td colspan="5">${toTitleCase(topic)}</td>`;
        tbody.appendChild(htr);

        grouped[topic].forEach(p => {
            const status = appState.tracker[p.id]?.status || 'todo';
            const lcHref = p.leetcode_url || p.leetcode || `https://leetcode.com/problems/${slugify(p.name)}/`;
            const mdHref = p.markdown ? `#note-${p.markdown.replace(/^(notes|docs)\//, '')}` : `#problem-${p.id}`;

            const tr = document.createElement('tr');

            let statusIcon = '';
            if (status === 'solved') statusIcon = '<i class="fa-solid fa-check"></i>';
            else if (status === 'progress') statusIcon = '<i class="fa-solid fa-minus"></i>';

            let companiesHtml = '<span style="color:var(--text-tertiary)">—</span>';
            if (p.companies && p.companies.length > 0) {
                companiesHtml = `
                    <button class="companies-btn" data-id="${p.id}" aria-label="${p.companies.length} Companies">
                        <i class="fa-regular fa-building"></i>
                    </button>`;
            }

            tr.innerHTML = `
                <td class="col-status">
                    <button class="status-cb-btn ${status}" data-id="${p.id}" aria-label="Status: ${status}">
                        ${statusIcon}
                    </button>
                </td>
                <td class="col-problem">
                    <a href="${lcHref}" target="_blank" rel="noopener noreferrer" class="problem-link">${p.id}. ${escapeHtml(p.name)}</a>
                </td>
                <td class="col-diff">
                    <span class="diff-circle ${p.difficulty.toLowerCase()}" title="${p.difficulty}"></span>
                </td>
                <td class="col-comp">
                    ${companiesHtml}
                </td>
                <td class="col-soln">
                    <a href="${mdHref}" class="solution-btn" aria-label="View solution notes">
                        <i class="fa-regular fa-file-lines"></i>
                    </a>
                </td>`;

            const statusBtn = tr.querySelector('.status-cb-btn');
            if (statusBtn) {
                statusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openStatusPopover(statusBtn, p.id);
                });
            }

            const compBtn = tr.querySelector('.companies-btn');
            if (compBtn) {
                compBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openCompaniesPopover(compBtn, p);
                });
            }

            tbody.appendChild(tr);
        });
    });
}

// open problem tracker modal
export function showProblemsTable() {
    const modal = document.getElementById('tracker-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    refreshTrackerStats();
    renderTrackerTable();
    modal.scrollTop = 0;

    const header = document.querySelector('.header-trigger-zone');
    if (header) header.classList.remove('header-hidden');
}
