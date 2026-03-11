// ═══════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════
function renderSB(){
  const body=document.getElementById('sbbody');
  if(!body) return;
  const pid=A.currentProject;
  // Update project button
  const proj=A.projects.find(p=>p.id===pid)||A.projects[0];
  if(proj){
    const pic=document.getElementById('pico');
    const pname=document.getElementById('pname');
    if(pic) pic.textContent=proj.icon;
    if(pname) pname.textContent=proj.name;
  }
  let html='';
  // Favorites
  const favPgs=(A.favorites.pages||[]).map(id=>{
    const nb=A.notebooks.find(n=>(A.pages[n.id]||[]).some(p=>p.id===id));
    if(!nb) return null;
    const pg=(A.pages[nb.id]||[]).find(p=>p.id===id);
    if(!pg) return null;
    return {pg,nb};
  }).filter(Boolean);
  if(favPgs.length){
    html+=`<div class="sb-sec"><span class="sb-sec-lbl">★ Favorites</span></div>`;
    favPgs.forEach(({pg,nb})=>{
      const ic={rich:'📝',canvas:'🎨',finite:'🖼',code:'💻',quiz:'❓'}[pg.type]||'📄';
      html+=`<div class="pi${A.activePage===pg.id?' on':''}" onclick="openPage('${nb.id}','${pg.id}')" data-pgid="${pg.id}">
        <span class="pic">${ic}</span><span class="piname">${esc(pg.name)}</span>
        <button class="fav-btn on" onclick="event.stopPropagation();toggleFav('page','${pg.id}')">★</button>
      </div>`;
    });
    html+=`<div class="sbdiv"></div>`;
  }
  // Special nav
  html+=`<div class="sb-nav${A.activeView==='journal'?' on':''}" onclick="openJournal()"><span class="nic">📅</span> Daily Journal</div>`;
  html+=`<div class="sbdiv"></div>`;
  // Notebooks header
  html+=`<div class="sb-sec"><span class="sb-sec-lbl">Notebooks</span><button class="sb-sec-add" onclick="showAddNB()" title="New Notebook">+</button></div>`;
  // Filter by project and tag
  const nbs=A.notebooks.filter(nb=>nb.project===pid||!nb.project);
  nbs.forEach(nb=>{
    const isOpen=A.activeNotebook===nb.id||(A._nbOpen&&A._nbOpen[nb.id]);
    const pages=(A.pages[nb.id]||[]).filter(p=>{
      if(!A.activeTagFilter) return true;
      return (A.pageTags[p.id]||[]).includes(A.activeTagFilter);
    });
    const isFav=(A.favorites.notebooks||[]).includes(nb.id);
    html+=`<div class="nbw" draggable="true" data-nbid="${nb.id}"
      ondragstart="nbDragStart(event,'${nb.id}')" ondragover="nbDragOver(event,this)"
      ondrop="nbDrop(event,'${nb.id}')" ondragleave="this.classList.remove('drag-over')">
      <div class="nbh${A.activeNotebook===nb.id?' on':''}" onclick="selNB('${nb.id}')"
        oncontextmenu="nbCtx(event,'${nb.id}')">
        <span class="nbic">${nb.icon}</span>
        <span class="nbn">${esc(nb.name)}</span>
        <button class="fav-btn${isFav?' on':''}" onclick="event.stopPropagation();toggleFav('notebook','${nb.id}')">${isFav?'★':'☆'}</button>
        <span class="nbchev${isOpen?' o':''}">▶</span>
        <button class="nbadd" onclick="event.stopPropagation();showAddPage('${nb.id}')">+</button>
      </div>
      <div class="nb-pgs${isOpen?' o':''}">`;
    pages.forEach(p=>{
      const ic={rich:'📝',canvas:'🎨',finite:'🖼',code:'💻',quiz:'❓'}[p.type]||'📄';
      const tagClr=getPageTagColor(p.id);
      const isFavP=(A.favorites.pages||[]).includes(p.id);
      html+=`<div class="pi${A.activePage===p.id?' on':''}" onclick="openPage('${nb.id}','${p.id}')"
        oncontextmenu="pgCtx(event,'${nb.id}','${p.id}')" draggable="true"
        data-pgid="${p.id}" data-nbid="${nb.id}"
        ondragstart="pgDragStart(event,'${nb.id}','${p.id}')"
        ondragover="event.preventDefault();this.classList.add('drag-over')"
        ondragleave="this.classList.remove('drag-over')"
        ondrop="pgDrop(event,'${nb.id}')">
        <span class="pic">${ic}</span>
        <span class="piname">${esc(p.name)}</span>
        ${tagClr?`<div class="tdot" style="background:${tagClr}"></div>`:''}
        <button class="fav-btn${isFavP?' on':''}" onclick="event.stopPropagation();toggleFav('page','${p.id}')">${isFavP?'★':'☆'}</button>
      </div>`;
    });
    html+=`</div></div>`;
  });
  body.innerHTML=html;
  renderTagFilters();
}

