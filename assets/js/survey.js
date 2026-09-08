(() => {
    'use strict';
    const { state: s, save, track, status } = window.CALLX, defs = window.CALLX_QUESTIONS, steps = Object.keys(defs);
    let busy = false;
    const el = id => document.getElementById(id);
    function render() {
        save();
        el('back').hidden = s.current === 0 || s.completed;
        el('stepnote').textContent = '선택하면 다음 질문으로 이동합니다';
        if (s.completed) {
            finishView();
            return;
        }
        const id = steps[s.current], d = defs[id];
        el('status').textContent = `${s.current + 1} / 6 · ${d.k}`;
        el('bar').style.width = `${s.current / 6 * 100}%`;
        el('question').innerHTML = `<div class="eyebrow">${d.k}</div><h3 tabindex="-1">${d.t}</h3><p class="hint">${d.h}</p><div class="options"></div>`;
        for (const [value, title, desc] of d.o) {
            const b = document.createElement('button');
            b.className = 'option';
            b.setAttribute('aria-pressed', String(s.answers[id] === value));
            b.innerHTML = `<strong>${title}</strong>${desc ? `<span>${desc}</span>` : ''}`;
            b.onclick = () => choose(id, value, b);
            el('question').querySelector('.options').appendChild(b);
        }
        track('survey_step_view', { question_id: id, step: s.current + 1 });
    }
    function choose(id, value, b) {
        if (busy)
            return;
        busy = true;
        if (!s.started) {
            s.started = true;
            track('survey_start');
        }
        s.answers[id] = value;
        b.setAttribute('aria-pressed', 'true');
        track('survey_answer', { question_id: id, option_id: value, step: s.current + 1 });
        setTimeout(() => { busy = false; if (s.current === steps.length - 1) {
            s.completed = true;
            save();
            track('survey_complete', { answered_count: 6 });
            finishView();
        }
        else {
            s.current++;
            render();
        } el('question').querySelector('h3')?.focus({ preventScroll: true }); el('survey').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }, 160);
    }
    function finishView() { el('status').textContent = '6 / 6 · 설문 완료'; el('bar').style.width = '100%'; el('back').hidden = true; el('stepnote').textContent = ''; el('question').innerHTML = `<div class="done"><span class="done-icon" data-icon="check"></span><div class="eyebrow">THANK YOU FOR YOUR ANSWER</div><h3 tabindex="-1">응답이 완료되었습니다.</h3><p>어떤 전화에 어떤 도움이 필요한지,<br>더 필요한 서비스를 만드는 데 참고하겠습니다.</p><p id="saveStatus" role="status" aria-live="polite"></p></div>`; document.querySelectorAll('.done [data-icon]').forEach(node => node.innerHTML = window.CALLX_UI.icon(node.dataset.icon)); status(); }
    el('back').onclick = () => { if (!busy && s.current > 0) {
        s.current--;
        render();
    } };
    document.querySelectorAll('[data-start]').forEach((b, i) => b.onclick = () => { track('survey_cta_click', { cta_location: ['header', 'hero', 'footer'][i] || 'other' }); el('survey').scrollIntoView({ behavior: 'smooth' }); el('question').querySelector('h3')?.focus({ preventScroll: true }); });
    const stories = [['용건 확인', '“방문 시간을 안내드리려고요.”', '발신자와 용건을 먼저 확인합니다. 단순 안내인지, 내 답변이 필요한 전화인지 구분합니다.', '배송 업체 · 방문 일정 문의'], ['답변 전달', '“확인 후 연락드리겠습니다.”', '사용자가 미리 정해둔 답변을 전달합니다. 전달하지 않은 정보로 임의의 답을 만들지 않는 방향입니다.', '전달한 답변 · 확인 후 연락 예정'], ['결정 구분', '방문 시간을 확인해주세요.', '확정 권한을 맡기지 않았다면 새로운 약속은 직접 확인할 수 있도록 남깁니다.', '확인 필요 · 내일 오후 2시'], ['결과 알림', '용건과 남은 일을 한눈에.', '누가 연락했는지, 무엇을 전달했는지, 직접 처리할 일이 무엇인지 정리합니다.', 'AI 응대 완료 · 확인할 일 1건']];
    function story(i) { document.querySelectorAll('[data-story]').forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); b.tabIndex = i === j ? 0 : -1; b.id = 'story-tab-' + j; b.setAttribute('aria-controls', 'story'); }); const [k, t, d, n] = stories[i]; el('story').setAttribute('aria-labelledby', 'story-tab-' + i); el('story').innerHTML = window.CALLX_UI.story(i, k, t, d); }
    document.querySelectorAll('[data-story]').forEach((b, i) => { b.onclick = () => story(i); b.onkeydown = e => { if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
        e.preventDefault();
        const n = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (i + (['ArrowLeft', 'ArrowUp'].includes(e.key) ? 3 : 1)) % 4;
        story(n);
        document.querySelector(`[data-story="${n}"]`).focus();
    } }; });
    track('landing_view');
    story(0);
    render();
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) {
        track('survey_view');
        observer.disconnect();
    } }, { threshold: .25 });
    observer.observe(el('survey'));
})();
