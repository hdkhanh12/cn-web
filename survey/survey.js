const ACCESS_CODE = "121007";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyMTpDmwoRuiEJZe95w6WYwzHkFWATA6XOGkJM9K4nIHLbsuX9wnH2jkxxuPDGdEmE/exec";
const COMPLETED_KEY = "little-vibe-check-completed";
const EMOJIS = ["♡", "✦", "✨", "🌷", "🫶", "☁️", "🍓", "🪩"];

const questions = [
  {
    type: "text",
    required: true,
    kicker: "câu 1 · tên gọi",
    title: "Anh có thể gọi em là gì",
    placeholder: ""
  },
  {
    type: "single",
    kicker: "câu 2 · tâm trạng hôm nay",
    note: "Ngôn từ anh không đủ phong phú nên anh mượn AI mà viết thành nhé =))",
    title: "Tâm trạng của em hôm nay thế nào",
    options: [
      ["🌷", "Nhẹ nhàng", "Muốn một ngày trôi qua chầm chậm, êm đềm thôi."],
      ["🪩", "Có đèn là có mood", "Đang nhiều năng lượng, sẵn sàng cho kèo vui bất ngờ!"],
      ["☁️", "Đang lơ lửng", "Hơi ngơ ngơ, không hẳn buồn mà cũng chưa tỉnh táo lắm."],
      ["🍓", "Ngọt một chút", "Chỉ cần có đồ ăn ngon là đời lại tươi liền."]
    ]
  },
  {
    type: "multi",
    max: 2,
    kicker: "câu 3 · cuối tuần",
    title: "Cuối tuần rảnh rỗi thì em nghiêng về kèo nào hơn?",
    options: [
      ["☕", "Cà phê", "Ngồi quán quen xinh xinh, buôn chuyện không vội vã."],
      ["🚶", "Đi dạo", "Lượn lờ đâu đó, đi đâu cũng được miễn là mát trời có gió."],
      ["🎬", "Xem phim", "Cuộn trong chăn, bật phim hay, thêm đồ ăn vặt là chuẩn bài."],
      ["🍜", "Đi ăn", "Đi săn món ngon, ăn ngon là ưu tiên số một!"],
      ["🏠", "Ở nhà", "Nằm nhà sạc pin trong góc bình yên của riêng mình."]
    ]
  },
  {
    type: "multi",
    max: 2,
    kicker: "câu 4 · nhắn tin",
    title: "Lúc nhắn tin, em thích kiểu nói chuyện nào hơn?",
    options: [
      ["💬", "Hỏi han", "Để ý và nhớ mấy điều lặt vặt của nhau."],
      ["📱", "Gửi TikTok/Threads thấy thú vị", "Thấy gì đúng vibe là gửi nhau xem, không cần mở lời dài dòng."],
      ["🫧", "Kể chuyện linh tinh", "Chuyện trên trời dưới đất, hôm nay ăn gì, gặp chuyện gì cũng kể."],
      ["🧠", "Có chủ đề", "Đào sâu một chủ đề thú vị tới bến."]
    ]
  },
  {
    type: "multi",
    max: 2,
    kicker: "câu 5 · một cuộc hẹn vui",
    title: "Với em, một buổi hẹn trọn vẹn thì cần có gì nhất?",
    options: [
      ["🍰", "Món ngon", "Chắc chắn là phải ngon, đói bụng là mất mood liền."],
      ["🫶", "Nói chuyện hợp", "Cảm giác tự nhiên, không phải gồng mình nghĩ chuyện để nói."],
      ["📸", "Không gian xinh", "Chỗ có vibe, chụp được vài tấm ảnh kỷ niệm ưng ý."],
      ["🎲", "Ngẫu hứng", "Không cần lịch trình cứng ngắc, cứ đi đâu thấy vui thì ghé."]
    ]
  },
  {
    type: "single",
    kicker: "câu 6 · lúc hơi mệt",
    title: "Những lúc hơi mệt hay tuột mood, em muốn được quan tâm thế nào?",
    options: [
      ["👂", "Nghe em kể", "Chỉ cần ngồi lắng nghe em xả ra thôi, không cần phán xét hay cho lời khuyên."],
      ["🍜", "Dẫn đi ăn", "Rủ đi ăn món ngon, no bụng là thấy đỡ hơn một nửa rồi."],
      ["🌙", "Để em yên tĩnh", "Ở bên cạnh nhưng không hỏi dồn dập, để em có khoảng lặng."],
      ["🤣", "Làm em cười", "Kể chuyện ngớ ngẩn hay pha trò cho em bật cười."]
    ]
  },
  {
    type: "single",
    kicker: "câu 7 · social battery",
    title: "Sau một ngày dài mệt mỏi bên ngoài, em sẽ lựa chọn?",
    options: [
      ["🌙", "Ở một mình", "Đóng cửa phòng, nghe nhạc/xem phim hoặc ngủ một giấc không ai làm phiền."],
      ["🪩", "Rủ bạn bè/người thân đi chơi", "Đi la cà, ngồi tám chuyện hoặc hòa vào chỗ đông người cho khuây khỏa."],
      ["🔄", "Tùy hôm", "Lúc thì muốn biến mất một mình, lúc lại thích có ai đó kéo đi chơi."]
    ]
  },
  {
    type: "single",
    kicker: "câu 8 · social setting",
    title: "Đến một không gian mà hầu hết là người lạ, em thường sẽ:",
    options: [
      ["🫣", "Tìm một góc quen", "Tìm một góc quen hoặc người quen duy nhất để ngồi cùng, hơi ngại bắt chuyện trước."],
      ["👋", "Làm quen luôn", "Dễ dàng bắt chuyện, làm quen thêm bạn mới mà không thấy ngợp."],
      ["👀", "Quan sát trước", "Cần một chút thời gian quan sát trước rồi mới từ từ hòa nhập."]
    ]
  },
  {
    type: "single",
    kicker: "câu 9 · chia sẻ cảm xúc",
    title: "Khi gặp một chuyện cực kỳ vui hay thú vị, phản xạ đầu tiên của em là gì?",
    options: [
      ["🤭", "Giữ lại một chút", "Giữ trong lòng gặm nhấm niềm vui một lúc, hoặc chỉ kể với 1 người thực sự thân."],
      ["📣", "Khoe ngay", "Nhắn tin khoe ngay cho hội bạn, hoặc đăng story chia sẻ năng lượng tích cực liền."]
    ]
  },
  {
    type: "text",
    required: false,
    kicker: "câu 10 · một điều nhỏ",
    title: "Có điều nhỏ xíu nào hay làm em vui bất chợt không?",
    placeholder: "Kiểu như được ai đó mua cho món mình thích, trời tự nhiên trở gió..."
  },
  {
    type: "text",
    required: false,
    kicker: "câu 11 · chủ đề yêu thích",
    title: "Có chủ đề nào em có thể “thao thao bất tuyệt” mãi không chán không?",
    placeholder: "Phim ảnh, nuôi mèo, đi du lịch, nhạc nhẽo, mấy chuyện tâm linh/khoa học..."
  },
  {
    type: "text",
    required: false,
    kicker: "câu 12 · thiện cảm",
    title: "Điều gì khiến em dễ có thiện cảm với một người?",
    placeholder: "Ví dụ: nói chuyện có duyên, tinh tế, thật thà..."
  },
  {
    type: "single",
    kicker: "câu 13 · đi tới nơi mới",
    title: "Lạc tới một nơi hoàn toàn mới, mắt em sẽ bị hút vào đâu đầu tiên?",
    options: [
      ["🍜", "Món ăn địa phương", "Đi đâu cũng phải thử cho bằng được đặc sản ở đó."],
      ["📸", "Góc chụp hình đẹp", "Mắt tự động căn góc xem chỗ nào lên hình xinh."],
      ["🧭", "Mấy con ngõ nhỏ", "Thích rẽ bừa vào ngõ ngách xem có gì hay ho ẩn giấu không."],
      ["👀", "Nhịp sống con người", "Ngồi ngắm dòng người và xem người bản địa sống ra sao."]
    ]
  },
  {
    type: "single",
    kicker: "câu 14 · món quà nhỏ",
    title: "Một món quà nhỏ nào sẽ khiến tim em “rung rinh”?",
    options: [
      ["✉️", "Một mẩu giấy viết tay", "Mấy dòng chữ tay mộc mạc mà ấm áp, giữ hoài được."],
      ["🧶", "Một món đồ handmade", "Một món nhỏ được tự tay làm, nhìn là biết người tặng đã dành thời gian."],
      ["🍪", "Món ăn vặt", "Đang thèm mà có người mua đúng món đem tới."],
      ["🌼", "Một bông hoa / bó hoa nhỏ", "Cầm trên tay hay cắm vào lọ là thấy đời thơ mộng hẳn."]
    ]
  },
  {
    type: "text",
    required: false,
    kicker: "câu 15 · đang mong chờ",
    title: "Dạo gần đây em có đang háo hức chờ đợi điều gì không?",
    placeholder: "Kể sương sương một câu nếu em muốn nha..."
  },
  {
    type: "email",
    required: false,
    kicker: "câu 16 · email",
    title: "Để lại email nếu em muốn nhận một lá thư nhắn gửi sau quiz nha!",
    placeholder: "địa chỉ email của em nè..."
  }
];

