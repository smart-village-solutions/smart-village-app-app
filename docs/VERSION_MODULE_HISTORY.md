# Smart Village App Module History by Version

This document summarizes the modules, user-facing capabilities and major platform foundations developed in every documented Smart Village App release from `v0.0.1` through `v4.3.0`.

## How to read this document

- The primary source is [`CHANGELOG.md`](../CHANGELOG.md). Git tags and the current application version were checked to validate the release range.
- “Module” is used broadly. It includes standalone product modules, cross-cutting capabilities such as accessibility, and major platform foundations that enabled later product work.
- A maintenance entry means that the release did not introduce a new user-facing module but improved stability, compatibility or an existing feature area.
- The changelog documents `v0.9.1`, although no corresponding Git tag exists. It is included here because it is part of the official release history.
- The malformed Git tag `v.3.2.6` points to the same commit as `v3.2.6`; it is treated as a duplicate and is not listed separately.

## Version 4.x

### v4.3.0

- **Wallet:** A complete card wallet with home, add-card and detail flows; bonus and coupon card types; barcode/QR presentation; scanning; sharing; live validity checks; and server-controlled card visibility.
- **Discovery Tours:** Guided tours with ordered stops, media carousels and actions for starting a tour.
- **SUE / Defect Reporting:** Expanded saved-report handling, service-request ID search, address search, report list rendering and general reporting reliability.
- **Maps and Parking:** Migrated the map stack to MapLibre v11 and added parking-availability pins backed by vehicle-status data.
- **Remote Experience Configuration:** Added remotely configurable home sections, floating action buttons and feedback titles/options.
- **Chatbot, Updates and Profiles:** Added a native chatbot conversation screen, OTA update notifications and more reliable profile/member/role synchronization.

### v4.2.0

- **Map Platform:** Replaced `react-native-maps` with MapLibre and redesigned map behavior, marker positioning and layouts.
- **Authentication and Profiles:** Added Keycloak account creation and sign-in support.
- **SUE / Defect Reporting:** Added a map/list switcher and refactored report view handling.
- **Coupons:** Added device-based automatic login and corrected zero-value discount presentation.
- **Configurable UI:** Added category icons, full-width HTML images, resettable city selection and refinements to tiles, buttons and image components.
- **Platform Foundation:** Upgraded through Expo SDK 53 and 54 and improved Android build performance.

### v4.1.4

- **Volunteer:** Added comment likes and replies, image comments, a timeline and the option to hide group calendars.
- **Push Notifications:** Added personalized notification subscriptions by news category and waste-notification deep links.
- **Noticeboard / Carpool:** Extended carpool listings, including ZIP-code filters.
- **Remote UI and Vouchers:** Added remotely updatable widget styles and refined voucher availability/quota behavior.

### v4.1.3

- **Home Multi-Button Section:** Added a server-driven section that presents multiple actions at the bottom of a home screen.
- **SUE / Defect Reporting:** Added a map/list switcher for report browsing.
- **Coupons:** Added device-specific automatic login for repeat-free redemption.
- **Volunteer:** Added group search, OS calendar export and better all-day appointment handling.
- **Noticeboard / Carpool:** Added new carpool inputs plus noticeboard and profile integration components.
- **Web and Accessibility:** Added configurable web-widget navigation modes and improved Android screen-reader support during onboarding.

### v4.1.2

- **Volunteer:** Added image uploads, entry editing/deletion, registration options, push notifications, search and filtering.
- **Search:** Introduced the first beta of the cross-content search module.
- **Service Tiles:** Added per-tile customization controls.
- **Waste Calendar:** Added export of selected waste types and improved address entry, design and performance.
- **SUE / Defect Reporting:** Added remotely configurable feedback-form content.
- **Onboarding and App Information:** Added onboarding skip behavior and an application-version information alert.

### v4.1.1

- **Home Experience:** Added a server-controlled live ticker and remotely styled service tiles.
- **Waste Calendar:** Added notes for waste entries.
- **Vouchers:** Added a way to request camera permission again and restored voucher availability behavior.
- **Navigation:** Added remotely configurable active/inactive tab-bar icons.
- **OParl:** Introduced new agenda sorting logic and corrected people-list loading.

### v4.1.0

