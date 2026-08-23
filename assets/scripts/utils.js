// html entity escaping for safe dom insertion
export function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// title case conversion while preserving acronyms
export function toTitleCase(str) {
    if (!str) return '';
    return str.replace(/\b[a-zA-Z0-9'-]+\b/g, (word) => {
        if (word.length >= 2 && word === word.toUpperCase() && !/^\d+$/.test(word)) {
            return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
}

// slug generator for urls and hashes
export function slugify(str) {
    return String(str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// normalize strings for heading and anchor comparison
export function normalizeStr(s) {
    return (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/(^-+|-+$)/g, '');
}
