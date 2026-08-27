import { escapeHtml, toTitleCase, slugify } from './utils.js';
import { appState, saveTracker } from './state.js';

export function closeAllPopovers() {
    if (appState.activePopover) {
        if (appState.activePopover._triggerBtn) {
            appState.activePopover._triggerBtn.classList.remove('popover-open');
        }
        appState.activePopover.remove();
        appState.activePopover = null;
    }
}

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
    window.addEventListener('scroll', closeAllPopovers, { passive: true });

    const modal = document.getElementById('tracker-modal');
    if (modal) {
        modal.addEventListener('scroll', closeAllPopovers, { passive: true });
    }
}

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

    // viewport boundary clamping
    const rect = triggerBtn.getBoundingClientRect();
    const popoverWidth = 145;
    const popoverHeight = 125;
    let top = rect.bottom + 6;
    let left = rect.left;

    if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) left = 12;

    if (top + popoverHeight > window.innerHeight - 12) {
        top = Math.max(12, rect.top - popoverHeight - 6);
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

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

            if (appState.activeStatusFilters.length > 0) {
                renderTrackerTable();
            } else {
                updateStatusButton(triggerBtn, selectedStatus);
            }
        });
    });
}

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

    const companies = problem.companies || [];
    const companiesHtml = companies
        .map(c => `<span class="company-tag" data-company="${escapeHtml(c)}">${escapeHtml(c)}</span>`)
        .join('');

    popover.innerHTML = companiesHtml || '<span style="color:var(--text-tertiary);font-size:0.75rem">No companies recorded</span>';

    document.body.appendChild(popover);
    appState.activePopover = popover;

    const rect = triggerBtn.getBoundingClientRect();
    const popoverWidth = Math.min(260, window.innerWidth - 24);
    const popoverEstimatedHeight = Math.min(200, 16 + Math.ceil(companies.length / 2) * 32);

    let left = rect.left + (rect.width / 2) - (popoverWidth / 2);
    if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) {
        left = 12;
    }

    let top = rect.bottom + 6;
    if (top + popoverEstimatedHeight > window.innerHeight - 12) {
        top = Math.max(12, rect.top - popoverEstimatedHeight - 6);
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.style.width = `${popoverWidth}px`;

    popover.querySelectorAll('.company-tag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            const companyName = tag.getAttribute('data-company') || tag.innerText.trim();
            const searchInput = document.getElementById('search-input');
            const clearBtn = document.getElementById('search-clear-btn');
            if (searchInput) {
                searchInput.value = companyName;
                localStorage.setItem('cpp_dsa_search', companyName);
                if (clearBtn) clearBtn.style.display = 'flex';
                renderTrackerTable();
            }
            closeAllPopovers();
        });
    });
}

export function toggleStatusFilter(filterVal) {
    const idx = appState.activeStatusFilters.indexOf(filterVal);
    if (idx >= 0) {
        appState.activeStatusFilters.splice(idx, 1);
    } else {
        appState.activeStatusFilters.push(filterVal);
    }
    updateFilterChipsActiveState();
    closeAllPopovers();
    renderTrackerTable();
}

export function toggleDiffFilter(diffVal) {
    const idx = appState.activeDiffFilters.indexOf(diffVal);
    if (idx >= 0) {
        appState.activeDiffFilters.splice(idx, 1);
    } else {
        appState.activeDiffFilters.push(diffVal);
    }
    updateFilterChipsActiveState();
    closeAllPopovers();
    renderTrackerTable();
}

export function setupTrackerFilters() {
    document.querySelectorAll('.filter-chip[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            const filterVal = btn.getAttribute('data-filter');
            toggleStatusFilter(filterVal);
        });
    });

    document.querySelectorAll('.diff-chip[data-diff]').forEach(btn => {
        btn.addEventListener('click', () => {
            const diffVal = btn.getAttribute('data-diff');
            toggleDiffFilter(diffVal);
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

    appState.activeStatusFilters = ['solved', 'progress', 'todo'];
    appState.activeDiffFilters = ['Easy', 'Medium', 'Hard'];

    updateFilterChipsActiveState();
}

export function updateFilterChipsActiveState() {
    document.querySelectorAll('.filter-chip[data-filter]').forEach(btn => {
        const val = btn.getAttribute('data-filter');
        btn.classList.toggle('active', appState.activeStatusFilters.includes(val));
    });
    document.querySelectorAll('.diff-chip[data-diff]').forEach(btn => {
        const val = btn.getAttribute('data-diff');
        btn.classList.toggle('active', appState.activeDiffFilters.includes(val));
    });

    const dot = document.getElementById('filter-indicator-dot');
    if (dot) {
        const isFiltered = appState.activeStatusFilters.length < 3 || appState.activeDiffFilters.length < 3;
        dot.style.display = isFiltered ? 'block' : 'none';
    }
}

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

export function renderTrackerTable() {
    const tbody = document.getElementById('problems-tbody');
    if (!tbody) return;

    const searchEl = document.getElementById('search-input');
    const search = searchEl ? searchEl.value.toLowerCase().trim() : '';

    tbody.innerHTML = '';

    const problems = appState.problems || [];
    const filtered = problems.filter(p => {
        const status = appState.tracker[p.id]?.status || 'todo';
        if (appState.activeStatusFilters.length > 0 && !appState.activeStatusFilters.includes(status)) return false;
        if (appState.activeDiffFilters.length > 0 && !appState.activeDiffFilters.includes(p.difficulty)) return false;
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

    if (!filtered.length) {
        tbody.innerHTML = `<tr class="no-problems-row"><td colspan="5"><div class="empty-tracker-message">No problems found matching the selected filter.</div></td></tr>`;
        return;
    }

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
                    <span class="diff-circle ${p.difficulty.toLowerCase()}"></span>
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
