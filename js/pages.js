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
  if(type!=='rich'){
    // No templates for non-rich types
    finalCreatePage(type,name,null);
    return;
  }
  showModal(`<h2>Choose a Template</h2>
    <p style="font-size:13px;color:var(--t3);margin-bottom:12px">Or start blank</p>
    <div class="tgrid" id="tplgrid">${ALL_TEMPLATES.map((t,i)=>`<div class="tcard" id="tplc${i}" onclick="selTpl(${i},this)">
      <h3>${t.icon} ${t.name}</h3><p>${t.desc}</p>
    </div>`).join('')}</div>
    <div class="mbtns"><button class="bs" onclick="closeModal();finalCreatePage('${type}','${esc(name)}',null)">Blank Page</button>
    <button class="bp" id="tpl-ok" onclick="applyTplStep('${type}','${esc(name)}')" disabled style="opacity:.5">Use Template →</button></div>`);
  window._selTplIdx=null;
}
function selTpl(i,el){
  window._selTplIdx=i;
  document.querySelectorAll('.tcard').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');
  const b=document.getElementById('tpl-ok');
  if(b){b.disabled=false;b.style.opacity='1';}
}
function applyTplStep(type,name){
  const idx=window._selTplIdx;
  if(idx===null||idx===undefined){toast('Choose a template or click Blank Page');return;}
  const tpl=ALL_TEMPLATES[idx];
  closeModal();
  setTimeout(()=>showTplFillIn(type,name,tpl),50);
}
function showTplFillIn(type,name,tpl){
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
    <div class="mbtns"><button class="bs" onclick="closeModal();finalCreatePage('${type}','${esc(name)}','${encodeURIComponent(tpl.content)}')">Skip</button>
    <button class="bp" onclick="doFillTpl('${type}','${esc(name)}',${window._selTplIdx})">Create Page</button></div>`);
}
function doFillTpl(type,name,tplIdx){
  const tpl=ALL_TEMPLATES[tplIdx];
  let content=tpl.content;
  (tpl.fields||[]).forEach((f,i)=>{
    const val=document.getElementById('tf'+i)?.value||f.default||'';
    content=content.replace(new RegExp('\\{\\{'+f.key+'\\}\\}','g'),esc(val));
  });
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
// TEMPLATES (ADHD-optimized + classic)
// ═══════════════════════════════════════════
const ALL_TEMPLATES = [
  // ── BLANK ──
  {icon:'📄',name:'Blank',desc:'Empty page',fields:[],content:''},

  // ── ADHD STUDY TEMPLATES ──
  {icon:'🧠',name:'Brain Dump',desc:'ADHD: unload your mind first',
   fields:[{key:'topic',label:'Topic/Subject',placeholder:'e.g. Chapter 5 Biology',default:''}],
   content:`<h1>🧠 Brain Dump — {{topic}}</h1><p style="color:var(--t3);font-style:italic">Dump everything you know or need to do. No order required.</p><h2>📤 Everything on my mind</h2><p></p><p></p><p></p><h2>🔴 Must do TODAY</h2><ul><li></li><li></li></ul><h2>🟡 Should do this week</h2><ul><li></li><li></li></ul><h2>🟢 Nice to do eventually</h2><ul><li></li><li></li></ul>`},

  {icon:'⏱',name:'Pomodoro Notes',desc:'ADHD: 25-min focus sessions',
   fields:[{key:'subject',label:'Subject',placeholder:'e.g. Math Chapter 3',default:''},{key:'goal',label:'Session Goal',placeholder:'e.g. Complete exercises 1-10',default:''}],
   content:`<h1>⏱ Pomodoro Session — {{subject}}</h1><p><strong>Goal:</strong> {{goal}}</p><h2>🍅 Session 1 (25 min)</h2><p><em>Start time: ___</em></p><p></p><h2>☕ Break Notes (5 min)</h2><p></p><h2>🍅 Session 2 (25 min)</h2><p><em>Start time: ___</em></p><p></p><h2>☕ Break Notes (5 min)</h2><p></p><h2>🍅 Session 3 (25 min)</h2><p><em>Start time: ___</em></p><p></p><h2>✅ What I accomplished</h2><ul><li></li><li></li></ul><h2>🔄 Pick up next time</h2><ul><li></li></ul>`},

  {icon:'🗂',name:'Cornell Notes (ADHD)',desc:'Structured with cues & summary',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Photosynthesis',default:''},{key:'date',label:'Date',placeholder:'e.g. March 9',default:''}],
   content:`<h1>🗂 Cornell Notes — {{topic}}</h1><p style="font-size:12px;color:var(--t3)">Date: {{date}}</p><table><tr><th style="width:30%">❓ Cue Questions<br><em style="font-size:11px;font-weight:400">Write after class</em></th><th>📝 Notes<br><em style="font-size:11px;font-weight:400">During class/reading</em></th></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table><h2>📋 Summary (write in YOUR words)</h2><p></p><h2>⭐ Key Terms</h2><ul><li><strong>Term:</strong> definition</li></ul>`},

  {icon:'🔁',name:'Spaced Repetition',desc:'ADHD: recall-based study',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Spanish Vocab',default:''}],
   content:`<h1>🔁 Spaced Repetition — {{topic}}</h1><p style="font-size:12px;color:var(--t3);font-style:italic">Study this: Day 1 → Day 3 → Day 7 → Day 14 → Day 30</p><h2>📚 What I'm learning</h2><p></p><h2>✏️ Write it from memory (don't peek!)</h2><p></p><p></p><h2>✅ What I got right</h2><ul><li></li></ul><h2>❌ What I got wrong / need to review</h2><ul><li></li></ul><h2>💡 My own example or memory hook</h2><p></p><h2>📅 Review schedule</h2><table><tr><th>Review</th><th>Date</th><th>Score</th></tr><tr><td>1st (tomorrow)</td><td></td><td>/10</td></tr><tr><td>2nd (day 3)</td><td></td><td>/10</td></tr><tr><td>3rd (day 7)</td><td></td><td>/10</td></tr></table>`},

  {icon:'🗺',name:'Mind Map Notes',desc:'ADHD: visual-spatial notes',
   fields:[{key:'central',label:'Central Topic',placeholder:'e.g. World War II',default:''}],
   content:`<h1>🗺 Mind Map Notes — {{central}}</h1><p style="font-style:italic;color:var(--t3);font-size:13px">Expand each branch with details, examples, and connections</p><h2>🌿 Branch 1: ___</h2><ul><li>Sub-idea: </li><li>Example: </li><li>Connection: </li></ul><h2>🌿 Branch 2: ___</h2><ul><li>Sub-idea: </li><li>Example: </li><li>Connection: </li></ul><h2>🌿 Branch 3: ___</h2><ul><li>Sub-idea: </li><li>Example: </li></ul><h2>🌿 Branch 4: ___</h2><ul><li>Sub-idea: </li><li>Example: </li></ul><h2>🔗 How branches connect</h2><p></p>`},

  {icon:'📦',name:'Chunking Notes',desc:'ADHD: break into small chunks',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Essay Writing',default:''}],
   content:`<h1>📦 Chunked Study — {{topic}}</h1><p style="color:var(--t3);font-size:13px;font-style:italic">Break big topics into small, conquerable chunks</p><h2>📦 Chunk 1 (15 min max)</h2><p><strong>Focus:</strong> </p><p><strong>Key point:</strong> </p><p><strong>My example:</strong> </p><h2>📦 Chunk 2 (15 min max)</h2><p><strong>Focus:</strong> </p><p><strong>Key point:</strong> </p><p><strong>My example:</strong> </p><h2>📦 Chunk 3 (15 min max)</h2><p><strong>Focus:</strong> </p><p><strong>Key point:</strong> </p><h2>🏆 3 things I'll definitely remember</h2><ol><li></li><li></li><li></li></ol>`},

  {icon:'🎯',name:'Active Recall',desc:'ADHD: test yourself, no peeking',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Cell Division',default:''}],
   content:`<h1>🎯 Active Recall — {{topic}}</h1><p style="color:var(--t3);font-size:13px;font-style:italic">Cover the answers. Write from memory. Then check.</p><table><tr><th>Question</th><th>My Answer (from memory)</th><th>Correct? ✓/✗</th></tr><tr><td>What is ___?</td><td></td><td></td></tr><tr><td>How does ___?</td><td></td><td></td></tr><tr><td>Why does ___?</td><td></td><td></td></tr><tr><td>Explain ___</td><td></td><td></td></tr><tr><td>What's the difference between ___ and ___?</td><td></td><td></td></tr></table><h2>📊 Score: ___ / ___</h2><h2>🔄 Review these again</h2><ul><li></li></ul>`},

  {icon:'✨',name:'ADHD Daily Focus',desc:'Daily structure & intentions',
   fields:[{key:'date',label:'Date',placeholder:'e.g. Monday March 9',default:''}],
   content:`<h1>✨ Daily Focus — {{date}}</h1><h2>🌅 Morning Check-in</h2><p><strong>Energy level:</strong> ○○○○○</p><p><strong>Focus level:</strong> ○○○○○</p><p><strong>Today I intend to:</strong> </p><h2>🎯 Top 3 (just 3!)</h2><ol><li></li><li></li><li></li></ol><h2>⚠️ Potential distractions to watch for</h2><ul><li></li></ul><h2>🧠 Notes / ideas / thoughts dump</h2><p></p><h2>🌙 End of day</h2><p><strong>Completed:</strong> </p><p><strong>Tomorrow's first task:</strong> </p>`},

  {icon:'🔄',name:'Feynman Technique',desc:'ADHD: explain it simply',
   fields:[{key:'concept',label:'Concept to learn',placeholder:'e.g. Quantum Entanglement',default:''}],
   content:`<h1>🔄 Feynman Technique — {{concept}}</h1><p style="font-style:italic;color:var(--t3);font-size:13px">The best way to learn: explain it like you're teaching a 5-year-old</p><h2>Step 1: Explain in simple words</h2><p></p><h2>Step 2: Identify gaps (what confuses you?)</h2><ul><li></li><li></li></ul><h2>Step 3: Go back & study those gaps</h2><p></p><h2>Step 4: Simplify further (use an analogy)</h2><p><strong>It's like...</strong> </p><h2>⭐ One-sentence summary</h2><blockquote></blockquote>`},

  // ── MORE ADHD STUDY TEMPLATES ──
  {icon:'🧩',name:'Concept Map',desc:'ADHD: connect ideas visually',
   fields:[{key:'subject',label:'Subject',placeholder:'e.g. Ecosystems',default:''}],
   content:`<h1>🧩 Concept Map — {{subject}}</h1><p style="color:var(--t3);font-size:13px">Write the main concept, then draw connections between ideas</p><h2>🎯 Main Concept</h2><blockquote></blockquote><h2>🔗 Related Concepts</h2><table><tr><th>Concept</th><th>How it connects</th><th>Example</th></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table><h2>🌟 The big picture (summary)</h2><p></p>`},

  {icon:'🗣',name:'Teach-Back Notes',desc:'ADHD: say it out loud in writing',
   fields:[{key:'lesson',label:'Lesson/Chapter',placeholder:'e.g. Newton Laws',default:''}],
   content:`<h1>🗣 Teach-Back — {{lesson}}</h1><p style="color:var(--t3);font-size:13px;font-style:italic">Pretend you're teaching this to a friend. Write what you'd say.</p><h2>The main point is…</h2><p></p><h2>A good analogy is…</h2><p></p><h2>Step by step, it works like this…</h2><ol><li></li><li></li><li></li></ol><h2>The most confusing part is…</h2><p></p><h2>A quick test question:</h2><p><strong>Q:</strong> </p><p><strong>A:</strong> </p>`},

  {icon:'⚡',name:'Quick Review',desc:'ADHD: rapid-fire 10-min review',
   fields:[{key:'topic',label:'Topic',placeholder:'e.g. Algebra basics',default:''}],
   content:`<h1>⚡ Quick Review — {{topic}}</h1><p style="color:var(--t3);font-size:12px">⏱ Set a timer for 10 min. Don't overthink.</p><h2>3 main ideas I remember:</h2><ol><li></li><li></li><li></li></ol><h2>2 things I'm unsure about:</h2><ul><li></li><li></li></ul><h2>1 question I still have:</h2><p></p><h2>Rate your confidence: </h2><p>⭐☆☆☆☆ &nbsp; ⭐⭐☆☆☆ &nbsp; ⭐⭐⭐☆☆ &nbsp; ⭐⭐⭐⭐☆ &nbsp; ⭐⭐⭐⭐⭐</p>`},

  {icon:'📊',name:'Comparison Notes',desc:'ADHD: side-by-side comparison',
   fields:[{key:'item1',label:'Item 1',placeholder:'e.g. Photosynthesis',default:'Topic A'},{key:'item2',label:'Item 2',placeholder:'e.g. Cellular Respiration',default:'Topic B'}],
   content:`<h1>📊 Compare: {{item1}} vs {{item2}}</h1><table><tr><th>Aspect</th><th>{{item1}}</th><th>{{item2}}</th></tr><tr><td>Definition</td><td></td><td></td></tr><tr><td>How it works</td><td></td><td></td></tr><tr><td>Where it happens</td><td></td><td></td></tr><tr><td>Key molecules</td><td></td><td></td></tr><tr><td>End products</td><td></td><td></td></tr></table><h2>✅ Similarities</h2><ul><li></li></ul><h2>❌ Key Differences</h2><ul><li></li></ul><h2>💡 Memory trick</h2><p></p>`},

  {icon:'🗓',name:'Study Schedule',desc:'ADHD: plan your study week',
   fields:[{key:'exam',label:'Exam/Goal',placeholder:'e.g. Biology Final',default:''},{key:'date',label:'Exam Date',placeholder:'e.g. March 20',default:''}],
   content:`<h1>🗓 Study Plan — {{exam}}</h1><p style="color:var(--t3);font-size:12px">Exam date: <strong>{{date}}</strong></p><table><tr><th>Day</th><th>Topic</th><th>Time</th><th>Done?</th></tr><tr><td>Mon</td><td></td><td>__ min</td><td>☐</td></tr><tr><td>Tue</td><td></td><td>__ min</td><td>☐</td></tr><tr><td>Wed</td><td></td><td>__ min</td><td>☐</td></tr><tr><td>Thu</td><td></td><td>__ min</td><td>☐</td></tr><tr><td>Fri</td><td></td><td>__ min</td><td>☐</td></tr><tr><td>Sat</td><td></td><td>__ min</td><td>☐</td></tr><tr><td>Sun</td><td></td><td>__ min</td><td>☐</td></tr></table><h2>🎯 Priority topics</h2><ol><li></li><li></li><li></li></ol><h2>✅ Resources I have</h2><ul><li></li></ul>`},

  {icon:'🔑',name:'Key Terms Glossary',desc:'ADHD: vocabulary & definitions',
   fields:[{key:'subject',label:'Subject',placeholder:'e.g. Chemistry Unit 2',default:''}],
   content:`<h1>🔑 Key Terms — {{subject}}</h1><p style="color:var(--t3);font-size:13px">Write definitions in YOUR own words — not from the textbook</p><table><tr><th>Term</th><th>Definition (my words)</th><th>Memory hook / image</th></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table><h2>🧠 Connections between terms</h2><p></p>`},

  // ── CLASSIC TEMPLATES ──
  {icon:'🗒',name:'Meeting Notes',desc:'Agenda, notes, actions',
   fields:[{key:'meeting',label:'Meeting Name',placeholder:'e.g. Team Standup',default:''},{key:'date',label:'Date',placeholder:'e.g. March 9',default:''}],
   content:`<h1>🗒 {{meeting}}</h1><p style="color:var(--t3);font-size:12px">{{date}}</p><h2>📋 Agenda</h2><ul><li></li><li></li></ul><h2>📝 Notes</h2><p></p><h2>✅ Action Items</h2><ul><li>[ ] Task — @person</li></ul>`},

  {icon:'🗺',name:'Project Plan',desc:'Goals, tasks, timeline',
   fields:[{key:'project',label:'Project Name',placeholder:'e.g. App Redesign',default:''}],
   content:`<h1>🗺 {{project}}</h1><h2>🎯 Goal</h2><p></p><h2>📅 Timeline</h2><table><tr><th>Phase</th><th>Duration</th><th>Owner</th></tr><tr><td></td><td></td><td></td></tr></table><h2>✅ Tasks</h2><ul><li></li></ul>`},

  {icon:'📚',name:'Reading Notes',desc:'Book/article summary',
   fields:[{key:'title',label:'Book/Article Title',placeholder:'e.g. Atomic Habits',default:''},{key:'author',label:'Author',placeholder:'e.g. James Clear',default:''}],
   content:`<h1>📚 {{title}}</h1><p style="color:var(--t3)">by {{author}}</p><h2>💡 Key Ideas</h2><ul><li></li></ul><h2>📝 Notes by Chapter</h2><h3>Chapter 1</h3><p></p><h2>🌟 Favourite Quotes</h2><blockquote></blockquote><h2>🔄 How I'll apply this</h2><p></p>`},

  {icon:'🔬',name:'Research Notes',desc:'Topic deep-dive',
   fields:[{key:'topic',label:'Research Topic',placeholder:'e.g. Climate Change Solutions',default:''}],
   content:`<h1>🔬 Research: {{topic}}</h1><h2>❓ Key Questions</h2><ul><li></li></ul><h2>📚 Sources</h2><ul><li><a href="#">Source 1</a></li></ul><h2>💡 Insights</h2><p></p><h2>🏁 Conclusion</h2><p></p>`},
];

