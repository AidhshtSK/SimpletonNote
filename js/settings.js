// ═══════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════
function openSettings(){
  A.activeView='settings';
  document.getElementById('tbtit').innerHTML='<strong>⚙ Settings</strong>';
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('exp-btn').style.display='none';
  const s=A.settings;
  const themes=[
    {id:'dark',bg:'#0f0f11',label:'Dark'},
    {id:'light',bg:'#fafaf8',label:'Light'},
    {id:'sepia',bg:'#1a1610',label:'Sepia'},
    {id:'forest',bg:'#0d1410',label:'Forest'},
    {id:'midnight',bg:'#080818',label:'Midnight'},
    {id:'rose',bg:'#1a0f12',label:'Rose'},
    {id:'charcoal',bg:'#141414',label:'Charcoal'},
  ];
  document.getElementById('con').innerHTML=`<div id="setw">
    <div class="set-body">
      <!-- Save & Export -->
      <div class="set-sec">
        <h3>💾 Save & Export</h3>
        <div class="set-row">
          <div class="set-rl"><div class="slbl">Save as HTML file</div><div class="sdesc">Download a self-contained HTML file with all your data baked in</div></div>
          <button class="sbtn prim" onclick="saveFile()">💾 Save File</button>
        </div>
        <div class="set-row">
          <div class="set-rl"><div class="slbl">Export backup (JSON)</div><div class="sdesc">Export all data as a JSON backup file</div></div>
          <button class="sbtn" onclick="exportAllJSON()">📦 Export JSON</button>
        </div>
        <div class="set-row">
          <div class="set-rl"><div class="slbl">Import</div><div class="sdesc">Import JSON backup, text, markdown, or image files</div></div>
          <label class="sbtn" style="cursor:pointer">📂 Import <input type="file" style="display:none" multiple onchange="handleImport(this.files)"></label>
        </div>
      </div>
      <!-- Appearance -->
      <div class="set-sec">
        <h3>🎨 Appearance</h3>
        <div class="set-row">
          <div class="set-rl"><div class="slbl">Theme</div></div>
          <div class="themes-row">${themes.map(t=>`<div title="${t.label}" class="thdot${s.theme===t.id?' on':''}" style="background:${t.bg};border:2px solid ${t.id==='light'?'#ddd':'transparent'}" onclick="setTheme('${t.id}')"></div>`).join('')}</div>
        </div>
        <div class="set-row">
          <div class="set-rl"><div class="slbl">Font Size</div></div>
          <div style="display:flex;gap:5px">${[13,14,15,16,17].map(sz=>`<button class="sbtn${s.fontSize===sz?' prim':''}" onclick="setFS(${sz})">${sz}</button>`).join('')}</div>
        </div>
        <div class="set-row">
          <div class="set-rl"><div class="slbl">Math toolbar</div><div class="sdesc">Show quick math buttons in rich text editor</div></div>
          <label class="tog"><input type="checkbox" ${s.mathBar!==false?'checked':''} onchange="toggleSetting('mathBar',this.checked)"><div class="tog-t"></div><div class="tog-k"></div></label>
        </div>
        <div class="set-row">
          <div class="set-rl"><div class="slbl">Smart link chips</div><div class="sdesc">Convert links to icon chips (YouTube, GitHub, etc.)</div></div>
          <label class="tog"><input type="checkbox" ${s.smartChips!==false?'checked':''} onchange="toggleSetting('smartChips',this.checked)"><div class="tog-t"></div><div class="tog-k"></div></label>
        </div>
      </div>
      <!-- Keyboard shortcuts -->
      <div class="set-sec">
        <h3>⌨️ Shortcuts</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 14px">
          ${[['Ctrl+S','Save file'],['Ctrl+\\','Toggle sidebar'],['Ctrl+Enter','Run code'],['Esc','Close modal'],
             ['- space','Bullet list'],['[] space','Checkbox'],['# space','Heading 1'],
             ['## space','Heading 2'],['> space','Blockquote'],['--- space','Divider']
          ].map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--bd);font-size:12px"><span style="color:var(--t)">${v}</span><kbd style="background:var(--bg3);border:1px solid var(--bd2);border-radius:4px;padding:1px 5px;font-size:10px;font-family:'DM Mono',monospace;color:var(--t2)">${k}</kbd></div>`).join('')}
        </div>
      </div>
      <!-- Danger zone -->
      <div class="set-sec">
        <h3 style="color:var(--rd)">⚠️ Danger Zone</h3>
        <div class="set-row">
          <div class="set-rl"><div class="slbl">Clear all data</div><div class="sdesc">Permanently delete all notebooks, pages, and journal entries</div></div>
          <button class="sbtn dng" onclick="clearAll()">Clear All</button>
        </div>
      </div>
    </div>
  </div>`;
}

function setTheme(id){A.settings.theme=id;applySettings();saveA();openSettings();}
function setFS(n){A.settings.fontSize=n;applySettings();saveA();openSettings();}
function toggleSetting(key,val){A.settings[key]=val;saveA();}
function clearAll(){
  if(!confirm('Delete ALL data? This cannot be undone.')) return;
  A.notebooks=[];A.pages={};A.tasks={};A.journalEntries={};A.trash=[];A.tags={};A.pageTags={};A.favorites={pages:[],notebooks:[]};
  A.activeNotebook=null;A.activePage=null;A.activeView=null;
  saveA();renderSB();showWelcome();openSettings();
  toast('All data cleared');
}

// ═══════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') closeModal();
  if((e.ctrlKey||e.metaKey)&&e.key==='\\'){e.preventDefault();toggleSB();}
  if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();saveFile();}
});

// ── Reliable autosave listeners ──
// Save before tab close / refresh
window.addEventListener('beforeunload',()=>saveA());
// Save when tab becomes hidden (switch tabs, minimize, phone lock screen)
document.addEventListener('visibilitychange',()=>{ if(document.hidden) saveA(); });
// Save when window loses focus
window.addEventListener('blur',()=>saveA());
// Periodic save every 30s as last resort
setInterval(saveA, 30000);

// ═══════════════════════════════════════════
// NOTEBOOK TASKS SHORTCUT (sidebar via context)
// ═══════════════════════════════════════════
// When right-clicking a notebook, also allow opening tasks
// This is handled in nbCtx above — but we can add a nav item:
function openNBTasks(nbId){openTasks(nbId);}

// ═══════════════════════════════════════════
// INIT COMPLETE
// ═══════════════════════════════════════════
renderSB();

// Init Google
