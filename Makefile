.PHONY: all install clean

VERSION = 1.0.0

all: install mac linux windows

install: package.json
	npm install

mac:
	npm run build:mac
	mv build/Whalebird-${VERSION}-mac.dmg build/Whalebird-${VERSION}-darwin-x64.dmg

linux:
	npm run build:linux
	mv build/Whalebird-${VERSION}-linux.deb build/Whalebird-${VERSION}-linux-x64.deb
	mv build/Whalebird-${VERSION}-linux.rpm build/Whalebird-${VERSION}-linux-x64.rpm
	mv build/Whalebird-${VERSION}-linux.tar.bz2 build/Whalebird-${VERSION}-linux-x64.tar.bz2

windows:
	npm run build:windows
	mv build/Whalebird-${VERSION}-win.exe build/Whalebird-${VERSION}-windows-x64.exe

clean:
	npm run build:clean
