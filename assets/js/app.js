/* Inchiesta su Gesù — comportamenti: navigazione, attività, verifica, galleria */
(() => {
"use strict";

/* ---------- dati ---------- */
const DATI = (() => {
  try { return JSON.parse(document.getElementById("dati-attivita").textContent); }
  catch (e) { return { capitoli: [] }; }
})();
const CAPITOLI = DATI.capitoli || [];
const CAP_BY_ID = Object.fromEntries(CAPITOLI.map(c => [c.id, c]));

/* ---------- persistenza ---------- */
const store = {
  get(k, def) {
    try { return JSON.parse(localStorage.getItem(k)) ?? def; }
    catch (e) { return def; }
  },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const K_DONE = "igs-captte-fatte";

/* ---------- barra di avanzamento / torna su ---------- */
const progress = document.querySelector(".progress");
const totop = document.querySelector(".totop");
addEventListener("scroll", () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  totop.classList.toggle("is-visible", h.scrollTop > 700);
}, { passive: true });
totop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* ---------- dimensione del testo ---------- */
const fsEl = document.documentElement;
const applyFs = () => fsEl.style.setProperty("--scale", String(store.get("igs-fs", 1)));
applyFs();
document.querySelectorAll("[data-fs]").forEach(b => b.addEventListener("click", () => {
  let v = store.get("igs-fs", 1);
  v = Math.min(1.5, Math.max(.8, v + (b.dataset.fs === "up" ? .1 : -.1)));
  store.set("igs-fs", v); applyFs();
}));

/* ---------- indice a scomparsa ---------- */
const drawer = document.getElementById("drawer");
const scrim = document.querySelector(".scrim");
const burger = document.querySelector(".burger");
const setDrawer = open => {
  drawer.classList.toggle("is-open", open);
  scrim.classList.toggle("is-open", open);
  burger.setAttribute("aria-expanded", String(open));
};
burger.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-open")));
drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setDrawer(false)));
scrim.addEventListener("click", () => setDrawer(false));
addEventListener("keydown", e => { if (e.key === "Escape") setDrawer(false); });

/* ---------- scrollspy ---------- */
const chips = [...document.querySelectorAll(".chips__link")];
const chipFor = id => chips.find(c => (c.getAttribute("href") || "").slice(1) === id);
const spy = new IntersectionObserver(ents => {
  const hit = ents.filter(en => en.isIntersecting)
    .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top)[0];
  if (!hit) return;
  const chip = chipFor(hit.target.id);
  if (chip) {
    chips.forEach(c => c.classList.remove("is-ora"));
    chip.classList.add("is-ora");
  }
}, { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll(".chapter").forEach(s => spy.observe(s));

/* ---------- apparizione in scorrimento ---------- */
const rev = new IntersectionObserver(ents => ents.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add("is-vis"); rev.unobserve(en.target); }
}), { rootMargin: "0px 0px -8% 0px" });
document.querySelectorAll("[data-reveal]").forEach(el => rev.observe(el));

/* ---------- galleria: lightbox ---------- */
const lb = document.querySelector(".lightbox");
const lbImg = lb.querySelector("img");
const lbCap = lb.querySelector(".lightbox__cap");
let lbi = 0;
const galleryImgs = [...document.querySelectorAll(".pic__frame img")];
const openLb = i => {
  lbi = (i + galleryImgs.length) % galleryImgs.length;
  const im = galleryImgs[lbi];
  lbImg.src = im.currentSrc || im.src;
  lbImg.alt = im.alt || "";
  const cap = im.closest("figure")?.querySelector("figcaption")?.textContent || "";
  lbCap.textContent = cap;
  lb.classList.add("is-open");
};
document.querySelectorAll(".pic__zoom").forEach((btn, i) =>
  btn.addEventListener("click", ev => { ev.stopPropagation(); openLb(galleryImgs.indexOf(btn.closest("figure img"))); }));
document.querySelectorAll(".pic__frame img").forEach(im =>
  im.addEventListener("click", e => openLb(galleryImgs.indexOf(e.target))));
