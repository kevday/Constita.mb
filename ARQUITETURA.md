# Arquitetura da plataforma multiloja — proposta

Documento de **design** (nada aqui está implementado). Descreve como transformar o
site atual, que serve uma loja, em uma plataforma que serve várias lojas, cada uma
com seu próprio visual (cores e fontes), painel, domínio e meios de pagamento
(Pix, débito, crédito e crédito parcelado) com o menor custo possível.

> Os valores de taxas citados vêm de fontes públicas pesquisadas em **09/10/2026**,
> de datas e qualidade diferentes. Servem para **comparar ordens de grandeza**, não
> para decidir. Peça a tabela oficial e negocie antes de assinar com qualquer provedor.

---

## 1. Resumo das decisões recomendadas

| Tema | Recomendação |
|------|--------------|
| Modelo | **Multi-tenant**: um código, um banco, várias lojas separadas por `tenant_id`. |
| Vitrine | Continua **estática e rápida**: lê um *snapshot* publicado em CDN, não consulta banco. |
| Painel | Passa a falar com uma **API com login** (sai o token do GitHub). Reaproveita quase toda a interface atual. |
| Tema | Cores, fontes e estilo por loja em **tokens** (variáveis CSS), com presets, verificador de contraste e pré-visualização ao vivo. |
| Pagamentos | A **conta do provedor é do lojista** (a plataforma não toca no dinheiro). Camada `PaymentProvider` troca de provedor sem reescrever o checkout. |
| Menor taxa | **Pix como padrão** (com desconto opcional), débito logo depois, crédito parcelado com **juros repassados ao comprador** por padrão e limite de parcelas. |
| Domínio | Subdomínio automático (`loja.suaplataforma.com.br`) + domínio próprio com TLS automático. |
| Mensalidade | Cobrada à parte, por **Pix Automático ou cartão recorrente**, com bloqueio gradual por inadimplência. |
| Fases | Piloto sem backend → núcleo multiloja → pedidos + Pix → cartão e parcelado → frete real e SEO. |

---

## 2. Visão geral

```
Cliente ─► Edge/CDN ──────────► Catálogo publicado (JSON + imagens, por loja)
              │ checkout
              ▼
Lojista ─► Painel ─► API da plataforma ◄──► Banco de dados (todas as lojas)
                          │   ▲
                          │   └─ webhooks (pagamento pago, estornado)
                          ├────────► Provedor de pagamento (Pix, débito, crédito)
                          ├────────► Frete (Melhor Envio / tabela própria)
                          └────────► Cobrança da mensalidade
```

Três ideias sustentam o desenho:

1. **Leitura é estática, escrita é dinâmica.** O visitante só baixa arquivos
   (barato e rápido, aguenta pico). Só o painel e o checkout falam com a API.
2. **Tudo que decide dinheiro e estoque acontece no servidor** (preço final,
   cupom, frete, baixa de estoque). O navegador nunca é fonte de verdade.
3. **O provedor de pagamento é plugável** e a custódia do dinheiro fica com o lojista.

---

## 3. Multi-tenancy

### 3.1 Como a loja é identificada
1. A requisição chega em `loja.suaplataforma.com.br` ou `www.lojadocliente.com.br`.
2. O **Edge** (Cloudflare Worker ou Caddy) consulta um cache `domínio → tenant_id`
   e a versão publicada atual.
3. O Edge devolve o HTML da vitrine com o **tema da loja já inlinado** (sem piscar)
   e as metatags de SEO/compartilhamento; o JS carrega `produtos.json` da CDN.

### 3.2 Isolamento entre lojas
- Toda tabela de negócio tem `tenant_id`. No Postgres, **Row Level Security**: a
  conexão de cada requisição define `app.tenant_id` e a política só deixa ver
  linhas daquela loja.
