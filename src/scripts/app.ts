/* ============================================================
   LEO — istemci davranışı. Tek modül, kütüphane yok.

   Sayfa gezinmesi ClientRouter üzerinden aynı belgede olduğu için
   modül SADECE BİR KEZ çalışır: her kurulum `astro:page-load`'a bağlı,
   her yıkım `astro:before-swap`'e. Kurulumların hepsi idempotent.

   İçindekiler:
     1  ölçüm      — bar + ray yüksekliği → sticky ray ve scroll-margin
     1b bar gölgesi— yalnız sayfa kaydırılmışken
     1c kenar maskesi — yatay şeritlerin kaydırılabilirlik işareti
     2  durum      — açık/kapalı, İstanbul saatiyle (§ hours.ts)
     3  emniyet ağı— dosya var ama çözülemiyorsa satır tipografiye düşer
     3b atlama     — sayfa içi bağlantılar (ClientRouter yutuyor)
     4  scroll spy — kategori rayı (§5)
     5  belirme    — bölümler görünüme girerken (§9c)
     6  şerit      — öneri şeridinin akışı (§7)
     7  büyük görünüm — fotoğrafa tıklayınca (§8)
     8  morph      — mekan anahtarının paleti (§6)

   HAREKET KURALI: sayfada aynı anda en fazla üç hareket türü.
   `prefers-reduced-motion: reduce` her modülde AYRICA karşılanıyor;
   hiçbiri "animation: none" ile geçiştirilmedi.
   ============================================================ */

import type { TransitionBeforeSwapEvent } from 'astro:transitions/client';
import { openState, type Hours } from '../lib/hours';

const RM = matchMedia('(prefers-reduced-motion: reduce)');
const COARSE = matchMedia('(hover: none), (pointer: coarse)');

/** Reduced-motion açıkken yumuşak kaydırma da kapanır. */
const scrollMode = (): ScrollBehavior => (RM.matches ? 'auto' : 'smooth');

/** Sayfa takas edilirken çalışacak yıkımlar. */
let cleanups: Array<() => void> = [];
const onTeardown = (fn: () => void) => cleanups.push(fn);

/* ============================================================
   1 — ÖLÇÜM
   Bar ve ray yüksekliği fontlar yüklenince değişiyor; ray bar'ın
   altına yapışıyor, bütün scroll-margin'ler ikisinin toplamından
   türüyor. Sabit sayı yazılsaydı kategori ve alt kategori başlıkları
   atlandığında rayın altında kalırdı.
   ============================================================ */

function measureChrome(): void {
  const root = document.documentElement.style;
  const bar = document.querySelector<HTMLElement>('.bar');
  const rail = document.querySelector<HTMLElement>('.rail');
  root.setProperty('--bar-h', `${bar ? bar.offsetHeight : 56}px`);
  root.setProperty('--rail-h', `${rail ? rail.offsetHeight : 0}px`);
}

/* ============================================================
   1b — BAR GÖLGESİ (C1)
   Gölge yalnız sayfa kaydırılmışken. Tepede dururken bar bir katman
   değil, sayfanın kendi başı — orada gölge yalan söylerdi.
   ============================================================ */

function barShadow(): void {
  const bar = document.querySelector<HTMLElement>('.bar');
  if (!bar) return;

  const paint = () => bar.classList.toggle('is-stuck', window.scrollY > 0);
  paint();
  window.addEventListener('scroll', paint, { passive: true });
  onTeardown(() => {
    window.removeEventListener('scroll', paint);
    bar.classList.remove('is-stuck');
  });
}

/* ============================================================
   1c — KENAR MASKESİ (D2 · rev5 §2)

   Yatay kaydırılabilir bir şeridin kaydırılabilir OLDUĞUNU söyleyen
   solma. Maske SABİT DEĞİL: içerik geniş ekranda zaten sığıyorsa
   kalıcı bir solma hata gibi okunur. Kutu gerçekten taşıyorsa ve o
   yönde gidilecek yer varsa açılıyor.

   Aynı mekanizma iki yerde: ana kategori rayı ve her bölümün alt
   kategori çip satırı.
   ============================================================ */

