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
  schedule: LocalizedString;
  departureTime: LocalizedString;
  overview: LocalizedString;
  included: LocalizedString[];
  excluded?: LocalizedString[];
  whatToBring?: LocalizedString[];
  availableSeats: number;
  featured?: boolean;
  images: string[];
  options?: LocalizedTourOption[];
}

export const TOURS_DATA: Tour[] = [
  // --- ТУР 1: ДЕЛЬФИНАРИЙ ---
  {
    id: 'dolphin-show',
    slug: 'delphinarium-show',
    title: {
      ru: 'Дельфинарий шоу',
      en: 'Dolphin Show',
      it: 'Spettacolo dei Delfini'
    },
    category: 'show',
    categoryLabel: {
      ru: 'Шоу и Развлечения',
      en: 'Shows & Entertainment',
      it: 'Spettacoli e Intrattenimento'
    },
    location: {
      ru: 'Шарм-эль-Шейх',
      en: 'Sharm El Sheikh',
      it: 'Sharm el-Sheikh'
    },
    duration: {
      ru: '1 час',
      en: '1 hour',
      it: '1 ora'
    },
    priceAdult: 25,
    priceChild: 20,
    childAgeInfo: {
      ru: 'Дети от 2 до 7 лет — 20$, до 2-х лет — бесплатно',
      en: 'Children 2 to 7 years — $20, under 2 years — free',
      it: 'Bambini da 2 a 7 anni — 20$, sotto i 2 anni — gratis'
    },
    schedule: {
      ru: 'Ежедневно',
      en: 'Daily',
      it: 'Tutti i giorni'
    },
    departureTime: {
      ru: '15:00 - 16:00',
      en: '15:00 - 16:00',
      it: '15:00 - 16:00'
    },
    overview: {
      ru: 'Увлекательное шоу дельфинов и морских котиков для всей семьи в Шарм-эль-Шейхе.',
      en: 'An exciting dolphin and fur seal show for the whole family in Sharm El Sheikh.',
      it: 'Un emozionante spettacolo di delfini e otarie per tutta la famiglia a Sharm el-Sheikh.'
    },
    included: [
      {
        ru: 'Трансфер из отеля и обратно',
        en: 'Hotel pickup and drop-off',
        it: "Trasferimento da e per l'hotel"
      },
      {
        ru: 'Входной билет на шоу дельфинов',
        en: 'Dolphin show entrance ticket',
        it: "Biglietto d'ingresso allo spettacolo dei delfini"
      },
      {
        ru: 'Оплата гиду на месте',
        en: 'Payment to the guide on spot',
        it: 'Pagamento alla guida sul posto'
      }
    ],
    whatToBring: [
      { ru: 'Головной убор', en: 'Hat / Cap', it: 'Cappello' },
      { ru: 'Вода', en: 'Water', it: 'Acqua' },
      { ru: 'Камера', en: 'Camera', it: 'Fotocamera' }
    ],
    availableSeats: 8,
    featured: true,
    images: [delphineShowImg],
    options: [
      {
        name: {
          ru: 'Плавание с дельфинами (15 минут)',
          en: 'Dolphin swimming (15 mins)',
          it: 'Nuotare con i delfini (15 min)'
        },
        price: 70
      },
      {
        name: {
          ru: 'Плавание с дельфинами (30 минут)',
          en: 'Dolphin swimming (30 mins)',
          it: 'Nuotare con i delfini (30 min)'
        },
        price: 100
      },
      {
        name: {
          ru: 'Трансфер из Наама Бэй / Хадаба (+1 чел)',
          en: 'Transfer from Naama Bay / Hadaba (+1 person)',
          it: 'Trasferimento da Naama Bay / Hadaba (+1 pers)'
        },
        price: 5
      },
      {
        name: {
          ru: 'Трансфер для сопровождающего (+1 чел)',
          en: 'Transfer for accompanying person (+1 person)',
          it: 'Trasferimento per accompagnatore (+1 pers)'
        },
        price: 10
      }
    ]
  },

  // --- ТУР 2: ВЕЧЕРНИЙ КРУИЗ ---
  {
    id: 'evening-yacht-cruise',
    slug: 'evening-yacht-cruise',
    title: {
      ru: 'Вечерний круиз на яхте',
      en: 'Evening Yacht Cruise',
      it: 'Crociera serale in yacht'
    },
    category: 'sea',
    categoryLabel: {
      ru: 'Морские прогулки',
      en: 'Sea Cruises',
      it: 'Gite in barca'
    },
    location: {
      ru: 'Шарм-эль-Шейх',
      en: 'Sharm El Sheikh',
      it: 'Sharm el-Sheikh'
    },
    duration: {
      ru: '4 часа',
      en: '4 hours',
      it: '4 ore'
    },
    priceAdult: 35,
    priceChild: 20,
    childAgeInfo: {
      ru: 'Дети до 10 лет — 20$, до 5 лет — БЕСПЛАТНО',
      en: 'Children under 10 — $20, under 5 — FREE',
      it: 'Bambini sotto i 10 anni — 20$, sotto i 5 — GRATIS'
    },
    schedule: {
      ru: 'Ежедневно',
      en: 'Daily',
      it: 'Tutti i giorni'
    },
    departureTime: {
      ru: '18:00 – 22:00',
      en: '18:00 – 22:00',
      it: '18:00 – 22:00'
    },
    overview: {
      ru: 'Незабываемый вечер на воде с ужином из морепродуктов и яркой шоу-программой!',
      en: 'An unforgettable evening on the water with a seafood dinner and a vibrant show program!',
      it: 'Una serata indimenticabile in acqua con cena a base di frutti di mare e uno fantastico spettacolo!'
    },
    included: [
      {
        ru: 'Трансфер из отеля и обратно',
        en: 'Hotel pickup and drop-off',
        it: "Trasferimento da e per l'hotel"
      },
      {
        ru: 'Прогулка на роскошной яхте',
        en: 'Luxury yacht cruise',
        it: 'Crociera su uno yacht di lusso'
      },
      {
        ru: 'Ужин + безалкогольные напитки',
        en: 'Seafood dinner + soft drinks',
        it: 'Cena + bevande analcoliche'
      },
      {
        ru: 'Вечерняя шоу-программа (живое пение, танец живота, дискотека)',
        en: 'Evening show program (live singing, belly dance, disco)',
        it: 'Spettacolo serale (musica dal vivo, danza del ventre, disco)'
      }
    ],
    availableSeats: 4,
    featured: true,
    images: [vecherniiKruizImg]
  },

  // --- ТУР 3: СУПЕР САФАРИ НА БАГГАХ ---
  {
    id: 'super-buggy-safari',
    slug: 'super-buggy-safari',
    title: {
      ru: 'СУПЕР САФАРИ на баггах',
      en: 'SUPER Buggy Safari',
      it: 'SUPER Safari in Buggy'
    },
    category: 'safari',
    categoryLabel: {
      ru: 'Пустыня и Сафари',
      en: 'Desert & Safari',
      it: 'Deserto e Safari'
    },
    location: {
      ru: 'Шарм-эль-Шейх',
      en: 'Sharm El Sheikh',
      it: 'Sharm el-Sheikh'
    },
    duration: {
      ru: '5 часов 30 минут',
      en: '5.5 hours',
      it: '5 ore e 30 minuti'
    },
    priceAdult: 30,
    priceChild: 30,
    childAgeInfo: {
      ru: 'Цена за место в экипаже',
      en: 'Price per seat in vehicle',
      it: 'Prezzo per posto nel veicolo'
    },
    schedule: {
      ru: 'Ежедневно',
      en: 'Daily',
      it: 'Tutti i giorni'
    },
    departureTime: {
      ru: '15:30 (Возвращение в 21:00)',
      en: '15:30 (Return at 21:00)',
      it: '15:30 (Ritorno alle 21:00)'
    },
    overview: {
      ru: 'Катание на баггах по пустыне, катание на верблюдах, ужин в бедуинской деревне и вечерняя шоу-программа.',
      en: 'Buggy riding across the desert, camel ride, Bedouin village dinner, and evening show program.',
      it: 'Guida del buggy nel deserto, giro sul cammello, cena nel villaggio beduino e spettacolo serale.'
    },
    included: [
      {
        ru: 'Трансфер из отеля и обратно',
        en: 'Hotel pickup and drop-off',
        it: "Trasferimento da e per l'hotel"
      },
      {
        ru: 'Русскоговорящий гид',
        en: 'Multilingual licensed guide',
        it: 'Guida turistica multilingue'
      },
      {
        ru: 'Ужин в бедуинской деревне',
        en: 'Bedouin village dinner',
        it: 'Cena nel villaggio beduino'
      },
      {
        ru: 'Катание на баггах + верблюды',
        en: 'Buggy ride + camel ride',
        it: 'Giro in buggy + cammelli'
      },
      {
        ru: 'Шоу-программа',
        en: 'Show program',
        it: 'Spettacolo'
      }
    ],
    whatToBring: [
      { ru: 'Вода', en: 'Water', it: 'Acqua' },
      { ru: 'Арафатка (платок)', en: 'Arafat scarf (Keffiyeh)', it: 'Arafata (sciarpa)' },
      { ru: 'Солнцезащитные очки', en: 'Sunglasses', it: 'Occhiali da sole' },
      { ru: 'Удобная одежда и обувь', en: 'Comfortable clothes & shoes', it: 'Abbigliamento e scarpe comode' },
      { ru: 'Теплые вещи (в зимний период)', en: 'Warm clothes (during winter)', it: 'Vestiti caldi (in inverno)' }
    ],
    availableSeats: 12,
    featured: true,
    images: [safariImg],
    options: [
      {
        name: {
          ru: 'Двухместный багги (за двоих)',
          en: 'Double Buggy (for two)',
          it: 'Buggy a 2 posti (per due)'
        },
        price: 60
      },
      {
        name: {
          ru: 'Четырехместный багги (за четверых)',
          en: 'Family Buggy (for four)',
          it: 'Buggy a 4 posti (per quattro)'
        },
        price: 80
      }
    ]
  },

  // --- ТУР 4: ИНДИВИДУАЛЬНАЯ ОБЗОРНАЯ ЭКСКУРСИЯ ---
  {
    id: 'individual-city-tour',
    slug: 'individual-city-tour',
    title: {
      ru: 'Индивидуальная обзорная экскурсия «Шарм глазами местных»',
      en: 'Private City Tour "Sharm Through Locals\' Eyes"',
      it: 'Tour privato della città "Sharm vista dai locali"'
    },
    category: 'historical',
    categoryLabel: {
      ru: 'Культура и Обзорные',
      en: 'Culture & Sightseeing',
      it: 'Cultura e Visite'
    },
    location: {
      ru: 'Шарм-эль-Шейх',
      en: 'Sharm El Sheikh',
      it: 'Sharm el-Sheikh'
    },
    duration: {
      ru: '~3 часа',
      en: '~3 hours',
      it: '~3 ore'
    },
    priceAdult: 100,
    priceChild: 0,
    childAgeInfo: {
      ru: 'Дети до 5 лет — бесплатно. 1-2 чел — 100$, 3-4 чел — 150$',
      en: 'Kids under 5 — free. 1-2 pax — $100, 3-4 pax — $150',
      it: 'Bambini sotto i 5 anni — gratis. 1-2 pers — 100$, 3-4 pers — 150$'
    },
    schedule: {
      ru: 'Индивидуально',
      en: 'On demand',
      it: 'Su richiesta'
    },
    departureTime: {
      ru: 'По согласованию с вами',
      en: 'Flexible time',
      it: 'Orario flessibile'
    },
    overview: {
      ru: 'Шарм-эль-Шейх глазами местных на комфортабельном авто. Вы увидите историю, культуру, архитектуру и местную жизнь без скучных банальных гидов.',
      en: 'Discover Sharm El Sheikh through the eyes of locals in a comfortable car. History, culture, architecture, and authentic local life without boring guides.',
      it: "Scopri Sharm el-Sheikh con gli occhi dei locali in un'auto confortevole. Storia, cultura, architettura e vita locale senza noiose guide tradizionali."
    },
    included: [
      {
        ru: 'Трансфер на комфортабельном авто из отеля и обратно',
        en: 'Hotel pickup & drop-off by comfortable car',
        it: "Trasferimento in auto confortevole da e per l'hotel"
      },
      {
        ru: 'Персональный гид, знающий город изнутри',
        en: 'Personal guide who knows the city inside out',
        it: "Guida personale che conoce la città dall'interno"
      },
      {
        ru: 'Площадь Мира (символ дружбы народов)',
        en: 'Peace Square (symbol of international friendship)',
        it: 'Piazza della Pace (simbolo di amicizia tra i popoli)'
      },
      {
        ru: 'Президентская мечеть & Коптский христианский храм',
        en: 'Presidential Mosque & Coptic Christian Church',
        it: 'Moschea Presidenziale e Chiesa Copta Ortodossa'
      },
      {
        ru: 'Мечеть Эль-Мустафа & Старый город',
        en: 'El Mustafa Mosque & Old Town Market',
        it: 'Moschea El Mustafa e Città Vecchia'
      },
      {
        ru: 'Мечеть Эль-Сахаба (жемчужина архитектуры)',
        en: 'El Sahaba Mosque (architectural jewel)',
        it: "Moschea El Sahaba (gemma dell'architettura)"
      },
      {
        ru: 'Смотровая площадка с панорамой города',
        en: 'Panoramic city viewpoint',
        it: 'Punto panoramico della città'
      },
      {
        ru: 'Дегустация натурального тростникового сока',
        en: 'Fresh sugarcane juice tasting',
        it: 'Degustazione di succo di canna da zucchero'
      },
      {
        ru: 'Помощь с фото и видео съёмкой на локациях',
        en: 'Photo and video assistance at best locations',
        it: 'Assistenza per foto e video nelle migliori location'
      }
    ],
    whatToBring: [
      { ru: 'Камера / Смартфон', en: 'Camera / Smartphone', it: 'Fotocamera / Smartphone' },
      { ru: 'Удобная обувь', en: 'Comfortable shoes', it: 'Scarpe comode' },
      { ru: 'Головной убор и вода', en: 'Hat & water', it: 'Cappello e acqua' },
      {
        ru: 'Одежда, закрывающая плечи и колени (для входа в мечеть)',
        en: 'Modest clothing covering shoulders & knees (for mosque)',
        it: 'Abbigliamento modesto che copra spalle e ginocchia (per la moschea)'
      }
    ],
    availableSeats: 4,
    featured: true,
    images: [ekskursiaImg],
    options: [
      {
        name: {
          ru: 'Группа 3–4 человека (Доплата к тарифу)',
          en: 'Group 3–4 people (Surcharge)',
          it: 'Gruppo 3–4 persone (Supplemento)'
        },
        price: 50
      }
    ]
  },

  // --- ТУР 5: ЗАПОВЕДНИК РАС-МУХАММЕД ---
  {
    id: 'ras-mohammed-land',
    slug: 'ras-mohammed-reserve',
    title: {
      ru: 'Экскурсия в заповедник Рас-Мухаммед',
      en: 'Ras Mohammed National Park Tour',
      it: 'Escursione al Parco Nazionale di Ras Mohammed'
    },
    category: 'sea',
    categoryLabel: {
      ru: 'Заповедники и Море',
      en: 'Reserves & Sea',
      it: 'Riserve e Mare'
    },
    location: {
      ru: 'Заповедник Рас-Мухаммед',
      en: 'Ras Mohammed National Park',
      it: 'Parco Nazionale di Ras Mohammed'
    },
    duration: {
      ru: '5 часов',
      en: '5 hours',
      it: '5 ore'
    },
    priceAdult: 25,
    priceChild: 15,
    childAgeInfo: {
      ru: 'Дети до 6 лет — бесплатно',
      en: 'Children under 6 — free',
      it: 'Bambini sotto i 6 anni — gratis'
    },
    schedule: {
      ru: 'Ежедневно',
      en: 'Daily',
      it: 'Tutti i giorni'
    },
    departureTime: {
      ru: '08:00 – 13:00',
      en: '08:00 – 13:00',
      it: '08:00 – 13:00'
    },
    overview: {
      ru: 'Жемчужина Синайского полуострова всего в 25 км от Шарм-эль-Шейха. Одно из лучших мест мира для сноркелинга и купания.',
      en: 'The jewel of the Sinai Peninsula just 25 km from Sharm El Sheikh. One of the best snorkeling and swimming spots in the world.',
      it: 'La gemma della peninsula del Sinai a soli 25 km da Sharm el-Sheikh. Uno dei posti migliori al mondo per fare snorkeling e nuotare.'
    },
    included: [
      {
        ru: 'Трансфер из отеля и обратно',
        en: 'Hotel pickup and drop-off',
        it: "Trasferimento da e per l'hotel"
      },
      {
        ru: '🗣 Русскоговорящий гид',
        en: '🗣 Multilingual licensed guide',
        it: '🗣 Guida turistica multilingue'
      },
      {
        ru: '🎟 Входной билет в национальный заповедник',
        en: '🎟 National park entrance ticket',
        it: "🎟 Biglietto d'ingresso al parco nazionale"
      },
      {
        ru: 'Врата Аллаха',
        en: "Allah's Gate",
        it: 'Porta di Allah'
      },
      {
        ru: 'Мангровые рощи (опресняющие воду)',
        en: 'Mangrove groves',
        it: 'Foreste di mangrovie'
      },
      {
        ru: 'Тектонический разлом после землетрясения',
        en: 'Tectonic earthquake fault',
        it: 'Faglia tettonica post-terremoto'
      },
      {
        ru: 'Озеро Желаний (купание как в Мёртвом море)',
        en: 'Magic Lake (Dead Sea-style floating)',
        it: 'Lago Magico (I Desideri)'
      },
      {
        ru: '2 остановки для сноркелинга у лучших коралловых рифов',
        en: '2 snorkeling stops at top coral reefs',
        it: '2 tappe per lo snorkeling nei migliori reef'
      }
    ],
    excluded: [
      {
        ru: 'Аренда снаряжения для плавания (маска, ласты)',
        en: 'Snorkeling equipment rental (mask, fins)',
        it: 'Noleggio attrezzatura per snorkeling (maschera, pinne)'
      }
    ],
    whatToBring: [
      {
        ru: 'Оригинал паспорта (обязательно!)',
        en: 'Original Passport (Mandatory!)',
        it: 'Passaporto originale (Obbligatorio!)'
      },
      { ru: 'Питьевая вода', en: 'Drinking water', it: 'Acqua potabile' },
      {
        ru: 'Крем от солнца, полотенце, головной убор, очки',
        en: 'Sunscreen, towel, hat, sunglasses',
        it: 'Crema solare, telo mare, cappello, occhiali'
      },
      {
        ru: 'Ласты, маска, водонепроницаемый чехол для камеры',
        en: 'Fins, mask, waterproof phone pouch',
        it: 'Pinne, maschera, custodia impermeabile'
      },
      {
        ru: 'Наличные деньги на мелкие расходы',
        en: 'Cash for small personal expenses',
        it: 'Contanti per piccole spese'
      }
    ],
    availableSeats: 10,
    featured: true,
    images: [zapovednikImg],
    options: [
      {
        name: {
          ru: 'Аренда маски и трубки',
          en: 'Mask & snorkel rental',
          it: 'Noleggio maschera e boccaglio'
        },
        price: 5
      },
      {
        name: {
          ru: 'Аренда ласт',
          en: 'Fins rental',
          it: 'Noleggio pinne'
        },
        price: 5
      },
      {
        name: {
          ru: 'Гидрокостюм',
          en: 'Wetsuit rental',
          it: 'Noleggio muta'
        },
        price: 7
      }
    ]
  },

  // --- ТУР 6: САМЫЙ БОЛЬШОЙ АКВАПАРК ---
  {
    id: 'biggest-aquapark-sharm',
    slug: 'biggest-aquapark-sharm',
    title: {
      ru: 'Самый большой аквапарк в Шарм-эль-Шейхе',
      en: 'Largest Aquapark in Sharm El Sheikh',
      it: 'Il più grande Parco Acquatico di Sharm el-Sheikh'
    },
    category: 'show',
    categoryLabel: {
      ru: 'Аквапарк и Развлечения',
      en: 'Waterpark & Fun',
      it: 'Parco Acquatico e Divertimento'
    },
    location: {
      ru: 'Шарм-эль-Шейх',
      en: 'Sharm El Sheikh',
      it: 'Sharm el-Sheikh'
    },
    duration: {
      ru: '7 часов',
      en: '7 hours',
      it: '7 ore'
    },
    priceAdult: 65,
    priceChild: 55,
    childAgeInfo: {
      ru: 'Дети до 10 лет — 55$ с обедом / 45$ без обеда',
      en: 'Kids under 10 — $55 with lunch / $45 without lunch',
      it: 'Bambini sotto i 10 anni — 55$ con pranzo / 45$ senza'
    },
    schedule: {
      ru: 'Ежедневно',
      en: 'Daily',
      it: 'Tutti i giorni'
    },
    departureTime: {
      ru: '10:00 — 17:00',
      en: '10:00 — 17:00',
      it: '10:00 — 17:00'
    },
    overview: {
      ru: 'День, полный улыбок, адреналина и отдыха для всей семьи! Более 30 горок для взрослых и детей, 5 бассейнов, ленивая река и вкусный обед.',
      en: 'A day packed with fun, adrenaline, and relaxation for the whole family! Over 30 slides, 5 pools, lazy river, and buffet lunch.',
      it: 'Una giornata piena di divertimento, adrenalina e relax per tutta la famiglia! Oltre 30 scivoli, 5 piscine, fiume lento и pranzo a buffet.'
    },
    included: [
      {
        ru: 'Трансфер из отеля и обратно',
        en: 'Hotel pickup and drop-off',
        it: "Trasferimento da e per l'hotel"
      },
      {
        ru: 'Входной билет в обе зоны аквапарка',
        en: 'Entrance ticket to both aquapark zones',
        it: "Biglietto d'ingresso a entrambe le zone del parco"
      },
      {
        ru: 'Более 30 экстремальных и семейных горок',
        en: 'Over 30 extreme and family slides',
        it: 'Oltre 30 scivoli estremi e per famiglie'
      },
      {
        ru: '12 детских горок для самых маленьких',
        en: '12 kids slides for toddlers',
        it: '12 scivoli per bambini piccoli'
      },
      {
        ru: '5 бассейнов (включая бассейн с искусственной волной)',
        en: '5 pools (including wave pool)',
        it: '5 piscine (inclusa piscina con onde)'
      },
      {
        ru: 'Ленивая река для катания на байдарках',
        en: 'Lazy river with rafting boats',
        it: 'Fiume lento per gommoni'
      },
      {
        ru: 'Вкусный обед в главном ресторане (шведский стол)',
        en: 'Delicious buffet lunch in main restaurant',
        it: 'Delizioso pranzo a buffet nel ristorante principale'
      },
      {
        ru: 'Напитки целый день без ограничений',
        en: 'Unlimited soft drinks all day',
        it: 'Bevande analcoliche illimitate tutto il giorno'
      }
    ],
    whatToBring: [
      {
        ru: 'Купальные принадлежности / плавки',
        en: 'Swimwear / Swim trunks',
        it: 'Costume da bagno'
      },
      { ru: 'Полотенце', en: 'Towel', it: 'Asciugamano' },
      {
        ru: 'Солнцезащитный крем и очки',
        en: 'Sunscreen & sunglasses',
        it: 'Crema solare e occhiali da sole'
      },
      { ru: 'Головной убор', en: 'Sun hat', it: 'Cappello' },
      {
        ru: 'Деньги на личные расходы',
        en: 'Cash for personal expenses',
        it: 'Contanti per spese personali'
      }
    ],
    availableSeats: 15,
    featured: true,
    images: [akvaparkImg],
    options: [
      {
        name: {
          ru: 'Тариф БЕЗ ОБЕДА для взрослого (Скидка -$10)',
          en: 'NO LUNCH adult rate (-$10 discount)',
          it: 'Tariffa SENZA PRANZO adulto (Sconto -$10)'
        },
        price: -10
      },
      {
        name: {
          ru: 'Тариф БЕЗ ОБЕДА для ребенка (Скидка -$10)',
          en: 'NO LUNCH child rate (-$10 discount)',
          it: 'Tariffa SENZA PRANZO bambino (Sconto -$10)'
        },
        price: -10
      }
    ]
  }
];

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