lb.querySelector(".lightbox__close").addEventListener("click", () => lb.classList.remove("is-open"));
lb.querySelector(".lightbox__nav--prev").addEventListener("click", () => openLb(lbi - 1));
lb.querySelector(".lightbox__nav--next").addEventListener("click", () => openLb(lbi + 1));
lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("is-open"); });
addEventListener("keydown", e => {
  if (!lb.classList.contains("is-open")) return;
  if (e.key === "Escape") lb.classList.remove("is-open");
  if (e.key === "ArrowLeft") openLb(lbi - 1);
  if (e.key === "ArrowRight") openLb(lbi + 1);
});

/* ---------- glossario: filtro ---------- */
const cerca = document.getElementById("cerca-term");
const glItems = [...document.querySelectorAll("#glossario-list .gl")];
cerca.addEventListener("input", () => {
  const q = cerca.value.trim().toLowerCase();
  glItems.forEach(it => {
    const hit = !q || it.textContent.toLowerCase().includes(q);
    it.style.display = hit ? "" : "none";
  });
});

/* ---------- motore delle attività ---------- */
const LETTERE = ["A", "B", "C", "D"];
const statoDone = () => store.get(K_DONE, {});

function renderPartition(part, items, kind) {
  const LET = kind === "quiz" ? LETTERE : ["V", "F"];
  part.querySelectorAll(".qq").forEach(qq => {
    const qi = +qq.dataset.qi;
    const q = items[qi];
    qq.querySelectorAll(".opt").forEach(btn => {
      btn.addEventListener("click", () => {
        if (qq.classList.contains("is-ans")) return;
        const chosen = +btn.dataset.i;
        qq.classList.add("is-ans");
        qq.querySelectorAll(".opt").forEach(o => {
          o.disabled = true;
          const idx = +o.dataset.i;
          if (idx === q.ansa) o.classList.add("ok");
          else if (idx === chosen) o.classList.add("ko");
        });
        const partEl = qq.closest(".qpart");
        const n = [...partEl.querySelectorAll(".qq")].filter(x => x.classList.contains("is-ans")).length;
        const tot = partEl.querySelectorAll(".qq").length;
        if (n === tot) completato(partEl, kind, qq.closest(".attivita"));
      });
    });
  });
}

function completato(partEl, kind, att) {
  const capId = att.dataset.ch;
  const n = partEl.querySelectorAll(".qq").length;
  const score = [...partEl.querySelectorAll(".qq")].filter(qq => !qq.querySelector(".opt.ko")).length;
  const sc = partEl.querySelector(".qscore");
  if (sc) sc.querySelector("b").textContent = score + "/" + n;
  partEl.classList.add("is-done");
  const done = store.get(K_DONE, {});
  done[capId] = { ...done[capId], [kind]: score >= 0 };
  store.set(K_DONE, done);
  aggiornaStati();
}

function buildActivity(att, cap) {
  att.innerHTML = "";
  const head = document.createElement("div");
  head.className = "attivita__head";
  head.innerHTML = '<h3>Metti alla prova</h3><span class="attivita__hint">Rispondi a tutte le domande per completare la tappa</span><span class="attivita__stato"></span>';
  att.appendChild(head);
  const parts = document.createElement("div");
  parts.className = "qparts";
  parts.appendChild(makePart(cap, "quiz", "Quiz — scegli la risposta giusta"));
  parts.appendChild(makePart(cap, "vero", "Vero o falso — giudica le affermazioni"));
  att.appendChild(parts);
  const btnR = document.createElement("button");
  btnR.type = "button";
  btnR.className = "btn-reset";
  btnR.textContent = "Ricomincia le attività del capitolo";
  btnR.addEventListener("click", () => { buildActivity(att, cap); aggiornaStati(); });
  att.appendChild(btnR);
  aggiornaStati();
}

