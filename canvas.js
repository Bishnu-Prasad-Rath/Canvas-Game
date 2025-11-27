//There are 4 essential parts about canvas
//Creating and resizing your canvas
//Drawing elements
//Animating elements
//Interactivity with elements
console.log('Hello welcome to JS game development');
var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var c = canvas.getContext('2d');
//         c.fillRect(100 , 100 , 100 , 100);  //When X increases it moves to the right when y increases it moves to the down and by the way height and width is refers to the object we created through  c.fillRect
//         c.fillStyle = 'rgba(225, 217, 53, 0.79)';
//         // c.fillRect(0, 0, 50, 50);
//         // c.fillRect(350,150 , 50, 50); // 400(width) - 50(box width) = 350, 200(height) - 50(box height) = 150
//         //canvas objects:
//         //Rectangles,Lines,Arcs or circle,Bezier curves,Text,Images
//         //Rectangles:
//         c.fillRect(100,100,100,100);
//         c.fillStyle = 'rgba(255,0,0,0.1)';
//         //Lines:
//         c.beginPath();
//          c.moveTo(900,100);    // c.moveTo(x,y);-->from one point to another   c.lineTo(x,y); -->point to draw a line
//         c.lineTo(900,300); 
//         c.strokeStyle = 'rgb(255,0,0)';
//         c.stroke();
//         //Arcs or circle:
//         c.beginPath();
//         c.arc(500,300,50,0,Math.PI * 2, false);  // (x, y, radius, startAngle, endAngle, counterclockwise)
//         c.stroke();
//         //Bezier curves:
// c.beginPath(); // Start a new path
// c.moveTo(100, 100); // P0: The curve starts at (100, 100)
// c.bezierCurveTo(100, 100, // P1: First control point (x, y)
//                 200, 200, // P2: Second control point (x, y)
//                 300, 100); // P3: End point (x, y)
// c.stroke(); // Draw the outline of the path
//         //Text:
// c.font = '30px Arial';        // Step 1: Choose your "font tool" settings
// c.fillText('Hello World', 100, 100); // Step 2: Draw filled text at position (100, 100)
//         //Images:
//         var img = new Image();

//         // for (let i = 0; i < 10; i++) {
//         //         let x = Math.random() * window.innerWidth;
//         //         let y = Math.random() * window.innerHeight;
//         //                 c.beginPath();
//         // c.arc(x,y,70,0,Math.PI * 2, false);  // (x, y, radius, startAngle, endAngle, counterclockwise)
//         // c.stroke();

//         // }

//         for (let i = 0; i < 50; i++) {
//     const x = Math.random() * window.innerWidth; // Random X (0 to window.innerWidth)
//     const y = Math.random() * window.innerHeight; // Random Y (0 to window.innerHeight)
//     const radius = 10 + Math.random() * 30; // Random radius (10 to 40)

//     // Random colors
//     const randomColor = () => Math.floor(Math.random() * 255);
//     const strokeColor = `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;
//     const fillColor = `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.5)`; // Semi-transparent

//     c.beginPath();
//     c.arc(x, y, radius, 0, Math.PI * 2);

//     c.strokeStyle = strokeColor;
//     c.fillStyle = fillColor;
//     c.lineWidth = 2;

//     c.fill();
//     c.stroke();
// }
// c.beginPath();
// c.arc(750,350,60,0,Math.PI * 2, false);  // (x, y, radius, startAngle, endAngle, counterclockwise)
// c.strokeStyle = 'rgba(131, 112, 194, 0.5)';
// c.fillStyle = 'rgb(255, 0, 0)';
// c.fill();
// c.stroke();

//         function animate() {
//     // 1. UPDATE: Calculate new positions, sizes, etc.
//     // 2. DRAW: Clear canvas and draw everything in new positions
//     // 3. REQUEST: Ask for the next animation frame

//     requestAnimationFrame(animate); // This creates the loop!
// }

// // Start the animation
// animate();
function Circle(x, y, dx, dy, radius, strokeColor, fillColor) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;

    this.draw = function () {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.strokeStyle = this.strokeColor;
        c.fillStyle = this.fillColor;
        c.fill();
        c.stroke();
    }
    
    this.update = function () {
        if (this.x + this.radius > innerWidth || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > innerHeight || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
        this.x += this.dx;
        this.y += this.dy;

        this.draw();
    }
}

var circleArray = [];

for (let i = 0; i < 50; i++) {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const radius = 10 + Math.random() * 30;
    
    // Generate random colors
    const randomColor = () => Math.floor(Math.random() * 255);
    const strokeColor = `rgb(${randomColor()}, ${randomColor()}, ${randomColor()})`;
    const fillColor = `rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.5)`;
    
    // Create circle with random velocity and colors
    const randomDx = (Math.random() - 0.5) * 8;
    const randomDy = (Math.random() - 0.5) * 8;
    
    circleArray.push(new Circle(x, y, randomDx, randomDy, radius, strokeColor, fillColor));
}

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);
    
    for (let i = 0; i < circleArray.length; i++) {
        circleArray[i].update();
    }
}

animate();

// // rectangle
// c.fillStyle = "red";
// c.fillRect(100, 100, 100, 100);
// c.fillStyle = "blue";
// c.fillRect(250, 250, 100, 100);
// c.fillStyle = "green";
// c.fillRect(400, 400, 100, 100);
// console.log(canvas);

// // line
// c.beginPath();
// c.moveTo(50, 500);
// c.lineTo(50, 300);
// c.moveTo(100, 250);
// c.lineTo(250, 100);
// c.moveTo(300, 50);
// c.lineTo(500, 50);
// c.strokeStyle = "orange";
// c.stroke();

// // arc / circle
// c.beginPath();
// c.arc(225, 225, 50, 0, Math.PI * 2, false);
// c.strokeStyle = "purple"
// c.stroke();

// for (var i = 0; i < 10; i++) {
//   var x = Math.random() * window.innerWidth;
//   var y = Math.random() * window.innerHeight;
//   c.beginPath();
//   c.arc(x, y, 50, 0, Math.PI * 2, false);
//   c.strokeStyle = `rgb(
//     ${Math.random() * 255}
//     ${Math.random() * 255}
//     ${Math.random() * 255})`;
//   c.stroke();
// }