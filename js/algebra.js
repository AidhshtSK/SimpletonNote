// ═══════════════════════════════════════════
// ALGEBRA SOLVER (with insert-to-editor button)
// ═══════════════════════════════════════════
let _algFromEditor=false;

function openAlgebra(){
  _algFromEditor=false;
  A.activeView='algebra';
  document.getElementById('tbtit').innerHTML='<strong>⚡ Algebra Solver</strong>';
  document.getElementById('tpl-btn').style.display='none';
  document.getElementById('exp-btn').style.display='none';
  buildAlgebraUI();
}

// Called from rich text toolbar - opens floating panel
function showAlgebraInline(){
  const panel=document.getElementById('alg-panel');
  if(!panel) return;
  if(panel.classList.contains('open')){closeAlgPanel();return;}
  const examples=['2x+4=10','x^2-5x+6=0','3x-7=2x+1','x^2+2x+1=0','5x=25','x^2=16'];
  panel.innerHTML=`
    <div class="alg-ph">
      <span class="alg-ph-tit">⚡ Algebra Solver</span>
      <span style="font-size:11px;color:var(--ac2);padding:2px 8px;background:rgba(124,106,245,.15);border-radius:10px;margin-right:6px">inserts into page</span>
      <button class="alg-close-btn" onclick="closeAlgPanel()" title="Close">✕</button>
    </div>
    <div class="alg-pbody">
      <div style="display:flex;gap:6px;margin-bottom:10px">
        <input class="alg-i" id="alg-pi" placeholder="e.g. 2x+4=10" style="flex:1" onkeydown="if(event.key==='Enter')solvePanelAlg()">
        <input class="alg-i alg-vr" id="alg-pv" placeholder="var" value="x" style="max-width:52px">
        <button class="alg-go" onclick="solvePanelAlg()">Go</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">${examples.map(ex=>`<div class="alg-ex" style="font-size:11px;padding:3px 8px;cursor:pointer" onclick="document.getElementById('alg-pi').value='${ex}';solvePanelAlg()">${ex}</div>`).join('')}</div>
      <div id="alg-po"></div>
    </div>`;
  panel.classList.add('open');
  panel.style.display='flex';
  panel.style.flexDirection='column';
  setTimeout(()=>document.getElementById('alg-pi')?.focus(),60);
}
function closeAlgPanel(){
  const panel=document.getElementById('alg-panel');
  if(panel){panel.classList.remove('open');panel.style.display='none';}
}
function solvePanelAlg(){
  const eq=(document.getElementById('alg-pi')?.value||'').trim();
  const vr=(document.getElementById('alg-pv')?.value||'x').trim();
  const out=document.getElementById('alg-po');
  if(!eq||!out) return;
  try{
    const res=solveEq(eq,vr);
    let html2=`<div class="alg-steps" style="margin-bottom:9px">`;
    res.steps.forEach((s,i)=>{html2+=`<div class="alg-step"><div class="asn">${i+1}</div><div class="asc"><div class="asd">${esc(s.desc)}</div><div class="ase">${esc(s.eq)}</div></div></div>`;});
    html2+=`</div>`;
    html2+=`<div class="alg-ans"><div class="ans-lbl">Solution</div><div class="ans-val">${vr} = ${esc(res.answer)}</div></div>`;
    html2+=`<div style="display:flex;gap:6px;margin-top:10px">
      <button class="alg-ins-btn" style="flex:1" onclick="insertPanelResult('${esc(vr)}','${esc(res.answer)}','${encodeURIComponent(JSON.stringify(res.steps))}',false)">↩ Insert Answer</button>
      <button class="alg-ins-btn" style="flex:1" onclick="insertPanelResult('${esc(vr)}','${esc(res.answer)}','${encodeURIComponent(JSON.stringify(res.steps))}',true)">↩ Insert Full Steps</button>
    </div>`;
    out.innerHTML=html2;
  }catch(e){
    out.innerHTML=`<div class="alg-err">❌ ${esc(e.message)}</div>`;
  }
}
function insertPanelResult(v,ans,stepsEnc,full){
  const steps=JSON.parse(decodeURIComponent(stepsEnc));
  const eb=document.getElementById('eb');
  if(!eb){toast('Open a rich text page first');return;}
  let html2='';
  if(full){
    html2=`<div style="border:1px solid var(--bd);border-radius:9px;padding:12px;margin:10px 0;background:var(--bg2)">`;
    html2+=`<div style="font-size:11px;color:var(--t3);margin-bottom:7px;text-transform:uppercase;letter-spacing:.7px">⚡ Algebra Solution</div>`;
    steps.forEach((s,i)=>{
      html2+=`<div style="display:flex;gap:7px;margin-bottom:5px;align-items:flex-start">
        <span style="background:var(--ac);color:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0">${i+1}</span>
        <span style="font-size:13px;color:var(--t2)">${esc(s.desc)}: <code style="background:var(--bg3);padding:1px 4px;border-radius:3px">${esc(s.eq)}</code></span>
      </div>`;
    });
    html2+=`<div style="font-size:15px;font-weight:600;color:var(--t);margin-top:7px;padding:6px 10px;background:var(--bg3);border-radius:6px;border-left:3px solid var(--ac)">${v} = ${esc(ans)}</div>`;
    html2+='</div>';
  } else {
    html2=`<p>⚡ <strong>${v} = ${esc(ans)}</strong></p>`;
  }
  eb.focus();
  document.execCommand('insertHTML',false,html2);
  if(_curPg){_curPg.content=eb.innerHTML;saveA();}
  toast('✅ Inserted into page');
  closeAlgPanel();
}

