import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

let startTime;
let endTime;
let elapsedTime;
let pizzaMonster;
let saviorPizza;
let saviorMesh;
let spotlight;
let monsterIsLimbo;
let saviorIsLimbo;
let roomPositions;
let limbo;
let currentRooms;
let unusedRooms;
let currentRoomBounds;
let camera
let listener
let raycaster
let scene
let renderer
let controls
let moveForward;
let moveBackward;
let moveLeft;
let moveRight;
let loader
let light
let fog;
let playerMesh;
let rays;
let playerCollisions;
let prevTime;
let direction;
let velocity;
let audioLoader
let walkingSound
let buzzingSound
let coughSound;
let deathSound;
let glitchSound;
let winSound;
let pizzaIntersections;
let pizzaDir;
let playerMovement;
let gameLost;
let gameWon;
let room1;
let room2;
let room3;
let room4;
let room5;
let room6;
let room7;
let room8;
let room9;
let room10;
let room11;
let room12;

async function loadObject(id) {
	const result = await loader.loadAsync(`./models/${id}.glb`);
	return result;
}

async function init() {
	//Reset dom stuff
	let canvas = document.getElementsByTagName("canvas");
	for (let i = 0; i < canvas.length; i++) {
		canvas[i].remove();
	}
	if (renderer) {
		renderer.dispose();
	}
	if (startTime != undefined) {
		startTime = new Date();
	}
	document.getElementById("restart").addEventListener("click", init);
	document.getElementById("colorScreen").style.display = "none";
	document.getElementById("menu").style.display = "none";
	document.getElementsByClassName("coverArt")[0].style.display = "none";


	//Initialize object containers
	pizzaMonster = new THREE.Object3D();
	saviorPizza = new THREE.Object3D();
	saviorPizza.name = "saviorPizza";
	saviorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3, 0.7));
	saviorMesh.visible = false;
	spotlight = new THREE.SpotLight( 0xffffff );
	pizzaDir = new THREE.Vector3();
	playerMesh = new THREE.Mesh(
		new THREE.BoxGeometry(0.5, 2, 0.5), 
		new THREE.MeshNormalMaterial() );
	playerMesh.name = "playerMesh";

	room1 = new THREE.Object3D();
	room2 = new THREE.Object3D();
	room3 = new THREE.Object3D();
	room4 = new THREE.Object3D();
	room5 = new THREE.Object3D();
	room6 = new THREE.Object3D();
	room7 = new THREE.Object3D();
	room8 = new THREE.Object3D();
	room9 = new THREE.Object3D();
	room10 = new THREE.Object3D();
	room11 = new THREE.Object3D();
	room12 = new THREE.Object3D();

	//Game Stuff
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 25);
	loader = new GLTFLoader();
	renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize( window.innerWidth, window.innerHeight );
	controls = new PointerLockControls(camera, renderer.domElement);
	document.body.appendChild( renderer.domElement );
	prevTime = performance.now();
	playerMovement = true;
	gameLost = false;
	gameWon = false;
	moveForward = false;
	moveBackward = false;
	moveLeft = false;
	moveRight = false;
	rays = [
        //   Time    Degrees      words
        new THREE.Vector3(0, 0, 1),  // 0 12:00,   0 degrees,  deep
        new THREE.Vector3(1, 0, 1),  // 1  1:30,  45 degrees,  right deep
        new THREE.Vector3(1, 0, 0),  // 2  3:00,  90 degress,  right
        new THREE.Vector3(1, 0, -1), // 3  4:30, 135 degrees,  right near
        new THREE.Vector3(0, 0, -1), // 4  6:00  180 degress,  near
        new THREE.Vector3(-1, 0, -1),// 5  7:30  225 degrees,  left near
        new THREE.Vector3(-1, 0, 0), // 6  9:00  270 degrees,  left
        new THREE.Vector3(-1, 0, 1)  // 7 11:30  315 degrees,  left deep
    ];

	//Start Game Listener and other listeners
	renderer.domElement.addEventListener("click", function () {
			if (startTime == undefined) {
				startTime = new Date();
			}
			controls.lock()
		}
	)
	document.addEventListener('keydown', onKeyDown)
 	document.addEventListener('keyup', onKeyUp)
	
	//Sound
	listener = new THREE.AudioListener();
	camera.add(listener);
	buzzingSound = new THREE.Audio( listener );
	walkingSound = new THREE.Audio( listener );
	coughSound = new THREE.Audio( listener );
	deathSound = new THREE.Audio( listener );
	glitchSound = new THREE.Audio( listener );
	winSound = new THREE.Audio( listener );
	audioLoader = new THREE.AudioLoader();
	audioLoader.load( "./sounds/walking.mp3", function( buffer ) {
		walkingSound.setBuffer( buffer );
		walkingSound.setLoop( true );
		walkingSound.setVolume( 0.6 );
	});
	audioLoader.load( "./sounds/buzzing.mp3", function( buffer ) {
		buzzingSound.setBuffer( buffer );
		buzzingSound.setLoop( true );
		buzzingSound.setVolume( 0.05 );
		buzzingSound.play();
	});
	audioLoader.load( "./sounds/cough.mp3", function( buffer ) {
		coughSound.setBuffer( buffer );
		coughSound.setLoop( false );
		coughSound.setVolume( 0.5 );
	});
	audioLoader.load( "./sounds/death.mp3", function( buffer ) {
		deathSound.setBuffer( buffer );
		deathSound.setLoop( false );
		deathSound.setVolume( 0.8 );
	});
	audioLoader.load( "./sounds/glitch.mp3", function( buffer ) {
		glitchSound.setBuffer( buffer );
		glitchSound.setLoop( false );
		glitchSound.setVolume( 1 );
	});
	audioLoader.load( "./sounds/win.mp3", function( buffer ) {
		winSound.setBuffer( buffer );
		winSound.setLoop( false );
		winSound.setVolume( 1 );
	});

	//Ambient light
	light = new THREE.AmbientLight( 0x404040, 50 ); // soft white light
	fog = new THREE.Fog( 0xcccccc, 15, 30);
	scene.fog = fog;
	scene.add( light );

	direction = new THREE.Vector3();
	velocity = new THREE.Vector3();

	//Init roomPositions
	roomPositions = [
		new THREE.Vector3(-25.6, 0, -25.6),
		new THREE.Vector3(0, 0, -25.6),
		new THREE.Vector3(25.6, 0, -25.6),
		new THREE.Vector3(-25.6, 0, 0),
		new THREE.Vector3(0,0,0),
		new THREE.Vector3(25.6, 0, 0),
		new THREE.Vector3(-25.6, 0, 25.6),
		new THREE.Vector3(0, 0, 25.6),
		new THREE.Vector3(25.6, 0, 25.6)
	];

	limbo = new THREE.Vector3(0, -5, 0);

	//Init Room
	currentRoomBounds = [-25.3, 25.3, 0.3, -0.3]; //N,E,S,W
	

	//Start animation
	document.getElementsByClassName("coverArt")[0].style.display = "block";

	//Load assets into game
	await loadAssets();

	currentRooms = [
		room1,
		room2,
		room3,
		room4,
		room5,
		room6,
		room7,
		room8,
		room9
	];

	unusedRooms = [
		room10,
		room11,
		room12
	]

	//Player Collisions
	playerCollisions = [
		currentRooms[4].scene
	]

	//Post load stuff
	scene.remove(pizzaMonster.scene);
	scene.remove(saviorPizza.scene);
	scene.remove(saviorMesh);
	scene.remove(spotlight);
	scene.remove(playerMesh);
	for (let i = 0; i < currentRooms.length; i++) {
		scene.remove(currentRooms[i].scene);
	}
	for (let i = 0; i < unusedRooms.length; i++) {
		scene.remove(unusedRooms[i].scene);
	}
	scene.add(pizzaMonster.scene);
	scene.add(spotlight);
	scene.add(saviorPizza.scene);
	scene.add(saviorMesh);
	scene.add(playerMesh);
	for (let i = 0; i < currentRooms.length; i++) {
		scene.add(currentRooms[i].scene);
	}
	for (let i = 0; i < unusedRooms.length; i++) {
		scene.add(unusedRooms[i].scene);
	}

	currentRooms[0].scene.position.copy(roomPositions[0]);
	currentRooms[1].scene.position.copy(roomPositions[1]);
	currentRooms[2].scene.position.copy(roomPositions[2]);
	currentRooms[3].scene.position.copy(roomPositions[3]);
	currentRooms[4].scene.position.copy(roomPositions[4]);
	currentRooms[5].scene.position.copy(roomPositions[5]);
	currentRooms[6].scene.position.copy(roomPositions[6]);
	currentRooms[7].scene.position.copy(roomPositions[7]);
	currentRooms[8].scene.position.copy(roomPositions[8]);

	for (let i = 0; i < unusedRooms.length; i++) {
		unusedRooms[i].scene.position.copy(limbo);
	}

	pizzaMonster.scene.position.copy(limbo);
	spotlight.position.copy(limbo);
	saviorMesh.position.copy(limbo);
	saviorPizza.scene.position.copy(limbo);
	monsterIsLimbo = true;
	saviorIsLimbo = true;


	//Initial Camera Position
	controls.getObject().position.copy(currentRooms[1].scene.getObjectByName("Spawn").localToWorld(new THREE.Vector3()));
	controls.getObject().position.y = 1.65;
	controls.getObject().rotation.y = Math.PI/4;
	
	checkRoomChange(controls);
	updatePizzaIntersections();
	

	//Stop animation
	document.getElementsByClassName("coverArt")[0].style.display = "none";

	//First animation loop
	animate();
}

