# Afterglow: local preview and Drive photo setup

This microsite is separate from the retired survey route. Preview it locally before deciding whether to publish it.

## Preview locally

From the `CN-WEB` repository root, run:

```powershell
py -m http.server 8124 --directory card1510
```

Open <http://localhost:8124>. Stop the server with `Ctrl+C`.

The page works without Apps Script. It shows the designed postcard artwork until a Drive photo endpoint is configured.

## Connect a private Drive folder

1. Create a dedicated Google Drive folder for the one photo you want on the postcard. Keep the folder restricted. The script selects the most recently updated supported image in this folder, so remove or move aside old candidates if you want a particular image to appear.
2. Open <https://script.google.com> and create a standalone Apps Script project.
3. Copy `apps-script/Code.gs` into the editor and replace `PASTE_DRIVE_FOLDER_ID_HERE` with the folder ID from its Drive URL.
4. Save. In the function selector, choose `authorizeDriveAccess` and click **Run** once. Approve the Google Drive permission prompt. A placeholder folder ID must be replaced first.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as** to your account and access to **Anyone**. Deploy and copy the Web App URL ending in `/exec`.
6. The current Web App URL is already set in `config.js`. If you redeploy this same Apps Script project, use **Deploy → Manage deployments → Edit** and update the existing deployment so the `/exec` URL stays the same. If you create a different deployment, replace `appsScriptUrl` with its new URL.
7. Upload a JPEG, PNG, WebP, or GIF (up to 2 MB) into the Drive folder. Reload the page; it will fetch the latest image automatically.

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
