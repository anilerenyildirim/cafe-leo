import { photoOf } from '../data/menu';

/* ============================================================
   Sunum öncesi çevrilebilir anahtarlar.
   ============================================================ */

/**
 * Fotoğraf genel anahtarı. Kapatılırsa site tamamen tipografik kalır.
 *
 * Fotoğraflar artık `public/foto/` altında değil, R2'de
 * (`cdn.onlinemenu-qr.com`). Adres menu.json + slug'dan türetiliyor,
 * bkz. `data/menu.ts → photoSrc`.
 */
export const FOTO_VAR = true;

/**
 * Tipografik kalan GRUPLAR (alt kategori slug'ları).
 *
 * Karar ana kategoride değil ALT KATEGORİDE veriliyor.
 *
 * Eski kural "TABAĞA gelen fotoğraflı, BARDAĞA gelen tipografik"
 * diyordu ve Soğuk İçecekler baştan sona tipografikti. O kural aslında
 * bir VEKİLDİ: hangi grubun düzgün fotoğrafı var sorusunun kısa yolu.
 * Mokteyllerin beş stüdyo karesi gelince vekil çöktü — elinde iyi
 * fotoğraf varken onu bardak diye saklamanın savunması yok.
 *
 * Gerçek kural şu: GRUBUN TAMAMININ fotoğrafı varsa fotoğraflı.
 * Yarısı eksik grup fotoğraflı yapılmaz; tek fotoğraflı satırın
 * yanında dört boş satır en kötü görünüm (bkz. soguk-kahveler).
 */
export const NO_PHOTO: string[] = [
  'sicak-icecekler-liste', // müşteri kararı: kahve ve çay çeşitleri tipografik
  'soguk-kahveler', // 1/8 — tek fotoğraflı satır en kötü görünüm
  'milkshakeler',   // 0/8
  'frozenler',      // 0/9
  'mesrubatlar',    // 0/9
];

/* Bir zamanlar burada SKIP_PHOTO listesi vardı: flat-white, caramel-latte,
   vanilla-latte, mocha, white-mocha kaynakta latte ile bayt bayt özdeş kareyi
   paylaşıyordu. Beş dosya diskten silindi; artık kararı tek yer veriyor —
   `lib/photos.ts` manifestosu. Aynı gerçek iki yerde durmuyor. */

/* Bir zamanlar burada kare fotoğrafların slug listesi elle tutuluyordu:
   "76 fotoğrafın 5'i kare, dosyadan ölçü okumak için build'e görüntü
   kütüphanesi sokmaya değmez" deniyordu. Doğruydu — ama artık ölçüyü PANEL
   yüklerken alıyor ve menu.json'da bildiriyor, yani o maliyet sıfır.

   Oran bir VERİ (dosyanın gerçeği), "kare fotoğraf kare kutuda" bir TASARIM
   kararı; ikincisi Shot.astro'da duruyor. Yeni kare fotoğraf eklenince artık
   hiçbir liste güncellenmiyor. */

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
 * Fotoğrafı GERÇEKTEN var mı? Grup kapısını atlar.
 *
 * Küratörlü yerlerde (öne çıkanlar şeridi, hero kartı) doğrudan bu
 * kullanılır: şerit fotoğraf ağırlıklı ve tipografik bir gruptan gelen
 * tek fotoğraflı ürün (ice-americano) oraya girebilir.
 */
export const hasPhoto = (slug: string): boolean => FOTO_VAR && photoOf(slug) !== null;

/**
 * Bu ürün liste içinde görsel basacak mı?
 *
 * Üç kapı: genel anahtar → grubun düzeni → fotoğrafın gerçekten var
 * olması. Üçü de geçmezse <img> hiç üretilmez — 404 yok, düzen
 * sıçraması yok, satır DOĞUŞTAN tipografik gelir.
 */
export const itemHasPhoto = (slug: string, group: string): boolean =>
  isPhotoGroup(group) && hasPhoto(slug);
