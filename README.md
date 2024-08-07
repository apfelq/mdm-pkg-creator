# MDM-PKG-CREATOR

A small utility to download apps for macOS from the Internet and create a PKG that can be distributed via MDM or other means.

## 1. Requirements

### 1.1 Xcode

- install Xcode via AppStore or on older systems via <https://developer.apple.com>, also check <https://xcodereleases.com/>
- install Command Line Tools via `xcode-select --install`

#### 1.2.1 Install tools via brew (recommended)

- install brew, for instructions visit <https://brew.sh>
- install the following:

```bash
brew install duck node npm suspicious-package
```

- optional but recommended

```
brew install curl wget
```

#### 1.2.2 Install tools directly from their maintainers

- get duck: <https://dist.duck.sh/>
- get NodeJS: <https://nodejs.org/>
- get Suspicious Package: <https://www.mothersruin.com/software/SuspiciousPackage/>

### 1.3 Text editor

I also recommend a decent editor:

- BBEdit from Website, via AppStore or brew: `brew install --cask bbedit`
- Visual Studio Code from Website or via brew: `brew install --cask visual-studio-code`

## 2. Installation

```bash
cd ~/dir/of/your/choice
git clone https://github.com/apfelq/mdm-pkg-creator
cd mdm-pkg-creator
npm ci
```

In case you're going to use the functionality to install pkg's you need to give the user privileges to run installer as root without password

```
cat <<EOF | sudo tee /etc/sudoers.d/mdm-pkg-creator
$(whoami) ALL = NOPASSWD: /usr/sbin/installer
EOF
```

## 3. Configuration

The tool expects 3 files:

- `config.yaml` (setup mail notifications and/or ftp upload)
- `config-apps.yaml` (setup the app configurations)
- `config-tenants.yaml` (link apps and clients)

Have a look at

- `config.example.yaml`
- `config-apps.example.yaml`
- `config-tenants.example.yaml`

on how to set them up. If you add app configs, please share.

### 3.1 config

You can upload to any of the services supported by `duck` (see `duck --help` and <https://docs.duck.sh/protocols/>).

### 3.2 config-apps

Currently there are 2 types of downloads:

- direct (you have a permalink to a file which doesn't change)
- scrape (you first need to scrape the version number from a website in order to download a file)

#### 3.2.1 Minimum config

You need to provide at least the following information:

- appName (the app name in the file system after installation, use Terminal if in doubt, e. g. `calibre.app`)
- downloadType (currently `direct` or `scrape`)
- downloadFileType (the file that is downloaded, currently `dmg`, `pkg`, `zip`)
- \<dmg|zip\>FileType (what is expected side a downloaded `dmg`, `zip`; can be `app` or `pkg`)
- downloadUrl (the download URL, in case of type `scrape` replace the dynamic part with `%VERSION%`, e. g. `https://update.cyberduck.io/Cyberduck-%VERSION%.zip`)
  
*In case of type scrape you need to configure the following additional settings:*

- scrapeUrl (the URL where can scrape the version/dynamic information, use capturing groups)
- scrapeRegex (a regular expression to find the version/dynamic information, make sure to match everything by putting `[\s\S]*` at the beginning and end of your expression and work with capturing groups)

#### 3.2.2 Optional config

- downloadTool (`curl`, `wget`), per default the tool uses `got` to download and falls back to curl

## 4. Execute

Simply execute the script by typing `npm start` or `./mdm-pkg-creator.sh`.

There is also an example for a `launchd` job so you could run this script on a regular basis.

Make sure you grant full disk access to `/bin/sh` in macOS' "great" Security & Privacy settings.

## 