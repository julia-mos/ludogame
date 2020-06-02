class Grid {
    constructor() {
        let geometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
        let material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.DoubleSide,
            wireframe: true,
            transparent: true,
        });
        material.opacity = 0.1
        this.grid = new THREE.Mesh(geometry, material);
        this.grid.rotation.x = Math.PI / 2;
        this.grid.position.x = 50
    }
    getGrid=() =>{
        return this.grid;
    }
}

Material1 = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide,
    wireframe: false,
    transparent: true,
    opacity: 1
});


FieldGeometry = new THREE.BoxGeometry(50, 10, 50);

RedFieldMaterial = new THREE.MeshPhongMaterial({    
    color: 0xff0000,
    specular: 0xffffff,
    shininess: 1,
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load("./mats/woodDark.png"),
})
BlueFieldMaterial = new THREE.MeshPhongMaterial({
   
    color: 0x0000ff,
    specular: 0xffffff,
    shininess: 1,
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load("./mats/woodDark.png"),
})
LightFieldMaterial = new THREE.MeshPhongMaterial({
   
    color: 0xffffff,
    specular: 0xffffff,
    shininess: 1,
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load("./mats/woodLight.png"),
})

RedPawnMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    specular: 0xffffff,
    shininess: 1,
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load("./mats/woodLight.png"),
})
BluePawnMaterial = new THREE.MeshPhongMaterial({
  
    color: 0x0000ff,
    specular: 0xffffff,
    shininess: 1,
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load("./mats/woodLight.png"),
})
LightenMaterial = new THREE.MeshPhongMaterial({
    color: 0xffff00,
    specular: 0xffffff,
    shininess: 2,
    side: THREE.DoubleSide,
    map: new THREE.TextureLoader().load("./mats/woodLight.png"),
})


