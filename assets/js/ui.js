(() => {
    const paths = { phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L9 10.7a16 16 0 0 0 4.3 4.3l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z"/>', message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 9h8M8 13h5"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2"/>', list: '<path d="m3 6 1 1 2-2M10 6h11M3 12l1 1 2-2M10 12h11M3 18l1 1 2-2M10 18h11"/>', check: '<path d="m5 12 4 4L19 6"/>', shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>', sliders: '<path d="M4 6h4M12 6h8M4 12h10M18 12h2M4 18h3M11 18h9"/><circle cx="10" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>', arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>' };
    const icon = name => `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.check}</svg>`;
    document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
    const demos = [
        '<div class="demo-label">INCOMING / 용건 확인</div><div class="chat-line"><small>배송 기사</small>내일 오후에 방문해도 될까요?</div><div class="chat-line reply"><small>CALL X</small>방문 시간 문의로 전달하겠습니다.</div>',
        '<div class="demo-label">YOUR REPLY / 내가 허용한 답변</div><div class="chat-line"><small>미리 정해둔 말</small>확인 후 다시 연락드릴게요.</div><div class="chat-line reply"><small>CALL X · 전달 완료</small>확인 후 연락드리겠습니다.</div>',
        '<div class="demo-label">YOUR DECISION / 직접 확인할 일</div><div class="demo-calendar"><span class="calendar-date"><small>내일</small>14:00</span><div><b>방문 시간 확인</b><p>아직 약속을 확정하지 않았어요.</p></div></div><span class="pending-tag">내 확인을 기다리는 중</span>',
        `<div class="demo-label">CALL SUMMARY / 응대 결과</div><div class="demo-checklist"><div>${icon('phone')}배송 기사 · 방문 문의</div><div>${icon('message')}확인 후 연락한다고 전달</div><div>${icon('calendar')}내일 오후 2시 가능 여부 확인</div></div>`
    ];
    window.CALLX_UI = { icon, story(i, k, t, d) { return `<div class="story-head"><span>${icon(['phone', 'message', 'calendar', 'list'][i])}</span>${String(i + 1).padStart(2, '0')} / ${k} · 예시</div><h3>${t}</h3><p>${d}</p><div class="demo-screen">${demos[i]}</div><div class="story-dots" aria-hidden="true">${[0, 1, 2, 3].map(j => `<i class="${i === j ? 'active' : ''}"></i>`).join('')}</div>`; } };
    const ticker = document.querySelector('.ticker'), button = document.getElementById('tickerToggle');
    button.onclick = () => { const paused = ticker.classList.toggle('paused'); button.setAttribute('aria-pressed', String(paused)); button.textContent = paused ? '▷ 다시 재생' : 'Ⅱ 일시정지'; };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches)
        button.hidden = true;
})();
