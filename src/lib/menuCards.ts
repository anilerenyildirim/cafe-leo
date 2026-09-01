/* ============================================================
   MENÜ KARTLARI — /menu-v2 kategori ızgarasının tek kaynağı

   Müşterinin Canva çalışmasında dokuz kart var ve o dokuz kart
   menu.json'un iki seviyeli ağacıyla BİREBİR ÖRTÜŞMÜYOR: Kahvaltı,
   Bowl, Atıştırmalıklar ve Salatalar aslında "Yiyecekler"in ALT
   kategorileri. Müşteri ızgarayı gördüğü gibi onayladı, yani karar
   şu: ızgara veriyi yeniden düzenlemiyor, verinin ÜZERİNE bir
   SUNUM HARİTASI koyuyor.

   Bu yüzden burada yeni veri yok — yalnız eşleme var. Fiyat, ürün,
   fotoğraf hâlâ tek yerden (menu.json) geliyor; panelden bir ürün
   eklenince kart sayfası kendiliğinden güncelleniyor.

   "Yiyecekler" kartı, kendi altından çekilen dört grubun GERİ
   KALANIDIR (burger, pizza, makarna, ana yemek, sushi). Aynı grup
   iki kartta görünmüyor — ızgara menünün tamamını bir kez kaplıyor.

   FOTOĞRAFI OLMAYAN KART kırılmıyor, dönüşüyor: `cardPhoto` bir şey
   bulamazsa kart tipografik basılıyor (bkz. CatCard.astro →
   .no-shot). Bugün hiçbir kart bu durumda değil.

   SICAK İÇECEKLER'İN KAPAĞI YEREL BİR DOSYA. menu.json bu ürünlerin
   fotoğrafı olduğunu söylüyor ama R2'de on sekizinin de hiçbiri yok
   (tek tek denendi, hepsi 404). Kare aslında çekilmişti: `public/foto/`
   klasöründe duruyordu, 13 Ağustos'ta "kaynağı R2" gerekçesiyle
   kaldırıldı (703c43a) ve R2'den de silinince ortada kalmadı. Git
   geçmişinden geri alındı — yalnız o tek dosya, klasörün tamamı
   değil; kalan on dokuz sıcak içecek karesi de aynı commit'te duruyor.

   Ürün SATIRLARI hâlâ tipografik, o müşteri kararı (lib/config.ts →
   NO_PHOTO). Değişen yalnız kartın kapağı.
   ============================================================ */

import { VENUES, photoOf, photoSrc, type MenuItem, type Section, type Subsection } from '../data/menu';

export interface MenuCard {
  /** URL parçası: /menu-v2/<key> */
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
   * KAÇIŞ KAPISI — menu.json ile R2 birbirini tutmadığında.
   *
   * ŞEMADAN ÖNCE GELİR, çünkü bu alanın tek anlamı "menu.json burada
   * yanılıyor". İki yönde de yanılabiliyor:
   *   · şema yok diyor, dosya var — Bowl ürünleri (bonfile-bowl,
   *     karides-bowl, tavuk-bowl, leo-sushi, pink-dream) R2'de duruyor
   *     ama menu.json onlara hâlâ `photo: null` diyor;
   *   · şema var diyor, dosya yok — sıcak içeceklerin on sekiz karesi
   *     menu.json'da bildirilmiş, R2'de hiçbiri yok.
   * İkincisinde `photo`ya öncelik verilseydi kart 404'e gidip
   * tipografiye düşerdi, yani kapak hiç görünmezdi.
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
   *
   * PANEL SENKRONU GELİNCE BU ALAN SİLİNMELİ — o an `photo` zaten
   * doğru cevabı veriyor olacak ve burası ölü kod olarak kalır.
   */
  cover?: string;
  /** kaynak ana kategori (menu.json → section.slug) */
  sectionSlug: string;
  /**
   * Bu karta girecek alt kategoriler. Boş/verilmemişse bölümün
   * TAMAMI. Sıra verideki sıradır, burada yeniden sıralanmıyor.
   */
  subs?: string[];
}

/** Canva çalışmasındaki sıra: soldan sağa, yukarıdan aşağıya. */
export const MENU_CARDS: MenuCard[] = [
  { key: 'imza-urunler',   title: 'İmza Ürünler',    photo: 'leo-pizza',            sectionSlug: 'imza-urunler' },
  { key: 'kahvalti',       title: 'Kahvaltı',        photo: 'kahvalti-tabagi',      sectionSlug: 'yiyecekler', subs: ['kahvalti'] },
  { key: 'yiyecekler',     title: 'Yiyecekler',      photo: 'cheese-burger',        sectionSlug: 'yiyecekler', subs: ['burgerler', 'pizzalar', 'makarnalar', 'ana-yemekler', 'sushi'] },
  { key: 'bowl',           title: 'Bowl Çeşitleri',  photo: 'bonfile-bowl',         cover: 'bonfile-bowl', sectionSlug: 'yiyecekler', subs: ['bowl'] },
  { key: 'atistirmaliklar', title: 'Atıştırmalıklar', photo: 'kruvasan-dana-jambon', sectionSlug: 'yiyecekler', subs: ['atistirmaliklar'] },
  { key: 'salatalar',      title: 'Salatalar',       photo: 'sezar-salata',         sectionSlug: 'yiyecekler', subs: ['salatalar'] },
  /* kapak R2'de değil, yerelde — yukarıdaki başlık notuna bakın */
  { key: 'sicak-icecekler', title: 'Sıcak İçecekler', photo: 'latte',               cover: '/foto/latte.webp', sectionSlug: 'sicak-icecekler' },
  { key: 'tatlilar',       title: 'Tatlılar',        photo: 'leo-waffle',           sectionSlug: 'tatlilar' },
  { key: 'soguk-icecekler', title: 'Soğuk İçecekler', photo: 'hibiskus',            sectionSlug: 'soguk-icecekler' },
];

const cafe = VENUES.find((v) => v.key === 'cafe')!;
const SECTIONS: Section[] = cafe.sections ?? [];

/**
 * Kartın gösterdiği bölüm — Section.astro'nun beklediği şekle
 * indirgenmiş hâli.
 *
 * Tek alt gruplu kartta grubun BAŞLIĞI DÜŞÜRÜLÜYOR (title: null).
 * Sayfanın kendi başlığı zaten "Kahvaltı" diyor; hemen altında
 * ikinci bir "Kahvaltı" ara başlığı aynı şeyi iki kez söylerdi.
 * Section.astro tek gruplu bölümde çip satırını da basmıyor.
 */
export function cardSection(card: MenuCard): Section | null {
  const src = SECTIONS.find((s) => s.slug === card.sectionSlug);
  if (!src) return null;

  const wanted = card.subs;
  const subs: Subsection[] = wanted
    ? /* sıra KARTIN listesinden, verinin sırasından değil: "Yiyecekler"
         kartında burger→pizza→makarna okunuşu müşterinin sırası */
      wanted
        .map((slug) => src.subs.find((sub) => sub.slug === slug))
        .filter((s): s is Subsection => s !== undefined)
    : src.subs;

  if (subs.length === 0) return null;

  const flat = subs.length === 1 ? [{ ...subs[0]!, title: null }] : subs;

  return {
    ...src,
    /* Kartın slug'ı bölümün slug'ı oluyor: kategori sayfasında
       #imza-urunler yerine #kahvalti gibi kartla aynı ad. */
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