- Testes automáticos que tentam ler/gravar dados de outra loja (devem falhar).
- Arquivos em `tenants/{tenant_id}/...` no armazenamento; URLs assinadas para upload.
- Segredos de cada loja (chaves do provedor) **criptografados** (AES-GCM com chave
  mestra fora do banco) e nunca devolvidos ao navegador.

### 3.3 Domínios
- **Subdomínio curinga** (`*.suaplataforma.com.br`) com um certificado só.
- **Domínio próprio**: o lojista aponta um `CNAME`; o sistema valida e emite TLS
  automaticamente (Cloudflare for SaaS *custom hostnames*, ou Caddy com *on-demand TLS*
  consultando um endpoint seu que autoriza só domínios cadastrados).
- Redirecionar `www` ↔ raiz e forçar HTTPS.

---

## 4. Temas: cores e fontes por loja

O site atual já usa variáveis CSS (`--bg`, `--ink`, `--line`…). A plataforma apenas
passa a **preencher essas variáveis por loja**.

### 4.1 Especificação (`tema` na configuração da loja)

Já **implementada** no site atual (`tema.js` + `admin/temas.html`); na plataforma, o mesmo bloco passa a
ficar em `tenants.tema` (JSONB) e é servido no snapshot.

```json
{
  "tema": {
    "preset": "atelier",
    "cores": {
      "fundo": "#faf8f4", "cartao": "#f3eee6", "texto": "#1c1814", "suave": "#6f655b", "linha": "#e6dfd4",
      "destaque": "#1c1814", "destaqueTexto": "#faf8f4", "botao": "#1c1814", "botaoTexto": "#faf8f4"
    },
    "escuro": { "modo": "auto" },
    "fontes": { "titulo": "Cormorant Garamond", "texto": "Inter", "pesoTitulo": 0,
                "caixaTitulo": "normal", "espacoTitulo": 0, "tamanhoBase": 15 },
    "forma":  { "raio": 0, "botao": "quadrado" },
    "layout": { "cabecalho": "fixo", "abertura": "centro", "cartao": "limpo", "proporcao": "3/4",
                "colunasMobile": 2, "colunasDesktop": 4, "densidade": "confortavel" }
  }
}
```

### 4.2 Como é aplicado
- No site atual o `tema.js` gera o CSS no navegador (e guarda o último tema em cache para não piscar). Na plataforma o Edge injeta um `<style id="tema">:root{--bg:…;--ink:…}</style>` **no HTML inicial**
  (evita o "flash" de cores erradas) e `<link rel="preload">` da fonte principal.
- O modo escuro usa o mesmo conjunto de variáveis em `prefers-color-scheme: dark`
  (valores do bloco `escuro`, ou derivados automaticamente quando ausentes).
- `forma.raio`, `densidade` e `layout` viram variáveis extras (`--raio`, `--gap`, …).

### 4.3 Presets
Pontos de partida que o lojista só ajusta: **Atelier** (o visual atual: Cormorant
Garamond + Inter, creme/marrom/verde), **Minimal** (branco, preto, Inter),
**Vibrante** (cor de destaque forte, cantos arredondados), **Noturno** (escuro por padrão).

### 4.4 Qualidade garantida
- **Verificador de contraste (WCAG AA, 4,5:1)** no editor: avisa e sugere o ajuste mais
  próximo quando texto/fundo ou texto/botão não passam. Fórmula:
  `L = 0,2126 R + 0,7152 G + 0,0722 B` (canais linearizados); contraste = `(L1 + 0,05) / (L2 + 0,05)`.
- **Derivação automática**: a partir de 2–3 cores escolhidas (fundo, texto, destaque) o
  sistema calcula `suave`, `linha`, `cartão` e a versão escura; o lojista só mexe nas
  demais se quiser ("modo avançado").

### 4.5 Fontes
- **Lista curada (20–30 famílias)**, entre serifadas, sem serifa e de exibição, **hospedadas por você**
  (WOFF2 recortado para latim, `font-display: swap`). Evita depender de servidor externo
  (mais rápido e mais simples para a LGPD).
