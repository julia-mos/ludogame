class Game {
    constructor(scene, camera, redPawns, bluePawns, allPawns, playerColor, net) {
        this.scene = scene;
        this.camera = camera;
        this.redPawns=redPawns;
        this.bluePawns = bluePawns;
        this.allPawns = allPawns;
        this.interval = null;
        this.chessboard = [
            [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 2, 2, 2, 0, 3, 3, 3, 3, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
        ];
        this.pawns = [];
        this.pawnModel;

        this.InitBoard();
        this.InitKits();

        this.net=net;
    }

    InitBoard() {
        var container = new THREE.Object3D()
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 11; j++) {
                if (this.chessboard[i][j] == 1) {
                    let cube = new THREE.Mesh(FieldGeometry, LightFieldMaterial);
                    cube.position.x = j * 100;
                    cube.position.z = i * 100;
                    cube.receiveShadow=true;
                    cube.castShadow=true;
                    cube.name = "field";
                    container.add(cube);
                }
                else if (this.chessboard[i][j] == 2) {
                    let cube = new THREE.Mesh(FieldGeometry, RedFieldMaterial);
                    cube.position.x = j * 100;
                    cube.position.z = i * 100;
                    cube.receiveShadow=true;
                    cube.castShadow=true;
                    cube.name = "redField";
                    container.add(cube);
                }
                else if (this.chessboard[i][j] == 3) {
                    let cube = new THREE.Mesh(FieldGeometry, BlueFieldMaterial);
                    cube.position.x = j * 100;
                    cube.position.z = i * 100;
                    cube.receiveShadow=true;
                    cube.castShadow=true;
                    cube.name = "blueField";
                    container.add(cube);
                }
            }
        }
        container.name = "board"
        container.position.set(-500, 0, -100)
        this.scene.add(container);
    }
    InitKits() {
        var container = new THREE.Object3D()
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let cube = new THREE.Mesh(FieldGeometry, LightFieldMaterial);
                cube.receiveShadow=true;
                cube.castShadow=true;
                cube.position.x = j * 50;
                cube.position.z = i * 50;
                cube.name = "starter";
                container.add(cube);
            }
        }
        container.name = "starterRed"
        container.position.set(-650, 0, -200)
        this.scene.add(container);

        var container = new THREE.Object3D()
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let cube = new THREE.Mesh(FieldGeometry, LightFieldMaterial);
                cube.receiveShadow=true;
                cube.castShadow=true;
                cube.position.x = j * 50;
                cube.position.z = i * 50;
                
                cube.name = "starter";
                container.add(cube);
            }
        }
        container.name = "starterBlue"
        container.position.set(600, 0, 150)
        this.scene.add(container);
    }
    RedPawnsInit() {
        var counter=1;

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let pawn = this.pawnModel.clone();
                pawn.receiveShadow=true;
                pawn.castShadow=true;
                pawn.position.x = -650+(50 * i);
                pawn.position.z = -200 + (50 * j);

                pawn._posonmap = -1
                pawn._name="R"+counter;
                pawn._starterx = -650+(50 * i);
                pawn._starterz = -200 + (50 * j);
                pawn._win="false"

                this.allPawns.push(pawn)

                counter++;

                pawn.material = RedPawnMaterial;

                this.redPawns.push(pawn)
                this.scene.add(pawn);
            }
        }
    }
    BluePawnsInit() {
        var counter=1;

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                let pawn = this.pawnModel.clone();
                pawn.receiveShadow=true;
                pawn.castShadow=true;
                pawn.position.x = 600 + (50 * i);
                pawn.position.z = 150+(50 * j);

                pawn._posonmap = -1

                pawn._name="B"+counter

                pawn._starterx = 600 + (50 * i);
                pawn._starterz = 150+(50 * j);
                pawn._win="false"
                this.allPawns.push(pawn)

                counter++                

                pawn.material = BluePawnMaterial;

                this.bluePawns.push(pawn)


                this.scene.add(pawn);
            }
        }

    }
    Camera1() {
        this.camera.position.set(0, 750, 750)
        this.camera.lookAt(scene.position);
    }
    Camera2() {
        this.camera.position.set(0, 750, -750)
        this.camera.lookAt(scene.position);
    }
    check() {
        let net=this.net;
        this.interval = setInterval(function () { net.checkPlayers(); }, 500);
        console.log("TEST")
    }
}