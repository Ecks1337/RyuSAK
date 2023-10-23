import HttpService from "../services/HttpService";
import { GameBananaMod } from "../../types";
import { Console } from "console";
import unidecode from 'unidecode';

export type searchProps = [string];

export const searchGameBanana = async (...args: searchProps): Promise<Array<GameBananaMod>> => {
  var myConsole = new Console(process.stdout, process.stderr);
  const [name] = args;

  const results = await HttpService.gameBananaSearchGame(unidecode(name.replace(/\s/g, '%')));
  myConsole.log(unidecode(name), results);
  if (!results || results.length === 0) {
    return;
  }

  const mods = (await HttpService.gameBananaSearchMods(results[0].id))._aRecords;
  if (!mods || mods.length === 0) {
    return [];
  }

  return mods.map(mod => ({
    name: mod._sName,
    url: mod._sProfileUrl,
    cover: "https://images.gamebanana.com/img/ss/mods/" + (mod._aPreviewMedia._aImages[0]._sFile220 || mod._aPreviewMedia._aImages[0]._sFile)
  }));
};
