# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [4.2.0] :crown:

The new version updates the map module to a whole new feeling, extends profile features and upgrades Expo to latest SDK version 54

## Breaking

The map implementation has been completely replaced from `react-native-maps` to `@maplibre/maplibre-react-native`. This means:

- any custom map configurations or styles need to be updated to work with MapLibre
- map customization API has changed significantly

### Added

- added the feature of creating an account and logging in via keykloak
- added automatic login feature for the coupon module
- added feature to display icons for categories
- added `@rnrepo/expo-config-plugin` to reduce android build time
- added the ability to display full-width images in html view
- added Map/List view switcher component for sue module
- added touchable reset functionality in city selection
- added safe call for bottom tab bar height to avoid crashes in apps with drawer navigation
- temporary opt-out for iOS 26 glass effects with `UIDesignRequiresCompatibility` set to `true` in `infoPlist`

### Changed

- upgraded Expo to version 53: https://expo.dev/changelog/sdk-53
- upgraded Expo to version 54: https://expo.dev/changelog/sdk-54
- changed to map package `@maplibre/maplibre-react-native`
- enhanced map handling and layout adjustments
- changed image component with `Expo-Image`
- enhanced button and image button components
- changed the draggable property of customisable tiles with `react-native-gesture-handler`
- refactored view type handling in sue module

### Fixed

- fixed an error in the coupon module where discounts were not displayed when the discount value was 0
- fixed the city selection issue
- fixed image styling in CardListItem
- simplified marker anchor positioning
- updated style prop for images in `SueReportSend` and `SueHomeScreen`
- fixed missing `refreshTimeKey` prop to `ConnectedImagesCarousel`
- fixed carousel image full screen in landscape mode

## [4.1.4]

This version adds new features to the Volunteer module and introduces more personalized push notifications

### Added

- added a customizable push notification feature for different news categories
- added the ability to like and reply to comments for the volunteer module
- added timeline feature for the volunteer module
- added the ability to hide a group's calendar for the volunteer module
- added the ability to add image comments to the volunteer module
- added further developments on the noticeboard for carpool extensions especially zip filter additions
- added a feature that automatically redirects within the app for notifications coming from the waste calendar
- added a remotely updatable style feature for widgets
- added a feature to reposition the copyright information in the image on the news details screen

### Changed

- adjusted querying and renderings for vouchers

### Fixed

- fixed an issue where news items were listed multiple times in some cases
- fixed an issue where news items couldn't be added to favorites in some cases
- enhanced switch disabled state handling for thumb and track colors

## [v4.1.3]

This release includes a new Android target API level, important UI/UX improvements and several bug fixes for better stability

### Added

- upgraded Android targetSdkVersion to 35 to comply with new Play Store policies
- added new module to show multiple buttons in a home section on the bottom of the screen
- added Map/List view switcher in the sue module
- added automatic login with device-specific ID for the coupon module to enable coupon redemption without repeated authentication
- added ability to export volunteer events to the OS calendar via expo-calendar
- added new inputs for the carpool module in the noticeboard
- added noticeboard and profile components with adjustments fo carpool noticeboard integration
- added `isExternal` and `inModalBrowser` parameters to web widget navigation
- implemented group search functionality in the volunteer module

### Changed

- improved handling and presentation of all-day appointments in the Volunteer module, ensuring correct date alignment

### Fixed

- fixed errors causing tiles not to display correctly in the customizable tile edit page
- fixed issue where Android screen reader could not recognize buttons on app intro slides
- improved sorting and visibility toggling behavior for tiles
- fixed invisibility of non-customizable tiles
- fixed date filter reset issue and inability to select only an end date in the overlay filter
- fixed waste module suggestion rendering and loading state behavior for more efficient performance

## [v4.1.2]

This version includes many improvements for the volunteer and waste calendar modules and the first beta version for the search module

### Added

- added the ability to upload images to entries in the volunteer module
- added the ability to edit and delete entries in the volunteer module
- added informative text to the registration screen of the volunteer module
- added two new input options on the registration screen for the volunteer module
- added push notifications for volunteer module
- added search and filtering for volunteer module
- implemented a first version of the search module (0.0.1-beta)
- added options to customize each service tile within itself
- added ability to export selected waste calendar types
- added skip button to onboarding screen
- added remote update feature for feedback form in sue module
- added feature for copying the description text on detail screens of main resources
- added new version information alert

### Changed

- optimized city and street inputs for waste calendar
- updated design elements for the waste calendar
- improved performance of the waste calendar
- updated the position of service tiles in the last row closer to each other
- enhanced oparl location handling and adjusted member rendering

### Fixed

- fixed the issue of not asking for permissions on the onboarding screen directly after slides
- fixed wrong value of push settings toggle in some cases
- fixed issues with geolocation when sorting after distance was disabled

## [v4.1.1]

This update includes visual improvements, bug fixes and performance enhancements

### Added

- added “live ticker” marquee text feature to `HomeScreen` which can be controlled via main server
- added service tile feature whose style can be updated via main server
- added notes feature for waste calendar
- added the ability to give camera access permission again in voucher module
- added active and inactive icon feature for tabbar that can be updated via main server

### Changed

- added new sorting logic for agenda items of oparl module
- removed date header in calendar view on event screen
- improved new app store update alert feature that can be controlled via main server
- added MB to BYTES conversions to consts file for better control in different places
- added more explicit check for opening time null values to catch edge cases

### Fixed

- fixed the problem of saving the picture taken from the camera twice in the SUE module for Android
- fixed issue with matomo tracking not activating
- fixed issue where the person list for oparl would not load
- fixed voucher unavailability issue in voucher module
- fixed the problem of images not fitting the design by adding `borderRadius` to the images in the text list item
- fixed layout problem on the weather screen
- fixed the problem of different background colour of tabbar and navigation bar
- fixed issue with widget not centering the icon if there is no count number

## [v4.1.0] :whale:

The new version integrates a brand new filter module, adds a new waste component, updates layouts and upgrades Expo to latest SDK version 52

### Added

- overview screens have new filters in an overlay and there are individual options possible, according to which you can filter
- the tab bar can be configured via main-server like any other static content to be able to make changes on the fly without app releases
- the sue module gets a new entry to be an even more integral part of the app
- there is a new option to place a feedback form including rating to the end of a report process
- added option to hide the alternate location selection button on the settings screen
- moved forward to use EAS (Update, Build, Submit) with enhanced configurations
- setup Maestro for e2e testing with first flows to ensure consistent quality more automatically from now on

### Changed

- upgraded Expo to version 52: https://expo.dev/changelog/2024/11-12-sdk-52
- brand new waste calendar interface with list and optional calendar, where interface texts can be edited from global settings
- pin color options for the map in the sue module are extended
- set `flat: true` as default for layouts to use the new design experience automatically
- as part of event request optimizations on the main server, the deprecated listingWithoutDateFragment option is removed entirely

### Fixed

- fixed the problem of dropdown in oparl module appearing even though there is no data to select
- fixed a bug in config context that caused the app to crash

## [v4.0.3]

This update includes a new image upload feature for the noticeboard module, improvements for sue module, performance optimizations

## Breaking

Bookmark overviews for events no longer display date and time a events can have multiple different appointments. Therefore a `onlyUniqEvents` option is used from the main-server, which version needs to correspond

### Added

- added image upload feature for noticeboard
- added required field information to feedback screen
- added pagination to reduce load times in sue module
- added new location endpoint for map view in sue module
- added the feature of refreshing the config when the report screen is opened for the sue module
- added clustering feature to the map view on the report screen for sue module
- added a feature that allows websites to be opened with an external browser
- added a button to the event list to create an event suggestion

### Changed

- improved logic for sorting by location and added option to deactivate it

### Fixed

- fixed the issue of not being able to switch from map view to list view while on the subcategory screen
- fixed problem with inputs under the keyboard
- fixed display issues in the bookmark event list caused by incorrect handling of event details

## [v4.0.2]

This update integrates tabler icon family, config for slider and pdf upload feature for noticeboard

### Added

- integrated tabler icon family
- added filtering feature for bbBus module that can be set via server
- added pdf upload and view feature to noticeboard module
- added the ability to configure via globalSettings for slider
- added minimum system version value for macOS platform to `app.json`

### Changed

- upgraded Expo to version 51.0.28
- upgraded `@reactvision/react-viro` to version 2.41.6
- reducing logs that make development difficult in the app
- redesign for weather screen

### Fixed

- fixed an issue in the sue module where areaService could not retrieve zip codes
- fixed the problem of address inputs not being filled automatically with the pin added to the map in the sue module
- fixed a bug that prevented personalized tiles from being ordered as desired
- updated event query to improve performance

## [v4.0.1]

This update includes a new `CustomWidget`, improvements for sue module and fixes some bugs

### Added

- added adaptiveIcon feature for Android
  - due to the adaptiveIcon update for Android, `assets/adaptive-icon.png` needs to be created and
    updated according to the necessary guidelines
    - https://developer.android.com/develop/ui/views/launch/icon_design_adaptive
- added the option to add multiple links to the checkbox on the report creation screen in the sue module
- added `showOpeningTimes` property to hide the opening time section in `DetailScreen` via `globalSettings`
- added `useFonts` to load fonts in app
- added the ability to display serial events correctly in the app
- added the ability to add different noticeboard categories
- added new `CustomWidget` widget to navigate to different screens within the app
- added possibility for border on icons to make them more visible on the map

