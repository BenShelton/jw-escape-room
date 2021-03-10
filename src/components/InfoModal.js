import React, { useState } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "@material-ui/icons/Close";

import Attribution from "./Attribution";
import ZoomCredentials from "./ZoomCredentials";

const InfoModal = ({ title, message, meeting, open, setOpen }) => {
  const handleClose = e => {
    if (e.target.matches(".modal") || e.target.matches(".modal__close")) {
      setOpen(false);
    }
  };

  return createPortal(
    <>
      {open && (
        <div className="modal modal--type--box" onClick={handleClose}>
          <div className="modal__box">
            <button className="modal__close">
              <CloseIcon />
            </button>
            {message && (
              <>
                <p className="modal__title">{title}</p>
                <div className="modal__content text-content">
                  <p>{message}</p>
                </div>
              </>
            )}
            {meeting && (
              <ZoomCredentials
                className="modal__zoom-credentials"
                meeting={meeting}
              />
            )}
            <div className="modal__attribution">
              <Attribution />
            </div>
          </div>
        </div>
      )}
    </>,
    document.getElementById("modal-root")
  );
};

export default InfoModal;