- **Filter System:** Introduced reusable overlay filters for overview screens.
- **SUE / Defect Reporting:** Added a more prominent app entry, expanded map-pin colors and an optional rating/feedback step after report submission.
- **Waste Calendar:** Delivered a redesigned list/calendar interface with server-editable texts.
- **Remote Navigation:** Made tab-bar structure configurable through the main server.
- **Delivery and Quality:** Moved build/update/submission flows to EAS and introduced the first Maestro end-to-end tests.

### v4.0.3

- **Noticeboard:** Added image uploads.
- **SUE / Defect Reporting:** Added pagination, report configuration refresh, a location endpoint, map clustering and multiple reporting usability improvements.
- **Events:** Added an event-suggestion action and updated bookmark handling for multi-appointment events.
- **Web Navigation:** Added an option to open websites in the external browser.

### v4.0.2

- **Icon System:** Added the Tabler icon family.
- **BUS-BB:** Added server-configurable filtering.
- **Noticeboard:** Added PDF upload and viewing.
- **Home Slider:** Added global configuration for slider behavior.
- **Weather and Platform:** Refreshed the weather design and updated Expo/AR platform dependencies.

### v4.0.1

- **SUE / Defect Reporting:** Added multi-link consent text, image-coordinate improvements and fixes for address autofill and report submission.
- **Custom Widget:** Added a configurable widget that can navigate to different in-app screens.
- **Noticeboard:** Added support for multiple categories.
- **Events:** Added correct presentation of recurring events.
- **Configurable Details and Maps:** Added controls for opening-hours visibility, font loading and bordered map icons.

### v4.0.0

- **SUE / Defect Reporting:** Introduced the “Sag's uns einfach” defect and service-request reporting module.
- **Voucher:** Introduced the voucher discovery and redemption module.
- **Events:** Added optional time subtitles in event lists.
- **Service Content:** Added configurable HTML above and below tile screens.
- **Platform Foundation:** Upgraded to Expo SDK 50 and 51 and modernized Sentry and device-size handling.

## Version 3.x

### v3.3.5

- **MoWaS Warning Settings:** Added settings that let users control which MoWaS warning keys are active.
- **Maintenance:** Improved EAS/Xcode compatibility and fixed home lists, BUS-BB links, carousels, onboarding and editable tiles.

### v3.3.4

- **Maintenance:** Corrected event-date rendering and image display after an icon-package change; no new user-facing module was introduced.

### v3.3.3

- **Home Content:** Added a hero-style list, a server-fed list, configurable carousel buttons and a richer “disturber” announcement area.
- **Settings:** Added an alternative server-configurable settings-screen presentation.
- **Disturber:** Added multiple images and in-app navigation actions from announcement images.

### v3.3.2

- **News Sharing:** Added direct sharing of news links.
- **Maintenance:** Stabilized event lists, volunteer navigation and image/document upload screens.

### v3.3.1

- **Maintenance:** Improved POI map navigation, notification settings, event-list pagination/rendering and activity-filter stability; no new module was introduced.

### v3.3.0

- **Web Widget and Disturber:** Added server-configurable web shortcuts and prominent home-screen announcements.
- **Maps and POIs:** Added full-screen map/list switching, POI previews, marker enhancements and configurable zoom/layout behavior.
- **Mobility Information:** Added live vehicle availability and public-transport departures to selected POI details.
- **Remote Navigation:** Added server-controlled selection between tab and drawer navigation.
- **Events and Deadlines:** Added recurring-event date filtering/pagination and alphabetical deadline sorting.
- **UI Foundation:** Added resizable tiles, richer buttons and reusable section headers while upgrading to Expo SDK 49 and React Navigation 6.

### v3.2.7

- **Multi-Button Navigation:** Expanded multi-button screens so their actions can reach all supported destinations.
- **Surveys:** Added configurable HTML above the survey list.

### v3.2.6

- **Content Navigation:** Added subcategory listing on index screens.
- **POI Filtering:** Added an “open now” filter and improved year-aware opening-time handling.
- **Events:** Added server-controlled event-query variables and limits.
- **Forms and Uploads:** Improved image-selection errors and multiline-input behavior.

### v3.2.5

- **Web Integration:** Added WhatsApp link handling on Android.
- **Surveys:** Added a completion confirmation alert.
- **Maps:** Added server-configurable zoom values.
- **Augmented Reality:** Reduced memory requirements for lower-end devices.
- **Accessibility:** Prevented duplicate TalkBack announcements for images.

### v3.2.4

