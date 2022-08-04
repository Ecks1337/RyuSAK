import { GetState, SetState } from "zustand/vanilla";
import { ipcRenderer } from "electron";
import { ITitleBar } from "./titleBar.actions";
import Swal from "sweetalert2";
import pirate from "../resources/pirate.gif";
import useStore from "./state";
import { IAlert } from "./alert.action";
import useTranslation, { I18nKeys } from "../i18n/I18nService";
import { invokeIpc } from "../utils";

const { t } = useTranslation();
const firmwareFileName = "firmware.zip";

const onFirmwareProgressEvent = (_: unknown, filename: string, percentage: number, downloadSpeed: number) => {
  useStore.getState().updateFileProgress(firmwareFileName, filename, percentage, downloadSpeed);
};

const createEmulatorFilesSLice = (_set: SetState<{ }>, get: GetState<Partial<ITitleBar & IAlert>>) => ({
  installFirmwareAction: async (dataPath: string, fwVersion: string) => {
    ipcRenderer.on("download-progress", onFirmwareProgressEvent);
    const extractPath = await invokeIpc("install-firmware", get().currentEmu, dataPath, fwVersion);

    useStore.getState().removeFileAction(firmwareFileName);
    ipcRenderer.removeListener("download-progress", onFirmwareProgressEvent);

    if (typeof extractPath === "object") {
      get().closeAlertAction();
      return Swal.fire({
        icon: "error",
        text: t(extractPath.code as I18nKeys)
      });
    }

    get().closeAlertAction();
    return Swal.fire({
      imageUrl: pirate,
      html: `<p style="padding: 5px">${t("firmwareLocation")} : <code>${extractPath}</code></p>`,
    });
  },
  downloadKeysAction: async (dataPath: string) => {
    const result = await invokeIpc("install-keys", dataPath, get().currentEmu);
    Swal.fire({
      imageUrl: pirate,
      html: `${t("keysLocation")} : <code>${result}</code>`
    });
  }
});

export default createEmulatorFilesSLice;
