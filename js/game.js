/* =========================================================
   ״אנחנו כאן יחד״ — מנוע תצוגה וזרימת תורות
   מצב המשחק עצמו מנוהל ב-state.js (GameModel).
   הלוח המאושר מוצג כתמונה אחת; מעליו רק שכבות ממשק שקופות.
   ========================================================= */

(() => {
  const $ = (id) => document.getElementById(id);
  const W = BOARD.designWidth, H = BOARD.designHeight;
  const DEBUG = /[?&]debug=1/.test(location.search);

  const model = new GameModel(BOARD, CARD_DECKS, GAME_RULES);
  const charById = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
  const COLOR_HEX = { red: '#E8505B', blue: '#2F80ED', yellow: '#F5B800', black: '#1e3554' };

  const ui = {
    phase: 'setup',  // setup | roll | busy | deck | card | over
    gameId: 0,
    deckColor: null,
    openCard: null,
    setupCount: 0,
    setupRows: [],   // [{ name, charId }]
    dieShown: false,
  };

  class Abort extends Error {}
  function sleep(ms) {
    const id = ui.gameId;
    return new Promise((res, rej) => setTimeout(() => (id === ui.gameId ? res() : rej(new Abort())), ms));
  }
  const guard = (fn) => async (...a) => {
    try { await fn(...a); } catch (e) { if (!(e instanceof Abort)) console.error(e); }
  };

  // הצגת טקסט שהוקלד כטקסט בלבד (לא HTML)
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nameSize = (name, big, small) => {
    const n = [...name].length;
    if (n <= 6) return big;
    if (n <= 10) return Math.round(big * 0.82);
    if (n <= 14) return Math.round(big * 0.68);
    return small;
  };

  /* ---------------- התאמה למסך: כל הלוח גלוי, בלי עיוות ---------------- */
  function fitStage() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const s = Math.min(vw / W, vh / H);
    const left = (vw - W * s) / 2, top = (vh - H * s) / 2;
    $('stage').style.transform = `translate(${left}px, ${top}px) scale(${s})`;
  }
  window.addEventListener('resize', fitStage);
  window.addEventListener('orientationchange', () => setTimeout(fitStage, 250));

  /* ---------------- עזרים ---------------- */
  const charImg = (charId, cls = '') => {
    const c = charById[charId];
    return `<img class="${cls}" src="${c.image}" alt="${esc(c.name)}" draggable="false">`;
  };
  const pctPoint = (o) => ({ x: (o.xPercent / 100) * W, y: (o.yPercent / 100) * H });
  function posPoint(pos) {
    if (pos <= 0) return pctPoint(BOARD.start);
    if (pos >= model.finishPos) return pctPoint(BOARD.finish);
    return pctPoint(BOARD.tiles[pos - 1]);
  }
  const box = (el, r) => Object.assign(el.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });

  /* ---------------- שכבות ממשק מעל לוח הבקרה המאויר ---------------- */
  const hud = {};
  function buildHud() {
    const root = $('hud');
    root.innerHTML = '';
    const mk = (tag, cls) => { const e = document.createElement(tag); e.className = cls; root.appendChild(e); return e; };

    hud.turnAvatar = mk('div', 'turn-avatar'); box(hud.turnAvatar, LAYOUT.turnAvatar);
    hud.turnName = mk('div', 'turn-name'); box(hud.turnName, LAYOUT.turnName);

    hud.die = mk('div', 'die-cover'); box(hud.die, LAYOUT.die);
    hud.die.innerHTML = '<div class="die"></div>';

    hud.roll = mk('button', 'hotspot roll-hot'); box(hud.roll, LAYOUT.rollButton);
    hud.roll.setAttribute('aria-label', 'הטלת קובייה');
    hud.roll.addEventListener('click', onRoll);

    hud.deckArea = mk('div', 'deck-area'); box(hud.deckArea, LAYOUT.deckArea);
    hud.decks = {};
    for (const c of ['red', 'blue', 'yellow']) {
      const b = mk('button', 'hotspot deck-hot'); box(b, LAYOUT.decks[c]);
      b.dataset.color = c;
      // ערמה: שלושה גבי קלפים זה על זה
      b.innerHTML = [10, 5, 0].map((off) => `<img class="pile-card" style="top:${off}px" src="${ASSETS.cardBacks[c]}" alt="" draggable="false">`).join('');
      b.setAttribute('aria-label', CARD_DECKS[c].title);
      b.addEventListener('click', () => onDeck(c));
      hud.decks[c] = b;
    }

    hud.slots = LAYOUT.playerSlots.map((s) => {
      const e = mk('div', 'slot');
      box(e, { x: s.cx - s.d / 2, y: s.cy - s.d / 2, w: s.d, h: s.d });
      e.innerHTML = '<div class="disc"></div><div class="nm"></div>';
      return e;
    });
  }

  function setDie(n) { hud.die.querySelector('.die').innerHTML = Art.diceFace(n); }

  function renderHud() {
    const p = model.player;
    const inGame = ui.phase !== 'setup';
    // ״תור של:״
    if (inGame && p && ui.phase !== 'over') {
      hud.turnAvatar.innerHTML = charImg(p.charId);
      hud.turnName.textContent = p.name;
      hud.turnName.style.fontSize = `${nameSize(p.name, 36, 20)}px`;
    } else {
      hud.turnAvatar.innerHTML = '';
      hud.turnName.textContent = '';
    }
    hud.die.classList.toggle('show', ui.dieShown);
    // כפתור הקובייה
    hud.roll.disabled = ui.phase !== 'roll';
    hud.roll.classList.toggle('ready', ui.phase === 'roll');
    hud.roll.classList.toggle('off', inGame && ui.phase !== 'roll');
    // ערמות
    for (const [c, b] of Object.entries(hud.decks)) {
      b.classList.toggle('active', ui.phase === 'deck' && c === ui.deckColor);
      b.classList.toggle('dim', ui.phase === 'deck' && c !== ui.deckColor);
      b.classList.toggle('locked', ui.phase !== 'deck');
    }
    // עיגולי המשתתפים
    hud.slots.forEach((el, i) => {
      const pl = model.players[i];
      const disc = el.querySelector('.disc'), nm = el.querySelector('.nm');
      el.classList.toggle('empty', !pl);
      el.classList.toggle('active', !!pl && inGame && ui.phase !== 'over' && i === model.current && !pl.finished);
      el.classList.toggle('done', !!pl && pl.finished);
      disc.innerHTML = pl ? charImg(pl.charId) : '';
      nm.textContent = pl ? pl.name : '';
      nm.style.display = pl ? '' : 'none';
      if (pl) nm.style.fontSize = `${nameSize(pl.name, 20, 14)}px`;
    });
  }

  /* ---------------- דמויות על הלוח ---------------- */
  function renderTokens(hopIndex = -1) {
    const layer = $('tokens');
    if (layer.children.length !== model.players.length) {
      layer.innerHTML = model.players.map((p) => `<div class="token" data-p="${p.index}"><div class="inner">${charImg(p.charId)}</div></div>`).join('');
    }
    const groups = {};
    model.players.forEach((p) => (groups[p.pos] = groups[p.pos] || []).push(p.index));
    model.players.forEach((p) => {
      const el = layer.querySelector(`[data-p="${p.index}"]`);
      const g = groups[p.pos];
      const k = g.indexOf(p.index);
      const spread = p.pos === 0 || p.pos >= model.finishPos ? 46 : 30; // הסטה קטנה כשחולקים משבצת
      const off = (k - (g.length - 1) / 2) * spread;
      const { x, y } = posPoint(p.pos);
      el.style.left = `${x + off}px`;
      el.style.top = `${y + 16 + (g.length > 1 ? (k % 2) * 6 : 0)}px`;
      el.style.zIndex = String(Math.round(y) + k);
      el.classList.toggle('active', ui.phase !== 'setup' && ui.phase !== 'over' && p.index === model.current && !p.finished);
      if (p.index === hopIndex) { el.classList.remove('hop'); void el.offsetWidth; el.classList.add('hop'); }
    });
  }

  function update() {
    renderHud();
    renderTokens();
  }

  let toastTimer;
  function toast(text, color = 'blue') {
    const el = $('toast');
    el.textContent = text;
    el.style.left = `${LAYOUT.toast.x}px`;
    el.style.top = `${LAYOUT.toast.y}px`;
    el.style.setProperty('--tc', COLOR_HEX[color] || color);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), GAME_RULES.toastMs);
  }

  /* ---------------- תנועה ---------------- */
  async function moveAlong(player, path) {
    for (const pos of path) {
      player.pos = pos;
      renderTokens(player.index);
      await sleep(GAME_RULES.stepMs);
    }
  }

  /* ---------------- זרימת תור ---------------- */
  const onRoll = guard(async () => {
    if (ui.phase !== 'roll') return;
    ui.phase = 'busy';
    ui.dieShown = true;
    update();
    const p = model.player;
    const n = model.rollDie();
    hud.die.classList.add('rolling');
    const t0 = Date.now();
    while (Date.now() - t0 < GAME_RULES.diceRollMs) {
      setDie(1 + Math.floor(Math.random() * 6));
      await sleep(90);
    }
    hud.die.classList.remove('rolling');
    setDie(n);
    hud.die.classList.remove('pop'); void hud.die.offsetWidth; hud.die.classList.add('pop');
    toast(`יצא ${n}!`, 'blue');
    await sleep(650);
    await moveAlong(p, model.forwardPath(p.pos, n));
    await resolveLanding(p);
  });

  async function resolveLanding(p) {
    if (p.pos >= model.finishPos) return handleFinish(p);
    let tile = model.tileAt(p.pos);
    if (!tile) return endTurn();

    if (tile.color === 'black') {
      const r = model.retreatPath(p.pos);
      toast(`חוזרים ${r.back} ${r.back === 1 ? 'צעד' : 'צעדים'} אחורה`, 'black');
      await sleep(GAME_RULES.toastMs);
      await moveAlong(p, r.path);
      if (p.pos === 0) {
        toast('חזרנו להתחלה', 'blue');
        await sleep(GAME_RULES.toastMs);
        return endTurn();
      }
      tile = model.tileAt(p.pos);
      await sleep(250);
    }

    ui.deckColor = tile.color;
    ui.phase = 'deck';
    toast(`לוקחים קלף מ״${CARD_DECKS[tile.color].title}״`, tile.color);
    update();
  }

  /* ---------------- קלף ---------------- */
  function deckOffset() {
    const d = LAYOUT.decks[ui.openCard ? ui.openCard.color : ui.deckColor];
    // מרכז הערמה ביחס למרכז החלון (שבו מוצג הקלף)
    return { dx: d.x + d.w / 2 - W / 2, dy: d.y + d.h / 2 - (H / 2 - 57) };
  }

  function buildCard(color, card) {
    const holder = $('cardHolder');
    holder.className = `card-holder kind-${color}`;
    const badge = card.key && card.badge ? `<img class="key-badge" src="${card.badge}" alt="מפתח +${card.bonus}" draggable="false">` : '';
    const n = [...card.text].length;
    let content;
    if (color === 'red') {
      const fs = n <= 6 ? 96 : n <= 10 ? 80 : n <= 16 ? 68 : 58;
      content = `<div class="card-text" style="font-size:${fs}px">${esc(card.text)}</div>`;
    } else if (color === 'blue') {
      content = `<img class="card-art blue-art" src="${card.image}" alt="${esc(card.text)}" draggable="false">`;
    } else {
      const fs = n <= 18 ? 46 : n <= 26 ? 42 : 38;
      content = `<img class="card-art yellow-art" src="${card.image}" alt="" draggable="false">
        <div class="card-q" style="font-size:${fs}px">${esc(card.text)}</div>`;
    }
    holder.innerHTML = `<img class="card-img" src="${ASSETS.cardTemplates[color]}" alt="" draggable="false">
      <div class="card-content">${content}</div>${badge}`;
  }

  const onDeck = guard(async (color) => {
    if (ui.phase !== 'deck' || color !== ui.deckColor) return;
    ui.phase = 'busy';
    update();
    const card = model.topCard(color);
    ui.openCard = { color, card };
    buildCard(color, card);
    const holder = $('cardHolder'), btn = $('btnContinue');
    btn.disabled = true;
    btn.style.visibility = 'hidden';
    btn.textContent = card.key ? `המשך — מתקדמים ${card.bonus}` : 'המשך';
    $('toast').classList.remove('show');
    const { dx, dy } = deckOffset();
    holder.style.transition = 'none';
    holder.style.transform = `translate(${dx}px, ${dy}px) scale(.14)`;
    holder.classList.add('from-deck');
    $('cardModal').classList.remove('hidden');
    void holder.offsetWidth;
    holder.style.transition = '';
    holder.classList.remove('from-deck');
    holder.style.transform = 'none';
    await sleep(520);
    ui.phase = 'card';
    btn.style.visibility = '';
    btn.disabled = false;
    update();
  });

  const onContinue = guard(async () => {
    if (ui.phase !== 'card') return;
    ui.phase = 'busy';
    $('btnContinue').disabled = true;
    const { color, card } = ui.openCard;
    model.returnTopCard(color); // הקלף חוזר לתחתית הערמה
    const { dx, dy } = deckOffset();
    const holder = $('cardHolder');
    $('btnContinue').style.visibility = 'hidden';
    holder.style.transform = `translate(${dx}px, ${dy}px) scale(.14)`;
    holder.classList.add('from-deck');
    await sleep(420);
    $('cardModal').classList.add('hidden');
    ui.openCard = null;
    update();

    const p = model.player;
    if (card.key && card.bonus) {
      toast(`קלף מפתח! מתקדמים ${card.bonus} צעדים`, 'yellow');
      await sleep(GAME_RULES.toastMs);
      await moveAlong(p, model.forwardPath(p.pos, card.bonus));
      if (p.pos >= model.finishPos) return handleFinish(p);
      if (GAME_RULES.bonusLandingTriggersTile) return resolveLanding(p);
    }
    endTurn();
  });

  function endTurn() {
    if (!model.nextTurn()) return showGameOver();
    ui.phase = 'roll';
    update();
  }

  /* ---------------- סיום ---------------- */
  function openDialog(html) {
    $('dialogBox').innerHTML = html;
    $('dialog').classList.remove('hidden');
  }
  function closeDialog() { $('dialog').classList.add('hidden'); }

  function handleFinish(p) {
    model.markFinished(p);
    ui.phase = 'busy';
    update();
    if (model.activePlayers.length === 0) return showGameOver();
    openDialog(`
      <div class="big-av">${charImg(p.charId)}</div>
      <h2>כל הכבוד, ${esc(p.name)}! 🎉</h2>
      <p>הגעת לסיום!<br>ממשיכים לשחק עם שאר המשתתפים, או מסיימים?</p>
      <div class="row">
        <button class="btn btn-primary" id="dlgContinue">ממשיכים לשחק</button>
        <button class="btn btn-ghost" id="dlgEnd">מסיימים</button>
      </div>`);
    $('dlgContinue').onclick = () => { closeDialog(); endTurn(); };
    $('dlgEnd').onclick = () => { closeDialog(); showGameOver(); };
  }

  function showGameOver() {
    ui.phase = 'over';
    update();
    const ordered = [...model.players].sort((a, b) => (a.finishOrder || 99) - (b.finishOrder || 99));
    openDialog(`
      <h2>סיימנו את המסע יחד!</h2>
      <p>כל הכבוד לכל המשתתפים 💙</p>
      <div class="rank">${ordered.map((p) => `<div><div class="av">${charImg(p.charId)}</div>${esc(p.name)}</div>`).join('')}</div>
      <div class="row"><button class="btn btn-primary" id="dlgNew">משחק חדש</button></div>`);
    $('dlgNew').onclick = () => { closeDialog(); resetToSetup(); };
  }

  /* ---------------- התחלה מחדש ---------------- */
  function onRestart() {
    if (ui.phase === 'setup') return;
    let c = $('confirm');
    if (!c) {
      c = document.createElement('div');
      c.id = 'confirm';
      c.className = 'overlay';
      c.style.zIndex = 40;
      $('stage').appendChild(c);
    }
    c.innerHTML = `<div class="dialog-box">
      <h2>להתחיל מחדש?</h2>
      <p>כל ההתקדמות במשחק תימחק, ונבחר שוב שמות ודמויות.</p>
      <div class="row">
        <button class="btn btn-primary" id="cfNo">לא, ממשיכים לשחק</button>
        <button class="btn btn-ghost" id="cfYes">כן, מתחילים מחדש</button>
      </div></div>`;
    c.classList.remove('hidden');
    $('cfNo').onclick = () => c.classList.add('hidden');
    $('cfYes').onclick = () => { c.classList.add('hidden'); resetToSetup(); };
  }

  function resetToSetup() {
    ui.gameId++; // עוצר אנימציות שרצות
    ui.phase = 'setup';
    ui.openCard = null;
    ui.deckColor = null;
    ui.setupCount = 0;
    ui.setupRows = [];
    ui.dieShown = false;
    closeDialog();
    $('cardModal').classList.add('hidden');
    $('toast').classList.remove('show');
    hud.die.classList.remove('rolling');
    model.players = [];
    $('tokens').innerHTML = '';
    renderSetup();
    $('setup').classList.remove('hidden');
    update();
  }

  /* ---------------- מסך פתיחה: מספר משתתפים, שם ודמות ---------------- */
  function renderSetup() {
    const root = $('setup');
    if (!ui.setupCount) {
      root.innerHTML = `<div class="setup-box">
        <p class="sub">משחק לוח של היכרות, רגשות וידע</p>
        <h3>כמה משתתפים משחקים?</h3>
        <div class="count-row">
          ${[2, 3].map((n) => `<button class="count-btn" data-n="${n}">
            <div class="avs">${CHARACTERS.slice(0, n).map((c) => charImg(c.id)).join('')}</div>
            ${n} משתתפים</button>`).join('')}
        </div></div>`;
      root.querySelectorAll('.count-btn').forEach((b) => b.addEventListener('click', () => {
        ui.setupCount = +b.dataset.n;
        ui.setupRows = Array.from({ length: ui.setupCount }, () => ({ name: '', charId: null }));
        renderSetup();
      }));
      return;
    }

    root.innerHTML = `<div class="setup-box">
      <h3>כל משתתף כותב שם ובוחר דמות</h3>
      <div class="p-rows">${ui.setupRows.map((r, i) => `
        <div class="p-row" data-row="${i}">
          <div class="p-name">
            <label for="pn${i}">שם משתתף ${i + 1}</label>
            <input id="pn${i}" type="text" maxlength="20" placeholder="הקלידו שם" autocomplete="off" enterkeyhint="done" dir="rtl">
          </div>
          <div class="p-chars">${CHARACTERS.map((c) => `
            <button class="char-btn" data-row="${i}" data-id="${c.id}">
              ${charImg(c.id)}<span class="cn">${esc(c.name)}</span>
            </button>`).join('')}
          </div>
        </div>`).join('')}
      </div>
      <div class="setup-actions">
        <button class="btn btn-ghost" id="setupBack">→ חזרה</button>
        <button class="btn btn-primary" id="setupGo">יוצאים לדרך!</button>
      </div></div>`;

    ui.setupRows.forEach((r, i) => {
      const inp = $(`pn${i}`);
      inp.value = r.name;
      inp.addEventListener('input', () => {
        // רווחים מיותרים לא ״אוכלים״ את מגבלת 20 התווים
        const clean = inp.value.replace(/^\s+/, '').replace(/\s{2,}/g, ' ').slice(0, 20);
        if (clean !== inp.value) inp.value = clean;
        ui.setupRows[i].name = clean;
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') inp.blur(); });
    });
    root.querySelectorAll('.char-btn').forEach((b) => b.addEventListener('click', () => {
      const i = +b.dataset.row, id = b.dataset.id;
      if (ui.setupRows.some((r, j) => j !== i && r.charId === id)) return; // דמות תפוסה
      ui.setupRows[i].charId = ui.setupRows[i].charId === id ? null : id;
      refreshSetup();
    }));
    $('setupBack').onclick = () => { ui.setupCount = 0; ui.setupRows = []; renderSetup(); };
    $('setupGo').onclick = () => { if (ui.setupRows.every((r) => r.charId)) startGame(); };
    refreshSetup();
  }

  function refreshSetup() {
    const root = $('setup');
    root.querySelectorAll('.char-btn').forEach((b) => {
      const i = +b.dataset.row, id = b.dataset.id;
      const owner = ui.setupRows.findIndex((r, j) => j !== i && r.charId === id);
      b.classList.toggle('sel', ui.setupRows[i].charId === id);
      b.disabled = owner >= 0;
      const old = b.querySelector('.taken');
      if (old) old.remove();
      if (owner >= 0) {
        const t = document.createElement('span');
        t.className = 'taken';
        t.textContent = `משתתף ${owner + 1}`;
        b.appendChild(t);
      }
    });
    root.querySelectorAll('.p-row').forEach((row) => row.classList.toggle('ok', !!ui.setupRows[+row.dataset.row].charId));
    $('setupGo').disabled = !ui.setupRows.every((r) => r.charId);
  }

  function startGame() {
    ui.gameId++;
    model.newGame(ui.setupRows.map((r) => ({ charId: r.charId, name: r.name })));
    $('setup').classList.add('hidden');
    $('tokens').innerHTML = '';
    ui.dieShown = false;
    setDie(6);
    ui.phase = 'roll';
    update();
  }

  /* ---------------- מסך מלא ---------------- */
  function setupFullscreen() {
    const btn = $('btnFullscreen');
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) { btn.style.display = 'none'; return; }
    btn.addEventListener('click', () => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement;
      if (fs) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else req.call(el);
    });
  }

  /* ---------------- מצב בדיקת מיפוי (לא מוצג לילדים) ---------------- */
  function renderDebug() {
    const checks = validateBoard(BOARD);
    console.table(checks);
    if (!DEBUG) return;
    const L = $('debugLayer');
    let html = BOARD.tiles.map((t) => {
      const { x, y } = pctPoint(t);
      return `<div class="dbg-dot" style="left:${x}px;top:${y}px">${t.index}</div>`;
    }).join('');
    const s = pctPoint(BOARD.start), f = pctPoint(BOARD.finish);
    html += `<div class="dbg-dot anchor" style="left:${s.x}px;top:${s.y}px">S</div><div class="dbg-dot anchor" style="left:${f.x}px;top:${f.y}px">F</div>`;
    const boxes = [LAYOUT.turnAvatar, LAYOUT.turnName, LAYOUT.die, LAYOUT.rollButton, ...Object.values(LAYOUT.decks),
      ...LAYOUT.playerSlots.map((p) => ({ x: p.cx - p.d / 2, y: p.cy - p.d / 2, w: p.d, h: p.d }))];
    html += boxes.map((r) => `<div class="dbg-box" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"></div>`).join('');
    html += `<div class="dbg-panel"><b>בדיקת מיפוי</b><br>${checks.map((c) => `${c.ok ? '✅' : '❌'} ${c.name}: ${esc(c.value)}`).join('<br>')}</div>`;
    L.innerHTML = html;
  }

  /* ---------------- אתחול ---------------- */
  /* טעינה מוקדמת של כל התמונות — כך המשחק ממשיך לעבוד גם אם החיבור נקטע באמצע */
  function preloadAll() {
    const urls = [];
    const walk = (o) => { for (const v of Object.values(o)) { if (typeof v === 'string' && /\.(png|jpe?g|webp)$/i.test(v)) urls.push(v); else if (v && typeof v === 'object') walk(v); } };
    walk(ASSETS);
    window.__preloaded = urls.map((u) => { const i = new Image(); i.src = u; return i; });
  }

  function init() {
    $('boardImg').src = BOARD.image;
    preloadAll();
    fitStage();
    buildHud();
    setDie(6);
    $('btnContinue').addEventListener('click', onContinue);
    $('btnRestart').addEventListener('click', onRestart);
    setupFullscreen();
    renderSetup();
    update();
    renderDebug();
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  init();

  // לבדיקות בלבד
  window.__game = { model, ui, buildCard };
})();
