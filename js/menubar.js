// ═══════════════════════════════════════════
// MENUBAR & EDITOR TOOLS
// ═══════════════════════════════════════════

// ══ GOOGLE DOCS MENUBAR ══
let _rtbMenuOpen=null;
function rtbMenuToggle(name,el){
  const existing=document.getElementById('rtbm-dd');
  if(existing){existing.remove();_rtbMenuOpen=null;
    if(_rtbMenuOpen===name) return;}
  _rtbMenuOpen=name;
  const rect=el.getBoundingClientRect();
  const menus={
    file:[
      {label:'📥 Export as HTML',  fn:"handleExport()"},
      {label:'📋 Copy all text',   fn:"document.execCommand('selectAll');document.execCommand('copy');toast('Copied!')"},
      {label:'🖨 Print page',      fn:"window.print()"},
      {sep:true},
      {label:'📋 Templates…',     fn:"showTemplates()"},
    ],
    edit:[
      {label:'↩ Undo',             fn:"execCmd('undo')",          shortcut:'Ctrl+Z'},
      {label:'↪ Redo',             fn:"execCmd('redo')",          shortcut:'Ctrl+Y'},
      {sep:true},
      {label:'✂️ Cut',              fn:"execCmd('cut')",           shortcut:'Ctrl+X'},
      {label:'📋 Copy',            fn:"execCmd('copy')",          shortcut:'Ctrl+C'},
      {label:'📌 Paste plain',     fn:"execCmd('paste')",         shortcut:'Ctrl+V'},
      {sep:true},
      {label:'🔍 Select all',      fn:"execCmd('selectAll')",     shortcut:'Ctrl+A'},
      {label:'🧹 Clear format',    fn:"execCmd('removeFormat')"},
    ],
    format:[
      {label:'<b>Bold</b>',           fn:"execCmd('bold')",          shortcut:'Ctrl+B'},
      {label:'<i>Italic</i>',         fn:"execCmd('italic')",        shortcut:'Ctrl+I'},
      {label:'<u>Underline</u>',      fn:"execCmd('underline')",     shortcut:'Ctrl+U'},
      {label:'<s>Strikethrough</s>',  fn:"execCmd('strikeThrough')"},
      {sep:true},
      {label:'Heading 1',  fn:"execCmd('formatBlock','h1')"},
      {label:'Heading 2',  fn:"execCmd('formatBlock','h2')"},
      {label:'Heading 3',  fn:"execCmd('formatBlock','h3')"},
      {label:'Paragraph',  fn:"execCmd('formatBlock','p')"},
      {label:'Blockquote', fn:"execCmd('formatBlock','blockquote')"},
      {sep:true},
      {label:'Align left',   fn:"execCmd('justifyLeft')"},
      {label:'Align center', fn:"execCmd('justifyCenter')"},
      {label:'Align right',  fn:"execCmd('justifyRight')"},
    ],
    insert:[
      {label:'⊞ Table',              fn:"insTable()"},
      {label:'</> Code block',        fn:"insCodeBlock()"},
      {label:'— Divider',             fn:"insHr()"},
      {label:'🔗 Link',               fn:"insLink()"},
      {label:'[[pg]] Page link',      fn:"insertPageLink()"},
      {label:'☑ Checkbox',            fn:"insCheckbox()"},
      {sep:true},
      {label:'∑ Math (inline)',       fn:"insMath()"},
      {label:'∑ Math picker…',        fn:"showMathPicker()"},
      {sep:true},
      {label:'🖼 Image from URL',     fn:"insImageFromUrl()"},
    ],
    tools:[
      {label:'⚡ Algebra Solver',     fn:"showAlgebraInline()"},
      {label:'📋 Templates…',         fn:"showTemplates()"},
      {label:'🏷 Add tag…',           fn:"promptAddTag()"},
      {label:'✅ Page tasks',         fn:"togglePgTaskPanel()"},
      {sep:true},
      {label:'🔢 Word count',         fn:"showWordCount()"},
      {label:'🎨 Change theme',       fn:"showThemePanel()"},
    ],
    help:[
      {label:'⌨️ Keyboard shortcuts', fn:"showShortcutsHelp()"},
      {label:'📖 Markdown hints',     fn:"showMarkdownHelp()"},
      {sep:true},
      {label:'ℹ️ About Folio',        fn:"showAbout()"},
    ],
  };
  const items=menus[name]||[];
  const dd=document.createElement('div');
  dd.id='rtbm-dd';dd.className='rtbm-dd';
  dd.style.cssText=`left:${rect.left}px;top:${rect.bottom+2}px`;
  dd.innerHTML=items.map((it,i)=>it.sep?'<div class="rtbm-sep"></div>'
    :`<div class="rtbm-dd-item" onclick="${it.fn};closeRtbMenu()" style="animation-delay:${i*15}ms">
        <span class="rtbm-lbl">${it.label}</span>
        ${it.shortcut?`<span class="rtbm-sc">${it.shortcut}</span>`:''}
      </div>`).join('');
  document.body.appendChild(dd);
  setTimeout(()=>document.addEventListener('click',closeRtbMenuOnOutside,{once:true}),10);
}
function closeRtbMenu(){const dd=document.getElementById('rtbm-dd');if(dd)dd.remove();_rtbMenuOpen=null;}
function closeRtbMenuOnOutside(e){if(!e.target.closest('#rtbm-dd')&&!e.target.closest('.rtbm-item')) closeRtbMenu();}