async function loadAssets() {
	//Load objects
	pizzaMonster = await loadObject("pizzaMonster");
	pizzaMonster.scene.name = "pizzaMonster";
	saviorPizza = await loadObject("saviorPizza");
	saviorPizza.scene.name = "saviorPizza";
	room1 = await loadObject("room1");
	room2 = await loadObject("room2");
	room3 = await loadObject("room3");
	room4 = await loadObject("room4");
	room5 = await loadObject("room5");
	room6 = await loadObject("room6");
	room7 = await loadObject("room7");
	room8 = await loadObject("room8");
	room9 = await loadObject("room9");
	room10 = await loadObject("room10");
	room11 = await loadObject("room11");
	room12 = await loadObject("room12");
}

await init();


//Camera Controls
function onKeyDown(event) {
	switch (event.code) {
		case 'ArrowUp':
		case 'KeyW':
			if (!walkingSound.isPlaying) {
				walkingSound.play();
			}
			moveForward = true;
			break;
		case 'ArrowLeft':
		case 'KeyA':
			if (!walkingSound.isPlaying) {
				walkingSound.play();
			}
			moveLeft = true;
			break;
		case 'ArrowDown':
		case 'KeyS':
			if (!walkingSound.isPlaying) {
				walkingSound.play();
			}
			moveBackward = true;
			break;
		case 'ArrowRight':
		case 'KeyD':
			if (!walkingSound.isPlaying) {
				walkingSound.play();
			}
			moveRight = true;
			break;
		case 'Space':
			coughSound.play();
			console.log(controls.getObject().position);
			break;
	}
 }
 function onKeyUp(event) {
	switch (event.code) {
		case 'ArrowUp':
		case 'KeyW':
			if (!moveLeft && !moveRight && !moveBackward) {
				walkingSound.stop();
			}
			moveForward = false
			break
		case 'ArrowLeft':
		case 'KeyA':
			if (!moveForward && !moveBackward && !moveRight) {
				walkingSound.stop();
			}
			moveLeft = false
			break
		case 'ArrowDown':
		case 'KeyS':
			if (!moveForward && !moveRight && !moveLeft) {
				walkingSound.stop();
			}
			moveBackward = false
			break
		case 'ArrowRight':
		case 'KeyD':
			if (!moveForward && !moveBackward && !moveLeft) {
				walkingSound.stop();
			}
			moveRight = false
			break
	}
 }

 //Room Changing Functions
 function checkAndUpdateSaviorPizza() {
	let pizzaLocation = saviorPizza.scene.position;
	let northBound = currentRooms[0].scene.position.z;
	let southBound = currentRooms[6].scene.position.z;
	let eastBound = currentRooms[2].scene.position.x;
	let westBound = currentRooms[0].scene.position.x;
	if (pizzaLocation.z < northBound - 25.3 ||
		pizzaLocation.z > southBound ||
		pizzaLocation.x > eastBound +25.3 ||
		pizzaLocation.x < westBound) {
			saviorIsLimbo = true;
			saviorPizza.scene.position.copy(limbo);
			spotlight.position.copy(limbo);
			saviorMesh.position.copy(limbo);
	}
	let max = 3;
	let min = 1;
	let randInt = Math.floor(Math.random() * (max - min + 1)) + min;
	if (randInt == 1 && saviorIsLimbo) {
		let pizzaPosition;
		let pizzaVector = new THREE.Vector3();
		let randRoom = Math.floor(Math.random() * (7 - 0 + 1) + 0); //Picks a random room but not the center
		if (randRoom >= 4) {
			randRoom += 1;
		}
		pizzaPosition = currentRooms[randRoom].scene.getObjectByName("Spawn").localToWorld(pizzaVector);
		pizzaPosition.y = 0;
		saviorPizza.scene.position.copy(pizzaPosition);
		saviorMesh.position.copy(pizzaPosition);
		saviorMesh.position.y = 1.5;
		spotlight.position.copy(saviorPizza.scene.position);
		spotlight.position.y = 2.5;
		spotlight.target = saviorPizza.scene;
		spotlight.power = 40;
		spotlight.angle = Math.PI/8;
		saviorIsLimbo = false;
	}
 }

 function checkAndUpdatePizzaMonster() {
	let pizzaLocation = pizzaMonster.scene.position;
	let northBound = currentRooms[0].scene.position.z;
	let southBound = currentRooms[6].scene.position.z;
	let eastBound = currentRooms[2].scene.position.x;
	let westBound = currentRooms[0].scene.position.x;
	if (pizzaLocation.z < northBound - 25.3 ||
		pizzaLocation.z > southBound ||
		pizzaLocation.x > eastBound +25.3 ||
		pizzaLocation.x < westBound) {
			monsterIsLimbo = true;
			pizzaMonster.scene.position.copy(limbo);
	}
	let max = 2;
	let min = 1;
	let randInt = Math.floor(Math.random() * (max - min + 1)) + min;
	if (randInt == 1 && monsterIsLimbo) {
		let pizzaPosition;
		let pizzaVector = new THREE.Vector3();
		let randRoom = Math.floor(Math.random() * (7 - 0 + 1) + 0); //Picks a random room but not the center
		if (randRoom >= 4) {
			randRoom += 1;
		}
		pizzaPosition = currentRooms[randRoom].scene.getObjectByName("Spawn").localToWorld(pizzaVector);
		pizzaPosition.y = 1.65;
		pizzaMonster.scene.position.copy(pizzaPosition);
		monsterIsLimbo = false;
	} else {
		checkAndUpdateSaviorPizza();
	}
}

