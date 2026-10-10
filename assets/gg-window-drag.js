/* macOS Golden Gate — window dragging for HTML mockups.
   People move a Mac window by dragging its frame: the toolbar / title bar area,
   including the empty space around toolbar items. Controls inside the frame keep
   working; only drags that start on empty frame area move the window.

   Usage: link this file after the markup. Every .gg-window becomes draggable from
     .gg-toolbar, .gg-titlebar and any element marked [data-gg-drag-region].
   Options via attributes on .gg-window:
     data-gg-drag="off"          disable dragging for this window
     data-gg-drag-persist="key"  remember the position in localStorage under "key"
   The window keeps its normal layout position; dragging applies an offset through
   the CSS `translate` property, so `transform` stays free for open/close animations. */
(function () {
  const REGION = ".gg-toolbar, .gg-titlebar, [data-gg-drag-region]";
  const INTERACTIVE = "button, input, select, textarea, a[href], label, [role='button'], [role='option'], [role='menuitem'], [role='switch'], [contenteditable], [data-gg-no-drag]";
  const KEEP_VISIBLE = 80; // px of the window that must stay on screen horizontally
  const TITLE_HOLD = 44;   // px of the frame that must stay reachable vertically

  function topInset() {
    const bar = document.querySelector(".menubar");
    return bar && getComputedStyle(bar).display !== "none" ? bar.getBoundingClientRect().bottom : 0;
  }

  function makeDraggable(win) {
    if (win.dataset.ggDrag === "off" || win.__ggDrag) return;
    win.__ggDrag = true;
    const key = win.dataset.ggDragPersist;
    let dx = 0, dy = 0;
    if (key) { try { ({ dx = 0, dy = 0 } = JSON.parse(localStorage.getItem(key) || "{}")); } catch (e) {} }

    const apply = () => { win.style.translate = dx || dy ? `${dx}px ${dy}px` : ""; };
    const save = () => { if (key) try { localStorage.setItem(key, JSON.stringify({ dx, dy })); } catch (e) {} };

    // Keep the frame reachable: below the menu bar, never fully off the left/right/bottom edge.
    function clamp() {
      win.style.translate = "";
      const base = win.getBoundingClientRect();
      const minY = topInset() - base.top, maxY = innerHeight - TITLE_HOLD - base.top;
      const minX = KEEP_VISIBLE - base.right, maxX = innerWidth - KEEP_VISIBLE - base.left;
      dx = Math.round(Math.min(maxX, Math.max(minX, dx)));
      dy = Math.round(Math.min(maxY, Math.max(minY, dy)));
      apply();
    }

    let start = null;
    win.addEventListener("pointerdown", e => {
      if (e.button !== 0 || !e.isPrimary) return;
      const region = e.target.closest(REGION);
      if (!region || !win.contains(region) || e.target.closest(INTERACTIVE)) return;
      start = { x: e.clientX, y: e.clientY, dx, dy, id: e.pointerId, moved: false };
      region.setPointerCapture(e.pointerId);
      e.preventDefault(); // no text selection while dragging
    });
    win.addEventListener("pointermove", e => {
      if (!start || e.pointerId !== start.id) return;
      const mx = e.clientX - start.x, my = e.clientY - start.y;
      if (!start.moved && Math.hypot(mx, my) < 3) return; // ignore click jitter
      start.moved = true;
      win.classList.add("is-dragging");
      dx = start.dx + mx; dy = start.dy + my;
      clamp();
    });
    const end = e => {
      if (!start || e.pointerId !== start.id) return;
      if (start.moved) save();
      start = null;
      win.classList.remove("is-dragging");
    };
    win.addEventListener("pointerup", end);
    win.addEventListener("pointercancel", end);
    addEventListener("resize", () => { clamp(); save(); });

    win.ggResetPosition = () => { dx = dy = 0; apply(); save(); };
    win.ggClampPosition = () => { clamp(); save(); };
    requestAnimationFrame(clamp);
  }

  window.ggWindowDrag = makeDraggable;
  const init = () => document.querySelectorAll(".gg-window").forEach(makeDraggable);
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
