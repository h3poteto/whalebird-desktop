.PHONY: install release-build package
VERSION = 0.0.0
PLATFORM = linux
CERTNAME = ""

ICON = ""
CERT = ""
ifeq (${PLATFORM}, darwin)
	ICON = --icon=./build/icons/whalebird.icns
	CERT = --sign='${CERTNAME}'
endif
ifeq (${PLATFORM}, win32)
	ICON = --icon=./build/icons/icon.ico
endif

all: install release-build package
install: package.json
	npm install
release-build: package.json
	npm run pack
package: release-build
	electron-packager ./ whalebird --platform=${PLATFORM} --arch=x64 --electron-version=1.8.3  --build-version=${VERSION} --asar --out=packages --ignore="^/src" --ignore="^/test" --ignore="^/.electron-vue" --ignore="^/.envrc" --ignore="^/.git" --prune=true $(ICON) $(CERT) --overwrite
