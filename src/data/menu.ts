/* ============================================================
   CAFE LEO — menü verisinin TİPLİ GÖRÜNÜMÜ

   Veri artık burada değil: tek kaynak `src/data/menu.json`.
   Bu modül onu okur, dili çözer ve bileşenlerin beklediği düz
   nesnelere dönüştürür. Görsel çıktı değişmez; yalnız veri nereden
   okunuyor değişti.

   NEDEN JSON: kategori ağacı iki seviyeli oldu ve ürün listeleri
   müşteriden gelmeye devam edecek. Menüyü güncelleyen kişinin
   TypeScript'e dokunması gerekmesin diye veri koddan ayrıldı.

   ŞEMA NOTLARI (menu.json)
   · schema: 1 — kırıcı değişiklikte artar.
   · Metin alanları TEK DİLLİ OLSA DA sözlük: { "tr": "…" }.
     İngilizce/Arapça eklendiğinde migrasyon gerekmesin.
   · price TAMSAYI KURUŞ: 73000 = 730,00 ₺. Ondalık yok, kayan nokta
     yok. Biçimlendirme render sırasında (formatPrice).
   · price: null → ekranda "—". Teyit edilmemiş fiyat YAZILMAZ.
   · Bir alt bölümün `items` dizisinde STRING görürsen o bir
     REFERANS: ürün başka bir bölümde tanımlı, burada yalnız
     gösteriliyor. "İmza Ürünler" böyle kuruldu — aynı ürün iki kez
     yazılmıyor, fiyatı tek yerden geliyor.
   · `photo` alanı ŞEMADA YOK. Bir ürünün görseli olup olmadığı
     build zamanında `public/foto/<slug>.webp` manifestosundan
     okunuyor (lib/photos.ts). Aynı gerçeği iki yerde tutmamak için
     veriye alınmadı — dosyayı klasöre koymak yetiyor.
   · `note` alanı normalizasyon izidir (ALL CAPS düzeltmeleri, yazım
     hataları, TEYİT işaretleri). Ekrana basılmaz; kaynağa dönmek
     gerekirse iz burada.

   TEYİT BEKLEYEN
   · Yiyecekler'in dört alt kategorisine ürün dağılımı (Kahvaltı
     müşteriden geldi; Atıştırmalıklar / Ana Yemekler / Salatalar
     bizim ayrımımız).
   · Sıcak İçecekler ve Tatlılar'ın alt kategorileri — müşteri
     onaylayacak.
   · İmza Ürünler'deki iki mokteyl seçimi; ikisinin de fotoğrafı
     henüz yok, dosya gelince kendiliğinden fotoğraflı olurlar.
   · VENUE.contact altındaki her alan.
   ============================================================ */

import rawFile from './menu.json';

/* ------------------------------------------------------------
   HAM ŞEKİL — menu.json'un birebir karşılığı.
   Tek bir `as unknown as` burada yapılıyor; modülün geri kalanı
   ve bütün bileşenler tam tipli çalışıyor.
   ------------------------------------------------------------ */

type Loc = Record<string, string>;

interface RawItem {
  slug: string;
  name: Loc;
  description?: Loc;
  price: number | null;
  badges?: string[];
  note?: string;
}

/** ürün tanımı ya da başka bir bölümdeki ürüne referans (slug) */
type RawEntry = RawItem | string;

interface RawSubsection {
  slug: string;
  /** null → alt başlık basılmaz (tek gruplu bölüm) */
  name: Loc | null;
  items: RawEntry[];
}

interface RawSection {
  slug: string;
  name: Loc;
  /** KDV — muhasebe için taşınıyor, ekranda gösterilmiyor.
      null: bölüm referanslardan oluşuyor, oran ürünün kendi
      bölümünden geliyor. */
  vat: 10 | 20 | null;
  subsections: RawSubsection[];
}

interface RawExtra {
  slug: string;
  name: Loc;
  price: number;
  /** bölüm ya da alt bölüm slug'ı */
  appliesTo: string[];
}

