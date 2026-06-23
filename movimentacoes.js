/* ═══════════════════════════════════════════
   movimentacoes.js
═══════════════════════════════════════════ */

function renderMovimentacoes() {
  const movs       = DB.getMovimentacoes();
  const estacoes   = DB.getEstacoes();
  const professores= DB.getProfessores();
  const turmas     = DB.getTurmas();

  /* Popular filtros de estação */
  const selEst = document.getElementById('filterMovEstacao');
  if (selEst && selEst.options.length <= 1) {
    estacoes.forEach(e => { const o = new Option(e.nome, e.id); selEst.add(o); });
  }

  const search    = (document.getElementById('searchMovimentacoes')?.value || '').toLowerCase();
  const filtTipo  = document.getElementById('filterMovTipo')?.value || '';
  const filtEst   = document.getElementById('filterMovEstacao')?.value || '';

  const filtered = [...movs].reverse().filter(m => {
    const pf = professores.find(p => p.id === m.professorId);
    const es = estacoes.find(e => e.id === m.estacaoId);
    const txt = `${pf?.nome} ${es?.nome} ${m.obs} ${m.horario}`.toLowerCase();
    return (!search || txt.includes(search))
      && (!filtTipo || m.tipo === filtTipo)
      && (!filtEst  || m.estacaoId === filtEst);
  });

  document.getElementById('tbodyMovimentacoes').innerHTML = filtered.length
    ? filtered.map(m => {
        const pf = professores.find(p => p.id === m.professorId);
        const es = estacoes.find(e => e.id === m.estacaoId);
        const tm = turmas.find(t => t.id === m.turmaId);
        return `<tr>
          <td style="white-space:nowrap;color:var(--text-muted);font-size:var(--text-xs)">${m.horario}</td>
          <td>${chipMovimentacao(m.tipo)}</td>
          <td><div class="cell-user"><div class="avatar">${avatarLetra(pf?.nome)}</div><div><div class="cell-user__name">${pf?.nome || '—'}</div><div class="cell-user__sub">${pf?.disciplina || ''}</div></div></div></td>
          <td>${tm?.nome || '—'}</td>
          <td><strong>${es?.nome || '—'}</strong></td>
          <td style="color:var(--text-muted);font-size:var(--text-xs);max-width:140px">${m.obs || '—'}</td>
          <td><div class="table-actions"><button class="btn-icon" title="Excluir" onclick="excluirMovimentacao('${m.id}')"><svg viewBox="0 0 20 20" fill="currentColor" width="15" style="color:var(--danger-500)"><path fill-rule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0-2 0v.5H6V6a1 1 0 0 0-1-1H4V4h3.382l.723-1.447A1 1 0 0 0 9 2h2z" clip-rule="evenodd"/></svg></button></div></td>
        </tr>`;
      }).join('')
    : emptyRow(7, 'Nenhuma movimentação encontrada');
}

