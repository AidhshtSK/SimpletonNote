// ═══════════════════════════════════════════
// CANVAS (INFINITE + FINITE) - TABLET OPTIMIZED
// ═══════════════════════════════════════════
const CS = {
  tool:'pen',color:'#7c6af5',size:4,bg:'lined',opacity:1,
  drawing:false,panning:false,spaceDown:false,
  strokes:[],redo:[],
  scale:1,ox:0,oy:0,
  lastX:0,lastY:0,
  shape:null,shapeStart:null,fillShape:false,
  pts:[],lastT:0,
  // Selection
  selected:null, selBox:null, selDrag:false, selDragOff:{x:0,y:0},
  // Toolbar drag
  tbDragging:false,tbX:null,tbY:null,tbDragOff:{x:0,y:0},
  // Color presets per tool
  penColors:['#7c6af5','#f87171','#4ade80','#fbbf24','#22d3ee'],
  pencilColors:['#e8e8f0','#9090a8','#4ade80','#fbbf24','#fb923c'],
};

function smoothPoints(pts,tension=0.4,steps=8){
  if(pts.length<3) return pts;
  const out=[];
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[Math.max(0,i-1)];
    const p1=pts[i];
    const p2=pts[Math.min(pts.length-1,i+1)];
    const p3=pts[Math.min(pts.length-1,i+2)];
    for(let s=0;s<steps;s++){
      const t=s/steps,t2=t*t,t3=t2*t;
      const m1={x:tension*(p2.x-p0.x),y:tension*(p2.y-p0.y)};
      const m2={x:tension*(p3.x-p1.x),y:tension*(p3.y-p1.y)};
      out.push({
        x:(2*t3-3*t2+1)*p1.x+(t3-2*t2+t)*m1.x+(-2*t3+3*t2)*p2.x+(t3-t2)*m2.x,
        y:(2*t3-3*t2+1)*p1.y+(t3-2*t2+t)*m1.y+(-2*t3+3*t2)*p2.y+(t3-t2)*m2.y,
        p:p1.p||1
      });
    }
  }
  out.push(pts[pts.length-1]);
  return out;
}

function openInfCanvas(pg){ _curPg=pg; buildCanvasUI(pg,true); }
function openFinCanvas(pg){ _curPg=pg; buildCanvasUI(pg,false); }

