## Release
### Binary
When you build release packages, please use `electron-builder`.

```bash
# for linux
$ npm run build:linux

# for mac
# This command automatically loads the Developer ID Application certificate from your keychain.
$ npm run build:mac
```

### AppStore

Please prepare certificates on your Apple developer console. The following keys are required:

- Mac App Distribution: `3rd Party Mac Developer Application: NAME (TEAM_ID)`
- Mac Installer Distribution: `3rd Party Mac Developer Installer: NAME (TEAM_ID)`

and register your KeyChain.

Then, create a Mac App ID like `org.whalebird.desktop`.

```bash
$ npm run build:mas

# This command automatically loads the certificates from you keychain.
$ ./appStore.sh
```

After that, the `.pkg` file is created under `./packages`.

Please upload the `.pkg` to App Store using Application Loader in Xcode.

### Snapcraft

First, please prepare snapcraft command.

```bash
$ brew install snapcraft
```

And prepare docker environment which is used in snapcraft building.

Build app for linux.

```bash
$ npm run build:linux
```

And upload.

```bash
$ snapcraft push build/whalebird_1.0.0_amd64.snap --release stable
```
