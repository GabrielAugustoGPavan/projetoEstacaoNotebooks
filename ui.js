/* ═══════════════════════════════════════════
   ui.js — Helpers de interface
═══════════════════════════════════════════ */

/* ── Toast ── */
function toast(title, msg = '', type = 'success') {
  const icons = {
    success: `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clip-rule="evenodd"/></svg>`,
    error:   `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.707 7.293a1 1 0 0 0-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 1 0 1.414 1.414L10 11.414l1.293 1.293a1 1 0 0 0 1.414-1.414L11.414 10l1.293-1.293a1 1 0 0 0-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
    warning: `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clip-rule="evenodd"/></svg>`,
    info:    `<svg class="toast__icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9z" clip-rule="evenodd"/></svg>`,
  };
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `${icons[type]}<div class="toast__text"><div class="toast__title">${title}</div>${msg ? `<div class="toast__msg">${msg}</div>` : ''}</div>`;
  document.getElementById('toastContainer').prepend(el);
  setTimeout(() => {
    el.classList.add('closing');
    el.addEventListener('animationend', () => el.remove());
  }, 3500);
}

/* ── Modal ── */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

/* Fechar modal clicando no overlay */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

/* ── Confirmação de exclusão ── */
let _deleteCallback = null;

function confirmDelete(msg, callback) {
  document.getElementById('confirmMsg').textContent = msg;
  _deleteCallback = callback;
  openModal('modal-confirm');
}

document.getElementById('btnConfirmDelete').addEventListener('click', () => {
  if (_deleteCallback) { _deleteCallback(); _deleteCallback = null; }
  closeModal('modal-confirm');
});

/* ── Tema ── */
function setTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  document.getElementById('themeLight').classList.toggle('active', theme === 'light');
  document.getElementById('themeDark').classList.toggle('active', theme === 'dark');
  const cfg = DB.getConfig();
  cfg.tema = theme;
  DB.setConfig(cfg);
}

document.getElementById('btnTheme').addEventListener('click', () => {
  const current = document.body.getAttribute('data-theme');
  setTheme(current === 'light' ? 'dark' : 'light');
});

/* ── Relógio ── */
function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById('topbarClock').textContent = now.toLocaleString('pt-BR', {
      weekday: 'short', day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Navegação ── */
function navigate(screenName) {
  // Esconder todas as telas
  document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active-screen'));

  // Mostrar tela alvo
  const target = document.getElementById('screen-' + screenName);
  if (target) target.classList.add('active-screen');

  // Atualizar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.screen === screenName);
  });

  // Atualizar título da topbar
  const title = target ? (target.dataset.title || screenName) : screenName;
  document.getElementById('topbarTitle').textContent = title;

  // Fechar sidebar mobile
  document.body.classList.remove('sidebar-open');

  // Renderizar tela
  renderScreen(screenName);
}

function renderScreen(name) {
  const renders = {
    dashboard:      renderDashboard,
    movimentacoes:  renderMovimentacoes,
    estacoes:       renderEstacoes,
    notebooks:      renderNotebooks,
    professores:    renderProfessores,
    turmas:         renderTurmas,
    manutencoes:    renderManutencoes,
    relatorios:     renderRelatorios,
    configuracoes:  renderConfiguracoes,
  };
  if (renders[name]) renders[name]();
}

/* ── Sidebar mobile toggle ── */
document.getElementById('btnMenuToggle').addEventListener('click', () => {
  document.body.classList.toggle('sidebar-open');
});

document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.body.classList.remove('sidebar-open');
});

/* ── Nav items ── */
document.querySelectorAll('.nav-item[data-screen]').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.screen));
});

/* ── Logout ── */
document.getElementById('btnLogout').addEventListener('click', () => {
  if (confirm('Deseja sair do sistema?')) Auth.logout();
});

/* ── Olho da senha no login ── */
document.getElementById('btnEye').addEventListener('click', () => {
  const inp = document.getElementById('loginPass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

/* ── Filtro genérico de tabelas ── */
function filterTable(screen) {
  const renders = {
    movimentacoes: renderMovimentacoes,
    notebooks:     renderNotebooks,
    professores:   renderProfessores,
    manutencoes:   renderManutencoes,
  };
  if (renders[screen]) renders[screen]();
}

/* ── Helpers de badge ── */
function statusBadge(status) {
  const map = {
    'Ativo':        'badge--success',
    'Inativo':      'badge--neutral',
    'Manutenção':   'badge--warning',
    'Aberto':       'badge--danger',
    'Em andamento': 'badge--warning',
    'Concluído':    'badge--success',
    'Livre':        'badge--success',
    'Em uso':       'badge--danger',
    'Preventiva':   'badge--info',
    'Corretiva':    'badge--danger',
    'Atualização':  'badge--brand',
  };
  return `<span class="badge ${map[status] || 'badge--neutral'}">${status}</span>`;
}

function conditionClass(c) {
  return { 'Ótimo': 'otimo', 'Bom': 'bom', 'Regular': 'regular', 'Ruim': 'ruim' }[c] || 'bom';
}

function chipMovimentacao(tipo) {
  return `<span class="chip chip--${tipo === 'Retirada' ? 'retirada' : 'devolucao'}">${tipo}</span>`;
}

function avatarLetra(nome) {
  return nome ? nome.charAt(0).toUpperCase() : '?';
}

function emptyRow(cols, msg = 'Nenhum registro encontrado') {
  return `<tr class="empty-row"><td colspan="${cols}">
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"/></svg>
      </div>
      <p class="empty-state__title">${msg}</p>
      <p class="empty-state__sub">Adicione registros para que apareçam aqui.</p>
    </div>
  </td></tr>`;
}

/* ── Populadores de selects ── */
function populateSelect(selectId, items, valueKey, labelFn, placeholder = 'Selecione…') {
  const el = document.getElementById(selectId);
  if (!el) return;
  el.innerHTML = `<option value="">${placeholder}</option>` +
    items.map(i => `<option value="${i[valueKey]}">${labelFn(i)}</option>`).join('');
}