interface RawVenue {
  slug: 'cafe' | 'lounge';
  name: Loc;
  eyebrow: Loc;
  tagline: Loc;
  contact: {
    address: string | null;
    phone: string | null;
    instagram: string | null;
    mapsUrl: string | null;
  };
  hours: Record<string, [number, number]> | null;
  hoursText: Loc | null;
  hero: string | null;
  featured: string[];
  /** null = veri yok, ekranda "yakında" gösterilecek */
  sections: RawSection[] | null;
  extras: RawExtra[];
}

interface RawFile {
  schema: number;
  locales: { default: string; enabled: string[] };
  venues: RawVenue[];
}

const raw = rawFile as unknown as RawFile;

/* ------------------------------------------------------------
   DİL ÇÖZÜMÜ
   Tek dil açık olduğu sürece bu iki satır. enabled genişlediğinde
   burası Astro'nun locale'ini okuyacak; bileşenlere dokunulmayacak.
   ------------------------------------------------------------ */

export const LOCALE = raw.locales.default;

const t = (d: Loc): string => d[LOCALE] ?? Object.values(d)[0] ?? '';
const tOpt = (d: Loc | null | undefined): string | null => (d ? t(d) : null);

/* ------------------------------------------------------------
   ÇÖZÜLMÜŞ TİPLER — bileşenlerin gördüğü şekil
   ------------------------------------------------------------ */

export interface MenuItem {
  /** foto/<slug>.webp ve büyük görünüm eşlemesi için */
  slug: string;
  name: string;
  desc?: string;
  /** TAMSAYI KURUŞ. null → fiyat teyit edilmedi, ekranda "—". */
  price: number | null;
  /** Leo'nun tercihi rozeti */
  leoPick: boolean;
  badges: string[];
  vat: 10 | 20 | null;
}

export interface Subsection {
  slug: string;
  /** null → alt başlık ve çip basılmaz */
  title: string | null;
  items: MenuItem[];
  /** bu alt gruba özel ekstralar (ör. Soğuk Kahveler → şurup) */
  extras: Extra[];
}

export interface Section {
  slug: string;
  title: string;
  vat: 10 | 20 | null;
  subs: Subsection[];
  /** bölümün tamamına uygulanan ekstralar */
  extras: Extra[];
  /** bölümdeki toplam ürün adedi — başlıktaki sayaç */
  count: number;
  /**
   * Bölüm YALNIZCA referanslardan mı oluşuyor? (İmza Ürünler)
   *
   * Böyle bir bölüm kendi başına bir seçki ifadesidir: başlığı zaten
   * "İmza Ürünler" diyor. Satır satır "Leo'nun tercihi" rozeti
   * basmak hem gürültü, hem de tercihin anlamını aşındırır —
   * "tercih" tek bir şeye işaret eder. Rozet ürünün KENDİ
   * bölümünde kalıyor; orada bilgi taşıyor.
   *
   * Slug'a bakılmıyor, yapıya bakılıyor: yarın ikinci bir seçki
   * bölümü eklenirse kural kendiliğinden ona da uyar.
   */
  refsOnly: boolean;
}

export interface Extra {
  slug: string;
  name: string;
  price: number;
  appliesTo: string[];
}

export interface Venue {
  key: 'cafe' | 'lounge';
  name: string;
  eyebrow: string;
  tagline: string;
  /** null = veri yok, ekranda "yakında" gösterilecek */
  sections: Section[] | null;
  contact: RawVenue['contact'];
  hours: Record<string, [number, number]> | null;
  hoursText: string | null;
  hero: string | null;
  featured: string[];
}

/* ------------------------------------------------------------
   ÇÖZÜMLEME

   İki geçiş: önce bütün TANIMLI ürünler indekslenir (referanslar
   atlanır), sonra bölümler kurulurken referanslar bu indeksten
   çözülür. Böylece "İmza Ürünler" listesi kendi bölümlerinden
   önce gelse bile çalışır.
   ------------------------------------------------------------ */

const isRef = (e: RawEntry): e is string => typeof e === 'string';

const toItem = (r: RawItem, vat: 10 | 20 | null): MenuItem => {
  const badges = r.badges ?? [];
  const desc = tOpt(r.description);
  return {
    slug: r.slug,
    name: t(r.name),
    ...(desc ? { desc } : {}),
    price: r.price,
    leoPick: badges.includes('leo-pick'),
    badges,
    vat,
  };
};

