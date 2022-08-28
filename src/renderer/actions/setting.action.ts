import { SetState } from "zustand/vanilla";
import useStore from "./state";
import { invokeIpc } from "../utils";
import { LS_KEYS } from "../../types";
import { i18n } from "../app";

export interface ISetting {
  setProxyAction: (proxy: string) => void,
  setLocaleAction: (locale: string) => void
}

const createSettingSlice = (set: SetState<ISetting>): ISetting => ({
  setProxyAction: async (proxy) => {
    const settings = useStore.getState().settings;

    if (settings.proxy == proxy) return;

    useStore.setState({
      settings: {
        ...settings,
        proxy,
      },
    });

    return await invokeIpc("set-proxy", proxy);
  },
  setLocaleAction: async (locale) => {
    if (localStorage.getItem(LS_KEYS.LOCALE) != locale) {
      localStorage.setItem(LS_KEYS.LOCALE, locale);
      await i18n.changeLanguage(locale);

      window.location.reload();
    }
  }
});

export default createSettingSlice;
