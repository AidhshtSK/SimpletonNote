// ═══════════════════════════════════════════
// HOME MODULE — widget dashboard v2
// ═══════════════════════════════════════════
// Widget schema: {id, type, label, x, y, w, h,
//   style:'default'|'card'|'glass'|'minimal'|'bold',
//   bg:null|'accent'|'green'|'red'|'yellow'|'cyan'|'pink'|hex,
//   bgImage:null|dataURL,
//   data:{...type-specific}}

const WIDGET_CELL=76, WIDGET_GAP=10;

const WIDGET_CATALOG = [
  // ── Time & Date ──
  {type:'clock',     icon:'🕐', name:'Clock',         desc:'Live time & date',      cat:'Time',    w:3,h:2},
  {type:'countdown', icon:'⏳', name:'Countdown',     desc:'Timer to a deadline',   cat:'Time',    w:3,h:2},
  // ── Tasks ──
  {type:'tasks',     icon:'✅', name:'Today Tasks',    desc:'Tasks due today',       cat:'Tasks',   w:4,h:3},
  {type:'nbtasks',   icon:'📋', name:'Notebook Tasks', desc:'Tasks from a notebook', cat:'Tasks',   w:4,h:3},
  {type:'alltasks',  icon:'🗂', name:'All Tasks',      desc:'Every task across notebooks', cat:'Tasks', w:5,h:4},
  // ── Notes & Writing ──
  {type:'quicknote', icon:'📝', name:'Quick Note',     desc:'Freeform scratchpad',   cat:'Notes',   w:3,h:3},
  {type:'richsnip',  icon:'✍️', name:'Rich Snippet',   desc:'Styled text block',     cat:'Notes',   w:4,h:3},
  // ── Navigation ──
  {type:'recentpages',icon:'📄',name:'Recent Pages',   desc:'Pages per notebook',    cat:'Navigate',w:4,h:4},
  {type:'bookmarks', icon:'🚀', name:'Launcher',       desc:'Pinned page bookmarks', cat:'Navigate',w:4,h:3},
  {type:'search',    icon:'🔍', name:'Search',         desc:'Quick search bar',      cat:'Navigate',w:4,h:2},
  // ── Calendar & Journal ──
  {type:'calendar',  icon:'📅', name:'Calendar',       desc:'Month + journal dots',  cat:'Calendar',w:4,h:3},
  {type:'journal',   icon:'📓', name:'Journal Entry',  desc:'Today\'s journal',      cat:'Calendar',w:5,h:4},
  {type:'habittrack',icon:'🎯', name:'Habit Tracker',  desc:'Daily habit chips',     cat:'Calendar',w:4,h:3},
  // ── Media ──
  {type:'image',     icon:'🖼', name:'Image',          desc:'Display an image',      cat:'Media',   w:3,h:3},
  {type:'drawing',   icon:'🎨', name:'Canvas Link',    desc:'Open a canvas page',    cat:'Media',   w:3,h:2},
  {type:'embed',     icon:'🌐', name:'Web Embed',      desc:'Embed a URL (iframe)',  cat:'Media',   w:5,h:4},
  // ── Stats & Info ──
  {type:'progress',  icon:'📊', name:'Progress Bar',   desc:'Custom progress tracker',cat:'Stats',  w:3,h:2},
  {type:'weather',   icon:'🌤', name:'Weather Note',   desc:'Manual weather memo',   cat:'Stats',   w:3,h:2},
  {type:'quote',     icon:'💬', name:'Quote',          desc:'Inspirational quote',   cat:'Stats',   w:4,h:2},
];

function openHome(){
  A.activeView='home'; A.activePage=null;
  document.getElementById('tbtit').innerHTML='<strong>🏠 Home</strong>';
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('exp-btn').style.display='none';
  if(!A.homeWidgets||!A.homeWidgets.length) A.homeWidgets=getDefaultWidgets();
  renderHome();
}

function getDefaultWidgets(){
  return [
    {id:'w1',type:'clock',    label:'Clock',       x:2,y:2,w:3,h:2,style:'glass',  bg:'accent',bgImage:null,data:{}},
    {id:'w2',type:'tasks',    label:'Today Tasks', x:5,y:2,w:4,h:3,style:'card',   bg:null,    bgImage:null,data:{}},
    {id:'w3',type:'quicknote',label:'Quick Note',  x:9,y:2,w:3,h:3,style:'minimal',bg:null,    bgImage:null,data:{text:''}},
    {id:'w4',type:'recentpages',label:'Pages',     x:2,y:5,w:4,h:4,style:'default',bg:null,    bgImage:null,data:{collapsed:{}}},
    {id:'w5',type:'calendar', label:'Calendar',    x:6,y:5,w:4,h:3,style:'card',   bg:null,    bgImage:null,data:{}},
    {id:'w6',type:'bookmarks',label:'Launcher',    x:2,y:4,w:3,h:2,style:'bold',   bg:'accent',bgImage:null,data:{pins:[]}},
  ];
}

// ── BG colour map → CSS value (auto theme-aware) ──
function wBgCss(w){
  if(w.bgImage) return `url(${w.bgImage}) center/cover no-repeat`;
  const map={
    accent:'var(--ac)',green:'var(--gr)',red:'var(--rd)',
    yellow:'var(--yw)',cyan:'var(--cy)',pink:'var(--pk)',
  };
  if(w.bg&&map[w.bg]) return map[w.bg];
  if(w.bg&&w.bg.startsWith('#')) return w.bg;
  return null;
}

