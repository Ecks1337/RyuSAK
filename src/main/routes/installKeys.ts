import path from "path";
import fs from "fs-extra";
import HttpService from "../services/HttpService";

export const installKeys = async (dataPath: string) => {
  const destPath = path.join(dataPath, "system");
  await fs.ensureDir(destPath);
  const keysContent = await HttpService.downloadKeys();
  const keysPath = path.join(destPath, "prod.keys");
  await fs.writeFile(keysPath, keysContent, "utf8");
  return keysPath;
};
