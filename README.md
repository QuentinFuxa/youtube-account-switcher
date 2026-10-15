# YouTube Account Switcher

Chrome Manifest V3 extension that routes YouTube document requests to a configurable **already signed-in** Google account. No dependencies, cookies access, analytics, or remote code.

## Install locally

1. Run `npm test && npm run build` (Node.js 20+, and the macOS `zip` command).
2. Open `chrome://extensions`, enable Developer mode, then **Load unpacked** and select `dist/extension`.
3. Disable the old version before enabling this one: two independent routing extensions can conflict.
4. Open the extension popup. `0` means the first Google session, `1` the second. Save, then select **Ouvrir YouTube avec ce compte**.

Keep the unpacked folder at the same path. To update it, rebuild and click Reload in `chrome://extensions`. The generated ZIP contains the same installable files and can be submitted to the Chrome Web Store; building it does not publish an update.

## When the selected account is unavailable

An `authuser` number identifies a position among the Google sessions currently signed in, **not a permanent account identity**. Signing out or adding accounts can change those positions. The extension cannot reconnect a signed-out account, restore an expired session, or override a YouTube restriction.

Use **Choisir ou reconnecter un compte** to open Google's account chooser. If only the primary account appears, use **Use another account** and sign in to your existing secondary account. Enter your credentials only on Google's sign-in page. Then confirm the index in the extension and reopen YouTube. A helper also appears on YouTube's `/oops` error page; it does not retry or open login windows automatically.

## What changed in v2

The previous version used `webNavigation.onBeforeNavigate` and `tabs.update` to start a second navigation while the first one was still in progress. It hard-coded `authuser=1`, offered no recovery or configuration, and also rewrote login/error pages. Its embed rule was installed only by `onInstalled`.

Version 2 uses Chrome's declarative network routing before document requests are sent. An explicit higher-priority allow rule stops redirects when the selected index is already present. Login, account chooser and error routes are left alone. The rules cover normal YouTube pages and YouTube embed iframes, not video/media/API requests. YouTube's client-side navigation keeps its established session; the extension does not force reloads during playback.

The popup can change the account index, disable routing or reopen the current video without losing its URL parameters. Settings and dynamic rules survive Chrome restarts. Startup/install reconciles rules and removes v1's old rule. Scope is limited to `youtube.com`, `www.youtube.com`, `m.youtube.com`, and `music.youtube.com`; Studio, Google sign-in and privacy-enhanced `youtube-nocookie.com` embeds are not rewritten.

Permissions: `declarativeNetRequest` and YouTube host access for routing; `storage` for two local settings. The old `tabs` and `webNavigation` permissions are removed. Chrome's `tabs` API can open/update tabs without the broad `tabs` permission; YouTube host access permits reading the active YouTube URL when the popup repairs it.

## Verification

`npm test` covers routing scope, redirect idempotence, preservation of video parameters, authentication exclusions, migration, pause/restart, invalid input and message authorization. These tests simulate Chrome routing; they do not prove an authenticated YouTube session works. Validate the unpacked extension in Chrome with a real secondary session before publishing.

Manual checks:

- Homepage, external video link, search, Shorts, playlist, refresh and a new tab use the selected account.
- Playback and navigation within YouTube continue without forced reloads.
- An embedded player receives the selected account parameter once.
- A missing account reaches `/oops` with reconnection help and no automatic retry loop.
- Pause removes the extension's rules; re-enable restores them.
- Sign-in, channel selection and other Google services remain accessible.

## Incident observed on 15 October 2026

In the inspected Chrome profile, `https://www.youtube.com/?authuser=1` reached `/oops` with “Can’t create new account because of past account issues”, even with v1 disabled. Google's YouTube account chooser showed only one signed-in account. This points to the secondary session being absent; it is not evidence that YouTube removed support for `authuser`. After the secondary account was signed back in during the investigation, YouTube loaded normally and its account menu identified Google session `/u/1/`. This confirms that the missing secondary session caused the observed failure. The new extension still requires installation and authenticated validation before publication.
