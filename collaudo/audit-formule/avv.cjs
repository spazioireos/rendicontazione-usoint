const L = require('/home/user/rendicontazione-usoint/collaudo/uso-a01-lib.cjs');
const m=require('./motore.cjs');
const VINC=process.env.VINC==='1', SUB=process.env.SUB||'2026-06-01', BEUR=Number(process.env.BEUR||0), BEA=Number(process.env.BEA||25);
const Z=()=>Array(12).fill(0);const r2=x=>Math.round(x*100)/100;
const mdA=[20,20,20,20,20,0,0,0,0,0,0,0];
const sm=new Date(SUB).getMonth();const mdB=Z().map((x,i)=>i>=sm?10:0);
const kv={'usoint-idx':[{id:'pc',title:'AVV PROVA',start:'2026-01-01',end:'2026-12-31',vincolo:VINC}],'usoint-p-pc':L.prog('pc','AVV PROVA','2026-01-01','2026-12-31',1,{vincolo:VINC,
 personnel:[L.pers(1,{nome:'ALFA PROVA',voce:'EDUCATORE',oreT:200,eur:10,cofin:400,aOre:[200],eurA:[15],cessato:'2026-05-31',cessTipo:'sub',md:[mdA]}),
  L.pers(1,{nome:'BETA PROVA',voce:'EDUCATORE',oreT:0,eur:BEUR,eurA:[BEA],aOre:[0],subentro:SUB,subentroDi:'ALFA PROVA',md:[mdB]})]})};
(async()=>{const {ctx}=await L.contesto({kv,dsf:1});const T=await L.pagina(ctx);await T.page.setViewportSize({width:1500,height:900});
await T.page.goto(L.BASE+'uso/index.html');await T.page.waitForFunction(()=>/I tuoi Progetti/.test(document.body.innerText),null,{timeout:30000});
await T.page.evaluate(()=>{const el=[...document.querySelectorAll('div')].filter(d=>getComputedStyle(d).cursor==='pointer'&&/AVV PROVA/.test(d.innerText));el[el.length-1].click()});
await T.page.waitForFunction(()=>/BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText),null,{timeout:15000});await L.aspetta(T,300);
const box=T.page.locator('div:has(> div:has-text("Riassegnazione residui di operatori cessati"))').last();
const t0=await T.page.evaluate(()=>document.body.innerText.replace(/\s+/g,' '));console.log('PRIMA quota:',(t0.match(/Quota Committente € [\d.,-]+ € [\d.,-]+ € [\d.,-]+/)||[''])[0], /Hai sforato/.test(t0)?'SFORATO':'');const prima=(await box.innerText()).replace(/\s+/g,' ');console.log('RIQUADRO:',(prima.match(/Residuo[^→]*/)||[''])[0]);
T.risposte.push({re:/./},{re:/./},{re:/./});
await T.page.locator('button',{hasText:/^Trasferisci/}).first().click();await L.aspetta(T,600);
console.log('AVVISO:',T.dialoghi.map(d=>d.msg.replace(/\s+/g,' ')).join(' || ').slice(0,300));
await T.page.click('button:has-text("💾 Salva")');await L.aspetta(T,300);
const D=JSON.parse(await L.ls(T,'usoint-p-pc'));const Pp=D.personnel;
console.log('B dopo:',JSON.stringify({aOre:Pp[1].aOre,ricevute:Pp[1].ricevute,budgetRic:Pp[1].budgetRic,recBlk:Pp[1].recBlk}));
const cy=m.calcCY('2026-01-01','2026-12-31');
const ca=m.cP(Pp[0],cy,VINC,null),cb=m.cP(Pp[1],cy,VINC,null);
const y=(c)=>c.yrs[0];
console.log('A: ore',y(ca).oE,'costo',y(ca).iE,'fin',r2(y(ca).fin),'| B: ore',y(cb).oE,'costo',y(cb).iE,'fin',r2(y(cb).fin),'oreDisp',r2(y(cb).oD),'oreRes',r2(y(cb).oR),y(cb).ov?'SFORATO':'');
const Gtot=ca.G+cb.G, finTot=r2(y(ca).fin+y(cb).fin);
console.log('Budget ruolo F',ca.F+cb.F,'G (finanziabile)',Gtot,'| finanziato A+B',finTot,'| costo A+B',y(ca).iE+y(cb).iE, finTot>Gtot+0.01?'>>> FINANZIATO OLTRE IL BUDGET':'entro il budget');
// testo a video del budget
const tx=await T.page.evaluate(()=>document.body.innerText.replace(/\s+/g,' '));
const ii=tx.indexOf('RIEPILOGO PER ANNO');console.log('DOPO quota:',(tx.match(/Quota Committente € [\d.,-]+ € [\d.,-]+ € [\d.,-]+/)||[''])[0], /Hai sforato/.test(tx)?'SFORATO':'');console.log('VIDEO Quota Committente:',(tx.match(/Quota Committente \(la mette il finanziatore\) € [\d.,]+/)||[''])[0],'| Speso:',(tx.match(/Speso complessivo € [\d.,]+/)||[''])[0],'| SALDO:',(tx.match(/SALDO FINALE DA FATTURARE € [\d.,]+/)||[''])[0]);
console.log('errori',T.errori.length);await ctx.close();await L.chiudi();})();