- **Accessibility:** Improved labels and survey-answer contrast.
- **Web Integration:** Added WhatsApp deep links on iOS.
- **Maintenance:** Corrected recurring-event presentation, waste-calendar autocomplete and BB-NAVI navigation.

### v3.2.3

- **Waste Calendar:** Added automatic street suggestions, list scrolling and smoother address entry.
- **Event Calendar:** Added same-day event lists and configurable indicator-dot counts.
- **Accessibility:** Added higher-contrast input borders.
- **Feedback:** Relaxed selected form requirements and corrected checkbox placement.

### v3.2.2

- **Waste Reminders:** Fixed recreation of waste-calendar notifications; no new user-facing module was introduced.

### v3.2.1

- **Accessibility:** Expanded reduced-transparency contrast behavior across filters, inputs, feedback controls and weather views, and added a pause control to sliders.
- **Feedback:** Improved accessible form inputs.
- **Android Notifications:** Added Android 13 notification support and fixed splash-screen startup behavior.

### v3.2.0

- **Platform Foundation:** Upgraded through Expo SDK 46, 47 and 48 and refreshed calendar/chat dependencies.
- **Maintenance:** Fixed calendar compatibility and chat rotation; no new product module was introduced.

### v3.1.4

- **Accessibility:** Added support for iOS Reduce Transparency in switches and version-information UI.

### v3.1.3

- **Accessibility Foundation:** Added a global accessibility provider and improved transparency-aware survey presentation.
- **Waste Calendar:** Added automatic street selection when only one choice exists.
- **Events and POIs:** Added an event location filter and server-configurable intro/footer content.
- **HTML Content:** Added modern iframe and table rendering support.

### v3.1.2

- **Waste Calendar:** Added city and street selection.
- **Accessibility:** Added accessible search/clear buttons, checkboxes, filters and richer dropdown labels.

### v3.1.1

- **Event Calendar:** Added a calendar view to the event screen.
- **Augmented Reality:** Added model shadows and improved modal/model handling.
- **Accessibility:** Added labels and accessible presentation to weather and bookmark controls.
- **Defect Reporting:** Made required fields explicit.

### v3.1.0

- **Defect Reporting:** Introduced the first defect-report flow.
- **Deadlines and Action Notices:** Added deadline lists and action-notifier capabilities.
- **Noticeboard:** Introduced noticeboard content.
- **Service Tiles:** Added user-controlled sorting and visibility.
- **Augmented Reality:** Added multi-model scenes and continuous audio playback.

### v3.0.5

- **Volunteer:** Added admin messaging, profile/group/calendar editing, dedicated home/personal screens and refreshed forms/icons.

### v3.0.4

- **Augmented Reality:** Added multi-model downloads, server-configurable ambient light and physical width, artwork descriptions and supporting documentation.

### v3.0.3

- **Map Location Settings:** Hardened coordinate initialization and global-setting fallbacks; no new user-facing module was introduced.

### v3.0.2

- **Location Privacy:** Prevented unintended iOS location requests when map location services are disabled; no new module was introduced.

### v3.0.1

- **Service Tiles:** Added image presentation to the service-tile screen.
- **Augmented Reality:** Moved tour selection to remote settings.
- **Maintenance:** Improved chat-image and Android map-polyline rendering.

### v3.0.0

- **Augmented Reality:** Introduced AR experiences based on Viro, including optional model-based tours.
- **Volunteer Chat:** Added real-time chat to the volunteer area.
- **Water Temperature:** Added a configurable home-screen widget.
- **Map Platform:** Replaced web-based Leaflet maps with native `react-native-maps` throughout the app.
- **Remote Configuration:** Moved more app configuration from local secrets to global server settings.
- **Platform Foundation:** Migrated builds to EAS and upgraded to Expo SDK 44 and 45.

## Version 2.x

### v2.6.1

- **Service Tiles:** Added large image-based, orientation-aware tiles with accessibility labels and consolidated tile rendering.
- **App Information:** Ensured the installed version remains visible even when server-provided about content is absent.
- **Maintenance:** Hardened global-settings initialization and standardized colors/icons.

### v2.6.0

- **Volunteer:** Introduced the optional HumHub-based volunteer area with accounts, groups, chat and events.
- **Citizen Participation / Consul:** Introduced accounts, debates, proposals and polls backed by Consul.
- **Onboarding:** Added an option to replay the app introduction.
- **BUS-BB and Waste:** Migrated transport data to Teleport API v4 and corrected daylight-saving behavior for waste reminders.

