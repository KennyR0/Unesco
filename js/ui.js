/* ============================================================
   ui.js — Motor compartido del arcade ANTÍDOTO
   Overlays, toasts, puntaje, rangos y progreso (localStorage)
   ============================================================ */
const UI = (() => {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const stage = () => $('.stage');

  const setScore = v => { const el = $('#scoreVal'); if (el) el.textContent = v; };
  const getScore = () => { const el = $('#scoreVal'); return el ? parseInt(el.textContent || '0', 10) : 0; };
  const addScore = n => setScore(getScore() + n);

  function toast(msg, type, ms) {
    const st = stage(); if (!st) return;
    ms = ms || 3200;
    const t = document.createElement('div');
    t.className = 'toast' + (type ? ' toast--' + type : '');
    t.innerHTML = msg;
    st.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(10px)'; }, ms - 350);
    setTimeout(() => t.remove(), ms);
  }

  function overlay(html) {
    closeOverlay();
    const st = stage(); if (!st) return null;
    const o = document.createElement('div');
    o.className = 'overlay';
    o.innerHTML = '<div class="panel">' + html + '</div>';
    st.appendChild(o);
    return o;
  }

  function closeOverlay() { const o = $('.overlay'); if (o) o.remove(); }

  function intro(cfg) {
    const o = overlay(
      '<span class="sticker">Misión</span>' +
      '<h2>' + cfg.titulo + '</h2>' +
      '<p class="panel-lead">' + cfg.objetivo + '</p>' +
      '<ul class="rules">' + cfg.reglas.map(r => '<li>' + r + '</li>').join('') + '</ul>' +
      '<button class="btn btn--dark btn--block" id="startBtn">Empezar →</button>'
    );
    $('#startBtn', o).addEventListener('click', () => { closeOverlay(); if (cfg.onStart) cfg.onStart(); });
  }

  function finish(cfg) {
    const o = overlay(
      '<span class="sticker sticker--magenta">Resultado</span>' +
      '<h2>' + (cfg.titulo || 'Misión cumplida') + '</h2>' +
      '<p class="result-rank">' + cfg.rango + '</p>' +
      '<div class="panel-detail">' + cfg.detalle + '</div>' +
      '<div class="panel-actions">' +
      '<button class="btn btn--ghost" id="retryBtn">↻ Reintentar</button>' +
      (cfg.next ? '<a class="btn btn--dark" href="' + cfg.next.href + '">Siguiente: ' + cfg.next.label + ' →</a>' : '') +
      '<a class="btn" href="../index.html#arcade">Arcade</a>' +
      '</div>'
    );
    $('#retryBtn', o).addEventListener('click', () => { closeOverlay(); if (cfg.onRetry) cfg.onRetry(); });
  }

  function save(id, rango) {
    try { localStorage.setItem('antidoto:' + id, JSON.stringify({ rango: rango, fecha: Date.now() })); } catch (e) {}
  }

  // ranks: [{min:0.8,label:"..."}] ordenado de mayor a menor
  function rankFor(pct, ranks) {
    for (const r of ranks) { if (pct >= r.min) return r.label; }
    return ranks[ranks.length - 1].label;
  }

  return { $, $$, shuffle, stage, setScore, getScore, addScore, toast, overlay, closeOverlay, intro, finish, save, rankFor };
})();