function buildAlgebraUI(fromEditor=false){
  const examples=['2x+4=10','x^2-5x+6=0','3x-7=2x+1','x^2+2x+1=0','(x+1)(x-2)=0','5x=25','x^2=16','2x^2+3x-2=0'];
  document.getElementById('con').innerHTML=`<div id="algw">
    ${fromEditor?`<div style="padding:6px 12px;background:rgba(124,106,245,.1);border-bottom:1px solid var(--bd);font-size:12px;color:var(--ac2);display:flex;align-items:center;gap:7px">
      <span>⚡ Algebra mode — solved results will be inserted into your document</span>
      <button class="ib" onclick="openPage('${A.activeNotebook||''}','${A.activePage||''}')">← Back to page</button>
    </div>`:''}
    <div style="flex:1;overflow-y:auto;display:flex;justify-content:center">
    <div class="alg-wrap">
      <div class="alg-h">∫ Algebra Solver</div>
      <div class="alg-s">Enter an equation to solve step-by-step</div>
      <div class="alg-row">
        <input class="alg-i" id="alg-eq" placeholder="e.g. 2x+4=10" onkeydown="if(event.key==='Enter') solveAlg()">
        <input class="alg-i alg-vr" id="alg-var" placeholder="var" value="x" style="max-width:65px">
        <button class="alg-go" onclick="solveAlg()">Solve</button>
      </div>
      <div class="alg-exs">${examples.map(ex=>`<div class="alg-ex" onclick="document.getElementById('alg-eq').value='${ex}';solveAlg()">${ex}</div>`).join('')}</div>
      <div id="alg-out"></div>
    </div>
    </div>
  </div>`;
  document.getElementById('alg-eq')?.focus();
}