### v2.5.4

- **Feedback:** Added a setting that can hide feedback footers on selected screens.
- **Localization and Maintenance:** Set German as the default app language and corrected BUS-BB/category/POI navigation behavior.

### v2.5.3

- **Nested Categories:** Added list screens for multi-level category structures.
- **Empty States:** Added a reusable empty-message component.
- **Location Privacy:** Reduced iOS location accuracy and stopped repeated permission prompts.

### v2.5.2

- **OParl Documents:** Opened file and download URLs externally instead of offering copy-only access.
- **Maintenance:** Improved date parsing and fallback behavior for failed remote images.

### v2.5.1

- **Nested Services:** Added a generic tile screen that can be embedded at any navigation level.
- **Waste Calendar:** Corrected timezone behavior.

### v2.5.0

- **Versioned Remote Content:** Made static content and global settings aware of the app version.
- **Data-Provider Filtering:** Added persistent provider filters and a corresponding settings section.
- **Feedback:** Added contextual feedback footers to detail screens.
- **POI Discovery:** Added location filtering and support for multiple category IDs.

### v2.4.2

- **Observability:** Improved per-app Sentry configuration.
- **Maintenance:** Updated dependencies and replaced the map WebView fork to address Android crashes.

### v2.4.1

- **Sentry:** Added application error monitoring.
- **Multi-Button Screen:** Introduced a reusable screen for presenting multiple navigation actions.
- **BUS-BB:** Integrated a new GraphQL endpoint.
- **POI Discovery:** Unified map/list filters and added category-ID filtering.

### v2.4.0

- **Surveys:** Added per-survey CMS options for language, multiple answers, HTML information and optional comments.

### v2.3.0

- **Onboarding:** Introduced the app intro and completion-aware onboarding manager.
- **Nested Information:** Added hierarchical help/information pages with HTML and navigation links.
- **Settings:** Reorganized general and visual settings and added an alternate location for use when device location is disabled.
- **POI Discovery:** Added open/opening-time filtering.

### v2.2.0

- **Encounter:** Introduced account registration and QR-based “digital handshake” encounters.
- **Remote Content Foundation:** Added the reusable `useStaticContent` hook.

### v2.1.3

- **Location Services:** Added opt-in device location, distance sorting and current-location display on maps.
- **Route Planning:** Added BB-NAVI links and location-aware starting points.
- **Events:** Reorganized event lists into date sections.

### v2.1.2

- **Construction Sites:** Added generic-item construction content and related home data.
- **Web Content:** Added richer parameters for HTML screens.
- **Analytics:** Added more device information to Matomo tracking.
- **Commercial Content:** Added date-based visibility filtering.

### v2.1.1

- **Home Widgets:** Added widgets for construction-site news and surveys.
- **Surveys:** Corrected bilingual answer presentation.

### v2.1.0

- **Surveys:** Introduced German/Polish survey listing, detail and response screens.

### v2.0.2

- **Design System:** Centralized icon and font definitions so app variants can swap visual assets more easily.

### v2.0.1

- **Navigation Maintenance:** Simplified navigation configuration and improved Android drawer inset handling; no new module was introduced.

### v2.0.0

- **Navigation Platform:** Introduced the second-generation, configuration-driven navigation architecture.
- **Platform Foundation:** Upgraded the application to Expo SDK 42.

## Version 1.x

### v1.8.1

- **Navigation Maintenance:** Hid invalid back controls on initial tab screens; no new module was introduced.

### v1.8.0

- **Navigation Platform:** Migrated from React Navigation 3 to 5.
- **Platform Foundation:** Upgraded to Expo SDK 41 and refreshed core dependencies.

### v1.7.2

- **Waste Calendar:** Added calendar export.
- **OParl:** Replaced unreliable search with an organizations browser.

### v1.7.1

- **OParl:** Added paginated people lists and improved organization loading.

### v1.7.0

- **OParl:** Introduced overview, people, calendar, search and detail screens for OParl 1.0/1.1 data.
- **OParl Data Layer:** Added an independent Apollo client and query hook for municipal parliamentary data.

### v1.6.3

- **Data-Provider Branding:** Added provider logos to generic items/offers.

### v1.6.2

