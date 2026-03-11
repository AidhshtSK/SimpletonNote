// ═══════════════════════════════════════════
// TASKS (COMPACT, with Add Task GUI modal)
// ═══════════════════════════════════════════
let _tkView='list'; // 'list' or 'cal'
let _tkCal={y:new Date().getFullYear(),m:new Date().getMonth()};

function openTasks(nbId){
  A.activeView='tasks';A.activeNotebook=nbId||A.activeNotebook;
  const nb=nbId?A.notebooks.find(n=>n.id===nbId):null;
  document.getElementById('tbtit').innerHTML=nb?`${nb.icon} <strong>${esc(nb.name)}</strong> Tasks`:'<strong>All Tasks</strong>';
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('exp-btn').style.display='none';
  renderTasks(nbId);
}

function renderTasks(nbId){
  document.getElementById('con').innerHTML=`<div id="tkw">
    <div class="tk-hdr">
      <span class="tk-tit">${nbId?(A.notebooks.find(n=>n.id===nbId)?.name||'Tasks'):'All Tasks'}</span>
      <button class="vbtn${_tkView==='list'?' on':''}" onclick="_tkView='list';renderTasks('${nbId||''}')">☰ List</button>
      <button class="vbtn${_tkView==='cal'?' on':''}" onclick="_tkView='cal';renderTasks('${nbId||''}')">📅 Cal</button>
      <button class="ib" onclick="showAddTaskModal('${nbId||''}')" style="color:var(--ac2)">+ Task</button>
    </div>
    <div id="tk-content" style="flex:1;overflow:hidden;display:flex;flex-direction:column"></div>
  </div>`;
  if(_tkView==='list') renderTkList(nbId);
  else renderTkCal(nbId);
}

function showAddTaskModal(nbId, presetPageId){
  const presetPage=presetPageId?A.notebooks.map(n=>(A.pages[n.id]||[]).find(p=>p.id===presetPageId)?n:null).find(Boolean):null;
  const presetPageVal=presetPageId&&presetPage?`${presetPage.id}:${presetPageId}`:'';
  const todayStr=new Date().toISOString().slice(0,10);
  showModal(`<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <div style="font-size:28px">✅</div>
      <div><h2 style="margin:0">New Task</h2><p style="color:var(--t3);font-size:12px;margin:0">for ${nbId?(A.notebooks.find(n=>n.id===nbId)?.name||'notebook'):'all notebooks'}</p></div>
    </div>
    <div class="task-modal-form">
      <input class="fi" id="tk-name" placeholder="What needs to get done?" autofocus style="font-size:16px;padding:12px 14px">
      <div class="date-row" style="margin-top:10px">
        <label style="font-size:12px;color:var(--t3);margin-bottom:4px;display:block">📅 Due date (optional)</label>
        <input class="fi" id="tk-date" type="date" style="width:auto">
      </div>
      <div class="date-row" style="margin-top:8px">
        <label style="font-size:12px;color:var(--t3);margin-bottom:4px;display:block">🔗 Link to page (optional)</label>
        <select class="fi" id="tk-page" style="width:100%">
          <option value="">— No page link —</option>
          ${A.notebooks.map(n=>(A.pages[n.id]||[]).map(p=>`<option value="${n.id}:${p.id}"${(n.id+':'+p.id)===presetPageVal?' selected':''}>${n.icon} ${esc(p.name)}</option>`).join('')).join('')}
        </select>
      </div>
    </div>
    <div class="mbtns" style="margin-top:16px">
      <button class="bs" onclick="closeModal()">Cancel</button>
      <button class="bp" onclick="doAddTask('${nbId||''}')">✅ Add Task</button>
    </div>`);
  setTimeout(()=>document.getElementById('tk-name')?.focus(),50);
  document.getElementById('tk-name')?.addEventListener('keydown',e=>{if(e.key==='Enter') doAddTask(nbId||'');});
}

