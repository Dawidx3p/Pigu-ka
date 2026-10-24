import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(url,'utf8'))});
const {loadLibrary,saveAction}=await import('../storage.mjs');
test('wizyty i archiwizacja przetrwają ponowne wczytanie bez zmiany treści',async()=>{
 const initial=await loadLibrary();const p=initial.items.find(p=>!p.archiwalna);assert.equal(p.wizyty.length,0);
 await saveAction(p.id,'visit','event1');await saveAction(p.id,'visit','event1');
 let saved=(await loadLibrary()).items.find(x=>x.id===p.id);assert.equal(saved.wizyty.length,1);
 await saveAction(p.id,'archive');saved=(await loadLibrary()).items.find(x=>x.id===p.id);assert.equal(saved.archiwalna,true);
 await saveAction(p.id,'restore');saved=(await loadLibrary()).items.find(x=>x.id===p.id);assert.equal(saved.archiwalna,false);assert.equal(saved.wizyty.length,1);assert.equal(saved.pelnyOpis,p.pelnyOpis);
 const snapshot=memory.get('pigulka-progress-v1');const old=localStorage.setItem;localStorage.setItem=()=>{throw Error('Quota exceeded')};await assert.rejects(saveAction(p.id,'archive'));localStorage.setItem=old;assert.equal(memory.get('pigulka-progress-v1'),snapshot);
});
