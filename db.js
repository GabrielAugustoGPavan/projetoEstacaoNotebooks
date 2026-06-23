/* ═══════════════════════════════════════════
   db.js — Camada de persistência (LocalStorage)
═══════════════════════════════════════════ */

const DB = {
  keys: {
    estacoes:      'et_estacoes',
    notebooks:     'et_notebooks',
    professores:   'et_professores',
    turmas:        'et_turmas',
    movimentacoes: 'et_movimentacoes',
    manutencoes:   'et_manutencoes',
    config:        'et_config',
    usuarios:      'et_usuarios',
  },

  /* ── CRUD genérico ── */
  _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  _getObj(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch { return {}; }
  },

  /* ── Getters ── */
  getEstacoes()      { return this._get(this.keys.estacoes); },
  getNotebooks()     { return this._get(this.keys.notebooks); },
  getProfessores()   { return this._get(this.keys.professores); },
  getTurmas()        { return this._get(this.keys.turmas); },
  getMovimentacoes() { return this._get(this.keys.movimentacoes); },
  getManutencoes()   { return this._get(this.keys.manutencoes); },
  getConfig()        { return this._getObj(this.keys.config); },
  getUsuarios()      { return this._get(this.keys.usuarios); },

  /* ── Setters ── */
  setEstacoes(d)      { this._set(this.keys.estacoes, d); },
  setNotebooks(d)     { this._set(this.keys.notebooks, d); },
  setProfessores(d)   { this._set(this.keys.professores, d); },
  setTurmas(d)        { this._set(this.keys.turmas, d); },
  setMovimentacoes(d) { this._set(this.keys.movimentacoes, d); },
  setManutencoes(d)   { this._set(this.keys.manutencoes, d); },
  setConfig(d)        { this._set(this.keys.config, d); },
  setUsuarios(d)      { this._set(this.keys.usuarios, d); },

  /* ── Helpers ── */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },

  agora() {
    return new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  dataHoje() {
    return new Date().toLocaleDateString('pt-BR');
  },

  /* ── Seed de dados iniciais ── */
  seed() {
    // Usuários padrão
    if (!this.getUsuarios().length) {
      this.setUsuarios([
        { id: 'u1', nome: 'Administrador', login: 'admin', senha: 'admin123', role: 'admin' },
        { id: 'u2', nome: 'Professor',     login: 'professor', senha: 'prof123', role: 'professor' },
      ]);
    }

    // Estações A, B, C
    if (!this.getEstacoes().length) {
      this.setEstacoes([
        { id: 'est-a', nome: 'Estação A', letra: 'A', capacidade: 15, ocupada: false, professor: '', sala: '', horario: '', localizacao: 'Bloco A', descricao: 'Carrinho principal' },
        { id: 'est-b', nome: 'Estação B', letra: 'B', capacidade: 15, ocupada: false, professor: '', sala: '', horario: '', localizacao: 'Bloco B', descricao: 'Carrinho secundário' },
        { id: 'est-c', nome: 'Estação C', letra: 'C', capacidade: 10, ocupada: false, professor: '', sala: '', horario: '', localizacao: 'Bloco C', descricao: 'Carrinho de suporte' },
      ]);
    }

    // Professores de exemplo
    if (!this.getProfessores().length) {
      this.setProfessores([
        { id: 'pf1', nome: 'Maria Silva',   disciplina: 'Matemática',  email: 'maria@escola.edu.br',  telefone: '(11) 99111-1111', status: 'Ativo', criadoEm: this.agora() },
        { id: 'pf2', nome: 'João Pereira',  disciplina: 'Português',   email: 'joao@escola.edu.br',   telefone: '(11) 99222-2222', status: 'Ativo', criadoEm: this.agora() },
        { id: 'pf3', nome: 'Ana Rodrigues', disciplina: 'Ciências',    email: 'ana@escola.edu.br',    telefone: '(11) 99333-3333', status: 'Ativo', criadoEm: this.agora() },
        { id: 'pf4', nome: 'Carlos Lima',   disciplina: 'História',    email: 'carlos@escola.edu.br', telefone: '(11) 99444-4444', status: 'Ativo', criadoEm: this.agora() },
      ]);
    }

    // Turmas de exemplo
    if (!this.getTurmas().length) {
      this.setTurmas([
        { id: 'tm1', nome: '6º A', ano: '6º ano', periodo: 'Manhã',  alunos: 32, criadoEm: this.agora() },
        { id: 'tm2', nome: '7º B', ano: '7º ano', periodo: 'Tarde',  alunos: 35, criadoEm: this.agora() },
        { id: 'tm3', nome: '8º A', ano: '8º ano', periodo: 'Manhã',  alunos: 30, criadoEm: this.agora() },
        { id: 'tm4', nome: '9º B', ano: '9º ano', periodo: 'Noite',  alunos: 28, criadoEm: this.agora() },
      ]);
    }

    // Notebooks de exemplo
    if (!this.getNotebooks().length) {
      const nbs = [];
      const modelos = ['Dell Latitude 3420', 'Lenovo IdeaPad 3', 'Acer Aspire 5', 'HP 250 G8'];
      const estIds  = ['est-a', 'est-b', 'est-c'];
      const caps    = [15, 15, 10];
      let idx = 1;
      estIds.forEach((eid, ei) => {
        for (let i = 0; i < caps[ei]; i++) {
          nbs.push({
            id: 'nb-' + idx,
            patrimonio: `NB-${String(idx).padStart(3,'0')}`,
            modelo: modelos[idx % modelos.length],
            estacaoId: eid,
            status: idx % 10 === 0 ? 'Manutenção' : 'Ativo',
            condicao: ['Ótimo','Bom','Regular'][idx % 3],
            ano: 2022 + (idx % 3),
            obs: '',
            ultimaMov: '',
            criadoEm: this.agora(),
          });
          idx++;
        }
      });
      this.setNotebooks(nbs);
    }

    // Movimentações de exemplo
    if (!this.getMovimentacoes().length) {
      this.setMovimentacoes([
        { id: 'mv1', tipo: 'Retirada',  estacaoId: 'est-a', professorId: 'pf1', turmaId: 'tm1', obs: '',          horario: '17/06/2026 08:30' },
        { id: 'mv2', tipo: 'Devolução', estacaoId: 'est-a', professorId: 'pf1', turmaId: 'tm1', obs: 'Tudo certo', horario: '17/06/2026 10:00' },
        { id: 'mv3', tipo: 'Retirada',  estacaoId: 'est-b', professorId: 'pf2', turmaId: 'tm2', obs: '',          horario: '18/06/2026 13:15' },
        { id: 'mv4', tipo: 'Devolução', estacaoId: 'est-b', professorId: 'pf2', turmaId: 'tm2', obs: '',          horario: '18/06/2026 15:00' },
        { id: 'mv5', tipo: 'Retirada',  estacaoId: 'est-c', professorId: 'pf3', turmaId: 'tm3', obs: '',          horario: '19/06/2026 09:00' },
      ]);
    }

    // Manutenções de exemplo
    if (!this.getManutencoes().length) {
      this.setManutencoes([
        { id: 'mn1', notebookId: 'nb-10', tipo: 'Corretiva',  desc: 'Teclado com teclas travadas',  status: 'Aberto',       custo: 0,     criadoEm: '15/06/2026 09:00' },
        { id: 'mn2', notebookId: 'nb-20', tipo: 'Corretiva',  desc: 'Bateria não carrega',          status: 'Em andamento', custo: 120,   criadoEm: '16/06/2026 14:00' },
        { id: 'mn3', notebookId: 'nb-30', tipo: 'Preventiva', desc: 'Limpeza geral e atualização',  status: 'Concluído',    custo: 0,     criadoEm: '10/06/2026 08:00' },
      ]);
    }

    // Config padrão
    const cfg = this.getConfig();
    if (!cfg.escola) {
      this.setConfig({ escola: 'E.E. Professor João Silva', anoLetivo: '2026', tema: 'light' });
    }
  },

  /* ── Reset ── */
  reset() {
    Object.values(this.keys).forEach(k => localStorage.removeItem(k));
    this.seed();
  },

  /* ── Export ── */
  exportJSON() {
    const data = {};
    Object.entries(this.keys).forEach(([name, key]) => {
      data[name] = this._get(key) || this._getObj(key);
    });
    return JSON.stringify(data, null, 2);
  },
};
