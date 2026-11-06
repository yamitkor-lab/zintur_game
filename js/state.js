/* =========================================================
   ניהול מצב המשחק — לוגיקה בלבד, ללא תצוגה
   ========================================================= */

class GameModel {
  constructor(board, decks, rules) {
    this.board = board;
    this.deckData = decks;
    this.rules = rules;
    this.players = [];
    this.current = 0;
    this.decks = {};
    this.finishCount = 0;
  }

  get finishPos() { return this.board.tiles.length + 1; } // 0 = התחלה, 1..N = משבצות, N+1 = סיום

  static shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** סינון שם: עד 20 תווים, בלי רווחים מיותרים; ריק → ״שחקן N״ */
  static cleanName(raw, i) {
    const s = String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 20).trim();
    return s || `שחקן ${i + 1}`;
  }

  /** entries: [{ charId, name }] */
  newGame(entries) {
    this.players = entries.map((e, i) => ({
      index: i, charId: e.charId, name: GameModel.cleanName(e.name, i), pos: 0, finished: false, finishOrder: null,
    }));
    this.current = 0;
    this.finishCount = 0;
    this.decks = {};
    for (const color of Object.keys(this.deckData)) {
      this.decks[color] = GameModel.shuffle(this.deckData[color].cards.map((_, i) => i));
    }
  }

  get player() { return this.players[this.current]; }
  get activePlayers() { return this.players.filter((p) => !p.finished); }

  tileAt(pos) {
    return pos >= 1 && pos <= this.board.tiles.length ? this.board.tiles[pos - 1] : null;
  }

  rollDie() { return 1 + Math.floor(Math.random() * 6); }

  /** רשימת המיקומים צעד-אחר-צעד בתנועה קדימה (נעצר בסיום). */
  forwardPath(from, steps) {
    const path = [];
    let p = from;
    for (let i = 0; i < steps && p < this.finishPos; i++) path.push(++p);
    return path;
  }

  /** נסיגה ממשבצת שחורה — נסיגה אחת בלבד, לא מתחת להתחלה. */
  retreatPath(from) {
    const tile = this.tileAt(from);
    const back = tile && tile.reverseSteps ? tile.reverseSteps : 0;
    let target = Math.max(0, from - back);
    if (this.rules.skipChainedBlackTiles) {
      while (target > 0 && this.tileAt(target).color === 'black') target--;
    }
    const path = [];
    for (let p = from - 1; p >= target; p--) path.push(p);
    return { back, target, path };
  }

  /** הקלף העליון בערמה (לא מוסר עד returnCard). */
  topCard(color) {
    const idx = this.decks[color][0];
    return this.deckData[color].cards[idx];
  }

  /** הקלף שהוצג חוזר לתחתית אותה ערמה. */
  returnTopCard(color) {
    this.decks[color].push(this.decks[color].shift());
  }

  markFinished(player) {
    player.pos = this.finishPos;
    if (!player.finished) {
      player.finished = true;
      player.finishOrder = ++this.finishCount;
    }
  }

  /** מעבר לשחקן הבא שטרם סיים. מחזיר false אם כולם סיימו. */
  nextTurn() {
    const n = this.players.length;
    for (let k = 1; k <= n; k++) {
      const idx = (this.current + k) % n;
      if (!this.players[idx].finished || !this.rules.finishedPlayersSkipTurns) {
        this.current = idx;
        return true;
      }
    }
    return false;
  }
}
