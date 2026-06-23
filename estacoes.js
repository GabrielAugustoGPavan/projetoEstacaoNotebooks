/* ═══════════════════════════════════════════
   estacoes.js
═══════════════════════════════════════════ */

function renderEstacoes() {
  const estacoes  = DB.getEstacoes();
  const notebooks = DB.getNotebooks();
  const isAdmin   = Auth.isAdmin();

  /* Botões de ação para gestor */
  document.getElementById('acoesEstacoes').innerHTML = isAdmin
    ? `<button class="btn btn--primary" onclick="abrirModalEstacao()">
        <svg viewBox="0 0 20 20" fill="currentColor" width="16"><path fill-rule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clip-rule="evenodd"/></svg>
        Nova Estação
       </button>` : '';

  const container = document.getElementById('estacoesCards');

  if (!estacoes.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28"><rect x="2" y="3" width="20" height="14" rx="2"/><path stroke-linecap="round" d="M8 21h8M12 17v4"/></svg></div>
      <p class="empty-state__title">Nenhuma estação cadastrada</p>
      <p class="empty-state__sub">Clique em "Nova Estação" para começar.</p>
    </div>`;
    return;
  }

  container.innerHTML = estacoes.map(e => {
    const nbsEstacao = notebooks.filter(n => n.estacaoId === e.id);
    const ativos     = nbsEstacao.filter(n => n.status === 'Ativo').length;
    const emManut    = nbsEstacao.filter(n => n.status === 'Manutenção').length;
    const pct        = e.capacidade > 0 ? Math.round((ativos / e.capacidade) * 100) : 0;

    return `
    <div class="estacao-card ${e.ocupada ? 'ocupada' : 'livre'}">
      <div class="estacao-card__header">
        <div class="estacao-card__letter">${e.letra}</div>
        ${statusBadge(e.ocupada ? 'Em uso' : 'Livre')}
      </div>

      <div class="estacao-card__body">
        <div class="estacao-card__info-row">
          <span class="estacao-card__info-label">Nome</span>
          <span class="estacao-card__info-value">${e.nome}</span>
        </div>
        <div class="estacao-card__info-row">
          <span class="estacao-card__info-label">Localização</span>
          <span class="estacao-card__info-value">${e.localizacao || '—'}</span>
        </div>
        <div class="estacao-card__info-row">
          <span class="estacao-card__info-label">Notebooks ativos</span>
          <span class="estacao-card__info-value">${ativos} / ${e.capacidade}</span>
        </div>
        ${emManut ? `<div class="estacao-card__info-row">
          <span class="estacao-card__info-label">Em manutenção</span>
          <span class="estacao-card__info-value" style="color:var(--warning-600)">${emManut}</span>
        </div>` : ''}
        ${e.ocupada ? `
        <div class="estacao-card__info-row">
          <span class="estacao-card__info-label">Professor</span>
          <span class="estacao-card__info-value">${e.professor}</span>
        </div>
        <div class="estacao-card__info-row">
          <span class="estacao-card__info-label">Turma</span>
          <span class="estacao-card__info-value">${e.sala}</span>
        </div>
        <div class="estacao-card__info-row">
          <span class="estacao-card__info-label">Desde</span>
          <span class="estacao-card__info-value">${e.horario}</span>
        </div>` : ''}

        <div class="estacao-progress">
          <div class="estacao-progress__label">
            <span>Capacidade utilizada</span><span>${pct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar__fill" style="width:${pct}%;background:${pct > 80 ? 'var(--warning-500)' : 'var(--brand-500)'}"></div>
          </div>
        </div>
      </div>

      <div class="estacao-card__footer">
        ${!e.ocupada
          ? `<button class="btn btn--primary btn--sm" onclick="abrirMovimentacaoEstacao('${e.id}','Retirada')">Registrar Retirada</button>`
          : `<button class="btn btn--success btn--sm" onclick="abrirMovimentacaoEstacao('${e.id}','Devolução')">Registrar Devolução</button>`
        }
        ${isAdmin ? `
          <button class="btn btn--secondary btn--sm" onclick="abrirModalEstacao('${e.id}')">Editar</button>
          ${e.ocupada ? `<button class="btn btn--ghost btn--sm" onclick="forceDevolucao('${e.id}')">Devolver forçado</button>` : ''}
          <button class="btn btn--ghost btn--sm" style="color:var(--danger-600)" onclick="excluirEstacao('${e.id}')">Excluir</button>
        ` : ''}
      </div>
    </div>`;
  }).join('');
}

function abrirModalEstacao(id = null) {
  document.getElementById('estacaoId').value = '';
  document.getElementById('estacaoNome').value = '';
  document.getElementById('estacaoCapacidade').value = '';
  document.getElementById('estacaoLocal').value = '';
  document.getElementById('estacaoDesc').value = '';
  document.getElementById('titleEstacao').textContent = id ? 'Editar Estação' : 'Nova Estação';

  if (id) {
    const e = DB.getEstacoes().find(x => x.id === id);
    if (!e) return;
    document.getElementById('estacaoId').value = e.id;
    document.getElementById('estacaoNome').value = e.nome;
    document.getElementById('estacaoCapacidade').value = e.capacidade;
    document.getElementById('estacaoLocal').value = e.localizacao;
    document.getElementById('estacaoDesc').value = e.descricao;
  }
  openModal('modal-estacao');
}

function salvarEstacao() {
  const id   = document.getElementById('estacaoId').value;
  const nome = document.getElementById('estacaoNome').value.trim();
  const cap  = parseInt(document.getElementById('estacaoCapacidade').value);
  const loc  = document.getElementById('estacaoLocal').value.trim();
  const desc = document.getElementById('estacaoDesc').value.trim();

  if (!nome) { toast('Campo obrigatório', 'Informe o nome da estação.', 'error'); return; }
  if (!cap || cap < 1) { toast('Campo obrigatório', 'Informe a capacidade.', 'error'); return; }

  const letra = nome.match(/[A-Z]/)?.[0] || nome.charAt(0).toUpperCase();
  const estacoes = DB.getEstacoes();

  if (id) {
    const idx = estacoes.findIndex(e => e.id === id);
    if (idx > -1) { estacoes[idx] = { ...estacoes[idx], nome, letra, capacidade: cap, localizacao: loc, descricao: desc }; }
    toast('Estação atualizada', nome, 'success');
  } else {
    estacoes.push({ id: DB.uid(), nome, letra, capacidade: cap, ocupada: false, professor: '', sala: '', horario: '', localizacao: loc, descricao: desc });
    toast('Estação criada', nome, 'success');
  }

  DB.setEstacoes(estacoes);
  closeModal('modal-estacao');
  renderEstacoes();
}

function excluirEstacao(id) {
  const e = DB.getEstacoes().find(x => x.id === id);
  if (!e) return;
  if (e.ocupada) { toast('Não permitido', 'Devolva o carrinho antes de excluir.', 'warning'); return; }
  confirmDelete(`Excluir "${e.nome}"? Esta ação não pode ser desfeita.`, () => {
    DB.setEstacoes(DB.getEstacoes().filter(x => x.id !== id));
    toast('Estação excluída', '', 'info');
    renderEstacoes();
  });
}

function forceDevolucao(id) {
  const estacoes = DB.getEstacoes();
  const e = estacoes.find(x => x.id === id);
  if (!e || !e.ocupada) return;
  if (!confirm(`Forçar devolução de ${e.nome} (em uso por ${e.professor})?`)) return;

  const movs = DB.getMovimentacoes();
  movs.push({ id: DB.uid(), tipo: 'Devolução', estacaoId: id, professorId: '', turmaId: '', obs: 'Devolução forçada pelo gestor', horario: DB.agora() });
  DB.setMovimentacoes(movs);

  e.ocupada = false; e.professor = ''; e.sala = ''; e.horario = '';
  DB.setEstacoes(estacoes);
  toast('Devolução forçada registrada', e.nome, 'success');
  renderEstacoes();
}

function abrirMovimentacaoEstacao(estacaoId, tipo) {
  document.getElementById('movId').value = '';
  document.getElementById('movTipo').value = tipo;
  document.getElementById('movObs').value = '';

  const estacoes = DB.getEstacoes();
  const professores = DB.getProfessores().filter(p => p.status === 'Ativo');
  const turmas = DB.getTurmas();

  populateSelect('movEstacao', estacoes, 'id', e => e.nome);
  document.getElementById('movEstacao').value = estacaoId;
  populateSelect('movProfessor', professores, 'id', p => p.nome);
  populateSelect('movTurma', turmas, 'id', t => `${t.nome} — ${t.periodo}`);

  openModal('modal-movimentacao');
}
