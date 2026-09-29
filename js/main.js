// 1. SETUP
// Grabbing the canvas element from the HTML document so I have a drawing board
let canvas = document.getElementById("canvas");
// Extracting the 2D context, which acts as my built-in paintbrush for drawing shapes
let ctx = canvas.getContext("2d");
// Stretching the canvas to fill the exact width and height of the browser window
canvas.width = innerWidth;
canvas.height = innerHeight;

// Setting up global variables to track my game states and score
let score = 0;
let isGameOver = false; // Switch to freeze the engine when the battery dies
let isGameStarted = false; // Switch to keep the game on the menu screen initially

// 2. INPUT SWITCHES
// Creating a dictionary object to track keyboard inputs.
// Using true/false switches instead of direct movement code prevents input lag.
let activeKeys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// Adding an event listener that triggers the exact moment a key is pressed down
window.addEventListener("keydown", function (e) {
  // If the game is on the start screen and the user presses Enter, I start the engine
  if (e.key === "Enter" && !isGameStarted) {
    isGameStarted = true;
  }
  // If the pressed key matches one in my activeKeys dictionary, I turn it ON (true)
  if (activeKeys.hasOwnProperty(e.key)) {
    activeKeys[e.key] = true;
  }
});

// Adding a listener for when the key is released to turn the switch OFF (false)
window.addEventListener("keyup", function (e) {
  if (activeKeys.hasOwnProperty(e.key)) {
    activeKeys[e.key] = false;
  }
});

// 3. COLLISION MATH
// Implementing Axis-Aligned Bounding Box (AABB) collision detection.
// This checks all four edges of two rectangles. If none of the safe conditions are met, they are overlapping.
function checkCollision(box1, box2) {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
}

// 4. THE VEHICLE BLUEPRINT
// Using Object-Oriented Programming (OOP) to bundle the car's data and behaviors.
class ElectricDeliveryVehicle {
  // The constructor runs once when the object is instantiated to set initial properties
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 30;
    this.color = "#00d2ff";

    // Setting up vector physics variables for momentum instead of rigid movement
    this.velocityX = 0;
    this.velocityY = 0;
    this.accelerationRate = 0.4;
    this.frictionDrag = 0.92; // Multiplier to simulate tire grip and slow the car down

    this.batteryLevel = 100;
    this.drainRate = 0.08;
  }

  // The update function calculates all the physics math for the current frame
  update() {
    // Only run movement logic if the battery is alive and the game is active
    if (this.batteryLevel > 0 && !isGameOver) {
      let isMoving = false;

      // Applying acceleration to velocity (momentum) based on key switches
      if (activeKeys.ArrowUp && this.y > 280) {
        this.velocityY -= this.accelerationRate;
        isMoving = true;
      }
      if (activeKeys.ArrowDown && this.y < 420 - this.height) {
        this.velocityY += this.accelerationRate;
        isMoving = true;
      }
      if (activeKeys.ArrowLeft && this.x > 0) {
        this.velocityX -= this.accelerationRate;
        isMoving = true;
      }
      if (activeKeys.ArrowRight && this.x < canvas.width - this.width) {
        this.velocityX += this.accelerationRate;
        isMoving = true;
      }

      // If the car accelerates, I subtract battery power (Math.max prevents it from dropping below zero)
      if (isMoving) {
        this.batteryLevel = Math.max(0, this.batteryLevel - this.drainRate);

        // Instantiating a new particle object at the rear of the car and pushing it into the array
        particlesArray.push(
          new Particle(this.x + this.width / 2, this.y + this.height),
        );
      }
    }

    // Multiplying current velocity by friction to naturally decelerate
    this.velocityX *= this.frictionDrag;
    this.velocityY *= this.frictionDrag;

    // Applying the final calculated velocity to the actual X/Y screen coordinates
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Hard boundary limits to prevent the car from driving off the canvas
    if (this.x < 0) this.x = 0;
    if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
    if (this.y < 280) this.y = 280;
    if (this.y > 420 - this.height) this.y = 420 - this.height;
  }

  // The draw function tells the 2D context exactly how to paint this object
  draw(context) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);

    // Painting yellow rectangles to represent headlights
    context.fillStyle = "#fffa65";
    context.fillRect(this.x + this.width - 4, this.y + 4, 4, 8);
    context.fillRect(this.x + this.width - 4, this.y + this.height - 12, 4, 8);
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 4 + 2; // Randomizing size between 2px and 6px
    this.speedX = (Math.random() - 0.5) * 2; // Randomizing horizontal drift
    this.speedY = Math.random() * 2 + 1; // Forcing vertical drift downwards
    this.life = 1.0; // Starting opacity at 100%
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= 0.05; // Fading the opacity down every frame
  }

  draw(context) {
    // Drawing a circle using the arc method, applying the fading 'life' to the rgba alpha channel
    context.fillStyle = `rgba(236, 240, 241, ${this.life})`;
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fill();
  }
}

// Creating an empty array to store the active particle objects
let particlesArray = [];

// 5. WORLD OBJECTS
// Instantiating the objects from the classes and defining static objects
let playerVehicle = new ElectricDeliveryVehicle(50, 340);
let deliveryCargo = {
  x: 700,
  y: 340,
  width: 25,
  height: 25,
  color: "green",
};
let roadPothole = { x: 400, y: 330, width: 55, height: 35, color: "#C138B8" };

