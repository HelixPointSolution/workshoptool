/* ── Helix Point Procurement Desk ─────────────────────────────────────
   Works fully offline. Connect Supabase (Setup button) to share saved
   RFQ rounds and the supplier directory with your whole team.            */

const DENS = {'5052':2.68,'6061':2.70,'5083':2.66};

/* ---------- Supabase connection ---------- */
let sb = null;          // supabase client (null = local-only mode)
let me = 'Team';        // display name on saved rounds

function loadConfig(){
  const local = JSON.parse(localStorage.getItem('hp_cfg') || '{}');
  const base = window.PROCUREMENT_CONFIG || {};
  return {
    url:  local.url  || base.SUPABASE_URL || '',
    key:  local.key  || base.SUPABASE_ANON_KEY || '',
    user: local.user || 'Team'
  };
}
function initSupabase(){
  const cfg = loadConfig();
  me = cfg.user || 'Team';
  const banner = document.getElementById('setupBanner');
  const status = document.getElementById('cloudStatus');
  if (cfg.url && cfg.key && window.supabase) {
    try {
      sb = window.supabase.createClient(cfg.url, cfg.key);
      status.textContent = '● Team synced';
      status.className = 'pill pill-on';
      banner.classList.add('hidden');
      return;
    } catch(e){ console.error(e); }
  }
  sb = null;
  status.textContent = '● Offline';
  status.className = 'pill pill-off';
  banner.classList.remove('hidden');
}

/* ---------- Settings modal ---------- */
function openSettings(){
  const cfg = loadConfig();
  document.getElementById('cfgUser').value = cfg.user==='Team'?'':cfg.user;
  document.getElementById('cfgUrl').value  = cfg.url;
  document.getElementById('cfgKey').value  = cfg.key;
  document.getElementById('settingsModal').classList.remove('hidden');
}
function closeSettings(){ document.getElementById('settingsModal').classList.add('hidden'); }
function saveSettings(){
  const url = document.getElementById('cfgUrl').value.trim();
  const key = document.getElementById('cfgKey').value.trim();
  const user= document.getElementById('cfgUser').value.trim() || 'Team';
  localStorage.setItem('hp_cfg', JSON.stringify({url,key,user}));
  closeSettings();
  initSupabase();
  alert(sb ? 'Connected! Saved rounds and suppliers now sync with your team.' :
             'Saved locally. Add a valid Supabase URL + key to sync with the team.');
}

/* ---------- Shared inquiry state (prefilled with a real job) ---------- */
let inquiry = [{t:2,w:122,l:180,qty:4},{t:2,w:155,l:180,qty:4}];
let suppliers = [
  {name:'Lian Giap & Co (Penang)', note:'Ex-stock, valid till tomorrow', items:[{t:2,price:3.00},{t:2,price:3.80}]},
  {name:'UA Materials',            note:'', items:[{t:2,price:5.30},{t:2,price:6.70}]},
  {name:'PHH Metal',               note:'Quoted 3mm — ask re-quote at 2mm', items:[{t:3,price:8.00},{t:3,price:8.51}]}
];

function show(t){
  ['rfq','cmp','score'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==t));
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.t===t));
  if(t==='cmp') renderSuppliers();
}
function syncDensity(){const g=document.getElementById('grade').value;if(DENS[g])document.getElementById('density').value=DENS[g];}

/* ---------- TAB 1: RFQ ---------- */
function renderItems(){
  const box=document.getElementById('items');box.innerHTML='';
  inquiry.forEach((it,i)=>{
    const d=document.createElement('div');d.className='card';
    d.innerHTML=`<h4>Item ${i+1}</h4><div class="row">
      <div><label>Thickness</label><input value="${it.t}" oninput="inquiry[${i}].t=+this.value"></div>
      <div><label>Height (W)</label><input value="${it.w}" oninput="inquiry[${i}].w=+this.value"></div>
      <div><label>Length</label><input value="${it.l}" oninput="inquiry[${i}].l=+this.value"></div>
      <div><label>Qty</label><input value="${it.qty}" oninput="inquiry[${i}].qty=+this.value"></div>
      <div style="flex:0 0 auto"><button class="btn del" onclick="delItem(${i})">✕</button></div></div>`;
    box.appendChild(d);
  });
}
function addItem(){inquiry.push({t:2,w:100,l:180,qty:1});renderItems();}
function delItem(i){inquiry.splice(i,1);suppliers.forEach(s=>s.items.splice(i,1));renderItems();}

