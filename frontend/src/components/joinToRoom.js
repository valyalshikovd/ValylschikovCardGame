import React, {useState} from 'react';
import {Button, TextField, Paper} from '@material-ui/core';
import GamePage from "./GamePage";
const JoinToRoom = ({socket, name}) => {
    const [btn, setButton] = useState(false);
    const [code, setCode] = useState("");
    const [room_exsist, setRoom_exists] = useState(false);
    const setBUtton = (e) => {
        setButton(true);
    };
    useState(() => {
        socket.current.on("room_exists", (flag) => {
            setRoom_exists(flag)
        });
    }, [socket.current]);
    const roomNameChangeHandler = (e) => {
        setCode(e.target.value);
    };
    const join =  (tmp) => {
        if(tmp === 0){
            return
        }
        socket.current.emit('room_exists', code);
        const roomName = "";
            if (room_exsist) {
                socket.current.emit('join_room', {roomName, name, code});
                setBUtton(true)
            }
        join(tmp-1)
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
                            label='CodeRoom'
                            inputProps={{maxLength: 25}}
                        />
                        <div className="button">
                            <Button color="primary" variant="contained" onClick={join(2)}>Присоедениться</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default JoinToRoom;