function salvarMovimentacao() {
  const tipo       = document.getElementById('movTipo').value;
  const estacaoId  = document.getElementById('movEstacao').value;
  const professorId= document.getElementById('movProfessor').value;
  const turmaId    = document.getElementById('movTurma').value;
  const obs        = document.getElementById('movObs').value.trim();

  if (!estacaoId)   { toast('Campo obrigatório', 'Selecione a estação.', 'error'); return; }
  if (!professorId) { toast('Campo obrigatório', 'Selecione o professor.', 'error'); return; }
  if (!turmaId)     { toast('Campo obrigatório', 'Selecione a turma.', 'error'); return; }

  const estacoes  = DB.getEstacoes();
  const professores = DB.getProfessores();
  const turmas    = DB.getTurmas();
  const est = estacoes.find(e => e.id === estacaoId);
  const prof = professores.find(p => p.id === professorId);
  const turma = turmas.find(t => t.id === turmaId);

  if (tipo === 'Retirada' && est?.ocupada) {
    toast('Estação ocupada', `${est.nome} já está em uso por ${est.professor}.`, 'error'); return;
  }
  if (tipo === 'Devolução' && !est?.ocupada) {
    toast('Estação livre', `${est.nome} não está em uso.`, 'warning'); return;
  }

  /* Registrar movimentação */
  const movs = DB.getMovimentacoes();
  movs.push({ id: DB.uid(), tipo, estacaoId, professorId, turmaId, obs, horario: DB.agora() });
  DB.setMovimentacoes(movs);

  /* Atualizar estado da estação */
  const idx = estacoes.findIndex(e => e.id === estacaoId);
  if (idx > -1) {
    if (tipo === 'Retirada') {
      estacoes[idx] = { ...estacoes[idx], ocupada: true, professor: prof.nome, sala: turma.nome, horario: DB.agora() };
    } else {
      estacoes[idx] = { ...estacoes[idx], ocupada: false, professor: '', sala: '', horario: '' };
    }
    DB.setEstacoes(estacoes);
  }

  toast(`${tipo} registrada`, `${est?.nome} — ${prof?.nome}`, 'success');
  closeModal('modal-movimentacao');
  renderMovimentacoes();
  if (document.getElementById('screen-dashboard').classList.contains('active-screen')) renderDashboard();
  if (document.getElementById('screen-estacoes').classList.contains('active-screen')) renderEstacoes();
}

function excluirMovimentacao(id) {
  confirmDelete('Excluir esta movimentação do histórico?', () => {
    DB.setMovimentacoes(DB.getMovimentacoes().filter(m => m.id !== id));
    toast('Movimentação excluída', '', 'info');
    renderMovimentacoes();
  });
}

/* Popular selects do modal de movimentação */
document.getElementById('modal-movimentacao').addEventListener('click', function(e) {
  if (e.target.closest('.modal-overlay') === this && !e.target.closest('.modal')) {
    closeModal('modal-movimentacao');
  }
});

function _populateMovimentacaoSelects() {
  populateSelect('movEstacao', DB.getEstacoes(), 'id', e => `${e.nome} ${e.ocupada ? '(Em uso)' : '(Livre)'}`);
  populateSelect('movProfessor', DB.getProfessores().filter(p=>p.status==='Ativo'), 'id', p => p.nome);
  populateSelect('movTurma', DB.getTurmas(), 'id', t => `${t.nome} — ${t.periodo}`);
}

/* Abrir modal de movimentação limpo */
const _origOpenMovimentacao = window.openModal;
document.querySelector('[onclick="openModal(\'modal-movimentacao\')"]')?.addEventListener('click', () => {
  document.getElementById('movId').value = '';
  document.getElementById('movObs').value = '';
  _populateMovimentacaoSelects();
});

/* Override do botão no header */
document.querySelectorAll('[onclick="openModal(\'modal-movimentacao\')"]').forEach(btn => {
  btn.onclick = () => {
    document.getElementById('movId').value = '';
    document.getElementById('movTipo').value = 'Retirada';
    document.getElementById('movObs').value = '';
    _populateMovimentacaoSelects();
    openModal('modal-movimentacao');
  };
});


/* ═══════════════════════════════════════════
   notebooks.js
═══════════════════════════════════════════ */