function edgeMask(host: HTMLElement, box: HTMLElement): void {
  const paint = () => {
    const over = box.scrollWidth - box.clientWidth;
    /* 2px tolerans: alt piksel yuvarlamaları uçlarda maskeyi
       titretiyordu. */
    host.classList.toggle('edge-l', over > 2 && box.scrollLeft > 2);
    host.classList.toggle('edge-r', over > 2 && box.scrollLeft < over - 2);
  };

  paint();
  box.addEventListener('scroll', paint, { passive: true });
  window.addEventListener('resize', paint, { passive: true });
  /* Fontlar yüklenince çip genişlikleri değişiyor — taşma kararı
     yeniden veriliyor. */
  document.fonts?.ready.then(paint);
  onTeardown(() => {
    box.removeEventListener('scroll', paint);
    window.removeEventListener('resize', paint);
    host.classList.remove('edge-l', 'edge-r');
  });
}

function edges(): void {
  const rail = document.querySelector<HTMLElement>('.rail');
  const railBox = document.querySelector<HTMLElement>('.rail-scroll');
  if (rail && railBox) edgeMask(rail, railBox);

  for (const nav of document.querySelectorAll<HTMLElement>('.subcats')) {
    const box = nav.querySelector<HTMLElement>('.subcats-scroll');
    if (box) edgeMask(nav, box);
  }
}

/* ============================================================
   2 — AÇIK / KAPALI
   Statik build zamanında hesaplanamaz (CDN cache + ziyaretçi saati),
   istemcide hesaplanır. Saatler DOM'da data-hours olarak duruyor.
   Lounge'da hours null → bu blok hiç basılmaz, "bilinmiyor" da yazmaz.
   ============================================================ */

function status(): void {
  const el = document.getElementById('status');
  const txt = document.getElementById('statusText');
  if (!el || !txt || !el.dataset['hours']) return;

  const hours = JSON.parse(el.dataset['hours']) as Hours;

  const paint = () => {
    const on = openState(hours);
    el.classList.remove('open', 'shut');
    el.classList.add(on ? 'open' : 'shut');
    // saat metni sunucudan geldi; başına durumu ekle, veriyi ezme
    if (!txt.dataset['base']) txt.dataset['base'] = txt.textContent ?? '';
    txt.innerHTML =
      (on ? 'Şu an açık' : 'Şu an kapalı') +
      '<span class="sq sep" aria-hidden="true"></span>' +
      `<small>${txt.dataset['base']}</small>`;
  };

  paint();
  const t = window.setInterval(paint, 60000);
  onTeardown(() => clearInterval(t));
}

/* ============================================================
   3 — EMNİYET AĞI
   Eksik dosyalar build zamanı manifestosuyla zaten eleniyor (404 yok).
   Bu ağ dosya VAR ama çözülemeyen durum için: bozuk webp, CDN hatası.
   O satır görselini bırakıp tipografik düzene düşer; kırık ikon çıkmaz.
   ============================================================ */

function shotNet(): void {
  for (const img of document.querySelectorAll<HTMLImageElement>('.shot img')) {
    const fail = () => {
      img.closest('.item, .pick-card, .reco-card')?.classList.add('shot-failed');
      img.closest('.shot')?.remove();
    };
    if (img.complete && img.naturalWidth === 0) fail();
    else img.addEventListener('error', fail, { once: true });
  }
}