function renderHome(){
  const con=document.getElementById('con');
  if(!con) return;
  con.innerHTML=`<div id="home-wrap">
    <div id="home-widgets"></div>
    <button class="home-add-btn" onclick="showAddWidget()" title="Add widget">＋</button>
  </div>`;
  renderWidgets();
  // right-click on empty canvas = add widget
  document.getElementById('home-wrap').addEventListener('contextmenu',e=>{
    if(e.target.id==='home-wrap'||e.target.id==='home-widgets'){
      e.preventDefault();
      hwCtxMenu(e,null);
    }
  });
}

function renderWidgets(){
  const wrap=document.getElementById('home-widgets');
  if(!wrap) return;
  wrap.innerHTML='';
  (A.homeWidgets||[]).forEach(w=>buildWidgetEl(w,wrap));
  wireWidgetInputs();
  updateClocks();
}

function buildWidgetEl(w,wrap){
  const el=document.createElement('div');
  const bgVal=wBgCss(w);
  const styleClass='hw-s-'+(w.style||'default');
  el.className='hw '+styleClass;
  el.id='hw-'+w.id;
  const px=(w.x-1)*(WIDGET_CELL+WIDGET_GAP);
  const py=(w.y-1)*(WIDGET_CELL+WIDGET_GAP);
  const pw=w.w*WIDGET_CELL+(w.w-1)*WIDGET_GAP;
  const ph=w.h*WIDGET_CELL+(w.h-1)*WIDGET_GAP;
  let bgStyle=bgVal?`background:${bgVal};`:'';
  // Adjust text color for accent/colored bg
  const lightBg=w.bg&&['accent','green','cyan','pink'].includes(w.bg)||w.bg?.startsWith('#');
  if(bgVal) bgStyle+='--hw-t:#fff;--hw-t2:rgba(255,255,255,.75);--hw-t3:rgba(255,255,255,.45);--hw-bd:rgba(255,255,255,.18);';
  el.style.cssText=`left:${px}px;top:${py}px;width:${pw}px;height:${ph}px;${bgStyle}`;
  const label=w.label||widgetDefaultLabel(w.type);
  el.innerHTML=`
    <div class="hw-hdr">
      <span class="hw-title" id="hwlbl-${w.id}" onclick="startRenameWidget('${w.id}')">${esc(label)}</span>
      <span class="hw-actions">
        <button class="hw-btn" onclick="hwCtxMenu(event,'${w.id}')" title="Options">⋯</button>
      </span>
    </div>
    <div class="hw-body" id="hwb-${w.id}">${renderWidgetBody(w)}</div>
    <div class="hw-resize" onpointerdown="wResizeStart(event,'${w.id}')"></div>`;
  el.querySelector('.hw-hdr').addEventListener('pointerdown',e=>{
    if(e.target.closest('button')||e.target.id?.startsWith('hwlbl')) return;
    wDragStart(e,w.id,el);
  });
  el.addEventListener('contextmenu',e=>{e.preventDefault();hwCtxMenu(e,w.id);});
  wrap.appendChild(el);
}

function widgetDefaultLabel(type){
  const cat=WIDGET_CATALOG.find(c=>c.type===type);
  return cat?cat.icon+' '+cat.name:type;
}

// ── RIGHT-CLICK CONTEXT MENU ──
function hwCtxMenu(e,wid){
  e.stopPropagation?.();
  hideCtx?.();
  const items=wid?[
    {label:'✏️ Rename',    fn:`startRenameWidget('${wid}')`},
    {label:'🎨 Style',     fn:`showWidgetStylePanel('${wid}')`},
    {label:'🖼 Background', fn:`showWidgetBgPanel('${wid}')`},
    {label:'📌 Duplicate', fn:`duplicateWidget('${wid}')`},
    {sep:true},
    {label:'🗑 Remove',    fn:`removeWidget('${wid}')`,danger:true},
  ]:[
    {label:'＋ Add Widget', fn:`showAddWidget()`},
    {label:'📐 Reset Layout', fn:`resetHomeLayout()`},
  ];
  const menu=document.createElement('div');
  menu.className='hw-ctx';
  menu.id='hw-ctx-menu';
  menu.style.cssText=`left:${Math.min(e.clientX,window.innerWidth-160)}px;top:${Math.min(e.clientY,window.innerHeight-200)}px`;
  menu.innerHTML=items.map(it=>it.sep?'<div class="hw-ctx-sep"></div>'
    :`<div class="hw-ctx-item${it.danger?' dng':''}" onclick="${it.fn};removeHwCtx()">${it.label}</div>`).join('');
  document.body.appendChild(menu);
  setTimeout(()=>document.addEventListener('click',removeHwCtx,{once:true}),10);
}
function removeHwCtx(){const m=document.getElementById('hw-ctx-menu');if(m)m.remove();}

