(() => {
  const scene=document.querySelector('.scene');let active=true;
  function element(cls,x,y,w,h,text='',parent=scene){const e=document.createElement('div');e.className=cls;Object.assign(e.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});e.textContent=text;parent.append(e);return e;}
  window.interfaceMount=()=>{
    scene.replaceChildren();const bar=element('v097d-bottom-bar',0,0,640,93);bar.style.removeProperty('top');bar.style.left='50%';bar.style.transform='translateX(-50%) scale(1.5)';bar.style.transformOrigin='50% 100%';
    element('v097d-corner',0,0,108,45,'',bar);element('v097d-corner',532,0,108,45,'',bar);
    for(const [x,w] of [[0,256],[256,128],[384,256]])element('v097d-tile',x,45,w,48,'',bar);
    window.demoHP=element('v097d-fill',97,45,53,48,'',bar);demoHP.style.background='radial-gradient(circle at 30% 25%,#ff7777,#e41e25 55%,#680910)';
    window.demoMP=element('v097d-fill',489,45,53,48,'',bar);demoMP.style.background='radial-gradient(circle at 30% 25%,#83dbff,#164fff 55%,#0b175f)';
    for(const [x,text,title] of [[97,'','Vida: 440 / 440'],[489,'','Maná: 1508 / 1508'],[551,'','AG: 3981 / 3981']]){const hit=element('v097d-hit',x,45,x===551?15:53,48,text,bar);hit.title=title;hit.onpointerenter=()=>{const tip=element('v097d-tip',x,30,100,15,title,bar);hit.onpointerleave=()=>tip.remove();};}
    const ag=element('v097d-fill',551,50,15,36,'',bar);ag.style.background='#7c49b6';ag.style.borderRadius='0';
    window.demoHPNumber=element('v097d-digit',86,80,40,10,'440',bar);element('v097d-digit',522,80,40,10,'1508',bar);element('v097d-digit',553,80,40,10,'3981',bar);
    element('v097d-digit',16,75,20,9,'124',bar);element('v097d-digit',40,75,20,9,'85',bar);
    for(let i=0;i<3;i++){const potion=element('v097d-potion',208+i*31,67,20,20,['🧪','🧪',''][i],bar);potion.title=['Poción de vida (Q)','Poción de maná (W)','Poción (E)'][i];element('v097d-digit',217+i*31,60,20,10,['44','82','0'][i],bar);potion.oncontextmenu=e=>{e.preventDefault();window.potionClicks=(window.potionClicks||0)+1;document.querySelector('#feedback').textContent='Poción activada: '+['Q','W','E'][i];};}
    const skill=element('v097d-hit v097d-skill-box',304,57,32,36,'',bar);element('v097d-skill',304,57,32,36,'✦',bar).style.pointerEvents='none';skill.title='Skills';skill.onclick=()=>{if(bar.querySelector('.v097d-skill-slot')){bar.querySelectorAll('.v097d-skill-slot').forEach(n=>n.remove());return;}for(let i=0;i<8;i++){const slot=element('v097d-skill-slot',192+i*32,-17,32,36,['✧','❄','♜','✦','⚡','☄','◇','◈'][i],bar);slot.title='Skill '+i;slot.onclick=()=>{window.skillClicks=(window.skillClicks||0)+1;bar.querySelectorAll('.v097d-skill-slot').forEach(n=>n.remove());};}};
    for(const [x,y,w,h,icon,name] of [[348,65,24,24,'♙','Party'],[379,65,24,24,'♜','Personaje'],[410,65,24,24,'▣','Inventario'],[582,72,52,18,'⚔','Guild']]){const hit=element('v097d-hit v097d-menu-button',x,y,w,h,icon,bar);hit.title=name;hit.onclick=()=>{window.menuClicks=(window.menuClicks||0)+1;document.querySelector('#feedback').textContent=name;};}
    element('v097d-exp',221,52,134,4,'',bar);element('v097d-digit',420,47,10,10,'0',bar);element('v097d-hit',219,52,202,6,'',bar).title='EXP';element('mu-resize-grip',628,81,12,12,'',bar);
    return bar;
  };
  interfaceMount();document.querySelector('#toggle').onclick=()=>{active=!active;window.dispatchEvent(new CustomEvent('mu-interface:toggle',{detail:{enabled:active}}));};
  document.querySelector('#vitals').onclick=()=>{demoHP.style.height='24px';demoHP.style.top='69px';demoHPNumber.textContent='220';};
})();
