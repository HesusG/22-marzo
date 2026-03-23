/* ============================================================= */
/* SI-FUERAS.JS - "Si fueras..." Card Flip Game                    */
/* ============================================================= */

(function() {
  const prompts = [
    { front: "Si fueras un color...", icon: "\uD83C\uDFA8" },
    { front: "Si fueras una ciudad...", icon: "\uD83C\uDFD9\uFE0F" },
    { front: "Si fueras una cancion...", icon: "\uD83C\uDFB5" },
    { front: "Si fueras una comida...", icon: "\uD83C\uDF73" },
    { front: "Si fueras un animal...", icon: "\uD83E\uDD81" },
    { front: "Si fueras una pelicula...", icon: "\uD83C\uDFAC" },
    { front: "Si fueras una estación del año...", icon: "\u2600\uFE0F" },
    { front: "Si fueras un superpoder...", icon: "\u26A1" },
  ];

  function init() {
    const grid = document.getElementById('si-fueras-grid');
    if (!grid) return;

    const saved = DataManager.load('si_fueras') || {};

    grid.innerHTML = prompts.map((p, i) => {
      const data = saved[i] || {};
      const hasSaved = data.stephania || data.hesus;

      return `
        <div class="flip-card" data-index="${i}">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              ${hasSaved ? '<div class="saved-badge">\u2764</div>' : ''}
              <span class="card-icon">${p.icon}</span>
              <p>${p.front}</p>
              <small>Toca para voltear</small>
            </div>
            <div class="flip-card-back" onclick="event.stopPropagation()">
              <div class="back-title">${p.front}</div>
              <label>Stephania dice:</label>
              <input type="text" class="neo-input sf-input" data-index="${i}" data-who="stephania" placeholder="Serias..." value="${escapeHtml(data.stephania || '')}">
              <label>Porque:</label>
              <input type="text" class="neo-input sf-input" data-index="${i}" data-who="stephania_why" placeholder="Porque..." value="${escapeHtml(data.stephania_why || '')}">
              <label>Hesus dice:</label>
              <input type="text" class="neo-input sf-input" data-index="${i}" data-who="hesus" placeholder="Serias..." value="${escapeHtml(data.hesus || '')}">
              <label>Porque:</label>
              <input type="text" class="neo-input sf-input" data-index="${i}" data-who="hesus_why" placeholder="Porque..." value="${escapeHtml(data.hesus_why || '')}">
              <button class="neo-btn neo-btn-primary save-flip-btn" data-index="${i}">Guardar</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Flip handlers
    grid.querySelectorAll('.flip-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.flip-card-back')) return;
        card.classList.toggle('flipped');
      });
    });

    // Save handlers
    grid.querySelectorAll('.save-flip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        saveCard(idx);
        btn.textContent = 'Guardado!';
        setTimeout(() => { btn.textContent = 'Guardar'; }, 1500);
      });
    });
  }

  function saveCard(index) {
    const saved = DataManager.load('si_fueras') || {};
    const inputs = document.querySelectorAll(`.sf-input[data-index="${index}"]`);
    const data = {};

    inputs.forEach(inp => {
      data[inp.dataset.who] = inp.value;
    });

    saved[index] = data;
    DataManager.save('si_fueras', saved);

    // Update badge
    const card = document.querySelector(`.flip-card[data-index="${index}"]`);
    const front = card.querySelector('.flip-card-front');
    if (!front.querySelector('.saved-badge')) {
      const badge = document.createElement('div');
      badge.className = 'saved-badge';
      badge.textContent = '\u2764';
      front.appendChild(badge);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