// ── STYLE PANEL ──
const WIDGET_STYLES=[
  {id:'default', label:'Default'},
  {id:'card',    label:'Card'},
  {id:'glass',   label:'Glass'},
  {id:'minimal', label:'Minimal'},
  {id:'bold',    label:'Bold'},
];
function showWidgetStylePanel(wid){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w) return;
  showModal(`<h2>🎨 Widget Style</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0">
      ${WIDGET_STYLES.map(s=>`<div class="hw-style-opt${w.style===s.id?' on':''}" onclick="setWidgetStyle('${wid}','${s.id}');closeModal()">
        <div class="hw-style-preview hw-s-${s.id}"></div>
        <div style="font-size:12px;text-align:center;margin-top:4px;color:var(--t2)">${s.label}</div>
      </div>`).join('')}
    </div>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Close</button></div>`);
}
function setWidgetStyle(wid,style){
  const w=A.homeWidgets.find(x=>x.id===wid);
  if(w){w.style=style;saveA();renderWidgets();}
}

// ── BG PANEL ──
function showWidgetBgPanel(wid){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w) return;
  const namedColors=[
    {id:null,label:'Default',css:'var(--bg2)'},
    {id:'accent',label:'Accent',css:'var(--ac)'},
    {id:'green', label:'Green', css:'var(--gr)'},
    {id:'red',   label:'Red',   css:'var(--rd)'},
    {id:'yellow',label:'Yellow',css:'var(--yw)'},
    {id:'cyan',  label:'Cyan',  css:'var(--cy)'},
    {id:'pink',  label:'Pink',  css:'var(--pk)'},
  ];
  showModal(`<h2>🖼 Widget Background</h2>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin:10px 0">
      ${namedColors.map(c=>`<div class="hw-bg-swatch${w.bg===c.id?' on':''}" style="background:${c.css}" onclick="setWidgetBg('${wid}','${c.id}')" title="${c.label}"></div>`).join('')}
      <div class="color-picker-wrap" style="display:inline-flex;align-items:center" title="Custom hex">
        <div class="hw-bg-swatch" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)"></div>
        <input type="color" value="${w.bg&&w.bg.startsWith('#')?w.bg:'#7c6af5'}" onchange="setWidgetBg('${wid}',this.value);closeModal()">
      </div>
    </div>
    <div style="margin-top:12px">
      <label style="font-size:12px;color:var(--t3)">📷 Image (upload)</label><br>
      <input type="file" accept="image/*" style="margin-top:6px;font-size:12px" onchange="setWidgetBgImage('${wid}',this)">
    </div>
    ${w.bgImage?`<button class="bs" style="margin-top:8px" onclick="setWidgetBg('${wid}',null);document.getElementById('hw-${wid}').style.backgroundImage='none';closeModal()">🗑 Remove image</button>`:''}
    <div class="mbtns"><button class="bs" onclick="closeModal()">Close</button></div>`);
}
function setWidgetBg(wid,bg){
  const w=A.homeWidgets.find(x=>x.id===wid);
  if(!w) return;
  w.bg=bg; w.bgImage=null;
  saveA(); renderWidgets();
}
function setWidgetBgImage(wid,input){
  const file=input.files[0];if(!file) return;
  const r=new FileReader();
  r.onload=e=>{
    const w=A.homeWidgets.find(x=>x.id===wid);
    if(w){w.bgImage=e.target.result;w.bg=null;saveA();renderWidgets();}
  };
  r.readAsDataURL(file);
  closeModal();
}

// ── RENAME ──
function startRenameWidget(wid){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w) return;
  const el=document.getElementById('hwlbl-'+wid);if(!el) return;
  const old=el.textContent;
  el.contentEditable='true';el.style.outline='1px solid var(--ac)';el.focus();
  const sel=window.getSelection();sel.selectAllChildren(el);
  function done(){
    el.contentEditable='false';el.style.outline='';
    const nv=el.textContent.trim()||old;
    el.textContent=nv; w.label=nv; saveA();
  }
  el.addEventListener('blur',done,{once:true});
  el.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();el.blur();}});
}

// ── DUPLICATE ──
function duplicateWidget(wid){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w) return;
  const nw=JSON.parse(JSON.stringify(w));
  nw.id='w'+Date.now();nw.x=w.x+1;nw.y=w.y+1;
  A.homeWidgets.push(nw);saveA();renderWidgets();
}

// ── RESET LAYOUT ──
function resetHomeLayout(){
  if(!confirm('Reset widget layout?')) return;
  A.homeWidgets=getDefaultWidgets();saveA();renderWidgets();
}

// ════════ WIDGET BODY RENDERERS ════════
function renderWidgetBody(w){
  try{
    switch(w.type){
      case 'clock':      return wClock(w);
      case 'countdown':  return wCountdown(w);
      case 'tasks':      return wTasks(w);
      case 'nbtasks':    return wNbTasks(w);
      case 'alltasks':   return wAllTasks(w);
      case 'quicknote':  return wQuickNote(w);
      case 'richsnip':   return wRichSnip(w);
      case 'recentpages':return wRecentPages(w);
      case 'bookmarks':  return wBookmarks(w);
      case 'search':     return wSearch(w);
      case 'calendar':   return wCalendar(w);
      case 'journal':    return wJournalWidget(w);
      case 'habittrack': return wHabits(w);
      case 'image':      return wImage(w);
      case 'drawing':    return wDrawing(w);
      case 'embed':      return wEmbed(w);
      case 'progress':   return wProgress(w);
      case 'weather':    return wWeather(w);
      case 'quote':      return wQuote(w);
      default: return `<div style="color:var(--t3);font-size:12px;padding:8px">${w.type}</div>`;
    }
  }catch(err){return `<div style="color:var(--rd);font-size:11px;padding:8px">Error: ${esc(err.message)}</div>`;}
}

