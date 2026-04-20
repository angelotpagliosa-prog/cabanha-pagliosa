/**
 * CABANHA PAGLIOSA - Utilitários
 */

// ========== CONSTANTES ==========

const RACAS = [
  'Charolês', 'Caracu', 'Tabapuã', 'Braford', 'Brangus',
  'Cruzado', 'Texel', 'Suffolk'
];

const CATEGORIAS = [
  'Terneiro', 'Terneira', 'Novilho', 'Novilha',
  'Matriz', 'Vaca', 'Doadora', 'Receptora',
  'Touro', 'Reprodutor',
  'Animal de Exposição', 'Animal de Recria',
  'Disponível para Venda',
  'Borrego', 'Borrega', 'Carneiro', 'Ovelha'
];

const STATUS_ANIMAL = [
  'ativo', 'vendido', 'descartado', 'morto',
  'prenha', 'em reprodução', 'em preparo para venda',
  'em exposição', 'reservado', 'em recria'
];

const TIPOS_LOCAL = [
  'Pasto', 'Potreiro', 'Piquete', 'Mangueira', 'Galpão', 'Curral', 'Outra'
];

const TIPOS_COBERTURA = [
  'Monta Natural', 'Inseminação Artificial (IA)', 'IATF', 'TE', 'FIV'
];

const TIPOS_SANITARIO = [
  'Vacina', 'Vermifugação', 'Carrapaticida', 'Medicamento',
  'Exame', 'Tratamento', 'Outro'
];

const CATEGORIAS_FINANCEIRO = [
  'Alimentação', 'Sal Mineral', 'Ração', 'Silagem', 'Feno',
  'Medicamentos', 'Vacinas', 'Vermífugos', 'Carrapaticidas',
  'Hormônios de Reprodução', 'Sêmen', 'Serviços Veterinários',
  'Mão de Obra', 'Frete', 'Exames', 'Inseminação', 'TE', 'FIV',
  'Registro em Associação', 'Documentação', 'Exposição', 'Leilão',
  'Preparo para Venda', 'Insumos Gerais', 'Outros'
];

const ASSOCIACOES = [
  'ABCCH - Charolês', 'ACCC - Caracu', 'ABCZ - Zebuíno',
  'ABB - Braford', 'ABN - Brangus', 'ARCO - Cruzado',
  'ABT - Texel', 'ABSuffolk - Suffolk', 'Outra'
];

// ========== FORMATADORES ==========

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  }).format(valor || 0);
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleString('pt-BR');
}

function calcularIdade(dataNasc) {
  if (!dataNasc) return '-';
  const nasc = new Date(dataNasc);
  const hoje = new Date();
  const diffMs = hoje - nasc;
  const diffDias = Math.floor(diffMs / 86400000);

  if (diffDias < 30) return `${diffDias} dia${diffDias !== 1 ? 's' : ''}`;
  if (diffDias < 365) {
    const meses = Math.floor(diffDias / 30);
    return `${meses} mês${meses !== 1 ? 'es' : ''}`;
  }
  const anos = Math.floor(diffDias / 365);
  const mesesRest = Math.floor((diffDias % 365) / 30);
  if (mesesRest > 0) return `${anos} ano${anos !== 1 ? 's' : ''} e ${mesesRest} mês${mesesRest !== 1 ? 'es' : ''}`;
  return `${anos} ano${anos !== 1 ? 's' : ''}`;
}

function calcularPrevisaoParto(dataCobertura, tipoCobertura) {
  if (!dataCobertura) return null;
  const d = new Date(dataCobertura);
  d.setDate(d.getDate() + 280); // ~283 dias gestação bovina
  return d.toISOString().split('T')[0];
}

// ========== TOAST ==========

