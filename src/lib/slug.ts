/* ============================================================
   Slugify — referanstan taşındı.

   Kritik nokta: Türkçe harfler küçültmeden ÖNCE çevrilir.
   "İ".toLowerCase() JS'te "i̇" (i + birleşen nokta) döner ve
   /[^a-z0-9]/ filtresine takılıp slug'ı bozar. Önce harf eşlemesi,
   sonra toLowerCase.

   menu.ts zaten elle yazılmış slug'lar taşıyor — bu fonksiyon
   veri dışı yerler için (başlık anchor'ı, yeni ürün eklerken
   slug türetme) duruyor.
   ============================================================ */

const TR: Record<string, string> = {
  'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i', 'I': 'i',
  'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
  'â': 'a', 'Â': 'a', 'î': 'i', 'û': 'u',
};

export function slug(s: string): string {
  return s
    .replace(/[çÇğĞıİIöÖşŞüÜâÂîû]/g, (c) => TR[c] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
