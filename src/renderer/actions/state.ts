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
import createSettingSlice from "./setting.action";

const useStore = create((set: SetState<any>, get: GetState<any>) => ({
  ...createBootstrapSlice(set, get),
  ...emulatorConfig(set, get),
  ...createAlertSlice(set),
  ...createEmulatorFilesSLice(set, get),
  ...createDownloadManagerSlice(set, get),
  ...createGameSlice(),
  ...createDownloadSaveSlice(set),
  ...createDownloadModSlice(set),
  ...createShadersSlice(set),
  ...createSettingSlice(set)
}));

export default useStore;
