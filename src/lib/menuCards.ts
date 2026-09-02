/* ============================================================
   MENÜ KARTLARI — /menu kategori ızgarasının tek kaynağı

   Müşterinin gördüğü kategori listesi menu.json'un iki seviyeli
   ağacıyla BİREBİR ÖRTÜŞMÜYOR ve örtüşmesi de gerekmiyor. Panelin
   yazdığı ağaç bir DEPOLAMA düzeni (Yiyecekler → burgerler,
   kahvalti, atistirmaliklar…); müşterinin istediği liste bir
   OKUMA düzeni (Kruvasan Sandviçler, Ekmek Üstü Lezzetler,
   Tostlar & Sandviçler…). Burası ikincisini birincinin ÜZERİNE
   koyan sunum haritası.

   BU AYRIM BİLEREK KORUNUYOR. menu.json'u müşterinin listesine
   göre yeniden bölmek daha temiz görünürdü ama panel o dosyayı
   HER menü güncellemesinde baştan yazıyor ("menü güncellendi
   (panel)" commit'leri) — elle yapılan her bölme bir sonraki
   güncellemede silinirdi. Harita burada durduğu sürece panel
   ürün ekleyip fiyat değiştirebiliyor, kategori okuması yerinde
   kalıyor.

   İKİ EŞLEME BİÇİMİ VAR ve ikisi de aynı işi yapmıyor:

   · `subs`  — alt kategori slug'ları. Grup verideki hâliyle
               taşınıyor; panel o gruba ürün eklerse kart
               sayfası kendiliğinden güncelleniyor.
   · `items` — ürün slug'ları. Grup verideki sınırı KESİYOR:
               "Tostlar & Sandviçler" beş tostu kahvaltıdan,
               club sandviçi burgerlerden alıyor. Panelden
               eklenen yeni ürün BURAYA YAZILMADIKÇA görünmez —
               bedeli bu, ve müşterinin listesi için kaçınılmaz.

   `items` kartında NO_PHOTO'ya dikkat: sentetik grubun slug'ı
   kartın kendi anahtarı oluyor (aşağıda), yani düzen kararı
   (lib/config.ts) o anahtara bakıyor. Bugünkü on altı kartın
   hiçbiri tipografik grup değil; tipografik bir grubu `items`
   ile bölecek olan, anahtarı NO_PHOTO'ya da eklemeli.

   FOTOĞRAFI OLMAYAN KART kırılmıyor, dönüşüyor: `cardPhoto` bir şey
   bulamazsa kart tipografik basılıyor (bkz. CatCard.astro →
   .no-shot).

   SICAK İÇECEKLER'İN KAPAĞI YEREL BİR DOSYA. Yirmi dört sıcak içeceğin
   hiçbirinin R2'de karesi yok (tek tek denendi, hepsi 404) ve menu.json
   da bunu doğru söylüyor. Kare aslında çekilmişti: `public/foto/`
   klasöründe duruyordu, 13 Ağustos'ta "kaynağı R2" gerekçesiyle
   kaldırıldı (703c43a) ve R2'den de silinince ortada kalmadı. Git
   geçmişinden geri alındı — yalnız o tek dosya, klasörün tamamı
   değil; kalan on dokuz sıcak içecek karesi de aynı commit'te duruyor.

   Ürün SATIRLARI hâlâ tipografik, o müşteri kararı (lib/config.ts →
   NO_PHOTO). Değişen yalnız kartın kapağı.
   ============================================================ */

import { VENUES, photoOf, photoSrc, type MenuItem, type Section, type Subsection } from '../data/menu';

export interface MenuCard {
  /** URL parçası: /menu/<key> */
  key: string;
  /** kart üzerinde ve kategori sayfasının başlığında yazan ad */
  title: string;
  /**
   * Kartın kapağı olacak ÜRÜN slug'ı. Ayrı bir kapak görseli seti
   * yok — kategoriyi en iyi anlatan ürünün kendi fotoğrafı, çip
   * belirteçlerindeki kuralın aynısı (menu.json → subsection.icon).
   */
  photo: string;
  /**
   * KAPAK, ÜRÜNÜN FOTOĞRAFI YERİNE. `photo`dan ÖNCE gelir.
   *
   * Bir tur menu.json ile R2 birbirini tutmadığı için vardı ve iki
   * yönde birden kullanılıyordu (şema yok diyor dosya var / şema var
   * diyor dosya yok). 2 Eylül 2026'da 127 ürünün tamamı tek tek R2'ye
   * soruldu: ARTIK UYUŞUYORLAR, panel senkronu gelmiş. O iki kaçış
   * kapısı (leo-sushi, bonfile-bowl) silindi.
   *
   * GERİYE TEK MEŞRU KULLANIM KALDI: kartın kapsadığı hiçbir ürünün
   * fotoğrafı YOKKEN karta yine de bir kapak vermek. Sıcak İçecekler
   * böyle — yirmi dört ürünün hiçbirinin R2'de karesi yok (hepsi 404,
   * tek tek denendi) ve menu.json da bunu doğru söylüyor, yani
   * `photo` zinciri boş dönüyor.
   *
   * İKİ BİÇİM ALIYOR:
   *   · slug            → adres data/menu.ts → photoSrc ile R2'den
   *                       kuruluyor, ikinci bir URL şablonu yok;
   *   · /ile başlayan yol → yerel dosya (public/), R2'de karşılığı
   *                       olmayan kare için.
   *
   * Dosya gerçekten yoksa kart kırık ikon göstermiyor: çalışma
   * anındaki emniyet ağı onu tipografik karta düşürüyor
   * (scripts/app.ts § 3).
   */
  cover?: string;
  /** kaynak ana kategori (menu.json → section.slug) */
  sectionSlug: string;
  /**
   * Bu karta girecek alt kategoriler. Boş/verilmemişse bölümün
   * TAMAMI. Sıra verideki sıradır, burada yeniden sıralanmıyor.
   */
  subs?: string[];
  /**
   * Bu karta girecek ÜRÜNLER — alt kategori sınırını kesen kartlar
   * için. `subs` ile birlikte verilmez; verilirse bu kazanır.
   * Sıra BURADAKİ sıradır (müşterinin listesindeki sıra).
   */
  items?: string[];
}

