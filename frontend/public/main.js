const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 300;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

// ---------- POST PROCESSING (BLOOM/GLOW) ----------
let composer, bloomPass;
try {
  composer = new THREE.EffectComposer(renderer);
  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);

  bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3,
    0.1,
    0.9
  );
  composer.addPass(bloomPass);
} catch (e) {
  console.log("Bloom not available, using standard render");
  composer = null;
}

// ---------- STARFIELD BACKGROUND ----------
let starOpacities = [];

function createStarfield() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsPositions = [];
  const starColors = [];
  const starSizes = [];

  for (let i = 0; i < 1500; i++) {
    starsPositions.push(
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000,
      (Math.random() - 0.5) * 2000
    );

    // Mix of white and blue stars for space effect
    const isBlue = Math.random() > 0.6;
    if (isBlue) {
      starColors.push(0.3, 0.6, 1); // Blue stars
    } else {
      starColors.push(1, 1, 1); // White stars
    }

    // Random initial opacity for twinkling
    starOpacities.push(Math.random() * 0.5 + 0.5);
    starSizes.push(0.5 + Math.random() * 0.8);
  }

  starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starsPositions, 3)
  );
  starsGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(starColors, 3)
  );

  const starsMaterial = new THREE.PointsMaterial({
    size: 0.8,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
  return stars;
}

const stars = createStarfield();

// ---------- LIGHTING ----------
const ambientLight = new THREE.AmbientLight(0x4488ff, 0.4);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x6699ff, 1.2);
pointLight.position.set(100, 100, 100);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0x3366ff, 0.8);
pointLight2.position.set(-100, -100, 50);
scene.add(pointLight2);

// ---------- CURSOR LIGHT RAY ----------
const cursorLight = new THREE.PointLight(0xffdd44, 4);
cursorLight.distance = 400;
cursorLight.decay = 1.5;
cursorLight.position.set(0, 0, 150);
scene.add(cursorLight);

// Create light leak particles
const leakParticles = [];
const leakPositions = [];
const leakGeometry = new THREE.BufferGeometry();
leakGeometry.setAttribute("position", new THREE.Float32BufferAttribute(leakPositions, 3));

const leakMaterial = new THREE.PointsMaterial({
  color: 0x664400,
  size: 5,
  transparent: true,
  opacity: 0.7,
  sizeAttenuation: true,
});
let leakPoints = new THREE.Points(leakGeometry, leakMaterial);
scene.add(leakPoints);

// Add border/outline effect with darker material
const leakBorderGeometry = new THREE.BufferGeometry();
leakBorderGeometry.setAttribute("position", new THREE.Float32BufferAttribute(leakPositions, 3));

const leakBorderMaterial = new THREE.PointsMaterial({
  color: 0x331100,
  size: 7,
  transparent: true,
  opacity: 0.4,
  sizeAttenuation: true,
});
let leakBorderPoints = new THREE.Points(leakBorderGeometry, leakBorderMaterial);
scene.add(leakBorderPoints);

// ---------- MOUSE ----------
const mouse = new THREE.Vector2();
const mouseVelocity = new THREE.Vector2();
const prevMouse = new THREE.Vector2();

window.addEventListener("mousemove", (e) => {
  prevMouse.copy(mouse);
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  mouseVelocity.subVectors(mouse, prevMouse).multiplyScalar(0.5);

  // Update cursor light position
  cursorLight.position.x = mouse.x * 400;
  cursorLight.position.y = mouse.y * 400;
  cursorLight.position.z = 150;

  // Update light ray position
  lightRay.position.x = mouse.x * 400;
  lightRay.position.y = mouse.y * 400;

  // Create light leak particles from cursor
  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40 + 10;
    leakParticles.push({
      x: mouse.x * 400 + Math.cos(angle) * distance,
      y: mouse.y * 400 + Math.sin(angle) * distance,
      z: 80,
      vx: Math.cos(angle) * (Math.random() * 3 + 2),
      vy: Math.sin(angle) * (Math.random() * 3 + 2),
      vz: (Math.random() - 0.5) * 3,
      life: 1,
      maxLife: 1,
    });
  }
});

// ---------- CLICK EXPLOSION ----------
let explosionCenter = null;
let explosionTime = 0;
const explosionDuration = 0.5;

window.addEventListener("click", (e) => {
  explosionCenter = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  explosionTime = 0;
});

// ---------- LOAD IMAGE ----------
const img = new Image();
img.src = "carmella.png";
img.onload = () => initParticles(img);

let particles, originalPositions, velocities, colors, sizes;
let particleCount = 0;
let frameCount = 0;
let lastTime = Date.now();
let dominantColor = { r: 0, g: 1, b: 0.5 };
let rotation = 0;

function getDominantColor(imageData, width, height) {
  const colorMap = {};
  let maxCount = 0;
  let dominantHex = null;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    if (a > 50) {
      const hex = `${r},${g},${b}`;
      colorMap[hex] = (colorMap[hex] || 0) + 1;
      if (colorMap[hex] > maxCount) {
        maxCount = colorMap[hex];
        dominantHex = hex;
      }
    }
  }

  if (dominantHex) {
    const [r, g, b] = dominantHex.split(",").map(Number);
    return { r: r / 255, g: g / 255, b: b / 255 };
  }
  return dominantColor;
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

