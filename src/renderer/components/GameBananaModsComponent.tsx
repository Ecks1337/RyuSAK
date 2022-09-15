import React, { useEffect, useState } from "react";
import { GameBananaMod } from "../../types";
import { Alert, Box, Divider, Grid, Tooltip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import useTranslation from "../i18n/I18nService";
import { invokeIpc } from "../utils";

const Label = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  border: "1px solid black",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 8px",
  color: "#FFF",
  zIndex: 1,
  lineHeight: 1.5,
  height: "3em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "block",
  textAlign: "center"
}));

const GameBanaCover = styled(Box)(() => ({
  width: "100%",
  aspectRatio: "16 / 9",
  background: "no-repeat center center",
  backgroundSize: "contain"
}));

type Props = {
  titleName?: string,
};

const GameBananaModsComponent = ({ titleName }: Props) => {
  const [gameBananaMods, setGameBananaMods] = useState<Array<GameBananaMod>>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (titleName) {
      console.log(titleName);
      invokeIpc("search-gamebanana", titleName).then(mods => {
        setGameBananaMods(mods || []);
        setLoading(false);
      });
    }
  }, [titleName]);

  return <>
    <h3>{t("gamebananaModsTitle")}</h3>
    <Divider />
    <br />
    {
      loading
        ? <Box pt={16} style={{ position: "relative" }}>
            <div className="centred-container">
              <div className="ripple-container">
                <span className="loading-ripple" />
              </div>
              <Typography variant="h6">{t("gameBananaLoading")}</Typography>
            </div>
          </Box>
        : <Box pb={3}>
          {
            gameBananaMods.length === 0
              ? <Alert severity="info">{t("gamebananaNoMods")}</Alert>
              : <Grid container spacing={2}>
                {
                  (gameBananaMods).map(mod => (
                    <Grid key={mod.name} item xs={2}>
                      <Tooltip arrow title={mod.name} placement="top">
                        <a style={{ textDecoration: "none", color: "#FFF" }} href={mod.url} className="no-blank-icon" target="_blank">
                          <Label title={mod.name}>{mod.name}</Label>
                          <GameBanaCover style={{ backgroundImage: `url(${mod.cover})` }} />
                        </a>
                      </Tooltip>
                    </Grid>
                  ))
                }
              </Grid>
          }
          </Box>
    }
  </>;
};

export default GameBananaModsComponent;
