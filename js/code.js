// ═══════════════════════════════════════════
// CODE EDITOR
// ═══════════════════════════════════════════
function openCode(pg){
  _curPg=pg;
  document.getElementById('exp-btn').style.display='';
  document.getElementById('exp-btn').textContent='↗ Download';
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('con').innerHTML=`<div id="cdw">
    <div class="cdhdr">
      <input class="cdtit" id="cdtit" value="${esc(pg.name)}" placeholder="Script name…" oninput="pgRename(this.value)">
      <select class="tsel" id="cd-lang" onchange="updateCLang(this.value)">
        <option>javascript</option><option>python</option><option>java</option><option>c++</option>
        <option>c</option><option>rust</option><option>go</option><option>html</option>
        <option>css</option><option>sql</option><option>bash</option><option>typescript</option>
      </select>

    </div>
    <div class="code-panels" style="position:relative">
      <textarea id="ce" placeholder="// Write your code here…" spellcheck="false"></textarea>
      <pre id="ce-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;margin:0;padding:20px;pointer-events:none;font-family:'DM Mono',monospace;font-size:14px;line-height:1.6;overflow:auto;background:transparent;border:none;display:none;white-space:pre-wrap;word-wrap:break-word"></pre>
      <div id="crp">
        <div class="ptabs" style="display:none">
          <button class="ptab on" id="ptab-note" onclick="showPTab('note')">Notes</button>
        </div>
        <textarea id="cno" placeholder="Notes about this code…" style="display:block"></textarea>
      </div>
    </div>
  </div>`;
  const ce=document.getElementById('ce');
  ce.value=pg.codeContent||'';
  if(pg.codeLang) document.getElementById('cd-lang').value=pg.codeLang;
  ce.addEventListener('input',()=>{pg.codeContent=ce.value;clearTimeout(_asTimer);_asTimer=setTimeout(saveA,700);});
  ce.addEventListener('keydown',e=>{
    if(e.key==='Tab'){e.preventDefault();const s=ce.selectionStart,en=ce.selectionEnd;ce.value=ce.value.slice(0,s)+'  '+ce.value.slice(en);ce.selectionStart=ce.selectionEnd=s+2;}
  });
  // Apply Prism highlighting overlay when focus leaves textarea
  ce.addEventListener('blur',()=>applyPrismOverlay(pg));
  ce.addEventListener('focus',()=>hidePrismOverlay());
  const cno=document.getElementById('cno');
  cno.value=pg.notes||'';
  cno.addEventListener('input',()=>{pg.notes=cno.value;clearTimeout(_asTimer);_asTimer=setTimeout(saveA,700);});
}
function showPTab(t){
  document.getElementById('cro').style.display=t==='out'?'block':'none';
  document.getElementById('cno').style.display=t==='note'?'block':'none';
  document.querySelectorAll('.ptab').forEach(b=>b.classList.remove('on'));
  document.getElementById('ptab-'+t)?.classList.add('on');
}
function updateCLang(lang){if(_curPg){_curPg.codeLang=lang;saveA();}}
function runCode(){
  const lang=document.getElementById('cd-lang')?.value;
  const code=document.getElementById('ce')?.value||'';
  const out=document.getElementById('cro');
  if(!out) return;
  out.style.color='var(--gr)';
  if(lang!=='javascript'){out.innerHTML=`<div style="color:var(--t3)">Only JavaScript can run in browser.</div>`;showPTab('out');return;}
  showPTab('out');
  const logs=[];const orig=console.log,origE=console.error,origW=console.warn;
  console.log=(...a)=>{logs.push({t:'log',m:a.map(x=>typeof x==='object'?JSON.stringify(x,null,2):String(x)).join(' ')});orig(...a);};
  console.error=(...a)=>{logs.push({t:'err',m:a.join(' ')});origE(...a);};
  console.warn=(...a)=>{logs.push({t:'warn',m:a.join(' ')});origW(...a);};
  try{const r=eval(code);if(r!==undefined) logs.push({t:'ret',m:'→ '+String(r)});}
  catch(e){logs.push({t:'err',m:'❌ '+e.message});}
  console.log=orig;console.error=origE;console.warn=origW;
  out.innerHTML=logs.map(l=>`<div style="color:${l.t==='err'?'var(--rd)':l.t==='warn'?'var(--yw)':l.t==='ret'?'var(--cy)':'var(--gr)'};margin-bottom:3px;white-space:pre-wrap;word-break:break-word">${esc(l.m)}</div>`).join('')
    ||'<div style="color:var(--t3)">(no output)</div>';
}
function applyPrismOverlay(pg){
  const ce=document.getElementById('ce');
  const over=document.getElementById('ce-overlay');
  if(!ce||!over) return;
  const lang=(document.getElementById('cd-lang')?.value||'javascript').replace('c++','cpp').replace('html','markup');
  over.className=`language-${lang}`;
  over.textContent=ce.value;
  if(typeof Prism!=='undefined') Prism.highlightElement(over);
  over.style.display='block';
  ce.style.color='transparent';
  ce.style.caretColor='var(--t)';
}
function hidePrismOverlay(){
  const ce=document.getElementById('ce');
  const over=document.getElementById('ce-overlay');
  if(!ce||!over) return;
  over.style.display='none';
  ce.style.color='';
}



