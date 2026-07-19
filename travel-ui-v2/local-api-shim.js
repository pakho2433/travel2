(()=>{
  const nativeFetch=window.fetch.bind(window), STORE='travel-vault-local-cloud-v2', pending=new Map();
  addEventListener('message',event=>{
    const d=event.data||{};
    if(d.type!=='travel-api-response'||!pending.has(d.id))return;
    const {resolve}=pending.get(d.id);pending.delete(d.id);
    resolve(new Response(d.body||'',{status:d.status||500,headers:{'Content-Type':d.contentType||'application/json'}}));
  });
  window.fetch=async(input,init={})=>{
    const url=typeof input==='string'?input:(input&&input.url)||'', method=String(init.method||(typeof input!=='string'&&input.method)||'GET').toUpperCase();
    if(!/\/api\/data(?:\?|$)/.test(url))return nativeFetch(input,init);
    let body=init.body;if(body==null&&typeof input!=='string'&&method!=='GET')body=await input.clone().text();
    const headers=new Headers(init.headers||(typeof input!=='string'?input.headers:undefined));
    if(parent!==window){
      const id=crypto.randomUUID();
      return new Promise((resolve,reject)=>{
        pending.set(id,{resolve,reject});
        parent.postMessage({type:'travel-api-request',id,method,body:body==null?'':String(body),travelKey:headers.get('X-Travel-Key')||headers.get('x-travel-key')||''},'*');
        setTimeout(()=>{if(pending.has(id)){pending.delete(id);reject(new Error('cloud timeout'))}},20000);
      });
    }
    if(method==='GET')return new Response(localStorage.getItem(STORE)||JSON.stringify({v:2,iv:'',cipher:'',updatedAt:0}),{status:200,headers:{'Content-Type':'application/json'}});
    if(method==='PUT'){const text=typeof body==='string'?body:JSON.stringify(body||{});localStorage.setItem(STORE,text);return new Response(text,{status:200,headers:{'Content-Type':'application/json'}})}
    return new Response(JSON.stringify({error:'method_not_allowed'}),{status:405,headers:{'Content-Type':'application/json'}});
  };
})();
