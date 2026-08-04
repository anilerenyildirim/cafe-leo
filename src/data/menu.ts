/* ============================================================
   CAFE LEO — menü verisi
   Kaynak: QRall tenant export (JSON) + panel ekran görüntüleri, 04.08.2026
   Toplam: 122 kalem = 116 ürün + 6 ekstra

   NORMALİZASYON NOTLARI (hepsi geri alınabilir, istersen orijinale dönerim):
   - Ürün adları ALL CAPS → Türkçe Title Case
   - QRall'ın name alanına bastığı <p> tag'leri temizlendi
   - Yazım hataları düzeltildi (aşağıda // fix: ile işaretli)
   - "X Dondurmalı" → "Dondurmalı X", "Milkshake X" → "X'li Milkshake"
   - Modifier'lar (şurup, süt, shot, sos) kategorilerden çıkarılıp EXTRAS'a alındı
   - Ekşi maya / kruvasan serilerinde "·" ile gruplama

   TEYİT BEKLEYEN:
   - leoPick işaretli ürünler → Leo onaylayacak, şu an öneri
   - featured listesi → haftalık değişecekse kim güncelleyecek?
   - "Dana Ham Pizza" adı → açıklamada "dana füme et" yazıyor, ad teyide muhtaç
   - VENUE.contact altındaki her alan
   ============================================================ */

export type CategoryId =
  | 'sicaklar' | 'soguk-kahveler' | 'tatlilar' | 'frozenler'
  | 'milkshakeler' | 'kokteyller' | 'mesrubat' | 'yiyecekler';

export interface MenuItem {
  /** foto/<slug>.jpg ve #anchor için */
  slug: string;
  name: string;
  desc?: string;
  /** Tam TRY. Menü gösterimi olduğu için kuruş kullanılmadı — tüm fiyatlar tam sayı. */
  price: number;
  /** Leo'nun tercihi rozeti — kart sağ üstünde belirteç */
  leoPick?: boolean;
  /** Serbest rozet metni; leoPick'ten bağımsız */
  tag?: string;
}

export interface Category {
  id: CategoryId;
  title: string;
  /** Menüdeki görünme sırası — QRall ID sırası ile AYNI DEĞİL */
  order: number;
  /** KDV oranı — muhasebe için taşınıyor, ekranda gösterilmiyor */
  vat: 10 | 20;
  items: MenuItem[];
}

export interface Extra {
  slug: string;
  name: string;
  price: number;
  /** Hangi kategorilerde teklif edilebilir */
  appliesTo: CategoryId[];
}

/* ============================================================
   KATEGORİLER
   ============================================================ */

