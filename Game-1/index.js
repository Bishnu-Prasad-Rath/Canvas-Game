const authModal = document.getElementById("authModal");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userLabel = document.getElementById("userLabel");
const topBar = document.getElementById("topBar");
const exitGameBtn = document.getElementById("exitGameBtn");

// ===============
// UI NAVIGATION 
// ===============

const homePage = document.getElementById("homePage");
const gamePage = document.getElementById("gamePage");
const playBtn = document.getElementById("playBtn");
const leaderboardList = document.getElementById("leaderboardList");
const API_BASE = "https://canvas-game-backend.onrender.com";



exitGameBtn.onclick = () => {
  // stop the game loop
  cancelAnimationFrame(animationId);

  // hide game page
  gamePage.classList.add("hidden");

  // show home page
  homePage.classList.remove("hidden");

  // hide game over modal
  modalEl.style.display = "none";

  // refresh leaderboard
  loadLeaderboard();
};


playBtn.onclick = () => {
  homePage.classList.add("hidden");
  gamePage.classList.remove("hidden");

  init();
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
};

let token = localStorage.getItem("token");
let isGameOver = false;

if (token) {
  authModal.style.display = "none";
  topBar.classList.remove("hidden");
  userLabel.innerText = localStorage.getItem("username");

  loadMyScore();   // ✅ fetch score when page loads
}


loginBtn.onclick = async () => {
  const username = document.getElementById("username").value
  .trim()
  .toLowerCase();
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.username);
    location.reload();
  } else {
    alert("Login failed");
  }
};

logoutBtn.onclick = () => {
  localStorage.clear();

  authModal.style.display = "flex"; 
  topBar.classList.add("hidden");
  userLabel.innerText = "";

  setTimeout(() => location.reload(), 300);
};


async function loadMyScore() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/api/score/me`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (data?.score !== undefined) {
      scoreEl.innerHTML = data.score;
      bigScoreEl.innerHTML = data.score;
    }
  } catch (err) {
    console.error("Failed to load user score", err);
  }
}


registerBtn.onclick = async () => {
  const username = document.getElementById("username").value
    .trim()
    .toLowerCase();
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Registration failed");
    return;
  }

  // ✅ AUTO LOGIN
  localStorage.setItem("token", data.token);
  localStorage.setItem("username", data.username);
  location.reload();
};



// ===== CANVAS SETUP =====
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

// ===== UI ELEMENTS =====
const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modelEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

// ===== GLOBALS =====
let score = 0;
let animationId;
let player;
let projectiles = [];
let enemies = [];
let particles = [];
let muzzleParticles = [];
let health = 100;
let soundUnlocked = false; // will track if user interacted for sound

// ===== SCREEN SHAKE =====
let shake = { x: 0, y: 0, intensity: 0, duration: 0 };

// ===== SOUNDS =====
const sounds = {
  shoot: new Audio('https://actions.google.com/sounds/v1/weapons/gun_shot.ogg'),
  explosion: new Audio('https://actions.google.com/sounds/v1/explosions/explosion.ogg'),
  hit: new Audio('https://actions.google.com/sounds/v1/metal/metal_clang.ogg'),
};
Object.values(sounds).forEach(s => s.volume = 0.5);

// ===== UTILS =====
function randomColor() {
  return `hsl(${Math.random() * 360}, 50%, 50%)`;
}

// ===== CLASSES =====
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.barrelLength = 45; // distance from center to barrel tip
  }

  draw() {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);

    // Gun base
    c.fillStyle = '#444';
    c.fillRect(-15, -10, 30, 20);

    // Barrel
    c.fillStyle = '#777';
    c.fillRect(-5, -40, 10, 40);

    // Barrel tip (muzzle)
    c.fillStyle = '#999';
    c.fillRect(-6, -45, 12, 5);

    c.restore();
  }

  getBarrelTip() {
    return {
      x: this.x + Math.cos(this.angle) * this.barrelLength,
      y: this.y + Math.sin(this.angle) * this.barrelLength,
    };
  }

  update(angle) {
    this.angle = angle;
    this.draw();
  }
}

class Projectile {
  constructor(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.color = 'yellow';
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
  }

  update() {
    this.draw();
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Particle {
  constructor(x, y, radius, color, velocity, fade = 0.01) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
    this.fade = fade;
  }

  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= 0.95;
    this.velocity.y *= 0.95;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.fade;
  }
}

// ===== FUNCTIONS =====
function init() {
  player = new Player(canvas.width / 2, canvas.height / 2);
  projectiles = [];
  enemies = [];
  particles = [];
  muzzleParticles = [];
  score = 0;
  health = 100;
  shake = { x: 0, y: 0, intensity: 0, duration: 0 };
  scoreEl.innerHTML = score;
  bigScoreEl.innerHTML = score;
  isGameOver = false;
}

//Leaderboard loading

async function loadLeaderboard() {
  const res = await fetch(`${API_BASE}/api/score/leaderboard`);
  const data = await res.json();

  leaderboardList.innerHTML = "";

  if (data.length === 0) {
    leaderboardList.innerHTML =
      "<li class='text-center text-gray-400'>No scores yet</li>";
    return;
  }

  data.forEach((item, index) => {
    const li = document.createElement("li");

    // Colors for top 3
    const rankColors = [
      "text-yellow-400", // 🥇
      "text-gray-300",   // 🥈
      "text-amber-600"   // 🥉
    ];

    li.className = `
      flex items-center justify-between
      px-4 py-2 rounded-lg
      bg-white/5 hover:bg-white/10 transition
      ${rankColors[index] || "text-gray-300"}
    `;

    li.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="font-bold w-4">${index + 1}</span>
        <span class="truncate max-w-[140px]">${item.username}</span>
      </div>

      <span class="font-extrabold text-green-400">
        ${item.score}
      </span>
    `;

    leaderboardList.appendChild(li);
  });
}