- Máximo de **2 famílias** por loja e poucos pesos (carrega rápido).
- Fonte própria (upload de WOFF2) apenas em plano superior, com validação de tipo e tamanho.
- Cada fonte tem uma *pilha de fallback* (`Georgia, serif` / `system-ui, sans-serif`).

### 4.6 Pré-visualização ao vivo
O painel mostra a vitrine num `<iframe>`; ao mexer num seletor, o painel envia os tokens
por `postMessage` e o iframe atualiza as variáveis sem recarregar. "Publicar tema" grava
uma nova versão (com histórico e botão de reverter).

---

## 5. Modelo de dados (núcleo)

| Tabela | Campos principais |
|--------|-------------------|
| `tenants` | `id`, `slug`, `nome`, `plano`, `status` (trial, ativa, em_atraso, suspensa), `tema` (JSONB), `config` (JSONB: WhatsApp, horário, textos) |
| `domains` | `tenant_id`, `host`, `principal`, `tls_status`, `verificado_em` |
| `users` / `memberships` | usuário (e-mail, senha com Argon2id ou link mágico) e papel por loja (`dono`, `editor`) |
| `categories` | `tenant_id`, `nome`, `slug`, `ordem` |
| `products` | `tenant_id`, `sku`, `nome`, `descricao_md`, `preco`, `preco_antigo`, `promo_ate`, `ativo`, `ordem`, `categoria_id` |
| `variants` | `product_id`, `tamanho`, `cor`, `sku_variacao`, **`estoque`**, `preco` (opcional) |
| `media` | `product_id`, `tipo` (foto, video), `url`, `poster_url`, `ordem`, `alt` |
| `coupons` | `tenant_id`, `codigo`, `tipo`, `valor`, `minimo`, `valido_ate`, `so_sem_promo`, **`limite_uso`**, `usos` |
| `shipping_rules` | `tenant_id`, `nome`, `faixas_cep`, `valor`, `prazo`, `gratis_acima` |
| `orders` | `tenant_id`, `numero`, `cliente`, `endereco`, `subtotal`, `desconto`, `frete`, `total`, `status`, `metodo`, `expira_em` |
| `order_items` | `order_id`, `variant_id`, `nome`, `sku`, `preco_unit`, `qtd` (copiados no momento da compra) |
| `payments` | `order_id`, `provedor`, `id_externo`, `metodo`, `parcelas`, `valor`, `taxa_estimada`, `status`, `pago_em` |
| `webhook_events` | `provedor`, `id_evento` (único), `payload`, `processado_em` (idempotência) |
| `subscriptions` | `tenant_id`, `plano`, `status`, `proxima_cobranca`, `metodo` |
| `audit_log` | quem, quando, o quê (publicações, mudança de chaves, reembolsos) |
| `catalog_versions` | `tenant_id`, `versao`, `hash`, `publicado_em` (base do histórico e do "desfazer") |

Observações:
- **Variação (tamanho × cor) passa a ter estoque próprio.** O SKU da variação já segue o
  padrão do site atual (`BLU-BAS-001-M-PRE`).
- Itens do pedido guardam **cópia** de nome, SKU e preço: mudar o catálogo depois não altera pedidos antigos.

---

## 6. Publicação do catálogo e vitrine

1. O lojista edita no painel (a API grava no banco).
2. **Publicar** gera um *snapshot*: `site.json` e `produtos.json` (mesmo formato de hoje)
   mais imagens otimizadas, em `tenants/{id}/v{N}/…`, com cache imutável.
3. Um ponteiro curto (`current.json`, cache de 30–60 s) aponta para a versão ativa.
4. A vitrine lê o ponteiro e baixa os arquivos da CDN. **Nenhum acesso ao banco para navegar.**
5. "Desfazer" = apontar o ponteiro para uma versão anterior.

