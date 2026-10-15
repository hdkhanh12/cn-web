const DRIVE_FOLDER_ID = "PASTE_DRIVE_FOLDER_ID_HERE";
const SPREADSHEET_ID = "PASTE_SPREADSHEET_ID_HERE";
const RESPONSE_SHEET_NAME = "Câu trả lời";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  if (params.action === "receipt") {
    try {
      return respond_({ ok: hasReceipt_(params.id) }, params.callback);
    } catch (error) {
      return respond_({ ok: false, error: error.message }, params.callback);
    }
  }
  if (params.action !== "photo") return respond_({ ok: true, service: "afterglow-photo" }, params.callback);

  try {
    const photo = getLatestPhoto_();
    return respond_({ ok: true, photo: photo }, params.callback);
  } catch (error) {
    return respond_({ ok: false, error: error.message }, params.callback);
  }
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents);
    if (payload.action !== "saveAnswer") throw new Error("Unknown action.");
    const answers = payload.answers || {};
    const receipt = String(payload.receipt || "");
    if (!/^[a-f0-9-]{36}$/i.test(receipt)) throw new Error("Invalid receipt.");
    const sheet = getResponseSheet_();
    sheet.appendRow([
      new Date(),
      receipt,
      cleanCell_(answers.feeling),
      cleanCell_(answers.nextDate),
      cleanCell_(answers.message)
    ]);
    return respond_({ ok: true, receipt: receipt });
  } catch (error) {
    return respond_({ ok: false, error: error.message });
  }
}

function authorizeDriveAccess() {
  if (DRIVE_FOLDER_ID === "PASTE_DRIVE_FOLDER_ID_HERE") throw new Error("Set DRIVE_FOLDER_ID first.");
  DriveApp.getFolderById(DRIVE_FOLDER_ID).getName();
}

function authorizeSheetAccess() {
  if (SPREADSHEET_ID === "PASTE_SPREADSHEET_ID_HERE") throw new Error("Set SPREADSHEET_ID first.");
  SpreadsheetApp.openById(SPREADSHEET_ID).getName();
}

function getResponseSheet_() {
  if (SPREADSHEET_ID === "PASTE_SPREADSHEET_ID_HERE") throw new Error("Set SPREADSHEET_ID first.");
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(RESPONSE_SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(RESPONSE_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Thời gian", "Mã nhận", "Cảm nhận", "Buổi tiếp theo", "Lời nhắn"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function hasReceipt_(receipt) {
  if (!receipt || SPREADSHEET_ID === "PASTE_SPREADSHEET_ID_HERE") return false;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(RESPONSE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return false;
  const values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
  return values.some(function (row) { return row[0] === receipt; });
}

function cleanCell_(value) {
  const text = String(value || "").trim().slice(0, 1000);
  return /^[=+@]/.test(text) ? "'" + text : text;
}

function getLatestPhoto_() {
  if (DRIVE_FOLDER_ID === "PASTE_DRIVE_FOLDER_ID_HERE") throw new Error("Set DRIVE_FOLDER_ID first.");

  const files = DriveApp.getFolderById(DRIVE_FOLDER_ID).getFiles();
  let latest = null;
  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    if (file.isTrashed() || ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) continue;
    if (!latest || file.getLastUpdated().getTime() > latest.getLastUpdated().getTime()) latest = file;
  }

  if (!latest) return null;
  if (latest.getSize() > MAX_IMAGE_BYTES) throw new Error("The latest image is over 2 MB. Upload a smaller export.");

  return {
    mimeType: latest.getMimeType(),
    base64: Utilities.base64Encode(latest.getBlob().getBytes()),
    updatedAt: latest.getLastUpdated().toISOString()
  };
}

function respond_(value, callback) {
  const body = JSON.stringify(value);
  if (!callback) {
    return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
  }
  if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback)) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "Invalid callback." }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(`${callback}(${body});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