function buildCanvasUI(pg,infinite){
  document.getElementById('exp-btn').style.display=infinite?'none':'';
  document.getElementById('exp-btn').textContent='💾 PNG';
  document.getElementById('tpl-btn').style.display='none';
  // Default toolbar position (centered bottom)
  CS.tbX=null; CS.tbY=null;
  document.getElementById('con').innerHTML=`
    <div id="cvw">
      <canvas id="cv"></canvas>
      <div class="cv-zoom">
        <button class="czb" onclick="cvZoom(1.25,null,null)" title="Zoom In">+</button>
        <div class="czoom-lbl" id="czlbl">100%</div>
        <button class="czb" onclick="cvZoom(0.8,null,null)" title="Zoom Out">-</button>
        <button class="czb" onclick="cvReset()" title="Reset View" style="font-size:12px">⊡</button>
      </div>
      <div class="cvtb" id="cvtb">
        <div class="cvtb-drag" id="cvtb-grip" title="Drag to move toolbar">⠿</div>
        <button class="cvb on" id="cvb-pen" onclick="setCVTool('pen',this)" title="Pen">✏️</button>
        <button class="cvb" id="cvb-pencil" onclick="setCVTool('pencil',this)" title="Pencil">✒️</button>
        <button class="cvb" id="cvb-hl" onclick="setCVTool('highlight',this)" title="Highlight">🖊</button>
        <button class="cvb" id="cvb-sel" onclick="setCVTool('select',this)" title="Select">⬚</button>
        <button class="cvb" id="cvb-er" onclick="setCVTool('eraser',this)" title="Erase stroke">🧹</button>
        <button class="cvb" id="cvb-pan" onclick="setCVTool('pan',this)" title="Pan (or hold Space)">✋</button>
        <div class="cvsep"></div>
        <button class="cvb" id="cvb-rect" onclick="setCVShape('rect',this)" title="Rectangle">▭</button>
        <button class="cvb" id="cvb-circ" onclick="setCVShape('circle',this)" title="Circle">○</button>
        <button class="cvb" id="cvb-line" onclick="setCVShape('line',this)" title="Line">╱</button>
        <button class="cvb" id="cvb-arr" onclick="setCVShape('arrow',this)" title="Arrow">→</button>
        <button class="cvb" id="cvb-tri" onclick="setCVShape('triangle',this)" title="Triangle">△</button>
        <button class="cvb" id="cvb-fill" onclick="toggleCVFill(this)" title="Fill shapes">⬛</button>
        <div class="cvsep"></div>
        <div class="cv-color-row" id="cv-color-row">
          ${['#7c6af5','#f87171','#4ade80','#fbbf24','#22d3ee','#f472b6','#fff','#111'].map(c=>`<div class="ccd${CS.color===c?' on':''}" style="background:${c}" onclick="setCVColor('${c}',this)"></div>`).join('')}
          <div class="cpw" style="display:inline-flex;align-items:center" title="Custom color">
            <div class="ccd" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)"></div>
            <input type="color" onchange="setCVColor(this.value,null)">
          </div>
        </div>
        <div class="cvsep"></div>
        <input type="range" class="szsl" min="1" max="28" value="${CS.size}" oninput="CS.size=+this.value" title="Brush size">
        <div class="cvsep"></div>
        <button class="bgtg on" id="bg-lined" onclick="setCVBg('lined',this)">Lines</button>
        <button class="bgtg" id="bg-graph" onclick="setCVBg('graph',this)">Grid</button>
        <button class="bgtg" id="bg-blank" onclick="setCVBg('blank',this)">Blank</button>
        <div class="cvsep"></div>
        <button class="cvb" onclick="cvUndo()" title="Undo">↩</button>
        <button class="cvb" onclick="cvRedo()" title="Redo">↪</button>
        <button class="cvb" onclick="cvClear()" title="Clear">🗑</button>
      </div>
      <!-- Shape popup menu -->
      <div id="cv-shape-popup" class="cv-shape-popup" style="display:none">
        <button onclick="setSelectedFill(false)">◻ Outline</button>
        <button onclick="setSelectedFill(true)">◼ Filled</button>
        <button onclick="setSelectedFill('translucent')">◈ Translucent</button>
        <button onclick="deleteSelected()" style="color:var(--rd)">🗑 Delete</button>
      </div>
    </div>`;
  initCV(pg,infinite);
}