function makePart(cap, kind, tit) {
  const items = cap[kind];
  const part = document.createElement("div");
  part.className = "qpart";
  part.innerHTML = '<span class="qpart__tit" id="tit-' + cap.id + '-' + kind + '">' + tit + '</span>';
  items.forEach((q, qi) => {
    const qq = document.createElement("div");
    qq.className = "qq"; qq.dataset.qi = qi; qq.dataset.ansa = q.ansa ?? (q.v ? 0 : 1);
    const opts = kind === "quiz" ? q.opt : ["Vero", "Falso"];
    const ansa = kind === "quiz" ? q.ansa : (q.v ? 0 : 1);
    qq.dataset.ansa = ansa;
    let h = '<span class="qq__n">' + (kind === "quiz" ? "Domanda" : "Affermazione") + ' ' + (qi + 1) + ' di ' + items.length + '</span>';
    h += '<span class="qq__t">' + (kind === "quiz" ? q.q : q.s) + '</span>';
    h += '<div class="opts">' + opts.map((o, oi) =>
      '<button type="button" class="opt" data-i="' + oi + '"><span class="opt__key">' +
      (kind === "quiz" ? LETTERE[oi] : (oi ? "F" : "V")) + '</span><span>' + o + '</span></button>').join("") + '</div>';
    h += '<p class="qq__spiega">' + q.spiega + '</p>';
    qq.innerHTML = h;
    part.appendChild(qq);
  });
  const sc = document.createElement("p");
  sc.className = "qscore";
  sc.innerHTML = '<b>0/' + items.length + '</b><button type="button" class="btn-reset" data-redo>Prova di nuovo</button>';
  part.appendChild(sc);
  sc.querySelector("[data-redo]").addEventListener("click", () => { buildActivity(part.closest(".attivita"), cap); });
  renderPartition(part, items.map(q => kind === "quiz" ? q : { ansa: q.v ? 0 : 1 }), kind);
  return part;
}

function aggiornaStati() {
  const done = store.get(K_DONE, {});
  let fatti = 0;
  CAPITOLI.forEach(cap => {
    const d = done[cap.id] || {};
    const ok = !!(d.quiz && d.vero);
    if (ok) fatti++;
    const att = document.querySelector('.attivita[data-ch="' + cap.id + '"]');
    if (att) {
      const st = att.querySelector(".attivita__stato");
      if (st) {
        st.textContent = ok ? "Attività completata ✓" : (d.quiz || d.vero ? "In corso" : "Da completare");
        st.classList.toggle("ok", ok);
      }
      const el = document.getElementById("badge-" + cap.id);
      if (el) el.textContent = ok ? "✓ attività" : "da fare";
      const pt = att.closest(".chapter")?.querySelector(".chapter__badge .badge");
      if (pt) { pt.textContent = ok ? "✓ attività svolta" : "attività da svolgere";
                pt.classList.toggle("badge--fatto", ok); pt.classList.toggle("badge--dafare", !ok); }
    }
    const chip = chipFor("ch-" + cap.id);
    if (chip) {
      let dot = chip.querySelector(".dot");
      if (!dot) { dot = document.createElement("span"); dot.className = "dot"; chip.appendChild(dot); }
      dot.classList.toggle("dot--fatta", ok);
    }
    const dr = drawer.querySelector('a[href="#ch-' + cap.id + '"]');
    if (dr) {
      let dot = dr.querySelector(".dot--fatta");
      if (ok && !dot) { dot = document.createElement("span"); dot.className = "dot--fatta"; dr.prepend(dot); }
      if (!ok && dot) dot.remove();
    }
  });
  const st = document.getElementById("stato");
  if (st) st.textContent = fatti + "/" + CAPITOLI.length;
}

/* avvia le attività */
CAPITOLI.forEach(cap => {
  const att = document.querySelector('.attivita[data-ch="' + cap.id + '"]');
  if (att) buildActivity(att, cap);
});
aggiornaStati();

