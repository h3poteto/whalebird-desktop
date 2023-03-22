.PHONY: all install clean

VERSION = 1.0.0

all: build mac linux win32 win64

install: package.json
	yarn install

build: install
	yarn run build

mac:
	yarn run package:mac
	mv build/Whalebird-${VERSION}-mac-x64.dmg build/Whalebird-${VERSION}-darwin-x64.dmg
	mv build/Whalebird-${VERSION}-mac-arm64.dmg build/Whalebird-${VERSION}-darwin-arm64.dmg
	cd build; shasum -a 256 Whalebird-${VERSION}-darwin-x64.dmg | awk '{ print $1 }' > Whalebird-${VERSION}-darwin-x64.dmg.shasum
	cd build; shasum -a 256 Whalebird-${VERSION}-darwin-arm64.dmg | awk '{ print $1 }' > Whalebird-${VERSION}-darwin-arm64.dmg.shasum

mas:
	yarn run build:clean
	yarn run package:mas

linux:
	yarn run package:linux
	mv build/Whalebird-${VERSION}-linux-amd64.deb build/Whalebird-${VERSION}-linux-x64.deb
	mv build/Whalebird-${VERSION}-linux-x86_64.rpm build/Whalebird-${VERSION}-linux-x64.rpm
	mv build/Whalebird-${VERSION}-linux-x86_64.AppImage build/Whalebird-${VERSION}-linux-x64.AppImage
	cd build; sha256sum Whalebird-${VERSION}-linux-arm64.tar.bz2 | awk '{ print $1 }' > Whalebird-${VERSION}-linux-arm64.tar.bz2.shasum
	cd build; sha256sum Whalebird-${VERSION}-linux-x64.AppImage | awk '{ print $1 }' > Whalebird-${VERSION}-linux-x64.AppImage.shasum
	cd build; sha256sum Whalebird-${VERSION}-linux-x64.deb | awk '{ print $1 }' > Whalebird-${VERSION}-linux-x64.deb.shasum
	cd build; sha256sum Whalebird-${VERSION}-linux-x64.rpm | awk '{ print $1 }' > Whalebird-${VERSION}-linux-x64.rpm.shasum
	cd build; sha256sum Whalebird-${VERSION}-linux-x64.tar.bz2 | awk '{ print $1 }' > Whalebird-${VERSION}-linux-x64.tar.bz2.shasum

win32:
	yarn run package:win32
	mv build/Whalebird-${VERSION}-win-ia32.exe build/Whalebird-${VERSION}-windows-ia32.exe
	cd build; sha256sum Whalebird-${VERSION}-windows-ia32.exe | awk '{ print $1 }' > Whalebird-${VERSION}-windows-ia32.exe.shasum

win64:
	yarn run package:win64
	mv build/Whalebird-${VERSION}-win-x64.exe build/Whalebird-${VERSION}-windows-x64.exe
	cd build; sha256sum Whalebird-${VERSION}-windows-x64.exe | awk '{ print $1 }' > Whalebird-${VERSION}-windows-x64.exe.shasum

clean:
	yarn run build:clean
