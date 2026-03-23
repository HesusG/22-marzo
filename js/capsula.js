/* ============================================================= */
/* CAPSULA.JS - Capsula del Tiempo                                 */
/* ============================================================= */

(function() {
  const capsulas = [
    { id: '1y', label: '1 Ano', years: 1, openDate: '2027-03-22' },
    { id: '3y', label: '3 Anos', years: 3, openDate: '2029-03-22' },
    { id: '5y', label: '5 Anos', years: 5, openDate: '2031-03-22' },
  ];

  function render() {
    const grid = document.getElementById('capsulas-grid');
    if (!grid) return;

    grid.innerHTML = capsulas.map(cap => {
      const saved = DataManager.load('capsula_' + cap.id) || {};
      const isSealed = saved.sealed === true;
      const canOpen = isSealed && new Date() >= new Date(cap.openDate);
      const daysLeft = isSealed ? daysUntil(cap.openDate) : 0;

      return `
        <div class="envelope ${isSealed ? 'sealed' : ''}" id="envelope-${cap.id}">
          <div class="envelope-title">Capsula de ${cap.label}</div>
          <div class="envelope-date">Para abrir: 22 de Marzo ${2026 + cap.years}</div>

          <label>Stephania escribe:</label>
          <textarea class="neo-input capsula-text" data-cap="${cap.id}" data-who="stephania"
            placeholder="Querido yo del futuro..." ${isSealed ? 'readonly' : ''}>${escapeHtml(saved.stephania || '')}</textarea>

          <label>Hesus escribe:</label>
          <textarea class="neo-input capsula-text" data-cap="${cap.id}" data-who="hesus"
            placeholder="Querido yo del futuro..." ${isSealed ? 'readonly' : ''}>${escapeHtml(saved.hesus || '')}</textarea>

          ${isSealed ? `
            <div class="envelope-seal">SELLADA<br>${cap.label}</div>
            ${canOpen ? `
              <div class="envelope-countdown">
                <button class="neo-btn neo-btn-primary envelope-open-btn" data-cap="${cap.id}">Abrir capsula!</button>
              </div>
            ` : `
              <div class="envelope-countdown">Faltan ${daysLeft} dias para abrir</div>
            `}
          ` : `
            <div class="envelope-actions">
              <button class="neo-btn neo-btn-primary capsula-save-btn" data-cap="${cap.id}">Guardar</button>
              <button class="neo-btn neo-btn-outline capsula-seal-btn" data-cap="${cap.id}">Sellar capsula</button>
            </div>
          `}
        </div>
      `;
    }).join('');

    // Save handlers
    grid.querySelectorAll('.capsula-save-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        saveCapsula(btn.dataset.cap);
        btn.textContent = 'Guardada!';
        setTimeout(() => { btn.textContent = 'Guardar'; }, 1500);
      });
    });

    // Seal handlers
    grid.querySelectorAll('.capsula-seal-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const capId = btn.dataset.cap;
        const texts = document.querySelectorAll(`.capsula-text[data-cap="${capId}"]`);
        const hasContent = Array.from(texts).some(t => t.value.trim().length > 0);

        if (!hasContent) {
          alert('Escriban algo antes de sellar la capsula!');
          return;
        }

        if (confirm('Sellar esta capsula? No podran editarla hasta la fecha de apertura.')) {
          sealCapsula(capId);
        }
      });
    });

    // Open handlers
    grid.querySelectorAll('.envelope-open-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const capId = btn.dataset.cap;
        if (confirm('Abrir esta capsula del tiempo?')) {
          openCapsula(capId);
        }
      });
    });
  }

  function saveCapsula(capId) {
    const saved = DataManager.load('capsula_' + capId) || {};
    const texts = document.querySelectorAll(`.capsula-text[data-cap="${capId}"]`);

    texts.forEach(t => {
      saved[t.dataset.who] = t.value;
    });

    DataManager.save('capsula_' + capId, saved);
  }

  function sealCapsula(capId) {
    saveCapsula(capId);
    const saved = DataManager.load('capsula_' + capId) || {};
    saved.sealed = true;
    saved.sealedAt = new Date().toISOString();
    DataManager.save('capsula_' + capId, saved);
    render();
  }

  function openCapsula(capId) {
    const saved = DataManager.load('capsula_' + capId) || {};
    saved.sealed = false;
    saved.opened = true;
    saved.openedAt = new Date().toISOString();
    DataManager.save('capsula_' + capId, saved);
    render();
  }

  function daysUntil(dateStr) {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', render);
})();
