/* ============================================================= */
/* ALBUM.JS - Album de Futuros (Vision Board)                      */
/* ============================================================= */

(function() {
  const categoryColors = {
    viaje: 'cat-viaje',
    sueno: 'cat-sueno',
    meta: 'cat-meta',
    otro: 'cat-otro',
  };

  const categoryLabels = {
    viaje: 'Viaje',
    sueno: 'Sueno',
    meta: 'Meta',
    otro: 'Otro',
  };

  function getDreams() {
    return DataManager.load('album_dreams') || [];
  }

  function saveDreams(dreams) {
    DataManager.save('album_dreams', dreams);
  }

  function render() {
    const board = document.getElementById('album-board');
    if (!board) return;

    const dreams = getDreams();

    if (dreams.length === 0) {
      board.innerHTML = '<div class="album-empty">Aun no hay suenos. Agreguen el primero!</div>';
      return;
    }

    board.innerHTML = dreams.map((dream, i) => {
      const rotation = (Math.random() * 4 - 2).toFixed(1);
      return `
        <div class="dream-card" draggable="true" data-index="${i}" style="transform: rotate(${rotation}deg)">
          <button class="dream-delete" data-index="${i}" title="Eliminar">&times;</button>
          <span class="dream-category ${categoryColors[dream.category] || 'cat-otro'}">${categoryLabels[dream.category] || dream.category}</span>
          <h4>${escapeHtml(dream.title)}</h4>
          <p>${escapeHtml(dream.description)}</p>
        </div>
      `;
    }).join('');

    // Delete handlers
    board.querySelectorAll('.dream-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        if (confirm('Eliminar este sueno?')) {
          const dreams = getDreams();
          dreams.splice(idx, 1);
          saveDreams(dreams);
          render();
        }
      });
    });

    // Drag and drop
    initDragDrop(board);
  }

  function initDragDrop(board) {
    let dragIndex = null;

    board.querySelectorAll('.dream-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        dragIndex = parseInt(card.dataset.index);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        dragIndex = null;
      });

      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        const dropIndex = parseInt(card.dataset.index);
        if (dragIndex === null || dragIndex === dropIndex) return;

        const dreams = getDreams();
        const [moved] = dreams.splice(dragIndex, 1);
        dreams.splice(dropIndex, 0, moved);
        saveDreams(dreams);
        render();
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', () => {
    render();

    // Modal handlers
    const addBtn = document.getElementById('add-dream-btn');
    const modal = document.getElementById('dream-modal');
    const closeModal = document.getElementById('close-dream-modal');
    const saveBtn = document.getElementById('save-dream-btn');

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
        const category = document.getElementById('dream-category').value;
        const title = document.getElementById('dream-title').value.trim();
        const desc = document.getElementById('dream-desc').value.trim();

        if (!title) {
          alert('Dale un titulo a tu sueno!');
          return;
        }

        const dreams = getDreams();
        dreams.push({
          category: category,
          title: title,
          description: desc,
          createdAt: new Date().toISOString()
        });
        saveDreams(dreams);

        // Clear form
        document.getElementById('dream-title').value = '';
        document.getElementById('dream-desc').value = '';
        document.getElementById('dream-category').value = 'viaje';

        modal.classList.add('hidden');
        render();
      });
    }
  });
})();
