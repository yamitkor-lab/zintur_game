/* =========================================================
   מסלול הלוח המאושר — ״אנחנו כאן יחד״
   ---------------------------------------------------------
   מופה מתוך התמונה approved_board.png (1448x1086):
   38 עיגולים, לפי סדר התנועה משלט ״התחלה״ ועד צדפת ״סיום״.
   xPercent / yPercent = מרכז העיגול באחוזים מרוחב/גובה התמונה.
   reverseSteps = הספרה המצוירת על המשבצת השחורה.
   לבדיקה חזותית: פותחים את index.html?debug=1
   ========================================================= */

const BOARD = {
  image: ASSETS.board,
  designWidth: 1448,
  designHeight: 1086,

  // היכן עומדות הדמויות לפני היציאה ובסיום (באחוזים)
  start:  { xPercent: 40.30, yPercent: 77.00 }, // עומדים על הקצה העליון של שלט ״התחלה״
  finish: { xPercent: 90.10, yPercent: 26.20 }, // בתוך צדפת ״סיום״

  tiles: [
    { index: 1,  xPercent: 35.05, yPercent: 75.09, color: 'blue' },
    { index: 2,  xPercent: 31.08, yPercent: 69.57, color: 'yellow' },
    { index: 3,  xPercent: 29.56, yPercent: 63.21, color: 'red' },
    { index: 4,  xPercent: 32.32, yPercent: 57.13, color: 'black', reverseSteps: 4 },
    { index: 5,  xPercent: 37.71, yPercent: 54.83, color: 'yellow' },
    { index: 6,  xPercent: 43.23, yPercent: 55.80, color: 'blue' },
    { index: 7,  xPercent: 48.45, yPercent: 58.20, color: 'red' },
    { index: 8,  xPercent: 53.42, yPercent: 61.14, color: 'yellow' },
    { index: 9,  xPercent: 58.08, yPercent: 64.96, color: 'blue' },
    { index: 10, xPercent: 63.12, yPercent: 67.59, color: 'red' },
    { index: 11, xPercent: 68.54, yPercent: 68.23, color: 'yellow' },
    { index: 12, xPercent: 74.00, yPercent: 67.73, color: 'black', reverseSteps: 2 },
    { index: 13, xPercent: 79.25, yPercent: 65.75, color: 'blue' },
    { index: 14, xPercent: 83.29, yPercent: 61.79, color: 'yellow' },
    { index: 15, xPercent: 85.81, yPercent: 56.26, color: 'red' },
    { index: 16, xPercent: 84.15, yPercent: 50.09, color: 'blue' },
    { index: 17, xPercent: 79.59, yPercent: 46.09, color: 'yellow' },
    { index: 18, xPercent: 74.48, yPercent: 43.42, color: 'red' },
    { index: 19, xPercent: 68.96, yPercent: 41.53, color: 'black', reverseSteps: 1 },
    { index: 20, xPercent: 63.33, yPercent: 40.47, color: 'yellow' },
    { index: 21, xPercent: 57.77, yPercent: 41.44, color: 'blue' },
    { index: 22, xPercent: 52.24, yPercent: 42.77, color: 'yellow' },
    { index: 23, xPercent: 46.62, yPercent: 44.38, color: 'red' },
    { index: 24, xPercent: 40.85, yPercent: 44.20, color: 'yellow' },
    { index: 25, xPercent: 35.26, yPercent: 42.91, color: 'blue' },
    { index: 26, xPercent: 30.56, yPercent: 39.13, color: 'red' },
    { index: 27, xPercent: 28.76, yPercent: 32.97, color: 'yellow' },
    { index: 28, xPercent: 31.01, yPercent: 27.76, color: 'blue' },
    { index: 29, xPercent: 35.26, yPercent: 24.36, color: 'red' },
    { index: 30, xPercent: 40.30, yPercent: 22.47, color: 'yellow' },
    { index: 31, xPercent: 45.72, yPercent: 22.56, color: 'black', reverseSteps: 3 },
    { index: 32, xPercent: 51.00, yPercent: 23.94, color: 'red' },
    { index: 33, xPercent: 55.87, yPercent: 26.38, color: 'blue' },
    { index: 34, xPercent: 60.67, yPercent: 29.01, color: 'yellow' },
    { index: 35, xPercent: 65.88, yPercent: 30.34, color: 'red' },
    { index: 36, xPercent: 71.10, yPercent: 29.28, color: 'blue' },
    { index: 37, xPercent: 76.07, yPercent: 26.61, color: 'yellow' },
    { index: 38, xPercent: 80.94, yPercent: 24.26, color: 'red' },
  ],
};

/* בדיקת תקינות המסלול (מוצגת במסוף הדפדפן ובמצב debug) */
function validateBoard(board) {
  const t = board.tiles;
  const count = (c) => t.filter((x) => x.color === c).length;
  const blacks = t.filter((x) => x.color === 'black');
  const checks = [
    ['מספר משבצות', t.length, t.length === 38],
    ['אינדקסים רציפים 1..N', t.every((x, i) => x.index === i + 1) ? 'כן' : 'לא', t.every((x, i) => x.index === i + 1)],
    ['צבעים חוקיים', t.every((x) => ['red', 'blue', 'yellow', 'black'].includes(x.color)) ? 'כן' : 'לא', t.every((x) => ['red', 'blue', 'yellow', 'black'].includes(x.color))],
    ['צבעים', `אדום ${count('red')}, כחול ${count('blue')}, צהוב ${count('yellow')}, שחור ${blacks.length}`, blacks.length === 4],
    ['משבצות שחורות', blacks.map((b) => `משבצת ${b.index} חוזרת ${b.reverseSteps}`).join(', '),
      blacks.map((b) => b.reverseSteps).sort().join() === '1,2,3,4'],
  ];
  return checks.map(([name, value, ok]) => ({ name, value, ok }));
}
