console.log("read file Net.js")

class Net {
    constructor(game) {
        this.diceImages = ["", "dice/1.png", "dice/2.png", "dice/3.png", "dice/4.png", "dice/5.png", "dice/6.png"];
        this.playerColor;
        this.game=game;
        this.drawnNumber;
        this.myColor;
        this.clicked=false;
        this.ui;
        this.client= io();
        this.scene;
        console.log("class Net constructor")
    }
    addPlayer=(name, resFunc) =>{
        let parent = this;
        $.ajax({
            url: "/",
            data: {
                action: "ADD_USER",
                user: name,
            },
            type: "POST",
            success: (res) =>{
                console.log("server response:", res)
                if(res == "exists") {
                    resFunc("<span style='color:red;'>Player with same nick already exists</span>")
                }
                else if (res == "overload") {
                    resFunc("Game have reached limit of players")
                }
                else {
                    res = JSON.parse(res);
                    $("#menu").toggle("slow",  () =>{});

                    if (res.length == 1) {
                        resFunc("Player added: " + res[0])
                        parent.game.check();
                        parent.game.Camera1();
                        parent.myColor = "reds"
                        parent.playerColor = "white";
                    }
                    else if (res.length == 2) {
                        resFunc("Player added: " + res[1])
                        setTimeout(() => {
                            parent.game.check();
                        }, 1500);
                        parent.game.Camera2();
                        parent.myColor = "blues"
                        parent.playerColor = "black";
                    }
                    parent.client.on("onconnect",  (data) =>{
                        console.log(data.clientName)
                    })

                    window.playgame()
                }
                console.log("SERVER RECEIVED DATA")
            },
            error: (xhr, status, error) =>{
                console.log(xhr);
            },
        });
    }
    removePlayers=(resFunc)=> {
        let parent=this;
        $.ajax({
            url: "/",
            data: {
                action: "RESET",
            },
            type: "POST",
            success: (res) =>{
                console.log("Server response:", res)
                resFunc("RESET")

                console.log("SERVER RECEIVED DATA")
            },
            error: (xhr, status, error) =>{
                console.log(xhr);
            },
        });
    }
    checkPlayers=() =>{
        let parent=this;
        $.ajax({
            url: "/",
            data: {
                action: "CHECK",
            },
            type: "POST",
            success: (res) => {
                res = JSON.parse(res);
                console.log("CHECKING NUMBER OF PLAYERS, currently: " + res.length)
                if (res.length == 1) {
                    parent.ui.loading(true);
                }
                else if (res.length == 2) {
                    parent.ui.loading(false);
                    clearInterval(parent.game.interval);
                    parent.ui.info("Active players: " + res[0] + ", " + res[1])
                    if (parent.myColor == "reds")
                        $("#dice").show();

                    $("#waiting").hide();
                }
                console.log("SERVER RECEIVED DATA")
            },
            error: (xhr, status, error) => {
                console.log(xhr);
            },
        });
    }
    dice() {
        let parent = this
        $.ajax({
            url: "/",
            data: {
                action: "GETSIZE",
            },
            type: "POST",
            success:  (res) => {
                if (parent.clicked == false) {
                    parent.clicked = true
                    let drawnNumber = res;
                    parent.drawnNumber = res;

                    console.log(drawnNumber)

                    $("#dice").attr("src", parent.diceImages[drawnNumber]);

                    let pname = parent.myColor[0].toUpperCase();

                    if (drawnNumber != 6) {
                        let another = false;
                        for (let i = 1; i < 5; i++) {
                            if (parent.scene.getObjectByProperty("_name", (pname + i))._posonmap != -1 && 
                            parent.scene.getObjectByProperty("_name", (pname + i))._posonmap + parseInt(drawnNumber) <= 27 && 
                            parent.scene.getObjectByProperty("_name", (pname + i))._posonmap != -100) {
                                another = true;
                            }
                        }

                        if (another == false) {
                            let turn
                            if (parent.myColor == "reds") {
                                turn= "blues"
                                parent.ui.info("<span style='color:blue;'>BLUE</span> MOVES")
                            }
                            else {
                                turn = "reds"
                                parent.ui.info("<span style='color:red;'>RED</span> MOVES")
                            }
                            setTimeout(()=>{
                                parent.client.emit("chturn", {
                                    turn: turn
                                })
                                parent.clicked = false;
                                $("#dice").hide();
                            }, 1000)
                        }
                    }
                }
            },
            error: (xhr, status, error) => {
                console.log(xhr);
            },
        });
    }
    getBluePositions=async()=>{
        let pos;
        await $.ajax({
            url: "/",
            data: {
                action: "BLUE",
            },
            type: "POST",
            success:(res) =>{
                let ob = JSON.parse(res)[0].blues
                pos=JSON.parse(ob);
            },
            error: (xhr, status, error) =>{
                console.log(xhr);
            },
        });
        return pos;
    }
    getRedPositions=async() =>{
        let pos;
        await $.ajax({
            url: "/",
            data: {
                action: "RED",
            },
            type: "POST",
            success: (res) =>{
                let ob = JSON.parse(res)[0].reds
                pos=JSON.parse(ob);
            },
            error: (xhr, status, error) => {
                console.log(xhr);
            },
        });
        return pos;
    }
    getPlayerColor=()=>{
        return this.playerColor;
    }

}