function genRFQ(){
  const g=document.getElementById('grade');
  const gLabel=g.options[g.selectedIndex].text;
  const ref=(document.getElementById('ref').value||'____').trim();
  let lines=inquiry.map((it,i)=>`${i+1}. (${it.t.toFixed(2)}) X (${it.w.toFixed(2)}) X (${it.l.toFixed(2)}) = ${it.qty} PCS`).join('\n');
  document.getElementById('rfqOut').value=
`Subject: RFQ — Material ${gLabel}  Ref: ${ref}

Dear Supplier,

Please quote for the following:
*(00.00) = order size.
*0.00 = Finishing size: max allowance +5mm.

Material Type: ${gLabel}
${lines}


Please advise the soonest Delivery Date, and Stock availability.


Thank you.

Mobile: 011-5950 1559
Helix Point Solution
enquiry.helixpoint@gmail.com`;
}
function copyBox(id){const el=document.getElementById(id);el.select();document.execCommand('copy');}

/* ---------- TAB 2: COMPARISON ---------- */
function renderSuppliers(){
  const box=document.getElementById('suppliers');box.innerHTML='';
  suppliers.forEach((s,si)=>{
    while(s.items.length<inquiry.length)s.items.push({t:inquiry[s.items.length].t,price:0});
    s.items.length=inquiry.length;
    let its=inquiry.map((it,ii)=>`<div class="row">
      <div style="flex:0 0 90px"><label>Item ${ii+1} thk</label><input value="${s.items[ii].t}" oninput="suppliers[${si}].items[${ii}].t=+this.value"></div>
      <div><label>Item ${ii+1} price/pc (RM)</label><input value="${s.items[ii].price}" oninput="suppliers[${si}].items[${ii}].price=+this.value"></div>
    </div>`).join('');
    const d=document.createElement('div');d.className='card';
    d.innerHTML=`<div class="row"><div style="flex:1"><label>Supplier name</label>
      <input value="${s.name}" oninput="suppliers[${si}].name=this.value"></div>
      <div style="flex:0 0 auto"><button class="btn del" onclick="delSupplier(${si})">✕</button></div></div>${its}
      <div><label>Notes</label><input value="${s.note||''}" placeholder="e.g. ex-stock, cutting incl., validity, reliability" oninput="suppliers[${si}].note=this.value"></div>`;
    box.appendChild(d);
  });
}
function addSupplier(){const its=inquiry.map(it=>({t:it.t,price:0}));suppliers.push({name:'New supplier',note:'',items:its});renderSuppliers();}
function delSupplier(i){suppliers.splice(i,1);renderSuppliers();}

function wkg(t,w,l,dens){return (t/10)*(w/10)*(l/10)*dens/1000;}
function rm(n){return 'RM '+n.toFixed(2);}

