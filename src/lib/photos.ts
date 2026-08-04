import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/* ============================================================
   Fotoğraf manifestosu — BUILD ZAMANINDA okunur.

   Neden dosya sistemini okuyoruz: referanstaki davranış her ürün için
   <img> basıp, dosya yoksa onerror ile yer tutucuya düşmekti. Bu
   statik bir sitede gereksiz: hangi dosyanın var olduğu build anında
   kesin olarak biliniyor. Manifesto sayesinde

     · eksik ürün için hiç istek atılmaz (95 üründe 3 adet 404 yok)
     · konsol temiz kalır
     · onerror'ün yarattığı düzen sıçraması olmaz — satır DOĞUŞTAN
       tipografik gelir, sonradan çökmez

   Runtime'daki .shot-failed ağı yine de duruyor: dosya VAR ama
   çözülemiyorsa (bozuk webp, CDN hatası) o zaman devreye girer.

   Bu modül yalnız .astro frontmatter'ından çağrılır — istemci
   paketine girmez.
   ============================================================ */

const dir = fileURLToPath(new URL('../../public/foto', import.meta.url));

let files: string[] = [];
try {
  files = readdirSync(dir);
} catch {
  // klasör henüz yoksa: hiç fotoğraf yok say, site tipografik kalır
  files = [];
}

export const PHOTOS: ReadonlySet<string> = new Set(
  files
    .filter((f) => f.toLowerCase().endsWith('.webp'))
    .map((f) => f.slice(0, -'.webp'.length)),
);

export const hasPhotoFile = (slug: string): boolean => PHOTOS.has(slug);
