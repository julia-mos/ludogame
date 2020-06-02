
let qs = require("querystring")
let express = require("express")
let bodyParser = require("body-parser")
let app = express()
let http = require("http").createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 3000;
players = [];

let mongoClient = require('mongodb').MongoClient
let ObjectID = require('mongodb').ObjectID;
let _db;

let socketio = require('socket.io')(http);

const reds = [
    { x: -500, z: -100 },
    { x: -400, z: -100 },
    { x: -300, z: -100 },
    { x: -200, z: -100 },
    { x: -100, z: -100 },
    { x: 0, z: -100 },
    { x: 100, z: -100 },
    { x: 200, z: -100 },
    { x: 300, z: -100 },
    { x: 400, z: -100 },
    { x: 500, z: -100 },
    { x: 500, z: 0 },
    { x: 500, z: 100 },
    { x: 400, z: 100 },
    { x: 300, z: 100 },
    { x: 200, z: 100 },
    { x: 100, z: 100 },
    { x: 0, z: 100 },
    { x: -100, z: 100 },
    { x: -200, z: 100 },
    { x: -300, z: 100 },
    { x: -400, z: 100 },
    { x: -500, z: 100 },
    { x: -500, z: 0 },
    { x: -400, z: 0 },
    { x: -300, z: 0 },
    { x: -200, z: 0 },
    { x: -100, z: 0 },
]
const blues = [
    { x: 500, z: 100 },
    { x: 400, z: 100 },
    { x: 300, z: 100 },
    { x: 200, z: 100 },
    { x: 100, z: 100 },
    { x: 0, z: 100 },
    { x: -100, z: 100 },
    { x: -200, z: 100 },
    { x: -300, z: 100 },
    { x: -400, z: 100 },
    { x: -500, z: 100 },
    { x: -500, z: 0 },
    { x: -500, z: -100 },
    { x: -400, z: -100 },
    { x: -300, z: -100 },
    { x: -200, z: -100 },
    { x: -100, z: -100 },
    { x: 0, z: -100 },
    { x: 100, z: -100 },
    { x: 200, z: -100 },
    { x: 300, z: -100 },
    { x: 400, z: -100 },
    { x: 500, z: -100 },
    { x: 500, z: 0 },
    { x: 400, z: 0 },
    { x: 300, z: 0 },
    { x: 200, z: 0 },
    { x: 100, z: 0 },
]

app.use(express.static('static'))
http.listen(PORT,  () =>{
    console.log("server running at the port " + PORT)
})

mongoClient.connect("mongodb://localhost/ludo",  (err, db) =>{
    if (err) console.log(err)
    else console.log("mongo connected!")
    db.collection("players").drop()
    db.collection("positions").drop()
    db.createCollection("players",  (err, coll) =>{
        console.log("Created collection `players`")
    })
    db.createCollection("positions",  (err, coll) =>{
        coll.insert({ color: "RED", reds: JSON.stringify(reds) },  (err, result) =>{
            delete reds;
            console.log("Added positions of red pawns")
        });
        coll.insert({ color: "BLUE", blues: JSON.stringify(blues) },  (err, result) =>{
            delete blues;
            console.log("Added positions of blue pawns")
        });
    })
    _db = db;
})

socketio.on('connection',  (client) =>{
    console.log("Client connected" + client.id)

    client.emit("onconnect", {
        clientName: client.id
    })

    client.on("synch",  (data) =>{
        console.log(data)
        client.broadcast.emit("synch", data)
    })
    client.on("chturn",  (data) =>{
        console.log(data)
        client.broadcast.emit("chturn", data)
    })
    client.on("taken",  (data) =>{
        console.log(data)
        client.broadcast.emit("taken", data)
    })
    client.on("endgame",  (data) =>{
        console.log(data)
        client.broadcast.emit("endgame", data)
    })
    client.on("small", (data) =>{
        console.log(data)
        client.broadcast.emit("small", data)
    })
});


app.post("/",  (req, res) =>{
    let finish = req.body;

    if (finish.action == "ADD_USER") {
        if (players.length == 2) {
            res.send("overload");
        }
        else if (players.indexOf(finish.user)!=-1) {
            res.send("exists");
        }
        else {
            let coll = _db.collection("players")
            coll.insert({ login: finish.user },  (err, result) =>{
                console.log("Added user " + finish.user + " to database")
            })
            players.push(finish.user);
            console.log("PLAY:" + players)
            res.send(JSON.stringify(players, null, 4));
        }
    }
    else if (finish.action == "RESET") {
        res.send("DELETED PLAYERS");
        players = [];
    }
    else if (finish.action == "CHECK") {
        res.send(JSON.stringify(players, null, 4));
    }
    else if (finish.action == "GETSIZE") {
        let co = Math.floor(Math.random() * 6 + 1)
        res.send(co.toString())
    }
    else if (finish.action == "BLUE") {
        let coll = _db.collection("positions")
        coll.find({ color: "BLUE" }).toArray( (err, items) =>{
            res.end(JSON.stringify(items))
        });
    }
    else if (finish.action == "RED") {
        let coll = _db.collection("positions")
        coll.find({ color: "RED" }).toArray( (err, items) => {
            res.end(JSON.stringify(items))
        });
    }
})