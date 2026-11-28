// estrae dal file vero dell'app le funzioni del motore (non le riscrive)
const fs=require('fs');
const src=fs.readFileSync(process.env.APPF||(__dirname+'/../../index.html'),'utf8');
function prendi(inizio){const i=src.indexOf(inizio);if(i<0)throw new Error('manca '+inizio);let j=src.indexOf('{',i),d=0;for(;j<src.length;j++){if(src[j]==='{')d++;else if(src[j]==='}'){d--;if(d===0)break}}return src.slice(i,j+1)}
const MESI=["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];
const extra=[];['function dLoc(','function vecchiPassaggi(','function convertiPassaggi('].forEach(f=>{if(src.indexOf(f)>=0)extra.push(prendi(f))});
const codice=['const MESI='+JSON.stringify(MESI)+';',...extra,...(src.indexOf('function R2(')>=0?[prendi('function R2(')]:[]),
 'const calcCY='+prendi('const calcCY=').replace('const calcCY=','')+';',
 prendi('function isMeseCessato'),prendi('function isMesePreSubentro'),...(src.indexOf('function rateM(')>=0?[prendi('function tarV'),prendi('function tarDal'),prendi('function rateM(')]:[]),prendi('function applyTar'),prendi('function cP('),prendi('function cB(')].join('\n');
const m={};new Function('m','norm',codice+';m.calcCY=calcCY;m.cP=cP;m.cB=cB;m.applyTar=applyTar;m.rateM=(typeof rateM==="function")?rateM:null;m.isMeseCessato=isMeseCessato;m.isMesePreSubentro=isMesePreSubentro;m.vecchiPassaggi=(typeof vecchiPassaggi==="function")?vecchiPassaggi:null;m.convertiPassaggi=(typeof convertiPassaggi==="function")?convertiPassaggi:null;')(m,x=>String(x||'').toLowerCase().trim().replace(/\s+/g,' '));
module.exports=m;
