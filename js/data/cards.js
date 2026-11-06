/* =========================================================
   נתוני הקלפים — טקסט מדויק לפי המפרט
   ---------------------------------------------------------
   text:  הטקסט המחייב. באדום ובצהוב הוא נכתב על הקלף כטקסט;
          בכחול מילת הרגש מופיעה בתוך האיור המאושר.
   כל הקלפים מוצגים על תבנית אחידה (ASSETS.cardTemplates).
   key:   true → קלף מפתח (הסימון נחשף רק בצד הפנימי של הקלף)
   bonus: מספר הצעדים קדימה בקלף מפתח
   badge: תמונת סימון המפתח
   image: תמונת הקלף (מתוך assets.js)
   ========================================================= */

const CARD_DECKS = {
  red: {
    title: 'קלפי היכרות',
    cards: [
      { id: 'r1',  text: 'מאכל אהוב' },
      { id: 'r2',  text: 'צבע אהוב' },
      { id: 'r3',  text: 'תחביב', key: true, bonus: 3, badge: ASSETS.badges.red3 },
      { id: 'r4',  text: 'עובדה מצחיקה על מישהו מהמשפחה' },
      { id: 'r5',  text: 'משהו שלא תאמינו עלי' },
      { id: 'r6',  text: 'משחק אהוב' },
      { id: 'r7',  text: 'עונה מועדפת' },
      { id: 'r8',  text: 'סרט מומלץ' },
      { id: 'r9',  text: 'מוסיקה אהובה' },
      { id: 'r10', text: 'חיה אהובה' },
      { id: 'r11', text: 'אני בבית הספר / בגן' },
    ],
  },

  blue: {
    title: 'קלפי רגש',
    cards: [
      { id: 'b1', text: 'שמחה',    image: ASSETS.blueCards.joy },
      { id: 'b2', text: 'כעס',     image: ASSETS.blueCards.anger },
      { id: 'b3', text: 'עצב',     image: ASSETS.blueCards.sadness },
      { id: 'b4', text: 'לחץ',     image: ASSETS.blueCards.stress },
      { id: 'b5', text: 'דאגה',    image: ASSETS.blueCards.worry },
      { id: 'b6', text: 'פחד',     image: ASSETS.blueCards.fear },
      { id: 'b7', text: 'סקרנות',  image: ASSETS.blueCards.curiosity },
      { id: 'b8', text: 'התרגשות', image: ASSETS.blueCards.excitement },
      { id: 'b9', text: 'אומץ',    image: ASSETS.blueCards.courage },
    ],
  },

  yellow: {
    title: 'קלפי ידע',
    cards: [
      { id: 'y1', text: 'פעם ראשונה בבית החולים?', image: ASSETS.yellowCards.hospital },
      { id: 'y2', text: 'פעם ראשונה בצנתור?', image: ASSETS.yellowCards.catheterization },
      { id: 'y3', text: 'את מי הכרתי מהצוות?', image: ASSETS.yellowCards.team, key: true, bonus: 4, badge: ASSETS.badges.yellow4 },
      { id: 'y4', text: 'מה ידוע על האשפוז?', image: ASSETS.yellowCards.ward },
      { id: 'y5', text: 'מה מסקרן לדעת?', image: ASSETS.yellowCards.question },
      { id: 'y6', text: 'איזה איבר מצונתר?', image: ASSETS.yellowCards.heartOrgan },
      { id: 'y7', text: 'מה התפקיד של הלב?', image: ASSETS.yellowCards.heartRole },
      { id: 'y8', text: 'מי מלווה אותי לצנתור?', image: ASSETS.yellowCards.family },
      { id: 'y9', text: 'איך התכוננתי להגעה לבית החולים / לצנתור?', image: ASSETS.yellowCards.suitcase },
    ],
  },
};
