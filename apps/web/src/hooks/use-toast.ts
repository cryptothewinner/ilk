'use client';

interface ToastOptions {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
}

let toastContainer: HTMLDivElement | null = null;

function getContainer() {
    if (typeof window === 'undefined') return null;
    if (toastContainer) return toastContainer;

    toastContainer = document.createElement('div');
    toastContainer.style.cssText =
        'position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(toastContainer);
    return toastContainer;
}

function showToast({ title, description, variant = 'default' }: ToastOptions) {
    const container = getContainer();
    if (!container) return;

    const el = document.createElement('div');
    const isError = variant === 'destructive';
    el.style.cssText = `
        pointer-events:auto;padding:12px 16px;border-radius:12px;min-width:280px;max-width:400px;
        box-shadow:0 4px 24px rgba(0,0,0,0.12);border:1px solid ${isError ? '#fecaca' : '#e2e8f0'};
        background:${isError ? '#fef2f2' : '#ffffff'};color:${isError ? '#991b1b' : '#1e293b'};
        font-family:system-ui,sans-serif;transform:translateX(120%);transition:transform 0.3s ease;
    `;

    if (title) {
        const titleEl = document.createElement('div');
        titleEl.style.cssText = `font-weight:600;font-size:14px;${description ? 'margin-bottom:4px' : ''}`;
        titleEl.textContent = title;
        el.appendChild(titleEl);
    }
    if (description) {
        const descEl = document.createElement('div');
        descEl.style.cssText = 'font-size:13px;opacity:0.8';
        descEl.textContent = description;
        el.appendChild(descEl);
    }

    container.appendChild(el);
    requestAnimationFrame(() => {
        el.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        el.style.transform = 'translateX(120%)';
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

export function useToast() {
    return { toast: showToast };
}
