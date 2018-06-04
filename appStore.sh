#!/bin/zsh -f

# Name of your app.
APP="Whalebird"
# The path of your app to sign.
APP_PATH="./packages/Whalebird-mas-x64/Whalebird.app"
# The path to the location you want to put the signed package.
RESULT_PATH="./packages/$APP.pkg"
# The name of certificates you requested.
APP_KEY="3rd Party Mac Developer Application: Akira Fukushima (HB4N6B2YVM)"
INSTALLER_KEY="3rd Party Mac Developer Installer: Akira Fukushima (HB4N6B2YVM)"
# The path of your plist files.
CHILD_PLIST="./plist/child.plist"
PARENT_PLIST="./plist/parent.plist"
LOGINHELPER_PLIST="./plist/loginhelper.plist"

FRAMEWORKS_PATH="$APP_PATH/Contents/Frameworks"

# At first, rename app.asar.unpacked directory.
# Because electron-builder does not store app.asar.unpacked directory.
# I want to store unpacked files at the same directory as electron-builder.
mv $APP_PATH/Contents/Resources/app.asar.unpacked/* $APP_PATH/Contents/Resources/

codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Electron Framework"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libffmpeg.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libnode.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper.app/Contents/MacOS/$APP Helper"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper.app/"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper EH.app/Contents/MacOS/$APP Helper EH"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper EH.app/"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper NP.app/Contents/MacOS/$APP Helper NP"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper NP.app/"
codesign -s "$APP_KEY" -f --entitlements "$LOGINHELPER_PLIST" "$APP_PATH/Contents/Library/LoginItems/$APP Login Helper.app/Contents/MacOS/$APP Login Helper"
codesign -s "$APP_KEY" -f --entitlements "$LOGINHELPER_PLIST" "$APP_PATH/Contents/Library/LoginItems/$APP Login Helper.app/"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$APP_PATH/Contents/MacOS/$APP"
codesign -s "$APP_KEY" -f --entitlements "$PARENT_PLIST" "$APP_PATH"

productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_KEY" "$RESULT_PATH"