const answers = {};
let currentIndex = 0;
let cameraStream = null;
let photoDataUrl = "";
let photoConsent = false;

const $ = (selector) => document.querySelector(selector);
const screens = {
  welcome: $("#welcome-screen"),
  camera: $("#camera-screen"),
  quiz: $("#quiz-screen"),
  sending: $("#sending-screen"),
  result: $("#result-screen"),
  completed: $("#completed-screen")
};

function showScreen(name) {
  Object.values(screens).forEach((screen) => { screen.hidden = true; });
  screens[name].hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function stopCamera() {
  if (!cameraStream) return;
  cameraStream.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  $("#camera-video").srcObject = null;
}

function enterQuiz() {
  stopCamera();
  currentIndex = 0;
  Object.keys(answers).forEach((key) => delete answers[key]);
  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const question = questions[currentIndex];
  $("#question-count").textContent = `${currentIndex + 1} / ${questions.length}`;
  $("#progress-bar").style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  $("#back-button").disabled = currentIndex === 0;
  $("#back-button").style.opacity = currentIndex === 0 ? "0.45" : "1";
  $("#next-button").textContent = currentIndex === questions.length - 1 ? "Đã xong, gửi →" : "Tiếp tục →";

  const host = $("#question-host");
  host.innerHTML = `
    ${question.note ? `<p class="question-note">${question.note}</p>` : ""}
    <p class="question-kicker">câu ${currentIndex + 1}</p>
    <h2 id="question-title" class="question-title">${question.title}</h2>
  `;

  if (question.type === "text" || question.type === "email") {
    const control = question.type === "email"
      ? `<input id="open-answer" class="email-input" type="email" maxlength="160" placeholder="${question.placeholder}" aria-label="${question.title}">`
      : `<textarea id="open-answer" maxlength="240" placeholder="${question.placeholder}" aria-label="${question.title}"></textarea>`;
    const helper = question.required ? "Một câu ngắn là được" : "Câu này thích thì trả lời, không thì cứ skip";
    host.insertAdjacentHTML("beforeend", `${control}<p class="helper-note">${helper}</p>`);
    $("#open-answer").value = answers[currentIndex] || "";
    if (question.type === "email") $("#open-answer").setAttribute("inputmode", "email");
    return;
  }

  const current = answers[currentIndex] || [];
  const selected = question.type === "single" ? [current] : current;
  host.insertAdjacentHTML("beforeend", `
    <div class="choice-grid" role="${question.type === "single" ? "radiogroup" : "group"}">
      ${question.options.map((option, optionIndex) => `
        <div class="choice-card">
          <input
            id="choice-${currentIndex}-${optionIndex}"
            type="${question.type === "single" ? "radio" : "checkbox"}"
            name="question-${currentIndex}"
            value="${optionIndex}"
            ${selected.includes(optionIndex) ? "checked" : ""}
          >
          <label for="choice-${currentIndex}-${optionIndex}">
            <span><span class="choice-title">${option[1]}</span><span class="choice-caption">${option[2]}</span></span>
          </label>
        </div>
      `).join("")}
    </div>
    ${question.type === "multi" ? `<p class="helper-note">Có thể chọn nhiều đáp án</p>` : ""}
  `);

  host.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      if (question.type === "single") {
        answers[currentIndex] = Number(input.value);
      } else {
        const checked = [...host.querySelectorAll("input:checked")].map((item) => Number(item.value));
        if (checked.length > question.max) {
          input.checked = false;
          return;
        }
        answers[currentIndex] = checked;
      }
    });
  });
}

