/* Cookies: τίποτα από Google (Analytics / Ads / Χάρτης) δεν φορτώνει πριν πατήσει ο επισκέπτης «Αποδοχή».
   Η επιλογή μένει στο localStorage («vbm_consent» = granted | denied). Ρυθμίσεις ξανά: link «Cookies» στο footer. */
(() => {
  const GA = 'G-BZWX01YLWP', ADS = 'AW-17942909098', KEY = 'vbm_consent';
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };
  let loaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };

  function loadGoogle() {
    if (loaded) return; loaded = true;
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', GA);
    gtag('config', ADS);
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA;
    document.head.appendChild(s);
    document.dispatchEvent(new Event('vbm:consent'));
  }

  // μετρήσεις επικοινωνίας (μόνο αν έχει γίνει αποδοχή)
  window.vbmTrack = (method) => { if (loaded) gtag('event', 'generate_lead', { method }); };

  function banner() {
    if (document.getElementById('cookieBar')) return;
    const d = document.createElement('div');
    d.id = 'cookieBar'; d.className = 'cookie'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookies');
    d.innerHTML = `<p>🍪 Χρησιμοποιούμε cookies για να μετράμε την επισκεψιμότητα και τις διαφημίσεις μας.
      <a href="privacy.html">Πολιτική απορρήτου</a></p>
      <div class="cookie-btns"><button class="btn btn-ghost btn-sm" data-c="denied">Μόνο τα απαραίτητα</button>
      <button class="btn btn-sm" data-c="granted">Αποδοχή</button></div>`;
    d.addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if (!b) return;
      set(b.dataset.c); d.remove();
      if (b.dataset.c === 'granted') loadGoogle();
    });
    document.body.appendChild(d);
  }

  window.vbmConsent = { granted: () => get() === 'granted', open: banner };
  if (get() === 'granted') loadGoogle();
  else if (!get()) document.addEventListener('DOMContentLoaded', banner);
})();
