import React, {useState, useEffect, useRef} from "react";
import "./App.css";
import io from "socket.io-client";

// importing components
import LoginPage from "./components/LoginPage";
import GamePage from "./components/GamePage";
import {Button, TextField} from "@material-ui/core";
import Hub from "./components/Hub";

// const CONNECTION = 'localhost:4000';
const CONNECTION = "/";

const App = () => {
    const [loggedIn, setButton] = useState(false);
    const [name, setName] = useState("");


    const socket = useRef();

    useEffect(() => {
        socket.current = io(CONNECTION, {
            transports: ["websocket"],
        });
    }, [socket]);

    const nameChangeHandler = (e) => {
        setName(e.target.value);
    };
    const setBUtton = (e) => {
        setButton(true);
    };

    return (
        <div className="App flex-centered">

            {loggedIn ? (
                <Hub
                    socket={socket}
                    name={name}
                />
            ) : (
                <div className="login flex-centered-column">
                    <h1>Клаббер-31</h1>
                    <TextField
                        value={name}
                        onChange={nameChangeHandler}
                        className='textfield'
                        variant='outlined'
                        label='Name'
                        inputProps={{maxLength: 25}}
                    />
                    <div className="button">
                        <Button color="primary" variant="contained" onClick={setBUtton}>Подключиться</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