- **Maintenance:** Corrected Matomo tracking context and carousel image refresh behavior; no new module was introduced.

### v1.6.1

- **Waste Reminders:** Added settings and API integration for scheduled waste notifications.
- **Jobs and Ads:** Added these generic-item types to data-provider cross-content screens.
- **Push Stability:** Prevented crashes when push-notification detail data is missing.

### v1.6.0

- **Jobs and Ads:** Introduced listing, detail and bookmark flows for generic job/advertisement content.
- **Business / Data Providers:** Added cross-content provider pages covering multiple content types.
- **Waste Calendar:** Introduced local collection calendars.
- **Push Configuration:** Added server-side enable/disable controls for notifications.

### v1.5.7

- **Maintenance:** Improved empty-address and landscape dropdown presentation; no new module was introduced.

### v1.5.6

- **Media Refresh:** Added configurable remote-image refresh intervals and reusable media sections.
- **Home and Weather:** Extended pull-to-refresh behavior to weather and remaining home components.

### v1.5.5

- **Lunch Menu:** Introduced a date-navigable lunch widget and detail screen with scheduled refreshes.
- **Widget Platform:** Added server-configurable widget texts and reusable widget/home-section foundations.
- **Data-Provider Branding:** Added provider logos to POIs.

### v1.5.4

- **Home Carousel:** Added time/day-controlled slides, image messages and remotely sourced refresh behavior.
- **Forms:** Made forms reachable in drawer-based app variants.
- **Content Actions:** Consolidated web actions for events, POIs and tours.

### v1.5.3

- **Responsive Media:** Reworked image and map sizing for orientation changes and modern devices.
- **Safe Areas:** Added iPhone 12-compatible safe-area handling.

### v1.5.2

- **BUS-BB:** Introduced the initial Brandenburg transport/construction information module components.

### v1.5.1

- **Remote Media Configuration:** Added app-wide and carousel-specific image aspect-ratio settings.
- **Maintenance:** Updated the image component to fix Android loading indicators.

### v1.5.0

- **Home Widgets:** Introduced weather, current-events and construction-count widgets.
- **Weather:** Added a detailed weather screen.
- **Construction Sites:** Added overview and detail screens.

### v1.4.5

- **Bookmarks:** Introduced saved content across supported detail types and a combined bookmarks/settings entry.
- **Content Safety:** Prevented malformed server JSON from crashing the app.

### v1.4.4

- **Push Navigation:** Added richer routing parameters for opening content from notifications.
- **Offline Maps:** Added cache-aware location overview queries.
- **Category Lists:** Added empty-data and optional-intro handling.

### v1.4.3

- **Platform Foundation:** Upgraded to Expo SDK 40; no new product module was introduced.

### v1.4.2

- **POI Maps:** Introduced OpenStreetMap-based location overview and POI detail maps.
- **List Foundation:** Consolidated configurable list rendering across home and index screens.

### v1.4.1

- **Sharing:** Added an iOS-specific share icon.
- **Maintenance:** Improved image rerendering, first-run startup and disabled-Matomo behavior.

### v1.4.0

- **Settings:** Introduced a dedicated settings area.
- **Push Notifications:** Added server-triggered Expo push notifications and user controls.
- **Matomo Analytics:** Added optional screen-view analytics and consent/settings controls.
- **List Personalization:** Let users select layouts for news, events, POIs and tours.

### v1.3.5

- **Home Categories:** Added multiple news sections organized by category.
- **Event Discovery:** Added category filtering to event lists.

### v1.3.4

- **Event Maintenance:** Corrected appointment text presentation; no new module was introduced.

### v1.3.3

- **Platform Foundation:** Upgraded to Expo SDK 39; no new product module was introduced.

### v1.3.2

- **Accessibility Foundation:** Added accessibility labels to the app’s most important controls and content.

### v1.3.1

- **Responsive Service Tiles:** Added orientation-aware sizing for service boxes.

### v1.3.0

- **Landscape Mode:** Added landscape layouts across screens and components.
- **Tablet Support:** Added denser, more readable layouts for larger screens.

### v1.2.4

- **Offline Reliability:** Prevented invalid refresh attempts and improved Apollo cache use while offline; no new module was introduced.

### v1.2.3

- **Pull to Refresh:** Added manual refresh behavior to all data screens.
- **Multi-Button Content:** Added server-provided arrays of web-navigation buttons to generic content screens.

### v1.2.2

