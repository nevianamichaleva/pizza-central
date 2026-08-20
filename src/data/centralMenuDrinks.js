const L = (bg, en, ro, de) => ({ bg, en, ro, de });

/** BGN → EUR (фиксиран курс, същият като в central-menu) */
export const bgnToEur = (bgn) => (Number(bgn) / 1.95583).toFixed(2);

export const getDrinkText = (text, lang = 'bg') => {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[lang] || text.bg || '';
};

export const formatDrinkPrice = (price) => {
  if (price == null || price === '') return null;
  const num = Number.parseFloat(String(price));
  if (!Number.isFinite(num)) return null;
  return `${num.toFixed(2)} €`;
};

export const formatDrinkPriceRange = (price, priceSecondary) => {
  const primary = formatDrinkPrice(price);
  const secondary = formatDrinkPrice(priceSecondary);
  if (primary && secondary) return `${primary} / ${secondary}`;
  return primary || secondary;
};

export const DRINK_CATEGORY_PREFIX = 'drink-';

export const isDrinkCategoryId = (id) =>
  typeof id === 'string' && id.startsWith(DRINK_CATEGORY_PREFIX);

/**
 * @typedef {Object} DrinkItem
 * @property {{bg:string,en:string,ro:string,de:string}} name
 * @property {{bg:string,en:string,ro:string,de:string}=} description
 * @property {{bg:string,en:string,ro:string,de:string}=} quantity
 * @property {string|number} price - EUR
 * @property {string|number=} priceSecondary - EUR (за двойни количества)
 * @property {string[]=} allergens - allergen keys (milk, nuts, ...)
 */

