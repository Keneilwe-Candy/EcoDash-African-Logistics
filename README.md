# EcoDash-African-Logistics

## Project Description

EcoDash is an interactive 2D HTML5 Canvas simulation demonstrating how an electric delivery vehicle navigates rolling load-shedding and pothole-ridden infrastructure in Gauteng.

## Installation & Setup Instructions

1. Clone the repository to your local machine.
2. Open `index.html` in any modern web browser.
3. Running via VS Code Live Server is recommended for optimal performance.

## Initial Project Folder Structure

- `index.html` (Main entry point)
- `css/` (Contains `style.css`)
- `js/` (Contains modular scripts: `main.js`, `vehicle.js`)
- `assets/` (Contains images and audio files)

## AI Usage Disclosure Table

| Prompt Used                                                                                                                                                       | AI Response                                                                                                                                                    | Problems Identified                                                                                                                  | How you improved/modified the code                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "How can I rewrite this basic car variable into a JavaScript class with an update and draw method so I can add vector physics?"                                   | Provided an ES6 class blueprint (`class ElectricDeliveryVehicle`) containing a constructor and methods for velocity and friction math.                         | The original procedural variables could not efficiently handle vector momentum or scale for added mechanics like battery drain.      | I manually typed the class structure to understand the `this` keyword binding, then integrated the AI's velocity logic directly into the existing canvas `requestAnimationFrame` loop. |
| "My collision detection works when hitting the pothole from the side, but if I hold Up and Right at the same time, the car slides through it. How do I fix this?" | Identified that the original AABB logic only reversed horizontal momentum, and suggested multiplying the vertical momentum by negative two (`velocityY * -2`). | The vehicle clipped through pothole hazards during diagonal movement because the single-axis check failed to halt compound velocity. | I applied the suggested multiplier to both the X and Y velocity vectors within the `checkCollision` function, which successfully created a violent bounce effect.                      |
| "I want to add a dust trail behind the car when it accelerates. How do I create a particle system that fades out and deletes itself to save memory?"              | Provided the logic for a dynamic memory array using `Math.random()` for size/drift and `.splice()` within a `for` loop to cull dead particles.                 | Generating infinite visual particles caused memory leaks and browser crashes due to unmanaged array growth.                          | I adapted the `.splice()` logic into the game engine and adjusted the rendering hierarchy so the dust particles correctly painted underneath the vehicle chassis.                      |
