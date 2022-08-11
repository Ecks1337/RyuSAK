import React, { useEffect, useState } from "react";
import useStore from "../actions/state";
import GameListingComponent from "./GameListingComponent/GameListingComponent";
import SettingComponent from "./SettingComponent/SettingComponent";
import {
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip
} from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { RyusakEmulatorMode } from "../../types";
import useTranslation from "../i18n/I18nService";
import discord_logo from "../resources/discord_logo.png";

const MainComponent = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<RyusakEmulatorMode>(null);

  const [
    emulatorBinariesPath,
    removeEmulatorConfigAction,
    selectedConfig,
    setSelectConfigAction,
    addNewEmulatorConfigAction,
    createDefaultConfig,
    getModeForBinary,
    installFirmwareAction,
    firmwareVersion,
    downloadKeysAction,
  ] = useStore(state => [
    state.emulatorBinariesPath,
    state.removeEmulatorConfigAction,
    state.selectedConfig,
    state.setSelectConfigAction,
    state.addNewEmulatorConfigAction,
    state.createDefaultConfig,
    state.getModeForBinary,
    state.installFirmwareAction,
    state.firmwareVersion,
    state.downloadKeysAction,
  ]);

  const onConfigurationChange = (e: SelectChangeEvent) => {
    const { value } = e.target;

    if (value === "") {
      addNewEmulatorConfigAction();
    } else {
      const config = emulatorBinariesPath.find(i => i.path === value);
      setSelectConfigAction(config);
      getModeForBinary(config.path).then(setMode);
    }

    e.preventDefault();
    return false;
  };

  useEffect(() => {
    // Build default config in case there is no one
    if (emulatorBinariesPath.length === 0 && !selectedConfig) {
      createDefaultConfig();
    }

    // Otherwise, pick first config available and compute mode for it
    else if (!selectedConfig && emulatorBinariesPath.length > 0) {
      const selectedPath = localStorage.getItem(`ryu-selected`);
      const c = selectedPath ? (emulatorBinariesPath.find(f => f.path === selectedPath) || emulatorBinariesPath[0]) : emulatorBinariesPath[0];
      setSelectConfigAction(c);
      getModeForBinary(c.path).then(setMode);
    } else if (selectedConfig && !mode) {
      getModeForBinary(selectedConfig.path).then(setMode);
    }
  }, [emulatorBinariesPath, emulatorBinariesPath]);

  // In case user chose another config (after added or removed a config)
  useEffect(() => {
    if (selectedConfig && "path" in selectedConfig) {
      getModeForBinary(selectedConfig.path).then(setMode);
    }
  }, [selectedConfig]);

  return (emulatorBinariesPath && emulatorBinariesPath.length > 0) && (
    <Container maxWidth={false} key={`ryu`}>
      <br />
      <Stack spacing={2}>
        {
          (selectedConfig && mode) && (
            <Grid container spacing={2}>
              <Grid item xs={4} lg={5}>
                <Grid container spacing={0.5}>
                  <Grid item xs={11} lg={7}>
                    <Tooltip placement="right" title={`${t("readingDataPath")} ${mode.dataPath}`}>
                      <FormControl fullWidth>
                        <InputLabel id="emulator-select-path-label">{t("configuration")}</InputLabel>
                        <Select
                          labelId="emulator-select-path-label"
                          id="emulator-select-path"
                          value={selectedConfig?.path || ""}
                          onChange={onConfigurationChange}
                        >
                          <MenuItem value={""}><i>{t("addConfiguration")}</i></MenuItem>
                          {
                            emulatorBinariesPath.map((item, index) => (
                              <MenuItem key={`emulator-select-path-item-${index}`} value={item.path}>{item.name}</MenuItem>
                            ))
                          }
                        </Select>
                      </FormControl>
                    </Tooltip>
                  </Grid>
                  {
                    (!selectedConfig.isDefault) && (
                      <Grid item xs={1} style={{ lineHeight: "52px" }}>
                        <IconButton onClick={() => removeEmulatorConfigAction(selectedConfig.path)} color="error">
                          <DeleteOutlineOutlinedIcon />
                        </IconButton>
                      </Grid>
                    )
                  }
                </Grid>
              </Grid>
              <Grid item style={{ lineHeight: "52px" }} xs={4} lg={3}>
                <Button onClick={() => installFirmwareAction(mode.dataPath, firmwareVersion)} fullWidth variant="contained">{t("dl_firmware")} {firmwareVersion}</Button>
              </Grid>
              <Grid item style={{ lineHeight: "52px" }} xs={3} lg={3}>
                <Button onClick={() => downloadKeysAction(mode.dataPath)} fullWidth variant="contained">{t("dl_keys")}</Button>
              </Grid>
              <Grid item style={{ lineHeight: "52px" }} xs={1}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <a href="https://discord.gg/42Xnp7FRVW" className="no-blank-icon" target="_blank">
                      <IconButton edge="start" color="inherit">
                        <img height={40} src={discord_logo} />
                      </IconButton>
                    </a>
                  </Grid>
                  <Grid item xs={1}>
                    <SettingComponent />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )
        }
        { mode && <GameListingComponent key={mode.dataPath} mode={mode} config={selectedConfig} /> }
      </Stack>
    </Container>
  );
};

export default MainComponent;