export const CATEGORIES: Category[] = [
  {
    id: 'sicaklar',
    title: 'Sıcaklar',
    order: 1,
    vat: 10,
    items: [
      { slug: 'turk-kahvesi',         name: 'Türk Kahvesi',          price: 175 },
      { slug: 'double-turk-kahvesi',  name: 'Double Türk Kahvesi',   price: 200 },
      { slug: 'cay',                  name: 'Çay',                   price: 85  },
      { slug: 'buyuk-cay',            name: 'Büyük Çay',             price: 95  },
      { slug: 'kupa-cay',             name: 'Kupa Çay',              price: 115 },
      { slug: 'bitki-cayi',           name: 'Bitki Çayı',            price: 220 },
      { slug: 'espresso',             name: 'Espresso',              price: 175 },
      { slug: 'double-espresso',      name: 'Double Espresso',       price: 200 },
      { slug: 'americano',            name: 'Americano',             price: 220 },
      { slug: 'flat-white',           name: 'Flat White',            price: 240 },
      { slug: 'latte',                name: 'Latte',                 price: 240 },
      { slug: 'caramel-latte',        name: 'Caramel Latte',         price: 250 },
      { slug: 'vanilla-latte',        name: 'Vanilla Latte',         price: 250 },
      { slug: 'cappuccino',           name: 'Cappuccino',            price: 240 },
      { slug: 'mocha',                name: 'Mocha',                 price: 240 },
      { slug: 'white-mocha',          name: 'White Mocha',           price: 250 },
      // fix: "CARAMEL MACCIHATO" → Macchiato
      { slug: 'caramel-macchiato',    name: 'Caramel Macchiato',     price: 250 },
      { slug: 'filtre-kahve',         name: 'Filtre Kahve',          price: 190 },
      { slug: 'misto',                name: 'Misto',                 price: 220 },
      { slug: 'sicak-cikolata',       name: 'Sıcak Çikolata',        price: 240 },
      { slug: 'salep',                name: 'Salep',                 price: 250 },
      { slug: 'portakalli-salep',     name: 'Portakallı Salep',      price: 260 },
      { slug: 'balli-sut',            name: 'Ballı Süt',             price: 240 },
      { slug: 'cortado',              name: 'Cortado',               price: 180 },
    ],
  },

  {
    id: 'soguk-kahveler',
    title: 'Soğuk Kahveler',
    order: 2,
    vat: 10,
    items: [
      { slug: 'ice-latte',            name: 'Ice Latte',             price: 250 },
      { slug: 'ice-vanilla-latte',    name: 'Ice Vanilla Latte',     price: 260 },
      { slug: 'ice-caramel-latte',    name: 'Ice Caramel Latte',     price: 260 },
      { slug: 'ice-americano',        name: 'Ice Americano',         price: 240 },
      { slug: 'ice-mocha',            name: 'Ice Mocha',             price: 260 },
      // fix: "ICE WHİTE MOCHA" — Türkçe İ
      { slug: 'ice-white-mocha',      name: 'Ice White Mocha',       price: 260 },
      // fix: "ICE KARAMEL MACCHIATO" → sıcak versiyonuyla aynı yazım
      { slug: 'ice-caramel-macchiato', name: 'Ice Caramel Macchiato', price: 275 },
      { slug: 'affogato',             name: 'Affogato',              price: 300, leoPick: true },
    ],
  },

  {
    id: 'tatlilar',
    title: 'Tatlılar',
    order: 3,
    vat: 10,
    items: [
      { slug: 'leo-waffle',           name: 'Leo Waffle',            price: 510, leoPick: true },
      { slug: 'cilekli-kruvasan',     name: 'Çilekli Kruvasan',      price: 540 },
      { slug: 'kruvasan',             name: 'Kruvasan',              price: 240 },
      { slug: 'brownie',              name: 'Brownie',               price: 360 },
      { slug: 'dondurmali-brownie',   name: 'Dondurmalı Brownie',    price: 475 },
      { slug: 'limonlu-cheesecake',   name: 'Limonlu Cheesecake',    price: 300 },
      { slug: 'san-sebastian',        name: 'San Sebastian',         price: 360, leoPick: true },
      { slug: 'leo-sufle',            name: 'Leo Sufle',             price: 300, leoPick: true },
      { slug: 'dondurmali-sufle',     name: 'Dondurmalı Sufle',      price: 415 },
      { slug: 'cookie-pie',           name: 'Cookie Pie',            price: 320 },
      { slug: 'dondurmali-cookie-pie', name: 'Dondurmalı Cookie Pie', price: 435 },
      { slug: 'cilekli-rulo-pasta',   name: 'Çilekli Rulo Pasta',    price: 330 },
      // fix: "ÇİKOLATLI" → Çikolatalı (5 üründe)
      { slug: 'frambuaz-cikolatali-rulo-pasta', name: 'Frambuaz Çikolatalı Rulo Pasta', price: 330 },
      { slug: 'cilekli-pasta',        name: 'Çilekli Pasta',         price: 360 },
      { slug: 'cikolatali-pasta',     name: 'Çikolatalı Pasta',      price: 360 },
      { slug: 'cilekli-cikolatali-pasta', name: 'Çilekli Çikolatalı Pasta', price: 360 },
      { slug: 'frambuaz-cikolatali-pasta', name: 'Frambuaz Çikolatalı Pasta', price: 360 },
      { slug: 'nata',                 name: 'Nata',                  price: 180 },
    ],
  },

  {
    id: 'frozenler',
    title: 'Frozenler',
    order: 4,
    vat: 10,
    items: [
      { slug: 'cilekli-frozen',       name: 'Çilekli Frozen',        price: 250 },
      { slug: 'mango-frozen',         name: 'Mango Frozen',          price: 250 },
      { slug: 'yesil-elma-frozen',    name: 'Yeşil Elma Frozen',     price: 250 },
      { slug: 'karpuz-frozen',        name: 'Karpuz Frozen',         price: 250 },
      { slug: 'karadut-frozen',       name: 'Karadut Frozen',        price: 250 },
      { slug: 'ananas-frozen',        name: 'Ananas Frozen',         price: 250 },
      { slug: 'kavun-frozen',         name: 'Kavun Frozen',          price: 250 },
      { slug: 'seftali-frozen',       name: 'Şeftali Frozen',        price: 250 },
      { slug: 'passion-fruit-frozen', name: 'Passion Fruit Frozen',  price: 250 },
    ],
  },

  {
    id: 'milkshakeler',
    title: 'Milkshakeler',
    order: 5,
    vat: 10,
    items: [
      { slug: 'cikolatali-milkshake', name: 'Çikolatalı Milkshake',  price: 260 },
      { slug: 'cilekli-milkshake',    name: 'Çilekli Milkshake',     price: 260 },
      { slug: 'muzlu-milkshake',      name: 'Muzlu Milkshake',       price: 260 },
      { slug: 'karamelli-milkshake',  name: 'Karamelli Milkshake',   price: 260 },
      { slug: 'vanilyali-milkshake',  name: 'Vanilyalı Milkshake',   price: 260 },
      { slug: 'oreo-milkshake',       name: 'Oreo Milkshake',        price: 270 },
      { slug: 'lotus-milkshake',      name: 'Lotus Milkshake',       price: 270 },
      { slug: 'brownie-milkshake',    name: 'Brownie Milkshake',     price: 270 },
    ],
  },

  {
    // NOT: kategori adı "Kokteyller" ama 4 ürünün hepsi alkolsüz.
    // Sunumda "Serinletici" / "Alkolsüz Kokteyl" önerilebilir — Leo'ya sor.
    id: 'kokteyller',
    title: 'Kokteyller',
    order: 6,
    vat: 10,
    items: [
      { slug: 'karpuz-bogurtlen-limonata', name: 'Karpuz & Böğürtlen Limonata', price: 290 },
      { slug: 'cool-lime',            name: 'Cool Lime',             price: 280 },
      { slug: 'pina-colada',          name: 'Pina Colada',           price: 280 },
      { slug: 'hibiscus-yaban-mersini', name: 'Hibiscus & Yaban Mersini', price: 290 },
    ],
  },

  {
    id: 'mesrubat',
    title: 'Meşrubat',
    order: 7,
    vat: 10,
    items: [
      { slug: 'su',                   name: 'Su',                    price: 60  },
      { slug: 'sade-soda',            name: 'Sade Soda',             price: 125 },
      { slug: 'churchill',            name: 'Churchill',             price: 190 },
      { slug: 'red-bull',             name: 'Red Bull',              price: 180 },
      { slug: 'leo-limonata',         name: 'Leo Limonata',          price: 175, leoPick: true },
      { slug: 'cilekli-limonata',     name: 'Çilekli Limonata',      price: 180 },
      { slug: 'kola',                 name: 'Kola',                  price: 125 },
      { slug: 'sprite',               name: 'Sprite',                price: 125 },
      { slug: 'sikma-portakal-suyu',  name: 'Sıkma Portakal Suyu',   price: 260 },
    ],
  },

  {
    id: 'yiyecekler',
    title: 'Yiyecekler',
    order: 8,
    vat: 20,
    items: [
      { slug: 'kahvalti-tabagi', name: 'Kahvaltı Tabağı', price: 550,
        // fix: "sosıs" → sosis
        desc: 'Piliç sosis, omlet, tereyağlı kruvasan, mantar, roka, fırın cherry domates, rende kaşar' },
      { slug: 'omlet', name: 'Omlet', price: 250,
        desc: '2 köy yumurtası, roka, cherry domates' },
      { slug: 'kasarli-omlet', name: 'Kaşarlı Omlet', price: 275,
        desc: '2 köy yumurtası, rende kaşar, roka, cherry domates' },
      { slug: 'mantarli-omlet', name: 'Mantarlı Omlet', price: 300,
        desc: '2 köy yumurtası, mantar, roka, cherry domates' },

      { slug: 'yumurtali-somon-fume-eksi-maya', name: 'Yumurtalı Somon Füme · Ekşi Maya', price: 470,
        desc: 'Avokado, somon füme, göz yumurta, kızarmış ekşi maya ekmek, Akdeniz yeşillikleri, salatalık, domates, mısır, siyah zeytin, zeytinyağlı limon sos' },
      { slug: 'mozzarella-eksi-maya', name: 'Mozzarella · Ekşi Maya', price: 360,
        desc: 'Suda mozzarella, roka, domates, kızarmış ekşi maya ekmek, pesto sos, Akdeniz yeşillikleri, salatalık, cherry domates, mısır, siyah zeytin, zeytinyağlı limon sos' },
      { slug: 'yumurtali-pastirma-eksi-maya', name: 'Yumurtalı Pastırma · Ekşi Maya', price: 420,
        desc: 'Avokado, kızarmış ekşi maya ekmek, göz yumurta, zeytinyağlı pastırma, roka, salatalık, cherry domates, siyah zeytin, mısır, zeytinyağlı limon sos' },
      { slug: 'somon-fume-labne-eksi-maya', name: 'Somon Füme & Labne · Ekşi Maya', price: 450,
        desc: 'Avokado, somon füme, labne, göz yumurta, kızarmış ekşi maya ekmek, Akdeniz yeşillikleri, salatalık, cherry domates, siyah zeytin, mısır, zeytinyağlı limon sos' },

      { slug: '4-peynirli-tost', name: '4 Peynirli Tost', price: 350,
        // fix: "maydonoz" → maydanoz (6 üründe), "pulbiberli" → pul biberli
        desc: 'Kaşar, çedar, beyaz peynir, parmesan, cherry domates, salatalık, maydanoz, kekikli pul biberli karışık zeytin' },
      { slug: 'kasarli-tost', name: 'Kaşarlı Tost', price: 320,
        desc: 'Dilim kaşar, salatalık, cherry domates, maydanoz, kekikli pul biberli karışık zeytin' },
      { slug: 'karisik-tost', name: 'Karışık Tost', price: 350,
        desc: 'Sucuk, dilim kaşar, cherry domates, salatalık, maydanoz, kekikli pul biberli karışık zeytin' },
      { slug: 'kavurmali-kasarli-tost', name: 'Kavurmalı Kaşarlı Tost', price: 420,
        desc: 'Kavurma, dilim kaşar, cherry domates, salatalık, maydanoz, kekikli pul biberli karışık zeytin' },
      { slug: 'bazlama-tost', name: 'Bazlama Tost', price: 370,
        desc: 'Sucuk, dilim kaşar, pesto sos, cherry domates, salatalık, maydanoz, kekikli pul biberli karışık zeytin' },

      // fix: "CLUP" → Club
      { slug: 'club-sandvic', name: 'Club Sandviç', price: 500,
        desc: 'Tavuk bonfile, marul, turşu, domates, sarımsaklı mayonez, baharatlı patates' },
      // fix: "DANAJAMBON" → Dana Jambon
      { slug: 'kruvasan-dana-jambon', name: 'Kruvasan · Dana Jambon', price: 580,
        desc: 'Labne, roka, dana jambon, çedar, zeytinyağı' },
      { slug: 'kruvasan-hindi-fume', name: 'Kruvasan · Hindi Füme', price: 560,
        desc: 'Labne, leo sos, marul, hindi füme, domates, çedar, rende kaşar, zeytinyağı' },
      { slug: 'kruvasan-mozzarella', name: 'Kruvasan · Mozzarella', price: 530,
        desc: 'Pesto sos, roka, mozzarella, domates, zeytinyağı' },

      { slug: 'leo-burger', name: 'Leo Burger', price: 730, leoPick: true,
        desc: '140 g köfte, çedar, turşu, domates, karamelize soğan, leo sos, baharatlı patates' },
      // fix: "loe sos" → leo sos
      { slug: 'sarkuteri-burger', name: 'Şarküteri Burger', price: 820,
        desc: '140 g köfte, turşu, domates, karamelize soğan, füme et, dana jambon, suda mozzarella, leo sos, baharatlı patates' },
      { slug: 'hot-dog', name: 'Hot Dog', price: 590,
        desc: 'Kıyma, karamelize soğan, dana sosis, füme et, leo sos, soğan çıtırı, baharatlı patates' },
      { slug: 'frankfurter-tabagi', name: 'Frankfurter Tabağı', price: 550,
        desc: '2 piliç sosis, patates, çedarlı mantar, roka, cherry domates, rende kaşar' },
      { slug: 'patates-kizartmasi', name: 'Patates Kızartması', price: 300 },

      // TEYİT: ad "Dana Ham Pizza", açıklama "dana füme et" diyor
      { slug: 'dana-ham-pizza', name: 'Dana Ham Pizza', price: 900,
        // fix: "permasan" → parmesan
        desc: 'Pizza sos, mozzarella, dana füme et, fesleğen, rende parmesan' },
      { slug: 'margarita-pizza', name: 'Margarita Pizza', price: 650,
        desc: 'Pizza sos, mozzarella, cherry domates, pesto sos, fesleğen, rende parmesan' },
      // fix: "Buratta" → Burrata
      { slug: 'burrata-peynirli-pizza', name: 'Burrata Peynirli Pizza', price: 1080,
        desc: 'Burrata, pizza sos, mozzarella, mortadella, fesleğen, rende parmesan' },
      { slug: 'leo-pizza', name: 'Leo Pizza', price: 1180, leoPick: true,
        // fix: "kaparı" → kapari
        desc: 'Pizza sos, mozzarella, karides, kalamar, karamelize soğan, kapari çiçeği, fesleğen, rende parmesan' },

      // fix: "ŞİNİTZEL" → Şnitzel
      { slug: 'tavuk-snitzel', name: 'Tavuk Şnitzel', price: 700,
        desc: '180 g tavuk bonfile, limon, tereyağı, baharatlı patates' },
      { slug: 'bonfile', name: 'Bonfile', price: 1100,
        desc: '180 g marine bonfile, baby patates, mantar-soğan-maydanoz mix' },

      // fix: "FETTUCİNİ" → Fettuccine
      { slug: 'karidesli-fettuccine', name: 'Karidesli Fettuccine', price: 750,
        desc: 'Karides, domates sos, acı sos, pesto sos' },
      { slug: 'tavuklu-alfredo', name: 'Tavuklu Alfredo', price: 650,
        desc: 'Krema, mantar, renkli biberler, pesto sos' },
      { slug: 'bonfileli-alfredo', name: 'Bonfileli Alfredo', price: 700,
        desc: 'Krema, mantar, soğan, pesto sos' },
      { slug: 'bolonez-soslu-spagetti', name: 'Bolonez Soslu Spagetti', price: 580,
        desc: 'Domates sos, kıyma, pesto sos' },
      // fix: "ARABİATA" → Arrabbiata
      { slug: 'penne-arrabbiata', name: 'Penne Arrabbiata', price: 450,
        desc: 'Domates sos, acı sos, siyah zeytin, pesto sos' },

      // fix: "MAHSÜLLÜ" → Mahsullü
      { slug: 'deniz-mahsullu-salata', name: 'Deniz Mahsullü Salata', price: 900,
        desc: 'Mix deniz mahsulü, Akdeniz yeşillikleri, yeşil zeytin, kapari çiçeği, kırmızı soğan, zeytinyağlı limon sos' },
      { slug: 'sezar-salata', name: 'Sezar Salata', price: 590,
        // fix: "kroton" → kruton
        desc: '120 g tavuk bonfile, marul, sezar sos, kruton, cherry domates' },
      { slug: 'akdeniz-peynirli-salata', name: 'Akdeniz Peynirli Salata', price: 460,
        desc: 'Akdeniz yeşillikleri, köz kırmızı biber, siyah zeytin, beyaz peynir, cherry domates, salatalık, zeytinyağlı limon sos, pul biber, kekik' },
    ],
  },
];