// 6. THE ENGINE
// This is the recursive loop function that runs at ~60 FPS
function gameLoop() {
  // Wiping the canvas clean every frame so moving objects don't smear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Painting the static midnight blue background
  ctx.fillStyle = "#050614";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Painting the road surface
  ctx.fillStyle = "#1a1e45";
  ctx.fillRect(0, 280, canvas.width, 140);

  // Drawing the dashed center line using setLineDash
  ctx.strokeStyle = "#ecf0f1";
  ctx.setLineDash([20, 15]);
  ctx.beginPath();
  ctx.moveTo(0, 350);
  ctx.lineTo(canvas.width, 350);
  ctx.stroke();
  ctx.setLineDash([]); // Resetting dashes so other shapes draw normally

  // STATE 1: Start Screen check
  if (!isGameStarted) {
    // Painting a semi-transparent overlay and the menu text
    ctx.fillStyle = "rgba(5, 6, 20, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00d2ff";
    ctx.font = "bold 40px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      "ECO DASH: BYD DELIVERY",
      canvas.width / 2,
      canvas.height / 2 - 60,
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "18px monospace";
    ctx.fillText("INSTRUCTIONS:", canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText(
      "Use ARROW KEYS to drive",
      canvas.width / 2,
      canvas.height / 2 + 20,
    );
    ctx.fillText(
      "Avoid Purple Potholes (Lose Score & Momentum)",
      canvas.width / 2,
      canvas.height / 2 + 50,
    );
    ctx.fillText(
      "Collect Blue Cargo (Gain Score)",
      canvas.width / 2,
      canvas.height / 2 + 80,
    );
    ctx.fillText(
      "Watch your battery level!",
      canvas.width / 2,
      canvas.height / 2 + 110,
    );

    ctx.fillStyle = "#C138B8";
    ctx.font = "bold 22px monospace";
    ctx.fillText(
      "PRESS [ENTER] TO START ENGINE",
      canvas.width / 2,
      canvas.height / 2 + 170,
    );

    // Telling the browser to loop, but using 'return' to block the physics code below from running
    requestAnimationFrame(gameLoop);
    return;
  }

  // Looping through the array to update and draw every active particle
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw(ctx);

    // Using splice to remove particles that have faded out entirely to free up memory
    if (particlesArray[i].life <= 0) {
      particlesArray.splice(i, 1);
      i--; // Adjusting the index backwards so the loop doesn't skip the next item
    }
  }

  // Calling the player's update and draw methods.
  // Doing this after the particles means the car is drawn on top of the dust (Z-indexing).
  playerVehicle.update();
  playerVehicle.draw(ctx);

  // Painting the static pothole hazard
  ctx.fillStyle = roadPothole.color;
  ctx.fillRect(
    roadPothole.x,
    roadPothole.y,
    roadPothole.width,
    roadPothole.height,
  );

  // Running AABB collision against the pothole
  if (checkCollision(playerVehicle, roadPothole)) {
    score = Math.max(0, score - 5);
    playerVehicle.velocityX = -5; // Reversing horizontal momentum
    playerVehicle.velocityY = -playerVehicle.velocityY * 2; // Violently reversing vertical momentum to stop diagonal clipping
  }

  // Painting the static cargo goal
  ctx.fillStyle = deliveryCargo.color;
  ctx.fillRect(
    deliveryCargo.x,
    deliveryCargo.y,
    deliveryCargo.width,
    deliveryCargo.height,
  );

  // Running AABB collision against the cargo
  if (checkCollision(playerVehicle, deliveryCargo)) {
    score += 100;
    // Using Math.random() to teleport the cargo to a new randomized location
    deliveryCargo.x = 200 + Math.random() * (canvas.width - 300);
    deliveryCargo.y = 290 + Math.random() * (120 - deliveryCargo.height);
  }

  // Drawing the HUD (Heads-Up Display)
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px monospace";
  ctx.fillText("EcoDash Active | Score: " + score, 20, 30);

  ctx.fillText("Battery Reserve:", 20, 60);
  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(150, 48, 120, 15); // Drawing the empty battery outline

  // Using a ternary operator to swap colors based on battery level
  ctx.fillStyle = playerVehicle.batteryLevel > 25 ? "#C138B8" : "#e74c3c";
  // Calculating the inner fill width as a percentage of the total outline width
  ctx.fillRect(152, 50, (playerVehicle.batteryLevel / 100) * 116, 11);

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px monospace";
  ctx.fillText(Math.round(playerVehicle.batteryLevel) + "%", 280, 61);

  // STATE 3: Game Over check
  if (playerVehicle.batteryLevel <= 0) {
    isGameOver = true; // Flipping the switch when the battery dies
  }

  if (isGameOver) {
    // Painting the failure screen overlay
    ctx.fillStyle = "rgba(5, 6, 20, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#C138B8";
    ctx.font = "bold 40px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      "SYSTEM FAILURE: OUT OF BATTERY",
      canvas.width / 2,
      canvas.height / 2 - 20,
    );

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px monospace";
    ctx.fillText(
      "Final Score: " + score,
      canvas.width / 2,
      canvas.height / 2 + 30,
    );
    ctx.fillText(
      "Press F5 to Restart Simulation",
      canvas.width / 2,
      canvas.height / 2 + 70,
    );

    // Hitting a return wall here WITHOUT calling requestAnimationFrame completely stops the engine
    return;
  }

  // Synchronizing the engine loop with my monitor's refresh rate to draw the next frame
  requestAnimationFrame(gameLoop);
}

// TURN THE KEY
// Invoking the function once to kickstart the continuous engine loop
gameLoop();
