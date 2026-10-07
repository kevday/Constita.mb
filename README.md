# CONSTITA — site e painel de administração

Site estático (HTML + JS puros, sem build) que lê o conteúdo de dois arquivos JSON.
Funciona na Vercel, no GitHub Pages ou em qualquer servidor que entregue arquivos.

**Versão atual: 1.1.0** — veja o [Changelog](#changelog) no final.

---

## Manual rápido

### 1. Estrutura

```
constita-site/
├── index.html            Site (vitrine, carrossel, popup de detalhes, carrinho)
├── admin/index.html      Painel para cadastrar/editar peças e enviar ao GitHub
├── data/
│   ├── site.json         Textos, WhatsApp, Instagram, marcas
│   └── produtos.json     Catálogo de peças
├── img/                  Logo (k.jpg) e fotos; fotos novas vão para img/<categoria>/
└── README.md
```

Você **não precisa editar o HTML**: tudo que muda fica nos JSONs, e o painel
`/admin/` edita o `produtos.json` por você.

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
4. Em cada peça nova preencha nome, preço, tamanhos (`P, M, G`) e estoque.
   Opcionais: **cores** e **descrição**.
5. Mais fotos na mesma peça: quadro **+ foto**. A primeira é a *capa*; clique
   numa foto para torná-la a capa e no **×** para remover.
6. Clique em **Publicar**. Fotos e `produtos.json` vão em **um único commit**.

**Editar peças publicadas** (*3. Peças publicadas*): altere nome, preço,
estoque, visibilidade, fotos e, em “Promoção, cores e descrição”, o preço antigo,
o prazo, as cores e a descrição. Depois clique em **Publicar alterações**.
Estoque `0` mostra “Esgotado”.

**Cores**: use **+ cor**, escolha a cor no seletor e dê um nome (ex.: *Preto*).
Se a peça tem cores, o cliente precisa escolher uma antes de adicionar ao carrinho.

**Aba “Configuração do site”**: edita o `data/site.json` sem abrir o arquivo
(nome da loja, WhatsApp, Instagram, horário, textos da abertura, do carrossel,
da vitrine, da “Nova fase”, da lista de novidades e as **marcas**). O WhatsApp
é validado (55 + DDD + número) e só os dígitos são salvos. Alterações de peças
e de configuração podem ser publicadas juntas, no mesmo commit.

### 5. Promoções: preço cortado, selo e prazo

Duas peças de informação, nenhuma conta automática de “preço cheio”:

- `preco` é **o preço que o cliente paga** (o promocional).
- `precoAntigo` é **o preço normal**. Enquanto a promoção vale, aparece riscado
  ao lado do preço e a foto ganha o selo automático de desconto (ex.: **-23%**).
- `promoAte` (opcional, `AAAA-MM-DD`): a promoção vale **até o fim desse dia**.
  Depois disso o site cobra o `precoAntigo`, sem riscado e sem selo, e você não
  precisa publicar de novo. Sem `promoAte`, a promoção dura até você apagar o
  `precoAntigo`.

```json
{ "nome": "Calça alfaiataria", "preco": 99.9, "precoAntigo": 129.9, "promoAte": "2026-10-31" }
```

Regras: o `precoAntigo` precisa ser **maior** que o `preco` (senão é ignorado) e
o prazo só funciona junto com o `precoAntigo`. O painel avisa e bloqueia a
publicação se algo estiver errado, e mostra uma dica como “Selo automático: -23%
(de R$ 129,90 por R$ 99,90). Vale até 31/10/2026”.

> O prazo é conferido **no navegador de quem visita**, com o relógio do aparelho.
> O carrinho e a mensagem do WhatsApp usam o preço calculado ali; por isso,
> confirme o valor ao fechar o pedido.

### 6. O popup de detalhes (no site)

Clicar na **foto** (ou em *Ver detalhes*) abre um popup com todas as fotos
(setas, miniaturas, teclado ← → e deslizar no celular), preço, tamanhos, cores,
a **descrição** e o botão de adicionar ao carrinho. Fecha com **×**, **Esc** ou
clicando fora.

### 7. Markdown básico (descrição)

| Você escreve                 | Resultado          |
|------------------------------|--------------------|
| `**negrito**` ou `__negrito__` | **negrito**      |
| `*itálico*` ou `_itálico_`     | *itálico*        |
| `- item` (uma linha por item)  | lista com marcadores |
| linha em branco                | novo parágrafo     |
| Enter simples                  | quebra de linha    |

HTML digitado é **exibido como texto**, nunca executado. O painel tem os botões
**N**, **I** e **• Lista** e mostra uma pré-visualização.

### 8. Editando os JSONs à mão

**`data/produtos.json`** — lista de peças:

```json
{
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
| `tamanhos` | não | Se houver mais de um, o cliente escolhe; com um só, já vem selecionado |
| `cores` | não | Lista de `{nome, valor}`; `valor` é qualquer cor CSS. Texto simples (`"Preto"`) também funciona |
| `estoque` | não | `0` = esgotado; `1` = “Última peça”; `2` = “Últimas unidades” |
| `descricao` | não | Markdown básico (veja acima) |
| `foto` / `fotos` | não | `fotos` é a lista completa (primeira = capa); `foto` sozinho continua válido |
| `precoAntigo` | não | Preço normal; precisa ser maior que `preco`. Aparece riscado e gera o selo “-X%” (veja a seção 5) |
| `promoAte` | não | `AAAA-MM-DD`. Até o fim desse dia vale a promoção; depois o site cobra o `precoAntigo` |
| `selo` | não | Troca o texto do selo automático |
| `fundo` | não | Cor de fundo enquanto não há foto (ex.: `#c8b49a`) |
| `ativo` | não | `false` esconde a peça do site sem apagá-la |

**`data/site.json`** — textos da página. Os principais campos: `nome`,
`whatsapp` (com 55 + DDD, só números), `instagram`, `horario`, `aviso`,
`msgPadrao` / `msgNovidades` (mensagens do WhatsApp; também editáveis na aba “Configuração do site”), `hero`, `pecas`,
`destaques.quantidade` (itens no carrossel), `novaFase`, `marcas`, `novidades`,
`rodape`, `rodape2`.

### 9. Problemas comuns

| Sintoma | Causa / solução |
|---------|-----------------|
| Faixa vermelha “Abra o site por um servidor” | Você abriu o arquivo direto. Use o passo 2. |
| “tem erro de sintaxe JSON” | Falta vírgula, aspas ou colchete. Valide em jsonlint.com. |
| Painel: `GitHub 401/403` | Token expirado ou sem *Contents: Read and write* neste repositório. |
| Painel: `GitHub 404` | Repositório, branch ou “pasta do site” incorretos. |
| Foto não aparece | Caminho em `foto`/`fotos` diferente do arquivo real (atenção a maiúsculas). |
| Alterações não aparecem | Aguarde ~30 s o deploy e recarregue com Ctrl+F5. |
| Preço cortado não aparece | `precoAntigo` menor ou igual ao `preco`, ou `promoAte` já passou. O painel avisa. |
| Falha no GitHub Actions: “Get Pages site failed” | Há um workflow de GitHub Pages sem o Pages ativado. Na Vercel ele não é necessário: apague `.github/workflows/` ou ative Settings → Pages → Source: *GitHub Actions*. |
| Carrinho “voltou” sozinho | É de propósito: o carrinho fica salvo no navegador (só peças ainda em estoque). |

### 10. Segurança

- O `admin/` é público na Vercel, mas **inútil sem o token**. Para escondê-lo,
  crie um `.vercelignore` com a linha `admin/` e use o painel só localmente.
- Revogue o token em *Settings → Developer settings* se perdê-lo.
- A descrição é escapada antes de virar HTML; não há execução de scripts.

---

## Melhorias futuras

Ideias ainda **não implementadas**, em ordem sugerida de prioridade.

**Loja**
- [ ] **Foto por cor**: ao escolher “Preto”, o popup mostra a foto da peça preta.
- [ ] **Estoque por tamanho e cor** (hoje o estoque é um número único por peça).
- [ ] **Quantidade no carrinho** (hoje é uma unidade por peça).
- [ ] **Busca e ordenação** na vitrine (menor preço, novidades, só promoções).
- [ ] **Link direto para cada peça** (`#peca-nome`) para compartilhar no WhatsApp/Instagram.
- [ ] **SEO**: título e imagem de compartilhamento (Open Graph) por peça, `sitemap.xml`.
- [ ] **Fotos em WebP/AVIF** com tamanhos responsivos (`srcset`).
- [ ] **Cupom de desconto** e **cálculo de frete por CEP**.
- [ ] **Pix / pagamento online** (hoje o fechamento é pelo WhatsApp).

**Painel**
- [ ] **Reordenar peças e fotos** arrastando.
- [ ] **Mudar a categoria** de uma peça movendo a foto de pasta; renomear categorias.
- [ ] **Duplicar peça**, **importar/exportar CSV**.
- [ ] **Pré-visualização do site** dentro do painel antes de publicar.
- [ ] **Histórico e desfazer** (listar commits do painel e restaurar uma versão).
- [ ] **Login real** no `/admin/` (senha ou GitHub OAuth) em vez do token manual.
- [ ] Editar também as seções “Atendimento” e “Etapas” do `site.json`.
- [ ] **Agendar publicação** de coleções e promoções.

**Qualidade**
- [ ] Testes automatizados (carrinho, promoções, markdown) e checagem de JSON no deploy.
- [ ] Modo offline / PWA e métricas de cliques no WhatsApp.

---

## Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/). Mais recente primeiro.

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
- Seção **Melhorias futuras** e solução do erro “Get Pages site failed” no README.

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
  
    ## Sobre
  **Desenvolvido por Kevin (http://kevin.net.br)**