/** Müşterinin 2 Eylül 2026 listesindeki sıra. */
export const MENU_CARDS: MenuCard[] = [
  {
    key: 'imza-urunler',
    title: 'İmza Ürünler',
    photo: 'leo-pizza',
    sectionSlug: 'imza-urunler',
  },
  {
    /* Tostlar "Tostlar & Sandviçler"e taşındı; kahvaltıda tabak ve
       omletler kaldı. */
    key: 'kahvaltilar',
    title: 'Kahvaltılar',
    photo: 'kahvalti-tabagi',
    sectionSlug: 'yiyecekler',
    items: ['kahvalti-tabagi', 'omlet', 'kasarli-omlet', 'mantarli-omlet'],
  },
  {
    /* Club Sandviç "Tostlar & Sandviçler"e geçti. Hot Dog burada
       kaldı: müşterinin listesinde ayrıca geçmiyor ve burger
       tezgâhının ürünü. */
    key: 'burgerler',
    title: 'Burgerler',
    photo: 'cheese-burger',
    sectionSlug: 'yiyecekler',
    items: ['klasik-burger', 'cheese-burger', 'sarkuteri-burger', 'hot-dog'],
  },
  {
    key: 'pizzalar',
    title: 'Pizzalar',
    /* leo-pizza İmza Ürünler'in kapağı — iki kart aynı kareyi
       taşımasın diye ikinci pizza. */
    photo: 'burrata-peynirli-pizza',
    sectionSlug: 'yiyecekler',
    subs: ['pizzalar'],
  },
  {
    key: 'makarnalar',
    title: 'Makarnalar',
    photo: 'karidesli-fettuccine',
    sectionSlug: 'yiyecekler',
    subs: ['makarnalar'],
  },
  {
    key: 'sushi',
    title: 'Sushi',
    photo: 'leo-sushi',
    sectionSlug: 'yiyecekler',
    subs: ['sushi'],
  },
  {
    key: 'kruvasan-sandvicler',
    title: 'Kruvasan Sandviçler',
    photo: 'kruvasan-dana-jambon',
    sectionSlug: 'yiyecekler',
    items: ['kruvasan', 'kruvasan-dana-jambon', 'kruvasan-hindi-fume', 'kruvasan-mozzarella'],
  },
  {
    key: 'ekmek-ustu-lezzetler',
    title: 'Ekmek Üstü Lezzetler',
    photo: 'yumurtali-somon-fume-eksi-maya',
    sectionSlug: 'yiyecekler',
    items: [
      'yumurtali-somon-fume-eksi-maya',
      'somon-fume-labne-eksi-maya',
      'yumurtali-pastirma-eksi-maya',
      'mozzarella-eksi-maya',
    ],
  },
  {
    key: 'tostlar-sandvicler',
    title: 'Tostlar & Sandviçler',
    photo: 'club-sandvic',
    sectionSlug: 'yiyecekler',
    items: [
      'club-sandvic',
      '4-peynirli-tost',
      'kasarli-tost',
      'karisik-tost',
      'kavurmali-kasarli-tost',
      'bazlama-tost',
    ],
  },
  {
    key: 'leo-bowl',
    title: 'Leo Bowl Çeşitleri',
    photo: 'bonfile-bowl',
    sectionSlug: 'yiyecekler',
    subs: ['bowl'],
  },
  {
    key: 'salatalar',
    title: 'Salatalar',
    photo: 'sezar-salata',
    sectionSlug: 'yiyecekler',
    subs: ['salatalar'],
  },
  {
    key: 'ana-yemekler',
    title: 'Ana Yemekler',
    photo: 'bonfile',
    sectionSlug: 'yiyecekler',
    subs: ['ana-yemekler'],
  },
  {
    /* Kruvasanlar ve ekşi mayalar kendi kartlarına çıktı; geriye
       tabaklar ve kızartmalar kaldı. Üçü 2 Eylül 2026'da eklendi,
       fotoğrafları ve fiyatları henüz yok. */
    key: 'atistirmaliklar',
    title: 'Atıştırmalıklar',
    photo: 'patates-kizartmasi',
    sectionSlug: 'yiyecekler',
    items: [
      'patates-kizartmasi',
      'curly-patates-kizartmasi',
      'chicken-fingers',
      'frankfurter-tabagi',
      'aperatif-tabagi-2-kisilik',
    ],
  },
  {
    /* kapak R2'de değil, yerelde — yukarıdaki başlık notuna bakın */
    key: 'sicak-icecekler',
    title: 'Sıcak İçecekler',
    photo: 'latte',
    cover: '/foto/latte.webp',
    sectionSlug: 'sicak-icecekler',
  },
  {
    key: 'tatlilar',
    title: 'Tatlılar',
    photo: 'leo-waffle',
    sectionSlug: 'tatlilar',
  },
  {
    key: 'soguk-icecekler',
    title: 'Soğuk İçecekler',
    photo: 'hibiskus',
    sectionSlug: 'soguk-icecekler',
  },
];

