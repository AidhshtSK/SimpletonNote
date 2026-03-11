// ═══════════════════════════════════════════
// RICH TEXT EDITOR
// ═══════════════════════════════════════════
let _curPg=null,_asTimer=null;

function togglePgTaskPanel(){
  const p=document.getElementById('pg-tasks-panel');
  if(p) p.classList.toggle('collapsed');
}
function renderPgTasks(pgId,nbId){
  const body=document.getElementById('pgtask-body');
  const cnt=document.getElementById('pgtask-count');
  if(!body) return;
  const allTasks=Object.values(A.tasks).flat().filter(t=>t.pageLink===pgId);
  const nbTasks=(A.tasks[nbId]||[]);
  const relevant=[...allTasks,...nbTasks.filter(t=>!t.pageLink||t.pageLink===pgId)];
  const unique=[...new Map(relevant.map(t=>[t.id,t])).values()];
  const done=unique.filter(t=>t.done).length;
  if(cnt) cnt.textContent=unique.length?(done+'/'+unique.length+' done'):'no tasks';
  if(!unique.length){
    body.innerHTML='<div style="font-size:12px;color:var(--t3);padding:4px">No tasks for this page. <span style="color:var(--ac2);cursor:pointer" onclick="showAddTaskModal(&#39;&#39;)">+ Add</span></div>';
    return;
  }
  body.innerHTML=unique.map(function(t){
    return '<div class="pgtk-mini'+(t.done?' done':'')+'"><input type="checkbox" '+(t.done?'checked ':'')+' onchange="quickTogglePgTask(&#39;'+t.id+'&#39;,&#39;'+(nbId||'')+'&#39;,this)"><span class="ptname">'+esc(t.name)+'</span>'+(t.dueDate?'<span class="ptdate">'+t.dueDate+'</span>':'')+'</div>';
  }).join('');
}
function quickTogglePgTask(id,nbId,el){
  const task=findTask(id,nbId);
  if(task){task.done=el.checked;saveA();}
  const row=el.closest('.pgtk-mini');
  if(row) row.classList.toggle('done',el.checked);
}

