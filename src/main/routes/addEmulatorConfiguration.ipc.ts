import { BrowserWindow, dialog, app } from "electron";
import { RyusakEmulatorConfig } from "../../types";
import * as path from "path";

const addEmulatorConfigurationIpc = async (mainWindow: BrowserWindow) => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, { properties: ["openFile"] });

  if (canceled) {
    return { error: true, code: "OPERATION_CANCELED" };
  }

  const file = path.basename(filePaths[0]);

  if (!file.toLowerCase().includes("ryujinx")) {
    return { error: true, code: "INVALID_RYUJINX_BINARY" };
  }

  return filePaths[0];
};

const createDefaultConfigActionForEmu = (): RyusakEmulatorConfig => {
  return {
    path: path.resolve(app.getPath("appData"), "Ryujinx"),
    name: "Ryujinx Global (default)"
  };
};

export {
  addEmulatorConfigurationIpc,
  createDefaultConfigActionForEmu
};
