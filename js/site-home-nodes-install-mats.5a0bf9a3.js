/* AANA\CLADDING — shared page behavior (subpages; index carries its own hero logic) */
(function(){
  /* mobile menu — scoped per page container so it works in the combined preview too */
  document.querySelectorAll('.burger').forEach(function(bg){
    var root=bg.closest('.pg')||document;
    var mob=root.querySelector('.mob');
    if(!mob)return;
    bg.addEventListener('click',function(){var o=mob.classList.toggle('open');bg.setAttribute('aria-expanded',String(o))});
    mob.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mob.classList.remove('open');bg.setAttribute('aria-expanded','false')})});
  });

  /* reveal on scroll */
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.rv').forEach(function(el){io.observe(el)});
  } else { document.querySelectorAll('.rv').forEach(function(el){el.classList.add('in-view')}); }

  /* project filters */
  document.querySelectorAll('.chips').forEach(function(wrap){
    var root=wrap.closest('.pg')||document;
    wrap.querySelectorAll('.chip').forEach(function(ch){
      ch.addEventListener('click',function(){
        wrap.querySelectorAll('.chip').forEach(function(c){c.classList.toggle('on',c===ch)});
        var f=ch.dataset.f;
        var shown=0;
        root.querySelectorAll('.pj[data-tags]').forEach(function(card){
          var on=f==='all'||card.dataset.tags.split(' ').indexOf(f)>=0;card.classList.toggle('hide',!on);if(on)shown++;
        });
        var note=root.querySelector('.fiber-note');if(note)note.hidden=shown>0;
      });
    });
  });

  /* project view: card → full-screen photo set (photos live in <template class="pics">) */
  document.querySelectorAll('.pv').forEach(function(pv){
    var root=pv.closest('.pg')||document.body;
    var grid=pv.querySelector('.pv-grid'),h2=pv.querySelector('.pv-t h2'),pp=pv.querySelector('.pv-t p'),last=null;
    function open(card){
      var tpl=card.querySelector('template.pics');if(!tpl)return;
      grid.innerHTML='';grid.appendChild(tpl.content.cloneNode(true));
      /* the bundle rewrites img src at load time; re-apply for freshly cloned nodes */
      if(window.__fixAssets)window.__fixAssets(grid);
      h2.textContent=card.querySelector('h3').textContent;pp.textContent=card.querySelector('.m').textContent;
      last=card;pv.hidden=false;pv.scrollTop=0;document.documentElement.classList.add('pv-open');pv.querySelector('.pv-x').focus();
    }
    function close(){pv.hidden=true;document.documentElement.classList.remove('pv-open');if(last)last.focus();}
    root.querySelectorAll('.prj').forEach(function(card){
      card.addEventListener('click',function(){open(card)});
      card.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(card);}});
    });
    pv.querySelector('.pv-x').addEventListener('click',close);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!pv.hidden)close();});
  });

  /* lead form: open WhatsApp with the filled request (no backend needed); mailto as a fallback */
  document.querySelectorAll('form[data-lead]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();
      var L=(f.dataset.labels||'').split('|'),v=function(n){var el=f.querySelector('[name='+n+']');return el?el.value.trim():''};
      var lines=[f.dataset.intro,'',L[0]+': '+v('name'),L[1]+': '+v('phone')];
      if(v('email'))lines.push(L[2]+': '+v('email'));
      lines.push(L[3]+': '+v('type'));if(v('message'))lines.push('',L[4]+': '+v('message'));
      var fi=f.querySelector('[name=files]');if(fi&&fi.files&&fi.files.length){var names=[].slice.call(fi.files).map(function(x){return x.name});lines.push('',(f.dataset.files||'Files')+': '+names.join(', '));}
      var text=lines.join('\n');
      /* 1) the lead goes to the spreadsheet + e-mail endpoint (set at build time); keepalive lets it finish while WhatsApp opens */
      var ep=f.dataset.endpoint;
      if(ep&&window.fetch){var q=new URLSearchParams(location.search),data={name:v('name'),phone:v('phone'),email:v('email'),type:v('type'),message:v('message'),files:(fi&&fi.files?[].slice.call(fi.files).map(function(x){return x.name}).join(', '):''),lang:document.documentElement.lang||'',page:location.href,referrer:document.referrer,utm:['utm_source','utm_medium','utm_campaign'].map(function(k){return q.get(k)||''}).join('|')};
        try{fetch(ep,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)}).catch(function(){});}catch(err){}}
      /* 2) and the visitor continues in WhatsApp with the same text */
      var btn=f.querySelector('.btn');btn.textContent=f.dataset.sent;btn.disabled=true;
      var w=window.open('https://wa.me/972533827159?text='+encodeURIComponent(text),'_blank');
      if(!w)location.href='mailto:info@aana-cladding.co.il?subject='+encodeURIComponent(f.dataset.intro)+'&body='+encodeURIComponent(text);
      setTimeout(function(){btn.disabled=false},4000);
    });
  });
  /* file picker: show chosen names */
  document.querySelectorAll('.fpick input[type=file]').forEach(function(inp){inp.addEventListener('change',function(){var n=inp.files.length,el=inp.parentElement.querySelector('.fname');el.textContent=n?[].slice.call(inp.files).map(function(x){return x.name}).join(', '):'';});});
  /* quick bar (phones): appear after the first screen, hide while the contact form / footer is on screen */
  document.querySelectorAll('.qbar').forEach(function(bar){
    var root=bar.closest('.pg')||document;
    function upd(){if(root!==document&&root.hidden)return;var vh=window.innerHeight,y=window.scrollY;
      var c=root.querySelector('#contact')||root.querySelector('footer');var near=false;
      if(c){var r=c.getBoundingClientRect();near=r.top<vh*0.75&&r.bottom>0;}
      bar.classList.toggle('show',y>vh*0.9&&!near);}
    window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
  });
  /* fake submit */
  document.querySelectorAll('form[data-demo]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();f.querySelector('.btn').textContent='נשלח — נחזור אליכם עד סוף יום העסקים';});
  });
})();

/* works gallery: filters, lightbox, before/after */
(function(){
  /* bundle: one .pg per page; standalone page: the document itself */
  var roots=[].slice.call(document.querySelectorAll('.pg'));if(!roots.length)roots=[document.documentElement];
  roots.forEach(function(root){
    var rtl=root.getAttribute('dir')==='rtl';
    /* filters */
    var chips=root.querySelectorAll('.wk-chips .chip'),items=root.querySelectorAll('.wk-grid .gi[data-tags]'),num=root.querySelector('.wk-n b'),empty=root.querySelector('.wk-empty');
    chips.forEach(function(ch){ch.addEventListener('click',function(){
      chips.forEach(function(c){c.classList.toggle('on',c===ch)});
      var f=ch.dataset.g,n=0;
      items.forEach(function(it){var on=f==='all'||it.dataset.tags.split(' ').indexOf(f)>=0;it.classList.toggle('hide',!on);if(on)n++;});
      if(num)num.textContent=n;if(empty)empty.hidden=n>0;
    });});
    /* gallery clips: muted, play only while on screen */
    var clips=[].slice.call(root.querySelectorAll('.wk-grid video'));
    if(clips.length&&'IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      var cio=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){});}else v.pause();});},{threshold:.4});
      clips.forEach(function(v){v.muted=true;cio.observe(v);});}
    /* lightbox */
    var lb=root.querySelector('.lb');
    if(lb){
      var img=lb.querySelector('.lb-st img'),cnt=lb.querySelector('.lb-c'),ttl=lb.querySelector('.lb-t'),list=[],cur=0,last=null;
      function vis(){return Array.prototype.filter.call(root.querySelectorAll('.gi'),function(g){return !g.classList.contains('hide')});}
      var lv=document.createElement('video');lv.muted=true;lv.loop=true;lv.controls=true;lv.setAttribute('playsinline','');lv.hidden=true;img.parentNode.appendChild(lv);
      function show(i){cur=(i+list.length)%list.length;var g=list[cur],im=g.querySelector('img'),gv=g.querySelector('video'),label=g.querySelector('.gi-b').getAttribute('aria-label')||'';
        if(gv){img.hidden=true;img.removeAttribute('src');lv.hidden=false;lv.poster=gv.poster;lv.src=gv.currentSrc||gv.querySelector('source').src;var p=lv.play();if(p&&p.catch)p.catch(function(){});}
        else{lv.pause();lv.removeAttribute('src');lv.hidden=true;img.hidden=false;img.src=im.dataset.full||im.currentSrc||im.src;img.alt=label;}
        cnt.textContent=String(cur+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0');ttl.textContent=label;}
      function open(g){list=vis();last=g.querySelector('.gi-b');show(list.indexOf(g));lb.hidden=false;document.documentElement.classList.add('lb-open');lb.querySelector('.lb-x').focus();}
      function close(){lb.hidden=true;lv.pause();lv.removeAttribute('src');img.removeAttribute('src');document.documentElement.classList.remove('lb-open');if(last)last.focus();}
      root.querySelectorAll('.gi-b').forEach(function(b){b.addEventListener('click',function(){open(b.closest('.gi'))})});
      lb.querySelector('.lb-x').addEventListener('click',close);
      lb.querySelector('.lb-p').addEventListener('click',function(){show(cur-1)});
      lb.querySelector('.lb-n').addEventListener('click',function(){show(cur+1)});
      lb.querySelector('.lb-st').addEventListener('click',function(e){if(e.target!==img)close();});
      document.addEventListener('keydown',function(e){if(lb.hidden)return;
        if(e.key==='Escape')close();
        else if(e.key==='ArrowRight')show(cur+(rtl?-1:1));
        else if(e.key==='ArrowLeft')show(cur+(rtl?1:-1));});
      var sx=null;
      lb.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
      lb.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)<40)return;var fwd=dx<0;if(rtl)fwd=!fwd;show(cur+(fwd?1:-1));},{passive:true});
    }
    /* before / after */
    root.querySelectorAll('.ba').forEach(function(ba){var r=ba.querySelector('input');function u(){ba.style.setProperty('--x',r.value+'%')}r.addEventListener('input',u);u();});
  });
})();
;
var SROOT=(document.currentScript&&document.currentScript.closest&&document.currentScript.closest('.pg'))||document;
function $id(x){return SROOT.querySelector('#'+x)}
function $q(sel){return SROOT.querySelector(sel)}
function $qa(sel){return SROOT.querySelectorAll(sel)}
function lazyGL(el,make,drop){if(!('IntersectionObserver' in window)){make();return;}
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)make();})},{rootMargin:'80% 0px'}).observe(el);
  /* release only when far away (or the page is hidden): re-creating a context on every pass makes scrolling hitch */
  new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)drop();})},{rootMargin:'300% 0px'}).observe(el);}
/* build a scene only for a page that is actually shown: at once when it comes near the viewport, otherwise one by one in idle time */
function whenNear(el,fn){var done=false,io=null;function go(){if(done)return;done=true;if(io)io.disconnect();fn();}
  if(!('IntersectionObserver' in window)){go();return;}
  io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)go();})},{rootMargin:'200% 0px'});io.observe(el);
  var n=window.__lazyN=(window.__lazyN||0)+1,idle=function(){if(el.offsetHeight)go();};
  if(window.requestIdleCallback)requestIdleCallback(idle,{timeout:3000+n*500});else setTimeout(idle,1500+n*400);}