const cafe = VENUES.find((v) => v.key === 'cafe')!;
const SECTIONS: Section[] = cafe.sections ?? [];

/**
 * Kartın gösterdiği bölüm — Section.astro'nun beklediği şekle
 * indirgenmiş hâli.
 *
 * Tek alt gruplu kartta grubun BAŞLIĞI DÜŞÜRÜLÜYOR (title: null).
 * Sayfanın kendi başlığı zaten "Kahvaltılar" diyor; hemen altında
 * ikinci bir "Kahvaltı" ara başlığı aynı şeyi iki kez söylerdi.
 * Section.astro tek gruplu bölümde çip satırını da basmıyor.
 */
export function cardSection(card: MenuCard): Section | null {
  const src = SECTIONS.find((s) => s.slug === card.sectionSlug);
  if (!src) return null;

  const subs: Subsection[] = card.items
    ? /* ÜRÜN LİSTESİ — grup sınırını kesen kart. Bölümün bütün
         ürünleri tek havuzda aranıyor: "Tostlar & Sandviçler"in
         altı ürünü iki farklı gruptan geliyor. Çözülemeyen slug
         sessizce düşüyor (panelden bir ürün silinirse sayfa
         kırılmasın), sıra KARTIN listesindeki sıra. */
      [
        {
          slug: card.key,
          title: null,
          extras: [],
          items: card.items
            .map((slug) => src.subs.flatMap((sub) => sub.items).find((i) => i.slug === slug))
            .filter((i): i is MenuItem => i !== undefined),
        },
      ].filter((sub) => sub.items.length > 0)
    : card.subs
      ? /* sıra KARTIN listesinden, verinin sırasından değil */
        card.subs
          .map((slug) => src.subs.find((sub) => sub.slug === slug))
          .filter((s): s is Subsection => s !== undefined)
      : src.subs;

  if (subs.length === 0) return null;

  const flat = subs.length === 1 ? [{ ...subs[0]!, title: null }] : subs;

  return {
    ...src,
    /* Kartın slug'ı bölümün slug'ı oluyor: kategori sayfasında
       #imza-urunler yerine #kahvaltilar gibi kartla aynı ad. */
    slug: card.key,
    title: card.title,
    subs: flat,
    count: flat.reduce((n, s) => n + s.items.length, 0),
    /* Kategori sayfasında ray yok — vurgu çipi diye bir şey de yok. */
    highlight: false,
  };
}

/**
 * Kartın kapak fotoğrafı. Sırayla:
 *   1. `cover` kaçış kapısı — elle verilmiş cevap, şemayı geçer,
 *   2. menu.json'un bu ürün için BİLDİRDİĞİ fotoğraf,
 *   3. kartın kapsadığı ilk fotoğraflı ürün,
 *   4. yoksa null → tipografik kart.
 */
export function cardPhoto(card: MenuCard): MenuItem['photo'] {
  /* Ölçü şemada yok (fotoğraf bildirilmemiş ya da yanlış bildirilmiş)
     — kaynakların tamamı 1200×800 webp, LISTE.md'de de öyle yazıyor.
     Kutu `object-fit: cover` ile kırpıyor, yani ölçü yalnız düzen
     sıçraması payı için. */
  if (card.cover) {
    const src = card.cover.startsWith('/') ? card.cover : photoSrc('cafe', card.cover);
    return { w: 1200, h: 800, src };
  }

  const chosen = photoOf(card.photo);
  if (chosen) return chosen;

  const sec = cardSection(card);
  for (const sub of sec?.subs ?? []) {
    for (const item of sub.items) {
      if (item.photo) return item.photo;
    }
  }
  return null;
}
