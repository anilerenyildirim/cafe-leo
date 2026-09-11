/* ============================================================
   MENÜ KARTLARI — /menu kategori ızgarasının tek kaynağı

   KARTLAR ARTIK menu.json'DAN TÜRETİLİYOR. Bir bölüm = bir kart,
   sıra verinin sırası, başlık verinin başlığı. Bu dosyada elle
   yazılmış kategori listesi YOK.

   ── NEDEN DEĞİŞTİ ────────────────────────────────────────────
   Eskiden burada on altı kartlık elle yazılmış bir harita vardı:
   her kart bir `sectionSlug` gösteriyor, bazıları `items:` ile tek
   tek ürün slug'ı sayıyordu. Gerekçesi şuydu: "panel menu.json'u
   depolama düzeninde yazıyor (Yiyecekler → burgerler, kahvalti…),
   müşteri okuma düzeni istiyor (Kruvasan Sandviçler, Tostlar…);
   harita ikincisini birincinin üzerine koyar."

   O gerekçe 10 Eylül 2026'da ortadan kalktı: panel kategori ağacını
   müşterinin listesine göre yeniden kurdu (16 bölüm, aynı adlar,
   aynı sıra). Depolama düzeni ile okuma düzeni artık AYNI ŞEY.

   Harita iki bedel ödetiyordu ve ikisi de gerçekleşti:

   1. `items:` listeli kartlara panelden eklenen ürün GÖRÜNMÜYORDU —
      listeye elle yazılmadıkça.
   2. Panel `yiyecekler` bölümünü kaldırınca on iki kartın
      `sectionSlug`'ı boşa düştü ve o sayfalar "Bu kategori henüz
      hazırlanıyor" basmaya başladı. Sessizce: `cardSection()` null
      dönüyor, hata veren kimse yok.

   İkincisi asıl ders. Bu dosya artık veriye sabit bağlanmıyor;
   bağlandığı tek yer aşağıdaki KAPAK ve NO_PHOTO listeleri ve ikisi
   de derleme anında DOĞRULANIYOR (bkz. dosya sonu). Veriyle
   ayrışırlarsa Pages derlemesi kırmızı yanar — müşteri boş sayfa
   görmez.

   ── BURADA NE KALDI ──────────────────────────────────────────
   Yalnız TASARIM kararları:

   · KAPAK   — kartın kapağı hangi ürünün karesi olacak. Küratörlük
               kararı, veri değil: "Pizzalar" kartında Leo Pizza mı
               Burrata mı görünsün sorusunun cevabı menüde yazmıyor.
   · YEREL_KAPAK — kapsadığı hiçbir ürünün fotoğrafı OLMAYAN kart
               için yerel dosya kaçış kapısı (Sıcak İçecekler).
   · NO_PHOTO (lib/config.ts) — hangi grup tipografik basılacak.

   Kapak seçimi bir gün panele geçerse (şemada alt kategori için
   `icon` alanı zaten var ve panel onu dolduruyor) KAPAK da silinir,
   bu dosya tamamen türetilmiş olur.
   ============================================================ */

import { VENUES, photoOf, photoSrc, type MenuItem, type Section } from '../data/menu';
import { NO_PHOTO } from './config';

export interface MenuCard {
  /** URL parçası: /menu/<key> — bölümün slug'ı */
  key: string;
  /** kart üzerinde ve kategori sayfasının başlığında yazan ad */
  title: string;
  /**
   * Kartın kapağı olacak ÜRÜN slug'ı. Ayrı bir kapak görseli seti
   * yok — kategoriyi en iyi anlatan ürünün kendi fotoğrafı.
   */
  photo?: string;
  /**
   * KAPAK, ÜRÜNÜN FOTOĞRAFI YERİNE. `photo`dan ÖNCE gelir.
   *
   * Tek meşru kullanım: kartın kapsadığı hiçbir ürünün fotoğrafı
   * YOKKEN karta yine de bir kapak vermek. Sıcak İçecekler böyle —
   * yirmi dört ürünün hiçbirinin R2'de karesi yok ve menu.json da
   * bunu doğru söylüyor, yani `photo` zinciri boş dönüyor.
   *
   * `/` ile başlarsa yerel dosya (public/), yoksa ürün slug'ı.
   */
  cover?: string;
  /** kaynak bölüm (menu.json → section.slug). Kartla birebir aynı. */
  sectionSlug: string;
}

const cafe = VENUES.find((v) => v.key === 'cafe')!;
const SECTIONS: Section[] = cafe.sections ?? [];

/**
 * Kart kapakları — bölüm slug'ı → ürün slug'ı.
 *
 * TASARIM KARARI, veri değil. Listede olmayan bölüm kapağını kendi
 * ürünlerinden alır (ilk fotoğraflı ürün), o da yoksa tipografik
 * basılır. Yani panelde yeni kategori açıldığında burası
 * güncellenmese bile kart KIRILMIYOR — yalnız kapağı küratörlü olmuyor.
 */
