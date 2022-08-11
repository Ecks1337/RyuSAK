import HttpService from "../services/HttpService";
import fs from "fs-extra";
import path from "path";
import { BrowserWindow } from "electron";
import { MirrorDirMeta } from "../../types";
import Zip from "adm-zip";
import glob from "glob";

export type getModsVersionsProps = [string];

export type getModsListForVersionProps = [string, string];

export type downloadModProps = [string, string, string, string];

export const getModsVersions = async (...args: getModsVersionsProps) => {
  const [titleId] = args;
  return HttpService.getModVersions(titleId) as Promise<MirrorDirMeta>;
};

export const getModsListForVersion = async (...args: getModsListForVersionProps) => {
  const [titleId, modName] = args;
  return HttpService.getModsForVersion(titleId, modName);
};

export const getModPathForTitleId = (id: string, dataPath: string) => path.resolve(dataPath, "mods", "contents", id.toLocaleLowerCase());

export const downloadMod = async (mainWindow: BrowserWindow, ...args: downloadModProps): Promise<string> => {
  const [titleId, version, modName, dataPath] = args;
  const { modName: name, url } = await HttpService.getModName(titleId, version, modName);
  let destPath = "";

  destPath = getModPathForTitleId(titleId, dataPath);

  await fs.ensureDir(destPath);
  const modDestPath = path.resolve(destPath, name);
  const result = await HttpService.fetchWithProgress(url, modDestPath, mainWindow, modName);

  if (!result) {
    return Promise.reject(new Error("Unable to retrieve file"));
  }

  // Might be duplicate with chmod bellow, but I'm struggling to fix perms issues on linux
  await fs.promises.chmod(modDestPath, "660");
  const kind = name.toLowerCase().includes(".pchtxt") ? "pchtxt" : "archive";

  if (kind === "pchtxt") {
    await fs.ensureDir(path.resolve(destPath, modName,"exefs"));
    await fs.remove(path.resolve(destPath, modName, "exefs", name));
    await fs.move(modDestPath, path.resolve(destPath, modName, "exefs", name));
    await fs.chmod(path.resolve(destPath, modName, "exefs", name), "660");
    return destPath;
  }

  const archive = new Zip(modDestPath);
  archive.extractAllTo(path.resolve(modDestPath, ".."), true);
  await fs.remove(modDestPath);

  // We should double-check if there is no pchtxt files here to set chmod. Otherwise, there will be a crash on linux but worth it to do on Windows too
  const asyncGlob = (path: string): Promise<string[]> => new Promise((resolve, reject) => {
    glob(path, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });

  const files = await asyncGlob(path.normalize(`${path.resolve(modDestPath, "..")}/**/*.pchtxt`)).catch(() => []);

  for (const file of files) { // Don't use concurrency here since FS does not like that
    await fs.chmod(file, "660");
  }

  return destPath;
};
