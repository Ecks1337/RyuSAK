import { URL } from "url";
import fetch from "./fetchProxy";
import pRetry from "p-retry";
import { app, BrowserWindow, ipcMain } from "electron";
import http from "http";
import https from "https";
import dns from "dns/promises";
import fs from "fs-extra";
import { hasDnsFile } from "../../index";
import { MirrorDirMeta } from "../../types";
import Enumerable from "linq";

const CDN_URL: string = "https://mirror.lewd.wtf";

export enum HTTP_PATHS {
  FIRMWARE_LIST     = "/archive/nintendo/switch/firmware/?format=json",
  FIRMWARE_ZIP      = "/archive/nintendo/switch/firmware/Firmware {fw_version}.zip",
  MODS_TITLE_LIST   = "/archive/nintendo/switch/mods/?format=json",
  MODS_VERSION_LIST = "/archive/nintendo/switch/mods/{title_id}/?format=json",
  MODS_LIST         = "/archive/nintendo/switch/mods/{title_id}/{version}/?format=json",
  MOD_DOWNLOAD      = "/archive/nintendo/switch/mods/{title_id}/{version}/{name}/?format=json",
  SAVES_PATH        = "/archive/nintendo/switch/savegames/",
  SHADERS_LIST      = "/archive/nintendo/switch/ryusak/shader_count.json",
  SHADER_ZIP        = "/archive/nintendo/switch/shaders/ogl/{title_id}.zip",
  THRESHOLD         = "/archive/nintendo/switch/ryusak/threshold.txt",
}

export enum OTHER_URLS {
  RELEASE_INFO = "https://api.github.com/repos/Ecks1337/RyuSAK/releases/latest",
  ESHOP_DATA   = "https://raw.githubusercontent.com/blawar/titledb/master/US.en.json",
  KEYS         = "http://emusak.coveforme.com/firmware/prod.keys",
}

// CloudFlare DNS https://1.1.1.1/dns/
// Resolve an issue where server cannot be reached in rare cases
dns.setServers([
  "1.1.1.1",
  "[2606:4700:4700::1111]",
]);

const staticLookup = async (hostname: string, _: null, cb: Function) => {
  const ips = await dns.resolve(hostname);

  if (ips.length === 0) {
    console.error(`Cannot resolve ${hostname}`);
  }

  cb(null, ips[0], 4);
};

//TODO: change function into variable after removing http dependency
const httpAgent = (useTLS: boolean = true) => {
  const httpModule = useTLS ? https : http;
  const lookupFunc = hasDnsFile ? staticLookup : undefined;

  return new httpModule.Agent({ lookup: lookupFunc });
};

class HttpService {
  // Trigger HTTP request using an exponential backoff strategy
  protected _fetch(path: string, contentType: "JSON" | "TXT" | "BUFFER" = "JSON", baseUrl: string = CDN_URL, defaultValue = {}, retries = 5) {
    const url = new URL(path, baseUrl);
    return pRetry(
      async () => {
        const response = await fetch(url.href, {
          ...defaultValue,
          ...{
            agent: httpAgent(url.href.includes("https:"))
          }
        });

        if (response.status >= 400) {
          throw new pRetry.AbortError(response.statusText);
        }

        if (contentType === "JSON") {
          return response.json();
        }

        if (contentType === "BUFFER") {
          return response.arrayBuffer();
        }

        return response.text();
      },
      { retries }
    ) as Promise<any>;
  }

