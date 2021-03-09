import React, { useState, useEffect } from "react";
import InfoOutlinedIcon from "@material-ui/icons/InfoOutlined";
import { useCookies } from "react-cookie";
import { Transition } from "react-transition-group";
import moment from "moment";

import InfoModal from "./InfoModal";
import { useGame } from "../contexts/EscapeRoomContext";
import { ReactComponent as HintArrow } from "../images/click-here-arrow.svg";

const EscapeRoomInformation = () => {
  const { game } = useGame();

  const [openModal, setOpenModal] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  const [cookies, setCookie] = useCookies(["er-information-hint"]);

  useEffect(() => {
    if (hintOpen === true) {
      // set opened cookie
      setCookie("er-information-hint-shown", true, {
        expires: moment()
          .add("2", "hours")
          .toDate()
      });
    }
  }, [hintOpen]);

  useEffect(() => {
    if (!cookies["er-information-hint-shown"]) {
      setTimeout(() => {
        setHintOpen(true);
      }, 2000);
    }
  }, []);

  const handleContainerClick = e => {
    if (hintOpen) {
      setHintOpen(false);
    }
  };

  const handleToggleClick = () => {
    setOpenModal(true);
  };

  const handleOverlayClick = () => {
    setHintOpen(false);
  };

  return (
    <div onClick={handleContainerClick}>
      <button
        className={`info-toggle animate__animated animate__delay-2s ${
          hintOpen ? "animate__heartBeat" : ""
        }`}
        onClick={handleToggleClick}
      >
        <InfoOutlinedIcon />
      </button>
      <InfoModal
        title={`A message from ${game.host.firstName} ${game.host.lastName}`}
        message={game.message}
        meetingId={game.meeting.id}
        meetingPass={game.meeting.password}
        open={openModal}
        setOpen={setOpenModal}
      ></InfoModal>
      {
        <Transition
          timeout={{ enter: 1000, exit: 500 }}
          in={hintOpen}
          unmountOnExit={true}
          appear
        >
          {status => (
            <div
              className={`hint-overlay hint-overlay--${status}`}
              onClick={handleOverlayClick}
            >
              <p className="hint-overlay__text">
                Click here for the zoom login and more information
              </p>
              <HintArrow className="hint-overlay__arrow" />
            </div>
          )}
        </Transition>
      }
    </div>
  );
};

export default EscapeRoomInformation;
