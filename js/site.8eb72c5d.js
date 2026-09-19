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
