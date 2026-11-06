/* =========================================================
   מפת נכסים גרפיים — כל נתיבי התמונות במקום אחד.
   כדי להחליף תמונה בעתיד: מחליפים כאן את הנתיב בלבד.
   הנכסים המאושרים נמצאים בתיקייה assets/approved/
   (קלפי הכחול והצהוב: חיתוך נקי של כל קלף מתוך הגיליון המאושר,
    בתיקיות clean/ — בלי שינוי באיור).
   ========================================================= */

const ASSETS = {
  board: 'assets/approved/board/approved_board.jpg',
  seaBackground: 'assets/underwater_clean_background.png', // מילוי שוליים בלבד

  players: {
    yellow: 'assets/approved/players/player_yellow_happy.png',
    blue:   'assets/approved/players/player_blue_curious.png',
    red:    'assets/approved/players/player_red_angry.png',
    green:  'assets/approved/players/player_green_calm.png',
    purple: 'assets/approved/players/player_purple_worried.png',
  },

  // תבניות הקלפים — כל הקלפים באותן מידות (488x732).
  // מקור: source_card_templates.webp; בעל החיים בתחתית הוקטן ל־74%.
  cardTemplates: {
    red:    'assets/approved/cards/templates/card_template_red.png',
    blue:   'assets/approved/cards/templates/card_template_blue.png',
    yellow: 'assets/approved/cards/templates/card_template_yellow.png',
  },

  // גב הקלפים (״קלף היכרות / רגש / ידע״) — מוצג בערמות שעל הלוח
  cardBacks: {
    red:    'assets/approved/cards/templates/card_back_red.png',
    blue:   'assets/approved/cards/templates/card_back_blue.png',
    yellow: 'assets/approved/cards/templates/card_back_yellow.png',
  },

  // תוכן קלפי הרגש: המרגישון ומילת הרגש, חתוכים מהקלפים המאושרים (בלי המסגרת הישנה והדולפין)
  blueCards: {
    joy:        'assets/approved/cards/templates/content_blue_01_joy.png',
    anger:      'assets/approved/cards/templates/content_blue_02_anger.png',
    sadness:    'assets/approved/cards/templates/content_blue_03_sadness.png',
    stress:     'assets/approved/cards/templates/content_blue_04_stress.png',
    worry:      'assets/approved/cards/templates/content_blue_05_worry.png',
    fear:       'assets/approved/cards/templates/content_blue_06_fear.png',
    curiosity:  'assets/approved/cards/templates/content_blue_07_curiosity.png',
    excitement: 'assets/approved/cards/templates/content_blue_08_excitement.png',
    courage:    'assets/approved/cards/templates/content_blue_09_courage.png',
  },

  // איורי קלפי הידע בלבד (בלי הטקסט המוטמע); השאלה נכתבת על הקלף כטקסט
  yellowCards: {
    hospital:        'assets/approved/cards/templates/content_yellow_01_hospital.png',
    catheterization: 'assets/approved/cards/templates/content_yellow_02_catheterization.png',
    team:            'assets/approved/cards/templates/content_yellow_03_team.png',
    ward:            'assets/approved/cards/templates/content_yellow_04_ward.png',
    question:        'assets/approved/cards/templates/content_yellow_05_question.png',
    heartOrgan:      'assets/approved/cards/templates/content_yellow_06_heart_organ.png',
    heartRole:       'assets/approved/cards/templates/content_yellow_07_heart_role.png',
    family:          'assets/approved/cards/templates/content_yellow_08_family.png',
    suitcase:        'assets/approved/cards/templates/content_yellow_09_suitcase.png',
  },

  badges: {
    red3:    'assets/approved/badges/key_bonus_3_red.png',
    yellow4: 'assets/approved/badges/key_bonus_4_yellow.png',
  },
};