Para o **SEO** (essencial para vender), o Edge também gera:
- páginas por peça `/p/{slug}` com título, descrição e imagem de compartilhamento (Open Graph);
- `sitemap.xml` e `robots.txt` por loja;
- dados estruturados `schema.org/Product` (preço, disponibilidade, SKU).

**Imagens e vídeos:** upload direto para o armazenamento por URL assinada; um *worker* gera
variações WebP/AVIF (400/800/1400 px) e o pôster do vídeo. Vídeo em serviço próprio
(Cloudflare Stream, Bunny) ou limitado a clipes curtos como hoje.

---

## 7. Painel do lojista

Reaproveita quase tudo do `admin/index.html` atual; muda a **fonte dos dados**:

| Hoje | Na plataforma |
|------|---------------|
| Token do GitHub no navegador | Login (e-mail + senha ou link mágico) com sessão por cookie `HttpOnly` |
| Commit com fotos + JSON | `PUT /api/catalogo` + `POST /api/publicar` |
| Histórico = commits do Git | `catalog_versions` com "restaurar versão" |
| CSV, SKU, duplicar, reordenar, busca | Mantidos (a lógica de tela é a mesma) |
| Aba "Configuração do site" | Mantida + novas abas **Aparência** (tema), **Pagamentos**, **Entrega**, **Pedidos**, **Plano** |

Novas telas: **Pedidos** (lista, status, impressão, mensagem pronta para o cliente no
WhatsApp), **Estoque** por variação, **Relatórios** simples (vendas, peças sem foto, sem estoque).

---

## 8. Pedidos, estoque e checkout

### 8.1 Dois modos por loja
- **Modo WhatsApp** (como hoje): o carrinho vira mensagem pronta. Bom para quem não quer pagamento online.
- **Modo checkout**: pedido criado na plataforma, pagamento online, baixa de estoque automática.

### 8.2 Fluxo do checkout
1. O cliente informa dados e CEP; o servidor **recalcula** tudo (preços, promoções, cupom, frete) — o total do navegador é só uma prévia.
2. Cria o pedido `aguardando_pagamento` e **reserva o estoque** de forma atômica:
   `UPDATE variants SET estoque = estoque - $q WHERE id = $id AND estoque >= $q`
   (se não afetar linha, a peça acabou — o cliente é avisado na hora).
3. Cria a cobrança no provedor e mostra Pix (QR + copia e cola) ou o formulário do cartão.
4. O **webhook** do provedor confirma o pagamento → pedido `pago` → notifica o lojista (e-mail/WhatsApp) e o cliente.
5. Reservas **expiram** (Pix: 30 min; cartão: imediato) e um job devolve o estoque.

### 8.3 Regras que eliminam fraudes simples
- Cupom e preço **só valem se validados no servidor**; limite de usos por cupom (e por cliente).
- Idempotência por pedido e por evento de webhook (nunca baixar estoque duas vezes).
- Limite de tentativas (rate limit) no checkout, nos cupons e no cálculo de CEP.

---

## 9. Pagamentos

### 9.1 Quem segura o dinheiro (decisão central)

| Modelo | Como funciona | Prós | Contras |
|--------|---------------|------|---------|
| **A. Conta do lojista** *(recomendado para começar)* | Cada lojista abre conta no provedor e conecta à plataforma (chave/OAuth). O dinheiro cai direto nele. | Plataforma **não custodia** valores nem vira instituição regulada; menor risco; o lojista negocia a própria taxa. | Cada lojista passa pelo cadastro (KYC) do provedor; um pouco mais de atrito. |
| **B. Subcontas com *split*** | Provedor cria subcontas por loja; a plataforma pode reter uma taxa por venda. | Onboarding mais suave; receita por transação possível. | Mais responsabilidades contratuais; depende dos recursos do provedor. |
| **C. Plataforma como subadquirente** | Você recebe e repassa. | Controle total. | Exige autorização/capital e assume fraude e estorno. **Não recomendado.** |