function renderNotebooks() {
  const notebooks  = DB.getNotebooks();
  const estacoes   = DB.getEstacoes();
  const movs       = DB.getMovimentacoes();

  const selEst = document.getElementById('filterNbEstacao');
  if (selEst && selEst.options.length <= 1) {
    estacoes.forEach(e => { const o = new Option(e.nome, e.id); selEst.add(o); });
  }

  const search    = (document.getElementById('searchNotebooks')?.value || '').toLowerCase();
  const filtStatus= document.getElementById('filterNbStatus')?.value || '';
  const filtEst   = document.getElementById('filterNbEstacao')?.value || '';

  const filtered = notebooks.filter(n => {
    const txt = `${n.patrimonio} ${n.modelo} ${n.status} ${n.condicao}`.toLowerCase();
    return (!search || txt.includes(search))
      && (!filtStatus || n.status === filtStatus)
      && (!filtEst    || n.estacaoId === filtEst);
  });

  document.getElementById('tbodyNotebooks').innerHTML = filtered.length
    ? filtered.map(n => {
        const es = estacoes.find(e => e.id === n.estacaoId);
        const lastMov = [...movs].reverse().find(m => m.estacaoId === n.estacaoId);
        return `<tr>
          <td><strong style="font-family:var(--font-mono);font-size:var(--text-xs)">${n.patrimonio}</strong></td>
          <td>${n.modelo || '—'}</td>
          <td>${es?.nome || '—'}</td>
          <td>${statusBadge(n.status)}</td>
          <td><span class="condition condition--${conditionClass(n.condicao)}">${n.condicao}</span></td>
          <td style="color:var(--text-muted);font-size:var(--text-xs)">${n.ultimaMov || lastMov?.horario || '—'}</td>
          <td><div class="table-actions">
            <button class="btn btn--ghost btn--sm" onclick="abrirModalNotebook('${n.id}')">Editar</button>
            <button class="btn-icon" title="Excluir" onclick="excluirNotebook('${n.id}')"><svg viewBox="0 0 20 20" fill="currentColor" width="15" style="color:var(--danger-500)"><path fill-rule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0-2 0v.5H6V6a1 1 0 0 0-1-1H4V4h3.382l.723-1.447A1 1 0 0 0 9 2h2z" clip-rule="evenodd"/></svg></button>
          </div></td>
        </tr>`;
      }).join('')
    : emptyRow(7, 'Nenhum notebook encontrado');
}

function abrirModalNotebook(id = null) {
  const estacoes = DB.getEstacoes();
  populateSelect('nbEstacao', estacoes, 'id', e => e.nome);
  ['notebookId','nbPatrimonio','nbModelo','nbAno','nbObs'].forEach(i => {
    const el = document.getElementById(i); if (el) el.value = '';
  });
  document.getElementById('nbStatus').value = 'Ativo';
  document.getElementById('nbCondicao').value = 'Bom';
  document.getElementById('titleNotebook').textContent = id ? 'Editar Notebook' : 'Novo Notebook';

  if (id) {
    const n = DB.getNotebooks().find(x => x.id === id);
    if (!n) return;
    document.getElementById('notebookId').value = n.id;
    document.getElementById('nbPatrimonio').value = n.patrimonio;
    document.getElementById('nbEstacao').value = n.estacaoId;
    document.getElementById('nbModelo').value = n.modelo;
    document.getElementById('nbAno').value = n.ano;
    document.getElementById('nbStatus').value = n.status;
    document.getElementById('nbCondicao').value = n.condicao;
    document.getElementById('nbObs').value = n.obs;
  }
  openModal('modal-notebook');
}

function salvarNotebook() {
  const id    = document.getElementById('notebookId').value;
  const pat   = document.getElementById('nbPatrimonio').value.trim();
  const estId = document.getElementById('nbEstacao').value;
  const modelo= document.getElementById('nbModelo').value.trim();
  const ano   = document.getElementById('nbAno').value;
  const status= document.getElementById('nbStatus').value;
  const cond  = document.getElementById('nbCondicao').value;
  const obs   = document.getElementById('nbObs').value.trim();

  if (!pat)   { toast('Campo obrigatório', 'Informe o número de patrimônio.', 'error'); return; }
  if (!estId) { toast('Campo obrigatório', 'Selecione a estação.', 'error'); return; }

  const notebooks = DB.getNotebooks();

  if (id) {
    const idx = notebooks.findIndex(n => n.id === id);
    if (idx > -1) notebooks[idx] = { ...notebooks[idx], patrimonio: pat, estacaoId: estId, modelo, ano, status, condicao: cond, obs };
    toast('Notebook atualizado', pat, 'success');
  } else {
    notebooks.push({ id: DB.uid(), patrimonio: pat, estacaoId: estId, modelo, ano, status, condicao: cond, obs, ultimaMov: '', criadoEm: DB.agora() });
    toast('Notebook adicionado', pat, 'success');
  }

  DB.setNotebooks(notebooks);
  closeModal('modal-notebook');
  renderNotebooks();
}

