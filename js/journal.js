// ═══════════════════════════════════════════
// JOURNAL
// ═══════════════════════════════════════════
let _jCal={y:new Date().getFullYear(),m:new Date().getMonth()};
let _jDate=new Date().toISOString().slice(0,10);
const MOODS=['😊 Happy','😌 Calm','😤 Stressed','😢 Sad','🤩 Excited','😴 Tired','😐 Neutral'];
const HABITS=['🏃 Exercise','💧 Water','📚 Read','🧘 Meditate','😴 8h Sleep','🥗 Healthy Eat','📵 No Screens'];

function openJournal(){
  A.activeView='journal';
  document.getElementById('tbtit').innerHTML='<strong>📅 Daily Journal</strong>';
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('exp-btn').style.display='none';
  renderJournal();
}

function renderJournal(){
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const days=['Su','Mo','Tu','We','Th','Fr','Sa'];
  const {y,m}=_jCal;
  const first=new Date(y,m,1).getDay();
  const total=new Date(y,m+1,0).getDate();
  const today=new Date().toISOString().slice(0,10);
  let calHtml=days.map(d=>`<div class="jcdl">${d}</div>`).join('');
  for(let i=0;i<first;i++) calHtml+=`<div class="jcd emp"></div>`;
  for(let d=1;d<=total;d++){
    const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday=ds===today,isSel=ds===_jDate,hasEntry=!!A.journalEntries[ds]?.content;
    calHtml+=`<div class="jcd${isToday?' tod':''}${isSel&&!isToday?' sel':''}${hasEntry?' he':''}" onclick="selJDay('${ds}')">${d}</div>`;
  }
  // List of recent entries
  const entries=Object.entries(A.journalEntries).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,12);
  const listHtml=entries.map(([ds,e])=>`<div class="jditem${_jDate===ds?' on':''}" onclick="selJDay('${ds}')">
    <div class="jddate">${ds}</div>
    <div class="jdprev">${e.mood||''} ${(e.content||'').slice(0,38)}</div>
  </div>`).join('');
  document.getElementById('con').innerHTML=`<div id="jw">
    <div id="jleft">
      <div class="jcal">
        <div class="jcnav">
          <button onclick="_jCal.m--;if(_jCal.m<0){_jCal.m=11;_jCal.y--}renderJournal()">‹</button>
          <span class="jcmon">${months[m]} ${y}</span>
          <button onclick="_jCal.m++;if(_jCal.m&gt;11){_jCal.m=0;_jCal.y++}renderJournal()">›</button>
        </div>
        <div class="jcg">${calHtml}</div>
      </div>
      <div class="jdlist">${listHtml||'<p style="padding:8px;font-size:12px;color:var(--t3)">No entries yet</p>'}</div>
    </div>
    <div id="jright"></div>
  </div>`;
  if(_jDate) renderJEntry(_jDate);
}

function selJDay(ds){_jDate=ds;renderJournal();}

function renderJEntry(ds){
  const right=document.getElementById('jright');
  if(!right) return;
  const e=A.journalEntries[ds]||{};
  const d=new Date(ds+'T12:00:00');
  const wdays=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const mons=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const label=`${wdays[d.getDay()]}, ${mons[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  right.innerHTML=`<div class="jhdr">
    <div class="jdtit">${label}</div>
    <div class="mrow" style="margin-top:7px">${MOODS.map(mo=>`<div class="mc${e.mood===mo?' on':''}" onclick="setMood('${ds}','${mo.replace(/'/g,"\\'")}',this)">${mo}</div>`).join('')}</div>
  </div>
  <div class="jdbody">
    ${jSec('✍️ Daily Reflection',`<div class="jrea" contenteditable="true" data-ph="How was your day?" oninput="saveJ('${ds}','content',this.textContent)">${esc(e.content||'')}</div>`,true)}
    ${jSec('🙏 Gratitude',`<div>${[0,1,2].map(i=>`<div class="gitem"><span class="gnum">${i+1}</span><input type="text" placeholder="I'm grateful for…" value="${esc((e.gratitude||[])[i]||'')}" oninput="saveGrat('${ds}',${i},this.value)"></div>`).join('')}</div>`,true)}
    ${jSec('🎯 Habits',`<div class="hgrid">${HABITS.map(h=>`<div class="hchip${(e.habits||[]).includes(h)?' done':''}" onclick="toggleHabit('${ds}','${h.replace(/'/g,"\\'")}',this)"><span>${(e.habits||[]).includes(h)?'✓':'○'}</span> ${h}</div>`).join('')}</div>`,true)}
    ${jSec('🌅 Tomorrow\'s Plan',`<div class="jrea" contenteditable="true" data-ph="What will you do tomorrow?" oninput="saveJ('${ds}','tomorrow',this.textContent)">${esc(e.tomorrow||'')}</div>`,false)}
    ${jSec('💡 One Insight',`<div class="jrea" contenteditable="true" data-ph="What did you learn today?" oninput="saveJ('${ds}','insight',this.textContent)">${esc(e.insight||'')}</div>`,false)}
  </div>`;
}
function jSec(title,content,open=true){
  const id='jsec'+uid();
  return `<div class="jsec">
    <div class="jstit" onclick="toggleJSec('${id}')"><span class="jarr">${open?'▼':'▶'}</span> ${title}</div>
    <div class="jscon${open?'':' clp'}" id="${id}" style="max-height:${open?'999px':'0'}">${content}</div>
  </div>`;
}
function toggleJSec(id){
  const el=document.getElementById(id);if(!el) return;
  const clp=el.classList.toggle('clp');
  el.style.maxHeight=clp?'0':'999px';
  const arr=el.previousElementSibling?.querySelector('.jarr');
  if(arr) arr.textContent=clp?'▶':'▼';
}
function saveJ(ds,key,val){
  if(!A.journalEntries[ds]) A.journalEntries[ds]={};
  A.journalEntries[ds][key]=val;
  saveA();
}
function saveGrat(ds,i,val){
  if(!A.journalEntries[ds]) A.journalEntries[ds]={};
  if(!A.journalEntries[ds].gratitude) A.journalEntries[ds].gratitude=['','',''];
  A.journalEntries[ds].gratitude[i]=val;
  saveA();
}
function toggleHabit(ds,h,el){
  if(!A.journalEntries[ds]) A.journalEntries[ds]={};
  const arr=A.journalEntries[ds].habits||[];
  const i=arr.indexOf(h);
  if(i>-1) arr.splice(i,1); else arr.push(h);
  A.journalEntries[ds].habits=arr;
  el.classList.toggle('done',arr.includes(h));
  el.querySelector('span').textContent=arr.includes(h)?'✓':'○';
  saveA();
}
function setMood(ds,mood,el){
  if(!A.journalEntries[ds]) A.journalEntries[ds]={};
  A.journalEntries[ds].mood=mood;
  document.querySelectorAll('.mc').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');saveA();
}