(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav=$id('nav'),heroMedia=$id('heroMedia'),bandMedia=$id('bandMedia'),band=$id('statement'),hero=$id('top');
  function onS(){
    var y=window.scrollY;
    nav.classList.toggle('on',y>hero.offsetHeight-80);
    if(reduce||!band||!bandMedia)return;
    var r=band.getBoundingClientRect();
    if(r.bottom>0&&r.top<window.innerHeight){var p=(r.top+r.height/2-window.innerHeight/2)/window.innerHeight;bandMedia.style.transform='translateY('+(p*-50)+'px)';}
  }
  window.addEventListener('scroll',onS,{passive:true});onS();

  /* 3D assembly of the ventilated facade system */
  (function(){
    var cv=$id('asm'),wrap=$id('top');
    var cnt=$id('asmCount'),stg=$id('asmStage');
    var tabs=$qa('.stages span'),t0=$q('.asm .t0'),t1=$q('.asm .t1'),callsBox=$id('calls');
    var cntBox=$q('.asm .cnt'),I18N=window.HOME_I18N; /* per-page values: captured now, the scene itself may be built later */
    function bail(){cv.remove();wrap.style.height='100vh';if(t1){t0.classList.add('off');t1.classList.remove('off');}if(cntBox)cntBox.style.display='none';}
    if(!window.THREE){bail();return;}
    function init(){
    /* WebGL context is created only near the viewport and released far away (browsers cap active contexts) */
    var renderer=null,W=0,H=0;
    function makeRenderer(){if(renderer)return;var n=cv.cloneNode(false);if(cv.parentNode)cv.parentNode.replaceChild(n,cv);cv=n;
      try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:window.innerWidth>=900,alpha:true});}catch(e){renderer=null;bail();return;}
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputEncoding=THREE.sRGBEncoding;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      W=0;size();frame(cur<0?progress():cur);}
    function dropRenderer(){if(!renderer)return;renderer.forceContextLoss();renderer.dispose();renderer=null;}
    var scene=new THREE.Scene();scene.fog=new THREE.Fog(0xECEEF1,10,22);
    var cam=new THREE.PerspectiveCamera(38,1,.05,60);
    scene.add(new THREE.HemisphereLight(0xffffff,0xa8adb4,.55));
    var key=new THREE.DirectionalLight(0xffffff,.75);key.position.set(4,6,7);key.castShadow=true;
    key.shadow.mapSize.set(1536,1536);var kc=key.shadow.camera;kc.left=-4.2;kc.right=4.2;kc.top=3.2;kc.bottom=-3.2;kc.near=1;kc.far=24;key.shadow.bias=-0.0006;
    scene.add(key);
    var fill=new THREE.DirectionalLight(0xE8EEF6,.3);fill.position.set(-6,1,5);scene.add(fill);

    function tex(w,h,draw,rx,ry){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);return t;}
    function noise(g,w,h,n,a1,a2){for(var i=0;i<n;i++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'255,255,255')+','+(a1+Math.random()*a2)+')';g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2);}}
    var concreteT=tex(512,512,function(g,w,h){g.fillStyle='#9B9E9A';g.fillRect(0,0,w,h);noise(g,w,h,14000,.03,.09);
      g.strokeStyle='rgba(0,0,0,.14)';for(var x=0;x<=w;x+=128){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
      g.fillStyle='rgba(0,0,0,.18)';for(var i=0;i<12;i++){g.beginPath();g.arc(64+(i%4)*128,64+((i/4)|0)*170,7,0,7);g.fill();}},2,1.4);
    var dektonT=tex(512,512,function(g,w,h){g.fillStyle='#2C3034';g.fillRect(0,0,w,h);noise(g,w,h,7000,.015,.05);
      var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(255,255,255,.05)');gr.addColorStop(1,'rgba(0,0,0,.08)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
    var woolT=tex(256,256,function(g,w,h){g.fillStyle='#A79877';g.fillRect(0,0,w,h);
      for(var i=0;i<2600;i++){g.strokeStyle='rgba('+(Math.random()<.5?'70,60,40':'215,205,180')+','+(.05+Math.random()*.1)+')';g.beginPath();var x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);g.lineTo(x+(Math.random()-.5)*14,y+(Math.random()-.5)*6);g.stroke();}});
    var aluT=tex(256,256,function(g,w,h){g.fillStyle='#CDD1D5';g.fillRect(0,0,w,h);
      for(var x=0;x<w;x+=2){g.fillStyle='rgba(255,255,255,'+(Math.random()*.12)+')';g.fillRect(x,0,1,h);}g.fillStyle='rgba(0,0,0,.05)';for(var x2=0;x2<w;x2+=7){g.fillRect(x2,0,1,h);}});

    var kraftT=tex(512,512,function(g,w,h){g.fillStyle='#D3C6A0';g.fillRect(0,0,w,h);noise(g,w,h,5000,.02,.05);
      g.strokeStyle='rgba(0,0,0,.07)';for(var y=0;y<=h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
      g.fillStyle='rgba(40,40,40,.55)';g.font='700 26px Arial';g.textAlign='center';
      for(var r=0;r<4;r++)for(var c=0;c<2;c++){g.save();g.translate(128+c*256,80+r*128);g.fillText('DEKTON',0,0);g.font='400 11px Arial';g.fillText('Ultracompact Surfaces',0,18);g.restore();g.font='700 26px Arial';}},1,1);
    var M={
      concrete:new THREE.MeshStandardMaterial({map:concreteT,roughness:.96,metalness:0}),
      concreteSide:new THREE.MeshStandardMaterial({color:0xC4C6C2,roughness:.95}),
      alu:new THREE.MeshStandardMaterial({map:aluT,color:0xE6E9EC,roughness:.38,metalness:.85}),
      aluDark:new THREE.MeshStandardMaterial({color:0x8E959C,roughness:.45,metalness:.8}),
      steel:new THREE.MeshStandardMaterial({color:0xB7BDC4,roughness:.3,metalness:.9}),
      wool:new THREE.MeshStandardMaterial({map:woolT,roughness:1,metalness:0}),
      disc:new THREE.MeshStandardMaterial({color:0xBDB9AC,roughness:.9}),
      dekton:new THREE.MeshStandardMaterial({map:dektonT,roughness:.55,metalness:.08}),
      dektonEdge:new THREE.MeshStandardMaterial({color:0x24272B,roughness:.6}),
      kraft:new THREE.MeshStandardMaterial({map:kraftT,roughness:.9,metalness:0}),
      blackAlu:new THREE.MeshStandardMaterial({color:0x1F2225,roughness:.5,metalness:.6})
    };

    var parts=[]; /* {g:Object3D, home:{p,r}, from:{p,r}, a,b, lock} */
    function addPart(g,home,from,a,b,lock){g.position.copy(from.p);if(from.r)g.rotation.set(from.r.x||0,from.r.y||0,from.r.z||0);g.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});root.add(g);parts.push({g:g,home:home,from:from,a:a,b:b,lock:lock||0});}
    function V(x,y,z){return new THREE.Vector3(x,y,z)}
    function box(w,h,d,m){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m)}

    var root=new THREE.Group();root.position.x=-0.8;scene.add(root);
    /* wall */
    var wall=new THREE.Mesh(new THREE.BoxGeometry(4.9,3.3,.3),[M.concreteSide,M.concreteSide,M.concreteSide,M.concreteSide,M.concrete,M.concreteSide]);
    wall.position.z=-.15;wall.receiveShadow=true;wall.castShadow=true;root.add(wall);

    /* stage windows */
    var S1=[.05,.24],S2=[.26,.42],S3=[.44,.60],S3b=[.60,.68],S4=[.70,.94];

    /* brackets: 4 columns x 3 rows */
    var bx=[-1.86,-.62,.62,1.86],by=[-1.05,0,1.05];
    var bi=0,bn=bx.length*by.length;
    bx.forEach(function(x){by.forEach(function(y){
      var g=new THREE.Group();
      var leg1=box(.06,.17,.006,M.alu);leg1.position.set(-.02,0,.003);g.add(leg1);
      var leg2=box(.006,.17,.12,M.alu);leg2.position.set(.008,0,.063);g.add(leg2);
      [-1,1].forEach(function(sg){var b1=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.012,16),M.steel);b1.rotation.x=Math.PI/2;b1.position.set(-.032,.05*sg,.008);g.add(b1);});
      var b3=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.016,16),M.steel);b3.rotation.z=Math.PI/2;b3.position.set(.012,0,.1);g.add(b3);
      var i=bi++;var a=S1[0]+(S1[1]-S1[0])*(i/bn)*.7,e=a+(S1[1]-S1[0])*.3;
      addPart(g,{p:V(x,y,0)},{p:V(x,y,1.6),r:{x:-.3}},a,e);
    });});

    /* insulation: staggered boards 1.2 x 0.6 x .08 */
    var wi=0,rows=6,cols=5,wn=0;var boards=[];
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){var w=1.0,h=.55;var x=-2.0+c*1.0+((r%2)?.5:0),y=-1.375+r*.55;if(x>2.0)x=2.0;boards.push([x,y]);wn++;}
    boards.forEach(function(bxy,i){
      var g=new THREE.Group();
      var bmat=M.wool.clone();bmat.color=new THREE.Color(0xffffff).offsetHSL(0,(Math.random()-.5)*.04,(Math.random()-.5)*.06);
      var bd=box(.985,.535,.08,bmat);bd.position.z=.04;g.add(bd);
      var d1=new THREE.Mesh(new THREE.CylinderGeometry(.021,.021,.005,18),M.disc);d1.rotation.x=Math.PI/2;d1.position.set(.22,.12,.082);g.add(d1);
      var d2=d1.clone();d2.position.set(-.25,-.14,.082);g.add(d2);
      var a=S2[0]+(S2[1]-S2[0])*(i/wn)*.75,e=a+(S2[1]-S2[0])*.25;
      addPart(g,{p:V(bxy[0],bxy[1],0),r:{z:(Math.random()-.5)*.01}},{p:V(bxy[0],bxy[1],1.3)},a,e);
    });

    /* vertical T profiles on brackets */
    bx.forEach(function(x,i){
      var g=new THREE.Group();
      var web=box(.008,3.24,.1,M.blackAlu);web.position.set(.02,0,.115);g.add(web);
      var face=box(.06,3.24,.008,M.blackAlu);face.position.set(0,0,.169);g.add(face);
      var a=S3[0]+(S3[1]-S3[0])*(i/bx.length)*.6,e=a+(S3[1]-S3[0])*.4;
      addPart(g,{p:V(x,0,0)},{p:V(x,0,1.8)},a,e);
    });
    /* horizontal hanging rails: 2 per panel row */
    var rowY=[-.816,.816],railY=[];rowY.forEach(function(y){railY.push(y+.6,y-.6)});
    railY.forEach(function(y,i){
      var g=new THREE.Group();
      var r1=box(4.55,.055,.006,M.alu);r1.position.z=.185;g.add(r1);
      var lip=box(4.55,.006,.024,M.alu);lip.position.set(0,.03,.176);lip.rotation.x=.6;g.add(lip);
      var ret=box(4.55,.006,.014,M.alu);ret.position.set(0,-.028,.18);g.add(ret);
      var a=S3b[0]+(S3b[1]-S3b[0])*(i/railY.length)*.6,e=a+(S3b[1]-S3b[0])*.4;
      addPart(g,{p:V(0,y,0)},{p:V(0,y,1.6)},a,e);
    });

    /* Dekton panels with hidden hangers: 2 rows x 3 cols */
    var px=[1.622,0,-1.622],pi=0,pn=6;
    [rowY[0],rowY[1]].forEach(function(y){px.forEach(function(x){
      var g=new THREE.Group();
      var pm=M.dekton.clone();pm.color=new THREE.Color(0xffffff).offsetHSL(0,0,(Math.random()-.5)*.05);
      var pnl=new THREE.Mesh(new THREE.BoxGeometry(1.61,1.62,.013),[M.dektonEdge,M.dektonEdge,M.dektonEdge,M.dektonEdge,pm,M.kraft]);
      pnl.position.z=.007;g.add(pnl);
      [[-.45,.6],[.45,.6],[-.45,-.66],[.45,-.66]].forEach(function(hp){
        var dg=box(.2,.045,.016,M.alu);dg.position.set(hp[0],hp[1],-.012);g.add(dg);
        var dl=box(.2,.006,.022,M.alu);dl.position.set(hp[0],hp[1]-.025,-.018);dl.rotation.x=-.5;g.add(dl);
      });
      var i=pi++;var a=S4[0]+(S4[1]-S4[0])*(i/pn)*.72,e=a+(S4[1]-S4[0])*.28;
      addPart(g,{p:V(x,y,.213)},{p:V(x,y,1.9),r:{x:-.16}},a,e,.035);
    });});

    /* callouts */
    var callDefs=[
      {p:V(1.86,-1.05,.12),t:'זווית עיגון מתכת · מעוגנת לבטון',a:.10,b:.26},
      {p:V(-.5,.42,.1),t:'צמר סלעים 80 מ״מ · דיבל תרמי',a:.29,b:.44},
      {p:V(-1.86,-.35,.19),t:'פרופיל L אנכי · מחובר לזווית',a:.46,b:.60},
      {p:V(1.0,.2,.2),t:'פרופיל רוחבי PR · לכל אורך החזית',a:.60,b:.69},
      {p:V(1.622,-.816,.23),t:'לוח DEKTON · קליפסים בגב שננעלים ב־PR',a:.76,b:.95}
    ];
    var calls=callDefs.map(function(cd){var d=document.createElement('div');d.className='call';var ct=(I18N&&I18N.calls)?I18N.calls[callDefs.indexOf(cd)]:cd.t;d.innerHTML='<i></i><em>'+ct+'</em>';callsBox.appendChild(d);return {el:d,def:cd};});

    /* camera keys: [p, pos, lookAt] */
    var K=[
      [0.00,[-0.2, .35,6.6],[-0.8,0,0]],
      [0.10,[ 1.6,-.7, 4.2],[ .6,-.9,0]],
      [0.24,[ 1.2, .2, 4.8],[ .2,-.2,0]],
      [0.34,[-2.4, .7, 5.2],[-1.2,.1,0]],
      [0.46,[-3.0,-.5, 4.0],[-1.9,-.3,0]],
      [0.60,[-1.0, .3, 5.4],[-.8,0,0]],
      [0.70,[ 1.2, .6, 4.6],[ .2,.2,0]],
      [0.80,[ 1.8,-1.0,3.2],[ .8,-.85,.1]],
      [0.92,[-1.2, .3, 6.2],[-.8,0,0]],
      [1.00,[-0.4, .1, 6.9],[-.8,0,0]]
    ];
    function ss(t){return t<=0?0:t>=1?1:t*t*(3-2*t)}
    function easeO(t){return t<0?0:t>1?1:1-Math.pow(1-t,3)}
    function camAt(p){
      var i=0;while(i<K.length-2&&p>K[i+1][0])i++;
      var k0=K[i],k1=K[i+1],t=ss((p-k0[0])/(k1[0]-k0[0]));
      for(var j=0;j<3;j++){cam.position.setComponent(j,k0[1][j]+(k1[1][j]-k0[1][j])*t);}
      var lx=k0[2][0]+(k1[2][0]-k0[2][0])*t,ly=k0[2][1]+(k1[2][1]-k0[2][1])*t,lz=k0[2][2]+(k1[2][2]-k0[2][2])*t;
      if(portrait){cam.position.x=lx+(cam.position.x-lx)*pull;cam.position.y=ly+(cam.position.y-ly)*pull;cam.position.z=lz+(cam.position.z-lz)*pull;}
      cam.lookAt(lx,ly,lz);
    }
    var tmp=new THREE.Vector3(),portrait=false,pull=1;
    function frame(p){
      camAt(p);
      parts.forEach(function(pt){
        var t=easeO((p-pt.a)/(pt.b-pt.a));
        pt.g.visible=t>0;
        if(t<=0)return;
        pt.g.position.lerpVectors(pt.from.p,pt.home.p,t);
        var fr=pt.from.r||{},hr=pt.home.r||{};
        pt.g.rotation.set((fr.x||0)*(1-t)+(hr.x||0)*t,(fr.y||0)*(1-t)+(hr.y||0)*t,(fr.z||0)*(1-t)+(hr.z||0)*t);
        if(pt.lock){var lt=ss((t-.78)/.22);pt.g.position.y=pt.home.p.y+pt.lock*(1-lt)*(t>0?1:0);}
      });
      var stage=p<S2[0]?0:p<S3[0]?1:p<S4[0]?2:3;
      tabs.forEach(function(tb,i){tb.classList.toggle('on',i===stage)});
      stg.textContent=(I18N&&I18N.stages||['שלב 01 · זוויות עיגון','שלב 02 · בידוד תרמי','שלב 03 · פרופילי L ו־PR','שלב 04 · חיפוי'])[stage];
      cnt.textContent=Math.round(Math.min(1,p/.94)*100)+'%';
      var fin=p>.93;if(t1){t0.classList.toggle('off',fin);t1.classList.toggle('off',!fin);}
      calls.forEach(function(c){
        var on=p>=c.def.a&&p<=c.def.b;
        c.el.classList.toggle('on',on);
        if(on){tmp.copy(c.def.p).add(root.position).project(cam);var cw=cv.clientWidth,x=(tmp.x*.5+.5)*cw,y=(-tmp.y*.5+.5)*cv.clientHeight,fl=x>cw*.55;c.el.classList.toggle('flip',fl);if(fl){c.el.style.left='auto';c.el.style.right=(cw-x)+'px';}else{c.el.style.right='auto';c.el.style.left=x+'px';}c.el.style.top=y+'px';}
      });
      if(renderer)renderer.render(scene,cam);
    }
    function size(){if(!renderer)return;W=cv.clientWidth;H=cv.clientHeight;renderer.setSize(W,H,false);cam.aspect=W/H;var hh=Math.min(H,window.innerHeight*1.15);pull=Math.min(1.2,Math.max(1,.87/(W/hh)));portrait=pull>1.001;cam.fov=portrait?52:38;root.position.y=portrait?.55:0;cam.updateProjectionMatrix();}
    function progress(){var r=wrap.getBoundingClientRect();var total=wrap.offsetHeight-window.innerHeight;return Math.min(1,Math.max(0,-r.top/total));}
    var target=0,cur=-1,raf=null;
    function tick(){cur+=(target-cur)*.12;if(Math.abs(target-cur)<.0004)cur=target;frame(cur);if(cur!==target)raf=requestAnimationFrame(tick);else raf=null;}
    function onS2(){if(!wrap.offsetHeight)return;target=progress();if(!raf)raf=requestAnimationFrame(tick);}
    lazyGL(wrap,makeRenderer,dropRenderer);
    if(reduce){cur=1;frame(1);}
    else{cur=target=progress();frame(cur);
      window.addEventListener('scroll',onS2,{passive:true});
      window.addEventListener('resize',function(){size();frame(cur)});
      window.addEventListener('orientationchange',function(){setTimeout(function(){size();frame(cur)},350)});
      setTimeout(function(){size();frame(cur)},700);}
    }
    /* shown page: let the text paint first, then build the scene */
    function later(){(window.requestIdleCallback||function(f){setTimeout(f,200)})(init,{timeout:1200});}
    if(wrap.offsetHeight){if(document.fonts&&document.fonts.ready)document.fonts.ready.then(later,later);else later();}else whenNear(wrap,init);
  })();

  var bv=$id('bandVideo');
  if(bv&&band&&!reduce&&'IntersectionObserver' in window){
    bv.addEventListener('playing',function(){bandMedia.classList.add('has-video')},{once:true});
    new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var p=bv.play();if(p&&p.catch)p.catch(function(){})}else{bv.pause()}})},{threshold:.2}).observe(band);
  } else if(bv){bv.remove()}

  var bg=$q('.burger'),mob=$id('mob');
  if(bg&&mob){
  bg.addEventListener('click',function(){var o=mob.classList.toggle('open');bg.setAttribute('aria-expanded',String(o));nav.classList.toggle('on',o||window.scrollY>hero.offsetHeight-80)});
  mob.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mob.classList.remove('open');bg.setAttribute('aria-expanded','false');onS()})});
  }

  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});
    $qa('.rv').forEach(function(el){io.observe(el)});
  } else { $qa('.rv').forEach(function(el){el.classList.add('in-view')}); }
})();