function initCV(pg,infinite){
  const wrap=document.getElementById('cvw');
  const cv=document.getElementById('cv');
  CS.strokes=pg.strokes||[];
  CS.redo=[];
  CS.ox=0;CS.oy=0;CS.scale=1;
  CS.selected=null;
  if(!infinite){
    cv.width=900;cv.height=600;
    cv.style.margin='auto';cv.style.marginTop='60px';
    cv.style.display='block';cv.style.borderRadius='10px';
    cv.style.border='1px solid var(--bd)';
  } else {
    cv.width=wrap.offsetWidth;cv.height=wrap.offsetHeight;
  }
  drawCV();
  initCVToolbarDrag();

  let ptrs={},pinchDist=null,pinchCenter=null;

  cv.addEventListener('pointerdown',e=>{
    cv.setPointerCapture(e.pointerId);
    ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    if(Object.keys(ptrs).length===2){
      const keys=Object.keys(ptrs);
      const dx=ptrs[keys[0]].x-ptrs[keys[1]].x;
      const dy=ptrs[keys[0]].y-ptrs[keys[1]].y;
      pinchDist=Math.sqrt(dx*dx+dy*dy);
      pinchCenter={x:(ptrs[keys[0]].x+ptrs[keys[1]].x)/2, y:(ptrs[keys[0]].y+ptrs[keys[1]].y)/2};
      return;
    }
    hideShapePopup();
    // Space held = pan regardless of tool
    if(CS.spaceDown||CS.tool==='pan'){
      CS.panning=true;CS.lastX=e.clientX;CS.lastY=e.clientY;
      cv.style.cursor='grabbing';return;
    }
    const p=cvPos(cv,e);
    if(CS.tool==='select'){
      // Check if clicking a shape
      const hit=hitTestStrokes(p);
      if(hit){
        CS.selected=hit;
        CS.selDrag=true;
        CS.selDragOff={x:p.x-strokeCenter(hit).x, y:p.y-strokeCenter(hit).y};
        showShapePopup(e.clientX,e.clientY);
      } else {
        CS.selected=null;
        CS.selBox={x1:p.x,y1:p.y,x2:p.x,y2:p.y};
      }
      drawCV();return;
    }
    if(CS.tool==='eraser'){
      // Erase stroke at point
      const hit=hitTestStrokes(p);
      if(hit){ CS.redo.push(hit); CS.strokes.splice(CS.strokes.indexOf(hit),1); drawCV(); pg.strokes=CS.strokes;saveA(); }
      return;
    }
    CS.drawing=true;CS.pts=[{...p,p:e.pressure||1}];
    CS.shapeStart=p;
    if(!CS.shape){
      const s={tool:CS.tool,color:CS.color,size:CS.size,
        opacity:CS.tool==='highlight'?.38:CS.tool==='pencil'?.65:1,pts:[p]};
      CS.strokes.push(s);
    }
  });

  cv.addEventListener('pointermove',e=>{
    ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
    const pkeys=Object.keys(ptrs);
    // Pinch zoom toward pinch center
    if(pkeys.length===2&&pinchDist!==null){
      const dx=ptrs[pkeys[0]].x-ptrs[pkeys[1]].x;
      const dy=ptrs[pkeys[0]].y-ptrs[pkeys[1]].y;
      const nd=Math.sqrt(dx*dx+dy*dy);
      const factor=nd/pinchDist;
      const rect=cv.getBoundingClientRect();
      const cx=(pinchCenter.x-rect.left);
      const cy=(pinchCenter.y-rect.top);
      zoomToward(cx,cy,factor);
      pinchDist=nd;
      drawCV();updateZoomLbl();return;
    }
    if(CS.panning){
      CS.ox+=e.clientX-CS.lastX;CS.oy+=e.clientY-CS.lastY;
      CS.lastX=e.clientX;CS.lastY=e.clientY;
      drawCV();return;
    }
    if(CS.tool==='select'&&CS.selDrag&&CS.selected){
      const p=cvPos(cv,e);
      moveStroke(CS.selected, p.x-CS.selDragOff.x, p.y-CS.selDragOff.y);
      drawCV();return;
    }
    if(CS.tool==='select'&&CS.selBox){
      const p=cvPos(cv,e);
      CS.selBox.x2=p.x;CS.selBox.y2=p.y;drawCV();return;
    }
    if(CS.tool==='eraser'&&e.buttons){
      const p=cvPos(cv,e);
      const hit=hitTestStrokes(p);
      if(hit){ CS.redo.push(hit); CS.strokes.splice(CS.strokes.indexOf(hit),1); drawCV(); pg.strokes=CS.strokes;saveA(); }
      return;
    }
    if(!CS.drawing) return;
    const p=cvPos(cv,e);
    CS.pts.push({...p,p:e.pressure||1});
    if(CS.shape){
      drawCV();drawShapePreview(p);
    } else {
      const s=CS.strokes[CS.strokes.length-1];
      if(s){s.pts=[...CS.pts];drawCV();}
    }
  });

  cv.addEventListener('pointerup',e=>{
    delete ptrs[e.pointerId];
    if(Object.keys(ptrs).length<2) pinchDist=null;
    CS.selDrag=false;
    if(CS.panning){CS.panning=false;cv.style.cursor=CS.spaceDown?'grab':CS.tool==='pan'?'grab':'crosshair';return;}
    if(CS.tool==='select'){
      if(CS.selBox){ CS.selBox=null;drawCV(); }
      return;
    }
    if(!CS.drawing) return;
    CS.drawing=false;
    const p=cvPos(cv,e);
    if(CS.shape){
      CS.strokes.push({tool:'shape',shape:CS.shape,color:CS.color,size:CS.size,
        x1:CS.shapeStart.x,y1:CS.shapeStart.y,x2:p.x,y2:p.y,opacity:1,fill:CS.fillShape});
    } else {
      const s=CS.strokes[CS.strokes.length-1];
      if(s&&s.pts) s.pts=smoothPoints(CS.pts);
    }
    CS.pts=[];drawCV();
    pg.strokes=CS.strokes;saveA();
  });

  cv.addEventListener('pointercancel',e=>{
    delete ptrs[e.pointerId];CS.drawing=false;CS.panning=false;CS.selDrag=false;
  });

  // Click on shape (single tap/click) - show popup
  cv.addEventListener('click',e=>{
    if(CS.tool==='select'){
      const p=cvPos(cv,e);
      const hit=hitTestStrokes(p);
      if(hit){ CS.selected=hit; showShapePopup(e.clientX,e.clientY); drawCV(); }
    }
  });

  if(infinite){
    // Wheel zoom toward mouse position
    cv.addEventListener('wheel',e=>{
      e.preventDefault();
      const factor=e.deltaY<0?1.1:.91;
      const rect=cv.getBoundingClientRect();
      zoomToward(e.clientX-rect.left, e.clientY-rect.top, factor);
      drawCV();updateZoomLbl();
    },{passive:false});
  }

  // Space bar pan
  window._cvSpaceHandler = e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
    if(e.code==='Space'&&!CS.spaceDown){
      CS.spaceDown=true;
      const cv2=document.getElementById('cv');
      if(cv2&&CS.tool!=='pan') cv2.style.cursor='grab';
    }
  };
  window._cvSpaceUpHandler = e=>{
    if(e.code==='Space'){
      CS.spaceDown=false;
      const cv2=document.getElementById('cv');
      if(cv2&&CS.tool!=='pan') cv2.style.cursor='crosshair';
    }
  };
  document.addEventListener('keydown',window._cvSpaceHandler);
  document.addEventListener('keyup',window._cvSpaceUpHandler);

  window.addEventListener('resize',()=>{
    if(infinite){cv.width=wrap.offsetWidth;cv.height=wrap.offsetHeight;}
    drawCV();
  });
}

