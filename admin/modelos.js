/* Modelos por ramo de negócio: vocabulário, seções, textos, estilo visual e exemplos.
   Usados pelo "Assistente de início" (aba Configuração do painel). Nada é publicado sem o botão Publicar. */
window.MODELOS={
  vestuario:{
    nome:'Moda e vestuário',preset:'atelier',
    termos:{item:'peça',itens:'peças',genero:'f',tamanho:'Tamanho',cor:'Cor'},
    secoes:{destaques:true,novaFase:false,novidades:true},
    aviso:'Atendimento e pedidos pelo WhatsApp.',
    hero:{eyebrow:'Coleção atual',chamada:'Peças para o dia a dia.',destaque:'Do seu jeito.',texto:'Conheça as novidades da loja, escolha suas peças favoritas e finalize o pedido pelo WhatsApp.',nota:'Moda com atendimento próximo'},
    destaques:'Em destaque',
    pecas:{eyebrow:'Novidades',titulo:'Nossas peças',texto:'Escolha o tamanho, adicione ao carrinho e finalize pelo WhatsApp.'},
    novidades:{eyebrow:'Lista de novidades',titulo:'Quer saber primeiro dos lançamentos?',texto:'Cadastre-se para receber novidades e condições especiais.',botao:'Quero receber',ok:'Quase lá: envie a mensagem que abrimos no WhatsApp para concluir.'},
    rodape:'Moda com atendimento próximo.',rodape2:'Obrigado pela visita!',
    exemplos:[
      {nome:'Blusa básica',preco:59.9,categoria:'Blusas',tamanhos:['P','M','G'],cores:[{nome:'Branco',valor:'#f5f5f5'},{nome:'Preto',valor:'#1c1c1c'}],estoque:5,descricao:'Malha **macia** e confortável, para o dia a dia.'},
      {nome:'Calça alfaiataria',preco:129.9,categoria:'Calças',tamanhos:['38','40','42'],estoque:3,descricao:'Cintura alta e perna reta.'},
      {nome:'Vestido midi',preco:149.9,categoria:'Vestidos',tamanhos:['P','M'],estoque:2,descricao:'Leve e com *ótimo caimento*.'}]},
  papelaria:{
    nome:'Papelaria e escritório',preset:'vibrante',
    termos:{item:'produto',itens:'produtos',genero:'m',tamanho:'Modelo',cor:'Cor',selo1:'Última unidade',selo2:'Poucas unidades'},
    secoes:{destaques:true,novaFase:false,novidades:true},
    aviso:'Pedidos e retiradas combinados pelo WhatsApp.',
    hero:{eyebrow:'Papelaria',chamada:'Tudo para estudar,',destaque:'criar e organizar.',texto:'Cadernos, canetas, materiais de escritório e artigos para arte. Monte seu pedido e finalize pelo WhatsApp.',nota:'Papelaria e escritório'},
    destaques:'Mais procurados',
    pecas:{eyebrow:'Catálogo',titulo:'Nossos produtos',texto:'Escolha o modelo, adicione ao carrinho e finalize pelo WhatsApp.'},
    novidades:{eyebrow:'Novidades e promoções',titulo:'Receba nossas ofertas',texto:'Cadastre-se para saber das promoções de volta às aulas e novidades.',botao:'Quero receber',ok:'Quase lá: envie a mensagem que abrimos no WhatsApp para concluir.'},
    rodape:'Tudo para o seu dia a dia.',rodape2:'Obrigado pela visita!',
    exemplos:[
      {nome:'Caderno espiral 96 folhas',preco:24.9,categoria:'Cadernos',tamanhos:['Capa dura','Capa flexível'],cores:[{nome:'Azul',valor:'#2f5fd0'},{nome:'Rosa',valor:'#e0679a'},{nome:'Verde',valor:'#2f8f5b'}],estoque:30},
      {nome:'Caneta gel 0,7 mm',preco:6.5,categoria:'Canetas',cores:[{nome:'Preto',valor:'#111111'},{nome:'Azul',valor:'#1f4fd8'},{nome:'Vermelho',valor:'#d02a2a'}],estoque:80},
      {nome:'Kit marca-texto (6 cores)',preco:19.9,categoria:'Escritório',estoque:25}]},
  informatica:{
    nome:'Informática e eletrônicos',preset:'mono',
    termos:{item:'produto',itens:'produtos',genero:'m',tamanho:'Versão',cor:'Cor',selo1:'Última unidade',selo2:'Poucas unidades'},
    secoes:{destaques:true,novaFase:false,novidades:false},
    aviso:'Garantia e suporte pelo WhatsApp.',
    hero:{eyebrow:'Tecnologia',chamada:'Equipamentos e acessórios',destaque:'com garantia.',texto:'Periféricos, armazenamento, redes e muito mais. Consulte disponibilidade e finalize pelo WhatsApp.',nota:'Informática e eletrônicos'},
    destaques:'Em destaque',
    pecas:{eyebrow:'Catálogo',titulo:'Nossos produtos',texto:'Escolha a versão, adicione ao carrinho e finalize pelo WhatsApp.'},
    novidades:{eyebrow:'Ofertas',titulo:'Receba ofertas por WhatsApp',texto:'Cadastre-se para ser avisado de promoções e reposições.',botao:'Quero receber',ok:'Quase lá: envie a mensagem que abrimos no WhatsApp para concluir.'},
    rodape:'Tecnologia com suporte de verdade.',rodape2:'Obrigado pela visita!',
    exemplos:[
      {nome:'Mouse sem fio',preco:79.9,categoria:'Periféricos',cores:[{nome:'Preto',valor:'#151515'},{nome:'Cinza',valor:'#8a8d91'}],estoque:15,descricao:'Conexão **2,4 GHz**, bateria de longa duração.'},
      {nome:'SSD SATA',preco:219.9,categoria:'Armazenamento',tamanhos:['240 GB','480 GB','1 TB'],estoque:10,descricao:'Mais velocidade para o seu computador.'},
      {nome:'Roteador Wi-Fi 6',preco:289.9,categoria:'Redes',estoque:6}]},
  arte:{
    nome:'Galeria de arte',preset:'noir',
    termos:{item:'obra',itens:'obras',genero:'f',tamanho:'Formato',cor:'Moldura',selo1:'Obra única',selo2:'Poucas obras'},
    secoes:{destaques:true,novaFase:false,novidades:true},
    aviso:'Obras originais e reproduções com certificado.',
    hero:{eyebrow:'Galeria',chamada:'Arte para viver',destaque:'com você.',texto:'Pinturas, fotografias e gravuras de artistas selecionados. Fale com a galeria pelo WhatsApp para reservar sua obra.',nota:'Galeria de arte'},
    destaques:'Em exposição',
    pecas:{eyebrow:'Acervo',titulo:'Obras disponíveis',texto:'Cada obra tem tiragem limitada. Escolha o formato e a moldura e reserve pelo WhatsApp.'},
    novidades:{eyebrow:'Newsletter',titulo:'Seja avisado das novas exposições',texto:'Cadastre-se para receber convites e lançamentos de obras.',botao:'Quero receber',ok:'Quase lá: envie a mensagem que abrimos no WhatsApp para concluir.'},
    rodape:'Arte com curadoria.',rodape2:'Obrigado pela visita!',
    exemplos:[
      {nome:'Paisagem ao entardecer',preco:1800,categoria:'Pinturas',tamanhos:['50x70 cm','70x100 cm'],cores:[{nome:'Preta',valor:'#111111'},{nome:'Madeira',valor:'#a9743f'},{nome:'Branca',valor:'#f4f4f4'}],estoque:1,descricao:'Óleo sobre tela. *Peça única*, com certificado de autenticidade.'},
      {nome:'Retrato em preto e branco',preco:650,categoria:'Fotografias',tamanhos:['30x40 cm','40x60 cm'],estoque:5,descricao:'Impressão em papel fine art, tiragem limitada.'},
      {nome:'Gravura botânica',preco:420,categoria:'Gravuras',estoque:8}]},
  floricultura:{
    nome:'Floricultura',preset:'rose',
    termos:{item:'arranjo',itens:'arranjos',genero:'m',tamanho:'Tamanho',cor:'Cor',selo1:'Último arranjo',selo2:'Poucas unidades'},
    secoes:{destaques:true,novaFase:false,novidades:true},
    aviso:'Entregas combinadas pelo WhatsApp. Pedidos do dia até às 14h.',
    hero:{eyebrow:'Floricultura',chamada:'Flores para cada',destaque:'momento especial.',texto:'Buquês, arranjos e presentes preparados na hora. Escolha, informe o endereço e combine a entrega pelo WhatsApp.',nota:'Flores e presentes'},
    destaques:'Mais pedidos',
    pecas:{eyebrow:'Catálogo',titulo:'Nossos arranjos',texto:'Escolha o tamanho e a cor, adicione ao carrinho e finalize pelo WhatsApp.'},
    novidades:{eyebrow:'Datas especiais',titulo:'Lembrete de datas comemorativas',texto:'Cadastre-se para receber ofertas no Dia das Mães, Namorados e outras datas.',botao:'Quero receber',ok:'Quase lá: envie a mensagem que abrimos no WhatsApp para concluir.'},
    rodape:'Flores que dizem o que as palavras não alcançam.',rodape2:'Obrigado pela visita!',
    exemplos:[
      {nome:'Buquê de rosas',preco:119.9,categoria:'Buquês',tamanhos:['P','M','G'],cores:[{nome:'Vermelha',valor:'#c2263b'},{nome:'Rosa',valor:'#e98fb0'},{nome:'Branca',valor:'#f3f3ee'}],estoque:10,descricao:'Rosas **frescas** com embalagem de presente.'},
      {nome:'Arranjo de mesa',preco:149.9,categoria:'Arranjos',tamanhos:['M','G'],estoque:6},
      {nome:'Orquídea phalaenopsis',preco:139.9,categoria:'Plantas',estoque:8,descricao:'Acompanha vaso decorativo.'}]},
  generico:{
    nome:'Outro ramo (genérico)',preset:'fresh',
    termos:{item:'produto',itens:'produtos',genero:'m',tamanho:'Opção',cor:'Cor',selo1:'Última unidade',selo2:'Poucas unidades'},
    secoes:{destaques:true,novaFase:false,novidades:true},
    aviso:'Atendimento e pedidos pelo WhatsApp.',
    hero:{eyebrow:'Bem-vindo',chamada:'Conheça nossos',destaque:'produtos.',texto:'Veja o catálogo, escolha o que precisa e finalize o pedido pelo WhatsApp.',nota:'Loja online'},
    destaques:'Em destaque',
    pecas:{eyebrow:'Catálogo',titulo:'Nossos produtos',texto:'Escolha as opções, adicione ao carrinho e finalize pelo WhatsApp.'},
    novidades:{eyebrow:'Novidades',titulo:'Quer receber nossas novidades?',texto:'Cadastre-se para saber de lançamentos e promoções.',botao:'Quero receber',ok:'Quase lá: envie a mensagem que abrimos no WhatsApp para concluir.'},
    rodape:'Obrigado pela preferência.',rodape2:'Volte sempre!',
    exemplos:[
      {nome:'Produto de exemplo 1',preco:49.9,categoria:'Categoria A',estoque:10},
      {nome:'Produto de exemplo 2',preco:89.9,categoria:'Categoria A',estoque:5},
      {nome:'Produto de exemplo 3',preco:29.9,categoria:'Categoria B',estoque:20}]}
};
