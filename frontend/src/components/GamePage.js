import React, { useState, useEffect } from "react";
import { Button } from "@material-ui/core";
import Game from "./MYGAME";
import MYGAME from "./MYGAME";

const GamePage = ({ socket, name, code, first }) => {
  const [start, setStart] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [roomName, setRoomName] = useState("");
  const [updates, setUpdates] = useState([]);
  const items = updates.map((item, index) => {
        return <li key={index} style={{ whiteSpace: 'pre-wrap' }}>{item}</li>;
  }
  );

  useState(() => {
    socket.current.on("player_count", (count) => {
      setPlayerCount(count);
    });
    socket.current.on("roomName", (name) => {
      setRoomName(name);
    });
    socket.current.on("start_game", () => {
      setStart(true);
      console.log("вау")
    });
  }, [socket.current]);




  const startGame = () => {
    if (playerCount < 2) {
      window.alert("Вам необходимо минимум 2 человека для начала игры");
      return null;
    }
    socket.current.emit("start_game", code);
    console.log("Игра начата");

  };

  const leaveRoom = () => {
    socket.current.emit("leave_room", { name, code });
  };

  return (
    <div className="gamepage">
      {start ? (
        <MYGAME
          room={code}
          socket={socket}
          name={name}
          first={first}
        />
      ) : (
        <div className="flex-centered">
          <div className="login flex-centered-column">
            <h2>
              Вы присоеденились к комнате <span style={{ color: "blue" }}>{roomName}</span>{" "}
            </h2>
            <h2>Код комнаты {code}  </h2>
            <h2>В комнате {playerCount} игрок(а) </h2>
            <h1>Начать игру?</h1>
            <div className="actions">
              <div className="button">
                <Button
                  color="primary"
                  variant="contained"
                  onClick={startGame}
                  className="abutton"
                >
                  {" "}
                  start{" "}
                </Button>
              </div>
              <div className="button">
                <Button color="primary" variant="contained" onClick={leaveRoom}>
                  {" "}
                  Покинуть комнату{" "}
                </Button>
              </div>

            </div>
          </div>
          <div className="updates">
            <ul>
              {items}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