function doAddTask(nbId){
  const name=document.getElementById('tk-name')?.value.trim();
  if(!name){toast('Enter a task name');return;}
  const dueStr=document.getElementById('tk-date')?.value||'';
  const pageLinkRaw=document.getElementById('tk-page')?.value||'';
  const [plNb,plPg]=pageLinkRaw.split(':');
  const task={id:'tk'+Date.now(),name,done:false,dueDate:dueStr,pageLink:plPg||'',pageLinkNb:plNb||'',nb:nbId||A.activeNotebook||''};
  const key=nbId||'global';
  if(!A.tasks[key]) A.tasks[key]=[];
  A.tasks[key].push(task);
  saveA();closeModal();renderTasks(nbId);
}

function getAllTasks(nbId){
  if(nbId) return A.tasks[nbId]||[];
  return Object.values(A.tasks).flat();
}

let _tkDragId=null,_tkDragNb=null;
function renderTkList(nbId){
  const body=document.getElementById('tk-content');
  const tasks=getAllTasks(nbId);
  if(!tasks.length){
    body.innerHTML=`<div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:var(--t3);padding:20px">
      <div style="font-size:32px">✅</div><p>No tasks yet</p>
      <button class="add-tk" onclick="showAddTaskModal('${nbId||''}')" style="width:auto">+ Add Task</button></div>`;
    return;
  }
  const now=new Date();now.setHours(0,0,0,0);
  const today=now.toISOString().slice(0,10);
  const groups={overdue:[],today:[],upcoming:[],someday:[]};
  tasks.forEach(t=>{
    if(!t.dueDate) groups.someday.push(t);
    else if(t.dueDate<today) groups.overdue.push(t);
    else if(t.dueDate===today) groups.today.push(t);
    else groups.upcoming.push(t);
  });
  let html='<div class="tk-body">';
  const groupLabels={overdue:'⚠️ Overdue',today:'📅 Today',upcoming:'🗓 Upcoming',someday:'📌 No Date'};
  Object.entries(groups).forEach(([key,tks])=>{
    if(!tks.length) return;
    html+=`<div class="tkg"><div class="tkg-lbl">${groupLabels[key]}</div>`;
    tks.forEach(t=>{
      const overdue=t.dueDate&&t.dueDate<today&&!t.done;
      html+=`<div class="tki${t.done?' done':''}" id="tki_${t.id}" draggable="true"
        ondragstart="_tkDragId='${t.id}';_tkDragNb='${nbId||''}';event.currentTarget.style.opacity='.45'"
        ondragend="event.currentTarget.style.opacity='';_tkDragId=null"
        ondragover="event.preventDefault();event.currentTarget.classList.add('tk-drop-over')"
        ondragleave="event.currentTarget.classList.remove('tk-drop-over')"
        ondrop="event.currentTarget.classList.remove('tk-drop-over');tkReorder('${t.id}','${nbId||''}')">
        <span class="tk-grip">⠿</span>
        <input type="checkbox" class="tcbx" ${t.done?'checked':''} onchange="toggleTk('${t.id}','${nbId||''}',this)">
        <div class="tcon">
          <span class="ttxt" contenteditable="true" onblur="renameTk('${t.id}','${nbId||''}',this.textContent)">${esc(t.name)}</span>
          <div class="tmeta">
            ${t.dueDate?`<span class="tbadge ${overdue?'ov':'ok'}">${t.dueDate}</span>`:''}
            ${t.pageLink?`<span class="tplink" onclick="openPage('${t.pageLinkNb||''}','${t.pageLink}')">↗ ${esc((A.pages[t.pageLinkNb]||[]).find(p=>p.id===t.pageLink)?.name||'page')}</span>`:''}
          </div>
        </div>
        <button class="ib" style="font-size:11px;color:var(--t3)" onclick="deleteTk('${t.id}','${nbId||''}')">✕</button>
      </div>`;
    });
    html+='</div>';
  });
  html+=`<button class="add-tk" onclick="showAddTaskModal('${nbId||''}')">+ Add Task</button></div>`;
  body.innerHTML=html;
}

