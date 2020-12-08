import { React, useState } from "react";

import { useParams } from "react-router-dom";

import db from "../firebase";

const GameWelcomePage = props => {
  let { gameId } = useParams();

  const [game, setGame] = useState(null);

  useState(async () => {
    const foundGame = await db
      .collection("games")
      .doc("4V0eTWRBERyf0cwuGjyt")
      .get();

    if (!foundGame.exists) return;

    setGame(foundGame.data());
  }, []);

  return <p>{game && game.duration}</p>;
};

export default GameWelcomePage;
