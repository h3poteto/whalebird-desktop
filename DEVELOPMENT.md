## Release
### Build
At first, you have to build.

```bash
$ make build
```

This command only generate javascript codes for Electron, so if you want to create release package, please read following document.

### Binary
I use `electron-builder` to create package, but it is hidden by Makefile. So you can use make command.

```bash
# for linux
$ make linux VERSION=2.8.0

# for 64 bit Windows
$ make wi64 VERSION=2.8.0
```

You have to use macOS to build packages for macOS.
And you have to install certificates for Mac Application.

- Mac App Distribution: `Developer ID Application: Akira Fukushima (DR9TBDD8DFM)`
- Mac App Installer Distribution: `Developer ID Appplication: Akira Fukushima (DR9TBDD8DFM)`

Then use make command.

```bash
# for mac
$ make mac VERSION=2.8.0
```
This command automatically loads the Developer ID Application certificate from your keychain.
If you want to specify a certificate, please set `CSC_NAME` before this command.


```bash
$ export CSC_NAME="Akira Fukushima (DR9TBDD8DFM)"
$ make mac VERSION=2.8.0
```

### AppStore

Please prepare certificates on your Apple developer console. The following keys are required:

- Mac App Distribution: `3rd Party Mac Developer Application: Akira Fukushima (DR9TBDD8DFM)`
- Mac Installer Distribution: `3rd Party Mac Developer Installer: Akira Fukushima (DR9TBDD8DFM)`

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
or

```bash
$ snap install snapcraft --classic
```

Build command for linux generates a snap file.

```bash
$ make linux VERSION=2.8.0
```

And upload.

```bash
$ snapcraft push build/Whalebird-2.8.0-linux-amd64.snap  --release beta
```