let lastVerdict = '';
function analyse(){
  const dens=+document.getElementById('density').value||2.68;
  const data=suppliers.map(s=>{
    let total=0,weight=0,items=[],spec=true;
    inquiry.forEach((it,ii)=>{
      const q=s.items[ii];const pcW=wkg(q.t,it.w,it.l,dens);
      total+=q.price*it.qty; weight+=pcW*it.qty;
      const ok=Math.abs(q.t-it.t)<0.001; if(!ok)spec=false;
      items.push({price:q.price,t:q.t,ok});
    });
    return {name:s.name,note:s.note||'',total,weight,rmkg:weight?total/weight:0,items,spec};
  });
  const specced=data.filter(d=>d.spec);
  const winner=(specced.length?specced:data).reduce((a,b)=>a.rmkg<b.rmkg?a:b);

  let c1=`<div class="chart-title">CHART 1 — As Quoted</div><table><tr><th>Supplier</th>`+
    inquiry.map((it,i)=>`<th>Item ${i+1} /pc</th>`).join('')+`<th>Total</th><th>Notes</th></tr>`;
  c1+=`<tr class="inq-row"><td>🎯 Your inquiry</td>`+inquiry.map(()=>`<td>—</td>`).join('')+`<td>—</td><td>—</td></tr>`;
  data.forEach(d=>{c1+=`<tr class="${d===winner?'win-row':''}"><td>${d.name}${d===winner?' 🏆':''}</td>`+
    d.items.map(x=>`<td>${rm(x.price)}</td>`).join('')+`<td><b>${rm(d.total)}</b></td><td>${d.note?d.note:'—'}</td></tr>`;});
  c1+='</table>';

  let c2=`<div class="chart-title">CHART 2 — Normalised RM/kg (the fair ruler)</div><table><tr><th>Supplier</th><th>Total RM</th><th>Total kg</th><th>RM / kg</th></tr>`;
  data.slice().sort((a,b)=>a.rmkg-b.rmkg).forEach(d=>{c2+=`<tr class="${d===winner?'win-row':''}"><td>${d.name}</td><td>${rm(d.total)}</td><td>${d.weight.toFixed(3)}</td><td><b>${rm(d.rmkg)}</b></td></tr>`;});
  c2+='</table>';

  let c3=`<div class="chart-title">CHART 3 — Closest to Inquiry (spec match)</div>`;
  inquiry.forEach((it,ii)=>{
    c3+=`<div class="hint">Item ${ii+1} — inquiry: ${it.t.toFixed(2)} × ${it.w.toFixed(2)} × ${it.l.toFixed(2)}, ${it.qty} PCS</div>`;
    c3+=`<table><tr><th>Supplier</th><th>Thickness</th><th>Height</th><th>Length</th><th>Qty</th><th>Match</th></tr>`;
    c3+=`<tr class="inq-row"><td>🎯 Your inquiry</td><td>${it.t.toFixed(2)}</td><td>${it.w.toFixed(2)}</td><td>${it.l.toFixed(2)}</td><td>${it.qty}</td><td>—</td></tr>`;
    data.forEach(d=>{const x=d.items[ii];c3+=`<tr><td>${d.name}</td><td class="${x.ok?'match':'miss'}">${x.t.toFixed(2)}${x.ok?' ✓':' ✗'}</td><td>${it.w.toFixed(2)} ✓</td><td>${it.l.toFixed(2)} ✓</td><td>${it.qty} ✓</td><td class="${x.ok?'match':'miss'}">${x.ok?'exact':'thickness'}</td></tr>`;});
    c3+='</table>';
  });

  const runnerUp=data.filter(d=>d!==winner).sort((a,b)=>a.total-b.total)[0];
  const gap=runnerUp?runnerUp.total-winner.total:0;
  lastVerdict=`Award to ${winner.name} — ${rm(winner.total)} (${rm(winner.rmkg)}/kg)`;
  let v=`<div class="verdict"><h3>🏆 Award to ${winner.name} — ${rm(winner.total)}</h3>
    <div>Best value at <b>${rm(winner.rmkg)}/kg</b>${winner.spec?', exact spec match on every dimension.':'.'} ${runnerUp?`Beats ${runnerUp.name} by <b>${rm(gap)}</b>.`:''}</div></div>`;
  const off=data.filter(d=>!d.spec);
  if(off.length){v+=`<div class="flag">⚠️ Off-spec — re-quote before comparing: `+off.map(d=>`<b>${d.name}</b> (quoted wrong thickness)`).join(', ')+`. Also confirm cutting/finishing is included and check quote validity.</div>`;}
  document.getElementById('result').innerHTML=c1+c2+c3+v;
}

/* ---------- Save / load rounds (Supabase) ---------- */
async function saveRoundUI(){
  if(!sb){ alert('Connect Supabase first (Setup button) to save rounds for your team.'); return; }
  if(!lastVerdict){ analyse(); }
  const g=document.getElementById('grade');
  const payload={
    ref: (document.getElementById('ref').value||'').trim(),
    grade: g.options[g.selectedIndex].text,
    density: +document.getElementById('density').value||2.68,
    inquiry, suppliers, verdict: lastVerdict, created_by: me
  };
  const {error}=await sb.from('rounds').insert(payload);
  alert(error ? ('Could not save: '+error.message) : 'Round saved to your team ✅');
}
async function openRounds(){
  const modal=document.getElementById('roundsModal');
  const list=document.getElementById('roundsList');
  modal.classList.remove('hidden');
  if(!sb){ list.textContent='Connect Supabase first (Setup button) to see shared rounds.'; return; }
  list.textContent='Loading…';
  const {data,error}=await sb.from('rounds').select('*').order('created_at',{ascending:false}).limit(50);
  if(error){ list.textContent='Error: '+error.message; return; }
  if(!data.length){ list.textContent='No saved rounds yet.'; return; }
  window._rounds = data;
  list.innerHTML=data.map((r,i)=>`<div class="round-item" onclick="loadRound(${i})">
    <b>${r.ref||'(no ref)'}</b> · ${r.grade||''}<br><span class="hint">${r.verdict||''} — ${r.created_by||'Team'} · ${new Date(r.created_at).toLocaleString()}</span></div>`).join('');
}
function loadRound(i){
  const r=(window._rounds||[])[i]; if(!r) return;
  inquiry = r.inquiry || inquiry;
  suppliers = r.suppliers || suppliers;
  document.getElementById('ref').value = r.ref || '';
  document.getElementById('density').value = r.density || 2.68;
  closeRounds(); renderItems(); renderSuppliers(); analyse();
  show('cmp');
}
function closeRounds(){ document.getElementById('roundsModal').classList.add('hidden'); }