Comece em **A**; migre para **B** só se houver demanda e retorno.

### 9.2 Camada de provedores (`PaymentProvider`)

O checkout nunca fala com um provedor específico; fala com uma interface. Esboço em Rust:

```rust
#[async_trait::async_trait]
pub trait PaymentProvider: Send + Sync {
    /// Pix: devolve QR (copia e cola) e validade
    async fn criar_pix(&self, req: PixReq) -> Result<PixCobranca>;
    /// Cartão: o token vem do formulário seguro do provedor (o servidor nunca vê o número)
    async fn cobrar_cartao(&self, req: CartaoReq) -> Result<Cobranca>; // débito ou crédito, com `parcelas`
    /// Opções de parcelamento com o total de cada uma (juros calculados pelo provedor)
    async fn simular_parcelas(&self, valor: Centavos, bandeira: Option<Bandeira>) -> Result<Vec<Parcelamento>>;
    async fn estornar(&self, id_externo: &str, valor: Option<Centavos>) -> Result<Estorno>;
    fn verificar_webhook(&self, cabecalhos: &Headers, corpo: &[u8]) -> Result<EventoPagamento>;
}
```

Valores sempre em **centavos inteiros** (nunca `float`). Cada loja guarda qual provedor
usa para Pix e qual para cartão (podem ser diferentes).

### 9.3 Fluxo por meio de pagamento

| Meio | Fluxo | Observações |
|------|-------|-------------|
| **Pix** | Cobrança com validade → QR/copia e cola → webhook "pago" | Padrão da loja. Aceita **desconto por pagar com Pix** (ex.: 5%), calculado no servidor. |
| **Débito** | Cartão tokenizado + autenticação 3-D Secure → webhook | Taxa em geral abaixo do crédito. |
| **Crédito à vista** | Cartão tokenizado → autorização/captura | Recebe em D+30 ou antecipa por taxa extra, conforme contrato. |
| **Crédito parcelado** | Igual ao à vista com `parcelas = n` | Taxa **cresce por parcela**. Ver 9.5 (quem paga os juros). |
| **Pix parcelado** *(quando o provedor oferecer)* | Cliente parcela no próprio banco; lojista recebe à vista | Modalidade regulada pelo Banco Central, em vigor desde 2025; **disponibilidade e taxa dependem do provedor**: habilite por *flag*. |
| **Boleto** *(opcional, baixa prioridade)* | Boleto com vencimento | Compensação lenta; só se a loja pedir. |

### 9.4 Cartão sem tocar nos dados do cartão (PCI)
- Use o **formulário hospedado / campos seguros do provedor** (iframe ou SDK que devolve um *token*).
  O número do cartão **nunca passa pelo seu servidor** → escopo PCI mínimo (SAQ A).
- Nada de gravar PAN, CVV ou validade. Guarde só o token, os 4 últimos dígitos e a bandeira.

### 9.5 Estratégia para a **menor taxa possível**

1. **Pix primeiro.** Na vitrine do checkout, Pix aparece como opção padrão. Para o lojista ele costuma ser o meio mais barato;
   o desconto de 3–5% para Pix ainda sai mais em conta que a taxa de cartão.
2. **Taxa fixa × percentual.** Provedores de Pix cobram % (≈ 0,8–1,2%) ou valor fixo por transação
   (≈ R$ 0,80). Ponto de equilíbrio: **valor fixo ÷ % = ticket** (R$ 0,80 ÷ 0,8% = R$ 100). Para ticket médio de moda (R$ 150–300),
   o **valor fixo costuma ser mais barato**; para tickets abaixo de R$ 100, o percentual.
