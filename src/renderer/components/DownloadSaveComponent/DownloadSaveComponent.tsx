import React, { useEffect } from "react";
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Modal
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import useStore from "../../actions/state";
import useTranslation from "../../i18n/I18nService";
import Enumerable from "linq";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  outline: "none"
};

const DownloadSaveComponent = () => {
  const { t } = useTranslation();
  const [files, setFiles] = React.useState<string[]>([]);
  const [
    saves,
    clearCurrentSaveAction,
    currentSaveDownload,
    downloadSaveAction
  ] = useStore(state => [
    state.saves,
    state.clearCurrentSaveAction,
    state.currentSaveDownload,
    state.downloadSaveAction
  ]);

  useEffect(() => {
    setFiles(
      Enumerable.from(saves)
                .where(save => save.name.includes(currentSaveDownload))
                .select(save => save.name)
                .toArray()
    );
  }, [saves]);

  const onModalClose = () => {
    clearCurrentSaveAction();
  };

  const onSaveDownload = (fileName: string) => {
    downloadSaveAction(fileName);
    clearCurrentSaveAction();
  };

  return (
    <Modal
      open={!!currentSaveDownload}
      onClose={onModalClose}
    >
      <Box sx={style}>
        <List
          subheader={
            <Box p={1} pl={3} pr={3}>
              <ListSubheader component="div">
                <p style={{ textAlign: "center", margin: 0 }}>{t("dlSave")}</p>
              </ListSubheader>
              <p style={{ marginTop: 0 }}>
                <small>
                  { t("dlSaveDesc") }
                </small>
              </p>
              <Divider />
            </Box>
          }
        >
          {
            files.map(fileName => (
              <ListItem key={fileName} disablePadding>
                <ListItemButton onClick={() => onSaveDownload(fileName)}>
                  <ListItemIcon>
                    <FileCopyIcon />
                  </ListItemIcon>
                  <ListItemText primary={fileName} />
                </ListItemButton>
              </ListItem>
            ))
          }
        </List>
      </Box>
    </Modal>
  );
};

export default DownloadSaveComponent;
