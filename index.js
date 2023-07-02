//const MyRoom = require('./MyRoom');

const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const ws = require("ws");
const path = require('path');
//const gameState = require ('./gameState.js');
//const GameState = require('./GameState.js');


const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    wsEngine: ws.Server,
});


const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
    app.use(express.static("frontend/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "build", "index.html"));
    });
}

server.listen(PORT, () => {
    console.log(`server started on Port ${PORT}`);
});

const roomsState = {};
const rooms = {};

io.on("connection", (socket) => {
    var sockets = {};
    console.log(`user ${socket.id} has connected`);
    io.to(socket.id).emit("server_id", socket.id);
    console.log(sockets);

    socket.on("join_room", ({roomName, name, code}) => {

        socket.join(code);
        socket.nickname = name
        socket.room = code
        if (!rooms[code]) {
            console.log('EHHEHE')
            rooms[code] = new MyRoom(roomName, code, io.sockets.adapter.rooms.get(code))
        }
        rooms[code].players.push(name)
        console.log(!rooms[code])
        //   console.log(`${name} присоеденился к комнате ${code}`)
        console.log(rooms)
        io.in(code).emit("roomName", rooms[code].nameRoom);
        io.in(code).emit("player_count", io.sockets.adapter.rooms.get(code).size);



    });

    socket.on("leave_room", ({name, code}) => {
        socket.leave(code);
        if (rooms[code]) {
            io.in(code).emit("update", rooms[code].players);

            if (io.sockets.adapter.rooms.get(code)) {
                io.in(code).emit(
                    "end_game"
                );
                io.in(code).emit(
                    "player_count",
                    io.sockets.adapter.rooms.get(code).size
                );
                console.log(`${name} has left ${code}`);
            }
        }
    });


    socket.on("update", ({update, room}) => {
        try {
            io.in(room).emit("update", update);
        } catch (error) {
            console.log(error.message);
        }
    });



    socket.on("start_game", (code) => {
        console.log(rooms)
        rooms[code].gameState = new GameState(rooms[code].players[0], rooms[code].players[1])
        io.in(code).emit("start_game");
    });

    socket.on("logGameState", (room) => {

    });
    socket.on("getState", (room) => {
        //  console.log(sockets)
        // console.log(room)
        io.in(room).emit("getState", JSON.stringify(roomsState[room]));
        //   console.log(JSON.stringify(sockets[room].gameState))
    });
    socket.on("getPlayerCards", (name, code) => {
        // console.log(socket.numberPlayer)
        console.log("+")
        // console.log(JSON.stringify(roomsState))
        if (name === rooms[code].players[0]) {
            socket.emit("getPlayersCards", JSON.stringify(rooms[code].gameState.player1));
            //  console.log("sss")
        }
        if (name === rooms[code].players[1]) {
            // console.log("sss")
            //  console.log(sockets[room])
            socket.emit("getPlayersCards", JSON.stringify(rooms[code].gameState.player2));

        }
    });
    socket.on("getOppsCards", (name, code) => {
        // console.log(socket.numberPlayer)
        console.log("+")
        // console.log(JSON.stringify(roomsState))
        if (name === rooms[code].players[0]) {
            socket.emit("getOppsCards", JSON.stringify(rooms[code].gameState.player2));
            //  console.log("sss")
        }
        if (name === rooms[code].players[1]) {
            // console.log("sss")
            //  console.log(sockets[room])
            socket.emit("getOppsCards", JSON.stringify(rooms[code].gameState.player1));

        }
    });
    socket.on("exchangeCard", (name, code, number) => {
        console.log(rooms[code])

        if(rooms[code].gameState.checkGameOver()){
            rooms[code].gameState.getWinner()
            io.in(code).emit("getWinner")
        }


        if (name === rooms[code].players[0]) {
            if(rooms[code].gameState.flag === 1){
                console.log(rooms[code].gameState )
                rooms[code].gameState.addCardOnTable(rooms[code].gameState.player1, number - 1)
                io.in(code).emit("table", JSON.stringify(rooms[code].gameState.table))
                socket.emit("checkMove", rooms[code].gameState.player2.name)
                console.log(rooms[code].gameState )
            }
        }
        if (name === rooms[code].players[1]) {
            if(rooms[code].gameState.flag === -1){
                console.log(rooms[code].gameState )
                rooms[code].gameState.addCardOnTable(rooms[code].gameState.player2, number - 1)
                io.in(code).emit("table", JSON.stringify(rooms[code].gameState.table))
                socket.emit("checkMove", rooms[code].gameState.player1.name)
                console.log(rooms[code].gameState )
            }
        }
        console.log(rooms[code].gameState.table )


    });
    socket.on("getCard", (name, code) => {

        if (name === rooms[code].players[0]) {
            if(rooms[code].gameState.flag === 1){
                rooms[code].gameState.giveCard(rooms[code].gameState.player1)
                socket.emit("getOppsCards", JSON.stringify(rooms[code].gameState.player2));
            }
        }
        if (name === rooms[code].players[1]) {
            if(rooms[code].gameState.flag === -1){
                rooms[code].gameState.giveCard(rooms[code].gameState.player2)
                socket.emit("getOppsCards", JSON.stringify(rooms[code].gameState.player1));
            }
        }
        console.log(rooms[code].gameState.table )


    });
    socket.on("getWinner", (code) => {
        io.in(code).emit("getWinner", JSON.stringify(rooms[code].gameState.getWinner()));
    });


    socket.on("end_game", (code) => {
        try {
            rooms[code].delete;
            socket.leave(code);

        } catch (error) {
            console.log(error.message);
        }
    });

    socket.on("disconnect", () => {
        console.log(socket.room + "ой бля")
        delete(rooms[socket.room])
        io.in(socket.room).emit("end_game")
        io.in(socket.room).emit("gameOver")
        console.log(`${socket.id} has disconnected`);
        if (!socket.room) {
            return
        }
        if(io.sockets.adapter.rooms.get(socket.room)){
            io.in(socket.room).emit(
                "player_count",
                io.sockets.adapter.rooms.get(socket.room).size
            );
        }
        console.log(rooms)

    });
});

