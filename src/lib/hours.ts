/* ============================================================
   Açık / kapalı — referanstaki istanbulNow() + openState() portu.

   Neden Intl: sunucu saati ve ziyaretçinin cihaz saati alakasız.
   Mekan İstanbul'da; seans her zaman Europe/Istanbul'a göre okunur.

   Neden gece yarısını aşan mantık: saatler [açılış, kapanış] olarak
   saat cinsinden tutuluyor ve kapanış 24'ü aşabiliyor (25 = ertesi
   gün 01.00). Saat 00.30'da "bugün" pazartesidir ama açık olan seans
   PAZAR'a ait. Bu yüzden bugüne ek olarak dünden sarkan seans da
   +1440 dakika kaydırılarak kontrol edilir.

   Bu statik bir sitede build zamanında hesaplanamaz — istemcide çalışır.
   ============================================================ */

export type Hours = Record<number, [number, number]>;

export function istanbulNow(): { day: number; mins: number } {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const p = Object.fromEntries(
    f.formatToParts(new Date()).map((x) => [x.type, x.value]),
  ) as Record<string, string>;
  const days: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: days[p['weekday'] ?? ''] ?? 0,
    mins: Number(p['hour'] ?? 0) * 60 + Number(p['minute'] ?? 0),
  };
}

export function openState(hours: Hours): boolean {
  const { day, mins } = istanbulNow();
  const check = (d: number, m: number): boolean => {
    const h = hours[d];
    return !!h && m >= h[0] * 60 && m < h[1] * 60;
  };
  if (check(day, mins)) return true;
  // dünden sarkan gece saatleri (ör. 01.00 — seans dün başladı)
  const prev = (day + 6) % 7;
  return check(prev, mins + 1440);
}
