import React, { useEffect } from "react";
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
import useTranslation from "../i18n/I18nService";
import discord_logo from "../resources/discord_logo.png";

const ADD_CONFIG = "add_config";

const MainComponent = () => {
  const [
    ryujinxConfigs,
    removeEmulatorConfigAction,
    selectedConfig,
    setSelectConfigAction,
    addNewEmulatorConfigAction,
    createDefaultConfig,
    installFirmwareAction,
    firmwareVersion,
    downloadKeysAction,
  ] = useStore(state => [
    state.ryujinxConfigs,
    state.removeEmulatorConfigAction,
    state.selectedConfig,
    state.setSelectConfigAction,
    state.addNewEmulatorConfigAction,
    state.createDefaultConfig,
    state.installFirmwareAction,
    state.firmwareVersion,
    state.downloadKeysAction,
  ]);

  const { t } = useTranslation();

  const onConfigurationChange = (e: SelectChangeEvent) => {
    const { value } = e.target;

    if (value === ADD_CONFIG) {
      addNewEmulatorConfigAction();
    } else {
      setSelectConfigAction(ryujinxConfigs.find(i => i.path === value));
    }

    e.preventDefault();
    return false;
  };

  useEffect(() => {
    if (ryujinxConfigs.length === 0) {
      createDefaultConfig();
    } else {
      const selectedPath = localStorage.getItem(`ryu-selected`);
      const config = ryujinxConfigs.find(f => f.path === selectedPath) || ryujinxConfigs[0];
      setSelectConfigAction(config);
    }
  }, [ryujinxConfigs]);

  return selectedConfig && (
    <Container maxWidth={false}>
      <br />
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={4} lg={5}>
            <Grid container spacing={0.5}>
              <Grid item xs={11} lg={7}>
                <Tooltip placement="right" title={`${t("readingDataPath")} ${selectedConfig.path}`}>
                  <FormControl fullWidth>
                    <InputLabel id="emulator-select-path-label">{t("configuration")}</InputLabel>
                    <Select
                      labelId="emulator-select-path-label"
                      id="emulator-select-path"
                      value={selectedConfig?.path || ""}
                      onChange={onConfigurationChange}
                    >
                      <MenuItem value={ADD_CONFIG}><i>{t("addConfiguration")}</i></MenuItem>
                      {
                        ryujinxConfigs.map((item, index) => (
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
            <Button onClick={() => installFirmwareAction(selectedConfig.path, firmwareVersion)} fullWidth variant="contained">{t("dl_firmware")} {firmwareVersion}</Button>
          </Grid>
          <Grid item style={{ lineHeight: "52px" }} xs={3} lg={3}>
            <Button onClick={() => downloadKeysAction(selectedConfig.path)} fullWidth variant="contained">{t("dl_keys")}</Button>
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
        <GameListingComponent config={selectedConfig} />
      </Stack>
    </Container>
  );
};

export default MainComponent;
