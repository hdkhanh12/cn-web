(() => {
  const config = window.LETTER_CONFIG || {};
  const current = document.querySelector("#scene-current");
  const turn = document.querySelector("#scene-turn");
  const progress = document.querySelector("#progress");
  const counter = document.querySelector("#page-counter");
  const previous = document.querySelector("#previous-page");
  const next = document.querySelector("#next-page");
  const pageNav = document.querySelector(".page-nav");
  const toast = document.querySelector("#toast");
  const music = document.querySelector("#background-music");
  const musicToggle = document.querySelector("#music-toggle");
  const templateIds = ["cover-template", "letter-template", "photo-template", "choices-template", "reply-template", "thanks-template"];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const turnDuration = reducedMotion ? 30 : 820;
  const answers = { threeWords: "", favoritePart: "", message: "" };
  let index = 0;
  let turning = false;
  let submitting = false;
  let submitted = false;
  let photoData = null;
  let photos = [];
  let photoIndex = 0;
  let photoLoading = false;
  let toastTimer;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3000);
  };

  const setPhoto = (scene) => {
    const image = scene.querySelector(".memory-photo");
    const art = scene.querySelector(".photo-art");
    const caption = scene.querySelector(".photo-caption");
    const photoCount = scene.querySelector(".photo-count");
    const photoNext = scene.querySelector(".photo-next");
    if (caption) caption.textContent = config.photoCaption || "ảnh / 01";
    if (photoCount && photos.length > 1) {
      photoCount.textContent = `${String(photoIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
      photoCount.hidden = false;
    }
    if (photoNext) photoNext.hidden = photos.length < 2;
    if (image && photoData) {
      image.src = `data:${photoData.mimeType};base64,${photoData.base64}`;
      image.hidden = false;
      art.hidden = true;
      if (image.dataset.nextBound !== "true") {
        image.dataset.nextBound = "true";
        image.addEventListener("click", advancePhoto);
      }
    }
    if (photoNext && photoNext.dataset.nextBound !== "true") {
      photoNext.dataset.nextBound = "true";
      photoNext.addEventListener("click", advancePhoto);
    }
  };

  const collectAnswers = (scene) => {
    scene.querySelectorAll("textarea[data-answer]").forEach((field) => {
      answers[field.dataset.answer] = field.value.trim();
    });
  };

  const setupScene = (scene) => {
    const note = scene.querySelector(".letter-note");
    if (note) note.textContent = config.note || "Cảm ơn em vì buổi hẹn hôm nay. Anh rất vui được đi chơi với em.";
    const memory = scene.querySelector(".memory-note");
    if (memory && config.memory?.trim()) {
      memory.querySelector(".memory-copy").textContent = config.memory.trim();
      memory.hidden = false;
    }
    scene.querySelectorAll("textarea[data-answer]").forEach((field) => {
      field.value = answers[field.dataset.answer];
    });
    const send = scene.querySelector("#send-reply");
    if (send) {
      if (submitted) {
        send.disabled = true;
        send.textContent = "Đã gửi rồi";
      } else {
        send.addEventListener("click", () => submitAnswers(scene));
      }
    }
    scene.querySelectorAll("[data-next]").forEach((button) => button.addEventListener("click", () => turnTo(index + 1)));
    setPhoto(scene);
    return scene;
  };

  const makeScene = (sceneIndex) => setupScene(document.getElementById(templateIds[sceneIndex]).content.firstElementChild.cloneNode(true));

  const update = () => {
    pageNav.hidden = index === 0;
    musicToggle.hidden = !config.musicUrl || index === 0;
    previous.disabled = index === 0 || turning || submitting;
    next.disabled = index === templateIds.length - 1 || turning || submitting;
    counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(templateIds.length).padStart(2, "0")}`;
    progress.style.transform = `scaleX(${index / (templateIds.length - 1)})`;
  };

  const render = (sceneIndex) => current.replaceChildren(makeScene(sceneIndex));

  const turnTo = (nextIndex) => {
    if (turning || submitting || nextIndex < 0 || nextIndex >= templateIds.length || nextIndex === index) return;
    collectAnswers(current);
    turning = true;
    const direction = nextIndex > index ? "forward" : "backward";
    turn.replaceChildren(current.firstElementChild.cloneNode(true));
    turn.hidden = false;
    turn.className = "scene-turn";
    render(nextIndex);
    void turn.offsetWidth;
    turn.classList.add(`is-${direction}`);
    update();
    setTimeout(() => {
      index = nextIndex;
      turn.hidden = true;
      turn.className = "scene-turn";
      turning = false;
      update();
    }, turnDuration + 30);
  };

  const submitAnswers = async (scene) => {
    collectAnswers(scene);
    const button = scene.querySelector("#send-reply");
    const status = scene.querySelector("#send-status");
    if (!config.appsScriptUrl) {
      status.textContent = "Mất kết nối rồi. Để anh kiểm tra lại sau nha.";
      return;
    }
    button.disabled = true;
    submitting = true;
    update();
    button.textContent = "Đang gửi…";
    status.textContent = "Chờ anh một xíu nha…";
    const receipt = crypto.randomUUID();
    try {
      await fetch(config.appsScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "saveAnswer", receipt, answers, submittedAt: new Date().toISOString() })
      });
      await confirmReceipt(receipt);
      submitting = false;
      submitted = true;
      turnTo(index + 1);
    } catch (error) {
      console.error("Could not save letter response", error);
      status.textContent = /timed out|Could not confirm/i.test(error.message)
        ? "Mất kết nối rồi. Để anh kiểm tra lại sau nha."
        : "Anh chưa nhận được phản hồi. Em bấm gửi lại giúp anh nhé.";
      submitting = false;
      button.disabled = false;
      button.innerHTML = 'Gửi anh <span aria-hidden="true">↗</span>';
      update();
    }
  };

  const confirmReceipt = (receipt) => new Promise((resolve, reject) => {
    const callback = `afterglowReceipt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let attempts = 0;
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      delete window[callback];
      script.remove();
      error ? reject(error) : resolve();
    };
    const check = () => {
      attempts += 1;
      window[callback] = (result) => {
        if (result?.ok) return finish();
        if (attempts >= 8) return finish(new Error("Receipt was not saved."));
        script.remove();
        setTimeout(load, 1100);
      };
      const separator = config.appsScriptUrl.includes("?") ? "&" : "?";
      script.src = `${config.appsScriptUrl}${separator}action=receipt&id=${encodeURIComponent(receipt)}&callback=${callback}&t=${Date.now()}`;
      script.onerror = () => {
        if (attempts >= 8) finish(new Error("Could not confirm the save."));
        else setTimeout(load, 1100);
      };
      document.head.appendChild(script);
    };
    const load = () => { if (!settled) check(); };
    const timeout = setTimeout(() => finish(new Error("Save confirmation timed out.")), 11000);
    load();
  });

  previous.addEventListener("click", () => turnTo(index - 1));
  next.addEventListener("click", () => turnTo(index + 1));
  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === "ArrowRight") turnTo(index + 1);
    if (event.key === "ArrowLeft") turnTo(index - 1);
  });

  if (config.musicUrl) {
    music.src = config.musicUrl;
    musicToggle.hidden = false;
    musicToggle.addEventListener("click", async () => {
      if (music.paused) {
        try {
          await music.play();
          musicToggle.classList.add("is-playing");
          musicToggle.setAttribute("aria-label", "Tắt nhạc");
          musicToggle.title = "Tắt nhạc";
          musicToggle.setAttribute("aria-pressed", "true");
        } catch { showToast("Trình duyệt chưa phát được file nhạc"); }
      } else {
        music.pause();
        musicToggle.classList.remove("is-playing");
        musicToggle.setAttribute("aria-label", "Bật nhạc");
        musicToggle.title = "Bật nhạc";
        musicToggle.setAttribute("aria-pressed", "false");
      }
    });
  }

  const showPhoto = (data, nextIndex) => {
    if (!data || !/^image\/(jpeg|png|webp|gif)$/.test(data.mimeType) || !data.base64) return;
    photoData = data;
    photoIndex = nextIndex;
    const scene = current.querySelector(".scene-photo");
    if (scene) setPhoto(scene);
  };

  const requestJsonp = (query, onResult) => {
    if (!config.appsScriptUrl) return;
    const callback = `afterglowData_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => { delete window[callback]; script.remove(); onResult(null); }, 12000);
    window[callback] = (result) => {
      clearTimeout(timeout);
      delete window[callback];
      script.remove();
      onResult(result);
    };
    script.onerror = () => {
      clearTimeout(timeout);
      delete window[callback];
      script.remove();
      onResult(null);
    };
    const separator = config.appsScriptUrl.includes("?") ? "&" : "?";
    script.src = `${config.appsScriptUrl}${separator}${query}&callback=${callback}&t=${Date.now()}`;
    document.head.appendChild(script);
  };

  const fetchPhotoAt = (nextIndex) => {
    if (photoLoading) return;
    const photo = photos[nextIndex];
    if (!photo) return;
    photoLoading = true;
    const button = current.querySelector(".photo-next");
    if (button) button.disabled = true;
    requestJsonp(`action=photo&id=${encodeURIComponent(photo.id)}`, (result) => {
      photoLoading = false;
      const activeButton = current.querySelector(".photo-next");
      if (activeButton) activeButton.disabled = false;
      if (result?.ok && result.photo) showPhoto(result.photo, nextIndex);
      else showToast("Ảnh này chưa mở được. Em thử lại sau nhé.");
    });
  };

  const advancePhoto = () => {
    if (photos.length < 2) return;
    fetchPhotoAt((photoIndex + 1) % photos.length);
  };

  const fetchPhotos = () => {
    requestJsonp("action=photos", (result) => {
      if (!result?.ok || !Array.isArray(result.photos)) return;
      photos = result.photos;
      if (photos.length) fetchPhotoAt(0);
    });
  };

  render(index);
  update();
  fetchPhotos();
})();
