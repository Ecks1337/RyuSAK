import { ipcMain, BrowserWindow } from "electron";
import loadComponentIpcHandler from "./loadComponent.ipc";
import {
  getRyujinxPath,
  scanGamesForConfig,
  deleteGameProps,
  deleteGame
} from "./emulatorFilesystem";
import getDirectory from "./getDirectory.ipc";
import installFirmware from "./firmware.ipc";
import { installKeys } from "./installKeys";
import EShopMetaService from "../services/EShopMetaService";
import openFolderForGame, { openFolderIPCProps } from "./openFolderForGame";
import ryujinxCompatibility, { ryujinxCompatibilityProps } from "./ryujinxCompatibility";
import savesDownloads from "./savesDownload";
import {
  downloadMod,
  downloadModProps,
  getModsListForVersion,
  getModsListForVersionProps,
  getModsVersions,
  getModsVersionsProps
} from "./modsDownload";
import { countShaders, countShadersProps, installShaders, installShadersProps, shareShaders } from "./shaders";
import { searchGameBanana, searchProps } from "./gamebanana";
import { setProxy } from "./settings.ipc";

export type IPCCalls = {
  "load-components": Promise<ReturnType<typeof loadComponentIpcHandler>>,
  "get-directory": Promise<ReturnType<typeof getDirectory>>,
  "scan-games": Promise<ReturnType<typeof scanGamesForConfig>>,
  "build-metadata-from-titleId": Promise<ReturnType<typeof EShopMetaService.getEShopMeta>>,
  "install-firmware": Promise<ReturnType<typeof installFirmware>>,
  "install-keys": Promise<ReturnType<typeof installKeys>>,
  "update-eshop-data": ReturnType<typeof EShopMetaService.updateEShopData>,
  "openFolderForGame": ReturnType<typeof openFolderForGame>,
  "getRyujinxCompatibility": ReturnType<typeof ryujinxCompatibility>,
  "downloadSave": ReturnType<typeof savesDownloads>,
  "get-mods-versions": ReturnType<typeof getModsVersions>,
  "get-mods-list-for-version": ReturnType<typeof getModsListForVersion>,
  "download-mod": ReturnType<typeof downloadMod>,
  "count-shaders": ReturnType<typeof countShaders>,
  "install-shaders": ReturnType<typeof installShaders>,
  "share-shaders": ReturnType<typeof shareShaders>,
  "search-gamebanana": ReturnType<typeof searchGameBanana>,
  "delete-game": ReturnType<typeof deleteGame>,
  "set-proxy": ReturnType<typeof setProxy>,
  "get-ryujinx-appdata-path": ReturnType<typeof getRyujinxPath>,
};

const makeIpcRoutes = (mainWindow: BrowserWindow) => {
  ipcMain.handle("load-components", async (_) => loadComponentIpcHandler());
  ipcMain.handle("get-directory", async (_) => getDirectory(mainWindow));
  ipcMain.handle("scan-games", async (_, dataPath: string) => scanGamesForConfig(dataPath));
  ipcMain.handle("build-metadata-from-titleId", async (_, titleId: string) => EShopMetaService.getEShopMeta(titleId));
  ipcMain.handle("install-firmware", async (_, dataPath: string, fwVersion: string) => installFirmware(dataPath, fwVersion, mainWindow));
  ipcMain.handle("install-keys", async (_, dataPath: string) => installKeys(dataPath));
  ipcMain.handle("update-eshop-data", async () => EShopMetaService.updateEShopData());
  ipcMain.handle("openFolderForGame", async (_, ...args: openFolderIPCProps) => openFolderForGame(...args));
  ipcMain.handle("getRyujinxCompatibility", async (_, ...args: ryujinxCompatibilityProps) => ryujinxCompatibility(...args));
  ipcMain.handle("downloadSave", async (_, fileName: string) => savesDownloads(fileName));
  ipcMain.handle("get-mods-versions", async (_, ...args: getModsVersionsProps) => getModsVersions(...args));
  ipcMain.handle("get-mods-list-for-version", async (_, ...args: getModsListForVersionProps) => getModsListForVersion(...args));
  ipcMain.handle("download-mod", async (_, ...args: downloadModProps) => downloadMod(mainWindow, ...args));
  ipcMain.handle("count-shaders", async (_, ...args: countShadersProps) => countShaders(...args));
  ipcMain.handle("install-shaders", async (_, ...args: installShadersProps) => installShaders(mainWindow, ...args));
  ipcMain.handle("share-shaders", async (_, ...args: shareShaders) => shareShaders(mainWindow, ...args));
  ipcMain.handle("search-gamebanana", async (_, ...args: searchProps) => searchGameBanana(...args));
  ipcMain.handle("delete-game", (_, ...args: deleteGameProps) => deleteGame(...args));
  ipcMain.handle("set-proxy", async (_, proxy: string) => setProxy(proxy));
  ipcMain.handle("get-ryujinx-appdata-path", (_) => getRyujinxPath());
};

export default makeIpcRoutes;