function openRich(pg){
  _curPg=pg;
  document.getElementById('exp-btn').textContent='↗ HTML';
  const showMath=A.settings.mathBar!==false;
  document.getElementById('con').innerHTML=`<div id="rew">
    <div id="rtb">
      <select class="tsel" onchange="execCmd('formatBlock',this.value)" id="blksel">
        <option value="p">Para</option><option value="h1">H1</option><option value="h2">H2</option><option value="h3">H3</option><option value="blockquote">Quote</option>
      </select>
      <select class="tsel" onchange="execCmd('fontName',this.value)" style="max-width:72px">
        <option value="DM Sans">DM Sans</option><option value="Instrument Serif">Serif</option><option value="DM Mono">Mono</option><option value="Georgia">Georgia</option>
      </select>
      <select class="tsel" onchange="setFontSize(this.value)" style="max-width:52px">
        <option value="">Size</option><option value="12px">12</option><option value="14px">14</option><option value="15px">15</option><option value="17px">17</option><option value="20px">20</option><option value="24px">24</option><option value="30px">30</option>
      </select>
      <div class="tsep"></div>
      <button class="tb" id="tb-b" onclick="execCmd('bold')" title="Bold"><b>B</b></button>
      <button class="tb" id="tb-i" onclick="execCmd('italic')" title="Italic"><i>I</i></button>
      <button class="tb" id="tb-u" onclick="execCmd('underline')" title="Underline"><u>U</u></button>
      <button class="tb" id="tb-s" onclick="execCmd('strikeThrough')" title="Strike"><s>S</s></button>
      <button class="tb" onclick="execCmd('superscript')" title="Super">x²</button>
      <button class="tb" onclick="execCmd('subscript')" title="Sub">x₂</button>
      <div class="tsep"></div>
      <button class="tb" onclick="execCmd('insertUnorderedList')" title="Bullets">• ≡</button>
      <button class="tb" onclick="execCmd('insertOrderedList')" title="Numbers">1 ≡</button>
      <button class="tb" onclick="insCheckbox()" title="Checkbox">☑</button>
      <div class="tsep"></div>
      <div class="cpw" title="Text Color"><div class="cpsw" id="tc-sw" style="background:var(--t)"></div><input type="color" value="#e8e8f0" oninput="execCmd('foreColor',this.value);document.getElementById('tc-sw').style.background=this.value"></div>
      <div class="cpw" title="Highlight"><div class="cpsw" style="background:var(--yw)"></div><input type="color" value="#fbbf24" oninput="execCmd('hiliteColor',this.value)"></div>
      <div class="tsep"></div>
      <button class="tb" onclick="insTable()" title="Table">⊞</button>
      <button class="tb" onclick="insCodeBlock()" title="Code">&lt;/&gt;</button>
      <button class="tb" onclick="insMath()" title="Math (inline)">∫</button>
      <button class="tb" onclick="showMathPicker()" title="Math Picker">∑…</button>
      <button class="tb" onclick="showAlgebraInline()" title="Algebra Solver">⚡∑</button>
      <button class="tb" onclick="insHr()" title="Divider">—</button>
      <button class="tb" onclick="insLink()" title="Link">🔗</button>
      <div class="tsep"></div>
      <button class="tb" onclick="showAlgebraInline()" title="Algebra Solver — insert results into page" style="color:var(--ac2);font-weight:600">⚡ Solve</button>
      <div class="tsep"></div>
      <button class="tb" onclick="execCmd('undo')" title="Undo">↩</button>
      <button class="tb" onclick="execCmd('redo')" title="Redo">↪</button>
    </div>
    ${showMath?`<div id="mth">
      <button class="mbt" onclick="insM('\\\\int_{a}^{b}')">∫</button>
      <button class="mbt" onclick="insM('\\\\sum_{n=1}^{\\\\infty}')">∑</button>
      <button class="mbt" onclick="insM('\\\\lim_{x\\\\to 0}')">lim</button>
      <button class="mbt" onclick="insM('\\\\frac{d}{dx}')">d/dx</button>
      <button class="mbt" onclick="insM('\\\\sqrt{x}')">√</button>
      <button class="mbt" onclick="insM('\\\\infty')">∞</button>
      <button class="mbt" onclick="insM('\\\\alpha\\\\beta\\\\gamma')">αβγ</button>
      <button class="mbt" onclick="insM('x^{2}+y^{2}=r^{2}')">x²+y²</button>
      <button class="mbt" onclick="insM('e^{i\\\\pi}+1=0')">Euler</button>
      <button class="mbt" onclick="insM('\\\\vec{F}=m\\\\vec{a}')">F=ma</button>
      <button class="mbt" onclick="insM('\\\\Delta x\\\\cdot\\\\Delta p \\\\geq \\\\frac{\\\\hbar}{2}')">HUP</button>
    </div>`:''}
    <div id="ri">
      <input class="rpt" id="rpt" type="text" placeholder="Untitled" value="${esc(pg.name)}" oninput="pgRename(this.value)">
      <div class="rmeta" id="rmeta">
        <span style="font-size:10px;text-transform:uppercase;letter-spacing:.8px">page</span>
      </div>
      <div class="tag-bar" id="tagbar"></div>
      <div id="eb" contenteditable="true" data-placeholder="Start writing… (try - for bullets, [] for checkboxes, # for headings)"></div>
    </div>
    <div id="pg-tasks-panel" class="collapsed">
      <div class="pgtask-hdr" onclick="togglePgTaskPanel()">
        <span style="font-size:13px;color:var(--t2);font-weight:500">&#9989; Tasks</span>
        <span id="pgtask-count" style="font-size:11px;color:var(--t3);flex:1;margin-left:8px"></span>
        <span class="pgtask-arrow">&#9662;</span>
      </div>
      <div class="pgtask-body" id="pgtask-body"></div>
    </div>
  </div>`;
  const eb=document.getElementById('eb');
  eb.innerHTML=pg.content||'';
  renderTagBar(pg.id);
  // Process chips
  if(A.settings.smartChips!==false) processChips(eb);
  // Render math
  renderAllMath(eb);
  eb.addEventListener('input',()=>{
    clearTimeout(_asTimer);
    _asTimer=setTimeout(()=>{_curPg.content=eb.innerHTML;saveA();},700);
  });
  eb.addEventListener('keydown',richKeydown);
  eb.addEventListener('paste',handlePaste);
  // Table right-click
  eb.addEventListener('contextmenu',e=>{
    const td=e.target.closest('td,th');
    if(td&&td.closest('#eb')){
      e.preventDefault();
      const tbl=td.closest('table');
      showCtx(e.clientX,e.clientY,[
        {icon:'➕',label:'Add row below',fn:`addTableRow()`},
        {icon:'➕',label:'Add col right',fn:`addTableCol()`},
        {icon:'➖',label:'Del row',fn:`delTableRow()`,cls:'dng'},
        {icon:'➖',label:'Del col',fn:`delTableCol()`,cls:'dng'},
      ]);
      window._ctxTd=td;
    }
  });
  // Render linked tasks in panel
  setTimeout(function(){renderPgTasks(pg.id,A.activeNotebook||'');},80);
}

