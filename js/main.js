/* ============================================================
   main.js — Landing ANTÍDOTO
   Progreso del arcade + contadores animados
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Sellos de progreso en las tarjetas de juego
  const cards = document.querySelectorAll('.game-card[data-game]');
  let done = 0;
  cards.forEach(c => {
    try {
      const raw = localStorage.getItem('antidoto:' + c.dataset.game);
      if (raw) {
        const d = JSON.parse(raw);
        done++;
        const s = document.createElement('span');
        s.className = 'done-stamp';
        s.textContent = '✓ ' + d.rango.replace(/[🕵️🔍😵🛡️😬📡🧠🤥📰⚡🐑🕵️‍♂️]/gu, '').trim();
        c.appendChild(s);
      }
    } catch (e) {}
  });
  const p = document.getElementById('progressCount');
  if (p) p.textContent = done + '/6';

  // Contadores animados al entrar en vista
  const nums = document.querySelectorAll('[data-count]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { animNum(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  nums.forEach(n => io.observe(n));

  function animNum(el) {
    const target = parseFloat(el.dataset.count);
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const dur = 1300;
    const t0 = performance.now();
    function step(t) {
      const pr = Math.min(1, (t - t0) / dur);
      const v = target * (1 - Math.pow(1 - pr, 3));
      el.textContent = pre + (Number.isInteger(target) ? Math.round(v) : v.toFixed(1)) + suf;
      if (pr < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
});
