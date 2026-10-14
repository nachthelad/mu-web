// Exact current public MobX and mutual-close reactions; no game boot or account.
const fs=require('fs'),crypto=require('crypto');
const idx=fs.readFileSync('artifacts/stats-research/rework-index.js','utf8'),ui=fs.readFileSync('artifacts/stats-research/cv-index-D5yEXyzD.js','utf8');
const mobx=idx.slice(idx.indexOf('function _(e)'),idx.indexOf('class xt{'));
const closures=ui.slice(ui.indexOf('const jt=['),ui.indexOf('const bt=100',ui.indexOf('const jt=[')));
if(!mobx||!closures.includes('zt(e.open,t=>'))throw Error('extraction');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync('artifacts/stats-research/cv-audit.json',JSON.stringify({date:'2026-10-14',entry:'/assets/index-C399rQbj.js',mutualCloseModule:'/assets/index-D5yEXyzD.js',hashes:{mobx:hash(idx),ui:hash(ui)},scope:'Exact native registry jt and installer X0; auxiliary window stores are scaffolding.'},null,2));
fs.writeFileSync('demos/helper/character-cv-audited.js',`// Current public build. MobX MIT, see MOBX-LICENSE.txt. No boot or real account.
(function(root){function mobxFixture(){${mobx}\nreturn {observable:b,reaction:ys,action:j};}
function installNativeClosures(c,mobx){const X=mobx.action,observable=mobx.observable,disposers=[];
const zt=(...args)=>{const dispose=mobx.reaction(...args);disposers.push(dispose);return dispose;};
const ne=observable({partyWindowEnabled:false,guildWindowEnabled:false}),Ae=observable({windowEnabled:false,toggleWindow(){this.windowEnabled=!this.windowEnabled}}),nn=observable({windowOpen:false,closeWindow(){this.windowOpen=false}}),at=observable({open:false}),sn=observable({windowOpen:false});
// Auxiliary stores are explicit fixture scaffolding; closure registry and installer unchanged.
${closures}
X0();return {dispose:()=>disposers.forEach(fn=>fn()),social:ne};}
const result={mobxFixture,installNativeClosures};if(typeof module==='object')module.exports=result;else root.__CV_CHARACTER_FIXTURE__=result;})(globalThis);`);