function toggleSB(){
  document.getElementById('sb').classList.toggle('hide');
}

function selNB(id){
  if(A.activeNotebook===id){
    A._nbOpen=A._nbOpen||{};
    A._nbOpen[id]=!A._nbOpen[id];
  } else {
    A.activeNotebook=id;
    A._nbOpen=A._nbOpen||{};
    A._nbOpen[id]=true;
  }
  renderSB();
}

// ═══════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════
function togglePDD(){
  const dd=document.getElementById('pdd');
  dd.classList.toggle('open');
  if(dd.classList.contains('open')) renderPDD();
}
document.addEventListener('click',e=>{
  if(!e.target.closest('.pbar')) document.getElementById('pdd')?.classList.remove('open');
  if(!e.target.closest('.sb-srch')) hideSrch();
  if(!e.target.closest('#ctx')) hideCtx();
});
function renderPDD(){
  const dd=document.getElementById('pdd');
  dd.innerHTML=A.projects.map(p=>`<div class="popt${p.id===A.currentProject?' cur':''}" onclick="selProj('${p.id}')">${p.icon} ${esc(p.name)}</div>`).join('')
    +`<div style="height:1px;background:var(--bd);margin:3px 0"></div>
      <button class="new-proj" onclick="showNewProj()">+ New Project</button>`;
}
function selProj(id){
  A.currentProject=id;
  document.getElementById('pdd').classList.remove('open');
  renderSB();
}
function showNewProj(){
  document.getElementById('pdd').classList.remove('open');
  showModal(`<h2>New Project</h2><div class="nbf">
    <input class="fi" id="pni" placeholder="Project name…">
    <div class="epick" id="pep">${['📁','🚀','💡','🎨','📚','🧪','💼','🌱','⭐','🔥'].map(e=>`<div class="eo" onclick="selEmoji('pep','${e}',this)">${e}</div>`).join('')}</div>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button><button class="bp" onclick="createProj()">Create</button></div>
  </div>`);
  window._newProjEmoji='📁';
}
function createProj(){
  const n=document.getElementById('pni').value.trim();
  if(!n){toast('Enter a name');return;}
  const p={id:'proj'+Date.now(),name:n,icon:window._newProjEmoji||'📁'};
  A.projects.push(p);
  A.currentProject=p.id;
  saveA();
  closeModal();
  renderSB();
}

