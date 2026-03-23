/* ============================================================= */
/* CARTA-FUTURO.JS - Carta desde el Futuro                         */
/* ============================================================= */

(function() {
  function init() {
    ['stephania', 'hesus'].forEach(who => {
      const textarea = document.getElementById('carta-' + who);
      const wcEl = document.getElementById('wc-' + who);
      if (!textarea || !wcEl) return;

      // Load saved data
      const saved = DataManager.load('carta_' + who);
      if (saved) {
        textarea.value = saved.text || '';
        updateWordCount(who);
        if (saved.sealed) {
          sealCarta(who, false);
        }
      }

      // Word count
      textarea.addEventListener('input', () => updateWordCount(who));
    });

    // Save buttons
    document.querySelectorAll('.save-carta-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const who = btn.dataset.who;
        saveCarta(who);
        btn.textContent = 'Guardada!';
        setTimeout(() => { btn.textContent = 'Guardar'; }, 2000);
      });
    });

    // Seal buttons
    document.querySelectorAll('.seal-carta-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const who = btn.dataset.who;
        const textarea = document.getElementById('carta-' + who);
        if (!textarea.value.trim()) {
          alert('Escribe algo antes de sellar la carta!');
          return;
        }
        if (confirm('Seguro que quieres sellar esta carta? Ya no podras editarla.')) {
          saveCarta(who);
          sealCarta(who, true);
        }
      });
    });
  }

  function updateWordCount(who) {
    const textarea = document.getElementById('carta-' + who);
    const wcEl = document.getElementById('wc-' + who);
    const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    wcEl.textContent = words + ' palabras de amor';
  }

  function saveCarta(who) {
    const textarea = document.getElementById('carta-' + who);
    const existing = DataManager.load('carta_' + who) || {};
    existing.text = textarea.value;
    DataManager.save('carta_' + who, existing);
  }

  function sealCarta(who, persist) {
    const sealOverlay = document.getElementById('seal-' + who);
    const textarea = document.getElementById('carta-' + who);

    sealOverlay.classList.remove('hidden');
    textarea.readOnly = true;

    if (persist) {
      const data = DataManager.load('carta_' + who) || {};
      data.sealed = true;
      data.sealedAt = new Date().toISOString();
      DataManager.save('carta_' + who, data);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