/* ============================================================
   3b — SAYFA İÇİ ATLAMA

   Kategori rayı, alt kategori çipleri ve hero'daki "Menü" bağlantısı
   sıradan fragment bağlantılarıydı: hedefi tarayıcı buluyor, payı
   CSS'teki scroll-margin-top veriyordu. Bu yol ÇALIŞIYOR — ölçüldü,
   yerel fragment gezinmesi doğru yere gidiyor. Buradaki devralma bir
   onarım değil, DENETİM.

   Gerekçe, "Yiyecekler yanlış konuma gidiyor" şikâyetinin asıl
   sebebiyle aynı yerden geliyor (bkz. §4): yumuşak kaydırma
   SÜRERKEN gelen her yeni kaydırma isteği süren animasyonu iptal
   ediyor. Tarayıcının kendi fragment kaydırmasında hedef bizim
   elimizde olmuyor; iptal olursa yolun ortasında kalıyoruz ve
   yeniden nişan alacak bir yerimiz yok. Kendi isteğimizi kendimiz
   gönderince hedef tek bir sayı olarak elimizde kalıyor.

   İki kazanç daha:

   · PAY TAM. Tarayıcı hedefin ÇİZİLEN kutusunu ölçüyor; belirme
     animasyonu (§9c) henüz açılmamış bölümü 8px aşağı ötelenmiş
     gösterdiği için varış noktası o kadar kayıyordu. Burada konum
     offsetTop zincirinden, yani YERLEŞİMDEN okunuyor — transform
     ona karışmıyor.

   · GEÇMİŞ TEMİZ. ClientRouter her hash tıklamasına pushState
     yazıyor; menüde on kategori gezen biri geri tuşuna basınca
     geldiği sayfaya değil dokuz kez geriye gidiyordu. Burada
     replaceState var.

   Payın kaynağı HÂLÂ CSS: hedefin kendi `scroll-margin-top`'u
   okunuyor. .sec ile .sub farklı pay istediğinde ya da bar yüksekliği
   değiştiğinde burada değişecek bir sayı yok.

   preventDefault yeterli: ClientRouter'ın belge üzerindeki
   dinleyicisi `defaultPrevented` görünce çekiliyor, bizimki
   bağlantının kendisinde olduğu için ondan önce çalışıyor.
   ============================================================ */

function jumps(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  if (!links.length) return;

  /** Belge tepesine göre GERÇEK yerleşim konumu (transform'dan etkilenmez) */
  const docTop = (el: HTMLElement): number => {
    let y = 0;
    let node: HTMLElement | null = el;
    while (node) {
      y += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return y;
  };

  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // yeni sekme vb.

    const a = e.currentTarget as HTMLAnchorElement;
    const id = a.getAttribute('href')?.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    const pad = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    window.scrollTo({ top: Math.max(0, docTop(target) - pad), behavior: scrollMode() });

    /* Adres güncelleniyor ama GEÇMİŞE YENİ KAYIT DÜŞMÜYOR: menüde on
       kategori gezen biri geri tuşuna basınca on kez geri gitmemeli,
       geldiği sayfaya dönmeli. */
    history.replaceState(history.state, '', `#${id}`);
  };

  links.forEach((a) => a.addEventListener('click', onClick));
  onTeardown(() => links.forEach((a) => a.removeEventListener('click', onClick)));
}

/* ============================================================
   4 — SCROLL SPY (§5)
   Kaydırdıkça aktif kategori işaretlenir, aktif çip görünüme kayar.
   rootMargin ölçülen bar + ray yüksekliğinden türüyor: sabit sayı
   yazılsa 320px'te ray başlığın üstünü kapatıyordu.

   ÇİP YALNIZ YATAY SÜRÜLÜR — burada bir hata düzeltildi.

   Eskiden aktif çip `a.scrollIntoView({ block: 'nearest' })` ile
   ortalanıyordu. `scrollIntoView` yalnız en yakın kutuyu değil,
   BELGE KAYDIRICISI dahil bütün kaydırılabilir ataları hedefler;
   'nearest' "gerekmiyorsa oynatma" demek, "o kaydırıcıya hiç
   dokunma" demek değil. Şeride tıklayınca başlayan yumuşak DİKEY
   kaydırma yoldayken her bölüm sınırı bir gözlemci olayı üretiyor,
   her olay yeni bir kaydırma isteği gönderiyor ve tarayıcı süren
   animasyonu iptal ediyor — sayfa hedefe varmadan duruyor.

   "Yiyecekler yanlış konuma gidiyor" şikâyetinin en olası kaynağı
   bu: Yiyecekler son bölüm, tepeden tıklandığında yolda dört sınır
   birden kesiliyor, iptal üstüne iptal geliyor. İlk kategorilerde
   bir-iki kesişme olduğu için hata "bazen oluyor" gibi okunuyordu.

   NOT — bu iptal davranışı otomasyon ortamında DOĞRULANAMADI:
   Chrome gizli sekmede yumuşak kaydırma animasyonunu hiç
   başlatmıyor, dolayısıyla iptal edilecek bir animasyon da olmuyor.
   Tanı `scrollIntoView`'un tanımlı davranışına dayanıyor, canlı
   tekrarına değil. Gerçek cihazda bir kez teyit edilmeli.

   Düzeltme: dikey kaydırmaya hiç dokunulmuyor, yalnız rayın kendi
   kutusunun scrollLeft'i sürülüyor.
   ============================================================ */