function updateRooms(direction) {
	let oldZ;
	let oldX;
	let newZ;
	let newX;
	let goners;
	switch(direction) {
		case "North":
			oldZ = currentRooms[6].scene.position.z;
			oldX = currentRooms[6].scene.position.x;
			goners = currentRooms.splice(6,3);
			for (let i = 0; i < goners.length; i++) {
				unusedRooms.push(goners[i]);
				goners[i].scene.position.copy(limbo);
			}
			newZ = oldZ - (25.6*3);
			for (let i = 3 - 1; i >= 0; i--) {
				let room = Math.floor(Math.random() * unusedRooms.length);
				let location = new THREE.Vector3(oldX + (i*25.6), 0, newZ);
				unusedRooms[room].scene.position.copy(location);
				currentRooms.unshift(unusedRooms.splice(room,1)[0]);
			}
			break;

		case "South":
			oldZ = currentRooms[0].scene.position.z;
			oldX = currentRooms[0].scene.position.x;
			goners = currentRooms.splice(0,3);
			for (let i = 0; i < goners.length; i++) {
				unusedRooms.push(goners[i]);
				goners[i].scene.position.copy(limbo);
			}
			newZ = oldZ + (25.6*3);
			for (let i = 0; i < 3; i++) {
				let room = Math.floor(Math.random() * unusedRooms.length);
				let location = new THREE.Vector3(oldX + (i*25.6), 0, newZ);
				unusedRooms[room].scene.position.copy(location);
				currentRooms.push(unusedRooms.splice(room,1)[0]);
			}
			break;

		case "East":
			oldZ = currentRooms[0].scene.position.z;
			oldX = currentRooms[0].scene.position.x;
			unusedRooms.push(currentRooms.splice(6,1)[0]);
			unusedRooms[unusedRooms.length - 1].scene.position.copy(limbo);
			unusedRooms.push(currentRooms.splice(3,1)[0]);
			unusedRooms[unusedRooms.length - 1].scene.position.copy(limbo);
			unusedRooms.push(currentRooms.splice(0,1)[0]);
			unusedRooms[unusedRooms.length - 1].scene.position.copy(limbo);
			newX = oldX + (25.6*3);
			for (let i = 0; i < 3; i++) {
				let room = Math.floor(Math.random() * unusedRooms.length);
				let location = new THREE.Vector3(newX, 0, oldZ + (i*25.6));
				unusedRooms[room].scene.position.copy(location);
				switch(i) {
					case 0:
						currentRooms.splice(2, 0, unusedRooms.splice(room, 1)[0]);
						break;
					case 1:
						currentRooms.splice(5, 0, unusedRooms.splice(room, 1)[0]);
						break;
					case 2:
						currentRooms.splice(8, 0, unusedRooms.splice(room, 1)[0]);
						break;
				}
			}
			break;

		case "West":
			oldZ = currentRooms[2].scene.position.z;
			oldX = currentRooms[2].scene.position.x;
			unusedRooms.push(currentRooms.splice(8,1)[0]);
			unusedRooms[unusedRooms.length - 1].scene.position.copy(limbo);
			unusedRooms.push(currentRooms.splice(5,1)[0]);
			unusedRooms[unusedRooms.length - 1].scene.position.copy(limbo);
			unusedRooms.push(currentRooms.splice(2,1)[0]);
			unusedRooms[unusedRooms.length - 1].scene.position.copy(limbo);
			newX = oldX - (25.6*3);
			for (let i = 0; i < 3; i++) {
				let room = Math.floor(Math.random() * unusedRooms.length);
				let location = new THREE.Vector3(newX, 0, oldZ + (i*25.6));
				unusedRooms[room].scene.position.copy(location);
				switch(i) {
					case 0:
						currentRooms.splice(0, 0, unusedRooms.splice(room, 1)[0]);
						break;
					case 1:
						currentRooms.splice(3, 0, unusedRooms.splice(room, 1)[0]);
						break;
					case 2:
						currentRooms.splice(6, 0, unusedRooms.splice(room, 1)[0]);
						break;
				}
			}
			break;
	}
	updatePlayerCollisions();
}