/* scroll reel: progress through the sticky block drives the active line */
(function(){
  var reel=$id('reel');if(!reel)return;
  var lines=$qa('#reel .reel-lines li'),figs=$qa('#reel .reel-figs figure'),n=lines.length,last=-1;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(i){if(i===last)return;last=i;
    lines.forEach(function(l,k){l.classList.toggle('on',k===i);l.classList.toggle('was',k<i)});
    figs.forEach(function(f,k){f.classList.toggle('on',k===i)});}
  if(reduce){set(0);return;}
  function onS(){var r=reel.getBoundingClientRect(),total=reel.offsetHeight-window.innerHeight;if(r.bottom<0||r.top>window.innerHeight)return;
    var p=Math.min(1,Math.max(0,-r.top/total));set(Math.min(n-1,Math.floor(p*n)));}
  window.addEventListener('scroll',onS,{passive:true});onS();
})();

/* hero: rotating word in the H1 */
(function(){
  var el=$q('.asm h1 .rot');if(!el)return;
  var words=(el.dataset.words||'').split('|').filter(Boolean),rw=el.querySelector('.rw'),i=0;
  if(words.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  setInterval(function(){rw.classList.add('flip');setTimeout(function(){i=(i+1)%words.length;rw.textContent=words[i];rw.classList.remove('flip');},440);},2600);
})();
;
/* AANA\CLADDING — 3D construction-node drawings (Three.js r128).
   Three scroll-driven cutaway scenes: 'sub' (bracket → L-profile → PR rail),
   'dekton' (undercut anchor → clip → hang on PR), 'hpl' (T-profile → oversize hole → rivet → movement).
   Usage: var n = NODES.mount(canvas, 'dekton', callsElement); n.frame(p) with p in [0,1]. */
(function(){
  var NODES = window.NODES = {};
  function tex(w,h,draw,rx,ry){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);var t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);return t;}
  function noise(g,w,h,n,a1,a2){for(var i=0;i<n;i++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'255,255,255')+','+(a1+Math.random()*a2)+')';g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2);}}
  function ss(t){return t<=0?0:t>=1?1:t*t*(3-2*t)}
  function easeO(t){return t<0?0:t>1?1:1-Math.pow(1-t,3)}
