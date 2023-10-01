# Whalebird
[![Build](https://github.com/h3poteto/whalebird-desktop/actions/workflows/build.yml/badge.svg)](https://github.com/h3poteto/whalebird-desktop/actions/workflows/build.yml)
[![GitHub release](http://img.shields.io/github/release/h3poteto/whalebird-desktop.svg)](https://github.com/h3poteto/whalebird-desktop/releases)
[![Mac App Store](https://img.shields.io/itunes/v/6445864587)](https://apps.apple.com/us/app/whalebird/id6445864587)
[![AUR version](https://img.shields.io/aur/version/whalebird)](https://aur.archlinux.org/packages/whalebird/)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-blue.svg)](https://dependabot.com)
[![Crowdin](https://badges.crowdin.net/whalebird/localized.svg)](https://crowdin.com/project/whalebird)


Whalebird is a Fediverse client app for desktop.

![demo](screenshot.png)

## Feature

- An interface like slack
- Notify to desktop
- Streaming
- Many keyboard shortcuts
- Manage multiple accounts
- Supporting
    - Mastodon
    - Pleroma
    - Friendica
    - Firefish

### Shortcuts

<table>
<thead>
<tr><th></th><th>Mac</th><th>Linux, Windows</th></tr>
</thead>
<tbody>
<tr><td> Toot, Reply                     </td><td>             <kbd>Cmd + Enter</kbd>         </td><td> <kbd>Ctrl + Enter</kbd>      </td></tr>
<tr><td> Change accounts                 </td><td>             <kbd>Cmd + 1, 2, 3...</kbd>    </td><td> <kbd>Ctrl + 1, 2, 3...</kbd> </td></tr>
<tr><td> Jump to another timeline        </td><td>             <kbd>Cmd + k</kbd>             </td><td> <kbd>Ctrl + k</kbd>          </td></tr>
<tr><td> Reload current timeline         </td><td>             <kbd>Cmd + r</kbd>             </td><td> <kbd>Ctrl + r</kbd>          </td></tr>
<tr><td> Select next post                </td><td>             <kbd>j</kbd>                   </td><td> <kbd>j</kbd>          </td></tr>
<tr><td> Select previous post            </td><td>             <kbd>k</kbd>                   </td><td> <kbd>k</kbd>          </td></tr>
<tr><td> Reply to the post               </td><td>             <kbd>r</kbd>                   </td><td> <kbd>r</kbd>          </td></tr>
<tr><td> Reblog the post                 </td><td>             <kbd>b</kbd>                   </td><td> <kbd>b</kbd>          </td></tr>
<tr><td> Favourite the post              </td><td>             <kbd>f</kbd>                   </td><td> <kbd>f</kbd>          </td></tr>
<tr><td> Open details of the post        </td><td>             <kbd>o</kbd>                   </td><td> <kbd>o</kbd>          </td></tr>
<tr><td> Open account profile of the post</td><td>             <kbd>p</kbd>                   </td><td> <kbd>p</kbd>          </td></tr>
<tr><td> Open the images                 </td><td>             <kbd>i</kbd>                   </td><td> <kbd>i</kbd>          </td></tr>
<tr><td> Show/hide CW and NSFW           </td><td>             <kbd>x</kbd>                   </td><td> <kbd>x</kbd>          </td></tr>
<tr><td> Close current page              </td><td>             <kbd>esc</kbd>                 </td><td> <kbd>esc</kbd>        </td></tr>
<tr><td> Show shortcut keys              </td><td>             <kbd>?</kbd>                   </td><td> <kbd>?</kbd>           </td></tr>
</tbody>
</table>

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

If you are using flatpak, please install from
[flathub.org](https://flathub.org/apps/details/social.whalebird.WhalebirdDesktop).

```
$ flatpak install social.whalebird.WhalebirdDesktop
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
If you can speak multiple languages, could you please help with translation in [Crowdin](https://crowdin.com/project/whalebird)?

Or if you want add new language, please create an issue. I will add it.

## Development

We'd love you to contribute to Whalebird.

### Minimum requirements for development

* Node.js greater than or equal version 15.0.0 (16.x is recommended)
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

# License
The software is available as open source under the terms of the [GPL-3.0 License](https://www.gnu.org/licenses/gpl-3.0.en.html). However, icons do not comply with this license, © Miho Fukuda.
