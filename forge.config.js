const fs = require("fs-extra");
const Zip = require("adm-zip");

module.exports = {
  "forge": "./forge.config.js",
  "packagerConfig": {
    "icon": "./src/assets/icon.ico",
    "executableName": "RyuSAK"
  },
  "makers": [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "setupIcon": "./src/assets/icon.ico"
      }
    },
    {
      "name": "@electron-forge/maker-zip"
    },
    {
      "name": "@electron-forge/maker-deb"
    },
    {
      "name": "@electron-forge/maker-rpm"
    }
  ],
  "plugins": [
    {
      "name": "@electron-forge/plugin-webpack",
      "config": {
        "mainConfig": "./webpack.main.config.js",
        "renderer": {
          "config": "./webpack.renderer.config.js",
          "entryPoints": [
            {
              "html": "./src/index.html",
              "js": "./src/renderer.ts",
              "name": "main_window"
            }
          ]
        }
      }
    }
  ],
  "hooks": {
    "postMake": async (_, makeResults) => {
      const zipPath = makeResults.map(result => result.artifacts).flat().find(path => path.endsWith(".zip"));

      if (zipPath) {
        const zip = new Zip(zipPath);
        zip.addFile("portable", Buffer.from("portable", "utf8"));

        fs.removeSync(zipPath);
        zip.writeZip(zipPath);
      }
    }
  }
};