// Extra tool actions
function insImageFromUrl(){
  const url=prompt('Image URL:');
  if(url) execCmd('insertHTML',`<img src="${url}" style="max-width:100%;border-radius:7px;margin:6px 0">`);
}
function showWordCount(){
  const eb=document.getElementById('eb');if(!eb) return;
  const text=eb.innerText||'';
  const words=text.trim().split(/\s+/).filter(w=>w.length).length;
  const chars=text.length;
  const charNoSpace=text.replace(/\s/g,'').length;
  toast(`${words} words · ${chars} chars · ${charNoSpace} no-spaces`);
}
function showShortcutsHelp(){
  showModal(`<h2>⌨️ Shortcuts</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td><kbd>Ctrl+B</kbd></td><td>Bold</td></tr>
      <tr><td><kbd>Ctrl+I</kbd></td><td>Italic</td></tr>
      <tr><td><kbd>Ctrl+U</kbd></td><td>Underline</td></tr>
      <tr><td><kbd>Ctrl+Z</kbd></td><td>Undo</td></tr>
      <tr><td><kbd>Ctrl+Y</kbd></td><td>Redo</td></tr>
      <tr><td><kbd>#  Space</kbd></td><td>Heading 1</td></tr>
      <tr><td><kbd>## Space</kbd></td><td>Heading 2</td></tr>
      <tr><td><kbd>-  Space</kbd></td><td>Bullet list</td></tr>
      <tr><td><kbd>[] Space</kbd></td><td>Checkbox</td></tr>
      <tr><td><kbd>&gt; Space</kbd></td><td>Blockquote</td></tr>
      <tr><td><kbd>--- Space</kbd></td><td>Divider</td></tr>
      <tr><td><kbd>Ctrl+\\</kbd></td><td>Toggle sidebar</td></tr>
      <tr><td><kbd>Ctrl+S</kbd></td><td>Export .stn</td></tr>
    </table>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Close</button></div>`);
}
function showMarkdownHelp(){
  showModal(`<h2>📖 Markdown Shortcuts</h2>
    <p style="font-size:13px;color:var(--t3);margin-bottom:12px">Type these at the start of a line then press Space:</p>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td><code>#</code></td><td>Heading 1</td></tr>
      <tr><td><code>##</code></td><td>Heading 2</td></tr>
      <tr><td><code>###</code></td><td>Heading 3</td></tr>
      <tr><td><code>-</code> or <code>*</code></td><td>Bullet list</td></tr>
      <tr><td><code>1.</code></td><td>Numbered list</td></tr>
      <tr><td><code>[]</code> or <code>[ ]</code></td><td>Checkbox</td></tr>
      <tr><td><code>&gt;</code></td><td>Blockquote</td></tr>
      <tr><td><code>---</code></td><td>Horizontal divider</td></tr>
    </table>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Close</button></div>`);
}
function showAbout(){
  showModal(`<h2>✦ About Folio</h2>
    <p style="font-size:14px;line-height:1.7;color:var(--t2)">Folio is your personal workspace — rich text, infinite canvas, code, daily journal, tasks, and a fully customisable home dashboard. All data is stored locally in your browser.</p>
    <p style="font-size:12px;color:var(--t3);margin-top:12px">Press <kbd>Ctrl+S</kbd> to export a .stn backup file.</p>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Close</button></div>`);
}

