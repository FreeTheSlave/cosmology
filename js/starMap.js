(() => {
  const canvas = document.getElementById("sky");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const WORLD_WIDTH = 5000;
  const WORLD_HEIGHT = 4000;
  const stars = [];
  let cameraX = 0, cameraY = 0;
  let dragging = false, moved = false, lastX = 0, lastY = 0;
  let dpr = 1;
  let selectedId = null;
  let onSelect = () => {};
  let width = 0, height = 0;

  // A seeded generator keeps the background star positions stable between redraws.
  let seed = 74291;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 2200; i++) {
    stars.push({
      x: random() * WORLD_WIDTH,
      y: random() * WORLD_HEIGHT,
      size: .35 + random() * 1.55,
      alpha: .18 + random() * .68,
      tint: random() > .92 ? "#b9caff" : "#ffffff"
    });
  }

  const wrapX = value => ((value % WORLD_WIDTH) + WORLD_WIDTH) % WORLD_WIDTH;
  const screenX = x => wrapX(x - cameraX);
  const screenY = y => y - cameraY;
  const visibleCopies = x => [-WORLD_WIDTH, 0, WORLD_WIDTH].map(offset => x + offset - cameraX);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#000814");
    gradient.addColorStop(.48, "#07112b");
    gradient.addColorStop(1, "#020510");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const nebulae = [
      [width * .72, height * .28, 310, "rgba(80,120,255,.15)"],
      [width * .22, height * .76, 250, "rgba(123,65,180,.10)"],
      [width * .48, height * .48, 190, "rgba(40,120,150,.055)"]
    ];
    for (const [x, y, radius, color] of nebulae) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, color);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    for (const star of stars) {
      for (const x of visibleCopies(star.x)) {
        const y = screenY(star.y);
        if (x < -4 || x > width + 4 || y < -4 || y > height + 4) continue;
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = star.tint;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawConstellation(c) {
    const lookup = Object.fromEntries(c.stars.map(s => [s.id, s]));
    const isSelected = c.id === selectedId;
    const alpha = selectedId && !isSelected ? .42 : 1;

    for (const offset of [-WORLD_WIDTH, 0, WORLD_WIDTH]) {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = c.color;
      ctx.lineWidth = isSelected ? 2.5 : 1.6;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = isSelected ? 12 : 5;
      for (const [a, b] of c.connections) {
        const p1 = lookup[a], p2 = lookup[b];
        if (!p1 || !p2) continue;
        ctx.beginPath();
        ctx.moveTo(p1.x + offset - cameraX, p1.y - cameraY);
        ctx.lineTo(p2.x + offset - cameraX, p2.y - cameraY);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      for (const star of c.stars) {
        const x = star.x + offset - cameraX;
        const y = star.y - cameraY;
        if (x < -15 || x > width + 15 || y < -15 || y > height + 15) continue;
        ctx.fillStyle = "#fff";
        ctx.shadowColor = c.color;
        ctx.shadowBlur = isSelected ? 17 : 10;
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 5.5 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      const first = c.stars[0];
      const labelX = first.x + offset - cameraX;
      const labelY = first.y - 22 - cameraY;
      if (labelX > -120 && labelX < width + 120 && labelY > -20 && labelY < height + 20) {
        ctx.font = isSelected ? "600 14px Georgia" : "12px Georgia";
        ctx.fillStyle = c.color;
        ctx.fillText(c.name, labelX, labelY);
      }
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    if (!width || !height) return;
    drawBackground();
    const constellations = window.ATLAS_CONSTELLATIONS || [];
    constellations.forEach(drawConstellation);
    const coord = document.getElementById("coordinates");
    if (coord) {
      const sx = Math.floor(cameraX / 500).toString().padStart(2, "0");
      const sy = Math.floor(cameraY / 500).toString().padStart(2, "0");
      coord.textContent = `SECTOR ${sx} · ${sy}`;
    }
  }

  function pointerDown(e) {
    dragging = true;
    moved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  }
  function pointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
    cameraX = wrapX(cameraX - dx);
    cameraY = Math.max(-250, Math.min(WORLD_HEIGHT - height + 250, cameraY - dy));
    lastX = e.clientX;
    lastY = e.clientY;
    draw();
  }
  function pointerUp(e) {
    if (!dragging) return;
    dragging = false;
    if (!moved) selectAt(e.clientX, e.clientY);
  }

  function selectAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    let nearest = null, nearestDistance = 22;
    for (const c of (window.ATLAS_CONSTELLATIONS || [])) {
      for (const star of c.stars) {
        for (const sx of visibleCopies(star.x)) {
          const sy = star.y - cameraY;
          const distance = Math.hypot(sx - x, sy - y);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = c;
          }
        }
      }
    }
    if (nearest) {
      selectedId = nearest.id;
      draw();
      onSelect(nearest);
    }
  }

  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", () => { dragging = false; });
  window.addEventListener("resize", resize);

  window.StarMap = {
    select(id) {
      const c = (window.ATLAS_CONSTELLATIONS || []).find(item => item.id === id);
      if (!c) return false;
      selectedId = id;
      const first = c.stars[0];
      cameraX = wrapX(first.x - width * .48);
      cameraY = Math.max(-250, Math.min(WORLD_HEIGHT - height + 250, first.y - height * .48));
      draw();
      onSelect(c);
      return true;
    },
    reset() { cameraX = 0; cameraY = 0; selectedId = null; draw(); },
    setOnSelect(callback) { onSelect = callback; },
    redraw: draw
  };
  resize();
})();
