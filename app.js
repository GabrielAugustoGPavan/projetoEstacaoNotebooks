/* ═══════════════════════════════════════════
   DADOS INICIAIS
═══════════════════════════════════════════ */
const ESTACOES_DEFAULT = [
  { id: 'A', nome: 'Estação A', notebooks: 15, ocupada: false, professor: '', sala: '', horario: '' },
  { id: 'B', nome: 'Estação B', notebooks: 15, ocupada: false, professor: '', sala: '', horario: '' },
  { id: 'C', nome: 'Estação C', notebooks: 15, ocupada: false, professor: '', sala: '', horario: '' },
];

/* ═══════════════════════════════════════════
   PERSISTÊNCIA (localStorage)
═══════════════════════════════════════════ */
function loadEstacoes() {
  try {
    const d = localStorage.getItem('estacoes');
    return d ? JSON.parse(d) : JSON.parse(JSON.stringify(ESTACOES_DEFAULT));
  } catch { return JSON.parse(JSON.stringify(ESTACOES_DEFAULT)); }
}

function saveEstacoes(data) {
  localStorage.setItem('estacoes', JSON.stringify(data));
}

function loadHistorico() {
  try {
    const d = localStorage.getItem('historico');
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function saveHistorico(data) {
  localStorage.setItem('historico', JSON.stringify(data));
}

let estacoes = loadEstacoes();
let historico = loadHistorico();
let estacaoSelecionada = null;

/* ═══════════════════════════════════════════
   NAVEGAÇÃO
═══════════════════════════════════════════ */
function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  estacaoSelecionada = null;

  if (screenId === 'screen-home') renderHome();
  if (screenId === 'screen-professor') renderProfessor();
  if (screenId === 'screen-gestor') renderGestor();
}

/* ═══════════════════════════════════════════
   UTILITÁRIOS
═══════════════════════════════════════════ */
function agora() {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function showMsg(id, texto, tipo) {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = 'msg msg--' + tipo;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 3500);
}

function hideAcaoProfessor() {
  document.getElementById('acao-professor').style.display = 'none';
  document.getElementById('btn-retirar').style.display = 'none';
  document.getElementById('btn-devolver').style.display = 'none';
}

/* ═══════════════════════════════════════════
   TELA INICIAL
═══════════════════════════════════════════ */
function renderHome() {
  const bar = document.getElementById('home-status-bar');
  const livres = estacoes.filter(e => !e.ocupada);
  const emUso  = estacoes.filter(e => e.ocupada);

  bar.innerHTML = estacoes.map(e => `
    <div class="status-chip">
      <div class="status-dot ${e.ocupada ? 'status-dot--emp' : 'status-dot--livre'}"></div>
      <span><strong>${e.nome}</strong> — ${e.ocupada ? 'Em uso por ' + e.professor : 'Livre'}</span>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════
   TELA DO PROFESSOR
═══════════════════════════════════════════ */
function renderProfessor() {
  estacaoSelecionada = null;
  hideAcaoProfessor();
  document.getElementById('msg-professor').style.display = 'none';

  const container = document.getElementById('estacoes-professor');
  container.innerHTML = estacoes.map(e => {
    const ocupada = e.ocupada;
    return `
      <div
        class="estacao-card ${ocupada ? 'estacao-card--ocupada' : ''}"
        id="ec-${e.id}"
        onclick="selecionarEstacao('${e.id}')"
        role="button"
        tabindex="0"
        aria-label="${e.nome}, ${ocupada ? 'em uso por ' + e.professor : 'livre'}"
        onkeydown="if(event.key==='Enter'||event.key===' ')selecionarEstacao('${e.id}')"
      >
        <span class="estacao-letra">${e.id}</span>
        <span class="estacao-notebooks">${e.notebooks} notebooks</span>
        <span class="estacao-badge ${ocupada ? 'badge--ocupada' : 'badge--livre'}">
          ${ocupada ? 'Em uso' : 'Livre'}
        </span>
        ${ocupada ? `<span class="estacao-prof">${e.professor}<br>${e.sala}</span>` : ''}
      </div>
    `;
  }).join('');
}

function selecionarEstacao(id) {
  estacaoSelecionada = id;
  const e = estacoes.find(x => x.id === id);
  if (!e) return;

  // destacar card
  document.querySelectorAll('.estacao-card').forEach(el => el.classList.remove('selected'));
  const card = document.getElementById('ec-' + id);
  if (card) card.classList.add('selected');

  const acaoBox = document.getElementById('acao-professor');
  const info    = document.getElementById('acao-info');
  const btnR    = document.getElementById('btn-retirar');
  const btnD    = document.getElementById('btn-devolver');

  acaoBox.style.display = 'flex';

  if (!e.ocupada) {
    info.innerHTML = `<strong>${e.nome}</strong> está livre e possui <strong>${e.notebooks} notebooks</strong>.`;
    btnR.style.display = 'flex';
    btnD.style.display = 'none';
  } else {
    info.innerHTML = `<strong>${e.nome}</strong> está com <strong>${e.professor}</strong> (${e.sala}) desde ${e.horario}.`;
    btnR.style.display = 'none';
    btnD.style.display = 'flex';
  }
}

function registrarRetirada() {
  const nome = document.getElementById('prof-nome').value.trim();
  const sala = document.getElementById('prof-sala').value.trim();

  if (!nome) { showMsg('msg-professor', '⚠ Informe seu nome antes de continuar.', 'error'); return; }
  if (!sala) { showMsg('msg-professor', '⚠ Informe a turma/sala antes de continuar.', 'error'); return; }
  if (!estacaoSelecionada) { showMsg('msg-professor', '⚠ Selecione uma estação.', 'error'); return; }

  const e = estacoes.find(x => x.id === estacaoSelecionada);
  if (!e || e.ocupada) { showMsg('msg-professor', '⚠ Estação indisponível.', 'error'); return; }

  const hora = agora();
  e.ocupada   = true;
  e.professor = nome;
  e.sala      = sala;
  e.horario   = hora;

  historico.unshift({
    acao: 'Retirada',
    estacao: e.nome,
    professor: nome,
    sala,
    horario: hora
  });
  if (historico.length > 200) historico = historico.slice(0, 200);

  saveEstacoes(estacoes);
  saveHistorico(historico);

  showMsg('msg-professor', `✓ Retirada da ${e.nome} registrada com sucesso!`, 'success');
  estacaoSelecionada = null;
  hideAcaoProfessor();
  renderProfessor();
}

function registrarDevolucao() {
  if (!estacaoSelecionada) { showMsg('msg-professor', '⚠ Selecione uma estação.', 'error'); return; }

  const e = estacoes.find(x => x.id === estacaoSelecionada);
  if (!e || !e.ocupada) { showMsg('msg-professor', '⚠ Estação não está em uso.', 'error'); return; }

  const hora = agora();
  historico.unshift({
    acao: 'Devolução',
    estacao: e.nome,
    professor: e.professor,
    sala: e.sala,
    horario: hora
  });
  if (historico.length > 200) historico = historico.slice(0, 200);

  e.ocupada   = false;
  e.professor = '';
  e.sala      = '';
  e.horario   = '';

  saveEstacoes(estacoes);
  saveHistorico(historico);

  showMsg('msg-professor', `✓ Devolução da ${e.nome} registrada com sucesso!`, 'success');
  estacaoSelecionada = null;
  hideAcaoProfessor();
  renderProfessor();
}

/* ═══════════════════════════════════════════
   TELA DO GESTOR
═══════════════════════════════════════════ */
function renderGestor() {
  const livres = estacoes.filter(e => !e.ocupada).length;
  const emUso  = estacoes.filter(e => e.ocupada).length;

  document.getElementById('met-total').textContent = estacoes.length;
  document.getElementById('met-livre').textContent = livres;
  document.getElementById('met-emp').textContent   = emUso;

  // Visão geral
  const lista = document.getElementById('lista-gestor');
  lista.innerHTML = estacoes.map(e => `
    <div class="gestor-row">
      <div class="gestor-info">
        <div class="gestor-nome">${e.nome}
          <span style="font-size:0.78rem;font-weight:400;color:var(--gray-500);margin-left:6px;">${e.notebooks} notebooks</span>
        </div>
        ${e.ocupada
          ? `<div class="gestor-sub">${e.professor} · ${e.sala} · desde ${e.horario}</div>`
          : `<div class="gestor-sub">Disponível</div>`
        }
      </div>
      <span class="estacao-badge ${e.ocupada ? 'badge--ocupada' : 'badge--livre'}">
        ${e.ocupada ? 'Em uso' : 'Livre'}
      </span>
    </div>
  `).join('');

  renderConfig();
}

/* ── TABS ── */
function switchTab(tab, btn) {
  ['visao-geral', 'historico', 'config'].forEach(t => {
    document.getElementById('tab-' + t).style.display = 'none';
  });
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

  document.getElementById('tab-' + tab).style.display = 'block';
  btn.classList.add('active');

  if (tab === 'historico') renderHistorico();
  if (tab === 'config') renderConfig();
}

/* ── HISTÓRICO ── */
function renderHistorico() {
  const cont = document.getElementById('lista-historico');
  if (historico.length === 0) {
    cont.innerHTML = '<p class="empty-msg">Nenhuma movimentação ainda.</p>';
    return;
  }
  cont.innerHTML = historico.map(h => `
    <div class="log-item">
      <div class="log-action log-action--${h.acao === 'Retirada' ? 'retirada' : 'devolucao'}">
        ${h.acao === 'Retirada'
          ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`
          : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`
        }
        ${h.acao} — ${h.estacao}
      </div>
      <div class="log-detail">${h.professor} · ${h.sala} · ${h.horario}</div>
    </div>
  `).join('');
}

function limparHistorico() {
  if (!confirm('Tem certeza que deseja limpar todo o histórico?')) return;
  historico = [];
  saveHistorico(historico);
  renderHistorico();
}

/* ── CONFIGURAR ── */
function renderConfig() {
  const listaConfig = document.getElementById('lista-config');
  listaConfig.innerHTML = estacoes.map(e => `
    <div class="config-item">
      <div class="config-item-header">
        <span class="config-item-titulo">${e.nome}</span>
        <span class="config-item-status ${e.ocupada ? 'badge--ocupada' : 'badge--livre'} estacao-badge">
          ${e.ocupada ? 'Em uso' : 'Livre'}
        </span>
      </div>
      <div class="config-notebooks-row">
        <label for="cfg-nb-${e.id}">Notebooks:</label>
        <input
          type="number"
          id="cfg-nb-${e.id}"
          value="${e.notebooks}"
          min="1"
          max="99"
          style="width:80px;"
        />
        <button class="config-salvar" onclick="salvarNotebooks('${e.id}')">Salvar</button>
      </div>
    </div>
  `).join('');

  // devolução forçada
  const listaForca = document.getElementById('lista-devolucao-forcada');
  const emUso = estacoes.filter(e => e.ocupada);
  if (emUso.length === 0) {
    listaForca.innerHTML = '<p class="empty-msg" style="padding:0.5rem 0;">Nenhuma estação em uso no momento.</p>';
  } else {
    listaForca.innerHTML = emUso.map(e => `
      <div class="forca-row">
        <div class="forca-info">
          <strong>${e.nome}</strong> — ${e.professor}, ${e.sala}
        </div>
        <button class="btn-forca" onclick="devolucaoForcada('${e.id}')">Devolver</button>
      </div>
    `).join('');
  }
}

function salvarNotebooks(id) {
  const input = document.getElementById('cfg-nb-' + id);
  const val = parseInt(input.value);
  if (!val || val < 1 || val > 99) {
    showMsg('msg-config', '⚠ Informe um número de notebooks entre 1 e 99.', 'error');
    return;
  }
  const e = estacoes.find(x => x.id === id);
  if (!e) return;
  e.notebooks = val;
  saveEstacoes(estacoes);
  showMsg('msg-config', `✓ ${e.nome} atualizada para ${val} notebooks.`, 'success');
  renderConfig();
  renderGestor();
}

function devolucaoForcada(id) {
  const e = estacoes.find(x => x.id === id);
  if (!e || !e.ocupada) return;
  if (!confirm(`Devolver ${e.nome} (em uso por ${e.professor})? Esta ação não pode ser desfeita.`)) return;

  const hora = agora();
  historico.unshift({
    acao: 'Devolução',
    estacao: e.nome,
    professor: e.professor + ' (forçado)',
    sala: e.sala,
    horario: hora
  });

  e.ocupada   = false;
  e.professor = '';
  e.sala      = '';
  e.horario   = '';

  saveEstacoes(estacoes);
  saveHistorico(historico);

  showMsg('msg-config', `✓ ${e.nome} liberada com sucesso.`, 'success');
  renderConfig();
  renderGestor();
}

/* ═══════════════════════════════════════════
   INICIALIZAÇÃO
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderHome();
});
