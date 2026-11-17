// Heuristic v1, event-weighted, not a calibrated prediction of viewer enjoyment.
const MODELS={NBA:{min:40,variation:8,weights:[.45,.30,.25]},NFL:{min:20,variation:4,weights:[.30,.40,.30]}};
export function excitementIndex(raw,league,state){
 const model=MODELS[league];
 const no=reason=>({value:null,reason,version:1});
 if(!model)return no('unsupported');if(state!=='post')return no('unfinished');
 if(!Array.isArray(raw))return no('missing');
 const p=raw.map(x=>x?.homeWinPercentage).filter(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1);
 if(p.length<model.min||p.length<raw.length*.9)return no('insufficient');
 if(p.at(-1)>.02&&p.at(-1)<.98)return no('incomplete');
 const close=x=>1-Math.abs(x-.5)*2;
 const mean=a=>a.reduce((s,x)=>s+close(x),0)/a.length;
 const balance=mean(p),ending=mean(p.slice(Math.floor(p.length*.8)));
 let variation=0;for(let i=1;i<p.length;i++)variation+=Math.abs(p[i]-p[i-1]);
 const swing=Math.min(1,variation/model.variation),[b,e,s]=model.weights;
 return {value:Math.round(100*(b*balance+e*ending+s*swing)),points:p.length,version:1};
}
