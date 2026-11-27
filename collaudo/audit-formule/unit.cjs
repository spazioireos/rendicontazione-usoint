const m=require('./motore.cjs');
const cy=m.calcCY('2026-01-01','2027-12-31');
const Z=()=>Array(12).fill(0);
const P=(o)=>Object.assign({nome:'X',oreT:0,eur:0,cofin:0,aOre:[0,0],aElim:[0,0],cessato:'',subentro:'',eurA:[0,0],recBlk:[],md:[Z(),Z()]},o);
const r2=x=>Math.round(x*100)/100;
// ricalcolo INDIPENDENTE, scritto dalla specifica (non dal codice):
function indip(p){const F=p.oreT*p.eur,G=F-p.cofin,I=F?G/F:0;let cum=0,finCum=0;const out=[];
 cy.forEach((c,yi)=>{const rate=(p.eurA[yi]>0)?p.eurA[yi]:p.eur;let h=0;c.months.forEach(mm=>{if(mm.disabled)return;if(m.isMeseCessato(p.cessato,c.year,mm.month))return;if(m.isMesePreSubentro(p.subentro,c.year,mm.month))return;h+=p.md[yi][mm.month]||0});
  const cost=h*rate;const own=Math.min(cost,Math.max(0,F-cum));cum+=own;const nf=Math.min(I*cum,G);const fin=nf-finCum;finCum=nf;out.push({ore:h,costo:r2(cost),fin:r2(fin),cof:r2(cost-fin)})});
 return {F,G,anni:out}}
function conf(nome,p,attese){const a=m.cP(p,cy,true,null);const b=indip(p);let ok=true;const righe=[];
 a.yrs.forEach((y,yi)=>{const x=b.anni[yi];const d=[['ore',y.oE,x.ore],['costo',r2(y.iE),x.costo],['fin',r2(y.fin),x.fin]];d.forEach(([k,va,vb])=>{if(Math.abs(va-vb)>0.005){ok=false;righe.push(`  ${cy[yi].year} ${k}: app ${va} · ricalcolo ${vb}`)}})});
 console.log((ok?'SUPERATO ':'DIFFERENZA ')+nome+` | budget F ${a.F} (indip ${b.F}) | `+a.yrs.map((y,yi)=>cy[yi].year+': ore '+y.oE+' costo '+r2(y.iE)+' fin '+r2(y.fin)+' cof '+r2(y.cof)+' oreDisp '+r2(y.oD)+' oreRes '+r2(y.oR)+(y.ov?' SFORATO':'')).join(' || '));righe.forEach(r=>console.log(r));if(attese)attese(a);return a}
const md12=(h)=>[Array(12).fill(h),Array(12).fill(h)];
// S1 stesso costo orario
conf('S1 stesso costo orario 20 €/h, 10 h/mese, budget 400 h',P({oreT:400,eur:20,cofin:1600,aOre:[200,200],md:md12(10)}));
// S2 aumento dal 2027
conf('S2 aumento a 25 €/h dal 2027 (eurA)',P({oreT:400,eur:20,cofin:1600,aOre:[200,200],eurA:[0,25],md:md12(10)}));
// S6a costo effettivo superiore (30 €/h su budget 20)
conf('S6a costo eff. 30 €/h > preventivo 20 €/h',P({oreT:400,eur:20,cofin:1600,aOre:[200,200],eurA:[30,30],md:md12(10)}));
// S6b costo effettivo inferiore
conf('S6b costo eff. 15 €/h < preventivo 20',P({oreT:400,eur:20,cofin:1600,aOre:[200,200],eurA:[15,15],md:md12(10)}));
// S7a ore effettive superiori (25 h/mese = 600 h su 400)
conf('S7a ore 600 > 400 preventivate',P({oreT:400,eur:20,cofin:1600,aOre:[200,200],md:md12(25)}));
// S7b ore inferiori
conf('S7b ore 120 < 400',P({oreT:400,eur:20,cofin:1600,aOre:[200,200],md:md12(5)}));
// S6c caso Christian: 200h a 10, ne fa 100 a 15 -> SFORAMENTO in euro ma non in ore?
conf('S6c 200h@10 budget, fa 150h a 15 €/h (2.250 € > 2.000)',P({oreT:200,eur:10,cofin:0,aOre:[200,0],eurA:[15,0],md:[[15,15,15,15,15,15,15,15,15,15,0,0],Z()]}));