/* ============================================================
   EKSTRALAR
   QRall'da bunlar ayrı ürün olarak listeleniyordu (Meşrubat ve Tatlılar
   içinde). Modifier oldukları için ayrıldı — menüde ürün kartı değil,
   ilgili bölümün altında tek satır şerit olarak gösterilmeli.
   ============================================================ */

export const EXTRAS: Extra[] = [
  { slug: 'ekstra-shot', name: 'Ekstra Shot',  price: 70, appliesTo: ['sicaklar', 'soguk-kahveler'] },
  { slug: 'surup',       name: 'Şurup',        price: 60, appliesTo: ['sicaklar', 'soguk-kahveler'] },
  { slug: 'laktozsuz-sut', name: 'Laktozsuz Süt', price: 55, appliesTo: ['sicaklar', 'soguk-kahveler'] },
  { slug: 'ekstra-sut',  name: 'Ekstra Süt',   price: 50, appliesTo: ['sicaklar', 'soguk-kahveler'] },
  { slug: 'bal',         name: 'Bal',          price: 50, appliesTo: ['sicaklar'] },
  { slug: 'ek-sos',      name: 'Ek Sos',       price: 85, appliesTo: ['tatlilar'] },
];

/* ============================================================
   ÖNE ÇIKANLAR / HAFTANIN TERCİHLERİ
   Slider bu listeyi kullanır. Sıra = gösterim sırası.
   TEYİT: Leo haftalık güncelleyecekse bu dizi tek dokunuş noktası olmalı.
   ============================================================ */

