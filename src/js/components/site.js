import Swiper, { Autoplay, EffectFade, Navigation } from "swiper";
import { Fancybox } from "@fancyapps/ui";

const autoplay = {
  delay: 5000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true
};

export default () => {
  const header = document.querySelector(".header");

  document.querySelectorAll(".ba").forEach((figure) => {
    const range = figure.querySelector(".ba__range");
    if (!range) return;
    const setSplit = (value) => {
      const next = Math.min(92, Math.max(8, Number(value)));
      figure.style.setProperty("--pos", next + "%");
      range.value = String(next);
    };
    range.addEventListener("input", () => setSplit(range.value));
    setSplit(50);
  });

  const resultsEl = document.querySelector(".results-swiper");
  let resultsSwiper = null;
  if (resultsEl) {
    resultsSwiper = new Swiper(resultsEl, {
      modules: [Autoplay, EffectFade],
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: 700,
      autoHeight: true,
      noSwiping: true,
      noSwipingSelector: "input, .ba, .ba__range",
      touchStartPreventDefault: false,
      autoplay
    });
    resultsEl.querySelectorAll(".ba, .ba__range").forEach((el) => {
      el.classList.add("swiper-no-swiping");
    });
    const unlockSwipe = () => {
      resultsSwiper.allowTouchMove = true;
    };
    resultsEl.querySelectorAll(".ba__range").forEach((range) => {
      range.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        resultsSwiper.allowTouchMove = false;
      });
      range.addEventListener("pointerup", unlockSwipe);
      range.addEventListener("pointercancel", unlockSwipe);
    });
    window.addEventListener("pointerup", unlockSwipe);
    const prev = document.querySelector("#prev-work");
    const next = document.querySelector("#next-work");
    if (prev) prev.addEventListener("click", () => resultsSwiper.slidePrev());
    if (next) next.addEventListener("click", () => resultsSwiper.slideNext());
  }

  const reviewsEl = document.querySelector(".reviews-swiper");
  if (reviewsEl) {
    const reviewsSwiper = new Swiper(reviewsEl, {
      modules: [Autoplay],
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      speed: 700,
      observer: true,
      observeParents: true,
      watchOverflow: true,
      autoplay,
      breakpoints: {
        800: { slidesPerView: 2, spaceBetween: 28 }
      }
    });
    requestAnimationFrame(() => reviewsSwiper.update());
  }

  const comfortEl = document.querySelector(".comfort-swiper");
  if (comfortEl) {
    new Swiper(comfortEl, {
      modules: [Autoplay, Navigation],
      slidesPerView: 1.15,
      spaceBetween: 14,
      loop: true,
      speed: 650,
      grabCursor: true,
      autoplay,
      navigation: {
        prevEl: "#prev-comfort",
        nextEl: "#next-comfort"
      },
      breakpoints: {
        640: { slidesPerView: 2.1, spaceBetween: 16 },
        980: { slidesPerView: 3, spaceBetween: 18 }
      }
    });
  }

  const storiesEl = document.querySelector(".stories-swiper");
  let storiesSwiper = null;
  if (storiesEl) {
    storiesSwiper = new Swiper(storiesEl, {
      modules: [Autoplay, EffectFade],
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: 600,
      autoplay
    });
    storiesSwiper.autoplay.stop();
  }
  const storyToggle = document.querySelector("#story-toggle");
  if (storyToggle && storiesSwiper) {
    storyToggle.addEventListener("click", () => {
      if (storiesSwiper.autoplay.running) {
        storiesSwiper.autoplay.stop();
        storiesEl.classList.remove("is-playing");
        storyToggle.setAttribute("aria-label", "Смотреть отзывы");
      } else {
        storiesSwiper.autoplay.start();
        storiesEl.classList.add("is-playing");
        storyToggle.setAttribute("aria-label", "Остановить");
      }
    });
  }

  let scrollLockY = 0;
  let scrollLocked = false;

  function lockPageScroll() {
    if (scrollLocked) return;
    scrollLocked = true;
    scrollLockY = window.scrollY || window.pageYOffset || 0;
    const scrollbar = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.classList.add("is-modal-open");
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
  }

  function unlockPageScroll() {
    if (!scrollLocked) return;
    if (document.querySelector("dialog[open]")) return;
    scrollLocked = false;
    document.documentElement.classList.remove("is-modal-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = "";
    window.scrollTo(0, scrollLockY);
  }

  function openDialog(id, trigger) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    document.querySelectorAll("dialog[open]").forEach((current) => {
      if (current !== dialog) closeDialog(current, true);
    });
    if (dialog._closeTimer) {
      clearTimeout(dialog._closeTimer);
      dialog._closeTimer = 0;
    }
    dialog.classList.remove("is-closing");
    dialog._trigger = trigger || document.activeElement;
    lockPageScroll();
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dialog.classList.add("is-open");
        const focusTarget =
          dialog.querySelector(".modal__close, [data-close]") ||
          dialog.querySelector("input, button, select, textarea, a[href]");
        if (focusTarget && typeof focusTarget.focus === "function") {
          focusTarget.focus({ preventScroll: true });
        }
      });
    });
  }

  function closeDialog(dialog, instant) {
    if (!dialog || !dialog.open || dialog._closing) return;
    dialog._closing = true;
    dialog.classList.add("is-closing");
    dialog.classList.remove("is-open");
    const trigger = dialog._trigger;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      dialog._closing = false;
      dialog.classList.remove("is-closing");
      if (dialog._closeTimer) {
        clearTimeout(dialog._closeTimer);
        dialog._closeTimer = 0;
      }
      if (dialog.open) dialog.close();
      if (trigger && typeof trigger.focus === "function") {
        trigger.focus({ preventScroll: true });
      }
      unlockPageScroll();
    };
    if (instant) {
      finish();
      return;
    }
    const onEnd = (event) => {
      if (event.target !== dialog) return;
      if (event.propertyName !== "opacity" && event.propertyName !== "transform") return;
      finish();
    };
    dialog.addEventListener("transitionend", onEnd, { once: true });
    dialog._closeTimer = setTimeout(finish, 520);
  }

  function setLesson(active) {
    const holder = document.querySelector("#lesson-frame");
    if (!holder) return;
    if (!active) {
      holder.replaceChildren();
      return;
    }
    const frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/oaCGCBNll_8?autoplay=1";
    frame.title = "Мастер-класс — пудровое напыление бровей от А до Я";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.setAttribute("allowfullscreen", "");
    holder.replaceChildren(frame);
  }

  document.querySelectorAll("[data-open]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const id = trigger.getAttribute("data-open");
      if (id === "lesson-dialog") setLesson(true);
      if (id === "booking") {
        const booking = document.querySelector("#booking");
        resetScope(booking && booking.querySelector(".form-scope"));
        const select = booking && booking.querySelector("[name=service]");
        const service = trigger.getAttribute("data-service");
        if (select && service) select.value = service;
      }
      if (id === "video" && storiesSwiper) {
        storiesSwiper.slideToLoop(0, 0);
        storiesSwiper.autoplay.start();
        if (storiesEl) storiesEl.classList.add("is-playing");
      }
      openDialog(id === "reviews" ? "reviews-dialog" : id, trigger);
      if (id === "video" && storiesSwiper) storiesSwiper.update();
    });
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeDialog(button.closest("dialog"));
    });
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener("close", () => {
      dialog.classList.remove("is-open", "is-closing");
      dialog._closing = false;
      if (dialog.id === "video" && storiesSwiper) {
        storiesSwiper.autoplay.stop();
        if (storiesEl) storiesEl.classList.remove("is-playing");
      }
      if (dialog.id === "lesson-dialog") setLesson(false);
      unlockPageScroll();
    });
  });

  document.querySelectorAll("#menu a").forEach((link) => {
    link.addEventListener("click", () => closeDialog(document.querySelector("#menu")));
  });

  function phoneOk(value) {
    const digits = value.replace(/\D/g, "");
    return digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"));
  }

  function resetScope(scope) {
    if (!scope) return;
    const form = scope.querySelector(".js-booking");
    const done = scope.querySelector(".form-done");
    const formView = scope.querySelector(".form-view");
    if (!form || !done || !formView) return;
    form.reset();
    formView.hidden = false;
    done.hidden = true;
    form.querySelectorAll(".field-error").forEach((error) => {
      error.hidden = true;
    });
    form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
  }

  document.querySelectorAll(".js-booking").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const scope = form.closest(".form-scope");
      const name = form.querySelector("[name=name]");
      const phone = form.querySelector("[name=phone]");
      const privacy = form.querySelector("[name=privacy]");
      const nameError = name.parentElement.querySelector(".field-error");
      const phoneError = phone.parentElement.querySelector(".field-error");
      const privacyError = privacy && privacy.closest("label")
        ? privacy.closest("label").querySelector(".field-error")
        : null;
      const nameValid = name.value.trim().length > 1;
      const validPhone = phoneOk(phone.value);
      const privacyValid = !privacy || privacy.checked;
      nameError.hidden = nameValid;
      phoneError.hidden = validPhone;
      if (privacyError) privacyError.hidden = privacyValid;
      name.toggleAttribute("aria-invalid", !nameValid);
      phone.toggleAttribute("aria-invalid", !validPhone);
      if (privacy) privacy.toggleAttribute("aria-invalid", !privacyValid);
      if (!nameValid || !validPhone || !privacyValid) return;
      const serviceField = form.querySelector("[name=service]");
      const service = serviceField ? serviceField.value : "";
      const doneText = scope.querySelector(".form-done__text");
      if (doneText) {
        doneText.textContent = service === "Обучение"
          ? "Программу обучения отправим после звонка. Мы свяжемся с вами в ближайшее время."
          : "Мы перезвоним, чтобы подтвердить время консультации.";
      }
      scope.querySelector(".form-view").hidden = true;
      scope.querySelector(".form-done").hidden = false;
    });
  });

  const page = document.body.dataset.page;
  if (page && page !== "home") {
    document.querySelectorAll(`[data-nav="${page}"]`).forEach((link) => {
      link.setAttribute("aria-current", "page");
    });
  }

  const pieces = [...document.querySelectorAll(".service-piece")];
  const indexLinks = [...document.querySelectorAll(".service-index a")];
  if (pieces.length && indexLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        indexLinks.forEach((link) => {
          link.classList.toggle("is-on", link.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-35% 0px -50% 0px", threshold: 0 });
    pieces.forEach((piece) => spy.observe(piece));
  }

  const filters = [...document.querySelectorAll("[data-filter]")];
  const works = [...document.querySelectorAll("[data-kind]")];
  if (filters.length && works.length) {
    filters.forEach((button) => {
      button.addEventListener("click", () => {
        const kind = button.getAttribute("data-filter");
        filters.forEach((item) => {
          const on = item === button;
          item.classList.toggle("is-on", on);
          item.setAttribute("aria-pressed", on ? "true" : "false");
        });
        works.forEach((work) => {
          work.hidden = kind !== "all" && work.getAttribute("data-kind") !== kind;
        });
      });
    });
  }

  const rail = document.querySelector(".program");
  if (rail) {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setRail = () => {
      if (reduced) {
        rail.style.setProperty("--p", "1");
        return;
      }
      const rect = rail.getBoundingClientRect();
      const start = window.innerHeight * 0.72;
      const travel = Math.max(rect.height * 0.72, 1);
      const passed = start - rect.top;
      rail.style.setProperty("--p", String(Math.min(1, Math.max(0, passed / travel))));
    };
    setRail();
    window.addEventListener("scroll", setRail, { passive: true });
    window.addEventListener("resize", setRail);
  }

  Fancybox.bind("[data-fancybox]");

  document.querySelectorAll(".feature, .card, .results, .services, .about, .train, .reviews").forEach((el) => {
    el.classList.add("reveal");
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.16 });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  const stats = document.querySelector(".stats");
  if (stats) {
    const counters = [...stats.querySelectorAll("[data-count]")];
    const format = (el, value) => {
      const decimals = Number(el.dataset.decimals || 0);
      const suffix = el.dataset.suffix || "";
      const shown = decimals ? value.toFixed(decimals) : String(Math.round(value));
      el.textContent = shown + suffix;
    };
    const run = () => {
      const start = performance.now();
      const duration = 1400;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        counters.forEach((el) => {
          format(el, Number(el.dataset.count) * eased);
        });
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const statsObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      run();
      statsObserver.disconnect();
    }, { threshold: 0.4 });
    statsObserver.observe(stats);
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
};
