import React, {useState, useEffect} from "react";
import {Button, TextField} from "@material-ui/core";
import App from "../App";
const WinnerPage = ({socket, winner, named, scores}) => {
    const [loggd, setLoggd] = useState(false);
    const stLoggd = () => {
        setLoggd(true)
    };
    const [loggedIn, setLoggedIn] = useState(false);
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [check, setCheck] = useState(0)
    const endGame = () => {
        socket.current.emit("end_game", room);
        console.log(named)
        socket.current.emit("leave_room", named, room);
    };
    useEffect(() => {
        if(check === 0){
            endGame()
            setCheck(1)
        }
        socket.current.on("end_game", (message) => {
            setLoggedIn(false);
            socket.current.emit("leave_room", {name, room});
        });
    });
    return (
        <div className="App flex-centered">
            {loggd ? (
                <App/>
            ) : (
                <div className="gamepage">
                    <div className="flex-centered" style={{flexWrap: 'wrap'}}>
                        <div className="login flex-centered-column">
                            Победил игрок {winner}, набрав {scores} очков
                        </div>
                        <div className="button">
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={stLoggd}
                                className="abutton"
                            >
                                {" "}
                                Начать заново?{" "}
                            </Button>
                        </div>
                        <div className="button">

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default WinnerPage;