function excluirNotebook(id) {
  const n = DB.getNotebooks().find(x => x.id === id);
  confirmDelete(`Excluir notebook ${n?.patrimonio}?`, () => {
    DB.setNotebooks(DB.getNotebooks().filter(x => x.id !== id));
    toast('Notebook excluído', '', 'info');
    renderNotebooks();
  });
}


/* ═══════════════════════════════════════════
   professores.js
═══════════════════════════════════════════ */

function renderProfessores() {
  const professores = DB.getProfessores();
  const movs = DB.getMovimentacoes();
  const search = (document.getElementById('searchProfessores')?.value || '').toLowerCase();

  const filtered = professores.filter(p => {
    const txt = `${p.nome} ${p.disciplina} ${p.email}`.toLowerCase();
    return !search || txt.includes(search);
  });

  document.getElementById('tbodyProfessores').innerHTML = filtered.length
    ? filtered.map(p => {
        const total = movs.filter(m => m.professorId === p.id).length;
        return `<tr>
          <td><div class="cell-user"><div class="avatar">${avatarLetra(p.nome)}</div><div class="cell-user__name">${p.nome}</div></div></td>
          <td>${p.disciplina || '—'}</td>
          <td style="font-size:var(--text-xs);color:var(--text-muted)">${p.email || '—'}<br>${p.telefone || ''}</td>
          <td><span class="badge badge--brand">${total}</span></td>
          <td>${statusBadge(p.status)}</td>
          <td><div class="table-actions">
            <button class="btn btn--ghost btn--sm" onclick="abrirModalProfessor('${p.id}')">Editar</button>
            <button class="btn-icon" onclick="excluirProfessor('${p.id}')"><svg viewBox="0 0 20 20" fill="currentColor" width="15" style="color:var(--danger-500)"><path fill-rule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0-2 0v.5H6V6a1 1 0 0 0-1-1H4V4h3.382l.723-1.447A1 1 0 0 0 9 2h2z" clip-rule="evenodd"/></svg></button>
          </div></td>
        </tr>`;
      }).join('')
    : emptyRow(6, 'Nenhum professor encontrado');
}

function abrirModalProfessor(id = null) {
  ['professorId','profNome','profDisciplina','profEmail','profTelefone'].forEach(i => {
    const el = document.getElementById(i); if (el) el.value = '';
  });
  document.getElementById('profStatus').value = 'Ativo';
  document.getElementById('titleProfessor').textContent = id ? 'Editar Professor' : 'Novo Professor';

  if (id) {
    const p = DB.getProfessores().find(x => x.id === id);
    if (!p) return;
    document.getElementById('professorId').value = p.id;
    document.getElementById('profNome').value = p.nome;
    document.getElementById('profDisciplina').value = p.disciplina;
    document.getElementById('profEmail').value = p.email;
    document.getElementById('profTelefone').value = p.telefone;
    document.getElementById('profStatus').value = p.status;
  }
  openModal('modal-professor');
}

function salvarProfessor() {
  const id   = document.getElementById('professorId').value;
  const nome = document.getElementById('profNome').value.trim();
  if (!nome) { toast('Campo obrigatório', 'Informe o nome do professor.', 'error'); return; }

  const disc = document.getElementById('profDisciplina').value.trim();
  const email= document.getElementById('profEmail').value.trim();
  const tel  = document.getElementById('profTelefone').value.trim();
  const status= document.getElementById('profStatus').value;
  const list = DB.getProfessores();

  if (id) {
    const idx = list.findIndex(p => p.id === id);
    if (idx > -1) list[idx] = { ...list[idx], nome, disciplina: disc, email, telefone: tel, status };
    toast('Professor atualizado', nome, 'success');
  } else {
    list.push({ id: DB.uid(), nome, disciplina: disc, email, telefone: tel, status, criadoEm: DB.agora() });
    toast('Professor cadastrado', nome, 'success');
  }

  DB.setProfessores(list);
  closeModal('modal-professor');
  renderProfessores();
}

