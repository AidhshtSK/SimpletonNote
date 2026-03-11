// ═══════════════════════════════════════════
// NOTEBOOK & PAGE CREATION
// ═══════════════════════════════════════════
function showAddNB(){
  const emojis=['📓','📒','📔','📕','📗','📘','📙','📚','💼','🔬','🎨','💻','🧩','🌱','⭐','🔥','💡','🎵','🧠','📐'];
  window._nbEmoji='📓';
  showModal(`<h2>New Notebook</h2><div class="nbf">
    <input class="fi" id="nbni" placeholder="Notebook name…" onkeydown="if(event.key==='Enter')createNB()">
    <div class="epick" id="nbep">${emojis.map(e=>`<div class="eo" onclick="selEmoji('nbep','${e}',this)">${e}</div>`).join('')}</div>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button><button class="bp" onclick="createNB()">Create</button></div>
  </div>`);
  setTimeout(()=>document.getElementById('nbni')?.focus(),50);
}
function selEmoji(containerId,e,el){
  window._nbEmoji=e;
  document.querySelectorAll(`#${containerId} .eo`).forEach(d=>d.classList.remove('on'));
  el.classList.add('on');
}
function createNB(){
  const n=document.getElementById('nbni').value.trim();
  if(!n){toast('Enter a name');return;}
  const nb={id:'nb'+Date.now(),name:n,icon:window._nbEmoji||'📓',project:A.currentProject};
  A.notebooks.push(nb);A.pages[nb.id]=[];
  saveA();closeModal();renderSB();selNB(nb.id);
}

const PAGE_TYPES=[
  {id:'rich',icon:'📝',name:'Rich Text',desc:'Documents, notes, wiki'},
  {id:'canvas',icon:'🎨',name:'Infinite Canvas',desc:'Freehand & shapes'},
  {id:'finite',icon:'🖼',name:'Finite Canvas',desc:'Fixed-size drawing'},
  {id:'code',icon:'💻',name:'Code',desc:'Script editor with runner'},
  {id:'quiz',icon:'❓',name:'Quiz',desc:'MCQ flashcard style'}
];

