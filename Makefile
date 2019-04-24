.PHONY: all install clean

VERSION = 1.0.0

all: install mac linux win32 win64

install: package.json
	npm install

mac:
	npm run build:mac
	mv build/Whalebird-${VERSION}-mac.dmg build/Whalebird-${VERSION}-darwin-x64.dmg

linux:
	npm run build:linux
	mv build/Whalebird-${VERSION}-linux-amd64.deb build/Whalebird-${VERSION}-linux-x64.deb
	mv build/Whalebird-${VERSION}-linux-x86_64.rpm build/Whalebird-${VERSION}-linux-x64.rpm
	mv build/Whalebird-${VERSION}-linux-i386.deb build/Whalebird-${VERSION}-linux-ia32.deb
	mv build/Whalebird-${VERSION}-linux-i686.rpm build/Whalebird-${VERSION}-linux-ia32.rpm

win32:
	npm run build:win32
	mv build/Whalebird-${VERSION}-win.exe build/Whalebird-${VERSION}-windows-ia32.exe

win64:
	npm run build:win64
	mv build/Whalebird-${VERSION}-win.exe build/Whalebird-${VERSION}-windows-x64.exe

clean:
	npm run build:clean
