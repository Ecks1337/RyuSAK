import { shell } from "electron";
import path from "path";
import fs from "fs-extra";

export type openFolderIPCProps = [string, "shaders" | "mods", string];

const openFolderForGame = async (...args: openFolderIPCProps) => {
  const [titleId, dir, dataPath] = args;

  if (dir === "mods") {
    const modPath = path.resolve(dataPath, "mods", "contents", titleId.toLocaleLowerCase());
    await fs.ensureDir(modPath); // Mod directory may not exist if it has never been opened so create it
    return shell.openPath(modPath);
  }

  const shaderPath = path.resolve(dataPath, "games", titleId.toLocaleLowerCase(), "cache", "shader");
  await fs.ensureDir(shaderPath); // shader directory may not exist if it has never been opened so create it
  return shell.openPath(shaderPath);
};

export default openFolderForGame;
