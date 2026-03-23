/* ============================================================= */
/* TIMELINE.JS - Linea del Tiempo                                  */
/* ============================================================= */

(function() {
  const defaultMilestones = [
    { date: "2025-03", title: "Nos conocimos", icon: "\u2728" },
    { date: "2025-04", title: "Primera cita", icon: "\u2615" },
    { date: "2025-05", title: "Primer beso", icon: "\uD83D\uDC8B" },
    { date: "2025-06", title: "Primeros meses juntos", icon: "\uD83D\uDC95" },
    { date: "2025-07", title: "Verano juntos", icon: "\u2600\uFE0F" },
    { date: "2025-08", title: "Vacaciones", icon: "\u2708\uFE0F" },
    { date: "2025-09", title: "De vuelta a la rutina", icon: "\uD83D\uDCDA" },
    { date: "2025-10", title: "Otono", icon: "\uD83C\uDF42" },
    { date: "2025-11", title: "Primer Dia de Muertos juntos", icon: "\uD83C\uDF3A" },
    { date: "2025-12", title: "Navidad y Ano Nuevo", icon: "\uD83C\uDF84" },
    { date: "2026-01", title: "Nuevo ano, mismo amor", icon: "\uD83C\uDF89" },
    { date: "2026-02", title: "San Valentin", icon: "\uD83D\uDC98" },
    { date: "2026-03", title: "1 Ano Juntos!", icon: "\uD83C\uDF82" },
  ];

  function getMilestones() {
    const custom = DataManager.load('timeline_custom') || [];
    return [...defaultMilestones, ...custom].sort((a, b) => a.date.localeCompare(b.date));
  }

  function formatDate(dateStr) {
    const [year, month] = dateStr.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[parseInt(month) - 1] + ' ' + year;
  }

  function render() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const milestones = getMilestones();
    const saved = DataManager.load('timeline_data') || {};

    container.innerHTML = milestones.map((m, i) => {
      const side = i % 2 === 0 ? 'left' : 'right';
      const data = saved[m.date] || {};

      return `
        <div class="tl-item ${side}" data-date="${m.date}">
          <div class="tl-marker">${m.icon}</div>
          <div class="tl-card neo-card">
            <h4>${m.title}</h4>
            <div class="tl-date">${formatDate(m.date)}</div>
            <label>Stephania recuerda:</label>
            <textarea class="neo-input tl-textarea" data-date="${m.date}" data-who="stephania" placeholder="Que recuerdas de este momento?">${escapeHtml(data.stephania || '')}</textarea>
            <label>Hesus recuerda:</label>
            <textarea class="neo-input tl-textarea" data-date="${m.date}" data-who="hesus" placeholder="Que recuerdas de este momento?">${escapeHtml(data.hesus || '')}</textarea>
            <button class="neo-btn neo-btn-primary tl-save-btn" data-date="${m.date}">Guardar</button>
          </div>
        </div>
      `;
    }).join('');

    // Save handlers
    container.querySelectorAll('.tl-save-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        saveTimeline(btn.dataset.date);
        btn.textContent = 'Guardado!';
        setTimeout(() => { btn.textContent = 'Guardar'; }, 1500);
      });
    });

    // Intersection observer for animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    container.querySelectorAll('.tl-item').forEach(item => {
      observer.observe(item);
    });
  }

  function saveTimeline(date) {
    const saved = DataManager.load('timeline_data') || {};
    const textareas = document.querySelectorAll(`.tl-textarea[data-date="${date}"]`);
    const data = {};

    textareas.forEach(ta => {
      data[ta.dataset.who] = ta.value;
    });

    saved[date] = data;
    DataManager.save('timeline_data', saved);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();

    // Add milestone modal
    const addBtn = document.getElementById('add-milestone-btn');
    const modal = document.getElementById('add-milestone-modal');
    const closeModal = document.getElementById('close-milestone-modal');
    const saveBtn = document.getElementById('save-milestone-btn');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }

    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const dateInput = document.getElementById('milestone-date');
        const titleInput = document.getElementById('milestone-title');

        if (!dateInput.value || !titleInput.value.trim()) {
          alert('Completa la fecha y el titulo');
          return;
        }

        const custom = DataManager.load('timeline_custom') || [];
        custom.push({
          date: dateInput.value,
          title: titleInput.value.trim(),
          icon: "\u2B50"
        });
        DataManager.save('timeline_custom', custom);

        dateInput.value = '';
        titleInput.value = '';
        modal.classList.add('hidden');
        render();
      });
    }
  });
})();
