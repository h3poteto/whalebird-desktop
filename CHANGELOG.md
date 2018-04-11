# Change Log

## [Unreleased]
### Add
- [#200](https://github.com/h3poteto/whalebird-desktop/pull/200) Show lists in side menu

### Changed
- [#201](https://github.com/h3poteto/whalebird-desktop/pull/201) Show loading when user post new toot

### Fixed
- [#204](https://github.com/h3poteto/whalebird-desktop/pull/204) Set focus in watch directive on newToot
- [#198](https://github.com/h3poteto/whalebird-desktop/pull/198) Fix image position in ImageViewer

## [0.3.1] - 2018-04-08
### Added
- [#196](https://github.com/h3poteto/whalebird-desktop/pull/196) Add sound setting in preferences, and save setting data in json
- [#195](https://github.com/h3poteto/whalebird-desktop/pull/195) Show follows/followers in account profile
- [#194](https://github.com/h3poteto/whalebird-desktop/pull/194) Show user's timeline in account profile

### Changed
- [#191](https://github.com/h3poteto/whalebird-desktop/pull/191) Sound a system sound when user favourite or reblog

### Fixed
- [#192](https://github.com/h3poteto/whalebird-desktop/pull/192) Rescue order when account order is unexpected value
- [#189](https://github.com/h3poteto/whalebird-desktop/pull/189) Show loading when user actions
- [#187](https://github.com/h3poteto/whalebird-desktop/pull/187) fix: Open user profile on reblogger icon and reblogger name
- [#185](https://github.com/h3poteto/whalebird-desktop/pull/185) fix: Set font size of close button in login
- [#184](https://github.com/h3poteto/whalebird-desktop/pull/184) Set limit to attachment height

## [0.3.0] - 2018-04-03
### Added
- [#176](https://github.com/h3poteto/whalebird-desktop/pull/176) Set accounts order in preferences
- [#172](https://github.com/h3poteto/whalebird-desktop/pull/172) Create account preferences page

### Changed
- [#182](https://github.com/h3poteto/whalebird-desktop/pull/180) Use vue-shortkey at shortcut when post new toot
- [#175](https://github.com/h3poteto/whalebird-desktop/pull/175) Save account username in local db

### Fixed
- [#180](https://github.com/h3poteto/whalebird-desktop/pull/180) Show error message when failed to start streaming
- [#179](https://github.com/h3poteto/whalebird-desktop/pull/179) Set global background color to white
- [#177](https://github.com/h3poteto/whalebird-desktop/pull/177) Skip removeEvents when dom does not have a target element
- [#170](https://github.com/h3poteto/whalebird-desktop/pull/170) Fix click event on reblog in notifications
- [#169](https://github.com/h3poteto/whalebird-desktop/pull/169) Set build category for mac and linux

## [0.2.3] - 2018-03-31
### Added
- [#155](https://github.com/h3poteto/whalebird-desktop/pull/155) [#157](https://github.com/h3poteto/whalebird-desktop/pull/157) [#158](https://github.com/h3poteto/whalebird-desktop/pull/158) Add account profile page in side bar

### Fixed
- [#166](https://github.com/h3poteto/whalebird-desktop/pull/166) Reset ctrl key event handler when close new toot modal
- [#162](https://github.com/h3poteto/whalebird-desktop/pull/162) Remove html tags in reply notifications
- [#159](https://github.com/h3poteto/whalebird-desktop/pull/159) Set max height in the image viewer

## [0.2.2] - 2018-03-29
### Added
- [#153](https://github.com/h3poteto/whalebird-desktop/pull/153) Attach images in toot
- [#152](https://github.com/h3poteto/whalebird-desktop/pull/152) Open images in modal window when click the preview
- [#150](https://github.com/h3poteto/whalebird-desktop/pull/150) Add lazy loading in timelines

### Changed
- [#147](https://github.com/h3poteto/whalebird-desktop/pull/147) Archive old statuses when close timeline, because it is too heavy

## [0.2.1] - 2018-03-27
### Added
- [#142](https://github.com/h3poteto/whalebird-desktop/pull/142) Show unread marks in side menu

### Changed
- [#137](https://github.com/h3poteto/whalebird-desktop/pull/137) Use electron-builder instead of electron-packager when build release packages

### Fixed
- [#144](https://github.com/h3poteto/whalebird-desktop/pull/144) Open link on the default browser in notifications
- [#140](https://github.com/h3poteto/whalebird-desktop/pull/140) Refactor closing modal window when post new toot
- [#139](https://github.com/h3poteto/whalebird-desktop/pull/139) Show username if display_name is blank

## [0.2.0] - 2018-03-26
### Added

- [#135](https://github.com/h3poteto/whalebird-desktop/pull/135) Release the Windows version
- [#125](https://github.com/h3poteto/whalebird-desktop/pull/125), #126 Show attached images of toot in timeline
- [#124](https://github.com/h3poteto/whalebird-desktop/pull/124) Save window state when close

### Changed

- [#113](https://github.com/h3poteto/whalebird-desktop/pull/113) Add electron-log for production logs
- [#109](https://github.com/h3poteto/whalebird-desktop/pull/109) Get recently timeline in local and public when it is opend

### Fixed

- [#134](https://github.com/h3poteto/whalebird-desktop/pull/134) Clear the domain name in login form after login
- [#130](https://github.com/h3poteto/whalebird-desktop/pull/130), [#128](https://github.com/h3poteto/whalebird-desktop/pull/128) Set NotoSans as the default font. And remove google-fonts-webpack-plugin becase the API has been dead.
- [#114](https://github.com/h3poteto/whalebird-desktop/pull/114) Allow application to be draggable for Mac
- [#111](https://github.com/h3poteto/whalebird-desktop/pull/111) Fix text overflow in side menu
- [#110](https://github.com/h3poteto/whalebird-desktop/pull/110) Clear old status after close new toot modal


## [0.1.0] - 2018-03-23
This is the first release
