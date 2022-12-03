# RyuSAK

![showDownloads](https://img.shields.io/github/downloads/Ecks1337/RyuSAK/total?style=for-the-badge)
![showVersion](https://img.shields.io/github/package-json/v/Ecks1337/RyuSAK?style=for-the-badge)
![showLicense](https://img.shields.io/github/license/Ecks1337/RyuSAK?style=for-the-badge)

<p align="center">
  <img width="80%" alt="screenshot" src="https://raw.githubusercontent.com/Ecks1337/RyuSAK/master/screenshot.png" />
</p>

## Installation
Just go to the [releases](https://github.com/Ecks1337/RyuSAK/releases) page and download the latest build for your OS.
The Windows build also comes with an auto update feature.

### Windows

#### Install
Download the `RyuSAK-X.Y.Z.Setup.exe` file, then install it by running the installer

#### Portable
Download the `RyuSAK-win32-x64-X.Y.Z.zip` file, then unzip it to your chosen location

### macOS (arm64)

#### Install
Download the `RyuSAK-X.Y.Z-arm64.dmg` file, then install it by opening the file and draging the RyuSAK icon into the Applications folder

#### Portable
Download the `RyuSAK-darwin-arm64-X.Y.Z.zip` file, then unzip it to your chosen location

### Linux

#### Arch Linux
Soon™

#### Debian
Download the `ryusak_X.Y.Z_amd64.deb` file, then install it with `sudo dpkg -i ./ryusak_X.Y.Z_amd64.deb`

#### Red Hat Linux
Download the `RyuSAK-X.Y.Z-1.x86_64.rpm` file, then install it with `sudo rpm -i /RyuSAK-X.Y.Z-1.x86_64.rpm`

#### Portable
Download the `RyuSAK-linux-x64-X.Y.Z.zip` file, then unzip it to your chosen location

## Features
* Add one or multiple Ryujinx folders (where `Ryujinx.exe` is located) to manage different builds (such as mainline, portable, LDN, etc.) 
* List your game library
* Display your local shaders count & RyuSAK shaders count (to download them if you have fewer shaders)
* Update firmware
* Update production keys
* Download saves for a specific game
* Download shaders for a specific game
* Downloads mods for a specific game
* You can share shaders in just one click if you have more shaders than RyuSAK

## Contributing
Requirements:
* NodeJS v14.20.0

Install dependencies: `npm install --include=dev`

Run local build: `npm start`

## Credits
* CapitaineJSparrow for creating the original [emusak-ui](https://github.com/CapitaineJSparrow/emusak-ui) project
* Ecchibitionist for hosting the firmware, saves, shaders and mods on his CDN