function toggleTk(id,nbId,el){
  const task=findTask(id,nbId);
  if(task) task.done=el.checked;
  saveA();renderTkList(nbId);
}
function renameTk(id,nbId,name){
  const task=findTask(id,nbId);
  if(task) task.name=name.trim();
  saveA();
}
function deleteTk(id,nbId){
  const key=nbId||'global';
  if(A.tasks[key]) A.tasks[key]=A.tasks[key].filter(t=>t.id!==id);
  if(!nbId) Object.keys(A.tasks).forEach(k=>{A.tasks[k]=(A.tasks[k]||[]).filter(t=>t.id!==id);});
  saveA();renderTkList(nbId);
}
function findTask(id,nbId){
  const key=nbId||'global';
  let t=(A.tasks[key]||[]).find(x=>x.id===id);
  if(!t) t=Object.values(A.tasks).flat().find(x=>x.id===id);
  return t;
}
function tkReorder(targetId,nbId){
  if(!_tkDragId||_tkDragId===targetId) return;
  const key=nbId||'global';
  const arr=A.tasks[key];
  if(!arr) return;
  const fi=arr.findIndex(t=>t.id===_tkDragId);
  const ti=arr.findIndex(t=>t.id===targetId);
  if(fi<0||ti<0) return;
  const [item]=arr.splice(fi,1);
  arr.splice(ti,0,item);
  saveA();renderTkList(nbId);
}

// ── TASK CALENDAR ──
function renderTkCal(nbId){
  const body=document.getElementById('tk-content');
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fullMonths=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days=['Su','Mo','Tu','We','Th','Fr','Sa'];
  const {y,m}=_tkCal;
  const first=new Date(y,m,1).getDay();
  const total=new Date(y,m+1,0).getDate();
  const tasks=getAllTasks(nbId);
  const tasksByDate={};
  tasks.forEach(t=>{if(t.dueDate){if(!tasksByDate[t.dueDate]) tasksByDate[t.dueDate]=[];tasksByDate[t.dueDate].push(t);}});
  const today=new Date().toISOString().slice(0,10);
  let html=`<div id="tkcal" style="overflow-y:auto;padding:10px 16px">
    <div class="tcnav">
      <button onclick="_tkCal.m--;if(_tkCal.m<0){_tkCal.m=11;_tkCal.y--}renderTkCal('${nbId||''}')">‹</button>
      <span class="tctit">${fullMonths[m]} ${y}</span>
      <button onclick="_tkCal.m++;if(_tkCal.m&gt;11){_tkCal.m=0;_tkCal.y++}renderTkCal('${nbId||''}')">›</button>
      <button onclick="showAddTaskModal('${nbId||''}')">+ Task</button>
    </div>
    <div class="tcgrid">${days.map(d=>`<div class="tcdl">${d}</div>`).join('')}`;
  for(let i=0;i<first;i++) html+=`<div class="tcd emp-d"></div>`;
  for(let d=1;d<=total;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dtasks=tasksByDate[ds]||[];
    const isToday=ds===today;
    html+=`<div class="tcd${isToday?' tod':''}">
      <div class="tcdn">${d}</div>
      ${dtasks.slice(0,3).map(t=>`<div class="tcc${t.done?' done':''}" title="${esc(t.name)}" onclick="quickTkEdit('${t.id}','${nbId||''}')">${esc(t.name.slice(0,12))}${t.name.length>12?'…':''}</div>`).join('')}
      ${dtasks.length>3?`<div style="font-size:8px;color:var(--t3)">+${dtasks.length-3}</div>`:''}
    </div>`;
  }
  html+='</div></div>';
  body.innerHTML=html;
}

function quickTkEdit(id,nbId){
  const t=findTask(id,nbId);
  if(!t) return;
  showModal(`<h2>Edit Task</h2>
    <div class="task-modal-form">
      <input class="fi" id="etk-name" value="${esc(t.name)}">
      <div class="date-row"><label>Due:</label><input class="fi" id="etk-date" type="date" value="${t.dueDate||''}"></div>
    </div>
    <div class="mbtns">
      <button class="bs dng" onclick="deleteTk('${id}','${nbId}');closeModal()">Delete</button>
      <button class="bs" onclick="closeModal()">Cancel</button>
      <button class="bp" onclick="saveQuickTk('${id}','${nbId}')">Save</button>
    </div>`);
}
function saveQuickTk(id,nbId){
  const t=findTask(id,nbId);
  if(t){t.name=document.getElementById('etk-name').value.trim();t.dueDate=document.getElementById('etk-date').value||'';}
  saveA();closeModal();renderTasks(nbId||'');
}


