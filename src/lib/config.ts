import type { CategoryId } from '../data/menu';
import { hasPhotoFile } from './photos';

/* ============================================================
   Sunum öncesi çevrilebilir anahtarlar.
   ============================================================ */

/** Fotoğraflar `public/foto/` altında. */
export const FOTO_VAR = true;

/** Dosya adı: `public/foto/<slug>.webp` */
export const FOTO_EXT = 'webp';

/**
 * Tipografik kalan kategoriler.
 *
 * Bölünme keyfi değil: TABAĞA gelen fotoğraflı, BARDAĞA gelen
 * tipografik. Sunumda tek cümleyle savunulur.
 *
 * Fotoğraf düzeni üç kategoride: sicaklar, tatlilar, yiyecekler.
 */
export const NO_PHOTO: CategoryId[] = [
  'soguk-kahveler', // 1/8 — tek fotoğraflı satır en kötü görünüm
  'frozenler',      // 0/9
  'milkshakeler',   // 0/8
  'kokteyller',     // 0/4
  'mesrubat',       // 0/9
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

/** Kategori fotoğraf öncelikli düzende mi? */
export const isPhotoCategory = (id: CategoryId): boolean =>
  FOTO_VAR && !NO_PHOTO.includes(id);

/**
 * Bu ürün görsel basacak mı?
 *
 * Üç kapı: genel anahtar → kategori düzeni → dosyanın gerçekten
 * var olması. Öne çıkanlar şeridi kategori kapısını atlar
 * (`ignoreCategory`): şerit küratörlü ve fotoğraf ağırlıklı, tipografik
 * bir kategoriden gelen tek fotoğraflı ürün (ice-americano) oraya girebilir.
 */
export const itemHasPhoto = (
  slug: string,
  catId: CategoryId,
  ignoreCategory = false,
): boolean =>
  FOTO_VAR &&
  (ignoreCategory || !NO_PHOTO.includes(catId)) &&
  hasPhotoFile(slug);
