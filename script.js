// ==========================================
// CONFIGURAÇÕES PRINCIPAIS — SAMUKA VARIEDADES
// ==========================================
const SUPABASE_URL = "https://zsphytpvqbowyqvisjzx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tFR5sNN1aFgHNiVV7z6Vrw_a45uts6m";
const CHAVE_PIX_LOJA = "92995074051";

const CHAVE_PRIMEIRA_VEZ_AUTH = "samuka_auth_ja_visitou";
const CHAVE_CARRINHO = "samuka_carrinho_v1";
const CHAVE_MEUS_PEDIDOS_IDS = "samuka_meus_pedidos_ids";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// ELEMENTOS DO DOM
// ==========================================
const listaProdutos = document.getElementById("listaProdutos");
const campoBusca = document.getElementById("busca");
const filtroCategoria = document.getElementById("filtroCategoria");

// Carrinho
const btnAbrirCarrinho = document.getElementById("btnAbrirCarrinho");
const btnFecharCarrinho = document.getElementById("btnFecharCarrinho");
const carrinhoOverlay = document.getElementById("carrinhoOverlay");
const badgeCarrinho = document.getElementById("badgeCarrinho");
const carrinhoItens = document.getElementById("carrinhoItens");
const carrinhoTotal = document.getElementById("carrinhoTotal");
const btnFinalizarCarrinho = document.getElementById("btnFinalizarCarrinho");
const btnLimparCarrinho = document.getElementById("btnLimparCarrinho");

// Meus Pedidos
const btnAbrirMeusPedidos = document.getElementById("btnAbrirMeusPedidos");
const modalMeusPedidos = document.getElementById("modalMeusPedidos");
const btnFecharMeusPedidos = document.getElementById("btnFecharMeusPedidos");
const listaMeusPedidos = document.getElementById("listaMeusPedidos");
const formBuscarPedidoPorId = document.getElementById("formBuscarPedidoPorId");
const inputBuscaPedidoId = document.getElementById("inputBuscaPedidoId");
const btnLimparBuscaPedidoId = document.getElementById("btnLimparBuscaPedidoId");

// Checkout estilo Mercado Livre + Pagamento na Hora
const modalCheckoutML = document.getElementById("modalCheckoutML");
const btnFecharCheckoutML = document.getElementById("btnFecharCheckoutML");
const formCheckoutML = document.getElementById("formCheckoutML");
const mlResumoItens = document.getElementById("mlResumoItens");
const mlTipoEntrega = document.getElementById("mlTipoEntrega");
const mlPrevisaoEntregaTexto = document.getElementById("mlPrevisaoEntregaTexto");
const mlEnderecoGrupo = document.getElementById("mlEnderecoGrupo");
const mlEndereco = document.getElementById("mlEndereco");
const mlPagamento = document.getElementById("mlPagamento");

const mlPixGrupo = document.getElementById("mlPixGrupo");
const mlChavePixTexto = document.getElementById("mlChavePixTexto");
const btnCopiarPix = document.getElementById("btnCopiarPix");
const mlConfirmouPix = document.getElementById("mlConfirmouPix");

const mlCartaoGrupo = document.getElementById("mlCartaoGrupo");
const mlCartaoNome = document.getElementById("mlCartaoNome");
const mlCartaoNumero = document.getElementById("mlCartaoNumero");
const mlCartaoValidade = document.getElementById("mlCartaoValidade");
const mlCartaoCvv = document.getElementById("mlCartaoCvv");
const mlConfirmouCartao = document.getElementById("mlConfirmouCartao");

const mlNomeCliente = document.getElementById("mlNomeCliente");
const mlObservacao = document.getElementById("mlObservacao");
const mlQtdItens = document.getElementById("mlQtdItens");
const mlTotalValor = document.getElementById("mlTotalValor");
const mlMensagemPedido = document.getElementById("mlMensagemPedido");
const btnConfirmarPedido = document.getElementById("btnConfirmarPedido");

// Autenticação
const areaAuth = document.getElementById("areaAuth");
const modalAuth = document.getElementById("modalAuth");
const btnFecharAuth = document.getElementById("btnFecharAuth");
const tabLogin = document.getElementById("tabLogin");
const tabRegistro = document.getElementById("tabRegistro");
const campoNomeGrupo = document.getElementById("campoNomeGrupo");
const formAuth = document.getElementById("formAuth");
const authNome = document.getElementById("authNome");
const authEmail = document.getElementById("authEmail");
const authSenha = document.getElementById("authSenha");
const btnEsqueciSenha = document.getElementById("btnEsqueciSenha");
const authMensagem = document.getElementById("authMensagem");
const btnSubmitAuth = document.getElementById("btnSubmitAuth");