function spy(): void {
  const rail = document.querySelector<HTMLElement>('.rail');
  const railBox = document.querySelector<HTMLElement>('.rail-scroll');
  const secs = [...document.querySelectorAll<HTMLElement>('main .sec')];
  if (!rail || !railBox || !secs.length) return;

  const links = new Map(
    [...rail.querySelectorAll<HTMLAnchorElement>('a')].map((a) => [
      a.getAttribute('href')?.slice(1) ?? '',
      a,
    ]),
  );

  const bar = document.querySelector<HTMLElement>('.bar');
  const top = (bar?.offsetHeight ?? 56) + rail.offsetHeight + 10;

  /** Çipi şeridin ortasına getir — SADECE yatayda, sadece bu kutuda. */
  const center = (a: HTMLAnchorElement): void => {
    const max = railBox.scrollWidth - railBox.clientWidth;
    if (max <= 0) return; // şerit zaten sığıyor, sürülecek bir şey yok
    const left = Math.max(
      0,
      Math.min(max, a.offsetLeft - (railBox.clientWidth - a.offsetWidth) / 2),
    );
    /* 1px'lik farklar için istek göndermeye değmez; her olayda
       scrollTo çağırmak dokunmatikte akışı kekeletiyor. */
    if (Math.abs(left - railBox.scrollLeft) < 2) return;
    railBox.scrollTo({ left, behavior: scrollMode() });
  };

  let current = '';
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = (e.target as HTMLElement).id;
        if (id === current) continue;
        current = id;
        links.forEach((a) => a.removeAttribute('aria-current'));
        const a = links.get(id);
        if (!a) continue;
        a.setAttribute('aria-current', 'true');
        center(a);
      }
    },
    { rootMargin: `-${top}px 0px -70% 0px` },
  );

  secs.forEach((s) => io.observe(s));
  onTeardown(() => io.disconnect());
}

/* ============================================================
   5 — BÖLÜM BELİRMESİ (§9c)
   Kategori başına BİR KEZ (unobserve), ürün başına değil.
   Reduced-motion: hiç kurulmaz, `html.rv` da konmaz → içerik baştan
   görünür. Sınıfı <head>'deki inline script koyuyor; burada yalnız
   sayfa takasından sonra tazeleniyor.
   ============================================================ */

function reveal(): void {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  if (!targets.length) return;

  if (RM.matches) {
    document.documentElement.classList.remove('rv');
    return;
  }
  document.documentElement.classList.add('rv');

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('rv-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.02 },
  );

  targets.forEach((t) => io.observe(t));
  onTeardown(() => io.disconnect());
}

/* ============================================================
   6 — ÖNERİ ŞERİDİ (§7)

   Masaüstünde akış CSS animasyonu (hover'da duraklar, odak girince
   sıfırlanır) — burada iş yok. Dokunmatikte animasyon kapalı ve akış
   rAF ile scrollLeft üzerinden sürülüyor: transform + native scroll
   bileşimi uçlarda boşluk gösteriyor, scrollLeft göstermiyor.

   Parmak değince ANINDA durur; hareketsizlik başladıktan 2 sn sonra
   kaldığı yerden devam eder. İçerik iki kez basılı olduğu için yarıda
   sarmak dikişsiz.
   ============================================================ */