function excluirProfessor(id) {
  const p = DB.getProfessores().find(x => x.id === id);
  confirmDelete(`Excluir professor "${p?.nome}"?`, () => {
    DB.setProfessores(DB.getProfessores().filter(x => x.id !== id));
    toast('Professor excluído', '', 'info');
    renderProfessores();
  });
}


/* ═══════════════════════════════════════════
   turmas.js
═══════════════════════════════════════════ */

function renderTurmas() {
  const turmas = DB.getTurmas();
  const movs   = DB.getMovimentacoes();
  const mesAtual = new Date().toLocaleString('pt-BR', { month: '2-digit', year: 'numeric' });

  document.getElementById('tbodyTurmas').innerHTML = turmas.length
    ? turmas.map(t => {
        const usos = movs.filter(m => m.turmaId === t.id && m.tipo === 'Retirada' && m.horario.includes(mesAtual.replace('/','/').split('/').reverse().join('/'))).length;
        return `<tr>
          <td><strong>${t.nome}</strong></td>
          <td>${t.ano}</td>
          <td>${statusBadge(t.periodo === 'Manhã' ? 'Ativo' : t.periodo === 'Tarde' ? 'Manutenção' : 'Inativo').replace('badge--success','badge--brand').replace('badge--warning','badge--info').replace('badge--danger','badge--neutral')} ${t.periodo}</td>
          <td>${t.alunos || '—'}</td>
          <td><span class="badge badge--brand">${movs.filter(m=>m.turmaId===t.id&&m.tipo==='Retirada').length}</span></td>
          <td><div class="table-actions">
            <button class="btn btn--ghost btn--sm" onclick="abrirModalTurma('${t.id}')">Editar</button>
            <button class="btn-icon" onclick="excluirTurma('${t.id}')"><svg viewBox="0 0 20 20" fill="currentColor" width="15" style="color:var(--danger-500)"><path fill-rule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0-2 0v.5H6V6a1 1 0 0 0-1-1H4V4h3.382l.723-1.447A1 1 0 0 0 9 2h2z" clip-rule="evenodd"/></svg></button>
          </div></td>
        </tr>`;
      }).join('')
    : emptyRow(6, 'Nenhuma turma cadastrada');
}

function abrirModalTurma(id = null) {
  ['turmaId','turmaNome','turmaAno','turmaAlunos'].forEach(i => {
    const el = document.getElementById(i); if (el) el.value = '';
  });
  document.getElementById('turmaPeriodo').value = 'Manhã';
  document.getElementById('titleTurma').textContent = id ? 'Editar Turma' : 'Nova Turma';

  if (id) {
    const t = DB.getTurmas().find(x => x.id === id);
    if (!t) return;
    document.getElementById('turmaId').value = t.id;
    document.getElementById('turmaNome').value = t.nome;
    document.getElementById('turmaAno').value = t.ano;
    document.getElementById('turmaPeriodo').value = t.periodo;
    document.getElementById('turmaAlunos').value = t.alunos;
  }
  openModal('modal-turma');
}

function salvarTurma() {
  const id    = document.getElementById('turmaId').value;
  const nome  = document.getElementById('turmaNome').value.trim();
  const ano   = document.getElementById('turmaAno').value.trim();
  if (!nome) { toast('Campo obrigatório', 'Informe o nome da turma.', 'error'); return; }

  const periodo = document.getElementById('turmaPeriodo').value;
  const alunos  = parseInt(document.getElementById('turmaAlunos').value) || 0;
  const list = DB.getTurmas();

  if (id) {
    const idx = list.findIndex(t => t.id === id);
    if (idx > -1) list[idx] = { ...list[idx], nome, ano, periodo, alunos };
    toast('Turma atualizada', nome, 'success');
  } else {
    list.push({ id: DB.uid(), nome, ano, periodo, alunos, criadoEm: DB.agora() });
    toast('Turma criada', nome, 'success');
  }

  DB.setTurmas(list);
  closeModal('modal-turma');
  renderTurmas();
}