// Clock
function wClock(w){
  return `<div class="hw-clock" id="hw-clock-${w.id}"></div>`;
}

// Countdown
function wCountdown(w){
  const target=w.data.target||'';
  const label=w.data.dlabel||'Deadline';
  let body='';
  if(target){
    const ms=new Date(target)-new Date();
    const d=Math.max(0,Math.floor(ms/864e5));
    const h=Math.max(0,Math.floor((ms%864e5)/36e5));
    body=`<div style="text-align:center;padding:8px">
      <div style="font-size:28px;font-weight:700;color:var(--hw-t,var(--t))">${d}<span style="font-size:14px">d</span> ${h}<span style="font-size:14px">h</span></div>
      <div style="font-size:11px;color:var(--hw-t3,var(--t3))">${esc(label)}</div>
    </div>`;
  } else {
    body=`<div style="padding:8px;font-size:12px;color:var(--hw-t3,var(--t3))">
      <input class="hw-fi" placeholder="Label" value="${esc(w.data.dlabel||'')}" oninput="hwSaveData('${w.id}','dlabel',this.value)" style="margin-bottom:4px">
      <input class="hw-fi" type="date" value="${w.data.target||''}" oninput="hwSaveData('${w.id}','target',this.value);renderWidgets()">
    </div>`;
  }
  return body;
}

// Today tasks widget
function wTasks(w){
  const today=new Date().toISOString().slice(0,10);
  const all=Object.values(A.tasks).flat();
  const due=all.filter(t=>!t.done&&(!t.dueDate||t.dueDate<=today));
  if(!due.length) return `<div class="hw-empty">No tasks due today 🎉</div>`;
  return `<div class="hw-tasklist" id="hwtl-${w.id}">
    ${due.slice(0,10).map(t=>`<div class="hw-task" draggable="true">
      <input type="checkbox" ${t.done?'checked':''} onchange="hwToggleTask('${t.id}',this,'${w.id}')">
      <span class="hw-tlabel">${esc(t.text||t.name||'')}</span>
      <button class="hw-del" onclick="hwDeleteTask('${t.id}','${w.id}')">×</button>
    </div>`).join('')}
    <button class="hw-add-task" onclick="showAddTaskModal('')">+ Add</button>
  </div>`;
}

// Notebook tasks widget
function wNbTasks(w){
  const nbId=w.data.nbId||'';
  const nb=A.notebooks.find(n=>n.id===nbId);
  if(!nbId||!nb) return `<div style="padding:8px;font-size:12px;color:var(--hw-t3,var(--t3))">
    <div style="margin-bottom:6px">Choose notebook:</div>
    <select class="hw-fi" onchange="hwSaveData('${w.id}','nbId',this.value);renderWidgets()">
      <option value="">— pick one —</option>
      ${A.notebooks.map(n=>`<option value="${n.id}">${n.icon} ${esc(n.name)}</option>`).join('')}
    </select></div>`;
  const tasks=(A.tasks[nbId]||[]);
  return `<div>
    <div style="font-size:11px;color:var(--hw-t3,var(--t3));padding:2px 6px 4px">${nb.icon} ${esc(nb.name)}</div>
    <div class="hw-tasklist" id="hwtl-${w.id}">
      ${tasks.slice(0,10).map(t=>`<div class="hw-task">
        <input type="checkbox" ${t.done?'checked':''} onchange="hwToggleTask('${t.id}',this,'${w.id}')">
        <span class="hw-tlabel${t.done?' done':''}">${esc(t.text||t.name||'')}</span>
        <button class="hw-del" onclick="hwDeleteTask('${t.id}','${w.id}')">×</button>
      </div>`).join('')||'<div class="hw-empty">No tasks</div>'}
    </div>
    <button class="hw-add-task" onclick="showAddTaskModal('${nbId}')">+ Add</button>
  </div>`;
}

// All tasks across notebooks
function wAllTasks(w){
  const nbs=A.notebooks.filter(nb=>(A.tasks[nb.id]||[]).length);
  const global=A.tasks.global||[];
  if(!nbs.length&&!global.length) return `<div class="hw-empty">No tasks yet</div>`;
  let html='<div style="overflow-y:auto;height:100%;padding:2px">';
  if(global.length){
    html+=`<div class="hw-nb-group"><div class="hw-nb-grp-hdr" onclick="this.nextElementSibling.classList.toggle('hide')">🌐 Global</div>
    <div class="hw-nb-grp-body">${global.slice(0,8).map(t=>`<div class="hw-task">
      <input type="checkbox" ${t.done?'checked':''} onchange="hwToggleTask('${t.id}',this,'')">
      <span class="hw-tlabel${t.done?' done':''}">${esc(t.text||t.name||'')}</span>
    </div>`).join('')}</div></div>`;
  }
  nbs.forEach(nb=>{
    const tasks=(A.tasks[nb.id]||[]).slice(0,8);
    html+=`<div class="hw-nb-group"><div class="hw-nb-grp-hdr" onclick="this.nextElementSibling.classList.toggle('hide')">${nb.icon} ${esc(nb.name)} <span class="hw-badge">${tasks.length}</span></div>
    <div class="hw-nb-grp-body">${tasks.map(t=>`<div class="hw-task">
      <input type="checkbox" ${t.done?'checked':''} onchange="hwToggleTask('${t.id}',this,'${nb.id}')">
      <span class="hw-tlabel${t.done?' done':''}">${esc(t.text||t.name||'')}</span>
    </div>`).join('')}</div></div>`;
  });
  html+='</div>';
  return html;
}

