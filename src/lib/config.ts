import { hasPhotoFile } from './photos';

/* ============================================================
   Sunum öncesi çevrilebilir anahtarlar.
   ============================================================ */

/** Fotoğraflar `public/foto/` altında. */
export const FOTO_VAR = true;

/** Dosya adı: `public/foto/<slug>.webp` */
export const FOTO_EXT = 'webp';

/**
 * Tipografik kalan GRUPLAR (alt kategori slug'ları).
 *
 * Karar artık ana kategoride değil ALT KATEGORİDE: "Soğuk İçecekler"
 * beş alt gruptan oluşuyor ve hepsi bardağa geliyor. Bölünme keyfi
 * değil: TABAĞA gelen fotoğraflı, BARDAĞA gelen tipografik. Sunumda
 * tek cümleyle savunulur.
 *
 * Aşağıdaki beş grup Soğuk İçecekler'in tamamı — yani o kategori
 * baştan sona tipografik. Sıcak İçecekler, Tatlılar, Yiyecekler ve
 * İmza Ürünler fotoğraflı.
 */
export const NO_PHOTO: string[] = [
  'mokteyller',     // 0/4
  'soguk-kahveler', // 1/8 — tek fotoğraflı satır en kötü görünüm
  'milkshakeler',   // 0/8
  'frozenler',      // 0/9
  'mesrubatlar',    // 0/9
];

/* Bir zamanlar burada SKIP_PHOTO listesi vardı: flat-white, caramel-latte,
   vanilla-latte, mocha, white-mocha kaynakta latte ile bayt bayt özdeş kareyi
   paylaşıyordu. Beş dosya diskten silindi; artık kararı tek yer veriyor —
   `lib/photos.ts` manifestosu. Aynı gerçek iki yerde durmuyor. */

/**
 * Kategori rayı çiplerinde WebGL specular kenar ışığı.
 *
 * KAPALI (onaylandı). Gerekçe: aydınlık temada kazancı neredeyse
 * görünmez, düşük segment Android'de context kaybı riski var, ray
 * zaten sticky + scroll spy ile iş görüyor. Anahtar duruyor.
 */
export const SPECULAR = false;

/** Grup (alt kategori) fotoğraf öncelikli düzende mi? */
export const isPhotoGroup = (group: string): boolean =>
  FOTO_VAR && !NO_PHOTO.includes(group);

/**
 * Dosyası GERÇEKTEN var mı? Grup kapısını atlar.
 *
 * Küratörlü yerlerde (öne çıkanlar şeridi, hero kartı) doğrudan bu
 * kullanılır: şerit fotoğraf ağırlıklı ve tipografik bir gruptan gelen
 * tek fotoğraflı ürün (ice-americano) oraya girebilir.
 */
export const hasPhoto = (slug: string): boolean => FOTO_VAR && hasPhotoFile(slug);

/**
 * Bu ürün liste içinde görsel basacak mı?
 *
 * Üç kapı: genel anahtar → grubun düzeni → dosyanın gerçekten var
 * olması. Üçü de geçmezse <img> hiç üretilmez — 404 yok, düzen
 * sıçraması yok, satır DOĞUŞTAN tipografik gelir.
 */
export const itemHasPhoto = (slug: string, group: string): boolean =>
  isPhotoGroup(group) && hasPhoto(slug);
