# Privacy Policy for YouTube Account Switcher

Last updated: October 15, 2026

The extension does not collect or transmit personal information, browsing history, usage statistics or analytics. It has no backend and loads no remote code.

It modifies the `authuser` query parameter on supported YouTube page and embed requests using Chrome's declarative network rules. It stores only the enabled state and selected numeric account index in `chrome.storage.local`. These preferences remain in the local Chrome profile; they are not synced by this extension.

On YouTube's error page, a local helper offers to open Google's account chooser. The popup can also open the chooser or reopen a YouTube URL. These actions navigate to Google or YouTube normally; those services handle their own sign-in and data under their respective privacy policies. The extension cannot read passwords, authentication tokens, cookies, or the list of Google accounts and does not store email addresses.

Permissions:

- `declarativeNetRequest`: route supported YouTube document requests to the selected account index.
- YouTube host access: apply redirects, read the active YouTube URL when requested from the popup, and display the local helper on `/oops`.
- `storage`: save two local preferences.

Disabling automatic routing removes its dynamic routing rules. Uninstalling removes its local settings and rules. No information is sent to the developer or other external servers by the extension.

Questions and source code: https://github.com/QuentinFuxa/youtube-account-switcher
