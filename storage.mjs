const KEY='pigulka-progress-v1';
let library,banks;
async function readJson(path){const r=await fetch(new URL(path,import.meta.url));if(!r.ok)throw Error('Nie można wczytać biblioteki.');return r.json()}
function state(){return JSON.parse(localStorage.getItem(KEY)||'{}')}
function merge(progress){return library.map(p=>({...p,...(progress[p.id]||{})}))}
export async function loadLibrary(){[library,banks]=await Promise.all([readJson('./data/pigulki.json'),readJson('./data/banki-pytan.json')]);return {items:merge(state()),banks}}
export async function saveAction(id,action,eventId){
 if(!library)await loadLibrary();
 const progress=state(),p=merge(progress).find(p=>p.id===id);
 if(!p)throw Error('Nie znaleziono pigułki.');
 const current=progress[id]||{wizyty:p.wizyty,archiwalna:p.archiwalna,dataArchiwizacji:p.dataArchiwizacji};
 const now=new Date().toISOString();
 if(action==='visit'){if(!eventId)throw Error('Brak identyfikatora wizyty.');if(!current.wizyty.some(v=>v.id===eventId))current.wizyty=[...current.wizyty,{id:eventId,data:now}]}
 else if(action==='archive'||action==='restore'){current.archiwalna=action==='archive';current.dataArchiwizacji=current.archiwalna?now:null}
 else throw Error('Nieznana operacja.');
 progress[id]=current;localStorage.setItem(KEY,JSON.stringify(progress));return merge(progress);
}
