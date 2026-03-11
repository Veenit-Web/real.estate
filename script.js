(function(){
  'use strict';

  /* ── HEADER SCROLL ── */
  var hdr = document.getElementById('hdr');
  function onScroll(){
    hdr.classList.toggle('on', window.scrollY > 60);
    document.getElementById('btt').classList.toggle('on', window.scrollY > 400);
    checkReveal();
    checkCounters();
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  /* ── HAMBURGER / DRAWER ── */
  var ham    = document.getElementById('ham');
  var drawer = document.getElementById('drawer');

  ham.addEventListener('click', function(){
    var isOpen = drawer.classList.toggle('open');
    ham.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close drawer when any drawer link clicked
  drawer.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      drawer.classList.remove('open');
      ham.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── BACK TO TOP ── */
  document.getElementById('btt').addEventListener('click', function(){
    window.scrollTo({top:0, behavior:'smooth'});
  });

  /* ── SMOOTH SCROLL for desktop nav ── */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = this.getAttribute('href');
      if(id === '#') return;
      var el = document.querySelector(id);
      if(el){
        e.preventDefault();
        var top = el.getBoundingClientRect().top + window.scrollY - 85;
        window.scrollTo({top:top, behavior:'smooth'});
      }
    });
  });

  /* ── PROPERTY FILTER ── */
  window.filterProps = function(){
    var loc   = document.getElementById('fLoc').value;
    var price = parseFloat(document.getElementById('fPrice').value) || Infinity;
    var type  = document.getElementById('fType').value;
    var cards = document.querySelectorAll('.pc');
    var shown = 0;

    cards.forEach(function(c){
      var ok = (!loc   || c.dataset.loc   === loc) &&
               (!type  || c.dataset.type  === type) &&
               (parseFloat(c.dataset.price) <= price);
      c.classList.toggle('hide', !ok);
      if(ok) shown++;
    });

    document.getElementById('noRes').style.display = shown ? 'none' : 'block';
    var sec = document.getElementById('properties');
    window.scrollTo({top: sec.getBoundingClientRect().top + window.scrollY - 90, behavior:'smooth'});
  };

  /* ── COUNTERS ── */
  var counted = false;
  function checkCounters(){
    if(counted) return;
    var sec = document.querySelector('.stats');
    if(!sec) return;
    if(sec.getBoundingClientRect().top < window.innerHeight * 0.9){
      counted = true;
      document.querySelectorAll('.stat-n').forEach(function(el){
        var target = parseInt(el.dataset.t, 10);
        var start  = performance.now();
        var dur    = 1800;
        function tick(now){
          var p = Math.min((now-start)/dur, 1);
          var ease = 1 - Math.pow(1-p, 3);
          el.textContent = Math.floor(ease * target);
          if(p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
      });
    }
  }

  /* ── SCROLL REVEAL — IntersectionObserver ── */
  // Handle both legacy .rv and new data-anim elements
  var allAnimEls = document.querySelectorAll('[data-anim], .rv');

  if('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var el = entry.target;
          var delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
          setTimeout(function(){
            el.classList.add('anim-in');
            el.classList.add('in'); // legacy support
          }, delay);
          observer.unobserve(el);
        }
      });
    }, {threshold: 0.12, rootMargin:'0px 0px -40px 0px'});

    allAnimEls.forEach(function(el){ observer.observe(el); });
  } else {
    // Fallback: just show everything
    allAnimEls.forEach(function(el){ el.classList.add('anim-in','in'); });
  }

  function checkReveal(){ /* no-op: handled by IntersectionObserver */ }

  /* ── FORMS ── */
  function setupForm(id){
    var form = document.getElementById(id);
    if(!form) return;
    form.addEventListener('submit', async function(e){
      var action = form.getAttribute('action') || '';
      if(action.includes('YOUR_FORM_ID')){
        e.preventDefault();
        showMsg(form, 'warning', '⚙️ Replace YOUR_FORM_ID in the form action with your Formspree ID.');
        return;
      }
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;
      try{
        var res = await fetch(action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
        if(res.ok){ showMsg(form,'success','✅ Thank you! We\'ll contact you within 24 hours.'); form.reset(); }
        else throw new Error();
      }catch(e){ showMsg(form,'error','❌ Something went wrong. Please call us directly.'); }
      btn.innerHTML = orig; btn.disabled = false;
    });
  }

  function showMsg(form, type, text){
    var old = form.querySelector('.msg'); if(old) old.remove();
    var d = document.createElement('div');
    d.className = 'msg';
    d.textContent = text;
    var bg = type==='success'?'#d4edda':type==='error'?'#f8d7da':'#fff3cd';
    var cl = type==='success'?'#155724':type==='error'?'#721c24':'#856404';
    var bd = type==='success'?'#28a745':type==='error'?'#dc3545':'#ffc107';
    Object.assign(d.style,{padding:'12px 16px',borderRadius:'8px',marginTop:'14px',fontSize:'.86rem',fontWeight:'500',background:bg,border:'1px solid '+bd,color:cl,lineHeight:'1.5'});
    form.appendChild(d);
    setTimeout(function(){ d.remove(); }, 8000);
  }

  setupForm('sellForm');
  setupForm('cntForm');

  /* ── INIT ── */
  onScroll();
  // Hero elements are above fold — animate them on load with stagger
  setTimeout(function(){
    document.querySelectorAll('.hero-ct [data-anim]').forEach(function(el){
      var delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(function(){ el.classList.add('anim-in','in'); }, delay + 150);
    });
  }, 100);

})();