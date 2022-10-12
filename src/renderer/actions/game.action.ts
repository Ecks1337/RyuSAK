import Swal from "sweetalert2";
import useTranslation from "../i18n/I18nService";
import { invokeIpc } from "../utils";

const { t } = useTranslation();

export interface IGameAction {
  deleteGameAction: (titleId: string, dataPath: string) => Promise<boolean>
}

const createGameSlice = (): IGameAction => ({
  deleteGameAction: async (titleId, dataPath) => {
    const { isConfirmed } = await Swal.fire({
      icon: "warning",
      title: t("areYouSure"),
      text: t("deleteGameNotice"),
      confirmButtonText: t("continue"),
      cancelButtonText: t("cancel"),
      showCancelButton: true,
    });

    if (!isConfirmed) {
      return false;
    }

    await invokeIpc("delete-game", titleId, dataPath);
    return true;
  }
});

export default createGameSlice;