// Export/import all data
function doExport(){
  const pg=A.activePage?(A.pages[A.activeNotebook]||[]).find(p=>p.id===A.activePage):null;
  if(pg?.type==='rich'){
    const blob=new Blob([document.getElementById('eb')?.innerHTML||pg.content||''],{type:'text/html'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=pg.name+'.html';a.click();
  } else if(pg?.type==='code'){
    const ext={javascript:'js',python:'py',java:'java','c++':'cpp',c:'c',rust:'rs',go:'go',html:'html',css:'css',sql:'sql',bash:'sh',typescript:'ts'}[pg.codeLang||'javascript']||'txt';
    const blob=new Blob([document.getElementById('ce')?.value||pg.codeContent||''],{type:'text/plain'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=pg.name+'.'+ext;a.click();
  } else if(pg?.type==='finite'){
    const cv=document.getElementById('cv');
    if(cv){const a=document.createElement('a');a.download=pg.name+'.png';a.href=cv.toDataURL('image/png');a.click();}
  }
}
function exportAllJSON(){
  const d=exportData();
  const blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='simpletonnote_backup.json';a.click();
  toast('📦 Exported backup JSON');
}
function handleImport(files){
  const f=files[0];
  if(!f) return;
  const ext=f.name.split('.').pop().toLowerCase();
  const reader=new FileReader();
  if(ext==='json'||ext==='stn'){
    reader.onload=e=>{try{const d=JSON.parse(e.target.result);importAll(d);}catch(err){toast('❌ Invalid JSON file');}};
    reader.readAsText(f);
  } else if(['txt','md','html'].includes(ext)){
    reader.onload=e=>{
      const nb=A.notebooks[0]||{id:'nb'+Date.now(),name:'Imported',icon:'📥',project:A.currentProject};
      if(!A.notebooks.find(n=>n.id===nb.id)) A.notebooks.push(nb);
      if(!A.pages[nb.id]) A.pages[nb.id]=[];
      A.pages[nb.id].push({id:'pg'+Date.now(),name:f.name.replace(/\.[^.]+$/,''),type:'rich',content:'<p>'+esc(e.target.result).replace(/\n/g,'</p><p>')+'</p>'});
      saveA();renderSB();toast('✅ Imported '+f.name);
    };
    reader.readAsText(f);
  } else if(f.type.startsWith('image/')){
    reader.onload=e=>{
      const nb=A.notebooks[0];
      if(!nb) return;
      if(!A.pages[nb.id]) A.pages[nb.id]=[];
      A.pages[nb.id].push({id:'pg'+Date.now(),name:f.name,type:'rich',content:`<img src="${e.target.result}" style="max-width:100%">`});
      saveA();renderSB();toast('✅ Imported image');
    };
    reader.readAsDataURL(f);
  } else {
    toast('File type not directly supported. Use JSON export for full import.');
  }
}
function importAll(d){
  merge(d);saveA();applySettings();renderSB();toast('✅ Import complete!');
}
