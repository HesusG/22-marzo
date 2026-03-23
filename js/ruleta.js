/* ============================================================= */
/* RULETA.JS - Spinning Wheel                                      */
/* ============================================================= */

(function() {
  const segments = [
    { label: "Algo que aun\nno te he dicho", color: "#E63956" },
    { label: "Un miedo\nque tengo", color: "#9C27B0" },
    { label: "Algo que me\nencanta de ti", color: "#FF6B9D" },
    { label: "Un recuerdo\nfavorito", color: "#FFD700" },
    { label: "Primera\ncita", color: "#FF7F7F" },
    { label: "Primer\nbeso", color: "#C2185B" },
    { label: "Lo que mas\nadmiro de ti", color: "#E63956" },
    { label: "Un sueno\njuntos", color: "#9C27B0" },
  ];

  let canvas, ctx, size, cx, cy, radius;
  let currentRotation = 0;
  let isSpinning = false;

  function initCanvas() {
    canvas = document.getElementById('ruleta-canvas');
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    size = Math.min(window.innerWidth - 60, 380);

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    cx = size / 2;
    cy = size / 2;
    radius = size / 2 - 8;

    drawWheel(currentRotation);
  }

  function drawWheel(rotation) {
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    const arc = (2 * Math.PI) / segments.length;

    segments.forEach((seg, i) => {
      const startAngle = rotation + i * arc;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + arc);
      ctx.closePath();
      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2D0A1F';
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px Poppins, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 2;

      const lines = seg.label.split('\n');
      lines.forEach((line, li) => {
        ctx.fillText(line, radius - 14, (li - lines.length / 2 + 0.5) * 14);
      });

      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#2D0A1F';
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#E63956';
    ctx.font = 'bold 12px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GIRA!', cx, cy);
  }

  function spin() {
    if (isSpinning) return;
    isSpinning = true;

    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;
    spinBtn.textContent = 'Girando...';

    const spinAmount = Math.random() * 2 * Math.PI + (2 * Math.PI * 6);
    const startRotation = currentRotation;
    const targetRotation = currentRotation + spinAmount;
    const duration = 4500;
    const startTime = performance.now();

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      currentRotation = startRotation + spinAmount * eased;
      drawWheel(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.textContent = 'Girar';

        const arc = (2 * Math.PI) / segments.length;
        const normalizedAngle = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer is at top (270 degrees = 3*PI/2)
        const pointerAngle = ((3 * Math.PI / 2) - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
        const winIndex = Math.floor(pointerAngle / arc) % segments.length;

        showResult(segments[winIndex]);
      }
    }

    requestAnimationFrame(animate);
  }

  function showResult(segment) {
    const resultDiv = document.getElementById('ruleta-result');
    const categoryEl = document.getElementById('result-category');
    const answerEl = document.getElementById('result-answer');

    categoryEl.textContent = segment.label.replace('\n', ' ');
    answerEl.value = '';
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth' });
  }

  function saveAnswer() {
    const category = document.getElementById('result-category').textContent;
    const answer = document.getElementById('result-answer').value.trim();
    if (!answer) return;

    const history = DataManager.load('ruleta_history') || [];
    history.push({
      category: category,
      answer: answer,
      timestamp: new Date().toLocaleString('es-MX')
    });
    DataManager.save('ruleta_history', history);

    document.getElementById('ruleta-result').classList.add('hidden');
    renderHistory();
  }

  function renderHistory() {
    const history = DataManager.load('ruleta_history') || [];
    const container = document.getElementById('history-list');
    if (!container) return;

    if (history.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px;">Aun no hay respuestas. Gira la ruleta!</p>';
      return;
    }

    container.innerHTML = history.map(item =>
      `<div class="history-item">
        <strong>${item.category}</strong>
        <span>${item.answer}</span>
        <small style="display:block; color: var(--text-secondary); font-size: 11px; margin-top: 4px;">${item.timestamp}</small>
      </div>`
    ).reverse().join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCanvas();

    const spinBtn = document.getElementById('spin-btn');
    if (spinBtn) spinBtn.addEventListener('click', spin);

    const saveBtn = document.getElementById('save-answer-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveAnswer);

    const closeBtn = document.getElementById('close-result-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('ruleta-result').classList.add('hidden');
      });
    }

    // Also spin when clicking the canvas
    if (canvas) canvas.addEventListener('click', spin);

    renderHistory();

    window.addEventListener('resize', () => {
      clearTimeout(window._ruletaResize);
      window._ruletaResize = setTimeout(initCanvas, 250);
    });
  });
})();
