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
  if (params.action === "photos") {
    try {
      return respond_({ ok: true, photos: getPhotoList_() }, params.callback);
    } catch (error) {
      return respond_({ ok: false, error: error.message }, params.callback);
    }
  }
  if (params.action !== "photo") return respond_({ ok: true, service: "afterglow-photo" }, params.callback);

  try {
    const photo = params.id ? getPhotoById_(params.id) : getLatestPhoto_();
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
      "",
      "",
      cleanCell_(answers.message),
      cleanCell_(answers.threeWords),
      cleanCell_(answers.favoritePart)
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
    sheet.appendRow(["Thời gian", "Mã nhận", "Cảm nhận cũ", "Buổi tiếp theo cũ", "Lời nhắn", "Ba từ tả buổi hôm ấy", "Điểm em thích nhất"]);
    sheet.setFrozenRows(1);
  } else {
    if (sheet.getMaxColumns() < 7) sheet.insertColumnsAfter(sheet.getMaxColumns(), 7 - sheet.getMaxColumns());
    const newHeaders = sheet.getRange(1, 6, 1, 2).getValues()[0];
    if (!newHeaders[0]) sheet.getRange(1, 6).setValue("Ba từ tả buổi hôm ấy");
    if (!newHeaders[1]) sheet.getRange(1, 7).setValue("Điểm em thích nhất");
  }
  return sheet;
}

function hasReceipt_(receipt) {
  if (!receipt || SPREADSHEET_ID === "PASTE_SPREADSHEET_ID_HERE") return false;
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(RESPONSE_SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return false;
  const values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).getValues();
  return values.some(function (row) { return String(row[0]) === String(receipt); });
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

  return latest ? serializePhoto_(latest) : null;
}

function getPhotoList_() {
  if (DRIVE_FOLDER_ID === "PASTE_DRIVE_FOLDER_ID_HERE") throw new Error("Set DRIVE_FOLDER_ID first.");
  const files = DriveApp.getFolderById(DRIVE_FOLDER_ID).getFiles();
  const photos = [];
  while (files.hasNext()) {
    const file = files.next();
    if (file.isTrashed() || ALLOWED_MIME_TYPES.indexOf(file.getMimeType()) === -1 || file.getSize() > MAX_IMAGE_BYTES) continue;
    photos.push({ id: file.getId(), updatedAt: file.getLastUpdated().toISOString(), time: file.getLastUpdated().getTime() });
  }
  photos.sort(function (a, b) { return b.time - a.time; });
  return photos.slice(0, 30).map(function (photo) { return { id: photo.id, updatedAt: photo.updatedAt }; });
}

function getPhotoById_(fileId) {
  if (!fileId || DRIVE_FOLDER_ID === "PASTE_DRIVE_FOLDER_ID_HERE") throw new Error("Invalid photo.");
  const files = DriveApp.getFolderById(DRIVE_FOLDER_ID).getFiles();
  while (files.hasNext()) {
    const file = files.next();
    if (file.getId() === fileId && !file.isTrashed() && ALLOWED_MIME_TYPES.indexOf(file.getMimeType()) !== -1) {
      return serializePhoto_(file);
    }
  }
  throw new Error("Photo not found in the configured folder.");
}

function serializePhoto_(file) {
  if (file.getSize() > MAX_IMAGE_BYTES) throw new Error("An image is over 2 MB. Upload smaller exports.");
  return {
    id: file.getId(),
    mimeType: file.getMimeType(),
    base64: Utilities.base64Encode(file.getBlob().getBytes()),
    updatedAt: file.getLastUpdated().toISOString()
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
