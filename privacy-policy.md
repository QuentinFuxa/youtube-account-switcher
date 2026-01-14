# Privacy Policy for YouTube Account Switcher

**Last updated:** January 14, 2026

## Overview

YouTube Account Switcher is a browser extension that automatically switches to your secondary Google account when browsing YouTube. This privacy policy explains how we handle your data.

## Data Collection

**We do not collect any data.**

This extension:
- Does not collect personal information
- Does not collect browsing history
- Does not collect usage statistics
- Does not use analytics or tracking
- Does not transmit any data to external servers

## How the Extension Works

The extension operates entirely locally on your browser. It:
1. Detects when you navigate to YouTube
2. Modifies the URL to include `authuser=1` parameter
3. This tells YouTube to use your secondary logged-in Google account

No data leaves your browser. The extension simply modifies URLs locally.

## Permissions Used

The extension requires certain browser permissions to function:

- **webNavigation**: To detect when you navigate to YouTube pages
- **tabs**: To update the current tab's URL with the account switching parameter
- **declarativeNetRequest**: To handle YouTube embedded videos on other websites
- **host_permissions (youtube.com)**: To operate on YouTube pages

These permissions are used solely for the core functionality described above.

## Third-Party Services

This extension does not use any third-party services, APIs, or analytics platforms.

## Data Storage

This extension does not store any data locally or remotely.

## Changes to This Policy

If we make changes to this privacy policy, we will update the "Last updated" date above.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository.

## Open Source

This extension is open source. You can review the complete source code to verify these privacy practices.
