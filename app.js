/* ═══════════════════════════════════════════
   app.js — Ponto de entrada principal
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. Seed de dados iniciais */
  DB.seed();

  /* 2. Carregar tema salvo */
  const cfg = DB.getConfig();
  if (cfg.tema) {
    document.body.setAttribute('data-theme', cfg.tema);
    document.getElementById('themeLight').classList.toggle('active', cfg.tema === 'light');
    document.getElementById('themeDark').classList.toggle('active', cfg.tema === 'dark');
  }

  /* 3. Verificar sessão */
  if (Auth.isLoggedIn()) {
    iniciarSistema();
  } else {
    mostrarLogin();
  }

  /* 4. Login form */
  document.getElementById('btnLogin').addEventListener('click', fazerLogin);
  document.getElementById('loginPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') fazerLogin();
  });
  document.getElementById('loginUser').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('loginPass').focus();
  });
});

function fazerLogin() {
  const login = document.getElementById('loginUser').value.trim();
  const senha = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');

  if (!login || !senha) {
    errEl.textContent = 'Preencha usuário e senha.';
    errEl.style.display = 'block';
    return;
  }

  const user = Auth.login(login, senha);
  if (user) {
    errEl.style.display = 'none';
    iniciarSistema();
  } else {
    errEl.textContent = 'Usuário ou senha incorretos.';
    errEl.style.display = 'block';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }
}

function mostrarLogin() {
  document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active-screen'));
  document.getElementById('screen-login').classList.add('active-screen');
  document.getElementById('sidebar').style.display = 'none';
  document.getElementById('topbar').style.display = 'none';
  document.getElementById('loginUser').focus();
}

function iniciarSistema() {
  const user = Auth.getSession();

  /* Mostrar UI */
  document.getElementById('screen-login').classList.remove('active-screen');
  document.getElementById('sidebar').style.display = '';
  document.getElementById('topbar').style.display = '';

  /* Atualizar dados do usuário na sidebar */
  document.getElementById('sidebarUserName').textContent = user.nome;
  document.getElementById('sidebarAvatar').textContent = user.nome.charAt(0).toUpperCase();

  /* Ocultar itens de admin para professores */
  if (!Auth.isAdmin()) {
    document.querySelectorAll('[data-screen="notebooks"],[data-screen="professores"],[data-screen="turmas"],[data-screen="relatorios"],[data-screen="configuracoes"]').forEach(el => {
      el.style.display = 'none';
    });
  }

  /* Iniciar relógio */
  startClock();

  /* Navegar para dashboard */
  navigate('dashboard');
}