function recoFlow(): void {
  const view = document.querySelector<HTMLElement>('.reco-view');
  const track = document.getElementById('recoTrack');
  if (!view || !track) return;

  const SPEED = 22; // px/sn
  let raf = 0;
  let last = 0;
  let x = 0;
  let paused = false;
  let resumeT = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (paused) return;
    const half = track.scrollWidth / 2;
    if (!half) return;
    if (Math.abs(view.scrollLeft - x) > 2) x = view.scrollLeft; // elle kaydırıldıysa eşitle
    x += SPEED * dt;
    if (x >= half) x -= half;
    view.scrollLeft = x;
  };

  const start = () => {
    if (raf || !COARSE.matches || RM.matches) return;
    x = view.scrollLeft;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  const hold = () => {
    paused = true;
    clearTimeout(resumeT);
  };
  const resume = () => {
    clearTimeout(resumeT);
    resumeT = window.setTimeout(() => {
      x = view.scrollLeft;
      paused = false;
    }, 2000);
  };
  const onMode = () => {
    stop();
    start();
  };

  view.addEventListener('pointerdown', hold);
  view.addEventListener('pointerup', resume);
  view.addEventListener('pointercancel', resume);
  view.addEventListener('touchstart', hold, { passive: true });
  view.addEventListener('touchend', resume, { passive: true });
  COARSE.addEventListener('change', onMode);
  RM.addEventListener('change', onMode);
  start();

  onTeardown(() => {
    stop();
    clearTimeout(resumeT);
    view.removeEventListener('pointerdown', hold);
    view.removeEventListener('pointerup', resume);
    view.removeEventListener('pointercancel', resume);
    view.removeEventListener('touchstart', hold);
    view.removeEventListener('touchend', resume);
    COARSE.removeEventListener('change', onMode);
    RM.removeEventListener('change', onMode);
  });
}

/* ============================================================
   7 — BÜYÜK GÖRÜNÜM (§8)

   Veri kaynağı DOM'un kendisi: her ürün satırı zaten adı, fiyatı,
   açıklamasını ve rozetini taşıyor. Ayrı bir JSON basılmıyor — aynı
   gerçek iki yerde durmasın, sayfa da şişmesin.

   <dialog> seçildi: focus trap ve Esc tarayıcıdan geliyor, arkadaki
   içerik inert oluyor. Zemin ::backdrop DEĞİL, dialog'un kendi zemini
   (::backdrop özel özellikleri her tarayıcıda miras almıyor).
   ============================================================ */