// ══ GLOBAL BUTTON RIGHT-CLICK ══
document.addEventListener('contextmenu',e=>{
  const btn=e.target.closest('button:not([data-no-ctx]),[data-ctx-label]');
  if(!btn) return;
  const label=(btn.title||btn.dataset.ctxLabel||btn.textContent||'Button').trim().slice(0,30);
  const onclickFn=btn.getAttribute('onclick')||'';
  if(!onclickFn&&!btn.title) return;
  e.preventDefault();
  e.stopPropagation();
  // Use data attributes to avoid special-char injection in onclick strings
  showCtx(e.clientX,e.clientY,[
    {icon:'▶',label:'Run action',   fn:onclickFn},
    {icon:'📋',label:'Copy label',  fn:'navigator.clipboard?.writeText('+JSON.stringify(label)+')'},
  ]);
},true);

function execCmd(cmd,val=null){
  document.getElementById('eb')?.focus();
  document.execCommand(cmd,false,val);
  updateTbState();
}
function updateTbState(){
  ['bold','italic','underline','strikeThrough'].forEach(c=>{
    const id='tb-'+{bold:'b',italic:'i',underline:'u',strikeThrough:'s'}[c];
    const el=document.getElementById(id);
    if(el) el.classList.toggle('on',document.queryCommandState(c));
  });
}
function setFontSize(sz){
  if(!sz) return;
  document.execCommand('fontSize',false,'7');
  document.getElementById('eb')?.querySelectorAll('font[size="7"]').forEach(s=>{s.removeAttribute('size');s.style.fontSize=sz;});
}

// ── CHECKBOX INSERT + DELETE FIX ──
function insCheckbox(){
  const id='cb'+uid();
  const html=`<div class="fcb" id="${id}"><input type="checkbox" onchange="this.nextElementSibling.classList.toggle('done',this.checked)"><span class="cbt" contenteditable="true" data-placeholder="To-do item…"></span><button class="fcb-del" onclick="deleteCB('${id}')" title="Delete">✕</button></div>`;
  document.execCommand('insertHTML',false,html);
  // Focus the text part
  setTimeout(()=>{
    const cb=document.getElementById(id);
    if(cb){
      const span=cb.querySelector('.cbt');
      if(span){span.focus();placeCaret(span,0);}
    }
  },30);
}
function deleteCB(id){
  const el=document.getElementById(id);
  if(el){el.remove();if(_curPg){_curPg.content=document.getElementById('eb').innerHTML;saveA();}}
}
function placeCaret(el,offset){
  const range=document.createRange();
  const sel=window.getSelection();
  try{range.setStart(el,offset);range.collapse(true);sel.removeAllRanges();sel.addRange(range);}catch(e){}
}