// Quick note
function wQuickNote(w){
  return `<textarea class="hw-note" id="hwn-${w.id}" placeholder="Quick note…">${esc(w.data.text||'')}</textarea>`;
}

// Rich snippet
function wRichSnip(w){
  const content=w.data.html||'<p>Click to edit…</p>';
  return `<div class="hw-rich" id="hwrs-${w.id}" contenteditable="true"
    onblur="hwSaveData('${w.id}','html',this.innerHTML)">${content}</div>`;
}

// Recent pages — grouped by notebook, collapsible
function wRecentPages(w){
  if(!A.notebooks.length) return `<div class="hw-empty">No notebooks yet</div>`;
  const collapsed=w.data.collapsed||{};
  let html='<div class="hw-rpages">';
  A.notebooks.forEach(nb=>{
    const pages=(A.pages[nb.id]||[]).slice().reverse().slice(0,8);
    if(!pages.length) return;
    const isOpen=!collapsed[nb.id];
    html+=`<div class="hw-nb-group">
      <div class="hw-nb-grp-hdr" onclick="hwToggleNbCollapse('${w.id}','${nb.id}')">
        <span>${nb.icon} ${esc(nb.name)}</span>
        <span class="hw-chev${isOpen?'':' closed'}">▾</span>
      </div>
      <div class="hw-nb-grp-body${isOpen?'':' hide'}">
        ${pages.map(p=>`<div class="hw-pagelink" onclick="openPage('${nb.id}','${p.id}')">
          <span class="hw-pg-ic">${{rich:'📝',canvas:'🎨',finite:'🖼',code:'💻',quiz:'❓'}[p.type]||'📄'}</span>
          <span>${esc(p.name)}</span>
        </div>`).join('')}
      </div>
    </div>`;
  });
  html+='</div>';
  return html;
}
function hwToggleNbCollapse(wid,nbId){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w) return;
  if(!w.data.collapsed) w.data.collapsed={};
  w.data.collapsed[nbId]=!w.data.collapsed[nbId];
  saveA();
  // Re-render just the body
  const body=document.getElementById('hwb-'+wid);
  if(body) body.innerHTML=wRecentPages(w);
  // Re-wire clicks
  body?.querySelectorAll('.hw-nb-grp-hdr').forEach(el=>{
    // already inline onclick
  });
}

// Bookmarks launcher
function wBookmarks(w){
  const pins=w.data.pins||[];
  let html='<div class="hw-bookmarks">';
  pins.forEach((pin,i)=>{
    const nb=A.notebooks.find(n=>n.id===pin.nbId);
    const pg=(A.pages[pin.nbId]||[]).find(p=>p.id===pin.pgId);
    if(!nb||!pg) return;
    html+=`<div class="hw-bookmark" onclick="openPage('${pin.nbId}','${pin.pgId}')" title="${esc(pg.name)}">
      <span class="hw-bm-ic">${nb.icon}</span>
      <span class="hw-bm-name">${esc(pg.name)}</span>
      <button class="hw-del" onclick="event.stopPropagation();hwRemovePin('${w.id}',${i})">×</button>
    </div>`;
  });
  html+=`<button class="hw-add-task" onclick="hwAddPin('${w.id}')">+ Pin Page</button></div>`;
  return html;
}
function hwAddPin(wid){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w) return;
  if(!w.data.pins) w.data.pins=[];
  const pages=[];
  A.notebooks.forEach(nb=>(A.pages[nb.id]||[]).forEach(p=>pages.push({nb,p})));
  showModal(`<h2>🚀 Pin a Page</h2>
    <input class="fi" placeholder="Filter…" oninput="this.nextElementSibling.querySelectorAll('.nbch').forEach(e=>{e.style.display=e.textContent.toLowerCase().includes(this.value.toLowerCase())?'':'none'})" style="margin-bottom:8px">
    <div style="max-height:260px;overflow-y:auto">
      ${pages.map(({nb,p})=>`<div class="nbch" onclick="hwDoPin('${wid}','${nb.id}','${p.id}');closeModal()">
        ${nb.icon} <span style="color:var(--t3);font-size:11px">${esc(nb.name)}</span> ${esc(p.name)}
      </div>`).join('')}
    </div>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button></div>`);
}
function hwDoPin(wid,nbId,pgId){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w) return;
  if(!w.data.pins) w.data.pins=[];
  if(!w.data.pins.find(p=>p.pgId===pgId)) w.data.pins.push({nbId,pgId});
  saveA();
  const body=document.getElementById('hwb-'+wid);
  if(body) body.innerHTML=wBookmarks(w);
}
function hwRemovePin(wid,idx){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w||!w.data.pins) return;
  w.data.pins.splice(idx,1);saveA();
  const body=document.getElementById('hwb-'+wid);
  if(body) body.innerHTML=wBookmarks(w);
}