function mostrarToast(msg, tipo = 'sucesso') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const icones = { sucesso: '✅', erro: '❌', aviso: '⚠️', info: 'ℹ️' };
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `<span>${icones[tipo] || '✅'}</span> ${msg}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========== BADGES ==========

function badgeRaca(raca) {
  const cores = {
    'charolês': 'badge-azul', 'caracu': 'badge-amarelo',
    'tabapuã': 'badge-marrom', 'braford': 'badge-verde',
    'brangus': 'badge-roxo', 'cruzado': 'badge-cinza',
    'texel': 'badge-azul', 'suffolk': 'badge-marrom'
  };
  const cor = cores[(raca || '').toLowerCase()] || 'badge-cinza';
  return `<span class="badge ${cor}">${raca || '-'}</span>`;
}

function badgeStatus(status) {
  const mapa = {
    'ativo': 'badge-verde', 'vendido': 'badge-azul',
    'descartado': 'badge-amarelo', 'morto': 'badge-vermelho',
    'prenha': 'badge-roxo', 'em reprodução': 'badge-roxo',
    'em preparo para venda': 'badge-amarelo',
    'em exposição': 'badge-azul', 'reservado': 'badge-cinza',
    'em recria': 'badge-verde'
  };
  const cor = mapa[status] || 'badge-cinza';
  return `<span class="badge ${cor}">${status || '-'}</span>`;
}

function chipSexo(sexo) {
  if (sexo === 'macho') return '<span class="chip-macho">♂ Macho</span>';
  if (sexo === 'fêmea') return '<span class="chip-femea">♀ Fêmea</span>';
  return '-';
}

// ========== MODAIS ==========

function abrirModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('aberto');
}

function fecharModal(id) {
  const m = document.getElementById(id);
  if (m) {
    m.classList.remove('aberto');
    const form = m.querySelector('form');
    if (form) form.reset();
  }
}

// Fechar modal clicando fora
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('aberto');
    const form = e.target.querySelector('form');
    if (form) form.reset();
  }
});

// ========== SELECTS DINÂMICOS ==========

function preencherSelect(selectId, opcoes, valorAtual = '') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  const primOpcao = sel.options[0];
  sel.innerHTML = '';
  if (primOpcao) sel.appendChild(primOpcao);
  opcoes.forEach(op => {
    const opt = document.createElement('option');
    opt.value = typeof op === 'object' ? op.value : op;
    opt.textContent = typeof op === 'object' ? op.label : op;
    if (opt.value === valorAtual) opt.selected = true;
    sel.appendChild(opt);
  });
}

function preencherSelectAnimais(selectId, filtros = {}, valorAtual = '') {
  const animais = DB.animais.listar(filtros);
  const opcoes = animais.map(a => ({
    value: a.id,
    label: `${a.numero || ''}${a.nome ? ' - ' + a.nome : ''}${a.brinco ? ' [' + a.brinco + ']' : ''}`
  }));
  preencherSelect(selectId, opcoes, valorAtual);
}

function preencherSelectLocais(selectId, valorAtual = '') {
  const locais = DB.locais.listar();
  const opcoes = locais.map(l => ({ value: l.id, label: `${l.nome} (${l.tipo || ''})` }));
  preencherSelect(selectId, opcoes, valorAtual);
}

function preencherSelectLotes(selectId, valorAtual = '') {
  const lotes = DB.lotes.listar();
  const opcoes = lotes.map(l => ({ value: l.id, label: l.nome }));
  preencherSelect(selectId, opcoes, valorAtual);
}

// ========== CONFIRMAÇÃO ==========

function confirmar(msg) {
  return confirm(msg);
}

// ========== EXPORTAR / BAIXAR ==========

function baixarArquivo(conteudo, nomeArquivo, tipo = 'application/json') {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

// ========== PAGINAÇÃO ==========

function paginar(lista, pagina, porPagina = 20) {
  const inicio = (pagina - 1) * porPagina;
  return {
    dados: lista.slice(inicio, inicio + porPagina),
    total: lista.length,
    paginas: Math.ceil(lista.length / porPagina),
    paginaAtual: pagina
  };
}

// ========== NOME DO LOCAL ==========

function nomeLocal(id) {
  if (!id) return '-';
  const l = DB.locais.buscarPorId(id);
  return l ? l.nome : '-';
}

function nomeLote(id) {
  if (!id) return '-';
  const l = DB.lotes.buscarPorId(id);
  return l ? l.nome : '-';
}

function nomeAnimal(id) {
  if (!id) return '-';
  const a = DB.animais.buscarPorId(id);
  if (!a) return '-';
  return `${a.numero || ''}${a.nome ? ' ' + a.nome : ''}`.trim() || '-';
}