function solveAlg(){
  const eq=(document.getElementById('alg-eq')?.value||'').trim();
  const vr=(document.getElementById('alg-var')?.value||'x').trim();
  const out=document.getElementById('alg-out');
  if(!eq||!out) return;
  try{
    const res=solveEq(eq,vr);
    let html=`<div class="alg-steps">`;
    res.steps.forEach((s,i)=>{html+=`<div class="alg-step"><div class="asn">${i+1}</div><div class="asc"><div class="asd">${esc(s.desc)}</div><div class="ase">${esc(s.eq)}</div></div></div>`;});
    html+=`</div>`;
    html+=`<div class="alg-ans"><div class="ans-lbl">Solution</div><div class="ans-val">${vr} = ${esc(res.answer)}</div></div>`;
    if(_algFromEditor){
      html+=`<div style="display:flex;gap:7px;margin-top:9px">
        <button class="alg-ins-btn" onclick="insertAlgResult('${esc(vr)}','${esc(res.answer)}','${encodeURIComponent(JSON.stringify(res.steps))}',false)">Insert Answer Only</button>
        <button class="alg-ins-btn" onclick="insertAlgResult('${esc(vr)}','${esc(res.answer)}','${encodeURIComponent(JSON.stringify(res.steps))}',true)">Insert Full Solution</button>
      </div>`;
    }
    out.innerHTML=html;
  } catch(e){
    out.innerHTML=`<div class="alg-err">❌ ${esc(e.message)}</div>`;
  }
}

function insertAlgResult(v,ans,stepsEnc,full){
  const steps=JSON.parse(decodeURIComponent(stepsEnc));
  const nb=A.notebooks.find(n=>(A.pages[n.id]||[]).some(p=>p.id===A.activePage));
  if(!nb||!A.activePage) {toast('No page to insert into');return;}
  openPage(nb.id,A.activePage);
  setTimeout(()=>{
    const eb=document.getElementById('eb');
    if(!eb) return;
    let html='';
    if(full){
      html+=`<div style="border:1px solid var(--bd);border-radius:9px;padding:12px;margin:10px 0;background:var(--bg2)">`;
      html+=`<div style="font-size:12px;color:var(--t3);margin-bottom:7px;text-transform:uppercase;letter-spacing:.7px">⚡ Algebra Solution</div>`;
      html+=`<div style="font-size:11px;color:var(--t2);margin-bottom:6px">Equation: ${document.getElementById('alg-eq')?.value||''}</div>`;
      steps.forEach((s,i)=>{
        html+=`<div style="display:flex;gap:7px;margin-bottom:5px;align-items:flex-start">
          <span style="background:var(--ac);color:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0">${i+1}</span>
          <span style="font-size:13px;color:var(--t2)">${esc(s.desc)}: <code style="background:var(--bg3);padding:1px 4px;border-radius:3px">${esc(s.eq)}</code></span>
        </div>`;
      });
      html+=`<div style="font-size:15px;font-weight:600;color:var(--t);margin-top:7px;padding:6px 10px;background:var(--bg3);border-radius:6px;border-left:3px solid var(--ac)">${v} = ${esc(ans)}</div>`;
      html+='</div>';
    } else {
      html=`<p>Result: <strong>${v} = ${esc(ans)}</strong></p>`;
    }
    document.execCommand('insertHTML',false,html);
    if(_curPg){_curPg.content=eb.innerHTML;saveA();}
    toast('✅ Inserted into page');
    _algFromEditor=false;
  },120);
}