function lazyGL(el,make,drop){if(!('IntersectionObserver' in window)){make();return;}
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)make();})},{rootMargin:'80% 0px'}).observe(el);
  /* release only when far away (or the page is hidden): re-creating a context on every pass makes scrolling hitch */
  new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)drop();})},{rootMargin:'300% 0px'}).observe(el);}
  function V(x,y,z){return new THREE.Vector3(x,y,z)}
  function box(w,h,d,m){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m)}
  function cyl(r1,r2,h,m,seg){var c=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||24),m);return c;}
  /* cylinder along Z (three's cylinder is along Y) */
  function cylZ(r1,r2,h,m,seg){var c=cyl(r1,r2,h,m,seg);c.rotation.x=Math.PI/2;return c;}
  function cylX(r1,r2,h,m,seg){var c=cyl(r1,r2,h,m,seg);c.rotation.z=Math.PI/2;return c;}

  function materials(){
    var concreteT=tex(512,512,function(g,w,h){g.fillStyle='#8E918D';g.fillRect(0,0,w,h);noise(g,w,h,14000,.03,.09);},2,2);
    var woolT=tex(256,256,function(g,w,h){g.fillStyle='#A79877';g.fillRect(0,0,w,h);for(var i=0;i<2600;i++){g.strokeStyle='rgba('+(Math.random()<.5?'70,60,40':'215,205,180')+','+(.05+Math.random()*.1)+')';g.beginPath();var x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);g.lineTo(x+(Math.random()-.5)*14,y+(Math.random()-.5)*6);g.stroke();}});
    var kraftT=tex(512,512,function(g,w,h){g.fillStyle='#D3C6A0';g.fillRect(0,0,w,h);noise(g,w,h,5000,.02,.05);g.fillStyle='rgba(40,40,40,.5)';g.font='700 40px Arial';g.textAlign='center';g.fillText('DEKTON',256,270);g.font='400 16px Arial';g.fillText('Made in Spain',256,296);},1,1);
    var dektonT=tex(256,256,function(g,w,h){g.fillStyle='#2C3034';g.fillRect(0,0,w,h);noise(g,w,h,3000,.015,.05);});
    var hplT=tex(256,256,function(g,w,h){g.fillStyle='#3A3D41';g.fillRect(0,0,w,h);noise(g,w,h,1200,.01,.03);});
    return {
      concrete:new THREE.MeshStandardMaterial({map:concreteT,roughness:.96}),
      concreteSide:new THREE.MeshStandardMaterial({color:0xA9ACA8,roughness:.95}),
      hole:new THREE.MeshStandardMaterial({color:0x3A3D40,roughness:1}),
      steel:new THREE.MeshStandardMaterial({color:0xC9CFD6,roughness:.3,metalness:.9}),
      alu:new THREE.MeshStandardMaterial({color:0xE3E7EB,roughness:.38,metalness:.85}),
      blackAlu:new THREE.MeshStandardMaterial({color:0x1F2225,roughness:.5,metalness:.6}),
      epdm:new THREE.MeshStandardMaterial({color:0x111214,roughness:.95}),
      pad:new THREE.MeshStandardMaterial({color:0x2A2C30,roughness:.9}),
      wool:new THREE.MeshStandardMaterial({map:woolT,roughness:1}),
      kraft:new THREE.MeshStandardMaterial({map:kraftT,roughness:.9}),
      dekton:new THREE.MeshStandardMaterial({map:dektonT,roughness:.55,metalness:.08}),
      dektonEdge:new THREE.MeshStandardMaterial({color:0x4A4E52,roughness:.7}),
      hpl:new THREE.MeshStandardMaterial({map:hplT,roughness:.55}),
      hplEdge:new THREE.MeshStandardMaterial({color:0x2B2B2B,roughness:.8}),
      tool:new THREE.MeshStandardMaterial({color:0x3C4046,roughness:.55,metalness:.3}),
      laser:new THREE.MeshBasicMaterial({color:0xFF2D2D}),
      accent:new THREE.MeshStandardMaterial({color:0xF26A1B,roughness:.5}),
      ghost:new THREE.MeshStandardMaterial({color:0xE6E8EB,roughness:1,transparent:true,opacity:.35})
    };
  }
  /* technical section drawing: panel thickness with a hole profile. holes=[{u,wid,undercut}] in texture fractions */
  /* through holes: u = along the face width, v = thickness. blind (undercut) holes: u = thickness (opening at u=0 or u=1 if mirror), v = height */
  function sectionTex(w,h,base,holes,mirror){
    return tex(w,h,function(g,W,H){
      g.fillStyle=base;g.fillRect(0,0,W,H);
      g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.5;
      var step=Math.max(8,Math.min(W,H)/6);
      for(var x=-H;x<W+H;x+=step){g.beginPath();g.moveTo(x,0);g.lineTo(x+H,H);g.stroke();}
      holes.forEach(function(ho){
        g.fillStyle='#F3F4F6';g.strokeStyle='#15181C';g.lineWidth=Math.max(2,Math.min(W,H)/40);
        if(ho.through){var cx=ho.u*W,hw=ho.wid*H/2;g.fillRect(cx-hw,0,hw*2,H);g.strokeRect(cx-hw,1,hw*2,H-2);}
        else{
          var cy=ho.v*H,hw2=ho.wid*H/2,d=ho.depth*W,x0=mirror?W-d:0;
          g.fillRect(x0,cy-hw2,d,hw2*2);
          if(ho.undercut){var uw=ho.undercut*H/2,xb=mirror?W-d:d,xa=mirror?W-d*.55:d*.55;g.beginPath();g.moveTo(xa,cy-hw2);g.lineTo(xb,cy-uw);g.lineTo(xb,cy+uw);g.lineTo(xa,cy+hw2);g.closePath();g.fill();
            g.beginPath();g.moveTo(mirror?W:0,cy-hw2);g.lineTo(xa,cy-hw2);g.lineTo(xb,cy-uw);g.lineTo(xb,cy+uw);g.lineTo(xa,cy+hw2);g.lineTo(mirror?W:0,cy+hw2);g.stroke();}
        }
      });
    });
  }

  /* ---------- scene builders. Each returns {root, parts, keys, calls} ---------- */
  var SCENES={};

  SCENES.sub=function(M,add){
    var root=new THREE.Group();
    var wall=new THREE.Mesh(new THREE.BoxGeometry(3.4,3.2,.25),[M.concreteSide,M.concreteSide,M.concreteSide,M.concreteSide,M.concrete,M.concreteSide]);
    wall.position.z=-.125;wall.receiveShadow=true;wall.castShadow=true;root.add(wall);
    var S1=[.03,.30],S2=[.32,.55],S3=[.57,.75],S4=[.77,.97];
    var brY=[.36,-.36]; /* fixed (top), sliding (bottom) */
    brY.forEach(function(y,i){
      var f=i*.06;
      var hole=cylZ(.008,.008,.12,M.hole,16);add(hole,{p:V(0,y,-.06)},{p:V(0,y,-.06)},S1[0]+f,S1[0]+f+.02);
      /* drill: in and out */
      var drill=new THREE.Group();var bit=cylZ(.007,.007,.16,M.steel,12);bit.position.z=.08;drill.add(bit);var body=cylZ(.03,.035,.12,M.tool,20);body.position.z=.22;drill.add(body);
      add(drill,{p:V(0,y,.0)},{p:V(0,y,.5)},S1[0]+f,S1[0]+f+.07,{onT:function(g,t){var k=Math.sin(t*Math.PI);g.position.z=.5-.56*k;g.rotation.z=t*40;g.visible=t>0&&t<1;}});
      var anchor=cylZ(.006,.006,.16,M.steel,16);add(anchor,{p:V(0,y,.02)},{p:V(0,y,.45)},S1[0]+f+.07,S1[0]+f+.12);
      var br=new THREE.Group();
      var leg1=box(.08,.15,.004,M.steel);leg1.position.z=.008;br.add(leg1);
      var leg2=box(.004,.15,.17,M.steel);leg2.position.set(.042,0,.093);br.add(leg2);
      /* hole in leg2: round (fixed) or slot (sliding) — drawn as dark inserts */
      if(i===0){var rh=cylX(.008,.008,.006,M.hole,16);rh.position.set(.042,0,.13);br.add(rh);}
      else{var sl=box(.006,.05,.016,M.hole);sl.position.set(.042,0,.13);br.add(sl);}
      add(br,{p:V(0,y,-.006)},{p:V(0,y,.5),r:{x:-.3}},S1[0]+f+.13,S1[0]+f+.19);
      var nut=cyl(.013,.013,.008,M.steel,6);nut.rotation.x=Math.PI/2;add(nut,{p:V(0,y,.008)},{p:V(0,y,.35)},S1[0]+f+.18,S1[0]+f+.24,{onT:function(g,t){g.rotation.y=t*12;}});
      /* bolt bracket -> profile */
      var bolt=cylX(.005,.005,.03,M.steel,12);add(bolt,{p:V(.05,y,.13)},{p:V(.3,y,.13)},S2[0]+.14,S2[0]+.2);
    });
    /* vertical L profile (black) on the outer leg of the brackets */
    var prof=new THREE.Group();var web=box(.004,1.2,.06,M.blackAlu);web.position.set(.046,0,.13);prof.add(web);var fl=box(.05,1.2,.004,M.blackAlu);fl.position.set(.02,0,.162);prof.add(fl);
    add(prof,{p:V(0,0,0)},{p:V(0,1.6,0)},S2[0],S2[0]+.14);
    /* laser line + PR rail */
    var laser=box(1.6,.0025,.0025,M.laser);add(laser,{p:V(0,.06,.2)},{p:V(0,.06,.2)},S3[0],S3[0]+.03,{onT:function(g,t){g.visible=t>0;}});
    var rail=new THREE.Group();var r1=box(1.15,.05,.004,M.alu);r1.position.z=.185;rail.add(r1);var lip=box(1.15,.004,.018,M.alu);lip.position.set(0,.025,.176);rail.add(lip);var up=box(1.15,.012,.004,M.alu);up.position.set(0,.031,.168);rail.add(up);
    add(rail,{p:V(0,.06,0)},{p:V(0,.06,.6)},S3[0]+.03,S3[0]+.12);
    var rs=cylZ(.004,.004,.02,M.steel,10);add(rs,{p:V(.02,.06,.175)},{p:V(.02,.06,.4)},S3[0]+.12,S3[0]+.17);
    /* insulation boards, cut tight around the brackets */
    var rows=[-.42,0,.42];rows.forEach(function(y,ri){[-1,1].forEach(function(sg,ci){var b=box(.56,.4,.08,M.wool);var i=ri*2+ci;add(b,{p:V(sg*.34,y,.04)},{p:V(sg*.34,y,.7)},S4[0]+i*.02,S4[0]+i*.02+.08);});});
    /* air flow arrows in the cavity */
    for(var k=0;k<3;k++){(function(k){var ar=new THREE.Group();var sh=cyl(.006,.006,.05,M.accent,10);ar.add(sh);var tip=cyl(0,.014,.03,M.accent,10);tip.position.y=.04;ar.add(tip);
      add(ar,{p:V(-.2+k*.2,0,.11)},{p:V(-.2+k*.2,0,.11)},S4[0]+.12,S4[1],{onT:function(g,t){g.visible=t>0;g.position.y=-.55+((t*2.2+k*.33)%1)*1.1;}});})(k);}
    var keys=[
      [0.00,[.9,.6,1.9],[0,0,.05]],
      [0.05,[.42,.52,.5],[0,.36,.06]],
      [0.16,[.42,-.22,.5],[0,-.36,.06]],
      [0.30,[.55,.05,.75],[.02,0,.08]],
      [0.45,[.4,.5,.55],[.04,.36,.12]],
      [0.57,[.4,.25,.7],[0,.06,.15]],
      [0.70,[-.25,.3,.6],[0,.06,.18]],
      [0.78,[-.9,.3,1.2],[-.1,0,.05]],
      [0.92,[1.0,.3,.9],[.1,0,.1]],
      [1.00,[.7,.5,1.7],[0,0,.05]]
    ];
    var calls=[{p:V(0,.36,.03),a:.10,b:.24},{p:V(0,-.36,.0),a:.18,b:.30},{p:V(.046,.6,.16),a:.36,b:.55},{p:V(.042,-.36,.13),a:.40,b:.55},{p:V(-.3,.085,.19),a:.62,b:.75},{p:V(-.2,.2,.11),a:.85,b:.97}];
    return {root:root,keys:keys,calls:calls,fov:34};
  };

  SCENES.dekton=function(M,add){
    var root=new THREE.Group();
    var S1=[.03,.22],S2=[.24,.46],S3=[.50,.78],S4=[.80,.97];
    var secL=sectionTex(256,1024,'#8C9096',[{v:.5,wid:7/100,depth:8/12,undercut:9.5/100}],false);
    var secR=sectionTex(256,1024,'#8C9096',[{v:.5,wid:7/100,depth:8/12,undercut:9.5/100}],true);
    var plainSec=new THREE.MeshStandardMaterial({color:0x7A7E83,roughness:.8});
    var secMatL=new THREE.MeshStandardMaterial({map:secL,roughness:.8}),secMatR=new THREE.MeshStandardMaterial({map:secR,roughness:.8});
    /* detail chunk around the anchor at (0,.12): two halves, section faces at x=0 */
    var AY=.12;
    var chL=new THREE.Mesh(new THREE.BoxGeometry(.06,.10,.012),[secMatL,plainSec,plainSec,plainSec,M.kraft,M.dekton]);
    var chR=new THREE.Mesh(new THREE.BoxGeometry(.06,.10,.012),[plainSec,secMatR,plainSec,plainSec,M.kraft,M.dekton]);
    add(chL,{p:V(-.03,AY,0)},{p:V(-.03,AY,0)},0,.001);
    add(chR,{p:V(.03,AY,0)},{p:V(.10,AY,0)},S3[0],S3[0]+.08,{onT:function(g,t){g.position.x=.10-.07*t;}});
    var back=box(2,2,.01,M.concreteSide);back.position.z=-.25;back.receiveShadow=true;root.add(back);
    /* the section drawing shows the hole from the start; the drill 'creates' it in S1 */
    var drill=new THREE.Group();var bit=cylZ(.0035,.0035,.04,M.steel,12);bit.position.z=.02;drill.add(bit);var head=cylZ(.0048,.0035,.004,M.steel,12);head.position.z=.002;drill.add(head);var chuck=cylZ(.012,.012,.03,M.tool,16);chuck.position.z=.055;drill.add(chuck);
    add(drill,{p:V(0,AY,.006)},{p:V(0,AY,.09)},S1[0],S1[1],{onT:function(g,t){var k=Math.sin(t*Math.PI);g.position.z=.09-.092*Math.min(1,k*1.15);g.rotation.z=t*60;g.visible=t>0&&t<1;}});
    /* undercut anchor: sleeve + expanding cone, then clip and screw */
    var sleeve=new THREE.Group();var sl=cylZ(.0033,.0033,.008,M.steel,16);sl.position.z=.002;sleeve.add(sl);var cone=cylZ(.0033,.0047,.003,M.steel,16);cone.position.z=-.0035;cone.name='cone';sleeve.add(cone);
    add(sleeve,{p:V(0,AY,0)},{p:V(0,AY,.07)},S2[0],S2[0]+.07,{onT:function(g,t){var c=g.getObjectByName('cone');var e=ss((t-.85)/.15);c.scale.set(.72+.28*e,1,.72+.28*e);}});
    function clip(){var g=new THREE.Group();var pl=box(.03,.02,.003,M.alu);g.add(pl);var arm=box(.03,.003,.022,M.alu);arm.position.set(0,.0115,.0125);g.add(arm);var lipd=box(.03,.012,.003,M.alu);lipd.position.set(0,.006,.022);g.add(lipd);return g;}
    var c0=clip();add(c0,{p:V(0,AY,.0075)},{p:V(0,AY,.06)},S2[0]+.07,S2[0]+.13);
    var screw=new THREE.Group();var shank=cylZ(.002,.002,.016,M.steel,12);shank.position.z=-.006;screw.add(shank);var hx=cylZ(.0038,.0038,.0025,M.steel,6);hx.position.z=.0035;screw.add(hx);
    add(screw,{p:V(0,AY,.0075)},{p:V(0,AY,.05)},S2[0]+.13,S2[0]+.2,{onT:function(g,t){g.rotation.z=-t*30;}});
    /* full panel pieces appear in S3 (fade in) */
    var pcs=[[-.18,0,.24,.4],[.18,0,.24,.4],[0,.185,.12,.03],[0,-.065,.12,.27]];
    var ghostMats=[];
    pcs.forEach(function(pc,i){var mk=M.kraft.clone();mk.transparent=true;var md=M.dekton.clone();md.transparent=true;var me=M.dektonEdge.clone();me.transparent=true;ghostMats.push(mk,md,me);
      var m=new THREE.Mesh(new THREE.BoxGeometry(pc[2],pc[3],.012),[me,me,me,me,mk,md]);add(m,{p:V(pc[0],pc[1],0)},{p:V(pc[0],pc[1],0)},S3[0]+.02,S3[0]+.1,{onT:function(g,t){g.visible=t>0;g.material.forEach(function(mm){mm.opacity=t;});}});});
    /* other clips (already factory-mounted) */
    [[-.2,.12],[.2,.12],[-.2,-.12],[.2,-.12]].forEach(function(q){var c=clip();add(c,{p:V(q[0],q[1],.0075)},{p:V(q[0],q[1],.0075)},S3[0]+.06,S3[0]+.1,{onT:function(g,t){g.visible=t>0;}});});
    /* PR rail on a black profile stub, behind the panel; two rails for two clip rows */
    [.102,-.138].forEach(function(yR){var rail=new THREE.Group();var pl=box(.75,.04,.003,M.alu);pl.position.z=.034;rail.add(pl);var ledge=box(.75,.003,.014,M.alu);ledge.position.set(0,.02,.027);rail.add(ledge);var up=box(.75,.01,.003,M.alu);up.position.set(0,.025,.020);rail.add(up);
      var stub=box(.05,.5,.004,M.blackAlu);stub.position.set(-.25,0,.038);rail.add(stub);var stub2=stub.clone();stub2.position.x=.25;rail.add(stub2);
      add(rail,{p:V(0,yR,0)},{p:V(0,yR,.25)},S3[0]+.1,S3[0]+.17);});
    /* the whole panel group is moved by hanging: we move root children? simpler — camera does the storytelling; panel drop-lock */
    var lockG=new THREE.Group();root.add(lockG);
    /* adjustment screw + joint gauge at the bottom-left clip */
    var adj=cylZ(.002,.002,.02,M.steel,10);add(adj,{p:V(-.2,-.132,.012)},{p:V(-.2,-.132,.012)},S4[0],S4[0]+.1,{onT:function(g,t){g.visible=t>0;g.rotation.z=t*20;}});
    var gauge=box(.03,.006,.03,M.accent);add(gauge,{p:V(-.1,-.203,.0)},{p:V(-.1,-.203,.12)},S4[0]+.08,S4[0]+.15);
    var below=new THREE.Mesh(new THREE.BoxGeometry(.6,.3,.012),[M.dektonEdge,M.dektonEdge,M.dektonEdge,M.dektonEdge,M.kraft,M.dekton]);add(below,{p:V(0,-.356,0)},{p:V(0,-.356,0)},S3[1]-.05,S3[1],{onT:function(g,t){g.visible=t>0;}});
    var keys=[
      [0.00,[.28,.3,.32],[0,.12,0]],
      [0.05,[.11,.17,.09],[0,.12,0]],
      [0.22,[.10,.16,.08],[0,.12,0]],
      [0.46,[.10,.18,.11],[0,.12,0]],
      [0.52,[.55,.4,.6],[0,.02,0]],
      [0.66,[.35,.3,.6],[0,.05,.01]],
      [0.78,[.4,.15,.55],[0,-.05,0]],
      [0.82,[-.05,-.1,.26],[-.12,-.2,0]],
      [0.97,[.05,-.05,.34],[-.05,-.18,0]],
      [1.00,[.15,.15,.62],[0,-.05,0]]
    ];
    var calls=[{p:V(0,.15,.006),a:.06,b:.2},{p:V(0,.12,.006),a:.26,b:.36},{p:V(.0,.135,.02),a:.37,b:.46},{p:V(.2,.102,.035),a:.6,b:.75},{p:V(-.2,-.12,.02),a:.81,b:.9},{p:V(-.1,-.203,.01),a:.88,b:.97}];
    return {root:root,keys:keys,calls:calls,fov:30,near:.005};
  };

  SCENES.hpl=function(M,add){
    var root=new THREE.Group();
    var S1=[.03,.2],S2=[.22,.45],S3=[.47,.72],S4=[.75,.97];
    /* T profile */
    var prof=new THREE.Group();var web=box(.004,.5,.03,M.alu);web.position.z=-.0165;prof.add(web);var fl=box(.08,.5,.003,M.alu);prof.add(fl);
    add(prof,{p:V(0,-.05,0)},{p:V(0,-.05,0)},0,.001);
    var epdm=box(.08,.5,.0015,M.epdm);add(epdm,{p:V(0,-.05,.00225)},{p:V(0,.6,.00225)},S1[0],S1[0]+.12);
    /* panels: lower halves (cut at y=0 through the rivet row). section on +y face */
    var back2=box(2,2,.01,M.concreteSide);back2.position.z=-.12;back2.receiveShadow=true;root.add(back2);
    var secL=sectionTex(2048,55,'#6E6A63',[{u:(.3-.03)/.3,wid:10/8,through:true},{u:(.3-.25)/.3,wid:5.1/8,through:true}],false);
    var secR=sectionTex(2048,55,'#6E6A63',[{u:.03/.3,wid:10/8,through:true}],false);
    var mL=new THREE.MeshStandardMaterial({map:secL,roughness:.8}),mR=new THREE.MeshStandardMaterial({map:secR,roughness:.8});
    var pL=new THREE.Mesh(new THREE.BoxGeometry(.3,.25,.008),[M.hplEdge,M.hplEdge,mL,M.hplEdge,M.hpl,M.hplEdge]);
    var pR=new THREE.Mesh(new THREE.BoxGeometry(.3,.25,.008),[M.hplEdge,M.hplEdge,mR,M.hplEdge,M.hpl,M.hplEdge]);
    /* left panel expands in S4 about its fixed point (x=-.25) */
    add(pL,{p:V(-.154,-.125,.007)},{p:V(-.154,-.125,.007)},0,.001,{onT:function(g,t){}});
    add(pR,{p:V(.154,-.125,.007)},{p:V(.154,-.125,.007)},0,.001);
    var expand={g:pL};
    /* drilling jig + drills in S2 */
    var jig=box(.07,.035,.004,M.tool);add(jig,{p:V(-.03,-.015,.013)},{p:V(-.03,-.015,.12)},S2[0],S2[0]+.05);
    function drillAt(x,r,a,b){var d=new THREE.Group();var bit=cylZ(r,r,.05,M.steel,12);bit.position.z=.025;d.add(bit);var ch=cylZ(.012,.012,.03,M.tool,16);ch.position.z=.06;d.add(ch);
      add(d,{p:V(x,0,.011)},{p:V(x,0,.12)},a,b,{onT:function(g,t){var k=Math.sin(t*Math.PI);g.position.z=.12-.125*Math.min(1,k*1.2);g.rotation.z=t*60;g.visible=t>0&&t<1;}});}
    drillAt(-.03,.005,S2[0]+.05,S2[0]+.14);drillAt(-.25,.00255,S2[0]+.14,S2[1]);
    /* rivets: sliding (x=-.03), fixed (x=-.25), right panel sliding (x=+.03) */
    function rivet(x,gap,a,b){var g=new THREE.Group();var sh=cylZ(.0025,.0025,.016,M.steel,12);sh.position.z=-.005;g.add(sh);var hd=cylZ(.007,.006,.0015,M.hpl,20);hd.position.z=.0038+gap;g.add(hd);
      var mand=cylZ(.0012,.0012,.03,M.steel,8);mand.position.z=.02;mand.name='mand';g.add(mand);
      add(g,{p:V(x,0,.011)},{p:V(x,0,.09)},a,b,{onT:function(gg,t){var m=gg.getObjectByName('mand');m.visible=t<.999;m.position.z=.02+Math.max(0,t-.8)*.5;}});return g;}
    rivet(-.03,.0015,S3[0],S3[0]+.1);
    /* rivet gun nose piece with spacer */
    var nose=new THREE.Group();var ring=cylZ(.0075,.0075,.009,M.pad,20);ring.position.z=.008;nose.add(ring);var sp=cylZ(.004,.004,.0015,M.accent,16);sp.position.z=.00225;nose.add(sp);
    add(nose,{p:V(-.03,0,.011)},{p:V(-.03,0,.12)},S3[0]+.03,S3[0]+.13,{onT:function(g,t){var k=Math.sin(t*Math.PI);g.position.z=.12-.106*Math.min(1,k*1.25);g.visible=t>0&&t<1;}});
    rivet(-.25,.0015,S3[0]+.13,S3[0]+.2);rivet(.03,.0015,S3[0]+.18,S3[1]);
    /* expansion arrows */
    [-1,1].forEach(function(sg){var ar=new THREE.Group();var sh=cylX(.003,.003,.04,M.accent,10);ar.add(sh);var tip=cylX(0,.008,.02,M.accent,10);tip.position.x=sg*.03;if(sg<0)tip.rotation.z=Math.PI;ar.add(tip);
      add(ar,{p:V(-.154+sg*.09,-.09,.02)},{p:V(-.154+sg*.09,-.09,.02)},S4[0],S4[1],{onT:function(g,t){g.visible=t>0;g.position.x=-.154+sg*(.09+.02*Math.sin(t*Math.PI*2));}});});
    var keys=[
      [0.00,[.35,.3,.5],[-.08,-.08,0]],
      [0.05,[.2,.25,.35],[0,-.05,0]],
      [0.22,[-.02,.25,.3],[-.06,-.02,0]],
      [0.45,[-.15,.18,.22],[-.14,-.02,0]],
      [0.50,[.06,.1,.12],[-.03,-.005,.005]],
      [0.72,[-.12,.1,.18],[-.1,-.01,.005]],
      [0.78,[.05,.35,.6],[-.08,-.1,0]],
      [1.00,[.2,.35,.65],[-.05,-.1,0]]
    ];
    var calls=[{p:V(0,.15,.003),a:.06,b:.2},{p:V(-.03,0,.011),a:.27,b:.37},{p:V(-.25,0,.011),a:.36,b:.45},{p:V(-.03,0,.012),a:.5,b:.62},{p:V(-.03,0,.009),a:.62,b:.72},{p:V(-.154,-.09,.02),a:.8,b:.97}];
    return {root:root,keys:keys,calls:calls,fov:30,near:.005,expand:expand,S4:S4};
  };

  NODES.mount=function(cv,name,callsBox){
    if(!window.THREE)return null;
    var renderer=null,lastP=0;
    function makeRenderer(){if(renderer)return;var n=cv.cloneNode(false);if(cv.parentNode)cv.parentNode.replaceChild(n,cv);cv=n;
      try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:window.innerWidth>=900,alpha:true});}catch(e){renderer=null;var fb=cv.parentNode&&cv.parentNode.querySelector('.fb');if(fb)fb.classList.add('show');cv.remove();return;}
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
      renderer.outputEncoding=THREE.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      W=0;frame(lastP);}
    function dropRenderer(){if(!renderer)return;renderer.forceContextLoss();renderer.dispose();renderer=null;}
    var scene=new THREE.Scene();
    var M=materials();
    var parts=[];
    function add(g,home,from,a,b,o){o=o||{};g.position.copy(from.p);if(from.r)g.rotation.set(from.r.x||0,from.r.y||0,from.r.z||0);g.traverse(function(x){if(x.isMesh){x.castShadow=true;x.receiveShadow=true;}});parts.push({g:g,home:home,from:from,a:a,b:b,onT:o.onT});}
    var def=SCENES[name](M,add);
    parts.forEach(function(pt){def.root.add(pt.g);});
    scene.add(def.root);
    var cam=new THREE.PerspectiveCamera(def.fov||36,1,def.near||.02,40);
    scene.add(new THREE.HemisphereLight(0xffffff,0xa8adb4,.6));
    var key=new THREE.DirectionalLight(0xffffff,.8);key.position.set(1.5,2.5,3);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
    var kc=key.shadow.camera,ext=name==='sub'?1.4:.5;kc.left=-ext;kc.right=ext;kc.top=ext;kc.bottom=-ext;kc.near=.1;kc.far=12;key.shadow.bias=-0.0005;scene.add(key);
    var fill=new THREE.DirectionalLight(0xE8EEF6,.35);fill.position.set(-2,.5,2);scene.add(fill);
    var calls=[];
    if(callsBox){var texts=[].slice.call(callsBox.querySelectorAll('span'));callsBox.innerHTML='';def.calls.forEach(function(cd,i){var d=document.createElement('div');d.className='call';d.innerHTML='<i></i><em>'+(texts[i]?texts[i].textContent:'')+'</em>';callsBox.appendChild(d);calls.push({el:d,def:cd});});}
    var K=def.keys,tmp=new THREE.Vector3();
    function camAt(p){var i=0;while(i<K.length-2&&p>K[i+1][0])i++;var k0=K[i],k1=K[i+1],t=ss((p-k0[0])/(k1[0]-k0[0]));
      for(var j=0;j<3;j++)cam.position.setComponent(j,k0[1][j]+(k1[1][j]-k0[1][j])*t);
      cam.lookAt(k0[2][0]+(k1[2][0]-k0[2][0])*t,k0[2][1]+(k1[2][1]-k0[2][1])*t,k0[2][2]+(k1[2][2]-k0[2][2])*t);}
    var W=0,H=0;
    function size(){if(!renderer){W=0;return;}var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return;if(w===W&&h===H)return;W=w;H=h;renderer.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
    function frame(p){
      lastP=p;size();if(!W)return;
      camAt(p);
      parts.forEach(function(pt){var t=easeO((p-pt.a)/(pt.b-pt.a));pt.g.visible=t>0;if(t<=0){if(pt.onT)pt.onT(pt.g,0);return;}
        pt.g.position.lerpVectors(pt.from.p,pt.home.p,t);var fr=pt.from.r||{},hr=pt.home.r||{};pt.g.rotation.set((fr.x||0)*(1-t)+(hr.x||0)*t,(fr.y||0)*(1-t)+(hr.y||0)*t,(fr.z||0)*(1-t)+(hr.z||0)*t);
        if(pt.onT)pt.onT(pt.g,Math.min(1,Math.max(0,(p-pt.a)/(pt.b-pt.a))));});
      if(def.expand){var e=ss((p-def.S4[0]-.05)/(def.S4[1]-def.S4[0]-.1));var s=1+.02*e;def.expand.g.scale.x=s;def.expand.g.position.x=-.154+(.154-.25)*(s-1)*-1;}
      calls.forEach(function(c){var on=p>=c.def.a&&p<=c.def.b;c.el.classList.toggle('on',on);if(on){tmp.copy(c.def.p).project(cam);var x=(tmp.x*.5+.5)*W,fl=x>W*.6;c.el.classList.toggle('flip',fl);if(fl){c.el.style.left='auto';c.el.style.right=(W-x)+'px';}else{c.el.style.right='auto';c.el.style.left=x+'px';}c.el.style.top=((-tmp.y*.5+.5)*H)+'px';}});
      renderer.render(scene,cam);
    }
    lazyGL(cv.parentNode||cv,makeRenderer,dropRenderer);
    return {frame:frame,resize:function(){W=0;size();}};
  };
})();
;
/* AANA\CLADDING — installation page: scroll-driven 3D node drawing per process.
   Each .proc[data-scene] has a sticky canvas (NODES scene) and N steps; progress across the steps drives the scene. */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var procs=[].slice.call(document.querySelectorAll('.proc[data-scene]'));
  if(!procs.length)return;
  function ss(t){return t<=0?0:t>=1?1:t*t*(3-2*t)}
  /* build a scene only for a page that is actually shown: at once when it comes near the viewport, otherwise one by one in idle time */
  function whenNear(el,fn){var done=false,io=null;function go(){if(done)return;done=true;if(io)io.disconnect();fn();}
    if(!('IntersectionObserver' in window)){go();return;}
    io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)go();})},{rootMargin:'200% 0px'});io.observe(el);
    var n=window.__lazyN=(window.__lazyN||0)+1,idle=function(){if(el.offsetHeight)go();};
    if(window.requestIdleCallback)requestIdleCallback(idle,{timeout:3000+n*500});else setTimeout(idle,1500+n*400);}
  procs.forEach(function(sec){whenNear(sec,function(){
    var steps=[].slice.call(sec.querySelectorAll('.step'));
    var pct=sec.querySelector('.pct'),name=sec.querySelector('.pname'),bar=sec.querySelector('.pbar i');
    var cv=sec.querySelector('canvas.ncv'),fb=sec.querySelector('.fb'),pm=sec.querySelector('.pm');
    var node=null;
    if(cv&&window.NODES){try{node=NODES.mount(cv,sec.dataset.scene,sec.querySelector('.calls'));}catch(e){node=null;}}
    sec.__node=node;
    if(!node){if(cv)cv.remove();if(fb)fb.classList.add('show');var cb=sec.querySelector('.calls');if(cb)cb.remove();}
    var target=0,cur=-1,raf=null,lastI=-1;
    function ui(i,f){
      if(i!==lastI){steps.forEach(function(st,k){st.classList.toggle('on',k===i)});if(name)name.textContent=steps[i].querySelector('h3').textContent;lastI=i;}
      var total=(i+f)/steps.length;
      if(pct)pct.textContent=Math.round(total*100)+'%';
      if(bar)bar.style.width=(total*100)+'%';
      return total;
    }
    function measure(){
      var vh=window.innerHeight,mid=vh*0.45;
      var pr=pm.getBoundingClientRect(),pw=sec.querySelector('.pw').getBoundingClientRect();
      if(pr.width>=pw.width-2&&pr.bottom>0&&pr.bottom<vh)mid=Math.max(mid,pr.bottom+(vh-pr.bottom)*0.35);
      var i=0,f=0;
      for(var k=0;k<steps.length;k++){var r=steps[k].getBoundingClientRect();if(r.top<=mid){i=k;f=Math.min(1,Math.max(0,(mid-r.top)/r.height));}}
      var r0=steps[0].getBoundingClientRect();if(r0.top>mid){i=0;f=0;}
      /* before the section: hold at 0; after it: hold at 1 */
      var rl=steps[steps.length-1].getBoundingClientRect();if(rl.bottom<mid){i=steps.length-1;f=1;}
      return [i,f];
    }
    function tick(){
      cur+=(target-cur)*.14;if(Math.abs(target-cur)<.0005)cur=target;
      if(node)node.frame(cur);
      if(cur!==target)raf=requestAnimationFrame(tick);else raf=null;
    }
    function onS(){
      var m=measure();var total=ui(m[0],ss(m[1]));
      target=total;
      if(reduce){if(node)node.frame(1);return;}
      if(cur<0)cur=target;
      if(!raf)raf=requestAnimationFrame(tick);
    }
    /* only animate while the section is near the viewport */
    var near=true;
    window.addEventListener('scroll',function(){if(!sec.offsetHeight)return;var r=sec.getBoundingClientRect();near=r.bottom>-200&&r.top<window.innerHeight+200;if(near)onS();},{passive:true});
    window.addEventListener('resize',function(){if(node)node.resize();onS();});
    onS();
  });});
  /* field clips: play only while visible */
  var fv=[].slice.call(document.querySelectorAll('.ftiles video:not([data-scrub]), .darkstage .dbg'));
  if(fv.length&&'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){var pr=v.play();if(pr&&pr.catch)pr.catch(function(){});}else v.pause();});},{threshold:.15});
    fv.forEach(function(v){v.muted=true;v.setAttribute('playsinline','');io.observe(v);});
  }
})();