function excluirTurma(id) {
  const t = DB.getTurmas().find(x => x.id === id);
  confirmDelete(`Excluir turma "${t?.nome}"?`, () => {
    DB.setTurmas(DB.getTurmas().filter(x => x.id !== id));
    toast('Turma excluída', '', 'info');
    renderTurmas();
  });
}


/* ═══════════════════════════════════════════
   manutencoes.js
═══════════════════════════════════════════ */

function renderManutencoes() {
  const manut     = DB.getManutencoes();
  const notebooks = DB.getNotebooks();

  const search    = (document.getElementById('searchManutencoes')?.value || '').toLowerCase();
  const filtStat  = document.getElementById('filterManutStatus')?.value || '';

  const filtered = [...manut].reverse().filter(m => {
    const nb = notebooks.find(n => n.id === m.notebookId);
    const txt = `${nb?.patrimonio} ${nb?.modelo} ${m.desc} ${m.tipo}`.toLowerCase();
    return (!search || txt.includes(search)) && (!filtStat || m.status === filtStat);
  });

  document.getElementById('tbodyManutencoes').innerHTML = filtered.length
    ? filtered.map(m => {
        const nb = notebooks.find(n => n.id === m.notebookId);
        return `<tr>
          <td style="white-space:nowrap;color:var(--text-muted);font-size:var(--text-xs)">${m.criadoEm}</td>
          <td><strong style="font-family:var(--font-mono);font-size:var(--text-xs)">${nb?.patrimonio || '—'}</strong><div style="font-size:var(--text-xs);color:var(--text-muted)">${nb?.modelo || ''}</div></td>
          <td>${statusBadge(m.tipo)}</td>
          <td style="max-width:180px;font-size:var(--text-sm)">${m.desc}</td>
          <td>${statusBadge(m.status)}</td>
          <td style="font-size:var(--text-sm)">${m.custo > 0 ? `R$ ${Number(m.custo).toFixed(2)}` : '—'}</td>
          <td><div class="table-actions">
            <button class="btn btn--ghost btn--sm" onclick="abrirModalManutencao('${m.id}')">Editar</button>
            <button class="btn-icon" onclick="excluirManutencao('${m.id}')"><svg viewBox="0 0 20 20" fill="currentColor" width="15" style="color:var(--danger-500)"><path fill-rule="evenodd" d="M9 2a1 1 0 0 0-.894.553L7.382 4H4a1 1 0 0 0 0 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a1 1 0 1 0-2 0v.5H6V6a1 1 0 0 0-1-1H4V4h3.382l.723-1.447A1 1 0 0 0 9 2h2z" clip-rule="evenodd"/></svg></button>
          </div></td>
        </tr>`;
      }).join('')
    : emptyRow(7, 'Nenhum chamado encontrado');
}

function abrirModalManutencao(id = null) {
  const notebooks = DB.getNotebooks();
  populateSelect('manutNotebook', notebooks, 'id', n => `${n.patrimonio} — ${n.modelo || n.estacaoId}`);
  ['manutId','manutDesc','manutCusto'].forEach(i => { const el=document.getElementById(i); if(el) el.value=''; });
  document.getElementById('manutTipo').value = 'Corretiva';
  document.getElementById('manutStatus').value = 'Aberto';
  document.getElementById('titleManutencao').textContent = id ? 'Editar Chamado' : 'Abrir Chamado';

  if (id) {
    const m = DB.getManutencoes().find(x => x.id === id);
    if (!m) return;
    document.getElementById('manutId').value = m.id;
    document.getElementById('manutNotebook').value = m.notebookId;
    document.getElementById('manutTipo').value = m.tipo;
    document.getElementById('manutDesc').value = m.desc;
    document.getElementById('manutStatus').value = m.status;
    document.getElementById('manutCusto').value = m.custo;
  }
  openModal('modal-manutencao');
}