loadLeaderboard();

let enemyInterval;

function spawnEnemies() {
  clearInterval(enemyInterval);
  enemyInterval = setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10;
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = randomColor();
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = { x: Math.cos(angle), y: Math.sin(angle) };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}

function applyScreenShake() {
  if (shake.duration > 0) {
    shake.x = (Math.random() - 0.5) * shake.intensity;
    shake.y = (Math.random() - 0.5) * shake.intensity;
    shake.duration--;
  } else {
    shake.x = 0;
    shake.y = 0;
  }
}

async function saveScore(score) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API_BASE}/api/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ score })
  });

  if (res.status === 401) {
    localStorage.clear();
    location.reload();
  }
}



function animate() {
  animationId = requestAnimationFrame(animate);

  applyScreenShake();
  c.save();
  c.translate(shake.x, shake.y);

  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.fillRect(0, 0, canvas.width, canvas.height);

  player.update(player.angle);

  // health bar
  c.fillStyle = 'gray';
  c.fillRect(20, 20, 200, 20);
  let healthColor = health > 60 ? 'lime' : health > 30 ? 'yellow' : 'red';
  c.fillStyle = healthColor;
  c.fillRect(20, 20, 2 * health, 20);
  c.strokeStyle = 'white';
  c.strokeRect(20, 20, 200, 20);

  [...particles, ...muzzleParticles].forEach((particle, index, arr) => {
    if (particle.alpha <= 0) arr.splice(index, 1);
    else particle.update();
  });

  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => projectiles.splice(index, 1), 0);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    // collision with player
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius < 25) {
      health -= 20;
      if (soundUnlocked) sounds.hit.play();
      enemies.splice(enemyIndex, 1);
if (health <= 0 && !isGameOver) {
  isGameOver = true;
  cancelAnimationFrame(animationId);
  modalEl.style.display = 'flex';
  bigScoreEl.innerHTML = score;

  (async () => {
    await saveScore(score);
     // 🔥 refresh after save
  })();
}


    }

    // collision with projectiles
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              { x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 6 }
            )
          );
        }

        if (enemy.radius - 10 > 10) {
          score += 100;
          gsap.to(enemy, { radius: enemy.radius - 10 });
          projectiles.splice(projectileIndex, 1);
        } else {
          score += 250;
          enemies.splice(enemyIndex, 1);
          projectiles.splice(projectileIndex, 1);
          if (soundUnlocked) sounds.explosion.play();
          shake = { x: 0, y: 0, intensity: 20, duration: 15 };
        }

        scoreEl.innerHTML = score;
      }
    });
  });

  c.restore();
}

// ===== SHOOT FUNCTION WITH MUZZLE GLOW =====
function shoot(event) {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x);
  player.angle = angle;

  const barrel = player.getBarrelTip();

  // Fire projectile from barrel tip
  const velocity = { x: Math.cos(angle) * 6, y: Math.sin(angle) * 6 };
  projectiles.push(new Projectile(barrel.x, barrel.y, velocity));

  // Muzzle glow + smoke
  for (let i = 0; i < 12; i++) {
    muzzleParticles.push(
      new Particle(
        barrel.x,
        barrel.y,
        i === 0 ? 8 : Math.random() * 3,
        i === 0 ? 'orange' : 'gray',  // first = glow
        { x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 3 },
        i === 0 ? 0.12 : 0.05
      )
    );
  }

  if (soundUnlocked) {
    sounds.shoot.currentTime = 0;
    sounds.shoot.play();
  }

  shake = { x: 0, y: 0, intensity: 8, duration: 6 };
}

// ===== EVENTS =====
addEventListener('click', (event) => {
  if (!soundUnlocked) {
    soundUnlocked = true;
    Object.values(sounds).forEach(s => {
      s.play().then(() => s.pause()).catch(() => {});
      s.currentTime = 0;
    });
  }
  shoot(event);
});

startGameBtn.addEventListener('click', () => {
  init();
  animate();
  spawnEnemies();
  modalEl.style.display = 'none';
});