function showAddPage(nbId){
  window._addPageNb=nbId;
  window._addPageType=null;
  showModal(`<h2>New Page</h2>
    <p style="color:var(--t3);font-size:13px;margin-bottom:10px">Choose a page type</p>
    <div class="tyg">${PAGE_TYPES.map(t=>`<div class="tyc" id="ptc_${t.id}" onclick="selPageType('${t.id}')">
      <div class="ti">${t.icon}</div><div class="tn">${t.name}</div><div class="td">${t.desc}</div>
    </div>`).join('')}</div>
    <input class="fi" id="pgni" placeholder="Page name…" style="margin-bottom:9px" onkeydown="if(event.key==='Enter')proceedAddPage()">
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button>
    <button class="bp" id="pg-next-btn" onclick="proceedAddPage()" disabled style="opacity:.5">Next →</button></div>`);
  setTimeout(()=>document.getElementById('pgni')?.focus(),50);
}
function selPageType(t){
  window._addPageType=t;
  document.querySelectorAll('.tyc').forEach(c=>c.classList.remove('on'));
  document.getElementById('ptc_'+t)?.classList.add('on');
  const btn=document.getElementById('pg-next-btn');
  if(btn){btn.disabled=false;btn.style.opacity='1';}
}
function proceedAddPage(){
  const type=window._addPageType;
  if(!type){toast('Choose a page type');return;}
  const name=(document.getElementById('pgni')?.value.trim())||'Untitled';
  window._addPageName=name;
  // Show template choice step
  closeModal();
  setTimeout(()=>showTemplateStep(type,name),50);
}
function showTemplateStep(type,name){
  window._addPageType=type;
  window._addPageName=name;
  if(type!=='rich'){
    finalCreatePage(type,name,null);
    return;
  }
  showModal(`<h2>Choose a Template</h2>
    <p style="font-size:13px;color:var(--t3);margin-bottom:12px">Click a template to use it, or start blank</p>
    <div class="tgrid">${ALL_TEMPLATES.map((t,i)=>`<div class="tcard" onclick="pickTpl(${i})">
      <h3>${t.icon} ${t.name}</h3><p>${t.desc}</p>
    </div>`).join('')}</div>
    <div class="mbtns"><button class="bs" onclick="closeModal();finalCreatePage(window._addPageType,window._addPageName,null)">Blank Page</button></div>`);
}
function pickTpl(i){
  const tpl=ALL_TEMPLATES[i];
  window._selTplIdx=i;
  closeModal();
  setTimeout(()=>showTplFillIn(window._addPageType,window._addPageName,tpl),50);
}
function showTplFillIn(type,name,tpl){
  window._addPageType=type;
  window._addPageName=name;
  if(!tpl.fields||!tpl.fields.length){
    finalCreatePage(type,name,tpl.content);
    return;
  }
  const fieldsHtml=tpl.fields.map((f,i)=>`<div class="tmpl-field">
    <label>${f.label}</label>
    <input class="fi" id="tf${i}" placeholder="${esc(f.placeholder)}" value="${esc(f.default||'')}">
  </div>`).join('');
  showModal(`<h2>${tpl.icon} ${tpl.name}</h2>
    <p style="font-size:12px;color:var(--t3);margin-bottom:12px">Fill in the blanks (or leave empty for defaults)</p>
    ${fieldsHtml}
    <div class="mbtns"><button class="bs" onclick="closeModal();finalCreatePage(window._addPageType,window._addPageName,null)">Skip</button>
    <button class="bp" onclick="doFillTpl(window._selTplIdx)">Create Page</button></div>`);
}
function doFillTpl(tplIdx){
  const type=window._addPageType;
  const name=window._addPageName;
  const tpl=ALL_TEMPLATES[tplIdx];
  let content=tpl.content;
  (tpl.fields||[]).forEach((f,i)=>{
    const val=document.getElementById('tf'+i)?.value||f.default||'';
    content=content.replace(new RegExp('\\{\\{'+f.key+'\\}\\}','g'),esc(val));
  });
  // Also apply the page name into any {{pagename}} placeholder in the template
  content=content.replace(/\{\{pagename\}\}/g,esc(name));
  closeModal();
  finalCreatePage(type,name,content);
}
function finalCreatePage(type,name,content){
  const nbId=window._addPageNb;
  if(!nbId) return;
  const page={id:'pg'+Date.now(),name:name||'Untitled',type:type,
    content:content||'',strokes:[],codeContent:'',codeLang:'javascript',quizText:'',notes:''};
  if(!A.pages[nbId]) A.pages[nbId]=[];
  A.pages[nbId].push(page);
  saveA();renderSB();openPage(nbId,page.id);
}

function showWelcome(){
  A.activePage=null;A.activeView=null;
  document.getElementById('tbtit').innerHTML='SimpleTonNote';
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('exp-btn').style.display='none';
  document.getElementById('con').innerHTML=`<div class="welcome" id="welcome"><div class="wgem">✦</div><h2>Welcome to SimpleTonNote</h2><p style="font-size:13px">Select or create a notebook to begin.</p></div>`;
}
function openPage(nbId,pgId){
  const nb=A.notebooks.find(n=>n.id===nbId);
  const pg=(A.pages[nbId]||[]).find(p=>p.id===pgId);
  if(!nb||!pg) return;
  A.activeNotebook=nbId;A.activePage=pgId;A.activeView='page';
  A._nbOpen=A._nbOpen||{};A._nbOpen[nbId]=true;
  document.getElementById('tbtit').innerHTML=`${nb.icon} <strong>${esc(pg.name)}</strong>`;
  document.getElementById('tpl-btn').style.display=pg.type==='rich'?'':'none';
  document.getElementById('exp-btn').style.display=(pg.type==='rich'||pg.type==='code'||pg.type==='finite')&&pg.type!=='quiz'?'':'none';
  renderSB();
  if(pg.type==='rich') openRich(pg);
  else if(pg.type==='canvas') openInfCanvas(pg);
  else if(pg.type==='finite') openFinCanvas(pg);
  else if(pg.type==='code') openCode(pg);
  else if(pg.type==='quiz') openQuiz(pg);
}


// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function esc(s){if(!s) return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function stripHtml(s){return s?s.replace(/<[^>]*>/g,''):''}
function uid(){return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)}
function toast(msg,dur=2400){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),dur);
}
function showModal(html){
  let ov=document.getElementById('movl');
  if(!ov){ov=document.createElement('div');ov.id='movl';ov.className='movl';
    ov.addEventListener('click',e=>{if(e.target===ov)closeModal();});
    document.body.appendChild(ov);}
  ov.style.display='flex';
  ov.innerHTML=`<div class="mod">${html}</div>`;
}
function showWideModal(html){
  let ov=document.getElementById('movl');
  if(!ov){ov=document.createElement('div');ov.id='movl';ov.className='movl';
    ov.addEventListener('click',e=>{if(e.target===ov)closeModal();});
    document.body.appendChild(ov);}
  ov.style.display='flex';
  ov.innerHTML=`<div class="mod mod-wide">${html}</div>`;
}
function closeModal(){const ov=document.getElementById('movl');if(ov) ov.style.display='none';}


// ═══════════════════════════════════════════
// TEMPLATES — organized by category
// ═══════════════════════════════════════════
const TEMPLATE_CATS = {
  'Blank':       {icon:'📄', color:'var(--t3)'},
  'ADHD Study':  {icon:'🧠', color:'#a78bfa'},
  'Study':       {icon:'📚', color:'#60a5fa'},
  'Work':        {icon:'💼', color:'#34d399'},
  'Creative':    {icon:'🎨', color:'#f472b6'},
  'Personal':    {icon:'🌱', color:'#fb923c'},
  'Technical':   {icon:'💻', color:'#22d3ee'},
  'Meeting':     {icon:'🗒', color:'#fbbf24'},
};