function richKeydown(e){
  if(e.key==='Tab'){e.preventDefault();execCmd('insertHTML','&nbsp;&nbsp;&nbsp;&nbsp;');return;}
  if(e.key==='Enter'){
    const sel=window.getSelection();
    if(!sel.rangeCount) return;
    const anc=sel.anchorNode;
    const cb=anc?.closest?.('.fcb')||anc?.parentElement?.closest('.fcb');
    if(cb){
      e.preventDefault();
      // Add new checkbox after
      const id2='cb'+uid();
      const newCb=document.createElement('div');
      newCb.className='fcb';newCb.id=id2;
      newCb.innerHTML=`<input type="checkbox"><span class="cbt" contenteditable="true"></span><button class="fcb-del" onclick="deleteCB('${id2}')">✕</button>`;
      cb.after(newCb);
      const sp=newCb.querySelector('.cbt');sp?.focus();
      return;
    }
    // Backspace on empty checkbox = delete it
  }
  if(e.key==='Backspace'){
    const sel=window.getSelection();
    if(!sel.rangeCount) return;
    const anc=sel.anchorNode;
    const cbt=anc?.closest?.('.cbt')||anc?.parentElement?.closest('.cbt');
    if(cbt&&(cbt.textContent||'').trim()===''){
      e.preventDefault();
      const cb=cbt.closest('.fcb');
      if(cb){
        const prev=cb.previousElementSibling;
        cb.remove();
        if(prev&&prev.classList.contains('fcb')){
          const sp=prev.querySelector('.cbt');
          if(sp){sp.focus();placeCaret(sp,(sp.childNodes.length));}
        } else {
          document.getElementById('eb')?.focus();
        }
        if(_curPg){_curPg.content=document.getElementById('eb').innerHTML;saveA();}
      }
      return;
    }
  }
  // Markdown shortcuts
  if(e.key===' '){
    const sel=window.getSelection();
    if(!sel.rangeCount) return;
    const range=sel.getRangeAt(0);
    const node=range.startContainer;
    if(node.nodeType===3){
      const txt=node.textContent.slice(0,range.startOffset);
      if(/^#{1,3}$/.test(txt)){
        e.preventDefault();
        const lvl={'#':'h1','##':'h2','###':'h3'}[txt]||'p';
        execCmd('formatBlock',lvl);
        node.textContent='';
      } else if(txt==='-'||txt==='*'){
        e.preventDefault();
        node.textContent='';
        execCmd('insertUnorderedList');
      } else if(txt==='1.'){
        e.preventDefault();
        node.textContent='';
        execCmd('insertOrderedList');
      } else if(txt==='[]'||txt==='[ ]'){
        e.preventDefault();
        node.textContent='';
        insCheckbox();
      } else if(txt==='>'){
        e.preventDefault();
        node.textContent='';
        execCmd('formatBlock','blockquote');
      } else if(txt==='---'){
        e.preventDefault();
        node.textContent='';
        insHr();
      }
    }
  }
  updateTbState();
}

function handlePaste(e){
  const items=e.clipboardData?.items;
  if(!items) return;
  for(const item of items){
    if(item.type.startsWith('image/')){
      e.preventDefault();
      const blob=item.getAsFile();
      const reader=new FileReader();
      reader.onload=ev=>{
        execCmd('insertHTML',`<img src="${ev.target.result}" style="max-width:100%;border-radius:7px">`);
      };
      reader.readAsDataURL(blob);
      return;
    }
  }
}

function processChips(eb){
  if(A.settings.smartChips===false) return;
  eb.querySelectorAll('a').forEach(a=>{
    const href=a.href;
    if(a.querySelector('.schip')) return;
    let icon='🔗',label=a.textContent||href;
    if(href.includes('youtube.com')||href.includes('youtu.be')){icon='▶️';label='YouTube';}
    else if(href.includes('github.com')){icon='⚙';label='GitHub';}
    else if(href.includes('docs.google.com')){icon='📄';label='Google Doc';}
    else if(href.includes('drive.google.com')){icon='💾';label='Drive';}
    else if(href.includes('figma.com')){icon='🎨';label='Figma';}
    a.innerHTML=`<span class="schip">${icon} ${label}</span>`;
    a.target='_blank';a.rel='noopener';
  });
}

