$(document).ready(function () {
    let redPawns = [];
    let bluePawns = [];
    let allPawns = [];
    let redPositions = [];
    let bluePositions = [];

    let net;
    let ui;
    let game;

    let red = false;
    let myColor;
    let drawnNumber;

    let clicked = false;
    let client;
    let currentTurn = "reds"
    let wincount = 0;

    let turn;

    let pawnModel;

    let loader = new THREE.OBJLoader();
    loader.load('pawn.obj',  (object) =>{
        object = object.children[0];
        object.scale.set(5, 5, 5)
        object.material = RedPawnMaterial
        pawnModel = object;
        game.pawnModel = pawnModel;
        game.RedPawnsInit()
        game.BluePawnsInit()
    });


    net = new Net(game, client)
    ui = new Ui(net)

    net.ui=ui;

    scene = new THREE.Scene();


    const width = $(window).width();
    const height = $(window).height();

    let camera = new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        11000
    );
    $(window).resize( () =>{
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000);
    renderer.setSize(width, height);


    $("#root").append(renderer.domElement);



    camera.position.set(0, 500, 0)
    camera.lookAt(scene.position);
    console.log(scene.position)

    //////////////
    //LIGHT//////
    /////////////

    let light = new THREE.PointLight(0xf7c9c1, 1, 2000);
    light.position.set(0, 500, 0);

    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;
    scene.add(light);

    let playerColor = net.getPlayerColor();

    game = new Game(scene, camera, redPawns, bluePawns, allPawns, playerColor, net)

    net.game = game
    net.scene = scene
    //////////////
    //ORBIT//////
    /////////////


    let orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControl.addEventListener('change',  () =>{
        renderer.render(scene, camera)
        this.minDistance = 500;
        this.maxDistance = 1900;
    });
    camera.position.set(0, 500, 1)
    orbitControl.update();

    //////////////
    //RAYCASTER//
    /////////////

    let currentPawn = null;
    let raycaster = new THREE.Raycaster();
    let mouseVector = new THREE.Vector2()

    client = net.client;



    window.playgame = async () => {
        myColor = net.myColor;

        bluePawns = game.bluePawns
        redPawns = game.redPawns
        allPawns = game.allPawns

        bluePositions = await net.getBluePositions();
        redPositions = await net.getRedPositions();


        console.log("COLOR: " + myColor)

        client.on("synch",  (data) => {
            scene.getObjectByProperty("_name", data.name).position.set(data.posx, 0, data.posz)
            scene.getObjectByProperty("_name", data.name)._posonmap = data.onmap;
            scene.getObjectByProperty("_name", data.name).scale.set(5, 5, 5);

            currentTurn = data.turn;

            if (currentTurn == myColor) {
                $("#dice").show();
                $("#dice").attr("src", "dice/0.png")
                ui.info("YOUR TURN")
            }
            else {
                if (myColor == "reds") {
                    ui.info("<span style='color:blue;'>BLUE</span> MOVES")
                }
                else {
                    ui.info("<span style='color:red;'>RED</span> MOVES")
                }
            }
        })

        client.on("chturn",  (data) => {
            currentTurn = data.turn;
            if (currentTurn == myColor) {
                $("#dice").show();
                $("#dice").attr("src", "dice/0.png")
                ui.info("YOUR TURN")
            }
            else {
                if (myColor == "reds") {
                    ui.info("<span style='color:blue;'>BLUE</span> MOVES")
                }
                else {
                    ui.info("<span style='color:red;'>RED</span> MOVES")
                }
            }
        })
        client.on("taken",  (data) =>{
            ui.info("YOUR TURN")
            let takenPawn = scene.getObjectByProperty("_name", data.name)
            takenPawn.position.set(takenPawn._starterx, 0, takenPawn._starterz)
            takenPawn._posonmap = -1
        })
        client.on("endgame",  () =>{
            $("#win").transition('scale')
            $("#win").html("<h1><i style='color:red' class='thumbs down icon'></i>YOU LOST<i style='color:red' class='thumbs down icon'></i></h1>")
            $(document).off("mousedown")
            $(document).off("mouseover")
        })
        client.on("small",  (data) =>{
            let pawn = scene.getObjectByProperty("_name", data.name)
            pawn.scale.set(3, 3, 3)
            pawn.position.set(data.posx, 0, data.posz)
        })


        let raycaster2 = new THREE.Raycaster();

        let mouseVector2 = new THREE.Vector2();

        let hovered = null;

        $(document).on("mousemove",  (event) =>{
            mouseVector2.x = (event.clientX / $(window).width()) * 2 - 1;
            mouseVector2.y = -(event.clientY / $(window).height()) * 2 + 1;
            raycaster2.setFromCamera(mouseVector2, camera);
            let intersects2;
            if (myColor == "reds")
                intersects2 = raycaster2.intersectObjects(redPawns, true);
            else
                intersects2 = raycaster2.intersectObjects(bluePawns, true);


            if (intersects2.length > 0) {
                drawnNumber = net.drawnNumber

                if (!hovered) {
                    hovered = intersects2[0].object;
                    if (((hovered._posonmap == -1 && drawnNumber == 6) || (hovered._posonmap != -1 && hovered._posonmap + parseInt(drawnNumber) <= 27))
                        && hovered._win == "false" && currentTurn == myColor) {
                        hovered.material = LightenMaterial;
                        hovered._hovered = "true"
                    }
                }
                else if (hovered != intersects2[0].object) {
                    if (myColor == "reds")
                        hovered.material = RedFieldMaterial;
                    else
                        hovered.material = BlueFieldMaterial;

                    hovered._hovered = "false"
                    hovered = null;
                }
            }
            else {
                if (hovered) {
                    if (myColor == "reds")
                        hovered.material = RedFieldMaterial;
                    else
                        hovered.material = BlueFieldMaterial;
                    
                        hovered = null;
                }
               
            }

        })
        $(document).on("mousedown",  () =>{
            drawnNumber = net.drawnNumber
            mouseVector.x = (event.clientX / $(window).width()) * 2 - 1;
            mouseVector.y = -(event.clientY / $(window).height()) * 2 + 1;
            raycaster.setFromCamera(mouseVector, camera);
            let intersects;


            if (myColor == "reds")
                intersects = raycaster2.intersectObjects(redPawns, true);
            else
                intersects = raycaster2.intersectObjects(bluePawns, true);

            if (intersects.length > 0) {
                let turnCopy = currentTurn
                let taken = false
                if (intersects[0].object._posonmap + parseInt(drawnNumber) <= redPositions.length - 1 && net.clicked == true && currentTurn == myColor &&
                    intersects[0].object._hovered == "true") {
                    if (intersects[0].object._posonmap == -1 && parseInt(drawnNumber) == 6) {
                        intersects[0].object._posonmap = 0
                        intersects[0].object.scale.set(5, 5, 5)
                        if (myColor == "reds") {
                            currentTurn = "reds"
                            turn = "reds"
                            intersects[0].object.position.x = redPositions[0].x
                            intersects[0].object.position.z = redPositions[0].z
                        }
                        else {
                            currentTurn = "blues"
                            turn = "blues"
                            intersects[0].object.position.x = bluePositions[0].x
                            intersects[0].object.position.z = bluePositions[0].z

                        }
                        client.emit("synch", {
                            name: intersects[0].object._name,
                            posx: intersects[0].object.position.x,
                            posz: intersects[0].object.position.z,
                            onmap: intersects[0].object._posonmap,
                            turn: turnCopy
                        })

                        let onlyPawns = []
                        for (let i = 0; i < allPawns.length; i++) {
                            if (allPawns[i]._posonmap == 0 && allPawns[i]._name[0] == myColor[0].toUpperCase())
                                onlyPawns.push(allPawns[i])
                        }

                        for (let i = 0; i < onlyPawns.length; i++) {
                            if (onlyPawns[i]._name[0] == "B") {
                                onlyPawns[i].position.x = bluePositions[onlyPawns[i]._posonmap].x
                                onlyPawns[i].position.z = bluePositions[onlyPawns[i]._posonmap].z
                            }
                            else {
                                onlyPawns[i].position.x = redPositions[onlyPawns[i]._posonmap].x
                                onlyPawns[i].position.z = redPositions[onlyPawns[i]._posonmap].z

                            }
                            if (onlyPawns.length == 2) {
                                onlyPawns[i].scale.set(3, 3, 3)
                                onlyPawns[i].position.y = 0

                                if (i == 0) {
                                    onlyPawns[i].position.x -= 10
                                    onlyPawns[i].position.z += 10
                                }
                                else {
                                    onlyPawns[i].position.x += 10
                                    onlyPawns[i].position.z -= 10
                                }

                                client.emit("small", {
                                    name: onlyPawns[i]._name,
                                    posx: onlyPawns[i].position.x,
                                    posz: onlyPawns[i].position.z
                                })
                            }
                            else if (onlyPawns.length > 2) {
                                onlyPawns[i].scale.set(3, 3, 3)
                                onlyPawns[i].position.y = 0

                                if (i % 2 == 0) {
                                    if (i == 0)
                                        onlyPawns[i].position.x -= 10;
                                    else
                                        onlyPawns[i].position.x += 10;

                                    onlyPawns[i].position.z -= 10;
                                }
                                else {
                                    if (i == 1)
                                        onlyPawns[i].position.x += 10
                                    else
                                        onlyPawns[i].position.x -= 10

                                    onlyPawns[i].position.z += 10;
                                }
                                client.emit("small", {
                                    name: onlyPawns[i]._name,
                                    posx: onlyPawns[i].position.x,
                                    posz: onlyPawns[i].position.z
                                })
                            }
                        }
                        $("#dice").attr("src", "dice/0.png")
                        net.clicked = false;
                    }
                    else if (intersects[0].object._posonmap > -1) {
                        intersects[0].object.scale.set(5, 5, 5)


                        $("#dice").hide();
                        if (myColor == "reds") {
                            ui.info("<span style='color:blue;'>BLUE</span> MOVES")
                        }
                        else {
                            ui.info("<span style='color:red;'>RED</span> MOVES")
                        }
                        intersects[0].object._posonmap = intersects[0].object._posonmap + parseInt(drawnNumber)

                        let where = intersects[0].object._posonmap


                        if (myColor == "reds") {
                            currentTurn = "blues"
                            turn = "blues"
                            intersects[0].object.position.x = redPositions[where].x
                            intersects[0].object.position.z = redPositions[where].z
                            for (let i = 0; i < bluePawns.length; i++) {
                                if ((bluePawns[i]._posonmap - 12 == intersects[0].object._posonmap && where < 12) || (bluePawns[i]._posonmap + 12 == intersects[0].object._posonmap && where >= 12)) {
                                    bluePawns[i].position.x = bluePawns[i]._starterx
                                    bluePawns[i].position.z = bluePawns[i]._starterz
                                    bluePawns[i]._posonmap = -1
                                    client.emit("synch", {
                                        name: intersects[0].object._name,
                                        posx: intersects[0].object.position.x,
                                        posz: intersects[0].object.position.z,
                                        onmap: intersects[0].object._posonmap,
                                        turn: myColor
                                    })
                                    client.emit("chturn", {
                                        turn: myColor
                                    })
                                    client.emit("taken", {
                                        name: bluePawns[i]._name
                                    })
                                    $("#dice").show();
                                    $("#dice").attr("src", "dice/0.png")
                                    currentTurn = "reds"
                                    turn = "reds"
                                    net.clicked = false;
                                    return;
                                }
                            }

                        }
                        else {
                            currentTurn = "reds"
                            turn = "reds"
                            intersects[0].object.position.x = bluePositions[where].x
                            intersects[0].object.position.z = bluePositions[where].z
                            for (let i = 0; i < redPawns.length; i++) {
                                if ((redPawns[i]._posonmap + 12 == intersects[0].object._posonmap && where >= 12) ||
                                    (redPawns[i]._posonmap - 12 == intersects[0].object._posonmap && where < 12)) {
                                    redPawns[i].position.x = redPawns[i]._starterx
                                    redPawns[i].position.z = redPawns[i]._starterz
                                    redPawns[i]._posonmap = -1

                                    client.emit("synch", {
                                        name: intersects[0].object._name,
                                        posx: intersects[0].object.position.x,
                                        posz: intersects[0].object.position.z,
                                        onmap: intersects[0].object._posonmap,
                                        turn: myColor
                                    })
                                    client.emit("chturn", {
                                        turn: myColor
                                    })
                                    client.emit("taken", {
                                        name: redPawns[i]._name
                                    })

                                    $("#dice").show();
                                    $("#dice").attr("src", "dice/0.png")

                                    currentTurn = "blues"
                                    turn = "blues"
                                    net.clicked = false;
                                    return;
                                }
                            }

                        }

                        if (intersects[0].object._posonmap > 23) {
                            if (myColor == "reds") {
                                intersects[0].object.position.z = -200;
                                intersects[0].object.position.x = -400 + wincount * 100;
                            }
                            else {
                                intersects[0].object.position.z = 200;
                                intersects[0].object.position.x = 400 - wincount * 100;
                            }
                            intersects[0].object._posonmap = -100
                            intersects[0].object._win = "true"

                            wincount++

                            if (wincount == 4)
                                endgame();
                        }
                        if (drawnNumber != 6) {
                            client.emit("synch", {
                                name: intersects[0].object._name,
                                posx: intersects[0].object.position.x,
                                posz: intersects[0].object.position.z,
                                onmap: intersects[0].object._posonmap,
                                turn: turn
                            })
                        }
                        else {
                            currentTurn = myColor;
                            turn = myColor;
                            client.emit("synch", {
                                name: intersects[0].object._name,
                                posx: intersects[0].object.position.x,
                                posz: intersects[0].object.position.z,
                                onmap: intersects[0].object._posonmap,
                                turn: myColor
                            })
                            client.emit("chturn", {
                                turn: myColor
                            })
                            $("#dice").show();
                            hovered=null;
                        }
                        let alonePawns = []

                        if (myColor == "reds") {
                            for (let i = 0; i < redPawns.length; i++) {
                                if (redPawns[i]._posonmap == intersects[0].object._posonmap && redPawns[i]._posonmap != -100)
                                    alonePawns.push(redPawns[i])
                            }
                        }
                        else {
                            for (let i = 0; i < bluePawns.length; i++) {
                                if (bluePawns[i]._posonmap == intersects[0].object._posonmap && bluePawns[i]._posonmap != -100)
                                    alonePawns.push(bluePawns[i])
                            }

                        }
                        if (alonePawns.length > 1) {
                            for (let i = 0; i < alonePawns.length; i++) {
                                if (alonePawns[i]._name[0] == "B") {
                                    alonePawns[i].position.x = bluePositions[alonePawns[i]._posonmap].x
                                    alonePawns[i].position.z = bluePositions[alonePawns[i]._posonmap].z
                                }
                                else {
                                    alonePawns[i].position.x = redPositions[alonePawns[i]._posonmap].x
                                    alonePawns[i].position.z = redPositions[alonePawns[i]._posonmap].z

                                }

                                if (alonePawns.length == 2) {
                                    alonePawns[i].scale.set(3, 3, 3)
                                    alonePawns[i].position.y = 0

                                    if (i == 0) {
                                        alonePawns[i].position.x -= 10
                                        alonePawns[i].position.z += 10
                                    }
                                    else {
                                        alonePawns[i].position.x += 10
                                        alonePawns[i].position.z -= 10
                                    }

                                    client.emit("small", {
                                        name: alonePawns[i]._name,
                                        posx: alonePawns[i].position.x,
                                        posz: alonePawns[i].position.z
                                    })
                                }
                                else if (alonePawns.length > 2) {
                                    alonePawns[i].scale.set(3, 3, 3)
                                    alonePawns[i].position.y = 0
                                    if (i % 2 == 0) {
                                        if (i == 0)
                                            alonePawns[i].position.x -= 10;
                                        else
                                            alonePawns[i].position.x += 10;

                                        alonePawns[i].position.z -= 10;
                                    }
                                    else {
                                        if (i == 1)
                                            alonePawns[i].position.x += 10
                                        else
                                            alonePawns[i].position.x -= 10

                                        alonePawns[i].position.z += 10;
                                    }
                                    client.emit("small", {
                                        name: alonePawns[i]._name,
                                        posx: alonePawns[i].position.x,
                                        posz: alonePawns[i].position.z
                                    })
                                }
                            }
                        }

                        $("#dice").attr("src", "dice/0.png")
                        net.clicked = false;

                    }

                }
            }

        })
    }


    let geometry = new THREE.CubeGeometry(10000, 10000, 10000);
    let cubeMaterials =
        [
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("gfx/ft.png"), side: THREE.DoubleSide }
            ),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("gfx/bk.png"), side: THREE.DoubleSide }
            ),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("gfx/up.png"), side: THREE.DoubleSide }
            ),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("gfx/dn.png"), side: THREE.DoubleSide }
            ),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("gfx/rt.png"), side: THREE.DoubleSide }
            ),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load("gfx/lf.png"), side: THREE.DoubleSide }
            )
        ];
    let cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
    let cube = new THREE.Mesh(geometry, cubeMaterial);
    cube.rotation.y = Math.PI / 6;
    cube.position.y = -1000;
    scene.add(cube);

    let endgame=() =>{
        $(document).off("mousedown")
        $(document).off("mouseover")
        $("#win").transition('scale')
        $("#win").html("<h1><i style='color:gold' class='trophy icon'></i>YOU WON<i style='color:gold' class='trophy icon'></i></h1>")
        client.emit("endgame", { winner: myColor })
    }
    /////////////////////
    //READING MODEL//
    ///////////////////


    let render=()=>{
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
})