/* Şerit fotoğraf ağırlıklı — fotoğrafsız ürün giremez.
   affogato → ice-americano, leo-limonata → cilekli-kruvasan (04.08.2026) */
export const FEATURED: string[] = [
  'leo-waffle',
  'leo-burger',
  'leo-pizza',
  'burrata-peynirli-pizza',
  'san-sebastian',
  'kahvalti-tabagi',
  'ice-americano',
  'cilekli-kruvasan',
];

/** Hero'daki tek büyük kart */
export const HERO_ITEM = 'leo-burger';

/* ============================================================
   MEKAN BİLGİSİ
   TEYİT: aşağıdaki alanların hepsi ortağın demosundan (Google Places)
   geldi. Yayına almadan önce Leo'dan tek tek doğrulanacak.
   ============================================================ */

export interface Venue {
  key: 'cafe' | 'lounge';
  name: string;
  eyebrow: string;
  tagline: string;
  /** null = veri yok, ekranda "yakında" gösterilecek */
  categories: Category[] | null;
  contact: {
    address: string | null;   // TEYİT
    phone: string | null;     // TEYİT
    instagram: string | null; // TEYİT
    mapsUrl: string | null;   // TEYİT
  };
  /** gün → [açılış, kapanış] saat; 25 = ertesi gün 01.00 */
  hours: Record<number, [number, number]> | null;
  hoursText: string | null;   // TEYİT
}

