const express = require("express");
const app = express();
const cors = require("cors");
const server = require("http").createServer(app);
const ws = require("ws");
const path = require('path');
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
    console.log(`user ${socket.id} has connected`);
    io.to(socket.id).emit("server_id", socket.id);
    socket.on("join_room", ({roomName, name, code}) => {
        socket.join(code);
        socket.nickname = name
        socket.room = code
        if (!rooms[code]) {
            rooms[code] = new MyRoom(roomName, code, io.sockets.adapter.rooms.get(code))
        }
        rooms[code].players.push(name)
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
    socket.on("getState", (room) => {
        io.in(room).emit("getState", JSON.stringify(roomsState[room]));
    });
    socket.on("room_exists", (room) => {
        let res
        res = !rooms[room]
        socket.emit("room_exists", !res );
    });
    socket.on("getPlayerCards", (name, code) => {
        if (name === rooms[code].players[0]) {
            socket.emit("getPlayersCards", JSON.stringify(rooms[code].gameState.player1));
        }
        if (name === rooms[code].players[1]) {
            socket.emit("getPlayersCards", JSON.stringify(rooms[code].gameState.player2));
        }
    });
    socket.on("getOppsCards", (name, code) => {
        if (name === rooms[code].players[0]) {
            socket.emit("getOppsCards", JSON.stringify(rooms[code].gameState.player2));
        }
        if (name === rooms[code].players[1]) {
            socket.emit("getOppsCards", JSON.stringify(rooms[code].gameState.player1));
        }
    });
    socket.on("exchangeCard", (name, code, number) => {
        if(rooms[code].gameState.checkGameOver()){
            io.in(code).emit("getWinner", JSON.stringify(rooms[code].gameState.getWinner()))
            return
        }
        if (name === rooms[code].players[0]) {
            if(rooms[code].gameState.flag === 1){
                rooms[code].gameState.addCardOnTable(rooms[code].gameState.player1, number - 1)
                io.in(code).emit("table", JSON.stringify(rooms[code].gameState.table))
                socket.emit("getScores", JSON.stringify(rooms[code].gameState.player1.score))
            }
        }
        if (name === rooms[code].players[1]) {
            if(rooms[code].gameState.flag === -1){
                rooms[code].gameState.addCardOnTable(rooms[code].gameState.player2, number - 1)
                io.in(code).emit("table", JSON.stringify(rooms[code].gameState.table))
                socket.emit("getScores", JSON.stringify(rooms[code].gameState.player2.score))
            }
        }
        if(rooms[code].gameState.checkGameOver()){
            io.in(code).emit("getWinner", rooms[code].gameState.getWinner())
        }
    });
    socket.on("getCard", (name, code) => {
        if(rooms[code].gameState.checkGameOver()){
            io.in(code).emit("getWinner", JSON.stringify(rooms[code].gameState.getWinner()))
            return
        }
        if (name === rooms[code].players[0]) {
            if(rooms[code].gameState.flag === 1){
                if(rooms[code].gameState.player1.hand.length > 5){
                    rooms[code].gameState.flag = rooms[code].gameState.flag * -1
                    return
                }
                rooms[code].gameState.player1.score -= 1
                rooms[code].gameState.giveCard(rooms[code].gameState.player1)
                socket.emit("getOppsCards", JSON.stringify(rooms[code].gameState.player2));
                socket.emit("getScores", JSON.stringify(rooms[code].gameState.player1.score))
            }
        }
        if (name === rooms[code].players[1]) {
            if(rooms[code].gameState.flag === -1){
                if(rooms[code].gameState.player2.hand.length > 5){
                    rooms[code].gameState.flag = rooms[code].gameState.flag * -1
                    return
                }
                rooms[code].gameState.player2.score -= 1
                rooms[code].gameState.giveCard(rooms[code].gameState.player2)
                socket.emit("getOppsCards", JSON.stringify(rooms[code].gameState.player1));
                socket.emit("getScores", JSON.stringify(rooms[code].gameState.player2.score))
            }
        }

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
    socket.on("check_who", (code, name) => {
        let res = false
        if(name === rooms[code].players[1] && rooms[code].gameState.flag === -1){
            res = true
        }
        if(name === rooms[code].players[0] && rooms[code].gameState.flag === 1){
            res = true
        }
        socket.emit("check_who", res)
    });
    socket.on("disconnect", () => {
        delete(rooms[socket.room])
        io.in(socket.room).emit("end_game")
        io.in(socket.room).emit("gameOver")
        console.log(`${socket.id} has disconnected`);
        if (!socket.room) {
            return
        }
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
        this.deck = [];
        const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
        const ranks = ['ACE', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING'];
        for (const suit of suits) {
            for (const rank of ranks) {
                this.deck.push({suit, rank});
            }
        }
        this.reset();
    }
    reset() {
        this.player1.hand = [];
        this.player1.score = 0;
        this.player2.hand = [];
        this.player2.score = 0;
        this.shuffleDeck();
        this.dealCards();
    }
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
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
    exchangeCard(player, index) {
        const newCard = this.deck.pop();
        const oldCard = player.hand[index];
        player.hand[index] = newCard;
    }
    addCardOnTable(player, index){
       if(this.table === null){
           this.table = player.hand[index]
           player.hand.splice(index, 1)
           this.flag = -1*this.flag
           if(this.table.rank === "ACE" ||
               this.table.rank === 'JACK' ||
               this.table.rank === 'QUEEN' ||
               this.table.rank === 'KING'){
               player.score += 3
           }
           return true;
       }
       if(this.table.rank === player.hand[index].rank || this.table.suit === player.hand[index].suit){
           if(this.table.suit !== player.hand[index].suit){
               player.score += 10
           }
           this.table = player.hand[index]
           player.hand.splice(index, 1)
           this.flag = -1*this.flag
           if(this.table.rank === "ACE" ||
               this.table.rank === 'JACK' ||
               this.table.rank === 'QUEEN' ||
               this.table.rank === 'KING'){
               player.score += 3
           }
           return true;
       }else{
           return false;
       }
    }
    giveCard(player){
        player.hand.push(this.deck.pop())
    }
    checkGameOver(){
        if(this.deck.length === 0){
            return true;
        }
        if(this.player1.hand.length === 0 || this.player2.hand.length === 0){
            return true;
        }
        return false
    }
    getWinner() {
        const winner = {
            player: null,
            scores: 0
        };
        if(this.player1.score > this.player2.score){
            winner.player = 'player1';
            winner.name = this.player1.name;
            winner.scores = this.player1.score
        } else {
            winner.player = 'player2';
            winner.name = this.player2.name;
            winner.scores = this.player2.score
        }
        return winner;
    }
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