// ── ALGEBRA ENGINE ──
function solveEq(eq,v='x'){
  eq=eq.replace(/\s/g,'');
  const steps=[];
  // Check factored form: (x+a)(x+b)=0
  const fm=eq.match(/^\(([^)]+)\)\(([^)]+)\)=0$/);
  if(fm){
    const r1=solveLinear(fm[1]+'=0',v);
    const r2=solveLinear(fm[2]+'=0',v);
    steps.push({desc:'Factored form',eq:eq});
    steps.push({desc:'Factor 1',eq:fm[1]+'=0 → '+v+'='+r1});
    steps.push({desc:'Factor 2',eq:fm[2]+'=0 → '+v+'='+r2});
    return {steps,answer:v+'='+r1+' or '+v+'='+r2};
  }
  const parts=eq.split('=');
  if(parts.length!==2) throw new Error('Equation must contain exactly one "="');
  let lhs=parts[0],rhs=parts[1];
  steps.push({desc:'Original',eq:lhs+'='+rhs});
  // Move all to left: lhs - rhs = 0
  const combined=lhs+'-('+rhs+')';
  const expanded=expand(combined);
  if(expanded!==combined) steps.push({desc:'Expand',eq:expanded+'=0'});
  const {coeffs,rem}=collectTerms(expanded,v);
  const a=coeffs[2]||0,b=coeffs[1]||0,c=(coeffs[0]||0)+rem;
  if(a!==0){
    // Quadratic
    steps.push({desc:'Standard form',eq:`${fmtCoeff(a)}${v}²${fmtCoeffSign(b)}${v}${fmtSign(c)}=0`});
    const disc=b*b-4*a*c;
    steps.push({desc:'Discriminant',eq:`Δ = ${b}²-4·${a}·${c} = ${disc}`});
    if(disc<0) throw new Error('No real solutions (discriminant < 0)');
    if(disc===0){
      const ans=round(-b/(2*a));
      steps.push({desc:'Double root',eq:`${v} = ${-b}/(2·${a}) = ${ans}`});
      return {steps,answer:String(ans)};
    }
    const s1=round((-b+Math.sqrt(disc))/(2*a));
    const s2=round((-b-Math.sqrt(disc))/(2*a));
    steps.push({desc:'Quadratic formula',eq:`${v} = (${-b} ± √${disc}) / ${2*a}`});
    steps.push({desc:'Solutions',eq:`${v} = ${s1} or ${v} = ${s2}`});
    return {steps,answer:`${s1} or ${s2}`};
  }
  if(b!==0){
    // Linear
    if(c!==0){
      steps.push({desc:'Move constant',eq:`${fmtCoeff(b)}${v} = ${-c}`});
      const ans=round(-c/b);
      steps.push({desc:'Divide both sides by '+b,eq:`${v} = ${-c}/${b} = ${ans}`});
      return {steps,answer:String(ans)};
    }
    steps.push({desc:'Trivial',eq:`${v} = 0`});
    return {steps,answer:'0'};
  }
  throw new Error('No variable found or equation is an identity');
}

function expand(expr){
  // Handle -(…) by distributing minus
  let s=expr.replace(/\-\(([^)]+)\)/g,(m,inner)=>{
    return inner.replace(/([+-]?\d*\.?\d*[a-z²^]?[a-z]?)/g,t=>{
      if(!t) return '';
      if(t.startsWith('-')) return '+'+t.slice(1);
      if(t.startsWith('+')) return '-'+t.slice(1);
      return '-'+t;
    });
  });
  return s.replace(/\+\+/g,'+').replace(/\+-/g,'-').replace(/--/g,'+');
}

function collectTerms(expr,v){
  // Returns {coeffs:[const,linear,quad], rem}
  const c=[0,0,0];
  const tokens=expr.match(/[+-]?[^+-]+/g)||[];
  tokens.forEach(tok=>{
    tok=tok.trim();
    if(!tok) return;
    if(tok.includes(v+'²')||tok.includes(v+'^2')||tok.includes(v+'2')){
      const n=parseFloat(tok.replace(v+'²','').replace(v+'^2','').replace(v+'2','').replace(v,''))||1;
      c[2]+=isNaN(n)?1:n;
    } else if(tok.includes(v)){
      const nstr=tok.replace(v,'').trim()||'1';
      const n=parseFloat(nstr);
      c[1]+=isNaN(n)?(nstr==='-'?-1:1):n;
    } else {
      const n=parseFloat(tok);
      if(!isNaN(n)) c[0]+=n;
    }
  });
  return {coeffs:c,rem:0};
}

function solveLinear(eq,v){
  const parts=eq.split('=');
  const lhs=parts[0],rhs=parts[1]||'0';
  const combined=lhs+'-('+rhs+')';
  const {coeffs}=collectTerms(expand(combined),v);
  const b=coeffs[1]||0,c=coeffs[0]||0;
  if(b===0) return '?';
  return String(round(-c/b));
}

function fmtCoeff(n){return n===1?'':(n===-1?'-':String(n));}
function fmtCoeffSign(n){if(n===0) return '';return n>0?'+'+fmtCoeff(n):fmtCoeff(n);}
function fmtSign(n){if(n===0) return '';return n>0?'+'+n:String(n);}
function round(n,d=6){return parseFloat(n.toFixed(d));}
