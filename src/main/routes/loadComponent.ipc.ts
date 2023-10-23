import HttpService from "../services/HttpService";
import electron from "electron";
import { SYS_SETTINGS } from "../../index";

const loadComponentIpcHandler = async () => Promise.all([
  SYS_SETTINGS,
  (async () => {
    try {
      return await HttpService.downloadRyujinxShaderList()
    } catch (e) {
      console.error('Could not load downloadRyujinxShaderList ' + e.message)
      return {}
    }
  })(),
  (async () => {
    try {
      return await HttpService.downloadSaveList()
    } catch (e) {
      throw new Error('Could not load downloadSaveList ' + e.message)
    }
  })(),
  (async () => {
    try {
      return await HttpService.downloadModsTitleList()
    } catch (e) {
      console.error('Could not load downloadModsTitleList ' + e.message)
      return []
    }
  })(),
  (async () => {
    try {
      return await HttpService.getFirmwareVersion()
    } catch (e) {
      throw new Error('Could not load getFirmwareVersion ' + e.message)
    }
  })(),
  (async () => {
    try {
      return await HttpService.getLatestApplicationVersion()
    } catch (e) {
      throw new Error('Could not load getLatestApplicationVersion ' + e.message)
    }
  })(),
  electron.app.getVersion(),
  (async () => {
    try {
      return await HttpService.getThreshold()
    } catch (e) {
      throw new Error('Could not load getThreshold ' + e.message)
    }
  })(),
  (async () => {
    try {
      return await HttpService.getShadersMinVersion()
    } catch (e) {
      console.error('Could not load getShadersMinVersion ' + e.message)
      return 0
    }
  })()
]);

export default loadComponentIpcHandler;
