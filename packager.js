const packager = require('electron-packager')
const { rebuild } = require('@electron/rebuild')

packager({
  appBundleId: "social.whalebird.app",
  appCategoryType: "public.app-category.social-networking",
  appCopyright: "Akira Fukushima",
  appVersion: "5.0.1",
  arch: ["arm64"],
  asar: {
    unpackDir: "build/sounds"
  },
  buildVersion: "156",
  dir: "./",
  electronVersion: "20.3.12",
  extendInfo: "plist/team.plist",
  icon: "build/icons/icon.icns",
  name: "Whalebird",
  out: "packages",
  overwrite: true,
  platform: "mas",
  afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((error) => callback(error));
  }],
  // … other options
});