function lightbox(): void {
  const lb = document.getElementById('lb') as HTMLDialogElement | null;
  const triggers = [...document.querySelectorAll<HTMLElement>('[data-lb]')];
  if (!lb || !triggers.length) return;

  const img = document.getElementById('lbImg') as HTMLImageElement;
  const nameEl = document.getElementById('lbName')!;
  const priceEl = document.getElementById('lbPrice')!;
  const descEl = document.getElementById('lbDesc')!;
  const pickEl = document.getElementById('lbPick')!;

  /* AYNI SLUG BİRDEN FAZLA BÖLÜMDE OLABİLİR: "İmza Ürünler" ürünleri
     kendi kategorilerinden referansla çekiyor, yani Leo Pizza hem
     İmza'da hem Ana Yemekler'de bir satır. Bu yüzden satırlar
     yalnız slug'la değil BÖLÜM + SLUG ile anahtarlanıyor; yoksa
     harita son satırda kalır ve okla gezinme yanlış kategoriye
     düşerdi. */
  const key = (secId: string, slug: string): string => `${secId}/${slug}`;

  /** bölüm+slug → ürün satırı (adın, fiyatın, açıklamanın kaynağı) */
  const rows = new Map<string, HTMLElement>();
  /** slug → İLK satır. Bölümü olmayan tetikler (hero kartı, öneri
      şeridi) buradan besleniyor. */
  const anyRow = new Map<string, HTMLElement>();
  /** bölüm → o bölümdeki FOTOĞRAFLI slug'lar, DOM sırasında */
  const groups = new Map<string, string[]>();
  /** menünün HERHANGİ bir yerinde rozet taşıyan slug'lar.
      Seçki bölümünde (İmza Ürünler) rozet basılmıyor; büyük görünüm
      satırdan okusaydı oradan açılınca rozet düşerdi. Rozet ürünün
      özelliği, satırın değil — bu yüzden slug bazında tutuluyor. */
  const picks = new Set<string>();

  for (const sec of document.querySelectorAll<HTMLElement>('main .sec')) {
    const list: string[] = [];
    for (const it of sec.querySelectorAll<HTMLElement>('.item[data-slug]')) {
      const s = it.dataset['slug']!;
      rows.set(key(sec.id, s), it);
      if (!anyRow.has(s)) anyRow.set(s, it);
      if (it.querySelector('.pick-badge')) picks.add(s);
      if (it.querySelector('.shot img')) list.push(s);
    }
    if (list.length) groups.set(sec.id, list);
  }

  /** Tetiğin ait olduğu bölüm. Menü içindeyse kendi bölümü; hero ve
      şerit için ürünün menüdeki ilk satırının bölümü — böylece
      oradan da okla gezinilebiliyor. */
  const secOf = (trigger: HTMLElement, s: string): string =>
    trigger.closest('.sec')?.id ?? anyRow.get(s)?.closest('.sec')?.id ?? '';

  let opener: HTMLElement | null = null;
  let slug = '';
  let curSec = '';
  let closing = 0;

  const fill = (s: string, secId: string, fallbackSrc?: string): boolean => {
    const row = rows.get(key(secId, s)) ?? anyRow.get(s);
    const src =
      row?.querySelector<HTMLImageElement>('.shot img')?.getAttribute('src') ?? fallbackSrc;
    if (!src) return false;

    curSec = secId;

    slug = s;
    img.src = src;
    const name = row?.querySelector('.name')?.textContent?.trim() ?? '';
    img.alt = name;
    nameEl.textContent = name;

    const price = row?.querySelector('.price')?.textContent?.trim() ?? '';
    priceEl.textContent = price;
    priceEl.hidden = !price;

    const desc = row?.querySelector('.desc')?.textContent?.trim() ?? '';
    descEl.textContent = desc;
    descEl.hidden = !desc;

    pickEl.hidden = !picks.has(s);
    return true;
  };

  const open = (trigger: HTMLElement) => {
    const s = trigger.dataset['lb']!;
    const src = trigger.querySelector<HTMLImageElement>('img')?.getAttribute('src') ?? undefined;
    if (!fill(s, secOf(trigger, s), src)) return;

    opener = trigger;
    clearTimeout(closing);

    // scrollbar payı: overflow:hidden sayfayı yana sıçratmasın
    const gap = window.innerWidth - document.documentElement.clientWidth;
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    document.body.classList.add('lb-lock');

    lb.showModal();
    /* Geçişin başlaması için kapalı durumun bir kez hesaplanmış olması
       gerekiyor. rAF'a bırakılmıyor: arka plandaki sekmede rAF
       kısılıyor ve katman opacity:0'da takılı kalıyordu. Zorunlu
       yeniden akış (reflow) bunu her koşulda garanti ediyor. */
    void lb.offsetWidth;
    lb.classList.add('is-open');
  };

  const finish = () => {
    lb.close();
    document.body.classList.remove('lb-lock');
    document.body.style.paddingRight = '';
    opener?.focus({ preventScroll: true });
    opener = null;
  };

  const close = () => {
    if (!lb.open) return;
    lb.classList.remove('is-open');
    clearTimeout(closing);
    closing = window.setTimeout(finish, RM.matches ? 0 : 160);
  };

  /** AYNI BÖLÜMDE sağa/sola. Sınırda durur, döngü yapmaz. */
  const step = (dir: 1 | -1) => {
    const list = groups.get(curSec);
    if (!list) return;
    const i = list.indexOf(slug) + dir;
    if (i < 0 || i >= list.length) return;
    fill(list[i]!, curSec);
  };

  const onClick = (e: MouseEvent) => {
    if (e.target === lb) close(); // dışına tıklama
  };
  const onCancel = (e: Event) => {
    e.preventDefault(); // Esc: kapanış geçişi çalışsın
    close();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  };

  /* dokunmatikte kaydırma: yatay 44px eşiği, dikey hareket iptal eder */
  let sx = 0;
  let sy = 0;
  let swiping = false;
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    sx = e.clientX; sy = e.clientY; swiping = true;
  };
  const onUp = (e: PointerEvent) => {
    if (!swiping) return;
    swiping = false;
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    step(dx < 0 ? 1 : -1);
  };

  const onTrigger = (e: Event) => {
    const t = (e.currentTarget as HTMLElement);
    e.preventDefault();
    open(t);
  };

  triggers.forEach((t) => t.addEventListener('click', onTrigger));
  lb.addEventListener('click', onClick);
  lb.addEventListener('cancel', onCancel);
  lb.addEventListener('keydown', onKey);
  lb.addEventListener('pointerdown', onDown);
  lb.addEventListener('pointerup', onUp);
  lb.querySelectorAll<HTMLElement>('[data-lb-close]').forEach((b) =>
    b.addEventListener('click', close),
  );

  onTeardown(() => {
    triggers.forEach((t) => t.removeEventListener('click', onTrigger));
    lb.removeEventListener('click', onClick);
    lb.removeEventListener('cancel', onCancel);
    lb.removeEventListener('keydown', onKey);
    lb.removeEventListener('pointerdown', onDown);
    lb.removeEventListener('pointerup', onUp);
    clearTimeout(closing);
    if (lb.open) lb.close();
    lb.classList.remove('is-open');
    document.body.classList.remove('lb-lock');
    document.body.style.paddingRight = '';
  });
}

