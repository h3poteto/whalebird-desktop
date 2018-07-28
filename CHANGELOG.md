# Change Log

## [1.5.4]
### Changed
- [#457](https://github.com/h3poteto/whalebird-desktop/pull/457) Add splash screen when starting the window

### Changed
- [#460](https://github.com/h3poteto/whalebird-desktop/pull/460) Update eslint-config-standard
- [#459](https://github.com/h3poteto/whalebird-desktop/pull/459) Update eslint
- [#456](https://github.com/h3poteto/whalebird-desktop/pull/456) Update deprecated plugins

### Fixed
- [#458](https://github.com/h3poteto/whalebird-desktop/pull/458) Corrected typo in webpack config
- [#454](https://github.com/h3poteto/whalebird-desktop/pull/454) Update megalodon and fix lazy loading in favourite

## [1.5.3] - 2018-07-23
### Added
- [#446](https://github.com/h3poteto/whalebird-desktop/pull/446) Hide and show application in mac

### Changed
- [#448](https://github.com/h3poteto/whalebird-desktop/pull/448) Update electron version to 2.0.5

### Fixed
- [#450](https://github.com/h3poteto/whalebird-desktop/pull/450) Fix scroll-behavior because custom scroll function is already defined
- [#449](https://github.com/h3poteto/whalebird-desktop/pull/449) Disable some menu item when window is hidden in mac
- [#445](https://github.com/h3poteto/whalebird-desktop/pull/445) Fix scroll speed when range is too small



## [1.5.2] - 2018-07-20
### Added
- [#443](https://github.com/h3poteto/whalebird-desktop/pull/443) Add scroll top button in timeline

### Changed
- [#440](https://github.com/h3poteto/whalebird-desktop/pull/440) Update megalodon version to 0.2.0
- [#438](https://github.com/h3poteto/whalebird-desktop/pull/438) Change boost icon when the status is private

### Fixed
- [#437](https://github.com/h3poteto/whalebird-desktop/pull/437) Use v-show instead of v-if where it is not necessary



## [1.5.1] - 2018-07-13
### Fixed
- [#436](https://github.com/h3poteto/whalebird-desktop/pull/436) Use flex box instead of float at side menu
- [#435](https://github.com/h3poteto/whalebird-desktop/pull/435) Allow subdomain when login

## [1.5.0] - 2018-07-12
### Added
- [#431](https://github.com/h3poteto/whalebird-desktop/pull/431) Show authorization url to rescue it is not opened
- [#429](https://github.com/h3poteto/whalebird-desktop/pull/429) Add filter for timelines based on regexp

### Fixed
- [#432](https://github.com/h3poteto/whalebird-desktop/pull/432) Close popover after do some actions

## [1.4.3] - 2018-07-06
### Added
- [#428](https://github.com/h3poteto/whalebird-desktop/pull/428) Add stylelint and check in sider
- [#427](https://github.com/h3poteto/whalebird-desktop/pull/427) Allow drop file to upload the media to mastodon
- [#425](https://github.com/h3poteto/whalebird-desktop/pull/425) Validate domain name at login

### Changed
- [#426](https://github.com/h3poteto/whalebird-desktop/pull/426) Change color of collapse button


## [1.4.2] - 2018-07-04
### Added
- [#422](https://github.com/h3poteto/whalebird-desktop/pull/422) Add small window layout menu

### Changed
- [#421](https://github.com/h3poteto/whalebird-desktop/pull/421) Use Lato font in textarea because backtic is broken in Noto
- [#420](https://github.com/h3poteto/whalebird-desktop/pull/420) Display loading on the timeline space instead of loading covering the whole

### Fixed
- [#419](https://github.com/h3poteto/whalebird-desktop/pull/419) Fix target message when the message is reblogged in toot menu
- [#418](https://github.com/h3poteto/whalebird-desktop/pull/418) Skip stop streaming if the object is not initialized


## [1.4.1] - 2018-06-28
### Added
- [#412](https://github.com/h3poteto/whalebird-desktop/pull/412) Add reload button and reload each timeline
- [#381](https://github.com/h3poteto/whalebird-desktop/pull/381) Allow reload pages with shortcut keys

### Fixed
- [#411](https://github.com/h3poteto/whalebird-desktop/pull/411) Fix display state of loading in side bar
- [#410](https://github.com/h3poteto/whalebird-desktop/pull/410) Fix findLink method to detect link, tag, and account

## [1.4.0] - 2018-06-20
### Added
- [#403](https://github.com/h3poteto/whalebird-desktop/pull/403) Create list editting page which can manage list memberships
- [#401](https://github.com/h3poteto/whalebird-desktop/pull/401) Create lists in lists page
- [#398](https://github.com/h3poteto/whalebird-desktop/pull/398) Add lists page
- [#395](https://github.com/h3poteto/whalebird-desktop/pull/395) Open the manage lists window of an account on account profile

### Changed
- [#404](https://github.com/h3poteto/whalebird-desktop/pull/404) Set visibility from source message when reply
- [#399](https://github.com/h3poteto/whalebird-desktop/pull/399) Update toot icon

### Fixed
- [#408](https://github.com/h3poteto/whalebird-desktop/pull/408) Reload side menu after create a list
- [#400](https://github.com/h3poteto/whalebird-desktop/pull/400) Allow video to post toot

## [1.3.4] - 2018-06-15
### Added
- [#394](https://github.com/h3poteto/whalebird-desktop/pull/394) Show icon badge when receive notifications
- [#391](https://github.com/h3poteto/whalebird-desktop/pull/391) Remove all account associations

### Changed
- [#392](https://github.com/h3poteto/whalebird-desktop/pull/392) Allow movies as media when post toot

### Fixed
- [#389](https://github.com/h3poteto/whalebird-desktop/pull/389) Block to login the same account of the same domain
- [#384](https://github.com/h3poteto/whalebird-desktop/pull/384) Encode tags for non ascii tags

## [1.3.3] - 2018-06-10
### Changed
- [#379](https://github.com/h3poteto/whalebird-desktop/pull/379) Use megalodon instead of mastodon-api as mastodon api client

### Fixed
- [#384](https://github.com/h3poteto/whalebird-desktop/pull/384) Encode tag for non ascii tags


## [1.3.2] - 2018-06-06
### Fixed
- [#376](https://github.com/h3poteto/whalebird-desktop/pull/376) Remove global shortcut and use mousetrap

## [1.3.1] - 2018-06-06
### Added
- [#373](https://github.com/h3poteto/whalebird-desktop/pull/373) Open account profile when click account name in toot
- [#372](https://github.com/h3poteto/whalebird-desktop/pull/372) Add shortcut key to jump

### Fixed
- [#371](https://github.com/h3poteto/whalebird-desktop/pull/371) Add hashtag and search page in jump list
- [#369](https://github.com/h3poteto/whalebird-desktop/pull/369) Enable scroll in side menu

## [1.3.0] - 2018-06-04
### Added
- [#362](https://github.com/h3poteto/whalebird-desktop/pull/362) Remove registered hashtag
- [#359](https://github.com/h3poteto/whalebird-desktop/pull/359) Add hashtag page and show tag timeline
- [#354](https://github.com/h3poteto/whalebird-desktop/pull/354) Set context menu
- [#349](https://github.com/h3poteto/whalebird-desktop/pull/349) Add toot button on header menu

### Changed
- [#364](https://github.com/h3poteto/whalebird-desktop/pull/364) Open tag timeline page when click tag in toot

### Fixed
- [#348](https://github.com/h3poteto/whalebird-desktop/pull/348) Add a space after username in reply

## [1.2.0] - 2018-05-29
### Added
- [#343](https://github.com/h3poteto/whalebird-desktop/pull/343) Allow drag & drop action to upload files
- [#338](https://github.com/h3poteto/whalebird-desktop/pull/338) Set spoiler text when new toot
- [#337](https://github.com/h3poteto/whalebird-desktop/pull/337) Set sensitive in new toot modal
- [#336](https://github.com/h3poteto/whalebird-desktop/pull/336) Hide sensitive medias by default
- [#331](https://github.com/h3poteto/whalebird-desktop/pull/331) Show content warning status and control visibility

### Changed
- [#339](https://github.com/h3poteto/whalebird-desktop/pull/339) Hide application when can not detect application

### Fixed
- [#346](https://github.com/h3poteto/whalebird-desktop/pull/346) Fix float setting in toot view
- [#345](https://github.com/h3poteto/whalebird-desktop/pull/345) Fix font and color of placeholder in new toot modal
- [#340](https://github.com/h3poteto/whalebird-desktop/pull/340) Fix typo in list streaming
- [#335](https://github.com/h3poteto/whalebird-desktop/pull/335) Guard duplicate username in reply

## [1.1.1] - 2018-05-22
### Changed
- [#321](https://github.com/h3poteto/whalebird-desktop/pull/321) Quit application when window is closed
- [#320](https://github.com/h3poteto/whalebird-desktop/pull/320) Use forked repository for mastodon-api

### Fixed
- [#324](https://github.com/h3poteto/whalebird-desktop/pull/324) Show image as a picture if the extension is unknown in Media
- [#322](https://github.com/h3poteto/whalebird-desktop/pull/322) Fix image size in image viewer


## [1.1.0] - 2018-05-18
### Added
- [#304](https://github.com/h3poteto/whalebird-desktop/pull/304) Add a background streaming for local timeline

### Changed
- [#315](https://github.com/h3poteto/whalebird-desktop/pull/315) Show movie on Image Viewer
- [#307](https://github.com/h3poteto/whalebird-desktop/pull/307) Fill all account name when the status is multiple replied
- [#305](https://github.com/h3poteto/whalebird-desktop/pull/305) Show the application from which the status was posted

### Fixed

- [#313](https://github.com/h3poteto/whalebird-desktop/pull/313) Clear unread mark when change account
- [#310](https://github.com/h3poteto/whalebird-desktop/pull/310) Update icon when user add a new account
- [#308](https://github.com/h3poteto/whalebird-desktop/pull/308) Fix application name, and add comment for website


## [1.0.1] - 2018-05-13
### Added
- [#296](https://github.com/h3poteto/whalebird-desktop/pull/296) Add lazyLoading in account profile timeline
- [#295](https://github.com/h3poteto/whalebird-desktop/pull/295) Add following status for requested

### Changed
- [#294](https://github.com/h3poteto/whalebird-desktop/pull/294) Show original status timestamp in reblogged toot
- [#292](https://github.com/h3poteto/whalebird-desktop/pull/292) Update toot status in SideBar

### Fixed
- [#298](https://github.com/h3poteto/whalebird-desktop/pull/298) Ran the new 'npm audit' and updated some of the packages that are mentioned
- [#297](https://github.com/h3poteto/whalebird-desktop/pull/297) Fix image list arrow
- [#289](https://github.com/h3poteto/whalebird-desktop/pull/289) Add asar unpacked resource for sounds in electron packager


## [1.0.0] - 2018-05-05
### Changed
- [#280](https://github.com/h3poteto/whalebird-desktop/pull/280) Updated package lists to update vue-router & vuex versions to 3.0.1

### Fixed
- [#281](https://github.com/h3poteto/whalebird-desktop/pull/281) Fix loading circle in sidebar


## [0.6.2] - 2018-04-30
### Added
- [#279](https://github.com/h3poteto/whalebird-desktop/pull/279) Add toot delete button
- [#277](https://github.com/h3poteto/whalebird-desktop/pull/277) Show favourites count in toot
- [#272](https://github.com/h3poteto/whalebird-desktop/pull/272) Show reblogs count in toot
- [#270](https://github.com/h3poteto/whalebird-desktop/pull/270) Move image list of a toot
- [#268](https://github.com/h3poteto/whalebird-desktop/pull/268) Add a button which copy link to toot

### Changed
- [#269](https://github.com/h3poteto/whalebird-desktop/pull/269) Add favourite effect

### Fixed
- [#278](https://github.com/h3poteto/whalebird-desktop/pull/278) Stop streaming when window is closed in macOS
- [#275](https://github.com/h3poteto/whalebird-desktop/pull/275) Wording changes

## [0.6.1] - 2018-04-25
### Changed
- [#248](https://github.com/h3poteto/whalebird-desktop/pull/248) Add transition effect to timeline

### Fixed
- [#266](https://github.com/h3poteto/whalebird-desktop/pull/266) Insert error of timeline when lazy loading
- [#265](https://github.com/h3poteto/whalebird-desktop/pull/265) Fix change status in home and notifications
- [#263](https://github.com/h3poteto/whalebird-desktop/pull/263) Background color of focused in notifications

## [0.6.0] - 2018-04-22
### Added
- [#261](https://github.com/h3poteto/whalebird-desktop/pull/261) Add profile dropdown menu for user's profile
- [#250](https://github.com/h3poteto/whalebird-desktop/pull/250) Allow to change font-size
- [#239](https://github.com/h3poteto/whalebird-desktop/pull/239) Add about window for linux and windows

### Changed
- [#260](https://github.com/h3poteto/whalebird-desktop/pull/260) Display avatar in global header
- [#249](https://github.com/h3poteto/whalebird-desktop/pull/249) Add image viewer transition
- [#247](https://github.com/h3poteto/whalebird-desktop/pull/247) Archive timeline and store unread timeline
- [#246](https://github.com/h3poteto/whalebird-desktop/pull/246) Disable renderer backgrounding of chromium
- [#243](https://github.com/h3poteto/whalebird-desktop/pull/243) Change format of username
- [#240](https://github.com/h3poteto/whalebird-desktop/pull/240) Hide overflowed username when width is narrow

### Fixed
- [#245](https://github.com/h3poteto/whalebird-desktop/pull/245) Block changing account when loading timeline
- [#238](https://github.com/h3poteto/whalebird-desktop/pull/238) Close side bar when user change account
- [#236](https://github.com/h3poteto/whalebird-desktop/pull/236) Clear timeline after components are destroyed

## [0.5.0] - 2018-04-18
### Added
- [#232](https://github.com/h3poteto/whalebird-desktop/pull/232) Search page to find account
- [#231](https://github.com/h3poteto/whalebird-desktop/pull/231) Add menu in account profile to open account in browser
- [#226](https://github.com/h3poteto/whalebird-desktop/pull/226) Open toot detail in browser
- [#222](https://github.com/h3poteto/whalebird-desktop/pull/222) Add lists channels in jump modal
- [#214](https://github.com/h3poteto/whalebird-desktop/pull/214) Set theme color and setting theme in preferences


### Changed
- [#218](https://github.com/h3poteto/whalebird-desktop/pull/218) Open toot detail when double click
- [#216](https://github.com/h3poteto/whalebird-desktop/pull/216) Add side bar transition effect

### Fixed
- [#230](https://github.com/h3poteto/whalebird-desktop/pull/230) Change popover library because vue-js-popover has some bugs
- [#221](https://github.com/h3poteto/whalebird-desktop/pull/221) Change link color for dark theme
- [#220](https://github.com/h3poteto/whalebird-desktop/pull/220) Handle error when lazy loading
- [#219](https://github.com/h3poteto/whalebird-desktop/pull/219) Selected background color when dark theme
- [#217](https://github.com/h3poteto/whalebird-desktop/pull/217) Fix label in side menu

## [0.4.0] - 2018-04-12
### Added
- [#207](https://github.com/h3poteto/whalebird-desktop/pull/207) Change visibility level of toot
- [#206](https://github.com/h3poteto/whalebird-desktop/pull/206) Allow user view toot detail at sidebar
- [#200](https://github.com/h3poteto/whalebird-desktop/pull/200) Show lists in side menu

### Changed
- [#201](https://github.com/h3poteto/whalebird-desktop/pull/201) Show loading when user post new toot

### Fixed
- [#208](https://github.com/h3poteto/whalebird-desktop/pull/208) Block toot when new toot modal is closed
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
