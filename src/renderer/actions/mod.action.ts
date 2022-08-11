import { SetState } from "zustand/vanilla";
import useStore from "./state";
import { ipcRenderer } from "electron";
import Swal from "sweetalert2";
import useTranslation from "../i18n/I18nService";
import pirate from "../resources/pirate.gif";
import { invokeIpc } from "../utils";

const { t } = useTranslation();

export interface ISaveAction {
  currentMod?: string,
  setCurrentModAction: (id: string, dataPath: string) => void,
  clearCurrentModAction: () => void,
  dataPath?: string,
  downloadModAction: (currentMod: string, version: string, pickedMod: string, dataPath: string) => Promise<any>
}

const createDownloadModSlice = (set: SetState<ISaveAction>): ISaveAction => ({
  setCurrentModAction: (currentMod, dataPath) => set({ currentMod, dataPath }),
  clearCurrentModAction: () => set({ currentMod: null, dataPath: null }),
  downloadModAction: async (currentMod, version, pickedMod, dataPath) => {
    const state = useStore.getState();
    state.upsertFileAction({
      filename: pickedMod,
      downloadSpeed: Infinity,
      progress: 0
    });

    const onModDownloadProgress = (_: any, filename: string, percentage: number, downloadSpeed: number) => {
      useStore.getState().updateFileProgress(filename, filename, percentage, downloadSpeed);
    };

    ipcRenderer.on("download-progress", onModDownloadProgress);

    const result = await invokeIpc("download-mod", currentMod, version, pickedMod, dataPath).catch(() => null);
    ipcRenderer.removeListener("download-progress", onModDownloadProgress);
    state.removeFileAction(pickedMod);

    if (!result) {
      return Swal.fire({
        icon: "error",
        text: t("FETCH_FAILED")
      });
    }

    Swal.fire({
      imageUrl: pirate,
      html: t("modInstalled").replace("{path}", result)
    });
  }
});

export default createDownloadModSlice;
