import React, { useState } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "@material-ui/icons/Close";

import Attribution from "./Attribution";
import zoomLogo from "../images/zoom-logo.svg";

const InfoModal = ({
  title,
  message,
  meetingId,
  meetingPass,
  open,
  setOpen
}) => {
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
            {meetingId && (
              <div className="modal__credentials">
                <img
                  className="modal__zoom"
                  src={zoomLogo}
                  alt="Zoom Meeting Credentials"
                />
                <p>
                  <strong>Meeting ID: </strong>
                  {meetingId}
                  <br />
                  <br />
                  <strong>Password: </strong>
                  {meetingPass}
                </p>
              </div>
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
