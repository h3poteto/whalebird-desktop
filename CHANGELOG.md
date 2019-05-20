# Change Log

## [2.7.2]
### Added
- [#911](https://github.com/h3poteto/whalebird-desktop/pull/911) Add a menu to read follow requests, and accept/reject it
- [#903](https://github.com/h3poteto/whalebird-desktop/pull/903) Add Italian translation
- [#902](https://github.com/h3poteto/whalebird-desktop/pull/902) Add request loading circle
### Changed
- [#917](https://github.com/h3poteto/whalebird-desktop/pull/917) Change loading in order to change channel while loading
- [#916](https://github.com/h3poteto/whalebird-desktop/pull/916) Stop loading after fetch home timeline
- [#914](https://github.com/h3poteto/whalebird-desktop/pull/914) refactor: Move logics to vuex store in new toot
- [#910](https://github.com/h3poteto/whalebird-desktop/pull/910) Update electron version to 5.0.1 for mas
- [#900](https://github.com/h3poteto/whalebird-desktop/pull/900) Update electron version to 5.0.1
- [#899](https://github.com/h3poteto/whalebird-desktop/pull/899) Use accounts/search API instead of v2/search
### Fixed
- [#919](https://github.com/h3poteto/whalebird-desktop/pull/919) Fix favourite and reblog event
- [#918](https://github.com/h3poteto/whalebird-desktop/pull/918) Update favourited, Reblogged toot in all timelines
- [#912](https://github.com/h3poteto/whalebird-desktop/pull/912) Update pinned hashtags if tags are exist
- [#908](https://github.com/h3poteto/whalebird-desktop/pull/908) Remove commas between pinned hashtags in new toot


## [2.7.1] - 2019-04-25
### Added
- [#898](https://github.com/h3poteto/whalebird-desktop/pull/898) Build package for 32bit
- [#891](https://github.com/h3poteto/whalebird-desktop/pull/891) Introduce prettier combinated eslint
- [#862](https://github.com/h3poteto/whalebird-desktop/pull/862) Add detail link on timestamp in toot

### Changed

- [#888](https://github.com/h3poteto/whalebird-desktop/pull/888) Change scrollbar design
- [#887](https://github.com/h3poteto/whalebird-desktop/pull/887) Remove unused setting files
- [#850](https://github.com/h3poteto/whalebird-desktop/issues/850) Use typescript in store

### Fixed

- [#897](https://github.com/h3poteto/whalebird-desktop/pull/897) Show a menu item for save image in context menu
- [#407](https://github.com/h3poteto/whalebird-desktop/issues/407) Can not remove the list members



## [2.7.0] - 2019-03-25
### Added

- [#849](https://github.com/h3poteto/whalebird-desktop/pull/849) Add mentions timeline
- [#847](https://github.com/h3poteto/whalebird-desktop/pull/847) Add integration tests for ListMembership modal
- [#846](https://github.com/h3poteto/whalebird-desktop/pull/846) Add integration tests for AddListMember modal

### Changed

- [#855](https://github.com/h3poteto/whalebird-desktop/pull/855) Add mention timeline to jump list
- [#853](https://github.com/h3poteto/whalebird-desktop/pull/853) Update electron-builder version to 20.39.0
- [#845](https://github.com/h3poteto/whalebird-desktop/pull/845) Update electron version to 4.0.8

### Fixed

- [#856](https://github.com/h3poteto/whalebird-desktop/pull/856) Hide long username and instance name in side menu
- [#854](https://github.com/h3poteto/whalebird-desktop/pull/854) Fix validation which checks toot max length
- [#852](https://github.com/h3poteto/whalebird-desktop/pull/852) Add ttfinfo
- [#842](https://github.com/h3poteto/whalebird-desktop/pull/842) Merge french translation missing file to translation
- [#841](https://github.com/h3poteto/whalebird-desktop/pull/841) Fix package.json for Windows
- [#839](https://github.com/h3poteto/whalebird-desktop/pull/839) Completing French translation



## [2.6.3] - 2019-02-25
### Added
- [#836](https://github.com/h3poteto/whalebird-desktop/pull/836) Add option to hide all attachments
- [#833](https://github.com/h3poteto/whalebird-desktop/pull/833) Add tests for Jump modal
- [#827](https://github.com/h3poteto/whalebird-desktop/pull/827) Add option to ignore CW and NFSW
- [#824](https://github.com/h3poteto/whalebird-desktop/pull/824) Add unit/integration tests for TimelineSpace
- [#823](https://github.com/h3poteto/whalebird-desktop/pull/823) Add unit tests for Home
- [#820](https://github.com/h3poteto/whalebird-desktop/pull/820) Add intergation tests for Contents/Home

### Changed
- [#838](https://github.com/h3poteto/whalebird-desktop/pull/838) Update megalodon version to 0.5.0
- [#828](https://github.com/h3poteto/whalebird-desktop/pull/828) refactor: Use computed instead of methods in Toot
- [#819](https://github.com/h3poteto/whalebird-desktop/pull/819) Update Korean translation

### Fixed
- [#837](https://github.com/h3poteto/whalebird-desktop/pull/837) Reload app general config after change preferences
- [#835](https://github.com/h3poteto/whalebird-desktop/pull/835) Adjust z-index for emoji picker in NewTootModal
- [#834](https://github.com/h3poteto/whalebird-desktop/pull/834) Fix state definition in integration spec
- [#826](https://github.com/h3poteto/whalebird-desktop/pull/826) Merge and lint ko translation json



## [2.6.2] - 2019-01-08

### Added
- [#818](https://github.com/h3poteto/whalebird-desktop/pull/818) Add Makefile to build release files
- [#786](https://github.com/h3poteto/whalebird-desktop/pull/786) Add a button to switch websocket for streaming

### Changed
- [#817](https://github.com/h3poteto/whalebird-desktop/pull/817) Add integration/unit tests for TimelineSpace/HeaderMenu
- [#815](https://github.com/h3poteto/whalebird-desktop/pull/815) Add unit/integration tests for SideMenu
- [#814](https://github.com/h3poteto/whalebird-desktop/pull/814) Add unit/integration tests for GlobalHeader
- [#813](https://github.com/h3poteto/whalebird-desktop/pull/813) Add Preferences store tests
- [#812](https://github.com/h3poteto/whalebird-desktop/pull/812) Add Authorize store tests
- [#811](https://github.com/h3poteto/whalebird-desktop/pull/811) Fix Login spec to use ipc mock
- [#810](https://github.com/h3poteto/whalebird-desktop/pull/810) Add Login store unit tests
- [#809](https://github.com/h3poteto/whalebird-desktop/pull/809) Use jest for unit tests instead of mocha

### Fixed
- [#808](https://github.com/h3poteto/whalebird-desktop/pull/808) Fix cursor position when user types arrow keys on image description
- [#807](https://github.com/h3poteto/whalebird-desktop/pull/807) Don't send event to webContents when window is already closed
- [#806](https://github.com/h3poteto/whalebird-desktop/pull/806) Fix typo when stop direct messages streaming
- [#805](https://github.com/h3poteto/whalebird-desktop/pull/805) Use same arrow icon for collapse buttons
- [#803](https://github.com/h3poteto/whalebird-desktop/pull/803) Use same arrow icon for collapse buttons
- [#799](https://github.com/h3poteto/whalebird-desktop/pull/799) Rescue parser error after streaming listener is closed
- [#790](https://github.com/h3poteto/whalebird-desktop/pull/790) Emojify display name in follow notification
- [#787](https://github.com/h3poteto/whalebird-desktop/pull/787) Updated English Text



## [2.6.1] - 2018-12-14

### Added
- [#773](https://github.com/h3poteto/whalebird-desktop/pull/773) Add instance icon in account header

### Changed

- [#785](https://github.com/h3poteto/whalebird-desktop/pull/785) Make UI a bit more accessible
- [#779](https://github.com/h3poteto/whalebird-desktop/pull/779) Bump megalodon to version 0.4.6
- [#771](https://github.com/h3poteto/whalebird-desktop/pull/771) Update more packages
- [#770](https://github.com/h3poteto/whalebird-desktop/pull/770) Upgrade Electron version to 3.0.10

### Fixed

- [#783](https://github.com/h3poteto/whalebird-desktop/pull/783) Close sidebar before changing account
- [#782](https://github.com/h3poteto/whalebird-desktop/pull/782) Add Pinned toot update handler
- [#781](https://github.com/h3poteto/whalebird-desktop/pull/781) Fix RTL content leaking direction
- [#777](https://github.com/h3poteto/whalebird-desktop/pull/777) Fix media description again
- [#776](https://github.com/h3poteto/whalebird-desktop/pull/776) Keep an error listener after stopping socket
- [#774](https://github.com/h3poteto/whalebird-desktop/pull/774) Update README for node version
- [#766](https://github.com/h3poteto/whalebird-desktop/pull/766) Fix retrieving a retoot's toot tree



## [2.6.0] - 2018-12-04
### Added

- [#759](https://github.com/h3poteto/whalebird-desktop/pull/759) Enable searching toots by link
- [#756](https://github.com/h3poteto/whalebird-desktop/pull/756) Switch focus between Timelines and Account Profile using shortcut keys
- [#755](https://github.com/h3poteto/whalebird-desktop/pull/755) Switch focus between Timeline and Toot Detail using shortcut keys

### Changed

- [#751](https://github.com/h3poteto/whalebird-desktop/pull/751) Change help command of shortcut
- [#748](https://github.com/h3poteto/whalebird-desktop/pull/748) Enable account dropdown in narrow sidebar menu
- [#747](https://github.com/h3poteto/whalebird-desktop/pull/747) Increase sidebar to 360px

### Fixed

- [#764](https://github.com/h3poteto/whalebird-desktop/pull/764) Update shortcut help for switching focus
- [#761](https://github.com/h3poteto/whalebird-desktop/pull/761) Stylelint fixes
- [#757](https://github.com/h3poteto/whalebird-desktop/pull/757) Fix moving cursor in CW input
- [#754](https://github.com/h3poteto/whalebird-desktop/pull/754) Fix undoing retoots/favourites
- [#753](https://github.com/h3poteto/whalebird-desktop/pull/753) Keep timestamp up-to-date and accessible
- [#752](https://github.com/h3poteto/whalebird-desktop/pull/752) Fix user layout in Follow(ers) tab
- [#746](https://github.com/h3poteto/whalebird-desktop/pull/746) Fix editing media description
- [#745](https://github.com/h3poteto/whalebird-desktop/pull/745) Clear sidebar timeline also when component changed
- [#744](https://github.com/h3poteto/whalebird-desktop/pull/744) Emojify account profile



## [2.5.3] - 2018-11-26
### Added

- [#740](https://github.com/h3poteto/whalebird-desktop/pull/740) Add tag as search target and show results of search tags
- [#733](https://github.com/h3poteto/whalebird-desktop/pull/733) Enable adding a media description

### Changed

- [#739](https://github.com/h3poteto/whalebird-desktop/pull/739) Update more packages
- [#736](https://github.com/h3poteto/whalebird-desktop/pull/736) Update Noto Sans
- [#730](https://github.com/h3poteto/whalebird-desktop/pull/730) Update more node.js packages
- [#729](https://github.com/h3poteto/whalebird-desktop/pull/729) Upgrade megalodon version to 0.4.5

### Fixed

- [#743](https://github.com/h3poteto/whalebird-desktop/pull/743) Change header width when open global header and side menu
- [#738](https://github.com/h3poteto/whalebird-desktop/pull/738) Remove spinner after image has been loaded
- [#737](https://github.com/h3poteto/whalebird-desktop/pull/737) Fix header length when not using narrow menu
- [#735](https://github.com/h3poteto/whalebird-desktop/pull/735) Fix json style in locales
- [#732](https://github.com/h3poteto/whalebird-desktop/pull/732) Fix Whalebird font stack
- [#731](https://github.com/h3poteto/whalebird-desktop/pull/731) Fix typo in Follow component


## [2.5.2] - 2018-11-19
### Added
- [#728](https://github.com/h3poteto/whalebird-desktop/pull/728) Add donate buttons for Patreon and Liberapay
- [#722](https://github.com/h3poteto/whalebird-desktop/pull/722) Enable a vue-loading overlay for the media viewer
- [#721](https://github.com/h3poteto/whalebird-desktop/pull/721) Show loading spinner when loading images
- [#719](https://github.com/h3poteto/whalebird-desktop/pull/719) Add settings button on header menu

### Changed
- [#723](https://github.com/h3poteto/whalebird-desktop/pull/723) Update toot modal to copy CWs
- [#716](https://github.com/h3poteto/whalebird-desktop/pull/716) Update Toot layout
- [#715](https://github.com/h3poteto/whalebird-desktop/pull/715) Update vue and most related dependencies
- [#712](https://github.com/h3poteto/whalebird-desktop/pull/712) Update most related dependencies
- [#711](https://github.com/h3poteto/whalebird-desktop/pull/711) Update i18next and @panter/vue-i18next

### Fixed
- [#726](https://github.com/h3poteto/whalebird-desktop/pull/726) Always clear timeline between switches/refreshes
- [#725](https://github.com/h3poteto/whalebird-desktop/pull/725) Fix failover image refresh
- [#724](https://github.com/h3poteto/whalebird-desktop/pull/724) Fix username emojification in sidebar
- [#720](https://github.com/h3poteto/whalebird-desktop/pull/720) fix: Stop unbind events when reload, and call unbind when destroy
- [#718](https://github.com/h3poteto/whalebird-desktop/pull/718) Check acct when parse account
- [#717](https://github.com/h3poteto/whalebird-desktop/pull/717) fix: Await initialize when TimelineSpace is created
- [#709](https://github.com/h3poteto/whalebird-desktop/pull/709) Fix timeline header width when account sidebar is collapsed



## [2.5.1] - 2018-11-16
### Added
- [#705](https://github.com/h3poteto/whalebird-desktop/pull/705) Render emojis in username

### Changed
- [#706](https://github.com/h3poteto/whalebird-desktop/pull/706) Show substitute image when can not load the image
- [#704](https://github.com/h3poteto/whalebird-desktop/pull/704) Don't load emoji picker as default for performance
- [#701](https://github.com/h3poteto/whalebird-desktop/pull/701) Upgrade Webpack version to 4.x
- [#700](https://github.com/h3poteto/whalebird-desktop/pull/700) Upgrade electron version to 3.0.8

### Fixed
- [#707](https://github.com/h3poteto/whalebird-desktop/pull/707) refactor: Cage Cards components in molecules according to atomic design
- [#703](https://github.com/h3poteto/whalebird-desktop/pull/703) Fix toot parser for account, tag and link
- [#699](https://github.com/h3poteto/whalebird-desktop/pull/699) Improve performance issue when users type new status



## [2.5.0] - 2018-11-11
### Added
- [#694](https://github.com/h3poteto/whalebird-desktop/pull/694) Allow customize unread notification of timelines
- [#689](https://github.com/h3poteto/whalebird-desktop/pull/689) Add emoji picker in new toot modal
- [#688](https://github.com/h3poteto/whalebird-desktop/pull/688) Enable Direct Messages timeline

### Changed
- [#693](https://github.com/h3poteto/whalebird-desktop/pull/693) Add streaming update for direct message
- [#686](https://github.com/h3poteto/whalebird-desktop/pull/686) Enable playback of animated media

### Fixed
- [#697](https://github.com/h3poteto/whalebird-desktop/pull/697) Fix unread mark on side menu when public timeline is updated
- [#692](https://github.com/h3poteto/whalebird-desktop/pull/692) Block changing account when the modal is active
- [#690](https://github.com/h3poteto/whalebird-desktop/pull/690) Fix tag parser in tootParser for Pleroma's tag
- [#687](https://github.com/h3poteto/whalebird-desktop/pull/687) Do not position the :arrow_up: button behind the sidebar


## [2.4.4] - 2018-11-01
### Added
- [#682](https://github.com/h3poteto/whalebird-desktop/pull/682) Add sensitive settings and sync to each instance

### Changed
- [#678](https://github.com/h3poteto/whalebird-desktop/pull/678) Move visibility settings to sync instance settings

### Fixed
- [#684](https://github.com/h3poteto/whalebird-desktop/pull/684) Open the links in meta fields in the default browser
- [#683](https://github.com/h3poteto/whalebird-desktop/pull/683) Remove duplicated emojis when suggest
- [#679](https://github.com/h3poteto/whalebird-desktop/pull/679) Remove unnecesary state to fix preference's menu



## [2.4.3] - 2018-10-26
### Added
- [#675](https://github.com/h3poteto/whalebird-desktop/pull/675) Add option to hide/show global hea
- [#661](https://github.com/h3poteto/whalebird-desktop/pull/661) Show follow/unfollow button in follow/followers tab in profile

### Changed
- [#669](https://github.com/h3poteto/whalebird-desktop/pull/669) Save refresh token if it exists

### Fixed
- [#676](https://github.com/h3poteto/whalebird-desktop/pull/676) Load hide/show status when reopen app
- [#674](https://github.com/h3poteto/whalebird-desktop/pull/674) Fix side menu design for narrow style
- [#672](https://github.com/h3poteto/whalebird-desktop/pull/672) Clear notification badge on app icon when reload or scroll
- [#671](https://github.com/h3poteto/whalebird-desktop/pull/671) Add role and alt tag for accessibility
- [#670](https://github.com/h3poteto/whalebird-desktop/pull/670) Block to open account profile when the account is not found

## [2.4.2] -2018-10-14
### Added
- [#656](https://github.com/h3poteto/whalebird-desktop/pull/656) Show profile's metadata in account profile

### Changed
- [#653](https://github.com/h3poteto/whalebird-desktop/pull/653) Update Korean translation

### Fixed
- [#659](https://github.com/h3poteto/whalebird-desktop/pull/659) Fix order of unique when initialize
- [#658](https://github.com/h3poteto/whalebird-desktop/pull/658) Fix searching account when open my profile
- [#655](https://github.com/h3poteto/whalebird-desktop/pull/655) Fix accounts order on globala header
- [#654](https://github.com/h3poteto/whalebird-desktop/pull/654) Reoreder accounts and fix order method
- [#652](https://github.com/h3poteto/whalebird-desktop/pull/652) Fix toot parser for Pleroma


## [2.4.1] - 2018-10-10
### Fixed
- [#649](https://github.com/h3poteto/whalebird-desktop/pull/649) Add menu to reopen window after close window in macOS
- [#645](https://github.com/h3poteto/whalebird-desktop/pull/645) Fix calling unbind local streaming in timeline space



## [2.4.0] - 2018-10-09

### Added
- [#638](https://github.com/h3poteto/whalebird-desktop/pull/638) Connect to Pleroma with Web Socket to streaming update
- [#631](https://github.com/h3poteto/whalebird-desktop/pull/631) Add reporting method and mute/block method on toot

### Changed
- [#642](https://github.com/h3poteto/whalebird-desktop/pull/642) Update megalodon version to 0.4.3 for reconnect
- [#636](https://github.com/h3poteto/whalebird-desktop/pull/636) Update too max characters if the API responds toot_max_chars

### Fixed
- [#643](https://github.com/h3poteto/whalebird-desktop/pull/643) Fix bind method when reloading
- [#641](https://github.com/h3poteto/whalebird-desktop/pull/641) Fix protocol of websocket in streaming
- [#640](https://github.com/h3poteto/whalebird-desktop/pull/640) Fix hashtag and list streaming of Pleroma
- [#639](https://github.com/h3poteto/whalebird-desktop/pull/639) Fix message id in timeline
- [#637](https://github.com/h3poteto/whalebird-desktop/pull/637) Open toot detail when user click favourited or rebloged notifications


## [2.3.1] - 2018-09-29
### Fixed
- [#629](https://github.com/h3poteto/whalebird-desktop/pull/629) [hotfix] Use system-font-families instead of font-manager because it is native module



## [2.3.0] - 2018-09-28
### Added
- [#626](https://github.com/h3poteto/whalebird-desktop/pull/626) Change default fonts in preferences
- [#624](https://github.com/h3poteto/whalebird-desktop/pull/624) Add some color themes
- [#623](https://github.com/h3poteto/whalebird-desktop/pull/623) Allow to use customize color theme in preferences
- [#620](https://github.com/h3poteto/whalebird-desktop/pull/620) Show toot design sample in appearance setting page

### Changed
- [#622](https://github.com/h3poteto/whalebird-desktop/pull/622) Update electron version to 2.0.10
- [#621](https://github.com/h3poteto/whalebird-desktop/pull/621) Update deprecated packages for audit

### Fixed
- [#627](https://github.com/h3poteto/whalebird-desktop/pull/627) Update Korean localization

## [2.2.2] - 2018-09-22
### Added
- [#617](https://github.com/h3poteto/whalebird-desktop/pull/617) Pin hashtag in new toot
- [#614](https://github.com/h3poteto/whalebird-desktop/pull/614) Suggest hashtags in new toot

### Changed
- [#615](https://github.com/h3poteto/whalebird-desktop/pull/615) Reduce statuses when merge timeline

### Fixed
- [#616](https://github.com/h3poteto/whalebird-desktop/pull/616) Fix line height for font icons
- [#613](https://github.com/h3poteto/whalebird-desktop/pull/613) Call close confirm when cancel new toot
- [#612](https://github.com/h3poteto/whalebird-desktop/pull/612) Stop shortcut when jump modal is hidden
- [#608](https://github.com/h3poteto/whalebird-desktop/pull/608) Set nowrap for domain name in side menu



## [2.2.1] - 2018-09-17
### Added
- [#602](https://github.com/h3poteto/whalebird-desktop/pull/602) Add mute/block menu
- [#599](https://github.com/h3poteto/whalebird-desktop/pull/599) Add shortcut events for notification
- [#596](https://github.com/h3poteto/whalebird-desktop/pull/596) Minmize to tray for win32

### Changed

- [#606](https://github.com/h3poteto/whalebird-desktop/pull/606) Show tags in side menu
- [#593](https://github.com/h3poteto/whalebird-desktop/pull/593) Update Korean localization

### Fixed

- [#605](https://github.com/h3poteto/whalebird-desktop/pull/605) Fix losting focused toot in timeline
- [#604](https://github.com/h3poteto/whalebird-desktop/pull/604) Fix typo in doc
- [#603](https://github.com/h3poteto/whalebird-desktop/pull/603) Fix popper design
- [#600](https://github.com/h3poteto/whalebird-desktop/pull/600) Fix default fonts for japanese
- [#591](https://github.com/h3poteto/whalebird-desktop/pull/591) Fix circleci badge



## [2.2.0] - 2018-09-01
### Added
- [#590](https://github.com/h3poteto/whalebird-desktop/pull/590) Change time format and set in preferences
- [#586](https://github.com/h3poteto/whalebird-desktop/pull/586) Switch notification in preferences
- [#583](https://github.com/h3poteto/whalebird-desktop/pull/583) Suggest native emoji in New Toot modal
- [#576](https://github.com/h3poteto/whalebird-desktop/pull/576) Add shortcut keys to read image and contents warning

### Changed
- [#585](https://github.com/h3poteto/whalebird-desktop/pull/585) Update packages for node 10.x
- [#584](https://github.com/h3poteto/whalebird-desktop/pull/584) Update electron version to 2.0.8
- [#580](https://github.com/h3poteto/whalebird-desktop/pull/580) Update Korean localization
- [#573](https://github.com/h3poteto/whalebird-desktop/pull/573) Update shortcut description

### Fixed
- [#589](https://github.com/h3poteto/whalebird-desktop/pull/589) Fix bug for save preference in general
- [#588](https://github.com/h3poteto/whalebird-desktop/pull/588) Fix closing image modal using esc
- [#587](https://github.com/h3poteto/whalebird-desktop/pull/587) Fix closing sidebar when overlaid
- [#575](https://github.com/h3poteto/whalebird-desktop/pull/575) New Korean localization

## [2.1.2] - 2018-08-27
### Added
- [#562](https://github.com/h3poteto/whalebird-desktop/pull/562) Add shortcut help modal
- [#557](https://github.com/h3poteto/whalebird-desktop/pull/557) Add shortcut keys to control toot
- [#552](https://github.com/h3poteto/whalebird-desktop/pull/552) Set shortcut keys to move toot on timeline
- [#547](https://github.com/h3poteto/whalebird-desktop/pull/547) Add title to display description when hover icon

### Changed
- [#571](https://github.com/h3poteto/whalebird-desktop/pull/571) Add donate link and QR code in README
- [#565](https://github.com/h3poteto/whalebird-desktop/pull/565) Close preference page with esc
- [#559](https://github.com/h3poteto/whalebird-desktop/pull/559) Add description of shortcut in README

### Fixed
- [#570](https://github.com/h3poteto/whalebird-desktop/pull/570) Fix reply visibility level
- [#566](https://github.com/h3poteto/whalebird-desktop/pull/566) Fix shortcut events
- [#560](https://github.com/h3poteto/whalebird-desktop/pull/560) Set active tab to first when close preferences
- [#556](https://github.com/h3poteto/whalebird-desktop/pull/556) Update Korean localization



## [2.1.1] - 2018-08-21
### Added
- [#534](https://github.com/h3poteto/whalebird-desktop/pull/534) Add Korean localization
- [#532](https://github.com/h3poteto/whalebird-desktop/pull/532) Support clipboard picture
- [#528](https://github.com/h3poteto/whalebird-desktop/pull/528) Add Polish translation

### Fixed
- [#546](https://github.com/h3poteto/whalebird-desktop/pull/546) Fix username to include domain when the user is another instance
- [#545](https://github.com/h3poteto/whalebird-desktop/pull/545) Fix boost icon when the toot is direct
- [#544](https://github.com/h3poteto/whalebird-desktop/pull/544) Fix domain validation for short domain
- [#539](https://github.com/h3poteto/whalebird-desktop/pull/539) Focus on new toot modal after change account
- [#538](https://github.com/h3poteto/whalebird-desktop/pull/538) Jump only modal is opened
- [#535](https://github.com/h3poteto/whalebird-desktop/pull/535) Fix typo in README.md
- [#529](https://github.com/h3poteto/whalebird-desktop/pull/529) Fix some minor typos


## [2.1.0] - 2018-08-20
### Added
- [#519](https://github.com/h3poteto/whalebird-desktop/pull/519) Suggest custom emojis in new toot
- [#516](https://github.com/h3poteto/whalebird-desktop/pull/516) Parse emoji and show emoji in toot
- [#514](https://github.com/h3poteto/whalebird-desktop/pull/514) Add description how to add language in README
- [#513](https://github.com/h3poteto/whalebird-desktop/pull/513) Add show profile menu

### Fixed
- [#524](https://github.com/h3poteto/whalebird-desktop/pull/524) Fix space in notifications
- [#523](https://github.com/h3poteto/whalebird-desktop/pull/523) Control CW, NSFW, and emoji in notification


## [2.0.1] - 2018-08-18
### Added
- [#503](https://github.com/h3poteto/whalebird-desktop/pull/503) Add confirm modal when close new toot
- [#502](https://github.com/h3poteto/whalebird-desktop/pull/502) Added German translation
- [#500](https://github.com/h3poteto/whalebird-desktop/pull/500) Show account name when hovering on global header

### Changed
- [#510](https://github.com/h3poteto/whalebird-desktop/pull/510) Change location of follow/unfollow and more info button in account profile
- [#498](https://github.com/h3poteto/whalebird-desktop/pull/498) Add minimum requirements for contribution in README
- [#496](https://github.com/h3poteto/whalebird-desktop/pull/496) Update README

### Fixed
- [#511](https://github.com/h3poteto/whalebird-desktop/pull/511) Fix Deutsch for close confirm modal
- [#509](https://github.com/h3poteto/whalebird-desktop/pull/509) Update default toot visibility of new toot
- [#499](https://github.com/h3poteto/whalebird-desktop/pull/499) Hide follower menue for own user account
- [#497](https://github.com/h3poteto/whalebird-desktop/pull/497) Translate loading message for each languages


## [2.0.0] - 2018-08-15
### Added
- [#492](https://github.com/h3poteto/whalebird-desktop/pull/492) i18n + English spelling typos + French l10n
- [#488](https://github.com/h3poteto/whalebird-desktop/pull/488) Switch language in preferences
- [#483](https://github.com/h3poteto/whalebird-desktop/pull/483) Translate languages using i18next
- [#472](https://github.com/h3poteto/whalebird-desktop/pull/472) Support for arrow keys when display medias
- [#471](https://github.com/h3poteto/whalebird-desktop/pull/471) Suggest account name in new toot

### Changed
- [#489](https://github.com/h3poteto/whalebird-desktop/pull/489) Update electron version to 2.0.7
- [#476](https://github.com/h3poteto/whalebird-desktop/pull/476) Check and submit instance with enter key in login form

### Fixed
- [#495](https://github.com/h3poteto/whalebird-desktop/pull/495) Fix loading message for japanese
- [#494](https://github.com/h3poteto/whalebird-desktop/pull/494) Handle arrowleft and arrowright key in textarea
- [#490](https://github.com/h3poteto/whalebird-desktop/pull/490) Fix build setting for locales
- [#487](https://github.com/h3poteto/whalebird-desktop/pull/487) spelling typos
- [#486](https://github.com/h3poteto/whalebird-desktop/pull/486) Fix API response of lists
- [#475](https://github.com/h3poteto/whalebird-desktop/pull/475) Use vue-shortkey in jump modal because sometimes jump modal is freeze
- [#474](https://github.com/h3poteto/whalebird-desktop/pull/474) Disable transparent becasue user can not change window size



## [1.5.6] - 2018-08-07
### Added
- [#461](https://github.com/h3poteto/whalebird-desktop/pull/461) Add toot visibility setting and use it in new toot modal

### Changed
- [#468](https://github.com/h3poteto/whalebird-desktop/pull/468) Close new toot modal immediately after post toot

### Fixed
- [#470](https://github.com/h3poteto/whalebird-desktop/pull/470)Rescue error in lazy loading in favourite
- [#467](https://github.com/h3poteto/whalebird-desktop/pull/467) Catch raise when the response does not have link header of favourites



## [1.5.5] - 208-07-31
### Fixed
- [#465](https://github.com/h3poteto/whalebird-desktop/pull/457) Fix account switching in global header menu
- [#464](https://github.com/h3poteto/whalebird-desktop/pull/457) Fix electron, and electron-json-storage version
- [#462](https://github.com/h3poteto/whalebird-desktop/pull/457) Fix scroll of splash screen



## [1.5.4] - 2018-07-29
### Added
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
