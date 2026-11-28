const fs=require('fs');const BK=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));process.env.APPF=process.argv[3];const m=require(__dirname + '/motore.cjs');
const idx=JSON.parse(BK['usoint-idx']);
for(const it of idx){const P=JSON.parse(BK['usoint-p-'+it.id]);const cy=m.calcCY(P.start,P.end);
 const Ip=p=>{const F=p.oreT*p.eur;if(F)return (F-p.cofin)/F;const rb=p.recBlk||[],h=rb.reduce((a,b)=>a+b.ore,0);return h?rb.reduce((a,b)=>a+b.ore*b.Iorig,0)/h/100:0};
 const anni=cy.map((c,yi)=>(P.personnel||[]).reduce((a,p)=>a+((p.aOre||[])[yi]||0)*p.eur*Ip(p),0)+(P.beni||[]).reduce((a,b)=>a+((b.aImp||[])[yi]||0)*(b.forf?(b.forf-b.cofin)/b.forf:0),0));
 const tot=(P.personnel||[]).reduce((a,p)=>a+p.oreT*p.eur*Ip(p),0)+(P.beni||[]).reduce((a,b)=>a+b.forf-b.cofin,0);
 const sA=anni.reduce((a,b)=>a+b,0); const persi=(P.personnel||[]).filter(p=>p.eur===0&&(p.aOre||[]).some(x=>x>0)).map(p=>`${p.nome} ${p.aOre.reduce((a,b)=>a+b,0)} h (budgetRic ${p.budgetRic})`);
 console.log(`${P.title}: Previsto progetto ${tot.toFixed(2)} · somma anni ${sA.toFixed(2)} · differenza ${(tot-sA).toFixed(2)}${persi.length?' · righe a €/ora 0: '+persi.join('; '):''}`);}
