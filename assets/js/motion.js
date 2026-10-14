/* ==========================================================================
   Motion
   Scroll reveals, headline word reveals, count-up figures, diagram build-in,
   hide-on-scroll header, reading progress and the ambient cursor glow.
   Styles for every effect live in assets/css/animations.css.

   If the visitor prefers reduced motion, everything jumps straight to its
   final state — content is never hidden behind an animation.
   ========================================================================== */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const canObserve = "IntersectionObserver" in window;

  /* ---- Split short headlines into masked words ---- */
  function splitHeadlines() {
    document.querySelectorAll("[data-split]").forEach((headline) => {
      if (!reduceMotion) {
        let index = 0;
        const walk = (node) => {
          Array.from(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const fragment = document.createDocumentFragment();
              child.textContent.split(/(\s+)/).forEach((part) => {
                if (!part) return;
                if (/^\s+$/.test(part)) {
                  fragment.appendChild(document.createTextNode(part));
                  return;
                }
                const word = document.createElement("span");
                word.className = "word";
                const inner = document.createElement("span");
                inner.className = "word__inner";
                inner.style.setProperty("--word-i", index++);
                inner.textContent = part;
                word.appendChild(inner);
                fragment.appendChild(word);
              });
              child.replaceWith(fragment);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              walk(child);
            }
          });
        };
        walk(headline);
      }
      headline.classList.add("is-split");
    });
  }

  /* ---- Number the steps of each architecture diagram for staggering ---- */
  function indexFlowSteps() {
    document.querySelectorAll("[data-draw] .flow").forEach((flow) => {
      flow.querySelectorAll(".flow__step").forEach((step, i) => {
        step.style.setProperty("--step-i", i);
      });
    });
  }

  /* ---- Reveal elements, rules and diagrams as they scroll into view ---- */
  function initReveal() {
    const targets = document.querySelectorAll("[data-reveal], [data-draw], [data-rule]");

    // Stagger the children of a reveal group
    document.querySelectorAll("[data-reveal-group]").forEach((group) => {
      group.querySelectorAll(":scope > [data-reveal]").forEach((child, i) => {
        child.style.setProperty("--reveal-delay", `${Math.min(i * 60, 480)}ms`);
      });
    });

    if (reduceMotion || !canObserve) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* ---- Count figures up from zero when they come into view ---- */
  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (reduceMotion || !canObserve || !counters.length) return;

    const DURATION = 1200;
    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    counters.forEach((el) => {
      const text = el.textContent.trim();
      el.dataset.target = text;
      el.dataset.decimals = (text.split(".")[1] || "").length;
      el.textContent = (0).toFixed(el.dataset.decimals);
    });

    const run = (el) => {
      const target = parseFloat(el.dataset.target);
      const decimals = Number(el.dataset.decimals);
      const start = performance.now() + 250; // let the reveal begin first

      const tick = (now) => {
        const progress = Math.min(Math.max((now - start) / DURATION, 0), 1);
        el.textContent = (target * easeOutExpo(progress)).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = el.dataset.target; // exact original text
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* ---- Header hides on scroll down, returns on scroll up;
          a gold hairline shows reading progress ---- */
  function initScrollEffects() {
    const header = document.querySelector(".site-header");
    const nav = document.getElementById("site-nav");
    const progressBar = document.querySelector(".scroll-progress");
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (progressBar) {
        progressBar.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);
      }

      if (header && !reduceMotion) {
        const menuOpen = nav && nav.classList.contains("is-open");
        const goingDown = y > lastY + 4;
        const goingUp = y < lastY - 4;
        if (menuOpen || y < 160 || goingUp) header.classList.remove("is-hidden");
        else if (goingDown) header.classList.add("is-hidden");
      }

      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  /* ---- Ambient cursor glow: a soft orange light that trails the pointer
          (desktop only, from the original portfolio) ---- */
  function initCursorGlow() {
    const glow = document.querySelector(".cursor-glow");
    if (!glow || reduceMotion || !finePointer) return;

    let targetX = -999;
    let targetY = -999;
    let x = -999;
    let y = -999;

    window.addEventListener(
      "pointermove",
      (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
      },
      { passive: true }
    );

    const follow = () => {
      // ease 15% of the way each frame for a smooth, trailing feel
      x += (targetX - x) * 0.15;
      y += (targetY - y) * 0.15;
      glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }

  splitHeadlines();
  indexFlowSteps();
  initReveal();
  initCounters();
  initScrollEffects();
  initCursorGlow();
})();