function salvarManutencao() {
  const id    = document.getElementById('manutId').value;
  const nbId  = document.getElementById('manutNotebook').value;
  const tipo  = document.getElementById('manutTipo').value;
  const desc  = document.getElementById('manutDesc').value.trim();
  const status= document.getElementById('manutStatus').value;
  const custo = parseFloat(document.getElementById('manutCusto').value) || 0;

  if (!nbId) { toast('Campo obrigatório', 'Selecione o notebook.', 'error'); return; }
  if (!desc) { toast('Campo obrigatório', 'Descreva o problema.', 'error'); return; }

  const list = DB.getManutencoes();

  if (id) {
    const idx = list.findIndex(m => m.id === id);
    if (idx > -1) list[idx] = { ...list[idx], notebookId: nbId, tipo, desc, status, custo };
    toast('Chamado atualizado', '', 'success');
  } else {
    list.push({ id: DB.uid(), notebookId: nbId, tipo, desc, status, custo, criadoEm: DB.agora() });
    /* Atualizar status do notebook */
    const notebooks = DB.getNotebooks();
    const idx = notebooks.findIndex(n => n.id === nbId);
    if (idx > -1) { notebooks[idx].status = 'Manutenção'; DB.setNotebooks(notebooks); }
    toast('Chamado aberto', '', 'success');
  }

  /* Se concluído, libertar notebook */
  if (status === 'Concluído') {
    const notebooks = DB.getNotebooks();
    const idx = notebooks.findIndex(n => n.id === nbId);
    if (idx > -1) { notebooks[idx].status = 'Ativo'; DB.setNotebooks(notebooks); }
  }

  DB.setManutencoes(list);
  closeModal('modal-manutencao');
  renderManutencoes();
}

function excluirManutencao(id) {
  confirmDelete('Excluir este chamado de manutenção?', () => {
    DB.setManutencoes(DB.getManutencoes().filter(m => m.id !== id));
    toast('Chamado excluído', '', 'info');
    renderManutencoes();
  });
}


/* ═══════════════════════════════════════════
   relatorios.js
═══════════════════════════════════════════ */