3. **Parcelado com juros do comprador (padrão).** O comprador vê "3x de R$ X (total R$ Y)". Custo do parcelamento
   não corrói a margem. "Sem juros" é **opção do lojista**, mostrando antes quanto cada parcela custa para ele.
   - Para receber líquido `V` com taxa `f`, cobre `V ÷ (1 − f)` (*gross-up*). Valores exatos vêm de `simular_parcelas()`.
4. **Limites inteligentes:** parcela mínima (ex.: R$ 5 a R$ 10), máximo de parcelas por faixa de valor (ex.: até 3x abaixo de R$ 100, 6x até R$ 300, 10x acima).
5. **Débito promovido** no checkout (taxa menor que a do crédito).
6. **Roteamento por provedor:** Pix num provedor barato de Pix, cartão num provedor de cartão competitivo (a interface permite).
7. **Negociação por volume**: com várias lojas, a plataforma negocia taxa-base para todas (mantendo o modelo A).
8. **Antecipação sob controle:** só se o lojista pedir; mostrar o custo.
9. **Painel de custos:** cada pagamento grava `taxa_estimada`; o lojista vê "quanto paguei de taxa no mês" e por meio.

### 9.6 Comparativo de provedores (indicativo, não oficial)

| Provedor | Pix | Cartão | Recursos úteis | Observação |
|----------|-----|--------|----------------|------------|
| **Asaas** | Cobrança Pix, Pix Automático | Crédito/débito, parcelado, link de pagamento | Subcontas, recorrência (Pix, cartão, boleto), API madura, SCD autorizada pelo BC | Bom candidato único para MVP (loja **e** mensalidade). |
| **Mercado Pago** | ≈ 0,99% em checkout/link (dado de 2025) | Crédito à vista ≈ 3,99–4,98% no checkout (dado de 2025); parcelado em até 12x | Marca conhecida pelo comprador; checkout pronto; Pix com cartão parcelado | Cartão tende a ser mais caro; confiança do comprador alta. |
| **Pagar.me (Stone)** | Relatos de ≈ 0,78%; páginas comparativas citam a partir de 1,19% | Sob consulta | Recebedores/*split*, API | Taxas "sob consulta": negocie. |
| **Woovi** | ≈ 0,8% (relato de usuários) | — | Focado em Pix | Bom como provedor só de Pix. |
| **AbacatePay** | ≈ R$ 0,80 fixo por Pix (relato) | Cartão com valor fixo + % | Simples para dev | Fixo costuma compensar acima de ~R$ 100 de ticket. |
| **Efí** | Pix por API | Cartão | API Pix padrão do Banco Central | Verificar tabela vigente. |
| **Stripe** | Pix e cartão no Brasil | Cartão | *Connect* (subcontas), ótimo SDK | Verificar tarifas no Brasil. |

**Como decidir de verdade (bake-off):** peça proposta a 3 provedores usando uma mesma cesta:
ticket médio R$ 180, 55% Pix, 10% débito, 20% crédito à vista, 15% crédito parcelado (média de 3x),
e compare o custo mensal total para 10, 100 e 1.000 pedidos, **incluindo taxa fixa por transação,
tarifa de saque e prazo de recebimento**.

Exemplo ilustrativo (ticket R$ 200, **valores hipotéticos** só para mostrar a diferença):

| Meio | Taxa hipotética | Custo |
|------|-----------------|-------|
| Pix (% baixo) | 0,8% | R$ 1,60 |
| Pix (fixo) | R$ 0,80 | R$ 0,80 |
| Débito | 1,9% | R$ 3,80 |
| Crédito à vista | 4,0% | R$ 8,00 |

### 9.7 Webhooks, conciliação e estornos
- Verificar **assinatura** de todo webhook; gravar em `webhook_events` (`id_evento` único) antes de processar → **idempotente**.
- Responder 2xx rápido e processar em fila; reprocessar eventos que falharam.
- **Conciliação diária:** job compara pedidos "aguardando" com o status real no provedor (cobre webhook perdido).
- Estorno parcial/total pelo painel; reverter estoque quando aplicável.
- **Chargeback:** alerta ao lojista com prazo e instruções (o provedor conduz a disputa).

---

## 10. Mensalidade da plataforma

- Cobrança recorrente **separada** do dinheiro das lojas: **Pix Automático** (autorização única do cliente,
  barato) ou cartão recorrente, via Asaas ou Stripe.
- Planos com limites (peças, armazenamento, vídeos, domínio próprio, fonte própria, usuários).
- **Ciclo de inadimplência:** aviso (D+1, D+3) → faixa no painel → "modo leitura" (loja no ar, edição travada) → suspensão após o prazo → dados mantidos por X dias.
- **Teste grátis** de 7–14 dias com poucos recursos de risco (sem pagamento online até configurar o provedor).
- Exportação de dados (CSV + JSON) disponível sempre — confiança e requisito de portabilidade.

---

## 11. Frete

- **Tabela por faixa de CEP** (como hoje) como base e *fallback*.
- **Cotação em tempo real** (Melhor Envio ou Correios) por peso e dimensões, com o token/OAuth **da loja**, guardado cifrado.
- Cada peça ganha peso e dimensões (padrão por categoria para facilitar).
- Cache de cotações por CEP/pacote (minutos) e limite de chamadas.
- Retirada na loja e frete grátis acima de um valor continuam configuráveis.

---

## 12. Segurança, privacidade e conformidade

| Área | Medidas |
|------|---------|
| Autenticação | Senha com Argon2id, link mágico, 2FA opcional (TOTP), sessão `HttpOnly` + `SameSite`, proteção CSRF |
| Autorização | Papéis por loja; todas as consultas passam pelo `tenant_id` + RLS |
| Entradas | Validação no servidor; descrição em Markdown **escapada** (como já é); CSP restritiva; sanitização de uploads (tipo, tamanho, varredura) |
| Segredos | Chaves de provedor cifradas; rotação; nunca em logs |
| Rede | Rate limiting, proteção contra bots no checkout, WAF/CDN |
| Backups | Banco com backup diário + ponto no tempo; teste de restauração mensal; armazenamento replicado |
| Observabilidade | Logs estruturados sem dados sensíveis, métricas, alertas (erro de webhook, fila parada, queda de aprovação) e página de status |
| LGPD | Política de privacidade e termos por loja (modelo), minimizar dados do comprador, retenção definida, canal de titular, contrato operador/controlador entre plataforma e lojista |
| Consumidor | Itens obrigatórios na loja (identificação do vendedor, política de troca e arrependimento no comércio eletrônico) — modelo no painel, **revisão por advogado** |
| Fiscal | A nota fiscal é responsabilidade do lojista; prever integração futura (Bling, Tiny, NFe.io) |

> Esta seção é um roteiro técnico, não aconselhamento jurídico ou contábil.

---

## 13. Infraestrutura e custo (ordem de grandeza)

| Componente | Opção sugerida | Observação |
|------------|----------------|-----------|
| API | Rust (axum + sqlx) em contêiner numa VPS Alpine **ou** BaaS (Supabase) para sair mais rápido | Rust: você já domina; custo baixo. BaaS: menos operação, mais dependência. |
| Banco | PostgreSQL com RLS | Na VPS (com backup) ou gerenciado. |
| Edge / CDN / TLS | Cloudflare (Workers, R2, custom hostnames) ou Caddy + CDN | R2 não cobra saída de dados. |
| Arquivos | Armazenamento compatível com S3 (R2, Backblaze B2, MinIO) | Variações de imagem geradas por worker. |
| Fila/jobs | Fila no próprio Postgres (ou Redis) | Expirar reservas, conciliar, gerar imagens. |
| E-mail | Serviço transacional (Resend, Postmark, SES) | Pedido pago, convite, cobrança. |
| Monitoramento | Sentry + uptime | Alertas no WhatsApp/Telegram. |

Custos fixos iniciais ficam, em geral, na casa de **dezenas de reais por mês** (VPS, domínio,
e-mail, CDN) e crescem devagar com o número de lojas; os maiores custos reais são **suporte** e
**taxas dos provedores** (que o lojista paga). Cote com valores atuais antes de definir o preço dos planos.

---

## 14. Do código atual para a plataforma

| Peça atual | Destino |
|-----------|---------|
| `index.html` (vitrine, carrinho, popup, busca, vídeo) | **Mantido** como motor da vitrine; troca a origem de dados (`data/*.json` → URL do snapshot) e ganha o tema inlinado. |
| `admin/index.html` | Interface mantida; trocar o módulo "GitHub" por chamadas à API; adicionar login. |
| `data/site.json`, `data/produtos.json` | Viram o **formato do snapshot** (compatível). |
| Cupons e frete no navegador | Passam a ser **validados no servidor**; continuam exibidos na vitrine. |
| Markdown, SKU, CSV, promoções, reordenar | Lógica mantida; SKU/CSV passam a rodar também no servidor. |
| Estoque manual | Estoque por variação com baixa automática. |
| Carrinho no `localStorage` | Mantido como rascunho; pedido real nasce no servidor. |

---

## 15. Roadmap em fases

| Fase | Entrega | Resultado |
|------|---------|-----------|
| **0 — Piloto (agora)** | 3–5 lojas com o código atual (um repositório por loja, você opera a hospedagem). | Valida preço, dores e suporte **sem** construir backend. |
| **1 — Núcleo multiloja** | Banco, login, API de catálogo, publicação por snapshot, subdomínios, **temas (cores e fontes)**. | Várias lojas no mesmo sistema; painel sem GitHub. |
| **2 — Pedidos + Pix** | Checkout, reserva de estoque, provedor de Pix, webhooks, tela de pedidos, notificações. | Primeira venda 100% online, com custo mínimo. |
| **3 — Cartão e parcelado + cobrança** | Cartão (débito, crédito, parcelado), regras de parcelas, painel de custos, mensalidade (Pix Automático/cartão). | Receita recorrente e checkout completo. |
| **4 — Escala e SEO** | Domínio próprio com TLS automático, páginas por peça, sitemap, frete em tempo real, relatórios. | Pronto para vender o plano a mais lojistas. |
| **5 — Refino** | Pix parcelado, subcontas/*split* (se fizer sentido), integração fiscal, app para pedidos. | Diferenciais. |

Ordem de grandeza para **um desenvolvedor**: fase 1 em semanas, fases 2–3 em mais alguns meses
(o prazo real depende do tempo semanal disponível). Faça a Fase 0 em paralelo.

---

## 16. Riscos e decisões em aberto

**Riscos**
- Suporte consumir o tempo do produto → portal de ajuda, vídeos curtos, onboarding guiado, limites por plano.
- Dependência de um único provedor → interface `PaymentProvider` desde o início.
- Estoque inconsistente → reserva atômica + conciliação diária.
- Fraude e chargeback → 3-D Secure, limites, revisão de pedidos de alto valor, regras por valor.
- Aspectos legais/fiscais → advogado e contador antes de cobrar; termos e privacidade por loja.

**Decisões que dependem de você**
1. **Stack:** Rust + Postgres próprio *ou* BaaS para o MVP?
2. **Provedor inicial:** um só (ex.: Asaas) para loja e mensalidade, ou separar Pix e cartão?
3. **Modelo de custódia:** A (conta do lojista) para começar — confirmar.
4. **Padrão de parcelamento:** juros do comprador (recomendado) ou sem juros até Nx?
5. **Domínio e marca** da plataforma.
6. **Planos e preços** (depois do piloto).
7. **Entidade jurídica** para contratar provedores e cobrar mensalidade.
