import path from "path";
import { app, dialog } from "electron";
import { RyusakEmulatorGames, RyusakEmulatorMode } from "../../types";
import customDatabase from "../../assets/custom_database.json";
import tinfoilDatabase from "../../assets/tinfoildb.json";
import getEshopData from "../services/eshopData";
import fs from "fs-extra";

const tfDb: typeof tinfoilDatabase = tinfoilDatabase;
const csDb: typeof customDatabase = customDatabase;

export const emulatorFilesystem = async (binaryPath: string): Promise<RyusakEmulatorMode> => {
  const fitgirlDataPath = path.resolve(binaryPath, "..", "..", "data", "games");
  const isFitgirlRepack = await fs.stat(fitgirlDataPath).then(() => true).catch(() => false);

  if (isFitgirlRepack) {
    dialog.showMessageBox({
      title: "Fitgirl strikes again",
      message: "RyuSAK does not support Fitgirl repacks, please setup Ryujinx yourself and delete this configuration.",
      type: "error",
      buttons: ["Ok"],
    });
  }

  const portableDataPath = path.resolve(binaryPath, "..", "portable");
  const isPortable = await fs.stat(portableDataPath).then(() => true).catch(() => false);

  if (isPortable) {
    return {
      mode: "portable",
      dataPath: portableDataPath
    };
  }

  return {
    mode: "global",
    dataPath: path.resolve(app.getPath("appData"), "Ryujinx")
  };
};

export const scanGamesForConfig = async (dataPath: string): Promise<RyusakEmulatorGames> => {
  try {
    const directories = await fs.readdir(path.join(dataPath, "games"), { withFileTypes: true });
    return directories.filter(d => d.isDirectory()).map(d => d.name.toLowerCase());
  } catch(e) {
    return [];
  }
};

export type deleteGameProps = [string, string];

export const deleteGame = async (...args: deleteGameProps) => {
  const [titleId, dataPath] = args;
  const pathsToRemove: string[] = [];

  pathsToRemove.push(path.resolve(dataPath, "games", titleId.toLowerCase()));

  // Do this sequentially, in my experience FS does not like concurrent actions
  for (const path of pathsToRemove) {
    await fs.remove(path).catch(() => null);
  }
};

export const buildMetadataForTitleId = async (titleId: string): Promise<{ title: string, img: string, titleId: string }> => {
  const eData = await getEshopData();
  const keys = Object.keys(eData);
  const eshopEntry = keys.find((key) => eData[key]?.id?.toLowerCase() === titleId.toLowerCase());
  const id = <keyof typeof customDatabase & keyof typeof tinfoilDatabase> titleId.toUpperCase();

  if (eshopEntry) {
    return {
      title: eData[eshopEntry].name.replace("™", ""),
      img: eData[eshopEntry].iconUrl,
      titleId: titleId.toUpperCase(),
    };
  }

  const nonEshopData = {
    // Use custom database in priority, then database from tinfoil and fallback by returning only title ID in case game does not exists in eshop
    title: (csDb[id]) || tfDb[id] || titleId.toUpperCase(),
    img: "",
    titleId: titleId.toUpperCase(),
  };

  // Try to perform a search by name instead title ID in case it's not found
  if (!eshopEntry) {
    const eshopEntryByName = keys.find((key) => eData[key]?.name?.toLowerCase().replace("™", "").includes(nonEshopData.title.toLowerCase()));

    if (eshopEntryByName) {
      return {
        title: nonEshopData.title.toLowerCase(),
        img: eData[eshopEntryByName].iconUrl,
        titleId: titleId.toUpperCase(),
      };
    }
  }

  return nonEshopData;
};
