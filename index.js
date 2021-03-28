// module aliases
const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Query = Matter.Query,
    Composite = Matter.Composite,
    Events = Matter.Events;

// create an engine
const engine = Engine.create(),
    world = engine.world;

// create a renderer
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        hasBounds: true,
        wireframes: false,
        background: `linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)`
    }
});

// constants and variables for game
let coins_element = document.getElementById("score"),
    score = 0,
    time = 0;
const MOVEMENT_SPEED = 5,
    MAX_SPEED = 5,
    JUMP_HEIGHT = 10;

const coin_sound = new Howl({
    src: ["lib/coin.wav"],
    volume: .12
}),
jump_sound = new Howl({
    src: ["lib/jump.wav"],
    volume: .12
});

// playey input
let keyPresses = {};

window.addEventListener('keydown', ({code}) => {
    keyPresses[code] = true;
}, false);

window.addEventListener('keyup', ({code}) => {
    keyPresses[code] = false;
}, false);

window.onload = () => {
    initializeClock("time", deadline);
}

// timer/clock code
const timeInMinutes = 0.5;
const currentTime = Date.parse(new Date());
const deadline = new Date(currentTime + timeInMinutes*60*1000);

function getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    
    return {
      total,
      minutes,
      seconds
    };
  }
  
  function initializeClock(id, endtime) {
    const secondSpan = document.getElementById(id);
    const minutesSpan = document.getElementById("min")
  
    function updateClock() {
      const t = getTimeRemaining(endtime);
      minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
      secondSpan.innerHTML = ('0' + t.seconds).slice(-2);

      if (t.total <= 0 || score == 20) {
        clearInterval(timeinterval);
        score = 0;
      }
    }
  
    updateClock();
    const timeinterval = setInterval(updateClock, 1000);
  }

// create walls
let walls = [
    Bodies.rectangle(400, 0, 800, 20, { isStatic: true }), // TOP
    Bodies.rectangle(800, 300, 20, 600, { isStatic: true }), // RIGHT
    Bodies.rectangle(0, 300, 20, 600, { isStatic: true })  // LEFT
];

// create platforms
let platforms = [
    Bodies.rectangle(400, 600, 800, 20, { isStatic: true }), // GROUND
    Bodies.rectangle(400,505,50,3, { isStatic: true }),
    Bodies.rectangle(350,450,50,3, { isStatic: true }),
    Bodies.rectangle(100,410,50,3, { isStatic: true }),
    Bodies.rectangle(250,310,50,3, { isStatic: true }),
    Bodies.rectangle(400,210,50,3, { isStatic: true })
];

// create coins
let coins = [
    Bodies.circle(400, 100, 10, { isStatic: true, isSensor: true, render: { fillStyle: "gold"} }),
    Bodies.circle(350, 400, 10, { isStatic: true, isSensor: true, render: { fillStyle: "gold"} }),
    Bodies.circle(100, 360, 10, { isStatic: true, isSensor: true, render: { fillStyle: "gold"} }),
    Bodies.circle(400, 480, 10, { isStatic: true, isSensor: true, render: { fillStyle: "gold"} }),
    Bodies.circle(250, 250, 10, { isStatic: true, isSensor: true, render: { fillStyle: "gold"} }),
    Bodies.circle(600, 200, 10, { isStatic: true, isSensor: true, render: { fillStyle: "gold"} })
];
// add coins
World.add(world, coins);

// create box (player)
const box = Bodies.rectangle(400, 550, 15, 15, { inertia: Infinity, render: { fillStyle: "blue" } });

// add walls
World.add(world, walls);
// add platforms
World.add(world, platforms);
// add box (player)
World.add(world, box);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

// collision eventhandler
Events.on(engine, 'collisionStart', ({ pairs }) => {
    // remove coin on collision
    if (pairs[0].bodyA.label == "Circle Body") { 
        coin_sound.play();
        score++;
        World.remove(world, pairs[0].bodyA); 
    }
});

// gameloop
(function gameLoop() {

    window.requestAnimationFrame(gameLoop);

    if (keyPresses.Space || keyPresses.KeyW) {
        jumpBox(-JUMP_HEIGHT);
    }
    if (keyPresses.KeyA) {
        moveBox(-MOVEMENT_SPEED);
    } else if (keyPresses.KeyD) {
        moveBox(MOVEMENT_SPEED);
    }
    
    coins_element.innerHTML = score;

    if (!Composite.allBodies(world).find(e => e.label == "Circle Body")) {
        World.add(world, coins);
    }

    Engine.update(engine, 1000 / 60);
})();

// functions for movement
function moveBox(dx) {
    Body.translate(box, { x: dx, y: 0 });
}

function jumpBox(dy) {
    let col = Query.collides(box, platforms);
    if (col[0]?.collided) {
        jump_sound.play();
        Body.translate(box, {x: 0, y: dy});
        Body.setVelocity(box, {x: 0, y: dy});
    }
}



