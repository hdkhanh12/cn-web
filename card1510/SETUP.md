# Afterglow: local preview, Drive photo, and replies

This microsite is separate from the retired survey route. Preview it locally before deciding whether to publish it.

## Preview locally

From the `CN-WEB` repository root, run:

```powershell
py -m http.server 8124 --directory card1510
```

Open <http://localhost:8124>. Stop the server with `Ctrl+C`.

The page now requires the deployed Apps Script authentication endpoint and the configured password before opening. Local preview uses the same endpoint configured in `config.js`.

## Connect Drive and the response Sheet

1. Create a dedicated Google Drive folder for the photos you want on the postcard. Keep the folder restricted. The page shows the 30 most recently updated supported images, starting with the newest.
2. Open <https://script.google.com> and create a standalone Apps Script project.
3. Copy the updated `apps-script/Code.gs` into the Apps Script editor. Set `DRIVE_FOLDER_ID` to the private image-folder ID and `SPREADSHEET_ID` to the ID in your Sheet URL (`/spreadsheets/d/ID/edit`). If you already set these in the online script, retain the same real IDs when replacing the code. Keep the Sheet private.
4. Save. Run `authorizeDriveAccess`, then `authorizeSheetAccess` once each and approve the requested Google permissions. The response tab `Câu trả lời` is created automatically after the first response.
5. In **Project Settings → Script Properties**, add `LETTER_ACCESS_PASSWORD` with the value `111205`. Do not put this password in `config.js` or the website files.
6. Choose **Deploy → Manage deployments → Edit** on the existing Web App. Select a new version, keep **Execute as** set to your account and access set to **Anyone**, then click **Deploy**. This updates the existing `/exec` deployment URL; the page already uses it in `config.js`.
7. Upload JPEG, PNG, WebP, or GIF images (each up to 2 MB) into the Drive folder. The page shows the 30 most recently updated images; tapping the displayed image or its arrow opens the next one. Keep the folder private. Anyone with the page can view images served by this public endpoint.

The page asks for the password before showing the letter. It sends the two free-text answers and optional note only when the visitor explicitly presses **Gửi anh**. The Apps Script validates the password, gives each authenticated visit a short-lived access token, and accepts only the first answer submission. The last page stays locked until the saved receipt is confirmed. On later visits, the visitor can open the complete letter again, but cannot submit a second response. If the `Câu trả lời` tab already contains earlier data, existing columns are left intact and the new answers are added in columns F and G.

The submission lock is stored in Script Properties as `LETTER_SUBMITTED_RECEIPT`. To deliberately reopen submissions for testing, delete only that property in **Project Settings → Script Properties**. Do not delete the response rows unless you also intend to remove the saved answers.

## Update the Apps Script after code changes

Pushing this repository does not update the separately deployed Apps Script. When `apps-script/Code.gs` changes, copy its full contents into the existing Apps Script project, save, then use **Deploy → Manage deployments → Edit → New version → Deploy**. Keep the same deployment so the URL remains unchanged.

To add photos later, upload them into the same folder. The page refreshes the album on each load, so the site itself does not need to be redeployed.

## Privacy behavior

The Drive folder can remain private because Apps Script runs as your account. The password gate controls the page flow and answer API, but this is still a static public website: its HTML, scripts, and image endpoint are not private files. The Web App endpoint serves listed images to anyone who can reach that endpoint. Only upload images that the other person is comfortable having visible to anyone with the link. This is a personal courtesy gate, not strong confidentiality protection.

## Personalize the letter

Edit `config.js` before sending:

- `note`: the thank-you shown on the first letter page.
- `memory`: optional detail from the date. Leave it empty to hide that section.
- `photoCaption`: the small label under the image title.

Keep the note specific to what actually happened on the date. This local preview is not published automatically.

## Add optional background music

1. Add an MP3 or OGG file you have permission to use to this folder, beside `index.html`.
2. Set `musicUrl` in `config.js` to a relative file path, for example `./music.mp3`.
3. Reload the page. A small music button appears; the visitor starts and stops playback manually. Browsers generally block autoplay, so the page intentionally does not start music on its own.

If you deploy the microsite under a subpath, keep the audio file beside `index.html` and use a relative URL as above. The audio file is served with the site, so anyone with access to the page can also request that file.

## Deployment path

The Vercel rewrite serves this folder at `/hanletter01` while keeping the source organized in `card1510`. The former `/haanhie` route is no longer configured. The MP3 and page assets are served from `/hanletter01` automatically.
