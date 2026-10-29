const API = '/api';
const state = { pets: [], care: [], health: [] };
const $ = (id) => document.getElementById(id);
const today = new Date();
const localDate = (d = today) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const safe = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const petEmoji = (species) => ({dog:'🐶',cat:'🐱',bird:'🐦',rabbit:'🐰',fish:'🐠'})[String(species||'').toLowerCase()] || '🐾';
const prettyDate = (value) => { if (!value) return '—'; const d = new Date(`${value}T00:00:00`); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'}); };
let toastTimer;
function toast(message){ const el=$('toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2800); }
async function request(path, options={}) {
  const res = await fetch(`${API}${path}`, {headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  let body={}; try { body=await res.json(); } catch {}
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}
function showError(id, message=''){ $(id).textContent=message; }
function openDialog(id){ $(id).showModal(); }
function closeDialogs(){ document.querySelectorAll('dialog[open]').forEach(d=>d.close()); }
document.querySelectorAll('.close-modal').forEach(b=>b.addEventListener('click',closeDialogs));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close();}));
$('refresh-btn').addEventListener('click',loadAll);
$('add-pet-btn').addEventListener('click',()=>openPetForm());
$('add-care-btn').addEventListener('click',()=>{if(!state.pets.length)return toast('Add a pet profile first.'); fillPetSelect('care-pet'); $('care-date').value=localDate(); showError('care-error'); $('care-form').reset(); fillPetSelect('care-pet'); $('care-date').value=localDate(); openDialog('care-dialog');});
$('add-health-btn').addEventListener('click',()=>{if(!state.pets.length)return toast('Add a pet profile first.'); $('health-form').reset(); fillPetSelect('health-pet'); $('health-date').value=localDate(); showError('health-error'); openDialog('health-dialog');});
function fillPetSelect(id, selected=''){ const el=$(id); el.innerHTML=state.pets.map(p=>`<option value="${p.id}" ${String(p.id)===String(selected)?'selected':''}>${safe(p.name)}</option>`).join(''); }
function openPetForm(pet=null){ $('pet-form').reset(); showError('pet-error'); $('pet-id').value=pet?.id||''; $('pet-modal-title').textContent=pet?'Edit pet':'Add a pet'; $('pet-name').value=pet?.name||''; $('pet-species').value=pet?.species||''; $('pet-breed').value=pet?.breed||''; $('pet-birth').value=pet?.birth_date||''; $('pet-weight').value=pet?.weight_kg??''; $('pet-notes').value=pet?.notes||''; openDialog('pet-dialog'); }
async function loadAll(){
  $('pets-grid').innerHTML='<div class="empty-state">Loading pet profiles…</div>';
  try {
    const [pets,care,health]=await Promise.all([request('/pets'),request('/care-logs'),request('/health-records')]);
    state.pets=pets.data; state.care=care.data; state.health=health.data;
    renderAll();
  } catch(e) {
    $('pets-grid').innerHTML=`<div class="empty-state">Could not load your data. ${safe(e.message)}<br><br>Check the server and Supabase setup, then refresh.</div>`;
    ['care-table','health-table'].forEach(id=>$(id).innerHTML='<tr><td colspan="6" class="muted">Data could not be loaded.</td></tr>');
    toast(e.message);
  }
}
function renderAll(){ $('pet-count').textContent=state.pets.length; $('care-count').textContent=state.care.length; $('health-count').textContent=state.health.length; renderPets(); renderCare(); renderHealth(); renderUpcoming(); }
function renderPets(){
  if(!state.pets.length){$('pets-grid').innerHTML='<div class="empty-state">No pets yet — add your first furry, feathery, or finned friend! 🐾</div>';return;}
  $('pets-grid').innerHTML=state.pets.map(p=>`<article class="pet-card"><div class="pet-top"><div class="pet-avatar">${petEmoji(p.species)}</div><div><h3>${safe(p.name)}</h3><p class="sub">${safe(p.species)}${p.breed?' · '+safe(p.breed):''}</p></div></div><div class="pet-meta">${p.birth_date?`<span class="pill">🎂 ${prettyDate(p.birth_date)}</span>`:''}${p.weight_kg!==null&&p.weight_kg!==''?`<span class="pill">⚖ ${safe(p.weight_kg)} kg</span>`:''}</div><p class="pet-notes">${safe(p.notes||'A lovely member of the family.')}</p><div class="card-actions"><button class="small-btn" data-edit-pet="${p.id}">Edit profile</button><button class="small-btn danger" data-delete-pet="${p.id}">Delete</button></div></article>`).join('');
  $('pets-grid').querySelectorAll('[data-edit-pet]').forEach(b=>b.addEventListener('click',()=>openPetForm(state.pets.find(p=>String(p.id)===b.dataset.editPet))));
  $('pets-grid').querySelectorAll('[data-delete-pet]').forEach(b=>b.addEventListener('click',()=>deletePet(b.dataset.deletePet)));
}
function petName(id){return state.pets.find(p=>String(p.id)===String(id))?.name||'Unknown pet';}
function renderCare(){
 if(!state.care.length){$('care-table').innerHTML='<tr><td colspan="5" class="muted">No activities logged yet. Add a walk, meal, or grooming session to get started.</td></tr>';return;}
 $('care-table').innerHTML=state.care.map(c=>`<tr><td>${safe(petName(c.pet_id))}</td><td>${safe(c.activity_type)}</td><td>${prettyDate(c.activity_date)}</td><td>${safe(c.notes||'—')}</td><td><button class="small-btn danger" data-delete-care="${c.id}">Delete</button></td></tr>`).join('');
 $('care-table').querySelectorAll('[data-delete-care]').forEach(b=>b.addEventListener('click',()=>deleteRecord('/care-logs/'+b.dataset.deleteCare,'care activity')));
}
function renderHealth(){
 if(!state.health.length){$('health-table').innerHTML='<tr><td colspan="6" class="muted">No health records yet. Add a vaccination or vet visit to keep everything organized.</td></tr>';return;}
 $('health-table').innerHTML=state.health.map(h=>`<tr><td>${safe(petName(h.pet_id))}</td><td>${safe(h.record_type)}</td><td>${prettyDate(h.record_date)}</td><td>${prettyDate(h.next_due_date)}</td><td>${safe(h.notes||'—')}</td><td><button class="small-btn danger" data-delete-health="${h.id}">Delete</button></td></tr>`).join('');
 $('health-table').querySelectorAll('[data-delete-health]').forEach(b=>b.addEventListener('click',()=>deleteRecord('/health-records/'+b.dataset.deleteHealth,'health record')));
}
function renderUpcoming(){
 const list=[...state.health.filter(h=>h.next_due_date).map(h=>({date:h.next_due_date,label:h.record_type,pet:petName(h.pet_id)}))].filter(x=>x.date>=localDate()).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
 if(!list.length){$('upcoming-list').innerHTML='<p class="muted">No upcoming due dates. Add a health record with a next due date to see it here.</p>';return;}
 $('upcoming-list').innerHTML=list.map(x=>{const d=new Date(`${x.date}T00:00:00`);return `<div class="upcoming-item"><div class="date-chip"><b>${d.getDate()}</b>${d.toLocaleDateString(undefined,{month:'short'}).toUpperCase()}</div><div><strong>${safe(x.label)} · ${safe(x.pet)}</strong><small>Due ${prettyDate(x.date)}</small></div></div>`}).join('');
}
$('pet-form').addEventListener('submit',async e=>{
 e.preventDefault(); showError('pet-error');
 const id=$('pet-id').value, name=$('pet-name').value.trim(), species=$('pet-species').value, weight=$('pet-weight').value;
 const payload={name,species,breed:$('pet-breed').value.trim()||null,birth_date:$('pet-birth').value||null,weight_kg:weight===''?null:Number(weight),notes:$('pet-notes').value.trim()||null};
 try {await request(id?`/pets/${id}`:'/pets',{method:id?'PUT':'POST',body:JSON.stringify(payload)});closeDialogs();toast(id?'Pet profile updated.':'Pet profile added!');await loadAll();}
 catch(err){showError('pet-error',err.message);}
});
$('care-form').addEventListener('submit',async e=>{
 e.preventDefault();showError('care-error');
 const payload={pet_id:Number($('care-pet').value),activity_type:$('care-type').value,activity_date:$('care-date').value,notes:$('care-notes').value.trim()||null};
 try{await request('/care-logs',{method:'POST',body:JSON.stringify(payload)});closeDialogs();toast('Care activity saved.');await loadAll();}
 catch(err){showError('care-error',err.message);}
});
$('health-form').addEventListener('submit',async e=>{
 e.preventDefault();showError('health-error');
 const payload={pet_id:Number($('health-pet').value),record_type:$('health-type').value,record_date:$('health-date').value,next_due_date:$('health-next').value||null,notes:$('health-notes').value.trim()||null};
 try{await request('/health-records',{method:'POST',body:JSON.stringify(payload)});closeDialogs();toast('Health record saved.');await loadAll();}
 catch(err){showError('health-error',err.message);}
});
async function deletePet(id){if(!confirm('Delete this pet and its care and health records? This cannot be undone.'))return;try{await request('/pets/'+id,{method:'DELETE'});toast('Pet and related records deleted.');await loadAll();}catch(e){toast(e.message);}}
async function deleteRecord(path,label){if(!confirm(`Delete this ${label}?`))return;try{await request(path,{method:'DELETE'});toast(`${label[0].toUpperCase()+label.slice(1)} deleted.`);await loadAll();}catch(e){toast(e.message);}}
loadAll();