const ALL_TEMPLATES = [
  // ── BLANK ──
  {cat:'Blank',icon:'📄',name:'Blank',desc:'Empty page',fields:[],content:''},

  // ── ADHD STUDY ──
  {cat:'ADHD Study',icon:'🧠',name:'Brain Dump',desc:'Unload your mind first',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Chapter 5 Biology',default:''}],
   content:`<h1>🧠 Brain Dump — {{topic}}</h1><p style="color:var(--t3);font-style:italic">Dump everything first. No order required.</p><h2>📤 Everything on my mind</h2><p></p><h2>🔴 Must do TODAY</h2><ul><li></li></ul><h2>🟡 Should do this week</h2><ul><li></li></ul><h2>🟢 Nice to do eventually</h2><ul><li></li></ul>`},
  {cat:'ADHD Study',icon:'⏱',name:'Pomodoro Notes',desc:'25-min focus sessions',
   fields:[{key:'subject',label:'Subject',placeholder:'e.g. Math Ch3',default:''},{key:'goal',label:'Session Goal',placeholder:'e.g. Do exercises 1-10',default:''}],
   content:`<h1>⏱ Pomodoro Session — {{subject}}</h1><p><strong>Goal:</strong> {{goal}}</p><h2>🍅 Session 1 (25 min)</h2><p><em>Start: ___</em></p><p></p><h2>☕ Break (5 min)</h2><p></p><h2>🍅 Session 2 (25 min)</h2><p></p><h2>✅ Accomplished</h2><ul><li></li></ul><h2>🔄 Pick up next time</h2><ul><li></li></ul>`},
  {cat:'ADHD Study',icon:'🗂',name:'Cornell Notes (ADHD)',desc:'Cues + notes + summary',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Photosynthesis',default:''},{key:'date',label:'Date',placeholder:'e.g. March 9',default:''}],
   content:`<h1>🗂 Cornell Notes — {{topic}}</h1><p style="font-size:12px;color:var(--t3)">Date: {{date}}</p><table><tr><th style="width:30%">❓ Cue Questions</th><th>📝 Notes</th></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table><h2>📋 Summary</h2><p></p><h2>⭐ Key Terms</h2><ul><li><strong>Term:</strong> definition</li></ul>`},
  {cat:'ADHD Study',icon:'🔁',name:'Spaced Repetition',desc:'Recall-based study',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Spanish Vocab',default:''}],
   content:`<h1>🔁 Spaced Repetition — {{topic}}</h1><p style="font-size:12px;color:var(--t3)">Review: Day 1 → 3 → 7 → 14 → 30</p><h2>📚 What I am learning</h2><p></p><h2>✏️ From memory (no peeking)</h2><p></p><h2>✅ Got right</h2><ul><li></li></ul><h2>❌ Got wrong</h2><ul><li></li></ul><h2>💡 Memory hook</h2><p></p><h2>📅 Schedule</h2><table><tr><th>Review</th><th>Date</th><th>Score</th></tr><tr><td>1st (day 1)</td><td></td><td>/10</td></tr><tr><td>2nd (day 3)</td><td></td><td>/10</td></tr><tr><td>3rd (day 7)</td><td></td><td>/10</td></tr></table>`},
  {cat:'ADHD Study',icon:'🗺',name:'Mind Map Notes',desc:'Visual-spatial notes',
   fields:[{key:'central',label:'Central Topic',placeholder:'e.g. World War II',default:''}],
   content:`<h1>🗺 Mind Map — {{central}}</h1><h2>🌿 Branch 1: ___</h2><ul><li>Sub-idea: </li><li>Example: </li></ul><h2>🌿 Branch 2: ___</h2><ul><li>Sub-idea: </li><li>Example: </li></ul><h2>🌿 Branch 3: ___</h2><ul><li>Sub-idea: </li></ul><h2>🔗 How branches connect</h2><p></p>`},
  {cat:'ADHD Study',icon:'📦',name:'Chunking Notes',desc:'Break into small pieces',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Essay Writing',default:''}],
   content:`<h1>📦 Chunking Notes — {{topic}}</h1><h2>📦 Chunk 1 — Small piece</h2><p></p><ul><li>Key point: </li><li>Example: </li></ul><h2>📦 Chunk 2</h2><p></p><ul><li>Key point: </li></ul><h2>📦 Chunk 3</h2><p></p><h2>🔗 How chunks connect</h2><p></p><h2>✅ Summary (3 sentences)</h2><p></p>`},

  // ── STUDY ──
  {cat:'Study',icon:'📖',name:'Lecture Notes',desc:'Standard lecture template',
   fields:[{key:'course',label:'Course',placeholder:'e.g. Biology 101',default:''},{key:'date',label:'Date',placeholder:'',default:''}],
   content:`<h1>📖 {{course}} — {{date}}</h1><h2>🎯 Learning Objectives</h2><ul><li></li></ul><h2>📝 Main Notes</h2><p></p><h2>📌 Key Definitions</h2><ul><li><strong>Term:</strong> </li></ul><h2>❓ Questions to Follow Up</h2><ul><li></li></ul>`},
  {cat:'Study',icon:'🔬',name:'Research Notes',desc:'Source-based research',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Climate Change',default:''}],
   content:`<h1>🔬 Research: {{topic}}</h1><h2>❓ Key Questions</h2><ul><li></li></ul><h2>📚 Sources</h2><ul><li><a href="#">Source 1</a></li></ul><h2>💡 Main Findings</h2><p></p><h2>⚖️ For / Against</h2><table><tr><th>For</th><th>Against</th></tr><tr><td></td><td></td></tr></table><h2>🏁 Conclusion</h2><p></p>`},
  {cat:'Study',icon:'📝',name:'Essay Outline',desc:'Structured essay plan',
   fields:[{key:'title',label:'Essay Title/Topic',placeholder:'e.g. The French Revolution',default:''}],
   content:`<h1>📝 Essay: {{title}}</h1><h2>🎯 Thesis Statement</h2><p></p><h2>📌 Introduction</h2><ul><li>Hook: </li><li>Context: </li><li>Thesis restate: </li></ul><h2>🏗 Body Paragraph 1</h2><ul><li>Topic sentence: </li><li>Evidence: </li><li>Analysis: </li></ul><h2>🏗 Body Paragraph 2</h2><ul><li>Topic sentence: </li><li>Evidence: </li></ul><h2>🏗 Body Paragraph 3</h2><ul><li>Topic sentence: </li><li>Evidence: </li></ul><h2>🏁 Conclusion</h2><p></p>`},
  {cat:'Study',icon:'📚',name:'Reading List',desc:'Track books and notes',
   fields:[],
   content:`<h1>📚 Reading List</h1><table><tr><th>Title</th><th>Author</th><th>Status</th><th>Rating</th><th>Notes</th></tr><tr><td></td><td></td><td>To Read</td><td></td><td></td></tr><tr><td></td><td></td><td>Reading</td><td></td><td></td></tr><tr><td></td><td></td><td>Done</td><td>★★★★★</td><td></td></tr></table>`},
  {cat:'Study',icon:'🗃',name:'Flashcard Page',desc:'Q&A pairs for review',
   fields:[{key:'deck',label:'Deck Name',placeholder:'e.g. Spanish Vocab Ch1',default:''}],
   content:`<h1>🗃 Flashcards — {{deck}}</h1><table><tr><th>❓ Question / Term</th><th>✅ Answer / Definition</th></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>`},

  // ── WORK ──
  {cat:'Work',icon:'🗒',name:'Meeting Notes',desc:'Agenda, notes, actions',
   fields:[{key:'title',label:'Meeting Title',placeholder:'e.g. Sprint Planning',default:''},{key:'date',label:'Date',placeholder:'',default:''}],
   content:`<h1>🗒 {{title}} — {{date}}</h1><h2>👥 Attendees</h2><p></p><h2>📋 Agenda</h2><ul><li></li><li></li></ul><h2>📝 Notes</h2><p></p><h2>✅ Action Items</h2><ul><li>[ ] @person — task</li></ul><h2>📅 Next Meeting</h2><p></p>`},
  {cat:'Work',icon:'🗺',name:'Project Plan',desc:'Goals, tasks, timeline',
   fields:[{key:'project',label:'Project Name',placeholder:'e.g. Website Redesign',default:''}],
   content:`<h1>🗺 Project: {{project}}</h1><h2>🎯 Goals</h2><p></p><h2>👥 Team</h2><table><tr><th>Name</th><th>Role</th><th>Contact</th></tr><tr><td></td><td></td><td></td></tr></table><h2>📅 Timeline</h2><table><tr><th>Phase</th><th>Start</th><th>End</th><th>Owner</th></tr><tr><td>Research</td><td></td><td></td><td></td></tr><tr><td>Design</td><td></td><td></td><td></td></tr><tr><td>Build</td><td></td><td></td><td></td></tr><tr><td>Launch</td><td></td><td></td><td></td></tr></table><h2>⚠️ Risks</h2><ul><li></li></ul>`},
  {cat:'Work',icon:'🔁',name:'Weekly Review',desc:'Wins, struggles, next week',
   fields:[{key:'week',label:'Week of',placeholder:'e.g. March 10',default:''}],
   content:`<h1>🔁 Weekly Review — {{week}}</h1><h2>🏆 Wins</h2><ul><li></li></ul><h2>😤 Struggles</h2><ul><li></li></ul><h2>📊 Metrics</h2><table><tr><th>Metric</th><th>Target</th><th>Actual</th></tr><tr><td></td><td></td><td></td></tr></table><h2>📅 Next Week Focus</h2><ul><li></li></ul><h2>💡 One Lesson</h2><p></p>`},
  {cat:'Work',icon:'📊',name:'Status Report',desc:'Weekly/monthly status update',
   fields:[{key:'project',label:'Project',placeholder:'',default:''},{key:'period',label:'Period',placeholder:'e.g. Week 12',default:''}],
   content:`<h1>📊 Status Report — {{project}}</h1><p><strong>Period:</strong> {{period}}</p><h2>🟢 On Track</h2><ul><li></li></ul><h2>🟡 At Risk</h2><ul><li></li></ul><h2>🔴 Blocked</h2><ul><li></li></ul><h2>📈 KPIs</h2><table><tr><th>Metric</th><th>Target</th><th>Actual</th><th>Status</th></tr><tr><td></td><td></td><td></td><td>🟢</td></tr></table><h2>🗓 Next Steps</h2><ul><li></li></ul>`},
  {cat:'Work',icon:'💡',name:'Proposal',desc:'Business/project proposal',
   fields:[{key:'title',label:'Proposal Title',placeholder:'e.g. New Feature X',default:''}],
   content:`<h1>💡 Proposal: {{title}}</h1><h2>📋 Executive Summary</h2><p></p><h2>❓ Problem</h2><p></p><h2>✅ Proposed Solution</h2><p></p><h2>💰 Cost / Effort</h2><table><tr><th>Item</th><th>Cost</th><th>Timeline</th></tr><tr><td></td><td></td><td></td></tr></table><h2>📈 Expected Benefits</h2><ul><li></li></ul><h2>⚠️ Risks</h2><ul><li></li></ul>`},

  // ── MEETING ──
  {cat:'Meeting',icon:'🧭',name:'1-on-1',desc:'Manager/report 1:1 notes',
   fields:[{key:'person',label:'With',placeholder:'e.g. Alex',default:''}],
   content:`<h1>🧭 1-on-1 with {{person}}</h1><h2>😊 How are you doing?</h2><p></p><h2>✅ Last week updates</h2><ul><li></li></ul><h2>🚧 Blockers</h2><ul><li></li></ul><h2>🎯 Priorities this week</h2><ul><li></li></ul><h2>💬 Feedback / discussion</h2><p></p><h2>📌 Action items</h2><ul><li></li></ul>`},
  {cat:'Meeting',icon:'🚀',name:'Retrospective',desc:'Sprint or project retro',
   fields:[{key:'sprint',label:'Sprint / Period',placeholder:'e.g. Sprint 14',default:''}],
   content:`<h1>🚀 Retrospective — {{sprint}}</h1><h2>😊 What went well?</h2><ul><li></li></ul><h2>😤 What could improve?</h2><ul><li></li></ul><h2>🧪 Experiments to try</h2><ul><li></li></ul><h2>✅ Action items</h2><ul><li>[ ] Owner — action</li></ul>`},

  // ── TECHNICAL ──
  {cat:'Technical',icon:'💻',name:'API Docs',desc:'Endpoint documentation',
   fields:[{key:'api',label:'API / Service Name',placeholder:'e.g. User API v2',default:''}],
   content:`<h1>💻 {{api}} Docs</h1><h2>🔐 Authentication</h2><p></p><h2>📡 Base URL</h2><p><code>https://api.example.com/v1</code></p><h2>📌 Endpoints</h2><h3>GET /resource</h3><table><tr><th>Param</th><th>Type</th><th>Required</th><th>Description</th></tr><tr><td></td><td>string</td><td>Yes</td><td></td></tr></table><h3>POST /resource</h3><p><strong>Body:</strong></p><p><code>{}</code></p><h2>⚠️ Error Codes</h2><table><tr><th>Code</th><th>Meaning</th></tr><tr><td>400</td><td>Bad Request</td></tr><tr><td>401</td><td>Unauthorized</td></tr></table>`},
  {cat:'Technical',icon:'🐛',name:'Bug Report',desc:'Issue tracking template',
   fields:[{key:'title',label:'Bug Title',placeholder:'e.g. Login fails on mobile',default:''}],
   content:`<h1>🐛 Bug: {{title}}</h1><h2>📋 Summary</h2><p></p><h2>🔁 Steps to Reproduce</h2><ol><li></li><li></li><li></li></ol><h2>✅ Expected Behaviour</h2><p></p><h2>❌ Actual Behaviour</h2><p></p><h2>🌍 Environment</h2><table><tr><th>Property</th><th>Value</th></tr><tr><td>OS</td><td></td></tr><tr><td>Browser</td><td></td></tr><tr><td>Version</td><td></td></tr></table><h2>📎 Screenshots / Logs</h2><p></p>`},
  {cat:'Technical',icon:'🏗',name:'System Design',desc:'Architecture document',
   fields:[{key:'system',label:'System Name',placeholder:'e.g. Notification Service',default:''}],
   content:`<h1>🏗 System Design: {{system}}</h1><h2>🎯 Goals & Requirements</h2><h3>Functional</h3><ul><li></li></ul><h3>Non-Functional</h3><ul><li>Latency: </li><li>Scale: </li></ul><h2>📐 Architecture Overview</h2><p></p><h2>🗄 Data Model</h2><table><tr><th>Entity</th><th>Fields</th><th>Notes</th></tr><tr><td></td><td></td><td></td></tr></table><h2>🔌 APIs / Interfaces</h2><p></p><h2>⚠️ Trade-offs</h2><ul><li></li></ul>`},
  {cat:'Technical',icon:'📋',name:'Code Review',desc:'PR / code review notes',
   fields:[{key:'pr',label:'PR / Branch',placeholder:'e.g. feature/login-v2',default:''}],
   content:`<h1>📋 Code Review — {{pr}}</h1><h2>✅ Looks good</h2><ul><li></li></ul><h2>💬 Suggestions</h2><ul><li></li></ul><h2>🔴 Must change</h2><ul><li></li></ul><h2>❓ Questions</h2><ul><li></li></ul>`},

  // ── CREATIVE ──
  {cat:'Creative',icon:'✍️',name:'Story Outline',desc:'Fiction / story structure',
   fields:[{key:'title',label:'Story Title',placeholder:'e.g. The Last Signal',default:''}],
   content:`<h1>✍️ {{title}}</h1><h2>🌍 World / Setting</h2><p></p><h2>👥 Characters</h2><table><tr><th>Name</th><th>Role</th><th>Motivation</th></tr><tr><td></td><td>Protagonist</td><td></td></tr><tr><td></td><td>Antagonist</td><td></td></tr></table><h2>📖 Plot (3 Acts)</h2><h3>Act 1 — Setup</h3><p></p><h3>Act 2 — Confrontation</h3><p></p><h3>Act 3 — Resolution</h3><p></p><h2>🎯 Theme</h2><p></p>`},
  {cat:'Creative',icon:'🎬',name:'Script / Screenplay',desc:'Scene-by-scene script',
   fields:[{key:'title',label:'Title',placeholder:'e.g. Episode 1',default:''}],
   content:`<h1>🎬 {{title}}</h1><h2>INT. LOCATION — DAY</h2><p><em>Scene description.</em></p><p><strong>CHARACTER NAME</strong></p><p>Dialogue goes here.</p><h2>EXT. LOCATION — NIGHT</h2><p><em>Scene description.</em></p>`},
  {cat:'Creative',icon:'🎵',name:'Song / Lyrics',desc:'Song structure template',
   fields:[{key:'title',label:'Song Title',placeholder:'e.g. Midnight Drive',default:''}],
   content:`<h1>🎵 {{title}}</h1><h2>Verse 1</h2><p></p><h2>Pre-Chorus</h2><p></p><h2>Chorus</h2><p></p><h2>Verse 2</h2><p></p><h2>Bridge</h2><p></p><h2>Outro</h2><p></p><hr><h2>📝 Notes / chord progression</h2><p></p>`},
  {cat:'Creative',icon:'🎨',name:'Design Brief',desc:'Creative project brief',
   fields:[{key:'project',label:'Project',placeholder:'e.g. Logo for Acme Co.',default:''}],
   content:`<h1>🎨 Design Brief: {{project}}</h1><h2>🎯 Objective</h2><p></p><h2>👤 Target Audience</h2><p></p><h2>🎨 Visual Direction</h2><ul><li>Mood: </li><li>Colors: </li><li>Typography: </li></ul><h2>📦 Deliverables</h2><ul><li></li></ul><h2>📅 Timeline</h2><p></p><h2>🚫 Don'ts</h2><ul><li></li></ul>`},

  // ── PERSONAL ──
  {cat:'Personal',icon:'🍳',name:'Recipe',desc:'Ingredients and steps',
   fields:[{key:'recipe',label:'Recipe Name',placeholder:'e.g. Pasta Carbonara',default:''}],
   content:`<h1>🍳 {{recipe}}</h1><p><em>Prep: ___ min | Cook: ___ min | Serves: ___</em></p><h2>🛒 Ingredients</h2><ul><li></li><li></li></ul><h2>👨‍🍳 Instructions</h2><ol><li></li><li></li><li></li></ol><h2>📝 Notes / Variations</h2><p></p>`},
  {cat:'Personal',icon:'🧳',name:'Travel Planner',desc:'Trip planning template',
   fields:[{key:'dest',label:'Destination',placeholder:'e.g. Tokyo, Japan',default:''},{key:'dates',label:'Dates',placeholder:'e.g. April 5-12',default:''}],
   content:`<h1>🧳 Trip: {{dest}} — {{dates}}</h1><h2>✈️ Flights / Transport</h2><p></p><h2>🏨 Accommodation</h2><p></p><h2>📅 Day-by-Day Plan</h2><h3>Day 1</h3><ul><li></li></ul><h3>Day 2</h3><ul><li></li></ul><h2>📌 Must-See / Do</h2><ul><li></li></ul><h2>💰 Budget</h2><table><tr><th>Item</th><th>Est.</th><th>Actual</th></tr><tr><td>Flights</td><td></td><td></td></tr><tr><td>Hotel</td><td></td><td></td></tr></table>`},
  {cat:'Personal',icon:'💪',name:'Fitness Log',desc:'Workout tracking',
   fields:[{key:'week',label:'Week of',placeholder:'e.g. March 10',default:''}],
   content:`<h1>💪 Fitness Log — {{week}}</h1><table><tr><th>Day</th><th>Workout</th><th>Sets × Reps</th><th>Notes</th></tr><tr><td>Mon</td><td></td><td></td><td></td></tr><tr><td>Tue</td><td>Rest</td><td>—</td><td></td></tr><tr><td>Wed</td><td></td><td></td><td></td></tr><tr><td>Thu</td><td></td><td></td><td></td></tr><tr><td>Fri</td><td></td><td></td><td></td></tr><tr><td>Sat</td><td>Rest</td><td>—</td><td></td></tr><tr><td>Sun</td><td></td><td></td><td></td></tr></table>`},
  {cat:'Personal',icon:'🎯',name:'Goal Setting',desc:'SMART goals tracker',
   fields:[{key:'period',label:'Period',placeholder:'e.g. Q2 2025',default:''}],
   content:`<h1>🎯 Goals — {{period}}</h1><h2>⭐ Big Rocks (3 max)</h2><ol><li></li><li></li><li></li></ol><h2>📋 SMART Goal Breakdown</h2><h3>Goal 1</h3><table><tr><th>SMART</th><th>Details</th></tr><tr><td>Specific</td><td></td></tr><tr><td>Measurable</td><td></td></tr><tr><td>Achievable</td><td></td></tr><tr><td>Relevant</td><td></td></tr><tr><td>Time-bound</td><td></td></tr></table><h2>📊 Monthly Check-In</h2><table><tr><th>Month</th><th>Progress</th><th>Notes</th></tr><tr><td>Month 1</td><td></td><td></td></tr></table>`},
  {cat:'Personal',icon:'💰',name:'Budget Tracker',desc:'Monthly budget template',
   fields:[{key:'month',label:'Month',placeholder:'e.g. March 2025',default:''}],
   content:`<h1>💰 Budget — {{month}}</h1><h2>💵 Income</h2><table><tr><th>Source</th><th>Amount</th></tr><tr><td>Salary</td><td></td></tr><tr><td>Other</td><td></td></tr></table><h2>💸 Expenses</h2><table><tr><th>Category</th><th>Budget</th><th>Actual</th><th>Diff</th></tr><tr><td>Rent/Mortgage</td><td></td><td></td><td></td></tr><tr><td>Food</td><td></td><td></td><td></td></tr><tr><td>Transport</td><td></td><td></td><td></td></tr><tr><td>Utilities</td><td></td><td></td><td></td></tr><tr><td>Entertainment</td><td></td><td></td><td></td></tr><tr><td>Savings</td><td></td><td></td><td></td></tr></table>`},
];

