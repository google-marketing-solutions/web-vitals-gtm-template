# Changelog

All notable changes to this project will be documented in this file.

### 2025-05-09

- Update web-vitals.js to version 5, in case the library is loaded from one of the CDNs
- Please see the CHANGELOG of web-vitals.js for more details: https://github.com/GoogleChrome/web-vitals/blob/main/CHANGELOG.md
- Changes as detailed in the upgrading doc: https://github.com/GoogleChrome/web-vitals/blob/main/docs/upgrading-to-v5.md

### 2025-02-06

- Add support for jsDelivr and cdnjs, next to unpkg.com.

### 2024-07-12

- Update web-vitals.js to version 4, in case the library is loaded from the unpkg.com domain and removed FID from the Tag Template ([#8](https://github.com/google-marketing-solutions/web-vitals-gtm-template/pull/8)).

Make sure to rename your dataLayer variables in your Google Tag Manager container based on the [upgrading to v4 documentation list](https://github.com/GoogleChrome/web-vitals/blob/main/docs/upgrading-to-v4.md). New features have also been [added](https://github.com/GoogleChrome/web-vitals/blob/main/docs/upgrading-to-v4.md#-new-features) to v4 that are available in the dataLayer of Google Tag Manager.

### 2024-04-10

- Adding automation ([#7](https://github.com/google-marketing-solutions/web-vitals-gtm-template/pull/7)). 

### 2023-07-07

- Initial release.