// ═══════════════════════════════════════════
// QUIZ PAGE TYPE
// ═══════════════════════════════════════════
// Format (one quiz per line):
// Q: Question text
// A: Correct Answer
// B: Wrong option
// C: Wrong option
// D: Wrong option
// (blank line separates questions)
// Explanation: optional explanation shown after answer

function openQuiz(pg){
  _curPg=pg;
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('exp-btn').style.display='none';
  const mode=(pg.quizMode||'edit');
  document.getElementById('con').innerHTML=`<div id="qzw">
    <div class="qz-hdr">
      <input class="qz-tit" value="${esc(pg.name)}" oninput="pgRename(this.value)">
      <div class="qz-modes">
        <button class="qz-mode${mode==='edit'?' on':''}" onclick="setQZMode('edit')">✏️ Edit</button>
        <button class="qz-mode${mode==='play'?' on':''}" onclick="setQZMode('play')">▶ Play</button>
      </div>
    </div>
    <div class="qz-syntax">
      <strong>Format:</strong> &nbsp;
      <code>Q: Question</code> &nbsp;
      <code>A: Correct answer</code> &nbsp;
      <code>B: Wrong</code> &nbsp;
      <code>C: Wrong</code> &nbsp;
      <code>D: Wrong</code> &nbsp;
      (blank line = new question) &nbsp;
      <code>Explanation: …</code> optional
    </div>
    <div id="qz-mode-body" style="flex:1;overflow:hidden;display:flex;flex-direction:column"></div>
  </div>`;
  if(mode==='edit') renderQZEdit(pg);
  else renderQZPlay(pg);
}

function setQZMode(mode){
  if(!_curPg) return;
  _curPg.quizMode=mode;
  saveA();
  openQuiz(_curPg);
}

function renderQZEdit(pg){
  const body=document.getElementById('qz-mode-body');
  body.innerHTML=`<textarea id="qz-txt" placeholder="Q: What is 2+2?
A: 4
B: 3
C: 5
D: 6

Q: What planet is closest to the Sun?
A: Mercury
B: Venus
C: Earth
D: Mars
Explanation: Mercury is the innermost planet in the Solar System.
">${esc(pg.quizText||'')}</textarea>`;
  document.getElementById('qz-txt').addEventListener('input',function(){
    pg.quizText=this.value;clearTimeout(_asTimer);_asTimer=setTimeout(saveA,600);
  });
}

function parseQuiz(text){
  const questions=[];
  const blocks=(text||'').split(/\n\s*\n/);
  blocks.forEach(block=>{
    const lines=block.trim().split('\n');
    const q={q:'',options:[],correct:'',expl:''};
    lines.forEach(line=>{
      const m=line.match(/^([A-Da-d]|Q|Explanation):\s*(.+)/i);
      if(!m) return;
      const key=m[1].toUpperCase();
      const val=m[2].trim();
      if(key==='Q') q.q=val;
      else if(key==='A'){q.options.push({letter:'A',text:val});q.correct='A';}
      else if(key==='B') q.options.push({letter:'B',text:val});
      else if(key==='C') q.options.push({letter:'C',text:val});
      else if(key==='D') q.options.push({letter:'D',text:val});
      else if(key==='EXPLANATION') q.expl=val;
    });
    // Shuffle options for play mode (keep A as correct before shuffle)
    if(q.q&&q.options.length>=2) questions.push(q);
  });
  return questions;
}

