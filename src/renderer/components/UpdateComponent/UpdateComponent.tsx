import React, { useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import useTranslation from "../../i18n/I18nService";
import Swal from "sweetalert2";
import { ipcRenderer } from "electron";
import useStore from "../../actions/state";
import semver from "semver";

const UpdateComponent = ({ state }: { state: "downloading" | "downloaded" }) => {
  const [latestVersion, currentVersion] = useStore(state => [state.latestVersion, state.currentVersion]);
  const [isPortable, setIsPortable] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    ipcRenderer.on("is-portable", () => setIsPortable(true));
  }, [isPortable]);

  useEffect(() => {
    if (state === "downloaded") {
      Swal.fire({
        icon: "success",
        text: t("update_restart"),
        showCancelButton: true
      }).then(({ value }) => value && ipcRenderer.send("reboot-after-download"));
    }
  }, [state]);

  if ((process.platform !== "win32" || isPortable) && currentVersion && latestVersion && semver.lt(currentVersion, latestVersion)) {
    return <Box p={2} pb={0}>
      <Alert severity="info">
        You have version v{currentVersion}, please consider updating to the latest version from <a href="https://github.com/Ecks1337/RyuSAK/releases/latest" target="_blank">Github</a> (v{ latestVersion })
      </Alert>
    </Box>;
  }

  if (!state) {
    return null;
  }

  return (
    <Box p={2} pb={0}>
      <Alert severity="info">{ t(state === "downloading" ? "update_downloading" : "update_downloaded") }</Alert>
    </Box>
  );
};

export default UpdateComponent;
