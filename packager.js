const packager = require('electron-packager')
const { rebuild } = require('@electron/rebuild')
const path = require("path")

packager({
  appBundleId: "social.whalebird.app",
  appCategoryType: "public.app-category.social-networking",
  appCopyright: "Akira Fukushima",
  appVersion: "5.0.2",
  arch: ["universal"],
  asar: {
    unpackDir: path.join('**', '{build/sounds,build/icons}', '*')
  },
  buildVersion: "157",
  dir: "./",
  electronVersion: "20.3.12",
  extendInfo: "plist/team.plist",
  icon: "build/icons/icon.icns",
  name: "Whalebird",
  out: "packages",
  overwrite: true,
  platform: "mas",
  afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    console.log("rebuilding")
    rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((error) => callback(error));
  }],
  // … other options
});