export const VENUES: Venue[] = [
  {
    key: 'cafe',
    name: 'Cafe Leo',
    eyebrow: 'Kafe & Teras · Sinanoba',
    tagline: 'Sabah kahvesinden gün batımına, terasta.',
    categories: CATEGORIES,
    contact: {
      address: 'Sinanoba, Mustafa Kemal Blv. No:54, Büyükçekmece', // TEYİT
      phone: '+905431779663',                                      // TEYİT
      instagram: 'https://www.instagram.com/cafeleoteras/',        // TEYİT
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=40.9957484,28.5397417&query_place_id=ChIJO89T4VBntRQR32ZYApreDUI', // TEYİT
    },
    hours: { 0:[10,24], 1:[10,24], 2:[10,24], 3:[10,24], 4:[10,24], 5:[10,24], 6:[10,24] }, // TEYİT
    hoursText: 'Her gün 10.00 – 00.00', // TEYİT
  },
  {
    key: 'lounge',
    name: 'Leo Lounge',
    eyebrow: 'Lounge · Ünlüsoy Caddesi',
    tagline: 'Işık kısılır, gün üzerinden düşer.',
    categories: null, // menü verisi henüz elimizde yok
    contact: {
      address: 'Sinanoba, Ünlüsoy Cd., Büyükçekmece', // TEYİT
      phone: null,
      instagram: null,
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=40.9985511,28.5438501&query_place_id=ChIJo3xPAABntRQRV_qZNT6yuG8', // TEYİT
    },
    hours: null,
    hoursText: null,
  },
];

/* ============================================================
   YARDIMCILAR
   ============================================================ */

export const ALL_ITEMS: MenuItem[] = CATEGORIES.flatMap(c => c.items);

export const itemBySlug = (slug: string): MenuItem | undefined =>
  ALL_ITEMS.find(i => i.slug === slug);

export const categoryOfSlug = (slug: string): Category | undefined =>
  CATEGORIES.find(c => c.items.some(i => i.slug === slug));

export const extrasFor = (id: CategoryId): Extra[] =>
  EXTRAS.filter(e => e.appliesTo.includes(id));

/** 250 → "250 ₺" */
export const formatPrice = (p: number): string => `${p} ₺`;
