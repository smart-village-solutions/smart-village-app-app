# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [v0.6.5]

Implement custom font Titillium Web from Google Fonts

### Added

- downloaded from https://fonts.google.com/specimen/Titillium+Web?selection.family=Titillium+Web
- implemented following the expo way:
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
