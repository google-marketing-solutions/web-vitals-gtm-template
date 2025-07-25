# Changelog

All notable changes to this project will be documented in this file.

### 2025-07-23

- Loading version 5 (5.0.3) from cdnjs
- ⚠️ Version 5 includes **breaking changes**. See the changelog from 2025-05-09 for details.

### 2025-05-09

- Update web-vitals.js to **version 5**, in case the library is loaded from unpkg.com or jsDelivr.
- ⚠️ Version 5 includes **breaking changes**. 
  - Please see the [CHANGELOG of web-vitals.js](https://github.com/GoogleChrome/web-vitals/blob/main/CHANGELOG.md) for more details.
  - See the [upgrading to v5](https://github.com/GoogleChrome/web-vitals/blob/main/docs/upgrading-to-v5.md) guide for a complete list of all API changes in version 5.

### 2025-02-06

- Add support for jsDelivr and cdnjs, next to unpkg.com.

### 2024-07-12

- Update web-vitals.js to version 4, in case the library is loaded from the unpkg.com domain and removed FID from the Tag Template ([#8](https://github.com/google-marketing-solutions/web-vitals-gtm-template/pull/8)).

Make sure to rename your dataLayer variables in your Google Tag Manager container based on the [upgrading to v4 documentation list](https://github.com/GoogleChrome/web-vitals/blob/main/docs/upgrading-to-v4.md). New features have also been [added](https://github.com/GoogleChrome/web-vitals/blob/main/docs/upgrading-to-v4.md#-new-features) to v4 that are available in the dataLayer of Google Tag Manager.

### 2024-04-10

- Adding automation ([#7](https://github.com/google-marketing-solutions/web-vitals-gtm-template/pull/7)). 

### 2023-07-07

- Initial release.