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
    <!-- ── GOOGLE DOCS-STYLE MENU BAR ── -->
    <div id="rtb-menu">
      <div class="rtbm-item" onclick="rtbMenuToggle('file',this)">File</div>
      <div class="rtbm-item" onclick="rtbMenuToggle('edit',this)">Edit</div>
      <div class="rtbm-item" onclick="rtbMenuToggle('format',this)">Format</div>
      <div class="rtbm-item" onclick="rtbMenuToggle('insert',this)">Insert</div>
      <div class="rtbm-item" onclick="rtbMenuToggle('tools',this)">Tools</div>
      <div class="rtbm-item" onclick="rtbMenuToggle('help',this)">Help</div>
      <div style="flex:1"></div>
      <div class="rtbm-save" id="save-ind">✓ Saved</div>
    </div>
    <!-- ── TOOLBAR ── -->
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
      <button class="tb" onclick="execCmd('superscript')" title="Superscript">x²</button>
      <button class="tb" onclick="execCmd('subscript')" title="Subscript">x₂</button>
      <div class="tsep"></div>
      <button class="tb" onclick="execCmd('insertUnorderedList')" title="Bullets">• ≡</button>
      <button class="tb" onclick="execCmd('insertOrderedList')" title="Numbers">1 ≡</button>
      <button class="tb" onclick="insCheckbox()" title="Checkbox">☑</button>
      <div class="tsep"></div>
      <div class="cpw" title="Text Color">
        <div class="cpsw" id="tc-sw" style="background:var(--t)"></div>
        <input type="color" value="#e8e8f0" oninput="execCmd('foreColor',this.value);document.getElementById('tc-sw').style.background=this.value">
      </div>
      <div class="cpw" title="Highlight">
        <div class="cpsw" style="background:var(--yw)"></div>
        <input type="color" value="#fbbf24" oninput="execCmd('hiliteColor',this.value)">
      </div>
      <div class="tsep"></div>
      <button class="tb" onclick="insTable()" title="Insert Table">⊞ Table</button>
      <button class="tb" onclick="insCodeBlock()" title="Code Block">&lt;/&gt;</button>
      <button class="tb" onclick="showMathPicker()" title="Math Picker">∑…</button>
      <button class="tb" onclick="showAlgebraInline()" title="Algebra Solver" style="color:var(--ac2)">⚡ Solve</button>
      <button class="tb" onclick="insHr()" title="Divider">—</button>
      <button class="tb" onclick="insLink()" title="Link">🔗</button>
      <button class="tb" onclick="insertPageLink()" title="Link to page" style="font-size:11px">[[pg]]</button>
      <div class="tsep"></div>
      <button class="tb" onclick="execCmd('undo')" title="Undo">↩</button>
      <button class="tb" onclick="execCmd('redo')" title="Redo">↪</button>
    </div>
    ${showMath?`<div id="mth">
      <button class="mbt" onclick="insM('\\\\int_{a}^{b}')">∫</button>
      <button class="mbt" onclick="insM('\\\\sum_{n=1}^{\\\\infty}')">∑</button>
      <button class="mbt" onclick="insM('\\\\lim_{x\\\\to 0}')">lim</button>
      <button class="mbt" onclick="insM('\\\\frac{d}{dx}[f(x)]')">d/dx</button>
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
      <div class="rmeta" id="rmeta"><span style="font-size:10px;text-transform:uppercase;letter-spacing:.8px">page</span></div>
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
  if(A.settings.smartChips!==false) processChips(eb);
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

