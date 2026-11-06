/* =========================================================
   רכיבי ממשק מצוירים בקוד — פאות הקובייה בלבד
   (כל שאר הגרפיקה מגיעה מהנכסים המאושרים, ראו assets.js)
   ========================================================= */

const Art = (() => {
  function diceFace(n) {
    const P = { 1: [[50, 50]], 2: [[30, 30], [70, 70]], 3: [[28, 28], [50, 50], [72, 72]],
      4: [[30, 30], [70, 30], [30, 70], [70, 70]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
      6: [[30, 26], [70, 26], [30, 50], [70, 50], [30, 74], [70, 74]] }[n] || [];
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="dieG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e4ecf5"/></linearGradient></defs>
      <rect x="5" y="5" width="90" height="90" rx="20" fill="url(#dieG)" stroke="#c9d6e3" stroke-width="3"/>
      ${P.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.5" fill="#1d4e9e"/>`).join('')}</svg>`;
  }
  return { diceFace };
})();
