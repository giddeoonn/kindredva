(() => {
  const canvas = document.getElementById("hero-canvas");
  const ctx = canvas.getContext("2d", { alpha: true });

  const colors = {
    primary: "#5dacce",
    secondary: "#125e67",
    accent: "#177882",
  };

  function resizeCanvas() {
    const style = getComputedStyle(canvas);
    canvas.width = parseInt(style.width);
    canvas.height = parseInt(style.height);
  }
  resizeCanvas();

  const NODE_COUNT = Math.round(
    Math.max(15, Math.min(45, (canvas.width * canvas.height) / 90000))
  );
  const MAX_DIST = 180;
  const LINE_ALPHA = 0.45;

  const nodes = [];
  const rand = (min, max) => Math.random() * (max - min) + min;

  for (let i = 0; i < NODE_COUNT; i++) {
    nodes.push({
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      vx: rand(-0.5, 0.5),
      vy: rand(-0.5, 0.5),
      color:
        i % 3 === 0
          ? colors.primary
          : i % 3 === 1
          ? colors.accent
          : colors.secondary,
    });
  }

  function update(step) {
    for (const n of nodes) {
      n.x += n.vx * step;
      n.y += n.vy * step;

      if (n.x < 0) n.x = canvas.width;
      if (n.x > canvas.width) n.x = 0;
      if (n.y < 0) n.y = canvas.height;
      if (n.y > canvas.height) n.y = 0;
    }
  }
  // Preload your background image
  const bgImage = new Image();
  bgImage.src = "assets/images/hero-banner/home.svg"; // <-- Put your image path here

  // Ensure image is loaded before drawing
  bgImage.onload = () => {
    draw();
  };

  function draw() {
    // ---------- BACKGROUND IMAGE (cover effect) ----------
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = bgImage.width / bgImage.height;
    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imageRatio) {
      // Canvas is wider than image
      drawWidth = canvas.width;
      drawHeight = canvas.width / imageRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      // Canvas is taller than image
      drawWidth = canvas.height * imageRatio;
      drawHeight = canvas.height;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }

    ctx.drawImage(bgImage, drawX, drawY, drawWidth, drawHeight);

    // ---------- PARTICLES ----------
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      // Draw the dot
      ctx.beginPath();
      ctx.arc(a.x, a.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = a.color;
      ctx.shadowColor = a.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw connecting lines
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > MAX_DIST) continue;
        const t = 1 - dist / MAX_DIST;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        const lineColor = a.color;
        ctx.strokeStyle = lineColor
          .replace(")", `,${(LINE_ALPHA * t).toFixed(2)})`)
          .replace("rgb", "rgba");
        ctx.lineWidth = 5 * t;
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 14 * t;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(40, now - last);
    last = now;
    update(dt / 16.666);
    draw();
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", () => {
    resizeCanvas();
  });

  requestAnimationFrame(frame);
})();
