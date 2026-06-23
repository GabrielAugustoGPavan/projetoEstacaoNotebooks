/* ═══════════════════════════════════════════
   auth.js — Autenticação e sessão
═══════════════════════════════════════════ */

const Auth = {
  _key: 'et_session',

  getSession() {
    try { return JSON.parse(sessionStorage.getItem(this._key)); }
    catch { return null; }
  },

  setSession(user) {
    sessionStorage.setItem(this._key, JSON.stringify(user));
  },

  clearSession() {
    sessionStorage.removeItem(this._key);
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  isAdmin() {
    const s = this.getSession();
    return s && s.role === 'admin';
  },

  login(login, senha) {
    const usuarios = DB.getUsuarios();
    const user = usuarios.find(u => u.login === login && u.senha === senha);
    if (user) {
      this.setSession({ id: user.id, nome: user.nome, login: user.login, role: user.role });
      return user;
    }
    return null;
  },

  logout() {
    this.clearSession();
    location.reload();
  },
};