class MyRoom {
    constructor(nameRoom, code, roomFromSocket) {
        this.nameRoom = nameRoom
        this.code = code
        this.roomFromSocket = roomFromSocket
        this.gameState = null;
        this.players = []
    }
}

class GameState {
    constructor(name1, name2) {
        console.log("gameState created")
        // создаем двух игроков
        this.flag = 1
        this.table = null
        this.goneCards = []
        this.player1 = {
            name: name1,
            hand: [], // массив с картами игрока 1
            score: 0, // очки игрока 1
        };
        this.player2 = {
            name: name2,
            hand: [], // массив с картами игрока 2
            score: 0, // очки игрока 2
        };

        // создаем колоду карт
        this.deck = [];
        const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
        const ranks = ['ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING'];
        for (const suit of suits) {
            for (const rank of ranks) {
                this.deck.push({suit, rank});
            }
        }

        // сбрасываем карты игроков и перемешиваем колоду
        this.reset();
        console.log("Игровое состояние создано")
    }

    // сбрасываем карты игроков и перемешиваем колоду
    reset() {
        this.player1.hand = [];
        this.player1.score = 0;
        this.player2.hand = [];
        this.player2.score = 0;
        this.shuffleDeck();
        this.dealCards();
    }

    // перемешиваем колоду
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    // раздаем карты
    dealCards() {
        for (let i = 0; i < 5; i++) {
            this.player1.hand.push(this.deck.pop());
            this.player2.hand.push(this.deck.pop());
        }
    }

    getScores() {
        this.checkCards(this.player1)
        this.checkCards(this.player2)
    }

    // обменяем карту у игрока с колодой
    exchangeCard(player, index) {
        const newCard = this.deck.pop();
        const oldCard = player.hand[index];
        player.hand[index] = newCard;
    }

    addCardOnTable(player, index){
        console.log("добавление карты " + player)
       if(this.table === null){
           this.table = player.hand[index]
           player.hand.splice(index, 1)
           this.flag = -1*this.flag
           return true;
       }
       if(this.table.rank === player.hand[index].rank || this.table.suit === player.hand[index].suit){
           this.table = player.hand[index]
           player.hand.splice(index, 1)
           this.flag = -1*this.flag
           return true;
       }else{
           return false;
       }
    }
    giveCard(player){
        player.hand.push(this.deck.pop())
    }
    checkGameOver(){
        if(this.deck.length <= 0){
            return true;
        }
        if(this.player1.hand === 0 || this.player2.hand === 0){
            return true;
        }
        return false
    }

    // определяем победителя
    getWinner() {
        const winner = {
            player: null,
            score: 0,
        };
        if(this.player1.hand.length < this.player2.hand.length){
            winner.player = 'player1';
            winner.score = this.player1.score;
            winner.name = this.player1.name;
        } else {
            winner.player = 'player2';
            winner.score = this.player2.score;
            winner.name = this.player2.name;
        }
        return winner;
    }

    // выводим состояние игры в консоль
    logState() {
        console.log('Player 1:');
        console.log(this.player1.hand);
        console.log(`Score: ${this.player1.score}`);
        console.log('Player 2:');
        console.log(this.player2.hand);
        console.log(`Score: ${this.player2.score}`);
        console.log(`Cards remaining in deck: ${this.deck.length}`);
    }
}


