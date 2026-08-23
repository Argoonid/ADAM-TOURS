import delphineShowImg from '../assets/tours/delphine_show.jpeg';
import vecherniiKruizImg from '../assets/tours/vechernii_kruiz.jpeg';
import safariImg from '../assets/tours/safari.jpeg';
import ekskursiaImg from '../assets/tours/ekskursia.jpeg';
import zapovednikImg from '../assets/tours/zapovednik.jpeg';
import akvaparkImg from '../assets/tours/akvapark.jpeg';

export type Language = 'ru' | 'en' | 'it';
export type LocalizedString = Record<Language, string>;

export interface LocalizedTourOption {
  name: LocalizedString;
  price: number;
}

export interface Tour {
  id: string;
  slug: string;
  title: LocalizedString;
  category: 'show' | 'sea' | 'safari' | 'historical';
  categoryLabel: LocalizedString;
  location: LocalizedString;
  duration: LocalizedString;
  priceAdult: number;
  priceChild: number;
  childAgeInfo: LocalizedString;

  // Опциональные поля расписания (знак ? убирает ошибки со всех объектов ниже)
  daysOfWeek?: number[]; // [0..6] дни недели (0 = Вс, 1 = Пн...)
  timeSlots?: string[];  // ['08:00'] или ['04:30', '15:30']
  maxCapacity?: number;  // Вместимость рейса (например, 15 или 25)

  schedule: LocalizedString;
  departureTime: LocalizedString;
  overview: LocalizedString;
  included: LocalizedString[];
  excluded?: LocalizedString[];
  whatToBring?: LocalizedString[];
  availableSeats?: number;
  featured?: boolean;
  images: string[];
  options?: LocalizedTourOption[];
}


