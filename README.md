# CONSTITA — site e painel de administração

Site estático (HTML + JS puros, sem build) que lê o conteúdo de dois arquivos JSON.
Funciona na Vercel, no GitHub Pages ou em qualquer servidor que entregue arquivos.

**Versão atual: 1.3.0** — veja o [Changelog](#changelog) no final.

---

## Manual rápido

### 1. Estrutura

```
constita-site/
├── index.html            Site (vitrine, carrossel, popup de detalhes, carrinho, cupom e frete)
├── admin/index.html      Painel para cadastrar/editar peças e configurar o site
├── data/
│   ├── site.json         Textos, WhatsApp, marcas, cupons e regras de frete
│   └── produtos.json     Catálogo de peças
├── img/                  Logo (k.jpg) e fotos; fotos novas vão para img/<categoria>/
├── ROADMAP.md            Planejamento (ideias e próximos passos)
└── README.md
```

Você **não precisa editar o HTML**: tudo que muda fica nos JSONs, e o painel
`/admin/` edita os dois arquivos por você.

### 2. Testar no seu computador

O site carrega os JSONs com `fetch`, que **não funciona abrindo o arquivo com
duplo clique** (`file://`). Sirva a pasta por HTTP:

```sh
# Alpine (busybox)
cd constita-site && busybox httpd -f -p 8080

# Windows / qualquer sistema com Python
cd constita-site && python3 -m http.server 8080
```

Abra `http://localhost:8080` (site) e `http://localhost:8080/admin/` (painel).
Se algo falhar, uma faixa vermelha no topo do site mostra o motivo.

### 3. Publicar na Vercel

1. Suba o conteúdo desta pasta para um repositório no GitHub.
2. Na Vercel: **Add New → Project**, escolha o repositório. Sem framework, sem
   comando de build.
3. A cada commit na branch principal, a Vercel publica sozinha (~30 s).

### 4. Usar o painel (`/admin/`)

**Primeira vez — conectar ao GitHub**

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → *Generate*.
2. Selecione **somente este repositório** e a permissão **Contents: Read and write**.
3. No painel, abra *1. Conexão*, preencha `usuario/repositorio`, a branch
   (geralmente `main`), o token e clique em **Conectar e carregar peças**.
   Se o site estiver dentro de uma subpasta do repositório, informe a pasta.

O token fica salvo só no seu navegador. Não use em computador compartilhado.

**Adicionar peças**

1. Em *2. Adicionar peças*, **solte as fotos sobre o quadro da categoria**
   (ou clique no quadro para escolher os arquivos). Para uma categoria nova, use
   o quadro **+ Nova categoria**: digite o nome e solte as fotos.
2. As fotos são salvas em `img/<categoria>/<nome-da-peça>.jpg` (reduzidas a no
   máximo 1400 px).
3. Marque **“Fotos soltas de uma vez = uma única peça”** para criar uma peça
   com várias fotos; desmarcado, cada foto vira uma peça.
4. Em cada peça nova preencha nome, preço, tamanhos (`P, M, G`) e estoque. O
   **SKU** é preenchido sozinho. Opcionais: promoção, **cores** e **descrição**.
5. Mais fotos (ou vídeos) na mesma peça: quadro **+ foto ou vídeo**. A primeira
   mídia é a *capa*. Para **reordenar**, arraste as miniaturas ou use os botões
   **‹ ›**; clicar numa miniatura a leva para a capa; **×** remove.
6. Clique em **Publicar**. Fotos, vídeos e JSONs vão em **um único commit**.

**Vídeos curtos**

- Aceita **MP4 (H.264)** e **WEBM**, até **25 MB** e **60 s** (ideal: 5–15 s, 720p, abaixo de 8 MB).
  Arquivos maiores ou mais longos são recusados com o motivo.
- O painel gera sozinho o **pôster** (primeiro quadro, em JPG). Arquivos:
  `img/<categoria>/<nome>-video.mp4` e `img/<categoria>/<nome>-video.jpg`.
- No site, o pôster aparece como capa/miniatura (com “▶”) e, no popup, o vídeo toca
  com controles, sem som automático. Vídeo e fotos ficam na **mesma lista** e
  podem ser reordenados juntos. Remover o vídeo apaga também o pôster.
- Vídeo de iPhone (`.mov`/HEVC) pode não abrir em todos os navegadores: exporte
  como **MP4 H.264**. Muitos vídeos pesados engordam o repositório; para uma
  coleção grande, prefira vídeos curtos e leves.

**Catálogo grande: lista, busca e ordem** (*3. Peças publicadas*)

- A lista é **compacta** (30 por vez, com “Mostrar mais”): cada linha mostra
  posição, miniatura, nome, SKU, categoria, preço, estoque e etiquetas
  (*esgotada, promoção, oculta, sem foto, vídeo*). Clique em **Editar** para abrir
  nome, preço, estoque, SKU, fotos, promoção, cores e descrição. Estoque `0` mostra “Esgotado”.
- **Buscar** por nome, SKU ou categoria; filtrar por **categoria** e por
  **situação** (sem SKU, sem foto, esgotadas, em promoção, ocultas no site).
- **Reordenar peças** (a ordem do painel é a ordem da vitrine): arraste pelo **⠿**,
  use **↑ ↓ ⤒**, ou digite a **posição** no campo numérico e tecle Enter. Com
  filtro ativo, ↑ ↓ e o arrastar movem em relação às peças visíveis.
- **“Colocar as peças novas no início da vitrine”** (marcado por padrão): peças
  novas entram no topo; desmarque para irem ao fim.
- Depois de qualquer mudança, clique em **Publicar alterações**.

**SKU (código da peça)**

- Gerado automaticamente no formato `CAT-NOM-NNN`: 3 letras da **categoria**,
  3 letras da primeira palavra relevante do **nome** (ignora palavras que só
  repetem a categoria) e um **número sequencial**. Ex.: *Blusa básica manga
  curta* em *Blusas* → `BLU-BAS-001`.
- É **editável**: use letras, números e hífen (o painel converte para maiúsculas).
  Em peça nova, enquanto você não editar, o SKU acompanha mudanças de nome e
  categoria; o botão **↻** gera de novo.
- Precisa ser **único**: o painel bloqueia a publicação se houver SKU repetido.
- Peças antigas sem SKU: botão **Gerar SKUs que faltam**.
- No site, o popup mostra o SKU, e o **SKU da variação** vai para o carrinho e
  para a mensagem do WhatsApp: SKU + tamanho + 3 letras da cor. Ex.:
  `BLU-BAS-001-M-PRE` (tamanho M, cor Preto).

**Duplicar peça**: o botão **Duplicar** (nas peças publicadas e nas novas) cria
uma cópia em *Adicionar peças* com “(cópia)” no nome e **novo SKU**. A cópia
reaproveita os mesmos arquivos de foto; troque ou acrescente fotos se quiser.
Nada é publicado até você clicar em **Publicar**.

**Importar / exportar CSV** (em *3. Peças publicadas*)

- **Exportar CSV** baixa `produtos-AAAA-MM-DD.csv` (UTF-8, separador `;`), que
  abre direto no Excel/LibreOffice. Inclui edições ainda não publicadas.
- **Importar CSV** mostra uma **prévia** (novas, atualizadas, sem mudança, erros)
  antes de aplicar. Depois de aplicar, clique em **Publicar**.
- Cada linha é casada com uma peça existente pelo **SKU** e, se não houver SKU,
  pelo **nome**; senão vira peça nova (precisa de `nome` e `preco`).
- **Célula vazia = manter o valor atual** (não apaga nada). Para limpar um
  campo, edite no painel.
- O CSV **não envia fotos**: a coluna `fotos` só referencia arquivos que já
  estão no repositório (ex.: `img/blusas/a.jpg|img/blusas/a-2.jpg`).

| Coluna | Formato |
|--------|---------|
| `sku` | `BLU-BAS-001` (vazio em peça nova = gera sozinho) |
| `nome`, `categoria` | texto; várias categorias separadas por `\|` |
| `preco`, `preco_antigo` | `89,90` ou `R$ 1.299,90` |
| `promo_ate` | `AAAA-MM-DD` ou `DD/MM/AAAA` |
| `estoque` | número inteiro |
| `tamanhos` | `P\|M\|G` (também aceita vírgula) |
| `cores` | `Preto=#1c1814\|Off White=#f1eee7` (ou só o nome) |
| `descricao` | Markdown básico (pode ter quebras de linha entre aspas) |
| `fotos` | caminhos separados por `\|`; o primeiro é a capa |
| `ativo` | `sim` / `não` |

**Aba “Configuração do site”**: edita o `data/site.json` sem abrir o arquivo:
nome da loja, WhatsApp (validado: 55 + DDD + número), Instagram, horário, textos
da abertura, do carrossel, da vitrine, da “Nova fase”, da lista de novidades, as
**marcas**, os **cupons** e o **frete por CEP**. Alterações de peças e de
configuração podem ser publicadas juntas, no mesmo commit.

### 5. Promoções: preço cortado, selo e prazo

- `preco` é **o preço que o cliente paga** (o promocional).
- `precoAntigo` é **o preço normal**. Enquanto a promoção vale, aparece riscado
  ao lado do preço e a foto ganha o selo automático de desconto (ex.: **-23%**).
- `promoAte` (opcional, `AAAA-MM-DD`): a promoção vale **até o fim desse dia**.
  Depois disso o site cobra o `precoAntigo`, sem riscado e sem selo, sem nova
  publicação. Sem `promoAte`, dura até você apagar o `precoAntigo`.

```json
{ "nome": "Calça alfaiataria", "preco": 99.9, "precoAntigo": 129.9, "promoAte": "2026-10-31" }
```

O `precoAntigo` precisa ser **maior** que o `preco` e o prazo só funciona junto
com ele; o painel avisa e bloqueia valores inconsistentes.

> O prazo é conferido **no navegador de quem visita**, com o relógio do aparelho.
> Confirme o valor ao fechar o pedido pelo WhatsApp.

### 6. Cupons de desconto

Ficam em `site.json`, na lista `cupons` (ou na aba *Configuração do site*). O
cliente digita o código no carrinho. **Um cupom por pedido.**

```json
{ "codigo": "BEMVINDA10", "descricao": "10% na primeira compra", "tipo": "percentual",
  "valor": 10, "minimo": 0, "validoAte": "2026-12-31", "soSemPromo": true, "ativo": true }
```

| Campo | Descrição |
|-------|-----------|
| `codigo` | Texto sem espaços; maiúsculas/minúsculas não importam |
| `tipo` | `percentual` (%), `valor` (R$ fixo) ou `frete` (frete grátis) |
| `valor` | Quanto descontar (ignorado em `frete`) |
| `minimo` | Pedido mínimo em R$ (0 = sem mínimo) |
| `validoAte` | `AAAA-MM-DD`, vale até o fim do dia (vazio = sem prazo) |
| `soSemPromo` | `true` = o desconto só incide em peças **sem** preço cortado |
| `ativo` | `false` desliga sem apagar |
| `descricao` | Anotação sua; não aparece no site |

O desconto aparece no resumo do carrinho e na mensagem do WhatsApp. Se o
carrinho mudar e o cupom deixar de valer (ex.: abaixo do mínimo), o site avisa.

> Os cupons são validados **no navegador** e os códigos ficam no `site.json`,
> que é público. Use para campanhas abertas; não para códigos secretos ou de uso
> único. Confirme o pedido no WhatsApp.

### 7. Frete por CEP

Também em `site.json`, no bloco `frete`. É uma **tabela de valores fixos por
faixa de CEP** (não uma cotação dos Correios). O cliente informa o CEP no
carrinho; o site confirma cidade/UF pelo ViaCEP, escolhe a **primeira regra** que
combina e mostra valor, prazo e a opção de **retirada na loja**.

```json
"frete": {
  "ativo": true,
  "gratisAcima": 400,
  "retirada": { "ativo": true, "texto": "Retirar na loja (combinar pelo WhatsApp)" },
  "regras": [
    { "nome": "Santa Catarina", "cep": ["88000-000 a 89999-999"], "valor": 18.9, "prazo": "3 a 5 dias úteis" },
    { "nome": "Demais regiões", "cep": ["40000-000 a 79999-999"], "valor": 44.9, "prazo": "7 a 12 dias úteis", "gratisAcima": 500 }
  ]
}
```

- **Faixas** (`cep`): `"88000-000 a 89999-999"`, um CEP exato (`"88301-000"`) ou
  um prefixo (`"883"`). A ordem das regras importa.
- **Frete grátis**: `gratisAcima` (geral ou por regra) considera o subtotal já
  com o desconto do cupom; o cupom do tipo `frete` zera o frete.
- CEP sem regra e sem retirada: o site orienta falar pelo WhatsApp.
- Se o ViaCEP estiver fora do ar, o cálculo continua pelas faixas.
- O frete escolhido entra no total e na mensagem do WhatsApp (“Entrega — Santa
  Catarina — CEP 88301-000 (Itajaí/SC): R$ 18,90”).

As regras de exemplo vêm com valores fictícios. **Ajuste valores, prazos e
faixas** à sua realidade antes de publicar.

### 8. A vitrine e o popup de detalhes (no site)

**Vitrine para muitas peças**: a página mostra **24 peças por vez** e carrega mais
ao rolar (ou no botão *Ver mais peças*). Acima da grade há **busca** (nome, SKU,
categoria, cor, tamanho e descrição; ignora acentos e maiúsculas; todas as
palavras precisam combinar), **ordenação** (ordem da loja, menor/maior preço,
A–Z, maior desconto) e **Só promoções**; as abas de categoria continuam
funcionando junto. Peças esgotadas ficam sempre por último.

Clicar na **foto** (ou em *Ver detalhes*) abre um popup com todas as fotos
(fotos e **vídeo curto**; setas, miniaturas, teclado ← → e deslizar no celular), preço, SKU, tamanhos,
cores, a **descrição** e o botão de compra. Fecha com **×**, **Esc** ou
clicando fora.

### 9. Markdown básico (descrição)

| Você escreve                 | Resultado          |
|------------------------------|--------------------|
| `**negrito**` ou `__negrito__` | **negrito**      |
| `*itálico*` ou `_itálico_`     | *itálico*        |
| `- item` (uma linha por item)  | lista com marcadores |
| linha em branco                | novo parágrafo     |
| Enter simples                  | quebra de linha    |

HTML digitado é **exibido como texto**, nunca executado. O painel tem os botões
**N**, **I** e **• Lista** e mostra uma pré-visualização.

### 10. Editando os JSONs à mão

**`data/produtos.json`** — lista de peças:

```json
{
  "sku": "BLU-BAS-001",
  "nome": "Blusa básica manga curta",
  "preco": 59.9,
  "precoAntigo": 79.9,
  "promoAte": "2026-10-31",
  "categoria": "Blusas",
  "tamanhos": ["P", "M", "G"],
  "cores": [
    { "nome": "Off White", "valor": "#f1eee7" },
    { "nome": "Preto",     "valor": "#1c1814" }
  ],
  "estoque": 2,
  "descricao": "Malha **macia** e *leve*.\n\n- 100% algodão\n- Lavar à mão",
  "foto": "img/blusas/blusa-basica.jpg",
  "fotos": ["img/blusas/blusa-basica.jpg", "img/blusas/blusa-basica-2.jpg"]
}
```

| Campo | Obrigatório | Descrição |
|-------|:-----------:|-----------|
| `nome`, `preco`, `categoria` | sim | `categoria` aceita texto ou lista (`["Feminino","Vestidos"]`) |
| `sku` | não | Código único da peça (veja a seção 4) |
| `tamanhos` | não | Se houver mais de um, o cliente escolhe; com um só, já vem selecionado |
| `cores` | não | Lista de `{nome, valor}`; `valor` é qualquer cor CSS. Texto simples (`"Preto"`) também funciona |
| `estoque` | não | `0` = esgotado; `1` = “Última peça”; `2` = “Últimas unidades” |
| `descricao` | não | Markdown básico (veja a seção 9) |
| `foto` / `fotos` | não | `fotos` é a lista completa (primeira = capa) e aceita **vídeos** (`.mp4`, `.webm`); o pôster é o mesmo caminho com `.jpg`. `foto` sozinho continua válido |
| `precoAntigo`, `promoAte` | não | Promoção (veja a seção 5) |
| `selo` | não | Troca o texto do selo automático de estoque |
| `fundo` | não | Cor de fundo enquanto não há foto (ex.: `#c8b49a`) |
| `ativo` | não | `false` esconde a peça do site sem apagá-la |

**`data/site.json`** — textos da página. Campos principais: `nome`, `whatsapp`
(com 55 + DDD, só números), `instagram`, `horario`, `aviso`, `msgPadrao` /
`msgNovidades` (mensagens do WhatsApp), `hero`, `pecas`, `destaques.quantidade`
(itens no carrossel), `novaFase`, `marcas`, `novidades`, `rodape`, `rodape2`,
`cupons` (seção 6) e `frete` (seção 7). Tudo também é editável na aba
“Configuração do site”.

### 11. Problemas comuns

| Sintoma | Causa / solução |
|---------|-----------------|
| Faixa vermelha “Abra o site por um servidor” | Você abriu o arquivo direto. Use o passo 2. |
| “tem erro de sintaxe JSON” | Falta vírgula, aspas ou colchete. Valide em jsonlint.com. |
| Painel: `GitHub 401/403` | Token expirado ou sem *Contents: Read and write* neste repositório. |
| Painel: `GitHub 404` | Repositório, branch ou “pasta do site” incorretos. |
| Painel: “SKU repetido” | Dois itens com o mesmo SKU. Edite um deles ou use ↻. |
| Painel: “Cupom repetido” / “faixa de CEP” | Códigos de cupom são únicos; faixas no formato `88000-000 a 89999-999`. |
| CSV com acentos errados | Salve como **CSV UTF-8**. O arquivo exportado já vem nesse formato. |
| Importação não alterou nada | Nenhuma linha casou por SKU/nome ou todas já estavam iguais (célula vazia mantém o valor). |
| Vídeo recusado no painel | Acima de 25 MB ou 60 s, ou formato/codec não suportado: exporte como MP4 (H.264) ou WEBM. |
| Peça não aparece na busca do site | A busca exige que **todas** as palavras combinem (nome, SKU, categoria, cor, tamanho, descrição). |
| Ordem das peças não mudou no site | Publique depois de reordenar; “Ordem da loja” é a ordem do painel (esgotadas vão ao fim). |
| Foto não aparece | Caminho em `foto`/`fotos` diferente do arquivo real (atenção a maiúsculas). |
| Preço cortado não aparece | `precoAntigo` menor ou igual ao `preco`, ou `promoAte` já passou. |
| Cupom “inválido” / “mínimo” | Código digitado errado, cupom inativo/expirado ou subtotal abaixo do mínimo. |
| Frete não calcula | CEP fora das faixas das regras e sem retirada ativa; confira `frete.regras`. |
| Alterações não aparecem | Aguarde ~30 s o deploy e recarregue com Ctrl+F5. |
| Falha no GitHub Actions: “Get Pages site failed” | Há um workflow de GitHub Pages sem o Pages ativado. Na Vercel ele não é necessário: apague `.github/workflows/` ou ative Settings → Pages → Source: *GitHub Actions*. |
| Carrinho “voltou” sozinho | É de propósito: carrinho, cupom e CEP ficam salvos no navegador (só peças ainda em estoque). |

### 12. Segurança

- O `admin/` é público na Vercel, mas **inútil sem o token**. Para escondê-lo,
  crie um `.vercelignore` com a linha `admin/` e use o painel só localmente.
- Revogue o token em *Settings → Developer settings* se perdê-lo.
- A descrição é escapada antes de virar HTML; não há execução de scripts.
- Tudo que está em `data/` é público (inclusive os códigos de cupom).

---

## Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/). Mais recente primeiro.

### [1.3.0] — 2026-10-09
**Adicionado**
- **Busca na vitrine** (nome, SKU, categoria, cor, tamanho, descrição), **ordenação**,
  filtro **Só promoções** e **paginação** (24 por vez, com carregamento ao rolar);
  testado com 1.200 peças.
- **Vídeos curtos** por peça (MP4/WEBM, até 25 MB e 60 s) com pôster gerado automaticamente,
  tocando no popup e identificados por “▶” nas miniaturas.
- **Admin em escala:** lista compacta com paginação, **busca** e filtros (categoria, sem SKU,
  sem foto, esgotadas, em promoção, ocultas) e edição sob demanda por linha.
- **Reordenar peças** (arrastar, ↑ ↓ ⤒ ou número da posição) e **reordenar fotos/vídeos**
  (arrastar ou ‹ ›); opção de colocar peças novas no início da vitrine.

**Corrigido**
- Campos de **cupom** e **CEP** ficavam minúsculos no celular (o botão ocupava a largura toda);
  agora têm altura de toque e fonte de 16 px, e empilham em telas muito estreitas.
- Preço no carrinho não quebra mais em duas linhas.

### [1.2.0] — 2026-10-08
**Adicionado**
- **SKU** por peça, gerado automaticamente (`CAT-NOM-NNN`), editável e único; SKU da
  variação (tamanho e cor) no popup, no carrinho e na mensagem do WhatsApp; botão
  “Gerar SKUs que faltam”.
- **Cupom de desconto** (percentual, valor fixo ou frete grátis) com mínimo, validade,
  “só em peças sem promoção” e ativação; editor na aba *Configuração do site*.
- **Frete por CEP**: regras por faixa de CEP, prazo, frete grátis acima de um valor,
  retirada na loja e confirmação de cidade/UF pelo ViaCEP; total do carrinho e
  mensagem do WhatsApp com cupom e entrega.
- **Duplicar peça** (publicada ou nova), com novo SKU.
- **Importar / exportar CSV** com prévia, casamento por SKU ou nome e relatório de erros.
- `ROADMAP.md` com o planejamento (que saiu do README).

**Alterado**
- Carrinho salvo no navegador agora guarda também cupom e CEP.
- O carrinho lateral ganhou área rolável, com resumo (subtotal, desconto, frete, total).
- Campo de CEP sem `maxlength`, que impedia substituir um CEP selecionado ao digitar.

### [1.1.0] — 2026-10-06
**Adicionado**
- **Preço cortado** (`precoAntigo`) com **selo automático de desconto** (“-23%”) na
  foto e no popup.
- **Promoção com prazo** (`promoAte`): depois do fim do dia indicado o site volta a
  cobrar o preço normal, sem nova publicação.
- **Admin:** campos “Preço antigo” e “Promoção válida até” (peças novas e publicadas),
  com dica ao vivo e bloqueio de valores inconsistentes.
- **Admin:** aba **Configuração do site** para editar `data/site.json` (textos,
  WhatsApp com validação, Instagram, horário, marcas) e publicar junto com as peças.
- Lista de melhorias futuras e solução do erro “Get Pages site failed” no README (o planejamento hoje fica em `ROADMAP.md`).

**Alterado**
- O admin só reescreve `produtos.json` / `site.json` quando há mudança neles, e a
  mensagem do commit descreve o que foi enviado.

### [1.0.0] — 2026-10-05
**Adicionado**
- **Variação de cores** por peça (`cores`), com seleção no cartão e no popup; a cor
  escolhida vai para o carrinho e para a mensagem do WhatsApp.
- **Popup de detalhes** ao clicar na foto: galeria (setas, miniaturas, teclado,
  deslizar), preço, tamanhos, cores, descrição e botão de compra; fecha com Esc/fora.
- **Descrição em Markdown básico** (negrito, itálico, listas, parágrafos), com
  escape de HTML.
- **Admin:** editor de cores (seletor + nome), editor de descrição com botões
  N / I / Lista e pré-visualização, tanto em peças novas quanto nas publicadas.
- README com manual rápido e este changelog.

**Alterado**
- O cartão deixou de trocar de foto ao clique; agora abre o popup. Peças com
  várias fotos exibem o total (“▣ 3”).
- Campo de cor de fundo da peça renomeado para `fundo` (antes `cor`), para não
  confundir com as variações de cor.
- Carrinho salvo também guarda a cor escolhida.

### [0.6.0] — 2026-09-30
**Adicionado**
- **Várias fotos por peça** (`fotos`) no site e no admin; foto de capa, remoção e
  envio de fotos extras para peças já publicadas.
- Carrinho salvo no navegador (`localStorage`).
- Admin: opção “fotos soltas = uma única peça”, validação com campos em vermelho,
  leitura de imagem mais tolerante (JPG, PNG, WEBP, AVIF…).

### [0.5.0] — 2026-09-30
**Adicionado**
- **Painel `/admin/`** com arrastar-e-soltar por categoria, pastas
  `img/<categoria>/`, edição de estoque/preço/visibilidade e envio ao GitHub em
  **um único commit** (API Git Data).

**Removido**
- `novo-produto.sh` (substituído pelo painel).

### [0.4.0] — 2026-09-29
**Alterado**
- Visual do site original (Cormorant Garamond + Inter, paleta creme/marrom,
  modo escuro) e **carrinho** com finalização pelo WhatsApp.

### [0.3.0] — 2026-09-28
**Adicionado**
- Logo (`k.jpg`) fixo no topo, que encolhe ao rolar a página.
- Carrossel central com peças em estoque em ordem aleatória.
- Menu/abas de categorias que filtram as peças.

### [0.2.0] — 2026-09-28
**Adicionado**
- Conteúdo movido para JSON (`site.json`, `produtos.json`) e script
  `novo-produto.sh` para cadastrar peças pelo terminal.
- Aviso visível quando o JSON não carrega (inclusive o caso `file://`).

### [0.1.0] — 2026-09-28
**Adicionado**
- Primeira versão do site, a partir do conteúdo do Instagram `@constita.mb` e
  do site original na Vercel: abertura “Últimas peças. Nova fase.”, vitrine,
  atendimento online, marcas CONSTita / CONSTita FIT e lista de novidades.

---

<p align="center">Desenvolvido por <strong>Kevin</strong> — <a href="https://kevin.net.br">kevin.net.br</a></p>
