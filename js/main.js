let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d"); //ctx is context 

canvas.width = innerWidth
canvas.height = innerHeight

//2. The Remote Control (Which handles keyboard inputs )
// This object acts like a set of switches for our arrow keys. 
//false means the button is not pressef 
let activeKeys = {
    ArrowUp: false, 
    ArrowDown: false, 
    ArrowLeft: false,
    ArrowRight: false
};

// when a key is pressesd DOWN, the code checks if its one of our arrow keys
// If it is (one of the programed keys) we flip its switch to 'true' (ON)
window.addEventListener('keydown', function(e) {
    // This code checks if the key pressed (e.key) exists in our activeKeys List 
    if (activeKeys.hasOwnProperty(e.key)) {
       // if yes, flip that specific key's switch to ON (TRUE) '
       
       activeKeys[e.key] = true;
    
    }
});
// when the player lifts their fingers UP  off teh key, we flip the switch back to false (OFF)
window.addEventListener('keyup', function(e) {
    if (activeKeys.hasOwnProperty(e.key)) {
        activeKeys[e.key] = false;
    }
});
//3. Colliston Detection (The bumber car logic)
// This function checks if two rectangle (like the car and a pothole) overlapping
//it returns 'true' if they crash into each other and 'false' if they are safe 
function checkCollision(box1, box2) {
    return (
        box1.x < box2.x + box2.width &&   // Is Box 1's left side past Box 2's right side?
        box1.x + box1.width > box2.x &&   // Is Box 1's right side past Box 2's left side?
        box1.y < box2.y + box2.height &&  // Is Box 1's top above Box 2's bottom?
        box1.y + box1.height > box2.y     // Is Box 1's bottom below Box 2's top?
    );

    // We use  a 'class' as blueprint to build the vehicle.
   //This keeps all the car's properties (like speed and battey) neatly packaged together 
   class ElectricDeliveryVehicle {
    
    //The 'constuctor' runs once when the car is created. 
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 30;
        this.color = '#';

        // Physics: Instead of just teleporting, the car is given 'velocity' (momentum)
        this.velocityX = 0;
        this.velocityY = 0;

        // Acceleration is how fast the car speeds up when you press a key.
        this.acceleratoionRate = 0.4;
        //Friction slows the car down over time so it doesnt slide forever like on ice.
        this.frictionDrag = 0.92;

        // Resource Management: African Infrastructure dynamics
        this.batteryLevel = 100; //Starts with a full 100 % battery
        this.drainRate = 0.08; //How much battery is lost every time it moves 
    }

    //The 'update' function runs every single frame to the car's new math
    update(){
        //we can only drive if the battery is not dead!
        if (this.batteryLevel > 0) {
            let isMoving = false;

            //if the UP arrow is pressed AND we arent driving off 
            if (activeKeys.ArrowUp && this.y > 280) {
                this.velocityY -= this.acceleratoionRate;// Push the car UP(negative Y)
                isMoving = true; 
            }
            //if the DOWN arrow is pressed AND the care is driving off the bottom of 
            if (activeKeys.ArrowDown && this.y < 420 - this.height){
                this.velocityY += this.acceleratoionRate; //Push tbe car DOWN (positive Y)
                isMoving = true; 
            }
            if (activeKeys.ArrowLeft && this.x > 0){
                this.velocityX -= this.acceleratoionRate; //Push the car LEFT (negative X)
                isMoving = true;
            }
            if (activeKeys.ArrowRight && this.x < canvas.width - this.width) {
                this.velocityX += this.acceleratoionRate; //Push the RIGHT (positive X)
                isMoving = true;
            }

            //if the car moved this frame, subtract a tiny bit of battery power 
            if (isMoving) {
                //Math.max ensures the the battery never dropa below 0
                this.batteryLevel = Math.max(0, this.batteryLevel - this.drainRate);
            }
        }

        //Apply friction to momentum so the car naturally slows down when keys are released 
        this.velocityX *= this.frictionDrag;
        this.velocityY *= this.frictionDrag;

        //Apply friction to the momentum so teh car's actual screem position 
        this.x += this.velocityX;
        this.y += this.velocityY;

        //Invisible Wall or boundaries: These rules stop the car from flying or driving completely of the screen 
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.y < 280) this.y = 280;

}
    
   