- **Platform Foundation:** Upgraded to Expo SDK 38 and refreshed dependencies; no new product module was introduced.

### v1.2.1

- **News Filtering:** Added an optional data-provider dropdown to news lists.

### v1.2.0

- **Offline Mode:** Added server-aware fetch policies and persistent cached-data fallback.
- **Pagination:** Added paginated news and event lists.
- **Refresh Scheduling:** Added per-content refresh intervals.
- **Remote Text Configuration:** Expanded server-editable interface copy.

### v1.1.4

- **Media Rights:** Added image copyright overlays.
- **In-App Browser:** Opened links inside the app by default.
- **Remote Headings:** Added server-configurable section titles.
- **Authentication Reliability:** Added token retry behavior for network failures.

### v1.1.3

- **App Chrome:** Added explicit Android status-bar styling and content-specific detail titles.
- **Event Data:** Moved upcoming-event filtering responsibility to the server.

### v1.1.2

- **Platform Foundation:** Upgraded to Expo SDK 37; no new product module was introduced.

### v1.1.1

- **Platform Foundation:** Upgraded to Expo SDK 36; no new product module was introduced.

### v1.1.0

- **Remote Configuration:** Introduced server-provided global settings.
- **Navigation Modes:** Added configurable drawer or tab navigation.

### v1.0.13

- **Event UI Maintenance:** Removed an unnecessary divider from the final home-screen event; no new module was introduced.

### v1.0.12

- **Platform Foundation:** Upgraded to Expo SDK 35; no new product module was introduced.

### v1.0.11

- **Home Configuration:** Added feature flags controlling visibility of the main home sections.

### v1.0.10

- **Authentication:** Added access-token expiry validation and refresh behavior.
- **Error States:** Replaced endless loading with safe empty states after initial-query failures.

### v1.0.9

- **Home Carousel:** Added navigation from carousel images to linked detail content.

### v1.0.8

- **Platform Foundation:** Upgraded to Expo SDK 34; no new product module was introduced.

### v1.0.7

- **Multi-Tenant Configuration:** Added namespaced secrets selected by app slug.

### v1.0.6

- **Design System:** Centralized price-card colors for maintainability and visual consistency.

### v1.0.5

- **Restricted News:** Added a server-controlled summary-only presentation with a source action.
- **In-App Browser:** Opened news sources in a WebView.

### v1.0.4

- **Rich News:** Added iterative content-block rendering plus audio and video embeds.

### v1.0.3

- **Detail Content:** Added contact first names and human-readable URL titles.

### v1.0.2

- **List Performance:** Reworked list items and conditional rendering for faster scrolling.
- **Maintenance:** Fixed opening-time crashes and Android carousel lag.

### v1.0.1

- **POIs and Tours:** Added address additions to location details.
- **News Maintenance:** Restored missing news titles.

### v1.0.0

- **Categories:** Introduced category selection and filtered POI/tour discovery.
- **Tours and POIs:** Added combined lists, counts and category-aware navigation.
- **Media Carousel:** Added multiple-image carousels to home and detail screens.
- **News Details:** Extracted a dedicated news-item presentation.
- **Offline Startup:** Ensured the application can initialize without a network connection.

## Version 0.x

### v0.9.5

- **Sharing:** Improved share messages for news, events, POIs and tours.
- **Event Lists:** Refined event subtitles.

### v0.9.4

- **Tours:** Introduced tour queries, combined POI/tour lists and dedicated tour detail screens.
- **Opening Hours:** Added “open” state handling for POIs.

### v0.9.3

- **Events:** Added upcoming-event filtering and retained only the next three events on the home screen.

### v0.9.2

- **App Information:** Added the version number to the home-screen footer.
- **Events:** Added list-date sorting and subtitles.

### v0.9.1

- **Event Details:** Expanded event information, titles, dates and organizer presentation.
- **Maintenance:** Simplified event-detail rendering to resolve layout spacing issues.

### v0.9.0

- **Offline Mode:** Added network-aware fetch policies so the app can load from cache.
- **Image Cache:** Added caching for remote media.
- **List Performance:** Added loading indicators and optimized scrolling.
- **Sharing:** Corrected POI share content.

### v0.8.6

- **Maintenance:** Stabilized news source URLs and simplified opening-time rendering; no new module was introduced.

### v0.8.5

- **POI Details:** Added operating-company information and improved opening-time/address layouts.