export const TOURS_DATA: Tour[] = [
  // =========================================================================
  // 🏛️ 1. ИСТОРИЧЕСКИЕ И ВЫЕЗДНЫЕ ТУРЫ
  // =========================================================================
  {
    id: 'cairo-bus',
    slug: 'cairo-by-bus',
    title: {
      ru: 'Каир и Великие Пирамиды на автобусе (1 день)',
      en: 'Cairo & Pyramids by Bus (1 Day)',
      it: 'Il Cairo e Piramidi in Autobus (1 Giorno)'
    },
    category: 'historical',
    categoryLabel: { ru: 'Исторические туры', en: 'Historical Tours', it: 'Tour Storici' },
    location: { ru: 'Каир & Гиза', en: 'Cairo & Giza', it: 'Il Cairo e Giza' },
    duration: { ru: '1 день (~24 часа)', en: '1 day (~24 hrs)', it: '1 giorno (~24 ore)' },
    priceAdult: 65,
    priceChild: 40,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно, 6–11 лет — 40$', en: 'Under 5 free, 6-11 yrs — $40', it: 'Sotto 5 anni gratis, 6-11 — 40$' },
    schedule: { ru: 'Вс, Вт, Чт', en: 'Sun, Tue, Thu', it: 'Dom, Mar, Gio' },
    departureTime: { ru: '00:00 (Возвращение около 00:00)', en: '00:00', it: '00:00' },
    overview: {
      ru: 'Выезд в полночь на комфортабельном автобусе с кондиционером. Посещение Египетского национального музея (2 ч), великих Пирамид и Сфинкса (2 ч), обед (шведский стол), фабрика масел и музей папируса.',
      en: 'Comfortable bus journey to Cairo. Visit Egyptian National Museum, Great Pyramids & Sphinx, buffet lunch, perfumery, and papyrus museum.',
      it: 'Viaggio in bus al Cairo. Visita al Museo Egizio, Piramidi di Giza, Sfinge, pranzo a buffet e museo del papiro.'
    },
    included: [
      { ru: 'Трансфер из отеля на комфортабельном автобусе', en: 'A/C bus transfers', it: 'Trasferimenti in bus A/C' },
      { ru: 'Русскоговорящий гид-египтолог на всю экскурсию', en: 'Licensed Egyptologist guide', it: 'Guida egittologo' },
      { ru: 'Входные билеты в Египетский музей', en: 'Museum entrance tickets', it: 'Biglietti Museo Egizio' },
      { ru: 'Посещение плато Пирамид и Сфинкса', en: 'Pyramids & Sphinx visit', it: 'Visita Piramidi e Sfinge' },
      { ru: 'Обед «шведский стол» в ресторане', en: 'Buffet lunch', it: 'Pranzo a buffet' },
      { ru: 'Музей папируса и фабрика масел', en: 'Papyrus & perfume factories', it: 'Fabbrica di profumi e papiro' }
    ],
    excluded: [
      { ru: 'Напитки во время обеда', en: 'Drinks during lunch', it: 'Bevande al pranzo' },
      { ru: 'Вход внутрь пирамиды Хеопса', en: 'Entry inside Great Pyramid', it: 'Ingresso piramide' }
    ],
    whatToBring: [
      { ru: 'Оригинал паспорта (обязательно)', en: 'Original Passport', it: 'Passaporto originale' },
      { ru: 'Сухой паёк (заказать на ресепшене)', en: 'Breakfast box', it: 'Cestino colazione' },
      { ru: 'Вода и удобная обувь', en: 'Water & walking shoes', it: 'Acqua e scarpe comode' },
      { ru: 'Тёплая кофта для автобуса', en: 'Warm clothes for bus', it: 'Felpa per il bus' }
    ],
    availableSeats: 14,
    featured: true,
    images: [ekskursiaImg],
    options: [
      {
        name: { ru: 'Лодочная прогулка по Нилу (30 мин)', en: 'Nile boat ride (30 mins)', it: 'Giro in barca sul Nilo' },
        price: 10
      },
      {
        name: { ru: 'Входной билет внутрь Великой пирамиды Хеопса', en: 'Inside Great Pyramid ticket', it: 'Ingresso interno piramide' },
        price: 25
      }
    ]
  },
  {
    id: 'cairo-plane',
    slug: 'cairo-by-plane',
    title: {
      ru: 'Каир и Пирамиды на самолёте (1 день)',
      en: 'Cairo & Pyramids by Plane (1 Day)',
      it: 'Il Cairo e Piramidi in Aereo (1 Giorno)'
    },
    category: 'historical',
    categoryLabel: { ru: 'VIP / Авиатуры', en: 'VIP Flight Tours', it: 'VIP Tour in Aereo' },
    location: { ru: 'Каир & Гиза', en: 'Cairo & Giza', it: 'Il Cairo e Giza' },
    duration: { ru: '1 день (с 05:00 до 21:00)', en: '1 day (05:00-21:00)', it: '1 giorno (05:00-21:00)' },
    priceAdult: 215,
    priceChild: 195,
    childAgeInfo: { ru: 'Дети до 2 лет — 50$, 2–11 лет — 195$', en: 'Infants $50, 2-11 yrs $195', it: 'Neonati 50$, 2-11 anni 195$' },
    schedule: { ru: 'Пн, Ср, Сб', en: 'Mon, Wed, Sat', it: 'Lun, Mer, Sab' },
    departureTime: { ru: '05:00 — 21:00', en: '05:00 — 21:00', it: '05:00 — 21:00' },
    overview: {
      ru: 'Быстрый перелёт из Шарма в Каир (50 мин). Та же насыщенная программа без многочасовой дороги: музей, Пирамиды, Сфинкс, обед и индивидуальный трансфер.',
      en: 'Fast 50-minute flight. Maximum sightseeing time at Pyramids, Sphinx, National Museum with personal guide and lunch.',
      it: 'Volo rapido di 50 minuti per Il Cairo. Visita al Museo, Piramidi, Sfinge e pranzo senza lunghi viaggi in bus.'
    },
    included: [
      { ru: 'Авиабилеты Шарм — Каир — Шарм', en: 'Roundtrip flights', it: 'Voli a/r' },
      { ru: 'Все трансферы на микроавтобусе', en: 'All transfers', it: 'Tutti i trasferimenti' },
      { ru: 'Входные билеты в музей и к Пирамидам', en: 'All tickets included', it: 'Tutti i biglietti' },
      { ru: 'Русскоговорящий гид-египтолог', en: 'Licensed guide', it: 'Guida turistica' },
      { ru: 'Обед в ресторане', en: 'Restaurant lunch', it: 'Pranzo al ristorante' }
    ],
    availableSeats: 6,
    featured: false,
    images: ['https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Прогулка на моторной лодке по Нилу (30 мин)', en: 'Nile motorboat cruise (30 mins)', it: 'Giro in barca sul Nilo' },
        price: 10
      },
      {
        name: { ru: 'Входной билет внутрь пирамиды Хеопса', en: 'Inside Great Pyramid ticket', it: 'Ingresso piramide Cheope' },
        price: 25
      }
    ]
  },
  {
    id: 'luxor-plane',
    slug: 'luxor-by-plane',
    title: {
      ru: 'Луксор на самолёте — Древняя столица Фивы',
      en: 'Luxor by Plane — Ancient Thebes',
      it: 'Luxor in Aereo — Antica Tebe'
    },
    category: 'historical',
    categoryLabel: { ru: 'VIP / Авиатуры', en: 'VIP Flight Tours', it: 'VIP Tour in Aereo' },
    location: { ru: 'Луксор', en: 'Luxor', it: 'Luxor' },
    duration: { ru: '1 день (с 04:00 до 21:30)', en: '1 day (04:00-21:30)', it: '1 giorno (04:00-21:30)' },
    priceAdult: 225,
    priceChild: 205,
    childAgeInfo: { ru: 'Дети до 2 лет — 50$, 2–11 лет — 205$', en: 'Infants $50, 2-11 yrs $205', it: 'Neonati 50$, 2-11 anni 205$' },
    schedule: { ru: 'Вт, Чт, Вс', en: 'Tue, Thu, Sun', it: 'Mar, Gio, Dom' },
    departureTime: { ru: '04:00 (Вылет в 06:00)', en: '04:00 AM', it: '04:00' },
    overview: {
      ru: 'Вылет в Луксор (45 мин). Посещение Долины Царей (2 ч), храма царицы Хатшепсут (1 ч), Колоссов Мемнона, обед, переправа через Нил и величественный Карнакский храм (2 ч).',
      en: 'Fly to Luxor (45 mins). Valley of the Kings, Hatshepsut Temple, Colossi of Memnon, Nile crossing, buffet lunch, and Karnak Temple.',
      it: 'Volo a Luxor. Visita alla Valle dei Re, Tempio di Hatshepsut, Colossi di Memnone, traversata del Nilo e Tempio di Karnak.'
    },
    included: [
      { ru: 'Авиабилеты Шарм — Луксор — Шарм', en: 'Roundtrip flights', it: 'Voli a/r' },
      { ru: 'Все входные билеты по программе', en: 'All entry tickets', it: 'Tutti i biglietti' },
      { ru: 'Долина Царей, Храм Хатшепсут, Карнак', en: 'Valley of Kings, Hatshepsut & Karnak', it: 'Valle dei Re e templi' },
      { ru: 'Обед в ресторане на берегу Нила', en: 'Lunch on the Nile', it: 'Pranzo sul Nilo' },
      { ru: 'Русскоговорящий гид-египтолог', en: 'Licensed guide', it: 'Guida egittologo' }
    ],
    availableSeats: 6,
    featured: false,
    images: ['https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Прогулка на моторной лодке по Нилу (25 мин)', en: 'Nile motorboat trip (25 min)', it: 'Giro in barca sul Nilo' },
        price: 10
      },
      {
        name: { ru: 'Посещение Бананового острова на Ниле', en: 'Banana Island visit', it: 'Visita all’Isola delle Banane' },
        price: 10
      }
    ]
  },
  {
    id: 'jerusalem-1day',
    slug: 'jerusalem-1day',
    title: {
      ru: 'Иерусалим и Вифлеем (1 день)',
      en: 'Jerusalem & Bethlehem (1 Day)',
      it: 'Gerusalemme e Betlemme (1 Giorno)'
    },
    category: 'historical',
    categoryLabel: { ru: 'Паломнические туры', en: 'Pilgrimage Tours', it: 'Tour Religiosi' },
    location: { ru: 'Израиль & Палестина', en: 'Israel & Palestine', it: 'Israele e Palestina' },
    duration: { ru: '1 сутки (~26 часов)', en: '1 day (~26 hrs)', it: '1 giorno (~26 ore)' },
    priceAdult: 75,
    priceChild: 70,
    childAgeInfo: { ru: 'Единый детский тариф от 2 до 11 лет — 70$', en: 'Kids 2-11 yrs — $70', it: 'Bambini 2-11 anni — 70$' },
    schedule: { ru: 'Пн, Чт', en: 'Mon, Thu', it: 'Lun, Gio' },
    departureTime: { ru: '20:00 — 21:00 (Накануне)', en: '20:00 (Evening before)', it: '20:00 (Sera prima)' },
    overview: {
      ru: 'Трансфер до границы Таба. Купание в Мёртвом море, Масличная гора, Старый город, Храм Гроба Господня, Стена Плача, Вифлеем (Храм Рождества Христова) и обед.',
      en: 'Drive to border, Dead Sea floating, Mount of Olives, Via Dolorosa, Church of Holy Sepulchre, Western Wall, Bethlehem and lunch.',
      it: 'Viaggio a Gerusalemme, sosta al Mar Morto, Santo Sepolcro, Muro del Pianto, Betlemme e pranzo incluso.'
    },
    included: [
      { ru: 'Все трансферы и пограничные сборы', en: 'All border fees & transfers', it: 'Trasferimenti e tasse di frontiera' },
      { ru: 'Русскоязычный гид в Израиле', en: 'Guide in Jerusalem', it: 'Guida a Gerusalemme' },
      { ru: 'Купание в Мёртвом море', en: 'Dead Sea swim', it: 'Bagno nel Mar Morto' },
      { ru: 'Обед в ресторане', en: 'Lunch in restaurant', it: 'Pranzo al ristorante' }
    ],
    availableSeats: 10,
    featured: false,
    images: ['https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'petra-jordan',
    slug: 'petra-jordan-1day',
    title: {
      ru: 'Иордания — Скальный город Петра (1 день)',
      en: 'Jordan — Ancient Rock City of Petra (1 Day)',
      it: 'Giordania — Petra la Città di Roccia (1 Giorno)'
    },
    category: 'historical',
    categoryLabel: { ru: 'Чудеса Света', en: 'Wonders of the World', it: 'Meraviglie del Mondo' },
    location: { ru: 'Иордания (Петра)', en: 'Jordan (Petra)', it: 'Giordania (Petra)' },
    duration: { ru: '1 сутки (~22 часа)', en: '1 day (~22 hrs)', it: '1 giorno (~22 ore)' },
    priceAdult: 220,
    priceChild: 200,
    childAgeInfo: { ru: 'Дети до 2 лет — 40$, 2–11 лет — 200$', en: 'Under 2 — $40, 2-11 yrs — $200', it: 'Sotto 2 — 40$, 2-11 anni — 200$' },
    schedule: { ru: 'Вт, Пт', en: 'Tue, Fri', it: 'Mar, Ven' },
    departureTime: { ru: '02:30 ночи', en: '02:30 AM', it: '02:30' },
    overview: {
      ru: 'Выезд в порт Нувейба, паром в Акабу (2 ч) с видом на 3 страны. Каньон Сик (1200 м), сокровищница Эль-Хазна, амфитеатр, пещерный город и обед в отеле 5*.',
      en: 'Ferry to Aqaba, drive through Wadi Rum to Petra. Walk the Siq canyon to Al-Khazneh, Roman theater, cave tombs, and 5* hotel lunch.',
      it: 'Traghetto per Aqaba, gola del Siq, Al-Khazneh (il Tesoro), anfiteatro romano, tombe rupestri e pranzo 5*.'
    },
    included: [
      { ru: 'Паром Нувейба — Акаба — Нувейба', en: 'Roundtrip ferry tickets', it: 'Traghetto a/r' },
      { ru: 'Входной билет в заповедник Петра', en: 'Petra entrance ticket', it: 'Biglietto Petra' },
      { ru: 'Обед в отеле 5* (шведский стол)', en: '5-star hotel lunch', it: 'Pranzo hotel 5 stelle' },
      { ru: 'Русскоговорящий гид в Иордании', en: 'Licensed guide', it: 'Guida in Giordania' }
    ],
    availableSeats: 8,
    featured: false,
    images: ['https://images.unsplash.com/photo-1579606032822-e4299b80362f?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'petra-jerusalem-combo',
    slug: 'petra-jerusalem-2days',
    title: {
      ru: 'Комбо: Петра + Иерусалим (2 дня / 1 ночь)',
      en: 'Combo: Petra & Jerusalem (2 Days / 1 Night)',
      it: 'Combo: Petra e Gerusalemme (2 Giorni / 1 Notte)'
    },
    category: 'historical',
    categoryLabel: { ru: 'Гранд-туры', en: 'Grand Tours', it: 'Grandi Tour' },
    location: { ru: 'Иордания & Израиль', en: 'Jordan & Israel', it: 'Giordania e Israele' },
    duration: { ru: '2 дня / 1 ночь', en: '2 days / 1 night', it: '2 giorni / 1 notte' },
    priceAdult: 265,
    priceChild: 240,
    childAgeInfo: { ru: 'Дети 2–11 лет — 240$', en: 'Kids 2-11 yrs — $240', it: 'Bambini 2-11 anni — 240$' },
    schedule: { ru: 'По запросу', en: 'On request', it: 'Su richiesta' },
    departureTime: { ru: '20:00', en: '20:00', it: '20:00' },
    overview: {
      ru: 'Два величайших направления за одну поездку: 1-й день в Иерусалиме и Вифлееме с ужином и ночью в отеле, 2-й день — древняя Петра и возвращение в Шарм.',
      en: 'Two iconic countries in one journey: Day 1 in Jerusalem & Bethlehem with hotel night, Day 2 in Petra and ferry back.',
      it: 'Due paesi iconici: Giorno 1 a Gerusalemme con notte in hotel, Giorno 2 a Petra e rientro a Sharm.'
    },
    included: [
      { ru: 'Все трансферы, паромы и границы', en: 'All border fees & transfers', it: 'Tutti i trasporti e visti' },
      { ru: 'Ночь в отеле 3-4* в Иерусалиме + ужин и завтрак', en: 'Hotel night + dinner & breakfast', it: 'Hotel + cena e colazione' },
      { ru: 'Все входные билеты в Иерусалиме и Петре', en: 'All entrance tickets', it: 'Tutti i biglietti d’ingresso' }
    ],
    availableSeats: 6,
    featured: false,
    images: ['https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'st-catherine-monastery',
    slug: 'st-catherine-monastery',
    title: {
      ru: 'Монастырь Святой Екатерины & Дахаб',
      en: 'St. Catherine Monastery & Dahab',
      it: 'Monastero di Santa Caterina e Dahab'
    },
    category: 'historical',
    categoryLabel: { ru: 'Святые места', en: 'Sacred Places', it: 'Luoghi Sacri' },
    location: { ru: 'Синай & Дахаб', en: 'Sinai & Dahab', it: 'Sinai e Dahab' },
    duration: { ru: '9.5 часов', en: '9.5 hours', it: '9.5 ore' },
    priceAdult: 30,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 6 лет — бесплатно', en: 'Kids under 6 — free', it: 'Bambini sotto 6 anni — gratis' },
    schedule: { ru: 'Пн, Ср, Сб', en: 'Mon, Wed, Sat', it: 'Lun, Mer, Sab' },
    departureTime: { ru: '06:30 — 16:00', en: '06:30 — 16:00', it: '06:30 — 16:00' },
    overview: {
      ru: 'Древнейший действующий монастырь IV века: Неопалимая Купина, колодец Моисея, древняя базилика, подарок от монахов (серебряное кольцо), обед в Дахабе и шопинг.',
      en: 'Ancient 4th-century monastery: Burning Bush, Moses’ Well, ancient icons, blessing ring gift, buffet lunch in Dahab, and free time.',
      it: 'Monastero del IV secolo, Roveto Ardente, Pozzo di Mosè, anello benedetto in regalo, pranzo a Dahab e shopping.'
    },
    included: [
      { ru: 'Трансфер из отеля на автобусе', en: 'Hotel A/C bus transfer', it: 'Trasferimento bus A/C' },
      { ru: 'Вход на территорию монастыря', en: 'Monastery entry', it: 'Ingresso monastero' },
      { ru: 'Обед (шведский стол) в Дахабе', en: 'Buffet lunch in Dahab', it: 'Pranzo a buffet a Dahab' },
      { ru: 'Прогулка по городу Дахаб', en: 'Dahab city walk', it: 'Passeggiata a Dahab' }
    ],
    availableSeats: 15,
    featured: false,
    images: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'moses-mount-night',
    slug: 'moses-mount-sunrise',
    title: {
      ru: 'Гора Моисея: Восхождение на рассвет и монастырь',
      en: 'Mount Moses Sunrise Hike & Monastery',
      it: 'Monte Sinai all’Alba e Monastero'
    },
    category: 'historical',
    categoryLabel: { ru: 'Восхождение & Паломничество', en: 'Trekking & Pilgrimage', it: 'Trekking e Spiritualità' },
    location: { ru: 'Гора Синай (2285 м)', en: 'Mount Sinai (2285 m)', it: 'Monte Sinai (2285 m)' },
    duration: { ru: '16 часов (Ночной тур)', en: '16 hrs (Night tour)', it: '16 ore (Notturno)' },
    priceAdult: 35,
    priceChild: 25,
    childAgeInfo: { ru: 'Рекомендуется для детей от 10 лет', en: 'Recommended for age 10+', it: 'Consigliato da 10 anni' },
    schedule: { ru: 'Вт, Чт, Вс', en: 'Tue, Thu, Sun', it: 'Mar, Gio, Dom' },
    departureTime: { ru: '21:00 (Возвращение в 13:00)', en: '21:00', it: '21:00' },
    overview: {
      ru: 'Ночное восхождение с фонариком и бедуинским проводником на вершину Синая (2285 м). Встреча невероятного рассвета, спуск, посещение монастыря Св. Екатерины и завтрак.',
      en: 'Night trek with Bedouin guide to Mount Sinai summit (2285m). Watch sunrise, descend to visit St. Catherine Monastery, followed by restaurant breakfast.',
      it: 'Salita notturna al Monte Sinai con guida beduina, alba spettacolare in vetta, visita al monastero e colazione.'
    },
    included: [
      { ru: 'Трансфер из отеля и обратно', en: 'Bus transfers', it: 'Trasferimenti bus' },
      { ru: 'Бедуинский проводник на подъеме', en: 'Bedouin guide', it: 'Guida beduina' },
      { ru: 'Вход в монастырь Св. Екатерины', en: 'Monastery entry', it: 'Ingresso monastero' },
      { ru: 'Завтрак в ресторане после спуска', en: 'Breakfast included', it: 'Colazione inclusa' }
    ],
    availableSeats: 16,
    featured: false,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Аренда верблюда для подъема на 2/3 горы', en: 'Camel ride for 2/3 of mountain', it: 'Noleggio cammello per salita' },
        price: 20
      }
    ]
  },
  {
    id: 'individual-city-tour',
    slug: 'individual-city-tour',
    title: {
      ru: 'Индивидуальная обзорная экскурсия «Шарм глазами местных»',
      en: 'Private City Tour "Sharm Through Locals\' Eyes"',
      it: 'Tour Privato "Sharm vista dai locali"'
    },
    category: 'historical',
    categoryLabel: { ru: 'Обзорные & VIP', en: 'Sightseeing & VIP', it: 'Visite & VIP' },
    location: { ru: 'Шарм-эль-Шейх', en: 'Sharm El Sheikh', it: 'Sharm el-Sheikh' },
    duration: { ru: '3.5 часа', en: '3.5 hours', it: '3.5 ore' },
    priceAdult: 100,
    priceChild: 0,
    childAgeInfo: { ru: 'Тариф за авто (1–2 чел — 100$, 3–4 чел — 150$)', en: 'Per car (1-2 pax $100, 3-4 pax $150)', it: 'Per auto' },
    schedule: { ru: 'Индивидуально', en: 'On demand', it: 'Su richiesta' },
    departureTime: { ru: 'По согласованию', en: 'Flexible', it: 'Flessibile' },
    overview: {
      ru: 'Комфортабельное авто и персональный гид: Площадь Мира, Президентская мечеть, Коптский собор, мечеть Эль-Сахаба, Старый город, панорамная смотровая площадка и тростниковый сок.',
      en: 'Private car & guide: Peace Square, Presidential Mosque, Coptic Church, El Sahaba Mosque, Old Market, panoramic viewpoint, and fresh sugarcane juice.',
      it: 'Auto privata e guida: Piazza della Pace, Moschea El Sahaba, Chiesa Copta, Mercato Vecchio, punto panoramico e succo fresco.'
    },
    included: [
      { ru: 'Индивидуальный авто с кондиционером', en: 'Private A/C car', it: 'Auto privata A/C' },
      { ru: 'Персональный русскоговорящий гид', en: 'Personal guide', it: 'Guida privata' },
      { ru: 'Дегустация натурального сока тростника', en: 'Sugarcane juice tasting', it: 'Degustazione succo' },
      { ru: 'Помощь с фотосессией на локациях', en: 'Photo assistance', it: 'Assistenza foto' }
    ],
    availableSeats: 4,
    featured: false,
    images: [ekskursiaImg],
    options: [
      {
        name: { ru: 'Группа 3–4 человека (Доплата к тарифу)', en: 'Group 3-4 pax (Surcharge)', it: 'Gruppo 3-4 persone (Supplemento)' },
        price: 50
      }
    ]
  },

  // =========================================================================
  // 🏜️ 2. САФАРИ И ПУСТЫНЯ
  // =========================================================================
  {
    id: 'super-moto-safari',
    slug: 'super-moto-safari',
    title: {
      ru: 'Супер Мото-Сафари: Квадроциклы, Верблюды и Шоу',
      en: 'Super Moto Safari: Quad, Camels & Show',
      it: 'Super Moto Safari: Quad, Cammelli e Show'
    },
    category: 'safari',
    categoryLabel: { ru: 'Экстрим & Пустыня', en: 'Desert & Extreme', it: 'Deserto e Avventura' },
    location: { ru: 'Синайская пустыня', en: 'Sinai Desert', it: 'Deserto del Sinai' },
    duration: { ru: '5.5 часов', en: '5.5 hours', it: '5.5 ore' },
    priceAdult: 25,
    priceChild: 20,
    childAgeInfo: { ru: 'Дети на одном квадроцикле со взрослым — 20$', en: 'Child riding with adult — $20', it: 'Bambino con adulto — 20$' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '15:30 — 21:00', en: '15:30 — 21:00', it: '15:30 — 21:00' },
    overview: {
      ru: 'Инструктаж, 45 мин заезда на квадроциклах по дюнам к Долине Эхо, 30 мин катания на верблюдах, бедуинская деревня с ужином и шоу восточных танцев, затем ещё 45 мин катания на базу.',
      en: 'Briefing, 45 mins quad ride to Echo Valley, 30 mins camel ride, Bedouin village dinner with oriental folklore show, and 45 mins return ride.',
      it: '45 min di quad, Valle dell’Eco, 30 min in cammello, cena beduina con spettacolo e 45 min di guida al rientro.'
    },
    included: [
      { ru: 'Трансфер из отеля и обратно', en: 'Hotel pickup & drop-off', it: 'Trasferimenti hotel' },
      { ru: 'Катание на квадроциклах (два заезда по 45 мин)', en: 'Quad riding (2 sessions of 45 min)', it: 'Guida quad (2 sessioni)' },
      { ru: 'Катание на верблюдах (30 мин)', en: 'Camel ride (30 mins)', it: 'Giro in cammello (30 min)' },
      { ru: 'Ужин в бедуинской деревне + чай', en: 'Bedouin dinner & tea', it: 'Cena beduina e tè' },
      { ru: 'Шоу восточных танцев и Танура', en: 'Belly dance & Tanoura show', it: 'Spettacolo Tanoura e danza' }
    ],
    availableSeats: 18,
    featured: true,
    images: [safariImg],
    options: [
      {
        name: { ru: 'Замена на 2-местный Багги (за машину)', en: 'Upgrade to 2-seater Buggy', it: 'Passaggio a Buggy 2 posti' },
        price: 20
      },
      {
        name: { ru: 'Замена на 4-местный семейный Багги', en: 'Upgrade to 4-seater Family Buggy', it: 'Passaggio a Buggy 4 posti' },
        price: 40
      },
      {
        name: { ru: 'Комплект: Арафатка + Защитные очки', en: 'Scarf & Dust Goggles set', it: 'Sciarpa e Occhiali protettivi' },
        price: 3
      }
    ]
  },
  {
    id: 'quad-buggy-safari',
    slug: 'quad-bike-buggy-safari',
    title: {
      ru: 'Мото-сафари на квадроциклах (Single / Double) или Багги',
      en: 'Quad Bike & Buggy Desert Adventure',
      it: 'Safari in Quad o Buggy nel Deserto'
    },
    category: 'safari',
    categoryLabel: { ru: 'Драйв & Скорость', en: 'Speed & Dunes', it: 'Velocità e Dune' },
    location: { ru: 'Пустыня Шарма', en: 'Sharm Desert', it: 'Deserto di Sharm' },
    duration: { ru: '3 часа', en: '3 hours', it: '3 ore' },
    priceAdult: 20,
    priceChild: 15,
    childAgeInfo: { ru: 'Single (одиночный) — 20$, Double (двойной) — 30$', en: 'Single $20, Double $30', it: 'Singolo 20$, Doppio 30$' },
    schedule: { ru: 'Ежедневно (рассвет / закат)', en: 'Daily (Sunrise / Sunset)', it: 'Tutti i giorni' },
    departureTime: { ru: '04:30 или 15:30', en: '04:30 or 15:30', it: '04:30 o 15:30' },
    overview: {
      ru: 'Скоростной заезд на 4-колёсных квадроциклах или багги по Синайской пустыне. Остановка в ущелье, фотосессия на закате или рассвете и чаепитие в бедуинском шатре.',
      en: 'Exciting quad bike or buggy ride across Sinai dunes. Echo valley stop, sunset/sunrise photo stop, and Bedouin tent tea break.',
      it: 'Giro adrenalinico in quad o buggy nel deserto, sosta per foto all’alba o al tramonto e tè beduino.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento hotel' },
      { ru: 'Аренда квадроцикла / багги + шлем', en: 'Vehicle rental & helmet', it: 'Noleggio quad/buggy e casco' },
      { ru: 'Бедуинский чай в шатре', en: 'Bedouin tea', it: 'Tè beduino' }
    ],
    availableSeats: 20,
    featured: false,
    images: [safariImg],
    options: [
      {
        name: { ru: 'Двухместный квадроцикл (Double Quad)', en: 'Double Quad upgrade', it: 'Quad doppio' },
        price: 10
      },
      {
        name: { ru: 'Двухместный Багги (Buggy Double)', en: 'Double Buggy upgrade', it: 'Buggy 2 posti' },
        price: 20
      }
    ]
  },
  {
    id: 'canyon-blue-hole',
    slug: 'colored-canyon-blue-hole',
    title: {
      ru: 'Цветной Каньон + Голубая Дыра (Абу Галум, Дахаб)',
      en: 'Colored Canyon + Blue Hole (Dahab)',
      it: 'Canyon Colorato + Blue Hole (Dahab)'
    },
    category: 'safari',
    categoryLabel: { ru: 'Джип-сафари & Рифы', en: 'Jeep Safari & Reefs', it: 'Jeep Safari e Barriera' },
    location: { ru: 'Каньон & Заповедник Абу Галум', en: 'Canyon & Abu Galum', it: 'Canyon e Abu Galum' },
    duration: { ru: '9 часов', en: '9 hours', it: '9 ore' },
    priceAdult: 20,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно', en: 'Kids under 5 — free', it: 'Bambini sotto 5 anni gratis' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '08:00 — 17:00', en: '08:00 — 17:00', it: '08:00 — 17:00' },
    overview: {
      ru: 'Джип-сафари, бедуинский чай, пеший поход по Цветному каньону (1.5 ч), верблюды вдоль моря (20 мин), снорклинг в Голубой Дыре (1.5 ч), обед и шопинг в Дахабе.',
      en: 'Jeep safari, Bedouin village tea, 1.5 hrs hiking Colored Canyon, camel ride by the sea, snorkeling in legendary Blue Hole, lunch, and Dahab market.',
      it: 'Jeep safari, trekking nel Canyon Colorato (1.5 ore), cammello sul mare, snorkeling nel Blue Hole, pranzo e mercato di Dahab.'
    },
    included: [
      { ru: 'Джип 4х4 и русскоязычный гид', en: '4x4 Jeep & guide', it: 'Jeep 4x4 e guida' },
      { ru: 'Пеший тур по каньону', en: 'Canyon hiking', it: 'Trekking nel canyon' },
      { ru: 'Катание на верблюдах вдоль моря', en: 'Camel ride along sea', it: 'Giro in cammello sul mare' },
      { ru: 'Снорклинг в Голубой Дыре', en: 'Blue Hole snorkeling', it: 'Snorkeling Blue Hole' },
      { ru: 'Обед в ресторане на берегу', en: 'Seaside lunch', it: 'Pranzo sul mare' }
    ],
    availableSeats: 14,
    featured: true,
    images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Добавить заезд на квадроциклах (+Moto)', en: 'Add Quad Bike ride (+Moto)', it: 'Aggiungi quad (+Moto)' },
        price: 10
      },
      {
        name: { ru: 'Аренда маски с трубкой и ласт', en: 'Mask, snorkel & fins rental', it: 'Noleggio maschera e pinne' },
        price: 5
      },
      {
        name: { ru: 'Аренда гидрокостюма', en: 'Wetsuit rental', it: 'Noleggio muta' },
        price: 5
      }
    ]
  },
  {
    id: 'colored-canyon-nuweiba',
    slug: 'colored-canyon-nuweiba',
    title: {
      ru: 'Грандиозный Каньон Цветов в Нувейбе',
      en: 'Grand Colored Canyon in Nuweiba',
      it: 'Grande Canyon Colorato di Nuweiba'
    },
    category: 'safari',
    categoryLabel: { ru: 'Джип-туры & Треккинг', en: 'Jeep & Trekking', it: 'Jeep e Trekking' },
    location: { ru: 'Нувейба & Синай', en: 'Nuweiba & Sinai', it: 'Nuweiba e Sinai' },
    duration: { ru: '8.5 часов', en: '8.5 hours', it: '8.5 ore' },
    priceAdult: 35,
    priceChild: 20,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно', en: 'Kids under 5 free', it: 'Bambini sotto 5 gratis' },
    schedule: { ru: 'Вт, Чт, Сб', en: 'Tue, Thu, Sat', it: 'Mar, Gio, Sab' },
    departureTime: { ru: '07:30 — 16:00', en: '07:30 — 16:00', it: '07:30 — 16:00' },
    overview: {
      ru: 'Ранний выезд на джипе в Нувейбу. Захватывающий 2-часовой поход по цветным скальным ущельям на глубине 250 м ниже уровня моря, купание, обед и шопинг в Дахабе.',
      en: 'Jeep trip to Nuweiba. 2 hours hiking through natural rainbow rock formations 250m below sea level, seaside lunch, swimming and Dahab shopping.',
      it: 'Viaggio in jeep a Nuweiba, 2 ore di cammino nelle gole rocciose multicolori, pranzo sul mare e sosta a Dahab.'
    },
    included: [
      { ru: 'Джип 4х4 на весь день', en: '4x4 Jeep transport', it: 'Trasporto jeep 4x4' },
      { ru: 'Гид-инструктор по каньону', en: 'Canyon guide', it: 'Guida per il canyon' },
      { ru: 'Обед в бедуинском ресторане', en: 'Bedouin lunch', it: 'Pranzo beduino' },
      { ru: 'Свободное время в Дахабе', en: 'Dahab free time', it: 'Tempo libero a Dahab' }
    ],
    availableSeats: 12,
    featured: false,
    images: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Аренда маски и трубки для плавания', en: 'Mask & snorkel rental', it: 'Noleggio maschera e boccaglio' },
        price: 5
      }
    ]
  },
  {
    id: 'super-safari-catherine-canyon',
    slug: 'super-safari-catherine-canyon',
    title: {
      ru: 'Супер Сафари: Монастырь Св. Екатерины + Каньон + Дахаб',
      en: 'Super Safari: St. Catherine + Canyon + Dahab',
      it: 'Super Safari: Santa Caterina + Canyon + Dahab'
    },
    category: 'safari',
    categoryLabel: { ru: 'Комбо-туры', en: 'Combo Tours', it: 'Tour Combinati' },
    location: { ru: 'Синай, Каньон & Дахаб', en: 'Sinai, Canyon & Dahab', it: 'Sinai, Canyon e Dahab' },
    duration: { ru: '10 часов', en: '10 hours', it: '10 ore' },
    priceAdult: 45,
    priceChild: 25,
    childAgeInfo: { ru: 'Дети до 6 лет — бесплатно', en: 'Kids under 6 free', it: 'Sotto 6 anni gratis' },
    schedule: { ru: 'Ср, Сб', en: 'Wed, Sat', it: 'Mer, Sab' },
    departureTime: { ru: '06:00 — 17:00', en: '06:00 — 17:00', it: '06:00 — 17:00' },
    overview: {
      ru: 'Максимальный комбинированный тур: утреннее посещение монастыря Св. Екатерины, переезд на джипах в Каньон Цветов, бедуинский чай, обед и прогулка по Дахабу.',
      en: 'Ultimate combo: morning visit to St. Catherine Monastery, 4x4 jeep to Colored Canyon, Bedouin tea break, seaside lunch, and Dahab city tour.',
      it: 'Tour completo: visita al monastero di Santa Caterina, jeep per il Canyon Colorato, tè beduino, pranzo e visita di Dahab.'
    },
    included: [
      { ru: 'Джип 4х4 и трансферы', en: '4x4 Jeep transfers', it: 'Trasferimenti in jeep' },
      { ru: 'Вход в монастырь Св. Екатерины', en: 'Monastery entry', it: 'Ingresso monastero' },
      { ru: 'Экскурсия по каньону', en: 'Canyon tour', it: 'Visita del canyon' },
      { ru: 'Обед в ресторане', en: 'Lunch included', it: 'Pranzo incluso' }
    ],
    availableSeats: 10,
    featured: false,
    images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Добавить заезд на квадроциклах (+Moto)', en: 'Add Quad Bike ride (+Moto)', it: 'Aggiungi quad (+Moto)' },
        price: 10
      }
    ]
  },
  {
    id: 'horse-riding-beach',
    slug: 'horse-riding-beach',
    title: {
      ru: 'Прогулка на арабских лошадях по пляжу и пустыне',
      en: 'Arabian Horse Riding on Beach & Desert',
      it: 'Passeggiata a Cavallo sulla Spiaggia e Deserto'
    },
    category: 'safari',
    categoryLabel: { ru: 'Романтика & Лошади', en: 'Romance & Horses', it: 'Cavalli e Natura' },
    location: { ru: 'Шарм-эль-Шейх', en: 'Sharm El Sheikh', it: 'Sharm el-Sheikh' },
    duration: { ru: '1–2 часа', en: '1–2 hours', it: '1–2 ore' },
    priceAdult: 25,
    priceChild: 20,
    childAgeInfo: { ru: 'Подходит для детей и взрослых любого уровня', en: 'All skill levels', it: 'Tutti i livelli' },
    schedule: { ru: 'Ежедневно (в любое время)', en: 'Daily (Flexible)', it: 'Tutti i giorni' },
    departureTime: { ru: 'Рассвет или 16:00 (закат)', en: 'Sunrise / Sunset (16:00)', it: 'Alba / Tramonto (16:00)' },
    overview: {
      ru: 'Верховая езда на чистокровных арабских лошадях по кромке морского прибоя или по песчаным дюнам под руководством профессионального берейтора.',
      en: 'Scenic horseback riding on well-trained Arabian horses along the Red Sea beach line or sunset desert dunes with instructor.',
      it: 'Passeggiata a cavallo sulla spiaggia o tra le dune del deserto con istruttore dedicato.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento hotel' },
      { ru: 'Аренда лошади и защитной экипировки', en: 'Horse rental & helmet', it: 'Cavallo e casco' },
      { ru: 'Инструктор-сопровождающий', en: 'Personal instructor', it: 'Istruttore' }
    ],
    availableSeats: 8,
    featured: false,
    images: ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Продлить катание до 2 часов', en: 'Extend ride to 2 hours', it: 'Prolunga a 2 ore' },
        price: 15
      }
    ]
  },
  {
    id: 'camel-riding-desert',
    slug: 'camel-riding-desert',
    title: {
      ru: 'Прогулка на верблюдах по пустыне (1 час)',
      en: 'Desert Camel Riding Experience (1 Hour)',
      it: 'Giro in Cammello nel Deserto (1 Ora)'
    },
    category: 'safari',
    categoryLabel: { ru: 'Аутентичный Синай', en: 'Authentic Sinai', it: 'Tradizione nel Deserto' },
    location: { ru: 'Пустыня Шарма', en: 'Sharm Desert', it: 'Deserto di Sharm' },
    duration: { ru: '2 часа', en: '2 hours', it: '2 ore' },
    priceAdult: 15,
    priceChild: 10,
    childAgeInfo: { ru: 'Дети до 5 лет с родителем — бесплатно', en: 'Under 5 with adult — free', it: 'Sotto 5 anni gratis' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: 'Утро или 16:00', en: 'Morning or 16:00', it: 'Mattina o 16:00' },
    overview: {
      ru: 'Неспешная колоритная прогулка на верблюдах по ущельям Синая, фотосессия в бедуинских нарядах и традиционный чай из трав.',
      en: 'Gentle camel trekking across Sinai desert valleys, authentic photo opportunities, and Bedouin herbal tea.',
      it: 'Passeggiata tradizionale in cammello nel deserto del Sinai con foto e tè beduino.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento hotel' },
      { ru: 'Аренда верблюда (1 час катания)', en: '1 hour camel ride', it: '1 ora di giro in cammello' },
      { ru: 'Бедуинский чай', en: 'Bedouin tea', it: 'Tè beduino' }
    ],
    availableSeats: 12,
    featured: false,
    images: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'star-gazing-astronomy',
    slug: 'star-gazing-desert-telescope',
    title: {
      ru: 'Звездопад в пустыне и наблюдение в телескоп (Star Gazing)',
      en: 'Desert Star Gazing & Professional Telescope',
      it: 'Osservazione delle Stelle con Telescopio nel Deserto'
    },
    category: 'safari',
    categoryLabel: { ru: 'Астрономия & Ночь', en: 'Astronomy & Night', it: 'Astronomia e Stelle' },
    location: { ru: 'Синайская пустыня', en: 'Sinai Desert', it: 'Deserto del Sinai' },
    duration: { ru: '4 часа', en: '4 hours', it: '4 ore' },
    priceAdult: 15,
    priceChild: 10,
    childAgeInfo: { ru: 'Дети до 6 лет — бесплатно', en: 'Kids under 6 free', it: 'Sotto 6 anni gratis' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '18:00 — 22:00', en: '18:00 — 22:00', it: '18:00 — 22:00' },
    overview: {
      ru: 'Вечер вдали от огней города. Наблюдение планет, кратеров Луны и созвездий через мощный профессиональный телескоп с рассказом астронома, чай и восточные сладости.',
      en: 'Night in the dark desert. Observe Moon craters, Saturn rings, and distant galaxies through high-powered telescope with astronomer guide, tea and sweets.',
      it: 'Osservazione di pianeti e costellazioni con telescopio professionale nel deserto con spiegazione dell’astronomo e tè.'
    },
    included: [
      { ru: 'Трансфер из отеля и обратно', en: 'Hotel transfers', it: 'Trasferimenti hotel' },
      { ru: 'Лекция астронома и работа с телескопом', en: 'Telescope viewing & astronomer', it: 'Telescopio e guida astronomo' },
      { ru: 'Бедуинский чай и угощения', en: 'Bedouin tea & snacks', it: 'Tè beduino e snack' }
    ],
    availableSeats: 15,
    featured: false,
    images: ['https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Традиционный кальян в шатре', en: 'Traditional Shisha (Hookah)', it: 'Narghilè tradizionale' },
        price: 5
      }
    ]
  },
  {
    id: 'vip-bedouin-dinner',
    slug: 'vip-bedouin-dinner-show',
    title: {
      ru: 'VIP Бедуинский ужин при свечах под звёздами',
      en: 'VIP Candlelit Bedouin Dinner under Stars',
      it: 'Cena Beduina VIP a Lume di Candela'
    },
    category: 'safari',
    categoryLabel: { ru: 'Аутентичный вечер', en: 'Authentic Evening', it: 'Serata Tradizionale' },
    location: { ru: 'Бедуинский оазис', en: 'Bedouin Oasis', it: 'Oasi Beduina' },
    duration: { ru: '4 часа', en: '4 hours', it: '4 ore' },
    priceAdult: 25,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно, 6–11 лет — 15$', en: 'Under 5 free, 6-11 yrs $15', it: 'Sotto 5 gratis, 6-11 anni 15$' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '18:30 — 22:30', en: '18:30 — 22:30', it: '18:30 — 22:30' },
    overview: {
      ru: 'Атмосферный вечер в пустынном шатре при свечах. Традиционный ужин на углях (мясо, курица, рис, бедуинский хлеб, салаты), восточная музыка, шоу с огнем и кальян.',
      en: 'Romantic candlelit evening in Bedouin camp. Charcoal BBQ dinner (kofta, chicken, fresh flatbread), oriental fire show, live music, and shisha.',
      it: 'Cena romantica a lume di candela in tenda beduina con grigliata mista, spettacolo di fuoco, musica e narghilè.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel pickup & drop-off', it: 'Trasferimenti hotel' },
      { ru: 'Праздничный бедуинский ужин BBQ', en: 'Full BBQ dinner', it: 'Cena BBQ completa' },
      { ru: 'Шоу программа (огненное шоу, фольклор)', en: 'Fire & folklore show', it: 'Spettacolo con fuoco e folklore' }
    ],
    availableSeats: 20,
    featured: false,
    images: ['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Трансфер на квадроциклах до деревни', en: 'Quad bike transfer to camp', it: 'Trasferimento in quad' },
        price: 10
      }
    ]
  },

  // =========================================================================
  // 🌊 3. МОРСКИЕ ПРОГУЛКИ И ДАЙВИНГ
  // =========================================================================
  {
    id: 'white-island-yacht',
    slug: 'white-island-ras-mohammed-vip',
    title: {
      ru: 'Белый Остров + Рас Мохаммед на VIP-яхте',
      en: 'White Island & Ras Mohammed VIP Yacht Cruise',
      it: 'Isola Bianca e Ras Mohammed in Yacht VIP'
    },
    category: 'sea',
    categoryLabel: { ru: 'Морские круизы', en: 'Sea Cruises', it: 'Crociere in Yacht' },
    location: { ru: 'Заповедник Рас-Мохаммед', en: 'Ras Mohammed Marine Park', it: 'Parco di Ras Mohammed' },
    duration: { ru: '8.5 часов', en: '8.5 hours', it: '8.5 ore' },
    priceAdult: 25,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно, 6–10 лет — 15$', en: 'Under 5 free, 6-10 yrs $15', it: 'Sotto 5 gratis, 6-10 anni 15$' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '08:00 — 16:30', en: '08:00 — 16:30', it: '08:00 — 16:30' },
    overview: {
      ru: 'Морской круиз к Египетским Мальдивам (песчаный Белый остров). 3 остановки для плавания у красивейших рифов с русскоязычными инструкторами, обед (шведский стол) и напитки.',
      en: 'Luxury yacht cruise to Egyptian Maldives (White Island). 3 coral reef snorkeling stops with marine guides, seafood lunch buffet, and unlimited soft drinks.',
      it: 'Crociera in yacht verso l’Isola Bianca, 3 soste snorkeling nei reef, pranzo a buffet con pesce e bevande illimitate.'
    },
    included: [
      { ru: 'Трансфер из отеля в порт и обратно', en: 'Port transfers', it: 'Trasferimenti porto' },
      { ru: 'Высадка на Белый Остров', en: 'White Island stop', it: 'Sosta all’Isola Bianca' },
      { ru: '3 остановки на рифах для снорклинга', en: '3 snorkeling stops', it: '3 soste per snorkeling' },
      { ru: 'Обед (шведский стол) + морепродукты', en: 'Buffet lunch with seafood', it: 'Pranzo a buffet con pesce' },
      { ru: 'Безалкогольные напитки без ограничений', en: 'Unlimited soft drinks', it: 'Bevande illimitate' }
    ],
    availableSeats: 25,
    featured: true,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: '1 Погружение с аквалангом (Дайвинг с инструктором)', en: '1 Intro Scuba Dive with Instructor', it: '1 Immersione Subacquea' },
        price: 15
      },
      {
        name: { ru: '2 Погружения с аквалангом на разных рифах', en: '2 Scuba Dives on different reefs', it: '2 Immersioni su reef diversi' },
        price: 25
      },
      {
        name: { ru: 'Аренда комплекта: маска, трубка, ласты', en: 'Snorkeling equipment set rental', it: 'Noleggio kit snorkeling' },
        price: 5
      },
      {
        name: { ru: 'Аренда спасательного жилета для плавания', en: 'Life vest rental', it: 'Noleggio giubbotto di salvataggio' },
        price: 3
      }
    ]
  },
  {
    id: 'ras-mohammed-boat',
    slug: 'ras-mohammed-by-boat',
    title: {
      ru: 'Морской круиз в заповедник Рас-Мохаммед (3 рифа)',
      en: 'Ras Mohammed National Park by Boat (3 Reefs)',
      it: 'Parco Marino Ras Mohammed in Barca (3 Barriere)'
    },
    category: 'sea',
    categoryLabel: { ru: 'Дайвинг & Снорклинг', en: 'Diving & Snorkeling', it: 'Snorkeling e Immersioni' },
    location: { ru: 'Рас-Мохаммед', en: 'Ras Mohammed', it: 'Ras Mohammed' },
    duration: { ru: '8 часов', en: '8 hours', it: '8 ore' },
    priceAdult: 30,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно', en: 'Kids under 5 free', it: 'Sotto 5 anni gratis' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '08:00 — 16:00', en: '08:00 — 16:00', it: '08:00 — 16:00' },
    overview: {
      ru: 'Полный день в открытом море. 3 остановки у уникальных коралловых садов заповедника Рас-Мохаммед, богатый обед на борту яхты и профессиональные гиды.',
      en: 'Full day at sea. 3 snorkeling stops at unique coral gardens of Ras Mohammed marine park with lunch buffet on board.',
      it: 'Giornata in mare con 3 soste nei giardini di corallo di Ras Mohammed e pranzo a buffet a bordo.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento hotel' },
      { ru: 'Круиз на яхте', en: 'Yacht cruise', it: 'Crociera in yacht' },
      { ru: '3 остановки для снорклинга', en: '3 snorkeling stops', it: '3 soste snorkeling' },
      { ru: 'Обед и прохладительные напитки', en: 'Lunch & drinks', it: 'Pranzo e bevande' }
    ],
    availableSeats: 20,
    featured: false,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: '1 Погружение с аквалангом (Дайвинг)', en: '1 Intro Scuba Dive', it: '1 Immersione Subacquea' },
        price: 15
      },
      {
        name: { ru: 'Аренда маски с трубкой и ласт', en: 'Mask, snorkel & fins rental', it: 'Noleggio maschera e pinne' },
        price: 5
      }
    ]
  },
  {
    id: 'tiran-island-yacht',
    slug: 'tiran-island-snorkeling-diving',
    title: {
      ru: 'Остров Тиран и затонувший корабль на яхте',
      en: 'Tiran Island & Shipwreck Yacht Cruise',
      it: 'Isola di Tiran e Relitto in Yacht'
    },
    category: 'sea',
    categoryLabel: { ru: 'Морские прогулки', en: 'Sea Cruises', it: 'Gite in Barca' },
    location: { ru: 'Пролив острова Тиран', en: 'Straits of Tiran', it: 'Stretto di Tiran' },
    duration: { ru: '8 часов', en: '8 hours', it: '8 ore' },
    priceAdult: 25,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно', en: 'Under 5 free', it: 'Sotto 5 gratis' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '08:00 — 16:30', en: '08:00 — 16:30', it: '08:00 — 16:30' },
    overview: {
      ru: 'Круиз в сторону пролива острова Тиран. 3 остановки на рифах Gordon, Jackson, осмотр севшего на мель затонувшего судна «Lara», вкусный обед и дайвинг.',
      en: 'Cruise towards Straits of Tiran. 3 stops at Jackson/Gordon reefs, view of the famous Lara shipwreck, and buffet lunch.',
      it: 'Crociera verso l’Isola di Tiran, 3 soste sui reef Jackson e Gordon, vista del relitto Lara e pranzo a bordo.'
    },
    included: [
      { ru: 'Трансфер из отеля в порт и обратно', en: 'Port transfers', it: 'Trasferimenti porto' },
      { ru: 'Круиз на комфортабельной яхте', en: 'Yacht cruise', it: 'Crociera in yacht' },
      { ru: '3 остановки на рифах острова Тиран', en: '3 reef stops', it: '3 soste reef' },
      { ru: 'Обед (шведский стол) + напитки', en: 'Buffet lunch & drinks', it: 'Pranzo a buffet e bevande' }
    ],
    availableSeats: 20,
    featured: false,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: '1 Погружение с аквалангом (Дайвинг)', en: '1 Scuba Dive with Instructor', it: '1 Immersione Subacquea' },
        price: 15
      },
      {
        name: { ru: 'Аренда маски и ласт', en: 'Mask & fins rental', it: 'Noleggio maschera e pinne' },
        price: 5
      }
    ]
  },
  {
    id: 'ras-mohammed-bus',
    slug: 'ras-mohammed-land-bus',
    title: {
      ru: 'Заповедник Рас Мохаммед на автобусе (Полудневный)',
      en: 'Ras Mohammed National Park by Bus',
      it: 'Parco di Ras Mohammed in Bus (Mezza Giornata)'
    },
    category: 'sea',
    categoryLabel: { ru: 'Заповедники & Снорклинг', en: 'National Parks & Reefs', it: 'Parchi Naturali e Mare' },
    location: { ru: 'Заповедник Рас-Мохаммед', en: 'Ras Mohammed Park', it: 'Parco Ras Mohammed' },
    duration: { ru: '5.5 часов', en: '5.5 hours', it: '5.5 ore' },
    priceAdult: 23,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 6 лет — бесплатно', en: 'Kids under 6 free', it: 'Sotto 6 anni gratis' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '08:00 — 13:30', en: '08:00 — 13:30', it: '08:00 — 13:30' },
    overview: {
      ru: 'Сухопутная экскурсия: Ворота Аллаха, мангровые рощи (опресняющие воду), тектонический разлом после землетрясения, купание в Озере Желаний и снорклинг.',
      en: 'Land tour to Ras Mohammed: Allah’s Gate, Mangrove forest, earthquake fault line, Magic Lake swimming, and beach snorkeling stop.',
      it: 'Tour terrestre a Ras Mohammed: Porta di Allah, mangrovie, faglia sismica, Lago Magico e snorkeling.'
    },
    included: [
      { ru: 'Трансфер на микроавтобусе с кондиционером', en: 'Hotel A/C minibus transfer', it: 'Trasferimento minibus' },
      { ru: 'Входные билеты в национальный заповедник', en: 'Park entry ticket', it: 'Biglietto parco' },
      { ru: 'Русскоговорящий гид', en: 'Licensed guide', it: 'Guida turistica' },
      { ru: 'Все остановки и купание в Озере Желаний', en: 'All stops & Magic Lake', it: 'Tutte le tappe e Lago Magico' }
    ],
    availableSeats: 14,
    featured: false,
    images: [zapovednikImg],
    options: [
      {
        name: { ru: 'Аренда маски, трубки и ласт в дайвинг-центре', en: 'Mask, snorkel & fins rental', it: 'Noleggio kit snorkeling' },
        price: 5
      },
      {
        name: { ru: 'Аренда гидрокостюма', en: 'Wetsuit rental', it: 'Noleggio muta termica' },
        price: 5
      }
    ]
  },
  {
    id: 'nautilus-catamaran',
    slug: 'nautilus-luxury-catamaran',
    title: {
      ru: 'Круизный 4-палубный катамаран Nautilus VIP',
      en: 'Nautilus 4-Deck VIP Cruise Catamaran',
      it: 'Catamarano Nautilus VIP a 4 Ponti'
    },
    category: 'sea',
    categoryLabel: { ru: 'Премиум круизы', en: 'Luxury Cruises', it: 'Crociere di Lusso' },
    location: { ru: 'Заповедник Рас-Мохаммед', en: 'Ras Mohammed', it: 'Ras Mohammed' },
    duration: { ru: '6 часов', en: '6 hours', it: '6 ore' },
    priceAdult: 50,
    priceChild: 25,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно, до 11 лет — 25$', en: 'Under 5 free, 5-11 yrs $25', it: 'Sotto 5 gratis, 5-11 anni 25$' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '09:00 — 15:00', en: '09:00 — 15:00', it: '09:00 — 15:00' },
    overview: {
      ru: '36-метровый круизный катамаран класса люкс: подводные смотровые залы «Взгляд Нептуна», ресторан «Капитанский стол», джакузи на палубе «Скай Дек» и изысканный обед.',
      en: '36-meter 4-deck luxury catamaran: underwater observation salon "Neptune’s View", Captain’s Table restaurant, sun deck with jacuzzis, and gourmet lunch.',
      it: 'Catamarano di lusso a 4 ponti: salone sottomarino panoramico, ristorante, idromassaggio sul ponte e pranzo gourmet.'
    },
    included: [
      { ru: 'VIP трансфер из отеля', en: 'VIP transfers', it: 'Trasferimenti VIP' },
      { ru: 'Круиз на 4-палубном катамаране', en: '4-deck catamaran cruise', it: 'Crociera in catamarano' },
      { ru: 'Подводный смотровой зал', en: 'Underwater salon access', it: 'Accesso salone sottomarino' },
      { ru: 'Обед от шеф-повара + напитки', en: 'Chef lunch & drinks', it: 'Pranzo gourmet e bevande' }
    ],
    availableSeats: 15,
    featured: false,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: '1 Погружение с аквалангом (Дайвинг)', en: '1 Scuba Dive', it: '1 Immersione' },
        price: 20
      }
    ]
  },
  {
    id: 'seascope-submarine',
    slug: 'seascope-semi-submarine',
    title: {
      ru: 'Батискаф Seascope (Полуподводная лодка)',
      en: 'Seascope Semi-Submarine Glass Boat',
      it: 'Semi-Sottomarino Seascope'
    },
    category: 'sea',
    categoryLabel: { ru: 'Для всей семьи', en: 'Family Tours', it: 'Per Famiglie' },
    location: { ru: 'Рифы Шарм-эль-Шейха', en: 'Sharm Coral Reefs', it: 'Reef di Sharm' },
    duration: { ru: '2.5 часа', en: '2.5 hours', it: '2.5 ore' },
    priceAdult: 30,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 4 лет — бесплатно, до 10 лет — 15$', en: 'Under 4 free, 4-10 yrs $15', it: 'Sotto 4 gratis, 4-10 anni 15$' },
    schedule: { ru: 'Ежедневно (09:00, 11:00, 13:00)', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: 'Каждые 2 часа', en: 'Every 2 hours', it: 'Ogni 2 ore' },
    overview: {
      ru: 'Погружение на глубину 3 метров в подводной капсуле с большими панорамными стеклами. Идеальный обзор ярких кораллов и сотен видов рыб без погружения в воду.',
      en: 'Descend 3 meters underwater in air-conditioned submarine deck with large glass windows. Watch colorful corals and marine life while staying dry.',
      it: 'Immersione a 3 metri di profondità con grandi vetrate panoramiche per ammirare coralli e pesci tropicali all’asciutto.'
    },
    included: [
      { ru: 'Трансфер из отеля и обратно', en: 'Hotel transfers', it: 'Trasferimenti hotel' },
      { ru: 'Билет на батискаф (1.5 часа круиза)', en: 'Submarine cruise ticket (1.5 hrs)', it: 'Biglietto sottomarino (1.5 ore)' },
      { ru: 'Безалкогольный напиток', en: 'Soft drink', it: 'Bevanda inclusa' }
    ],
    availableSeats: 20,
    featured: false,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'glass-boat-trip',
    slug: 'glass-bottom-boat',
    title: {
      ru: 'Лодка с прозрачным стеклянным дном (Glass Boat)',
      en: 'Glass Bottom Boat Excursion',
      it: 'Barca con Fondo di Vetro (Glass Boat)'
    },
    category: 'sea',
    categoryLabel: { ru: 'Прогулки для детей', en: 'Kids & Family', it: 'Per Bambini' },
    location: { ru: 'Бухта Наама Бэй', en: 'Naama Bay', it: 'Naama Bay' },
    duration: { ru: '1.5 часа', en: '1.5 hours', it: '1.5 ore' },
    priceAdult: 15,
    priceChild: 10,
    childAgeInfo: { ru: 'Дети до 4 лет — бесплатно', en: 'Under 4 free', it: 'Sotto 4 gratis' },
    schedule: { ru: 'Ежедневно (каждый час)', en: 'Daily (Hourly)', it: 'Tutti i giorni' },
    departureTime: { ru: 'С 10:00 до 16:00', en: '10:00 to 16:00', it: '10:00 - 16:00' },
    overview: {
      ru: 'Легкая и неутомительная 1-часовая морская прогулка на катере с прозрачным дном вдоль прибрежных рифов Наама Бэй. Прекрасно подходит для маленьких детей и пожилых гостей.',
      en: 'Relaxing 1-hour cruise over Near Garden and Middle Garden coral reefs through glass bottom boat. Perfect for families with small kids.',
      it: 'Gita di 1 ora in barca con fondo trasparente sopra le barriere coralline di Naama Bay. Ideale per famiglie con bimbi piccoli.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento hotel' },
      { ru: 'Билет на стеклянную лодку', en: 'Glass boat ticket', it: 'Biglietto barca' }
    ],
    availableSeats: 15,
    featured: false,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80']
  },
  {
    id: 'evening-yacht-cruise',
    slug: 'evening-yacht-cruise',
    title: {
      ru: 'Вечерний круиз на яхте с ужином из морепродуктов',
      en: 'Evening Yacht Cruise with Seafood Dinner',
      it: 'Crociera Serale in Yacht con Cena di Pesce'
    },
    category: 'sea',
    categoryLabel: { ru: 'Вечерние круизы', en: 'Dinner Cruises', it: 'Crociere con Cena' },
    location: { ru: 'Залив Шарма', en: 'Sharm Bay', it: 'Baia di Sharm' },
    duration: { ru: '5 часов', en: '5 hours', it: '5 ore' },
    priceAdult: 30,
    priceChild: 20,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно, 6–10 лет — 20$', en: 'Under 5 free, 6-10 yrs $20', it: 'Sotto 5 gratis, 6-10 anni 20$' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '17:00 — 22:30', en: '17:00 — 22:30', it: '17:00 — 22:30' },
    overview: {
      ru: 'Закат и ночные огни Шарма с борта комфортабельной яхты. Ужин (шведский стол) со свежими морепродуктами, живой вокал, танец живота, танура и дискотека.',
      en: 'Sunset & city lights from luxury yacht. Fresh seafood dinner buffet, live music, oriental belly dance, Tanoura show, and DJ music.',
      it: 'Tramonto sul mare in yacht, cena a buffet a base di pesce fresco, musica dal vivo, danza del ventre e spettacolo Tanoura.'
    },
    included: [
      { ru: 'Трансфер из отеля в порт и обратно', en: 'Port transfers', it: 'Trasferimenti porto' },
      { ru: 'Круиз на роскошной яхте', en: 'Luxury yacht cruise', it: 'Crociera in yacht' },
      { ru: 'Ужин из морепродуктов + напитки', en: 'Seafood dinner & drinks', it: 'Cena di pesce e bevande' },
      { ru: 'Шоу программа и живая музыка', en: 'Live entertainment show', it: 'Spettacolo dal vivo' }
    ],
    availableSeats: 16,
    featured: true,
    images: [vecherniiKruizImg],
    options: [
      {
        name: { ru: 'VIP столик с блюдом из лобстеров и королевских креветок', en: 'VIP Table with Lobster & Jumbo Prawns', it: 'Tavolo VIP con Aragosta' },
        price: 25
      }
    ]
  },
  {
    id: 'diving-courses-padi',
    slug: 'padi-diving-courses',
    title: {
      ru: 'Ознакомительный дайвинг и сертификация PADI',
      en: 'Intro Scuba Diving & PADI Certification',
      it: 'Battesimo del Mare e Corsi Sub PADI'
    },
    category: 'sea',
    categoryLabel: { ru: 'Дайвинг & Обучение', en: 'Diving & Courses', it: 'Corsi Subacquei' },
    location: { ru: 'Дайв-сайты Шарма', en: 'Sharm Dive Sites', it: 'Siti d’Immersione Sharm' },
    duration: { ru: '1–3 дня', en: '1–3 days', it: '1–3 giorni' },
    priceAdult: 35,
    priceChild: 35,
    childAgeInfo: { ru: 'Допускаются участники от 10 лет', en: 'Minimum age 10 years', it: 'Età minima 10 anni' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '08:30 — 16:00', en: '08:30 — 16:00', it: '08:30 — 16:00' },
    overview: {
      ru: 'Погружения в кристально чистые воды с сертифицированными PADI инструкторами: пробные погружения (Intro Dive) для новичков или полные курсы Scuba Diver / Open Water.',
      en: 'Discover Red Sea depths with licensed PADI instructors. Intro dives for beginners or full PADI certification courses with modern equipment.',
      it: 'Immersioni con istruttori PADI: battesimo del mare per principianti o corsi completi Open Water Diver.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento hotel' },
      { ru: 'Полный комплект дайв-снаряжения', en: 'Full diving equipment', it: 'Attrezzatura subacquea' },
      { ru: 'Индивидуальный инструктор', en: 'Certified instructor', it: 'Istruttore certificato' },
      { ru: 'Теоретический и практический брифинг', en: 'Safety & dive briefing', it: 'Briefing pratico' }
    ],
    availableSeats: 10,
    featured: false,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Полный сертификационный курс PADI Open Water Diver (3 дня)', en: 'Full PADI Open Water Diver Course (3 days)', it: 'Corso PADI Open Water (3 giorni)' },
        price: 250
      },
      {
        name: { ru: 'Подводная фото- и видеосъемка на GoPro', en: 'Underwater GoPro photo & video', it: 'Foto e video subacquei con GoPro' },
        price: 20
      }
    ]
  },
  {
    id: 'water-sports-pack',
    slug: 'water-sports-banana-parasailing',
    title: {
      ru: 'Водные виды спорта (Парасейлинг, Банан, Таблетка)',
      en: 'Water Sports Combo (Parasailing, Banana & Tube)',
      it: 'Sport Acquatici (Paracadute, Banana e Tubo)'
    },
    category: 'sea',
    categoryLabel: { ru: 'Водный экстрим', en: 'Water Fun', it: 'Divertimento in Acqua' },
    location: { ru: 'Бухта Шарм-эль-Шейха', en: 'Sharm Bay Beach', it: 'Spiaggia di Sharm' },
    duration: { ru: '2 часа', en: '2 hours', it: '2 ore' },
    priceAdult: 30,
    priceChild: 25,
    childAgeInfo: { ru: 'Дети от 5 лет в сопровождении взрослых', en: 'Kids from 5 yrs with adult', it: 'Bambini da 5 anni' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: 'Каждый час с 10:00 до 16:00', en: '10:00 to 16:00', it: '10:00 - 16:00' },
    overview: {
      ru: 'Заряд адреналина: полёт на парашюте за катером (Parasailing) с видом на горы и море, катание на надувном «Банане» и скоростной «Таблетке» (Tube).',
      en: 'Adrenaline fun: parasailing above the Red Sea coastline, speedy banana boat, and extreme crazy tube ride with safety equipment.',
      it: 'Paracadute ascensionale trainato da motoscafo con vista panoramica, giro su banana boat e ciambellone gonfiabile.'
    },
    included: [
      { ru: 'Трансфер из отеля на пляж и обратно', en: 'Beach transfers', it: 'Trasferimenti spiaggia' },
      { ru: 'Полёт на парасейлинге (одиночный или тандем)', en: 'Parasailing flight', it: 'Volo con paracadute' },
      { ru: 'Катание на Банане и Таблетке', en: 'Banana & Tube rides', it: 'Giro su banana e tubo' },
      { ru: 'Спасательные жилеты и инструктаж', en: 'Life jackets & safety', it: 'Giubbotti di salvataggio' }
    ],
    availableSeats: 20,
    featured: false,
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Фото и видео съемка на экшн-камеру во время полета', en: 'GoPro video & photo package in air', it: 'Foto e video in volo con GoPro' },
        price: 15
      }
    ]
  },

  // =========================================================================
  // 🎭 4. ШОУ, ДЕЛЬФИНАРИЙ И АКВАПАРКИ
  // =========================================================================
  {
    id: 'dolphin-show',
    slug: 'dolphin-show-sharm',
    title: {
      ru: 'Шоу дельфинов и морских котиков в дельфинарии',
      en: 'Dolphin & Fur Seal Show in Sharm',
      it: 'Spettacolo dei Delfini a Sharm'
    },
    category: 'show',
    categoryLabel: { ru: 'Шоу & Развлечения', en: 'Shows & Fun', it: 'Spettacoli per Famiglie' },
    location: { ru: 'Дельфинарий (Хадаба)', en: 'Dolphinarium (Hadaba)', it: 'Delfinario (Hadaba)' },
    duration: { ru: '2 часа', en: '2 hours', it: '2 ore' },
    priceAdult: 25,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 4 лет — бесплатно, до 9 лет — 15$', en: 'Under 4 free, 4-9 yrs $15', it: 'Sotto 4 gratis, 4-9 anni 15$' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '14:30 — 16:30', en: '14:30 — 16:30', it: '14:30 — 16:30' },
    overview: {
      ru: 'Трансфер из отеля (15–20 мин), 1 час увлекательного циркового представления с умными дельфинами и морскими котиками (трюки, прыжки через кольца, рисование).',
      en: 'Hotel pickup, 1 hour exciting live show with playful dolphins and fur seals performing tricks and jumps for the whole family.',
      it: 'Spettacolo di 1 ora con acrobazie di delfini e otarie al delfinario di Hadaba.'
    },
    included: [
      { ru: 'Трансфер из отеля и обратно', en: 'Hotel transfers', it: 'Trasferimenti hotel' },
      { ru: 'Русскоязычный сопровождающий', en: 'Tour assistant', it: 'Assistente turistico' },
      { ru: 'Входные билеты на шоу (1 час)', en: 'Show entrance ticket', it: 'Biglietto per lo spettacolo' }
    ],
    availableSeats: 30,
    featured: true,
    images: [delphineShowImg],
    options: [
      {
        name: { ru: 'Плавание с дельфинами в бассейне (15 минут)', en: 'Swimming with dolphins (15 mins)', it: 'Nuoto con i delfini (15 min)' },
        price: 65
      },
      {
        name: { ru: 'Плавание с дельфинами в бассейне (30 минут)', en: 'Swimming with dolphins (30 mins)', it: 'Nuoto con i delfini (30 min)' },
        price: 100
      },
      {
        name: { ru: 'Печатное фото формата А4 с дельфином', en: 'A4 Printed photo with dolphin', it: 'Foto stampata con il delfino' },
        price: 15
      }
    ]
  },
  {
    id: 'dolphin-swimming',
    slug: 'swimming-with-dolphins',
    title: {
      ru: 'Индивидуальное плавание с дельфинами в бассейне',
      en: 'Swimming with Dolphins in the Pool',
      it: 'Nuoto con i Delfini in Piscina'
    },
    category: 'show',
    categoryLabel: { ru: 'Эксклюзив & Эмоции', en: 'Exclusive Emotions', it: 'Esperienze Esclusive' },
    location: { ru: 'Дельфинарий Шарма', en: 'Dolphinarium Pool', it: 'Piscina del Delfinario' },
    duration: { ru: '1.5 часа', en: '1.5 hours', it: '1.5 ore' },
    priceAdult: 65,
    priceChild: 65,
    childAgeInfo: { ru: 'Допускаются дети от 4 лет в сопровождении тренера', en: 'Children from 4+ years', it: 'Bambini da 4 anni' },
    schedule: { ru: 'Ежедневно (по предварительной брони)', en: 'Daily (Booking required)', it: 'Tutti i giorni' },
    departureTime: { ru: '13:00 или 16:30', en: '13:00 or 16:30', it: '13:00 o 16:30' },
    overview: {
      ru: 'Уникальный контакт с дельфинами в воде: 15 или 30 минут плавания, танцев и объятий с дельфинами под контролем инструктора. Незабываемые эмоции и яркие фото.',
      en: 'Unforgettable 15 or 30 mins in the pool with friendly dolphins: hug, dance, and glide through the water alongside these intelligent creatures.',
      it: 'Nuota a tu per tu con i delfini in piscina per 15 o 30 minuti con l’assistenza dell’istruttore.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento hotel' },
      { ru: 'Сеанс плавания с дельфинами (15 мин)', en: '15 mins dolphin swim session', it: 'Sessione di nuoto di 15 min' },
      { ru: 'Инструктаж и спасательный жилет', en: 'Life jacket & briefing', it: 'Giubbotto e briefing' }
    ],
    availableSeats: 6,
    featured: false,
    images: [delphineShowImg],
    options: [
      {
        name: { ru: 'Продлить сеанс до 30 минут', en: 'Upgrade to 30 mins session', it: 'Prolunga a 30 minuti' },
        price: 35
      },
      {
        name: { ru: 'Профессиональная видеосъемка заплыва', en: 'Professional video recording of swim', it: 'Video professionale del nuoto' },
        price: 25
      }
    ]
  },
  {
    id: 'aquapark-full-day',
    slug: 'aquapark-sharm-el-sheikh',
    title: {
      ru: 'Самый большой Аквапарк Шарма (30+ горок)',
      en: 'Largest Sharm Aquapark (30+ Slides)',
      it: 'Il più grande Parco Acquatico di Sharm'
    },
    category: 'show',
    categoryLabel: { ru: 'Аквапарк & Развлечения', en: 'Waterpark & Fun', it: 'Parchi Acquatici' },
    location: { ru: 'Шарм-эль-Шейх', en: 'Sharm El Sheikh', it: 'Sharm el-Sheikh' },
    duration: { ru: '7 часов', en: '7 hours', it: '7 ore' },
    priceAdult: 40,
    priceChild: 30,
    childAgeInfo: { ru: 'Дети до 4 лет — бесплатно, до 11 лет — 30$', en: 'Under 4 free, 4-11 yrs $30', it: 'Sotto 4 gratis, 4-11 anni 30$' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '10:00 — 17:00', en: '10:00 — 17:00', it: '10:00 — 17:00' },
    overview: {
      ru: 'День адреналина и брызг: более 30 взрослых и детских горок, 5 бассейнов с искусственной волной, ленивая река, вкусный обед (шведский стол) и напитки весь день.',
      en: 'Full day of fun: 30+ water slides, 5 wave pools, lazy river rafting, buffet lunch in main restaurant, and unlimited soft drinks.',
      it: 'Giornata intera di divertimento con 30 scivoli, 5 piscine con onde, fiume lento, pranzo a buffet e bevande illimitate.'
    },
    included: [
      { ru: 'Трансфер из отеля и обратно', en: 'Hotel pickup & drop-off', it: 'Trasferimenti hotel' },
      { ru: 'Входной билет на все горки парка', en: 'All slides entrance ticket', it: 'Ingresso a tutti gli scivoli' },
      { ru: 'Обед (шведский стол) в ресторане', en: 'Buffet lunch included', it: 'Pranzo a buffet incluso' },
      { ru: 'Напитки в течение дня без ограничений', en: 'Unlimited soft drinks', it: 'Bevande illimitate' }
    ],
    availableSeats: 30,
    featured: true,
    images: [akvaparkImg],
    options: [
      {
        name: { ru: 'Тариф «БЕЗ ОБЕДА» (Скидка -$10)', en: 'NO LUNCH rate (-$10 discount)', it: 'Senza pranzo (Sconto -$10)' },
        price: -10
      }
    ]
  },
  {
    id: 'thousand-one-nights-show',
    slug: 'alf-leila-wa-leila-show',
    title: {
      ru: 'Восточное Шоу «1001 Ночь» (Альф Лейла Ва Лейла)',
      en: 'Alf Leila Wa Leila (1001 Nights Show)',
      it: 'Spettacolo «Mille e una Notte»'
    },
    category: 'show',
    categoryLabel: { ru: 'Шоу & Фольклор', en: 'Shows & Folklore', it: 'Spettacoli Tradizionali' },
    location: { ru: 'Дворец 1001 Ночь (Хадаба)', en: 'Hadaba Palace', it: 'Palazzo di Hadaba' },
    duration: { ru: '4 часа', en: '4 hours', it: '4 ore' },
    priceAdult: 15,
    priceChild: 10,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно', en: 'Kids under 5 free', it: 'Sotto 5 anni gratis' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '19:30 — 23:30', en: '19:30 — 23:30', it: '19:30 — 23:30' },
    overview: {
      ru: 'Вечер в восточном замке: светомузыкальное представление об истории фараонов и пирамид, трюки на арабских скакунах, танец живота и танец дервишей с юбками (танура).',
      en: 'Magical evening in oriental palace: Pharaoh sound & light show, Arabian horse acrobatics, folklore dances, belly dance, and Tanoura.',
      it: 'Serata fiabesca nel palazzo orientale con spettacolo di luci e suoni, cavalli arabi e danze tradizionali.'
    },
    included: [
      { ru: 'Трансфер из отеля и обратно', en: 'Hotel transfers', it: 'Trasferimenti hotel' },
      { ru: 'Входной билет во дворец и на шоу', en: 'Palace & show entry ticket', it: 'Biglietto per lo spettacolo' }
    ],
    availableSeats: 25,
    featured: false,
    images: ['https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Добавить вход на шоу крокодилов и ядовитых змей', en: 'Add Crocodile & Snake show', it: 'Aggiungi show coccodrilli e serpenti' },
        price: 15
      }
    ]
  },
  {
    id: 'crocodile-show-snake',
    slug: 'crocodile-show-sharm',
    title: {
      ru: 'Шоу с крокодилами и ядовитыми змеями',
      en: 'Live Crocodile & Dangerous Snake Show',
      it: 'Spettacolo con Coccodrilli e Serpenti'
    },
    category: 'show',
    categoryLabel: { ru: 'Экстрим-шоу', en: 'Extreme Shows', it: 'Spettacoli Estremi' },
    location: { ru: 'Шарм-эль-Шейх', en: 'Sharm El Sheikh', it: 'Sharm el-Sheikh' },
    duration: { ru: '3 часа', en: '3 hours', it: '3 ore' },
    priceAdult: 30,
    priceChild: 15,
    childAgeInfo: { ru: 'Дети до 5 лет — бесплатно', en: 'Kids under 5 free', it: 'Sotto 5 anni gratis' },
    schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
    departureTime: { ru: '19:00 — 22:00', en: '19:00 — 22:00', it: '19:00 — 22:00' },
    overview: {
      ru: 'Единственное шоу крокодилов на Ближнем Востоке: опасные трюки с нильскими крокодилами в закрытом бассейне, заклинание кобр и шоу с гигантскими питонами.',
      en: 'The only live crocodile show in the Middle East. Daring stunts with giant Nile crocodiles in arena pool, cobra charming, and snake stunts.',
      it: 'L’unico spettacolo di coccodrilli del Medio Oriente con acrobazie spericolate, cobra e serpenti giganti.'
    },
    included: [
      { ru: 'Трансфер из отеля', en: 'Hotel transfer', it: 'Trasferimento hotel' },
      { ru: 'Входной билет на шоу крокодилов и змей', en: 'Show entrance ticket', it: 'Biglietto d’ingresso' },
      { ru: 'Посещение террариума', en: 'Terrarium visit', it: 'Visita al terrario' }
    ],
    availableSeats: 20,
    featured: false,
    images: ['https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80'],
    options: [
      {
        name: { ru: 'Памятное фото с королевским питоном или детенышем крокодила', en: 'Photo holding python or baby crocodile', it: 'Foto con pitone o cucciolo di coccodrillo' },
        price: 10
      }
    ]
  }
];

// Вспомогательная функция безопасного извлечения локализованного текста
export function getLocalizedText(
  localized: LocalizedString | string | undefined | null,
  currentLang: string
): string {
  if (!localized) return '';
  if (typeof localized === 'string') return localized;

  const rawLang = (currentLang || 'ru').slice(0, 2).toLowerCase();
  const lang = (['ru', 'en', 'it'].includes(rawLang) ? rawLang : 'ru') as Language;

  return localized[lang] || localized.ru || localized.en || localized.it || '';
}