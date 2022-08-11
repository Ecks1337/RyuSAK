import create from "zustand";
import createBootstrapSlice from "./bootstrap.action";
import emulatorConfig from "./emulatorConfig.action";
import createAlertSlice from "./alert.action";
import createEmulatorFilesSLice from "./emulatorFiles.action";
import { GetState, SetState } from "zustand/vanilla";
import createDownloadManagerSlice from "./downloadManager.action";
import createGameSlice from "./game.action";
import createDownloadSaveSlice from "./save.action";
import createDownloadModSlice from "./mod.action";
import createShadersSlice from "./shaders.action";

const useStore = create((set: SetState<any>, get: GetState<any>) => ({
  ...createBootstrapSlice(set, get),
  ...emulatorConfig(set, get),
  ...createAlertSlice(set),
  ...createEmulatorFilesSLice(set, get),
  ...createDownloadManagerSlice(set, get),
  ...createGameSlice(set),
  ...createDownloadSaveSlice(set),
  ...createDownloadModSlice(set),
  ...createShadersSlice(set)
}));

export default useStore;