function buildVenue(v: RawVenue): Venue {
  const extras: Extra[] = v.extras.map((e) => ({
    slug: e.slug,
    name: t(e.name),
    price: e.price,
    appliesTo: e.appliesTo,
  }));
  const extrasFor = (key: string): Extra[] => extras.filter((e) => e.appliesTo.includes(key));

  let sections: Section[] | null = null;

  if (v.sections) {
    /* 1. geçiş — tanımlı ürünlerin indeksi */
    const defined = new Map<string, MenuItem>();
    for (const sec of v.sections) {
      for (const sub of sec.subsections) {
        for (const entry of sub.items) {
          if (isRef(entry)) continue;
          defined.set(entry.slug, toItem(entry, sec.vat));
        }
      }
    }

    /* 2. geçiş — bölümleri kur, referansları çöz */
    sections = v.sections.map((sec) => {
      const subs: Subsection[] = sec.subsections.map((sub) => ({
        slug: sub.slug,
        title: tOpt(sub.name),
        extras: extrasFor(sub.slug),
        items: sub.items
          .map((entry) => (isRef(entry) ? defined.get(entry) : toItem(entry, sec.vat)))
          /* Çözülemeyen referans sessizce düşer: menu.json'dan bir ürün
             silinirse sayfa kırılmaz, yalnız o satır görünmez. */
          .filter((i): i is MenuItem => i !== undefined),
      }));

      return {
        slug: sec.slug,
        title: t(sec.name),
        vat: sec.vat,
        subs,
        extras: extrasFor(sec.slug),
        count: subs.reduce((n, s) => n + s.items.length, 0),
        refsOnly: sec.subsections.every((sub) => sub.items.every(isRef)),
      };
    });
  }

  return {
    key: v.slug,
    name: t(v.name),
    eyebrow: t(v.eyebrow),
    tagline: t(v.tagline),
    sections,
    contact: v.contact,
    hours: v.hours,
    hoursText: tOpt(v.hoursText),
    hero: v.hero,
    featured: v.featured,
  };
}

export const VENUES: Venue[] = raw.venues.map(buildVenue);

/* ------------------------------------------------------------
   YARDIMCILAR
   ------------------------------------------------------------ */

const ALL_SECTIONS: Section[] = VENUES.flatMap((v) => v.sections ?? []);

export const ALL_ITEMS: MenuItem[] = ALL_SECTIONS.flatMap((s) =>
  s.subs.flatMap((sub) => sub.items),
);

export const itemBySlug = (slug: string): MenuItem | undefined =>
  ALL_ITEMS.find((i) => i.slug === slug);

/**
 * Ürünün GÖRSEL DÜZEN GRUBU — fotoğraflı mı tipografik mi kararının
 * anahtarı. Karar kategori değil ALT KATEGORİ bazında: Soğuk
 * İçecekler'in altında Frozenler tipografik, Soğuk Kahveler de öyle;
 * ama İmza Ürünler'de aynı mokteyl fotoğraf düzeninde durur.
 *
 * Bir ürün birden fazla grupta görünebildiği için (referanslar) ilk
 * eşleşme değil, ÇAĞIRANIN verdiği grup kullanılır — bu yardımcı
 * yalnız grubu bilinmeyen tekil aramalar için.
 */
export const groupOfSlug = (slug: string): string | undefined => {
  for (const sec of ALL_SECTIONS) {
    for (const sub of sec.subs) {
      if (sub.items.some((i) => i.slug === slug)) return sub.slug;
    }
  }
  return undefined;
};

export const sectionOfSlug = (slug: string): Section | undefined =>
  ALL_SECTIONS.find((s) => s.subs.some((sub) => sub.items.some((i) => i.slug === slug)));

/**
 * Kuruş → ekran metni.
 *   73000 → "730 ₺"      (tam lira: ondalık basılmaz)
 *   73050 → "730,50 ₺"
 *   null  → "—"          (teyit edilmemiş fiyat yazılmaz)
 */
export const formatPrice = (kurus: number | null): string => {
  if (kurus === null) return '—';
  const lira = Math.trunc(kurus / 100);
  const kr = Math.abs(kurus % 100);
  return kr === 0
    ? `${lira} ₺`
    : `${lira},${String(kr).padStart(2, '0')} ₺`;
};