// Search
function wSearch(w){
  return `<div style="padding:8px">
    <input class="hw-fi" placeholder="🔍 Search pages…" oninput="hwSearchPages(this.value,'${w.id}')">
    <div id="hw-sr-${w.id}" style="margin-top:6px;max-height:160px;overflow-y:auto"></div>
  </div>`;
}
function hwSearchPages(q,wid){
  const out=document.getElementById('hw-sr-'+wid);if(!out||!q.trim()) return out&&(out.innerHTML='');
  const results=[];
  A.notebooks.forEach(nb=>(A.pages[nb.id]||[]).forEach(p=>{
    if(p.name.toLowerCase().includes(q.toLowerCase())) results.push({nb,p});
  }));
  out.innerHTML=results.slice(0,8).map(({nb,p})=>`<div class="hw-pagelink" onclick="openPage('${nb.id}','${p.id}')">${nb.icon} ${esc(p.name)}</div>`).join('')
    ||(results.length===0?`<div style="color:var(--hw-t3,var(--t3));font-size:11px">No results</div>`:'');
}

// Calendar
function wCalendar(w){
  const now=new Date();
  const y=now.getFullYear(),m=now.getMonth();
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const first=new Date(y,m,1).getDay();
  const total=new Date(y,m+1,0).getDate();
  const today=now.getDate();
  let cal=`<div class="hw-cal"><div class="hw-cal-hdr">${months[m]} ${y}</div><div class="hw-cal-grid">`;
  ['S','M','T','W','T','F','S'].forEach(d=>cal+=`<div class="hw-cal-dl">${d}</div>`);
  for(let i=0;i<first;i++) cal+=`<div></div>`;
  for(let d=1;d<=total;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasJ=!!A.journalEntries[ds]?.content;
    cal+=`<div class="hw-cal-d${d===today?' tod':''}${hasJ?' hj':''}" onclick="openJournal();setTimeout(()=>selJDay('${ds}'),100)">${d}</div>`;
  }
  return cal+`</div></div>`;
}

// Daily journal widget
function wJournalWidget(w){
  const today=new Date().toISOString().slice(0,10);
  const entry=A.journalEntries[today]||{};
  return `<div style="padding:6px;height:100%;display:flex;flex-direction:column;gap:6px">
    <div style="font-size:11px;color:var(--hw-t3,var(--t3))">${today}</div>
    <textarea class="hw-note" style="flex:1" placeholder="Today's reflection…"
      onblur="hwSaveJournal('${today}','content',this.value)">${esc(entry.content||'')}</textarea>
    <button class="hw-add-task" onclick="openJournal()">Open Journal →</button>
  </div>`;
}
function hwSaveJournal(date,key,val){
  if(!A.journalEntries[date]) A.journalEntries[date]={};
  A.journalEntries[date][key]=val;
  saveA();
}

// Habit tracker
function wHabits(w){
  const today=new Date().toISOString().slice(0,10);
  const entry=A.journalEntries[today]||{};
  const done=entry.habits||[];
  const HABITS=['🏃 Exercise','💧 Water','📚 Read','🧘 Meditate','😴 Sleep','🥗 Eat well'];
  return `<div class="hw-habits">${HABITS.map(h=>`<div class="hw-habit${done.includes(h)?' done':''}" onclick="hwToggleHabit('${today}','${h}',this)">${h}</div>`).join('')}</div>`;
}
function hwToggleHabit(date,habit,el){
  if(!A.journalEntries[date]) A.journalEntries[date]={};
  if(!A.journalEntries[date].habits) A.journalEntries[date].habits=[];
  const h=A.journalEntries[date].habits;
  const i=h.indexOf(habit);
  if(i>-1) h.splice(i,1); else h.push(habit);
  el.classList.toggle('done');
  saveA();
}

// Image
function wImage(w){
  if(w.data.img) return `<img src="${w.data.img}" style="width:100%;height:100%;object-fit:cover;display:block">`;
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px">
    <div style="font-size:28px">🖼</div>
    <label style="font-size:12px;color:var(--hw-t3,var(--t3));cursor:pointer;background:var(--bg3);padding:5px 12px;border-radius:6px">
      Upload image
      <input type="file" accept="image/*" style="display:none" onchange="hwUploadImg('${w.id}',this)">
    </label>
  </div>`;
}
function hwUploadImg(wid,input){
  const file=input.files[0];if(!file) return;
  const r=new FileReader();
  r.onload=e=>{
    const w=A.homeWidgets.find(x=>x.id===wid);
    if(w){w.data.img=e.target.result;saveA();}
    const body=document.getElementById('hwb-'+wid);
    if(body) body.innerHTML=wImage(w);
  };
  r.readAsDataURL(file);
}

// Drawing link
function wDrawing(w){
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px">
    <div style="font-size:28px">🎨</div>
    <button class="hw-add-task" onclick="showAddWidget_canvas()">Open Canvas</button>
  </div>`;
}
function showAddWidget_canvas(){
  const nb=A.notebooks[0];if(!nb){toast('Create a notebook first');return;}
  showAddPage(nb.id);
}