// Nova Senha
const modalNovaSenha = document.getElementById("modalNovaSenha");
const btnFecharNovaSenha = document.getElementById("btnFecharNovaSenha");
const formNovaSenha = document.getElementById("formNovaSenha");
const novaSenhaInput = document.getElementById("novaSenha");
const confirmarNovaSenhaInput = document.getElementById("confirmarNovaSenha");
const novaSenhaMensagem = document.getElementById("novaSenhaMensagem");
const btnSalvarNovaSenha = document.getElementById("btnSalvarNovaSenha");

// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
let produtosCache = [];
let carrinho = carregarCarrinhoSalvo();
let usuarioAtual = null;
let modoRegistro = false;

if (mlChavePixTexto) {
  mlChavePixTexto.textContent = CHAVE_PIX_LOJA;
}

// ==========================================
// UTILITÁRIOS
// ==========================================
function escaparHtml(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatarPreco(valor) {
  return (Number(valor) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function obterStatusEstoque(qtd) {
  const estoque = Number(qtd) || 0;
  if (estoque <= 0) {
    return { classe: "esgotado", texto: "Esgotado", disponivel: false, max: 0 };
  }
  if (estoque <= 3) {
    return { classe: "baixo-estoque", texto: `Últimas ${estoque} un.`, disponivel: true, max: estoque };
  }
  return { classe: "em-estoque", texto: `Em estoque (${estoque})`, disponivel: true, max: estoque };
}

function calcularPrevisaoEntrega(tipoEntrega) {
  const hoje = new Date();
  if (String(tipoEntrega || "").startsWith("Entrega")) {
    let diasAdicionados = 0;
    const dataPrevista = new Date(hoje);
    while (diasAdicionados < 2) {
      dataPrevista.setDate(dataPrevista.getDate() + 1);
      const diaSemana = dataPrevista.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasAdicionados++;
      }
    }
    const dataFormatada = dataPrevista.toLocaleDateString("pt-BR");
    return `Entrega prevista até ${dataFormatada}`;
  }
  return "Retirada disponível hoje (após confirmação do pagamento)";
}

// ==========================================
// CARRINHO DE COMPRAS
// ==========================================
function carregarCarrinhoSalvo() {
  try {
    const bruto = localStorage.getItem(CHAVE_CARRINHO);
    const parsed = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  } catch {
    // Falha silenciosa caso o navegador bloqueie armazenamento local
  }
}

function obterEstoqueProdutoPorId(id) {
  const prod = produtosCache.find((p) => String(p.id) === String(id));
  return prod ? Number(prod.quantidade) || 0 : 999;
}

function adicionarAoCarrinho(idProduto) {
  const prod = produtosCache.find((p) => String(p.id) === String(idProduto));
  if (!prod) return;

  const estoqueMax = Number(prod.quantidade) || 0;
  if (estoqueMax <= 0) return;

  const existente = carrinho.find((item) => String(item.id) === String(prod.id));
  if (existente) {
    if (existente.qtd >= estoqueMax) return;
    existente.qtd += 1;
    existente.preco = Number(prod.preco) || 0;
    existente.nome = prod.nome || "Produto";
    existente.imagem_url = prod.imagem_url || "";
  } else {
    carrinho.push({
      id: prod.id,
      nome: prod.nome || "Produto",
      preco: Number(prod.preco) || 0,
      imagem_url: prod.imagem_url || "",
      qtd: 1
    });
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function alterarQtdCarrinho(idProduto, delta) {
  const idx = carrinho.findIndex((item) => String(item.id) === String(idProduto));
  if (idx === -1) return;

  const item = carrinho[idx];
  const estoqueMax = obterEstoqueProdutoPorId(idProduto);
  const novaQtd = item.qtd + delta;

  if (novaQtd <= 0) {
    carrinho.splice(idx, 1);
  } else if (novaQtd > estoqueMax && estoqueMax > 0) {
    item.qtd = estoqueMax;
  } else {
    item.qtd = novaQtd;
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function removerDoCarrinho(idProduto) {
  carrinho = carrinho.filter((item) => String(item.id) !== String(idProduto));
  salvarCarrinho();
  renderizarCarrinho();
}

function limparCarrinho() {
  carrinho = [];
  salvarCarrinho();
  renderizarCarrinho();
}

function renderizarCarrinho() {
  const totalUnidades = carrinho.reduce((acc, item) => acc + (Number(item.qtd) || 0), 0);
  const totalValor = carrinho.reduce(
    (acc, item) => acc + (Number(item.preco) || 0) * (Number(item.qtd) || 0),
    0
  );

  if (badgeCarrinho) {
    badgeCarrinho.textContent = String(totalUnidades);
    badgeCarrinho.classList.toggle("vazio", totalUnidades === 0);
  }

  if (carrinhoTotal) {
    carrinhoTotal.textContent = formatarPreco(totalValor);
  }

  if (btnFinalizarCarrinho) {
    btnFinalizarCarrinho.disabled = carrinho.length === 0;
  }

  if (!carrinhoItens) return;

  if (carrinho.length === 0) {
    carrinhoItens.innerHTML = `<p class="carrinho-vazio">Seu carrinho está vazio.</p>`;
    return;
  }

  carrinhoItens.innerHTML = carrinho
    .map((item) => {
      const img = escaparHtml(item.imagem_url || "https://via.placeholder.com/120x120?text=Sem+Foto");
      const nomeSeguro = escaparHtml(item.nome);
      const subtotal = (Number(item.preco) || 0) * (Number(item.qtd) || 0);

      return `
        <div class="item-carrinho" data-id="${escaparHtml(item.id)}">
          <img src="${img}" alt="${nomeSeguro}" loading="lazy">
          <div class="item-carrinho-info">
            <div class="item-carrinho-nome">${nomeSeguro}</div>
            <div class="item-carrinho-preco">${formatarPreco(subtotal)}</div>
            <div class="item-carrinho-controles">
              <button type="button" class="btn-qtd btn-menos" data-id="${escaparHtml(item.id)}" aria-label="Diminuir quantidade">−</button>
              <span class="qtd-valor">${Number(item.qtd) || 1}</span>
              <button type="button" class="btn-qtd btn-mais" data-id="${escaparHtml(item.id)}" aria-label="Aumentar quantidade">+</button>
              <button type="button" class="btn-remover-item" data-id="${escaparHtml(item.id)}">Remover</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function abrirCarrinho() {
  renderizarCarrinho();
  carrinhoOverlay?.classList.add("aberto");
}

function fecharCarrinho() {
  carrinhoOverlay?.classList.remove("aberto");
}

// ==========================================
// CHECKOUT ESTILO MERCADO LIVRE + PAGAR NA HORA
// ==========================================
function atualizarCamposCheckoutML() {
  const tipo = mlTipoEntrega?.value || "Retirada na loja (Manaus - AM)";
  const ehEntrega = tipo.startsWith("Entrega");

  if (mlEnderecoGrupo) mlEnderecoGrupo.style.display = ehEntrega ? "flex" : "none";
  if (mlEndereco) mlEndereco.required = Boolean(ehEntrega);
  if (mlPrevisaoEntregaTexto) {
    mlPrevisaoEntregaTexto.textContent = `Previsão: ${calcularPrevisaoEntrega(tipo)}`;
  }

  const metodo = mlPagamento?.value || "Pix na hora";
  const ehPix = metodo === "Pix na hora";
  const ehCartao = metodo === "Cartão na hora";

  if (mlPixGrupo) mlPixGrupo.style.display = ehPix ? "flex" : "none";
  if (mlCartaoGrupo) mlCartaoGrupo.style.display = ehCartao ? "flex" : "none";
}

function abrirCheckoutEstiloMercadoLivre() {
  if (carrinho.length === 0) return;

  fecharCarrinho();

  if (mlMensagemPedido) {
    mlMensagemPedido.style.color = "#475569";
    mlMensagemPedido.textContent = "";
  }
  if (btnConfirmarPedido) btnConfirmarPedido.disabled = false;

  const totalUnidades = carrinho.reduce((acc, item) => acc + (Number(item.qtd) || 0), 0);
  const totalValor = carrinho.reduce(
    (acc, item) => acc + (Number(item.preco) || 0) * (Number(item.qtd) || 0),
    0
  );

  if (mlResumoItens) {
    mlResumoItens.innerHTML = carrinho
      .map((item) => {
        const subtotal = (Number(item.preco) || 0) * (Number(item.qtd) || 0);
        return `
          <div class="ml-item-linha">
            <span>${Number(item.qtd) || 1}x ${escaparHtml(item.nome)}</span>
            <strong>${formatarPreco(subtotal)}</strong>
          </div>
        `;
      })
      .join("");
  }

  if (mlQtdItens) mlQtdItens.textContent = `${totalUnidades} un.`;
  if (mlTotalValor) mlTotalValor.textContent = formatarPreco(totalValor);

  if (mlNomeCliente && !mlNomeCliente.value.trim()) {
    mlNomeCliente.value = usuarioAtual?.user_metadata?.nome || "";
  }

  atualizarCamposCheckoutML();
  modalCheckoutML?.classList.add("aberto");
}

function fecharCheckoutEstiloMercadoLivre() {
  modalCheckoutML?.classList.remove("aberto");
  if (mlMensagemPedido) mlMensagemPedido.textContent = "";
}

// ==========================================
// MEUS PEDIDOS (ACOMPANHAMENTO DO CLIENTE)
// ==========================================
function salvarIdPedidoLocal(idPedido) {
  if (idPedido === null || idPedido === undefined) return;
  const limpo = String(idPedido).trim();
  if (!/^\d+$/.test(limpo)) return;

  try {
    const atual = JSON.parse(localStorage.getItem(CHAVE_MEUS_PEDIDOS_IDS) || "[]");
    const lista = Array.isArray(atual) ? atual.map(String) : [];
    if (!lista.includes(limpo)) {
      lista.unshift(limpo);
      localStorage.setItem(CHAVE_MEUS_PEDIDOS_IDS, JSON.stringify(lista.slice(0, 20)));
    }
  } catch {
    // Falha silenciosa
  }
}

function obterIdsPedidosLocais() {
  try {
    const atual = JSON.parse(localStorage.getItem(CHAVE_MEUS_PEDIDOS_IDS) || "[]");
    if (!Array.isArray(atual)) return [];
    return atual
      .map((v) => String(v).trim())
      .filter((v) => /^\d+$/.test(v))
      .map((v) => Number(v));
  } catch {
    return [];
  }
}

function renderizarListaMeusPedidos(pedidos, mensagemVazio) {
  if (!listaMeusPedidos) return;

  if (!pedidos || pedidos.length === 0) {
    listaMeusPedidos.innerHTML = `<p style="text-align: center; color: #64748b; font-size: 13px; padding: 16px;">${escaparHtml(mensagemVazio)}</p>`;
    return;
  }

  const rotulos = {
    aguardando_pagamento: "Aguardando pagamento",
    pago: "Pago",
    separando: "Separando pedido",
    entregue: "Entregue",
    cancelado: "Cancelado"
  };

  listaMeusPedidos.innerHTML = pedidos
    .map((p) => {
      const itens = Array.isArray(p.itens) ? p.itens : [];
      const itensResumo = itens
        .map((i) => `${Number(i.qtd) || 1}x ${escaparHtml(i.nome)}`)
        .join(", ");
      const dataCompra = p.criado_em
        ? new Date(p.criado_em).toLocaleDateString("pt-BR")
        : "";
      const previsaoTexto = escaparHtml(
        p.previsao_entrega || calcularPrevisaoEntrega(p.tipo_entrega || "")
      );
      const statusLabel = escaparHtml(rotulos[p.status] || p.status || "Pago");

      return `
        <div class="ml-bloco">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 13px; color: #0f172a;">Pedido #${escaparHtml(p.id)} (${escaparHtml(dataCompra)})</strong>
            <span style="font-size: 11px; font-weight: 700; color: #1d4ed8;">${statusLabel}</span>
          </div>
          <div style="font-size: 12px; color: #15803d; font-weight: 600; margin-bottom: 4px;">
            ${previsaoTexto}
          </div>
          <div style="font-size: 12px; color: #334155; margin-bottom: 4px;">${itensResumo}</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a;">Total: ${formatarPreco(p.total)}</div>
        </div>
      `;
    })
    .join("");
}

async function abrirMeusPedidos() {
  modalMeusPedidos?.classList.add("aberto");
  if (inputBuscaPedidoId) inputBuscaPedidoId.value = "";
  if (btnLimparBuscaPedidoId) btnLimparBuscaPedidoId.style.display = "none";
  if (!listaMeusPedidos) return;

  listaMeusPedidos.innerHTML = `<p style="text-align: center; color: #64748b; font-size: 13px;">Carregando seus pedidos...</p>`;

  const idsLocais = obterIdsPedidosLocais();
  let query = supabaseClient
    .from("pedidos")
    .select("*")
    .order("criado_em", { ascending: false });

  if (usuarioAtual && idsLocais.length > 0) {
    query = query.or(`user_id.eq.${usuarioAtual.id},id.in.(${idsLocais.join(",")})`);
  } else if (usuarioAtual) {
    query = query.eq("user_id", usuarioAtual.id);
  } else if (idsLocais.length > 0) {
    query = query.in("id", idsLocais);
  } else {
    renderizarListaMeusPedidos(
      [],
      "Nenhum pedido salvo neste dispositivo. Digite o número do pedido acima para consultar."
    );
    return;
  }

  const { data, error } = await query;

  if (error) {
    listaMeusPedidos.innerHTML = `<p style="text-align: center; color: #b91c1c; font-size: 13px;">Não foi possível carregar seus pedidos.</p>`;
    return;
  }

  renderizarListaMeusPedidos(data || [], "Nenhum pedido encontrado.");
}

async function buscarPedidoPorNumero(numeroDigitado) {
  if (!listaMeusPedidos) return;
  const limpo = String(numeroDigitado || "").replace(/\D/g, "");

  if (!limpo) {
    abrirMeusPedidos();
    return;
  }

  if (btnLimparBuscaPedidoId) btnLimparBuscaPedidoId.style.display = "inline-block";
  listaMeusPedidos.innerHTML = `<p style="text-align: center; color: #64748b; font-size: 13px;">Buscando pedido #${escaparHtml(limpo)}...</p>`;

  const { data, error } = await supabaseClient
    .from("pedidos")
    .select("*")
    .eq("id", Number(limpo))
    .limit(1);

  if (error) {
    listaMeusPedidos.innerHTML = `<p style="text-align: center; color: #b91c1c; font-size: 13px;">Erro ao buscar pedido.</p>`;
    return;
  }

  const encontrados = data || [];
  if (encontrados.length > 0) {
    salvarIdPedidoLocal(encontrados[0].id);
  }

  renderizarListaMeusPedidos(
    encontrados,
    `Nenhum pedido encontrado com o número #${limpo}.`
  );
}

formBuscarPedidoPorId?.addEventListener("submit", (e) => {
  e.preventDefault();
  buscarPedidoPorNumero(inputBuscaPedidoId?.value);
});

btnLimparBuscaPedidoId?.addEventListener("click", () => {
  abrirMeusPedidos();
});

function fecharMeusPedidos() {
  modalMeusPedidos?.classList.remove("aberto");
}

// ==========================================
// VITRINE DE PRODUTOS
// ==========================================
function popularCategorias(produtos) {
  if (!filtroCategoria) return;
  const atual = filtroCategoria.value;
  const categorias = [
    ...new Set(produtos.map((p) => (p.categoria || "").trim()).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  filtroCategoria.innerHTML = `<option value="">Categorias</option>`;
  for (const cat of categorias) {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filtroCategoria.appendChild(opt);
  }
  if (categorias.includes(atual)) {
    filtroCategoria.value = atual;
  }
}

function renderizarProdutos() {
  const termo = (campoBusca?.value || "").trim().toLowerCase();
  const categoria = (filtroCategoria?.value || "").trim().toLowerCase();

  const filtrados = produtosCache.filter((p) => {
    const nome = (p.nome || "").toLowerCase();
    const cat = (p.categoria || "").toLowerCase();
    const okBusca = !termo || nome.includes(termo) || cat.includes(termo);
    const okCat = !categoria || cat === categoria;
    return okBusca && okCat;
  });

  if (!listaProdutos) return;

  if (filtrados.length === 0) {
    listaProdutos.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 24px;">Nenhum produto encontrado.</p>`;
    return;
  }

  listaProdutos.innerHTML = filtrados
    .map((p) => {
      const status = obterStatusEstoque(p.quantidade);
      const img = escaparHtml(p.imagem_url || "https://via.placeholder.com/300x200?text=Sem+Imagem");
      const nomeSeguro = escaparHtml(p.nome || "Produto sem nome");
      const catSegura = escaparHtml(p.categoria || "Geral");
      const idSeguro = escaparHtml(p.id);

      const acoes = status.disponivel
        ? `
          <div class="acoes-card">
            <button type="button" class="btn-carrinho-add" data-id="${idSeguro}">Adicionar ao carrinho</button>
          </div>
        `
        : `
          <div class="acoes-card">
            <span class="btn-desativado">Indisponível</span>
          </div>
        `;

      return `
        <article class="card">
          <div>
            <img src="${img}" alt="${nomeSeguro}" loading="lazy">
            <div class="categoria">${catSegura}</div>
            <div class="nome">${nomeSeguro}</div>
          </div>
          <div>
            <div class="preco">${formatarPreco(p.preco)}</div>
            <span class="estoque ${status.classe}">${escaparHtml(status.texto)}</span>
            ${acoes}
          </div>
        </article>
      `;
    })
    .join("");
}

async function carregarProdutos() {
  if (!listaProdutos) return;
  listaProdutos.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #64748b; padding: 24px;">Carregando produtos...</p>`;

  const { data, error } = await supabaseClient
    .from("produtos")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    listaProdutos.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #b91c1c; padding: 24px;">Erro ao carregar produtos. Tente atualizar a página.</p>`;
    return;
  }

  produtosCache = data || [];
  popularCategorias(produtosCache);
  renderizarProdutos();
  renderizarCarrinho();
}

// ==========================================
// AUTENTICAÇÃO (LOGIN / REGISTRO / SENHA)
// ==========================================
function ehPrimeiraVezNoSite() {
  try {
    return !localStorage.getItem(CHAVE_PRIMEIRA_VEZ_AUTH);
  } catch {
    return false;
  }
}

function marcarQueJaVisitou() {
  try {
    localStorage.setItem(CHAVE_PRIMEIRA_VEZ_AUTH, "1");
  } catch {
    // Falha silenciosa
  }
}

function alternarModoAuth(registrar) {
  modoRegistro = registrar;
  if (authMensagem) authMensagem.textContent = "";

  if (registrar) {
    tabRegistro?.classList.add("ativa");
    tabLogin?.classList.remove("ativa");
    if (campoNomeGrupo) campoNomeGrupo.style.display = "flex";
    if (authNome) authNome.required = true;
    if (btnEsqueciSenha) btnEsqueciSenha.style.display = "none";
    if (btnSubmitAuth) btnSubmitAuth.textContent = "Criar Conta";
  } else {
    tabLogin?.classList.add("ativa");
    tabRegistro?.classList.remove("ativa");
    if (campoNomeGrupo) campoNomeGrupo.style.display = "none";
    if (authNome) authNome.required = false;
    if (btnEsqueciSenha) btnEsqueciSenha.style.display = "inline-block";
    if (btnSubmitAuth) btnSubmitAuth.textContent = "Entrar";
  }
}

function abrirModalAuth(forcarRegistro = false) {
  const iniciarNoRegistro = forcarRegistro || ehPrimeiraVezNoSite();
  marcarQueJaVisitou();
  alternarModoAuth(iniciarNoRegistro);
  modalAuth?.classList.add("aberto");
}

function fecharModalAuth() {
  modalAuth?.classList.remove("aberto");
  if (authMensagem) authMensagem.textContent = "";
}

function abrirModalNovaSenha() {
  fecharModalAuth();
  if (novaSenhaMensagem) novaSenhaMensagem.textContent = "";
  formNovaSenha?.reset();
  modalNovaSenha?.classList.add("aberto");
}

function fecharModalNovaSenha() {
  modalNovaSenha?.classList.remove("aberto");
  if (novaSenhaMensagem) novaSenhaMensagem.textContent = "";
}

function atualizarHeaderUsuario(user) {
  usuarioAtual = user;
  if (!areaAuth) return;

  if (user) {
    marcarQueJaVisitou();
    const nomeExibicao = user.user_metadata?.nome || user.email || "Conta";
    const nomeSeguro = escaparHtml(nomeExibicao);
    areaAuth.innerHTML = `
      <span class="usuario-topo" title="${nomeSeguro}">${nomeSeguro}</span>
      <button type="button" id="btnSairAuth" class="btn-sair-topo">Sair</button>
    `;
    document.getElementById("btnSairAuth")?.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
    });
  } else {
    areaAuth.innerHTML = `
      <button type="button"
              id="btnAbrirAuth"
              class="btn-icone"
              aria-label="Conta: Registrar ou Entrar"
              title="Registrar ou Entrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
      </button>
    `;
    document.getElementById("btnAbrirAuth")?.addEventListener("click", () => {
      abrirModalAuth(false);
    });
  }
}

// ==========================================
// EVENTOS
// ==========================================
btnAbrirCarrinho?.addEventListener("click", abrirCarrinho);
btnFecharCarrinho?.addEventListener("click", fecharCarrinho);
carrinhoOverlay?.addEventListener("click", (e) => {
  if (e.target === carrinhoOverlay) fecharCarrinho();
});
btnLimparCarrinho?.addEventListener("click", limparCarrinho);
btnFinalizarCarrinho?.addEventListener("click", abrirCheckoutEstiloMercadoLivre);

btnAbrirMeusPedidos?.addEventListener("click", abrirMeusPedidos);
btnFecharMeusPedidos?.addEventListener("click", fecharMeusPedidos);
modalMeusPedidos?.addEventListener("click", (e) => {
  if (e.target === modalMeusPedidos) fecharMeusPedidos();
});

listaProdutos?.addEventListener("click", (e) => {
  const btnAdd = e.target.closest(".btn-carrinho-add");
  if (btnAdd) {
    adicionarAoCarrinho(btnAdd.dataset.id);
    abrirCarrinho();
  }
});

carrinhoItens?.addEventListener("click", (e) => {
  const btnMais = e.target.closest(".btn-mais");
  if (btnMais) return alterarQtdCarrinho(btnMais.dataset.id, 1);

  const btnMenos = e.target.closest(".btn-menos");
  if (btnMenos) return alterarQtdCarrinho(btnMenos.dataset.id, -1);

  const btnRemover = e.target.closest(".btn-remover-item");
  if (btnRemover) return removerDoCarrinho(btnRemover.dataset.id);
});

mlTipoEntrega?.addEventListener("change", atualizarCamposCheckoutML);
mlPagamento?.addEventListener("change", atualizarCamposCheckoutML);
btnFecharCheckoutML?.addEventListener("click", fecharCheckoutEstiloMercadoLivre);
modalCheckoutML?.addEventListener("click", (e) => {
  if (e.target === modalCheckoutML) fecharCheckoutEstiloMercadoLivre();
});

btnCopiarPix?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(CHAVE_PIX_LOJA);
    btnCopiarPix.textContent = "Copiado!";
    setTimeout(() => {
      btnCopiarPix.textContent = "Copiar Pix";
    }, 1500);
  } catch {
    btnCopiarPix.textContent = CHAVE_PIX_LOJA;
  }
});

mlCartaoNumero?.addEventListener("input", (e) => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
  e.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
});

mlCartaoValidade?.addEventListener("input", (e) => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
  e.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
});

formCheckoutML?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (carrinho.length === 0) return;

  const formaPagamento = mlPagamento?.value || "Pix na hora";
  let detalhePagamento = "";

  if (formaPagamento === "Pix na hora") {
    if (!mlConfirmouPix?.checked) {
      if (mlMensagemPedido) {
        mlMensagemPedido.style.color = "#b91c1c";
        mlMensagemPedido.textContent = "Marque a confirmação de que realizou o pagamento Pix agora.";
      }
      return;
    }
    detalhePagamento = `Pix na hora (Chave: ${CHAVE_PIX_LOJA})`;
  } else if (formaPagamento === "Cartão na hora") {
    const numLimpo = (mlCartaoNumero?.value || "").replace(/\D/g, "");
    const titular = (mlCartaoNome?.value || "").trim();
    const validade = (mlCartaoValidade?.value || "").trim();
    const cvv = (mlCartaoCvv?.value || "").trim();

    if (!titular || numLimpo.length < 13 || validade.length < 4 || cvv.length < 3 || !mlConfirmouCartao?.checked) {
      if (mlMensagemPedido) {
        mlMensagemPedido.style.color = "#b91c1c";
        mlMensagemPedido.textContent = "Preencha os dados do cartão e marque a autorização de pagamento na hora.";
      }
      return;
    }
    detalhePagamento = `Cartão final ${numLimpo.slice(-4)} (${titular})`;
  }

  if (btnConfirmarPedido) btnConfirmarPedido.disabled = true;
  if (mlMensagemPedido) {
    mlMensagemPedido.style.color = "#475569";
    mlMensagemPedido.textContent = "Processando pagamento e registrando pedido...";
  }

  const totalValor = carrinho.reduce(
    (acc, item) => acc + (Number(item.preco) || 0) * (Number(item.qtd) || 0),
    0
  );

  const tipoEntregaEscolhida = mlTipoEntrega?.value || "Retirada na loja (Manaus - AM)";
  const previsaoEntrega = calcularPrevisaoEntrega(tipoEntregaEscolhida);

  const novoPedido = {
    user_id: usuarioAtual?.id || null,
    cliente_nome: mlNomeCliente?.value.trim() || usuarioAtual?.user_metadata?.nome || "Não informado",
    cliente_email: usuarioAtual?.email || null,
    tipo_entrega: tipoEntregaEscolhida,
    endereco: tipoEntregaEscolhida.startsWith("Entrega") ? (mlEndereco?.value.trim() || null) : null,
    forma_pagamento: formaPagamento,
    pago_na_hora: true,
    detalhe_pagamento: detalhePagamento,
    previsao_entrega: previsaoEntrega,
    troco: null,
    observacao: mlObservacao?.value.trim() || null,
    itens: carrinho.map((item) => ({
      id: item.id,
      nome: item.nome,
      preco: Number(item.preco) || 0,
      qtd: Number(item.qtd) || 0
    })),
    total: Number(totalValor.toFixed(2)),
    status: "pago"
  };

  const { data, error } = await supabaseClient
    .from("pedidos")
    .insert([novoPedido])
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao salvar pedido:", error);
    if (btnConfirmarPedido) btnConfirmarPedido.disabled = false;
    if (mlMensagemPedido) {
      mlMensagemPedido.style.color = "#b91c1c";
      mlMensagemPedido.textContent = "Não foi possível registrar o pedido. Tente novamente.";
    }
    return;
  }

  if (data?.id) {
    salvarIdPedidoLocal(data.id);
  }

  if (mlMensagemPedido) {
    mlMensagemPedido.style.color = "#15803d";
    mlMensagemPedido.textContent = `Pedido #${data?.id || ""} confirmado! ${previsaoEntrega}.`;
  }

  limparCarrinho();
  formCheckoutML.reset();
  if (mlConfirmouPix) mlConfirmouPix.checked = false;
  if (mlConfirmouCartao) mlConfirmouCartao.checked = false;
  atualizarCamposCheckoutML();

  setTimeout(() => {
    fecharCheckoutEstiloMercadoLivre();
    abrirMeusPedidos();
  }, 1400);
});

