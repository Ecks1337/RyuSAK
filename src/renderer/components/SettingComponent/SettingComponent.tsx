import "./setting.css";
import React, { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";
import useTranslation from "../../i18n/I18nService";
import { invokeIpc } from "../../utils";
import useStore from "../../actions/state";
import { LS_KEYS } from "../../../types";
import { LANGUAGES, i18n } from "../../app";

const SettingComponent = () => {
  const { t } = useTranslation();
  const [
    settings
  ] = useStore(state => [
    state.settings
  ]);

  const [open, setOpen] = useState(false);
  const [proxy, setProxy] = useState(settings.proxy);
  const [locale, setLocale] = useState(localStorage.getItem(LS_KEYS.LOCALE) ?? "en");

  const handleClose = () =>
    setOpen(false);

  const handleSave = async () => {
    await invokeIpc("set-proxy", proxy);

    if (localStorage.getItem(LS_KEYS.LOCALE) != locale) {
      localStorage.setItem(LS_KEYS.LOCALE, locale);
      await i18n.changeLanguage(locale);

      window.location.reload();
    }

    setOpen(false);
  };

  return (
    <>
      <Button style={{ fill: "#fff" }} onClick={() => setOpen(!open)}>
        <svg width={32} viewBox="0 0 24 24">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
        </svg>
      </Button>
      <Dialog open={open} fullWidth onClose={handleClose} className="setting-dialog">
        <DialogTitle>{t("settings")}</DialogTitle>
        <DialogContent>
          <TextField sx={{ mt: 1 }} label={t("proxy")} value={proxy} onChange={(e) => setProxy(e.target.value)} fullWidth />
          <FormControl sx={{ mt: 3, mb: 1 }} fullWidth>
            <InputLabel id="locale-label">{t("locale")}</InputLabel>
            <Select labelId="locale-label" label={t("locale")} value={locale} onChange={(e) => setLocale(e.target.value)}>
              { LANGUAGES.map((l: string) => <MenuItem key={l} value={l.toLowerCase()}>{l.toUpperCase()}</MenuItem>) }
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("cancel")}</Button>
          <Button onClick={handleSave} variant="contained">{t("save")}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingComponent;
