/* ============================================================= */
/* TIMELINE.JS - Linea del Tiempo (Editable)                       */
/* ============================================================= */

(function() {
  const defaultMilestones = [
    { id: 1,  date: "2025-03", title: "Nos conocimos", icon: "\u2728" },
    { id: 2,  date: "2025-04", title: "Primera cita", icon: "\u2615" },
    { id: 3,  date: "2025-05", title: "Primer beso", icon: "\uD83D\uDC8B" },
    { id: 4,  date: "2025-06", title: "Primeros meses juntos", icon: "\uD83D\uDC95" },
    { id: 5,  date: "2025-07", title: "Verano juntos", icon: "\u2600\uFE0F" },
    { id: 6,  date: "2025-08", title: "Vacaciones", icon: "\u2708\uFE0F" },
    { id: 7,  date: "2025-09", title: "De vuelta a la rutina", icon: "\uD83D\uDCDA" },
    { id: 8,  date: "2025-10", title: "Oto\u00f1o", icon: "\uD83C\uDF42" },
    { id: 9,  date: "2025-11", title: "Primer D\u00eda de Muertos juntos", icon: "\uD83C\uDF3A" },
    { id: 10, date: "2025-12", title: "Navidad y A\u00f1o Nuevo", icon: "\uD83C\uDF84" },
    { id: 11, date: "2026-01", title: "Nuevo a\u00f1o, mismo amor", icon: "\uD83C\uDF89" },
    { id: 12, date: "2026-02", title: "San Valent\u00edn", icon: "\uD83D\uDC98" },
    { id: 13, date: "2026-03", title: "1 A\u00f1o Juntos!", icon: "\uD83C\uDF82" },
  ];

  let nextId = 100;

  function getMilestones() {
    let milestones = DataManager.load('timeline_milestones');
    if (!milestones) {
      milestones = defaultMilestones.map(m => ({ ...m }));
      DataManager.save('timeline_milestones', milestones);
    }
    nextId = Math.max(nextId, ...milestones.map(m => m.id || 0)) + 1;
    return milestones.sort((a, b) => a.date.localeCompare(b.date));
  }

  function saveMilestones(milestones) {
    DataManager.save('timeline_milestones', milestones);
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
    const memories = DataManager.load('timeline_data') || {};

    container.innerHTML = milestones.map((m, i) => {
      const side = i % 2 === 0 ? 'left' : 'right';
      const mem = memories[m.id] || {};

      return `
        <div class="tl-item ${side}" data-id="${m.id}">
          <div class="tl-marker">${m.icon}</div>
          <div class="tl-card neo-card">
            <div class="tl-card-header">
              <input type="text" class="tl-title-input" data-id="${m.id}" value="${escapeAttr(m.title)}">
              <button class="tl-delete-btn" data-id="${m.id}" title="Eliminar momento">&times;</button>
            </div>
            <input type="month" class="tl-date-input" data-id="${m.id}" value="${m.date}">
            <label>Stephania recuerda:</label>
            <textarea class="neo-input tl-textarea" data-id="${m.id}" data-who="stephania" placeholder="\u00bfQu\u00e9 recuerdas de este momento?">${escapeHtml(mem.stephania || '')}</textarea>
            <label>Hesus recuerda:</label>
            <textarea class="neo-input tl-textarea" data-id="${m.id}" data-who="hesus" placeholder="\u00bfQu\u00e9 recuerdas de este momento?">${escapeHtml(mem.hesus || '')}</textarea>
            <button class="neo-btn neo-btn-primary tl-save-btn" data-id="${m.id}">Guardar</button>
          </div>
        </div>
      `;
    }).join('');

    // Save handlers
    container.querySelectorAll('.tl-save-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        saveItem(id);
        btn.textContent = '\u00a1Guardado!';
        setTimeout(() => { btn.textContent = 'Guardar'; }, 1500);
      });
    });

    // Delete handlers
    container.querySelectorAll('.tl-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('\u00bfEliminar este momento de la l\u00ednea del tiempo?')) {
          const id = parseInt(btn.dataset.id);
          deleteMilestone(id);
        }
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

  function saveItem(id) {
    // Save milestone title & date edits
    const milestones = getMilestones();
    const titleInput = document.querySelector(`.tl-title-input[data-id="${id}"]`);
    const dateInput = document.querySelector(`.tl-date-input[data-id="${id}"]`);

    const milestone = milestones.find(m => m.id === id);
    if (milestone) {
      if (titleInput && titleInput.value.trim()) {
        milestone.title = titleInput.value.trim();
      }
      if (dateInput && dateInput.value) {
        milestone.date = dateInput.value;
      }
      saveMilestones(milestones);
    }

    // Save memories
    const memories = DataManager.load('timeline_data') || {};
    const textareas = document.querySelectorAll(`.tl-textarea[data-id="${id}"]`);
    const data = {};

    textareas.forEach(ta => {
      data[ta.dataset.who] = ta.value;
    });

    memories[id] = data;
    DataManager.save('timeline_data', memories);
  }

  function deleteMilestone(id) {
    let milestones = getMilestones();
    milestones = milestones.filter(m => m.id !== id);
    saveMilestones(milestones);

    // Also remove memories for this milestone
    const memories = DataManager.load('timeline_data') || {};
    delete memories[id];
    DataManager.save('timeline_data', memories);

    render();
  }

  function addMilestone(date, title) {
    const milestones = getMilestones();
    milestones.push({
      id: nextId++,
      date: date,
      title: title,
      icon: "\u2B50"
    });
    saveMilestones(milestones);
    render();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
          alert('Completa la fecha y el t\u00edtulo');
          return;
        }

        addMilestone(dateInput.value, titleInput.value.trim());

        dateInput.value = '';
        titleInput.value = '';
        modal.classList.add('hidden');
      });
    }
  });
})();