function zoomToward(cx,cy,factor){
  const newScale=Math.max(.1,Math.min(10,CS.scale*factor));
  // Adjust offset so the point under cursor stays fixed
  CS.ox=cx-(cx-CS.ox)*(newScale/CS.scale);
  CS.oy=cy-(cy-CS.oy)*(newScale/CS.scale);
  CS.scale=newScale;
}

function initCVToolbarDrag(){
  const tb=document.getElementById('cvtb');
  const grip=document.getElementById('cvtb-grip');
  if(!tb||!grip) return;
  let dx=0,dy=0,startX=0,startY=0;
  grip.addEventListener('pointerdown',e=>{
    e.stopPropagation();
    grip.setPointerCapture(e.pointerId);
    CS.tbDragging=true;
    const rect=tb.getBoundingClientRect();
    CS.tbDragOff={x:e.clientX-rect.left, y:e.clientY-rect.top};
    tb.style.transition='none';
    tb.style.bottom='auto';
    tb.style.left=rect.left+'px';
    tb.style.top=rect.top+'px';
    tb.style.transform='none';
  });
  grip.addEventListener('pointermove',e=>{
    if(!CS.tbDragging) return;
    const x=e.clientX-CS.tbDragOff.x;
    const y=e.clientY-CS.tbDragOff.y;
    tb.style.left=x+'px';
    tb.style.top=y+'px';
  });
  grip.addEventListener('pointerup',()=>{ CS.tbDragging=false; });
}

// Hit test: find topmost stroke at canvas point p
function hitTestStrokes(p){
  const tol=12/CS.scale;
  for(let i=CS.strokes.length-1;i>=0;i--){
    const s=CS.strokes[i];
    if(s.tool==='shape'){
      const minX=Math.min(s.x1,s.x2)-tol,maxX=Math.max(s.x1,s.x2)+tol;
      const minY=Math.min(s.y1,s.y2)-tol,maxY=Math.max(s.y1,s.y2)+tol;
      if(p.x>=minX&&p.x<=maxX&&p.y>=minY&&p.y<=maxY) return s;
    } else if(s.pts&&s.pts.length){
      for(const pt of s.pts){
        if(Math.abs(pt.x-p.x)<tol*2&&Math.abs(pt.y-p.y)<tol*2) return s;
      }
    }
  }
  return null;
}

function strokeCenter(s){
  if(s.tool==='shape') return {x:(s.x1+s.x2)/2,y:(s.y1+s.y2)/2};
  if(s.pts&&s.pts.length){
    let sx=0,sy=0;
    s.pts.forEach(p=>{sx+=p.x;sy+=p.y;});
    return {x:sx/s.pts.length,y:sy/s.pts.length};
  }
  return {x:0,y:0};
}

