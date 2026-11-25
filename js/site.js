(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => Math.round(n).toLocaleString('el-GR');
  const short = n => n >= 1e6 ? (n / 1e6).toLocaleString('el-GR', { maximumFractionDigits: 1 }) + ' εκ.'
                  : n >= 1e4 ? Math.round(n / 1e3).toLocaleString('el-GR') + ' χιλ.' : fmt(n);
  const PLAT_COLORS = { TikTok: '#ff4fd8', Facebook: '#8b3dff', Instagram: '#e21cf0', YouTube: '#ff2e63' };
  const PLAT_EL = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  $('#yr').textContent = new Date().getFullYear();

  /* nav */
  const nav = $('.nav'), burger = $('.burger');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), { passive: true });
  burger.addEventListener('click', () => {
    const o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o);
  });
  $$('.links a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', false); }));

  /* count-up */
  function countUp(el, target, opts = {}) {
    const dur = 1800, t0 = performance.now(), suf = el.dataset.suffix || '';
    const f = el.dataset.fmt === 'short' ? short : fmt;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = f(target) + suf; return; }
    const step = t => {
      const u = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - u, 4);
      el.textContent = f(target * k) + (u === 1 ? suf : '');
      if (u < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.dispatchEvent(new Event('reveal'));
    e.target.classList.add('in');
  }), { threshold: .2 });

  /* reveal on scroll */
  $$('.srcs li,.bank-core,.idea-eg,.pillar,.cmp,.svc,.steps li,.tv-main,.tile,.tv-chart,details,.cl,.form').forEach(el => { el.classList.add('rv'); io.observe(el); });

  /* player */
  const dlg = $('#player'), pv = $('video', dlg);
  const closeP = () => { pv.pause(); pv.removeAttribute('src'); pv.load(); dlg.close(); };
  $('.close', dlg).addEventListener('click', closeP);
  dlg.addEventListener('click', e => { if (e.target === dlg) closeP(); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeP(); });
  function openClip(b) {
    pv.src = b.clip; pv.poster = b.poster || '';
    $('#playerCap').innerHTML = `<b>${esc(b.name)}</b>${b.top && b.top.title ? ' · ' + esc(b.top.title) : ''}`;
    dlg.showModal(); pv.play().catch(() => {});
  }

  /* render */
  function render(s) {
    const a = s.agency;
    // stats
    $$('[data-stat]').forEach(el => {
      const v = a[el.dataset.stat]; if (v == null) return;
      el.textContent = (el.dataset.fmt === 'short' ? short(v) : fmt(v)) + (el.dataset.suffix || '');
      const host = el.closest('.rv') || el;
      if (host.classList.contains('rv')) host.addEventListener('reveal', () => countUp(el, v), { once: true });
      else countUp(el, v);
    });
    $('#period').textContent = 'Περίοδος: ' + a.period;
    const upd = new Date(s.updated), hrs = Math.round((Date.now() - upd) / 36e5);
    $('#updated').textContent = 'Ενημέρωση: ' + (hrs < 1 ? 'μόλις τώρα' : hrs < 24 ? `πριν από ${hrs} ${hrs === 1 ? 'ώρα' : 'ώρες'}` :
      upd.toLocaleDateString('el-GR', { day: 'numeric', month: 'long' }));

    // platforms
    const tot = a.platforms.reduce((x, p) => x + p.views, 0);
    $('#platBar').innerHTML = a.platforms.map(p => `<span style="background:${PLAT_COLORS[p.name] || '#888'}" data-w="${p.views / tot * 100}"></span>`).join('');
    $('#platLegend').innerHTML = a.platforms.map(p => `<span><i style="background:${PLAT_COLORS[p.name] || '#888'}"></i>${p.name} <b>${short(p.views)}</b></span>`).join('');
    $('.tv-main').addEventListener('reveal', () => $$('#platBar span').forEach(sp => sp.style.width = sp.dataset.w + '%'), { once: true });

    // months
    const max = Math.max(...a.months.map(m => m.views));
    $('#chart').innerHTML = a.months.map(m => `<div class="bar${m.partial ? ' partial' : ''}${m.views === max ? ' top' : ''}" title="${m.label}: ${fmt(m.views)}${m.partial ? ' (μέχρι σήμερα)' : ''}"><span>${short(m.views)}</span><i data-h="${m.views / max * 100}"></i><em>${m.label}</em></div>`).join('');
    $('.tv-chart').addEventListener('reveal', () => { $('#chart').classList.add('on'); $$('#chart i').forEach(i => i.style.height = `calc(${i.dataset.h}% - 40px)`); }, { once: true });

    // logos marquee (twice, for a seamless loop)
    const logos = s.logos.map(l => `<img src="${l}" alt="" loading="lazy" width="112" height="84">`).join('');
    $('#logoTrack').innerHTML = logos + logos;

    // brands
    const cats = ['Όλα', ...new Set(s.brands.map(b => b.category))];
    $('#chips').innerHTML = cats.map((c, i) => `<button class="chip" role="tab" aria-selected="${i === 0}">${c}</button>`).join('');
    const grid = $('#brandGrid');
    const MONTH_ACC = { 'Ιανουαρίου': 'Ιανουάριο', 'Φεβρουαρίου': 'Φεβρουάριο', 'Μαρτίου': 'Μάρτιο', 'Απριλίου': 'Απρίλιο',
      'Μαΐου': 'Μάιο', 'Ιουνίου': 'Ιούνιο', 'Ιουλίου': 'Ιούλιο', 'Αυγούστου': 'Αύγουστο', 'Σεπτεμβρίου': 'Σεπτέμβριο',
      'Οκτωβρίου': 'Οκτώβριο', 'Νοεμβρίου': 'Νοέμβριο', 'Δεκεμβρίου': 'Δεκέμβριο' };
    const sinceTxt = s => { const p = (s || '').split(' '); return p.length === 3 ? `${MONTH_ACC[p[1]] || p[1]} ${p[2]}` : s; };
    const card = b => {
      let stat;
      if (b.case && b.views) stat = `<b class="bnum">${short(b.views)}</b><span class="blabel">προβολές με τη ViralBizMedia</span>`;
      else if (b.views >= 20000) stat = `<b class="bnum">${short(b.views)}</b><span class="blabel">προβολές στο καλύτερο βίντεο</span>`;
      else stat = `<span class="blabel">Νέα συνεργασία</span>`;
      const extra = '';
      const bg = b.clip ? `<img class="bposter" src="${b.poster}" alt="" loading="lazy"><span class="play"></span>`
                        : `<span class="bnoclip"><img src="${b.logo}" alt="" loading="lazy"></span>`;
      const tag = b.clip ? 'button' : 'div';
      return `<article class="bcard rv" data-id="${b.id}"><${tag} class="bmedia"${b.clip ? ` aria-label="Δες βίντεο: ${esc(b.name)}"` : ''}>${bg}
        <span class="btop-row"><img class="blogo" src="${b.logo}" alt="" loading="lazy"><span class="bcat">${esc(b.category)}</span></span>
        <span class="binfo"><span class="bname">${esc(b.name)}</span>${stat}<span class="bchips">${extra}</span></span>
      </${tag}></article>`;
    };
    const draw = cat => {
      const list = s.brands.filter(b => cat === 'Όλα' || b.category === cat);
      grid.innerHTML = list.map(card).join('');
      $$('.bcard', grid).forEach(el => { el.classList.add('rv'); io.observe(el); });
    };
    draw('Όλα');
    $('#chips').addEventListener('click', e => {
      const c = e.target.closest('.chip'); if (!c) return;
      $$('.chip').forEach(x => x.setAttribute('aria-selected', x === c)); draw(c.textContent);
    });
    grid.addEventListener('click', e => {
      const m = e.target.closest('button.bmedia'); if (!m) return;
      openClip(s.brands.find(b => b.id === m.closest('.bcard').dataset.id));
    });

  }

  fetch('data/stats.json', { cache: 'no-cache' }).then(r => r.json()).then(render)
    .catch(err => console.error('stats.json', err));

  /* contact form → email (FormSubmit) */
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/viralbizmedia@gmail.com';
  const form = $('#contactForm'), status = $('.form-status', form);
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = form.elements.name, phone = form.elements.phone;
    const phoneOk = phone.value.replace(/\D/g, '').length >= 10;
    name.classList.toggle('bad', !name.value.trim()); phone.classList.toggle('bad', !phoneOk);
    if (!name.value.trim() || !phoneOk) {
      status.className = 'form-status err'; status.textContent = 'Συμπλήρωσε όνομα και ένα σωστό τηλέφωνο.'; return;
    }
    if (form.elements._honey.value) return;   // bot
    const btn = $('button', form); btn.disabled = true; btn.textContent = 'Στέλνεται…'; status.textContent = '';
    const f = new FormData(form);
    const body = {
      _subject: `Νέο μήνυμα από το site: ${f.get('name')}`, _template: 'table', _captcha: 'false',
      'Όνομα': f.get('name'), 'Τηλέφωνο': f.get('phone'), 'Επιχείρηση': f.get('business') || '-', 'Μήνυμα': f.get('message') || '-',
    };
    try {
      const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === 'false' || j.success === false) throw new Error(j.message || r.status);
      form.reset();
      status.className = 'form-status ok'; status.textContent = '✅ Ευχαριστούμε! Θα σε πάρουμε τηλέφωνο σύντομα.';
      window.vbmTrack && vbmTrack('form');
    } catch (err) {
      status.className = 'form-status err';
      status.innerHTML = 'Κάτι δεν πήγε καλά. Πάρε μας στο <a href="tel:+306987120074">698 712 0074</a> ή στείλε στο Viber.';
    } finally { btn.disabled = false; btn.textContent = 'Στείλε'; }
  });

  /* χάρτης Google: μόνο με αποδοχή cookies ή αν τον ζητήσει ο επισκέπτης */
  const map = $('.map');
  const showMap = () => { if (!map.querySelector('iframe'))
    map.innerHTML = `<iframe src="${map.dataset.src}" title="Χάρτης: Θρακών 35, Βόλος" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`; };
  if (window.vbmConsent && vbmConsent.granted()) {
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); showMap(); } }), { rootMargin: '300px' }).observe(map);
  } else {
    map.innerHTML = '<button class="map-btn" type="button">🗺️ Εμφάνιση χάρτη<small>Φορτώνει το Google Maps</small></button>';
    map.addEventListener('click', e => { if (e.target.closest('.map-btn')) showMap(); });
    document.addEventListener('vbm:consent', showMap);
  }

  /* ρυθμίσεις cookies + μέτρηση επαφών */
  $('#cookieSettings')?.addEventListener('click', e => { e.preventDefault(); window.vbmConsent?.open(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="tel:"], a[href^="viber:"], a[href*="wa.me"], a[href*="ig.me"], a[href^="mailto:"]');
    if (!a || !window.vbmTrack) return;
    const h = a.getAttribute('href');
    vbmTrack(h.startsWith('tel:') ? 'phone' : h.startsWith('viber:') ? 'viber' : h.includes('wa.me') ? 'whatsapp' : h.includes('ig.me') ? 'instagram' : 'email');
  });
})();