tabLogin?.addEventListener("click", () => alternarModoAuth(false));
tabRegistro?.addEventListener("click", () => alternarModoAuth(true));
btnFecharAuth?.addEventListener("click", fecharModalAuth);
modalAuth?.addEventListener("click", (e) => {
  if (e.target === modalAuth) fecharModalAuth();
});

btnEsqueciSenha?.addEventListener("click", async () => {
  if (!authEmail || !authMensagem || !btnEsqueciSenha) return;

  const email = authEmail.value.trim();
  if (!email) {
    authMensagem.style.color = "#b91c1c";
    authMensagem.textContent = "Digite seu e-mail acima e clique em 'Esqueceu sua senha?'.";
    authEmail.focus();
    return;
  }

  authMensagem.style.color = "#475569";
  authMensagem.textContent = "Enviando link de recuperação...";
  btnEsqueciSenha.disabled = true;

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });

  btnEsqueciSenha.disabled = false;

  if (error) {
    authMensagem.style.color = "#b91c1c";
    authMensagem.textContent = error.message || "Erro ao enviar e-mail de recuperação.";
    return;
  }

  authMensagem.style.color = "#15803d";
  authMensagem.textContent = "Link enviado! Verifique sua caixa de entrada e spam.";
});

formAuth?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!authEmail || !authSenha || !authMensagem || !btnSubmitAuth) return;

  const email = authEmail.value.trim();
  const password = authSenha.value;

  authMensagem.style.color = "#475569";
  authMensagem.textContent = modoRegistro ? "Criando conta..." : "Entrando...";
  btnSubmitAuth.disabled = true;

  if (modoRegistro) {
    const nome = authNome?.value.trim() || "";
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { nome } }
    });

    btnSubmitAuth.disabled = false;

    if (error) {
      authMensagem.style.color = "#b91c1c";
      authMensagem.textContent = error.message || "Não foi possível criar a conta.";
      return;
    }

    authMensagem.style.color = "#15803d";
    if (data.session) {
      authMensagem.textContent = "Conta criada e login realizado!";
      formAuth.reset();
      setTimeout(fecharModalAuth, 700);
    } else {
      authMensagem.textContent = "Conta criada! Confira seu e-mail para confirmar.";
      formAuth.reset();
    }
  } else {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    btnSubmitAuth.disabled = false;

    if (error) {
      authMensagem.style.color = "#b91c1c";
      authMensagem.textContent = "E-mail ou senha incorretos.";
      return;
    }

    formAuth.reset();
    fecharModalAuth();
  }
});