function initParticles(image) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  dominantColor = getDominantColor(imageData, canvas.width, canvas.height);

  // Space blue-black gradient background
  document.body.style.background = `linear-gradient(135deg, #000814 0%, #001d3d 50%, #0a3d62 100%)`;

  const positions = [];
  const colorArray = [];
  const sizeArray = [];
  originalPositions = [];
  velocities = [];
  sizes = [];

  const gap = 2;

  for (let y = 0; y < canvas.height; y += gap) {
    for (let x = 0; x < canvas.width; x += gap) {
      const index = (y * canvas.width + x) * 4;
      const alpha = imageData[index + 3];

      if (alpha > 50) {
        const px = x - canvas.width / 2;
        const py = -y + canvas.height / 2;
        const pz = 0;

        positions.push(px, py, pz);
        originalPositions.push(px, py, pz);
        velocities.push(0, 0, 0);

        const r = imageData[index] / 255;
        const g = imageData[index + 1] / 255;
        const b = imageData[index + 2] / 255;
        colorArray.push(r, g, b);

        const size = 1.8 + Math.random() * 0.8;
        sizeArray.push(size);
        sizes.push(size);
      }
    }
  }

  particleCount = positions.length / 3;
  document.getElementById("particleCount").textContent = particleCount;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colorArray, 3)
  );
  geometry.setAttribute(
    "size",
    new THREE.Float32BufferAttribute(sizeArray, 1)
  );

  const material = new THREE.PointsMaterial({
    size: 2,
    transparent: true,
    opacity: 1,
    vertexColors: true,
    sizeAttenuation: true,
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  animate();
}

// ---------- ANIMATION ----------
function animate() {
  requestAnimationFrame(animate);

  // Update starfield twinkling
  if (stars && starOpacities.length > 0) {
    for (let i = 0; i < starOpacities.length; i++) {
      starOpacities[i] += (Math.random() - 0.5) * 0.05;
      starOpacities[i] = Math.max(0.2, Math.min(1, starOpacities[i]));
    }
  }

  // Update light leak particles
  for (let i = leakParticles.length - 1; i >= 0; i--) {
    const p = leakParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.z += p.vz;
    p.life -= 0.03;

    if (p.life <= 0) {
      leakParticles.splice(i, 1);
    }
  }

  // Update leak particles geometry
  if (leakParticles.length > 0) {
    const positions = new Float32Array(leakParticles.length * 3);
    for (let i = 0; i < leakParticles.length; i++) {
      positions[i * 3] = leakParticles[i].x;
      positions[i * 3 + 1] = leakParticles[i].y;
      positions[i * 3 + 2] = leakParticles[i].z;
    }
    leakGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    leakGeometry.attributes.position.needsUpdate = true;

    // Update border geometry with same positions
    leakBorderGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    leakBorderGeometry.attributes.position.needsUpdate = true;
  }

  if (particles) {
    const pos = particles.geometry.attributes.position.array;
    const sizeAttr = particles.geometry.attributes.size.array;

    for (let i = 0; i < pos.length; i += 3) {
      const ox = originalPositions[i];
      const oy = originalPositions[i + 1];
      const oz = originalPositions[i + 2];

      let dx = mouse.x * 400 - pos[i];
      let dy = mouse.y * 400 - pos[i + 1];

      let dist = Math.sqrt(dx * dx + dy * dy);

      // Mouse interaction
      if (dist < 35) {
        const force = (35 - dist) / 35;
        velocities[i] -= dx * 0.04 * force;
        velocities[i + 1] -= dy * 0.04 * force;
      }

      // Click explosion effect
      if (explosionCenter && explosionTime < explosionDuration) {
        const expDx = pos[i] - explosionCenter.x * 400;
        const expDy = pos[i + 1] - explosionCenter.y * 400;
        const expDist = Math.sqrt(expDx * expDx + expDy * expDy);

        if (expDist < 100) {
          const expForce = (1 - explosionTime / explosionDuration) * (100 - expDist) / 100;
          velocities[i] += (expDx / (expDist + 1)) * 0.3 * expForce;
          velocities[i + 1] += (expDy / (expDist + 1)) * 0.3 * expForce;
        }
      }

      // Attraction to original position
      velocities[i] += (ox - pos[i]) * 0.012;
      velocities[i + 1] += (oy - pos[i + 1]) * 0.012;
      velocities[i + 2] += (oz - pos[i + 2]) * 0.012;

      // Damping
      velocities[i] *= 0.88;
      velocities[i + 1] *= 0.88;
      velocities[i + 2] *= 0.88;

      pos[i] += velocities[i];
      pos[i + 1] += velocities[i + 1];
      pos[i + 2] += velocities[i + 2];

      // Dynamic size based on distance from center
      const distFromCenter = Math.sqrt(
        (pos[i] - ox) ** 2 + (pos[i + 1] - oy) ** 2
      );
      sizeAttr[i / 3] = sizes[i / 3] * (1 + distFromCenter * 0.01);
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.size.needsUpdate = true;
  }

  // Update explosion timer
  if (explosionCenter) {
    explosionTime += 0.016;
    if (explosionTime >= explosionDuration) {
      explosionCenter = null;
    }
  }

  // Update FPS counter
  frameCount++;
  const currentTime = Date.now();
  if (currentTime - lastTime >= 1000) {
    document.getElementById("fps").textContent = frameCount;
    frameCount = 0;
    lastTime = currentTime;
  }

  composer ? composer.render() : renderer.render(scene, camera);
}

// ---------- RESIZE ----------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
