/* Cookies: τίποτα από Google (Analytics / Ads / Χάρτης) ή Meta Pixel δεν φορτώνει πριν πατήσει ο επισκέπτης «Αποδοχή».
   Η επιλογή μένει στο localStorage («vbm_consent» = granted | denied). Ρυθμίσεις ξανά: link «Cookies» στο footer. */
(() => {
  const GA = 'G-BZWX01YLWP', ADS = 'AW-17942909098', FB_PIXEL = '1161893722848867', KEY = 'vbm_consent';
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
    loadMeta();
    document.dispatchEvent(new Event('vbm:consent'));
  }

  function loadMeta() {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', FB_PIXEL);
    fbq('track', 'PageView');
  }

  // μετρήσεις επικοινωνίας (μόνο αν έχει γίνει αποδοχή)
  window.vbmTrack = (method) => {
    if (!loaded) return;
    gtag('event', 'generate_lead', { method });
    if (window.fbq) fbq('track', method === 'form' ? 'Lead' : 'Contact', { method });
  };

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