function updateRoomBounds(direction) {
	switch(direction) {
		case "North":
			currentRoomBounds[0] -= 25.6;
			currentRoomBounds[2] -= 25.6;
			break;
		case "South":
			currentRoomBounds[0] += 25.6;
			currentRoomBounds[2] += 25.6;
			break;
		case "East":
			currentRoomBounds[1] += 25.6;
			currentRoomBounds[3] += 25.6;
			break;
		case "West":
			currentRoomBounds[1] -= 25.6;
			currentRoomBounds[3] -= 25.6;
			break;
	}
}

function updatePizzaIntersections() {
	pizzaIntersections = [];
	for (let i = 0; i < currentRooms.length; i++) {
		pizzaIntersections.push(currentRooms[i].scene);
	}
	pizzaIntersections.push(playerMesh);
}

function checkRoomChange(controls) {
	let playerPosition = controls.getObject().position;
	//Check North
	if (playerPosition.z < currentRoomBounds[0]) {
		updateRoomBounds("North");
		updateRooms("North");
		checkAndUpdatePizzaMonster();
		updatePizzaIntersections();
	}
	//Check East
	if (playerPosition.x > currentRoomBounds[1]) {
		updateRoomBounds("East");
		updateRooms("East");
		checkAndUpdatePizzaMonster();
		updatePizzaIntersections();
	}
	//Check South
	if (playerPosition.z > currentRoomBounds[2]) {
		updateRoomBounds("South");
		updateRooms("South");
		checkAndUpdatePizzaMonster();
		updatePizzaIntersections();
	}
	//Check West
	if (playerPosition.x < currentRoomBounds[3]) {
		updateRoomBounds("West");
		updateRooms("West");
		checkAndUpdatePizzaMonster();
		updatePizzaIntersections();
	}
 }

 //Move Pizza Monster
 function movePizzaMonster(delta) {
	let spotted = false;
	if (!monsterIsLimbo) {
		let position = pizzaMonster.scene.position;
		let pizzaSpeed = 7;
		pizzaMonster.scene.getWorldDirection(pizzaDir);
		for (let i = 0; i < 32; i++) {
			pizzaDir.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/16)
			raycaster.set(position, pizzaDir);

			let intersections = raycaster.intersectObjects(pizzaIntersections, true);
			if (intersections.length > 0) {
				if (intersections[0].object.name == "playerMesh") {
					if (!glitchSound.isPlaying) {
						glitchSound.play();
						spotted = true;
					}
					pizzaMonster.scene.lookAt(controls.getObject().position);
					pizzaMonster.scene.translateZ(pizzaSpeed*delta);
				}
			}
		}
	}
	if (!spotted && glitchSound.isPlaying) {
		glitchSound.stop();
	}
 }

 function updatePlayerMesh() {
	playerMesh.position.copy(controls.getObject().position);
 }

 function updatePlayerCollisions() {
	playerCollisions = [currentRooms[4].scene];
 }

 //Collision Detection
 function collisionDetection(controls) {
    function bounceBack(position, ray) {
        position.x -= ray.bounceDistance.x;
        position.y -= ray.bounceDistance.y;
        position.z -= ray.bounceDistance.z;
    }

    let position = controls.getObject().position;
    for (let i = 0; i < rays.length; i++) {

        // Set bounce distance for each vector
        let bounceSize = 0.1;
        rays[i].bounceDistance = {
            x: rays[i].x * bounceSize,
            y: rays[i].y * bounceSize,
            z: rays[i].z * bounceSize
        };

        raycaster.set(position, rays[i]);

        let intersections = raycaster.intersectObjects(playerCollisions, true);

		for (let j = 0; j < intersections.length; j++) {
			if (intersections[j].distance <= .1) {
            	bounceBack(position, rays[i]);
			}
		}
    }

    return false;
};

