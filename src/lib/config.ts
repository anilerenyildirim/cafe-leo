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

/**
 * KARE kadrajlı fotoğraflar (1:1). Gerisi 3:2.
 *
 * Oran GRUBUN değil FOTOĞRAFIN özelliği. Bir zamanlar `#mokteyller`
 * seçicisiyle bölüme yazılmıştı ve İmza Ürünler'de kırıldı: aynı
 * Pornstar Martini karesi orada 3:2 kutuya düşüp yeniden kırpılıyordu,
 * yani kadeh listede tam, seçkide kesikti. Ürün iki bölümde birden
 * görünebildiği için (referanslar) karar ürünle birlikte seyahat
 * etmeli.
 *
 * Mokteyl kareleri dikey çekildi; 3:2'ye kırpınca elde bardak değil
 * arkadaki deniz kalıyordu. 1:1 bardağı sapıyla ve garnitürüyle
 * bırakan en dar kadraj.
 *
 * Liste elle tutuluyor: 76 fotoğrafın 5'i kare, dosyadan ölçü okumak
 * için build'e görüntü kütüphanesi sokmaya değmez. Yeni kare fotoğraf
 * eklenirse slug'ı buraya yazılır.
 */
export const SQUARE_PHOTO: string[] = [
  'pornstar-martini',
  'espresso-martini',
  'green-garden',
  'hibiskus',
  'mexican',
];

/** Fotoğraf kutusu kare mi? (Shot.astro sınıfı buradan alıyor) */
export const isSquarePhoto = (slug: string): boolean => SQUARE_PHOTO.includes(slug);

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