// ═══════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════
let _srchTimer=null;
function doSearch(q){
  clearTimeout(_srchTimer);
  if(!q.trim()){hideSrch();return;}
  _srchTimer=setTimeout(()=>runSearch(q),160);
}
function runSearch(q){
  const dd=document.getElementById('srchdd');
  const ql=q.toLowerCase();
  const res=[];
  A.notebooks.forEach(nb=>{
    if(nb.name.toLowerCase().includes(ql)) res.push({type:'nb',id:nb.id,nbId:nb.id,label:nb.icon+' '+nb.name,sub:'Notebook'});
    (A.pages[nb.id]||[]).forEach(p=>{
      if(p.name.toLowerCase().includes(ql)||stripHtml(p.content||'').toLowerCase().includes(ql)){
        res.push({type:'pg',id:p.id,nbId:nb.id,label:p.name,sub:nb.name});
      }
    });
  });
  if(!res.length){dd.innerHTML=`<div style="padding:9px 11px;font-size:12px;color:var(--t3)">No results</div>`;dd.style.display='block';return;}
  dd.innerHTML=res.slice(0,10).map(r=>`<div class="sr" onclick="srchGo('${r.nbId}','${r.id}','${r.type}')">
    <div class="srt">${esc(r.label)}</div><div class="srs">${esc(r.sub)}</div></div>`).join('');
  dd.style.display='block';
}
function hideSrch(){document.getElementById('srchdd').style.display='none';}
function srchGo(nbId,id,type){
  hideSrch();
  document.getElementById('si').value='';
  if(type==='pg') openPage(nbId,id);
  else selNB(nbId);
}

