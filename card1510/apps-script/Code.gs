const DRIVE_FOLDER_ID = "PASTE_DRIVE_FOLDER_ID_HERE";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  if (params.action !== "photo") return respond_({ ok: true, service: "afterglow-photo" }, params.callback);

  try {
    const photo = getLatestPhoto_();
    return respond_({ ok: true, photo: photo }, params.callback);
  } catch (error) {
    return respond_({ ok: false, error: error.message }, params.callback);
  }
}

function authorizeDriveAccess() {
  if (DRIVE_FOLDER_ID === "PASTE_DRIVE_FOLDER_ID_HERE") throw new Error("Set DRIVE_FOLDER_ID first.");
  DriveApp.getFolderById(DRIVE_FOLDER_ID).getName();
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