function moveStroke(s,cx,cy){
  if(s.tool==='shape'){
    const hw=(s.x2-s.x1)/2,hh=(s.y2-s.y1)/2;
    s.x1=cx-hw;s.y1=cy-hh;s.x2=cx+hw;s.y2=cy+hh;
  } else if(s.pts&&s.pts.length){
    const c=strokeCenter(s);
    const dx=cx-c.x,dy=cy-c.y;
    s.pts=s.pts.map(p=>({...p,x:p.x+dx,y:p.y+dy}));
  }
}

function showShapePopup(clientX,clientY){
  const pop=document.getElementById('cv-shape-popup');
  if(!pop) return;
  pop.style.display='flex';
  pop.style.left=Math.min(clientX,window.innerWidth-160)+'px';
  pop.style.top=Math.max(8,(clientY-100))+'px';
}
function hideShapePopup(){
  const pop=document.getElementById('cv-shape-popup');
  if(pop) pop.style.display='none';
  CS.selected=null;
}
function setSelectedFill(mode){
  if(!CS.selected) return;
  if(CS.selected.tool==='shape'){
    CS.selected.fill=mode==='filled'||mode===true;
    CS.selected.opacity=mode==='translucent'?.35:1;
  } else {
    CS.selected.opacity=mode==='translucent'?.35:1;
  }
  hideShapePopup();
  drawCV();
  if(_curPg){_curPg.strokes=CS.strokes;saveA();}
}
function deleteSelected(){
  if(!CS.selected) return;
  const idx=CS.strokes.indexOf(CS.selected);
  if(idx>=0) CS.strokes.splice(idx,1);
  CS.redo=[];
  hideShapePopup();drawCV();
  if(_curPg){_curPg.strokes=CS.strokes;saveA();}
}

function cvPos(cv,e){
  const r=cv.getBoundingClientRect();
  return {x:(e.clientX-r.left-CS.ox)/CS.scale,y:(e.clientY-r.top-CS.oy)/CS.scale};
}
function cvZoom(f,cx,cy){
  const cv=document.getElementById('cv');
  if(cv&&cx==null){const r=cv.getBoundingClientRect();cx=r.width/2;cy=r.height/2;}
  zoomToward(cx||0,cy||0,f);
  drawCV();updateZoomLbl();
}
function cvReset(){CS.scale=1;CS.ox=0;CS.oy=0;drawCV();updateZoomLbl();}
function updateZoomLbl(){const l=document.getElementById('czlbl');if(l) l.textContent=Math.round(CS.scale*100)+'%';}

function drawCV(){
  const cv=document.getElementById('cv');if(!cv) return;
  const ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.save();
  ctx.translate(CS.ox,CS.oy);
  ctx.scale(CS.scale,CS.scale);
  drawCVBg(ctx,cv);
  CS.strokes.forEach(s=>{
    const isSel=s===CS.selected;
    if(s.tool==='shape') drawShape(ctx,s,isSel); else drawStroke(ctx,s,isSel);
  });
  // Draw selection box
  if(CS.selBox){
    ctx.save();
    ctx.strokeStyle='var(--ac)';ctx.lineWidth=1/CS.scale;
    ctx.setLineDash([4/CS.scale]);
    ctx.strokeRect(CS.selBox.x1,CS.selBox.y1,CS.selBox.x2-CS.selBox.x1,CS.selBox.y2-CS.selBox.y1);
    ctx.restore();
  }
  ctx.restore();
}

function drawShapePreview(p2){
  const cv=document.getElementById('cv');if(!cv) return;
  const ctx=cv.getContext('2d');
  ctx.save();ctx.translate(CS.ox,CS.oy);ctx.scale(CS.scale,CS.scale);
  drawShape(ctx,{tool:'shape',shape:CS.shape,color:CS.color,size:CS.size,
    x1:CS.shapeStart.x,y1:CS.shapeStart.y,x2:p2.x,y2:p2.y,opacity:.7,fill:CS.fillShape});
  ctx.restore();
}

function toggleCVFill(btn){
  CS.fillShape=!CS.fillShape;
  if(btn) btn.classList.toggle('on',CS.fillShape);
}

