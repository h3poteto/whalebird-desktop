# Whalebird
[![Build](https://github.com/h3poteto/whalebird-desktop/actions/workflows/build.yml/badge.svg)](https://github.com/h3poteto/whalebird-desktop/actions/workflows/build.yml)
[![GitHub release](http://img.shields.io/github/release/h3poteto/whalebird-desktop.svg)](https://github.com/h3poteto/whalebird-desktop/releases)
[![Mac App Store](https://img.shields.io/itunes/v/6445864587)](https://apps.apple.com/us/app/whalebird/id6445864587)
[![AUR version](https://img.shields.io/aur/version/whalebird)](https://aur.archlinux.org/packages/whalebird/)
[![Crowdin](https://badges.crowdin.net/whalebird-desktop/localized.svg)](https://crowdin.com/project/whalebird-desktop)


Whalebird is a Fediverse client app for desktop.


![demo](screenshot.png)


## Feature

- An interface like slack
- Notify to desktop
- Streaming
- Manage multiple accounts
- Supporting
    - [x] Mastodon <img src="https://cdn.simpleicons.org/mastodon" alt="Mastodon" width=16 height=16>
    - [x] Pleroma <img src="https://cdn.simpleicons.org/pleroma" alt="Pleroma" width=16 height=16>
    - [x] Friendica
    - [x] Firefish <img src="https://cdn.simpleicons.org/firefish" alt="Firefish" width=16 height=16>
    - [x] Gotosocial
    - [x] Pixelfed
    - [x] Akkoma (Unofficial)
    - [x] Sharkey (Unofficial)
    - [x] Hometown (Unofficial)
    - [x] Iceshrimp (Unofficial)


## Install
### Mac
[![App Store](app-store.svg)](https://itunes.apple.com/us/app/whalebird/id1378283354)

Or you can download `.dmg` from [release page](https://github.com/h3poteto/whalebird-desktop/releases).

So on, you can install from Homebrew:

```
$ brew update
$ brew install --cask whalebird
```

:sparkles: Thanks to [@singingwolfboy](https://github.com/singingwolfboy) for adding it to [homebrew-cask](https://github.com/Homebrew/homebrew-cask/blob/cf568882b6e012956ca404a16be2db36ca873002/Casks/whalebird.rb).


### Linux
There are some packages in [release page](https://github.com/h3poteto/whalebird-desktop/releases), for example `.deb`, `.rpm` and `.AppImage`.
If you do not want to use the package manager, please download `.tar.bz2` file and decompress it.

If you are using snap, please install from [snapcraft.io](https://snapcraft.io/whalebird).

```
$ sudo snap install whalebird
```

Or you can install from [Arch User Repository](https://aur.archlinux.org/packages/whalebird/).

```
$ yay -S whalebird
```


### Windows
<a href="https://apps.microsoft.com/store/detail/whalebird/9NBW4CSDV5HC"><img src="./windows-store.svg" alt= "Windows Store" width="156" height="auto"></a>


We prepared winget package and `.exe` [files](https://github.com/h3poteto/whalebird-desktop/releases), **but we don't recommend these ways**.
Because these binary is not code signed, so you will get warnings when you launch. Only Windows Store version is signed, so please use it.

```
$ winget show "Whalebird" --versions
```

## Translation
If you can speak multiple languages, could you please help with translation in [Crowdin](https://crowdin.com/project/whalebird-desktop)?

Or if you want add new language, please create an issue. I will add it.

## Development

We'd love you to contribute to Whalebird.

### Minimum requirements for development

* Node.js greater than or equal version 15.0.0 (18.x is recommended)
* npm or yarn

### Getting started

``` bash
# clone this repository
$ git clone https://github.com/h3poteto/whalebird-desktop.git
$ cd whalebird-desktop

# Install font config
$ sudo apt-get install libfontconfig-dev

# install dependencies
$ yarn install

# serve with hot reload at localhost:9080
$ yarn run dev
```

# Sponsors
<a href="https://github.com/throwException"><img src="https://github.com/throwException.png" width="60px" alt="Stefan Thöni" /></a>
<a href="https://github.com/chriscz"><img src="https://github.com/chriscz.png" width="60px" alt="Chris Coetzee" /></a>


# License
The software is available as open source under the terms of the [GPL-3.0 License](https://www.gnu.org/licenses/gpl-3.0.en.html). However, icons do not comply with this license, © Miho Fukuda.