// Embed
function wEmbed(w){
  if(w.data.url) return `<iframe src="${esc(w.data.url)}" style="width:100%;height:100%;border:none;border-radius:0 0 14px 14px" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>`;
  return `<div style="padding:8px">
    <div style="font-size:12px;color:var(--hw-t3,var(--t3));margin-bottom:6px">Paste a URL to embed:</div>
    <input class="hw-fi" placeholder="https://…" onblur="hwSaveData('${w.id}','url',this.value);renderWidgets()">
  </div>`;
}

// Progress
function wProgress(w){
  const val=w.data.val||0,max=w.data.max||100,label=w.data.plabel||'Progress';
  const pct=Math.round(val/max*100);
  return `<div style="padding:10px">
    <div style="font-size:12px;color:var(--hw-t3,var(--t3));margin-bottom:6px">${esc(label)}: <strong>${val}/${max}</strong></div>
    <div style="background:var(--bg3);border-radius:999px;height:10px;overflow:hidden;margin-bottom:8px">
      <div style="background:var(--hw-t,var(--ac));height:100%;width:${pct}%;transition:width .3s;border-radius:999px"></div>
    </div>
    <div style="display:flex;gap:6px">
      <input class="hw-fi" style="flex:1" placeholder="Label" value="${esc(w.data.plabel||'')}" onblur="hwSaveData('${w.id}','plabel',this.value)">
      <input class="hw-fi" style="width:50px" type="number" placeholder="Val" value="${val}" onblur="hwSaveData('${w.id}','val',+this.value);renderWidgets()">
      <input class="hw-fi" style="width:50px" type="number" placeholder="Max" value="${max}" onblur="hwSaveData('${w.id}','max',+this.value);renderWidgets()">
    </div>
  </div>`;
}

// Weather memo
function wWeather(w){
  return `<div style="padding:8px;display:flex;flex-direction:column;gap:6px">
    <input class="hw-fi" placeholder="🌤 Weather note…" value="${esc(w.data.memo||'')}" onblur="hwSaveData('${w.id}','memo',this.value)">
    <div style="display:flex;gap:6px">
      <input class="hw-fi" style="flex:1" type="number" placeholder="°C / °F" value="${w.data.temp||''}" onblur="hwSaveData('${w.id}','temp',this.value)">
      <span style="font-size:22px;line-height:1">${w.data.icon||'🌤'}</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:4px">
      ${['☀️','⛅','🌧','❄️','🌩','🌫','🌤','🌈'].map(ic=>`<span style="cursor:pointer;font-size:16px" onclick="hwSaveData('${w.id}','icon','${ic}');this.parentElement.parentElement.querySelector('span').textContent='${ic}'">${ic}</span>`).join('')}
    </div>
  </div>`;
}

// Quote
function wQuote(w){
  const quotes=[
    {q:'The secret of getting ahead is getting started.',a:'Mark Twain'},
    {q:'It always seems impossible until it\'s done.',a:'Nelson Mandela'},
    {q:'Focus on being productive instead of busy.',a:'Tim Ferriss'},
    {q:'Done is better than perfect.',a:'Sheryl Sandberg'},
    {q:'Small steps every day.',a:'Unknown'},
    {q:'Clarity is the antidote to anxiety.',a:'Unknown'},
  ];
  const q=w.data.custom||null;
  const idx=w.data.qidx||0;
  const display=q?{q:q,a:''}:quotes[idx%quotes.length];
  return `<div style="padding:10px;display:flex;flex-direction:column;height:100%;justify-content:center">
    <div style="font-size:13px;font-style:italic;color:var(--hw-t,var(--t));line-height:1.5;margin-bottom:6px">"${esc(display.q)}"</div>
    ${display.a?`<div style="font-size:11px;color:var(--hw-t3,var(--t3))">— ${esc(display.a)}</div>`:''}
    <div style="display:flex;gap:6px;margin-top:8px">
      <button class="hw-add-task" onclick="hwSaveData('${w.id}','qidx',(${idx}+1)%${quotes.length});renderWidgets()">Next →</button>
      <button class="hw-add-task" onclick="hwEditQuote('${w.id}')">Custom…</button>
    </div>
  </div>`;
}
function hwEditQuote(wid){
  const w=A.homeWidgets.find(x=>x.id===wid);if(!w) return;
  showModal(`<h2>💬 Custom Quote</h2>
    <textarea class="fi" id="cq-inp" rows="3" placeholder="Enter your quote…" style="resize:none">${esc(w.data.custom||'')}</textarea>
    <div class="mbtns">
      <button class="bs" onclick="closeModal()">Cancel</button>
      <button class="bp" onclick="hwSaveData('${wid}','custom',document.getElementById('cq-inp').value);renderWidgets();closeModal()">Save</button>
    </div>`);
}

