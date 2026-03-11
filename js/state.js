// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
const VER = 5;
const A = {
  projects:[{id:'p0',name:'Default',icon:'📁'}],
  notebooks:[],pages:{},tasks:{},journalEntries:{},
  trash:[],tags:{},pageTags:{},favorites:{pages:[],notebooks:[]},
  settings:{theme:'dark',fontSize:15,mathBar:true,smartChips:true},
  currentProject:'p0',activeNotebook:null,activePage:null,activeView:null,gdrive:{},
  activeTagFilter:null,
  _nbOpen:{},
  homeWidgets:null
};

function loadA(){
  try{
    const embedded=document.getElementById('appdata');
    let d=null;
    if(embedded&&embedded.textContent.trim()!=='{}'){
      try{d=JSON.parse(embedded.textContent)}catch(e){}
    }
    if(!d){
      const ls=localStorage.getItem('stn5');
      if(ls) try{d=JSON.parse(ls);}catch(e){}
    }
    if(d){ merge(d); return; }
    // Fallback: try IndexedDB
    _idbLoad(idbData=>{
      if(idbData) merge(idbData);
    });
  }catch(e){console.warn('loadA',e)}
}

function merge(d){
  if(d.projects) A.projects=d.projects;
  if(d.notebooks) A.notebooks=d.notebooks;
  if(d.pages) A.pages=d.pages;
  if(d.tasks) A.tasks=d.tasks;
  if(d.journalEntries) A.journalEntries=d.journalEntries;
  if(d.trash) A.trash=d.trash;
  if(d.tags) A.tags=d.tags;
  if(d.pageTags) A.pageTags=d.pageTags;
  if(d.favorites) A.favorites=d.favorites;
  if(d.settings) A.settings=Object.assign(A.settings,d.settings);
  if(d.currentProject) A.currentProject=d.currentProject;
  if(d.homeWidgets) A.homeWidgets=d.homeWidgets;
}

let _saveIndicatorTimer=null;
function showSaveIndicator(state){
  const el=document.getElementById('save-ind');
  if(!el) return;
  clearTimeout(_saveIndicatorTimer);
  if(state==='saving'){
    el.textContent='💾 saving…';el.className='save-ind saving';el.style.opacity='1';
  } else if(state==='saved'){
    el.textContent='✓ saved';el.className='save-ind saved';el.style.opacity='1';
    _saveIndicatorTimer=setTimeout(()=>{el.style.opacity='0';},1800);
  } else if(state==='error'){
    el.textContent='⚠ save error';el.className='save-ind error';el.style.opacity='1';
  }
}

function saveA(){
  showSaveIndicator('saving');
  const data=exportData();
  let ok=false;
  // Primary: localStorage
  try{
    const json=JSON.stringify(data);
    localStorage.setItem('stn5',json);
    // Backup slot (rotates so we always have a previous copy)
    const prev=localStorage.getItem('stn5');
    if(prev) localStorage.setItem('stn5_bak',prev);
    localStorage.setItem('stn5',json);
    ok=true;
  }catch(e){
    // localStorage full - try clearing old backup first
    try{localStorage.removeItem('stn5_bak');localStorage.setItem('stn5',JSON.stringify(data));ok=true;}catch(e2){}
  }
  // Secondary: IndexedDB (async, fire-and-forget)
  _idbSave(data);
  // Update embedded script tag (for Save File workflow)
  try{
    const el=document.getElementById('appdata');
    if(el) el.textContent=JSON.stringify(data);
  }catch(e){}
  showSaveIndicator(ok?'saved':'error');
}

// ── IndexedDB layer ──
function _idbSave(data){
  try{
    const req=indexedDB.open('stn',1);
    req.onupgradeneeded=e=>e.target.result.createObjectStore('data');
    req.onsuccess=e=>{
      try{
        const tx=e.target.result.transaction('data','readwrite');
        tx.objectStore('data').put(JSON.stringify(data),'state');
      }catch(err){}
    };
  }catch(e){}
}
function _idbLoad(cb){
  try{
    const req=indexedDB.open('stn',1);
    req.onupgradeneeded=e=>e.target.result.createObjectStore('data');
    req.onsuccess=e=>{
      try{
        const tx=e.target.result.transaction('data','readonly');
        const gr=tx.objectStore('data').get('state');
        gr.onsuccess=()=>cb(gr.result?JSON.parse(gr.result):null);
        gr.onerror=()=>cb(null);
      }catch(err){cb(null);}
    };
    req.onerror=()=>cb(null);
  }catch(e){cb(null);}
}

function exportData(){
  return {ver:VER,ts:Date.now(),projects:A.projects,notebooks:A.notebooks,
    pages:A.pages,tasks:A.tasks,journalEntries:A.journalEntries,trash:A.trash,
    tags:A.tags,pageTags:A.pageTags,favorites:A.favorites,settings:A.settings,
    homeWidgets:A.homeWidgets||[]};
}

// Save-to-file: downloads a .stn data file (JSON, only SimpleTonNote can open it)
// Format: custom JSON with magic header so we can identify it on load
function saveFile(){
  try{
    const data=exportData();
    const payload={
      _stn:true,           // magic identifier
      _ver:VER,
      _saved:new Date().toISOString(),
      ...data
    };
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/octet-stream'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    const ts=new Date().toISOString().slice(0,10);
    a.download=`SimpleTonNote_${ts}.stn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(a.href),10000);
    toast('💾 Saved as .stn file — use ⚙ Import to restore.');
  }catch(e){
    toast('❌ Save failed: '+e.message);
    console.error('saveFile error',e);
  }
}

// (importStnFile removed — use handleImport zip vault)


// ═══════════════════════════════════════════
// GOOGLE DRIVE OAUTH2 (PKCE-free token client)
// ═══════════════════════════════════════════
// Google Drive sync - to enable, replace '' with your OAuth2 client ID
// Get one at: https://console.cloud.google.com → APIs & Services → Credentials
// Authorized JS origins: add your domain (or http://localhost for local use)
// Authorized redirect URIs: same as above

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
loadA();
applySettings();

// Default notebooks
if(A.notebooks.length===0){
  A.notebooks=[{id:'nb1',name:'My Notes',icon:'📓',project:'p0'}];
  A.pages['nb1']=[{id:'p1',name:'Getting Started',type:'rich',
    content:'<h1>Welcome!</h1><p>Start writing, sketching, or solving equations.</p>'}];
  saveA();
}

function applySettings(){
  const s=A.settings;
  document.body.setAttribute('data-theme',s.theme||'dark');
  document.documentElement.style.setProperty('--fs',(s.fontSize||15)+'px');
}