function saveCurrentAnswer() {
  const question = questions[currentIndex];
  if (question.type === "text" || question.type === "email") {
    answers[currentIndex] = $("#open-answer").value.trim();
  }
}

function hasAnswer() {
  const question = questions[currentIndex];
  const value = answers[currentIndex];
  if (question.type === "text") return question.required ? Boolean(value) : true;
  if (question.type === "email") return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if (question.type === "single") return Number.isInteger(value);
  return Array.isArray(value) && value.length > 0;
}

function answerLabel(index) {
  const question = questions[index];
  const value = answers[index];
  if (question.type === "single") return Number.isInteger(value) ? question.options[value][1] : "";
  if (question.type === "multi") return (value || []).map((item) => question.options[item][1]).join(", ");
  return value || "";
}

function createSubmissionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function buildSubmission(submissionId) {
  return {
    submittedAt: new Date().toISOString(),
    submissionId,
    accessCode: ACCESS_CODE,
    photoConsent,
    photoDataUrl: photoConsent ? photoDataUrl : "",
    answers: questions.map((question, index) => ({
      question: question.title,
      answer: answerLabel(index)
    }))
  };
}

function checkAcceptedSubmission(submissionId) {
  return new Promise((resolve) => {
    const callbackName = `littleVibeStatus_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let settled = false;
    const finish = (response) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
      resolve(response);
    };
    const timeoutId = window.setTimeout(() => finish({ ok: false, used: false }), 3500);
    window[callbackName] = (response) => finish({ ok: response?.ok === true, used: response?.used === true });
    script.onerror = () => finish({ ok: false, used: false });
    script.src = `${APPS_SCRIPT_URL}?action=status&id=${encodeURIComponent(submissionId)}&callback=${callbackName}`;
    document.head.appendChild(script);
  });
}

async function submitQuiz() {
  if (!APPS_SCRIPT_URL) return { configured: false, sent: false };
  const submissionId = createSubmissionId();
  try {
    const request = fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(buildSubmission(submissionId))
      });
    const timeout = new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error("submit-timeout")), 12000);
    });
    await Promise.race([request, timeout]);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const status = await checkAcceptedSubmission(submissionId);
      if (status.ok) return { configured: true, sent: true };
      if (status.used) return { configured: true, sent: false, alreadyUsed: true };
      await new Promise((resolve) => window.setTimeout(resolve, 300));
    }
    return { configured: true, sent: false };
  } catch (error) {
    return { configured: true, sent: false };
  }
}

function spawnEmoji(event) {
  const emoji = document.createElement("span");
  emoji.className = "emoji-pop";
  emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  emoji.style.left = `${event.clientX}px`;
  emoji.style.top = `${event.clientY}px`;
  emoji.style.setProperty("--drift", `${Math.round(Math.random() * 80 - 40)}px`);
  emoji.style.setProperty("--spin", `${Math.round(Math.random() * 70 - 35)}deg`);
  $("#emoji-layer").appendChild(emoji);
  window.setTimeout(() => emoji.remove(), 950);
}

$("#unlock-button").addEventListener("click", () => {
  const code = $("#access-code").value.trim();
  if (code !== ACCESS_CODE) {
    $("#access-error").hidden = false;
    $("#access-code").focus();
    return;
  }
  $("#access-error").hidden = true;
  $("#camera-error").hidden = true;
  showScreen("camera");
});

$("#access-code").addEventListener("keydown", (event) => {
  if (event.key === "Enter") $("#unlock-button").click();
});

$("#quiz-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  saveCurrentAnswer();
  if (!hasAnswer()) {
    $("#question-title").animate([{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }], { duration: 300 });
    return;
  }
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
    return;
  }

  $("#next-button").disabled = true;
  showScreen("sending");
  const result = await submitQuiz();
  $("#next-button").disabled = false;
  if (result.sent) localStorage.setItem(COMPLETED_KEY, new Date().toISOString());
  $("#storage-note").textContent = result.sent
    ? "Cảm ơn em nhé. Anh nhận được câu trả lời rồi, anh sẽ liên hệ lại sau."
    : result.alreadyUsed
      ? "Lượt này đã hết hạn rồi nhé."
    : "Bản này đã chạy xong phần giao diện. Cần dán Web App URL vào survey.js để lưu vào Google Sheet.";
  showScreen("result");
});

$("#back-button").addEventListener("click", () => {
  if (currentIndex === 0) return;
  saveCurrentAnswer();
  currentIndex -= 1;
  renderQuestion();
});

$("#start-camera-button").addEventListener("click", async () => {
  const error = $("#camera-error");
  error.hidden = true;
  if (!navigator.mediaDevices?.getUserMedia) {
    error.textContent = "Trình duyệt này không hỗ trợ camera. Em vẫn có thể bỏ qua bước này.";
    error.hidden = false;
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
    const video = $("#camera-video");
    video.srcObject = cameraStream;
    video.hidden = false;
    $("#camera-placeholder").hidden = true;
    $("#start-camera-button").hidden = true;
    $("#capture-button").hidden = false;
  } catch (cameraError) {
    error.textContent = "Camera chưa được mở. Em có thể thử lại hoặc bỏ qua bước này.";
    error.hidden = false;
  }
});

$("#capture-button").addEventListener("click", () => {
  const video = $("#camera-video");
  const canvas = $("#camera-canvas");
  const preview = $("#camera-preview");
  if (!video.videoWidth || !video.videoHeight) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  photoDataUrl = canvas.toDataURL("image/jpeg", 0.82);
  preview.src = photoDataUrl;
  preview.hidden = false;
  video.hidden = true;
  photoConsent = false;
  $("#photo-consent-row").hidden = false;
  $("#capture-button").hidden = true;
  $("#continue-camera-button").hidden = false;
  $("#continue-camera-button").disabled = true;
  stopCamera();
});

$("#photo-consent").addEventListener("change", (event) => {
  photoConsent = event.target.checked;
  $("#continue-camera-button").disabled = !photoConsent;
});

$("#continue-camera-button").addEventListener("click", enterQuiz);
$("#skip-camera-button").addEventListener("click", enterQuiz);
$("#quit-button").addEventListener("click", () => {
  stopCamera();
  showScreen("welcome");
});

$("#acknowledge-button").addEventListener("click", () => {
  localStorage.setItem(COMPLETED_KEY, new Date().toISOString());
  photoDataUrl = "";
  showScreen("completed");
});

document.addEventListener("click", (event) => {
  if (event.target.closest("button, .choice-card label, .brand")) spawnEmoji(event);
});

if (localStorage.getItem(COMPLETED_KEY)) showScreen("completed");