function renderRelatorios() {
  const estacoes   = DB.getEstacoes();
  const notebooks  = DB.getNotebooks();
  const professores= DB.getProfessores();
  const turmas     = DB.getTurmas();
  const movs       = DB.getMovimentacoes();
  const manut      = DB.getManutencoes();

  /* Uso por estação */
  const usoEstacao = estacoes.map(e => ({
    nome: e.nome,
    retiradas: movs.filter(m => m.estacaoId === e.id && m.tipo === 'Retirada').length
  })).sort((a,b) => b.retiradas - a.retiradas);

  /* Uso por professor */
  const usoProf = professores.map(p => ({
    nome: p.nome,
    total: movs.filter(m => m.professorId === p.id && m.tipo === 'Retirada').length
  })).sort((a,b) => b.total - a.total).slice(0,5);

  /* Uso por turma */
  const usoTurma = turmas.map(t => ({
    nome: t.nome,
    total: movs.filter(m => m.turmaId === t.id && m.tipo === 'Retirada').length
  })).sort((a,b) => b.total - a.total).slice(0,5);

  const custoTotal = manut.reduce((acc, m) => acc + (Number(m.custo) || 0), 0);
  const ativos  = notebooks.filter(n => n.status === 'Ativo').length;
  const emManut = notebooks.filter(n => n.status === 'Manutenção').length;

  document.getElementById('relatoriosGrid').innerHTML = `
    <div class="relatorio-card">
      <h3 class="relatorio-card__title">Resumo geral</h3>
      ${[
        ['Total de estações', estacoes.length],
        ['Total de notebooks', notebooks.length],
        ['Notebooks ativos', ativos],
        ['Em manutenção', emManut],
        ['Professores cadastrados', professores.length],
        ['Turmas cadastradas', turmas.length],
        ['Total de movimentações', movs.length],
        ['Total de chamados', manut.length],
        ['Custo total de manutenções', `R$ ${custoTotal.toFixed(2)}`],
      ].map(([l,v]) => `<div class="relatorio-stat"><span class="relatorio-stat__label">${l}</span><span class="relatorio-stat__value">${v}</span></div>`).join('')}
    </div>

    <div class="relatorio-card">
      <h3 class="relatorio-card__title">Uso por estação</h3>
      ${usoEstacao.length ? usoEstacao.map(e => `
        <div class="relatorio-stat">
          <span class="relatorio-stat__label">${e.nome}</span>
          <span class="relatorio-stat__value">${e.retiradas} retiradas</span>
        </div>
      `).join('') : '<p style="color:var(--text-muted);font-size:var(--text-sm)">Sem dados.</p>'}
    </div>

    <div class="relatorio-card">
      <h3 class="relatorio-card__title">Top 5 professores</h3>
      ${usoProf.length ? usoProf.map((p,i) => `
        <div class="relatorio-stat">
          <span class="relatorio-stat__label">${i+1}. ${p.nome}</span>
          <span class="relatorio-stat__value">${p.total} uso(s)</span>
        </div>
      `).join('') : '<p style="color:var(--text-muted);font-size:var(--text-sm)">Sem dados.</p>'}
    </div>

    <div class="relatorio-card">
      <h3 class="relatorio-card__title">Top 5 turmas</h3>
      ${usoTurma.length ? usoTurma.map((t,i) => `
        <div class="relatorio-stat">
          <span class="relatorio-stat__label">${i+1}. ${t.nome}</span>
          <span class="relatorio-stat__value">${t.total} uso(s)</span>
        </div>
      `).join('') : '<p style="color:var(--text-muted);font-size:var(--text-sm)">Sem dados.</p>'}
    </div>

    <div class="relatorio-card">
      <h3 class="relatorio-card__title">Manutenções por status</h3>
      ${['Aberto','Em andamento','Concluído'].map(s => `
        <div class="relatorio-stat">
          <span class="relatorio-stat__label">${s}</span>
          <span class="relatorio-stat__value">${manut.filter(m=>m.status===s).length}</span>
        </div>
      `).join('')}
    </div>

    <div class="relatorio-card">
      <h3 class="relatorio-card__title">Condição dos notebooks</h3>
      ${['Ótimo','Bom','Regular','Ruim'].map(c => `
        <div class="relatorio-stat">
          <span class="relatorio-stat__label"><span class="condition condition--${conditionClass(c)}">${c}</span></span>
          <span class="relatorio-stat__value">${notebooks.filter(n=>n.condicao===c).length}</span>
        </div>
      `).join('')}
    </div>
  `;
}


/* ═══════════════════════════════════════════
   configuracoes.js
═══════════════════════════════════════════ */

function renderConfiguracoes() {
  const cfg = DB.getConfig();
  document.getElementById('cfgEscola').value = cfg.escola || '';
  document.getElementById('cfgAnoLetivo').value = cfg.anoLetivo || '';
  const tema = cfg.tema || 'light';
  document.getElementById('themeLight').classList.toggle('active', tema === 'light');
  document.getElementById('themeDark').classList.toggle('active', tema === 'dark');
  document.body.setAttribute('data-theme', tema);
}

function salvarConfig() {
  const cfg = DB.getConfig();
  cfg.escola = document.getElementById('cfgEscola').value.trim();
  cfg.anoLetivo = document.getElementById('cfgAnoLetivo').value.trim();
  DB.setConfig(cfg);
  toast('Configurações salvas', '', 'success');
}

function exportarDados() {
  const json = DB.exportJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `edutrack-backup-${Date.now()}.json`;
  a.click(); URL.revokeObjectURL(url);
  toast('Exportação concluída', 'Arquivo JSON baixado.', 'success');
}

function resetarDados() {
  if (!confirm('Resetar TODOS os dados? Esta ação não pode ser desfeita.')) return;
  if (!confirm('Confirme novamente: apagar tudo e restaurar dados de exemplo?')) return;
  DB.reset();
  toast('Dados resetados', 'Dados de exemplo restaurados.', 'info');
  renderConfiguracoes();
}