/* ---------- verifica finale ---------- */
const esame = {
  startWrap: document.getElementById("esame-start"),
  btnStart: document.getElementById("btn-start"),
  form: document.getElementById("esame-quiz"),
  fine: document.getElementById("esame-fine"),
  best: document.getElementById("esame-best"),
  items: []
};
function mostraRecord() {
  const b = store.get("igs-esame-best", null);
  esame.best.textContent = b == null ? "Nessun test svolto finora." :
    "Il tuo record: " + b + "/10 risposte esatte.";
}
mostraRecord();
function generaEsame() {
  const bank = [];
  CAPITOLI.forEach(cap => cap.quiz.forEach(q => bank.push({ ...q, da: cap.titolo })));
  for (let i = bank.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bank[i], bank[j]] = [bank[j], bank[i]]; }
  esame.items = bank.slice(0, 10);
  esame.form.innerHTML = esame.items.map((q, qi) => {
    let h = '<div class="qq" data-ansa="' + q.ansa + '">';
    h += '<span class="qq__n">Q' + (qi + 1) + ' · ' + q.da + '</span>';
    h += '<span class="qq__t">' + q.q + '</span><div class="opts">';
    h += q.opt.map((o, oi) => '<button type="button" class="opt" data-i="' + oi + '"><span class="opt__key">' + LETTERE[oi] + '</span><span>' + o + '</span></button>').join("");
    return h + "</div></div>";
  }).join("");
  esame.form.querySelectorAll(".opt").forEach(o => o.addEventListener("click", () => {
    const qq = o.closest(".qq");
    qq.querySelectorAll(".opt").forEach(x => x !== o && x.classList.remove("is-scelto", "ko"));
    o.classList.add("is-scelto");
  }));
  const az = document.createElement("div");
  az.className = "verifica__azioni";
  az.innerHTML = '<button class="btn btn--oro" type="submit">Controlla le risposte</button>' +
    '<span class="checkline">Rispondi a tutte le domande: quelle senza scelta valgono sbagliata.</span>';
  esame.form.appendChild(az);
  esame.form.onsubmit = ev => {
    ev.preventDefault();
    let score = 0;
    esame.form.querySelectorAll(".qq").forEach(qq => {
      const right = +qq.dataset.ansa;
      const sel = qq.querySelector(".opt.is-scelto");
      qq.querySelectorAll(".opt").forEach(o => { o.disabled = true; if (+o.dataset.i === right) o.classList.add("ok"); });
      if (sel && +sel.dataset.i === right) score++; else if (sel) sel.classList.add("ko");
    });
    if (score > (store.get("igs-esame-best", 0))) store.set("igs-esame-best", score);
    esame.fine.innerHTML = '<span class="verifica__punteggio">' + score + '/10</span>' +
      '<p class="verifica__msg">' + (score >= 8 ? "Eccellente: hai padronanza dei contenuti." :
        score >= 6 ? "Sufficiente: ripassa i capitoli dove hai sbagliato." :
        "Da sistemare: torna ai capitoli e ripeti le attività.") + '</p>' +
      '<button class="btn btn--palo" type="button" id="esame-retry">Nuovo test</button>' +
      '<button class="btn btn--oro" type="button" id="esame-vedi">Torna al test e leggiti le risposte</button>';
    esame.fine.hidden = false;
    esame.form.hidden = true;
    esame.fine.querySelector("#esame-retry").addEventListener("click", () => {
      esame.fine.hidden = true; generaEsame(); esame.form.hidden = false;
    });
    esame.fine.querySelector("#esame-vedi").addEventListener("click", () => {
      esame.fine.hidden = true; esame.form.hidden = false;
    });
    const rec = esame.fine.querySelector(".verifica__best");
    if (rec) rec.textContent = store.get("igs-esame-best", score) + "/10";
    mostraRecord();
    esame.fine.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  esame.fine.hidden = true;
  esame.form.hidden = false;
  esame.form.scrollIntoView({ behavior: "smooth", block: "start" });
}
if (esame.btnStart) esame.btnStart.addEventListener("click", generaEsame);

})();