/* scroll-scrubbed clips: playback position follows the element's travel through the viewport */
(function(){
  var vs=[].slice.call(document.querySelectorAll('video[data-scrub]'));if(!vs.length)return;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* touch devices: seeking stutters (iOS), so play the clip normally while visible */
  if(window.matchMedia('(pointer: coarse)').matches){var io2=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){var v=e.target;if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){});}else v.pause();});},{threshold:.15}):null;vs.forEach(function(v){v.removeAttribute('data-scrub');v.loop=true;v.preload='metadata';if(io2)io2.observe(v);});return;}
  vs.forEach(function(v){
    v.pause();var wrap=v.closest('figure')||v,cur=0,target=0,raf=null,ready=false;
    function seek(){if(!ready)return;
      /* never queue a seek on top of an unfinished one — that is what made the scrub stutter */
      if(v.seeking){raf=requestAnimationFrame(seek);return;}
      cur+=(target-cur)*.18;if(Math.abs(target-cur)<.01)cur=target;try{v.currentTime=cur;}catch(e){}if(cur!==target)raf=requestAnimationFrame(seek);else raf=null;}
    function onS(){if(!v.duration)return;var r=wrap.getBoundingClientRect(),vh=window.innerHeight;if(!r.height||r.bottom<0||r.top>vh)return;
      var p=(vh-r.top)/(vh+r.height);p=Math.min(1,Math.max(0,p));target=p*(v.duration-.05);if(!raf)raf=requestAnimationFrame(seek);}
    v.addEventListener('loadedmetadata',function(){ready=true;if(reduce){v.currentTime=0;return;}onS();});
    if(v.readyState>=1){ready=true;onS();}
    if(!reduce){window.addEventListener('scroll',onS,{passive:true});window.addEventListener('resize',onS);}
    v.load();
  });
})();
;
/* AANA\CLADDING — material screens: scroll-driven 3D cladding assembly on a ready substructure.
   Markup: header.asm.mat[data-mat=dekton|hpl|fiber] > .stage > canvas, .calls span×N (texts), .stages span (tabs), .pct, .stg
   Same engine as the hero (home.js); the substructure is prebuilt, only the material-specific fixing animates. */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els=[].slice.call(document.querySelectorAll('.asm.mat[data-mat]'));
  if(!els.length)return;
  function ss(t){return t<=0?0:t>=1?1:t*t*(3-2*t)}
  function easeO(t){return t<0?0:t>1?1:1-Math.pow(1-t,3)}
  function V(x,y,z){return new THREE.Vector3(x,y,z)}
  function box(w,h,d,m){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m)}
  function cylZ(r,h,m,seg){var c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||16),m);c.rotation.x=Math.PI/2;return c;}
  function tex(w,h,draw,rx,ry){var c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t;}
  function noise(g,w,h,n,a1,a2){for(var i=0;i<n;i++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'255,255,255')+','+(a1+Math.random()*a2)+')';g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2);}}