// ═══════════════════════════════════════════
// TAGS
// ═══════════════════════════════════════════
const TAG_COLORS=['#7c6af5','#4ade80','#f87171','#fbbf24','#22d3ee','#f472b6','#fb923c','#60a5fa','#a78bfa','#34d399'];
function getTagColor(name){
  if(A.tags[name]) return A.tags[name];
  const c=TAG_COLORS[Object.keys(A.tags).length%TAG_COLORS.length];
  A.tags[name]=c; saveA(); return c;
}
function getPageTagColor(pgId){
  const tgs=A.pageTags[pgId]||[];
  if(!tgs.length) return null;
  return getTagColor(tgs[0]);
}
function renderTagFilters(){
  const bar=document.getElementById('tagfbar');
  if(!bar) return;
  const allTags=Object.keys(A.tags);
  if(!allTags.length){bar.style.display='none';return;}
  bar.style.display='flex';
  bar.innerHTML=`<div class="tfc${!A.activeTagFilter?' on':''}" onclick="setTagFilter(null)">All</div>`
    +allTags.map(t=>`<div class="tfc${A.activeTagFilter===t?' on':''}" style="${A.activeTagFilter===t?'background:'+A.tags[t]+';border-color:'+A.tags[t]:''}" onclick="setTagFilter('${esc(t)}')">${esc(t)}</div>`).join('');
}
function setTagFilter(t){A.activeTagFilter=t;renderSB();}
function addPageTag(pgId){
  showModal(`<h2>Add Tag</h2>
    <input class="fi" id="tni" placeholder="Tag name…" style="margin-bottom:8px">
    ${Object.keys(A.tags).length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">${Object.keys(A.tags).map(t=>`<div onclick="quickTag('${pgId}','${esc(t)}')" style="padding:3px 9px;border-radius:9px;background:${A.tags[t]};color:#000;font-size:12px;cursor:pointer;opacity:.85;font-weight:600">${esc(t)}</div>`).join('')}</div>`:''}
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button><button class="bp" onclick="doAddTag('${pgId}')">Add</button></div>`);
}
function quickTag(pgId,t){
  if(!(A.pageTags[pgId]||[]).includes(t)){A.pageTags[pgId]=(A.pageTags[pgId]||[]);A.pageTags[pgId].push(t);}
  saveA();closeModal();renderSB();renderTagBar(pgId);
}
function doAddTag(pgId){
  const n=document.getElementById('tni').value.trim();
  if(!n){toast('Enter a tag name');return;}
  getTagColor(n);
  if(!(A.pageTags[pgId]||[]).includes(n)){A.pageTags[pgId]=(A.pageTags[pgId]||[]);A.pageTags[pgId].push(n);}
  saveA();closeModal();renderSB();renderTagBar(pgId);
}
function rmPageTag(pgId,t){
  A.pageTags[pgId]=(A.pageTags[pgId]||[]).filter(x=>x!==t);
  saveA();renderSB();renderTagBar(pgId);
}
function renderTagBar(pgId){
  const bar=document.getElementById('tagbar');
  if(!bar) return;
  const tags=A.pageTags[pgId]||[];
  bar.innerHTML=tags.map(t=>`<span class="tag-chip" style="background:${getTagColor(t)}22;border-color:${getTagColor(t)};color:${getTagColor(t)}">${esc(t)}<span class="tag-x" onclick="rmPageTag('${pgId}','${esc(t)}')">✕</span></span>`).join('')
    +`<span class="tag-add" onclick="addPageTag('${pgId}')">+ tag</span>`;
}

// ═══════════════════════════════════════════
// FAVORITES / TRASH
// ═══════════════════════════════════════════
function toggleFav(type,id){
  const arr=type==='page'?A.favorites.pages:A.favorites.notebooks;
  const i=arr.indexOf(id);
  if(i>-1) arr.splice(i,1); else arr.push(id);
  saveA();renderSB();
}
function isFav(type,id){return (type==='page'?A.favorites.pages:A.favorites.notebooks).includes(id);}

function moveToTrash(type,origId,name,data,parentId){
  A.trash.unshift({type,origId,name,data,parentId,ts:Date.now()});
  saveA();
}
function openTrash(){
  A.activeView='trash';
  document.getElementById('tbtit').innerHTML='<strong>🗑 Trash</strong>';
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('exp-btn').style.display='none';
  if(!A.trash.length){
    document.getElementById('con').innerHTML=`<div class="welcome"><div style="font-size:40px">🗑</div><h2>Trash is empty</h2></div>`;
    return;
  }
  document.getElementById('con').innerHTML=`<div style="padding:20px;max-width:600px;margin:0 auto;overflow-y:auto;height:100%">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <h2 style="font-family:'Instrument Serif',serif;font-size:22px;font-style:italic;color:var(--t)">Trash</h2>
      <button class="sbtn dng" onclick="emptyTrash()">Empty All</button>
    </div>
    <div id="trashlist">${A.trash.map((i,idx)=>`<div class="trash-i">
      <div style="flex:1"><div style="font-size:13px;color:var(--t)">${esc(i.name)}</div>
      <div style="font-size:11px;color:var(--t3)">${i.type} · ${new Date(i.ts).toLocaleDateString()}</div></div>
      <button class="rbtn" onclick="restoreT(${idx})">Restore</button>
      <button class="dbtn" onclick="permDel(${idx})">Delete</button>
    </div>`).join('')}</div>
  </div>`;
}
function restoreT(idx){
  const item=A.trash[idx];
  if(!item) return;
  if(item.type==='page'){
    const nb=A.notebooks.find(n=>n.id===item.parentId)||A.notebooks[0];
    if(nb){ if(!A.pages[nb.id]) A.pages[nb.id]=[]; A.pages[nb.id].push(item.data); }
  } else if(item.type==='notebook'){
    A.notebooks.push(item.data);
    if(item.data.pgs) A.pages[item.data.id]=item.data.pgs;
  }
  A.trash.splice(idx,1);
  saveA();renderSB();openTrash();
}
function permDel(idx){A.trash.splice(idx,1);saveA();openTrash();}
function emptyTrash(){A.trash=[];saveA();openTrash();}

// ═══════════════════════════════════════════
// DRAG & DROP (notebooks + pages)
// ═══════════════════════════════════════════
let _dragNb=null,_dragPg=null,_dragPgNb=null;
function nbDragStart(e,id){_dragNb=id;e.dataTransfer.effectAllowed='move';}
function nbDragOver(e,el){e.preventDefault();el.classList.add('drag-over');}
function nbDrop(e,toId){
  e.preventDefault();
  document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
  if(_dragPg&&_dragPgNb&&toId!==_dragPgNb){
    // Move page to different notebook
    const pages=A.pages[_dragPgNb]||[];
    const pi=pages.findIndex(p=>p.id===_dragPg);
    if(pi>-1){
      const [pg]=pages.splice(pi,1);
      if(!A.pages[toId]) A.pages[toId]=[];
      A.pages[toId].push(pg);
      saveA();renderSB();
    }
  } else if(_dragNb&&_dragNb!==toId){
    const nbs=A.notebooks;
    const fi=nbs.findIndex(n=>n.id===_dragNb);
    const ti=nbs.findIndex(n=>n.id===toId);
    if(fi>-1&&ti>-1){const [n]=nbs.splice(fi,1);nbs.splice(ti,0,n);saveA();renderSB();}
  }
  _dragNb=null;_dragPg=null;_dragPgNb=null;
}
function pgDragStart(e,nbId,pgId){_dragPg=pgId;_dragPgNb=nbId;e.dataTransfer.effectAllowed='move';}
function pgDrop(e,toNbId){
  e.preventDefault();
  document.querySelectorAll('.drag-over').forEach(el=>el.classList.remove('drag-over'));
  if(!_dragPg) return;
  if(_dragPgNb===toNbId){
    // Reorder within same notebook
    const pages=A.pages[toNbId]||[];
    const fi=pages.findIndex(p=>p.id===_dragPg);
    const target=e.currentTarget?.dataset?.pgid;
    const ti=target?pages.findIndex(p=>p.id===target):-1;
    if(fi>-1&&ti>-1&&fi!==ti){const [p]=pages.splice(fi,1);pages.splice(ti,0,p);saveA();renderSB();}
  }
  _dragPg=null;_dragPgNb=null;
}

// ═══════════════════════════════════════════
// CONTEXT MENUS
// ═══════════════════════════════════════════
let _ctxTimer=null;
function showCtx(x,y,items){
  const ctx=document.getElementById('ctx');
  ctx.innerHTML=items.map(it=>it==='---'?'<div class="cx-sep"></div>'
    :`<div class="cx${it.cls?' '+it.cls:''}" onclick="this.closest('#ctx').style.display='none';(${it.fn})()">${it.icon||''} ${it.label}</div>`).join('');
  ctx.style.cssText=`display:block;left:${Math.min(x,window.innerWidth-200)}px;top:${Math.min(y,window.innerHeight-300)}px`;
}
function hideCtx(){document.getElementById('ctx').style.display='none';}
function nbCtx(e,nbId){
  e.preventDefault();e.stopPropagation();
  showCtx(e.clientX,e.clientY,[
    {icon:'✏️',label:'Rename',fn:`renameNB('${nbId}')`},
    {icon:'📋',label:'Add Page',fn:`showAddPage('${nbId}')`},
    {icon:'📌',label:isFav('notebook',nbId)?'Unfavorite':'Favorite',fn:`toggleFav('notebook','${nbId}')`},
    '---',
    {icon:'🗑',label:'Delete',cls:'dng',fn:`deleteNB('${nbId}')`}
  ]);
}
function pgCtx(e,nbId,pgId){
  e.preventDefault();e.stopPropagation();
  const pg=(A.pages[nbId]||[]).find(p=>p.id===pgId);
  showCtx(e.clientX,e.clientY,[
    {icon:'✏️',label:'Rename',fn:`renamePG('${nbId}','${pgId}')`},
    {icon:'📋',label:'Duplicate',fn:`dupPG('${nbId}','${pgId}')`},
    {icon:'🏷',label:'Tags',fn:`addPageTag('${pgId}')`},
    {icon:'📌',label:isFav('page',pgId)?'Unfavorite':'Favorite',fn:`toggleFav('page','${pgId}')`},
    {icon:'↗',label:'Move/Copy',fn:`showMovePg('${nbId}','${pgId}')`},
    '---',
    {icon:'🗑',label:'Delete',cls:'dng',fn:`deletePG('${nbId}','${pgId}')`}
  ]);
}
function renameNB(id){
  const nb=A.notebooks.find(n=>n.id===id);
  if(!nb) return;
  showModal(`<h2>Rename Notebook</h2><input class="fi" id="rnni" value="${esc(nb.name)}">
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button>
    <button class="bp" onclick="doRenameNB('${id}')">Save</button></div>`);
  setTimeout(()=>{const i=document.getElementById('rnni');if(i){i.focus();i.select();}},50);
}
function doRenameNB(id){
  const n=document.getElementById('rnni').value.trim();
  if(!n) return;
  const nb=A.notebooks.find(x=>x.id===id);
  if(nb) nb.name=n;
  saveA();closeModal();renderSB();
}
function deleteNB(id){
  const nb=A.notebooks.find(n=>n.id===id);
  if(!nb) return;
  if(!confirm(`Delete "${nb.name}" and all its pages?`)) return;
  moveToTrash('notebook',id,nb.name,{...nb,pgs:A.pages[id]||[]},'');
  A.notebooks=A.notebooks.filter(n=>n.id!==id);
  delete A.pages[id];
  if(A.activeNotebook===id){A.activeNotebook=null;A.activePage=null;showWelcome();}
  saveA();renderSB();
}
function renamePG(nbId,pgId){
  const pg=(A.pages[nbId]||[]).find(p=>p.id===pgId);
  if(!pg) return;
  showModal(`<h2>Rename Page</h2><input class="fi" id="rpni" value="${esc(pg.name)}">
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button>
    <button class="bp" onclick="doRenamePG('${nbId}','${pgId}')">Save</button></div>`);
  setTimeout(()=>{const i=document.getElementById('rpni');if(i){i.focus();i.select();}},50);
}
function doRenamePG(nbId,pgId){
  const n=document.getElementById('rpni').value.trim();if(!n) return;
  const pg=(A.pages[nbId]||[]).find(p=>p.id===pgId);
  if(pg) pg.name=n;
  saveA();closeModal();renderSB();
  const ti=document.getElementById('tbtit');
  if(ti&&A.activePage===pgId) ti.innerHTML=`${A.notebooks.find(x=>x.id===nbId)?.icon||''} <strong>${esc(n)}</strong>`;
}
function dupPG(nbId,pgId){
  const pg=(A.pages[nbId]||[]).find(p=>p.id===pgId);
  if(!pg) return;
  const np={...JSON.parse(JSON.stringify(pg)),id:'pg'+Date.now(),name:pg.name+' (copy)'};
  A.pages[nbId].push(np);
  saveA();renderSB();openPage(nbId,np.id);
}
function deletePG(nbId,pgId){
  const pg=(A.pages[nbId]||[]).find(p=>p.id===pgId);
  if(!pg) return;
  moveToTrash('page',pgId,pg.name,pg,nbId);
  A.pages[nbId]=A.pages[nbId].filter(p=>p.id!==pgId);
  if(A.activePage===pgId){A.activePage=null;showWelcome();}
  saveA();renderSB();
}
function showMovePg(nbId,pgId){
  const pg=(A.pages[nbId]||[]).find(p=>p.id===pgId);
  if(!pg) return;
  const opts=A.notebooks.filter(n=>n.id!==nbId).map(n=>`<div class="nbch" onclick="doMovePg('${nbId}','${pgId}','${n.id}',false)">${n.icon} ${esc(n.name)} <span style="margin-left:auto;font-size:11px;color:var(--t3)">move</span></div>
  <div class="nbch" onclick="doMovePg('${nbId}','${pgId}','${n.id}',true)">${n.icon} ${esc(n.name)} <span style="margin-left:auto;font-size:11px;color:var(--t3)">copy</span></div>`).join('');
  showModal(`<h2>Move / Copy Page</h2><p style="font-size:13px;color:var(--t3);margin-bottom:10px">"${esc(pg.name)}"</p>${opts||'<p style="color:var(--t3);font-size:13px">No other notebooks</p>'}
  <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button></div>`);
}
function doMovePg(fromNb,pgId,toNb,copy){
  const pg=(A.pages[fromNb]||[]).find(p=>p.id===pgId);
  if(!pg) return;
  const np=copy?{...JSON.parse(JSON.stringify(pg)),id:'pg'+Date.now()}:pg;
  if(!copy) A.pages[fromNb]=A.pages[fromNb].filter(p=>p.id!==pgId);
  if(!A.pages[toNb]) A.pages[toNb]=[];
  A.pages[toNb].push(np);
  saveA();closeModal();renderSB();openPage(toNb,np.id);
}
