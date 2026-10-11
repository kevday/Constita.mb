/* Editor visual de temas (cores, fontes, forma e layout) com prévia ao vivo.
   Módulo usado pela aba "Aparência" do painel (admin/index.html). Depende de ../tema.js.
   Uso: const ed = TemaEditor.iniciar(elementoRaiz, { tema, aoMudar(t){}, status(msg, cls){}, previaUrl });
        ed.definir(tema)  → recarrega o editor com outro tema, sem disparar aoMudar
        ed.exportar()     → objeto "tema" pronto para o site.json */
(function(g){
'use strict';
const CSS=`
.te{display:grid;gap:18px}
@media(min-width:960px){.te{grid-template-columns:390px 1fr;align-items:start}.te .te-prev{position:sticky;top:12px}}
.te details{border:1px solid var(--line);background:var(--card);margin:0 0 10px;padding:0}
.te summary{cursor:pointer;padding:12px 14px;font:400 18px var(--serif)}
.te details[open]>summary{margin:0}
.te .sec{padding:4px 14px 14px;display:grid;gap:10px}
.te label{display:block;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--mute);margin:0 0 3px}
.te select,.te input[type=text],.te textarea{width:100%;padding:9px 10px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit;border-radius:0}
.te textarea{font:12px ui-monospace,Menlo,Consolas,monospace;resize:vertical}
.te input[type=range]{width:100%}
.te .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.te .cor{display:grid;grid-template-columns:42px 1fr;gap:8px;align-items:end}
.te .cor input[type=color]{width:42px;height:38px;padding:2px;border:1px solid var(--line);background:var(--bg);cursor:pointer}
.te .presets{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.te .preset{border:2px solid var(--line);padding:10px;text-align:left;cursor:pointer;color:inherit;font:inherit}
.te .preset[aria-pressed=true]{border-color:var(--ink)}
.te .preset b{display:block;font:500 17px var(--serif);line-height:1.2}
.te .preset small{display:block;font-size:11px;line-height:1.35;margin-top:3px;opacity:.8}
.te .sw{display:flex;gap:4px;margin-top:7px}.te .sw i{width:16px;height:16px;border:1px solid rgba(0,0,0,.18);border-radius:50%}
.te .ctr{display:grid;grid-template-columns:auto 1fr auto;gap:6px 10px;align-items:center;font-size:13px}
.te .badge{font-size:11px;font-weight:600;padding:1px 8px;border:1px solid}
.te .badge.ok{color:var(--ok);border-color:var(--ok)}.te .badge.no{color:var(--err);border-color:var(--err)}
.te .dica{font-size:12px;color:var(--mute);margin:0}
.te .radios{display:flex;gap:6px;flex-wrap:wrap}
.te .radios label{display:flex;gap:6px;align-items:center;text-transform:none;letter-spacing:0;font-size:14px;color:var(--ink);margin:0;border:1px solid var(--line);padding:6px 10px;cursor:pointer;background:var(--bg)}
.te .amostra{border:1px dashed var(--line);padding:12px}
.te .amostra .t{font-size:26px;line-height:1.15;margin:0 0 4px}
.te .barra{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.te .barra select{width:auto}
.te .quadro{border:1px solid var(--line);background:#8884;margin:auto;max-width:100%;transition:width .2s}
.te iframe{display:block;width:100%;height:76vh;min-height:520px;border:0;background:#fff}
.te .acoes{display:flex;gap:8px;flex-wrap:wrap}
`;
const $=(r,s)=>r.querySelector(s);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const NOMES={fundo:'Fundo',cartao:'Cartões e seções',texto:'Texto',suave:'Texto secundário',linha:'Linhas e bordas',destaque:'Destaque (selos, ícones)',destaqueTexto:'Texto sobre o destaque',botao:'Botões',botaoTexto:'Texto dos botões'};

function iniciar(raiz,opts){
  opts=opts||{};
  if(!document.getElementById('te-css')){const s=el('style');s.id='te-css';s.textContent=CSS;document.head.appendChild(s)}
  const Tm=g.Tema,status=opts.status||function(){};
  raiz.replaceChildren();raiz.classList.add('te');
  raiz.innerHTML=
   '<aside>'+
   '<details open><summary>1. Estilos prontos</summary><div class="sec"><p class="dica">Pontos de partida inspirados em estilos comuns de lojas online. Escolha um e ajuste.</p><div class="presets" data-r="presets"></div></div></details>'+
   '<details open><summary>2. Cores</summary><div class="sec" data-r="cores"></div></details>'+
   '<details><summary>3. Modo escuro</summary><div class="sec" data-r="escuro"></div></details>'+
   '<details open><summary>4. Fontes</summary><div class="sec" data-r="fontes"></div></details>'+
   '<details><summary>5. Forma e layout</summary><div class="sec" data-r="forma"></div></details>'+
   '<details><summary>6. Exportar e importar</summary><div class="sec"><label>Tema em JSON</label><textarea rows="9" spellcheck="false" data-r="json"></textarea>'+
   '<div class="acoes"><button type="button" class="btn ghost sm" data-r="copiar">Copiar</button><button type="button" class="btn ghost sm" data-r="baixar">Baixar tema.json</button><button type="button" class="btn ghost sm" data-r="aplicar">Aplicar o JSON do campo</button></div></div></details>'+
   '</aside>'+
   '<div class="te-prev"><div class="barra"><span class="dica">Prévia:</span>'+
   '<button type="button" class="btn ghost sm" data-w="390">Celular</button><button type="button" class="btn ghost sm" data-w="768">Tablet</button><button type="button" class="btn ghost sm" data-w="100%">Computador</button>'+
   '<select data-r="modo" aria-label="Modo da prévia"><option value="">Modo: como o tema define</option><option value="claro">Forçar claro</option><option value="escuro">Forçar escuro</option></select>'+
   '<button type="button" class="btn ghost sm" data-r="recarregar">Recarregar</button></div>'+
   '<div class="quadro" data-r="quadro" style="width:100%"><iframe data-r="prev" title="Prévia da loja"></iframe></div>'+
   '<p class="dica" style="margin-top:8px">A prévia mostra o site publicado com o tema em edição. Para ver as mudanças online, use <b>Publicar</b> do painel.</p></div>';
  const R=n=>raiz.querySelector('[data-r="'+n+'"]');
  let T=null,prevModo='',tp=null;

  function estadoDe(tema){
    const n=Tm.normalizar(tema),custom=!!(tema&&tema.escuro&&tema.escuro.cores&&Object.keys(tema.escuro.cores).length);
    return {preset:n.preset,cores:n.cores,escuro:{modo:n.escuro.modo,custom:custom,cores:n.escuro.cores},fontes:n.fontes,forma:n.forma,layout:n.layout};
  }
  function exportar(){
    const n=Tm.normalizar({preset:T.preset,cores:T.cores,escuro:{modo:T.escuro.modo,cores:T.escuro.custom?T.escuro.cores:{}},fontes:T.fontes,forma:T.forma,layout:T.layout});
    if(!T.escuro.custom)delete n.escuro.cores;
    return n;
  }

  /* ----- campos ----- */
  function campoCor(obj,k,rot){
    const w=el('div','cor'),c=el('input'),t=el('input'),b=el('div');
    c.type='color';c.value=obj[k];c.setAttribute('aria-label','Cor: '+rot);
    t.type='text';t.value=obj[k];t.maxLength=7;t.setAttribute('aria-label','Código da cor: '+rot);
    const set=v=>{v=Tm.norm(v,null);if(!v)return;obj[k]=v;c.value=v;t.value=v;mudou()};
    c.oninput=()=>set(c.value);t.onchange=()=>{if(!Tm.norm(t.value,null))t.value=obj[k];else set(t.value)};
    b.append(el('label',0,rot),t);w.append(c,b);return w;
  }
  function selecao(rot,obj,k,ops,depois){
    const w=el('div'),s=el('select');w.append(el('label',0,rot));
    ops.forEach(o=>{const op=el('option',0,o[1]);op.value=o[0];s.append(op)});
    s.value=String(obj[k]);s.onchange=()=>{const v=s.value;obj[k]=(v===''||isNaN(Number(v)))?v:Number(v);(depois||mudou)()};
    w.append(s);return w;
  }
  function faixa(rot,obj,k,min,max,passo,fmt){
    const w=el('div'),l=el('label'),r=el('input');r.type='range';r.min=min;r.max=max;r.step=passo;r.value=obj[k];
    const pinta=()=>{l.textContent=rot+': '+(fmt?fmt(obj[k]):obj[k])};pinta();
    r.oninput=()=>{obj[k]=Number(r.value);pinta();mudou()};w.append(l,r);return w;
  }
  function radios(rot,obj,k,ops){
    const w=el('div'),gr=el('div','radios'),nome='r-'+k+Math.random().toString(36).slice(2,6);w.append(el('label',0,rot));
    ops.forEach(o=>{const l=el('label'),i=el('input');i.type='radio';i.name=nome;i.value=o[0];i.checked=String(obj[k])===String(o[0]);
      i.onchange=()=>{obj[k]=o[0];mudou()};l.append(i,el('span',0,o[1]));gr.append(l)});
    w.append(gr);return w;
  }

  /* ----- montagem ----- */
  function montar(){
    const P=R('presets');P.replaceChildren();
    Object.entries(Tm.PRESETS).forEach(([k,p])=>{
      const n=Tm.normalizar(p.tema),b=el('button','preset');b.type='button';b.setAttribute('aria-pressed',String(T.preset===k));
      b.style.background=n.cores.fundo;b.style.color=n.cores.texto;b.style.borderRadius=n.forma.raio+'px';
      const nome=el('b',0,p.nome);nome.style.fontFamily="'"+n.fontes.titulo+"',Georgia,serif";nome.style.textTransform=n.fontes.caixaTitulo==='maiusculas'?'uppercase':'none';
      const sw=el('div','sw');[n.cores.texto,n.cores.destaque,n.cores.botao,n.cores.cartao].forEach(c=>{const i=el('i');i.style.background=c;sw.append(i)});
      b.append(nome,el('small',0,p.desc),sw);
      b.onclick=()=>{T=estadoDe(p.tema);T.preset=k;montar();mudou()};P.append(b);
    });
    const C=R('cores');C.replaceChildren();
    C.append(el('p','dica','Escolha 3 cores e clique em “Gerar paleta” para calcular as demais, ou ajuste uma a uma.'));
    ['fundo','texto','destaque'].forEach(k=>C.append(campoCor(T.cores,k,NOMES[k])));
    const gp=el('button','btn ghost sm','Gerar paleta a partir destas 3 cores');gp.type='button';
    gp.onclick=()=>{Object.assign(T.cores,Tm.derivar(T.cores.fundo,T.cores.texto,T.cores.destaque));montar();mudou()};C.append(gp);
    const det=el('details');det.append(el('summary',0,'Todas as cores'));const ds=el('div','sec');
    ['cartao','suave','linha','destaqueTexto','botao','botaoTexto'].forEach(k=>ds.append(campoCor(T.cores,k,NOMES[k])));
    det.append(ds);C.append(det);
    C.append(el('label',0,'Legibilidade (WCAG AA = 4,5 ou mais)'));
    const ct=el('div','ctr');ct.setAttribute('data-r','ctr');C.append(ct);
    const fx=el('button','btn ghost sm','Corrigir contraste automaticamente');fx.type='button';fx.onclick=corrigir;C.append(fx);

    const E=R('escuro');E.replaceChildren();
    E.append(radios('Como a loja se comporta',T.escuro,'modo',[['auto','Seguir o aparelho'],['nunca','Sempre claro'],['sempre','Sempre escuro']]));
    const ck=el('label','radios'),cb=el('input');cb.type='checkbox';cb.checked=T.escuro.custom;
    cb.onchange=()=>{T.escuro.custom=cb.checked;if(!cb.checked)T.escuro.cores=Tm.derivarEscuro(T.cores);montar();mudou()};
    ck.append(cb,el('span',0,'Personalizar as cores do modo escuro'));ck.style.border='0';ck.style.padding='0';E.append(ck);
    if(T.escuro.custom)Object.keys(NOMES).forEach(k=>E.append(campoCor(T.escuro.cores,k,NOMES[k])));
    else{const sw=el('div','sw');Object.values(T.escuro.cores).slice(0,6).forEach(c=>{const i=el('i');i.style.background=c;sw.append(i)});E.append(el('p','dica','Calculado automaticamente a partir das cores claras:'),sw)}

    const F=R('fontes');F.replaceChildren();
    const grupo=(rot,obj,k)=>{
      const w=el('div'),s=el('select');w.append(el('label',0,rot));
      [['serif','Com serifa'],['sans','Sem serifa']].forEach(([t,nome])=>{const og=document.createElement('optgroup');og.label=nome;Tm.FONTES.filter(f=>f.t===t).forEach(f=>{const o=el('option',0,f.n);o.value=f.n;og.append(o)});s.append(og)});
      s.value=obj[k];s.onchange=()=>{obj[k]=s.value;if(k==='titulo'&&Tm.pesosDe(s.value).indexOf(T.fontes.pesoTitulo)<0)T.fontes.pesoTitulo=0;montar();mudou()};
      w.append(s);return w;
    };
    F.append(grupo('Fonte dos títulos',T.fontes,'titulo'),grupo('Fonte do texto',T.fontes,'texto'));
    F.append(selecao('Peso dos títulos',T.fontes,'pesoTitulo',[[0,'Padrão do site']].concat(Tm.pesosDe(T.fontes.titulo).map(p=>[p,p+({300:' (leve)',400:' (normal)',500:' (médio)',600:' (semi-negrito)',700:' (negrito)'}[p]||'')]))));
    F.append(selecao('Caixa dos títulos',T.fontes,'caixaTitulo',[['normal','Normal'],['maiusculas','MAIÚSCULAS']]));
    F.append(faixa('Espaço entre letras dos títulos',T.fontes,'espacoTitulo',-3,12,1,v=>(v/100).toFixed(2)+' em'));
    F.append(faixa('Tamanho base do texto',T.fontes,'tamanhoBase',13,19,1,v=>v+' px'));
    const am=el('div','amostra');am.setAttribute('data-r','amostra');
    am.append(el('p','t','Título de exemplo'),el('span',0,'Texto de exemplo para conferir a leitura no tamanho escolhido.'));F.append(am);

    const M=R('forma');M.replaceChildren();
    M.append(faixa('Arredondamento dos cantos',T.forma,'raio',0,28,1,v=>v+' px'));
    M.append(radios('Botões',T.forma,'botao',[['quadrado','Quadrados'],['arredondado','Arredondados'],['pilula','Pílula']]));
    M.append(selecao('Cabeçalho',T.layout,'cabecalho',[['fixo','Fixo (logo à esquerda)'],['centro','Fixo (logo centralizado)'],['estatico','Rola com a página']]));
    M.append(selecao('Abertura (texto inicial)',T.layout,'abertura',[['centro','Centralizada'],['esquerda','À esquerda']]));
    M.append(selecao('Cartões de produto',T.layout,'cartao',[['limpo','Limpo (sem moldura)'],['moldura','Com moldura'],['sombra','Com sombra']]));
    M.append(selecao('Proporção das fotos',T.layout,'proporcao',[['3/4','3:4 (vertical)'],['4/5','4:5'],['2/3','2:3 (alongada)'],['1/1','1:1 (quadrada)']]));
    const r2=el('div','row2');r2.append(selecao('Colunas no celular',T.layout,'colunasMobile',[[1,'1'],[2,'2']]),selecao('Colunas no computador',T.layout,'colunasDesktop',[[3,'3'],[4,'4'],[5,'5']]));M.append(r2);
    M.append(selecao('Espaçamento entre seções',T.layout,'densidade',[['compacta','Compacto'],['confortavel','Confortável'],['espacosa','Espaçoso']]));
    pintar();
  }

  /* ----- contraste ----- */
  function pintarContraste(){
    const c=T.cores,box=R('ctr');if(!box)return;box.replaceChildren();
    [['Texto sobre o fundo',c.texto,c.fundo],['Texto secundário sobre o fundo',c.suave,c.fundo],['Texto sobre os cartões',c.texto,c.cartao],['Texto dos botões',c.botaoTexto,c.botao],['Texto sobre o destaque',c.destaqueTexto,c.destaque]].forEach(([n,a,b])=>{
      const r=Tm.contraste(a,b),ok=r>=4.5,s=el('span',0,'Aa');s.style.cssText='background:'+b+';color:'+a+';padding:2px 10px;border:1px solid '+c.linha;
      box.append(s,el('span',0,n+' · '+r.toFixed(1)+':1'),el('span','badge '+(ok?'ok':'no'),ok?'AA ✓':'baixo'));
    });
  }
  function corrigir(){
    const c=T.cores;
    c.texto=Tm.ajustar(c.texto,c.fundo,4.5);c.suave=Tm.ajustar(c.suave,c.fundo,4.5);
    if(Tm.contraste(c.texto,c.cartao)<4.5)c.cartao=Tm.derivar(c.fundo,c.texto,c.destaque).cartao;
    if(Tm.contraste(c.botaoTexto,c.botao)<4.5)c.botaoTexto=Tm.melhorTexto(c.botao);
    if(Tm.contraste(c.destaqueTexto,c.destaque)<4.5)c.destaqueTexto=Tm.melhorTexto(c.destaque);
    montar();mudou();status('Contraste ajustado onde foi possível.','ok');
  }

  /* ----- atualização e prévia ----- */
  function pintar(){
    if(!T.escuro.custom)T.escuro.cores=Tm.derivarEscuro(T.cores);
    const ex=exportar();R('json').value=JSON.stringify(ex,null,2);pintarContraste();
    let lk=document.getElementById('f-ed');if(!lk){lk=document.createElement('link');lk.id='f-ed';lk.rel='stylesheet';document.head.appendChild(lk)}
    const u=Tm.fontesUrl(Tm.normalizar(ex));if(lk.getAttribute('href')!==u)lk.setAttribute('href',u);
    const am=R('amostra');
    if(am){am.style.background=T.cores.fundo;am.style.color=T.cores.texto;am.style.borderRadius=T.forma.raio+'px';am.style.fontFamily="'"+T.fontes.texto+"',system-ui,sans-serif";
      const t=am.querySelector('.t');t.style.fontFamily="'"+T.fontes.titulo+"',Georgia,serif";t.style.fontWeight=T.fontes.pesoTitulo||400;t.style.textTransform=T.fontes.caixaTitulo==='maiusculas'?'uppercase':'none';t.style.letterSpacing=(T.fontes.espacoTitulo/100)+'em'}
    clearTimeout(tp);tp=setTimeout(()=>enviar(ex),90);
  }
  function mudou(){pintar();if(opts.aoMudar)opts.aoMudar(exportar())}
  function enviar(ex){const w=R('prev').contentWindow;if(w)w.postMessage({tipo:'tema',tema:ex||exportar(),modo:prevModo||undefined},location.origin)}
  R('prev').addEventListener('load',()=>enviar());
  R('prev').src=opts.previaUrl||'../index.html';
  R('modo').onchange=e=>{prevModo=e.target.value;enviar()};
  R('recarregar').onclick=()=>{try{R('prev').contentWindow.location.reload()}catch(e){R('prev').src=R('prev').src}};
  raiz.querySelectorAll('.barra [data-w]').forEach(b=>b.onclick=()=>{R('quadro').style.width=b.dataset.w==='100%'?'100%':b.dataset.w+'px'});

  /* ----- exportar / importar ----- */
  R('copiar').onclick=async()=>{try{await navigator.clipboard.writeText(R('json').value);status('JSON do tema copiado.','ok')}catch(e){R('json').select();status('Selecione e copie manualmente (Ctrl+C).','')}};
  R('baixar').onclick=()=>{const a=el('a');a.href=URL.createObjectURL(new Blob([R('json').value+'\n'],{type:'application/json'}));a.download='tema.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
  R('aplicar').onclick=()=>{
    try{const j=JSON.parse(R('json').value);if(!j||typeof j!=='object'||Array.isArray(j))throw new Error('o JSON precisa ser um objeto');
      T=estadoDe(j.tema||j);montar();mudou();status('Tema aplicado a partir do JSON.','ok')}
    catch(e){status('JSON inválido: '+e.message,'err')}
  };

  T=estadoDe(opts.tema||Tm.PADRAO);montar();
  return {
    definir:function(tema){T=estadoDe(tema||Tm.PADRAO);montar()},
    exportar:exportar,
    recarregarPrevia:function(){enviar()}
  };
}
g.TemaEditor={iniciar:iniciar};
})(window);