function insTable(){
  execCmd('insertHTML','<table><tr><th contenteditable="true">Header 1</th><th contenteditable="true">Header 2</th><th contenteditable="true">Header 3</th></tr><tr><td contenteditable="true">Cell</td><td contenteditable="true">Cell</td><td contenteditable="true">Cell</td></tr><tr><td contenteditable="true">Cell</td><td contenteditable="true">Cell</td><td contenteditable="true">Cell</td></tr></table>');
}
function insHr(){execCmd('insertHTML','<hr>');}
function insLink(){const u=prompt('Enter URL:');if(u) execCmd('createLink',u);}
function insertPageLink(){
  const pages=[];
  A.notebooks.forEach(nb=>{
    (A.pages[nb.id]||[]).forEach(pg=>{
      pages.push({nbId:nb.id,pgId:pg.id,name:pg.name,nbName:nb.name,icon:nb.icon});
    });
  });
  if(!pages.length){toast('No pages to link');return;}
  const items=pages.map(p=>`<div class="nbch" onclick="doInsertPageLink('${p.nbId}','${p.pgId}','${esc(p.name)}');closeModal()">
    <span>${p.icon}</span><span style="color:var(--t3);font-size:11px">${esc(p.nbName)}</span>
    <span style="flex:1">${esc(p.name)}</span>
  </div>`).join('');
  showModal(`<h2>🔗 Link to Page</h2>
    <input class="fi" placeholder="Filter pages…" oninput="(function(v){document.querySelectorAll('#pg-link-list .nbch').forEach(el=>{el.style.display=el.textContent.toLowerCase().includes(v.toLowerCase())?'':'none'})})(this.value)" style="margin-bottom:8px">
    <div id="pg-link-list" style="max-height:280px;overflow-y:auto">${items}</div>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button></div>`);
}
function doInsertPageLink(nbId,pgId,name){
  const chip=`<a class="schip" href="#" onclick="event.preventDefault();openPage('${nbId}','${pgId}')" data-pgid="${pgId}">📄 ${name}</a>`;
  document.getElementById('eb')?.focus();
  execCmd('insertHTML',chip+' ');
}
function addTableRow(){const td=window._ctxTd;if(!td) return;const tr=td.closest('tr');const newTr=tr.cloneNode(true);newTr.querySelectorAll('td,th').forEach(c=>{c.textContent='';c.contentEditable='true';});tr.after(newTr);}
function addTableCol(){const td=window._ctxTd;if(!td) return;const tbl=td.closest('table');const ci=Array.from(td.closest('tr').children).indexOf(td);tbl.querySelectorAll('tr').forEach(r=>{const nc=document.createElement(r.querySelector('th')?'th':'td');nc.contentEditable='true';r.appendChild(nc);});}
function delTableRow(){const td=window._ctxTd;if(!td) return;td.closest('tr').remove();}
function delTableCol(){const td=window._ctxTd;if(!td) return;const tbl=td.closest('table');const ci=Array.from(td.closest('tr').children).indexOf(td);tbl.querySelectorAll('tr').forEach(r=>{if(r.children[ci]) r.children[ci].remove();});}

// ── CODE BLOCKS IN RICH TEXT ──
function insCodeBlock(){
  const id='cbk'+uid();
  const cbHtml=`<div class="cbw" id="${id}" contenteditable="false"><div class="cbhdr"><select class="lsel" onchange="hlCB('${id}')"><option>javascript</option><option>python</option><option>java</option><option>c++</option><option>c</option><option>rust</option><option>go</option><option>html</option><option>css</option><option>sql</option><option>bash</option><option>json</option><option>typescript</option></select><button class="cbbtn" onclick="copyCB('${id}')">Copy</button></div><pre class="cbcode language-javascript"><code class="language-javascript" contenteditable="true" spellcheck="false">// code here</code></pre></div>`;
  execCmd('insertHTML',cbHtml);
  // Prism highlight on focus out
  setTimeout(()=>{
    const cb=document.getElementById(id);
    if(!cb) return;
    const code=cb.querySelector('code');
    if(code){
      code.addEventListener('blur',()=>hlCB(id));
      code.addEventListener('focus',()=>{
        // save raw text, unhighlight for editing
        const raw=code.textContent;
        code.textContent=raw;
      });
    }
  },50);
}
function hlCB(id){
  const cb=document.getElementById(id);if(!cb) return;
  const lsel=cb.querySelector('.lsel');
  const code=cb.querySelector('code');
  if(!code||!lsel) return;
  const lang=lsel.value.replace('c++','cpp').replace('html','markup');
  const raw=code.textContent;
  code.className=`language-${lang}`;
  code.closest('pre').className=`cbcode language-${lang}`;
  if(typeof Prism!=='undefined') Prism.highlightElement(code);
}
function copyCB(id){
  const cb=document.getElementById(id);if(!cb) return;
  navigator.clipboard?.writeText(cb.querySelector('.cbcode').textContent);toast('Copied!');
}