btnFecharNovaSenha?.addEventListener("click", fecharModalNovaSenha);
modalNovaSenha?.addEventListener("click", (e) => {
  if (e.target === modalNovaSenha) fecharModalNovaSenha();
});

formNovaSenha?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!novaSenhaInput || !confirmarNovaSenhaInput || !novaSenhaMensagem || !btnSalvarNovaSenha) return;

  const senha1 = novaSenhaInput.value;
  const senha2 = confirmarNovaSenhaInput.value;

  if (senha1 !== senha2) {
    novaSenhaMensagem.style.color = "#b91c1c";
    novaSenhaMensagem.textContent = "As senhas não coincidem.";
    return;
  }

  novaSenhaMensagem.style.color = "#475569";
  novaSenhaMensagem.textContent = "Atualizando senha...";
  btnSalvarNovaSenha.disabled = true;

  const { error } = await supabaseClient.auth.updateUser({
    password: senha1
  });

  btnSalvarNovaSenha.disabled = false;

  if (error) {
    novaSenhaMensagem.style.color = "#b91c1c";
    novaSenhaMensagem.textContent = error.message || "Não foi possível atualizar a senha.";
    return;
  }

  novaSenhaMensagem.style.color = "#15803d";
  novaSenhaMensagem.textContent = "Senha alterada com sucesso!";
  formNovaSenha.reset();
  setTimeout(fecharModalNovaSenha, 900);
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================
supabaseClient.auth.onAuthStateChange((event, session) => {
  atualizarHeaderUsuario(session?.user || null);
  if (event === "PASSWORD_RECOVERY") {
    abrirModalNovaSenha();
  }
});

supabaseClient.auth.getSession().then(({ data }) => {
  atualizarHeaderUsuario(data?.session?.user || null);
});

campoBusca?.addEventListener("input", renderizarProdutos);
filtroCategoria?.addEventListener("change", renderizarProdutos);

renderizarCarrinho();
carregarProdutos();