/* ============================================================
   8 — MEKAN ANAHTARI MORPH'U (§6)

   Palet geçişi CSS'te duruyor (:root üzerinde @property transition),
   AMA gezinmede kendiliğinden çalışmıyor: ClientRouter takası
   startViewTransition'ın güncelleme geri çağrısı içinde yapıyor ve
   orada yapılan stil değişiklikleri CSS geçişi TETİKLEMİYOR — iki
   palet arası kesme oluyor, morph diye bir an kalmıyor.

   Çözüm iki adımda:
     · takastan ÖNCE gelen belgenin data-venue'sünü ESKİ mekana
       çeviriyoruz → içerik anında değişiyor ama ışık değişmiyor
     · takas bitince (astro:page-load) yeni mekanı yazıyoruz → bu
       artık normal bir stil değişikliği, geçiş çalışıyor

   Okunuşu: yeni oda anında geliyor, ışık 0.7s'te kısılıyor. Ters
   sırada (önce ışık, sonra içerik) yapılabilirdi ama o zaman 0.7s
   boyunca ekranda eski menü dururdu — gezinme takılmış gibi okunur.

   reduced-motion altında :root { transition: none } olduğu için aynı
   kod anında renk değişimi veriyor; ayrı bir dal gerekmiyor.
   ============================================================ */

let pendingVenue: string | null = null;

document.addEventListener('astro:before-swap', (e) => {
  const incoming = (e as TransitionBeforeSwapEvent).newDocument.documentElement;
  const from = document.documentElement.dataset['venue'];
  const to = incoming.dataset['venue'];
  pendingVenue = null;
  if (from && to && from !== to) {
    incoming.dataset['venue'] = from; // takas eski paletle gelsin
    pendingVenue = to;
  }
});

function morph(): void {
  if (!pendingVenue) return;
  const to = pendingVenue;
  pendingVenue = null;
  void document.documentElement.offsetWidth; // eski palet bir kez hesaplansın
  document.documentElement.dataset['venue'] = to;
}

/* ============================================================
   KURULUM
   ============================================================ */

function init(): void {
  morph();
  measureChrome();
  barShadow();
  edges();
  status();
  shotNet();
  jumps();
  spy();
  reveal();
  recoFlow();
  lightbox();
}

function teardown(): void {
  for (const fn of cleanups) fn();
  cleanups = [];
}

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', teardown);

/* Sayfa takasından SONRA, ilk boyamadan ÖNCE: <html> sınıfları takasla
   sıfırlandığı için `rv` yeniden konur. page-load'da konsaydı içerik
   önce görünür sonra gizlenirdi — göz kırpması olurdu. */
document.addEventListener('astro:after-swap', () => {
  if (!RM.matches && document.querySelector('[data-reveal]')) {
    document.documentElement.classList.add('rv');
  }
});

/* Fontlar yüklenince bar ve ray yüksekliği değişir; bütün
   scroll-margin'ler ikisinden türediği için yeniden ölçülür. */
document.fonts?.ready.then(measureChrome);
window.addEventListener('resize', measureChrome, { passive: true });
