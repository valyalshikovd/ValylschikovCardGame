import React, {useState, useEffect, useRef} from "react";
import {Button} from "@material-ui/core";
import WinnerPage from "./WinnerPage";
import GameOver from "./GameOver";

const MYGAME = ({socket, name, room}) => {
        const [updates, setUpdates] = useState([]);
        const [message, setMessage] = useState("");
        const [playerInfo, setPlayerInfo] = useState("");
        const [winner, setWinner] = useState("Победителя нет");
        const [scores, setScores] = useState(0)
        const [check, setCheck] = useState(0)
        const [gameOverCheck, setGameOverCheck] = useState(false)
        const [moveCheck, setMoveCheck] = useState("")
        const styles = {
            centrStyle: {
                display: "block",
                justifyContent: "center",
                alignItems: "center"
            }
        };
        useEffect(() => {
            if (check === 0) {
                getPlayerCard()
                getOppsCard()
                checkMove()
                setCheck(1)
            }
        });

        class Card {
            constructor(card, suit) {
                this.card = card;
                const cardValues = {
                    "HEARTSACE": 1,
                    "HEARTS2": 2,
                    "HEARTS3": 3,
                    "HEARTS4": 4,
                    "HEARTS5": 5,
                    "HEARTS6": 6,
                    "HEARTS7": 7,
                    "HEARTS8": 8,
                    "HEARTS9": 9,
                    "HEARTS10": 10,
                    "HEARTSJACK": 11,
                    "HEARTSQUEEN": 12,
                    "HEARTSKING": 13,
                    "DIAMONDSACE": 1,
                    "DIAMONDS2": 2,
                    "DIAMONDS3": 3,
                    "DIAMONDS4": 4,
                    "DIAMONDS5": 5,
                    "DIAMONDS6": 6,
                    "DIAMONDS7": 7,
                    "DIAMONDS8": 8,
                    "DIAMONDS9": 9,
                    "DIAMONDS10": 10,
                    "DIAMONDSJACK": 11,
                    "DIAMONDSQUEEN": 12,
                    "DIAMONDSKING": 13,
                    "CLUBSACE": 1,
                    "CLUBS2": 2,
                    "CLUBS3": 3,
                    "CLUBS4": 4,
                    "CLUBS5": 5,
                    "CLUBS6": 6,
                    "CLUBS7": 7,
                    "CLUBS8": 8,
                    "CLUBS9": 9,
                    "CLUBS10": 10,
                    "CLUBSJACK": 11,
                    "CLUBSQUEEN": 12,
                    "CLUBSKING": 13,
                    "SPADESACE": 1,
                    "SPADES2": 2,
                    "SPADES3": 3,
                    "SPADES4": 4,
                    "SPADES5": 5,
                    "SPADES6": 6,
                    "SPADES7": 7,
                    "SPADES8": 8,
                    "SPADES9": 9,
                    "SPADES10": 10,
                    "SPADESJACK": 11,
                    "SPADESQUEEN": 12,
                    "SPADESKING": 13,
                };
                this.value = cardValues[card];
                this.suit = suit
                this.placeHolder = null;
                this.flipped = false;
                var suits = {HEARTS: 0, DIAMONDS: 13, CLUBS: 26, SPADES: 39};
                this.position = suits[this.suit] + this.value; //Position in a sorted deck
                this.backgroundPosition = -100 * this.position + "px";
            }
        }

        const styleCardSize = {maxHeight: '150px', maxWidth: '130px'}
        const [playerCards, setPlayerCards] = useState([]);
        const [oppsCards, setOppsCards] = useState([]);
        const [table, setTable] = useState([new Card(0, 0)])
        useEffect(() => {
            socket.current.on("update", ({name, send, length}) => {
                console.log(socket)
                setUpdates((updates) => [...updates, `${name} threw ${send}(${length})`]);
            });
            socket.current.on("end_game", () => {
                socket.current.emit("leave_room", {name, room});
            });
            socket.current.on("getState", (gameState) => {
                const jsonString = JSON.stringify(JSON.parse(gameState));
                console.log(jsonString);
            });
            socket.current.on("getScores", (score) => {
                setScores(score)
            });
            socket.current.on("getPlayersCards", (playerInfo1, room) => {
                const jsonObj = JSON.parse(playerInfo1);
                const arr = []
                try {
                    jsonObj.hand.forEach(function (element, index) {
                        arr.push(new Card(jsonObj.hand[index].suit + jsonObj.hand[index].rank, jsonObj.hand[index].suit))
                    });
                } catch (error) {
                }
                setPlayerCards(arr)
            });
            socket.current.on("getOppsCards", (playerInfo1, room) => {
                const jsonObj = JSON.parse(playerInfo1);
                const arr = []
                jsonObj.hand.forEach(function (element, index) {
                    arr.push(new Card(jsonObj.hand[index].suit + jsonObj.hand[index].rank, jsonObj.hand[index].suit))
                });
                setOppsCards(arr)
            });
            socket.current.on("getWinner", (winnr) => {
                setScores(winnr.scores)
                setWinner(winnr.name);
            });
            socket.current.on("gameOver", () => {
                setGameOverCheck(true)
            });
            socket.current.on("table", (json) => {
                const jsonObj = JSON.parse(json);
                setTable([new Card(jsonObj.suit + jsonObj.rank, jsonObj.suit)])
                socket.current.emit("getPlayerCards", name, room);
                socket.current.emit("getOppsCards", name, room);
                checkMove()
            });
            socket.current.on("check_who", (flag) => {
                if (flag) {
                    setMoveCheck("Ваш ход")
                } else {
                    setMoveCheck("Не ваш ход")
                }
            });
        }, [socket.current]);
        const endGame = () => {
            socket.current.emit("end_game", room);
        };
        const logGameState = () => {
            socket.current.emit("logGameState", room);
        };
        const getState = () => {
            socket.current.emit("getState", room);
        }
        const checkMove = () => {
            socket.current.emit("check_who", room, name);
        }
        const getPlayerCard = () => {
            socket.current.emit("getPlayerCards", name, room);
        }
        const getOppsCard = () => {
            socket.current.emit("getOppsCards", name, room);
        }
        const callExchangeCard = (number) => {
            socket.current.emit("exchangeCard", name, room, number);
        }
        const getWinner = () => {
            socket.current.emit("getWinner", room);
        }
        const getCard = () => {
            checkMove()
            if (moveCheck) {
                socket.current.emit("getCard", name, room);
                socket.current.emit("getPlayerCards", name, room);
                socket.current.emit("getOppsCards", name, room);
            }
        }
        return (
            <div>
                <div>
                    {winner !== "Победителя нет" ? (
                        <WinnerPage socket={socket} winner={winner} named={name} scores={scores}/>
                    ) : (
                        ""
                    )
                    }
                    {winner !== "Победителя нет" || gameOverCheck ? (
                        '') : (
                      //  <div className="Game">
                        <div >
                            <div>Ваше имя {name}</div>
                            <div>{moveCheck}</div>
                            <div>Ваши очки {scores}</div>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    getCard()
                                }}
                            >
                                Стянуть карту
                            </Button>
                            <div>
                                {message}
                            </div>
                            <div id="playerCards flexCentered">
                                <div id="playercards">
                                    {oppsCards.map((card, index) => (
                                        <div
                                            id={"oppsCard".concat((index + 1).toString())}
                                            className="card"
                                            style={{backgroundPosition: 0, ...styleCardSize}}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                            <div id="playerCards flexCentered">
                                <div id="playercards">
                                    {table.map((card, index) => (
                                        <div
                                            id={"playerCard".concat((0).toString())}
                                            className="card"
                                            style={{backgroundPosition: card.backgroundPosition, ...styleCardSize}}
                                        ></div>
                                    ))}
                                </div>
                            </div>


                            <div style={styles.centrStyle}>
                                <div id="playerCards flexCentered">
                                    <div id="playercards">
                                        {playerCards.map((card, index) => (
                                            <div
                                                id={"playerCard".concat((index + 1).toString())}
                                                className="card"
                                                onClick={() => {
                                                    callExchangeCard(index + 1)
                                                }}
                                                style={{backgroundPosition: card.backgroundPosition, ...styleCardSize}}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {gameOverCheck ? (
                        <GameOver socket={socket} named={name} code={room}/>
                    ) : (
                        ""
                    )}
                </div>
            </div>
        )};
export default MYGAME;