const KAPAK: Record<string, string> = {
  'imza-urunler': 'leo-pizza',
  kahvaltilar: 'kahvalti-tabagi',
  burgerler: 'cheese-burger',
  pizzalar: 'burrata-peynirli-pizza',
  makarnalar: 'karidesli-fettuccine',
  sushi: 'leo-sushi',
  'kruvasan-sandvicler': 'kruvasan-dana-jambon',
  'ekmek-ustu-lezzetler': 'yumurtali-somon-fume-eksi-maya',
  'tostlar-sandvicler': 'club-sandvic',
  'leo-bowl': 'bonfile-bowl',
  salatalar: 'sezar-salata',
  'ana-yemekler': 'bonfile',
  atistirmaliklar: 'patates-kizartmasi',
  'sicak-icecekler': 'latte',
  tatlilar: 'leo-waffle',
  'soguk-icecekler': 'hibiskus',
};

/**
 * Yerel dosya kapakları. Sıcak İçecekler'in karesi bir zamanlar
 * `public/foto/` içindeydi, "kaynağı R2" gerekçesiyle kaldırıldı
 * (703c43a) ve R2'den de silinince ortada kalmadı. Git geçmişinden
 * yalnız o tek dosya geri alındı.
 */
const YEREL_KAPAK: Record<string, string> = {
  'sicak-icecekler': '/foto/latte.webp',
};

/** Müşterinin gördüğü kart listesi — sıra ve adlar menu.json'dan. */
export const MENU_CARDS: MenuCard[] = SECTIONS.map((s) => ({
  key: s.slug,
  title: s.title,
  sectionSlug: s.slug,
  photo: KAPAK[s.slug],
  cover: YEREL_KAPAK[s.slug],
}));

/**
 * Kartın gösterdiği bölüm — Section.astro'nun beklediği şekle
 * indirgenmiş hâli.
 *
 * Tek alt gruplu kartta grubun BAŞLIĞI DÜŞÜRÜLÜYOR (title: null).
 * Sayfanın kendi başlığı zaten "Kahvaltılar" diyor; hemen altında
 * ikinci bir "Kahvaltı" ara başlığı aynı şeyi iki kez söylerdi.
 * Section.astro tek gruplu bölümde çip satırını da basmıyor.
 *
 * Boş grup düşürülüyor: panelde açılıp içi doldurulmamış bir grup
 * kategori sayfasında başlıksız boşluk bırakmasın.
 */
export function cardSection(card: MenuCard): Section | null {
  const src = SECTIONS.find((s) => s.slug === card.sectionSlug);
  if (!src) return null;

  const subs = src.subs.filter((sub) => sub.items.length > 0);
  if (subs.length === 0) return null;

  const flat = subs.length === 1 ? [{ ...subs[0]!, title: null }] : subs;

  return {
    ...src,
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
  /* Ölçü şemada yok (yerel dosya) — kaynakların tamamı 1200×800 webp.
     Kutu `object-fit: cover` ile kırpıyor, yani ölçü yalnız düzen
     sıçraması payı için. */
  if (card.cover) {
    const src = card.cover.startsWith('/') ? card.cover : photoSrc('cafe', card.cover);
    return { w: 1200, h: 800, src };
  }

  if (card.photo) {
    const chosen = photoOf(card.photo);
    if (chosen) return chosen;
  }

  const sec = cardSection(card);
  for (const sub of sec?.subs ?? []) {
    for (const item of sub.items) {
      if (item.photo) return item.photo;
    }
  }
  return null;
}

/* ────────────────────────────────────────────────────────────
   DERLEME ANI DENETİMİ

   Bu dosyanın veriye bağlandığı iki yer kaldı: KAPAK ve NO_PHOTO.
   İkisi de slug tutuyor, slug'lar panelde değişebiliyor. Sessiz
   kalırlarsa bedeli görünmez oluyor:
     · bayat KAPAK    → kart küratörlü kapağını kaybeder,
     · bayat NO_PHOTO → tipografik olması gereken grup fotoğraflı
       basılır ve yarısı boş satır olur.

   10 Eylül'de tam bu sınıftan bir kopukluk on iki kategoriyi
   boşalttı ve kimse duymadı. Artık duyuluyor: derleme patlıyor.
   ──────────────────────────────────────────────────────────── */
{
  const urunSluglari = new Set(
    SECTIONS.flatMap((s) => s.subs.flatMap((u) => u.items.map((i) => i.slug))),
  );
  const grupSluglari = new Set(SECTIONS.flatMap((s) => s.subs.map((u) => u.slug)));
  const bolumSluglari = new Set(SECTIONS.map((s) => s.slug));
  const sorun: string[] = [];

  for (const [bolum, urun] of Object.entries(KAPAK)) {
    if (!bolumSluglari.has(bolum)) sorun.push(`KAPAK["${bolum}"] — böyle bir bölüm yok`);
    else if (!urunSluglari.has(urun)) sorun.push(`KAPAK["${bolum}"] = "${urun}" — böyle bir ürün yok`);
  }
  for (const bolum of Object.keys(YEREL_KAPAK)) {
    if (!bolumSluglari.has(bolum)) sorun.push(`YEREL_KAPAK["${bolum}"] — böyle bir bölüm yok`);
  }
  for (const grup of NO_PHOTO) {
    if (!grupSluglari.has(grup)) sorun.push(`NO_PHOTO "${grup}" — böyle bir alt grup yok`);
  }

  if (sorun.length) {
    throw new Error(
      `menuCards.ts menu.json ile ayrıştı — ${sorun.length} kayıt:\n  ` + sorun.join('\n  ') +
      '\n\nPanelde bir slug değişmiş olabilir. Listeyi güncelle ya da kaydı sil.',
    );
  }
}
