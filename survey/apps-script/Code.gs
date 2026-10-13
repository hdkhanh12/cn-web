/*
  Little Vibe Check storage

  Setup:
  1. Create a Google Sheet and a private Drive folder.
  2. Paste their IDs below.
  3. Deploy as Web app: Execute as you, access for anyone with the link.
  4. Paste the deployment URL into survey.js -> APPS_SCRIPT_URL.
*/

const SHEET_ID = "PASTE_GOOGLE_SHEET_ID_HERE";
const DRIVE_FOLDER_ID = "PASTE_PRIVATE_DRIVE_FOLDER_ID_HERE";
const RESPONSE_SHEET = "Responses";
const USED_TOKEN_KEY = "LITTLE_VIBE_CHECK_USED";
const ACCEPTED_SUBMISSION_KEY = "LITTLE_VIBE_CHECK_ACCEPTED_SUBMISSION";
const QUESTION_COUNT = 16;

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  if (params.action === "status") {
    const acceptedId = PropertiesService.getScriptProperties().getProperty(ACCEPTED_SUBMISSION_KEY) || "";
    return jsonp_({
      ok: Boolean(params.id && params.id === acceptedId),
      used: Boolean(acceptedId)
    }, params.callback);
  }
  return json_({ ok: true, service: "little-vibe-check" });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  let photoFile = null;

  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    validatePayload_(payload);

    const properties = PropertiesService.getScriptProperties();
    if (properties.getProperty(USED_TOKEN_KEY) === "true") {
      return json_({ ok: false, code: "ALREADY_USED" });
    }

    if (payload.photoConsent === true && payload.photoDataUrl) {
      photoFile = savePhoto_(payload.photoDataUrl, payload.submittedAt);
    }

    const sheet = getResponseSheet_();
    const answers = payload.answers.map((item) => item.answer || "");
    sheet.appendRow([
      new Date(payload.submittedAt || Date.now()),
      ...answers,
      payload.photoConsent === true ? "Có" : "Không",
      photoFile ? photoFile.getId() : "",
      photoFile ? photoFile.getName() : "",
      JSON.stringify(payload.answers)
    ]);

    properties.setProperty(USED_TOKEN_KEY, "true");
    properties.setProperty(ACCEPTED_SUBMISSION_KEY, payload.submissionId);
    return json_({ ok: true });
  } catch (error) {
    if (photoFile) photoFile.setTrashed(true);
    return json_({ ok: false, code: "SAVE_FAILED", message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function resetQuiz() {
  const properties = PropertiesService.getScriptProperties();
  properties.deleteProperty(USED_TOKEN_KEY);
  properties.deleteProperty(ACCEPTED_SUBMISSION_KEY);
}

function clearResponses() {
  const sheet = getResponseSheet_();
  sheet.clearContents();
  setupSheet();
}

function setupSheet() {
  const sheet = getResponseSheet_();
  const headers = [
    "Submitted at",
    "Tên gọi",
    "Mood",
    "Cuối tuần",
    "Nhắn tin",
    "Cuộc hẹn",
    "Lúc mệt",
    "Nạp lại năng lượng",
    "Đám đông người lạ",
    "Chuyện vui bất ngờ",
    "Điều nhỏ dễ vui",
    "Chủ đề nói mãi",
    "Thiện cảm",
    "Đi tới nơi mới",
    "Món quà nhỏ",
    "Đang mong chờ",
    "Email / SĐT",
    "Đồng ý gửi ảnh",
    "Photo file ID",
    "Photo filename",
    "Answers JSON"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
}

function getResponseSheet_() {
  if (SHEET_ID === "PASTE_GOOGLE_SHEET_ID_HERE") {
    throw new Error("Chưa cấu hình SHEET_ID.");
  }
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  return spreadsheet.getSheetByName(RESPONSE_SHEET) || spreadsheet.insertSheet(RESPONSE_SHEET);
}

function savePhoto_(dataUrl, submittedAt) {
  if (DRIVE_FOLDER_ID === "PASTE_PRIVATE_DRIVE_FOLDER_ID_HERE") {
    throw new Error("Chưa cấu hình DRIVE_FOLDER_ID.");
  }
  const match = String(dataUrl).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) throw new Error("Ảnh không đúng định dạng.");

  const bytes = Utilities.base64Decode(match[2]);
  if (bytes.length > 4 * 1024 * 1024) throw new Error("Ảnh vượt quá 4MB.");

  const extension = match[1].split("/")[1].replace("jpeg", "jpg");
  const name = `little-vibe-${new Date(submittedAt || Date.now()).getTime()}.${extension}`;
  const blob = Utilities.newBlob(bytes, match[1], name);
  const file = DriveApp.getFolderById(DRIVE_FOLDER_ID).createFile(blob);
  file.setDescription("Ảnh được gửi tự nguyện từ Little Vibe Check.");
  return file;
}

function validatePayload_(payload) {
  if (!payload || !Array.isArray(payload.answers) || payload.answers.length !== QUESTION_COUNT) {
    throw new Error("Payload câu trả lời không hợp lệ.");
  }
  if (!payload.submissionId) {
    throw new Error("Thiếu mã submission.");
  }
  if (payload.photoConsent === true && !payload.photoDataUrl) {
    throw new Error("Đã đồng ý gửi ảnh nhưng thiếu dữ liệu ảnh.");
  }
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonp_(value, callback) {
  if (!callback || !/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) return json_(value);
  return ContentService
    .createTextOutput(`${callback}(${JSON.stringify(value)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
