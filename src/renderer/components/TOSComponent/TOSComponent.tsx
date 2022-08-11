import React, { useEffect } from "react";
import { LS_KEYS } from "../../../types";
import Swal from "sweetalert2";
import useTranslation from "../../i18n/I18nService";

const TOSComponent = () => {
  const { t } = useTranslation();
  const accepted = localStorage.getItem(LS_KEYS.TOS);

  const spamUserUntilTosAccepted = async () => {
    let letUserPass = false;

    if (!accepted) {
      while (!letUserPass) {
        await Swal.fire({
          html: t("tos"),
          icon: "warning",
          input: "checkbox",
          inputPlaceholder: t("agree"),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed && result.value) {
            letUserPass = true;
            localStorage.setItem(LS_KEYS.TOS, "true");
          }
        });
      }
    }
  };

  useEffect(() => {
    spamUserUntilTosAccepted();
  }, []);

  return (
    <></>
  );
};

export default TOSComponent;
