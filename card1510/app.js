(() => {
  const config = window.LETTER_CONFIG || {};
  const note = document.querySelector("#letter-note");
  const memorySection = document.querySelector("#memory-section");
  const memoryCopy = document.querySelector("#memory-copy");
  const photo = document.querySelector("#memory-photo");
  const art = document.querySelector("#memory-art");
  const frame = document.querySelector(".memory-frame");
  const caption = document.querySelector("#photo-caption");
  const replyLink = document.querySelector("#reply-link");
  const toast = document.querySelector("#toast");
  const progress = document.querySelector("#scroll-progress");
  const musicToggle = document.querySelector("#music-toggle");
  const music = document.querySelector("#background-music");

  note.textContent = config.note || "Cảm ơn em đã dành thời gian cho anh hôm nay. Anh vui vì được gặp em.";
  caption.textContent = config.photoCaption || "ảnh / 01";

  if (config.memory?.trim()) {
    memoryCopy.textContent = config.memory.trim();
    memorySection.hidden = false;
  }

  let toastTimer = 0;
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("motion-ready");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16 });
    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
  }

  let progressFrame = 0;
  const updateProgress = () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(() => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
      progressFrame = 0;
    });
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

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

  const showPhoto = (data) => {
    if (!data || !/^image\/(jpeg|png|webp|gif)$/.test(data.mimeType) || !data.base64) return;
    photo.src = `data:${data.mimeType};base64,${data.base64}`;
    photo.hidden = false;
    art.hidden = true;
    frame.classList.remove("is-loading", "photo-error");
  };

  const fetchPhoto = () => {
    if (!config.appsScriptUrl) return;
    frame.classList.add("is-loading");
    const callbackName = `afterglowPhoto_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      delete window[callbackName];
      script.remove();
      frame.classList.remove("is-loading");
    };
    const timeout = window.setTimeout(() => {
      finish();
      frame.classList.add("photo-error");
    }, 8000);
    window[callbackName] = (result) => {
      window.clearTimeout(timeout);
      if (result?.ok && result.photo) showPhoto(result.photo);
      finish();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      finish();
      frame.classList.add("photo-error");
    };
    const separator = config.appsScriptUrl.includes("?") ? "&" : "?";
    script.src = `${config.appsScriptUrl}${separator}action=photo&callback=${callbackName}&t=${Date.now()}`;
    document.head.appendChild(script);
  };

  if (config.contactUrl) {
    replyLink.href = config.contactUrl;
    replyLink.target = "_blank";
    replyLink.rel = "noopener noreferrer";
  } else {
    replyLink.addEventListener("click", async (event) => {
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

  fetchPhoto();
})();
