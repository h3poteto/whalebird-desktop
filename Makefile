.PHONY: all install clean

VERSION = 1.0.0

all: build mac linux win32 win64

install: package.json
	npm install

build: install
	npm run build

mac:
	npm run package:mac
	mv build/Roma-${VERSION}-mac.dmg build/Roma-${VERSION}-darwin-x64.dmg

mas:
	npm run build:mas
	./appStore.sh

linux:
	npm run package:linux
	mv build/Roma-${VERSION}-linux-amd64.deb build/Roma-${VERSION}-linux-x64.deb
	mv build/Roma-${VERSION}-linux-x86_64.rpm build/Roma-${VERSION}-linux-x64.rpm
	mv build/Roma-${VERSION}-linux-i386.deb build/Roma-${VERSION}-linux-ia32.deb
	mv build/Roma-${VERSION}-linux-i686.rpm build/Roma-${VERSION}-linux-ia32.rpm
	mv build/Roma-${VERSION}-linux-x86_64.AppImage build/Roma-${VERSION}-linux-x64.AppImage

win32:
	npm run package:win32
	mv build/Roma-${VERSION}-win.exe build/Roma-${VERSION}-windows-ia32.exe

win64:
	npm run package:win64
	mv build/Roma-${VERSION}-win.exe build/Roma-${VERSION}-windows-x64.exe

clean:
	npm run build:clean