/* ---------- TAB 3: SCORECARD ---------- */
const CRIT=[['Price (RM/kg)',3],['Spec accuracy',3],['Response speed',2],['Stock / lead time',2],['Payment terms',1]];
let scores=[
  {name:'Lian Giap & Co',v:[5,5,4,5,4],note:'Best value/kg, ex-stock, reliable'},
  {name:'UA Materials',v:[2,5,4,4,4],note:'Spec-perfect but pricey metal'},
  {name:'PHH Metal',v:[3,1,3,3,4],note:'Watch spec — re-quote at correct thickness'}
];
function renderScore(){
  const box=document.getElementById('scoreBody');box.innerHTML='';
  scores.forEach((s,si)=>{
    let rows=CRIT.map((c,ci)=>`<div style="flex:1;min-width:120px"><label>${c[0]} ×${c[1]}</label>
      <input type="number" min="1" max="5" value="${s.v[ci]}" oninput="scores[${si}].v[${ci}]=+this.value"></div>`).join('');
    const d=document.createElement('div');d.className='card';
    d.innerHTML=`<div class="row"><div style="flex:1"><label>Supplier</label><input value="${s.name}" oninput="scores[${si}].name=this.value"></div>
      <div style="flex:0 0 auto"><button class="btn del" onclick="delScore(${si})">✕</button></div></div><div class="row">${rows}</div>
      <div><label>Notes</label><input value="${s.note||''}" placeholder="e.g. reliability, terms, quality history" oninput="scores[${si}].note=this.value"></div>`;
    box.appendChild(d);
  });
}
function addScore(){scores.push({name:'New supplier',v:[3,3,3,3,3],note:''});renderScore();}
function delScore(i){scores.splice(i,1);renderScore();}
function rankScores(){
  const max=CRIT.reduce((a,c)=>a+c[1]*5,0);
  const ranked=scores.map(s=>({name:s.name,note:s.note||'',tot:CRIT.reduce((a,c,ci)=>a+c[1]*(s.v[ci]||0),0)})).sort((a,b)=>b.tot-a.tot);
  let h=`<table><tr><th>Rank</th><th>Supplier</th><th>Weighted score</th><th>Notes</th></tr>`;
  ranked.forEach((r,i)=>{h+=`<tr class="${i===0?'win-row':''}"><td>${i===0?'🏆 1':i+1}</td><td>${r.name}</td><td><b>${r.tot}</b> / ${max}</td><td>${r.note?r.note:'—'}</td></tr>`;});
  h+='</table>';
  document.getElementById('scoreResult').innerHTML=h;
}
async function saveSuppliersUI(){
  if(!sb){ alert('Connect Supabase first (Setup button) to share the directory.'); return; }
  const rows=scores.map(s=>({name:s.name,scores:s.v,note:s.note||'',updated_by:me,updated_at:new Date().toISOString()}));
  const {error}=await sb.from('suppliers').upsert(rows,{onConflict:'name'});
  alert(error ? ('Could not save: '+error.message) : 'Supplier directory saved to your team ✅');
}
async function loadSuppliersUI(){
  if(!sb){ alert('Connect Supabase first (Setup button) to load the directory.'); return; }
  const {data,error}=await sb.from('suppliers').select('*').order('name');
  if(error){ alert('Error: '+error.message); return; }
  if(!data.length){ alert('No suppliers saved in the team directory yet.'); return; }
  scores=data.map(r=>({name:r.name,v:r.scores||[3,3,3,3,3],note:r.note||''}));
  renderScore();
  alert('Loaded '+data.length+' suppliers from your team directory ✅');
}

/* ---------- init ---------- */
initSupabase();
renderItems(); genRFQ(); renderSuppliers(); renderScore();