  public async fetchWithProgress(path: string, destPath: string, mainWindow: BrowserWindow, eventName: string) {
    const url = new URL(path, CDN_URL);
    const fileStream = fs.createWriteStream(destPath);
    const controller = new AbortController();

    const response = await fetch(url.href, {
      signal: controller.signal,
      agent: httpAgent(url.href.includes("https:"))
    });

    let chunkLength = 0;
    let lastEmittedEventTimestamp = 0;
    const contentLength = +(response.headers.get("content-length"));
    const startTime = Date.now();

    ipcMain.on("cancel-download", async (_, abortKey: string) => {
      if (abortKey !== eventName) return;
      fileStream.close();
      await fs.unlink(destPath).catch(() => null);
      controller.abort();
    });

    return new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on("error", reject);
      response.body.on("data", (chunk) => {
        chunkLength += chunk.length;
        const percentage = chunkLength / contentLength * 100;
        const currentTimestamp = +new Date();
        const timeRange = currentTimestamp - startTime;
        const downloadSpeed = chunkLength / timeRange / 1024;

        // Throttle event to 1 time every 100ms
        if (currentTimestamp - lastEmittedEventTimestamp >= 200) {
          mainWindow.webContents.send("download-progress", eventName, percentage.toFixed(2), +downloadSpeed.toFixed(2));
          lastEmittedEventTimestamp = currentTimestamp;
        }
      });
      fileStream.on("finish", () => resolve(destPath));
    }).catch(() => null);
  }

  public async downloadRyujinxShaderList() {
    return this._fetch(HTTP_PATHS.SHADERS_LIST);
  }

  public async downloadSaveList() {
    return this._fetch(HTTP_PATHS.SAVES_PATH + "?format=json");
  }

  public async downloadModsTitleList() {
    return this._fetch(HTTP_PATHS.MODS_TITLE_LIST);
  }

  public async getThreshold() {
    return this._fetch(HTTP_PATHS.THRESHOLD, "TXT").catch(() => 1E7);
  }

  public async getFirmwareVersion() {
    const firmwareJson = await this._fetch(HTTP_PATHS.FIRMWARE_LIST) as MirrorDirMeta;
    const fileName = Enumerable.from(firmwareJson).where(entry => entry.type == "file").last().name;

    return fileName.substring(9, fileName.length - 11);
  }

  public async getLatestApplicationVersion() {
    const versionResponse = await this._fetch(OTHER_URLS.RELEASE_INFO).catch(() => null);
    if (!versionResponse) {
      // If we cannot fetch the latest version return the current version to avoid trigger logic when ryusak is not up to date
      return app.getVersion();
    }

    return versionResponse.tag_name.replace("v", "");
  }

  public async downloadKeys() {
    return this._fetch(OTHER_URLS.KEYS, "TXT");
  }

  public async downloadEshopData() {
    return this._fetch(OTHER_URLS.ESHOP_DATA);
  }

  public async getRyujinxCompatibility(term: string) {
    // do not use this._fetch because we do not want exponential backoff strategy since GitHub api is limited to 10 requests per minute for unauthenticated requests
    return fetch(`https://api.github.com/search/issues?q=${term}%20repo:Ryujinx/Ryujinx-Games-List`, {
      agent: httpAgent()
    }).then(r => r.json());
  }

  public async getModVersions(titleId: string) {
    return this._fetch(HTTP_PATHS.MODS_VERSION_LIST.replace("{title_id}", titleId));
  }

  public async getModsForVersion(titleId: string, version: string) {
    return this._fetch(HTTP_PATHS.MODS_LIST.replace("{title_id}", titleId).replace("{version}", version));
  }

  public async getModName(titleId: string, version: string, name: string): Promise<{ modName: string, url: string }> {
    const path = HTTP_PATHS.MOD_DOWNLOAD
                           .replace("{title_id}", titleId)
                           .replace("{version}", encodeURIComponent(version))
                           .replace("{name}", encodeURIComponent(name));

    const mod = (await this._fetch(path)) as MirrorDirMeta;

    if (!mod[0]) {
      return;
    }

    const url = new URL(`${path}${encodeURIComponent(mod[0].name)}`, CDN_URL);

    return {
      modName: mod[0].name,
      url: url.href
    };
  }

  public async downloadSave(fileName: string) {
    return this._fetch(HTTP_PATHS.SAVES_PATH + fileName, "BUFFER");
  }

  public async searchGameBana(query: string) {
    return this._fetch(
      `/apiv7/Util/Game/NameMatch?_sName=${query}&_nPerpage=10&_nPage=1`,
      "JSON",
      "https://gamebanana.com",
      {},
      1
    );
  }
}

export default new HttpService();