function checkLoseGame() {
	if (!monsterIsLimbo) {

		let position = pizzaMonster.scene.position;
		pizzaMonster.scene.getWorldDirection(pizzaDir);

		raycaster.set(position, pizzaDir);

		let intersections = raycaster.intersectObjects(pizzaIntersections, true);

		if (intersections.length > 0) {
			if (intersections[0].object.name == "playerMesh" && intersections[0].distance <= 0.7) {
				return true;
			}
		}
	}
	return false;
}

function checkWinGame() {
	if (!saviorIsLimbo) {
		let saviorVector = new THREE.Vector2(saviorPizza.scene.position.x, saviorPizza.scene.position.z);
		let playerVector = new THREE.Vector2(controls.getObject().position.x, controls.getObject().position.z);
		let distanceToSavior = saviorVector.distanceTo(playerVector);
		
		if (distanceToSavior <= 0.7) {
			return true;
		}
	}
	return false;
}

//Animation Loop
async function animate() {
	const time = performance.now()
	const delta = (time - prevTime) / 1000;
	if (controls.isLocked === true && playerMovement === true) {
		velocity.x -= velocity.x * 100 * delta
        velocity.z -= velocity.z * 100 * delta
		velocity.y = 0;
		direction.z = Number(moveForward) - Number(moveBackward);
		direction.x = Number(moveRight) - Number(moveLeft);
		direction.normalize(); // this ensures consistent movements in all directions
		if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
		if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
		controls.moveRight(-velocity.x * delta)
		controls.moveForward(-velocity.z * delta)
	}
	prevTime = time;

	collisionDetection(controls);
	checkRoomChange(controls);
	updatePlayerMesh();

	if (checkLoseGame()) {
		controls.getObject().lookAt(pizzaMonster.scene.position);
		playerMovement = false;
		gameLost = true;
	} else {
		movePizzaMonster(delta);
	}

	if (checkWinGame()) {
		playerMovement = false;
		gameWon = true;
	}

	if (gameLost) {
		endTime = new Date();
		elapsedTime = (endTime - startTime)/1000;
		let min = Math.floor(elapsedTime/60);
		let sec = (elapsedTime % 60).toFixed(3);
		let timeString = `Min: ${min} - Sec: ${sec}`;
		glitchSound.stop();
		deathSound.play();
		document.getElementById("colorScreen").style.display = "block"; 
		document.getElementById("colorScreen").classList.add("deathScreen");
		await new Promise(r => setTimeout(r, 2000));
		document.getElementById("time").innerHTML = timeString;
		document.getElementById("menu").style.display = "flex";
		controls.unlock();
	} else if (gameWon) {
		endTime = new Date();
		elapsedTime = (endTime - startTime)/1000;
		let min = Math.floor(elapsedTime/60);
		let sec = (elapsedTime % 60).toFixed(3);
		let timeString = `Min: ${min} - Sec: ${sec}`;
		winSound.play();
		document.getElementById("colorScreen").style.display = "block";
		document.getElementById("colorScreen").classList.add("winScreen");
		await new Promise(r => setTimeout(r, 2000));
		document.getElementById("time").innerHTML = timeString;
		document.getElementById("menu").style.display = "flex";
		controls.unlock();
	} else {
		requestAnimationFrame( animate );
	}
	renderer.render( scene, camera );
}


//Window Resizing
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera);
}