### Changed

- upgraded Expo to version 51.0.28
- improved coordinate retrieval from image for sue module
- updated `Font.loadAsync` with `useFonts`

### Fixed

- fixed a bug in the sue module that did not cause reports to be sent
- fixed http pages not opening on ios devices
- fixed bug in `ConfigurationsProvider` that prevented app from opening
- fixed issue with input keys in configApi not matching with app for sue module

## [v4.0.0] :dizzy:

This version includes the Expo SDK 50 and SDK 51 update, a new the defect report module and a new voucher module. Theming feature coming soon.

### Added

- added new defect report module (Sag's uns einfach)
- added new voucher module
- added the option to add time subtitle to the event list
- added options to add html at the top and bottom of the tile screen

### Changed

- upgraded Expo to version 50: https://blog.expo.dev/expo-sdk-50-afb524038906
- upgraded Expo to version 51: https://blog.expo.dev/expo-sdk-51-b73ed1798672
- updated `normalize` function according to current device sizes
- updated sentry integration

### Fixed

- fixed a bug in the development app that caused images not to be displayed on the Android platform
- fixed a bug that caused the app to crash in map view when `iconName` was missing
- fixed a bug that caused the settings screen to fail to load
- fixed a bug that caused street names on the map to appear twice on the iOS platform

## [v3.3.5]

This version fixes minor known issues and adds a new tab to the settings screen for mowas keys

### Added

- added the ability to set the usability of keys for mowas on the settings screen
- added the ability to create builds in the latest version of Xcode with eas

### Fixed

- fixed a bug that caused the app to crash in editable tile
- fixed bugs with different list views in `HomeScreen`
- fixed a bug with a gap under the logo in `DetailScreen`
- fixed the problem of opening links from external browsers in BBBus
- fixed the application crashes if the location data in BBBus is undefined
- fixed an issue where the Carousel would reset after pausing
- fixed the problem that images on the onboarding screen appear above the status bar

## [v3.3.4]

This version includes a new list option and fixes some bugs

## Breaking

Icon names need to be updated due to a failure to display icons caused by updating the icon package

### Fixed

- fixed the error of dates not appearing in the event list
- fixed prop error in Image component that caused images not to display correctly

## [v3.3.3]

This version includes a new list option and fixes some bugs

### Added

- added a new list view option with a large image as the first item
- added multiple images for disturber
- added the ability to click on images in disturber and navigate within the app
- added new settings screen appearance that can be set via the server
- added a new list that can be added to `HomeScreen` and updated via the server
- added option to add button to `Carousel` in `HomeScreen`

### Fixed

- fixed a bug that did not allow http pages to be open
- fixed the problem of not selecting the document
- fixed the error of sections in the event list in different list types not showing the date
- fixed a bug in the settings screen that caused the app to crash

## [v3.3.2]

This update includes bug fixes

### Added

- added link sharing feature for news

### Fixed

- fixed `EventList` crashing the app on Android devices
- fixed a navigation bug on the volunteer screen that caused the app to crash
- fixed a bug that caused the application to crash on screen with image and document upload feature

## [v3.3.1]

This update includes bug fixes

### Fixed

- fixed a bug that caused the inability to return from POI map view
- fixed a bug where notifications in settings could not be activated
- fixed a bug in the event list that caused the list layout to be broken when loading new data
- fixed rerendering problem caused by navigation
- fixed a bug that caused the daily activity filter to reload the screen

## [3.3.0] :rocket:

Major new Expo SDK version 49 and updated packages plus bug fixes

### Added

- added `WebWidget` to the `HomeScreen`, which can be redirected to `WebScreen` and change the icon on the server side
- added the ability to insert links to share content
- added dynamic intro to poi list
- added resize feature for tiles
- added filtering on platform to exclude web urls for the foreign system
- added support for different sizes and styles to the `Button` component
- added new disturber module to `HomeScreen`
- added poi preview on full screen map
- added showing available vehicles in `DetailScreen` for specific POIs
- added showing public transport departure times in `DetailScreen` for specific POIs
- added full screen map in location overview
- added floating button for switching between map and poi list
- added the ability to switch between tab and drawer navigation via server configuration
- added `refreshControl` color for `RefreshControl` and `ActivityIndicator`
- added a second icon to the map marker according to the category icon
- added a filter that shows appointment dates for series events from today
- added pagination feature to the appointment dates of series events
- added `SectionHeader` component for Title
- added alphabetical sorting for `Deadline` list

### Changed

- upgraded Expo to version 49: https://blog.expo.dev/expo-sdk-49-c6d398cdf740
- updated react-navigation from version 5.x to version 6.x
- updated react-hook-form
- refactored rendering of index screens with separation of event records as the first step

### Fixed

- adjusted max screen width to fit the style accordingly to all phone sizes
- reduced authentication calls
- fixed a bug where adding a link to the event organizer would show the link instead of the description text
- fixed `DetailScreen` always refreshing bug
- fixed issue with not creating volunteer events

### Removed

- removed dates in the `Deadline` list
- removed hide button in map poi preview

## [v3.2.7]

This update has minor improvements

### Added

- navigation from multi button screen to all screens has been added
- html section added to show at the top of the survey list

## [v3.2.6]

This update enhances functionality with new features and resolves key bugs for a smoother user experience

### Added

- enabled subcategory listing on the index screen
- added a toggle for "Filter by Opening Times"
- introduced server-controlled query variables for events. Default limit is 15
- added a `useYear` flag for opening times, replacing the old 1970-hack

### Changed

- renamed `isVolunteer` prop to `isMultiImages`
- moved `errorTextGenerator` to `dataErrorMessageGenerator`
- added `IMAGE_SELECTOR_ERROR_TYPES` to `consts.js`
- added error handling and messages for image selection

### Fixed

- fixed an issue where the "Open Only" switcher was being duplicated
- fixed app crash on consul proposal screen by updating `expo-image-picker`
- fixed issues with multiline inputs overlapping

## [v3.2.5]

This update fixes some optimisation issues in the app and adds new features

### Added

- added the ability to click on whatsapp links in HTML pages on Android platform
- added a new alert to inform users after answering the survey
- added configurable zoom values for maps from main server

### Changed

- changed Polnish texts in the application
- upgraded `@sentry/react-native` to version 4.13.0 to 4.15.2
- upgraded `sentry-expo` to version 6.1.0 to 6.2.0
- added `expo-clipboard` package which is missing package to make Augmented Reality feature working
- changed the alert text that appears after users report a defect report

### Fixed

- optimised augmented reality feature for devices with less than 2gb RAM
- fixed the problem of consul inputs overlapping
- fixed a bug where images were repeated twice by TalkBack for Android
- configured `expo-updates` package to prevent crashes on android platform
- fixed the problem of POIs being open or not

## [v3.2.4]

This update includes some accessibility improvements and fixes some bugs in the waste calendar and event page

### Added

- added redirection from html page to whatsapp app in iOS version
- increased contrast of survey answers according to accessibility settings

### Changed

- added extra space between event calendar and list
- replaced accessibility labels with new text for better understanding

### Fixed

- improved a problem with the showing of series events
- fixed an issue where the autocomplete list on the waste calendar screen would not close in some cases
- fixed a bug that prevented the bbnavi feature from working

## [v3.2.3]

This update fixes some bugs and includes new features

### Added

- added automatic show of the list after pressing the street input in the waste calendar
- added scrolling feature to the waste calendar list
- added to list the events of the selected day under the event calendar
- added the feature to change the number of dots shown in the event calendar
- added the feature to darken the borders of inputs depending on accessibility features

### Changed

- upgraded Expo to version 48.0.15 to 48.0.18
- upgraded react-native version 0.71.7 to 0.71.8
- removed the requirement on some inputs of the form in `FeedbackScreen`

### Fixed

- fixed a problem that prevented links within the application from opening
- fixed the problem with the checkbox in `FeedbackScreen` appearing above the input

## [v3.2.2]

This update includes bug fixes for waste calendar notifications

### Fixed

- fixed a bug that prevented users from re-creating notifications for the waste calendar

## [v3.2.1]

This update includes new accessibility features and some bug fixes for android

### Added

- Updated inputs in `FeedbackScreen` and added accessibility features
- Added pause button to sliders
- Added contrast to `AZFilter` based on `isReduceTransparencyEnabled`
- Added contrast to inputs based on `isReduceTransparencyEnabled`
- Added contrast to `FeedbackFooter` based on `isReduceTransparencyEnabled`
- Added contrast to hourly weather section based on `isReduceTransparencyEnabled`

### Changed

- removed WrapperWithOrientation wrapper as it does not cause any change in appearance
- upgraded Expo to version 48.0.11 to 48.0.15
- upgraded react-native version 0.71.6 to 0.71.7

### Fixed

- Fixed app stuck in `SplashScreen` after new Android update
- Fixed issue with not activating notifications for Android 13

## [v3.2.0]

Three major new Expo SDK versions 46, 47 and 48 and updated new packages

### Changed

- upgraded Expo to version 46: https://blog.expo.dev/expo-sdk-46-c2a1655f63f7
- upgraded Expo to version 47: https://blog.expo.dev/expo-sdk-47-a0f6f5c038af
- upgraded Expo to version 48: https://blog.expo.dev/expo-sdk-48-ccb8302e231
- upgraded react-native-calendars to 1.1293.0
- upgraded react-native-gifted-chat to 2.0.1

### Fixed

- fixed an issue due to a recent update of the `react-native-calendar` package
- fixed a bug when the chat screen switches to landscape mode

## [v3.1.4]

New features for accessibility have been added in this update

### Added

- added `Reduce Transparency` feature in iOS accessibility settings to reduce transparency of switches within the app
- added `Reduce Transparency` feature in iOS accessibility settings to reduce transparency of version code

## [v3.1.3]

This update provides some performance improvements and fixes some bugs

### Added

- `react-native-render-html` package updated to latest version (6.3.4)
- `@native-html/table-plugin` package updated to latest version (5.3.1)
- `react-native elements` package updated to latest version (3.4.3)
- added `@native-html/iframe-plugin` package to use iframe feature separated from `react-native-render-html` package
- added new provider to be able to access accessibility features through the whole code
- added automatic street selection feature to `WasteCalendar` for locations with only one street
- added the ability to reduce the opacity of options for finished surveys
- added `footerText` and button that can be set via server to the bottom of POI list
- added `introText` and button that can be set via server to the top of the event list
- added location filter for event list

### Fixed

- fixed the ability to click on finished surveys with `RadioButton`
- fixed param error when navigating between two identically named navigation screens
- fixed json.parse error on application startup
- fixed an `ActivityIndicator` bug that sometimes appeared at the top of the image when loading the image
- fixed `VirtualisedLists` error caused by using `FlatList` in `ScrollView`
- fixed opening and closing times of POIs that were sometimes incorrectly shown
- fixed white areas on the edges of the screen on large screen devices

## [v3.1.2]

This update adds new accessibility features and the ability to select streets on the waste calendar screen

### Added

- added city and street selection feature for waste calendar
- added accessibility features to the clear or search buttons on inputs
- added accessibility feature to checkbox component
- added accessibility feature to filter

### Changed

- updated the accessibility feature in the dropdown to include the dropdown's label

### Fixed

- fixed notification switcher switching on and off issue

## [v3.1.1]

This update adds shadow feature for Augmented Reality, event calendar and accessibility improvements

### Added

- added changeable category list intro text from server
- added calendar feature to the event screen
- Augmented Reality
  - added shadow feature
  - added maximum height for modal
- Accessibility
  - added `accessibilityLabel` for weather icons
  - added accessibility features to the weather page

### Changed

- added `*` to the required fields required in the inputs of the defect report
- updated `react-native-snap-carousel` package
- updated `accessibilityLabel` property of bookmark button

### Fixed

- fixed the problem of not being able to click on the marker on the map
- fixed the issue where augmented reality models could not be viewed a second time
- removed the `groupPrice` feature that caused the application to crash on the `Android` platform
- fixed the problem that the radio button in the survey could not be clicked
- fixed application crashes in case of no data from the server
- fixed an issue where the app would crash when selecting the time on the event creation page for `Volunteer`
- fixed tab icons shifting to the right

## [v3.1.0] :rocket:

This release brings the first integrations of the Error Report, Due Date and action notifier and Noticeboard fields and customisable `ServiceTiles`

### Added

- added Defect Report feature
- added deadline and action notifier feature
- added noticeboard feature
- added redirect button to the website at the bottom of the event page
- added the ability to render multiple models in a scene for Augmented Reality feature
- customisable service tiles
  - the sorting of service tiles can be arranged
  - unwanted can be hidden from service tiles

### Changed

- some parts of the application have been resized
- changed the text `kostenlos` to an event with 0 EUR in the price card section
- audio file for Augmented Reality looped infinitely until user stops

### Fixed

- fixed a bug where `staticContent` was not an object

## [v3.0.5]

New volunteer features and design

### Added

- new icons for volunteer features
- volunteer button to send messages to group admins
- editing of volunteer profile, group and calendar data
- new volunteer home and personal screens based on static contents

### Changed

- adjusted volunteer forms according to new layouts

### Fixed

- data length check for vertical list

## [v3.0.4]

New features for `AugmentedReality` and minor bug fixes

### Added

- added a document explaining how to use the `AugmentedReality` feature
- added a description about the artwork to the `ArtworkDetail` page
- added props required for `ViroAmbientLight` from server

### Changed

- the ability to download one model for `AugmentedReality` has been updated to download multiple models
- updated `AugmentedReality`'s `physicalWidth` prop to come from `globalSettings`
- removed description of 3D model on full screen map page

### Fixed

- fixed an issue where the toggle activated after changing tabs on the `SettingsScreen` would not update
- fixed the problem of not displaying the size of the `AugmentedReality` model properly

## [v3.0.3]

Fix coords in location settings

### Fixed

- set `initialRegion` more explicitly to avoid undefineds
- extended setting coords in `getLocationMarker` because in global settings we are storing the short ones

## [v3.0.2]

Fix location request on map for iOS

### Fixed

- `showsUserLocation = false` was causing location requests in iOS even if location services where turned off entirely
- added check for global setting and setting the default value for that special prop

## [v3.0.1]

Minor improvements and bugfixes

### Added

- added image to `ServiceTiles` screen

### Changed

- get tour id for AR settings from global settings and removed hardcoded tour id

### Fixed

- added `lightboxProps` to the `MessageImage` component to remove the `useNativeDrive` warning when an image is opened in the `GiftedChat` component
- added `zIndex` prop to `Polyline` component in `Maps` to make polyline visible on Android devices

## [v3.0.0] :t-rex:

The third major version with new Expo SDK versions 44 & 45 and architecture on EAS, integration of augmented reality possibilities and updated volunteer features

## Breaking

Read about the new app architecture with EAS Builds here: https://blog.expo.dev/expo-managed-workflow-in-2021-d1c9b68aa10
The EAS docs can be found here: https://docs.expo.dev/eas

### Added

- added `expo-barcode-scanner` package to make barcode scanner work with new architecture
- added augmented reality possibilities with `@viro-community/react-viro` package: https://github.com/ViroCommunity/viro
  - iOS simulator builds are not running with viro package integrated
  - if apps do need viro for AR features, `"@viro-community/react-viro"` needs to be added individually in `app.json` from now on
    - for development purposes that is needed as well temporarily
- added chat per `react-native-gifted-chat` for volunteer area: https://github.com/FaridSafi/react-native-gifted-chat
- added new water temperature widget, that can be configured
- integrated `react-native-maps` instead of `react-native-webview-leaflet` in every component we use maps: https://github.com/react-native-maps/react-native-maps
  - `config.googleMaps.apiKey` needs to be changed in `app.json` individually for app builds

### Changed

- upgraded Expo to version 44: https://blog.expo.dev/expo-sdk-44-4c4b8306584a
- upgraded Expo to version 45: https://blog.expo.dev/expo-sdk-45-f4e332954a68
- changed android to use `hermes` because of problems running jsc
  - refactored color helper `parseColorToHex` because hermes does not support named capture groups
- put all used icons from several places to `configs/Icons.tsx`
- moved configs from secrets to global settings
  - for more flexibility in setup processes, configs should be editable without app builds
- changed multi button text rendering component to a html view in order to put styles and images on the screen above buttons
- changed deprecated `expo/metro-config` in metro config to `@expo/metro-config`

### Fixed

- solved error with `react-native-autocomplete-input` package
  - changed props of the package due to version upgrade have been reorganized
- fixed `canOpenURL` bug with `expo-linking` that prevented links from opening on android
- fixed the error of displaying empty sections on `CrossData` page

### Removed

- removed some secrets in the secrets template as well, as they are received through global settings from now on

## [v2.6.1]

New option for bigger service tiles and bugfixes

### Added

- added option for big tiles with an image `tile` that is styled bigger (orientation aware) and with less spacings to each other in the grid
  - added option for `accessibilityLabel` in order has `tile`-image has text on it and no separate title rendered
- added rendering of version number if there is no data for "homeAbout", which resulted to a missing version number in latest version, as it was moved to section list footer, that was only rendered if there are list entries

### Changed

- refactored service tiles to reduce duplication
  - created new `ServiceTile` that combine duplicated code for `Service` and `ServiceTiles` with condition for coloring based on `hasDiagonalGradientBackground`
- removed `Send` icon as we used `Mail` in other places and want to have the same icon everywhere
  - also `Mail` is svg and does not depend on a font icon set so there are no changes necessary across different cities
- adjusted colors
  - changed `lightestText` to `surface` where it was used for background, as both are white, but one for texts and the other for surfaces
  - removed `lighterText` as it was rarely used and gray, so `gray60` could be used
  - changed `secondary` to `primary` for bus bb link icons to always have the same color for the icon and the text
  - properly set error color for form validations of inputs

### Fixed

- fixed initialization and access of global settings in some particular situations
  - added fallback to `initialGlobalSettings` on setting up the global settings to ensure a valid value also if there was nothing stored locally before or accessing failed somehow
  - fixed error: `[Unhandled promise rejection: TypeError: null is not an object (evaluating 'globalSettings.settings')]`

## [v2.6.0] :rocket:

This version brings fist integrations of volunteer and consul areas.

### Added

- integration of HumHub as new optional volunteer feature including user accounts, groups, chats, events, ...
  - extended and used the HumHub API functionalities to fit our needs for a seamless integration
    - check this repo for more infos: https://github.com/ikuseiGmbH/smart-village-app-humhub-ext
  - this is a first version containing a lot of features that will be expanded and optimized in upcoming releases
- integration of Consul as new optional consul feature including user accounts, debates, proposals, polls, ...
  - updated and used GraphQL API of https://github.com/consul/consul
  - this is a first version containing a lot of features that will be expanded and optimized in upcoming releases
- added an option to the settings screen so that users can see the intro of the app again

### Changed

- migrated Teleport API from v3 to v4 that is used for BUS-BB

### Fixed

- fixed waste reminder notification times for summer time
- fixed Matomo setup with adding check for existence of mandatory values for initialization of an instance
  - there was a warning otherwise which caused an annoying warning message on the screen with every app reload in development

## [v2.5.4]

Set app language to German and bugfixes

### Added

- added setting for feedback footer to be able to prevent it from rendering on several screens

### Fixed

- set default app language to German to also satisfy iOS AppStore shown language
- removed rendering of BUS-BB teaser section
- fixed sorting of one BUS-BB section caused by typo
- avoided rendering of intro text in header for sub category lists
- added missing location param when navigating from categories list into points of interests or tours

## [v2.5.3]

Minor improvements and bugfixes

### Added

- added list screens for nested categories
- added param for categories query to exclude specific ids
- added new empty message component

### Changed

- inserted zero width space after dashes to improve the Android line break behaviour
- reduced accuracy for location access on iOS

### Fixed

- fixed repeated location permission request on app start
- fixed logics for setting error in `useStaticContent` hook

## [v2.5.2]

Minor improvements and bugfixes

### Changed

- OParl file access and download urls are now opened externally instead of only being able to be copied

### Fixed

- date parsing for midnight (date was calculated using GMT)
- improved image behavior when loading of an image via url image failed

## [v2.5.1]

Nested services

### Added

- added a generic TilesScreen that recieves necessary info through route params
  - this makes it possible to nest a TilesScreen into any route

### Fixed

- fixed timezone for waste calendar
- fixed crash that could happen with static json content emptiness

## [v2.5.0] :rocket:

Versioned static contents and further improvements.

## Breaking

Read anything about the new app architecture

This mobile app version needs an updated version of the main server (Februar 17th).

### Added

- refactored all places where we use static contents to use the `useStaticContent` hook
- added app.json version to `queryVariables` used in the `useStaticContent` hook
- added app.json version to `queryVariables` of the `globalSettings` query in `src/index.js`
- added new provider for permanent dataprovider filtering
- added new settings section for dataprovider filtering
- added feedback footer to detail screen
  - added route info to send feedback info
- added filter for points of interests by location
- added option for multiple category ids for points of interest

### Changed

- return of public json contents from servers can now be considered as proper json format
  and not string anymore, that needs to be parsed
- adjusted queries to respect the data provider filters
- adjusted `HomeSection` to allow for a placeholder component
- removed `big` prop for `BoldText`
  - the `big` definition is already existing for `RegularText` thus was a duplication
- set the text color for the date picker of waste reminder to satisfy dark modes

### Fixed

- fixed app intro content below status bar

## [v2.4.2]

Dependencies and bugfixes.

### Changed

- updated a couple of dependencies under the hood
- moved sentry secrets from global secrets to namespaced secrets to more easily allow for individual instances

### Fixed

- changed to a new fork of react-native-webview-leaflet to fix android crashes

## [v2.4.1]

Integration of Sentry and fixes.

### Added

- added `sentry-expo` to the project
- added new multi button screen
- integrated new GraphQL endpoint for bb-bus

### Changed

- unified top filter elements (those that simulate multiple tabs, e.g. within a POI category to switch between the location overview and the list)
- category screen can now filter the categories by id

### Fixed

- media library permission bug due to image component
- location overview no longer ignores the filtering by opening times

## [v2.4.0] :rocket:

Updated survey feature.

### Changed

- the following features are now possible for each survey individually through the cms
  - can now be in a single language
  - can now have the option of selecting multiple answers
  - survey information can now contain html
  - the comment section can now be disabled

## [v2.3.0] :rocket:

Overhauled app settings. Introduced onboarding/app intro.

### Added

- app intro
  - added new app intro screen
  - added new onboarding manager
  - the onboarding manager will render either the navigator or the app intro depending on the completion state of the app intro
- added a new NestedInfo screen to display lists of navigation links beneath a html content
  - this allows for an easy implementation of a nested information structure for e.g. help sections
- added option to filter POIs by opening times/open status

### Changed

- upgraded Expo to version 43: https://blog.expo.dev/expo-sdk-43-aa9b3c7d5541
- settings
  - the settings moved from inside of favourites to the drawer and the about screen
  - settings now have multiple tabs: one for general settings and one for visual settings
  - location settings now allow setting an alternate position that is used when the locations services are turned off
- improved useStaticContent hook
- refactored About/AboutScreen to reduce code redundancy
- there can now be a notice for set for data providers, which will be displayed for e.g. POIs that they are providing

## [v2.2.0] :rocket:

This version brings the new encounter feature.

### Added

- users can now register for the encounter feature
  - afterwards they can scan the qr code of other registered users to create a digital handshake
- added a new `useStaticContent` hook to simplify queries for static contents
  - this should be reused and refined further accross the codebase in the future

### Changed

- bb-bus data will now remain completely cached once it has been fetched.
  - the bb-bus data is currently not being updated on the servers
- minor text adjustments for route planner

## [v2.1.3]

Added usage of location services.

### Added

- added location services
  - added corresponding global setting "locationService"
  - added new option in the settings screen
  - when enabled the POIs will be sorted by distance to the current position
  - when enabled the own location will be added to the location overview map
- added bb-navi link to POIs
  - when location services are enabled, the current (or last known) position will be used as the starting location
- added handling of geolocation to maplinks when pressing on the address of for example a POI
  - the geolocation will be prioritized for the pin location if present

### Changed

- event index is now sectioned by date
  - restructured code structure regarding lists
  - split lists according to layout rather than the renderItem function (e.g. HorizontalList, VerticalList (now) <-> TextList, CardList (previous))
- improved structure of screenOptions
  - instead of having multiple functions, there is now one function that takes options
  - this is more easily expandable and maintainable

### Fixed

- when having a specific home news category also referenced in the drawer, there is now the possibility to highlight the correct root route based on the category

## [v2.1.2]

Minor fixes and package updates under the hood

### Added

- filter commercials by date
- improved sub queries for html screens
  - added the possibility to pass in a params object instead of only a webUrl
- added more device infos to tracking for matomo
- added usage of construction sites from generic item

### Fixed

- added order to event widget query, which was missing to be the same as in the events index screen
- passed query limit to data list section props, which before always rendered 3, instead of more if
  requested
- fixed Android notification channel color
  - added color parsing for the Android notification channel color to result always in hex format
- fixed wrong default for poiId for lunches
  - during the react navigation upgrade a wrong default was added, resulting in wrong filtering
    behavior
- fixed require cycle in navigation config
- fixed survey widget icon being too big

## [v2.1.1]

New widgets and updates on surveys

### Added

- new widgets for construction sites as news items and surveys

### Fixed

- survey answer options were not properly displayed in both languages
- other minor fixes

## [v2.1.0] :rocket:

This minor version upgrade introduces the survey feature.

### Added

- added screens for survey
- survey feature has been implemented with german and polish texts

## [v2.0.2]

Centralized icons and fonts. Fixed drawer layout for android devices.

### Changed

- Added a centralized point for icons, to allow for easy switching of icons
- Specific names for used fonts are now removed from the components
  - Instead only generic names describing the font weight and style are being used
  - This allows for more easy switching of fonts

## [v2.0.1]

Minor changes after navigation rework.

### Changed

- removed navigation config related entries from global settings
- reworked drawer component title to better respect screen insets on new devices

## [v2.0.0] :t-rex:

The second major version with configs for navigation and Expo SDK update to 42.0.0

- Read about that step in: https://blog.expo.io/expo-sdk-42-579aee2348b6

## [v1.8.1]

Fix header left showing on initial screens

### Fixed

- the back navigation header is currently shown on initial tab screens,
  even if there is no option to navigate back
  - this change resolves that issue

## [v1.8.0] :rocket:

The eighth minor version upgrade includes the Expo update 41, an update from react navigation
version 3 to 5 and several minor fixes and dependency updates.

- Read about the Expo update step in: https://dev.to/expo/expo-sdk-41-1f2j

## [v1.7.2]

Updated OParl screens. Added waste calendar export.

### Added

- added export functionality for waste calendar

### Changed

- removed search functionality from oparl for now, as the used oparl systems do not provide keywords
  - added organizations screen reachable through oparl overview screen instead

## [v1.7.1]

Added pagination to person list on the `OParlPeopleScreen`

### Changed

- reworked `OParlPeopleScreen` to use a flatlist with pagination
- improved query for fetching organization list for the dropdown

## [v1.7.0] :rocket:

The seventh minor version upgrade introduces the possibility to browse
[OParl data](https://dev.oparl.org/spezifikation/) provided by the
[sva-apollo-server](https://github.com/ikuseiGmbH/sva-apollo-server).

### Added

- added screens for OParl
  - Overview, People, Calendar, Search and Detail screens
  - can handle OParl versions 1.0 and 1.1
- added custom hook with independent apollo client for OParl queries

### Changed

- extracted reusable parts of the calendar component from the `WasteCollectionScreen`

## [v1.6.3]

Replace provider name with logo

### Changed

- added dataprovider logo to generic item query
- updated offer to use SectionHeader component

## [v1.6.2]

Refactorings and bugfixes

### Changed

- bump ini from 1.3.5 to 1.3.8
- bump y18n from 4.0.0 to 4.0.1

### Fixed

- corrected context for matomo tracking
- corrected displaying of up to date image in image slider with interval

## [v1.6.1]

Waste collection with reminders and fix for push

### Added

- added waste reminder settings with its own screen and elements
  - added rest api calls for reminder settings
  - new keys for secrets are required! see #208
- added jobs and ads to cross data screen of data provider

### Changed

- increased marking dot size in waste collection calendar to 6 (was 4)

### Fixed

- added missing optional chaining for details on detail screen
  - this caused a crash with push notifications as details are null
- nested message and imagerights to be inside of the image
  - this way the absolute positioning is with respect to the image itself
  - previously it was with respect to the container (which was wider in landscape)

## [v1.6.0] :rocket:

The sixth minor version upgrade adds more screens for specific data like jobs, ads and
waste collections

### Added

- added screens for jobs and ads data (generic items)
  - added new common component for jobs and ads `Offer`
  - added bookmark logic for generic items
- added `DataProviderScreen` for business accounts with all data of all corresponding
  data types ("cross data")
  - using new `CrossDataSection` to render the similar sections
  - introduced reusable `DataListSection` to reduce code duplications
- added `WasteCollectionScreen` for local waste collection with calendar (react-native-calendars)
- added enabling/disabling push notifications through server settings

### Changed

- added `useNewsCategories` to separate logics that can be used in several components
- better default zoom for map views
  - added placeholder on overview if no marker is selected

## [v1.5.7]

Fixes and adjustments

### Changed

- hide address entry if the string is empty

### Fixed

- corrected position of dropdown modal in landscape mode

### Removed

- removed unnecessary prop `noSubtitle` used for a `Text` component in `TextListItem`

## [v1.5.6]

Refresh interval for images

### Added

- added refresh interval for images to be able to control the cache behavior
- added pull to refresh for weather screen
- added useHomeRefresh to remaining components

### Changed

- extracted image parsing from media contents and the display of images from news items,
  points of interest, tours and event records to `ImageSection`
- extracted story section from `NewsItem` and used new `MediaSection` as well as the overall
  extracted `ImageSection`
- addresses are no longer clickable if not at least either the city, street or zip of it are present

### Fixed

- fixed error in the logic to handle the "display only summary" setting, that caused the body to
  not show under certain circumstances

## [v1.5.5]

Lunch widget and different optimizations

### Added

- added lunch widget and corresponding screen
  - added left and right navigation for date header
  - added hourly refresh times to both the widget and the screen
- added option to customize widget texts serversided
- added logo to points of interest
  - the logo of the data provider is now visible on points of interest in the same way
    as it is for tours
- added reusable header left component to reduce duplication

### Changed

- refactored the homescreen to reduce code redundancy
  - added `useHomeRefresh` hook to add to components that have internal functions that need to
    be called when the pull-to-refresh is triggered
  - added `useHomeRefresh` hook to widgets and new `HomeSection` component that was the result of
    the refactoring
- refactored HomeCarousel
  - removed specifics to homeScreen from component
  - used it on lunch screen as well
- refactored widgets to use a DefaultWidget component
- exchanged widget touchable with touchable opacity
  - with no padding horizontally the touch shadow looked wrong on Android
- do not show a filter when there is just one entry on list/index screens

### Fixed

- added parsing for number encoded character to custom text component
  - replaced all other text components with custom component
- fixed crashing on empty string for image copyrights
  - the empty string is evaluated to false
    - this caused it to be tried to to be rendered (outside of text component)
- removed `paddingVertical` from icons in header to fix cut icons in some cases
  - paddingVertical was apparently unnecessary and created a bug
  - without it the bug does not occur and there is no break in all other devices
  - added a new prop `hitSlop` which defines how far a touch event can start away from the view
    resulting in a "smooth touch" experience

## [v1.5.4]

Time and day dependent slider elements and smaller adjustments

### Added

- added time control for images carousel items
- added rendering of an items message onto an image in the images carousel
- added Form to AppStackNavigator to be able to navigate to the form screen with drawer mode apps
- added a notice at the bottom of TMB contents
- added missing `refreshing` prop from home screen to force refetch of data

### Changed

- created a method to merge all available web urls to render in `InfoCard` for events,
  points of interest and tours
  - added a check for descriptions starting with "url" because we do not want to present web urls
    behind an "url" or "urlInformation" or "urlVideo" or "urlVideoPreview"
    - in that case, we render the just the `url` instead of the `description`
- switched the sections for the list on the category list screen, to have points of interest
  first and tours last
- renamed every "Touren und/oder Orte" to "Orte und/oder Touren" because we show them in that order
  on the category screen now
- optimized code for carousel items

## [v1.5.3]

Fixes for Image renderings and safe-area-insets concerning new devices

### Fixed

- with updated react-native-elements image component the `alignSelf` was missing in some cases
  - this needs to be a `containerStyle` with the newer version
- adjusted every usage of `Image`
- the map also needed adjustments concerning height & width
- we could simplify the logic for correct image width with using the min value of dimensions
  height and width
  - this made it possible to get rid of `orientation` and `dimensions` props in several components
    without changing render results
  - this also made it possible to get rid of `OrientationContext` in some components
- added missing `width` in `CardListItem` because with latest update of RNE Image
  component we need to set width and height
- forcefully upgraded react-native-safe-area-view to support iPhone 12
  - https://www.npmjs.com/package/react-native-safe-area-view (2.0.0)

## [v1.5.2]

Integrate BUS-BB parts

### Added

- added code base with several components for BUS-BB module
  - the `areaId` for a city for BUS-BB data needs to be added to the local secrets file

## [v1.5.1]

Customizable image aspect ratios and upgrade react-native-elements

### Added

- added global settings for `imageAspectRatio` and `homeCarousel.imageAspectRatio` to be able to
  vary image aspect ratios across the app

### Fixed

- fixed image loading spinner on Android with upgrading react-native-elements
  - problem: https://github.com/react-native-elements/react-native-elements/issues/2000
  - latest v1 is 1.2.7: https://github.com/react-native-elements/react-native-elements/blob/next/CHANGELOG.md#v127
  - when updating like this, we needed to make changes where using Image not all styles will be
    applied anymore, you need to change styles to props we had the need of moving `resizeMode` and
    `borderRadius` from inside of style prop to be props itself default for `resizeMode` was ` cover`` before in the code of react-native-elements, as it is the default for React Native  `Image`
    component https://reactnative.dev/docs/image#resizemode

## [v1.5.0] :rocket:

The fifth minor version upgrade comes with widgets on the home screen

### Added

- added ability to present certain information as widgets on the home screen after the carousel
  - there are three types of widgets implemented yet:
    1: weather - presents current temperature with an corresponding icon
    2: events - presents number of events that are taking place on the current day
    3: constructions - presents number of constructions that are existing currently
- added weather detail screen, which can be accessed through weather widget
- added constructions overview list and detail pages with further information, wich can be accessed
  through the constructions widget

### Changed

- left aligned header title on iOS
  - this is now necessary as we have 3 header right icons

### Fixed

- adjust wording for a11y button at bookmarks
- hide POI map in offline to prevent rendering a white rectangle

## [v1.4.5]

Implement bookmarks

### Added

- added functionality to bookmark several data from detail screens and view them all
  in a bookmark section that can be accessed from the home screen header per icon
  "bookmarks and settings"
  - the settings button is now accessible per icon "settings" inside there

### Fixed

- added try/catch for every `JSON.parse` of random public json content
  from main server, which can have format issues, to ensure that the
  app does not crash

## [v1.4.4]

Refactorings and bugfixes

### Added

- added params for navigation from push notification
  - now there is always a title for a detail screen and in a drawer a corresponding root route
    would be marked as bold as well
- added fetch policy for location overview query
  - so that we use caching here and do not fire a query while being offline either
- add checks for data and intro text for category list
  - added check for section data to return no section header if there is no data
  - added check for intro text to render no text and wrapper if there is no text

### Changed

- changed `.` instead of `?` in the label for the checkbox in the feedback form
- removed unnecessary offset option for points of interest in points of interest and tours query
  - this query is used in the home screen, where no fetch more is used so we do not need the offset
    option

## [v1.4.3]

Updated Expo SDK to 40.0.0

- Read about that step in: https://dev.to/expo/expo-sdk-40-is-now-available-1in0

## [v1.4.2]

Integration of a map for points of interests

### Added

- added open street maps for points of interests index
  - added osm via react-native-webview-leaflet, own fork to align webview versions
- added a map also on the detail screen of a point of interest

### Changed

- refactored list components
  - extracted parsing logic from `IndexScreen` and `HomeScreen`
  - added `ListComponent` to handle selection by settings and query type
  - replaced `getComponent` structure in `IndexScreen` by `ListComponent`
  - replaced `getListComponent` structure in `HomeScreen` by `ListComponent`
- refactored refresh time intervals to an own hook

## [v1.4.1]

Optimization for image component, startup logics and share icon

### Added

- added different share icon for iOS

### Fixed

- fixed re-render logic for `Image`
- corrected logics on startup for brand new apps
- avoided matomo alert on startup if matomo is disabled

## [v1.4.0] :rocket:

The fourth minor version upgrade comes with push notifications, Matomo analytics and list type
settings

### Added

- there is a new settings area that can be reached from the home screen
  - contains settings for push notifications, can contain setting for Matomo analytics (
    depends on server setting) and provides the ability to change list layouts for the three
    different data types (`newsItems`, `eventRecords` and `pointsOfInteresAndTours`)
- with push notifications activated, users can receive push notifications triggered by the server
  - the registration and usage is setup with Expo, https://docs.expo.io/push-notifications/overview
- Matomo analytics can be included to track screen views across the app for helping
  Smart Village App operators to get to know the usage behaviors of the users
- with different list types, users can customize their Smart Village App and change list views
  to their own preference

## [v1.3.5]

Updates considering categories

### Added

- added ability to have different sections for news items for various categories
  on the home screen
- added category filter on index screen for event records

## [v1.3.4]

Fix displaying appointments in events

### Fixed

- corrected line height of `Text` component with `small` prop set

## [v1.3.3]

Updated Expo SDK to 39.0.3

- Read about that step in: https://dev.to/expo/expo-sdk-39-is-now-available-1lm8

## [v1.3.2]

Made a big step on accessibility

### Added

- added accessibility labels across the app
- most important elements are now accessible across the app

## [v1.3.1]

Update sizing for `ServiceBox`es on orientation change

### Added

- added conditions for landscape mode and based on dimensions with re-rendering
  on orientation change

## [v1.3.0] :rocket:

This is the third minor version upgrade - with further improvements for user experience!

Landscape mode and tablet optimizations

### Added

- users can use the app in landscape mode
  - we updated every screen and component behavior in order to recognize and react on
    orientation changes
- on tablets, contents are displayed in a more compact way so that users can better read and
  capture everything

## [v1.2.4]

Refactorings and bugfixes

### Changed

- added check for `isConnected` before calling `refetch` method when using pull to refresh
  - if offline, refetch cannot be fulfilled and should not be triggered
- removed `NetworkContext` in `HomeScreen` to eliminate the behavior of reloading the whole
  app container when network connectivity changes
  - changed usage to get network information to `NetInfo.fetch()`, which get called in a loop
    until main server reachability is set

### Refactored

- for the refactorings, please have a look at the
  [commits and their messages](https://github.com/ikuseiGmbH/smart-village-app-app/compare/v1.2.3...v1.2.4)
  for this version

### Fixed

- removed the condition for `queryVariables` in ÌndexScreen` to ensure, that the cache can
  return data when going offline
  - if online and offline has different `queryVariables`, they also have different cache values
    and the offline data would be always undefined, because data is only fetched and cached when
    online

## [v1.2.3]

Add pull to refresh and processing of a new `buttons` key in `subQuery`

### Added

- pull to refresh in every screen to refetch data manually without respecting the
  refresh time logic
  - the solution is a combination of https://reactnative.dev/docs/refreshcontrol
    with https://www.apollographql.com/docs/react/v2.6/data/queries/#refetching
- there can be new data in `subQuery` at a `buttons` key with an array
  of objects, that contain information about navigations to web links
  to be presented as multiple buttons on the screen

## [v1.2.2]

Updated Expo SDK to 38.0.0 and bumped different packages to be more up to date

- Read about that step in: https://dev.to/expo/expo-sdk-38-is-now-available-5aa0

## [v1.2.1]

Implement filter for news in `IndexScreen`

### Added

- added a list header component for the list on the index screen for having a dropdown
  with data providers to filter the news
  - the news filter is optional and can be de-/activated per global settings

### Changed

- updated `IndexScreen` to functional component with using hooks

## [v1.2.0] :rocket:

This is the second minor version upgrade - with improvements for user experience!

Offline usage, refresh intervals and pagination

### Added

- added pagination for lists of all news and events
  - this increases the response time og the index screens a lot
- added logic for fetch policy and re-fetching data in intervals
  - we do not need every data always fresh from the server
  - most data is up to date for at least a day
  - added refresh intervals for different content types to decide whether to request
    new data or rely on the cache
- added more texts to global settings, which can be edited on the main server

### Changed

- smarter usage of network status
  - added `NetInfo.configure` to setup the mainserver as endpoint for availability check of
    network connection, instead of using the default https://clients3.google.com/generate_204
    - see: https://github.com/react-native-community/react-native-netinfo#netinfoconfiguration
    - if the mainserver is down, `isInternetReachable` gets false now and we can react to
      that information
      - the `graphqlFetchPolicy` depends now also on the information of the uptime of the mainserver
      - if the mainserver is down, the app needs to use cached date
  - added `isMainserverUp` to the NetworkContext, which will be available next to `isConnected`
    across the app
    - added `isMainserverUp` in addition to `isConnected` in every component that uses
      the `graphqlFetchPolicy`-helper to determine the fetch policy depending on the network state

## [v1.1.4]

Copyright for images, open all links in the app and variable headlines

### Added

- added component to render copyright texts over `Image`s
- added functionality to open all links in internal web view instead of in the external browser app
- added variable titles for sections
  - can be set on the main server
  - headline texts for news, points of interests and tours, events
  - headline texts for service, company, about
- added logic on network error while `auth()` on app start to retry the authentication with
  a forced fresh token request

### Fixed

- added two missing `colors` imports for `ActivityIndicator`s

## [v1.1.3]

Specific changes for header title, status bar and upcoming events

### Added

- set explicit colors for Android status bar while splash screen is visible
  - the configuration in app.json needs to be done for every individual branch

### Changed

- updated header titles for detail screens and web views
  - they reflect the type of the content in singular now
- renamed prop `link` to `primary` in Text component

### Removed

- removed js logics for upcoming events, as they are queried directly from the server

## [v1.1.2]

Updated Expo SDK to 37.0.0 and bumped different packages to be more up to date

- Read about that step in: https://blog.expo.io/expo-sdk-37-is-now-available-dd5770f066a6

## [v1.1.1]

Updated Expo SDK to 36.0.0 and bumped different packages to be more up to date

- Read about that step in: https://blog.expo.io/expo-sdk-36-is-now-available-b91897b437fe

## [v1.1.0] :rocket:

This is the first minor version upgrade - great!

Implement global settings for optional navigator

### Added

- the app can listen to server side configurations as global settings
- the first optional setting is the way of navigation for the app
  - drawer (default and fallback)
  - tabs

## [v1.0.13]

Do not show bottom divider for last event record on home screen

### Fixed

- corrected condition for `bottomDivider`

## [v1.0.12]

Updated Expo SDK to 35.0.0 and bumped different packages to be more up to date

- Read about that step in: https://blog.expo.io/expo-sdk-35-is-now-available-beee0dfafbf4

## [v1.0.11]

Add constants and conditions for rendering sections on HomeScreen

### Added

- added fix boolean constants that decides rendering of the main sections on the HomeScreen
  - default: true
- later there can be more logic around that, with setting the constants dynamically from queries
  for example

## [v1.0.10]

Add check for validity of access token

### Added

- added a method for checking the validity of the access token with the expire date, so that new
  tokens will be requested only if the old one has expired
- added call of auth method on did mount of HomeScreen, which was missing in this component
- added error catching on first query, which results in empty screens instead of endless loading
  indicator

## [v1.0.9]

Add possibility to navigate from ImageCarousel by pressing an image

### Added

- added Query inside of an item of the carousel, if there should be a navigation to
  a detail screen, as we need additional data for that case

## [v1.0.8]

Updated Expo SDK to 34.0.0 and bumped different packages to be more up to date

- Read about that step in: https://blog.expo.io/expo-sdk-34-is-now-available-4f7825239319

## [v1.0.7]

Add namespace to secrets for multiple domains

### Added

- added access to secrets per namespace
  - namespace is used form slug given in app.json

## [v1.0.6]

Add color variable in price card

### Added

- added a color variable for maintainability
  - used the darker parimary color with opacity
- changed hardcoded color to new variable in PriceCard

## [v1.0.5]

Add ability to restrict news according to settings

### Added

- added logics to display only intro and a button if settings say
  - button links to the source url
  - otherwise still render the body content
- added opening of the source of news in a WebView instead of linking external

## [v1.0.4]

Optimize news screen

### Added

- added iterative rendering of content blocks and media contents for news
- added rendering of audio and video as html contents (iframe) in a WebView

## [v1.0.3]

Update detail screens

### Added

- added showing first names of contacts in detail screens if present
- added showing link titles of urls in detail screens if present

## [v1.0.2]

Update performance of lists

### Changed

- refactored the `renderItem` methods of TextList, CardList and CategoryList to their
  own \*Item PureComponent
  - this is given as advice best practice for better performance
  - in local tests the responsivness of the lists increased
- removed `removeClippedSubviews` from lists because it can behave buggy:
  https://facebook.github.io/react-native/docs/flatlist#removeclippedsubviews
- added conditional rendering of CardList
- if it is a horizontal CardList we do not need a `ListFooterComponent` and the `onEndReached` logic
- on the other hand, if it is not a horizontal CardList we do not need
  `showsHorizontalScrollIndicator` and `horizontal` props

### Fixed

- fixed check for weekday in OpeningTimesCard
  - with casting to boolean we will be more safe on checking for presence of weekday data
  - otherwise an empty string would be tried to render which results in app crash
- fixed warnings for 'Require cycle:' with correcting imports
- fixed Android 9 lag bug with images carousel
  - removed images from app
  - query for images from the main server
  - with this the urls are web urls instead of in-app images which seems to work smoothly

## [v1.0.1]

Small update for tours, points of interest and news

### Added

- added location addition to address in tours and points of interest

### Fixed

- fixed title in news, which accidentally disappeared after refactoring

## [v1.0.0] :rocket: :100:

Finalize the app with new feature and fixes

### Added

- added screen for categories selection to navigate to certain points of interest and tours
  - added CategoryList based on TextList but with sections and an intro text
  - added categories query
  - added option for category filter in tours and pointsOfInterest queries
  - updated query for all tours and points of interest on HomeScreen
  - renamed every "Orte und Touren" to "Touren und Orte" because we
    show them in that order on the category screen
    - there are less tours, and showing the points of interest first would
      fill the whole screen, so one can only reach and see tours on scrolling
  - exchanged `pointsOfInterestAndTours` case on IndexScreen with `categories`
    - we have now real categories data to deal with easier
  - render the count of points of interest or tours in CategoryList behind the category name
  - added a `key` for navigation in CategoryList, because it is still an Index route but we
    want to push it anyway with animation instead of only changing screen content, what
    would happen with same routeName and same implicit key
  - added a condition to not show a bottom divider after last tour because it would
    add an ugly line before the "Orte" section header
- added image carousel on home screen and in detail screen if there are more than one image
- added NewsItem and refactor it out of DetailScreen
- added bottom margin for Buttons for better visual sectioning

### Changed

- improved offline usability
  - use finally promise method to ensure triggering of callback
  - in <MainAppWithApolloProvider /> we setup the apollo client regardless of the network
    connection right now...so if the app is offline, our fetch will fail and the callback is
    never fired
    - this led to a never running app when opening it offline
    - hope this fix makes the app also start up without network connection
- show address addition in event record subtitle and share message instead of city
- wrapped NetworkProvider around the whole app
  - this makes it possible to handle network changes inside of `<MainAppWithApolloProvider />`
- updated horizontal CardList with shortening the titles
  - if more than 60 characters, we trim and add '...'
  - so we always have a maximum of two lines there

### Fixed

- added prefetched data for event records from list screens to details
- fixed strange behaviour with broken layouts on first opening of a detail screen
  - it seems like this was a result of badly used `flex: 1` in different components
  - removed `flex: 1`s
  - merged wrapper
  - deleted superfluous wrapper
- get rid of FlatList inside of ScrollView, which is bad practice
  - removed wrapping ScrollView in IndexScreen
  - removed hacky `scrollEnabled={false}` in TextList
- fixed sizes of images and iframe in HTML renderer
  - thx to https://github.com/archriss/react-native-render-html/issues/86
    and https://github.com/archriss/react-native-render-html/issues/134
  - we need to ignore and remove the given width and heights in the html to let the magic happen
  - added height for iframe in html styles because otherwise it has not the right format

### Removed

- old and unused files and images

## [v0.9.5]

Fix and update share messages + subtitle

### Changed

- updated contents of share messages
  - we cannot use the description for pois and tours anymore, because they are HTML
    and not plain text
- updated subtitles of event records to city location instead of provider name

### Fixed

- fixed query parameter in IndexScreen for share messages
  - needs to be singular for a certain item and not the `query` variable available,
    because that is plural

## [v0.9.4]

Add tours to list of points of interest and create tour detail screens

### Added

- added a new logic in order display tour and point of interest in the same list
- added queries for tours
- added combined query for points of interest and tours to present them both in the same list
- added detail screen for tours with a special tour section
  - render only addresses with kind `start` and `end` in this TourCard
- added query for kind in all addresses queries
- added logic for `open` for openingHours of points of interest
  - need to have that (somehow strange) check for `(open === undefined || open === true)`,
    because we use this component for PointOfInterest and EventRecord but event records
    have no `open` data

### Changed

- updated lists of points of interest and tours to be ordered alphabetically on index screen
- list 10 points of interest and 10 tours randomly shuffled on the home screen
- render only addresses with kind `default` in InfoCard

### Fixed

- fixed rendering of opening times and event dates when there is time, date AND description
  - the layout was broken so now we render the description in an extra row below the time and date

## [v0.9.3]

Show only upcoming events

### Added

- added check for upcoming event based on the `listDate` of a event record
- used `moment` helper for determining, if an event is in the past
- used lodash `filter` to filter data and reject past events on HomeScreen and IndexScreen
  - still render only the next 3 events on the HomeScreen
  - used lodash `take` for it

### Changed

- now we request always all events and filter afterwards
  - this could lead to worse performance than before

## [v0.9.2]

Update to latest server changes

### Added

- added version number to the bottom of the HomeScreen

### Changed

- changed `prices` to `priceInformations` for points of interest
- sort event records on `listDate`
- render `listDate` in event record teasers on index screens

## [v0.9.1]

Update event record detail screens

### Fixed

- using ScrollView instead of ScrollWrapper in EventRecord to get rid
  of strange layout spacings on first render

### Added

- added more detail data to event detail screen
- added different titles for event dates and organizer
- added smaller adjustments to queries

### Changed

- created EventRecord and updated rendering without useEffect
  - we can directly render the data

## [v0.9.0]

Performance optimizations and fixes

### Fixed

- fixed app not loading offline with explicitly handling fetch policies according to online/offline
  network status
- fixed sharing content for points of interest
- more smaller fixes

### Added

- added image caching based on https://github.com/wcandillon/react-native-expo-image-cache
- added a ActivityIndicator logic to CardList and TextList to indicate
  loading/processing while scrolling

### Changed

- updated packages
- refactored code for performance optimizations
- adjusted headerTitleStyle for iOS a bit larger

## [v0.8.6]

Fixes for upcoming release

### Fixed

- fixed bug with missing source url for news item which crashed the app

### Removed

- removed momentFormat for times
  - timeFrom and timeTo are already formatted in the data so we can directly render them
- removed showing `Geschlossen`
  - the data from the server are not ready yet to be used
- removed divider from last opening time

## [v0.8.5]

Update point of interest detail screens

### Added

- added info about operating company

### Changed

- wrapped with a SafeAreaView
- updated presentation of opening times

### Fixed

- fixed issue with long street names
  - added a line break

## [v0.8.4]

Update layouts in list screens and header title

### Added

- added Button with linear gradient on HomeScreen after teaser lists

### Changed

- updated all lists to look the same
- updated spacings
- updated button style on HTML screens with action to web view
- updated screen header title to bold for iOS devices

## [v0.8.3]

Update layouts on detail screens

### Added

- added correct price formating in point of interest screen
- added linking for address to native maps app and phone number in point of interest screen

### Changed

- updated title layouts in news and events
  - titles look like the same now all over the app

## [v0.8.2]

Update home screen with different area for service and about

### Added

- added new are for service boxes
  - now we have services and about pages separately

### Fixed

- fixed bug with navigating to Home screen from Drawer
  - screen was pushed instead of navigating to the existing one in the stack because of
    different keys

## [v0.8.1]

Updates on several screens and small bugfixes

### Added

- wrapped every screen with a SafeAreaView
- added missing package for react-native-webview
  - `expo install react-native-webview`

### Changed

- updated InfoCard with contact and category
- changed link in app from share message to source with app name
  - `Quelle: ${app name}`
- updated width for CardList content container
  - not only the image should be 70% of the screen in horizontal appearance but also
    the corresponding text
- renamed `Orte & Routen` to `Orte und Touren`
- updated navigation title for home screen in Drawer

### Fixed

- fixed bug in navigation from drawer inside html screens
  - added key to have unique references for screens, otherwise there was a
    bug navigating from Drawer, that was not rendering a fresh screen
    everytime because the reference did not change

## [v0.8.0]

Update Expo SDK from 32.0.0 to 33.0.0

Steps done for upgrading the app:
https://blog.expo.io/expo-sdk-v33-0-0-is-now-available-52d1c99dfe4c#c0d2

## Breaking

Read anything about the new app architecture

You need to remove `node_modules` and install your packages again.s an updated version of the main server

`rm -rf node_modules/ && yarn cache clean && yarn`

#### Full changelog for Expo 33.0.0

https://github.com/expo/expo/blob/master/CHANGELOG.md#3300

#### Changelog for React Native 0.59

SDK 33 uses React Native 0.59.8, while SDK 32 uses React Native 0.57.1.
Most of the changes were bug fixes.
Here is the changelog from React Native: https://github.com/react-native-community/releases/blob/master/CHANGELOG.md

### Changed

- changed Expo packages from 'expo' to modularized expo packages,
  as the previous way of importing is deprecated now
- changed WebView from react-native to react-native-webview,
  as it is deprecated in react-native
  - this seems to also fix a bug with the size of the rendered page
    inside the WebView
- updated versions of React and React Navigation as stated in the changelog
- updated `resizeMode` in app.json as mentioned as breaking change
  in the changelog:
  - "The behavior that was previously called cover is now properly called
    contain and vice versa. You may need to switch this setting in your
    app.json."
- fixed import cycle in PriceCard

### Removed

- removed workaround for Android drawer edge gesture,
  as it now ships with updated react-native-gesture-handler
- removed `toUpperCase` because `textTransform uppercase` for Android is
  working now with updated React Native
- removed temporary script for enabling React hooks
  - with Expo SDK 33 a new version of React is used, with hooks
  - removed scripts files
  - removed yarn script for running the script with `yarn enable-rn-hooks`

## [v0.7.4]

Update point of interest detail screen

### Added

- added InfoCard to render general data for a PointOfInterest
- added PriceCard with price information

### Changed

- refactored Text components to use them more globally
- moved hard coded strings to config file

## [v0.7.3]

Update html helper to remove whitespaces after self-closing tags

## [v0.7.2]

Show 10 points of interest on home screen

### Changed

- the points of interest on home screen is a horizontal slider
  - sliding only three elements makes not much sense, so we can use more there
- increased the amount of points of interest on home screen from 3 to 10

## [v0.7.1]

Fix category queries for name

### Fixed

- there is a new CategoryType now where we can get the name for a category from
- updated screens to render the data correctly

### Changed

- changed CardList Component to PureComponent because it is stateless

## [v0.7.0]

Implement OAuth2 per client credentials flow

### Added

- see https://github.com/doorkeeper-gem/doorkeeper/wiki/Client-Credentials-flow
- using .gitignore secrets file with credentials
  - info in /docs/AUTH.md
- added authentication on startup before creating the apollo client
  - the access token is needed for creating it
  - save it in SecureStore https://docs.expo.io/versions/v32.0.0/sdk/securestore/
- added authentication refresh on screen component mounts
- added more docs

### Changed

- changed Component to PureComponent in screens because they are stateless
- updated usage of `getQuery` where missing

## [v0.6.9]

Implement WebView component for external services

### Added

- created new route `Web` for navigating to a `WebView`
- created a `WebScreen` for rendering a `WebView` with loading indicator
- updated the `HtmlScreen` with adding a `Button` if a `webUrl` is given in navigation params
- created a `Button` component based on React Native Elements Button:
  https://react-native-training.github.io/react-native-elements/docs/button.html

## [v0.6.8]

Implement simple share function of detail screens

### Added

- https://docs.expo.io/versions/v32.0.0/react-native/share
- created share helper function
- added params for shareContent to navigation params, that will be used for share dialog
  opened from DetailScreen
- created `shareMessage()` helper to build the message to share
- added missing line trimming of HtmlView in DetailScreen

### Changed

- refactored `getQuery` to `/queries/index.js` to use everywhere from one place

## [v0.6.7]

Use publishedAt for newsItems instead of createdAt

## [v0.6.6]

Adjust layouts and renderings prior to release

### Added

- show SplashScreen until app is fully initialized
- Android stack navigation transition slides in from right
  - with arrows on list items to navigate we indicate something to/from the right, so it is more
    user friendly to navigate in this direction
    - this is default on iOS

### Changed

- used TouchableNativeFeedback on Android and TouchableOpacity on iOS everywhere
- used normalize to calculate sizes
- updated paddings for cleaner layout
- changed logo image style to `resizeMode: 'contain'` because we do not know how big pictures are
  - with this they always fit in the 80 height container
- added checks to render data only if they are present to prevent app crashes for undefined actions
- centered ActivityIndicator everywhere correctly on screen
- fixed shadow of TitleContainer for iOS
  - render additional TitleShadow component only on iOS and only after the TitleContainer
  - this is not needed for Android, as it is not working
    - for Android there is a workaround with top border
- fixed shadow in drawer for Android

## [v0.6.5]

Implement custom font Titillium Web from Google Fonts

### Added

- downloaded from https://fonts.google.com/specimen/Titillium+Web?selection.family=Titillium+Web
- implemented following the Expo way:
  https://docs.expo.io/versions/latest/guides/using-custom-fonts/
  - font must be loaded in App before MainApp renders
- added new font family everywhere there is some text

## [v0.6.4]

Update screen layouts and render more detail screen data

### Added

- implemented moment for beautifying dates and times
  - installed http://momentjs.com
  - for optimizing package size we could follow these instructions:
    http://momentjs.com/docs/#/use-it/webpack/
  - created a helper method to format dates and times
  - built subtitles from date time and data provider name to use everywhere
  - TODO: use dates object for event records instead of createdAt

### Changed

- added new image for home screen
- updated renderings with conditions
- added wrapper for screen paddings
- updated prop types and default props
- created universal Image component with handling props
- made Logo component universal with handling props
- added data renderings in DetailScreen depending on query type
- fix drawer edgeWidth for Android
  - the drawer was swiped in to much from the middle
- fixed drawer navigation
  - navigate always, not only if not focused, so we are sure that inside of a Detail screen
    we reach the Index screen
- updated test suite
  - there is a bug with `import glyphMap from './vendor/react-native-vector-icons/glyphmaps/Zocial.json'``
    so somehow the render component tests fail

### Removed

- removed unused component Gradient and fix require cycle in TextList

## [v0.6.3]

Update items for navigation to details

### Added

- added DiagonalGradient.defaultProps
  - use React defaultProps instead of own defaultProps const
- added params on index items for correct navigation to details
- added onPress to Card items for navigation to their details

## [v0.6.2]

Update header component on every screen

### Changed

- Icon component
  - is transforming and rendering my svg files with series of style props
  - is wrapped in to a `TouchableOpacity` in order to be used for navigating
- LinearGradient component
  - is working in a similar way, has a `defaultProps` with color and direction of the gradient
  - but is can also accept new props and children optional not required
  - in order to make the linear background work on my header, it must be used within
    `headerBackground` props, positioned in my `defaultStackNavigatorConfig`

## [v0.6.1]

Refactor to one main app stack navigator and get data on detail screens

### Changed

- we do not need to have multiple stack navigators
  - removed stack navigators
  - renamed HomeStackNavigator to AppStackNavigator
- with one main app stack navigator we have better navigation with transitions between
  screens and the ability to go back from everywhere
  - this was not possible with navigating through different stacks
- added navigation in detail screens
- implemented queries on detail screens

## [v0.6.0]

Fetch navigation configs from server and create Drawer items

### Changed

- needed to put the creation of the Drawer in the index.js to be able to connect the
  Apollo client to the navigator
  - we need to fetch the data prior to creating the routes
  - there was no option to pass the client in the Drawer creation
  - opened GitHub issues and StackOverflow question:
    - https://github.com/react-navigation/react-navigation/issues/5935
    - https://github.com/apollographql/react-apollo/issues/3069
    - https://stackoverflow.com/q/56292801/9956365
- created a folder for queries
  - created single query files exporting the needed queries as constants
- needed to pass down the data to the different StackNavigators correctly using `params`
- updated components to work dynamically depending on passed data
- needed to rename every initial route to 'Index', so it is always clear where to navigate to in
  each Stack from Drawer
- implemented querying components for lists in HomeScreen and IndexScreen
- removed hard coded objects
- removed unnecessary StaticStackNavigator stuff

## [v0.5.2]

Render html contents fetched per GraphQL query

### Changed

- refactored TextContent to HtmlView
- refactored config files
  - added new folder for different styles configs
  - added html styles for HtmlView
  - added normalization file for texts
- created helpers folder for files containing methods that are useful all over the project
  - added linkHelper for opening external links
  - added htmlView helper for preparing and cleaning fetched contents

## [v0.5.1]

Update Android version with fixes for working as iOS version

### Changed

- some components were not working as expected on Android, as the development was focusing for iOS
- updated some packages
- removed some unnecessary imports
- changed image urls to http, as https links of this specific files from that domain were not
  rendering on Android
- added `delayPressIn={0}` to avoid bugs on developing with remote debugger turned on
- changed value for `scrollEnabled` to boolean as a red screen was arguing with
- added workaround for the sidebar from right being not effected everywhere on the screen but
  only on the edge of 20 from right
- style textTransform uppercase is not working for Android, which will be fixed with
  React Native 0.59.x
  - meanwhile we uppercase per JS

## [v0.5.0]

Create 10 new components

### Added

- which are making up the layout of the main screens like `Home`, `Index` and `Detail`
- `config` now contains not just colors and texts
  - also object of html tags in order to style the text in `TextContent`

## [v0.4.0]

Create a custom drawer navigator

### Added

- created custom drawer and custom drawer items components based on the original ones from React
  Navigation
  - needed to set a gradient background
  - needed to change the navigation behaviour with popToTop() in stacks
  - needed to add an close icon on the top right
  - conditionally use drawerType depending on platform
    - on iOS `slide` is more common
  - changed fontWeight depending on `focused`
    - `bold` when active, otherwise `normal`
- created a DiagonalGradient component to use everywhere needed
- created device config holding different values needed in some screens, like platform or dimensions
- added StatusBar to set the bar style to `light-content`, as we want to have white text on our
  gradient header
- updated colors to new shades of green and blue

## [v0.3.0]

Setup styled-components and react-native-elements

### Added

- as a guide used https://react-native-training.github.io/react-native-elements/docs/listitem.html
- as a guide used https://www.styled-components.com/docs/basics#react-native

## [v0.2.0]

Setup Apollo GraphQL client with cache persisting

### Added

- setup Apollo GraphQL client: https://www.apollographql.com/docs/react/
  - a local development address is given for the GraphQL server uri
- implemented cache persisting with https://github.com/apollographql/apollo-cache-persist
  to AsyncStorage
- made first queries
  - on HomeScreen querying data from locally connected main server
  - on IndexScreen querying data from the client store
  - for `fetchPolicy`s see https://www.apollographql.com/docs/react/api/react-apollo#graphql-config-options-fetchPolicy

## [v0.1.0]

Initial React Native app setup with Expo and React Navigation

### Added

- setup initial app with Expo: https://github.com/react-community/create-react-native-app
- setup React Navigation: https://reactnavigation.org/docs/en/getting-started.html
  - implement drawer and nested stack navigation
- setup Jest framework for tests
- setup linter and Code Climate
  - with configs according to this project

## [v0.0.1]

Initial repository commit
