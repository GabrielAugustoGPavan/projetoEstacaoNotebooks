/* ═══════════════════════════════════════════
   dashboard.js
═══════════════════════════════════════════ */

function renderDashboard() {
  const estacoes      = DB.getEstacoes();
  const notebooks     = DB.getNotebooks();
  const professores   = DB.getProfessores();
  const movimentacoes = DB.getMovimentacoes();
  const manutencoes   = DB.getManutencoes();

  const livres    = estacoes.filter(e => !e.ocupada).length;
  const emUso     = estacoes.filter(e => e.ocupada).length;
  const emManut   = notebooks.filter(n => n.status === 'Manutenção').length;
  const movHoje   = movimentacoes.filter(m => m.horario.startsWith(DB.dataHoje())).length;

  /* ── Saudação ── */
  const hora = new Date().getHours();
  const saud = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const user = Auth.getSession();
  document.getElementById('dashGreeting').textContent = `${saud}, ${user?.nome || 'Gestor'}! Aqui está o resumo de hoje.`;

  /* ── KPIs ── */
  document.getElementById('dashKpis').innerHTML = [
    {
      label: 'Estações livres',
      value: livres,
      sub: `de ${estacoes.length} estações`,
      color: 'var(--success-500)', bg: 'var(--success-50)',
      icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="20"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z" clip-rule="evenodd"/></svg>`
    },
    {
      label: 'Em uso agora',
      value: emUso,
      sub: emUso ? estacoes.filter(e=>e.ocupada).map(e=>e.nome).join(', ') : 'Nenhuma em uso',
      color: 'var(--danger-500)', bg: 'var(--danger-50)',
      icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="20"><path d="M2 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/></svg>`
    },
    {
      label: 'Total de notebooks',
      value: notebooks.length,
      sub: `${emManut} em manutenção`,
      color: 'var(--brand-500)', bg: 'var(--brand-50)',
      icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="20"><path d="M3 4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/><path d="M3 10a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6zm8 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3z"/></svg>`
    },
    {
      label: 'Movimentações hoje',
      value: movHoje,
      sub: `${movimentacoes.length} total no histórico`,
      color: 'var(--warning-500)', bg: 'var(--warning-50)',
      icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="20"><path d="M8 5a1 1 0 1 0 0 2h5.586l-1.293 1.293a1 1 0 0 0 1.414 1.414l3-3a1 1 0 0 0 0-1.414l-3-3a1 1 0 1 0-1.414 1.414L13.586 5H8z"/><path d="M12 15a1 1 0 1 0 0-2H6.414l1.293-1.293a1 1 0 1 0-1.414-1.414l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 0 0 1.414-1.414L6.414 15H12z"/></svg>`
    },
    {
      label: 'Professores ativos',
      value: professores.filter(p => p.status === 'Ativo').length,
      sub: `${professores.length} cadastrados`,
      color: 'var(--info-500)', bg: 'var(--info-50)',
      icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="20"><path d="M13 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>`
    },
    {
      label: 'Chamados abertos',
      value: manutencoes.filter(m => m.status === 'Aberto' || m.status === 'Em andamento').length,
      sub: `${manutencoes.filter(m=>m.status==='Concluído').length} concluídos`,
      color: 'var(--danger-500)', bg: 'var(--danger-50)',
      icon: `<svg viewBox="0 0 20 20" fill="currentColor" width="20"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" clip-rule="evenodd"/></svg>`
    },
  ].map(k => `
    <div class="kpi-card" style="--kpi-color:${k.color};--kpi-bg:${k.bg}">
      <div class="kpi-card__header">
        <span class="kpi-card__label">${k.label}</span>
        <div class="kpi-card__icon">${k.icon}</div>
      </div>
      <div class="kpi-card__value">${k.value}</div>
      <div class="kpi-card__sub">${k.sub}</div>
    </div>
  `).join('');

  /* ── Estações ── */
  document.getElementById('dashEstacoesGrid').innerHTML = estacoes.map(e => `
    <div class="estacao-status-card ${e.ocupada ? 'ocupada' : 'livre'}">
      <div class="estacao-status-card__letter">${e.letra}</div>
      <div class="estacao-status-card__name">${e.nome}</div>
      <div class="estacao-status-card__info">
        ${e.ocupada
          ? `${e.professor} · ${e.sala}<br>desde ${e.horario}`
          : `${notebooks.filter(n=>n.estacaoId===e.id&&n.status==='Ativo').length} notebooks disponíveis`
        }
      </div>
      ${statusBadge(e.ocupada ? 'Em uso' : 'Livre')}
    </div>
  `).join('') || '<p style="color:var(--text-muted);font-size:var(--text-sm)">Nenhuma estação cadastrada.</p>';

  /* ── Atividade recente ── */
  const recentes = [...movimentacoes].reverse().slice(0, 6);
  document.getElementById('dashActivity').innerHTML = recentes.length
    ? recentes.map(m => {
        const pf = professores.find(p => p.id === m.professorId);
        const es = estacoes.find(e => e.id === m.estacaoId);
        return `<div class="activity-item">
          <div class="activity-dot activity-dot--${m.tipo === 'Retirada' ? 'retirada' : 'devolucao'}"></div>
          <div class="activity-text">
            <div><strong>${pf?.nome || '—'}</strong> ${m.tipo === 'Retirada' ? 'retirou' : 'devolveu'} a ${es?.nome || '—'}</div>
            <div class="activity-time">${m.horario}</div>
          </div>
        </div>`;
      }).join('')
    : '<p class="empty-state__sub" style="padding:1rem 0">Nenhuma atividade ainda.</p>';

  /* ── Manutenções ── */
  const abertas = manutencoes.filter(m => m.status !== 'Concluído');
  document.getElementById('dashManutBadge').textContent = abertas.length;
  document.getElementById('dashManutList').innerHTML = abertas.length
    ? abertas.slice(0,4).map(m => {
        const nb = notebooks.find(n => n.id === m.notebookId);
        return `<div class="simple-list-item"><span>${nb?.patrimonio || '—'} — ${m.desc.slice(0,30)}${m.desc.length>30?'…':''}</span>${statusBadge(m.status)}</div>`;
      }).join('')
    : '<p class="empty-state__sub" style="padding:0.5rem 0">Nenhum chamado aberto.</p>';

  /* ── Alertas ── */
  const alertas = [];
  if (emUso > 0) alertas.push({ tipo: 'info', texto: `${emUso} estação(ões) em uso no momento`, sub: estacoes.filter(e=>e.ocupada).map(e=>`${e.nome}: ${e.professor}`).join(' | ') });
  if (emManut > 0) alertas.push({ tipo: 'warning', texto: `${emManut} notebook(s) em manutenção`, sub: 'Verifique a tela de Manutenções' });
  if (movHoje === 0) alertas.push({ tipo: 'info', texto: 'Nenhuma movimentação hoje', sub: 'Registre retiradas e devoluções normalmente' });

  document.getElementById('dashAlertas').innerHTML = alertas.length
    ? alertas.map(a => `<div class="alert-item alert-item--${a.tipo}"><div><div class="alert-item__text">${a.texto}</div><div class="alert-item__sub">${a.sub}</div></div></div>`).join('')
    : '<p class="empty-state__sub" style="padding:0.5rem 0">Nenhum alerta no momento.</p>';
}
