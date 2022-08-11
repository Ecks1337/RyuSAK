import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip, Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import useStore from "../../actions/state";
import { shell } from "electron";
import useTranslation from "../../i18n/I18nService";
import { GithubIssue, GithubLabel } from "../../../types";
import Swal from "sweetalert2";
import InfoIcon from "@mui/icons-material/Info";
import defaultIcon from "../../resources/default_icon.jpg";
import { styled } from "@mui/material/styles";
import MuiGrid from "@mui/material/Grid";
import GameBananaModsComponent from "../GameBananaModsComponent";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate } from "react-router-dom";
import { invokeIpc } from "../../utils";
import Enumerable from "linq";

interface IGameDetailProps {
  titleId: string;
  dataPath: string;
}

const GridWithVerticalSeparator = styled(MuiGrid)(({ theme }) => ({
  width: "100%",
  ...theme.typography.body2,
  "& [role=\"separator\"]": {
    margin: theme.spacing(0, 2),
  },
}));

// Force title to be two lines, so it's always aligned even there is long strings depending on locale
const TwoLinesTitle = styled(Typography)(() => ({
  lineHeight: "1.5em",
  height: "3em",
  overflow: "hidden"
}));

const GameDetailComponent = () => {
  const { state } = useLocation();
  const { titleId, dataPath } = state as IGameDetailProps;
  const [
    saves,
    setCurrentSaveDownloadAction,
    mods,
    setCurrentModAction,
    ryujinxShaders,
    downloadShadersAction,
    needRefreshShaders,
    shareShaders,
    deleteGameAction,
    deletedGame,
    threshold
  ] = useStore(state => [
    state.saves,
    state.setCurrentSaveDownloadAction,
    state.mods,
    state.setCurrentModAction,
    state.ryujinxShaders,
    state.downloadShadersAction,
    state.needRefreshShaders,
    state.shareShaders,
    state.deleteGameAction,
    state.deletedGame,
    state.threshold
  ]);
  const [metaData, setMetaData]: [{ img: string, title: string, titleId: string }, Function] = useState(null);
  const [compat, setCompat] = useState<GithubLabel[]>(null);
  const [_compatMode, setCompatMode] = useState<GithubIssue["mode"]>(null);
  const [localShadersCount, setLocalShadersCount] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    deletedGame && navigate(-1);
  }, [deletedGame]);

  const extractCompatibilityLabels = (response: GithubIssue) => {
    // Probably non 200 response from GitHub, so leave it as default value (null)
    if (response == null) return;

    const item = (response.items).find(i => i.state === "open");
    setCompatMode(response.mode);
    return setCompat(item ? item.labels : []);
  };

  const handleAddReportButtonClick = async () => {
    if (compat === null) return;

    await Swal.fire({
      icon: "info",
      text: t(compat.length === 0 ? "infoNewReport" : "infoExistingReport"),
      allowOutsideClick: false
    });

    return shell.openExternal(compat.length > 0
      ? `https://github.com/Ryujinx/Ryujinx-Games-List/issues?q=is%3Aissue+is%3Aopen+${_compatMode === "name" ? metaData.title : metaData.titleId}`
      : "https://github.com/Ryujinx/Ryujinx-Games-List/issues/new"
    );
  };

  useEffect(() => {
    invokeIpc("build-metadata-from-titleId", titleId).then(d => setMetaData(d));
    invokeIpc("getRyujinxCompatibility", titleId).then(extractCompatibilityLabels);
    invokeIpc("count-shaders", titleId, dataPath).then(setLocalShadersCount);
  }, [titleId, needRefreshShaders]);

  const renderCompatibilityData = () => (
    <Grid container mb={2} sx={{ display: "flex", alignItems: "center" }}>
      <Grid item xs={12}>
        <Alert
          severity={compat.length === 0 ? "warning" : "info"}
          action={(<Button
            onClick={() => handleAddReportButtonClick()}
            variant="outlined"
            size="small"
            fullWidth
          >
            {t("addCompatReport")}
          </Button>)}
        >
          {
            compat.map(c => (
              <Tooltip key={c.name} title={c.description} arrow enterDelay={0}>
                <Chip variant="outlined" color="primary" size="small" style={{ marginRight: 8 }} label={c.name} />
              </Tooltip>
            ))
          }
          {
            compat.length === 0 && t("noCompatData")
          }
        </Alert>
      </Grid>
    </Grid>
  );

  if (!metaData) {
    return null;
  }

  const hasMods = Enumerable.from(mods).any(mod => mod.name.includes(metaData.titleId.toUpperCase()));
  const hasSaves = Enumerable.from(saves).any(save => save.name.includes(metaData.titleId.toUpperCase()));
  const ryusakShadersCount = ryujinxShaders[metaData.titleId.toUpperCase()] || 0;

  return (
    <Box p={3}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Button onClick={() => navigate(-1)} size="small" variant="outlined"><ArrowBackIcon /></Button>
        {
          metaData && (
            <h3 style={{ marginLeft: 12 }}>{metaData.title} <code>{metaData.titleId}</code></h3>
          )
        }
        <Button
          variant="contained"
          color="error"
          onClick={() => deleteGameAction(metaData.titleId.toUpperCase(), dataPath)}
          startIcon={<DeleteIcon />}
        >
          {t("deleteGame")}
        </Button>
      </Box>

      <Divider />
      <br />

      <div style={{ height: 70 }}>
        {
          (compat !== null)
            ? renderCompatibilityData()
            : (<Alert severity="info">Loading ...</Alert>)
        }
      </div>

      <Grid container mt={0}>
        <Grid item xs={2}>
          <img
            referrerPolicy="no-referrer"
            style={{ border: "5px solid #222" }}
            width="100%" src={metaData?.img || defaultIcon}
            alt=""
          />
        </Grid>
        <Grid item xs={4} p={1} pl={2}>
          <p style={{ marginTop: 0 }}>
            <Button
              onClick={() => invokeIpc("openFolderForGame", titleId, "shaders", dataPath)}
              variant="contained"
              fullWidth
            >
              {t("openShaderDir")}
            </Button>
          </p>
          <p>
            <Button
              onClick={() => invokeIpc("openFolderForGame", titleId, "mods", dataPath)}
              variant="contained"
              fullWidth
            >
              {t("openModsDir")}
            </Button>
          </p>
          <p>
            <Button
              variant="contained"
              fullWidth
              disabled={!hasMods}
              onClick={() => setCurrentModAction(metaData.titleId, dataPath)}
            >
              {t(hasMods ? "dlMods" : "noMods")}
            </Button>
          </p>
          <p>
            <Button
              variant="contained"
              fullWidth
              disabled={!hasSaves}
              onClick={() => setCurrentSaveDownloadAction(metaData.titleId.toUpperCase())}
            >
              {t(hasSaves ? "dlSave": "noSave")}
            </Button>
          </p>
        </Grid>
        <Grid item xs={6} pl={3} pr={3} style={{ position: "relative", top: -10 }}>
          <Grid container>
            <Grid item xs={3}>
              <h3 style={{ margin: "0 auto" }}>
                <Tooltip placement="right" title={(<div dangerouslySetInnerHTML={{ __html: t("shaderInfo") }} />)}>
                  <IconButton style={{ position: "relative", top: -3 }} size="small" color="primary">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                {t("shaders")}
              </h3>
            </Grid>

            <Grid item xs={9}>

              <h3 style={{ margin: "0 auto", textAlign: "right" }}>
                {t("threshold")}
                <Tooltip placement="right" title={(<div dangerouslySetInnerHTML={{ __html: t("shaderThreshold") }} />)}>
                  <IconButton style={{ position: "relative", top: -3 }} size="small" color="primary">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
                <code style={{ position: "relative", top: -3 }}>{threshold}</code>
              </h3>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>
          </Grid>
          <GridWithVerticalSeparator container pt={2} spacing={0}>
            <GridWithVerticalSeparator item xs pr={2}>
              <Box>
                <TwoLinesTitle variant="h6" align="center">{t("localShadersCount")}</TwoLinesTitle>
                <p><Button style={{ pointerEvents: "none" }} variant="outlined" fullWidth>{localShadersCount}</Button></p>
                <p>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={threshold == -1 ? true : ((ryusakShadersCount + threshold) >= localShadersCount)}
                    onClick={() => shareShaders(metaData.titleId, dataPath, localShadersCount, ryusakShadersCount)}
                  >
                    {threshold == -1 ? "Shader uploading is currently unavailable" : t("shareShaders")}
                  </Button>
                </p>
              </Box>
            </GridWithVerticalSeparator>

            <Divider flexItem orientation="vertical" />

            <GridWithVerticalSeparator item xs pl={2}>
              <Box>
                <TwoLinesTitle variant="h6" align="center">{t("ryusakShadersCount")}</TwoLinesTitle>
                <p>
                  <Button style={{ pointerEvents: "none" }} variant="outlined" fullWidth>
                    {ryusakShadersCount}
                  </Button>
                </p>
                <p>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={ryusakShadersCount === 0}
                    onClick={() => downloadShadersAction(metaData.titleId, dataPath)}
                  >
                    {t("dlShaders")}
                  </Button>
                </p>
              </Box>
            </GridWithVerticalSeparator>
          </GridWithVerticalSeparator>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="warning">Due to Ryujinx changes, shaders does not work anymore with LDN build. If you see RyuSAK has a lower shader count than you locally, I suggest to download again shaders from RyuSAK.</Alert>
          <Divider />
        </Grid>

        <Grid item xs={12}>
          <GameBananaModsComponent title={metaData?.title} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default GameDetailComponent;
