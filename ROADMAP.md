# Planejamento — CONSTITA

Ideias e próximos passos **ainda não implementados**. O que já foi feito está no
[Changelog](README.md#changelog) do `README.md`.

Legenda: **A** = alta prioridade · **M** = média · **B** = baixa.

## Loja (site)

- [ ] **A — Foto por cor:** ao escolher “Preto”, o popup mostra a foto da peça preta.
- [ ] **A — Estoque por tamanho e cor:** hoje o estoque é um número único por peça.
- [ ] **A — Quantidade no carrinho:** hoje é uma unidade por peça.
- [ ] **A — Frete em tempo real** (Correios / Melhor Envio) por peso e dimensões, usando
  uma função serverless da Vercel para não expor o token. Hoje o frete usa valores fixos
  por faixa de CEP.
- [ ] **M — Filtros na vitrine** por tamanho, cor e faixa de preço; busca tolerante a erros de digitação.
- [ ] **M — Link direto para cada peça** (`#peca-nome`) para compartilhar no WhatsApp e no Instagram.
- [ ] **M — SEO:** título e imagem de compartilhamento (Open Graph) por peça, `sitemap.xml`.
- [ ] **M — Pix / pagamento online** (hoje o fechamento é pelo WhatsApp).
- [ ] **M — Cupons com limite de uso** (uso único, por cliente, total de resgates). Exige
  um servidor; hoje os cupons são validados no navegador e os códigos ficam visíveis no `site.json`.
- [ ] **B — Fotos em WebP/AVIF** com tamanhos responsivos (`srcset`).
- [ ] **B — Lista de desejos** e **avaliações** de clientes.

## Painel (`/admin/`)

- [ ] **A — Edição em lote:** selecionar várias peças e ajustar preço (%), estoque, categoria ou promoção.
- [ ] **M — Reordenar em lote:** mover várias peças de uma vez e salvar “coleções” (grupos).
- [ ] **A — Histórico e desfazer:** listar os commits do painel e restaurar uma versão.
- [ ] **M — Mudar a categoria** de uma peça movendo as fotos de pasta; renomear categorias.
- [ ] **M — Pré-visualização do site** dentro do painel antes de publicar.
- [ ] **M — Login real** no `/admin/` (senha ou GitHub OAuth) em vez do token manual.
- [ ] **M — SKU por variação** (tamanho × cor) com estoque próprio; **etiquetas** com SKU e código de barras para impressão.
- [ ] **M — Importar fotos em lote** (ZIP ou pasta) junto com o CSV.
- [ ] **B — Editar** também as seções “Atendimento” e “Etapas” do `site.json`.
- [ ] **B — Agendar publicação** de coleções, promoções e cupons.
- [ ] **B — Relatórios** simples (peças sem foto, sem estoque, sem SKU, promoções vencidas).

## Escala e mídia

- [ ] **A — Dividir o `produtos.json`** em páginas/índice quando passar de ~3.000 peças (hoje cada
  peça pesa cerca de 0,5 KB; 1.000 peças ≈ 500 KB, que a Vercel entrega comprimido).
- [ ] **M — Compressão de vídeo no navegador** (reencodar para 720p) antes de enviar.
- [ ] **M — Hospedar vídeos fora do repositório** (Cloudinary, Bunny, YouTube) para coleções grandes.
- [ ] **B — Texto alternativo e legenda** por foto (acessibilidade).

## Qualidade e infraestrutura

- [ ] **A — Testes automatizados** (carrinho, promoções, cupons, frete, markdown, CSV).
- [ ] **M — Checagem de JSON no deploy** (falhar o build se `site.json`/`produtos.json` estiverem inválidos).
- [ ] **B — Modo offline / PWA** e métricas de cliques no WhatsApp.
