.PHONY: all install clean

VERSION = 1.0.0

all: install mac linux windows

install: package.json
	npm install

mac:
	npm run build:mac
	mv build/Roma-${VERSION}-mac.dmg build/Roma-${VERSION}-darwin-x64.dmg

linux:
	npm run build:linux
	mv build/Roma-${VERSION}-linux.deb build/Roma-${VERSION}-linux-x64.deb
	mv build/Roma-${VERSION}-linux.rpm build/Roma-${VERSION}-linux-x64.rpm
	mv build/Roma-${VERSION}-linux.tar.bz2 build/Roma-${VERSION}-linux-x64.tar.bz2

windows:
	npm run build:windows
	mv build/Roma-${VERSION}-win.exe build/Roma-${VERSION}-windows-x64.exe

clean:
	npm run build:clean
