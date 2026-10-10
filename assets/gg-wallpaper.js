/* macOS Golden Gate — desktop wallpaper picker for HTML mockups.
   A popover (regular glass) with three panes:
     Colors    — solid presets + custom colour
     Gradients — gradient presets + custom two-stop gradient with angle
     Photos    — bundled Unsplash photos (assets/wallpapers, credited), Upload Image…,
                 or a pasted Unsplash link
   Usage: link this file after the markup and add a button with [data-gg-wallpaper-trigger].
   Right-clicking the empty desktop also opens it. The choice is remembered in localStorage.
   "Default" leaves the page's own CSS background in charge (so Light/Dark still applies). */
(function () {
  const BASE = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, "")) || "";
  const KEY = "gg-wallpaper";

  const COLORS = [
    ["Graphite", "oklch(0.32 0.01 260)"], ["Midnight", "oklch(0.22 0.04 265)"], ["Ocean", "oklch(0.5 0.12 240)"],
    ["Teal", "oklch(0.55 0.09 200)"], ["Sage", "oklch(0.62 0.06 150)"], ["Sand", "oklch(0.78 0.05 80)"],
    ["Rose", "oklch(0.68 0.1 15)"], ["Plum", "oklch(0.42 0.1 320)"], ["Silver", "oklch(0.86 0.005 260)"]
  ];
  const GRADIENTS = [
    ["Golden Hour", "linear-gradient(160deg, oklch(0.82 0.12 70), oklch(0.6 0.17 35) 55%, oklch(0.4 0.12 10))"],
    ["Bay", "linear-gradient(170deg, oklch(0.62 0.11 230), oklch(0.3 0.08 260))"],
    ["Fog", "linear-gradient(180deg, oklch(0.9 0.015 240), oklch(0.62 0.04 250))"],
    ["Aurora", "linear-gradient(135deg, oklch(0.6 0.12 170), oklch(0.36 0.12 280))"],
    ["Dusk", "linear-gradient(180deg, oklch(0.72 0.1 330), oklch(0.36 0.08 270))"],
    ["Redwood", "linear-gradient(160deg, oklch(0.52 0.1 40), oklch(0.28 0.05 150))"],
    ["Sunrise", "radial-gradient(120% 90% at 50% 100%, oklch(0.85 0.13 75), oklch(0.62 0.14 20) 45%, oklch(0.3 0.08 280))"],
    ["Mono", "linear-gradient(180deg, oklch(0.62 0 0), oklch(0.24 0 0))"]
  ];
  const PHOTOS = [
    ["golden-gate-sunset", "Golden Gate at Sunset", "Kellen Riggin", "https://unsplash.com/photos/ik2r_6TsA9k"],
    ["golden-gate-bay", "Golden Gate Bridge", "Chloe Leis", "https://unsplash.com/photos/Q1Ka2cD9XSY"],
    ["yosemite-valley", "Yosemite Valley", "Jeremy Bishop", "https://unsplash.com/photos/d3fZSXlJ3Ok"],
    ["big-sur-mcway-falls", "McWay Falls, Big Sur", "Chor Tsang", "https://unsplash.com/photos/07mSKrzKiRw"],
    ["big-sur-fog", "Big Sur in Fog", "Robson Hatsukami Morgan", "https://unsplash.com/photos/L-dkrcmDqhs"]
  ];

  const css = `
  .ggw-pop { position: fixed; z-index: 40; width: 344px; max-height: calc(100vh - 80px); overflow: auto; padding: 12px; box-sizing: border-box;
    border-radius: 14px; font: var(--gg-body); color: var(--gg-label); }
  .ggw-pop[hidden] { display: none; }
  .ggw-tabs { display: flex; padding: 2px; gap: 2px; border-radius: 999px; background: var(--gg-fill); margin-bottom: 12px; }
  .ggw-tabs button { flex: 1; height: 24px; border: 0; border-radius: 999px; font: var(--gg-callout); color: var(--gg-label); background: transparent; cursor: default; }
  .ggw-tabs button:hover { background: var(--gg-fill-strong); }
  .ggw-tabs button[aria-selected="true"] { background: var(--gg-content-bg); font-weight: 600; box-shadow: 0 0.5px 2px rgb(0 0 0 / 0.2); }
  .ggw-h { font: 600 11px/14px var(--gg-font); color: var(--gg-label-2); margin: 4px 2px 8px; }
  .ggw-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 14px; }
  .ggw-grid.photos { grid-template-columns: repeat(3, 1fr); }
  .ggw-sw { position: relative; aspect-ratio: 1; border: 0; padding: 0; border-radius: 10px; cursor: default;
    box-shadow: inset 0 0 0 0.5px rgb(0 0 0 / 0.2); background-size: cover; background-position: center; }
  .ggw-grid.photos .ggw-sw { aspect-ratio: 16 / 10; border-radius: 8px; }
  .ggw-sw:hover { filter: brightness(1.06); }
  .ggw-sw[aria-checked="true"] { outline: 3px solid var(--gg-accent); outline-offset: 2px; }
  .ggw-sw:focus-visible { outline: 3px solid var(--gg-focus-ring); outline-offset: 2px; }
  .ggw-sw.default { display: grid; place-items: center; font: 600 10px/1 var(--gg-font); color: var(--gg-label); background: var(--gg-fill); }
  .ggw-row { display: flex; align-items: center; gap: 8px; margin: 0 2px 10px; }
  .ggw-row label { flex: none; width: 56px; color: var(--gg-label-2); }
  .ggw-row input[type="color"] { width: 44px; height: 24px; padding: 0; border: 0; border-radius: 6px; background: none; cursor: default; }
  .ggw-row input[type="range"] { flex: 1; accent-color: var(--gg-accent); }
  .ggw-row output { width: 36px; text-align: right; font-variant-numeric: tabular-nums; color: var(--gg-label-2); }
  .ggw-preview { height: 44px; flex: 1; border-radius: 8px; box-shadow: inset 0 0 0 0.5px rgb(0 0 0 / 0.2); }
  .ggw-btn { height: 24px; padding: 0 12px; border: 0; border-radius: 999px; font: var(--gg-body); color: var(--gg-label); background: var(--gg-fill-strong); cursor: default; }
  .ggw-btn:hover { background: color-mix(in oklch, var(--gg-label) 16%, transparent); }
  .ggw-btn.primary { background: var(--gg-accent); color: var(--gg-on-accent); }
  .ggw-btn.primary:hover { background: color-mix(in oklch, var(--gg-accent) 88%, black); }
  .ggw-btn:focus-visible, .ggw-tabs button:focus-visible, .ggw-field:focus-visible { outline: 3px solid var(--gg-focus-ring); outline-offset: 1px; }
  .ggw-field { flex: 1; min-width: 0; height: 24px; padding: 0 10px; border: 0; border-radius: 6px; font: var(--gg-body); color: var(--gg-label);
    background: var(--gg-content-bg); box-shadow: inset 0 0 0 0.5px var(--gg-separator); }
  .ggw-note { margin: 0 2px 10px; font: var(--gg-subheadline); color: var(--gg-label-2); }
  .ggw-note a, .ggw-credit a { color: inherit; }
  .ggw-note.err { color: var(--gg-red); }
  .ggw-sep { height: 0.5px; background: var(--gg-separator); margin: 4px 0 12px; }
  .ggw-credit { position: fixed; left: 16px; bottom: 16px; z-index: 5; padding: 4px 10px; border-radius: 999px; font: var(--gg-subheadline); color: var(--gg-label); }
  .ggw-credit[hidden] { display: none; }
  html.has-desktop .ggw-credit { bottom: 100px; }
  .ggw-trigger-swatch { display: inline-block; width: 14px; height: 14px; border-radius: 4px; vertical-align: -2px; margin-right: 6px;
    box-shadow: inset 0 0 0 0.5px rgb(0 0 0 / 0.25); background-size: cover; background-position: center; }`;
  document.head.insertAdjacentHTML("beforeend", `<style>${css}</style>`);

  let state = { type: "default" };
  try { state = JSON.parse(localStorage.getItem(KEY)) || state; } catch (e) {}

  const credit = document.createElement("div");
  credit.className = "ggw-credit gg-glass"; credit.hidden = true;
  document.body.append(credit);

  function cssFor(s) {
    if (s.type === "color" || s.type === "custom-color") return s.value;
    if (s.type === "gradient" || s.type === "custom-gradient") return s.value;
    if (s.type === "photo") return `center / cover no-repeat url("${BASE}wallpapers/${s.value}.jpg")`;
    if (s.type === "upload" || s.type === "url") return `center / cover no-repeat url("${s.value}")`;
    return "";
  }
  function apply() {
    const bg = cssFor(state);
    for (const el of [document.documentElement, document.body]) {
      el.style.background = bg;
      el.style.backgroundAttachment = bg ? "fixed" : "";
    }
    const p = state.type === "photo" && PHOTOS.find(x => x[0] === state.value);
    credit.hidden = !(p || state.type === "url");
    credit.innerHTML = p ? `Photo: <a href="${p[3]}" target="_blank" rel="noopener">${p[2]}</a> / Unsplash`
      : state.type === "url" ? `Photo: <a href="${state.page || "https://unsplash.com"}" target="_blank" rel="noopener">Unsplash</a>` : "";
    document.querySelectorAll(".ggw-trigger-swatch").forEach(s => {
      s.style.background = state.type === "photo" ? `center / cover url("${BASE}wallpapers/thumbs/${state.value}.jpg")` : bg || "var(--gg-fill-strong)";
    });
    pop && pop.querySelectorAll(".ggw-sw").forEach(b => b.setAttribute("aria-checked", b.dataset.key === keyOf(state)));
  }
  const keyOf = s => s.type + ":" + (s.type === "default" ? "" : s.value);
  function set(s, note) {
    state = s;
    apply();
    let msg = note || "";
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { msg = "This image is too large to remember after a reload."; }
    if (pop) { const n = pop.querySelector("[data-note='photos']"); if (n && (msg || s.type !== "upload")) { n.textContent = msg; n.classList.toggle("err", !!msg); } }
  }

  // Unsplash page link → direct image (the /download endpoint redirects to the file)
  function unsplashToImage(raw) {
    let u; try { u = new URL(raw.trim()); } catch (e) { return null; }
    if (u.hostname === "images.unsplash.com") { u.searchParams.set("w", "2560"); u.searchParams.set("q", "80"); return { src: u.href, page: "https://unsplash.com" }; }
    if (/(^|\.)unsplash\.com$/.test(u.hostname)) {
      const m = u.pathname.match(/\/photos\/(?:[^/]*-)?([A-Za-z0-9_-]{11})\/?$/);
      if (m) return { src: `https://unsplash.com/photos/${m[1]}/download?force=true&w=2560`, page: `https://unsplash.com/photos/${m[1]}` };
    }
    return null;
  }

  // Uploads are downscaled to ≤2560 px JPEG so they fit in localStorage
  function readUpload(file) {
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 2560 / Math.max(img.width, img.height));
        const c = Object.assign(document.createElement("canvas"), { width: Math.round(img.width * k), height: Math.round(img.height * k) });
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(); };
      img.src = url;
    });
  }

  let pop = null, trigger = null, tab = "colors";
  const sw = (key, label, bg, extra = "") =>
    `<button class="ggw-sw ${extra}" role="radio" aria-label="${label}" title="${label}" data-key="${key}" style="${bg ? `background:${bg.replace(/"/g, "&quot;")}` : ""}">${extra === "default" ? "Auto" : ""}</button>`;

  function build() {
    pop = document.createElement("div");
    pop.className = "ggw-pop gg-glass"; pop.hidden = true;
    pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Wallpaper");
    pop.dataset.odId = "wallpaper-popover";
    const cg = state.type === "custom-gradient" ? state.parts : { a: "#f2a65a", b: "#3a3f8f", angle: 160 };
    pop.innerHTML = `
      <div class="ggw-tabs" role="tablist">
        <button role="tab" data-tab="colors">Colors</button><button role="tab" data-tab="gradients">Gradients</button><button role="tab" data-tab="photos">Photos</button>
      </div>
      <section data-pane="colors" role="tabpanel">
        <div class="ggw-h">Solid Colors</div>
        <div class="ggw-grid" role="radiogroup" aria-label="Solid colors">${sw("default:", "Default", "", "default")}${COLORS.map(([n, v]) => sw("color:" + v, n, v)).join("")}</div>
        <div class="ggw-sep"></div>
        <div class="ggw-h">Custom Color</div>
        <div class="ggw-row"><label for="ggw-c">Color</label><input type="color" id="ggw-c" value="${state.type === "custom-color" ? state.value : "#4a6fa5"}"><span class="ggw-note" style="margin:0" id="ggw-c-hex"></span></div>
      </section>
      <section data-pane="gradients" role="tabpanel">
        <div class="ggw-h">Gradients</div>
        <div class="ggw-grid" role="radiogroup" aria-label="Gradients" style="grid-template-columns:repeat(4,1fr)">${GRADIENTS.map(([n, v]) => sw("gradient:" + v, n, v)).join("")}</div>
        <div class="ggw-sep"></div>
        <div class="ggw-h">Custom Gradient</div>
        <div class="ggw-row"><label for="ggw-ga">Start</label><input type="color" id="ggw-ga" value="${cg.a}"><label for="ggw-gb" style="width:auto;margin-left:12px">End</label><input type="color" id="ggw-gb" value="${cg.b}"></div>
        <div class="ggw-row"><label for="ggw-angle">Angle</label><input type="range" id="ggw-angle" min="0" max="360" step="5" value="${cg.angle}"><output id="ggw-angle-out">${cg.angle}°</output></div>
        <div class="ggw-row"><div class="ggw-preview" id="ggw-gprev"></div><button class="ggw-btn primary" id="ggw-gapply">Use Gradient</button></div>
      </section>
      <section data-pane="photos" role="tabpanel">
        <div class="ggw-h">Unsplash</div>
        <div class="ggw-grid photos" role="radiogroup" aria-label="Photos">${PHOTOS.map(([f, n, by]) => sw("photo:" + f, `${n} — photo by ${by}`, `center / cover url(&quot;${BASE}wallpapers/thumbs/${f}.jpg&quot;)`)).join("")}</div>
        <div class="ggw-row"><input class="ggw-field" id="ggw-url" type="url" placeholder="Paste an Unsplash photo link" aria-label="Unsplash photo link"><button class="ggw-btn" id="ggw-url-go">Use</button></div>
        <p class="ggw-note"><a href="https://unsplash.com/s/photos/wallpaper" target="_blank" rel="noopener">Browse Unsplash</a> · Links need an internet connection.</p>
        <div class="ggw-sep"></div>
        <div class="ggw-row" style="justify-content:space-between"><span>Your own image</span><button class="ggw-btn" id="ggw-upload">Upload Image…</button></div>
        <input type="file" id="ggw-file" accept="image/*" hidden>
        <p class="ggw-note" data-note="photos" aria-live="polite"></p>
      </section>`;
    document.body.append(pop);

    const $ = s => pop.querySelector(s);
    const tabs = [...pop.querySelectorAll("[role=tab]")];
    const showTab = t => {
      tab = t;
      tabs.forEach(b => { const on = b.dataset.tab === t; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
      pop.querySelectorAll("[data-pane]").forEach(p => p.hidden = p.dataset.pane !== t);
    };
    tabs.forEach((b, i) => {
      b.addEventListener("click", () => showTab(b.dataset.tab));
      b.addEventListener("keydown", e => {
        const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : -1;
        if (tabs[n]) { e.preventDefault(); showTab(tabs[n].dataset.tab); tabs[n].focus(); }
      });
    });
    showTab(state.type.includes("gradient") ? "gradients" : /photo|upload|url/.test(state.type) ? "photos" : "colors");

    pop.addEventListener("click", e => {
      const b = e.target.closest(".ggw-sw"); if (!b) return;
      const [type, ...rest] = b.dataset.key.split(":"); set({ type, value: rest.join(":") });
    });

    const c = $("#ggw-c"), hex = $("#ggw-c-hex");
    const useColor = () => { hex.textContent = c.value.toUpperCase(); set({ type: "custom-color", value: c.value }); };
    hex.textContent = c.value.toUpperCase();
    c.addEventListener("input", useColor);

    const ga = $("#ggw-ga"), gb = $("#ggw-gb"), ang = $("#ggw-angle");
    const grad = () => `linear-gradient(${ang.value}deg, ${ga.value}, ${gb.value})`;
    const prev = () => { $("#ggw-gprev").style.background = grad(); $("#ggw-angle-out").textContent = ang.value + "°"; };
    [ga, gb, ang].forEach(i => i.addEventListener("input", prev)); prev();
    $("#ggw-gapply").addEventListener("click", () => set({ type: "custom-gradient", value: grad(), parts: { a: ga.value, b: gb.value, angle: +ang.value } }));

    const note = $("[data-note='photos']");
    const useUrl = () => {
      const r = unsplashToImage($("#ggw-url").value);
      if (!r) { note.textContent = "That doesn't look like an Unsplash photo link."; note.classList.add("err"); return; }
      const probe = new Image();
      note.textContent = "Loading…"; note.classList.remove("err");
      probe.onload = () => set({ type: "url", value: r.src, page: r.page });
      probe.onerror = () => { note.textContent = "Couldn't load that photo. Check the link and your connection."; note.classList.add("err"); };
      probe.src = r.src;
    };
    $("#ggw-url-go").addEventListener("click", useUrl);
    $("#ggw-url").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); useUrl(); } });
    $("#ggw-upload").addEventListener("click", () => $("#ggw-file").click());
    $("#ggw-file").addEventListener("change", async e => {
      const f = e.target.files[0]; if (!f) return;
      note.textContent = "Preparing image…"; note.classList.remove("err");
      try { set({ type: "upload", value: await readUpload(f) }); if (note.textContent === "Preparing image…") note.textContent = ""; }
      catch (err) { note.textContent = "That file couldn't be read as an image."; note.classList.add("err"); }
      e.target.value = "";
    });

    pop.addEventListener("keydown", e => { if (e.key === "Escape") { e.preventDefault(); close(); } });
    document.addEventListener("pointerdown", e => {
      if (!pop.hidden && !pop.contains(e.target) && !(trigger && trigger.contains(e.target))) close(false);
    });
    apply();
  }

  function open(anchor, at) {
    if (!pop) build();
    trigger = anchor || null;
    if (at) { pop.style.left = Math.min(at.x, innerWidth - 360) + "px"; pop.style.top = Math.min(at.y, innerHeight - 200) + "px"; pop.style.right = "auto"; }
    else if (anchor) { const r = anchor.getBoundingClientRect(); pop.style.top = r.bottom + 10 + "px"; pop.style.right = Math.max(8, innerWidth - r.right) + "px"; pop.style.left = "auto"; }
    pop.hidden = false;
    trigger && trigger.setAttribute("aria-expanded", "true");
    pop.querySelector("[role=tab][aria-selected=true]").focus();
  }
  function close(refocus = true) {
    if (!pop || pop.hidden) return;
    pop.hidden = true;
    if (trigger) { trigger.setAttribute("aria-expanded", "false"); if (refocus) trigger.focus(); }
  }

  function init() {
    document.querySelectorAll("[data-gg-wallpaper-trigger]").forEach(t => {
      t.setAttribute("aria-haspopup", "dialog"); t.setAttribute("aria-expanded", "false");
      if (!t.querySelector(".ggw-trigger-swatch")) t.insertAdjacentHTML("afterbegin", `<span class="ggw-trigger-swatch" aria-hidden="true"></span>`);
      t.addEventListener("click", () => (pop && !pop.hidden ? close() : open(t)));
    });
    // Right-click the empty desktop → Change Wallpaper (as on a Mac)
    document.addEventListener("contextmenu", e => {
      if (e.target !== document.body && e.target !== document.documentElement) return;
      e.preventDefault(); open(null, { x: e.clientX, y: e.clientY });
    });
    apply();
  }
  window.ggWallpaper = { open, close, set: s => set(s), get: () => state };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
