# whalebird

Whalebird is a mastodon client for desktop application. If you want to use release build, please download from [release page](https://github.com/h3poteto/whalebird-desktop/releases).

![demo](screenshot.png)

## Feature

- Slack like interface
- Notify to desktop
- Streaming
- Many keyboard shortcuts
- Manage multiple accounts

### Shortcuts

<table>
<thead>
<tr><th></th><th>OSX</th><th>Linux, Windows</th></tr>
</thead>
<tbody>
<tr><td> Toot, Reply                    </td><td>             <kbd>Cmd + Enter</kbd>         </td><td> <kbd>Ctrl + Enter</kbd>      </td></tr>
<tr><td> Change accounts                </td><td>             <kbd>Cmd + 1, 2, 3...</kbd>    </td><td> <kbd>Ctrl + 1, 2, 3...</kbd> </td></tr>
<tr><td> Jump to another timeline       </td><td>             <kbd>Cmd + k</kbd>             </td><td> <kbd>Ctrl + k</kbd>          </td></tr>
<tr><td> Open new toot window           </td><td>             <kbd>Cmd + n</kbd>             </td><td> <kbd>Ctrl + n</kbd>          </td></tr>
</tbody>
</table>

## Install
### Mac

Download from [release page](https://github.com/h3poteto/whalebird-desktop/releases), and to decompress. I recommend that you move `whalebird.app` to `/Applications`.

Please wait for distribute in Mac app store, I'm preparing.

### Linux

Download from [release page](https://github.com/h3poteto/whalebird-desktop/releases), and to decompress. I'm preparing deb and rmp packages.

### Windows

TODO.
Please wait...

## Development

``` bash
# clone this repository
$ git clone https://github.com/h3poteto/whalebird-desktop.git
$ cd whalebird-desktop

# install dependencies
$ npm install

# serve with hot reload at localhost:9080
$ npm run dev
```

## Release

I prepared Makefile for production release.

```bash
# for linux
$ make VERSION=0.1.0 PLATFORM=linux

# for mac
$ make VERSION=0.1.0 PLATFORM=darwin CERTNAME="Develper ID Application: NAME (ID)"
```

# License
The software is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
