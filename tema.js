/* Motor de temas da vitrine CONSTITA.
   Transforma o bloco "tema" do site.json (cores, fontes, forma e layout) em CSS.
   É usado pela vitrine (index.html) e pelo editor de temas (admin/temas.html). */
(function(g){
'use strict';

/* Fontes curadas (Google Fonts). "w" = pesos realmente disponíveis em cada família. */
const FONTES=[
  {n:'Cormorant Garamond',t:'serif',w:'300;400;500;600;700'},
  {n:'Playfair Display',t:'serif',w:'400;500;600;700'},
  {n:'DM Serif Display',t:'serif',w:'400'},
  {n:'Lora',t:'serif',w:'400;500;600;700'},
  {n:'Libre Baskerville',t:'serif',w:'400;700'},
  {n:'Fraunces',t:'serif',w:'300;400;500;600;700'},
  {n:'Bodoni Moda',t:'serif',w:'400;500;600;700'},
  {n:'Cinzel',t:'serif',w:'400;500;600;700'},
  {n:'Inter',t:'sans',w:'300;400;500;600'},
  {n:'Manrope',t:'sans',w:'400;500;600;700'},
  {n:'DM Sans',t:'sans',w:'400;500;600;700'},
  {n:'Poppins',t:'sans',w:'300;400;500;600;700'},
  {n:'Montserrat',t:'sans',w:'400;500;600;700'},
  {n:'Lato',t:'sans',w:'300;400;700'},
  {n:'Work Sans',t:'sans',w:'400;500;600'},
  {n:'Space Grotesk',t:'sans',w:'400;500;600;700'},
  {n:'Nunito',t:'sans',w:'400;500;600;700'},
  {n:'Raleway',t:'sans',w:'400;500;600;700'},
  {n:'Jost',t:'sans',w:'400;500;600'},
  {n:'Outfit',t:'sans',w:'400;500;600'},
  {n:'Plus Jakarta Sans',t:'sans',w:'400;500;600;700'}
];
const achar=n=>FONTES.find(f=>f.n===n)||null;
const pesosDe=n=>{const f=achar(n);return f?f.w.split(';').map(Number):[400]};

/* ---------- cores ---------- */
const hexRe=/^#[0-9a-f]{6}$/i;
function norm(h,def){h=String(h==null?'':h).trim();if(/^#[0-9a-f]{3}$/i.test(h))h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];return hexRe.test(h)?h.toLowerCase():def}
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const lin=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
const lum=h=>{const c=rgb(h).map(lin);return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]};
const contraste=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)};
function hsl(h){
  const c=rgb(h).map(v=>v/255),mx=Math.max(c[0],c[1],c[2]),mn=Math.min(c[0],c[1],c[2]),d=mx-mn,L=(mx+mn)/2;let H=0,S=0;
  if(d){S=L>0.5?d/(2-mx-mn):d/(mx+mn);H=mx===c[0]?((c[1]-c[2])/d+(c[1]<c[2]?6:0)):mx===c[1]?((c[2]-c[0])/d+2):((c[0]-c[1])/d+4);H*=60}
  return {h:H,s:S,l:L};
}
function hex(h,s,l){
  h=((h%360)+360)%360;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let r=0,gg=0,b=0;
  if(h<60){r=c;gg=x}else if(h<120){r=x;gg=c}else if(h<180){gg=c;b=x}else if(h<240){gg=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}
  return '#'+[r,gg,b].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
}
const mix=(a,b,p)=>{const x=rgb(a),y=rgb(b);return '#'+x.map((v,i)=>Math.round(v*(1-p)+y[i]*p).toString(16).padStart(2,'0')).join('')};
const melhorTexto=bg=>contraste('#111111',bg)>=contraste('#ffffff',bg)?'#111111':'#ffffff';
/* Clareia ou escurece "fg" (mantendo o matiz) até atingir o contraste mínimo contra "bg" */
function ajustar(fg,bg,min){
  if(contraste(fg,bg)>=min)return fg;
  const p=hsl(fg),clarear=lum(bg)<0.5;let l=p.l;
  for(let i=0;i<70&&contraste(hex(p.h,p.s,l),bg)<min;i++)l=Math.max(0,Math.min(1,l+(clarear?0.015:-0.015)));
  const r=hex(p.h,p.s,l);return contraste(r,bg)>=min?r:melhorTexto(bg);
}
/* Gera a paleta completa a partir de 3 cores */
function derivar(fundo,texto,destaque){
  const suave=ajustar(mix(texto,fundo,0.42),fundo,4.5),botao=texto;
  return {fundo:fundo,cartao:mix(fundo,texto,0.045),texto:texto,suave:suave,linha:mix(fundo,texto,0.13),
    destaque:destaque,destaqueTexto:melhorTexto(destaque),botao:botao,botaoTexto:contraste(fundo,botao)>=4.5?fundo:melhorTexto(botao)};
}
/* Versão escura automática de uma paleta clara */
function derivarEscuro(c){
  const f=hsl(c.fundo),t=hsl(c.texto),d=hsl(c.destaque);
  const fundo=hex(f.h,Math.min(f.s,0.3),0.085),texto=hex(t.h,Math.min(t.s,0.25),0.93);
  let dl=Math.max(d.l,0.5),destaque=hex(d.h,d.s,dl);
  for(let i=0;i<40&&contraste(destaque,fundo)<3.2;i++){dl=Math.min(0.9,dl+0.02);destaque=hex(d.h,d.s,dl)}
  return {fundo:fundo,cartao:mix(fundo,texto,0.06),texto:texto,suave:ajustar(mix(texto,fundo,0.4),fundo,4.5),linha:mix(fundo,texto,0.16),
    destaque:destaque,destaqueTexto:melhorTexto(destaque),botao:texto,botaoTexto:fundo};
}

/* ---------- tema padrão (o visual atual) e presets ---------- */
const PADRAO={
  preset:'atelier',
  cores:{fundo:'#faf8f4',cartao:'#f3eee6',texto:'#1c1814',suave:'#6f655b',linha:'#e6dfd4',destaque:'#1c1814',destaqueTexto:'#faf8f4',botao:'#1c1814',botaoTexto:'#faf8f4'},
  escuro:{modo:'auto',cores:{}},
  fontes:{titulo:'Cormorant Garamond',texto:'Inter',pesoTitulo:0,caixaTitulo:'normal',espacoTitulo:0,tamanhoBase:15},
  forma:{raio:0,botao:'quadrado'},
  layout:{cabecalho:'fixo',abertura:'centro',cartao:'limpo',proporcao:'3/4',colunasMobile:2,colunasDesktop:4,densidade:'confortavel'}
};
const L=(o)=>Object.assign({cabecalho:'fixo',abertura:'centro',cartao:'limpo',proporcao:'3/4',colunasMobile:2,colunasDesktop:4,densidade:'confortavel'},o);
/* Inspirados em estilos comuns de lojas de moda; não reproduzem nenhum modelo específico. */
const PRESETS={
  atelier:{nome:'Atelier',desc:'Creme e marrom, serifada elegante (visual atual)',tema:PADRAO},
  mono:{nome:'Mono',desc:'Branco e preto, minimalista e limpo',tema:{
    cores:{fundo:'#ffffff',cartao:'#f5f5f4',texto:'#111111',suave:'#5f5f5f',linha:'#e4e4e2',destaque:'#111111',destaqueTexto:'#ffffff',botao:'#111111',botaoTexto:'#ffffff'},
    fontes:{titulo:'Inter',texto:'Inter',pesoTitulo:500,caixaTitulo:'normal',espacoTitulo:-1,tamanhoBase:15},
    forma:{raio:0,botao:'quadrado'},layout:L({proporcao:'4/5',colunasDesktop:4})}},
  rose:{nome:'Rosé',desc:'Rosa suave, cantos arredondados, cabeçalho centralizado',tema:{
    cores:{fundo:'#fdf6f4',cartao:'#f8e9e6',texto:'#3a2430',suave:'#7a5866',linha:'#efd8d4',destaque:'#b0446a',destaqueTexto:'#ffffff',botao:'#3a2430',botaoTexto:'#fdf6f4'},
    fontes:{titulo:'Playfair Display',texto:'Lato',pesoTitulo:500,caixaTitulo:'normal',espacoTitulo:0,tamanhoBase:15},
    forma:{raio:14,botao:'pilula'},layout:L({cabecalho:'centro',cartao:'sombra',proporcao:'4/5'})}},
  urbano:{nome:'Urbano',desc:'Cinza claro com laranja vibrante, títulos fortes em maiúsculas',tema:{
    cores:{fundo:'#f2f2f0',cartao:'#ffffff',texto:'#121212',suave:'#555555',linha:'#d4d4d0',destaque:'#ff5a1f',destaqueTexto:'#121212',botao:'#121212',botaoTexto:'#ffffff'},
    fontes:{titulo:'Space Grotesk',texto:'Inter',pesoTitulo:700,caixaTitulo:'maiusculas',espacoTitulo:1,tamanhoBase:15},
    forma:{raio:0,botao:'quadrado'},layout:L({abertura:'esquerda',cartao:'moldura',densidade:'compacta'})}},
  natural:{nome:'Natural',desc:'Verdes suaves e serifada de destaque, bastante respiro',tema:{
    cores:{fundo:'#f4f6ef',cartao:'#e8eddf',texto:'#1f2d1b',suave:'#4f5f49',linha:'#d3dcc7',destaque:'#4a6b3a',destaqueTexto:'#ffffff',botao:'#2f4a25',botaoTexto:'#f4f6ef'},
    fontes:{titulo:'DM Serif Display',texto:'DM Sans',pesoTitulo:400,caixaTitulo:'normal',espacoTitulo:0,tamanhoBase:16},
    forma:{raio:10,botao:'arredondado'},layout:L({proporcao:'4/5',densidade:'espacosa'})}},
  noir:{nome:'Noir',desc:'Escuro com dourado, luxo discreto',tema:{
    cores:{fundo:'#121110',cartao:'#1c1b19',texto:'#f1ece3',suave:'#a8a297',linha:'#35322d',destaque:'#c8a45c',destaqueTexto:'#121110',botao:'#f1ece3',botaoTexto:'#121110'},
    escuro:{modo:'nunca',cores:{}},
    fontes:{titulo:'Cormorant Garamond',texto:'Montserrat',pesoTitulo:500,caixaTitulo:'normal',espacoTitulo:2,tamanhoBase:15},
    forma:{raio:0,botao:'quadrado'},layout:L({cabecalho:'centro',proporcao:'2/3',densidade:'espacosa'})}},
  vibrante:{nome:'Vibrante',desc:'Branco com roxo, formas redondas e cartões com sombra',tema:{
    cores:{fundo:'#ffffff',cartao:'#f4f1ff',texto:'#1b1340',suave:'#5a5380',linha:'#e4def8',destaque:'#6c3cff',destaqueTexto:'#ffffff',botao:'#6c3cff',botaoTexto:'#ffffff'},
    fontes:{titulo:'Poppins',texto:'Poppins',pesoTitulo:600,caixaTitulo:'normal',espacoTitulo:-1,tamanhoBase:15},
    forma:{raio:18,botao:'pilula'},layout:L({cartao:'sombra',proporcao:'1/1'})}},
  fresh:{nome:'Fresh',desc:'Azul-petróleo claro, moldura leve e leitura arejada',tema:{
    cores:{fundo:'#f2fafb',cartao:'#e2f1f3',texto:'#0f2f3a',suave:'#44636d',linha:'#cde4e8',destaque:'#087b91',destaqueTexto:'#ffffff',botao:'#0f2f3a',botaoTexto:'#f2fafb'},
    fontes:{titulo:'Outfit',texto:'Nunito',pesoTitulo:500,caixaTitulo:'normal',espacoTitulo:0,tamanhoBase:16},
    forma:{raio:12,botao:'arredondado'},layout:L({abertura:'esquerda',cartao:'moldura',proporcao:'4/5'})}}
};

/* ---------- normalização ---------- */
const em=(v,lista,def)=>lista.indexOf(v)>=0?v:def;
const lim=(v,a,b,def)=>{v=Number(v);return isNaN(v)?def:Math.max(a,Math.min(b,v))};
function normalizar(t){
  t=t||{};const P=PADRAO,o={preset:String(t.preset||''),cores:{},escuro:{cores:{}},fontes:{},forma:{},layout:{}};
  Object.keys(P.cores).forEach(k=>{o.cores[k]=norm((t.cores||{})[k],P.cores[k])});
  const e=t.escuro||{},der=derivarEscuro(o.cores);
  o.escuro.modo=em(e.modo,['auto','nunca','sempre'],'auto');
  Object.keys(P.cores).forEach(k=>{o.escuro.cores[k]=norm((e.cores||{})[k],der[k])});
  const f=t.fontes||{};
  o.fontes.titulo=achar(f.titulo)?f.titulo:P.fontes.titulo;
  o.fontes.texto=achar(f.texto)?f.texto:P.fontes.texto;
  const pw=Number(f.pesoTitulo)||0;o.fontes.pesoTitulo=pw&&pesosDe(o.fontes.titulo).indexOf(pw)>=0?pw:0;
  o.fontes.caixaTitulo=em(f.caixaTitulo,['normal','maiusculas'],'normal');
  o.fontes.espacoTitulo=lim(f.espacoTitulo,-3,12,0);
  o.fontes.tamanhoBase=lim(f.tamanhoBase,13,19,15);
  const fo=t.forma||{};o.forma.raio=Math.round(lim(fo.raio,0,28,0));o.forma.botao=em(fo.botao,['quadrado','arredondado','pilula'],'quadrado');
  const l=t.layout||{},D=P.layout;
  o.layout.cabecalho=em(l.cabecalho,['fixo','estatico','centro'],D.cabecalho);
  o.layout.abertura=em(l.abertura,['centro','esquerda'],D.abertura);
  o.layout.cartao=em(l.cartao,['limpo','moldura','sombra'],D.cartao);
  o.layout.proporcao=em(l.proporcao,['3/4','4/5','1/1','2/3'],D.proporcao);
  o.layout.colunasMobile=em(Number(l.colunasMobile),[1,2],D.colunasMobile);
  o.layout.colunasDesktop=em(Number(l.colunasDesktop),[3,4,5],D.colunasDesktop);
  o.layout.densidade=em(l.densidade,['compacta','confortavel','espacosa'],D.densidade);
  return o;
}

/* ---------- geração de CSS ---------- */
const tokens=c=>'--bg:'+c.fundo+';--card:'+c.cartao+';--ink:'+c.texto+';--mute:'+c.suave+';--line:'+c.linha+';--acc:'+c.destaque+';--acct:'+c.destaqueTexto+';--dk:'+c.botao+';--dkt:'+c.botaoTexto;
const pilha=f=>"'"+f.n+"',"+(f.t==='serif'?'Georgia,"Times New Roman",serif':'system-ui,-apple-system,"Segoe UI",sans-serif');
function css(n){
  const F=n.fontes,A=achar(F.titulo),B=achar(F.texto);
  const rb={quadrado:0,arredondado:8,pilula:999}[n.forma.botao],rbd={quadrado:0,arredondado:6,pilula:999}[n.forma.botao];
  const sec={compacta:64,confortavel:96,espacosa:128}[n.layout.densidade];
  const vars=tokens(n.cores)+';--serif:'+pilha(A)+';--sans:'+pilha(B)+';--base:'+F.tamanhoBase+'px;--ttt:'+(F.caixaTitulo==='maiusculas'?'uppercase':'none')+
    ';--tls:'+(F.espacoTitulo/100)+'em;--r:'+n.forma.raio+'px;--rb:'+rb+'px;--rbd:'+rbd+'px;--prop:'+n.layout.proporcao+
    ';--cols-m:'+n.layout.colunasMobile+';--cols-d:'+n.layout.colunasDesktop+';--sec:'+sec+'px'+(F.pesoTitulo?';--wt:'+F.pesoTitulo:'');
  const dark=tokens(n.escuro.cores);
  return ':root:root:root{'+vars+'}\nhtml[data-modo=escuro]:root:root{'+dark+'}\n@media(prefers-color-scheme:dark){html[data-modo=auto]:root:root{'+dark+'}}';
}
const atributos=n=>({'data-modo':{auto:'auto',nunca:'claro',sempre:'escuro'}[n.escuro.modo],'data-cab':n.layout.cabecalho,'data-abertura':n.layout.abertura,'data-cartao':n.layout.cartao});
function fontesUrl(n){
  const vistos={},partes=[];
  [achar(n.fontes.titulo),achar(n.fontes.texto)].forEach(f=>{if(vistos[f.n])return;vistos[f.n]=1;partes.push('family='+f.n.replace(/ /g,'+')+':wght@'+f.w)});
  return 'https://fonts.googleapis.com/css2?'+partes.join('&')+'&display=swap';
}

/* ---------- aplicação no documento ---------- */
function aplicar(t,opt){
  opt=opt||{};const n=normalizar(t),d=document,txt=css(n),at=atributos(n),url=fontesUrl(n);
  let st=d.getElementById('tema');if(!st){st=d.createElement('style');st.id='tema';d.head.appendChild(st)}
  st.textContent=txt;
  Object.keys(at).forEach(k=>d.documentElement.setAttribute(k,at[k]));
  let lk=d.getElementById('fonte-tema');if(!lk){lk=d.createElement('link');lk.id='fonte-tema';lk.rel='stylesheet';d.head.appendChild(lk)}
  if(lk.getAttribute('href')!==url)lk.setAttribute('href',url);
  const base=d.getElementById('fonte-base');if(base)base.remove();
  if(!opt.previa){try{localStorage.setItem('constita-tema',JSON.stringify({css:txt,attrs:at,fonte:url}))}catch(e){}}
  return n;
}
function limpar(){
  const d=document,s=d.getElementById('tema');if(s)s.remove();
  const l=d.getElementById('fonte-tema');if(l)l.remove();
  ['data-modo','data-cab','data-abertura','data-cartao'].forEach(k=>d.documentElement.removeAttribute(k));
  try{localStorage.removeItem('constita-tema')}catch(e){}
}

g.Tema={FONTES:FONTES,PRESETS:PRESETS,PADRAO:PADRAO,achar:achar,pesosDe:pesosDe,normalizar:normalizar,css:css,atributos:atributos,fontesUrl:fontesUrl,
  aplicar:aplicar,limpar:limpar,contraste:contraste,ajustar:ajustar,derivar:derivar,derivarEscuro:derivarEscuro,melhorTexto:melhorTexto,norm:norm};
})(window);