### v0.8.4

- **Home Actions:** Added gradient call-to-action buttons after teaser lists.
- **List Design:** Unified list layouts, spacing and headers.

### v0.8.3

- **POI Details:** Added formatted prices, native-map address links and phone actions.
- **Content Design:** Unified news and event title layouts.

### v0.8.2

- **Service and About Areas:** Separated service shortcuts from informational/about pages on the home screen.

### v0.8.1

- **Safe-Area Layout:** Added safe-area wrappers across screens.
- **Detail Content:** Expanded contact and category information.
- **Browser and Navigation:** Added the WebView dependency and corrected drawer navigation for HTML pages.

### v0.8.0

- **Platform Foundation:** Upgraded from Expo SDK 32 to 33, modularized Expo packages and adopted the community WebView.

### v0.7.4

- **POI Details:** Added general-information and price cards.
- **UI Foundation:** Made text components and configuration more reusable.

### v0.7.3

- **HTML Rendering:** Improved whitespace cleanup after self-closing HTML tags.

### v0.7.2

- **POI Discovery:** Expanded the horizontal home-screen POI carousel from three to ten items.

### v0.7.1

- **Categories:** Updated category queries and rendering for the new category data type.
- **List Performance:** Converted card lists to pure components.

### v0.7.0

- **Authentication:** Introduced OAuth 2 client-credentials authentication, secure token storage and token refresh.
- **Configuration Security:** Added ignored local secrets and authentication documentation.

### v0.6.9

- **In-App Browser:** Introduced a WebView screen with loading state for external services.
- **HTML Actions:** Added buttons that open linked web services from HTML content.

### v0.6.8

- **Sharing:** Introduced native sharing from detail screens and reusable share-message helpers.

### v0.6.7

- **News:** Switched publication ordering/display from creation time to the actual publication date.

### v0.6.6

- **Startup Experience:** Added a splash screen that remains visible until initialization completes.
- **Interaction Design:** Added platform-appropriate touch feedback and Android stack transitions.
- **Responsive Layout:** Added normalized sizing and safer conditional data rendering.

### v0.6.5

- **Typography:** Introduced the Titillium Web custom font throughout the app.

### v0.6.4

- **Date and Time:** Added reusable formatting and richer subtitles.
- **Detail Content:** Expanded query-specific detail rendering and reusable image/logo components.
- **Navigation and Layout:** Improved drawer behavior, padding and Android compatibility.

### v0.6.3

- **Detail Navigation:** Added navigation parameters and press actions from list/card items to detail screens.

### v0.6.2

- **Header Design:** Added reusable SVG icons, touchable actions and configurable gradient headers.

### v0.6.1

- **Navigation Architecture:** Consolidated screens into one app stack with consistent transitions and back navigation.
- **Detail Data:** Added GraphQL queries directly to detail screens.

### v0.6.0

- **Remote Navigation:** Began fetching navigation configuration from the server and generating drawer entries dynamically.
- **GraphQL Content:** Replaced hard-coded lists with reusable query-driven home and index screens.

### v0.5.2

- **HTML Content:** Added styled rendering and cleanup for HTML received through GraphQL.
- **Link Handling:** Added reusable external-link helpers.

### v0.5.1

- **Android Compatibility:** Brought the Android implementation to feature and layout parity with iOS.
- **Maintenance:** Updated packages and interaction workarounds for the older React Native platform.

### v0.5.0

- **UI Component Foundation:** Added ten reusable components forming the Home, Index and Detail layouts.
- **HTML Styling:** Added configurable tag styles for server-provided text content.

### v0.4.0

- **Custom Navigation:** Introduced a branded drawer with platform-specific behavior and stack reset handling.
- **Visual Foundation:** Added reusable gradients, device configuration, status-bar styling and the initial green/blue palette.

### v0.3.0

- **UI Foundation:** Added `styled-components` and React Native Elements as the initial component/styling system.

### v0.2.0

- **GraphQL Data Layer:** Introduced Apollo Client and the first server queries.
- **Offline Cache Foundation:** Persisted Apollo cache data in AsyncStorage.

### v0.1.0

- **Application Foundation:** Created the Expo/React Native application with drawer and nested stack navigation.
- **Quality Foundation:** Added Jest, linting and Code Climate configuration.

### v0.0.1

- **Repository Foundation:** Created the initial project repository; no application module existed yet.