function renderQZPlay(pg){
  const qs=parseQuiz(pg.quizText);
  if(!qs.length){
    document.getElementById('qz-mode-body').innerHTML=`<div style="display:flex;align-items:center;justify-content:center;flex:1;flex-direction:column;gap:10px;color:var(--t3)">
      <div style="font-size:32px">❓</div><p>No questions yet.</p>
      <button class="qz-mode on" onclick="setQZMode('edit')">✏️ Add Questions</button></div>`;
    return;
  }
  // Shuffle options per question
  const shuffled=qs.map(q=>{
    const opts=[...q.options];
    for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}
    return {...q,options:opts};
  });
  pg._qsPlay=shuffled;pg._qIdx=0;pg._qScore=0;pg._qResults=[];
  renderQZCard(pg);
}

function renderQZCard(pg){
  const body=document.getElementById('qz-mode-body');
  const qs=pg._qsPlay;
  if(!qs){renderQZPlay(pg);return;}
  if(pg._qIdx>=qs.length){renderQZFinish(pg);return;}
  const q=qs[pg._qIdx];
  const letters=['A','B','C','D'];
  body.innerHTML=`<div id="qz-play" style="display:flex;flex-direction:column;align-items:center;overflow-y:auto;padding:20px">
    <div class="qprog">${qs.map((_,i)=>`<div class="qpdot${i<pg._qIdx?pg._qResults[i]?'done':'wrong-dot':i===pg._qIdx?' cur':''}"></div>`).join('')}</div>
    <div class="qscore">Question ${pg._qIdx+1} of ${qs.length} &nbsp;·&nbsp; Score: ${pg._qScore}</div>
    <div class="qcard">
      <div class="qcard-n">${q.q?'':'Question '+(pg._qIdx+1)}</div>
      <div class="qcard-q">${esc(q.q)}</div>
      <div class="qopts" id="qopts">
        ${q.options.map((o,i)=>`<div class="qopt" data-letter="${o.letter}" onclick="answerQ('${o.letter}','${q.correct}',${pg._qIdx})">
          <div class="qopt-letter">${letters[i]}</div>
          <span>${esc(o.text)}</span>
        </div>`).join('')}
      </div>
      ${q.expl?`<div id="qexpl" style="display:none;font-size:13px;color:var(--t3);margin-top:14px;font-style:italic;text-align:center">${esc(q.expl)}</div>`:''}
      <button class="qnext" id="qnext" style="display:none" onclick="nextQ()">Next →</button>
    </div>
  </div>`;
}

function answerQ(chosen,correct,idx){
  const opts=document.querySelectorAll('.qopt');
  opts.forEach(o=>{
    o.classList.add('answered');
    const letter=o.dataset.letter;
    if(letter===correct) o.classList.add('reveal-correct');
    if(letter===chosen&&chosen!==correct) o.classList.add('wrong');
    if(letter===chosen&&chosen===correct) o.classList.add('correct');
  });
  const correct_bool=(chosen===correct);
  if(correct_bool) _curPg._qScore++;
  _curPg._qResults[idx]=correct_bool;
  const expl=document.getElementById('qexpl');
  if(expl) expl.style.display='block';
  document.getElementById('qnext').style.display='inline-block';
}
function nextQ(){
  _curPg._qIdx++;
  renderQZCard(_curPg);
}
function renderQZFinish(pg){
  const body=document.getElementById('qz-mode-body');
  const pct=Math.round(pg._qScore/pg._qsPlay.length*100);
  const emoji=pct>=80?'🏆':pct>=60?'👍':pct>=40?'📚':'💪';
  body.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;flex:1;overflow-y:auto">
    <div class="qfinish">
      <div style="font-size:56px;margin-bottom:10px">${emoji}</div>
      <h2>${pg._qScore} / ${pg._qsPlay.length}</h2>
      <p style="font-size:16px;color:var(--t2);margin:6px 0 20px">${pct}% correct</p>
      ${pct<80?`<p style="font-size:13px;color:var(--t3);margin-bottom:18px">Keep practicing! You've got this 💪</p>`:''}
      <div style="display:flex;gap:9px;justify-content:center">
        <button class="qnext" onclick="renderQZPlay(_curPg)">🔄 Retry</button>
        <button class="qnext" style="background:var(--bg4);color:var(--t2)" onclick="setQZMode('edit')">✏️ Edit</button>
      </div>
    </div>
  </div>`;
}


