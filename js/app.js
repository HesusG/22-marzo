/* ============================================================= */
/* APP.JS - Navigation & DataManager                               */
/* ============================================================= */

const DataManager = {
  prefix: '22marzo_',

  save(key, data) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('localStorage error:', e);
      return false;
    }
  },

  load(key) {
    try {
      const data = localStorage.getItem(this.prefix + key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }
};

/* Navigation */
function navigateTo(sectionName) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('active');
  });

  const target = document.getElementById('section-' + sectionName);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const btn = document.querySelector(`.nav-btn[data-section="${sectionName}"]`);
  if (btn) {
    btn.classList.add('active');
    btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.section);
    });
  });
});
