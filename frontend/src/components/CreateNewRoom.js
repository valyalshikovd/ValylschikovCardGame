import React, {useState} from 'react';
import {Button, TextField, Paper} from '@material-ui/core';
import GamePage from "./GamePage";

const CreateNewRoom = ({socket, name}) => {
    const [btn, setButton] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [code, setCode] = useState("");
    const join = (e) => {
        socket.current.emit('join_room', {roomName, name, code});
        setButton(true);
    };
    const roomNameChangeHandler = (e) => {
        setRoomName(e.target.value);
    };
    const createRoom = () => {
        let codef = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 10; i++) {
            codef += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setCode(codef);
    };
    return (
        <div>
            <div>
                {btn ? (
                    <GamePage
                        socket={socket}
                        name={name}
                        code={code}
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
                        <div>Код комнаты: {code}</div>
                        <div className="button">
                            <Button color="primary" variant="contained" onClick={createRoom}>Создать комнату</Button>
                        </div>
                        <div className="button">
                            <Button color="primary" variant="contained" onClick={join}>Продолжить</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default CreateNewRoom;