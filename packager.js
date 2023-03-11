const packager = require('electron-packager')
const { rebuild } = require('@electron/rebuild')


packager({
  appBundleId: "social.whalebird.app",
  appCategoryType: "public.app-category.social-networking",
  appCopyright: "Akira Fukushima",
  appVersion: "5.0.2",
  arch: ["universal"],
  asar: {
    unpackDir: "build/sounds"
  },
  buildVersion: "158",
  dir: "./",
  electronVersion: "20.3.12",
  extendInfo: "plist/team.plist",
  icon: "build/icons/icon.icns",
  ignore: [
    "^/src",
    "^/\.electron-vue",
    "^/\.envrc",
    "^/packages",
    "^/plist",
    "^/static",
  ],
  name: "Whalebird",
  out: "packages",
  overwrite: true,
  platform: "mas",
  prune: true,
  afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    console.log(`rebuilding native dependency electronVersion=${electronVersion} platform=${platform} arch=${arch}`)
    rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((error) => callback(error));
  }],
});