// ── showTemplates → categorized view ──
function showTemplates(){
  const cats=Object.keys(TEMPLATE_CATS);
  let html=`<h2>📋 Templates</h2><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="tpl-cat-tabs">`;
  html+=`<button class="tpl-tab on" onclick="filterTplCat(null,this)">All</button>`;
  cats.forEach(c=>html+=`<button class="tpl-tab" onclick="filterTplCat('${c}',this)">${TEMPLATE_CATS[c].icon} ${c}</button>`);
  html+=`</div><div class="template-grid" id="tpl-grid"></div>
    <div class="mbtns"><button class="bs" onclick="closeModal()">Cancel</button></div>`;
  showModal(html);
  renderTplGrid(null);
}

function filterTplCat(cat,btn){
  document.querySelectorAll('.tpl-tab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderTplGrid(cat);
}
function renderTplGrid(cat){
  const grid=document.getElementById('tpl-grid');if(!grid) return;
  const items=cat?ALL_TEMPLATES.filter(t=>t.cat===cat):ALL_TEMPLATES;
  grid.innerHTML=items.map((t,i)=>``+
    `<div class="template-card" onclick="applyTemplate(${ALL_TEMPLATES.indexOf(t)})">
      <div style="font-size:20px;margin-bottom:4px">${t.icon}</div>
      <h3>${t.name}</h3>
      <p>${t.desc}</p>
      ${t.cat!=='Blank'?`<div style="font-size:10px;margin-top:4px;opacity:.6">${TEMPLATE_CATS[t.cat]?.icon||''} ${t.cat}</div>`:''}
    </div>`).join('');
}

function applyTemplate(i){
  const t=ALL_TEMPLATES[i];
  if(!t) return;
  if(t.fields&&t.fields.length){
    showTplFillIn(window._addPageType||'rich', window._addPageName||t.name, t);
    return;
  }
  const body=document.getElementById('eb');
  if(body){body.innerHTML=t.content;if(_curPg){_curPg.content=t.content;saveA();}}
  closeModal();
}

