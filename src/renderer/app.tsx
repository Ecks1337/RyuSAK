import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import i18n, { use } from "i18next";
import { initReactI18next } from "react-i18next";
import Swal from "sweetalert2";
import "./styles/swal.dark.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ipcRenderer } from "electron";
import { LS_KEYS } from "../types";

import useStore from "./actions/state";
import LoadingComponent from "./components/LoadingComponent/LoadingComponent";
import MainComponent from "./components/MainComponent";
import TOSComponent from "./components/TOSComponent/TOSComponent";
import AlertComponent from "./components/AlertComponent/AlertComponent";
import DownloadManagerComponent from "./components/DownloadManagerComponent/DownloadManagerComponent";
import DownloadSaveComponent from "./components/DownloadSaveComponent/DownloadSaveComponent";
import DownloadModComponent from "./components/DownloadModComponent/DownloadModComponent";
import GameDetailComponent from "./components/GameDetailComponent/GameDetailComponent";
import UpdateComponent from "./components/UpdateComponent/UpdateComponent";

import "./styles/index.css";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// i18n
import en from "./i18n/en.json";
import ru from "./i18n/ru.json";
import br from "./i18n/br.json";
import de from "./i18n/de.json";
import it from "./i18n/it.json";
import es from "./i18n/es.json";
import se from "./i18n/se.json";
import tr from "./i18n/tr.json";
import zhcn from "./i18n/zh-CN.json";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#448AFF"
    }
  },
});

const lng = localStorage.getItem(LS_KEYS.LOCALE) ?? "en";

const resources = { en, ru, br, de, it, es, se, tr, zhcn };
type localesType = keyof typeof resources;

use(initReactI18next)
  .init({
    resources: Object
      .keys(resources)
      .reduce((acc, l: localesType) => ({ ...acc, [l]: { translation: resources[l]  } }), {}),
    lng,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export const LANGUAGES = Object.keys(resources);

const App = () => {
  document.querySelector("body").classList.add("native");

  const [isAppInitialized, bootstrapAppAction] = useStore(state => [state.isAppInitialized, state.bootstrapAppAction]);
  const [downloadState, setDownloadState] = useState(null);

  // Hack, due to tree checking, if Swal is not present the theme is not applied for further calls, need better solution
  // eslint-disable-next-line no-constant-condition
  if (false) Swal.fire();

  const onUpdateAvailable = () => setDownloadState("downloading");
  const onUpdateDownloaded = () => () => setDownloadState("downloaded");

  useEffect(() => {
    bootstrapAppAction();
    ipcRenderer.on("update-available", onUpdateAvailable);
    ipcRenderer.on("update-downloaded", onUpdateDownloaded);
    const t = setInterval(() => ipcRenderer.invoke("check-status").then(r => r ? setDownloadState("downloaded") : undefined),5000);

    return () => {
      ipcRenderer.removeListener("update-available", onUpdateAvailable);
      ipcRenderer.removeListener("update-downloaded", onUpdateDownloaded);
      clearInterval(t);
    };
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline>
        <AlertComponent />
        <DownloadManagerComponent />
        <DownloadSaveComponent />
        <DownloadModComponent />
        <UpdateComponent state={downloadState} />
        { !isAppInitialized
          ? <LoadingComponent />
          : (
            <Routes>
              <Route path="/" element={<MainComponent />} />
              <Route path="/detail" element={(<GameDetailComponent />)} />
            </Routes>
          )
        }
        <TOSComponent />
      </CssBaseline>
    </ThemeProvider>
  );
};

ReactDOM.render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.querySelector("#app")
);

export {
  i18n
};