function drawShape(ctx,s,selected=false){
  const {x1,y1,x2,y2,color,size,shape,opacity,fill}=s;
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=size;ctx.globalAlpha=opacity||1;
  ctx.lineCap='round';ctx.lineJoin='round';
  if(fill){ctx.fillStyle=color;}
  const w=x2-x1,h=y2-y1;
  if(shape==='rect'){
    if(fill){ctx.globalAlpha=(opacity||1)*0.3;ctx.fillRect(x1,y1,w,h);ctx.globalAlpha=opacity||1;}
    ctx.strokeRect(x1,y1,w,h);
  } else if(shape==='circle'){
    ctx.beginPath();ctx.ellipse(x1+w/2,y1+h/2,Math.abs(w/2),Math.abs(h/2),0,0,Math.PI*2);
    if(fill){ctx.globalAlpha=(opacity||1)*0.3;ctx.fill();ctx.globalAlpha=opacity||1;}
    ctx.stroke();
  } else if(shape==='triangle'){
    ctx.beginPath();
    ctx.moveTo(x1+w/2,y1);ctx.lineTo(x2,y2);ctx.lineTo(x1,y2);ctx.closePath();
    if(fill){ctx.globalAlpha=(opacity||1)*0.3;ctx.fill();ctx.globalAlpha=opacity||1;}
    ctx.stroke();
  } else if(shape==='line'){
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  } else if(shape==='arrow'){
    const angle=Math.atan2(y2-y1,x2-x1);
    const hl=Math.min(26,Math.sqrt(w*w+h*h)*.3+8);
    const hw=Math.PI/6;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2,y2);ctx.lineTo(x2-hl*Math.cos(angle-hw),y2-hl*Math.sin(angle-hw));
    ctx.moveTo(x2,y2);ctx.lineTo(x2-hl*Math.cos(angle+hw),y2-hl*Math.sin(angle+hw));
    ctx.lineWidth=size*1.3;ctx.stroke();
  }
  if(selected){
    ctx.strokeStyle='var(--ac)';ctx.lineWidth=2/CS.scale;ctx.globalAlpha=1;ctx.setLineDash([5/CS.scale]);
    ctx.strokeRect(Math.min(x1,x2)-4,Math.min(y1,y2)-4,Math.abs(w)+8,Math.abs(h)+8);
  }
  ctx.restore();
}