// ── HELPERS ──
function hwSaveData(wid,key,val){
  const w=A.homeWidgets.find(x=>x.id===wid);
  if(w){if(!w.data)w.data={};w.data[key]=val;clearTimeout(window._hwSave);window._hwSave=setTimeout(saveA,600);}
}
function wireWidgetInputs(){
  (A.homeWidgets||[]).forEach(w=>{
    if(w.type==='quicknote'){
      const ta=document.getElementById('hwn-'+w.id);
      if(ta) ta.addEventListener('input',()=>hwSaveData(w.id,'text',ta.value));
    }
  });
}
function updateClocks(){
  document.querySelectorAll('[id^="hw-clock-"]').forEach(el=>{
    const now=new Date();
    el.innerHTML=`<div class="hw-clock-time">${now.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
      <div class="hw-clock-date">${now.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'})}</div>`;
  });
  if(A.activeView==='home') setTimeout(updateClocks,10000);
}
function hwToggleTask(taskId,cb,wid){
  Object.values(A.tasks).flat().forEach(t=>{if(t.id===taskId){t.done=cb.checked;}});
  saveA();
  const body=document.getElementById('hwb-'+wid);
  const w=A.homeWidgets.find(x=>x.id===wid);
  if(body&&w) body.innerHTML=renderWidgetBody(w);
}
function hwDeleteTask(taskId,wid){
  Object.keys(A.tasks).forEach(k=>{A.tasks[k]=(A.tasks[k]||[]).filter(t=>t.id!==taskId);});
  saveA();
  const body=document.getElementById('hwb-'+wid);
  const w=A.homeWidgets.find(x=>x.id===wid);
  if(body&&w) body.innerHTML=renderWidgetBody(w);
}

// ── ADD WIDGET MODAL ──
function showAddWidget(){
  const cats=[...new Set(WIDGET_CATALOG.map(w=>w.cat))];
  let html=`<h2>Add Widget</h2>`;
  cats.forEach(cat=>{
    const items=WIDGET_CATALOG.filter(w=>w.cat===cat);
    html+=`<div class="hw-cat-lbl">${cat}</div><div class="tgrid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px">
      ${items.map(t=>`<div class="tcard" onclick="addWidget('${t.type}');closeModal()">
        <div style="font-size:22px;margin-bottom:4px">${t.icon}</div>
        <h3>${t.name}</h3><p>${t.desc}</p>
      </div>`).join('')}
    </div>`;
  });
  html+=`<div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button></div>`;
  showModal(html);
}

function addWidget(type){
  if(!A.homeWidgets) A.homeWidgets=[];
  const cat=WIDGET_CATALOG.find(c=>c.type===type)||{w:3,h:3};
  const id='w'+Date.now();
  A.homeWidgets.push({id,type,label:widgetDefaultLabel(type),x:2,y:2,w:cat.w,h:cat.h,
    style:'default',bg:null,bgImage:null,data:{}});
  saveA();renderWidgets();
}

function removeWidget(id){
  A.homeWidgets=(A.homeWidgets||[]).filter(w=>w.id!==id);
  saveA();renderWidgets();
}

// ── DRAG & RESIZE ──
function wDragStart(e,id,el){
  e.preventDefault();
  const rect=el.getBoundingClientRect();
  const offX=e.clientX-rect.left,offY=e.clientY-rect.top;
  el.style.opacity='.75';el.style.zIndex='999';el.style.transition='none';
  function onMove(ev){
    const wrap=document.getElementById('home-widgets');
    const wr=wrap.getBoundingClientRect();
    el.style.left=Math.max(0,ev.clientX-wr.left-offX)+'px';
    el.style.top=Math.max(0,ev.clientY-wr.top-offY)+'px';
  }
  function onUp(ev){
    el.style.opacity='';el.style.zIndex='';el.style.transition='';
    const w=A.homeWidgets.find(w=>w.id===id);
    if(w){
      const wrap=document.getElementById('home-widgets');
      const wr=wrap.getBoundingClientRect();
      w.x=Math.max(1,Math.round((ev.clientX-wr.left-offX)/(WIDGET_CELL+WIDGET_GAP))+1);
      w.y=Math.max(1,Math.round((ev.clientY-wr.top-offY)/(WIDGET_CELL+WIDGET_GAP))+1);
      saveA();renderWidgets();
    }
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
  }
  document.addEventListener('pointermove',onMove);
  document.addEventListener('pointerup',onUp);
}

function wResizeStart(e,id){
  e.preventDefault();e.stopPropagation();
  const sx=e.clientX,sy=e.clientY;
  const w=A.homeWidgets.find(w=>w.id===id);if(!w) return;
  const sw=w.w,sh=w.h;
  function onMove(ev){
    const dx=ev.clientX-sx,dy=ev.clientY-sy;
    w.w=Math.max(2,sw+Math.round(dx/(WIDGET_CELL+WIDGET_GAP)));
    w.h=Math.max(1,sh+Math.round(dy/(WIDGET_CELL+WIDGET_GAP)));
    const el=document.getElementById('hw-'+id);
    if(el){
      el.style.width=(w.w*WIDGET_CELL+(w.w-1)*WIDGET_GAP)+'px';
      el.style.height=(w.h*WIDGET_CELL+(w.h-1)*WIDGET_GAP)+'px';
    }
  }
  function onUp(){saveA();renderWidgets();
    document.removeEventListener('pointermove',onMove);
    document.removeEventListener('pointerup',onUp);
  }
  document.addEventListener('pointermove',onMove);
  document.addEventListener('pointerup',onUp);
}