function pgRename(v){
  if(!_curPg) return;
  _curPg.name=v;
  const nb=A.notebooks.find(n=>A.pages[n.id]?.some(p=>p.id===_curPg.id));
  if(nb) document.getElementById('tbtit').innerHTML=`${nb.icon} <strong>${esc(v)}</strong>`;
  clearTimeout(_asTimer);_asTimer=setTimeout(()=>{saveA();renderSB();},600);
}

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
function addTableRow(){const td=window._ctxTd;if(!td) return;const tr=td.closest('tr');const newTr=tr.cloneNode(true);newTr.querySelectorAll('td,th').forEach(c=>{c.textContent='';c.contentEditable='true';});tr.after(newTr);}
function addTableCol(){const td=window._ctxTd;if(!td) return;const tbl=td.closest('table');const ci=Array.from(td.closest('tr').children).indexOf(td);tbl.querySelectorAll('tr').forEach(r=>{const nc=document.createElement(r.querySelector('th')?'th':'td');nc.contentEditable='true';r.appendChild(nc);});}
function delTableRow(){const td=window._ctxTd;if(!td) return;td.closest('tr').remove();}
function delTableCol(){const td=window._ctxTd;if(!td) return;const tbl=td.closest('table');const ci=Array.from(td.closest('tr').children).indexOf(td);tbl.querySelectorAll('tr').forEach(r=>{if(r.children[ci]) r.children[ci].remove();});}

// ── CODE BLOCKS IN RICH TEXT ──
function insCodeBlock(){
  const id='cbk'+uid();
  const html=`<div class="cbw" id="${id}" contenteditable="false"><div class="cbhdr"><select class="lsel"><option>javascript</option><option>python</option><option>java</option><option>c++</option><option>c</option><option>rust</option><option>go</option><option>html</option><option>css</option><option>sql</option><option>bash</option><option>json</option></select><button class="cbbtn" onclick="runCBInline('${id}')">▶ Run</button><button class="cbbtn" onclick="copyCB('${id}')">Copy</button></div><pre class="cbcode" contenteditable="true" spellcheck="false">// code here</pre><div class="cbout" id="${id}out"></div></div>`;
  execCmd('insertHTML',html);
}
function runCBInline(id){
  const cb=document.getElementById(id);if(!cb) return;
  const lang=cb.querySelector('.lsel').value;
  const code=cb.querySelector('.cbcode').textContent;
  const out=document.getElementById(id+'out');
  out.style.display='block';out.style.color='var(--gr)';
  if(lang!=='javascript'){out.textContent='Only JS runs in browser';out.style.color='var(--t3)';return;}
  const logs=[];const orig=console.log;
  console.log=(...a)=>{logs.push(a.map(x=>typeof x==='object'?JSON.stringify(x,null,2):x).join(' '));orig(...a);};
  try{const r=eval(code);if(r!==undefined) logs.push('→ '+r);}
  catch(e){logs.push('❌ '+e.message);out.style.color='var(--rd)';}
  console.log=orig;
  out.textContent=logs.join('\n')||'(no output)';
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

function showTemplates(){
  showModal(`<h2>📋 Templates</h2><p style="font-size:12px;color:var(--t3);margin-bottom:10px">Click to apply to current page</p>
    <div class="tgrid">${ALL_TEMPLATES.map((t,i)=>`<div class="tcard" onclick="applyTpl(${i})"><h3>${t.icon} ${t.name}</h3><p>${t.desc}</p></div>`).join('')}</div>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button></div>`);
}
function applyTpl(i){
  const tpl=ALL_TEMPLATES[i];
  closeModal();
  if(!tpl.fields||!tpl.fields.length){
    doApplyTpl(tpl.content);return;
  }
  const fieldsHtml=tpl.fields.map((f,fi)=>`<div class="tmpl-field"><label>${f.label}</label><input class="fi" id="atf${fi}" placeholder="${esc(f.placeholder)}" value="${esc(f.default||'')}"></div>`).join('');
  showModal(`<h2>${tpl.icon} ${tpl.name}</h2>${fieldsHtml}
    <div class="mbtns"><button class="bs" onclick="closeModal();doApplyTpl('${encodeURIComponent(tpl.content)}')">Skip</button>
    <button class="bp" onclick="doFillApply(${i})">Apply</button></div>`);
}
function doFillApply(i){
  const tpl=ALL_TEMPLATES[i];
  let content=tpl.content;
  (tpl.fields||[]).forEach((f,fi)=>{
    const val=document.getElementById('atf'+fi)?.value||f.default||'';
    content=content.replace(new RegExp('\\{\\{'+f.key+'\\}\\}','g'),esc(val));
  });
  closeModal();doApplyTpl(content);
}
function doApplyTpl(content){
  const eb=document.getElementById('eb');
  const c=typeof content==='string'&&content.startsWith('%')
    ?decodeURIComponent(content):content;
  if(eb){eb.innerHTML=c;if(_curPg){_curPg.content=c;saveA();}}
}
