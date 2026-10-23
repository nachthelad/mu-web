// ==UserScript==
// @name         MU · Level & Reset Helper
// @namespace    local.mu.level-helper
// @version      1.31.2
// @description  Leveleo/reset, party y loot; inicio manual o por horario de Argentina.
// @match        https://mu.mormon.garden/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function(){
  'use strict';
  // The native character window in index-DnTsp0bZ / layout-DyxNG9m6 uses b2.
  // Reuse its cached module, never import a second engine or guess MU formulas.
  const STATS_BUILDS=[{entry:'/assets/index-Do3IjarP.js',module:'/assets/layout-CoOAKkh-.js',calculate:'b1',catalog:'bU',slots:'aL',itemStats:'nC',tooltip:'nE',name:'fd',wizardrySlot:0},{entry:'/assets/index-URnTVW_1.js',module:'/assets/layout-DQbdTT-G.js',calculate:'b1',catalog:'bU',slots:'aL',itemStats:'nC',tooltip:'nE',name:'fd',wizardrySlot:0},{entry:'/assets/index-C399rQbj.js',module:'/assets/layout-68bM4dWi.js',calculate:'b1',catalog:'bU',slots:'aL',itemStats:'np'},{entry:'/assets/index-CiMTJPU8.js',module:'/assets/layout-BSIMx9t6.js',calculate:'b1',catalog:'bU',slots:'aL',itemStats:'n6',tooltip:'n8',name:'mx'},{entry:'/assets/index-DnTsp0bZ.js',module:'/assets/layout-DyxNG9m6.js',calculate:'b2',catalog:'bW',slots:'aM',itemStats:'nj'}];
  const EQUIPMENT_SLOTS=['Mano 0','Mano 1','Casco','Armadura','Pantalones','Guantes','Botas','Alas','Mascota','Pendant','Anillo 1','Anillo 2'];
  function equipmentStats(equipment,native,pd){
    return EQUIPMENT_SLOTS.map((label,slot)=>{
      const item=equipment?.[slot];if(!equipment||item===undefined)return {slot,label,state:'Datos pendientes',lines:[]};
      if(item===null)return {slot,label,state:'Vacío',lines:[]};
      let name=null,stats=null,lines=[];try{name=native?.name(item);if(Number.isInteger(item.lvl)&&typeof item.isExcellent==='boolean')stats=native?.itemStats?.(item);if(stats&&native?.tooltip)lines=native.tooltip(item,{level:pd.level,str:pd.str,agi:pd.agi,vit:pd.sta,ene:pd.eng,cmd:pd.leadership,baseClass:0,stepClass:1,freeRequirements:true,worn:equipment})?.lines?.filter(line=>!line.blank).map(line=>line.text).filter(text=>typeof text==='string')??[];}catch{}
      const fieldLabels={lvl:'Nivel',durability:'Durabilidad',optionLevel:'Nivel de opción',excellentFlags:'Opciones Excellent (código)',luck:'Luck',hasSkill:'Skill',isExcellent:'Excellent',isAncient:'Ancient',ancientDiscriminator:'Set Ancient (código)',ancientBonusLevel:'Bonus Ancient (nivel)'};const fields=Object.keys(fieldLabels);
      const properties=fields.filter(key=>item[key]!==undefined).map(key=>fieldLabels[key]+': '+(typeof item[key]==='boolean'?(item[key]?'Sí':'No'):String(item[key])));
      if(!lines.length&&stats)for(const key of ['damageMin','damageMax','defense','blocking','magicPower','maxDurability'])if(statsNumber(stats[key])!==null)lines.push(key+': '+stats[key]);
      if(['optionLevel','excellentFlags','luck','hasSkill','isAncient'].some(key=>item[key]===undefined))lines.push('Opciones incompletas: los campos ausentes no confirman cero ni ausencia de bonus.');
      return {slot,label,name:name||('Item '+item.group+'/'+item.num),state:stats?'Tooltip del cliente':native?'Item sin resolver':'Adaptador no disponible',lines,properties};
    });
  }
  const STATS_FIELDS=[['level','Nivel'],['str','Fuerza'],['agi','Agilidad'],['sta','Vitalidad'],['eng','Energía'],['leadership','Comando'],['maxHP','HP máximo'],['maxMP','MP máximo'],['maxSD','SD máximo'],['maxAG','AG máximo'],['attackSpeed','Velocidad de ataque'],['magicSpeed','Velocidad mágica']];
  const STATS_DERIVED=[['damageMin','Ataque físico mínimo'],['damageMax','Ataque físico máximo'],['wizardryMin','Mágico nativo mínimo'],['wizardryMax','Mágico nativo máximo'],['staffRate','Staff leído por C (%)'],['defense','Defensa'],['attackRate','Índice de ataque'],['defenseRate','Índice de defensa']];
  // Verified index-MYtcMCbX ei installs synchronous MobX mutual-close reactions.
  // Only veto the sibling close during the opening transaction, never user closes.
  function pairCharacterInventory(store){
    const administration=Object.getOwnPropertySymbols(store??{}).map(key=>store[key]).find(value=>value?.values_ instanceof Map&&value.values_.has('characterInfoEnabled'));
    const keys=['characterInfoEnabled','inventoryEnabled'],values=keys.map(key=>administration?.values_.get(key));
    if(!values.every(value=>typeof value?.intercept_==='function'))return null;
    let opening=null,disposed=false,serial=0;
    const disposers=values.map((value,index)=>value.intercept_(change=>{
      if(disposed||store.uiState!==5||store.sceneLoading||store.spritesLoading||store.connectionLost)return change;
      if(change.newValue===true&&!store[keys[index]]){opening=keys[index];const token=++serial;queueMicrotask(()=>{if(token===serial)opening=null;});}
      if(change.newValue===false&&opening===keys[1-index]&&store[opening]===true){opening=null;serial++;return null;}
      return change;
    }));
    return()=>{disposed=true;disposers.forEach(dispose=>dispose());};
  }
  const statsNumber=value=>typeof value==='number'&&Number.isFinite(value)?value:null;
  function characterStats(store,world,account,native=null,at=Date.now()){
    const pd=store?.playerData;
    if(!account||store?.gsSocket?.readyState!==1||store.connectionLost||store.isOffline||store.uiState!==5||store.sceneLoading||store.spritesLoading||!world?.playerEntity||!pd?.name)return null;
    const liveAccount=account==='demo'?account:accountIdentity(store);if(liveAccount!==account)return null;
    const identity=JSON.stringify([account,serverKey(store.gsSocket.url),pd.name,pd.charClass]);
    let equipment=null;try{if(Array.isArray(pd.items))equipment=Array.from({length:12},(_,i)=>pd.items[i]===undefined?undefined:JSON.parse(JSON.stringify(pd.items[i])));}catch{}
    const metrics=STATS_FIELDS.map(([key,label])=>({key,label,value:statsNumber(pd[key]),source:'Informado por el cliente'}));
    let derived=null;
    if(native&&equipment&&['level','str','agi','sta','eng','leadership','charClass'].every(key=>statsNumber(pd[key])!==null)){
      try{const known=equipment.map(item=>item!==undefined&&(!item||(Number.isInteger(item.lvl)&&item.lvl>=0&&item.lvl<=15&&typeof item.isExcellent==='boolean'&&native.hasItem(item))));derived=native.calculate({charClass:pd.charClass,level:pd.level,strength:pd.str,agility:pd.agi,vitality:pd.sta,energy:pd.eng,leadership:pd.leadership,items:equipment.map((item,i)=>known[i]?item:null)});
        // Only retain metrics whose equipment dependencies are fully known.
        if(!known[0]||!known[1])for(const key of ['damageMin','damageMax'])derived[key]=null;
        if(!known[native.wizardrySlot??1])for(const key of ['wizardryMin','wizardryMax','staffRate'])derived[key]=null;
        if(!known.slice(0,8).every(Boolean))derived.defense=null;
        if(!known[0])derived.defenseRate=null;
      }catch{}
    }
    metrics.unshift(...STATS_DERIVED.map(([key,label])=>({key,label,value:statsNumber(derived?.[key]),source:'Calculado por el panel nativo; no incluye daño efectivo'})));
    const staffs=equipment?.slice(0,2).map((item,slot)=>({item,slot})).filter(value=>value.item?.group===5)??[];
    const staff=staffs.length===1?staffs[0]:null;let tooltip=null;
    try{if(staff&&native?.itemStats&&Number.isInteger(staff.item.lvl)&&staff.item.lvl>=0&&staff.item.lvl<=15&&typeof staff.item.isExcellent==='boolean')tooltip=native.itemStats(staff.item);}catch{}
    const staffSource=staff?(tooltip?'Tooltip del cliente · slot '+staff.slot+'; porcentaje separado, sin multiplicar el rango nativo':'Tooltip no disponible: falta catálogo, nivel/opciones o adaptador compatible'):'Staff ausente, ambiguo o equipo no disponible';
    metrics.splice(STATS_DERIVED.length,0,{key:'staffTooltipRate',label:'Wizardry staff · tooltip (%)',value:statsNumber(tooltip?.magicPower),source:staffSource},
      {key:'staffAdditional',label:'Additional Wizardry (puntos)',value:tooltip&&Number.isInteger(staff?.item.optionLevel)&&staff.item.optionLevel>=0&&staff.item.optionLevel<=7?staff.item.optionLevel*4:null,source:staffSource},
      {key:'excellentRate',label:'Excellent Damage Rate (%)',value:tooltip&&Number.isInteger(staff?.item.excellentFlags)&&staff.item.excellentFlags>=0&&staff.item.excellentFlags<=63?(staff.item.excellentFlags&32?10:0):null,source:staffSource},
      {key:'wizardryBaseMin',label:'Base energía mínima (puntos)',value:statsNumber(pd.eng)!==null?Math.trunc(pd.eng/9):null,source:'Base del cálculo auditado: trunc(energía / 9)'},
      {key:'wizardryBaseMax',label:'Base energía máxima (puntos)',value:statsNumber(pd.eng)!==null?Math.trunc(pd.eng/4):null,source:'Base del cálculo auditado: trunc(energía / 4)'});
    metrics.push({key:'skillDamage',label:'Daño por skill',value:null,source:'Sin fuente verificada'},{key:'effectiveDamage',label:'Daño efectivo contra enemigo',value:null,source:'Sin fuente verificada'});
    const equipmentLabel=equipment?equipment.map((item,slot)=>{
      if(item===undefined)return `${EQUIPMENT_SLOTS[slot]}: datos pendientes`;if(!item)return `${EQUIPMENT_SLOTS[slot]}: vacío`;
      let name;try{name=native?.name(item);}catch{}
      return `${EQUIPMENT_SLOTS[slot]}: ${name||`Item ${item.group}/${item.num}`} +${item.lvl??'?'}${item.group===5?' · Staff':''}`;
    }).join(' · '):'Equipo no disponible';
    return{identity,name:pd.name,at,equipment,equipmentDetails:equipmentStats(equipment,native,pd),equipmentLabel,metrics,staffWarning:staff&&native&&staff.slot!==(native.wizardrySlot??1)?'El rango nativo omite el staff en slot '+staff.slot+': Wizardry solo consulta slot '+(native.wizardrySlot??1)+'. El tooltip se muestra separado, sin estimar daño efectivo.':staffs.length>1?'Dos staffs: C consulta slot '+(native?.wizardrySlot??1)+'; no se elige un bonus único de tooltip.':null,conditions:{skill:statsNumber(store.currentSkill),buffs:null}};
  }
  function compareStats(a,b){
    if(!a||!b||a.identity!==b.identity)return null;
    const warnings=[];
    for(const key of ['level','str','agi','sta','eng','leadership']){const av=a.metrics.find(m=>m.key===key)?.value,bv=b.metrics.find(m=>m.key===key)?.value;if(av===null||bv===null)warnings.push('Condición desconocida: '+key);else if(av!==bv)warnings.push('Cambió '+a.metrics.find(m=>m.key===key).label);}
    if(!a.equipment||!b.equipment)warnings.push('Equipo desconocido');
    else for(let slot=0;slot<12;slot++)if(JSON.stringify(a.equipment[slot])!==JSON.stringify(b.equipment[slot]))warnings.push('Cambió '+EQUIPMENT_SLOTS[slot]+(slot>=2?' · Cambió equipo adicional':''));
    if(a.conditions.skill===null||b.conditions.skill===null)warnings.push('Skill desconocida');else if(a.conditions.skill!==b.conditions.skill)warnings.push('Cambió la skill');
    warnings.push('Buffs y condiciones del enemigo desconocidos; la diferencia no se atribuye exclusivamente a una pieza.');
    return{warnings,rows:b.metrics.map(m=>{const av=a.metrics.find(row=>row.key===m.key)?.value??null,bv=m.value,delta=av!==null&&bv!==null?bv-av:null;return{...m,a:av,b:bv,delta,percent:delta!==null&&av!==0?delta/av*100:null};})};
  }
  class StatsComparison{
    constructor(){this.clear();}
    clear(){this.current=null;this.a=null;this.b=null;}
    update(value){if(!value||this.current?.identity!==value.identity)this.clear();this.current=value;}
    capture(which){if(!this.current||!['a','b'].includes(which)||which==='b'&&!this.a)return false;this[which]=JSON.parse(JSON.stringify(this.current));if(which==='a')this.b=null;return true;}
  }
  const DEFAULTS={autoReset:true,arena:true,icarus:true,arenaAlternative:false,radius:8,spots:{lorencia:{x:47,y:59},arena:{x:12,y:39},icarus:{x:43,y:155}},sendParty:true,sendPartyOutside:false,acceptParty:true};
  function accountIdentity(store){
    if(!store||store.isOffline||store.connectionLost||store.gsSocket?.readyState!==1||![3,4,5].includes(store.uiState))return null;
    const username=store.username,token=store.accountFor;
    if(typeof username!=='string'||!username.trim()||typeof token!=='string')return null;
    const slash=token.lastIndexOf('/');if(slash<=0)return null;
    return JSON.stringify([token.slice(0,slash),username]);
  }
  const SCHEDULE_DEFAULTS={version:1,enabled:false,start:'02:00',end:'06:00'};
  const SCHEDULE_ZONE='America/Argentina/Buenos_Aires';
  const scheduleMinutes=value=>typeof value==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)?Number(value.slice(0,2))*60+Number(value.slice(3)):NaN;
  function validSchedule(value){return value===undefined||value?.version===1&&typeof value.enabled==='boolean'&&Number.isFinite(scheduleMinutes(value.start))&&Number.isFinite(scheduleMinutes(value.end))&&value.start!==value.end;}
  const scheduleClock=new Intl.DateTimeFormat('en-CA',{timeZone:SCHEDULE_ZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function scheduleParts(now){return Object.fromEntries(scheduleClock.formatToParts(new Date(now)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));}
  // Resolve a local calendar timestamp through the IANA formatter, never a fixed offset.
  function scheduleInstant(wall){let result=wall;for(let i=0;i<4;i++){const p=scheduleParts(result),shown=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second),delta=wall-shown;result+=delta;if(!delta)break;}return result;}
  function scheduleWindow(config,now){
    const c=config??SCHEDULE_DEFAULTS;if(!validSchedule(c))throw Error('Horario inválido');
    const p=scheduleParts(now),day=Date.UTC(p.year,p.month-1,p.day),a=scheduleMinutes(c.start),b=scheduleMinutes(c.end),minute=p.hour*60+p.minute,overnight=a>b;
    const startDay=day-(overnight&&minute<b?86400000:0),start=scheduleInstant(startDay+a*60000),end=scheduleInstant(startDay+(overnight?86400000:0)+b*60000);
    return {enabled:c.enabled,active:c.enabled&&now>=start&&now<end,start,end};
  }
  class DailySchedule {
    constructor(record=null){
      if(record!==null&&!(record?.version===1&&['start','end','pausedUntil','failedUntil','leaseUntil'].every(k=>Number.isFinite(record[k])&&record[k]>=0)&&['attempted','running'].every(k=>typeof record[k]==='boolean')&&['failed','character','leaseOwner'].every(k=>typeof record[k]==='string')))throw Error('Registro de programación inválido');
      this.record=record??{version:1,start:0,end:0,pausedUntil:0,failedUntil:0,attempted:false,running:false,failed:'',character:'',leaseOwner:'',leaseUntil:0};
    }
    sync(config,now){
      const w=scheduleWindow(config,now),r=this.record;
      if(w.active&&r.start!==w.start){const pausedUntil=r.pausedUntil>now?Math.max(r.pausedUntil,w.end):0,failedUntil=r.failedUntil>now?Math.max(r.failedUntil,w.end):0;this.record={version:1,start:w.start,end:w.end,pausedUntil,failedUntil,attempted:!!failedUntil,running:false,failed:failedUntil?r.failed:'',character:failedUntil?r.character:'',leaseOwner:'',leaseUntil:0};}
      else if(w.active){r.end=w.end;if(r.pausedUntil>now)r.pausedUntil=Math.max(r.pausedUntil,w.end);if(r.failedUntil>now)r.failedUntil=Math.max(r.failedUntil,w.end);}
      return w;
    }
    pause(now,end){this.record.pausedUntil=Math.max(this.record.pausedUntil,end);this.record.running=false;this.record.leaseUntil=0;}
    attempt(character,owner,now,end){Object.assign(this.record,{attempted:true,running:false,failed:'Inicio interrumpido; pulsá Play para reintentar',failedUntil:end,character,leaseOwner:owner,leaseUntil:now+3000,end});}
    claim(character,owner,now){Object.assign(this.record,{attempted:true,running:true,failed:'',failedUntil:0,character,leaseOwner:owner,leaseUntil:now+3000});}
    fail(message){this.record.failed=message||'El ciclo se detuvo; pulsá Play para reintentar';this.record.failedUntil=this.record.end;this.record.running=false;this.record.leaseUntil=0;}
    blocked(now,character,owner){const r=this.record;return r.pausedUntil>now?'Pausado manualmente hasta el fin de esta franja':r.failed?r.failed:r.attempted&&r.character!==character?'Cambió el personaje; pulsá Play para iniciar':r.leaseOwner!==owner&&r.leaseUntil>now?'Helper controlado en otra pestaña':'';}
  }
  class AccountSettings {
    constructor(storage,base){this.storage=storage;this.base=base;}
    key(identity){if(!identity)throw Error('Cuenta desconocida');return this.base+'.account.'+encodeURIComponent(identity);}
    read(identity){return this.storage.getItem(this.key(identity));}
    write(identity,expected,value,current){if(current!==identity)throw Error('Cambió la cuenta');const key=this.key(identity);if(this.storage.getItem(key)!==expected)throw Error('Configuración modificada en otra ventana');this.storage.setItem(key,value);}
    rollback(identity,written,previous){const key=this.key(identity);if(this.storage.getItem(key)!==written)throw Error('Configuración modificada en otra ventana');if(previous===null)this.storage.removeItem(key);else this.storage.setItem(key,previous);}
    locked(identity,action){if(!navigator.locks?.request)return Promise.reject(Error('El navegador no permite guardar perfiles de forma segura'));return navigator.locks.request(this.key(identity),action);}
  }
  // Destinations/minima transcribed from the user's M window (2026-10-06).
  // Most variants share IDs; deployed Arena 2/3/4 have distinct worlds 83/84/85.
  const LEVEL_MAPS=[['arena','Arena',6,50,3000],['lorencia','Lorencia',0,10,1000],['noria','Noria',3,10,1000],['devias','Devias',2,20,1500],['devias2','Devias 2',2,20,2000],['devias3','Devias 3',2,20,2500],['devias4','Devias 4',2,20,2500],['dungeon','Dungeon',1,30,3000],['dungeon2','Dungeon 2',1,40,3000],['dungeon3','Dungeon 3',1,50,3500],['arena2','Arena 2',83,100,5000],['arena3','Arena 3',84,200,7500],['arena4','Arena 4',85,300,10000],['losttower','Lost Tower',4,50,5000],['losttower2','Lost Tower 2',4,50,5000],['losttower3','Lost Tower 3',4,50,5500],['losttower4','Lost Tower 4',4,60,5500],['losttower5','Lost Tower 5',4,60,5500],['losttower6','Lost Tower 6',4,70,6000],['losttower7','Lost Tower 7',4,70,6500],['atlans','Atlans',7,70,4000],['atlans2','Atlans 2',7,80,4500],['atlans3','Atlans 3',7,90,5000],['tarkan','Tarkan',8,140,7000],['tarkan2','Tarkan 2',8,140,8500],['icarus','Icarus',10,170,9000]].map(([id,name,map,minLevel,cost])=>({id,name,map,minLevel,cost,command:'/move '+id}));
  const WARP_INDEX={arena:1,lorencia:2,noria:3,devias:4,devias2:5,devias3:6,devias4:7,dungeon:8,dungeon2:9,dungeon3:10,atlans:11,atlans2:12,atlans3:13,losttower:14,losttower2:15,losttower3:16,losttower4:17,losttower5:18,losttower6:19,losttower7:20,tarkan:21,tarkan2:22,icarus:23,arena2:24,arena3:25,arena4:26};
  // Arena variants must use their explicit chat teleport, not the M index.
  for(const m of LEVEL_MAPS)if(!/^arena[234]$/.test(m.id))m.warpIndex=WARP_INDEX[m.id];
  const levelMap=id=>LEVEL_MAPS.find(m=>m.id===id);
  // Warp window supplied by the user; playerData.charClass uses CharacterClass 12/13.
  const MG_MINIMUMS={arena:33,atlans:46,lorencia:6,noria:6,devias:13,devias2:13,devias3:13,devias4:13,dungeon:19,dungeon2:26,dungeon3:33,arena2:66,arena3:132,arena4:198,losttower:33,losttower2:33,losttower3:33,losttower4:39,losttower5:39,losttower6:46,losttower7:46,atlans2:52,atlans3:59,tarkan:92,tarkan2:92,icarus:112};
  function minimumLevel(id,charClass){const m=levelMap(id);return m?(charClass===12||charClass===13||charClass==='stored'?MG_MINIMUMS[id]:m.minLevel):Infinity;}
  function currentPathStep(s,path){
    const m=s?.ready&&LEVEL_MAPS.find(m=>m.map===s.map);
    if(m&&Number.isFinite(s.position?.x)&&Number.isFinite(s.position?.y))return{map:m.id,level:s.level,x:Math.floor(s.position.x),y:Math.floor(s.position.y)};
    return{map:'lorencia',level:Math.min(399,Math.max(10,...path.map(p=>p.level||0))+1),x:NaN,y:NaN};
  }
  // Shared map IDs do not prove the selected variant either.
  function capturePathLocation(s){
    if(!s?.ready||!s.name)return {error:'Ubicación no disponible: el cliente todavía no informa un personaje conectado y listo.'};
    if(s.loading)return {error:'Ubicación no disponible: el cliente informa carga de escenario o sprites.'};
    if(s.dead)return {error:'Ubicación no disponible: el cliente informa que el personaje está muerto.'};
    if(!Number.isInteger(s.map))return {error:'Ubicación no disponible: el cliente no informa un número de mapa válido.'};
    if(s.entityMap!==undefined&&s.entityMap!==s.map)return {error:`Ubicación en transición: mapa del escenario ${s.map}, mapa del personaje ${s.entityMap}. Se conservó el destino.`};
    // A previous warp packet is historical. Matching live world/entity maps
    // confirm the current location even after a later portal or character load.
    if(s.warpArrival&&s.warpArrival.map!==s.map&&s.entityMap!==s.map)return {error:`Ubicación sin confirmar: mapa actual ${s.map}, último viaje ${s.warpArrival.map}. Se conservó el destino.`};
    if(!['x','y'].every(a=>Number.isFinite(s.position?.[a])&&s.position[a]>=0&&s.position[a]<256))return {error:'Coordenadas ausentes o inválidas. Se conservó el destino.'};
    const maps=LEVEL_MAPS.filter(m=>m.map===s.map);
    if(maps.length!==1)return {error:maps.length?'Este mapa comparte varias variantes. Elegí el destino y las coordenadas manualmente; se conservó la fila.':'Mapa no reconocido. Se conservó el destino.'};
    return {map:maps[0].id,x:Math.floor(s.position.x),y:Math.floor(s.position.y)};
  }
  function warpDestination(packet){
    if(!(packet instanceof DataView)||packet.byteLength<8||![0xc1,0xc3].includes(packet.getUint8(0))||packet.getUint8(2)!==0x1c)return null;
    if(packet.byteLength>=10&&packet.getUint8(3)===0x0f&&(packet.getUint8(4)&1))return packet.getUint16(5,true);
    if(packet.byteLength===8&&(packet.getUint8(3)&1))return packet.getUint8(4);
    return null;
  }
  function levelPath(config,charClass){if(config.path)return config.path;return ['lorencia',...(config.arena===false?[]:['arena']),...(config.icarus===false?[]:['icarus'])].map(id=>({map:id,level:minimumLevel(id,charClass),...(config.spots??DEFAULTS.spots)[id]}));}
  function validPath(path,charClass){return Array.isArray(path)&&path.length>=1&&path.length<=26&&path.some(p=>p?.enabled!==false)&&path.every((p,i)=>(p?.enabled===undefined||typeof p.enabled==='boolean')&&levelMap(p?.map)&&Number.isInteger(p.level)&&p.level>=minimumLevel(p.map,charClass)&&p.level<=399&&(!i||p.level>path[i-1].level)&&['x','y'].every(a=>Number.isInteger(p[a])&&p[a]>=0&&p[a]<=255));}
  function validPreferences(value,charClass){return value?.version===1 && validSchedule(value.schedule) && validLeveling(value,charClass) && validRoutes(value,value.leveling?'stored':charClass) && (value.sendPartyOutside===undefined||typeof value.sendPartyOutside==='boolean') && (value.balrogEnabled===undefined||typeof value.balrogEnabled==='boolean') && (value.pairInventory===undefined||typeof value.pairInventory==='boolean') && (value.detailedStats===undefined||typeof value.detailedStats==='boolean') && (value.hideHelmet===undefined||typeof value.hideHelmet==='boolean') && (value.wingStyle===undefined||!!wingStyleOption(value.wingStyle)) && validGoldPreferences(value,charClass) && (value.soulShield===undefined||typeof value.soulShield==='boolean') && (value.autoReset===undefined||typeof value.autoReset==='boolean') && (value.path===undefined||validPath(value.path,value.leveling?'stored':charClass)) && validLootPreferences(value) && ['arena','icarus'].every(id=>value[id]===undefined||typeof value[id]==='boolean') && typeof value.sendParty==='boolean' && typeof value.acceptParty==='boolean' && ['lorencia','arena','icarus'].every(id=>['x','y'].every(axis=>Number.isInteger(value.spots?.[id]?.[axis])&&value.spots[id][axis]>=0&&value.spots[id][axis]<=255));}
  const ROUTE_MAPS=['lorencia','noria','arena','arena2','arena3','arena4'];
  function routeBank(value,charClass){return value.routes??[{name:'Ruta actual',path:levelPath(value,charClass),alternatives:[]}];}
  function validLeveling(value,charClass){
    const l=value.leveling;if(l===undefined)return true;
    return l?.version===1&&Array.isArray(l.maps)&&l.maps.length===LEVEL_MAPS.length&&new Set(l.maps.map(m=>m.map)).size===LEVEL_MAPS.length&&l.maps.every(m=>levelMap(m.map)&&typeof m.enabled==='boolean'&&Number.isInteger(m.level)&&m.level>=minimumLevel(m.map,m.enabled?charClass:'stored')&&m.level<=399&&Array.isArray(m.spots)&&m.spots.length<=60&&m.spots.every(p=>typeof p.enabled==='boolean'&&['x','y'].every(a=>Number.isInteger(p[a])&&p[a]>=0&&p[a]<=255)));
  }
  function migrateLeveling(value,charClass){
    if(value.leveling)return {leveling:JSON.parse(JSON.stringify(value.leveling)),warnings:[]};
    const maps=LEVEL_MAPS.map(m=>({map:m.id,level:minimumLevel(m.id,charClass),enabled:false,spots:[]})),warnings=[];
    const selected=routeBank(value,charClass)[value.selectedRoute??0];
    const add=(p,enabled)=>{const m=maps.find(m=>m.map===p.map);if(m.spots.length&&m.level!==p.level){warnings.push(`${levelMap(p.map).name}: varios niveles anteriores; revisá el nivel elegido. El original se conserva.`);return;}
      m.level=p.level;m.enabled=m.enabled||enabled;const old=m.spots.find(q=>q.x===p.x&&q.y===p.y);if(old)old.enabled=old.enabled||enabled;else if(m.spots.length<60)m.spots.push({x:p.x,y:p.y,enabled});};
    for(const p of selected.path)add(p,p.enabled!==false);
    for(const p of selected.alternatives)add(p,p.enabled&&selected.path.some(step=>step.level===p.level&&step.enabled!==false));
    return {leveling:{version:1,maps},warnings:[...new Set(warnings)]};
  }
  const usableLevelMaps=config=>config.leveling.maps.filter(m=>m.enabled&&m.spots.some(p=>p.enabled));
  class MapVisit{
    constructor(){this.lastSpots=new Map();this.lastGroups=new Map();this.newVisit();}
    newVisit(){this.key=null;this.target=null;}
    choose(config,s){
      const usable=usableLevelMaps(config),eligible=usable.filter(m=>s.level>=m.level&&s.level>=minimumLevel(m.map,s.charClass));
      const level=eligible.length?Math.max(...eligible.map(m=>m.level)):null;
      const candidates=level===null?usable.filter(m=>levelMap(m.map).map===s.map&&LEVEL_MAPS.filter(d=>d.map===s.map).length===1):eligible.filter(m=>m.level===level);
      if(!candidates.length)return null;
      const key=JSON.stringify(candidates);if(this.key===key&&this.target)return this.target;
      const groupKey=String(level),lastMap=this.lastGroups.get(groupKey),lastIndex=candidates.findIndex(m=>m.map===lastMap),selected=candidates[(lastIndex+1)%candidates.length];
      const points=selected.spots.filter(p=>p.enabled).filter((p,i,a)=>a.findIndex(q=>q.x===p.x&&q.y===p.y)===i),previous=this.lastSpots.get(selected.map),index=points.findIndex(p=>p.x===previous?.x&&p.y===previous?.y),spot=points[(index+1)%points.length];
      this.lastSpots.set(selected.map,{...spot});this.lastGroups.set(groupKey,selected.map);this.key=key;
      this.target={...levelMap(selected.map),minLevel:minimumLevel(selected.map,s.charClass),x:spot.x,y:spot.y,stepIndex:'map:'+selected.map};return this.target;
    }
  }
  function validRoutes(value,charClass){
    if(value.varySpots!==undefined&&typeof value.varySpots!=='boolean')return false;
    if(value.routes===undefined)return value.selectedRoute===undefined;
    return Array.isArray(value.routes)&&value.routes.length>=1&&value.routes.length<=8&&Number.isInteger(value.selectedRoute)&&value.selectedRoute>=0&&value.selectedRoute<value.routes.length&&value.routes.every(r=>typeof r.name==='string'&&r.name.trim().length>0&&r.name.length<=40&&validPath(r.path,charClass)&&Array.isArray(r.alternatives)&&r.alternatives.length<=60&&r.alternatives.every(p=>typeof p.enabled==='boolean'&&r.path.some(step=>step.level===p.level)&&levelMap(p.map)&&['x','y'].every(a=>Number.isInteger(p[a])&&p[a]>=0&&p[a]<=255)))&&JSON.stringify(value.path)===JSON.stringify(value.routes[value.selectedRoute].path);
  }
  // Mirrors public attackSystem.isNpcOrTrapType and MonsterActionType.Die.
  const LEVEL_NPCS=new Set([367,368,369,370,371,375,376,377,378,379,380,381,382,383,384,385,406,407,408,414,415,416,417,450,452,453,464,465,467,468,469,470,471,472,473,474,475,478,479,492,522,540,541,542,543,544,545,546,547,566,568,577,578,579]);
  const LEVEL_EVENTS=new Set([42,43,44,53,54,78,79,80,81,82,83,493,494,495,496,497,498,499,500,501,502]);
  function levelMonster(e,map,world){return huntVisible(e,map)&&e.worldIndex===map&&Number.isInteger(e.npcType)&&e.npcType>=0&&!e.droppedItem&&!e.dying&&e.monsterAnimation?.action!==6&&!(e.npcType>200&&e.npcType<260)&&!(e.npcType>=100&&e.npcType<=110)&&!LEVEL_NPCS.has(e.npcType)&&!LEVEL_EVENTS.has(e.npcType)&&!(world?.getTerrainFlag?.(Math.floor(e.transform.pos.x),Math.floor(e.transform.pos.z))&5);}
  const SPOT_AGE=14*86400000;
  function validObservation(p){return p&&ROUTE_MAPS.includes(p.map)&&['x','y','count','samples','first','last'].every(k=>Number.isFinite(p[k]))&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<=255&&p.y<=255&&p.count>=4&&p.count<=1000&&Number.isInteger(p.samples)&&p.samples>=1&&p.samples<=1000000&&p.first>=0&&p.first<=p.last;}
  class LevelSpots{
    constructor(records=[]){this.records=records;this.lastSample=-Infinity;this.message='Observa durante Play; solo entidades cercanas recibidas.';}
    observe(s,world,now){
      if(!s.ready||s.loading||s.dead||(s.entityMap!==undefined&&s.entityMap!==s.map)||now-this.lastSample<5000)return false;
      const maps=LEVEL_MAPS.filter(m=>m.map===s.map),map=maps.length===1&&maps[0].id;
      if(!ROUTE_MAPS.includes(map)||typeof world?.isWalkable!=='function'||typeof world?.getTerrainFlag!=='function')return false;
      this.lastSample=now;this.records=this.records.filter(p=>now>=p.last&&now-p.last<=SPOT_AGE);
      const seen=new Set(),entities=(world.netObjsQuery?.entities??[]).filter(e=>levelMonster(e,s.map,world)&&!seen.has(e.netId)&&seen.add(e.netId)).slice(0,250);
      const points=entities.map(e=>({x:Math.floor(e.transform.pos.x),y:Math.floor(e.transform.pos.z)})).filter(p=>p.x>=0&&p.x<=255&&p.y>=0&&p.y<=255);
      const clusters=points.map(p=>({...p,count:points.filter(q=>distance(p,q)<=6).length})).filter(p=>p.count>=4&&world.isWalkable(p.x,p.y)&&!(world.getTerrainFlag(p.x,p.y)&5)).sort((a,b)=>b.count-a.count||a.x-b.x||a.y-b.y),used=[];
      for(const p of clusters){
        if(used.some(q=>distance(p,q)<=8))continue;used.push(p);
        let row=this.records.find(q=>q.map===map&&distance(p,q)<=8);
        if(!row){row={map,x:p.x,y:p.y,count:p.count,samples:0,first:now,last:now};this.records.push(row);}
        if(now-row.last>15000){row.samples=0;row.first=now;}
        row.samples=Math.min(1000000,row.samples+1);row.last=now;row.count=p.count;
      }
      this.records.sort((a,b)=>b.last-a.last);this.records=this.records.slice(0,120);
      this.message=used.length?`${used.length} concentración(es) observada(s) en ${levelMap(map).name}`:'Sin concentración cercana; el resto del mapa es desconocido.';
      return true;
    }
    confirmed(now){return this.records.filter(p=>p.samples>=3&&p.last-p.first>=10000&&now-p.last<=SPOT_AGE);}
  }
  function observedRoute(records,charClass,now){
    const rows=records.filter(p=>validObservation(p)&&p.samples>=3&&p.last-p.first>=10000&&now-p.last<=SPOT_AGE),path=[],alternatives=[];
    const groups=[['lorencia','noria'],['arena'],['arena2'],['arena3'],['arena4']];
    for(const ids of groups){const candidates=rows.filter(p=>ids.includes(p.map)).sort((a,b)=>b.count-a.count||b.last-a.last);if(!candidates.length)continue;
      const level=ids.length===2?Math.max(...ids.map(id=>minimumLevel(id,charClass))):Math.max(50,minimumLevel(ids[0],charClass));
      const points=candidates.map(p=>({map:p.map,level,x:p.x,y:p.y,enabled:true}));path.push(points[0]);alternatives.push(...points.slice(1));
    }
    return path.length?{name:'Spots observados',path,alternatives:alternatives.slice(0,60)}:null;
  }
  class RouteVariation{
    constructor(){this.reset();}
    reset(seed=this.seed??0){this.seed=seed;this.key=null;this.target=null;this.arrived=null;this.blocked=new Set();}
    fail(mapOnly=false){if(this.target)this.blocked.add(mapOnly?'map:'+this.target.id:this.target.id+':'+this.target.x+':'+this.target.y);this.target=null;this.arrived=null;}
    choose(base,config,s,now,world,settled){
      const selected=config.routes?.[config.selectedRoute];if(!config.varySpots||!selected||!base)return base;
      const key=JSON.stringify([config.selectedRoute,base.stepIndex,selected]);if(this.key!==key){this.reset();this.key=key;}
      const entries=[{map:base.id,level:selected.path[base.stepIndex]?.level,x:base.x,y:base.y},...selected.alternatives.filter(p=>p.enabled&&p.level===selected.path[base.stepIndex]?.level)];
      const candidates=entries.filter((p,i)=>s.level>=minimumLevel(p.map,s.charClass)&&entries.findIndex(q=>q.map===p.map&&q.x===p.x&&q.y===p.y)===i&&!this.blocked.has('map:'+p.map)&&!this.blocked.has(p.map+':'+p.x+':'+p.y));
      if(!candidates.length)return null;
      if(this.target&&!candidates.some(p=>p.map===this.target.id&&p.x===this.target.x&&p.y===this.target.y))this.target=null;
      if(this.target&&settled&&this.arrived===null)this.arrived=now;
      const fighting=(world?.netObjsQuery?.entities??[]).some(e=>levelMonster(e,s.map,world)&&distance(s.position,{x:e.transform.pos.x,y:e.transform.pos.z})<=8);
      if(!this.target){
        const previous=this.target;let index=previous?candidates.findIndex(p=>p.map===previous.id&&p.x===previous.x&&p.y===previous.y):-1;index=previous?(index+1)%candidates.length:this.seed%candidates.length;const p=candidates[index];this.target={...levelMap(p.map),minLevel:minimumLevel(p.map,s.charClass),x:p.x,y:p.y,stepIndex:base.stepIndex};this.arrived=null;
      }
      return this.target;
    }
  }
  function route(level,config=DEFAULTS,charClass){
    if(config.path){let index=-1;config.path.forEach((p,i)=>{if(p.enabled!==false&&level>=p.level)index=i;});if(index<0)return null;const p=config.path[index];return {...levelMap(p.map),minLevel:minimumLevel(p.map,charClass),x:p.x,y:p.y,stepIndex:index};}
    const spots=config.spots??DEFAULTS.spots;
    if(level<minimumLevel('arena',charClass))return{id:'lorencia',map:0,name:'Lorencia',...spots.lorencia,command:'/move lorencia'};
    if(level>=minimumLevel('icarus',charClass) && config.icarus)return{id:'icarus',map:10,name:'Icarus',...spots.icarus,command:'/move icarus'};
    if(config.arena===false)return{id:'lorencia',map:0,name:'Lorencia',...spots.lorencia,command:'/move lorencia'};
    return{id:'arena',map:6,name:'Arena',...(config.arenaAlternative?{x:31,y:74}:spots.arena),command:'/move arena'};
  }
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  class Cycle {
    constructor(config={}){this.config={...DEFAULTS,...config};this.running=false;this.message='Detenido';this.resets=0;this.variation=new RouteVariation();this.visit=new MapVisit();}
    start(snapshot,now){
      if(!snapshot?.ready || !snapshot.name || !snapshot.position || !Number.isInteger(snapshot.level) || snapshot.level<1)return false;
      if(!this.config.leveling&&this.config.path&&(!validPath(this.config.path,snapshot.charClass)||!validRoutes(this.config,snapshot.charClass))){this.message='Ruta: revisá los mínimos para la clase actual';return false;}
      if(this.config.leveling&&(!validLeveling(this.config,snapshot.charClass)||!usableLevelMaps(this.config).length)){this.message='Pausado: habilitá un mapa con al menos un spot válido';return false;}
      if(snapshot.level<this.lastLevel)this.visit.newVisit();this.session=(this.session??-1)+1;this.variation.reset(this.session+this.resets);
      this.account=snapshot.account;this.server=snapshot.server;
      this.running=true;this.name=snapshot.name;this.stage=null;this.initialSpot={id:'initial',name:'mapa inicial',map:snapshot.map,...snapshot.position};this.pending=null;this.dead=false;this.settled=false;this.lastMove=-Infinity;this.lastCommand=-Infinity;this.lastAttack=-Infinity;this.progressAt=now;this.bestDistance=Infinity;this.lastLevel=snapshot.level;this.message='Iniciando ruta';return true;
    }
    stop(message='Detenido'){this.running=false;this.pending=null;this.message=message;return{kind:'stop'};}
    transitionDue(s){
      if(!this.running||!s?.ready||s.dead||s.loading||this.pending)return false;
      if(s.level>=400&&this.config.autoReset!==false)return true;
      if(!this.stage)return false;
      if(this.config.leveling){
        const current=this.config.leveling.maps.find(m=>m.map===this.stage.id);
        return usableLevelMaps(this.config).some(m=>s.level>=m.level&&s.level>=minimumLevel(m.map,s.charClass)&&m.level>(current?.level??-1));
      }
      const next=route(s.level,this.config,s.charClass);
      return !!next&&(next.id!==this.stage.id||next.stepIndex!==this.stage.stepIndex);
    }
    step(s,now,world){
      if(!this.running)return null;
      if(this.account&&s?.account!==this.account || this.server&&s?.server!==this.server)return this.stop('Pausado: cambió la sesión del ciclo');
      if(this.pending?.kind==='reset'){
        const p=this.pending;
        // Count observed waiting, not time during which the document could not run.
        // Each refresh contributes at most 5s; the 90s budget and 3 attempts remain finite.
        p.wait=(p.wait??0)+Math.min(5000,Math.max(0,now-(p.tickAt??p.at)));p.tickAt=now;
      }
      if(this.pending?.kind==='reset' && !s?.ready){
        const p=this.pending;
        if(s?.uiState===3 && s.connected && !s.loadingCharacters && !s.loading){
          if(!s.characters?.includes(this.name))return this.stop('Pausado: el personaje del ciclo no está en la lista');
          if(!p.attempts || p.wait-p.selectionAt>=10000){
            if((p.attempts??0)>=3)return this.stop('Pausado: el ingreso no confirmó después de 3 intentos');
            if(p.wait>=90000)return this.stop('Pausado: no pudo reingresar después del reset');
            p.attempts=(p.attempts??0)+1;p.selectionAt=p.wait;p.selected=true;
            this.message='Reingresando con '+this.name+' (intento '+p.attempts+'/3)';return{kind:'select',name:this.name};
          }
        }
        if(p.wait>=90000)return this.stop('Pausado: no pudo reingresar después del reset');
        this.message='Reset: esperando reingreso con '+this.name;return null;
      }
      if(s?.loading && s.connected){this.message='Esperando carga del mapa';return null;}
      if(!s?.ready || !s.position)return this.stop('Pausado: desconexión o cliente no disponible');
      if(s.name!==this.name)return this.stop('Pausado: cambió el personaje');
      if(this.config.leveling&&!usableLevelMaps(this.config).length)return this.stop('Pausado: habilitá un mapa con al menos un spot válido');
      if(!Number.isInteger(s.level) || s.level<1)return this.stop('Pausado: nivel no disponible');
      if(s.loading){this.message='Esperando carga del mapa';return null;}
      if(s.dead){this.variation.arrived=null;this.dead=true;this.settled=false;this.pending=this.pending?.kind==='reset'?this.pending:null;this.progressAt=now;this.message='Muerto: esperando reaparecer';return{kind:'clear'};}
      if(this.pending?.kind==='reset'){
        if(s.level<this.pending.level){this.pending=null;this.stage=null;this.dead=false;this.resets++;this.visit.newVisit();this.variation.reset(this.session+this.resets);this.message='Reset confirmado: reiniciando ruta';}
        else if(this.pending.wait>=(this.pending.selected?90000:30000))return this.stop('Pausado: /reset no confirmó un nuevo nivel');
        else{this.message='Esperando confirmación de /reset';return null;}
      }
      if(this.dead){this.dead=false;this.progressAt=now;this.bestDistance=Infinity;this.message='Reapareciste: volviendo al último spot';}
      if(s.level>=400&&this.config.autoReset!==false){
        if(now-this.lastCommand<5000)return null;
        this.pending={kind:'reset',level:s.level,at:now};this.lastCommand=now;this.message='Enviando /reset';return{kind:'command',text:'/reset'};
      }
      // A level drop not caused by our reset is still a server-side reset.
      if(s.level<this.lastLevel){this.visit.newVisit();this.variation.reset((this.session??0)+this.resets);this.stage=null;this.progressAt=now;this.bestDistance=Infinity;}
      this.lastLevel=s.level;
      let target=this.config.leveling?this.visit.choose(this.config,s):route(s.level,this.config,s.charClass);
      if(this.config.leveling&&this.pending?.kind==='warp'&&this.stage&&(s.map!==this.stage.map||(this.pending.sameMap&&!(s.warpSerial>this.pending.serial))))target=this.stage;
      if(target&&!this.config.leveling&&this.config.varySpots){target=this.variation.choose(target,this.config,s,now,world,this.settled);if(!target)return this.stop('Pausado: no quedan spots accesibles en esta etapa');}
      if(!target&&this.config.leveling)target={id:'initial',name:'mapa inicial',map:s.map,...(this.initialSpot.map===s.map?this.initialSpot:s.position)};
      if(!target){
        const firstIndex=this.config.path?.findIndex(p=>p.enabled!==false),first=this.config.path?.[firstIndex],entry=first&&levelMap(first.map),base=LEVEL_MAPS.find(m=>m.map===s.map&&this.config.spots?.[m.id]);
        target=entry?.map===s.map?{...entry,x:first.x,y:first.y,stepIndex:firstIndex}:base?{...base,...this.config.spots[base.id]}:{id:'initial',name:'mapa inicial',map:s.map,...(this.initialSpot.map===s.map?{x:this.initialSpot.x,y:this.initialSpot.y}:s.position)};
      }
      if(!this.stage || this.stage.id!==target.id || this.stage.stepIndex!==target.stepIndex || this.stage.x!==target.x || this.stage.y!==target.y){
        // Shared world IDs cannot identify a warp destination. At startup only,
        // being within the normal spot arrival tolerance makes that warp needless.
        // A real stage change to another variant still requires its own arrival.
        const sharedWorldAway=this.config.leveling&&s.map===target.map&&LEVEL_MAPS.filter(m=>m.map===s.map).length>1&&distance(s.position,target)>2;
        this.needsWarp=!!((this.config.path||this.config.leveling)&&s.level>=target.minLevel&&((this.stage&&this.stage.id!==target.id&&this.stage.map===target.map&&target.id!=='initial')||(!this.stage&&((/^arena[234]$/.test(target.id)&&s.map!==target.map)||sharedWorldAway))));
        this.lastCommand=-Infinity;this.stage=target;this.settled=false;this.progressAt=now;this.bestDistance=Infinity;this.pending=null;
      }
      if(this.pending?.kind==='warp'){
        if(s.map===this.stage.map&&(!this.pending.sameMap||s.warpSerial>this.pending.serial)){this.pending=null;this.needsWarp=false;this.settled=false;this.progressAt=now;this.bestDistance=Infinity;}
        else if(now-this.pending.at>(this.stage.id==='arena'?5000:20000)){
 if(this.stage.id==='arena' && !this.pending.stadium){this.pending={kind:'warp',at:now,stadium:true,sameMap:this.pending.sameMap,serial:s.warpSerial};this.lastCommand=now;this.message='Enviando /move stadium';return{kind:'command',text:'/move stadium'};}
 if(!this.config.leveling&&this.config.varySpots){this.variation.fail(true);this.stage=null;this.pending=null;this.settled=false;this.message='Spot omitido: viaje sin confirmar';return{kind:'clear'};}return this.stop(`Pausado: llegada a ${this.stage.name} no confirmada (mapa ${s.map}, esperado ${this.stage.map})`);
}
        else{this.message='Esperando llegada a '+this.stage.name;return null;}
      }
      if(s.map!==this.stage.map||this.needsWarp){
        if(now-this.lastCommand<5000)return null;
        this.pending={kind:'warp',at:now,sameMap:s.map===this.stage.map,serial:s.warpSerial};this.lastCommand=now;this.message='Enviando '+this.stage.command;return{kind:'command',text:this.stage.command,...((this.config.path||this.config.leveling)?{warpIndex:this.stage.warpIndex}:{})};
      }
      const d=distance(s.position,this.stage);
      const safe=!!world?.playerEntity?.attributeSystem?.isAboveZero?.('inSafeZone');
      if(safe)this.settled=false;
      if(d<=2&&!safe)this.settled=true;
      if(safe&&d<=1&&(world?.getTerrainFlag?.(this.stage.x,this.stage.y)&1))return this.stop('Pausado: el spot guardado está en zona segura. Guardá coordenadas fuera de la ciudad.');
      if(this.settled && d<=this.config.radius+2){this.bestDistance=Infinity;this.progressAt=now;this.message=`Leveleando en ${this.stage.name} ${this.stage.x}, ${this.stage.y}`;
        if(now-this.lastAttack>=1000){this.lastAttack=now;return{kind:'helper',spot:this.stage,radius:this.config.radius};}return null;
      }
      if(d<this.bestDistance-.5){this.bestDistance=d;this.progressAt=now;}
      if(now-this.progressAt>45000){if(!this.config.leveling&&this.config.varySpots){this.variation.fail();this.stage=null;this.settled=false;this.message='Spot omitido: sin progreso durante 45 s';return{kind:'clear'};}return this.stop('Pausado: no pudo avanzar al spot durante 45 s');}
      this.message=`Volviendo a ${this.stage.name} ${this.stage.x}, ${this.stage.y}`;
      if(now-this.lastMove>=2500){this.lastMove=now;return{kind:'walk',spot:this.stage};}return null;
    }
    commandRejected(){if(!this.config.leveling&&this.config.varySpots&&this.pending?.kind==='warp'){this.variation.fail(true);this.stage=null;this.pending=null;this.settled=false;this.message='Spot omitido: viaje rechazado';return;}return this.stop('Pausado: el cliente no pudo enviar el comando');}
    commandSent(now,serial){if(this.pending?.kind==='warp'){this.pending.at=now;this.pending.serial=serial;}else if(this.pending?.kind==='reset'){this.pending.at=now;this.pending.tickAt=now;this.pending.wait=0;}}
  }
  class NativeHelper {
    constructor(){this.pending=null;}
    sync(store,active,now,world){
      if(typeof store?.toggleMuHelper!=='function' || !store.muHelper)return 'unavailable';
      if(this.pending){
        if(!!store.muHelper.active===this.pending.active)this.pending=null;
        else if(now-this.pending.at>10000){this.pending=null;return 'timeout';}
        else return 'waiting';
      }
      if(!!store.muHelper.active===active)return 'ready';
      if(active&&world?.playerEntity?.attributeSystem?.isAboveZero('inSafeZone'))return 'safe-zone';
      store.toggleMuHelper();this.pending={active,at:now};return 'waiting';
    }
  }
  const normalizeLootName=value=>value.normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ');
  function lootNames(text){return [...new Set(text.split(/\r?\n/).map(normalizeLootName).filter(Boolean))];}
  const LOOT_DEFAULTS={enabled:false,range:5,all:false,jewels:false,zen:false,ancient:false,excellent:false,kundun:false,namesEnabled:false,nameExcellent:true,nameLuck:true};
  function lootPolicy(value){return value.loot??{...LOOT_DEFAULTS,enabled:!!value.excellentLoot,namesEnabled:true};}
  function validLootPreferences(value){return (value.loot===undefined||(value.loot&&Number.isInteger(value.loot.range)&&value.loot.range>=1&&value.loot.range<=8&&(value.loot.kundun===undefined||typeof value.loot.kundun==='boolean')&&['enabled','all','jewels','zen','ancient','excellent','namesEnabled','nameExcellent','nameLuck'].every(k=>typeof value.loot[k]==='boolean'))) && (value.excellentLoot===undefined||typeof value.excellentLoot==='boolean') && (value.excellentNames===undefined||(Array.isArray(value.excellentNames)&&value.excellentNames.length<=50&&value.excellentNames.every(name=>typeof name==='string'&&name.trim().length>0&&name.length<=80)));}
  function matchesLoot(entity,preferences){
    if(!preferences.loot)return matchesExcellentLoot(entity,preferences.excellentNames??[]);
    const p=preferences.loot,drop=entity?.droppedItem,item=drop?.item;
    if(!drop)return false;
    if(drop.isMoney)return p.all||p.zen;
    if(!item)return false;
    if(p.kundun===true&&isKundun(item))return true;
    if(p.all||p.ancient&&item.isAncient===true||p.excellent&&item.isExcellent===true)return true;
    const group=drop.group??item.group,num=drop.num??item.num;
    if(p.jewels&&(group===12&&num===15||group===14&&[13,14,16,22,31,41,42,43,44].includes(num)))return true;
    const name=entity.objectNameInWorld;
    return p.namesEnabled&&typeof name==='string'&&(!p.nameExcellent||item.isExcellent===true)&&(!p.nameLuck||item.luck===true)&&(preferences.excellentNames??[]).some(n=>normalizeLootName(name).includes(normalizeLootName(n)));
  }
  // Match ItemPickupSystem's Chebyshev distance on integer tiles. Zen uses
  // the native request immediately, never its approach/movement target.
  function zenInReach(entity,position){const pos=entity?.transform?.pos;return !!pos&&[pos.x,pos.z,position?.x,position?.y].every(Number.isFinite)&&Math.max(Math.abs(Math.trunc(pos.x)-Math.trunc(position.x)),Math.abs(Math.trunc(pos.z)-Math.trunc(position.y)))<=1;}
  function matchesExcellentLoot(entity,names){
    const item=entity?.droppedItem?.item,name=entity?.objectNameInWorld;
    return entity?.droppedItem?.isMoney!==true && item?.isExcellent===true && item.luck===true && typeof name==='string' && names.some(entry=>normalizeLootName(entry)!==''&&normalizeLootName(name).includes(normalizeLootName(entry)));
  }
  function nativeLootSettings(config,demo=false){
    if(config instanceof Uint8Array && config.length>=245)return{broad:!!((config[1]&0xb0)||(config[27]&0x40)),any:!!((config[1]&0xf8)||(config[27]&0x40)),range:(config[2]>>4)&15};
    if(demo&&config&&typeof config==='object'&&!ArrayBuffer.isView(config))return{broad:!!(config.pickAllItems||config.pickExcellent||config.pickAncient||config.pickExtraItems),any:!!(config.pickAllItems||config.pickExcellent||config.pickAncient||config.pickExtraItems||config.pickZen||config.pickJewel),range:config.obtainRange??8};
    return null;
  }
  function nativeLootConflict(preferences,config,demo=false){
    if(preferences.loot){if(!preferences.loot.enabled)return '';const settings=nativeLootSettings(config,demo);if(!settings)return 'Loot: esperando configuración de Home';return settings.any?'Loot: desactivá todos los filtros de recogida en Home para usar Obtener del addon.':'';}
    if(!preferences.excellentLoot&&!preferences.excellentNames?.length)return '';
    const settings=nativeLootSettings(config,demo);
    if(!settings)return 'Loot: esperando configuración de Home';
    return settings.broad?'Loot: desactivá Todo, Excellent, Ancient y nombres en Home; Zen y jewels pueden seguir activos.':'';
  }
  class ExcellentLoot {
    constructor(){this.pending=null;this.skipped=new WeakMap();this.attempts=new WeakMap();this.done=new WeakSet();this.message='';}
    clear(){
      const pending=this.pending;if(!pending)return;
      const {world,entity}=pending,hero=world.playerEntity;
      // Cancel only an approach we still own, never a new manual target.
      if(!pending.direct&&world.pickupTarget===entity){
        world.pickupTarget=null;
        const point=hero?.playerMoveTo?.point,pos=entity.transform?.pos;
        if(point&&pos&&point.x===pos.x&&point.y===pos.z){
          if(hero.pathfinding?.path){hero.pathfinding.path=null;hero.pathfinding.from={x:Math.floor(hero.transform.pos.x),y:Math.floor(hero.transform.pos.z)};hero.pathfinding.to={...hero.pathfinding.from};}
          point.x=hero.transform.pos.x;point.y=hero.transform.pos.z;hero.playerMoveTo.handled=true;
        }
      }
      this.pending=null;
    }
    failed(now){if(!this.pending)return;const {entity,kundun}=this.pending;const attempts=(this.attempts.get(entity)??0)+1;const retry=kundun&&attempts<3;this.attempts.set(entity,retry?attempts:0);this.skipped.set(entity,now+(retry?2000:60000));this.clear();this.message=retry?'Kundun: recogida rechazada o sin confirmar; próximo intento en 2 segundos.':'Loot rechazado o sin confirmar; se omite ese drop durante un minuto.';}
    confirm(packet){
      if(!this.pending||!(packet instanceof DataView)||packet.byteLength<4||![0xc1,0xc3].includes(packet.getUint8(0))||packet.getUint8(2)!==0x22)return false;
      if(this.pending.entity.droppedItem?.isMoney){if(packet.getUint8(3)!==0xfe||packet.byteLength<8)return false;this.done.add(this.pending.entity);this.clear();this.message='';return true;}
      if(packet.byteLength<10)return false;
      const item=this.pending.entity.droppedItem?.item;
      if(!item||packet.getUint8(3)>=0xfe||packet.getUint8(4)+((packet.getUint8(7)&0x80)<<1)!==item.num||(packet.getUint8(9)>>4)!==item.group||((packet.getUint8(5)>>3)&15)!==(item.lvl??0)||!!(packet.getUint8(5)&4)!==(item.luck===true)||!!(packet.getUint8(7)&63)!==(item.isExcellent===true))return false;
      this.done.add(this.pending.entity);this.clear();this.message='';return true;
    }
    step(cycle,s,world,store,preferences,now,hunting=false,demo=false){
      const names=preferences.excellentNames??[],policy=lootPolicy(preferences),settings=nativeLootSettings(store?.muHelper?.config,demo);
      if(!policy.kundun&&this.message.startsWith('Kundun:'))this.message='';
      const dedicated=entity=>policy.kundun===true&&entity?.droppedItem?.isMoney!==true&&isKundun(entity?.droppedItem?.item);
      const conflict=nativeLootConflict(preferences,store?.muHelper?.config,demo);
      const allowed=cycle.running&&s.ready&&!s.loading&&!s.dead&&!hunting&&policy.enabled&&(preferences.loot||names.length)&&store?.muHelper?.active&&settings&&!conflict&&typeof store.pickupItemRequest==='function'&&world&&'pickupTarget' in world;
      if(!allowed){this.clear();if(policy.enabled&&policy.kundun)this.message=conflict||(!cycle.running?'Kundun: esperando Play del addon.':!s.ready||s.loading||s.dead?'Kundun: esperando personaje disponible.':hunting?'Kundun: esperando terminar viaje, reset o caza.':!store?.muHelper?.active?'Kundun: esperando Home activo.':'Kundun: recogida no disponible en este cliente.');else if(this.message.startsWith('Kundun:'))this.message='';return;}
      if(this.pending){
        if(this.pending.world!==world||this.pending.hero!==world.playerEntity||this.pending.map!==s.map||!matchesLoot(this.pending.entity,preferences)||this.pending.kundun&&!dedicated(this.pending.entity)||!dedicated(this.pending.entity)&&!cycle.settled){this.clear();return;}
        if(world.pickupTarget&&world.pickupTarget!==this.pending.entity){this.clear();return;}
        if(now-this.pending.at>=15000)this.failed(now);
        return;
      }
      if(world.pickupTarget||store.pendingItemMove||store.pickedItem||world.playerEntity?.attributeSystem?.isAboveZero('inSafeZone')){if(policy.kundun)this.message='Kundun: esperando liberar la recogida o salir de zona segura.';return;}
      const maxDistance=Math.ceil(Math.SQRT2*Math.max(0,Math.min(8,preferences.loot?policy.range:settings.range))),center=cycle.stage??route(s.level,cycle.config)??s.position;
      const candidates=(world.netObjsQuery?.entities??[]).filter(e=>huntVisible(e,s.map)&&e.worldIndex===s.map&&e.droppedItem&&!this.done.has(e)&&(this.skipped.get(e)??0)<=now&&matchesLoot(e,preferences)&&(e.droppedItem.isMoney?zenInReach(e,s.position)&&Number.isInteger(e.netId):distance(s.position,{x:e.transform.pos.x,y:e.transform.pos.z})<=maxDistance)&&(dedicated(e)||cycle.settled&&distance(center,{x:e.transform.pos.x,y:e.transform.pos.z})<=cycle.config.radius)).sort((a,b)=>Number(dedicated(b))-Number(dedicated(a))||distance(s.position,{x:a.transform.pos.x,y:a.transform.pos.z})-distance(s.position,{x:b.transform.pos.x,y:b.transform.pos.z}));
      if(policy.kundun)this.message=(world.netObjsQuery?.entities??[]).some(e=>dedicated(e)&&(this.skipped.get(e)??0)>now)?'Kundun: esperando reintento tras rechazo o camino bloqueado.':'Kundun: sin cajas accesibles dentro del rango.';
      for(const entity of candidates){
        const pos=entity.transform.pos;
        if(entity.droppedItem.isMoney){
          // No pickupTarget or playerMoveTo writes, even if combat moves the
          // hero between ticks. Server rejection keeps the normal cooldown.
          this.pending={world,hero:world.playerEntity,map:s.map,entity,at:now,direct:true};this.message='';
          try{if(store.pickupItemRequest(entity.netId)===false)this.failed(now);}catch{this.failed(now);}
          return;
        }
        if(typeof world.pathfinder?.search==='function'){
          const path=world.pathfinder.search({x:Math.floor(s.position.x),y:Math.floor(s.position.y)},{x:Math.floor(pos.x),y:Math.floor(pos.z)},{closest:true});
          if((!path?.length&&distance(s.position,{x:pos.x,y:pos.z})>1.5)||(path?.length&&distance(path[path.length-1],{x:pos.x,y:pos.z})>1.5)){this.skipped.set(entity,now+60000);continue;}
        }
        this.pending={world,hero:world.playerEntity,map:s.map,entity,at:now,kundun:dedicated(entity)};world.pickupTarget=entity;this.message=this.pending.kundun?`Kundun: recogiendo +${entity.droppedItem.item.lvl-7}.`:'';return;
      }
    }
  }
  // Keep acceptParty in preferences v1; the server owns acceptance.
  class NativeAutoParty {
    constructor(){this.session=null;this.character=null;this.applied=null;this.lastAttempt=-Infinity;this.message='';}
    sync(social,s,session,now,enabled){
      if(s.connected===false || (s.uiState!==undefined && s.uiState!==5)){this.session=null;this.character=null;this.applied=null;this.lastAttempt=-Infinity;this.message='';return;}
      if(!s.ready || s.loading || s.dead || typeof social?.sendChat!=='function')return;
      if(this.session!==session || this.character!==s.name){this.session=session;this.character=s.name;this.applied=null;this.lastAttempt=-Infinity;}
      if(this.applied===enabled || now-this.lastAttempt<3000)return;
      this.lastAttempt=now;
      try{
        if(!social.sendChat('/autoparty '+(enabled?'on':'off')))throw Error('command rejected');
        this.applied=enabled;this.message='';
      }catch{this.message='No se pudo enviar Auto party; reintentando.';}
    }
  }
  class AutoParty {
    constructor(){this.lastInvite=-Infinity;this.invited=new Map();this.character=null;this.previousMembers=new Set();this.farSince=new Map();this.kickPending=new Map();this.lastKick=-Infinity;this.lastList=-Infinity;this.memberList=null;this.listAt=-Infinity;this.map=null;this.mapAt=0;this.nearby=new Map();this.session=null;this.inviteMap=null;}
    cancel(group){for(const [entity,pending] of this.nearby)if(!group||pending.group===group)this.nearby.delete(entity);}
    prune(world,social,s,now){
      const members=social.partyMembers??[];
      if(this.map!==s.map){this.map=s.map;this.mapAt=now;this.farSince.clear();}
      if(this.memberList!==members){this.memberList=members;this.listAt=now;}
      if(typeof social.requestPartyList==='function' && members.length>1 && now-this.lastList>=10000){social.requestPartyList();this.lastList=now;}
      const names=new Set(members.map(m=>m.name));
      for(const name of this.farSince.keys())if(!names.has(name)){this.farSince.delete(name);this.kickPending.delete(name);}
      if(![6,10].includes(s.map) || members[0]?.name!==s.name || typeof social.partyKick!=='function') {this.farSince.clear();return false;}
      for(const member of members){
        if(member.name===s.name)continue;
        const entity=world?.netObjsQuery?.entities?.find(e=>e.objectNameInWorld===member.name && e.npcType===undefined && !e.objOutOfScope);
        const p=entity?.transform?.pos;
        const known=Number.isInteger(member.mapId) && Number.isFinite(member.x) && Number.isFinite(member.y);
        const far=p?Math.hypot(p.x-s.position.x,p.z-s.position.y)>24:known && (member.mapId!==s.map || Math.hypot(member.x-s.position.x,member.y-s.position.y)>24);
        if(!far){this.farSince.delete(member.name);continue;}
        if(!this.farSince.has(member.name))this.farSince.set(member.name,now);
        if(now-this.mapAt<30000 || now-this.farSince.get(member.name)<30000 || now-this.listAt>15000 || now-this.lastKick<10000 || now-(this.kickPending.get(member.name)??-Infinity)<60000 || !Number.isInteger(member.index))continue;
        social.partyKick(member.index);this.kickPending.set(member.name,now);this.lastKick=now;return true;
      }return false;
    }
    step(world,social,s,now,config=DEFAULTS){
      if(!s.ready || s.connected===false || s.loading || s.dead || !social){this.cancel();this.map=null;this.farSince.clear();return;}
      const session=[world,social,world?.playerEntity,s.name,s.account,s.server];
      if(!this.session || session.some((v,i)=>v!==this.session[i]))this.cancel();
      if(!this.session || session.slice(3).some((v,i)=>v!==this.session[i+3])){this.character=s.name;this.invited.clear();this.previousMembers.clear();this.lastInvite=-Infinity;this.farSince.clear();this.kickPending.clear();this.map=null;this.memberList=null;this.lastList=-Infinity;this.lastKick=-Infinity;}
      this.session=session;
      if(this.inviteMap!==s.map){this.cancel();this.inviteMap=s.map;}
      const members=social.partyMembers??[],names=new Set(members.map(m=>m.name));
      for(const name of this.previousMembers)if(!names.has(name))this.invited.delete(name);
      this.previousMembers=names;
      if(config.sendParty!==false){if(this.prune(world,social,s,now)){this.cancel();return;}}else{this.farSince.clear();this.kickPending.clear();}
      if(social.partyRequest || (config.sendParty===false && config.sendPartyOutside!==true) || ![2,6,10,83,84,85].includes(s.map) || typeof social.partyInvite!=='function' || members.length>=5 || (members.length && members[0].name!==s.name)){this.cancel();return;}
      const hero=world?.playerEntity,p=hero?.transform?.pos,guildId=hero?.guild?.id;
      // Missing guild components cannot distinguish no guild from a pending assignment.
      if(!p || !Number.isFinite(p.x) || !Number.isFinite(p.z) || !Number.isInteger(guildId) || guildId<0){this.cancel();return;}
      const players=(world.netObjsQuery?.entities??[]).filter(e=>{
        const q=e?.transform?.pos,name=e?.objectNameInWorld;
        const id=e?.guild?.id,group=Number.isInteger(id)&&id>=0?(id===guildId?'clan':'outside'):null;
        return group && (group==='clan'?config.sendParty!==false:config.sendPartyOutside===true) && !e.localPlayer && e.netId!==hero.netId && Number.isInteger(e.netId) && e.npcType===undefined && (e.playerAnimation || e.skin!==undefined) && !e.dying && !e.objOutOfScope && (e.worldIndex===undefined || e.worldIndex===s.map) && typeof name==='string' && name.length>0 && name!==s.name && !members.some(m=>m.name===name) && q && Number.isFinite(q.x) && Number.isFinite(q.z) && Math.abs(Math.floor(q.x)-Math.floor(p.x))<=2 && Math.abs(Math.floor(q.z)-Math.floor(p.z))<=2;
      });
      const present=new Set(players);
      for(const e of this.nearby.keys())if(!present.has(e))this.nearby.delete(e);
      for(const e of players){
        const previous=this.nearby.get(e),signature=JSON.stringify([e.netId,e.objectNameInWorld,e.guild.id,guildId]);
        if(!previous || previous.signature!==signature || now<previous.since)this.nearby.set(e,{signature,since:now,group:e.guild.id===guildId?'clan':'outside'});
      }
      // Oldest eligible presence wins; a new, closer arrival cannot block it.
      const mature=players.filter(e=>now-this.nearby.get(e).since>=2000 && now-(this.invited.get(e.objectNameInWorld)??-Infinity)>=60000).sort((a,b)=>this.nearby.get(a).since-this.nearby.get(b).since || Math.hypot(a.transform.pos.x-p.x,a.transform.pos.z-p.z)-Math.hypot(b.transform.pos.x-p.x,b.transform.pos.z-p.z) || a.netId-b.netId);
      if(now-this.lastInvite<10000)return;
      const target=mature[0];if(!target)return;
      // Native partyInvite returns void after dispatch, not a membership confirmation.
      if(social.partyInvite({netId:target.netId,name:target.objectNameInWorld})===false)return;
      this.invited.set(target.objectNameInWorld,now);this.lastInvite=now;
      for(const e of this.nearby.keys())if(e.objectNameInWorld===target.objectNameInWorld)this.nearby.delete(e);
    }
  }
  // Home owns enemy search and nearby movement. Idle probing used to stop and
  // restart Home every few seconds, resetting its native combat session.
  const HUNT_ROUTE=[
    {id:'tarkan2',name:'Tarkan2',map:8,x:98,y:145},
    {id:'atlans2',name:'Atlans2',map:7,x:227,y:52},
    {id:'atlans3',name:'Atlans3',map:7,x:65,y:160},
    {id:'lorencia',name:'Lorencia',map:0,x:142,y:126},
    {id:'devias',name:'Davias',map:2,x:207,y:42},
    {id:'noria',name:'Noria',map:3,x:174,y:112}
  ];
  const HUNT_TIME=300000,LEVELS_KEY='mu.gold-hunter.move-levels.v1';
  // src/common/monsters.json upstream: actual levels, never inferred from IDs.
  const GOLD_LEVELS={43:15,44:60,53:53,54:46,78:20,79:80,80:83,81:61,82:90,83:77};
  const HUNT_ORDER=['tarkan2','atlans3','atlans2','lorencia','devias'].map(id=>HUNT_ROUTE.find(d=>d.id===id));
  const GOLD_OPTIONS={anticipate:true,pendingMaps:true,sweep:true,saveSpots:true,visitSpots:true,kundun:true};
  function goldPreferences(value={},charClass){return {...GOLD_OPTIONS,...value.gold,route:(value.gold?.route??HUNT_ORDER.map(d=>({map:d.id,level:minimumLevel(d.id,charClass),enabled:true}))).map(p=>({...p}))};}
  function validGoldPreferences(value,charClass){const g=value?.gold;if(g===undefined)return true;return g&&Object.keys(GOLD_OPTIONS).every(k=>typeof g[k]==='boolean')&&Array.isArray(g.route)&&g.route.length>=1&&g.route.length<=HUNT_ROUTE.length&&new Set(g.route.map(p=>p.map)).size===g.route.length&&g.route.every(p=>HUNT_ROUTE.some(d=>d.id===p.map)&&typeof p.enabled==='boolean'&&Number.isInteger(p.level)&&p.level>=minimumLevel(p.map,charClass)&&p.level<=400);}
  function huntCanStart(s,c,now,options){return !!(s.ready&&!s.dead&&!s.loading&&c.event&&(['active','soon'].includes(c.event.phase)||(options.anticipate&&c.event.phase==='scheduled'&&c.event.startsAt-now<=5000&&c.event.startsAt>=now))&&now-c.event.at<=2100000);}
  function remainingMap(c,map,now){return c.remaining&&c.remaining.eventId===c.event?.id&&now>=c.remaining.at&&now-c.remaining.at<=60000?c.remaining.maps.find(m=>m.map===map)?.alive:null;}
  class SoulShield {
    constructor(){this.last=-Infinity;this.message='';this.pending=null;}
    clear(world,store){const p=this.pending;if(p){if(world?.castRequest===p.request)world.castRequest=null;if(store?.currentSkill===16&&Number.isInteger(p.previous))store.selectSkill?.(p.previous);}this.pending=null;}
    step(s,world,store,enabled,now){
      if(!enabled||!s.ready||s.dead||s.loading){this.clear(world,store);this.message='';return false;}
      const active=store?.buffs?.includes(4)||world?.playerEntity?.buffs?.has(4);
      if(active){this.clear(world,store);this.message='';return false;}
      if(this.pending){if(now-this.pending.at<3000)return true;this.clear(world,store);this.message='Soul Shield: sin confirmación del buff';}
      if(now-this.last<10000)return false;
      if(!store.skills?.some(k=>k.number===16)){this.message='Soul Shield: skill no aprendida';this.last=now;return false;}
      if(store.playerData?.currentMP<70||store.playerData?.currentAG<22){this.message='Soul Shield: recursos insuficientes';this.last=now;return false;}
      const config=store.muHelper?.config;
      if(store.muHelper?.active&&config?.buffs?.includes(16)){this.message='Soul Shield: esperando buff de Home';return false;}
      if(world.castRequest||world.castApproach||world.pickupTarget)return false;
      const hero=world.playerEntity,p=hero?.transform?.pos;if(!p||typeof store.selectSkill!=='function'){this.message='Soul Shield: cliente no disponible';this.last=now;return false;}
      const previous=store.currentSkill;store.selectSkill(16);if(store.currentSkill!==16){this.message='Soul Shield: no se pudo seleccionar';this.last=now;return false;}
      const request={target:hero,point:{x:p.x,y:p.z}};world.castRequest=request;this.pending={request,previous,at:now};this.last=now;this.message='Soul Shield: esperando confirmación';return true;
    }
  }
  function huntVisible(e,map){return !!e&&!e.localPlayer&&Number.isInteger(e.netId)&&!e.objOutOfScope&&(e.worldIndex===undefined||e.worldIndex===map)&&Number.isFinite(e.transform?.pos?.x)&&Number.isFinite(e.transform?.pos?.z);}
  function killedPacket(packet){if(!(packet instanceof DataView)||packet.byteLength!==9||packet.getUint8(0)!==0xc1||packet.getUint8(1)!==9||packet.getUint8(2)!==0x17)return null;return{killed:packet.getUint16(3),killer:packet.getUint16(7)};}
  function hitPacket(packet){if(!(packet instanceof DataView)||![10,16].includes(packet.byteLength)||packet.getUint8(0)!==0xc1||packet.getUint8(1)!==packet.byteLength||packet.getUint8(2)!==0x11)return null;return packet.byteLength===10?{id:packet.getUint16(3),progress:packet.getUint16(5)>0}:{id:packet.getUint16(4,true),progress:packet.getUint32(8,true)>0};}
  function isKundun(item){return item?.group===14 && item.num===11 && Number.isInteger(item.lvl) && item.lvl>=8 && item.lvl<=12;}
  function serverMessage(packet){
    if(!(packet instanceof DataView) || packet.byteLength<5 || packet.getUint8(0)!==0xc1 || packet.getUint8(1)!==packet.byteLength || packet.getUint8(2)!==0x0d)return null;
    let text='';for(let i=4;i<packet.byteLength;i++){const c=packet.getUint8(i);if(!c)break;text+=String.fromCharCode(c);}return{type:packet.getUint8(3),text};
  }
  function serverKey(socketUrl){try{const url=new URL(socketUrl);return url.origin+url.pathname+'|'+(url.searchParams.get('host')??'')+':'+(url.searchParams.get('port')??'');}catch{return'default';}}
  // Wire messages are English, before the client's CO/nk translation (2026-10-13).
  function balrogNotice(type,text){
    if(typeof text!=='string'||text.length>250)return null;
    text=text.replace(/^0{9}/,'');let m;
    if(type===0){
      if(/^The Balrog Colosal has left .+ undefeated\.$/.test(text)||/^.+ has defeated the .+ Balrog Colosal!$/.test(text))return {ended:true};
      m=/^The Balrog Colosal has appeared in (.+) at (\d+), (\d+)! It takes a group to bring it down\.$/.exec(text);
      if(!m)m=/^The Balrog Colosal is still in (.+) at (\d+), (\d+): (?:100|\d{1,2})% health left\.$/.exec(text);
    }else if(type===1)m=/^The Big Boss is already out, in (.+) at (\d+), (\d+): (?:100|\d{1,2})% health left\.$/.exec(text);
    if(!m)return null;
    const key=m[1].toLowerCase().replace(/\s+/g,'').replace(/^davias/,'devias');
    const destination=LEVEL_MAPS.find(d=>d.id===key),x=Number(m[2]),y=Number(m[3]);
    if(!destination||![x,y].every(v=>Number.isInteger(v)&&v>=0&&v<=255))return {invalid:true};
    return {destination,x,y};
  }
  class BalrogEvent{
    constructor(){this.sequence=0;this.reset();}
    reset(){this.value=null;this.nativeBlocked=true;}
    observe(notice,now){
      if(!notice)return;
      if(notice.ended||notice.invalid){this.value=null;this.nativeBlocked=true;return;}
      const prior=this.get(now),same=prior&&prior.destination.id===notice.destination.id&&prior.x===notice.x&&prior.y===notice.y;
      this.value={...notice,id:same?prior.id:++this.sequence,at:same?prior.at:now,expires:same?prior.expires:now+1800000};this.nativeBlocked=false;
    }
    recover(state,now){
      if(!state?.running){this.value=null;return;}
      if(this.nativeBlocked||this.get(now)||!state.map||!state.spot||!Number.isFinite(state.seconds)||state.seconds<=0||state.seconds>1800)return;
      const notice=balrogNotice(1,`The Big Boss is already out, in ${state.map} at ${state.spot.x}, ${state.spot.y}: 100% health left.`);
      if(notice&&!notice.invalid){this.observe(notice,now);this.value.expires=now+state.seconds*1000;}
    }
    get(now){return this.value&&now>=this.value.at&&now<this.value.expires?this.value:null;}
  }
  const balrogIdentity=s=>JSON.stringify([s.account,s.server,s.name,s.charClass]);
  class BalrogTrip{
    constructor(){this.active=false;this.message='Esperando Balrog';}
    start(s,event,now){
      if(!s.ready||s.loading||s.dead||!event)return false;
      if(s.map!==event.destination.map&&s.level<minimumLevel(event.destination.id,s.charClass)){this.message='Caza pausada: nivel insuficiente para '+event.destination.name;return false;}
      this.active=true;this.identity=balrogIdentity(s);this.event=event;this.phase='prepare';this.started=now;this.message='Deteniendo Home para viajar';this.best=Infinity;this.progress=now;this.lastMove=-Infinity;return true;
    }
    stop(message='Caza pausada'){this.active=false;this.message=message;return {kind:'stop',balrog:true};}
    step(s,event,now,world){
      if(!this.active)return null;
      if(!s.ready||s.dead||balrogIdentity(s)!==this.identity)return this.stop('Caza pausada: cambió el personaje o la conexión');
      if(!event||event.id!==this.event.id)return this.stop('Caza pausada: terminó el evento o cambió el destino');
      if(this.phase!=='home'&&now-this.started>120000)return this.stop('Caza pausada: se agotó el tiempo de viaje');
      if(s.loading)return null;
      const d=this.event.destination;
      if(this.phase==='prepare'){
        if(s.map!==d.map){this.phase='warp';this.warpAt=now;this.serial=s.warpSerial;this.message='Viajando a '+d.name;return {kind:'command',balrog:true,text:d.command,warpIndex:d.warpIndex};}
        this.phase='walk';
      }
      if(this.phase==='warp'){
        if(s.warpSerial>this.serial&&s.warpArrival?.map===d.map&&s.map===d.map){this.phase='walk';this.progress=now;}
        else if(now-this.warpAt>30000)return this.stop('Caza pausada: el servidor no confirmó el viaje');
        else return null;
      }
      if(s.map!==d.map||s.entityMap!==undefined&&s.entityMap!==d.map)return this.stop('Caza pausada: cambió el mapa');
      if(this.phase==='home'){this.message='Caza activa · Home encendido';return {kind:'helper',balrog:true};}
      const spot={x:this.event.x,y:this.event.y},dist=distance(s.position,spot);
      if(dist<=1){this.phase='home';this.message='Llegada confirmada · Activando Home';return {kind:'helper',balrog:true};}
      if(dist<this.best-.5){this.best=dist;this.progress=now;}
      if(now-this.progress>20000)return this.stop('Caza pausada: sin progreso hacia el Balrog');
      if(now-this.lastMove<3000)return null;
      if(!world?.terrain||typeof world.isWalkable!=='function'||!world.isWalkable(spot.x,spot.y))return this.stop('Caza pausada: destino no transitable');
      if(typeof world.pathfinder?.search==='function'){
        const path=world.pathfinder.search({x:Math.floor(s.position.x),y:Math.floor(s.position.y)},spot,{closest:false});
        if(!path?.length||distance(path.at(-1),spot)>1)return this.stop('Caza pausada: no existe un camino completo');
      }
      this.lastMove=now;this.message=`Caminando al Balrog · ${d.name} ${spot.x}, ${spot.y}`;return {kind:'walk',balrog:true,spot};
    }
  }
  class MoveLevels {
    constructor(storage,key=LEVELS_KEY){this.storage=storage;this.key=key;this.entries={};this.saved=true;
      try{const raw=storage.getItem(key);if(raw){const data=JSON.parse(raw);if(data.version!==1 || !data.entries || Array.isArray(data.entries))throw Error('Formato desconocido');for(const [k,v] of Object.entries(data.entries))if(Number.isInteger(v)&&v>=1&&v<=1000)this.entries[k]=v;}}
      catch{this.saved=false;this.loadFailed=true;}
    }
    entry(s,d){return JSON.stringify([s.server??'default',s.name,s.charClass??'unknown',...(s.account?[s.account]:[]),d.id]);}
    required(s,d){return this.entries[this.entry(s,d)]??null;}
    learn(s,d,text){
      // WarpAction server response; never interpret a zen cost as a level.
      const match=/\bYou need to be level (\d{1,4}) in order to warp\b/i.exec(text)
        ?? /\b(?:necesit[aá]s|necesitas|requiere|requerido)\s+(?:ser\s+)?(?:el\s+)?nivel\s+(\d{1,4})\b/i.exec(text);
      const level=match?Number(match[1]):0;if(level<1||level>1000)return false;
      this.entries[this.entry(s,d)]=level;
      if(!this.loadFailed)try{this.storage.setItem(this.key,JSON.stringify({version:1,entries:this.entries}));this.saved=true;}catch{this.saved=false;}
      return true;
    }
  }
  function huntRegion(d,p){
    const anchors=d.map===7?[{id:'atlans',x:21,y:17},HUNT_ROUTE[1],HUNT_ROUTE[2]]:d.map===8?[{id:'tarkan',x:195,y:61},HUNT_ROUTE[0]]:[d];
    return anchors.reduce((best,a)=>distance(p,a)<distance(p,best)?a:best,anchors[0]).id===d.id;
  }
  function huntPoints(d,records,world,sweep=true){
    const points=[],seen=new Set(),valid=p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<256&&p.y<256&&huntRegion(d,p)&&world?.isWalkable?.(p.x,p.y)&&!(world.getTerrainFlag?.(p.x,p.y)&5);
    const add=p=>{p={x:Math.floor(p.x),y:Math.floor(p.y)};const key=p.x+':'+p.y;if(valid(p)&&!seen.has(key)){seen.add(key);points.push(p);}};
    for(const r of [...records].filter(r=>r.map===d.map).sort((a,b)=>distance(a,d)-distance(b,d)))add(r);
    // A serpentine sweep supplements known sightings; historical points stay first.
    if(!sweep)return points;
    const grid=[];for(let y=8,row=0;y<256;y+=16,row++){const xs=Array.from({length:16},(_,i)=>8+i*16);if(row%2)xs.reverse();for(const x of xs)if(valid({x,y}))grid.push({x,y});}
    if(grid.length){const start=grid.reduce((best,p,i)=>distance(p,d)<distance(grid[best],d)?i:best,0);for(const p of [...grid.slice(start),...grid.slice(0,start)])add(p);}
    return points;
  }
  class GoldenHunt {
    constructor(levels){this.levels=levels;this.options={...GOLD_OPTIONS};this.route=HUNT_ORDER;this.enabled=false;this.active=false;this.message='Golden hunt apagado';this.completed=null;this.pending=null;this.boxes=0;this.skipped=[];this.lastCommand=-Infinity;}
    cancel(message='Golden hunt apagado',disable=true){this.active=false;this.pending=null;this.target=null;this.loot=null;this.point=null;this.corpseUntil=0;if(disable)this.enabled=false;this.message=message;return{kind:'clear'};}
    finish(){this.completed=this.eventId;return this.cancel(`Golden hunt: recorrido terminado · ${this.boxes} Kundun${this.skipped.length?' · '+this.skipped.join('; '):''}`,false);}
    next(){do{this.index++;this.destination=this.route[this.index];}while(this.destination&&(this.kills?.[this.destination.map]??0)>=5);this.pending=null;this.arrivedAt=null;this.lastGoldenAt=null;this.remaining=HUNT_TIME;this.point=null;this.target=null;this.points=null;this.recentSearch=null;this.corpseUntil=0;}
    confirmKill(entity,map,now){
      if(!this.active||map!==this.destination?.map||!this.observed?.has(entity)||this.counted.has(entity))return false;
      this.counted.add(entity);this.ignored.add(entity);this.kills[map]=(this.kills[map]??0)+1;
      if(this.target?.entity===entity)this.target=null;
      this.point=null;this.corpseUntil=now+4000;this.message=`Golden hunt: ${this.kills[map]}/5 kills · esperando Kundun`;return true;
    }
    feedback(text,s,now){
      if(!this.active || !this.pending?.sent || now-this.pending.at>20000 || s.name!==this.name || s.charClass!==this.charClass || s.server!==this.server)return;
      const d=this.destination;
      if(this.levels.learn(s,d,text)){this.skipped.push(`${d.name}: nivel ${this.levels.required(s,d)}`);this.next();return;}
      if(/\b(?:warp|move|destino|traslado)\b/i.test(text) && /need|cannot|not |unknown|invalid|no |insuficiente/i.test(text)){this.skipped.push(`${d.name}: ${text.slice(0,120)}`);this.next();}
    }
    commandSent(now,serial){if(this.pending){this.pending.sent=true;this.pending.at=now;this.pending.serial=serial;}this.lastCommand=now;}
    lootFailed(reason){if(this.loot)this.cancel('Golden hunt pausado: '+reason);}
    step(s,c,now){
      if(!this.enabled)return null;
      if(!this.active){
        const options=c.preferences?goldPreferences(c.preferences,s.charClass):{...GOLD_OPTIONS};if(!huntCanStart(s,c,now,options)||c.event.id===this.completed)return null;this.options=options;this.route=c.preferences?options.route.filter(p=>p.enabled).map(p=>({...HUNT_ROUTE.find(d=>d.id===p.map),minLevel:p.level})):HUNT_ORDER;
        this.active=true;this.name=s.name;this.charClass=s.charClass;this.server=s.server;this.eventId=c.event.id;this.index=0;this.destination=this.route[0];this.arrivedAt=null;this.lastGoldenAt=null;this.remaining=HUNT_TIME;this.pending=null;this.points=null;this.point=null;this.target=null;this.loot=null;this.boxes=0;this.skipped=[];this.corpseUntil=0;this.deadAt=null;this.lastAction=-Infinity;this.ignored=new WeakSet();this.observed=new WeakSet();this.counted=new WeakSet();this.kills={};this.searched=new Set();this.recentSearch=null;
      }
      if(!s.ready){if(s.loading&&s.connected){this.message='Golden hunt: cargando mapa';return null;}return this.cancel('Golden hunt pausado: cliente desconectado');}
      if(s.name!==this.name || s.charClass!==this.charClass || s.server!==this.server)return this.cancel('Golden hunt pausado: cambió el personaje, clase o servidor');
      if(!Number.isInteger(s.level)||s.level<1)return this.cancel('Golden hunt pausado: nivel no disponible');
      if(s.dead){if(this.deadAt===null)this.deadAt=now;this.pending=null;this.loot=null;this.target=null;this.point=null;this.message='Golden hunt: esperando reaparecer';return{kind:'clear'};}
      if(this.deadAt!==null){if(this.arrivedAt!==null)this.arrivedAt+=now-this.deadAt;if(this.lastGoldenAt!==null)this.lastGoldenAt+=now-this.deadAt;this.deadAt=null;}
      if(s.loading){this.message='Golden hunt: cargando mapa';return null;}
      const d=this.destination,entities=c.world?.netObjsQuery?.entities??[];
      for(const e of entities)if(huntVisible(e,s.map)&&c.types.includes(e.npcType)){
        this.observed.add(e);if(e.dying?.killedByHero)this.confirmKill(e,s.map,now);
      }
      if(this.loot){
        if(c.lootCount>this.loot.before){this.boxes++;this.ignored.add(this.loot.entity);this.loot=null;this.corpseUntil=now+1500;return{kind:'clear'};}
        if(now-this.loot.at>15000)return this.cancel('Golden hunt pausado: Kundun sin confirmación de recogida');
        this.message='Golden hunt: recogiendo Kundun · esperando confirmación';return null;
      }
      const ended=c.event?.id===this.eventId && c.event.phase==='ended';
      if(!d)return this.finish();
      if(ended && (this.pending||this.arrivedAt===null||s.map!==d.map))return this.finish();
      if(this.pending){
        if(this.pending.sent && s.warpSerial>this.pending.serial && s.map===d.map && huntRegion(d,s.position)){this.pending=null;this.arrivedAt=now-(HUNT_TIME-this.remaining);this.lastGoldenAt=now;this.points=huntPoints(d,this.options.visitSpots?c.records:[],c.world,this.options.sweep);this.pointIndex=0;this.point=null;this.progressAt=now;this.progressPosition={...s.position};}
        else if(now-this.pending.at>20000){this.skipped.push(`${d.name}: traslado sin confirmar`);this.next();return{kind:'clear'};}
        else{this.message=`Golden hunt: esperando llegada a ${d.name}`;return null;}
      }
      if(this.options.pendingMaps&&remainingMap(c,d.map,now)===0&&this.arrivedAt===null&&!this.loot&&now>=this.corpseUntil){this.skipped.push(d.name+': sin goldens restantes');this.next();return{kind:'clear'};}
      if(this.arrivedAt===null || s.map!==d.map){
        if(this.arrivedAt!==null){this.remaining=Math.max(0,HUNT_TIME-(now-this.arrivedAt));this.arrivedAt=null;}
        const req=Math.max(this.levels.required(s,d)??0,d.minLevel??0)||null;
        if(req!==null && s.level<req){this.skipped.push(`${d.name}: nivel ${req} (actual ${s.level})`);this.next();return{kind:'clear'};}
        if(now-this.lastCommand<5000)return null;
        this.pending={at:now,serial:s.warpSerial,sent:false};this.message=`Golden hunt: /move ${d.id}${req===null?' · comprobando nivel':''}`;
        return{kind:'command',text:'/move '+d.id,hunter:true};
      }
      const visible=e=>huntVisible(e,s.map);
      if(entities.some(e=>visible(e)&&!e.dying&&c.types.includes(e.npcType)))this.lastGoldenAt=now;
      const pos=e=>({x:e.transform.pos.x,y:e.transform.pos.z}),nearest=rows=>rows.sort((a,b)=>distance(pos(a),s.position)-distance(pos(b),s.position))[0];
      const drop=this.options.kundun&&nearest(entities.filter(e=>visible(e)&&!this.ignored.has(e)&&e.droppedItem&&isKundun(e.droppedItem.item)));
      if(drop){this.target=null;this.point=null;this.progressAt=now;this.loot={entity:drop,at:now,before:c.lootCount};this.message='Golden hunt: recogiendo Box of Kundun';return{kind:'huntLoot',entity:drop};}
      if(this.target && (!entities.includes(this.target.entity)||this.target.entity.dying||this.target.entity.objOutOfScope)){
        const dead=!!this.target.entity.dying;this.target=null;this.corpseUntil=dead?now+4000:0;this.message=dead?'Golden hunt: esperando drop del dorado':'Golden hunt: buscando objetivo perdido';if(dead)return{kind:'clear'};
      }
      if(now<this.corpseUntil)return null;
      if(ended)return this.finish();
      if(this.options.pendingMaps&&remainingMap(c,d.map,now)===0){this.skipped.push(d.name+': sin goldens restantes');this.next();return this.step(s,c,now);}
      if(now-this.arrivedAt>=HUNT_TIME||(this.kills[s.map]??0)>=5){this.next();return this.step(s,c,now);}
      if(d.map===8&&now-this.lastGoldenAt>=120000){this.skipped.push('Tarkan: 2 min sin dorados visibles');this.next();return this.step(s,c,now);}
      const safe=!!c.world?.playerEntity?.attributeSystem?.isAboveZero?.('inSafeZone');
      const liveIds=c.map===s.map&&Array.isArray(c.live)&&now-c.seen<=1000?new Set(c.live.map(r=>r.id)):null;
      const candidates=entities.filter(e=>visible(e)&&!e.dying&&!this.ignored.has(e)&&c.types.includes(e.npcType)&&(!liveIds||liveIds.has(e.netId))&&!(c.world.getTerrainFlag?.(Math.floor(e.transform.pos.x),Math.floor(e.transform.pos.z))&5));
      const golden=candidates.includes(this.target?.entity)?this.target.entity:candidates.sort((a,b)=>(GOLD_LEVELS[b.npcType]??0)-(GOLD_LEVELS[a.npcType]??0)||distance(pos(a),s.position)-distance(pos(b),s.position))[0];
      if(golden&&!safe){
        this.progressAt=now;
        const gap=distance(pos(golden),s.position);
        if(this.target?.entity!==golden)this.target={entity:golden,at:now,best:gap};
        if(gap<this.target.best-.5){this.target.at=now;this.target.best=gap;}
        if(now-this.target.at>60000){this.ignored.add(golden);this.target=null;this.message='Golden hunt: objetivo sin progreso, siguiendo recorrido';return{kind:'clear'};}
        this.point=null;this.recentSearch=null;this.message=`Golden hunt: persiguiendo/atacando dorado en ${d.name} · ${this.kills[s.map]??0}/5 kills`;
        if(now-this.lastAction>=250){this.lastAction=now;return{kind:'huntAttack',entity:golden};}return null;
      }
      const recent=c.map===s.map?(c.recent??[]).filter(r=>now-r.seen<10000&&!this.searched.has(s.map+':'+r.observation)).sort((a,b)=>(GOLD_LEVELS[b.type]??0)-(GOLD_LEVELS[a.type]??0)||distance(a,s.position)-distance(b,s.position)):[];
      if(!this.recentSearch&&recent.length){const row=recent[0];this.searched.add(s.map+':'+row.observation);this.recentSearch={spot:{x:Math.floor(row.x),y:Math.floor(row.y)},at:now};this.point=null;this.message='Golden hunt: buscando último avistamiento';return{kind:'walk',spot:this.recentSearch.spot,hunter:true};}
      if(this.recentSearch){if(now-this.recentSearch.at<5000&&distance(s.position,this.recentSearch.spot)>2)return null;this.recentSearch=null;}
      if(!this.options.sweep&&!this.points?.length){this.message='Golden hunt: esperando dorados visibles en '+d.name;return null;}
      if(!this.points?.length)return this.cancel(`Golden hunt pausado: sin puntos transitables en ${d.name}`);
      if(distance(s.position,this.progressPosition)>1){this.progressPosition={...s.position};this.progressAt=now;}
      if(now-this.progressAt>45000)return this.cancel(`Golden hunt pausado: sin avanzar en ${d.name} durante 45 s`);
      this.message=`Golden hunt: ${d.name} · ${Math.ceil((HUNT_TIME-(now-this.arrivedAt))/1000)} s · ${this.kills[s.map]??0}/5 kills · ${this.boxes} Kundun`;
      if(this.point){if(distance(s.position,this.point.spot)<=2 || now-this.point.at>12000){this.point=null;this.pointIndex++;}else return null;}
      const spot=this.points[this.pointIndex%this.points.length];this.point={spot,at:now};return{kind:'walk',spot,hunter:true};
    }
  }
  // Cosmetic adapter belongs only to the current hero model, never its prototype.
  class HideHelmet {
    constructor(){this.enabled=false;this.binding=null;this.message='Desactivado';}
    detach(){
      const b=this.binding;if(!b)return;this.binding=null;
      if(b.model.loadPartAsync===b.wrapper){
        if(b.own)Object.defineProperty(b.model,'loadPartAsync',b.own);else delete b.model.loadPartAsync;
      }
      if(b.entity.charAppearance)b.entity.charAppearance.changed=true;
    }
    sync(world,store){
      try{
        const entity=world?.playerEntity,model=entity?.modelObject;
        const special=!!entity?.skin || (world?.mapIndex>=18&&world?.mapIndex<=23);
        const available=store?.uiState===5&&!store.sceneLoading&&!store.spritesLoading&&entity?.localPlayer===true&&!special&&model?.Ready&&entity.charAppearance&&typeof model.loadPartAsync==='function'&&typeof model.setDefaultHelm==='function'&&typeof model.setDefaultMask==='function'&&typeof model.HelmMask?.Unload==='function'&&model.Helm;
        if(this.binding&&(this.binding.world!==world||this.binding.entity!==entity||this.binding.model!==model||!available||!this.enabled))this.detach();
        if(!this.enabled){this.message='Desactivado';return;}
        if(!available){this.message=special?'Suspendido: apariencia especial':'Esperando modelo compatible';return;}
        if(!this.binding){
          const original=model.loadPartAsync,own=Object.getOwnPropertyDescriptor(model,'loadPartAsync');
          const wrapper=function(dir,part,...args){
            if(part===this.HelmMask){this.HelmMask.Unload();return Promise.resolve();}
            return original.call(this,dir,part,...args);
          };
          model.loadPartAsync=wrapper;this.binding={world,entity,model,original,own,wrapper};
          model.HelmMask.Unload();
          if(!model.Helm.Ready)Promise.resolve(model.setDefaultHelm()).catch(error=>{
            if(this.binding?.model===model){this.enabled=false;this.detach();this.message='No se pudo restaurar la cabeza';}
            console.error('[Helper apariencia]',error);
          });
        }
        this.message='Casco oculto solo en tu pantalla';
      }catch(error){this.enabled=false;this.detach();this.message='Apariencia no disponible';console.error('[Helper apariencia]',error);}
    }
  }
  // Public deployed layout-BkT3HDXh.js: ItemSlot 7 + wingSpec, audited 2026-10-07.
  const WING_STYLES=[{"id":"original","name":"Originales"},{"id":"wing-12-0","name":"Wings of Fairy","group":12,"num":0},{"id":"wing-12-1","name":"Wings of Angel","group":12,"num":1},{"id":"wing-12-2","name":"Wings of Satan","group":12,"num":2},{"id":"wing-12-3","name":"Wings of Spirit","group":12,"num":3},{"id":"wing-12-4","name":"Wings of Soul","group":12,"num":4},{"id":"blade-knight","name":"Blade Knight","group":12,"num":5},{"id":"wing-12-6","name":"Wings of Darkness","group":12,"num":6},{"id":"wing-12-36","name":"Wing of Storm","group":12,"num":36},{"id":"wing-12-37","name":"Wing of Space Time","group":12,"num":37},{"id":"wing-12-38","name":"Wing of Illusion","group":12,"num":38},{"id":"wing-12-39","name":"Wings of Hurricane","group":12,"num":39},{"id":"wing-12-40","name":"Mantle of Monarch","group":12,"num":40},{"id":"wing-12-41","name":"Wing of Mistery","group":12,"num":41},{"id":"wing-12-42","name":"Wing of Despair","group":12,"num":42},{"id":"wing-12-43","name":"Wings of Violent Wind","group":12,"num":43},{"id":"wing-13-30","name":"Cape of Lord","group":13,"num":30}];
  const wingStyleOption=id=>WING_STYLES.find(option=>option.id===id);
  class WingStyle {
    constructor(){this.style='original';this.binding=null;this.message='';}
    detach(){
      const b=this.binding;if(!b)return;this.binding=null;
      if(b.model.setWingsAsync===b.wrapper){if(b.own)Object.defineProperty(b.model,'setWingsAsync',b.own);else delete b.model.setWingsAsync;}
      b.model.Wings?.Unload();
      if(b.entity.charAppearance)b.entity.charAppearance.changed=true;
    }
    fail(binding,error){
      if(this.binding!==binding)return;
      this.style='original';this.detach();this.message='No se pudieron mostrar las alas elegidas';console.error('[Helper alas]',error);
    }
    sync(world,store){
      try{
        const entity=world?.playerEntity,model=entity?.modelObject;
        const special=!!entity?.skin||(world?.mapIndex>=18&&world?.mapIndex<=23);
        const available=store?.uiState===5&&!store.sceneLoading&&!store.spritesLoading&&entity?.localPlayer===true&&!special&&model?.Ready&&entity.charAppearance&&typeof model.setWingsAsync==='function'&&typeof model.Wings?.Unload==='function';
        const option=wingStyleOption(this.style);
        if(!option)this.style='original';
        if(this.binding&&(this.binding.style!==this.style||this.binding.world!==world||this.binding.entity!==entity||this.binding.model!==model||!available||this.style==='original'))this.detach();
        if(this.style==='original')return;
        if(!available){this.message=special?'Suspendido: apariencia especial':'Esperando modelo compatible';return;}
        if(!this.binding){
          const original=model.setWingsAsync,own=Object.getOwnPropertyDescriptor(model,'setWingsAsync'),adapter=this;
          const binding={world,entity,model,original,own,style:this.style,wrapper:null};
          binding.wrapper=function(wings,...args){
            // Rendering receives a copy; equipment and charAppearance stay authoritative.
            const cosmetic=wings?{...wings,group:option.group,num:option.num}:wings;
            try{return Promise.resolve(original.call(this,cosmetic,...args)).catch(error=>adapter.fail(binding,error));}
            catch(error){adapter.fail(binding,error);return Promise.resolve();}
          };
          model.setWingsAsync=binding.wrapper;this.binding=binding;
          model.Wings.Unload();entity.charAppearance.changed=true;
        }
        this.message=entity.charAppearance.wings?`${option.name} solo en tu pantalla`:'Equipá alas para aplicar el estilo';
      }catch(error){this.style='original';this.detach();this.message='Apariencia de alas no disponible';console.error('[Helper alas]',error);}
    }
  }
  if(typeof module==='object' && module.exports && typeof document==='undefined'){module.exports={DailySchedule,scheduleWindow,validSchedule,SCHEDULE_DEFAULTS,SCHEDULE_ZONE,BalrogEvent,BalrogTrip,balrogNotice,balrogIdentity,MapVisit,validLeveling,migrateLeveling,usableLevelMaps,LevelSpots,RouteVariation,observedRoute,levelMonster,routeBank,validRoutes,capturePathLocation,pairCharacterInventory,equipmentStats,EQUIPMENT_SLOTS,characterStats,compareStats,StatsComparison,STATS_FIELDS,STATS_DERIVED,minimumLevel,MG_MINIMUMS,accountIdentity,AccountSettings,WING_STYLES,wingStyleOption,WingStyle,currentPathStep,warpDestination,SoulShield,goldPreferences,validGoldPreferences,huntCanStart,remainingMap,LEVEL_MAPS,levelPath,validPath,LOOT_DEFAULTS,lootPolicy,matchesLoot,zenInReach,ExcellentLoot,matchesExcellentLoot,lootNames,validLootPreferences,nativeLootSettings,nativeLootConflict,validPreferences,HideHelmet,Cycle,route,NativeHelper,NativeAutoParty,AutoParty,DEFAULTS,GoldenHunt,MoveLevels,HUNT_ROUTE,HUNT_ORDER,GOLD_LEVELS,huntVisible,killedPacket,huntPoints,isKundun,serverMessage,serverKey};return;}
  if(location.hostname!=='mu.mormon.garden' && !window.__LEVEL_HELPER_DEMO__)return;
  if(document.getElementById('mu-level-helper'))return;
  const instanceKey=Symbol.for('mu.addons.instance.helper.v1');
  if(window[instanceKey])return;
  window[instanceKey]=true;
  // Native event timers keep a readable size regardless of the game's UI scale.
  // A stylesheet also covers timers recreated after returning to the world.
  const eventTimerStyle=document.createElement('style');eventTimerStyle.id='mu-helper-event-timers-style';
  eventTimerStyle.textContent=`
    .event-timers{transform:none!important;width:220px!important;max-width:calc(100vw - 16px)}
    .event-timers .event-row{height:24px!important;line-height:24px!important;display:flex;gap:6px}
    .event-timers .mu-text{font-size:16px!important;line-height:24px!important;text-shadow:1px 1px 2px #000,-1px -1px 2px #000}
    .event-timers .event-row-label{width:150px!important;flex:1;white-space:nowrap}
    .event-timers .event-row-clock{width:64px!important;flex:none;font-variant-numeric:tabular-nums;white-space:nowrap}
  `;
  (document.head||document.documentElement).append(eventTimerStyle);
  const host=document.createElement('div');host.id='mu-level-helper';host.style.cssText='position:fixed;right:14px;top:240px;z-index:2147483000;max-width:calc(100vw - 28px);';
  const root=host.attachShadow({mode:'open'});
  root.innerHTML='<style>:host{color-scheme:dark;font:12px Verdana,sans-serif;color:#eee6d1;display:block}button{display:grid;place-items:center;width:44px;height:44px;padding:0;color:#e7c780;background:#15170ff2;border:1px solid #76633d;border-radius:50%;cursor:pointer}button:hover{background:#292c20}button:focus-visible{outline:2px solid #e7c780;outline-offset:3px}button:disabled{opacity:.45;cursor:default}button[aria-pressed="true"]{border-color:#a4c880;color:#c1e7a0}svg{width:20px;height:20px;fill:currentColor}.pause{display:none}button[aria-pressed="true"] .play{display:none}button[aria-pressed="true"] .pause{display:block}[hidden]{display:none!important}.controls{display:flex;gap:6px;justify-content:flex-end}.config{box-sizing:border-box;width:280px;max-width:calc(100vw - 28px);max-height:calc(100dvh - 305px);overflow:auto;margin-top:8px;padding:14px;background:#15170ff2;border:1px solid #76633d;border-radius:8px;line-height:1.6}.config h2{font-size:13px;color:#e7c780;margin:0 0 10px}.config p{margin:8px 0}.config dl{margin:0}.config dt{color:#aeb6a0;margin-top:8px}.config dd{margin:0}.status{color:#c1e7a0}@media(max-height:550px){:host{top:80px!important}.config{max-height:calc(100dvh - 145px)}}</style><div class="controls"><button class="toggle" aria-label="Iniciar ciclo" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="play" d="M7 4v16l13-8z"/><path class="pause" d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg></button><button class="party" aria-label="Ver party automática" aria-pressed="true"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM1 21v-3a8 8 0 0 1 16 0v3zm17-16v3h-3v2h3v3h2v-3h3V8h-3V5z"/></svg></button><button class="settings" aria-label="Ver configuración" aria-expanded="false" aria-controls="helper-config"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.4 13a7.8 7.8 0 0 0 0-2l2-1.5-2-3.5-2.4 1a8.3 8.3 0 0 0-1.7-1L15 3h-4l-.4 3a8.3 8.3 0 0 0-1.7 1L6.5 6l-2 3.5 2 1.5a7.8 7.8 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a8.3 8.3 0 0 0 1.7 1L11 21h4l.3-3a8.3 8.3 0 0 0 1.7-1l2.4 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg></button></div><section id="helper-config" class="config" aria-label="Configuración del helper" hidden><h2>Configuración</h2><div class="legacy-status" hidden><p class="status" role="status" aria-live="polite"></p><p class="character"></p><span class="gold-state"></span><span class="gold-levels"></span><span class="party-state"></span></div></section>';
  document.body.append(host);const $=s=>root.querySelector(s);
  // Separate presentation survives external-panel hiding of the canonical host.
  const quickHost=document.createElement('div');quickHost.id='mu-helper-quick-control';
  quickHost.style.cssText='position:fixed;left:14px;top:180px;z-index:2147483001';
  const quickRoot=quickHost.attachShadow({mode:'open'});
  quickRoot.innerHTML='<style>:host{font:12px Verdana,sans-serif;color-scheme:dark}.bar{display:flex;background:#15170ff2;border:1px solid #76633d;border-radius:6px;overflow:hidden}button{font:inherit;color:#e7c780;background:transparent;border:0;padding:9px;cursor:pointer}button:focus-visible{outline:2px solid #e7c780;outline-offset:-3px}button:disabled{opacity:.45;cursor:default}.grip{cursor:move;touch-action:none;border-right:1px solid #76633d;padding:9px 6px}.play[aria-pressed="true"]{color:#c1e7a0}</style><div class="bar"><button class="grip" aria-label="Mover control del Helper" title="Arrastrar para mover">⠿</button><button class="play" aria-label="Iniciar ciclo (F10)" aria-pressed="false">▶ Pausado · F10</button></div>';
  document.body.append(quickHost);
  const quickButton=quickRoot.querySelector('.play'),quickGrip=quickRoot.querySelector('.grip');
  const quickPositionKey=window.__LEVEL_HELPER_DEMO__?'mu.level-helper.demo-quick-position.v1':'mu.level-helper.quick-position.v1';
  function placeQuick(x,y){quickHost.style.left=Math.max(0,Math.min(x,Math.max(0,innerWidth-quickHost.offsetWidth)))+'px';quickHost.style.top=Math.max(0,Math.min(y,Math.max(0,innerHeight-quickHost.offsetHeight)))+'px';}
  try{const p=JSON.parse(localStorage.getItem(quickPositionKey));if(Number.isFinite(p?.x)&&Number.isFinite(p?.y))placeQuick(p.x,p.y);}catch{}
  let quickDrag=null;
  quickGrip.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();const r=quickHost.getBoundingClientRect();quickDrag={dx:e.clientX-r.left,dy:e.clientY-r.top};quickGrip.setPointerCapture(e.pointerId);});
  quickGrip.addEventListener('pointermove',e=>{if(quickDrag)placeQuick(e.clientX-quickDrag.dx,e.clientY-quickDrag.dy);});
  function finishQuickDrag(){if(!quickDrag)return;quickDrag=null;const r=quickHost.getBoundingClientRect();try{localStorage.setItem(quickPositionKey,JSON.stringify({x:r.left,y:r.top}));}catch{}}
  quickGrip.addEventListener('pointerup',finishQuickDrag);quickGrip.addEventListener('pointercancel',finishQuickDrag);
  const resizeQuick=()=>{const r=quickHost.getBoundingClientRect();placeQuick(r.left,r.top);};window.addEventListener('resize',resizeQuick);
  quickButton.onclick=()=>{$('.toggle').click();quickButton.blur();};
  function quickKey(e){if(e.key!=='F10'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.shiftKey||e.isComposing)return;
    if(e.composedPath().some(n=>n instanceof Element&&(n.matches('input,textarea,select')||n.isContentEditable)))return;
    e.preventDefault();e.stopImmediatePropagation();$('.toggle').click();
  }
  window.addEventListener('keydown',quickKey,true);
  for(const name of ['pointerdown','pointerup','click','dblclick','keydown','keyup','wheel','contextmenu'])quickHost.addEventListener(name,e=>e.stopPropagation());
  const balrogHost=document.createElement('div');balrogHost.id='mu-balrog-control';balrogHost.hidden=true;
  const balrogRoot=balrogHost.attachShadow({mode:'open'});
  balrogRoot.innerHTML='<style>:host{display:block;margin-top:6px;max-width:min(280px,calc(100vw - 28px));font:12px Verdana,sans-serif;color:#eee6d1}:host([hidden]){display:none}.body{padding:8px;background:#15170ff2;border:1px solid #76633d;border-radius:6px}button{font:inherit;color:#e7c780;background:transparent;border:1px solid #76633d;border-radius:4px;padding:8px;cursor:pointer}button[aria-pressed=true]{color:#c1e7a0;border-color:#a4c880}button:disabled{opacity:.5;cursor:default}button:focus-visible{outline:2px solid #e7c780}.destination,.state{margin:6px 0 0;overflow-wrap:anywhere}.state{font-size:11px;color:#aeb6a0}</style><div class="body"><button class="balrog-toggle" aria-pressed="false">▶ Cazar Balrog</button><p class="destination"></p><p class="state" role="status"></p></div>';
  quickRoot.append(balrogHost);const balrogButton=balrogRoot.querySelector('button');
  balrogButton.onclick=()=>{toggleBalrog();balrogButton.blur();};
  const legacyKey=window.__LEVEL_HELPER_DEMO__?'mu.level-helper.demo-settings.v1':'mu.level-helper.settings.v1';
  // Existing fixture demos retain their isolated legacy data; account demos opt in.
  const legacyDemo=!!window.__LEVEL_HELPER_DEMO__&&!window.__ACCOUNT_SETTINGS_DEMO__;
  let profileStorage;try{profileStorage=localStorage;}catch{profileStorage=null;}
  const accountSettings=new AccountSettings(profileStorage,legacyKey);
  let identity=legacyDemo?'demo':accountIdentity(window.__store),preferencesKey=identity?(legacyDemo?legacyKey:accountSettings.key(identity)):null,profileRaw=null,profileConflict=false;
  const statsComparison=new StatsComparison();let statsNative=null,statsNativeAttempted=false;
  const statsPanel=document.createElement('section');statsPanel.className='stats-view';statsPanel.hidden=true;statsPanel.setAttribute('aria-label','Estadísticas detalladas');
  statsPanel.innerHTML='<h3>Detalle de Character Info</h3><p class="stats-character"></p><div class="stats-buttons"><button class="capture-a" type="button">Capturar A</button><button class="capture-b" type="button">Capturar B</button><button class="clear-stats" type="button">Limpiar comparación</button></div><div class="stats-scroll"><table><caption>Valores actuales y comparación A/B</caption><thead><tr><th>Métrica</th><th>Actual</th><th>A</th><th>B</th><th>Δ</th><th>Δ / A %</th></tr></thead><tbody></tbody></table></div><details class="stats-context"><summary>Capturas y condiciones</summary><p class="stats-captures"></p><p class="stats-warning" role="status"></p></details><p class="stats-limit">Rango nativo y propiedades del equipo son fuentes distintas; no se suman. Δ = B − A; Δ de tasas en puntos porcentuales. Buffs y daño efectivo no disponibles.</p>';
  const statsHost=document.createElement('div');statsHost.id='mu-helper-stats';statsHost.hidden=true;const statsRoot=statsHost.attachShadow({mode:'open'});statsRoot.append(statsPanel);const statsStyle=document.createElement('style');statsStyle.textContent='.stats-view{box-sizing:border-box;width:340px;max-width:calc(100vw - 28px);max-height:calc(100dvh - 90px);overflow:auto;padding:12px;margin-top:0;background:#15170ff2;border:1px solid #76633d;border-radius:8px}.stats-view summary{cursor:pointer;color:#e7c780;padding:8px 0}.stats-view h3{color:#e7c780;margin:0 0 8px;font-size:12px}.stats-view p{font-size:11px;line-height:1.5;overflow-wrap:anywhere}.stats-buttons{display:flex;flex-wrap:wrap;gap:5px}.stats-buttons button{display:block;width:auto;height:auto;min-height:32px;padding:6px;border-radius:4px;font:inherit}.stats-scroll{overflow:auto}.stats-view table{table-layout:fixed;border-collapse:collapse;width:100%;font-size:10px;font-variant-numeric:tabular-nums}.stats-view th,.stats-view td{overflow-wrap:anywhere;padding:5px 3px;border-bottom:1px solid #76633d;text-align:right}.stats-view td{font-size:9px}.stats-view th:not(:first-child){font-size:9px;white-space:nowrap}.stats-view th:first-child{width:105px;text-align:left;font-weight:normal}.stats-view caption{color:#e7c780;text-align:left;margin-bottom:8px}.stats-limit,.stats-warning{color:#aeb6a0}';statsRoot.append(statsStyle);
  const statsChrome=document.createElement('style');statsChrome.textContent=':host{font:12px Verdana,sans-serif;color:#eee6d1;color-scheme:dark}[hidden]{display:none!important}button{font:inherit;color:#e7c780;background:#15170f;border:1px solid #76633d;border-radius:4px;cursor:pointer}button:disabled{opacity:.4;cursor:default}button:focus-visible,summary:focus-visible{outline:2px solid #e7c780;outline-offset:2px}.stats-header{display:flex;align-items:center;gap:6px;position:sticky;top:-12px;padding:8px 0;background:#15170f;z-index:1;touch-action:none}.stats-header h3{flex:1;margin:0;user-select:none}.stats-header button{width:28px;height:28px;padding:3px}.stats-header svg{width:17px;height:17px;fill:currentColor}';statsRoot.append(statsChrome);
  const statsHeader=document.createElement('header');statsHeader.className='stats-header';statsHeader.append(statsPanel.querySelector('h3'));statsHeader.insertAdjacentHTML('beforeend','<button class="stats-lock" type="button" aria-pressed="true" aria-label="Desbloquear posición de estadísticas">🔒</button><button class="stats-hide" type="button" aria-label="Ocultar estadísticas">−</button>');statsPanel.prepend(statsHeader);
  let pairedStore=null,disposePair=null;
  statsHeader.querySelector('.stats-lock').remove();
  statsHeader.querySelector('.stats-hide').remove();
  statsStyle.textContent+='@media(max-width:849px){.stats-character,.stats-equipment{display:none}.stats-header{padding:0}.stats-view{padding:8px}.stats-view caption{margin:4px 0}}';
  statsHost.setAttribute('data-no-drag','true');
  function mountStats(enabled){
    const store=window.__store,character=store?.characterInfoEnabled?document.querySelector('.mu-item-window.character-info, .mu-item-window.v097d-character'):null;
    if(character){if(statsHost.parentElement!==character)character.append(statsHost);}else statsHost.remove();
    const detail=enabled&&!!character&&!!statsComparison.current;
    statsPanel.hidden=!detail;statsHost.hidden=!detail;
    if(!detail)return;
    // Read native placement/scale; never write styles or storage on C or V.
    // Only the attached detail is fitted around C. Native drag/lock/persistence
    // remains entirely owned by the client, including while stats are disabled.
    const rect=character.getBoundingClientRect(),scale=rect.width/(character.offsetWidth||190);
    if(!(scale>0))return;
    const gap=12,margin=12,width=Math.min(380,innerWidth-margin*2),maxHeight=Math.min(560,innerHeight-margin*2);
    const right=innerWidth-margin-rect.right-gap,left=rect.left-margin-gap;
    let x,y,height=maxHeight,detailWidth=width;
    if(Math.max(right,left)>=Math.min(280,width)){
      const onRight=right>=left;detailWidth=Math.min(width,onRight?right:left);
      x=onRight?rect.right+gap:rect.left-gap-detailWidth;
      y=Math.max(margin,Math.min(rect.top,innerHeight-margin-height));
    }else{
      x=Math.max(margin,Math.min(rect.left,innerWidth-margin-width));
      const below=innerHeight-margin-rect.bottom-gap,above=rect.top-margin-gap;
      if(Math.max(below,above)>=90){height=Math.min(maxHeight,Math.max(below,above));y=below>=above?rect.bottom+gap:rect.top-gap-height;}
      else y=margin;
    }
    statsHost.style.cssText='position:absolute;z-index:1;transform-origin:0 0;transform:scale('+(1/scale)+');';
    statsHost.style.left=(x-rect.left)/scale+'px';statsHost.style.top=(y-rect.top)/scale+'px';
    statsPanel.style.width=detailWidth+'px';statsPanel.style.maxWidth=detailWidth+'px';statsPanel.style.maxHeight=Math.max(90,height)+'px';
  }
  for(const element of [statsHost])for(const name of ['pointerdown','pointerup','click','dblclick','contextmenu','wheel'])element.addEventListener(name,event=>event.stopPropagation());
  // Native keyboard routing (including C/V/Escape) remains intact. Mouse actions
  // don't capture focus; Tab/Enter still provide deliberate button activation.
  for(const element of [statsHost])element.addEventListener('pointerdown',event=>{if(event.composedPath().some(node=>node?.tagName==='BUTTON'))event.preventDefault();});
  function loadStatsNative(){
    if(statsNativeAttempted||window.__LEVEL_HELPER_DEMO__)return;
    if(location.origin!=='https://mu.mormon.garden')return;
    const build=STATS_BUILDS.find(build=>[...document.scripts].some(script=>new URL(script.src||location.href).pathname===build.entry));if(!build)return;
    statsNativeAttempted=true;
    import(new URL(build.module,location.origin).href).then(module=>{const catalog=module[build.catalog],slots=module[build.slots];if(typeof module[build.calculate]==='function'&&typeof catalog?.getItem==='function'&&slots?.LeftHandSlot===0&&slots?.RightHandSlot===1&&slots?.LastEquippableItemSlotIndex===11&&(!build.tooltip||typeof module[build.tooltip]==='function')&&(!build.name||typeof module[build.name]==='function')&&(build.wizardrySlot===undefined||typeof module[build.itemStats]==='function'))statsNative={calculate:module[build.calculate],hasItem:item=>!!catalog.getItem(item.group,item.num),name:item=>build.name&&typeof module[build.name]==='function'?module[build.name](item):catalog.getItem(item.group,item.num)?.ItemName,itemStats:module[build.itemStats],tooltip:build.tooltip?module[build.tooltip]:null,wizardrySlot:build.wizardrySlot??1,compatible:true};}).catch(()=>{});
  }
  const statsValue=value=>value===null||value===undefined?'—':Number.isInteger(value)?String(value):value.toFixed(1);
  function refreshStats(){
    const enabled=preferences.detailedStats===true&&!profileConflict&&!preferencesInvalid;
    loadStatsNative();
    const compatible=window.__LEVEL_HELPER_DEMO__?window.__STATS_DEMO_COMPATIBLE__===true:statsNative?.compatible===true;
    if(pairedStore!==window.__store){disposePair?.();disposePair=null;pairedStore=window.__store;}
    if((!compatible||preferences.pairInventory!==true||profileConflict||preferencesInvalid)&&disposePair){disposePair();disposePair=null;}
    if(compatible&&preferences.pairInventory===true&&!profileConflict&&!preferencesInvalid&&!disposePair&&pairedStore)disposePair=pairCharacterInventory(pairedStore);
    const pairStatus=settingsRoot.querySelector('.pair-runtime-state');if(pairStatus)pairStatus.textContent=preferences.pairInventory===true?(!compatible?'C/V no disponible: build sin adaptador compatible. Se conservan los controles nativos.':disposePair?'C/V habilitado. Abrí cada ventana manualmente.':'C/V pendiente: el cliente no expone el estado de ventanas compatible.'):'C/V conserva el comportamiento nativo.';
    pairStatus.hidden=!preferences.pairInventory||!!disposePair;setting('.pair-inventory').title=pairStatus.textContent;
    if(!enabled){statsComparison.clear();mountStats(false,compatible&&preferences.pairInventory===true);return;}
    const native=window.__LEVEL_HELPER_DEMO__?window.__STATS_DEMO_NATIVE__??null:statsNative;
    statsComparison.update(characterStats(window.__store,window.__world,identity,native));
    const current=statsComparison.current,comparison=compareStats(statsComparison.a,statsComparison.b),query=selector=>statsPanel.querySelector(selector);
    query('.stats-character').textContent=current?current.name:'Esperando personaje conectado';
    query('.capture-a').disabled=!current;query('.capture-b').disabled=!current||!statsComparison.a;
    query('.stats-captures').textContent=['a','b'].map(key=>{const value=statsComparison[key];return value?key.toUpperCase()+': '+new Date(value.at).toLocaleTimeString():key.toUpperCase()+': sin captura';}).join(' | ');
    query('.stats-warning').textContent=[!compatible?'Adaptador nativo no disponible. Podés capturar A/B; los cálculos sin fuente figuran como No disponible.':null,current?.staffWarning,comparison?.warnings.join(' · ')??'Buffs y condiciones del enemigo desconocidos.'].filter(Boolean).join(' · ');query('.stats-context summary').textContent=(comparison?.warnings.some(text=>text.startsWith('Cambió'))?'Condiciones cambiaron · ':'')+'Capturas y condiciones';
    const tbody=query('tbody');tbody.replaceChildren();
    for(const metric of current?.metrics??[]){const compared=comparison?.rows.find(row=>row.key===metric.key),row=document.createElement('tr'),heading=document.createElement('th');heading.scope='row';heading.textContent=metric.label;heading.title=metric.source;row.append(heading);
      for(const value of [metric.value,statsComparison.a?.metrics.find(m=>m.key===metric.key)?.value,statsComparison.b?.metrics.find(m=>m.key===metric.key)?.value,compared?.delta,compared?.percent]){const cell=document.createElement('td');cell.textContent=value===null||value===undefined?(row.children.length===1?'No disponible':'—'):statsValue(value);if(row.children.length===4&&value!==null&&value!==undefined&&['staffRate','staffTooltipRate','excellentRate'].includes(metric.key))cell.textContent+=' pp';cell.title=metric.source;row.append(cell);}tbody.append(row);
    }
    mountStats(enabled,compatible);
  }
  statsPanel.querySelector('.capture-a').onclick=()=>{refreshStats();statsComparison.capture('a');refreshStats();};
  statsPanel.querySelector('.capture-b').onclick=()=>{refreshStats();statsComparison.capture('b');refreshStats();};
  statsPanel.querySelector('.clear-stats').onclick=()=>{statsComparison.clear();refreshStats();};
  const freshPreferences=()=>({version:1,spots:JSON.parse(JSON.stringify(DEFAULTS.spots)),arena:true,icarus:true,sendParty:true,acceptParty:true});
  let preferences={version:1,spots:JSON.parse(JSON.stringify(DEFAULTS.spots)),arena:true,icarus:true,sendParty:true,acceptParty:true},preferencesInvalid=false;
  try{const raw=preferencesKey?localStorage.getItem(preferencesKey):null;profileRaw=raw;if(raw!==null){const saved=JSON.parse(raw);if(validPreferences(saved,'stored'))preferences={...saved,arena:saved.arena??true,icarus:saved.icarus??true};else preferencesInvalid=true;}}catch{preferencesInvalid=true;}
  const cycle=new Cycle(preferences),native=new NativeHelper(),party=new AutoParty(),nativeParty=new NativeAutoParty();let queuedAction=null,desiredHelper=null,ownedMove=null;
  let huntStorage;try{huntStorage=localStorage;}catch{huntStorage=null;}
  const levels=new MoveLevels(huntStorage,window.__LEVEL_HELPER_DEMO__?'mu.gold-hunter.demo-move-levels.v1':LEVELS_KEY),gold=new GoldenHunt(levels),excellentLoot=new ExcellentLoot(),soulShield=new SoulShield();
  const balrogEvent=new BalrogEvent(),balrog=new BalrogTrip();let balrogSession=null,balrogNative=null;
  // Import only the already-loaded audited module; unknown builds keep packet detection.
  if(!window.__LEVEL_HELPER_DEMO__&&[...document.scripts].some(s=>s.src.endsWith('/assets/index-Drn8eqTh.js'))){
    import('/assets/layout-DJi2NQ83.js').then(m=>{if(typeof m.ee==='function')balrogNative=m.ee;}).catch(()=>{});
  }
  // A local ownership marker, not an authentication token; isolated blank demos lack randomUUID.
  const scheduleOwner=globalThis.crypto?.randomUUID?.()??('schedule-'+Date.now()+'-'+Math.random().toString(36).slice(2)),scheduleBase=window.__LEVEL_HELPER_DEMO__?'mu.level-helper.demo-schedule-runtime.v1':'mu.level-helper.schedule-runtime.v1';
  let scheduleBusy=false,scheduleManualBusy=false,scheduleControl=null,scheduleMessage='Programación desactivada',scheduleError='',scheduleObserved=false,scheduleScope=null,schedulePendingFailure='';
  const scheduleConfig=()=>preferences.schedule??SCHEDULE_DEFAULTS;
  const scheduleKey=owner=>scheduleBase+'.account.'+encodeURIComponent(owner);
  function readSchedule(owner){const raw=localStorage.getItem(scheduleKey(owner));return new DailySchedule(raw===null?null:JSON.parse(raw));}
  function writeSchedule(owner,policy){localStorage.setItem(scheduleKey(owner),JSON.stringify(policy.record));}
  function scheduleLock(owner,action){if(legacyDemo)return Promise.resolve().then(action);if(!navigator.locks?.request)return Promise.reject(Error('Sin bloqueo seguro de programación'));return navigator.locks.request(scheduleKey(owner),action);}
  function pauseLevel(message){
    const hadControl=cycle.running||scheduleControl!==null,pending=cycle.pending,stopHome=desiredHelper!==null||native.pending!=null;
    party.cancel();soulShield.clear(window.__world,window.__store);excellentLoot.clear();clearOwned();clearHuntTargets();
    const awaiting=!!pending&&!queuedAction;
    cycle.stop(message+(awaiting?' · solicitud enviada pendiente de confirmación':''));queuedAction=null;
    if(hadControl&&!balrog.active&&stopHome)enact({kind:'stop'});
    scheduleControl=null;scheduleObserved=false;
  }
  function scheduleStatus(){return {enabled:scheduleConfig().enabled,start:scheduleConfig().start,end:scheduleConfig().end,timeZone:SCHEDULE_ZONE,message:scheduleError||scheduleMessage,control:scheduleControl};}
  function invalidateScheduleSession(message){
    const owner=identity;if(!owner||!scheduleConfig().enabled||(!cycle.running&&!scheduleObserved))return;
    scheduleControl=null;scheduleObserved=false;
    scheduleLock(owner,()=>{const policy=readSchedule(owner);if(policy.record.leaseOwner===scheduleOwner){policy.fail(message);writeSchedule(owner,policy);}}).catch(()=>{});
  }
  function inhibitForCaza(now){
    if(!scheduleConfig().enabled||!cycle.running)return;
    const owner=identity,c=scheduleConfig(),w=scheduleWindow(c,now);scheduleControl=null;scheduleObserved=false;
    if(owner&&w.active)scheduleLock(owner,()=>{const policy=readSchedule(owner);policy.sync(c,now);policy.pause(now,w.end);writeSchedule(owner,policy);}).catch(error=>{if(identity===owner)scheduleError='Inicio bloqueado: '+error.message;});
  }
  function evaluateSchedule(s,now){
    const config=scheduleConfig(),w=scheduleWindow(config,now);
    if(scheduleScope!==identity){scheduleScope=identity;scheduleControl=null;scheduleObserved=false;scheduleError='';schedulePendingFailure='';}
    if(!config.enabled){scheduleMessage=cycle.running?'Programación desactivada · modo manual':'Programación desactivada';return;}
    if(scheduleObserved&&!cycle.running&&!balrog.active){schedulePendingFailure=cycle.message;scheduleObserved=false;}
    if(!w.active){if(cycle.running)pauseLevel('Fuera de horario · '+config.start+'–'+config.end+' · Hora de Argentina');scheduleMessage='Fuera de horario · '+config.start+'–'+config.end+' · Hora de Argentina';return;}
    if(!identity||profileConflict||preferencesInvalid){scheduleMessage='Inicio bloqueado: cuenta o configuración no disponible';return;}
    if(scheduleError){if(cycle.running)pauseLevel('Programación bloqueada: '+scheduleError);return;}
    if(scheduleBusy||scheduleManualBusy)return;
    const owner=identity,character=s.name;
    scheduleBusy=true;
    scheduleLock(owner,()=>{
      if(scheduleManualBusy||identity!==owner||(!legacyDemo&&accountIdentity(window.__store)!==owner))return;
      const current=snapshot(),at=Date.now(),c=scheduleConfig(),policy=readSchedule(owner),windowNow=policy.sync(c,at);
      if(!windowNow.active||current.name!==character)return;
      if(scheduleObserved&&!cycle.running&&!balrog.active){schedulePendingFailure=cycle.message;scheduleObserved=false;}
      if(schedulePendingFailure){policy.fail(schedulePendingFailure);schedulePendingFailure='';writeSchedule(owner,policy);scheduleControl=null;}
      const runtimeName=cycle.running&&cycle.pending?.kind==='reset'?cycle.name:current.name;
      const blocked=policy.blocked(at,runtimeName,scheduleOwner);
      if(blocked){scheduleMessage=blocked;if(cycle.running)pauseLevel(blocked);writeSchedule(owner,policy);return;}
      if(balrog.active){scheduleMessage='Inicio bloqueado por Caza';return;}
      if(cycle.running){
        if(current.ready&&policy.record.character&&policy.record.character!==current.name){policy.pause(at,windowNow.end);writeSchedule(owner,policy);pauseLevel('Cambió el personaje; pulsá Play para iniciar');return;}
        policy.claim(runtimeName,scheduleOwner,at);writeSchedule(owner,policy);scheduleObserved=true;scheduleMessage='Dentro de horario · '+(scheduleControl==='programmed'?'control programado':'control manual');return;
      }
      if(!current.ready||current.dead||current.loading||queuedAction||native.pending||desiredHelper===false){scheduleMessage='Inicio bloqueado: esperando personaje y confirmaciones pendientes';return;}
      if(window.__store?.muHelper?.active&&desiredHelper===null){scheduleMessage='Inicio bloqueado: Home está bajo control manual';return;}
      policy.attempt(current.name,scheduleOwner,at,windowNow.end);writeSchedule(owner,policy);
      if(cycle.start(current,at)){policy.claim(current.name,scheduleOwner,at);writeSchedule(owner,policy);scheduleControl='programmed';scheduleObserved=true;scheduleMessage='Dentro de horario · control programado';}
      else{policy.fail(cycle.message||'No se pudo iniciar; pulsá Play para reintentar');writeSchedule(owner,policy);scheduleMessage=policy.record.failed;}
    }).catch(error=>{if(identity===owner){scheduleError='Inicio bloqueado: '+error.message;if(cycle.running)pauseLevel(scheduleError);}}).finally(()=>{scheduleBusy=false;});
  }
  async function manualLevelToggle(){
    if(scheduleManualBusy)return;
    syncAccount();const c=scheduleConfig(),now=Date.now(),w=scheduleWindow(c,now);
    if(!identity||profileConflict||preferencesInvalid)return;
    if(!c.enabled){if(balrog.active)stopBalrog('Caza pausada: se inició el leveleo');if(cycle.running)pauseLevel('Detenido');else{cycle.start(snapshot(),now);scheduleControl='manual';}refresh();return;}
    if(!w.active){scheduleMessage='Fuera de horario · '+c.start+'–'+c.end+' · Hora de Argentina';cycle.message=scheduleMessage;render(snapshot());return;}
    const owner=identity,wasRunning=cycle.running,character=snapshot().name;
    scheduleManualBusy=true;
    if(wasRunning)pauseLevel('Pausado manualmente');
    try{await scheduleLock(owner,()=>{
      if(identity!==owner||(!legacyDemo&&accountIdentity(window.__store)!==owner)||snapshot().name!==character)throw Error('Cambió la sesión');
      const at=Date.now(),policy=readSchedule(owner),current=snapshot(),windowNow=policy.sync(scheduleConfig(),at);
      if(wasRunning){policy.pause(at,Math.max(w.end,windowNow.active?windowNow.end:0));writeSchedule(owner,policy);scheduleMessage='Pausado manualmente hasta el fin de esta franja';return;}
      if(!windowNow.active||!scheduleConfig().enabled)throw Error('Cambió el horario; volvé a pulsar Play');
      if(policy.record.leaseOwner!==scheduleOwner&&policy.record.leaseUntil>at)throw Error('Helper controlado en otra pestaña');
      if(balrog.active)stopBalrog('Caza pausada: se inició el leveleo');
      policy.record.pausedUntil=0;policy.attempt(current.name,scheduleOwner,at,windowNow.end);writeSchedule(owner,policy);
      if(cycle.start(current,at)){policy.claim(current.name,scheduleOwner,at);writeSchedule(owner,policy);scheduleControl='manual';scheduleObserved=true;schedulePendingFailure='';scheduleError='';}
      else{policy.fail(cycle.message);writeSchedule(owner,policy);}
    });}catch(error){if(identity===owner)scheduleError='Inicio bloqueado: '+error.message;}
    finally{scheduleManualBusy=false;}
    refresh();
  }
  function stopBalrog(message){enact(balrog.stop(message));}
  function updateBalrogEvent(s,now){
    const key=balrogIdentity(s);
    if(key!==balrogSession){const first=balrogSession===null;balrogSession=key;balrogEvent.reset();balrogEvent.nativeBlocked=!first;
      if(balrog.active){balrog.stop('Caza pausada: cambió la sesión');queuedAction=null;clearOwned();desiredHelper=null;native.pending=null;}}
    if(balrogNative&&s.ready&&!s.loading){try{balrogEvent.recover(balrogNative(),now);}catch{}}
  }
  function toggleBalrog(){
    syncAccount();const s=snapshot(),now=Date.now();updateBalrogEvent(s,now);
    if(balrog.active){stopBalrog('Caza pausada');refresh();return;}
    if(!identity||profileConflict||preferencesInvalid||preferences.balrogEnabled!==true)return;
    if(cycle.pending||queuedAction||native.pending||window.__store?.sceneLoading){balrog.message='Caza bloqueada: esperá la confirmación del reset, viaje o Home pendiente';renderBalrog(s);return;}
    if(balrog.start(s,balrogEvent.get(now),now)){inhibitForCaza(now);cycle.stop('Leveleo pausado durante Caza');soulShield.clear(window.__world,window.__store);excellentLoot.clear();clearOwned();clearHuntTargets();desiredHelper=false;}
    refresh();
  }
  function balrogState(){const e=balrogEvent.get(Date.now()),s=snapshot();return{enabled:preferences.balrogEnabled===true,active:balrog.active,ready:!!e&&s.ready&&!s.dead&&!s.loading&&!!identity&&!profileConflict&&!preferencesInvalid,message:balrog.message,destination:e?`${e.destination.name} ${e.x}, ${e.y}`:null};}
  function renderBalrog(s){
    const b=balrogState(),visible=b.enabled&&!!b.destination;
    balrogHost.hidden=!visible;
    const text=b.active?'⏸ Pausar Caza':'▶ Cazar Balrog';
    for(const button of [balrogButton,setting('.balrog-play')]){button.textContent=text;button.setAttribute('aria-pressed',String(b.active));button.setAttribute('aria-label',b.active?'Pausar Caza del Balrog':'Iniciar Caza del Balrog');button.disabled=!b.active&&(!b.enabled||!b.ready);button.title=b.message;}
    balrogRoot.querySelector('.destination').textContent=b.destination??'';
    balrogRoot.querySelector('.state').textContent=b.message;
    setting('.balrog-destination').textContent=b.destination??'Sin ubicación vigente del Balrog';setting('.balrog-state').textContent=b.message;
  }
  let radarModule=null,hunterBus=null,warpSerial=0,warpArrival=null,lootCount=0,ownedTarget=null,ownedPickup=null,ownedCast=null,huntHadControl=false,lastPotion=-Infinity;
  function radarData(){const data=radarModule?.actions.huntingData?.()??{ready:false,records:[],types:[],event:null};return{...data,preferences,ready:data.ready&&Array.isArray(data.live)&&Array.isArray(data.recent)};}
  window.addEventListener('mu-hub:register',event=>{if(event.detail?.id==='radar'&&typeof event.detail.actions?.huntingData==='function')radarModule=event.detail;});
  function render(s){renderBalrog(s);const button=$('.toggle');button.disabled=!cycle.running && (!s.ready||!identity||profileConflict||preferencesInvalid);button.setAttribute('aria-pressed',String(cycle.running));button.setAttribute('aria-label',cycle.running?'Pausar ciclo':'Iniciar ciclo');quickButton.disabled=button.disabled;quickButton.setAttribute('aria-pressed',String(cycle.running));quickButton.setAttribute('aria-label',(cycle.running?'Pausar ciclo':'Iniciar ciclo')+' (F10)');quickButton.textContent=cycle.running?'⏸ Activo · F10':'▶ Pausado · F10';quickButton.title=cycle.message;const invite=$('.party');invite.setAttribute('aria-label','Ver party automática');$('.status').textContent=cycle.message;$('.gold-state').textContent=gold.enabled?(gold.message):gold.message;$('.gold-levels').textContent=HUNT_ROUTE.map(d=>d.name+': '+(levels.required(s,d)??'nivel por aprender')).join(' · ')+(levels.saved?'':' · niveles sin guardar');$('.character').textContent=s.ready?`${s.name} · nivel ${s.level} · ${Math.floor(s.position.x)}, ${Math.floor(s.position.y)} · ${cycle.resets} resets`:'Esperando personaje';const count=window.__social?.partyMembers?.length||1;$('.party-state').textContent=`${count}/5 integrantes`;for(const e of root.querySelectorAll('button'))e.title=e.getAttribute('aria-label');}
  function snapshot(){
    const store=window.__store,world=window.__world,p=world?.playerEntity?.transform?.pos,pd=store?.playerData;
    const connected=!!(store?.gsSocket?.readyState===1 && !store.connectionLost && !store.isOffline);
    return{account:legacyDemo?null:identity,connected,uiState:store?.uiState,loadingCharacters:!!store?.loadingCharactersList,characters:store?.charactersList?.map(c=>c.Name),ready:!!(store?.uiState===5 && pd && p && Number.isFinite(p.x) && Number.isFinite(p.z) && world.playerEntity.playerMoveTo && connected && typeof window.__social?.sendChat==='function'),name:pd?.name,charClass:pd?.charClass,server:serverKey(store?.gsSocket?.url),warpSerial,warpArrival,level:pd?.level,map:world?.mapIndex,entityMap:world?.playerEntity?.worldIndex,position:p?{x:p.x,y:p.z}:null,dead:!!world?.playerEntity?.dying || pd?.currentHP<=0,loading:!!store?.sceneLoading || !!store?.spritesLoading};
  }
  function clearOwned(){
    if(ownedMove){const {hero,x,y}=ownedMove;
      if(hero===window.__world?.playerEntity && hero.playerMoveTo?.point.x===x && hero.playerMoveTo?.point.y===y && !hero.dying){
        const p=hero.transform.pos;hero.playerMoveTo.point.x=p.x;hero.playerMoveTo.point.y=p.z;hero.playerMoveTo.handled=false;hero.playerMoveTo.sendToServer=true;
      }
    }ownedMove=null;
  }
  function clearHuntTargets(){
    const world=window.__world;if(!world)return;
    const hero=world.playerEntity,p=hero?.playerMoveTo?.point;
    const ownApproach=[ownedTarget,ownedPickup].some(e=>e && (world.attackTarget===e||world.pickupTarget===e||world.castRequest===ownedCast) && p && Math.abs(p.x-e.transform.pos.x)<1 && Math.abs(p.y-e.transform.pos.z)<1);
    if(ownApproach&&!hero.dying){hero.playerMoveTo.point.x=hero.transform.pos.x;hero.playerMoveTo.point.y=hero.transform.pos.z;hero.playerMoveTo.handled=false;hero.playerMoveTo.sendToServer=true;if(hero.pathfinding){hero.pathfinding.path=null;hero.pathfinding.from={x:Math.floor(hero.transform.pos.x),y:Math.floor(hero.transform.pos.z)};hero.pathfinding.to={...hero.pathfinding.from};}}
    if(world.attackTarget===ownedTarget)world.attackTarget=null;
    if(world.pickupTarget===ownedPickup)world.pickupTarget=null;
    if(world.castRequest===ownedCast)world.castRequest=null;
    if(ownedTarget && world.castApproach)world.castApproach=null;
    ownedTarget=null;ownedPickup=null;ownedCast=null;
  }
  function onHunterMessage(packet){syncAccount();const data=serverMessage(packet);if(!data)return;const s=snapshot(),now=Date.now();updateBalrogEvent(s,now);if(s.connected&&identity&&s.name&&s.uiState===5)balrogEvent.observe(balrogNotice(data.type,data.text),now);if(data.type===1)gold.feedback(data.text,s,now);}
  function onHunterWarp(packet){syncAccount();warpSerial++;const map=warpDestination(packet);warpArrival=map===null?null:{serial:warpSerial,map};}
  function onHunterKill(packet){
    syncAccount();
    const data=killedPacket(packet),world=window.__world,s=snapshot();
    if(!data||!s.ready||s.dead||s.loading||s.name!==gold.name||s.server!==gold.server||s.charClass!==gold.charClass)return;
    const heroId=world?.playerEntity?.netId??window.__store?.playerId;
    if(!Number.isInteger(heroId)||data.killer!==heroId)return;
    const entity=world.netObjsQuery?.entities.find(e=>e.netId===data.killed);
    if(entity&&gold.confirmKill(entity,s.map,Date.now()))reactToRadar();
  }
  function onHunterHit(packet){const hit=hitPacket(packet);if(gold.active&&hit?.progress&&gold.target?.entity.netId===hit.id)gold.target.at=Date.now();}
  function onHunterLoot(packet){
    excellentLoot.confirm(packet);
    // Only an inventory success containing the exact Kundun item confirms loot.
    if(!gold.loot || !(packet instanceof DataView)||packet.byteLength<10||![0xc1,0xc3].includes(packet.getUint8(0))||packet.getUint8(2)!==0x22)return;
    const item={num:packet.getUint8(4)+((packet.getUint8(7)&0x80)<<1),lvl:(packet.getUint8(5)>>3)&15,group:packet.getUint8(9)>>4};
    if(isKundun(item))lootCount++;
  }
  function onHunterLootFailed(){excellentLoot.failed(Date.now());if(gold.loot){gold.lootFailed('el servidor rechazó el Kundun (inventario, distancia o dueño)');queuedAction=null;clearOwned();clearHuntTargets();}}
  const hunterListeners={ServerMessage:onHunterMessage,MapChanged:onHunterWarp,MapChanged075:onHunterWarp,ItemAddedToInventory:onHunterLoot,InventoryMoneyUpdate:packet=>excellentLoot.confirm(packet),ItemPickUpRequestFailed:onHunterLootFailed,ObjectGotKilled:onHunterKill,ObjectHit:onHunterHit,ObjectHitExtended:onHunterHit};
  function bindHunterBus(){
    const next=window.__eventBus;if(next===hunterBus)return;
    if(hunterBus)for(const [name,fn] of Object.entries(hunterListeners))hunterBus.off(name,fn);
    hunterBus=next?.on&&next?.off?next:null;
    if(hunterBus)for(const [name,fn] of Object.entries(hunterListeners))hunterBus.on(name,fn);
  }
  function returnToLevel(now){
    queuedAction=null;clearOwned();clearHuntTargets();cycle.stage=null;cycle.pending=null;cycle.variation.arrived=null;cycle.settled=false;cycle.progressAt=now;cycle.bestDistance=Infinity;cycle.lastMove=-Infinity;desiredHelper=false;huntHadControl=false;
  }
  function enact(action){
    if(!action)return;
    if(action.kind!=='huntAttack'&&action.kind!=='huntLoot')clearHuntTargets();
    if(action.kind==='select'){
      clearOwned();queuedAction=null;desiredHelper=null;native.pending=null;
      const store=window.__store;
      if(!legacyDemo&&(accountIdentity(store)!==cycle.account||serverKey(store?.gsSocket?.url)!==cycle.server)){cycle.stop('Pausado: cambió la sesión del ciclo');return;}
      if(typeof store?.selectCharacterRequest!=='function'){cycle.stop('Pausado: selección de personaje no disponible');return;}
      try{store.focusedChar=action.name;store.focusCharacterRequest?.(action.name);if(store.selectCharacterRequest(action.name)===false)cycle.stop('Pausado: el cliente rechazó el ingreso');}
      catch{cycle.stop('Pausado: falló la solicitud de ingreso');}return;
    }
    if(action.kind!=='helper')excellentLoot.clear();
    if(action.kind==='helper'){clearOwned();desiredHelper=true;return;}
    desiredHelper=false;clearOwned();
    if(action.kind==='stop'||action.kind==='clear'){queuedAction=null;return;}
    queuedAction=action;
  }
  function serviceHelper(now){
    if(desiredHelper===null)return;
    const result=native.sync(window.__store,desiredHelper,now,window.__world);
    if(result==='safe-zone'&&cycle.running&&!gold.active){desiredHelper=false;cycle.settled=false;cycle.lastMove=-Infinity;cycle.message='Saliendo de zona segura hacia el spot guardado';return;}
    if(result==='unavailable'||result==='timeout'||result==='safe-zone'){
      if(gold.active){gold.cancel(result==='timeout'?'Golden hunt pausado: Home no confirmó la pausa':'Golden hunt pausado: MU Helper no disponible');clearHuntTargets();}
      const message=result==='safe-zone'?'Pausado: Home no se puede activar en zona segura. Salí de la zona y pulsá Play.':result==='timeout'?`Pausado: Home no confirmó ${desiredHelper?'la activación':'la pausa'} del MU Helper. Probá Home y volvé a pulsar Play.`:'Pausado: MU Helper no disponible';
      console.warn('[Level Helper Home]',{result,requestedActive:desiredHelper,actualActive:!!window.__store?.muHelper?.active,map:window.__world?.mapIndex});
      queuedAction=null;if(balrog.active)balrog.stop('Caza: '+message);cycle.stop(message);desiredHelper=null;return;
    }
    if(result==='waiting'&&balrog.active){balrog.message='Esperando Home: '+(desiredHelper?'activar':'detener');return;}
    if(result==='waiting'){cycle.message='Esperando Home: '+(desiredHelper?'activar':'detener')+' MU Helper';return;}
    // Once a paused cycle has stopped Home, release it for manual use.
    if(!cycle.running&&!gold.active&&!balrog.active&&desiredHelper===false){desiredHelper=null;native.pending=null;}
    if(!queuedAction)return;
    const action=queuedAction;queuedAction=null;
    if(action.kind==='command'){
      if(!action.hunter&&!action.balrog)cycle.commandSent(now,warpSerial);
      if(action.balrog){if(!balrog.active)return;balrog.warpAt=now;balrog.serial=warpSerial;try{const ok=Number.isInteger(action.warpIndex)&&typeof window.__store.warpCommandRequest==='function'?window.__store.warpCommandRequest(action.warpIndex):window.__social.sendChat(action.text);if(ok===false)stopBalrog('Caza pausada: el cliente rechazó el viaje');}catch{stopBalrog('Caza pausada: falló la solicitud de viaje');}return;}
      if(action.hunter){if(!gold.active||!gold.pending)return;gold.commandSent(now,warpSerial);if(!window.__social.sendChat(action.text)){gold.cancel('Golden hunt pausado: /move rechazado por el cliente');clearHuntTargets();}}
      else if(Number.isInteger(action.warpIndex)&&typeof window.__store?.warpCommandRequest==='function'){
        try{if(window.__store.warpCommandRequest(action.warpIndex)===false)cycle.commandRejected();}catch{cycle.commandRejected();}
      }else if(!window.__social.sendChat(action.text))cycle.commandRejected();return;
    }
    if(action.kind==='huntAttack'||action.kind==='huntLoot'){
      if(!gold.active)return;
      const world=window.__world,target=action.entity;
      if(!world?.netObjsQuery?.entities.includes(target)||!huntVisible(target,world.mapIndex)||target.dying)return;
      if((action.kind==='huntAttack'&&ownedTarget!==target)||(action.kind==='huntLoot'&&ownedPickup!==target))clearHuntTargets();
      if(action.kind==='huntLoot'){world.pickupTarget=target;ownedPickup=target;return;}
      world.attackTarget=target;ownedTarget=target;
      // Native basic AttackSystem requires worldIndex. Keep the entity intact;
      // skill casting accepts current-world entities without that optional field.
      const path=world.pathfinder?.search?.({x:Math.floor(world.playerEntity.transform.pos.x),y:Math.floor(world.playerEntity.transform.pos.z)},{x:Math.floor(target.transform.pos.x),y:Math.floor(target.transform.pos.z)},{closest:true});
      if(typeof world.pathfinder?.search==='function'&&(!path?.length||distance(path[path.length-1],{x:target.transform.pos.x,y:target.transform.pos.z})>3)){gold.ignored.add(target);gold.target=null;clearHuntTargets();return;}
      const store=window.__store,num=store.muHelper?.config?.skills?.[0];
      if(num>0&&store.skills?.some(skill=>skill.number===num)&&typeof store.selectSkill==='function'){
        if(!world.castRequest){store.selectSkill(num);if(store.currentSkill===num){ownedCast={target,point:{x:target.transform.pos.x,y:target.transform.pos.z}};world.castRequest=ownedCast;}}
      }else if(target.worldIndex===undefined){gold.cancel('Golden hunt pausado: objetivo sin mapa requiere una skill aprendida');clearHuntTargets();}
      return;
    }
    if(action.kind==='walk'){
      const world=window.__world,hero=world?.playerEntity,{x,y}=action.spot;
      if(action.balrog){if(!balrog.active)return;if(world?.terrain==null||!hero||hero.dying||!world.isWalkable(x,y)){stopBalrog('Caza pausada: destino no transitable');return;}const path=world.pathfinder?.search?.({x:Math.floor(hero.transform.pos.x),y:Math.floor(hero.transform.pos.z)},{x,y},{closest:false});if(typeof world.pathfinder?.search==='function'&&(!path?.length||distance(path.at(-1),{x,y})>1)){stopBalrog('Caza pausada: no existe un camino completo');return;}hero.playerMoveTo.point.x=x+.5;hero.playerMoveTo.point.y=y+.5;hero.playerMoveTo.handled=false;hero.playerMoveTo.sendToServer=true;ownedMove={hero,x:x+.5,y:y+.5};return;}
      if(world?.terrain==null || !hero || hero.dying)return;
      if(!world.isWalkable(x,y)||((cycle.config.varySpots||cycle.config.leveling)&&!action.hunter&&(world.getTerrainFlag?.(x,y)&5))){if(action.hunter){gold.point=null;gold.pointIndex++;}else if(!cycle.config.leveling&&cycle.config.varySpots){cycle.variation.fail();cycle.stage=null;cycle.settled=false;}else cycle.stop('Pausado: coordenadas del spot no transitables');return;}
      if((action.hunter||cycle.config.varySpots||cycle.config.leveling)&&typeof world.pathfinder?.search==='function'){
        const path=world.pathfinder.search({x:hero.transform.pos.x,y:hero.transform.pos.z},{x,y},{closest:false});
        if(distance({x:hero.transform.pos.x,y:hero.transform.pos.z},{x,y})>1&&(!path?.length||distance(path[path.length-1],{x,y})>1)){if(action.hunter){gold.point=null;gold.pointIndex++;}else if(cycle.config.leveling)cycle.stop('Pausado: no existe un camino completo al spot elegido');else{cycle.variation.fail();cycle.stage=null;cycle.settled=false;}return;}
      }
      const offset=action.hunter?0:.5;
      hero.playerMoveTo.point.x=x+offset;hero.playerMoveTo.point.y=y+offset;hero.playerMoveTo.handled=false;hero.playerMoveTo.sendToServer=true;
      ownedMove={hero,x:x+offset,y:y+offset};
    }
  }
  const hideHelmet=new HideHelmet(),wingStyle=new WingStyle();
  wingStyle.style=preferences.wingStyle??'original';hideHelmet.enabled=preferences.hideHelmet===true;
  const settingsHost=document.createElement('div'),settingsRoot=settingsHost.attachShadow({mode:'open'});
  settingsRoot.innerHTML=`<style>
:host{display:block;font:12px Verdana,sans-serif;color:#eee6d1;color-scheme:dark}*{box-sizing:border-box}[hidden]{display:none!important}h3,summary{color:#e7c780;font-size:12px}summary{cursor:pointer;padding:10px 0}details{border-top:1px solid #76633d;margin-top:12px}button,select,input[type=number],input[type=text],textarea{font:inherit;color:#eee6d1;background:#15170f;border:1px solid #76633d;border-radius:4px;padding:7px;min-width:0}button{color:#e7c780;cursor:pointer}button:disabled{opacity:.4;cursor:default}input[type=number]{width:100%}.tabs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:10px 0}.tabs button{flex:1}.tabs [aria-selected=true]{background:#e7c780;color:#15170f}.step,.gold-step{border:1px solid #76633d;border-radius:6px;padding:10px;margin:8px 0}.step[data-enabled=false]{border-style:dashed;background:#202219}.step-enabled{accent-color:#a4c880;flex-shrink:0;width:18px;height:18px}.step-state{font-size:11px;color:#aeb6a0;margin:0 0 7px}.step-head{display:flex;align-items:center;gap:5px;margin-bottom:8px}.step-head select{flex:1;width:100%}.step-head button{padding:4px 6px}.step-fields{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:8px}.step-fields label{display:grid;gap:5px;font-size:11px}.min-level,.help{color:#aeb6a0;font-size:11px;line-height:1.5}.min-level{margin:7px 0 0}.add-step{width:100%;border-style:dashed}.switch{display:flex;justify-content:space-between;align-items:center;margin:12px 0;gap:12px}.categories{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}.switch input{flex-shrink:0;accent-color:#a4c880;width:18px;height:18px}.range{display:flex;align-items:center;gap:8px}.range input{width:52px;text-align:center}.range span{flex:1}.extra-entry{display:flex;gap:6px;margin:8px 0}.extra-entry input{flex:1;width:100%}textarea{display:block;width:100%;min-height:78px;resize:vertical}.remove-name{margin-top:7px}.error,.loot-state,.runtime-state{color:#f1b5a4;font-size:11px}.error:empty,.loot-state:empty,.helmet-state:empty,.runtime-state:empty{display:none}button:focus-visible,select:focus-visible,input:focus-visible,textarea:focus-visible,summary:focus-visible{outline:2px solid #e7c780;outline-offset:2px}.styles-title{border-top:1px solid #76633d;padding-top:14px;margin-top:16px}.wing-state{color:#aeb6a0;font-size:11px;line-height:1.5}.wing-state:empty{display:none}.tab-title{color:#e7c780;margin:8px 0 12px}
.stats-option{display:flex;align-items:center;gap:12px}.stats-option>.switch{flex:1}.stats-help{position:relative;border:0;margin:0}.stats-help>summary{list-style:none;cursor:pointer;border:1px solid #76633d;border-radius:50%;width:28px;height:28px;display:grid;place-items:center}.stats-help::details-content{content-visibility:visible}.stats-help>p{display:none;position:absolute;right:0;top:24px;z-index:10;width:260px;max-width:calc(100vw - 60px);padding:12px;background:#15170f;border:1px solid #76633d;border-radius:6px}.stats-help[open]>p,.stats-help:hover>p,.stats-help:focus-within>p{display:block}.stats-help>summary:focus-visible{outline:2px solid #e7c780}
.switch input:is(.auto-reset,.soul-shield,.map-enabled,.spot-enabled,.pair-inventory,.detailed-stats,.balrog-enabled,.hide-helmet,.schedule-enabled){appearance:none;position:relative;width:72px;height:28px;border-radius:16px;border:1px solid #76633d;background:#36382e;cursor:pointer;margin:0;padding:0}.switch input:is(.auto-reset,.soul-shield,.map-enabled,.spot-enabled,.pair-inventory,.detailed-stats,.balrog-enabled,.hide-helmet,.schedule-enabled)::before{content:'';position:absolute;width:20px;height:20px;top:3px;left:4px;background:#eee6d1;border-radius:50%}.switch input:is(.auto-reset,.soul-shield,.map-enabled,.spot-enabled,.pair-inventory,.detailed-stats,.balrog-enabled,.hide-helmet,.schedule-enabled)::after{content:'OFF';position:absolute;right:8px;top:6px;font:11px Verdana,sans-serif;color:#eee6d1}.switch input:is(.auto-reset,.soul-shield,.map-enabled,.spot-enabled,.pair-inventory,.detailed-stats,.balrog-enabled,.hide-helmet,.schedule-enabled):checked{background:#3b602c;border-color:#a4c880}.switch input:is(.auto-reset,.soul-shield,.map-enabled,.spot-enabled,.pair-inventory,.detailed-stats,.balrog-enabled,.hide-helmet,.schedule-enabled):checked::before{left:46px}.switch input:is(.auto-reset,.soul-shield,.map-enabled,.spot-enabled,.pair-inventory,.detailed-stats,.balrog-enabled,.hide-helmet,.schedule-enabled):checked::after{content:'ON';left:10px;right:auto}.switch input:disabled{opacity:.5;cursor:wait}
</style><div class="tabs" role="tablist" aria-label="Ajustes de Helper">${[["level","Leveleo"],["obtain","Obtener"],["caza","Caza"],["party","Party"],["appearance","Visualización"],["stats","Estadísticas"]].map(([id,label],i)=>`<button id="${id}-tab" role="tab" aria-selected="${i===0}" aria-controls="${id}-panel" data-tab="${id}" tabindex="${i===0?0:-1}">${label}</button>`).join('')}</div>
<section id="level-panel" role="tabpanel" aria-labelledby="level-tab"><label class="switch">Reset automático al nivel 400<input type="checkbox" role="switch" class="auto-reset"></label><label class="switch">Mantener Soul Shield<input type="checkbox" role="switch" class="soul-shield"></label><p class="buff-state" role="status"></p><p class="autosave-state help" role="status">Los switches se guardan automáticamente. Coordenadas y niveles se aplican con Guardar.</p><p class="help">Agregá los destinos en orden de nivel. Debajo del primer mínimo, continúa en el mapa inicial.</p><div class="steps"></div><button class="add-step" aria-label="Agregar paso a la ruta">＋ Agregar mapa</button></section>
<section id="caza-panel" role="tabpanel" aria-labelledby="caza-tab" hidden><h3 class="tab-title">Balrog Colosal</h3><label class="switch">Habilitar Caza del Balrog<input type="checkbox" role="switch" class="balrog-enabled"></label><p class="balrog-save-state help" role="status"></p><p class="help">El switch se guarda automáticamente. Play viaja al destino anunciado y enciende Home al llegar, con tus skills y pociones. Pausa detiene Home y lo libera para uso manual. El leveleo queda pausado.</p><p class="balrog-destination"></p><button class="balrog-play" aria-pressed="false" disabled>▶ Cazar Balrog</button><p class="balrog-state help" role="status"></p></section><section id="goldens-panel" role="tabpanel" aria-labelledby="goldens-tab" hidden><h3 class="tab-title">Ruta de goldens</h3><p class="help">Play controla el farmeo. G habilita la cacería al comenzar el evento. Se usa el primer destino accesible de esta lista.</p><div class="gold-steps"></div><button class="add-gold">＋ Agregar mapa</button><div class="gold-options"><label class="switch">Anticipar viaje 5 segundos<input type="checkbox" data-gold="anticipate"></label><label class="switch">Usar mapas pendientes del evento<input type="checkbox" data-gold="pendingMaps"></label><label class="switch">Recorrer el mapa<input type="checkbox" data-gold="sweep"></label><label class="switch">Guardar spots de goldens<input type="checkbox" data-gold="saveSpots"></label><label class="switch">Visitar spots guardados<input type="checkbox" data-gold="visitSpots"></label><label class="switch">Recoger Kundun<input type="checkbox" data-gold="kundun"></label></div><p class="gold-info help" role="status"></p><p class="help">Cinco minutos por destino o cinco kills propias por mapa. Los cambios de ruta se usan en el próximo evento. Solo los avistamientos se guardan como spots.</p></section><section id="obtain-panel" role="tabpanel" aria-labelledby="obtain-tab" hidden><h3 class="tab-title">Recogida de items</h3><label class="switch">Activar loot del addon<input type="checkbox" role="switch" class="excellent-loot"></label><div class="range"><span>Rango de recogida</span><button class="range-minus" aria-label="Reducir rango">−</button><input type="number" class="loot-range" min="1" max="8" step="1" aria-label="Rango de recogida"><button class="range-plus" aria-label="Aumentar rango">＋</button></div>
<label class="switch">Recoger todo<input type="checkbox" data-loot="all"></label><div class="categories">
${[['jewels','Jewels y gems'],['zen','Zen sin moverse'],['ancient','Ancient'],['excellent','Excellent'],['kundun','Recoger cajas Kundun (+1 a +5)']].map(([key,label])=>`<label class="switch">${label}<input type="checkbox" data-loot="${key}"></label>`).join('')}</div>
<details class="names-section" open><summary>Items por nombre</summary><label class="switch">Usar lista de nombres<input type="checkbox" data-loot="namesEnabled"></label><div class="extra-entry"><input class="new-name" type="text" maxlength="80" placeholder="Dragon Armor" aria-label="Agregar nombre de item"><button class="add-name">Agregar</button></div><label for="excellent-names">Nombres de sets o items</label><textarea id="excellent-names" class="excellent-names" rows="3" placeholder="Dragon&#10;Legendary" aria-describedby="loot-help" maxlength="4050"></textarea><button class="remove-name" title="Quita la línea donde está el cursor de la lista">Quitar línea seleccionada</button><div class="categories"><label class="switch">Exigir Excellent<input type="checkbox" data-loot="nameExcellent"></label><label class="switch">Exigir Luck<input type="checkbox" data-loot="nameLuck"></label></div></details><p id="loot-help" class="help">Las categorías se suman. Kundun usa el rango desde tu personaje, sin exigir Excellent/Luck ni llegada al spot. Los nombres conservan sus requisitos. Zen solo en tu casilla o una adyacente, también con Todo. Para usar este loot, apagá los filtros de recogida de Home; skills y pociones siguen en Home.</p><p class="loot-state" role="status"></p></section>
<section id="party-panel" role="tabpanel" aria-labelledby="party-tab" class="party-section" hidden><h3>Party</h3><label class="switch">Invitar solo al clan<input type="checkbox" role="switch" class="send-party"></label><label class="switch">Invitar fuera del clan<input type="checkbox" role="switch" class="send-party-outside"></label><p class="help" title="Solo clanes confirmados; los datos desconocidos no autorizan invitaciones">Invita tras 2 s cerca; sujeto al límite entre invitaciones</p><label class="switch">Auto party<input type="checkbox" role="switch" class="auto-party"></label></section><section id="appearance-panel" role="tabpanel" aria-labelledby="appearance-tab" class="appearance-section" hidden><h3>Trackeo</h3><div class="tracking-slot"></div><h3 class="styles-title">Estilos</h3><label class="switch" title="Solo en tu pantalla; conserva el equipo y sus stats">Ocultar casco<input type="checkbox" role="switch" class="hide-helmet"></label><p class="helmet-save-state help" role="status"></p><p class="helmet-state" role="status"></p><label class="switch">Alas<select class="wing-style" title="Cambia solo tus alas equipadas en tu pantalla">${WING_STYLES.map(option=>`<option value="${option.id}">${option.name}</option>`).join('')}</select></label><p class="wing-state" role="status"></p><p class="help">Estilos solo en tu pantalla. El casco se guarda automáticamente por cuenta; las alas, al Guardar. Conservan tu equipo y sus stats.</p></section><section id="stats-panel" role="tabpanel" aria-labelledby="stats-tab" hidden><div class="stats-option"><label class="switch">Permitir C e inventario juntos<input type="checkbox" role="switch" class="pair-inventory" aria-describedby="pair-help"></label><details class="stats-help"><summary aria-label="Ayuda de C e inventario">?</summary><p id="pair-help" role="tooltip">Se guarda al cambiar. Abrí C y V manualmente, con Play o estadísticas apagados. Al apagar conserva el comportamiento nativo del build y no cierra ventanas abiertas.</p></details></div><p class="pair-save-state help" role="status"></p><p class="pair-runtime-state help" role="status" hidden></p><div class="stats-option"><label class="switch">Estadísticas detalladas<input type="checkbox" role="switch" class="detailed-stats" aria-describedby="stats-help" title="Se guarda al cambiar. Abrí C manualmente para comparar A/B."></label><details class="stats-help"><summary aria-label="Ayuda de estadísticas">?</summary><p id="stats-help" role="tooltip">Se guarda al cambiar. Abrí C manualmente para capturar y comparar A/B. Los valores corresponden al panel nativo; buffs y daño efectivo no están confirmados. Apagar limpia las capturas.</p></details></div><p class="stats-save-state help" role="status"></p></section><p class="error" role="alert"></p><p class="runtime-state" role="status"></p>`;
  $('.config').append(settingsHost);
  let editing=false,configAvailable=false,before=null;
  const setting=selector=>settingsRoot.querySelector(selector);
  let draftRoutes=[],draftRoute=0,spotScope=null,levelSpots=new LevelSpots(),spotInvalid=false,spotSaving=false,lastSpotSave=-Infinity;
  const routesPanel=document.createElement('div');
  routesPanel.innerHTML='<style>.route-select,.route-name{box-sizing:border-box;width:100%;margin:4px 0 8px;padding:5px;color:#eee6d1;background:#24251e;border:1px solid #76633d}.route-alternatives select{max-width:100%}</style><label>Ruta seleccionada<select class="route-select" aria-label="Ruta seleccionada"></select></label><label>Nombre de ruta<input class="route-name" maxlength="40" aria-label="Nombre de ruta"></label><div style="display:flex;gap:6px;margin:6px 0"><button type="button" class="route-clone">Duplicar ruta</button><button type="button" class="route-remove">Quitar ruta</button></div><label class="switch">Alternar spots de esta etapa<input type="checkbox" class="vary-spots"></label><p class="help">Elige una alternativa por visita. Guardar aplica la selección; no inicia Play.</p><details><summary>Spots alternativos</summary><div class="route-alternatives"></div><button type="button" class="alternative-add">Agregar alternativa actual</button><p class="help">Cada alternativa pertenece al nivel de un paso activo. Se omite si el mapa aún no es accesible.</p></details><details class="observed-spots"><summary>Concentraciones observadas</summary><p class="spots-state" role="status"></p><div class="spots-list"></div><button type="button" class="route-generate">Crear ruta desde observaciones</button><p class="help">Solo mapas recibidos cerca del personaje. Cuatro bichos en radio 6, tres muestras en 10 segundos. No confirma spawns permanentes. Crear agrega un borrador: revisalo y Guardá.</p></details>';
  setting('#level-panel').prepend(routesPanel);
  let draftLeveling=null,selectedLevelMap='lorencia',legacyMode=false,standaloneMapSave=false,mapDraftOwner=null;
  const legacyEditor=document.createElement('div');legacyEditor.className='legacy-editor';legacyEditor.hidden=true;
  const oldHelp=setting('#level-panel > p.help:not(.autosave-state)');for(const node of [routesPanel,oldHelp,setting('.steps'),setting('.add-step')])if(node)legacyEditor.append(node);
  setting('#level-panel').append(legacyEditor);
  const mapPanel=document.createElement('div');mapPanel.className='map-leveling';
  mapPanel.innerHTML='<style>.map-select{width:100%;margin:6px 0 12px}.map-summary{border-left:2px solid #e7c780;padding:8px 12px;margin:8px 0 14px;line-height:1.6}.map-spot{border:1px solid #76633d;border-radius:6px;padding:10px;margin:10px 0}.spot-coords{display:grid;grid-template-columns:1fr 1fr;gap:10px}.spot-coords label{display:grid;gap:5px}.spot-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.map-settings{display:flex;flex-direction:column;gap:8px;align-items:stretch}.map-settings label{flex:1}.map-settings label:not(.switch){display:grid;gap:6px}.map-settings input[type=number]{max-width:90px}.map-spot .switch{margin:0 0 10px}.map-plan{line-height:1.8;color:#c1e7a0}.migration-note{color:#e7c780;line-height:1.5}</style><h3>Mapas de leveleo</h3><p class="help">Un spot por visita. Al llegar al nivel del siguiente mapa, comienza el traslado.</p><label>Elegí un mapa<select class="map-select" aria-label="Mapa de leveleo"></select></label><div class="map-settings"><label class="switch">Usar este mapa<input type="checkbox" role="switch" class="map-enabled"></label><label>Desde nivel<input type="number" class="map-level" max="399" aria-label="Nivel de entrada del mapa"></label></div><p class="map-min help"></p><p class="map-summary" role="status"></p><div class="map-spots"></div><button type="button" class="map-add">＋ Agregar spot</button><p class="help">Solo cargás coordenadas del mapa seleccionado. Para capturar una ubicación, el personaje debe estar en ese destino y no debe ser ambiguo.</p><h3>Progresión configurada</h3><p class="map-plan"></p><p class="migration-note" role="status"></p><details><summary>Ayuda con concentraciones observadas</summary><p class="help">Sugerencias de entidades cercanas recibidas. No cambian tus spots automáticamente.</p><p class="map-observed help"></p><button type="button" class="map-import-observed">Agregar sugerencias a este mapa</button></details>';
  setting('#level-panel').prepend(mapPanel);
  const mapActions=document.createElement('div');mapActions.className='standalone-map-actions';mapActions.innerHTML='<button type="button" class="map-save">Guardar mapas</button><button type="button" class="map-cancel">Cancelar mapas</button>';mapPanel.append(mapActions);
  const recovery=document.createElement('details');recovery.className='level-recovery';recovery.innerHTML='<summary>Recuperar configuración anterior</summary><p class="help">Las rutas anteriores se conservan. Editar el formato anterior y Guardar restaura ese recorrido. Cancelar mantiene la progresión actual.</p><button type="button" class="legacy-edit">Editar formato anterior</button><button type="button" class="map-edit" hidden>Volver a mapas y spots</button>';setting('#level-panel').append(recovery);recovery.append(legacyEditor);
  function currentMapDraft(){return draftLeveling.maps.find(m=>m.map===selectedLevelMap);}
  function captureMapDraft(){if(!draftLeveling)return;const m=currentMapDraft();m.enabled=setting('.map-enabled').checked;m.level=numberValue(setting('.map-level'));m.spots=[...settingsRoot.querySelectorAll('.map-spot')].map(row=>({x:numberValue(row.querySelector('.spot-x')),y:numberValue(row.querySelector('.spot-y')),enabled:row.querySelector('.spot-enabled').checked}));}
  function renderMapPlan(){
    const ready=usableLevelMaps({leveling:draftLeveling}).sort((a,b)=>a.level-b.level||LEVEL_MAPS.findIndex(m=>m.id===a.map)-LEVEL_MAPS.findIndex(m=>m.id===b.map));
    setting('.map-plan').textContent=ready.length?ready.map(m=>`${levelMap(m.map).name} desde ${m.level} (${m.spots.filter(p=>p.enabled).length} spots)`).join(' → '):'Ningún mapa completo habilitado. Agregá un spot y habilitá su mapa antes de iniciar.';
    const select=setting('.map-select');select.replaceChildren(...draftLeveling.maps.map(m=>{const o=document.createElement('option');o.value=m.map;o.textContent=levelMap(m.map).name+(m.enabled?(m.spots.some(p=>p.enabled)?' · activo':' · incompleto'):'');return o;}));select.value=selectedLevelMap;
    const m=currentMapDraft();setting('.map-summary').textContent=!m.enabled?'Mapa deshabilitado. Sus coordenadas se conservan.':m.spots.some(p=>p.enabled)?`${m.spots.filter(p=>p.enabled).length} spot(s) disponible(s). Elige uno al entrar y permanece hasta el siguiente mapa o reset.`:'Incompleto: sin spots habilitados. Este mapa será omitido.';
  }
  function renderMapEditor(){
    const m=currentMapDraft();setting('.map-enabled').checked=m.enabled;setting('.map-level').value=Number.isFinite(m.level)?m.level:'';setting('.map-level').min=minimumLevel(m.map,snapshot().charClass);setting('.map-min').textContent=`${levelMap(m.map).name} · mínimo para tu clase: ${minimumLevel(m.map,snapshot().charClass)} · traslado: ${levelMap(m.map).cost.toLocaleString('es-AR')} Zen`;
    setting('.map-spots').innerHTML=m.spots.map((p,i)=>`<div class="map-spot" data-spot="${i}"><label class="switch">Spot ${i+1}<input type="checkbox" role="switch" class="spot-enabled" aria-label="Habilitar spot ${i+1}" ${p.enabled?'checked':''}></label><div class="spot-coords">${['x','y'].map(a=>`<label>${a.toUpperCase()}<input type="number" class="spot-${a}" min="0" max="255" value="${Number.isFinite(p[a])?p[a]:''}" aria-label="${a.toUpperCase()} del spot ${i+1}"></label>`).join('')}</div><div class="spot-actions"><button type="button" data-spot-action="capture">Usar ubicación actual</button><button type="button" data-spot-action="duplicate">Duplicar</button><button type="button" data-spot-action="remove">Eliminar</button></div><p class="spot-capture help" role="status"></p></div>`).join('');setting('.map-add').disabled=m.spots.length>=60;renderMapPlan();
  }
  function fillMapEditor(){const current=snapshot();mapDraftOwner={identity,character:current.name,hero:window.__world?.playerEntity};const migrated=migrateLeveling(preferences,snapshot().charClass);draftLeveling=migrated.leveling;if(!draftLeveling.maps.some(m=>m.map===selectedLevelMap))selectedLevelMap=draftLeveling.maps[0].map;legacyMode=false;legacyEditor.hidden=true;mapPanel.hidden=false;setting('.legacy-edit').hidden=false;setting('.map-edit').hidden=true;setting('.migration-note').textContent=migrated.warnings.join(' ')||(!preferences.leveling?'Se preparó la progresión desde tu ruta anterior. Guardar aplica; Cancelar conserva el formato anterior.':'');renderMapEditor();}
  setting('.legacy-edit').onclick=()=>{captureMapDraft();legacyMode=true;legacyEditor.hidden=false;mapPanel.hidden=true;setting('.legacy-edit').hidden=true;setting('.map-edit').hidden=false;};
  setting('.map-edit').onclick=()=>{legacyMode=false;legacyEditor.hidden=true;mapPanel.hidden=false;setting('.legacy-edit').hidden=false;setting('.map-edit').hidden=true;renderMapEditor();};
  setting('.map-select').onchange=()=>{captureMapDraft();selectedLevelMap=setting('.map-select').value;renderMapEditor();};
  setting('.map-enabled').onchange=setting('.map-level').onchange=()=>{captureMapDraft();renderMapPlan();};
  setting('.map-add').onclick=()=>{captureMapDraft();const m=currentMapDraft();if(m.spots.length>=60)return;m.spots.push({x:NaN,y:NaN,enabled:true});renderMapEditor();setting('.map-spot:last-child .spot-x').focus();};
  setting('.map-spots').onchange=()=>{captureMapDraft();renderMapPlan();};
  setting('.map-spots').onclick=e=>{const button=e.target.closest('[data-spot-action]');if(!button)return;captureMapDraft();const row=button.closest('.map-spot'),index=Number(row.dataset.spot),m=currentMapDraft(),action=button.dataset.spotAction;
    if(action==='capture'){syncAccount();const s=snapshot(),error=(!mapDraftOwner||mapDraftOwner.identity!==identity||mapDraftOwner.character!==s.name||mapDraftOwner.hero!==window.__world?.playerEntity)?'Cambió la sesión. Cerrá y reabrí Config.':null,captured=error?{error}:capturePathLocation(s);
      if(captured.error||captured.map!==m.map){row.querySelector('.spot-capture').textContent=captured.error||'El personaje está en otro mapa. Se conservaron las coordenadas.';return;}
      Object.assign(m.spots[index],{x:captured.x,y:captured.y});if(before)before.locationCaptured=true;
    }else if(action==='duplicate'&&m.spots.length<60)m.spots.splice(index+1,0,{...m.spots[index]});else if(action==='remove')m.spots.splice(index,1);renderMapEditor();};
  setting('.map-import-observed').onclick=()=>{captureMapDraft();const m=currentMapDraft(),records=levelSpots.confirmed(Date.now()).filter(p=>p.map===m.map);for(const p of records){if(m.spots.length>=60)break;if(!m.spots.some(q=>q.x===p.x&&q.y===p.y))m.spots.push({x:p.x,y:p.y,enabled:false});}renderMapEditor();setting('.migration-note').textContent='Sugerencias agregadas apagadas. Revisá coordenadas, habilitá las que quieras y Guardá.';};
  function renderRouteChoice(){
    const select=setting('.route-select');select.replaceChildren();draftRoutes.forEach((r,i)=>{const option=document.createElement('option');option.value=i;option.textContent=r.name;select.append(option);});select.value=draftRoute;
    setting('.route-name').value=draftRoutes[draftRoute]?.name??'';setting('.route-clone').disabled=draftRoutes.length>=8;setting('.route-remove').disabled=draftRoutes.length<=1;
  }
  function renderAlternatives(){
    setting('.route-alternatives').innerHTML=(draftRoutes[draftRoute]?.alternatives??[]).map((p,i)=>`<div class="alternative" style="border-top:1px solid #76633d;padding:6px 0" data-alt="${i}"><label><input type="checkbox" class="alt-enabled" ${p.enabled?'checked':''}>Activa</label><select class="alt-map" aria-label="Mapa alternativo ${i+1}">${LEVEL_MAPS.map(m=>`<option value="${m.id}" ${m.id===p.map?'selected':''}>${m.name}</option>`).join('')}</select><div style="display:flex;gap:4px">${[['level','Etapa'],['x','X'],['y','Y']].map(([k,label])=>`<label>${label}<input style="width:58px" type="number" class="alt-${k}" value="${p[k]}" min="0" max="${k==='level'?399:255}" aria-label="${label} alternativa ${i+1}"></label>`).join('')}<button type="button" data-alt-remove="${i}" aria-label="Quitar alternativa ${i+1}">×</button></div></div>`).join('');
  }
  function readAlternatives(){return [...settingsRoot.querySelectorAll('.alternative')].map(row=>({map:row.querySelector('.alt-map').value,level:numberValue(row.querySelector('.alt-level')),x:numberValue(row.querySelector('.alt-x')),y:numberValue(row.querySelector('.alt-y')),enabled:row.querySelector('.alt-enabled').checked}));}
  function captureDraftRoute(){if(draftRoutes[draftRoute])draftRoutes[draftRoute]={name:setting('.route-name').value.trim(),path:readPath(),alternatives:readAlternatives()};}
  setting('.route-select').onchange=()=>{captureDraftRoute();draftRoute=Number(setting('.route-select').value);renderRouteChoice();renderPath(draftRoutes[draftRoute].path);renderAlternatives();settingsChanged();};
  setting('.route-clone').onclick=()=>{captureDraftRoute();if(draftRoutes.length>=8)return;draftRoutes.push(JSON.parse(JSON.stringify({...draftRoutes[draftRoute],name:'Ruta '+(draftRoutes.length+1)})));draftRoute=draftRoutes.length-1;renderRouteChoice();renderPath(draftRoutes[draftRoute].path);renderAlternatives();settingsChanged();};
  setting('.route-remove').onclick=()=>{if(draftRoutes.length<=1)return;draftRoutes.splice(draftRoute,1);draftRoute=Math.min(draftRoute,draftRoutes.length-1);renderRouteChoice();renderPath(draftRoutes[draftRoute].path);renderAlternatives();settingsChanged();};
  setting('.alternative-add').onclick=()=>{captureDraftRoute();const location=capturePathLocation(snapshot()),row=draftRoutes[draftRoute];if(location.error){setting('.error').textContent=location.error;return;}if(row.alternatives.length>=60)return;const step=[...row.path].reverse().find(p=>p.enabled!==false&&p.level<=snapshot().level)??row.path[0];row.alternatives.push({...location,level:step.level,enabled:true});renderAlternatives();settingsChanged();};
  setting('.route-alternatives').onclick=e=>{const button=e.target.closest('[data-alt-remove]');if(!button)return;captureDraftRoute();draftRoutes[draftRoute].alternatives.splice(Number(button.dataset.altRemove),1);renderAlternatives();settingsChanged();};
  function spotStorageKey(s){return identity&&s.ready&&(legacyDemo||s.server!=='default')? (legacyDemo?'mu.level-spots.demo.v1.':'mu.level-spots.v1.')+encodeURIComponent(JSON.stringify([identity,s.server])):null;}
  function readSpotRecords(key){const raw=localStorage.getItem(key);if(raw===null)return[];const doc=JSON.parse(raw);if(doc?.version!==1||!Array.isArray(doc.records)||doc.records.length>120||!doc.records.every(validObservation))throw Error('Registro inválido');return doc.records;}
  function refreshLevelSpots(s,now,observe){
    const key=spotStorageKey(s);if(key!==spotScope){spotScope=key;spotInvalid=false;lastSpotSave=-Infinity;try{levelSpots=new LevelSpots(key?readSpotRecords(key):[]);}catch{levelSpots=new LevelSpots();spotInvalid=true;}}
    if(key&&!spotInvalid&&observe)levelSpots.observe(s,window.__world,now);
    if(key&&!spotInvalid&&observe&&!spotSaving&&now-lastSpotSave>=10000){
      const archive=levelSpots;spotSaving=true;lastSpotSave=now;
      const save=()=>{if(key!==spotScope||spotStorageKey(snapshot())!==key||(!legacyDemo&&accountIdentity(window.__store)!==identity))return;const records=readSpotRecords(key).filter(p=>now-p.last<=SPOT_AGE);for(const row of archive.records){const old=records.find(p=>p.map===row.map&&distance(p,row)<=8);if(!old)records.push({...row});else if(row.last>=old.last){if(row.first>old.last+15000)Object.assign(old,row);else Object.assign(old,row,{first:Math.min(old.first,row.first),samples:Math.max(old.samples,row.samples)});}}records.sort((a,b)=>b.last-a.last);localStorage.setItem(key,JSON.stringify({version:1,records:records.slice(0,120)}));};
      Promise.resolve().then(()=>legacyDemo?save():navigator.locks?.request?navigator.locks.request(key,save):Promise.reject(Error('Sin bloqueo de almacenamiento'))).catch(()=>{if(key===spotScope){spotInvalid=true;levelSpots.message='No se pudo guardar el registro; datos anteriores conservados.';}}).finally(()=>{spotSaving=false;});
    }
    setting('.map-observed').textContent=levelSpots.confirmed(now).filter(p=>p.map===selectedLevelMap).map(p=>`${p.x}, ${p.y} · ${p.count} bichos`).join(' · ')||'Sin concentraciones confirmadas en este mapa.';setting('.map-import-observed').disabled=spotInvalid||!levelSpots.confirmed(now).some(p=>p.map===selectedLevelMap);setting('.spots-state').textContent=spotInvalid?'Registro no disponible o inválido: conservado sin sobrescribir.':levelSpots.message;
    const records=levelSpots.confirmed(now);setting('.route-generate').disabled=spotInvalid||!records.length||draftRoutes.length>=8;
    setting('.spots-list').replaceChildren(...records.slice(0,30).map(p=>{const line=document.createElement('p');line.className='help';line.textContent=`${levelMap(p.map).name} ${p.x}, ${p.y} · ${p.count} bichos · ${p.samples} muestras · ${new Date(p.last).toLocaleString('es-AR')}`;return line;}));
  }
  setting('.route-generate').onclick=()=>{captureDraftRoute();const value=observedRoute(levelSpots.records,snapshot().charClass,Date.now());if(!value||draftRoutes.length>=8)return;draftRoutes.push(value);draftRoute=draftRoutes.length-1;renderRouteChoice();renderPath(value.path);renderAlternatives();setting('.vary-spots').checked=true;setting('.error').textContent='Ruta creada en borrador. Revisá los mapas observados y Guardá para usarla.';};
  const uiLevelMap=id=>({...levelMap(id),minLevel:minimumLevel(id,snapshot().charClass)});
  const accountPanel=document.createElement('div');accountPanel.innerHTML='<p class="account-state" role="status"></p><button class="import-legacy" type="button">Importar configuración anterior</button>';
  settingsRoot.insertBefore(accountPanel,settingsRoot.firstElementChild.nextSibling);
  function stopForAccount(message){invalidateScheduleSession(message);party.cancel();const stopHome=balrog.active&&balrog.identity===balrogIdentity(snapshot()),pendingHome=native.pending;balrog.stop(message);balrogEvent.reset();cycle.stop(message);cycle.visit=new MapVisit();gold.cancel(message,false);gold.enabled=false;queuedAction=null;desiredHelper=null;native.pending=null;excellentLoot.clear();clearOwned();clearHuntTargets();soulShield.clear(window.__world,window.__store);huntHadControl=false;hideHelmet.enabled=false;if(stopHome){desiredHelper=false;native.pending=pendingHome;}}
  function syncAccount(){
    if(legacyDemo)return;
    const next=accountIdentity(window.__store);
    if(next!==identity){
      stopForAccount(!identity&&next?'Pausado: cuenta conectada; inicio manual':'Pausado: cambió la cuenta');identity=next;preferencesKey=next?accountSettings.key(next):null;profileConflict=false;preferencesInvalid=false;profileRaw=null;
      let value=freshPreferences();try{profileRaw=preferencesKey?localStorage.getItem(preferencesKey):null;if(profileRaw!==null){const saved=JSON.parse(profileRaw);if(validPreferences(saved,'stored'))value={...saved,arena:saved.arena??true,icarus:saved.icarus??true};else preferencesInvalid=true;}}catch{preferencesInvalid=true;}
      applyPreferences(value,value.hideHelmet===true);wingStyle.style=value.wingStyle??'original';
      if(!editing)fillSettings();
    }
    let raw;try{raw=preferencesKey?localStorage.getItem(preferencesKey):null;}catch{preferencesInvalid=true;}
    if(raw!==profileRaw){
      stopForAccount('Pausado: configuración modificada en otra ventana');
      if(editing)profileConflict=true;
      else{profileRaw=raw;preferencesInvalid=false;let value=freshPreferences();try{if(raw!==null){value=JSON.parse(raw);if(!validPreferences(value,'stored'))throw Error('Invalid');}}catch{preferencesInvalid=true;value=freshPreferences();}applyPreferences(value,value.hideHelmet===true);wingStyle.style=value.wingStyle??'original';fillSettings();}
    }
    setting('.account-state').textContent=identity?'Cuenta: '+JSON.parse(identity)[1]+(profileConflict?' · cambió en otra ventana; cerrá y reabrí Config':''):'Esperando login confirmado para configurar';
    try{setting('.import-legacy').disabled=!identity||profileConflict||preferencesInvalid||localStorage.getItem(legacyKey)===null;}catch{setting('.import-legacy').disabled=true;}
  }
  setting('.import-legacy').onclick=()=>{syncAccount();if(!identity||profileConflict)return;try{const saved=JSON.parse(localStorage.getItem(legacyKey));if(!validPreferences(saved,'stored'))throw Error('Inválida');const old=preferences,oldWing=wingStyle.style;preferences=saved;wingStyle.style=saved.wingStyle??'original';fillSettings();preferences=old;wingStyle.style=oldWing;setting('.account-state').textContent+=' · importación pendiente de Guardar';if(!configAvailable){settingsChanged();}}catch{setting('.error').textContent='Configuración anterior inválida; se conservó sin cambios.';}};
  window.addEventListener('storage',event=>{if(event.key===preferencesKey||event.key===null)refresh();});
  const retiredGoldSettings=setting('#goldens-panel');retiredGoldSettings.dataset.retired='golden-hunt';
  function selectTab(tab){if(tab==='goldens')return;for(const button of settingsRoot.querySelectorAll('[data-tab]')){const selected=button.dataset.tab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;setting('#'+button.dataset.tab+'-panel').hidden=!selected;}}
  for(const button of settingsRoot.querySelectorAll('[data-tab]')){button.onclick=()=>selectTab(button.dataset.tab);button.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=['level','obtain','caza','party','appearance','stats'],index=tabs.indexOf(button.dataset.tab),tab=e.key==='Home'?tabs[0]:e.key==='End'?tabs[tabs.length-1]:tabs[(index+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length];selectTab(tab);setting('[data-tab='+tab+']').focus();}};}
  function renderPath(path){setting('.steps').innerHTML=path.map((p,i)=>`<div class="step" data-step="${i}" data-enabled="${p.enabled!==false}"><p class="step-state">${p.enabled===false?'Apagado · spot conservado':'Activo'}</p><div class="step-head"><input type="checkbox" role="switch" class="step-enabled" aria-label="Habilitar paso ${i+1}" title="Usar este paso en la ruta" ${p.enabled!==false?'checked':''}><span>${i+1}.</span><select aria-label="Mapa del paso ${i+1}">${LEVEL_MAPS.map(m=>`<option value="${m.id}" ${m.id===p.map?'selected':''}>${m.name}</option>`).join('')}</select><button data-action="up" aria-label="Subir paso ${i+1}" ${i===0?'disabled':''}>↑</button><button data-action="down" aria-label="Bajar paso ${i+1}" ${i===path.length-1?'disabled':''}>↓</button><button data-action="remove" aria-label="Quitar paso ${i+1}" ${path.length===1?'disabled':''}>×</button></div><div class="step-fields"><label>Desde nivel<input type="number" data-field="level" min="${uiLevelMap(p.map).minLevel}" max="399" step="1" value="${Number.isFinite(p.level)?p.level:''}" aria-label="Nivel del paso ${i+1}"></label>${['x','y'].map(a=>`<label>${a.toUpperCase()}<input type="number" data-field="${a}" data-map="${p.map}" data-axis="${a}" min="0" max="255" step="1" value="${Number.isFinite(p[a])?p[a]:''}" aria-label="${uiLevelMap(p.map).name} ${a.toUpperCase()} del paso ${i+1}"></label>`).join('')}</div><button type="button" data-action="capture" aria-label="Usar ubicación actual en paso ${i+1}" title="Actualizar mapa y X/Y del paso ${i+1}" style="margin-top:8px;padding:5px 7px">Usar ubicación actual</button><p class="capture-state help" role="status"></p><p class="min-level">Mínimo: ${uiLevelMap(p.map).minLevel} · Traslado: ${uiLevelMap(p.map).cost.toLocaleString('es-AR')} Zen</p></div>`).join('');setting('.add-step').disabled=path.length>=26;}
  const numberValue=input=>input.value.trim()===''?NaN:Number(input.value);
  function readPath(){return [...settingsRoot.querySelectorAll('.step')].map(row=>({map:row.querySelector('select').value,enabled:row.querySelector('.step-enabled').checked,...Object.fromEntries(['level','x','y'].map(k=>[k,numberValue(row.querySelector('[data-field='+k+']'))]))}));}
  function renderGoldRoute(route){setting('.gold-steps').innerHTML=route.map((p,i)=>`<div class="gold-step" data-index="${i}"><div class="step-head"><input type="checkbox" class="gold-enabled" aria-label="Habilitar destino ${i+1}" ${p.enabled?'checked':''}><select aria-label="Destino golden ${i+1}">${HUNT_ROUTE.map(d=>`<option value="${d.id}" ${p.map===d.id?'selected':''}>${d.name}</option>`).join('')}</select><button data-gaction="up" aria-label="Subir destino ${i+1}" ${i?'':'disabled'}>↑</button><button data-gaction="down" aria-label="Bajar destino ${i+1}" ${i===route.length-1?'disabled':''}>↓</button><button data-gaction="remove" aria-label="Quitar destino ${i+1}" ${route.length===1?'disabled':''}>×</button></div><label class="range"><span>Desde nivel</span><input type="number" class="gold-level" min="${uiLevelMap(p.map).minLevel}" max="400" value="${p.level}" aria-label="Nivel golden ${i+1}"></label></div>`).join('');setting('.add-gold').disabled=route.length>=HUNT_ROUTE.length;}
  function readGoldRoute(){return [...settingsRoot.querySelectorAll('.gold-step')].map(row=>({map:row.querySelector('select').value,level:numberValue(row.querySelector('.gold-level')),enabled:row.querySelector('.gold-enabled').checked}));}
  setting('.gold-steps').onchange=e=>{if(e.target.matches('select')){const route=readGoldRoute(),i=Number(e.target.closest('.gold-step').dataset.index);route[i].level=uiLevelMap(route[i].map).minLevel;renderGoldRoute(route);}settingsChanged();};
  setting('.gold-steps').onclick=e=>{const button=e.target.closest('[data-gaction]');if(!button)return;const route=readGoldRoute(),i=Number(button.closest('.gold-step').dataset.index),a=button.dataset.gaction;if(a==='remove'&&route.length>1)route.splice(i,1);if(a==='up'&&i>0)[route[i-1],route[i]]=[route[i],route[i-1]];if(a==='down'&&i<route.length-1)[route[i+1],route[i]]=[route[i],route[i+1]];renderGoldRoute(route);settingsChanged();};
  setting('.add-gold').onclick=()=>{const route=readGoldRoute(),d=HUNT_ROUTE.find(d=>!route.some(p=>p.map===d.id));if(d){route.push({map:d.id,level:uiLevelMap(d.id).minLevel,enabled:true});renderGoldRoute(route);settingsChanged();}};
  function fillSettings(){fillSchedule();fillMapEditor();draftRoutes=JSON.parse(JSON.stringify(routeBank(preferences,snapshot().charClass)));draftRoute=preferences.selectedRoute??0;renderRouteChoice();renderAlternatives();setting('.vary-spots').checked=preferences.varySpots===true;setting('.detailed-stats').checked=preferences.detailedStats===true;setting('.pair-inventory').checked=preferences.pairInventory===true;setting('.balrog-enabled').checked=preferences.balrogEnabled===true;renderGoldRoute(goldPreferences(preferences,snapshot().charClass).route);for(const input of settingsRoot.querySelectorAll('[data-gold]'))input.checked=goldPreferences(preferences,snapshot().charClass)[input.dataset.gold];setting('.soul-shield').checked=preferences.soulShield!==false;renderPath(levelPath(preferences,snapshot().charClass));setting('.auto-reset').checked=preferences.autoReset!==false;setting('.send-party').checked=preferences.sendParty;setting('.send-party-outside').checked=preferences.sendPartyOutside===true;setting('.auto-party').checked=preferences.acceptParty;setting('.hide-helmet').checked=preferences.hideHelmet===true;setting('.wing-style').value=wingStyle.style;const policy=lootPolicy(preferences);setting('.excellent-loot').checked=policy.enabled;setting('.loot-range').value=policy.range;for(const input of settingsRoot.querySelectorAll('[data-loot]'))input.checked=policy[input.dataset.loot];setting('.excellent-names').value=(preferences.excellentNames??[]).join('\n');setting('.new-name').value='';setting('.error').textContent='';}
  function readSettings(){captureMapDraft();captureDraftRoute();const path=readPath(),spots=JSON.parse(JSON.stringify(preferences.spots));for(const id of ['lorencia','arena','icarus']){const p=path.find(p=>p.map===id);if(p)spots[id]={x:p.x,y:p.y};}const loot={enabled:setting('.excellent-loot').checked,range:numberValue(setting('.loot-range'))};for(const input of settingsRoot.querySelectorAll('[data-loot]'))loot[input.dataset.loot]=input.checked;return {version:1,...(preferences.schedule?{schedule:{...preferences.schedule}}:{}),...(!legacyMode&&(configAvailable||standaloneMapSave)?{leveling:JSON.parse(JSON.stringify(draftLeveling))}:(!legacyMode&&preferences.leveling?{leveling:JSON.parse(JSON.stringify(preferences.leveling))}:{})),routes:JSON.parse(JSON.stringify(draftRoutes)),selectedRoute:draftRoute,varySpots:setting('.vary-spots').checked,detailedStats:preferences.detailedStats===true,pairInventory:preferences.pairInventory===true,balrogEnabled:preferences.balrogEnabled===true,hideHelmet:preferences.hideHelmet===true,wingStyle:setting('.wing-style').value,soulShield:setting('.soul-shield').checked,...(preferences.gold?{gold:JSON.parse(JSON.stringify(preferences.gold))}:{}),autoReset:setting('.auto-reset').checked,path,spots,arena:path.some(p=>p.map==='arena'),icarus:path.some(p=>p.map==='icarus'),sendParty:setting('.send-party').checked,sendPartyOutside:setting('.send-party-outside').checked,acceptParty:setting('.auto-party').checked,excellentLoot:loot.enabled,excellentNames:lootNames(setting('.excellent-names').value),loot};}
  async function settingsChanged(){if(editing||configAvailable)return;if(settingsProvider.validate())return;try{await settingsProvider.apply();refresh();}catch{fillSettings();setting('.error').textContent='No se pudo guardar la configuración; puede haber cambiado en otra ventana.';}}
  setting('.steps').addEventListener('change',e=>{if(e.target.matches('.step-enabled'))renderPath(readPath());if(e.target.matches('select')){const path=readPath(),i=Number(e.target.closest('.step').dataset.step),m=uiLevelMap(path[i].map);path[i].level=m.minLevel;renderPath(path);}settingsChanged();});
  setting('.steps').addEventListener('click',e=>{const action=e.target.closest('[data-action]');if(!action)return;const path=readPath(),i=Number(action.closest('.step').dataset.step);if(action.dataset.action==='capture'){
      const row=action.closest('.step');syncAccount();const s=snapshot();
      if(!identity||profileConflict||preferencesInvalid||(editing&&(before?.identity!==identity||before?.character!==s.name||before?.hero!==window.__world?.playerEntity))){row.querySelector('.capture-state').textContent='Cambió la cuenta, el personaje o la configuración. Cerrá y reabrí Config antes de capturar.';return;}
      const captured=capturePathLocation(s);
      if(captured.error){row.querySelector('.capture-state').textContent=captured.error;return;}
      if(!editing){row.querySelector('.capture-state').textContent='Abrí Config para capturar y guardar un borrador.';return;}
      before.locationCaptured=true;Object.assign(path[i],captured);renderPath(path);
      setting('.steps').querySelectorAll('.step')[i].querySelector('.capture-state').textContent='Ubicación actualizada en el borrador. Guardá para aplicarla.';
      setting('.steps').querySelectorAll('[data-action=capture]')[i].focus();settingsProvider.validate();return;
    }if(action.dataset.action==='remove'&&path.length>1)path.splice(i,1);else if(action.dataset.action==='up'&&i>0)[path[i-1],path[i]]=[path[i],path[i-1]];else if(action.dataset.action==='down'&&i<path.length-1)[path[i+1],path[i]]=[path[i],path[i+1]];renderPath(path);settingsChanged();});
  setting('.add-step').onclick=()=>{const path=readPath();if(path.length>=26)return;path.push(currentPathStep(snapshot(),path));renderPath(path);setting('.step:last-child select').focus();};
  for(const [selector,delta] of [['.range-minus',-1],['.range-plus',1]])setting(selector).onclick=()=>{setting('.loot-range').value=Math.max(1,Math.min(8,(numberValue(setting('.loot-range'))||5)+delta));settingsChanged();};
  setting('.add-name').onclick=()=>{const name=setting('.new-name').value.trim();if(!name)return;const names=lootNames(setting('.excellent-names').value+'\n'+name);if(names.length>50||names.some(n=>n.length>80)){setting('.error').textContent='Loot: hasta 50 nombres de 80 caracteres.';return;}setting('.excellent-names').value=names.join('\n');setting('.new-name').value='';setting('[data-loot=namesEnabled]').checked=true;settingsChanged();};
  setting('.new-name').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();setting('.add-name').click();}};
  setting('.remove-name').onclick=()=>{const list=setting('.excellent-names'),lines=list.value.split('\n'),index=list.value.slice(0,list.selectionStart).split('\n').length-1;lines.splice(index,1);list.value=lines.join('\n');settingsChanged();};

  function applyPreferences(value,helmet){if(value.sendParty===false)party.cancel('clan');if(value.sendPartyOutside!==true)party.cancel('outside');if(balrog.active&&value.balrogEnabled!==true)stopBalrog('Caza pausada: función deshabilitada');const changed=JSON.stringify(value.leveling)!==JSON.stringify(preferences.leveling)||JSON.stringify(value.routes)!==JSON.stringify(preferences.routes)||value.selectedRoute!==preferences.selectedRoute||value.varySpots!==preferences.varySpots||JSON.stringify(value.path)!==JSON.stringify(preferences.path)||JSON.stringify(value.spots)!==JSON.stringify(preferences.spots)||value.arena!==preferences.arena||value.icarus!==preferences.icarus;preferences=value;if(!value.detailedStats)statsComparison.clear();cycle.config={...DEFAULTS,...value,path:value.path,autoReset:value.autoReset??true};if(value.autoReset===false&&queuedAction?.text==='/reset'){queuedAction=null;cycle.pending=null;desiredHelper=null;}hideHelmet.enabled=helmet;if(changed){cycle.visit.newVisit();cycle.variation.reset();if(!gold.active&&!balrog.active){queuedAction=null;clearOwned();cycle.stage=null;cycle.settled=false;}}}
  const schedulePanel=document.createElement('section');schedulePanel.className='schedule-settings';
  schedulePanel.style.cssText='grid-column:1/-1;border-top:1px solid #76633d;padding-top:12px;min-width:0';
  schedulePanel.innerHTML='<h3>Programación</h3><label class="switch">Programación diaria<input type="checkbox" role="switch" class="schedule-enabled" aria-label="Programación diaria"></label><div style="display:flex;gap:12px;flex-wrap:wrap"><label>Inicio<input type="time" step="60" class="schedule-start" aria-label="Hora de inicio" style="display:block;max-width:100%"></label><label>Fin<input type="time" step="60" class="schedule-end" aria-label="Hora de fin" style="display:block;max-width:100%"></label></div><p class="help">Hora de Argentina · Todos los días. Habilitar y guardar puede iniciar el leveleo ahora si estás dentro del horario. La Caza tiene su propio control.</p><button type="button" class="schedule-save">Guardar programación</button><p class="schedule-save-state help" role="status"></p><p class="schedule-state help" role="status"></p>';
  setting('#level-panel').append(schedulePanel);
  function fillSchedule(){const c=scheduleConfig();setting('.schedule-enabled').checked=c.enabled;setting('.schedule-start').value=c.start;setting('.schedule-end').value=c.end;setting('.schedule-save-state').textContent='';}
  setting('.schedule-save').onclick=()=>{
    const value={version:1,enabled:setting('.schedule-enabled').checked,start:setting('.schedule-start').value,end:setting('.schedule-end').value},owner=identity,character=snapshot().name;
    const feedback=setting('.schedule-save-state');
    if(!validSchedule(value)){feedback.textContent='No guardado: usá horas válidas y distintas en formato 24 horas.';return;}
    if(!owner||profileConflict||preferencesInvalid){feedback.textContent='No guardado: cuenta o configuración no disponible.';return;}
    setting('.schedule-save').disabled=true;feedback.textContent='Guardando programación…';
    toggleSaveQueue=toggleSaveQueue.then(async()=>{
      const commit=()=>scheduleLock(owner,()=>{
        syncAccount();if(identity!==owner||profileConflict||preferencesInvalid||snapshot().name!==character||(!legacyDemo&&accountIdentity(window.__store)!==owner))throw Error('Cambió la sesión o la configuración');
        const expected=profileRaw,next={...preferences,schedule:value},written=JSON.stringify(next),now=Date.now(),policy=readSchedule(owner),oldWindow=policy.sync(scheduleConfig(),now);
        if(policy.record.pausedUntil>now&&oldWindow.active)policy.record.pausedUntil=Math.max(policy.record.pausedUntil,oldWindow.end);
        const w=policy.sync(value,now);
        if(!value.enabled){policy.record.running=false;policy.record.leaseUntil=0;}
        writeSchedule(owner,policy);
        if(legacyDemo){if(localStorage.getItem(preferencesKey)!==expected)throw Error('La configuración cambió en otra ventana');localStorage.setItem(preferencesKey,written);}
        else accountSettings.write(owner,expected,written,accountIdentity(window.__store));
        profileRaw=written;applyPreferences(next,next.hideHelmet===true);
        if(editing&&before?.identity===owner){before.raw=written;before.preferences.schedule={...value};before.written=undefined;}
        scheduleError='';
        if(!value.enabled){if(scheduleControl==='programmed'&&cycle.running)pauseLevel('Programación desactivada');scheduleControl=cycle.running?'manual':null;}
        else if(!w.active&&cycle.running)pauseLevel('Fuera de horario · Hora de Argentina');
        feedback.textContent='Programación guardada.';
      });
      if(legacyDemo)await commit();else await accountSettings.locked(owner,commit);
      refresh();
    }).catch(error=>{feedback.textContent='No guardado: '+error.message;}).finally(()=>{setting('.schedule-save').disabled=false;});
  };
  const settingsProvider={host:settingsHost,order:10,title:'Helper',slots:{'visualization-tracking':setting('.tracking-slot')},
    begin(){syncAccount();profileConflict=false;before={identity,character:snapshot().name,hero:window.__world?.playerEntity,key:preferencesKey,written:undefined,preferences:JSON.parse(JSON.stringify(preferences)),helmet:hideHelmet.enabled,wings:wingStyle.style,raw:null};try{before.raw=preferencesKey?localStorage.getItem(preferencesKey):null;}catch{}editing=true;fillSettings();},
    validate(){syncAccount();if(editing&&before?.locationCaptured&&(before.character!==snapshot().name||before.hero!==window.__world?.playerEntity))return 'Cambió el personaje. Cerrá y reabrí Config antes de guardar la ubicación.';if(!identity||profileConflict||(editing&&before?.identity!==identity))return 'Cambió la cuenta o la configuración. Cerrá y reabrí Config antes de guardar.';const value=readSettings();let error='';if(!validPreferences(value,snapshot().charClass))error='Ruta: usá niveles crecientes entre el mínimo del mapa y 399; coordenadas enteros entre 0 y 255.';if(!error&&legacyMode&&!validRoutes(value,snapshot().charClass))error='Rutas: hasta 8 nombres de 1–40 caracteres. Revisá cada ruta y asociá alternativas al nivel de una etapa existente.';if(legacyMode&&!value.path.some(p=>p.enabled!==false))error='Ruta: activá al menos un paso para guardar.';if(!legacyMode&&!validLeveling(value,snapshot().charClass))error='Mapas: revisá mínimos de nivel y coordenadas enteras entre 0 y 255.';if(!validLootPreferences(value))error='Loot: rango de 1 a 8; hasta 50 nombres de 80 caracteres, uno por línea.';settingsRoot.querySelector('.excellent-names').setAttribute('aria-invalid',String(!validLootPreferences(value)));if(!validGoldPreferences(value,snapshot().charClass))error='Goldens: destinos únicos y niveles enteros entre el mínimo del mapa y 400.';if(preferencesInvalid)error='Configuración guardada inválida: conservada para recuperación.';settingsRoot.querySelector('.error').textContent=error;if(error){settingsRoot.querySelectorAll('[data-map]').forEach(i=>i.setAttribute('aria-invalid',String(!Number.isInteger(Number(i.value))||i.value.trim()===''||Number(i.value)<0||Number(i.value)>255)));return error;}settingsRoot.querySelectorAll('[data-map]').forEach(i=>i.removeAttribute('aria-invalid'));return null;},
    async apply(){await toggleSaveQueue;syncAccount();const value=readSettings(),written=JSON.stringify(value),owner=identity,expected=editing?before.raw:profileRaw,transaction=editing?before:null,helmet=setting('.hide-helmet').checked;
      if(!owner||profileConflict||(editing&&before?.identity!==owner)||(transaction?.locationCaptured&&(transaction.character!==snapshot().name||transaction.hero!==window.__world?.playerEntity)))throw Error('Cambió la cuenta');
      const commit=()=>{if(legacyDemo)localStorage.setItem(preferencesKey,written);else accountSettings.write(owner,expected,written,accountIdentity(window.__store));profileRaw=written;if(transaction)transaction.written=written;applyPreferences(value,helmet);wingStyle.style=value.wingStyle;wingStyle.message='';};
      return legacyDemo?commit():accountSettings.locked(owner,commit);
    },
    rollback(){const transaction=before;if(!transaction||transaction.written===undefined)return;const restore=()=>{if(legacyDemo){if(transaction.raw===null)localStorage.removeItem(transaction.key);else localStorage.setItem(transaction.key,transaction.raw);}else accountSettings.rollback(transaction.identity,transaction.written,transaction.raw);if(identity===transaction.identity){profileRaw=transaction.raw;applyPreferences(transaction.preferences,transaction.helmet);wingStyle.style=transaction.wings;wingStyle.message='';}transaction.written=undefined;};return legacyDemo?restore():accountSettings.locked(transaction.identity,restore);},
    discard(){editing=false;fillSettings();refresh();}
  };
  setting('.map-save').onclick=async()=>{syncAccount();const s=snapshot();if(mapDraftOwner?.identity!==identity||mapDraftOwner?.character!==s.name||mapDraftOwner?.hero!==window.__world?.playerEntity){setting('.error').textContent='Cambió la sesión. Cancelá mapas y volvé a editar.';return;}standaloneMapSave=true;try{if(settingsProvider.validate())return;await settingsProvider.apply();fillMapEditor();setting('.migration-note').textContent='Mapas guardados. Play se inicia manualmente.';}catch{setting('.error').textContent='No se pudo guardar. Revisá la cuenta y reabrí configuración.';}finally{standaloneMapSave=false;}};
  setting('.map-cancel').onclick=()=>fillMapEditor();
  fillSettings();
  const AUTO_TOGGLES='.auto-reset,.soul-shield,.map-enabled,.spot-enabled,.pair-inventory,.detailed-stats,.balrog-enabled,.hide-helmet';
  let toggleSaveQueue=Promise.resolve();
  function saveToggle(input){
    const owner=identity,character=snapshot().name,hero=window.__world?.playerEntity,transaction=editing?before:null,wanted=input.checked;
    const field=input.matches('.hide-helmet')?'hideHelmet':input.matches('.detailed-stats')?'detailedStats':input.matches('.balrog-enabled')?'balrogEnabled':input.matches('.pair-inventory')?'pairInventory':input.matches('.auto-reset')?'autoReset':input.matches('.soul-shield')?'soulShield':null;
    const saveState=input.matches('.hide-helmet')?setting('.helmet-save-state'):input.matches('.detailed-stats')?setting('.stats-save-state'):input.matches('.balrog-enabled')?setting('.balrog-save-state'):input.matches('.pair-inventory')?setting('.pair-save-state'):setting('.autosave-state');
    const map=selectedLevelMap,index=input.matches('.spot-enabled')?Number(input.closest('.map-spot').dataset.spot):null;
    const draftSpot=index===null?null:{...currentMapDraft().spots[index]};
    for(const control of settingsRoot.querySelectorAll(AUTO_TOGGLES))control.disabled=true;
    saveState.textContent='Guardando switch…';
    toggleSaveQueue=toggleSaveQueue.then(async()=>{
      syncAccount();
      if(!owner||identity!==owner||profileConflict||preferencesInvalid||character!==snapshot().name||hero!==window.__world?.playerEntity)throw Error('Cambió la sesión o la configuración. Reabrí Config antes de guardar.');
      const value=JSON.parse(JSON.stringify(preferences)),expected=profileRaw;
      if(field)value[field]=wanted;
      else{
        value.leveling=migrateLeveling(preferences,snapshot().charClass).leveling;
        const storedMap=value.leveling.maps.find(m=>m.map===map);
        if(index===null)storedMap.enabled=wanted;
        else{
          const spot=storedMap.spots[index];
          if(!spot||spot.x!==draftSpot.x||spot.y!==draftSpot.y||currentMapDraft().map!==map||currentMapDraft().spots.length!==storedMap.spots.length)throw Error('Guardá primero las coordenadas o los cambios de spots; después su switch se guarda automáticamente.');
          spot.enabled=wanted;
        }
      }
      if(!validPreferences(value,'stored')||(!field&&!validLeveling(value,snapshot().charClass)))throw Error('No se pudo guardar el switch. Revisá los mapas guardados.');
      const written=JSON.stringify(value);
      const commit=()=>{
        if(identity!==owner||(!legacyDemo&&accountIdentity(window.__store)!==owner)||character!==snapshot().name||hero!==window.__world?.playerEntity)throw Error('Cambió la sesión antes de guardar.');
        if(legacyDemo){if(localStorage.getItem(preferencesKey)!==expected)throw Error('La configuración cambió en otra ventana.');localStorage.setItem(preferencesKey,written);}
        else accountSettings.write(owner,expected,written,accountIdentity(window.__store));
        profileRaw=written;applyPreferences(value,value.hideHelmet===true);
        const baseline=editing?before:transaction;
        if(baseline?.identity===owner){baseline.raw=written;baseline.preferences=JSON.parse(JSON.stringify(value));baseline.helmet=value.hideHelmet===true;baseline.written=undefined;}
        if(!field&&draftLeveling){const m=draftLeveling.maps.find(m=>m.map===map);if(index===null)m.enabled=wanted;else if(m.spots[index])m.spots[index].enabled=wanted;}
        if(input.isConnected&&(field||selectedLevelMap===map))input.checked=wanted;
        saveState.textContent=['pairInventory','detailedStats','hideHelmet'].includes(field)?'Switch guardado automáticamente.':'Switch guardado automáticamente. Coordenadas y niveles pendientes requieren Guardar.';
      };
      if(legacyDemo)commit();else await accountSettings.locked(owner,commit);
    }).catch(error=>{
      if(owner===identity){const baseline=field?(['pairInventory','detailedStats','balrogEnabled','hideHelmet'].includes(field)?preferences[field]===true:preferences[field]!==false):index===null?migrateLeveling(preferences,snapshot().charClass).leveling.maps.find(m=>m.map===map)?.enabled:!wanted;
        if(input.isConnected)input.checked=!!baseline;
        if(!field&&draftLeveling){const m=draftLeveling.maps.find(m=>m.map===map);if(index===null)m.enabled=!!baseline;else if(m.spots[index])m.spots[index].enabled=!!baseline;renderMapPlan();}}
      saveState.textContent='No guardado: '+error.message;
    }).finally(()=>{for(const control of settingsRoot.querySelectorAll(AUTO_TOGGLES))control.disabled=false;});
  }
  settingsRoot.addEventListener('change',event=>{if(event.target.closest('.schedule-settings'))return;if(event.target.matches(AUTO_TOGGLES)){saveToggle(event.target);return;}if(!event.target.closest('.steps,.map-leveling')&&!event.target.matches('.new-name,.map-select'))settingsChanged();});
  window.addEventListener('mu-hub:register',event=>{if(event.detail?.capabilities?.configurationWindow){configAvailable=true;mapActions.hidden=true;$('.config').hidden=true;}});

  function refresh(){
    // Retired automation: historical preferences and engine remain recoverable, never armed.
    if(gold.enabled||gold.active)gold.cancel('Golden hunt no disponible');
    syncAccount();
    refreshStats();
    hideHelmet.sync(window.__world,window.__store);
    wingStyle.sync(window.__world,window.__store);
    if(!editing)setting('.wing-style').value=wingStyle.style;
    setting('.wing-state').textContent=wingStyle.style==='original'&&wingStyle.binding===null&&!/^(No se|Apariencia)/.test(wingStyle.message)?'':wingStyle.message;
    if(!editing)settingsRoot.querySelector('.hide-helmet').checked=hideHelmet.enabled;
    settingsRoot.querySelector('.helmet-state').textContent=/^(No se pudo|Apariencia no disponible|Suspendido|Esperando modelo)/.test(hideHelmet.message)?hideHelmet.message:'';settingsRoot.querySelector('.runtime-state').textContent=/pausado|no pudo|incompatible/i.test(cycle.message)?cycle.message:'';
    try{
      bindHunterBus();const s=snapshot(),now=Date.now(),data=radarData();updateBalrogEvent(s,now);evaluateSchedule(s,now);setting('.schedule-state').textContent=scheduleError||scheduleMessage;
      if(balrog.active){
        const event=balrogEvent.get(now);
        if(preferences.balrogEnabled!==true||profileConflict||preferencesInvalid)stopBalrog('Caza pausada: configuración no disponible');
        else if(!event||event.id!==balrog.event.id)stopBalrog('Caza pausada: terminó el evento o cambió el destino');
        else if(!s.ready||s.dead)stopBalrog('Caza pausada: personaje no disponible');
        else if(balrog.phase!=='home'&&now-balrog.started>120000)stopBalrog('Caza pausada: se agotó el tiempo de viaje');
        else if(!queuedAction)enact(balrog.step(s,event,now,window.__world));
        if(s.ready&&!s.loading)serviceHelper(now);else if(!s.ready){queuedAction=null;desiredHelper=null;native.pending=null;clearOwned();}
        render(s);window.dispatchEvent(new CustomEvent('mu-hub:state',{detail:{id:'helper'}}));return;
      }
      refreshLevelSpots(s,now,cycle.running&&!gold.active&&!soulShield.pending&&!profileConflict&&!preferencesInvalid);radarModule?.actions.captureSpots?.(gold.active?gold.options.saveSpots:goldPreferences(preferences,snapshot().charClass).saveSpots);
      setting('.gold-info').textContent=data.timerAvailable?'Timer disponible · mapas restantes '+(data.remaining&&now-data.remaining.at<=60000?'disponibles':'sin datos vigentes'):'Timer no disponible: espera aviso o inicio del evento';
      if(!cycle.running&&gold.active){gold.cancel('Golden hunt detenido por Play',false);queuedAction=null;clearHuntTargets();}
      const transitionDue=!gold.active&&cycle.transitionDue(s);
      if(transitionDue){soulShield.clear(window.__world,window.__store);if(queuedAction?.kind==='walk')queuedAction=null;}
      const buffBusy=soulShield.step(s,window.__world,window.__store,cycle.running&&!transitionDue&&!cycle.pending&&preferences.soulShield!==false,now);setting('.buff-state').textContent=soulShield.message;
      const conflict=nativeLootConflict(preferences,window.__store?.muHelper?.config,!!window.__LEVEL_HELPER_DEMO__);
      settingsRoot.querySelector('.loot-state').textContent=conflict||excellentLoot.message;
      if(gold.enabled&&!gold.active){gold.message=!cycle.running?'Encendé Play para cazar goldens':!data.ready?'Golden hunt: Radar no disponible':cycle.pending?.kind==='reset'?'Golden hunt: esperando terminar el reset':data.event?.id===gold.completed?'Golden hunt: recorrido terminado; esperando la próxima invasión':!s.ready?'Golden hunt: esperando personaje':s.dead?'Golden hunt: esperando reaparecer':s.loading?'Golden hunt: esperando carga del mapa':buffBusy?'Golden hunt: esperando Soul Shield':!huntCanStart(s,data,now,goldPreferences(preferences,snapshot().charClass))?'Golden hunt: esperando invasión':'Golden hunt: preparando cacería';}
      const canStart=cycle.running&&gold.enabled&&!gold.active&&data.ready&&data.event?.id!==gold.completed&&huntCanStart(s,data,now,goldPreferences(preferences,snapshot().charClass))&&cycle.pending?.kind!=='reset';
      if(canStart){queuedAction=null;clearOwned();clearHuntTargets();desiredHelper=false;}
      if(gold.active&&!data.ready){gold.cancel('Golden hunt pausado: Radar no disponible');queuedAction=null;}
      if(!buffBusy&&(gold.active||canStart)){
        huntHadControl=true;
        if(!queuedAction||queuedAction.hunter||queuedAction.kind==='huntAttack'||queuedAction.kind==='huntLoot'||s.dead||!s.ready||data.event?.phase==='ended')enact(gold.step(s,{...data,world:window.__world,lootCount},now));
      }
      if(huntHadControl&&!gold.active)returnToLevel(now);
      // Give the existing picker one turn before returning to the leveling spot.
      // Warp/reset/route transitions keep priority; only dedicated Kundun holds movement.
      const earlyLoot=preferences.loot?.kundun===true&&!!cycle.stage&&!buffBusy&&!gold.active&&!canStart&&!queuedAction&&!cycle.pending&&!transitionDue;
      if(earlyLoot)excellentLoot.step(cycle,s,window.__world,window.__store,preferences,now,false,!!window.__LEVEL_HELPER_DEMO__);
      const kundunBusy=earlyLoot&&excellentLoot.pending?.kundun===true;
      if(kundunBusy)cycle.progressAt=now;
      if(!kundunBusy&&!buffBusy&&!gold.active&&(!queuedAction || s.dead || !s.ready)){
        // Home keeps control while leveling, including idle enemy search.
        enact(cycle.step(s,now,window.__world));
      }
      if(s.ready && !s.loading&&!buffBusy&&!kundunBusy)serviceHelper(now);
      else if(!s.ready){excellentLoot.clear();queuedAction=null;desiredHelper=null;native.pending=null;clearOwned();}
      if(!earlyLoot)excellentLoot.step(cycle,s,window.__world,window.__store,preferences,now,gold.active||canStart||!!queuedAction||!!cycle.pending||transitionDue,!!window.__LEVEL_HELPER_DEMO__);
      if(identity&&!profileConflict&&!preferencesInvalid&&(legacyDemo||cycle.running))nativeParty.sync(window.__social,s,window.__store?.gsSocket,now,preferences.acceptParty);
      if(nativeParty.message)settingsRoot.querySelector('.runtime-state').textContent=nativeParty.message;
      if(identity&&!profileConflict&&!preferencesInvalid&&cycle.running)party.step(window.__world,window.__social,s,now,cycle.config);else party.cancel();
      if(gold.active && s.ready&&!s.dead&&!s.loading){
        const store=window.__store,config=store.muHelper?.config,pd=store.playerData;
        if(config?.useHealPotion&&pd.maxHP>0&&pd.currentHP/pd.maxHP*100<=config.potionThreshold&&now-lastPotion>=3000&&typeof store.consumeItemRequest==='function'){
          const slot=pd.items?.findIndex((item,index)=>index>=12&&item?.group===14&&(item.num<=3||(item.num>=38&&item.num<=40)));
          if(slot>=12){lastPotion=now;store.consumeItemRequest(slot);}
        }
      }
      render(s);window.dispatchEvent(new CustomEvent('mu-hub:state',{detail:{id:'helper',state:hubModule.getState()}}));
    }catch(e){party.cancel();if(balrog.active)stopBalrog('Caza pausada: cliente incompatible');gold.cancel('Golden hunt pausado: cliente incompatible');cycle.stop('Pausado: cliente incompatible');excellentLoot.clear();queuedAction=null;clearOwned();clearHuntTargets();render({ready:false});console.error('[Level Helper]',e);}
  }
  let reacting=false;
  function reactToRadar(){
    syncAccount();
    if(reacting||!gold.active||!cycle.running||soulShield.pending)return;
    reacting=true;
    try{const s=snapshot(),now=Date.now(),data=radarData();if(!data.ready)return;
      enact(gold.step(s,{...data,world:window.__world,lootCount},now));
      if(s.ready&&!s.dead&&!s.loading)serviceHelper(now);
    }catch(e){gold.cancel('Golden hunt pausado: cliente incompatible');queuedAction=null;clearOwned();clearHuntTargets();console.error('[Golden hunt]',e);}finally{reacting=false;}
  }
  // Golden hunt retired: no reactive hunting listener.
  $('.settings').onclick=()=>{if(configAvailable){window.dispatchEvent(new CustomEvent('mu-config:open'));return;}const panel=$('.config');panel.hidden=!panel.hidden;$('.settings').setAttribute('aria-expanded',String(!panel.hidden));$('.settings').setAttribute('aria-label',panel.hidden?'Ver configuración':'Ocultar configuración');render(snapshot());};
  $('.party').onclick=()=>{if($('.config').hidden)$('.settings').click();};
  setting('.balrog-play').onclick=toggleBalrog;
  $('.toggle').onclick=manualLevelToggle;
  for(const name of ['pointerdown','pointerup','click','dblclick','keydown','keyup','wheel','contextmenu'])host.addEventListener(name,e=>e.stopPropagation());
  const hubStyle=document.createElement('style');hubStyle.textContent=':host([data-hub=true]){position:static!important;display:block;max-width:none!important}:host([data-hub=true]) .controls{display:none}:host([data-hub=true]) .config{width:100%;max-width:none;max-height:none;margin:0;border:0;border-top:1px solid #76633d;border-radius:0}';root.append(hubStyle);
 const hubModule={id:'helper',host,getState:()=>({schedule:scheduleStatus(),statsVisible:!statsHost.hidden,detailedStats:preferences.detailedStats===true&&!profileConflict&&!preferencesInvalid,running:cycle.running,ready:snapshot().ready,message:balrog.active?balrog.message:cycle.message+(cycle.running&&soulShield.message&&!soulShield.pending?' · '+soulShield.message:''),partyCount:window.__social?.partyMembers?.length||1,balrog:balrogState(),gold:{enabled:gold.enabled,active:gold.active,message:gold.message,kills:gold.kills?.[snapshot().map]??0,boxes:gold.boxes,ready:false}}),capabilities:{settings:settingsProvider},actions:{balrog:toggleBalrog,gold:()=>({available:false,message:'Golden hunt retirado'}),toggle:()=>$('.toggle').click(),settings:open=>{const panel=$('.config');panel.hidden=!open;$('.settings').setAttribute('aria-expanded',String(open));},attach:()=>{host.dataset.hub='true';host.style.setProperty('position','static','important');}}};
 function registerHub(){window.dispatchEvent(new CustomEvent('mu-hub:register',{detail:hubModule}));}
 window.addEventListener('mu-hub:discover',registerHub);registerHub();window.dispatchEvent(new CustomEvent('mu-hub:discover'));
  const timer=setInterval(refresh,500);window.addEventListener('pagehide',()=>{clearInterval(timer);window.removeEventListener('keydown',quickKey,true);window.removeEventListener('resize',resizeQuick);quickHost.remove();soulShield.clear(window.__world,window.__store);excellentLoot.clear();hideHelmet.detach();wingStyle.detach();window.removeEventListener('mu-radar:hunting',reactToRadar);clearOwned();clearHuntTargets();if(hunterBus)for(const [name,fn] of Object.entries(hunterListeners))hunterBus.off(name,fn);if(window.__store?.muHelper?.active && desiredHelper!==null)window.__store.toggleMuHelper();},{once:true});refresh();
})();