// ── MATH ──
function rKatex(latex,display=false){
  if(typeof katex==='undefined') return `<code>${esc(latex)}</code>`;
  try{return katex.renderToString(latex,{displayMode:display,throwOnError:false,output:'html'});}
  catch(e){return `<code style="color:var(--rd)">${esc(latex)}</code>`;}
}
function insM(latex){
  const span=`<span class="minl" onclick="editMath(this)" data-latex="${esc(latex)}">${rKatex(latex,false)}</span>`;
  execCmd('insertHTML',span);
}
function insMath(){
  const latex=prompt('Enter LaTeX:','\\int_{a}^{b} f(x)\\,dx');
  if(latex) insM(latex);
}
function insMathBlock(latex){
  const div=`<div class="mblk" onclick="editMath(this)" data-latex="${esc(latex)}">${rKatex(latex,true)}<button class="medit">Edit</button></div>`;
  execCmd('insertHTML',div);
}
function editMath(el){
  const cur=el.dataset.latex||'';
  const np=prompt('Edit LaTeX:',cur);
  if(np===null) return;
  el.dataset.latex=np;
  const isBlock=el.classList.contains('mblk');
  el.innerHTML=rKatex(np,isBlock)+(isBlock?'<button class="medit">Edit</button>':'');
  if(_curPg){_curPg.content=document.getElementById('eb').innerHTML;saveA();}
}
function renderAllMath(eb){
  eb.querySelectorAll('.minl,.mblk').forEach(el=>{
    const lat=el.dataset.latex;
    if(!lat) return;
    const isBlock=el.classList.contains('mblk');
    const prev=el.innerHTML;
    el.innerHTML=rKatex(lat,isBlock)+(isBlock?'<button class="medit" onclick="event.stopPropagation();editMath(this.parentElement)">Edit</button>':'');
  });
}
function showMathPicker(){
  const cats=[
    {cat:'Calculus',items:['\\int_{a}^{b} f(x)\\,dx','\\frac{d}{dx}[f(x)]','\\nabla f','\\frac{\\partial f}{\\partial x}','\\lim_{x\\to\\infty}']},
    {cat:'Algebra',items:['x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}','(a+b)^n = \\sum_{k=0}^{n}\\binom{n}{k}a^{n-k}b^k','a^2+b^2=c^2']},
    {cat:'Physics',items:['E=mc^2','F=ma','\\vec{F}=q(\\vec{E}+\\vec{v}\\times\\vec{B})','\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}']},
    {cat:'Greek',items:['\\alpha\\beta\\gamma\\delta\\epsilon','\\theta\\lambda\\mu\\nu\\xi','\\pi\\rho\\sigma\\tau\\phi\\psi\\omega']},
    {cat:'Sets',items:['A\\cup B','A\\cap B','A\\subset B','x\\in\\mathbb{R}','\\emptyset']},
    {cat:'Matrices',items:['\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}','\\det(A)=ad-bc']},
  ];
  let html=`<h2>∑ Math Picker</h2><div style="margin-bottom:10px"><label style="font-size:12px;color:var(--t3)">Custom LaTeX:</label><div style="display:flex;gap:7px;margin-top:4px"><input class="fi" id="mp-i" style="flex:1;font-family:'DM Mono',monospace" placeholder="\\int_{a}^{b}"><button class="bp" onclick="doInsCustomMath()">Inline</button><button class="bs" onclick="doInsBlockMath()">Block</button></div></div>`;
  cats.forEach(c=>{
    html+=`<div style="font-size:11px;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;margin:7px 0 4px">${c.cat}</div><div class="math-grid">`;
    c.items.forEach(m=>{html+=`<div class="mopt" onclick="pickerIns('${esc(m)}')"><span>${rKatex(m,false)}</span></div>`;});
    html+='</div>';
  });
  html+=`<div class="mbtns"><button class="bs" onclick="closeModal()">Close</button></div>`;
  showWideModal(html);
}
function doInsCustomMath(){const v=document.getElementById('mp-i')?.value;if(v){closeModal();insM(v);}}
function doInsBlockMath(){const v=document.getElementById('mp-i')?.value;if(v){closeModal();insMathBlock(v);}}
function pickerIns(m){closeModal();insM(m);}


