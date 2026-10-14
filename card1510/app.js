(() => {
  const config = window.LETTER_CONFIG || {};
  const book = document.querySelector("#book");
  const pageCurrent = document.querySelector("#page-current");
  const pageTurn = document.querySelector("#page-turn");
  const turnFront = document.querySelector("#page-turn-front");
  const turnBack = document.querySelector("#page-turn-back");
  const pageNav = document.querySelector("#page-nav");
  const pageCounter = document.querySelector("#page-counter");
  const previousButton = document.querySelector("#previous-page");
  const nextButton = document.querySelector("#next-page");
  const readingProgress = document.querySelector("#reading-progress");
  const toast = document.querySelector("#toast");
  const musicToggle = document.querySelector("#music-toggle");
  const music = document.querySelector("#background-music");
  const pageTemplates = ["cover-template", "letter-template", "photo-template", "invitation-template"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const turnDuration = reducedMotion ? 40 : 900;
  let currentIndex = 0;
  let isTurning = false;
  let photoData = null;
  let toastTimer = 0;
  let touchStartX = null;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  };

  const applyPhoto = (page) => {
    const image = page.querySelector(".memory-photo");
    const artwork = page.querySelector(".photo-art");
    const caption = page.querySelector(".photo-caption");
    if (caption) caption.textContent = config.photoCaption || "ảnh / 01";
    if (!image || !photoData) return;
    image.src = `data:${photoData.mimeType};base64,${photoData.base64}`;
    image.hidden = false;
    artwork.hidden = true;
  };

  const configurePage = (page) => {
    const note = page.querySelector(".letter-note");
    if (note) note.textContent = config.note || "Cảm ơn em đã dành thời gian cho anh hôm nay. Anh vui vì được gặp em.";

    const memory = page.querySelector(".memory-note");
    if (memory && config.memory?.trim()) {
      memory.querySelector(".memory-copy").textContent = config.memory.trim();
      memory.hidden = false;
    }

    const link = page.querySelector(".reply-button");
    if (link && config.contactUrl) {
      link.href = config.contactUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    } else if (link) {
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        const message = "Cảm ơn anh vì buổi hẹn hôm nay nhé.";
        try {
          await navigator.clipboard.writeText(message);
          showToast("Đã chép một lời nhắn gợi ý. Gửi khi em thấy tiện nhé.");
        } catch {
          showToast(message);
        }
      });
    }

    applyPhoto(page);
    return page;
  };

  const createPage = (index) => {
    const template = document.getElementById(pageTemplates[index]);
    return configurePage(template.content.firstElementChild.cloneNode(true));
  };

  const pageLabel = (index) => index === 0 ? "BÌA" : `TRANG 0${index} / 03`;

  const updateNavigation = () => {
    book.dataset.index = String(currentIndex);
    pageCounter.textContent = pageLabel(currentIndex);
    previousButton.disabled = currentIndex === 0 || isTurning;
    nextButton.disabled = currentIndex === pageTemplates.length - 1 || isTurning;
    pageNav.hidden = currentIndex === 0;
    const progress = currentIndex / (pageTemplates.length - 1);
    readingProgress.style.transform = `scaleX(${progress})`;
  };

  const renderCurrentPage = (index) => {
    pageCurrent.replaceChildren(createPage(index));
  };

  const turnTo = (nextIndex) => {
    if (isTurning || nextIndex < 0 || nextIndex >= pageTemplates.length || nextIndex === currentIndex) return;
    isTurning = true;
    const direction = nextIndex > currentIndex ? "forward" : "backward";
    const oldPage = pageCurrent.firstElementChild.cloneNode(true);
    const newPage = createPage(nextIndex);

    turnFront.replaceChildren(oldPage);
    turnBack.replaceChildren(newPage.cloneNode(true));
    pageTurn.hidden = false;
    pageTurn.setAttribute("aria-hidden", "true");
    renderCurrentPage(nextIndex);
    book.dataset.direction = direction;
    book.classList.remove("is-turning-forward", "is-turning-backward");
    void pageTurn.offsetWidth;
    window.requestAnimationFrame(() => book.classList.add(`is-turning-${direction}`));

    window.setTimeout(() => {
      currentIndex = nextIndex;
      book.classList.remove("is-turning-forward", "is-turning-backward");
      pageTurn.hidden = true;
      pageTurn.setAttribute("aria-hidden", "true");
      isTurning = false;
      updateNavigation();
    }, turnDuration + 40);
  };

  previousButton.addEventListener("click", () => turnTo(currentIndex - 1));
  nextButton.addEventListener("click", () => turnTo(currentIndex + 1));
  pageCurrent.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) {
      if (event.target.closest("[data-turn-next]")) turnTo(currentIndex + 1);
      return;
    }
    const bounds = book.getBoundingClientRect();
    turnTo(currentIndex + (event.clientX < bounds.left + bounds.width / 2 ? -1 : 1));
  });

  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === "ArrowRight" && currentIndex < pageTemplates.length - 1) {
      event.preventDefault();
      turnTo(currentIndex + 1);
    } else if (event.key === "ArrowLeft" && currentIndex > 0) {
      event.preventDefault();
      turnTo(currentIndex - 1);
    }
  });

  book.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  book.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 55) turnTo(currentIndex + (distance < 0 ? 1 : -1));
    touchStartX = null;
  }, { passive: true });

  const showPhoto = (data) => {
    if (!data || !/^image\/(jpeg|png|webp|gif)$/.test(data.mimeType) || !data.base64) return;
    photoData = data;
    document.querySelectorAll(".memory-photo").forEach((image) => {
      image.src = `data:${data.mimeType};base64,${data.base64}`;
      image.hidden = false;
      image.closest(".page").querySelector(".photo-art").hidden = true;
    });
  };

  const fetchPhoto = () => {
    if (!config.appsScriptUrl) return;
    const callbackName = `afterglowPhoto_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      delete window[callbackName];
      script.remove();
    };
    const timeout = window.setTimeout(finish, 8000);
    window[callbackName] = (result) => {
      window.clearTimeout(timeout);
      if (result?.ok && result.photo) showPhoto(result.photo);
      finish();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      finish();
    };
    const separator = config.appsScriptUrl.includes("?") ? "&" : "?";
    script.src = `${config.appsScriptUrl}${separator}action=photo&callback=${callbackName}&t=${Date.now()}`;
    document.head.appendChild(script);
  };

  if (config.musicUrl) {
    music.src = config.musicUrl;
    musicToggle.hidden = false;
    musicToggle.addEventListener("click", async () => {
      if (music.paused) {
        try {
          await music.play();
          musicToggle.classList.add("is-playing");
          musicToggle.setAttribute("aria-label", "Tắt nhạc nền");
          musicToggle.title = "Tắt nhạc nền";
          musicToggle.setAttribute("aria-pressed", "true");
        } catch {
          showToast("Trình duyệt chưa phát được file nhạc. Kiểm tra lại đường dẫn nhé.");
        }
      } else {
        music.pause();
        musicToggle.classList.remove("is-playing");
        musicToggle.setAttribute("aria-label", "Bật nhạc nền");
        musicToggle.title = "Bật nhạc nền";
        musicToggle.setAttribute("aria-pressed", "false");
      }
    });
  }

  renderCurrentPage(currentIndex);
  updateNavigation();
  fetchPhoto();
})();
