.PHONY: release-build package
VERSION = 0.0.0
PLATFORM = linux

ICON = ""
ifeq (${PLATFORM}, darwin)
	ICON = "--icon=./build/icons/whalebird.icns"
endif
ifeq (${PLATFORM}, windows)
	ICON = "--icon=./build/icons/whalebird.ico"
endif

all: release-build package
release-build: package.json
	npm run pack
package: release-build
	electron-packager ./ whalebird --platform=${PLATFORM} --arch=x64 --electron-version=1.8.3  --build-version=${VERSION} --asar --out=packages --ignore="^/src" --ignore="^/test" --ignore="^/.electron-vue" --ignore="^/.envrc" --prune=true ${ICON}