function drawStroke(ctx,s,selected=false){
  if(!s.pts||!s.pts.length) return;
  ctx.save();
  if(s.tool==='eraser'){
    ctx.globalCompositeOperation='destination-out';
    ctx.strokeStyle='rgba(0,0,0,1)';
    ctx.lineWidth=s.size*5;
  } else {
    ctx.globalCompositeOperation='source-over';
    ctx.globalAlpha=s.opacity||1;
    ctx.strokeStyle=s.color;
    ctx.lineWidth=s.tool==='highlight'?s.size*7:s.size;
    if(s.tool==='pencil'){ctx.globalAlpha=(s.opacity||.65);ctx.lineWidth=s.size;}
  }
  ctx.lineCap='round';ctx.lineJoin='round';
  if(s.pts.length===1){
    ctx.beginPath();ctx.arc(s.pts[0].x,s.pts[0].y,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();
  } else {
    ctx.beginPath();ctx.moveTo(s.pts[0].x,s.pts[0].y);
    for(let i=1;i<s.pts.length;i++) ctx.lineTo(s.pts[i].x,s.pts[i].y);
    ctx.stroke();
  }
  if(selected){
    ctx.restore();ctx.save();
    ctx.strokeStyle='var(--ac)';ctx.lineWidth=1.5/CS.scale;ctx.globalAlpha=.7;
    ctx.setLineDash([4/CS.scale]);
    const xs=s.pts.map(p=>p.x),ys=s.pts.map(p=>p.y);
    const bx=Math.min(...xs),by=Math.min(...ys),bw=Math.max(...xs)-bx,bh=Math.max(...ys)-by;
    ctx.strokeRect(bx-6,by-6,bw+12,bh+12);
  }
  ctx.restore();
}

function drawCVBg(ctx,cv){
  const w=(cv.width)/CS.scale+Math.abs(CS.ox/CS.scale)+400;
  const h=(cv.height)/CS.scale+Math.abs(CS.oy/CS.scale)+400;
  const ox2=-CS.ox/CS.scale-200;
  const oy2=-CS.oy/CS.scale-200;
  const bg=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#0f0f11';
  ctx.fillStyle=bg;ctx.fillRect(ox2,oy2,w,h);
  if(CS.bg==='blank') return;
  const gap=CS.bg==='graph'?28:32;
  ctx.strokeStyle='rgba(128,128,160,.1)';ctx.lineWidth=1;
  const sx=Math.floor(ox2/gap)*gap,sy=Math.floor(oy2/gap)*gap;
  if(CS.bg==='lined'){
    for(let y=sy;y<oy2+h;y+=gap){ctx.beginPath();ctx.moveTo(ox2,y);ctx.lineTo(ox2+w,y);ctx.stroke();}
  } else {
    for(let x=sx;x<ox2+w;x+=gap){ctx.beginPath();ctx.moveTo(x,oy2);ctx.lineTo(x,oy2+h);ctx.stroke();}
    for(let y=sy;y<oy2+h;y+=gap){ctx.beginPath();ctx.moveTo(ox2,y);ctx.lineTo(ox2+w,y);ctx.stroke();}
  }
}

function setCVTool(t,btn){
  CS.tool=t;CS.shape=null;
  CS.selected=null;hideShapePopup();
  document.querySelectorAll('.cvb').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  const cv=document.getElementById('cv');
  if(cv) cv.style.cursor=t==='pan'?'grab':t==='select'?'default':t==='eraser'?'cell':'crosshair';
  // Update color row for pen/pencil presets
  updateColorRowForTool(t);
}
function setCVShape(shape,btn){
  CS.shape=shape;CS.tool='shape';
  document.querySelectorAll('.cvb').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  const fillBtn=document.getElementById('cvb-fill');
  if(fillBtn) fillBtn.classList.toggle('on',CS.fillShape);
  const cv=document.getElementById('cv');
  if(cv) cv.style.cursor='crosshair';
}
function setCVColor(c,dot){
  CS.color=c;
  document.querySelectorAll('.ccd').forEach(d=>d.classList.remove('on'));
  if(dot) dot.classList.add('on');
  // Save to current tool's preset list
  if(CS.tool==='pen'||CS.tool==='pencil'){
    const key=CS.tool+'Colors';
    if(!CS[key].includes(c)){CS[key].unshift(c);CS[key]=CS[key].slice(0,5);}
    else{CS[key]=CS[key].filter(x=>x!==c);CS[key].unshift(c);}
    // Persist
    try{localStorage.setItem('stn_'+key,JSON.stringify(CS[key]));}catch(e){}
  }
}
function setCVBg(bg,btn){
  CS.bg=bg;
  document.querySelectorAll('.bgtg').forEach(b=>b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  drawCV();
}
function updateColorRowForTool(t){
  const row=document.getElementById('cv-color-row');
  if(!row) return;
  const presets=(t==='pencil'?CS.pencilColors:CS.penColors);
  const base=['#7c6af5','#f87171','#4ade80','#fbbf24','#22d3ee','#f472b6','#fff','#111'];
  const colors=[...new Set([...presets,...base])].slice(0,8);
  row.innerHTML=colors.map(c=>`<div class="ccd${CS.color===c?' on':''}" style="background:${c}" onclick="setCVColor('${c}',this)"></div>`).join('')
    +`<div class="cpw" style="display:inline-flex;align-items:center" title="Custom color"><div class="ccd" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)"></div><input type="color" onchange="setCVColor(this.value,null)"></div>`;
}
function cvUndo(){if(CS.strokes.length){CS.redo.push(CS.strokes.pop());drawCV();if(_curPg){_curPg.strokes=CS.strokes;saveA();}}}
function cvRedo(){if(CS.redo.length){CS.strokes.push(CS.redo.pop());drawCV();if(_curPg){_curPg.strokes=CS.strokes;saveA();}}}
function cvClear(){if(!confirm('Clear canvas?')) return;CS.strokes=[];CS.redo=[];drawCV();if(_curPg){_curPg.strokes=[];saveA();}}

// Load saved color presets
try{
  const pc=localStorage.getItem('stn_penColors');
  const pencilC=localStorage.getItem('stn_pencilColors');
  if(pc) CS.penColors=JSON.parse(pc);
  if(pencilC) CS.pencilColors=JSON.parse(pencilC);
}catch(e){}


