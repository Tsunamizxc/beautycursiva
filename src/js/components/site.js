import Swiper, { Autoplay, EffectFade } from "swiper";

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

  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog) return;
    document.querySelectorAll("dialog[open]").forEach((current) => {
      if (current !== dialog) {
        current.classList.remove("is-open");
        current.close();
      }
    });
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => dialog.classList.add("is-open"));
    });
  }

  function closeDialog(dialog) {
    if (!dialog || !dialog.open || dialog._closing) return;
    dialog._closing = true;
    dialog.classList.remove("is-open");
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      dialog._closing = false;
      if (dialog.open) dialog.close();
    };
    dialog.addEventListener("transitionend", (event) => {
      if (event.target === dialog) finish();
    }, { once: true });
    setTimeout(finish, 500);
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
    trigger.addEventListener("click", () => {
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
      openDialog(id === "reviews" ? "reviews-dialog" : id);
      if (id === "video" && storiesSwiper) storiesSwiper.update();
    });
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest("dialog")));
  });

  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("close", () => {
      dialog.classList.remove("is-open");
      if (dialog.id === "video" && storiesSwiper) {
        storiesSwiper.autoplay.stop();
        if (storiesEl) storiesEl.classList.remove("is-playing");
      }
      if (dialog.id === "lesson-dialog") setLesson(false);
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
      const nameError = name.parentElement.querySelector(".field-error");
      const phoneError = phone.parentElement.querySelector(".field-error");
      const nameValid = name.value.trim().length > 1;
      const validPhone = phoneOk(phone.value);
      nameError.hidden = nameValid;
      phoneError.hidden = validPhone;
      name.toggleAttribute("aria-invalid", !nameValid);
      phone.toggleAttribute("aria-invalid", !validPhone);
      if (!nameValid || !validPhone) return;
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

  document.querySelectorAll(".feature, .card, .results, .services, .about, .train, .reviews, .footer").forEach((el) => {
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
