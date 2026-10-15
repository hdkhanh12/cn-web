# Afterglow: local preview, Drive photo, and replies

This microsite is separate from the retired survey route. Preview it locally before deciding whether to publish it.

## Preview locally

From the `CN-WEB` repository root, run:

```powershell
py -m http.server 8124 --directory card1510
```

Open <http://localhost:8124>. Stop the server with `Ctrl+C`.

The page works without Apps Script. It shows the designed postcard artwork until a Drive photo endpoint is configured.

## Connect Drive and the response Sheet

1. Create a dedicated Google Drive folder for the one photo you want on the postcard. Keep the folder restricted. The script selects the most recently updated supported image in this folder, so remove or move aside old candidates if you want a particular image to appear.
2. Open <https://script.google.com> and create a standalone Apps Script project.
3. Copy the updated `apps-script/Code.gs` into the Apps Script editor. Set `DRIVE_FOLDER_ID` to the private image-folder ID and `SPREADSHEET_ID` to the ID in your Sheet URL (`/spreadsheets/d/ID/edit`). If you already set these in the online script, retain the same real IDs when replacing the code. Keep the Sheet private.
4. Save. Run `authorizeDriveAccess`, then `authorizeSheetAccess` once each and approve the requested Google permissions. The response tab `Câu trả lời` is created automatically after the first response.
5. Choose **Deploy → Manage deployments → Edit** on the existing Web App. Select a new version, keep **Execute as** set to your account and access set to **Anyone**, then click **Deploy**. This updates the existing `/exec` deployment URL; the page already uses it in `config.js`.
6. Upload a JPEG, PNG, WebP, or GIF (up to 2 MB) into the Drive folder. The page reads the latest image automatically.

The site sends the two optional selections and optional note only when the visitor explicitly presses **Gửi anh nhé**. The Apps Script checks a random receipt before showing its confirmation page.

## Update the Apps Script after code changes

Pushing this repository does not update the separately deployed Apps Script. When `apps-script/Code.gs` changes, copy its full contents into the existing Apps Script project, save, then use **Deploy → Manage deployments → Edit → New version → Deploy**. Keep the same deployment so the URL remains unchanged.

When replacing the image later, upload the new image into the same folder. The page reads the latest file on each load, so the site itself does not need to be redeployed.

## Privacy behavior

The Drive folder can remain private because Apps Script runs as your account. However, the Web App endpoint serves the selected image to anyone who can reach the endpoint or the page. An unlisted page link is shareable, not password protection. Only upload an image that the other person is comfortable having visible to anyone with that link. If you need access limited to a signed-in person, the page needs an authentication-backed service instead of this public static page.

## Personalize the letter

Edit `config.js` before sending:

- `note`: the short thank-you shown in the opening section.
- `memory`: optional detail from the date. Leave it empty to hide that section.
- `photoCaption`: the small label under the image.
- `contactUrl`: optional link to your chat/profile. If empty, the button copies a suggested reply message instead.

Keep the note specific to what actually happened on the date. This local preview is not published automatically.

## Add optional background music

1. Add an MP3 or OGG file you have permission to use to this folder, beside `index.html`.
2. Set `musicUrl` in `config.js` to a relative file path, for example `./music.mp3`.
3. Reload the page. A small music button appears; the visitor starts and stops playback manually. Browsers generally block autoplay, so the page intentionally does not start music on its own.

If you deploy the microsite under a subpath, keep the audio file beside `index.html` and use a relative URL as above. The audio file is served with the site, so anyone with access to the page can also request that file.

## Deployment path

The Vercel rewrite serves this folder at `/haanhie` while keeping the source organized in `card1510`. The MP3 and page assets are served from that route automatically.