/** @type {Array<{id:string, order:number, name:object, note?:object, subcategories?:Array<{name:object, items:DrinkItem[]}>, items?:DrinkItem[]}>} */
export const drinkCategories = [
  {
    id: `${DRINK_CATEGORY_PREFIX}non-alcoholic`,
    order: 900,
    name: L(
      'Безалкохолни напитки',
      'Non-alcoholic drinks',
      'Băuturi nealcoolice',
      'Alkoholfreie Getränke'
    ),
    note: L(
      'Нашата вода „Глътка здраве“ във всяка чаша – подкрепя храносмилането и укрепва имунната система!',
      'Our "Gulp of Health" water in every glass – supports digestion and strengthens the immune system!',
      'Apa noastră „Gură de sănătate“ în fiecare pahar – susține digestia și întărește sistemul imunitar!',
      'Unser „Schluck Gesundheit“-Wasser in jedem Glas – unterstützt die Verdauung und stärkt das Immunsystem!'
    ),
    items: [
      { name: L('Безалкохолно', 'Soft drink', 'Băutură răcoritoare', 'Erfrischungsgetränk'), quantity: L('250 мл.', '250 ml', '250 ml', '250 ml'), price: '1.74' },
      { name: L('Газирана вода', 'Sparkling water', 'Apă minerală', 'Sprudelwasser'), quantity: L('250 мл.', '250 ml', '250 ml', '250 ml'), price: '1.12' },
      { name: L('Студен чай / сок Капи', 'Iced tea / Cappy juice', 'Ceai rece / suc Cappy', 'Eistee / Cappy-Saft'), quantity: L('250 мл.', '250 ml', '250 ml', '250 ml'), price: '1.89' },
      { name: L('Енергийна напитка', 'Energy drink', 'Băutură energizantă', 'Energydrink'), quantity: L('200 мл.', '200 ml', '200 ml', '200 ml'), price: '3.07' },
      { name: L('Натурален сок Куинс', 'Queens natural juice', 'Suc natural Queens', 'Queens Natursaft'), quantity: L('250 мл.', '250 ml', '250 ml', '250 ml'), price: '1.79' },
      { name: L('Айрян', 'Ayran', 'Ayran', 'Ayran'), quantity: L('200 мл. / 400 мл.', '200 ml / 400 ml', '200 ml / 400 ml', '200 ml / 400 ml'), price: '1.12', priceSecondary: '1.43', allergens: ['milk'] },
      {
        name: L('Таратор', 'Tarator', 'Tarator', 'Tarator'),
        description: L(
          'кисело мляко, краставици, орехи, копър, зехтин',
          'yogurt, cucumbers, walnuts, dill, olive oil',
          'iaurt, castraveți, nuci, mărar, ulei de măsline',
          'Joghurt, Gurken, Walnüsse, Dill, Olivenöl'
        ),
        quantity: L('400 мл.', '400 ml', '400 ml', '400 ml'),
        price: '2.51',
        allergens: ['milk', 'nuts'],
      },
      { name: L('Студено мляко', 'Cold milk', 'Lapte rece', 'Kalte Milch'), quantity: L('200 мл.', '200 ml', '200 ml', '200 ml'), price: '1.12', allergens: ['milk'] },
      { name: L('Трапезна вода 7 pH', 'Table water 7 pH', 'Apă de masă 7 pH', 'Tischwasser 7 pH'), quantity: L('500 мл. / 1.5 л.', '500 ml / 1.5 l', '500 ml / 1,5 l', '500 ml / 1,5 l'), price: '1.02', priceSecondary: '1.79' },
      { name: L('Алкална вода 9 pH', 'Alkaline water 9 pH', 'Apă alcalină 9 pH', 'Alkalisches Wasser 9 pH'), quantity: L('500 мл. / 1.5 л.', '500 ml / 1.5 l', '500 ml / 1,5 l', '500 ml / 1,5 l'), price: '1.28', priceSecondary: '1.94' },
      { name: L('Трапезна вода със зеолит 8 pH', 'Table water with zeolite 8 pH', 'Apă de masă cu zeolit 8 pH', 'Tischwasser mit Zeolith 8 pH'), quantity: L('500 мл. / 1.5 л.', '500 ml / 1.5 l', '500 ml / 1,5 l', '500 ml / 1,5 l'), price: '1.33', priceSecondary: '2.30' },
      { name: L('Трапезна вода със сребро 8 pH', 'Table water with silver 8 pH', 'Apă de masă cu argint 8 pH', 'Tischwasser mit Silber 8 pH'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '1.33' },
      { name: L('Трапезна вода със злато 8 pH', 'Table water with gold 8 pH', 'Apă de masă cu aur 8 pH', 'Tischwasser mit Gold 8 pH'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '1.48' },
      { name: L('Фреш (портокал, грейпфрут, микс)', 'Fresh juice (orange, grapefruit, mix)', 'Fresh (portocală, grepfrut, mix)', 'Frischsaft (Orange, Grapefruit, Mix)'), quantity: L('200 мл.', '200 ml', '200 ml', '200 ml'), price: '2.56' },
      { name: L('Домашна лимонада с вкус', 'Homemade flavored lemonade', 'Limonadă de casă aromatizată', 'Hausgemachte Limonade'), quantity: L('400 мл. / 1 л.', '400 ml / 1 l', '400 ml / 1 l', '400 ml / 1 l'), price: '2.51', priceSecondary: '5.06' },
      { name: L('Nescafe frappe (черно, бяло)', 'Nescafe frappe (black, white)', 'Nescafe frappe (negru, alb)', 'Nescafe Frappe (schwarz, weiß)'), quantity: L('250 мл.', '250 ml', '250 ml', '250 ml'), price: '2.56' },
      { name: L('Алое Вера – кен', 'Aloe Vera – can', 'Aloe Vera – doză', 'Aloe Vera – Dose'), quantity: L('240 мл.', '240 ml', '240 ml', '240 ml'), price: '1.79' },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}hot`,
    order: 901,
    name: L('Топли напитки', 'Hot drinks', 'Băuturi calde', 'Heiße Getränke'),
    items: [
      { name: L('Кафе еспресо, Нескафе', 'Espresso coffee, Nescafe', 'Cafea espresso, Nescafe', 'Espresso, Nescafe'), quantity: L('60 мл.', '60 ml', '60 ml', '60 ml'), price: '1.48' },
      { name: L('Кафе без кофеин', 'Decaf coffee', 'Cafea decofeinizată', 'Entkoffeinierter Kaffee'), quantity: L('60 мл.', '60 ml', '60 ml', '60 ml'), price: '1.53' },
      { name: L('Кафе Лате', 'Caffe Latte', 'Caffe Latte', 'Caffè Latte'), quantity: L('120 мл.', '120 ml', '120 ml', '120 ml'), price: '2.30', allergens: ['milk'] },
      { name: L('Чай с мед', 'Tea with honey', 'Ceai cu miere', 'Tee mit Honig'), quantity: L('120 мл.', '120 ml', '120 ml', '120 ml'), price: '1.43' },
      { name: L('Топло мляко', 'Hot milk', 'Lapte cald', 'Heiße Milch'), quantity: L('120 мл.', '120 ml', '120 ml', '120 ml'), price: '1.43', allergens: ['milk'] },
      { name: L('Мляко с нескафе, Нескафе 3 в 1', 'Milk with Nescafe, Nescafe 3 in 1', 'Lapte cu Nescafe, Nescafe 3 în 1', 'Milch mit Nescafe, Nescafe 3 in 1'), quantity: L('120 мл.', '120 ml', '120 ml', '120 ml'), price: '1.79', allergens: ['milk'] },
      { name: L('Горещ шоколад', 'Hot chocolate', 'Ciocolată caldă', 'Heiße Schokolade'), quantity: L('120 мл.', '120 ml', '120 ml', '120 ml'), price: '2.30', allergens: ['milk'] },
      { name: L('Капучино, Виенско кафе', 'Cappuccino, Viennese coffee', 'Cappuccino, cafea vieneză', 'Cappuccino, Wiener Kaffee'), quantity: L('120 мл.', '120 ml', '120 ml', '120 ml'), price: '2.30', allergens: ['milk'] },
      { name: L('Мляко с мед и канела, мляко с какао', 'Milk with honey and cinnamon, milk with cocoa', 'Lapte cu miere și scorțișoară, lapte cu cacao', 'Milch mit Honig und Zimt, Milch mit Kakao'), quantity: L('120 мл.', '120 ml', '120 ml', '120 ml'), price: '2.30', allergens: ['milk'] },
      { name: L('Ирландско кафе', 'Irish coffee', 'Cafea irlandeză', 'Irish Coffee'), quantity: L('120 мл.', '120 ml', '120 ml', '120 ml'), price: '2.56' },
      { name: L('Медче, сметанка', 'Honey, creamer', 'Miere, smântână', 'Honig, Sahne'), quantity: L('1 бр.', '1 pc.', '1 buc.', '1 Stk.'), price: '0.26', allergens: ['milk'] },
      { name: L('Бита сметана', 'Whipped cream', 'Frișcă', 'Schlagsahne'), quantity: L('30 мл.', '30 ml', '30 ml', '30 ml'), price: '0.26', allergens: ['milk'] },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}alcohol`,
    order: 902,
    name: L('Алкохол (50 мл)', 'Alcohol (50 ml)', 'Alcool (50 ml)', 'Alkohol (50 ml)'),
    note: L(
      'От сутрешното кафе до вечерното вино – тук ще намерите перфектната напитка за всеки момент и ястие!',
      'From morning coffee to evening wine – here you will find the perfect drink for every moment and dish!',
      'De la cafeaua de dimineață la vinul de seară – aici veți găsi băutura perfectă pentru fiecare moment și fel de mâncare!',
      'Vom Morgenkaffee bis zum Abendwein – hier finden Sie das perfekte Getränk für jeden Moment und jedes Gericht!'
    ),
    subcategories: [
      {
        name: L('Алкохол български', 'Bulgarian spirits', 'Alcool bulgar', 'Bulgarischer Alkohol'),
        items: [
          {
            name: L('водка, джин, коняк, ром, мастика, мента', 'vodka, gin, cognac, rum, mastika, mint', 'vodcă, gin, coniac, rom, mastica, mentă', 'Wodka, Gin, Cognac, Rum, Mastika, Minze'),
            price: '1.79',
          },
        ],
      },
      {
        name: L('Алкохол внос', 'Imported spirits', 'Alcool importat', 'Importierter Alkohol'),
        items: [
          { name: L('Водка Koskenkorva', 'Koskenkorva Vodka', 'Vodcă Koskenkorva', 'Koskenkorva Wodka'), price: '2.51' },
          { name: L('Водка Финландия', 'Finlandia Vodka', 'Vodcă Finlandia', 'Finlandia Wodka'), price: '2.30' },
          { name: L('Водка Руски стандарт', 'Russian Standard Vodka', 'Vodcă Russian Standard', 'Russian Standard Wodka'), price: '2.30' },
          { name: L('Водка Белуга', 'Beluga Vodka', 'Vodcă Beluga', 'Beluga Wodka'), price: '5.57' },
          { name: L('Джин Beefeater', 'Beefeater Gin', 'Gin Beefeater', 'Beefeater Gin'), price: '2.30' },
          { name: L('Ром Diplomatico Mantuano', 'Diplomatico Mantuano Rum', 'Rom Diplomatico Mantuano', 'Diplomatico Mantuano Rum'), price: '3.53' },
          { name: L('Ром Diplomatico Mantuano Reserva Exclusiva', 'Diplomatico Mantuano Reserva Exclusiva', 'Rom Diplomatico Mantuano Reserva Exclusiva', 'Diplomatico Mantuano Reserva Exclusiva'), price: '6.60' },
          { name: L('Уиски Tullamore Dew', 'Tullamore Dew Whiskey', 'Whisky Tullamore Dew', 'Tullamore Dew Whiskey'), price: '2.45' },
          { name: L('Уиски J&B', 'J&B Whiskey', 'Whisky J&B', 'J&B Whiskey'), price: '2.30' },
          { name: L('Уиски Jim Beam', 'Jim Beam Whiskey', 'Whisky Jim Beam', 'Jim Beam Whiskey'), price: '2.30' },
          { name: L('Уиски Jameson', 'Jameson Whiskey', 'Whisky Jameson', 'Jameson Whiskey'), price: '2.45' },
          { name: L('Уиски Bushmills', 'Bushmills Whiskey', 'Whisky Bushmills', 'Bushmills Whiskey'), price: '2.45' },
          { name: L('Уиски Passport', 'Passport Whiskey', 'Whisky Passport', 'Passport Whiskey'), price: '2.05' },
          { name: L('Уиски Johnnie Walker', 'Johnnie Walker Whiskey', 'Whisky Johnnie Walker', 'Johnnie Walker Whiskey'), price: '2.30' },
          { name: L('Уиски Johnnie Walker Black Label 12', 'Johnnie Walker Black Label 12', 'Whisky Johnnie Walker Black Label 12', 'Johnnie Walker Black Label 12'), price: '5.06' },
          { name: L('Уиски Chivas Regal 12', 'Chivas Regal 12', 'Whisky Chivas Regal 12', 'Chivas Regal 12'), price: '4.86' },
          { name: L('Уиски Jack Daniel\'s', 'Jack Daniel\'s Whiskey', 'Whisky Jack Daniel\'s', 'Jack Daniel\'s Whiskey'), price: '3.83' },
          { name: L('Jägermeister – 30 мл.', 'Jägermeister – 30 ml', 'Jägermeister – 30 ml', 'Jägermeister – 30 ml'), price: '1.79' },
          { name: L('Ликьор Baileys', 'Baileys Liqueur', 'Lichior Baileys', 'Baileys Likör'), price: '2.56', allergens: ['milk'] },
          { name: L('Metaxa 5 звезди', 'Metaxa 5 Stars', 'Metaxa 5 stele', 'Metaxa 5 Sterne'), price: '2.56' },
          { name: L('Коняк Hennessy VS', 'Hennessy VS Cognac', 'Cognac Hennessy VS', 'Hennessy VS Cognac'), price: '6.60' },
          { name: L('Узо Plomari', 'Plomari Ouzo', 'Ouzo Plomari', 'Plomari Ouzo'), price: '2.30' },
          { name: L('Узо Plomari – 200 мл.', 'Plomari Ouzo – 200 ml', 'Ouzo Plomari – 200 ml', 'Plomari Ouzo – 200 ml'), price: '8.13' },
          { name: L('Martini', 'Martini', 'Martini', 'Martini'), price: '2.15' },
        ],
      },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}beer`,
    order: 903,
    name: L('Бира', 'Beer', 'Bere', 'Bier'),
    note: L(
      'И сърцата ни играят лудо, защото бира винаги ще има!',
      'And our hearts beat wildly, because there will always be beer!',
      'Și inimile noastre bat nebunește, pentru că berea va exista mereu!',
      'Und unsere Herzen schlagen wild, denn es wird immer Bier geben!'
    ),
    subcategories: [
      {
        name: L('Наливна бира', 'Draft beer', 'Bere la draft', 'Fassbier'),
        items: [
          { name: L('Шуменско', 'Shumensko', 'Shumensko', 'Shumensko'), quantity: L('300 мл.', '300 ml', '300 ml', '300 ml'), price: '1.64' },
          { name: L('Шуменско', 'Shumensko', 'Shumensko', 'Shumensko'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '1.99' },
        ],
      },
      {
        name: L('Бутилирана бира', 'Bottled beer', 'Bere la sticlă', 'Flaschenbier'),
        items: [
          { name: L('Erdinger', 'Erdinger', 'Erdinger', 'Erdinger'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '3.32' },
          { name: L('1664 Blanc', '1664 Blanc', '1664 Blanc', '1664 Blanc'), quantity: L('330 мл.', '330 ml', '330 ml', '330 ml'), price: '2.51' },
          { name: L('Grimbergen (Blond, Double Ambree)', 'Grimbergen (Blond, Double Ambree)', 'Grimbergen (Blond, Double Ambree)', 'Grimbergen (Blond, Double Ambree)'), quantity: L('330 мл.', '330 ml', '330 ml', '330 ml'), price: '3.02' },
          { name: L('Budweiser', 'Budweiser', 'Budweiser', 'Budweiser'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '2.51' },
          { name: L('Tuborg', 'Tuborg', 'Tuborg', 'Tuborg'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '2.30' },
          { name: L('Carlsberg', 'Carlsberg', 'Carlsberg', 'Carlsberg'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '2.81' },
          { name: L('Шуменско 100% малц', 'Shumensko 100% malt', 'Shumensko 100% malț', 'Shumensko 100% Malz'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '2.05' },
          { name: L('Шуменско бомбичка', 'Shumensko "bombichka"', 'Shumensko „bombiță"', 'Shumensko „Bombichka"'), quantity: L('330 мл.', '330 ml', '330 ml', '330 ml'), price: '1.64' },
          { name: L('Шуменско авторско', 'Shumensko Author\'s', 'Shumensko de autor', 'Shumensko Autoren-Bier'), quantity: L('500 мл.', '500 ml', '500 ml', '500 ml'), price: '2.30' },
          { name: L('Carlsberg 0.0%', 'Carlsberg 0.0%', 'Carlsberg 0.0%', 'Carlsberg 0.0%'), quantity: L('330 мл.', '330 ml', '330 ml', '330 ml'), price: '2.51' },
          { name: L('Столично тъмно', 'Stolichno Dark', 'Stolichno Dark', 'Stolichno Dunkel'), quantity: L('330 мл.', '330 ml', '330 ml', '330 ml'), price: '2.81' },
        ],
      },
      {
        name: L('Сайдер', 'Cider', 'Cidru', 'Cider'),
        items: [
          {
            name: L('Somersby (ябълка, боровинка, горски плод)', 'Somersby (apple, blueberry, forest fruit)', 'Somersby (măr, afine, fructe de pădure)', 'Somersby (Apfel, Blaubeere, Waldbeere)'),
            quantity: L('330 мл.', '330 ml', '330 ml', '330 ml'),
            price: '2.45',
          },
        ],
      },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}rakia`,
    order: 904,
    name: L('Ракии (50 мл)', 'Rakias (50 ml)', 'Rachiu (50 ml)', 'Rakija (50 ml)'),
    items: [
      { name: L('Пещерска гроздова', 'Peshterska Grozdova (grape)', 'Peshterska Grozdova (struguri)', 'Peshterska Grozdova (Traube)'), price: '1.53' },
      { name: L('Троянска сливова отлежала', 'Troyanska Slivova aged (plum)', 'Troyanska Slivova învechită (prune)', 'Troyanska Slivova gereift (Pflaume)'), price: '1.79' },
      { name: L('Кайсиева', 'Apricot rakia', 'Rachiu de caise', 'Aprikosen-Rakia'), price: '1.79' },
      { name: L('Бургаска мускатова', 'Burgaska Muskatova', 'Burgaska Muskatova', 'Burgaska Muskatova'), price: '1.99' },
      { name: L('Бургас 63', 'Burgas 63', 'Burgas 63', 'Burgas 63'), price: '2.35' },
      { name: L('Бургас 63 Барел', 'Burgas 63 Barrel', 'Burgas 63 Butoi', 'Burgas 63 Fass'), price: '2.66' },
      { name: L('Мускатова ракия Аристократ', 'Muscat Rakia Aristocrat', 'Rachiu Muscat Aristocrat', 'Muskat-Rakia Aristocrat'), price: '2.97' },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}white-wine`,
    order: 905,
    name: L('Бели вина – 750 ml', 'White wines – 750 ml', 'Vinuri albe – 750 ml', 'Weißweine – 750 ml'),
    note: L(
      'Всяка чаша разказва история...',
      'Every glass tells a story...',
      'Fiecare pahar spune o poveste...',
      'Jedes Glas erzählt eine Geschichte...'
    ),
    items: [
      { name: L('POESIE Pinot Grigio delle Venezie DOC, Италия', 'POESIE Pinot Grigio delle Venezie DOC, Italy', 'POESIE Pinot Grigio delle Venezie DOC, Italia', 'POESIE Pinot Grigio delle Venezie DOC, Italien'), price: bgnToEur(22.90) },
      { name: L('LEVENT Traminer & Врачански Мискет, ВК Русе', 'LEVENT Traminer & Vrachanski Misket, Ruse Wine House', 'LEVENT Traminer & Vrachanski Misket, Casa de vinuri Ruse', 'LEVENT Traminer & Vrachanski Misket, Weingut Ruse'), price: bgnToEur(31.90) },
      { name: L('VARNA Riesling & Варненски Мискет, ВИ Варна', 'VARNA Riesling & Varnenski Misket, Varna Winery', 'VARNA Riesling & Varnenski Misket, Vinăria Varna', 'VARNA Riesling & Varnenski Misket, Weingut Varna'), price: bgnToEur(21.90) },
      { name: L('VARNA Riesling, ВИ Варна', 'VARNA Riesling, Varna Winery', 'VARNA Riesling, Vinăria Varna', 'VARNA Riesling, Weingut Varna'), price: bgnToEur(21.90) },
      { name: L('SILVER ANGEL Sauvignon Blanc, Midalidare Estate', 'SILVER ANGEL Sauvignon Blanc, Midalidare Estate', 'SILVER ANGEL Sauvignon Blanc, Midalidare Estate', 'SILVER ANGEL Sauvignon Blanc, Midalidare Estate'), price: bgnToEur(26.90) },
      { name: L('ELEGANCE Sauvignon Blanc, Josef Castan, Pays d\'Oc, Франция', 'ELEGANCE Sauvignon Blanc, Josef Castan, Pays d\'Oc, France', 'ELEGANCE Sauvignon Blanc, Josef Castan, Pays d\'Oc, Franța', 'ELEGANCE Sauvignon Blanc, Josef Castan, Pays d\'Oc, Frankreich'), price: bgnToEur(24.90) },
      { name: L('LES FUMEES BLANCHES Sauvignon Blanc, Fr. Lurton, Франция', 'LES FUMEES BLANCHES Sauvignon Blanc, Fr. Lurton, France', 'LES FUMEES BLANCHES Sauvignon Blanc, Fr. Lurton, Franța', 'LES FUMEES BLANCHES Sauvignon Blanc, Fr. Lurton, Frankreich'), price: bgnToEur(29.90) },
      { name: L('BABICH Sauvignon Blanc, Marlborough, Нова Зеландия', 'BABICH Sauvignon Blanc, Marlborough, New Zealand', 'BABICH Sauvignon Blanc, Marlborough, Noua Zeelandă', 'BABICH Sauvignon Blanc, Marlborough, Neuseeland'), price: bgnToEur(49.90) },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}rose-wine`,
    order: 906,
    name: L('Вина розе – 750 ml', 'Rosé wines – 750 ml', 'Vinuri rosé – 750 ml', 'Roséweine – 750 ml'),
    items: [
      { name: L('LEVENT Rosé, Винарска къща Русе', 'LEVENT Rosé, Ruse Wine House', 'LEVENT Rosé, Casa de vinuri Ruse', 'LEVENT Rosé, Weingut Ruse'), price: bgnToEur(31.90) },
      { name: L('ELEGANCE Rosé Syrah & Grenache, Pays d\'Oc, Франция', 'ELEGANCE Rosé from Syrah & Grenache, Pays d\'Oc, France', 'ELEGANCE Rosé Syrah & Grenache, Pays d\'Oc, Franța', 'ELEGANCE Rosé Syrah & Grenache, Pays d\'Oc, Frankreich'), price: bgnToEur(24.90) },
      { name: L('NO SAINTS Rosé, Santa Sarah Wine Estate', 'NO SAINTS Rosé, Santa Sarah Wine Estate', 'NO SAINTS Rosé, Santa Sarah Wine Estate', 'NO SAINTS Rosé, Santa Sarah Wine Estate'), price: bgnToEur(49.90) },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}red-wine`,
    order: 907,
    name: L('Червени вина – 750 ml', 'Red wines – 750 ml', 'Vinuri roșii – 750 ml', 'Rotweine – 750 ml'),
    note: L(
      'От слънчевите долини на България до класическите лозя на Италия и Франция – нашата винена колекция предлага нещо за всеки вкус, настроение и повод.',
      'From the sunny valleys of Bulgaria to the classic vineyards of Italy and France – our wine collection offers something for every taste, mood and occasion.',
      'De la văile însorite ale Bulgariei până la podgoriile clasice din Italia și Franța – colecția noastră de vinuri oferă ceva pentru fiecare gust, stare de spirit și ocazie.',
      'Von den sonnigen Tälern Bulgariens bis zu den klassischen Weinbergen Italiens und Frankreichs – unsere Weinkollektion bietet für jeden Geschmack, jede Stimmung und jeden Anlass etwas.'
    ),
    items: [
      { name: L('LAVA Merlot & Cabernet Sauvignon, Винарна Дамяница', 'LAVA Merlot & Cabernet Sauvignon, Damianitza Winery', 'LAVA Merlot & Cabernet Sauvignon, Vinăria Damianitza', 'LAVA Merlot & Cabernet Sauvignon, Weingut Damianitza'), price: bgnToEur(21.90) },
      { name: L('CHIFLIK LIVADI Merlot Organic, Chiflik Livadi', 'CHIFLIK LIVADI Merlot Organic, Chiflik Livadi', 'CHIFLIK LIVADI Merlot Organic, Chiflik Livadi', 'CHIFLIK LIVADI Merlot Organic, Chiflik Livadi'), price: bgnToEur(29.90) },
      { name: L('ORMANO Cabernet Sauvignon, Ormano', 'ORMANO Cabernet Sauvignon, Ormano', 'ORMANO Cabernet Sauvignon, Ormano', 'ORMANO Cabernet Sauvignon, Ormano'), price: bgnToEur(29.90) },
      {
        name: L('MIDALIDARE Merlot & Cabernet Franc, Midalidare Estate', 'MIDALIDARE Merlot & Cabernet Franc, Midalidare Estate', 'MIDALIDARE Merlot & Cabernet Franc, Midalidare Estate', 'MIDALIDARE Merlot & Cabernet Franc, Midalidare Estate'),
        quantity: L('750 мл. / 375 мл.', '750 ml / 375 ml', '750 ml / 375 ml', '750 ml / 375 ml'),
        price: bgnToEur(29.90),
        priceSecondary: bgnToEur(18.90),
      },
      {
        name: L('MIDALIDARE Cabernet Sauvignon & Petit Verdot, Midalidare Estate', 'MIDALIDARE Cabernet Sauvignon & Petit Verdot, Midalidare Estate', 'MIDALIDARE Cabernet Sauvignon & Petit Verdot, Midalidare Estate', 'MIDALIDARE Cabernet Sauvignon & Petit Verdot, Midalidare Estate'),
        quantity: L('750 мл. / 375 мл.', '750 ml / 375 ml', '750 ml / 375 ml', '750 ml / 375 ml'),
        price: bgnToEur(29.90),
        priceSecondary: bgnToEur(18.90),
      },
      { name: L('CARPE DIEM Syrah & Malbec & Cabernet Sauvignon, Midalidare Estate', 'CARPE DIEM Syrah & Malbec & Cabernet Sauvignon, Midalidare Estate', 'CARPE DIEM Syrah & Malbec & Cabernet Sauvignon, Midalidare Estate', 'CARPE DIEM Syrah & Malbec & Cabernet Sauvignon, Midalidare Estate'), price: bgnToEur(21.90) },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}small-wine`,
    order: 908,
    name: L('Вина малки бутилки', 'Small wine bottles', 'Vinuri în sticle mici', 'Kleine Weinflaschen'),
    items: [
      { name: L('POESIE Pinot Grigio delle Venezie DOC, Италия', 'POESIE Pinot Grigio delle Venezie DOC, Italy', 'POESIE Pinot Grigio delle Venezie DOC, Italia', 'POESIE Pinot Grigio delle Venezie DOC, Italien'), quantity: L('375 мл.', '375 ml', '375 ml', '375 ml'), price: bgnToEur(13.90) },
      { name: L('LES FUMEES BLANCHES Sauvignon Blanc, Fr. Lurton, Франция', 'LES FUMEES BLANCHES Sauvignon Blanc, Fr. Lurton, France', 'LES FUMEES BLANCHES Sauvignon Blanc, Fr. Lurton, Franța', 'LES FUMEES BLANCHES Sauvignon Blanc, Fr. Lurton, Frankreich'), quantity: L('375 мл.', '375 ml', '375 ml', '375 ml'), price: bgnToEur(18.90) },
      { name: L('BABICH Sauvignon Blanc, Marlborough, Нова Зеландия', 'BABICH Sauvignon Blanc, Marlborough, New Zealand', 'BABICH Sauvignon Blanc, Marlborough, Noua Zeelandă', 'BABICH Sauvignon Blanc, Marlborough, Neuseeland'), quantity: L('375 мл.', '375 ml', '375 ml', '375 ml'), price: bgnToEur(25.90) },
      { name: L('ORMANO Rosé от Мелник, Ormano', 'ORMANO Rose from Melnik, Ormano', 'ORMANO Rosé din Melnik, Ormano', 'ORMANO Rosé aus Melnik, Ormano'), quantity: L('375 мл.', '375 ml', '375 ml', '375 ml'), price: bgnToEur(16.90) },
      { name: L('ORMANO Cabernet Sauvignon, Ormano', 'ORMANO Cabernet Sauvignon, Ormano', 'ORMANO Cabernet Sauvignon, Ormano', 'ORMANO Cabernet Sauvignon, Ormano'), quantity: L('375 мл.', '375 ml', '375 ml', '375 ml'), price: bgnToEur(29.90) },
      { name: L('LAVA Merlot & Cabernet Sauvignon, Винарна Дамяница', 'LAVA Merlot & Cabernet Sauvignon, Damianitza Winery', 'LAVA Merlot & Cabernet Sauvignon, Vinăria Damianitza', 'LAVA Merlot & Cabernet Sauvignon, Weingut Damianitza'), quantity: L('375 мл.', '375 ml', '375 ml', '375 ml'), price: bgnToEur(11.90) },
      { name: L('ORMANO червено Cabernet Sauvignon, Ormano', 'ORMANO Red Cabernet Sauvignon, Ormano', 'ORMANO roșu Cabernet Sauvignon, Ormano', 'ORMANO Roter Cabernet Sauvignon, Ormano'), quantity: L('375 мл.', '375 ml', '375 ml', '375 ml'), price: bgnToEur(16.90) },
      { name: L('ALMA Sauvignon Blanc, Terra Mater, Чили', 'ALMA Sauvignon Blanc, Terra Mater, Chile', 'ALMA Sauvignon Blanc, Terra Mater, Chile', 'ALMA Sauvignon Blanc, Terra Mater, Chile'), quantity: L('187 мл.', '187 ml', '187 ml', '187 ml'), price: bgnToEur(7.90) },
      { name: L('ALMA Rosé от Merlot, Terra Mater, Чили', 'ALMA Rose from Merlot, Terra Mater, Chile', 'ALMA Rosé din Merlot, Terra Mater, Chile', 'ALMA Rosé aus Merlot, Terra Mater, Chile'), quantity: L('187 мл.', '187 ml', '187 ml', '187 ml'), price: bgnToEur(7.90) },
    ],
  },
  {
    id: `${DRINK_CATEGORY_PREFIX}wine-by-glass`,
    order: 909,
    name: L('Наливно вино', 'Wine by the glass', 'Vin la pahar', 'Offener Wein'),
    items: [
      {
        name: L('Raynoff – Мускат, Розе, Merlot', 'Raynoff – Muscat, Rosé, Merlot', 'Raynoff – Muscat, Rosé, Merlot', 'Raynoff – Muskat, Rosé, Merlot'),
        quantity: L('0.2 л.', '0.2 l', '0,2 l', '0,2 l'),
        price: '2.51',
      },
      {
        name: L('Raynoff – Мускат, Розе, Merlot', 'Raynoff – Muscat, Rosé, Merlot', 'Raynoff – Muscat, Rosé, Merlot', 'Raynoff – Muskat, Rosé, Merlot'),
        quantity: L('0.5 л.', '0.5 l', '0,5 l', '0,5 l'),
        price: '5.06',
      },
      {
        name: L('Raynoff – Мускат, Розе, Merlot', 'Raynoff – Muscat, Rosé, Merlot', 'Raynoff – Muscat, Rosé, Merlot', 'Raynoff – Muskat, Rosé, Merlot'),
        quantity: L('1 л.', '1 l', '1 l', '1 l'),
        price: '9.97',
      },
    ],
  },
];

export const getDrinkCategoryById = (id) =>
  drinkCategories.find((category) => category.id === id);