function lazyGL(el,make,drop){if(!('IntersectionObserver' in window)){make();return;}
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)make();})},{rootMargin:'80% 0px'}).observe(el);
  /* release only when far away (or the page is hidden): re-creating a context on every pass makes scrolling hitch */
  new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)drop();})},{rootMargin:'300% 0px'}).observe(el);}
/* build a scene only for a page that is actually shown: at once when it comes near the viewport, otherwise one by one in idle time */
function whenNear(el,fn){var done=false,io=null;function go(){if(done)return;done=true;if(io)io.disconnect();fn();}
  if(!('IntersectionObserver' in window)){go();return;}
  io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)go();})},{rootMargin:'200% 0px'});io.observe(el);
  var n=window.__lazyN=(window.__lazyN||0)+1,idle=function(){if(el.offsetHeight)go();};
  if(window.requestIdleCallback)requestIdleCallback(idle,{timeout:3000+n*500});else setTimeout(idle,1500+n*400);}

  var M=null;
  function materials(){
    if(M)return M;
    var concreteT=tex(512,512,function(g,w,h){g.fillStyle='#9B9E9A';g.fillRect(0,0,w,h);noise(g,w,h,14000,.03,.09);
      g.strokeStyle='rgba(0,0,0,.14)';for(var x=0;x<=w;x+=128){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
      g.fillStyle='rgba(0,0,0,.18)';for(var i=0;i<12;i++){g.beginPath();g.arc(64+(i%4)*128,64+((i/4)|0)*170,7,0,7);g.fill();}},2,1.4);
    var woolT=tex(256,256,function(g,w,h){g.fillStyle='#A79877';g.fillRect(0,0,w,h);
      for(var i=0;i<2600;i++){g.strokeStyle='rgba('+(Math.random()<.5?'70,60,40':'215,205,180')+','+(.05+Math.random()*.1)+')';g.beginPath();var x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);g.lineTo(x+(Math.random()-.5)*14,y+(Math.random()-.5)*6);g.stroke();}});
    var aluT=tex(256,256,function(g,w,h){g.fillStyle='#CDD1D5';g.fillRect(0,0,w,h);
      for(var x=0;x<w;x+=2){g.fillStyle='rgba(255,255,255,'+(Math.random()*.12)+')';g.fillRect(x,0,1,h);}g.fillStyle='rgba(0,0,0,.05)';for(var x2=0;x2<w;x2+=7){g.fillRect(x2,0,1,h);}});
    var kraftT=tex(512,512,function(g,w,h){g.fillStyle='#D3C6A0';g.fillRect(0,0,w,h);noise(g,w,h,5000,.02,.05);
      g.strokeStyle='rgba(0,0,0,.07)';for(var y=0;y<=h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
      g.fillStyle='rgba(40,40,40,.55)';g.font='700 26px Arial';g.textAlign='center';
      for(var r=0;r<4;r++)for(var c=0;c<2;c++){g.save();g.translate(128+c*256,80+r*128);g.fillText('DEKTON',0,0);g.font='400 11px Arial';g.fillText('Ultracompact Surfaces',0,18);g.restore();g.font='700 26px Arial';}},1,1);
    /* cream Dekton: fine speckle + faint mineral veins, subtle relief */
    var dektonT=tex(1024,1024,function(g,w,h){g.fillStyle='#CFC7B7';g.fillRect(0,0,w,h);noise(g,w,h,30000,.01,.045);
      for(var i=0;i<26;i++){g.strokeStyle='rgba(110,100,85,'+(.03+Math.random()*.06)+')';g.lineWidth=.6+Math.random()*2.2;g.beginPath();var x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);
        g.bezierCurveTo(x+(Math.random()-.5)*600,y+(Math.random()-.5)*300,x+(Math.random()-.5)*600,y+(Math.random()-.5)*300,x+(Math.random()-.5)*900,y+(Math.random()-.5)*500);g.stroke();}
      for(var k=0;k<40;k++){g.fillStyle='rgba(255,255,255,'+(Math.random()*.05)+')';g.beginPath();g.arc(Math.random()*w,Math.random()*h,20+Math.random()*90,0,7);g.fill();}
      var gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(255,255,255,.06)');gr.addColorStop(1,'rgba(0,0,0,.05)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
    var dektonB=tex(512,512,function(g,w,h){g.fillStyle='#808080';g.fillRect(0,0,w,h);noise(g,w,h,40000,.05,.15);});
    /* HPL wood decor: planks with grain wobble, tonal variation and a few knots */
    var hplT=tex(1024,1024,function(g,w,h){
      for(var px=0;px<w;px+=128){g.fillStyle='hsl(22,'+(40+Math.random()*10)+'%,'+(24+Math.random()*8)+'%)';g.fillRect(px,0,128,h);}
      for(var i=0;i<1600;i++){var x=Math.random()*w,y=Math.random()*h,len=60+Math.random()*260,dark=Math.random()<.55;
        g.strokeStyle=dark?'rgba(40,22,10,'+(.08+Math.random()*.18)+')':'rgba(200,150,100,'+(.05+Math.random()*.12)+')';g.lineWidth=.5+Math.random()*1.8;
        g.beginPath();g.moveTo(x,y);var seg=6;for(var k=1;k<=seg;k++){g.lineTo(x+Math.sin(k*1.3+x)*2.2,y+len*k/seg);}g.stroke();}
      for(var kn=0;kn<7;kn++){var kx=Math.random()*w,ky=Math.random()*h;for(var r=18;r>2;r-=3){g.strokeStyle='rgba(50,28,12,'+(.10+Math.random()*.1)+')';g.lineWidth=1.2;g.beginPath();g.ellipse(kx,ky,r*.7,r*1.6,0,0,7);g.stroke();}}
      g.fillStyle='rgba(0,0,0,.18)';for(var pz=0;pz<w;pz+=128){g.fillRect(pz,0,2,h);}
      g.fillStyle='rgba(255,255,255,.05)';for(var pz2=2;pz2<w;pz2+=128){g.fillRect(pz2,0,1,h);}},1,1);
    var hplB=tex(512,512,function(g,w,h){g.fillStyle='#808080';g.fillRect(0,0,w,h);for(var i=0;i<3000;i++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'255,255,255')+','+(.05+Math.random()*.1)+')';g.fillRect(Math.random()*w,Math.random()*h,1,10+Math.random()*60);}});
    /* fibre cement: mineral surface, fine porosity, faint production lines, gentle mottling */
    var fiberT=tex(1024,1024,function(g,w,h){g.fillStyle='#A9ABA6';g.fillRect(0,0,w,h);noise(g,w,h,40000,.02,.08);
      for(var i=0;i<140;i++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0':'255,255,255')+','+(Math.random()*.02)+')';g.beginPath();g.arc(Math.random()*w,Math.random()*h,12+Math.random()*70,0,7);g.fill();}
      g.strokeStyle='rgba(0,0,0,.03)';g.lineWidth=1;for(var y=0;y<h;y+=7){g.beginPath();g.moveTo(0,y+Math.random()*2);g.lineTo(w,y+Math.random()*2);g.stroke();}
      for(var pr=0;pr<1400;pr++){g.fillStyle='rgba(0,0,0,'+(.08+Math.random()*.15)+')';g.beginPath();g.arc(Math.random()*w,Math.random()*h,.6+Math.random()*1.6,0,7);g.fill();}},1,1);
    var fiberB=tex(512,512,function(g,w,h){g.fillStyle='#808080';g.fillRect(0,0,w,h);noise(g,w,h,60000,.08,.2);});
    dektonB.encoding=hplB.encoding=fiberB.encoding=THREE.LinearEncoding;
    M={
      concrete:new THREE.MeshStandardMaterial({map:concreteT,roughness:.96,metalness:0}),
      concreteSide:new THREE.MeshStandardMaterial({color:0xC4C6C2,roughness:.95}),
      alu:new THREE.MeshStandardMaterial({map:aluT,color:0xE6E9EC,roughness:.32,metalness:.9,envMapIntensity:.7}),
      steel:new THREE.MeshStandardMaterial({color:0xB7BDC4,roughness:.3,metalness:.9}),
      wool:new THREE.MeshStandardMaterial({map:woolT,roughness:1,metalness:0}),
      disc:new THREE.MeshStandardMaterial({color:0xBDB9AC,roughness:.9}),
      blackAlu:new THREE.MeshStandardMaterial({color:0x1F2225,roughness:.5,metalness:.6}),
      epdm:new THREE.MeshStandardMaterial({color:0x121416,roughness:.95,metalness:0}),
      kraft:new THREE.MeshStandardMaterial({map:kraftT,roughness:.9,metalness:0}),
      dekton:new THREE.MeshStandardMaterial({map:dektonT,bumpMap:dektonB,bumpScale:.0015,roughness:.3,metalness:0,envMapIntensity:.45}),
      dektonEdge:new THREE.MeshStandardMaterial({color:0xC9C3B6,roughness:.6}),
      hpl:new THREE.MeshStandardMaterial({map:hplT,bumpMap:hplB,bumpScale:.0012,roughness:.55,metalness:0,envMapIntensity:.35}),
      hplEdge:new THREE.MeshStandardMaterial({color:0x2A2320,roughness:.7}),
      hplBack:new THREE.MeshStandardMaterial({color:0x3B2E24,roughness:.9}),
      rivetHpl:new THREE.MeshStandardMaterial({color:0x6E4B33,roughness:.5,metalness:.3}),
      fiber:new THREE.MeshStandardMaterial({map:fiberT,bumpMap:fiberB,bumpScale:.003,roughness:.92,metalness:0,envMapIntensity:.15}),
      fiberEdge:new THREE.MeshStandardMaterial({color:0x9A9C98,roughness:.9}),
      screw:new THREE.MeshStandardMaterial({color:0x5E6260,roughness:.7,metalness:.25,envMapIntensity:.1})
    };
    return M;
  }

  /* soft studio environment (sky/ground gradient + two bright windows) for reflections */
  function envMap(renderer){
    var c=document.createElement('canvas');c.width=512;c.height=256;var g=c.getContext('2d');
    var gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#B9BFC6');gr.addColorStop(.48,'#9AA0A7');gr.addColorStop(.52,'#5E6369');gr.addColorStop(1,'#2E3236');g.fillStyle=gr;g.fillRect(0,0,512,256);
    g.fillStyle='rgba(255,255,255,.75)';g.fillRect(50,30,130,80);g.fillRect(320,40,110,70);
    var t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.encoding=THREE.sRGBEncoding;
    var pm=new THREE.PMREMGenerator(renderer);pm.compileEquirectangularShader();var env=pm.fromEquirectangular(t).texture;pm.dispose();t.dispose();return env;
  }

  var BX=[-1.86,-.62,.62,1.86],BY=[-1.05,0,1.05];

  /* static substructure: wall, brackets, insulation, and (optionally) vertical profiles */
  function substructure(root,M,withProfiles){
    var wall=new THREE.Mesh(new THREE.BoxGeometry(4.9,3.3,.3),[M.concreteSide,M.concreteSide,M.concreteSide,M.concreteSide,M.concrete,M.concreteSide]);
    wall.position.z=-.15;wall.receiveShadow=true;wall.castShadow=true;root.add(wall);
    BX.forEach(function(x){BY.forEach(function(y){
      var g=new THREE.Group();
      var leg1=box(.06,.17,.006,M.alu);leg1.position.set(-.02,0,.003);g.add(leg1);
      var leg2=box(.006,.17,.12,M.alu);leg2.position.set(.008,0,.063);g.add(leg2);
      g.position.set(x,y,0);root.add(g);
    });});
    for(var r=0;r<6;r++)for(var c=0;c<5;c++){var x=-2.0+c*1.0+((r%2)?.5:0),y=-1.375+r*.55;if(x>2.0)x=2.0;
      var bd=box(.985,.535,.08,M.wool);bd.position.set(x,y,.04);root.add(bd);
      var d1=cylZ(.021,.005,M.disc,18);d1.position.set(x+.22,y+.12,.082);root.add(d1);}
    if(withProfiles)BX.forEach(function(x){root.add(vprofile(M,x))});
    root.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  }
  function vprofile(M,x){
    var g=new THREE.Group();
    var web=box(.008,3.24,.1,M.blackAlu);web.position.set(.02,0,.115);g.add(web);
    var face=box(.06,3.24,.008,M.blackAlu);face.position.set(0,0,.169);g.add(face);
    g.position.set(x,0,0);return g;
  }
  function tprofile(M,x){
    var g=new THREE.Group();
    var web=box(.008,3.24,.1,M.blackAlu);web.position.set(0,0,.115);g.add(web);
    var face=box(.09,3.24,.008,M.blackAlu);face.position.set(0,0,.169);g.add(face);
    var tape=box(.09,3.24,.002,M.epdm);tape.position.set(0,0,.174);g.add(tape);
    g.position.set(x,0,0);return g;
  }

  /* ---------- per-material scene definitions ---------- */
  var DEFS={};
  DEFS.dekton=function(M,add,root){
    substructure(root,M,true);
    var S1=[.04,.28],S2=[.32,.80];
    var rowY=[-.816,.816],railY=[];rowY.forEach(function(y){railY.push(y+.6,y-.6)});
    railY.forEach(function(y,i){
      var g=new THREE.Group();
      var r1=box(4.55,.055,.006,M.alu);r1.position.z=.185;g.add(r1);
      var lip=box(4.55,.006,.024,M.alu);lip.position.set(0,.03,.176);lip.rotation.x=.6;g.add(lip);
      var ret=box(4.55,.006,.014,M.alu);ret.position.set(0,-.028,.18);g.add(ret);
      var a=S1[0]+(S1[1]-S1[0])*(i/railY.length)*.6;
      add(g,{p:V(0,y,0)},{p:V(0,y,1.6)},a,a+(S1[1]-S1[0])*.4);
    });
    var px=[1.622,0,-1.622],pi=0,pn=6;
    [rowY[0],rowY[1]].forEach(function(y){px.forEach(function(x){
      var g=new THREE.Group();
      var pm=M.dekton.clone();pm.color=new THREE.Color(0xffffff).offsetHSL(0,0,(Math.random()-.5)*.04);
      var pnl=new THREE.Mesh(new THREE.BoxGeometry(1.61,1.62,.013),[M.dektonEdge,M.dektonEdge,M.dektonEdge,M.dektonEdge,pm,M.kraft]);
      pnl.position.z=.007;g.add(pnl);
      [[-.45,.6],[.45,.6],[-.45,-.66],[.45,-.66]].forEach(function(hp){
        var dg=box(.2,.045,.016,M.alu);dg.position.set(hp[0],hp[1],-.012);g.add(dg);
        var dl=box(.2,.006,.022,M.alu);dl.position.set(hp[0],hp[1]-.025,-.018);dl.rotation.x=-.5;g.add(dl);
      });
      var i=pi++;var a=S2[0]+(S2[1]-S2[0])*(i/pn)*.72;
      add(g,{p:V(x,y,.213)},{p:V(x,y,1.9),r:{x:-.16}},a,a+(S2[1]-S2[0])*.28,.035);
    });});
    return {
      stages:[S1[0],S2[0],.82],
      calls:[{p:V(1.0,.216,.2),a:.08,b:.30},{p:V(1.622,-.816,.23),a:.40,b:.78},{p:V(.811,-.4,.22),a:.84,b:.98}],
      keys:[
        [0.00,[-0.2,.35,6.6],[-0.8,0,0]],
        [0.14,[1.6,.5,4.2],[.4,.3,0]],
        [0.30,[-1.0,.3,5.6],[-.8,0,0]],
        [0.55,[1.8,-1.0,3.2],[.8,-.85,.1]],
        [0.72,[-1.6,.6,5.0],[-.9,.1,0]],
        [0.88,[.5,-.3,1.5],[.02,-.4,.2]],
        [1.00,[-0.4,.1,6.9],[-.8,0,0]]
      ]
    };
  };

  function panelWall(M,add,S,opts){
    /* panels between the 4 vertical profiles + two edge strips; joints sit on the profiles */
    var cols=[[-1.24,1.232],[0,1.232],[1.24,1.232],[-2.16,.57],[2.16,.57]];
    var rowsN=opts.rows,ph=(3.3-(rowsN-1)*opts.joint)/rowsN,rows=[];
    for(var r=0;r<rowsN;r++)rows.push(-1.65+ph/2+r*(ph+opts.joint));
    var i=0,n=cols.length*rowsN,fix=[];
    rows.forEach(function(y){cols.forEach(function(c){
      var g=new THREE.Group();
      var w=c[1]-opts.joint;
      var pm=opts.face.clone();pm.color=new THREE.Color(0xffffff).offsetHSL(0,0,(Math.random()-.5)*opts.vary);
      var pnl=new THREE.Mesh(new THREE.BoxGeometry(w,ph,opts.t),[opts.edge,opts.edge,opts.edge,opts.edge,pm,opts.back]);
      g.add(pnl);
      var k=i++;var a=S[0]+(S[1]-S[0])*(k/n)*.7;
      add(g,{p:V(c[0],y,.173+opts.t/2)},{p:V(c[0],y,1.7),r:{x:-.12}},a,a+(S[1]-S[0])*.3);
      /* fixing points: along both vertical edges (on the profiles) + centre line for wide panels */
      var xs=[-w/2+.04,w/2-.04];if(w>1)xs.push(0);
      var ys=[-ph/2+.05,0,ph/2-.05];
      xs.forEach(function(fx){ys.forEach(function(fy){fix.push([c[0]+fx,y+fy]);});});
    });});
    return {fix:fix,zFace:.173+opts.t};
  }

  DEFS.hpl=function(M,add,root){
    substructure(root,M,false);
    var S1=[.04,.24],S2=[.28,.66],S3=[.68,.94];
    BX.forEach(function(x,i){var g=tprofile(M,x);var a=S1[0]+(S1[1]-S1[0])*(i/BX.length)*.6;add(g,{p:V(x,0,0)},{p:V(x,0,1.8)},a,a+(S1[1]-S1[0])*.4);});
    var pw=panelWall(M,add,S2,{rows:3,joint:.008,t:.008,face:M.hpl,edge:M.hplEdge,back:M.hplBack,vary:.05});
    pw.fix.forEach(function(f,i){var rv=new THREE.Group();rv.add(cylZ(.012,.004,M.rivetHpl,14));var a=S3[0]+(S3[1]-S3[0])*(i/pw.fix.length)*.85;add(rv,{p:V(f[0],f[1],pw.zFace+.002)},{p:V(f[0],f[1],pw.zFace+.3)},a,a+(S3[1]-S3[0])*.15);});
    return {
      stages:[S1[0],S2[0],S3[0]],
      calls:[{p:V(-.62,.4,.18),a:.08,b:.26},{p:V(.62,.0,.19),a:.34,b:.64},{p:V(-1.24+.576,-.55,.19),a:.72,b:.98}],
      keys:[
        [0.00,[-0.2,.35,6.6],[-0.8,0,0]],
        [0.14,[-1.0,.5,2.6],[-1.42,.2,.15]],
        [0.28,[-1.0,.3,5.6],[-.8,0,0]],
        [0.50,[1.6,-.6,4.0],[.4,-.4,.1]],
        [0.66,[-1.4,.5,5.2],[-.9,.1,0]],
        [0.84,[-.9,-.3,1.4],[-1.45,-.5,.2]],
        [1.00,[-0.4,.1,6.9],[-.8,0,0]]
      ]
    };
  };

  DEFS.fiber=function(M,add,root){
    substructure(root,M,false);
    var S1=[.04,.24],S2=[.28,.66],S3=[.68,.94];
    BX.forEach(function(x,i){var g=tprofile(M,x);var a=S1[0]+(S1[1]-S1[0])*(i/BX.length)*.6;add(g,{p:V(x,0,0)},{p:V(x,0,1.8)},a,a+(S1[1]-S1[0])*.4);});
    var pw=panelWall(M,add,S2,{rows:2,joint:.01,t:.01,face:M.fiber,edge:M.fiberEdge,back:M.fiberEdge,vary:.03});
    pw.fix.forEach(function(f,i){var sc=new THREE.Group();var head=cylZ(.011,.004,M.screw,14);sc.add(head);var sl=box(.014,.003,.003,M.epdm);sl.position.z=.002;sc.add(sl);
      var a=S3[0]+(S3[1]-S3[0])*(i/pw.fix.length)*.85;add(sc,{p:V(f[0],f[1],pw.zFace+.002)},{p:V(f[0],f[1],pw.zFace+.3)},a,a+(S3[1]-S3[0])*.15);});
    return {
      stages:[S1[0],S2[0],S3[0]],
      calls:[{p:V(1.86,.4,.18),a:.08,b:.26},{p:V(-.62,.0,.19),a:.34,b:.64},{p:V(1.24-.576,.78,.19),a:.72,b:.98}],
      keys:[
        [0.00,[-0.2,.35,6.6],[-0.8,0,0]],
        [0.14,[1.8,.5,2.8],[1.06,.2,.15]],
        [0.28,[-1.0,.3,5.6],[-.8,0,0]],
        [0.50,[-1.8,-.4,4.0],[-1.2,-.3,.1]],
        [0.66,[1.4,.5,5.2],[-.6,.1,0]],
        [0.84,[.4,.6,1.4],[-.15,.75,.2]],
        [1.00,[-0.4,.1,6.9],[-.8,0,0]]
      ]
    };
  };

  /* ---------- mount ---------- */
  function mount(wrap){
    var cv=wrap.querySelector('canvas'),callsBox=wrap.querySelector('.calls'),tabs=[].slice.call(wrap.querySelectorAll('.stages span'));
    var pct=wrap.querySelector('.pct'),stg=wrap.querySelector('.stg'),word=wrap.dataset.stageWord||'';
    function bail(){if(cv)cv.remove();wrap.classList.add('nogl');wrap.style.height='100vh';if(callsBox)callsBox.remove();}
    if(!window.THREE||!cv){bail();return;}
    var renderer=null;
    var scene=new THREE.Scene();scene.fog=new THREE.Fog(0xECEEF1,10,22);
    function makeRenderer(){if(renderer)return;var n=cv.cloneNode(false);if(cv.parentNode)cv.parentNode.replaceChild(n,cv);cv=n;
      try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:window.innerWidth>=900,alpha:true});}catch(e){renderer=null;bail();return;}
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputEncoding=THREE.sRGBEncoding;
      renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      try{scene.environment=envMap(renderer);}catch(e){}
      W=0;if(size())frame(cur<0?progress():cur);}
    function dropRenderer(){if(!renderer)return;if(scene.environment){scene.environment.dispose();scene.environment=null;}renderer.forceContextLoss();renderer.dispose();renderer=null;}
    var cam=new THREE.PerspectiveCamera(38,1,.05,60);
    scene.add(new THREE.HemisphereLight(0xffffff,0xa8adb4,.45));
    var key=new THREE.DirectionalLight(0xffffff,.7);key.position.set(4,6,7);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);var kc=key.shadow.camera;kc.left=-4.2;kc.right=4.2;kc.top=3.2;kc.bottom=-3.2;kc.near=1;kc.far=24;key.shadow.bias=-0.0006;
    scene.add(key);
    var fill=new THREE.DirectionalLight(0xE8EEF6,.3);fill.position.set(-6,1,5);scene.add(fill);
    var root=new THREE.Group();root.position.x=-0.8;scene.add(root);
    var parts=[];
    function add(g,home,from,a,b,lock){g.position.copy(from.p);if(from.r)g.rotation.set(from.r.x||0,from.r.y||0,from.r.z||0);g.traverse(function(o){if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});root.add(g);parts.push({g:g,home:home,from:from,a:a,b:b,lock:lock||0});}
    var def=DEFS[wrap.dataset.mat](materials(),add,root);
    var K=def.keys;
    var calls=[];
    if(callsBox){var texts=[].slice.call(callsBox.querySelectorAll('span')).map(function(s){return s.textContent});callsBox.innerHTML='';
      def.calls.forEach(function(cd,i){var d=document.createElement('div');d.className='call';d.innerHTML='<i></i><em>'+(texts[i]||'')+'</em>';callsBox.appendChild(d);calls.push({el:d,def:cd});});}
    function camAt(p){
      var i=0;while(i<K.length-2&&p>K[i+1][0])i++;
      var k0=K[i],k1=K[i+1],t=ss((p-k0[0])/(k1[0]-k0[0]));
      for(var j=0;j<3;j++){cam.position.setComponent(j,k0[1][j]+(k1[1][j]-k0[1][j])*t);}
      var lx=k0[2][0]+(k1[2][0]-k0[2][0])*t,ly=k0[2][1]+(k1[2][1]-k0[2][1])*t,lz=k0[2][2]+(k1[2][2]-k0[2][2])*t;
      if(portrait){cam.position.x=lx+(cam.position.x-lx)*pull;cam.position.y=ly+(cam.position.y-ly)*pull;cam.position.z=lz+(cam.position.z-lz)*pull;}
      cam.lookAt(lx,ly,lz);
    }
    var tmp=new THREE.Vector3(),lastStage=-1,portrait=false,pull=1;
    function frame(p){
      camAt(p);
      parts.forEach(function(pt){
        var t=easeO((p-pt.a)/(pt.b-pt.a));
        pt.g.visible=t>0;if(t<=0)return;
        pt.g.position.lerpVectors(pt.from.p,pt.home.p,t);
        var fr=pt.from.r||{},hr=pt.home.r||{};
        pt.g.rotation.set((fr.x||0)*(1-t)+(hr.x||0)*t,(fr.y||0)*(1-t)+(hr.y||0)*t,(fr.z||0)*(1-t)+(hr.z||0)*t);
        if(pt.lock){var lt=ss((t-.78)/.22);pt.g.position.y=pt.home.p.y+pt.lock*(1-lt);}
      });
      var stage=0;def.stages.forEach(function(s,i){if(p>=s)stage=i;});
      if(stage!==lastStage){tabs.forEach(function(tb,i){tb.classList.toggle('on',i===stage)});
        if(stg&&tabs[stage]){var b=tabs[stage].querySelector('b');var nm=tabs[stage].textContent.replace(b?b.textContent:'','').trim();stg.textContent=(word?word+' ':'')+(b?b.textContent:'')+' · '+nm;}
        lastStage=stage;}
      if(pct)pct.textContent=Math.round(Math.min(1,p/.96)*100)+'%';
      calls.forEach(function(c){
        var on=p>=c.def.a&&p<=c.def.b;c.el.classList.toggle('on',on);
        if(on){tmp.copy(c.def.p).add(root.position).project(cam);var cw=cv.clientWidth,x=(tmp.x*.5+.5)*cw,fl=x>cw*.55;c.el.classList.toggle('flip',fl);if(fl){c.el.style.left='auto';c.el.style.right=(cw-x)+'px';}else{c.el.style.right='auto';c.el.style.left=x+'px';}c.el.style.top=((-tmp.y*.5+.5)*cv.clientHeight)+'px';}
      });
      if(renderer)renderer.render(scene,cam);
    }
    var W=0,H=0;function size(){if(!renderer)return false;var w=cv.clientWidth,h=cv.clientHeight;if(!w||!h)return false;if(w!==W||h!==H){W=w;H=h;renderer.setSize(w,h,false);cam.aspect=w/h;var hh=Math.min(h,window.innerHeight*1.15);pull=Math.min(1.2,Math.max(1,.87/(w/hh)));portrait=pull>1.001;cam.fov=portrait?52:38;root.position.y=portrait?.55:0;cam.updateProjectionMatrix();}return true;}
    function progress(){var r=wrap.getBoundingClientRect();var total=wrap.offsetHeight-window.innerHeight;return Math.min(1,Math.max(0,-r.top/total));}
    var target=0,cur=-1,raf=null;
    function tick(){cur+=(target-cur)*.12;if(Math.abs(target-cur)<.0004)cur=target;if(size())frame(cur);if(cur!==target)raf=requestAnimationFrame(tick);else raf=null;}
    function onS(){if(!wrap.offsetHeight)return;var r=wrap.getBoundingClientRect();if(r.bottom<-100||r.top>window.innerHeight+100)return;target=progress();if(cur<0)cur=target;if(!raf)raf=requestAnimationFrame(tick);}
    wrap.__mat={frame:frame,cam:cam};
    lazyGL(wrap,makeRenderer,dropRenderer);
    if(reduce){cur=1;if(size())frame(1);window.addEventListener('resize',function(){if(size())frame(1)});return;}
    window.addEventListener('scroll',onS,{passive:true});
    window.addEventListener('resize',function(){W=0;onS();});
    setTimeout(function(){W=0;onS();},700);
    onS();
  }
  els.forEach(function(el){whenNear(el,function(){try{mount(el);}catch(e){el.classList.add('nogl');}});});
})();
