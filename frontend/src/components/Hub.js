import React, {useState} from 'react';
import {Button, TextField, Paper} from '@material-ui/core';
import GamePage from "./GamePage";
import LoginPage from "./LoginPage";
import CreateNewRoom from "./CreateNewRoom";
import JoinToRoom from "./joinToRoom";


const Hub = ({socket, name}) => {
    const [btn, setButton] = useState(false);
    const [code, setCode] = useState("");
    const [joinBtn, setJoin] = useState(false);
    const setBUtton = (e) => {
        setButton(true);
    };
    const roomNameChangeHandler = (e) => {
        setCode(e.target.value);
    };
    const join = (e) => {
        setJoin(true)
    };

    return (
        <div>
            <div>
                {btn ? (
                    <CreateNewRoom
                        socket={socket}
                        name={name}
                    />
                ) : (
                    ""
                )}
                {joinBtn || btn ? (
                    ""
                ) : (
                    <div className="login flex-centered-column">
                        <div className="button">
                            <Button color="primary" variant="contained" onClick={join}>Присоедениться</Button>
                        </div>
                        <div className="button">
                            <Button color="primary" variant="contained" onClick={setBUtton}>Создать комнату</Button>
                        </div>
                    </div>
                )}
                {joinBtn ? (
                    <JoinToRoom
                        socket={socket}
                        name={name}
                    />
                ) : (
                    ''
                )}
            </div>
        </div>
    )
}
export default Hub;