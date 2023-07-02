import React, {useState} from 'react';
import {Button, TextField, Paper} from '@material-ui/core';
import GamePage from "./GamePage";
import LoginPage from "./LoginPage";
import CreateNewRoom from "./CreateNewRoom";


const JoinToRoom = ({socket, name}) => {
    const [btn, setButton] = useState(false);
    const [code, setCode] = useState("");
    const setBUtton = (e) => {
        setButton(true);
    };
    const roomNameChangeHandler = (e) => {
        setCode(e.target.value);
    };
    const join = (e) => {
        const roomName = "";
        socket.current.emit('join_room', { roomName, name, code });
        setBUtton(true)
    };

    return (
        <div>
            <div>
                {btn ? (
                    <GamePage
                        socket={socket}
                        name={name}
                        code={code}
                        first={-1}
                    />
                ) : (
                    <div className="login flex-centered-column">
                        <TextField
                            onChange={roomNameChangeHandler}
                            className='textfield'
                            variant='outlined'
                            label='NameRoom'
                            inputProps={{maxLength: 25}}
                        />
                        <div className="button">
                            <Button color="primary" variant="contained" onClick={join}>Присоедениться</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default JoinToRoom
;