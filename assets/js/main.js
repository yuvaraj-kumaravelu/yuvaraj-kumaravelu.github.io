/* ==========================================================================
   Portfolio interactions
   Progressive enhancement only - every piece of content is in index.html,
   so the page stays fully usable if this script fails to load.
   ========================================================================== */

(function () {
  "use strict";

  /* ---- Header: add a solid background once the page scrolls ---- */
  function initHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---- Mobile navigation toggle ---- */
  function initMobileNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after choosing a link, on Escape, or when clicking outside
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    // Reset state when resizing up to desktop
    window.matchMedia("(min-width: 901px)").addEventListener("change", (mq) => {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---- Highlight the nav link for the section in view ---- */
  function initActiveNav() {
    const links = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;

    const setActive = (id) => {
      links.forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

  /* ---- Hero waveform: build bars, pause animation when offscreen ---- */
  function initWave() {
    const wave = document.querySelector("[data-wave]");
    const consoleEl = document.querySelector(".console");
    if (!wave) return;

    const BAR_COUNT = 48;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement("span");
      // A soft envelope keeps the centre louder than the edges, like speech
      const envelope = Math.sin((i / (BAR_COUNT - 1)) * Math.PI);
      const height = 25 + envelope * 60 + Math.random() * 15;
      bar.style.setProperty("--h", `${Math.min(height, 95).toFixed(0)}%`);
      bar.style.setProperty("--d", `${(Math.random() * -1.3).toFixed(2)}s`);
      fragment.appendChild(bar);
    }
    wave.appendChild(fragment);

    if (!consoleEl || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      consoleEl.classList.toggle("is-paused", !entry.isIntersecting);
    });
    observer.observe(consoleEl);
  }

  /* ---- Copy-to-clipboard buttons with a toast confirmation ---- */
  function initCopy() {
    const toast = document.querySelector("[data-toast]");
    const toastText = document.querySelector("[data-toast-text]");
    let hideTimer;

    const showToast = (message) => {
      if (!toast || !toastText) return;
      toastText.textContent = message;
      toast.classList.add("is-visible");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
    };

    document.querySelectorAll("[data-copy]").forEach((button) => {
      button.addEventListener("click", async () => {
        const value = button.getAttribute("data-copy");
        try {
          await navigator.clipboard.writeText(value);
          showToast(`Copied: ${value}`);
        } catch {
          showToast("Couldn't copy - please select the text instead");
        }
      });
    });
  }

  /* ---- Project call-flow diagrams (Project 01 and 02) ----
     Inline: each flow is scaled to fit its panel width, so it is fully
     visible without scrolling. "View large" (or clicking the diagram) moves
     that flow's canvas into one shared full-screen dialog with zoom and
     drag-to-pan, then moves it back on close. Without JS the panel scrolls. */
  function initCallflow() {
    const flows = Array.from(document.querySelectorAll(".callflow[data-draw]"))
      .map((flow) => {
        const inlineViewport = flow.querySelector("[data-cf-inline]");
        const sizer = inlineViewport && inlineViewport.querySelector(".cfx-sizer");
        const canvas = sizer && sizer.querySelector(".cfx-canvas");
        if (!canvas) return null;
        // natural canvas size (transforms don't affect offset sizes)
        return { flow, inlineViewport, sizer, canvas, W: canvas.offsetWidth, H: canvas.offsetHeight };
      })
      .filter(Boolean);
    if (!flows.length) return;

    const applyScale = (f, scale) => {
      f.canvas.style.setProperty("--cf-scale", scale.toFixed(4));
      f.sizer.style.width = `${Math.round(f.W * scale)}px`;
      f.sizer.style.height = `${Math.round(f.H * scale)}px`;
    };

    const fitInline = (f) => {
      if (f.sizer.parentElement !== f.inlineViewport) return;
      applyScale(f, f.inlineViewport.clientWidth / f.W);
    };

    flows.forEach((f) => {
      f.inlineViewport.classList.add("is-fit");
      fitInline(f);
      if ("ResizeObserver" in window) new ResizeObserver(() => fitInline(f)).observe(f.inlineViewport);
      else window.addEventListener("resize", () => fitInline(f), { passive: true });
      const tip = f.flow.querySelector(".callflow__tip");
      if (tip) tip.hidden = false;
    });

    // ---- One shared full-screen "View large" dialog ----
    const dialog = document.querySelector(".cf-modal");
    if (!dialog || typeof dialog.showModal !== "function") return;

    const modalViewport = dialog.querySelector("[data-cf-modal-viewport]");
    const modalTitle = dialog.querySelector(".cf-modal__title");
    const modalKicker = dialog.querySelector(".cf-modal__kicker");
    const level = dialog.querySelector(".cf-modal__level");
    const zoomIn = dialog.querySelector('[data-cf-zoom="in"]');
    const zoomOut = dialog.querySelector('[data-cf-zoom="out"]');
    const MAX_SCALE = 1.6;
    const PADDING = 48;
    let active = null; // the flow currently shown in the dialog
    let scale = 1;
    let fitScale = 1;
    let followFit = true; // keep fitting on resize until the visitor zooms

    const computeFit = () =>
      Math.min((modalViewport.clientWidth - PADDING) / active.W, (modalViewport.clientHeight - PADDING) / active.H);

    const setZoom = (next, keepCentre = true) => {
      const minScale = Math.min(fitScale, 1);
      const target = Math.max(minScale, Math.min(MAX_SCALE, next));
      // keep the point at the centre of the screen in place while zooming
      const cx = (modalViewport.scrollLeft + modalViewport.clientWidth / 2) / scale;
      const cy = (modalViewport.scrollTop + modalViewport.clientHeight / 2) / scale;
      scale = target;
      applyScale(active, scale);
      if (keepCentre) {
        modalViewport.scrollLeft = cx * scale - modalViewport.clientWidth / 2;
        modalViewport.scrollTop = cy * scale - modalViewport.clientHeight / 2;
      }
      if (level) level.textContent = `${Math.round(scale * 100)}%`;
      if (zoomOut) zoomOut.disabled = scale <= minScale + 0.001;
      if (zoomIn) zoomIn.disabled = scale >= MAX_SCALE - 0.001;
    };

    const open = (f) => {
      active = f;
      // label the dialog with this flow's own title
      const title = f.flow.querySelector(".callflow__title");
      const kicker = f.flow.querySelector(".callflow__kicker");
      if (modalTitle && title) modalTitle.textContent = title.textContent.replace(/\s+/g, " ").trim();
      if (modalKicker) {
        const project = f.flow.closest(".project")?.querySelector(".project__index")?.textContent.trim();
        const kind = kicker ? kicker.textContent.split("·")[0].trim() : "Call flow";
        modalKicker.textContent = project ? `Project ${project} · ${kind}` : kind;
      }

      // the dialog stage needs the same flow-type classes for its styling
      const stage = modalViewport.parentElement;
      stage.classList.toggle("callflow--infra", f.flow.classList.contains("callflow--infra"));

      modalViewport.appendChild(f.sizer);
      modalViewport.classList.add("is-zoomable");
      document.documentElement.classList.add("cf-modal-open");
      dialog.showModal();

      fitScale = computeFit();
      // on small screens the fitted flow is too small to read, so start zoomed in at the first step
      followFit = fitScale >= 0.45;
      scale = followFit ? fitScale : 0.75;
      setZoom(scale, false);
      modalViewport.scrollLeft = 0;
      modalViewport.scrollTop = Math.max(0, (f.H * scale - modalViewport.clientHeight) / 2);
      modalViewport.focus({ preventScroll: true });
    };

    flows.forEach((f) => {
      const openButton = f.flow.querySelector("[data-cf-open]");
      if (openButton) {
        openButton.hidden = false;
        openButton.addEventListener("click", () => open(f));
      }
      // clicking the diagram itself also opens the large view
      f.inlineViewport.addEventListener("click", () => open(f));
    });

    dialog.addEventListener("close", () => {
      if (!active) return;
      active.inlineViewport.appendChild(active.sizer);
      modalViewport.classList.remove("is-zoomable");
      document.documentElement.classList.remove("cf-modal-open");
      fitInline(active);
      active = null;
    });

    dialog.querySelector("[data-cf-close]").addEventListener("click", () => dialog.close());

    dialog.querySelectorAll("[data-cf-zoom]").forEach((button) => {
      button.addEventListener("click", () => {
        if (!active) return;
        const action = button.dataset.cfZoom;
        if (action === "fit") {
          fitScale = computeFit();
          followFit = true;
          setZoom(fitScale, false);
        } else {
          followFit = false;
          setZoom(action === "in" ? scale * 1.25 : scale / 1.25);
        }
      });
    });

    // Ctrl/⌘ + wheel (and trackpad pinch) zooms; plain wheel scrolls as usual
    modalViewport.addEventListener(
      "wheel",
      (event) => {
        if (!active || (!event.ctrlKey && !event.metaKey)) return;
        event.preventDefault();
        followFit = false;
        setZoom(scale * (event.deltaY < 0 ? 1.1 : 1 / 1.1));
      },
      { passive: false }
    );

    // Drag to pan with a mouse (touch pans natively)
    let drag = null;
    modalViewport.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      drag = { x: event.clientX, y: event.clientY, left: modalViewport.scrollLeft, top: modalViewport.scrollTop };
      modalViewport.classList.add("is-dragging");
      modalViewport.setPointerCapture(event.pointerId);
    });
    modalViewport.addEventListener("pointermove", (event) => {
      if (!drag) return;
      modalViewport.scrollLeft = drag.left - (event.clientX - drag.x);
      modalViewport.scrollTop = drag.top - (event.clientY - drag.y);
    });
    const endDrag = (event) => {
      if (!drag) return;
      drag = null;
      modalViewport.classList.remove("is-dragging");
      if (modalViewport.hasPointerCapture(event.pointerId)) modalViewport.releasePointerCapture(event.pointerId);
    };
    modalViewport.addEventListener("pointerup", endDrag);
    modalViewport.addEventListener("pointercancel", endDrag);

    window.addEventListener(
      "resize",
      () => {
        if (!dialog.open || !active) return;
        fitScale = computeFit();
        if (followFit) setZoom(fitScale, false);
      },
      { passive: true }
    );
  }

  /* ---- Keep the footer year current ---- */
  function initYear() {
    const year = document.querySelector("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  initHeader();
  initMobileNav();
  initActiveNav();
  initWave();
  initCopy();
  initCallflow();
  initYear();
})();
