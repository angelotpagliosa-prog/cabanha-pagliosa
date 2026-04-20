/**
 * CABANHA PAGLIOSA - Módulo de Banco de Dados
 * Usa localStorage para persistência de dados
 */

const DB = {
  // ========== UTILITÁRIOS ==========

  _gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  _agora() {
    return new Date().toISOString();
  },

  _get(chave) {
    try {
      const dados = localStorage.getItem('cp_' + chave);
      return dados ? JSON.parse(dados) : [];
    } catch { return []; }
  },

  _set(chave, dados) {
    try {
      localStorage.setItem('cp_' + chave, JSON.stringify(dados));
      return true;
    } catch { return false; }
  },

  // ========== ANIMAIS ==========

  animais: {
    listar(filtros = {}) {
      let lista = DB._get('animais');
      if (filtros.raca) lista = lista.filter(a => a.raca === filtros.raca);
      if (filtros.sexo) lista = lista.filter(a => a.sexo === filtros.sexo);
      if (filtros.categoria) lista = lista.filter(a => a.categoria === filtros.categoria);
      if (filtros.status) lista = lista.filter(a => a.status === filtros.status);
      if (filtros.loteId) lista = lista.filter(a => a.loteId === filtros.loteId);
      if (filtros.localId) lista = lista.filter(a => a.localId === filtros.localId);
      if (filtros.busca) {
        const b = filtros.busca.toLowerCase();
        lista = lista.filter(a =>
          (a.numero && a.numero.toLowerCase().includes(b)) ||
          (a.nome && a.nome.toLowerCase().includes(b)) ||
          (a.brinco && a.brinco.toLowerCase().includes(b))
        );
      }
      return lista;
    },

    buscarPorId(id) {
      return DB._get('animais').find(a => a.id === id) || null;
    },

    salvar(animal) {
      const lista = DB._get('animais');
      if (animal.id) {
        const idx = lista.findIndex(a => a.id === animal.id);
        if (idx >= 0) {
          lista[idx] = { ...lista[idx], ...animal, atualizadoEm: DB._agora() };
        }
      } else {
        animal.id = DB._gerarId();
        animal.criadoEm = DB._agora();
        animal.atualizadoEm = DB._agora();
        lista.push(animal);
      }
      DB._set('animais', lista);
      return animal;
    },

    excluir(id) {
      const lista = DB._get('animais').filter(a => a.id !== id);
      DB._set('animais', lista);
    },

    contarPor(campo) {
      const lista = DB._get('animais').filter(a => a.status === 'ativo');
      const contagem = {};
      lista.forEach(a => {
        const val = a[campo] || 'Não informado';
        contagem[val] = (contagem[val] || 0) + 1;
      });
      return contagem;
    },

    totais() {
      const lista = DB._get('animais');
      return {
        total: lista.length,
        ativos: lista.filter(a => a.status === 'ativo').length,
        vendidos: lista.filter(a => a.status === 'vendido').length,
        mortos: lista.filter(a => a.status === 'morto').length,
        machos: lista.filter(a => a.sexo === 'macho' && a.status === 'ativo').length,
        femeas: lista.filter(a => a.sexo === 'fêmea' && a.status === 'ativo').length,
      };
    }
  },

  // ========== LOCAIS ==========

  locais: {
    listar() { return DB._get('locais'); },

    buscarPorId(id) { return DB._get('locais').find(l => l.id === id) || null; },

    salvar(local) {
      const lista = DB._get('locais');
      if (local.id) {
        const idx = lista.findIndex(l => l.id === local.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...local };
      } else {
        local.id = DB._gerarId();
        local.criadoEm = DB._agora();
        lista.push(local);
      }
      DB._set('locais', lista);
      return local;
    },

    excluir(id) {
      DB._set('locais', DB._get('locais').filter(l => l.id !== id));
    },

    animaisNoLocal(localId) {
      return DB._get('animais').filter(a => a.localId === localId && a.status === 'ativo');
    }
  },

  // ========== LOTES ==========

  lotes: {
    listar() { return DB._get('lotes'); },

    buscarPorId(id) { return DB._get('lotes').find(l => l.id === id) || null; },

    salvar(lote) {
      const lista = DB._get('lotes');
      if (lote.id) {
        const idx = lista.findIndex(l => l.id === lote.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...lote };
      } else {
        lote.id = DB._gerarId();
        lote.criadoEm = DB._agora();
        lista.push(lote);
      }
      DB._set('lotes', lista);
      return lote;
    },

    excluir(id) {
      DB._set('lotes', DB._get('lotes').filter(l => l.id !== id));
    },

    animaisNoLote(loteId) {
      return DB._get('animais').filter(a => a.loteId === loteId && a.status === 'ativo');
    }
  },

  // ========== MOVIMENTAÇÕES ==========

  movimentacoes: {
    listar() { return DB._get('movimentacoes').sort((a, b) => b.data.localeCompare(a.data)); },

    salvar(mov) {
      const lista = DB._get('movimentacoes');
      mov.id = DB._gerarId();
      mov.criadoEm = DB._agora();
      lista.push(mov);
      DB._set('movimentacoes', lista);

      // Atualiza localização dos animais
      if (mov.animalIds && mov.animalIds.length > 0) {
        const animais = DB._get('animais');
        mov.animalIds.forEach(aid => {
          const idx = animais.findIndex(a => a.id === aid);
          if (idx >= 0) {
            animais[idx].localId = mov.localDestinoId || animais[idx].localId;
            animais[idx].loteId = mov.loteDestinoId || animais[idx].loteId;
            animais[idx].atualizadoEm = DB._agora();
          }
        });
        DB._set('animais', animais);
      }
      return mov;
    }
  },

  // ========== NASCIMENTOS ==========

  nascimentos: {
    listar() { return DB._get('nascimentos').sort((a, b) => b.dataNascimento.localeCompare(a.dataNascimento)); },

    buscarPorId(id) { return DB._get('nascimentos').find(n => n.id === id) || null; },

    salvar(nasc) {
      const lista = DB._get('nascimentos');
      if (nasc.id) {
        const idx = lista.findIndex(n => n.id === nasc.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...nasc };
      } else {
        nasc.id = DB._gerarId();
        nasc.criadoEm = DB._agora();
        lista.push(nasc);
      }
      DB._set('nascimentos', lista);
      return nasc;
    },

    excluir(id) {
      DB._set('nascimentos', DB._get('nascimentos').filter(n => n.id !== id));
    },

    totaisMes() {
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      return DB._get('nascimentos').filter(n => {
        const d = new Date(n.dataNascimento);
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      }).length;
    }
  },

  // ========== COBERTURAS ==========

  coberturas: {
    listar() { return DB._get('coberturas').sort((a, b) => b.data.localeCompare(a.data)); },

    buscarPorId(id) { return DB._get('coberturas').find(c => c.id === id) || null; },

    salvar(cob) {
      const lista = DB._get('coberturas');
      if (cob.id) {
        const idx = lista.findIndex(c => c.id === cob.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...cob };
      } else {
        cob.id = DB._gerarId();
        cob.criadoEm = DB._agora();
        lista.push(cob);
      }
      DB._set('coberturas', lista);
      return cob;
    },

    excluir(id) {
      DB._set('coberturas', DB._get('coberturas').filter(c => c.id !== id));
    }
  },

  // ========== DIAGNÓSTICOS DE GESTAÇÃO ==========

  diagnosticos: {
    listar() { return DB._get('diagnosticos').sort((a, b) => b.data.localeCompare(a.data)); },

    salvar(diag) {
      const lista = DB._get('diagnosticos');
      if (diag.id) {
        const idx = lista.findIndex(d => d.id === diag.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...diag };
      } else {
        diag.id = DB._gerarId();
        diag.criadoEm = DB._agora();
        lista.push(diag);
      }
      DB._set('diagnosticos', lista);

      // Atualiza status do animal
      if (diag.resultado === 'prenha') {
        const animais = DB._get('animais');
        const idx = animais.findIndex(a => a.id === diag.animalId);
        if (idx >= 0) {
          animais[idx].status = 'prenha';
          animais[idx].previsaoParto = diag.previsaoParto;
          animais[idx].atualizadoEm = DB._agora();
          DB._set('animais', animais);
        }
      } else if (diag.resultado === 'vazia') {
        const animais = DB._get('animais');
        const idx = animais.findIndex(a => a.id === diag.animalId);
        if (idx >= 0) {
          animais[idx].status = 'ativo';
          animais[idx].previsaoParto = null;
          animais[idx].atualizadoEm = DB._agora();
          DB._set('animais', animais);
        }
      }
      return diag;
    }
  },

  // ========== MANEJOS SANITÁRIOS ==========

  sanitarios: {
    listar() { return DB._get('sanitarios').sort((a, b) => b.dataAplicacao.localeCompare(a.dataAplicacao)); },

    buscarPorId(id) { return DB._get('sanitarios').find(s => s.id === id) || null; },

    salvar(san) {
      const lista = DB._get('sanitarios');
      if (san.id) {
        const idx = lista.findIndex(s => s.id === san.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...san };
      } else {
        san.id = DB._gerarId();
        san.criadoEm = DB._agora();
        lista.push(san);
      }
      DB._set('sanitarios', lista);
      return san;
    },

    excluir(id) {
      DB._set('sanitarios', DB._get('sanitarios').filter(s => s.id !== id));
    },

    pendentes() {
      const hoje = new Date().toISOString().split('T')[0];
      return DB._get('sanitarios').filter(s => s.proximaAplicacao && s.proximaAplicacao <= hoje);
    }
  },

  // ========== LANÇAMENTOS FINANCEIROS ==========

  financeiros: {
    listar() { return DB._get('financeiros').sort((a, b) => b.data.localeCompare(a.data)); },

    buscarPorId(id) { return DB._get('financeiros').find(f => f.id === id) || null; },

    salvar(fin) {
      const lista = DB._get('financeiros');
      if (fin.id) {
        const idx = lista.findIndex(f => f.id === fin.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...fin };
      } else {
        fin.id = DB._gerarId();
        fin.criadoEm = DB._agora();
        lista.push(fin);
      }
      DB._set('financeiros', lista);
      return fin;
    },

    excluir(id) {
      DB._set('financeiros', DB._get('financeiros').filter(f => f.id !== id));
    },

    totalDespesas() {
      return DB._get('financeiros')
        .filter(f => f.tipo === 'despesa')
        .reduce((s, f) => s + (parseFloat(f.valor) || 0), 0);
    },

    totalReceitas() {
      return DB._get('financeiros')
        .filter(f => f.tipo === 'receita')
        .reduce((s, f) => s + (parseFloat(f.valor) || 0), 0);
    },

    custoDoAnimal(animalId) {
      return DB._get('financeiros')
        .filter(f => f.animalId === animalId || (f.animalIds && f.animalIds.includes(animalId)))
        .reduce((s, f) => s + (parseFloat(f.valorRateado || f.valor) || 0), 0);
    }
  },

  // ========== VENDAS ==========

  vendas: {
    listar() { return DB._get('vendas').sort((a, b) => b.data.localeCompare(a.data)); },

    buscarPorId(id) { return DB._get('vendas').find(v => v.id === id) || null; },

    salvar(venda) {
      const lista = DB._get('vendas');
      if (venda.id) {
        const idx = lista.findIndex(v => v.id === venda.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...venda };
      } else {
        venda.id = DB._gerarId();
        venda.criadoEm = DB._agora();
        lista.push(venda);

        // Atualiza status do animal para vendido
        const animais = DB._get('animais');
        const idx = animais.findIndex(a => a.id === venda.animalId);
        if (idx >= 0) {
          animais[idx].status = 'vendido';
          animais[idx].dataVenda = venda.data;
          animais[idx].atualizadoEm = DB._agora();
          DB._set('animais', animais);
        }
      }
      DB._set('vendas', lista);
      return venda;
    },

    excluir(id) {
      DB._set('vendas', DB._get('vendas').filter(v => v.id !== id));
    },

    totalReceita() {
      return DB._get('vendas').reduce((s, v) => s + (parseFloat(v.valorVenda) || 0), 0);
    }
  },

  // ========== REGISTROS EM ASSOCIAÇÕES ==========

  registros: {
    listar() { return DB._get('registros'); },

    buscarPorId(id) { return DB._get('registros').find(r => r.id === id) || null; },

    salvar(reg) {
      const lista = DB._get('registros');
      if (reg.id) {
        const idx = lista.findIndex(r => r.id === reg.id);
        if (idx >= 0) lista[idx] = { ...lista[idx], ...reg };
      } else {
        reg.id = DB._gerarId();
        reg.criadoEm = DB._agora();
        lista.push(reg);
      }
      DB._set('registros', lista);
      return reg;
    },

    excluir(id) {
      DB._set('registros', DB._get('registros').filter(r => r.id !== id));
    },

    pendentes() {
      return DB._get('registros').filter(r => r.status === 'pendente');
    }
  },

  // ========== PESAGENS ==========

  pesagens: {
    listarDoAnimal(animalId) {
      return DB._get('pesagens')
        .filter(p => p.animalId === animalId)
        .sort((a, b) => b.data.localeCompare(a.data));
    },

    salvar(pesagem) {
      const lista = DB._get('pesagens');
      pesagem.id = DB._gerarId();
      pesagem.criadoEm = DB._agora();
      lista.push(pesagem);
      DB._set('pesagens', lista);

      // Atualiza peso atual do animal
      const animais = DB._get('animais');
      const idx = animais.findIndex(a => a.id === pesagem.animalId);
      if (idx >= 0) {
        animais[idx].pesoAtual = pesagem.peso;
        animais[idx].atualizadoEm = DB._agora();
        DB._set('animais', animais);
      }
      return pesagem;
    }
  },

  // ========== DASHBOARD ==========

  dashboard() {
    const animais = DB._get('animais');
    const ativos = animais.filter(a => a.status === 'ativo');
    const prenhas = animais.filter(a => a.status === 'prenha');

    const hoje = new Date();
    const seteDias = new Date(hoje);
    seteDias.setDate(hoje.getDate() + 7);
    const seteDiasStr = seteDias.toISOString().split('T')[0];

    const proxParto = prenhas.filter(a => a.previsaoParto && a.previsaoParto <= seteDiasStr);

    const sanitPendentes = DB.sanitarios.pendentes();
    const regPendentes = DB.registros.pendentes();

    const totalDespesas = DB.financeiros.totalDespesas();
    const totalReceitas = DB.financeiros.totalReceitas() + DB.vendas.totalReceita();

    return {
      totalAtivos: ativos.length,
      totalPrenhas: prenhas.length,
      totalMachos: ativos.filter(a => a.sexo === 'macho').length,
      totalFemeas: ativos.filter(a => a.sexo === 'fêmea').length,
      nascimentosMes: DB.nascimentos.totaisMes(),
      sanitariosPendentes: sanitPendentes.length,
      proximosPartos: proxParto.length,
      registrosPendentes: regPendentes.length,
      totalDespesas,
      totalReceitas,
      saldo: totalReceitas - totalDespesas,
      porRaca: DB.animais.contarPor('raca'),
      porCategoria: DB.animais.contarPor('categoria'),
    };
  },

  // ========== BACKUP / RESTORE ==========

  exportar() {
    const dados = {
      versao: '1.0',
      exportadoEm: DB._agora(),
      animais: DB._get('animais'),
      locais: DB._get('locais'),
      lotes: DB._get('lotes'),
      movimentacoes: DB._get('movimentacoes'),
      nascimentos: DB._get('nascimentos'),
      coberturas: DB._get('coberturas'),
      diagnosticos: DB._get('diagnosticos'),
      sanitarios: DB._get('sanitarios'),
      financeiros: DB._get('financeiros'),
      vendas: DB._get('vendas'),
      registros: DB._get('registros'),
      pesagens: DB._get('pesagens'),
    };
    return JSON.stringify(dados, null, 2);
  },

  importar(jsonStr) {
    try {
      const dados = JSON.parse(jsonStr);
      if (dados.animais) DB._set('animais', dados.animais);
      if (dados.locais) DB._set('locais', dados.locais);
      if (dados.lotes) DB._set('lotes', dados.lotes);
      if (dados.movimentacoes) DB._set('movimentacoes', dados.movimentacoes);
      if (dados.nascimentos) DB._set('nascimentos', dados.nascimentos);
      if (dados.coberturas) DB._set('coberturas', dados.coberturas);
      if (dados.diagnosticos) DB._set('diagnosticos', dados.diagnosticos);
      if (dados.sanitarios) DB._set('sanitarios', dados.sanitarios);
      if (dados.financeiros) DB._set('financeiros', dados.financeiros);
      if (dados.vendas) DB._set('vendas', dados.vendas);
      if (dados.registros) DB._set('registros', dados.registros);
      if (dados.pesagens) DB._set('pesagens', dados.pesagens);
      return true;
    } catch { return false; }
  }
};
