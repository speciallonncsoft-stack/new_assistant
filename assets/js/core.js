(() => {
    'use strict';
    const cfg = window.CALLX_CONFIG || {}, preview = location.protocol === 'file:' || !cfg.endpoint;
    const key = 'callx_assistant_v4';
    let state;
    try {
        state = JSON.parse(sessionStorage.getItem(key));
    }
    catch { }
    if (!state || !state.sid)
        state = { sid: crypto.randomUUID(), answers: {}, seq: 0, current: 0, started: false, completed: false, queue: [] };
    state.queue = state.queue || [];
    const save = () => { try {
        sessionStorage.setItem(key, JSON.stringify(state));
    }
    catch { } };
    const params = new URLSearchParams(location.search);
    state.utm = state.utm || Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'campaign_id', 'adset_id', 'ad_id'].map(k => [k, (params.get(k) || '').slice(0, 200)]));
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { dataLayer.push(arguments); };
    if (/^G-[A-Z0-9]+$/.test(cfg.ga4Id || '') && !preview) {
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + cfg.ga4Id;
        document.head.appendChild(s);
        gtag('js', new Date());
        gtag('config', cfg.ga4Id);
    }
    if (/^\d+$/.test(cfg.metaPixelId || '') && !preview) {
        const f = window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
        f.queue = [];
        f.loaded = true;
        f.version = '2.0';
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(s);
        f('init', cfg.metaPixelId);
        f('track', 'PageView');
    }
    let flushing = false;
    function status() { const n = document.getElementById('saveStatus'); if (n)
        n.textContent = preview ? '미리보기 · 응답이 서버에 저장되지 않습니다.' : state.queue.length ? '응답을 저장하는 중입니다. 연결이 끊기면 다시 시도합니다.' : '응답이 저장되었습니다.'; }
    async function flush() {
        if (flushing || preview || !state.queue.length) {
            status();
            return;
        }
        flushing = true;
        let failed = false;
        while (state.queue.length) {
            try {
                const res = await fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state.queue[0]), keepalive: true, signal: AbortSignal.timeout(10000) });
                if (!res.ok)
                    throw Error('save');
                state.queue.shift();
                save();
            }
            catch {
                failed = true;
                break;
            }
        }
        flushing = false;
        status();
        if (failed) {
            const n = document.getElementById('saveStatus');
            if (n) {
                n.textContent = '아직 저장하지 못했습니다. ';
                const b = document.createElement('button');
                b.className = 'survey-retry';
                b.textContent = '다시 저장';
                b.onclick = flush;
                n.appendChild(b);
            }
        }
    }
    function track(event, extra = {}) {
        const safe = { survey_version: 'assistant_v4', ...extra };
        if (!preview && cfg.ga4Id)
            gtag('event', event, safe);
        if (!preview && cfg.metaPixelId && ['survey_start', 'survey_complete', 'survey_cta_click'].includes(event))
            fbq('trackCustom', event, { survey_version: 'assistant_v4' });
        const payload = { version: 'assistant_v4', sid: state.sid, event_id: crypto.randomUUID(), seq: ++state.seq, event, at: new Date().toISOString(), answers: { ...state.answers }, utm: state.utm, details: extra };
        if (!preview) {
            state.queue.push(payload);
            save();
            flush();
        }
    }
    window.addEventListener('online', flush);
    setInterval(() => { if (state.queue.length)
        flush(); }, 10000);
    window.CALLX = { state, save, track, flush, preview, status };
})();
