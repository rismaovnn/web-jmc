import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, Check, ChevronDown, ExternalLink, GripVertical, ImagePlus, LoaderCircle, Lock, LogOut, Plus, Save, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultContent } from '../cms/defaultContent';
import type { CMSContent, SectionKey } from '../cms/schema';
import { ApiError, requestJson } from '../lib/http';
import '../cms/admin.css';
const tabs: {key:SectionKey;label:string;icon:string}[]=[
 {key:'hero',label:'Hero Section',icon:'✦'}, {key:'about',label:'About & Mission',icon:'◎'},
 {key:'products',label:'Products',icon:'◈'},{key:'partners',label:'Partners',icon:'◉'},
 {key:'leadership',label:'Leadership',icon:'♟'},{key:'contact',label:'Contact',icon:'✉'},
 {key:'footer',label:'Footer',icon:'▤'}
];
const api=<T,>(path:string,init?:RequestInit)=>requestJson<T>(`/api/admin${path}`,init);
const uniqueId=()=>`cms-${crypto.randomUUID()}`;
function Field({label,value,onChange,placeholder='',multiline=false,type='text'}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;multiline?:boolean;type?:string}){
 return <label className="cms-field"><span>{label}</span>{multiline?<textarea rows={4} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>:<input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/>}</label>;
}
function RichEditor({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(ref.current && !ref.current.contains(document.activeElement) && ref.current.innerHTML!==(value||''))ref.current.innerHTML=value||'';},[value]);
 const action=(command:string)=>{document.execCommand(command,false);onChange(ref.current?.innerHTML||'');ref.current?.focus()};
 return <div className="cms-field cms-rich"><span>{label}</span><div className="cms-editor-toolbar"><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>action('bold')} title="Bold"><b>B</b></button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>action('italic')} title="Italic"><i>I</i></button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>action('insertUnorderedList')} title="Bulleted list">• List</button><button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>action('insertOrderedList')} title="Numbered list">1. List</button></div>
   <div className="cms-editable" contentEditable suppressContentEditableWarning role="textbox" aria-label={label} aria-multiline="true" ref={ref} onInput={e=>onChange(e.currentTarget.innerHTML)} onBlur={e=>onChange(e.currentTarget.innerHTML)} onPaste={e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'))}}/>
   <small>Basic formatting supported. Unsafe HTML is removed by the server when saved.</small>
 </div>;
}
// Standard Vercel Functions accept 4.5MB requests by default.
// Compress oversized camera photos in the browser BEFORE sending to /api/admin/upload.
async function prepareImageForVercel(file: File): Promise<Blob> {
 const limit = 3.6 * 1024 * 1024; // leave room below Vercel's 4.5 MB request cap
 if (file.size <= limit) return file;
 const bitmap = await createImageBitmap(file);
 try {
  const scale = Math.min(1, 1920 / bitmap.width, 1200 / bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw Error('Cannot process image on this browser');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.86, 0.76, 0.62, 0.48]) {
   const output = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
   if (output && output.type === 'image/webp' && output.size <= limit) return output;
  }
  throw Error('Image is still too large. Please resize it and try again.');
 } finally { bitmap.close(); }
}
function Upload({label,value,onChange,csrf}:{label:string;value:string;onChange:(v:string)=>void;csrf:string}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function upload(file:File){if(!file)return;if(file.size>8*1024*1024){setError('Maximum image size: 8 MB');return;}setBusy(true);setError('');try{
 const prepared=await prepareImageForVercel(file);
 const result=await api<{url:string;bytes:number}>('/upload',{method:'POST',headers:{'Content-Type':prepared.type,'X-CMS-CSRF':csrf},body:prepared});
 onChange(result.url);
 }catch(err){setError(err instanceof Error?err.message:'Upload failed');}finally{setBusy(false)}}
 return <div className="cms-field cms-upload"><span>{label}</span><div className="cms-upload-layout"><div className="cms-upload-preview">{value?<img src={value} alt="Uploaded image preview" onError={e=>{e.currentTarget.style.opacity='.1'}}/>:<ImagePlus size={27}/>}</div><div className="cms-upload-actions"><label className="cms-btn cms-btn-subtle cms-file-label">{busy?<LoaderCircle size={16} className="cms-spin"/>:<ImagePlus size={16}/>} {busy?'Optimizing…':'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)void upload(file);e.target.value=''}}/></label><small>JPG, PNG, WebP, AVIF • Up to 8 MB • Auto-optimized before upload</small></div></div>
 <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Or enter an existing image URL /images/..." aria-label={`${label} URL`}/>{error&&<small role="alert" className="cms-error">{error}</small>}</div>;
}
function CollectionEditor<T extends {id:string;order:number}>({items,onChange,create,render,section}:{items:T[];onChange:(v:T[])=>void;create:()=>T;render:(item:T,update:(v:T)=>void)=>ReactNode;section:string}){
 const [query,setQuery]=useState(''),[filter,setFilter]=useState(''),[dragging,setDragging]=useState(-1);
 const categories=useMemo(()=>[...new Set(items.map(item=>String('category' in item?item.category:'group' in item?item.group:'')).filter(Boolean))],[items]);
 const visible=useMemo(()=>items.map((item,index)=>({item,index})).filter(({item})=>JSON.stringify(item).toLowerCase().includes(query.toLowerCase()) && (!filter || String('category' in item?item.category:'group' in item?item.group:'')===filter)),[items,query,filter]);
 function reorder(from:number,to:number){if(from===to||from<0||to<0)return;const updated=[...items];const [moved]=updated.splice(from,1);updated.splice(to,0,moved);onChange(updated.map((x,i)=>({...x,order:i})));}
 function remove(id:string){if(!window.confirm(`Delete this ${section} item? This action will be saved automatically.`))return;onChange(items.filter(x=>x.id!==id).map((x,i)=>({...x,order:i})));}
 return <><div className="cms-list-head"><label className="cms-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${section}…`}/></label>{categories.length>0&&<select aria-label={`Filter ${section} by category`} className="cms-filter" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All categories</option>{categories.map(x=><option key={x} value={x}>{x}</option>)}</select>}<button type="button" className="cms-btn cms-btn-primary" onClick={()=>{onChange([...items,{...create(),order:items.length}]);setQuery('');setFilter('')}}><Plus size={17}/> Add {section}</button></div>
 <div className="cms-collection">{visible.map(({item,index})=><div key={item.id} className="cms-record" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();reorder(dragging,index);setDragging(-1)}}><div className="cms-record-top"><span className="cms-drag" draggable onDragStart={e=>{setDragging(index);e.dataTransfer.effectAllowed='move'}} onDragEnd={()=>setDragging(-1)} title="Drag to reorder"><GripVertical size={19}/></span><span className="cms-record-title">{('title' in item?String(item.title):'name' in item?String(item.name):'Item')||'New item'} <small>#{index+1}</small></span><button className="cms-delete" type="button" onClick={()=>remove(item.id)} aria-label="Delete item"><Trash2 size={17}/></button></div>
 <div className="cms-record-fields">{render(item,v=>onChange(items.map(x=>x.id===item.id?v:x)))}</div></div>)}{!visible.length&&<p className="cms-empty">No matching entries.</p>}</div>
 </>;
}
function Editor({section,content,setSection,csrf}:{section:SectionKey;content:CMSContent;setSection:(v:CMSContent[SectionKey])=>void;csrf:string}){
 const updateObj=(key:string,val:unknown)=>setSection({...content[section], [key]:val} as CMSContent[SectionKey]);
 if(section==='hero'){const v=content.hero;return <div className="cms-fields"><Field label="Eyebrow" value={v.eyebrow} onChange={x=>updateObj('eyebrow',x)}/><Field label="Main headline" value={v.headline} onChange={x=>updateObj('headline',x)}/><Field label="Gradient tagline" value={v.tagline} onChange={x=>updateObj('tagline',x)}/><Field label="Description" value={v.description} multiline onChange={x=>updateObj('description',x)}/><div className="cms-two"><Field label="Primary button label" value={v.primaryLabel} onChange={x=>updateObj('primaryLabel',x)}/><Field label="Primary URL" value={v.primaryHref} onChange={x=>updateObj('primaryHref',x)}/><Field label="Secondary button label" value={v.secondaryLabel} onChange={x=>updateObj('secondaryLabel',x)}/><Field label="Secondary URL" value={v.secondaryHref} onChange={x=>updateObj('secondaryHref',x)}/></div><Upload csrf={csrf} label="Hero image (leave empty to keep 3D animation)" value={v.image} onChange={x=>updateObj('image',x)}/></div>}
 if(section==='about'){const v=content.about;return <div className="cms-fields"><RichEditor label="Company description" value={v.description} onChange={x=>updateObj('description',x)}/><RichEditor label="Our Vision" value={v.vision} onChange={x=>updateObj('vision',x)}/><RichEditor label="Our Mission" value={v.mission} onChange={x=>updateObj('mission',x)}/></div>}
 if(section==='products')return <CollectionEditor section="product" items={content.products} onChange={setSection as (v:typeof content.products)=>void} create={()=>({id:uniqueId(),title:'New Product',subtitle:'',category:'PROJECT',description:'',technologies:[],image:'',link:'',order:0})} render={(v,update)=><><div className="cms-two"><Field label="Product title" value={v.title} onChange={x=>update({...v,title:x})}/><Field label="Category" value={v.category} onChange={x=>update({...v,category:x})}/></div><Field label="Subtitle" value={v.subtitle} onChange={x=>update({...v,subtitle:x})}/><RichEditor label="Description" value={v.description} onChange={x=>update({...v,description:x})}/><Field label="Technologies (comma separated)" value={v.technologies.join(', ')} onChange={x=>update({...v,technologies:x.split(',').map(s=>s.trim()).filter(Boolean)})}/><Field label="External project link (https://)" value={v.link} onChange={x=>update({...v,link:x})}/><Upload label="Product thumbnail" csrf={csrf} value={v.image} onChange={x=>update({...v,image:x})}/></>}/>;
 if(section==='partners')return <CollectionEditor section="partner" items={content.partners} onChange={setSection as (v:typeof content.partners)=>void} create={()=>({id:uniqueId(),name:'New Partner',category:'Education',logo:'',website:'',order:0})} render={(v,update)=><><div className="cms-two"><Field label="Partner name" value={v.name} onChange={x=>update({...v,name:x})}/><Field label="Category" value={v.category} onChange={x=>update({...v,category:x})}/></div><Field label="Partner website" value={v.website} onChange={x=>update({...v,website:x})}/><Upload label="Partner logo" csrf={csrf} value={v.logo} onChange={x=>update({...v,logo:x})}/></>}/>;
 if(section==='leadership')return <CollectionEditor section="team member" items={content.leadership} onChange={setSection as (v:typeof content.leadership)=>void} create={()=>({id:uniqueId(),name:'New Member',role:'',bio:'',group:'management' as const,photo:'',order:0})} render={(v,update)=><><div className="cms-two"><Field label="Full name" value={v.name} onChange={x=>update({...v,name:x})}/><Field label="Position" value={v.role} onChange={x=>update({...v,role:x})}/></div><label className="cms-field"><span>Organization group</span><select value={v.group} onChange={e=>update({...v,group:e.target.value as typeof v.group})}><option value="board">Board of Directors</option><option value="ceo">CEO</option><option value="management">Management Team</option></select></label><RichEditor label="Biography" value={v.bio} onChange={x=>update({...v,bio:x})}/><Upload label="Profile photo" value={v.photo} csrf={csrf} onChange={x=>update({...v,photo:x})}/></>}/>;
 if(section==='contact'){const v=content.contact;return <div className="cms-fields">{([['email','Company email'],['phone','Phone number'],['address','Address'],['mapsUrl','Google Maps link'],['instagram','Instagram URL'],['linkedin','LinkedIn URL'],['website','Website URL']] as const).map(([k,label])=><Field key={k} label={label} value={v[k]} onChange={x=>updateObj(k,x)}/>)}</div>}
 const v=content.footer;return <div className="cms-fields"><RichEditor label="Footer description" value={v.description} onChange={x=>updateObj('description',x)}/><Field label="Copyright text (year is prepended automatically)" value={v.copyright} onChange={x=>updateObj('copyright',x)}/><Field label="Tagline" value={v.tagline} onChange={x=>updateObj('tagline',x)}/><h3>Additional social links</h3>{v.socialLinks.map((link,i)=><div className="cms-inline" key={i}><Field label="Label" value={link.label} onChange={x=>updateObj('socialLinks',v.socialLinks.map((y,j)=>j===i?{...y,label:x}:y))}/><Field label="URL" value={link.url} onChange={x=>updateObj('socialLinks',v.socialLinks.map((y,j)=>j===i?{...y,url:x}:y))}/><button type="button" onClick={()=>{if(window.confirm('Remove social link?'))updateObj('socialLinks',v.socialLinks.filter((_,j)=>j!==i))}} title="Remove"><Trash2 size={17}/></button></div>)}<button className="cms-btn cms-btn-subtle" onClick={()=>updateObj('socialLinks',[...v.socialLinks,{label:'',url:''}])} type="button"><Plus size={16}/> Add social link</button></div>;
}
export default function AdminPage(){
 const [password,setPassword]=useState(''),[csrf,setCsrf]=useState(''),[initializing,setInitializing]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [section,setSection]=useState<SectionKey>('hero'),[content,setContent]=useState<CMSContent>(defaultContent),[saved,setSaved]=useState<CMSContent>(defaultContent),[status,setStatus]=useState('All changes saved');
 const [mobileNav,setMobileNav]=useState(false);
 async function load(){
  try {const c=await requestJson<CMSContent>('/api/content');setContent(c);setSaved(c);setError('');}
  catch(e){setError(e instanceof Error?e.message:'Content unavailable');}
 }
 useEffect(()=>{
  let active=true;
  api<{authenticated:boolean;csrfToken:string}>('/session').then(async data=>{
   if(active && data.authenticated){setCsrf(data.csrfToken);await load();}
  }).catch(e=>{
   if(active && !(e instanceof ApiError && e.status===401)) setError(e instanceof Error?e.message:'Unable to reach CMS API.');
  }).finally(()=>{if(active)setInitializing(false)});
  return ()=>{active=false};
 },[]);
 async function signIn(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try {
   const data=await api<{authenticated:boolean;csrfToken:string}>('/login',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})
   });
   setCsrf(data.csrfToken);setPassword('');await load();
  }catch(e){setError(e instanceof Error?e.message:'Login failed')}
  finally{setBusy(false)}
 }
 async function logout(){
  try {await api<{success:boolean}>('/logout',{method:'POST',headers:{'X-CMS-CSRF':csrf}});setCsrf('');setContent(defaultContent);}
  catch(e){setError(e instanceof Error?e.message:'Logout failed')}
 }
 const pending=useMemo(()=>tabs.filter(({key})=>JSON.stringify(content[key])!==JSON.stringify(saved[key])).map(t=>t.key),[content,saved]);
 const saving=useRef(new Set<SectionKey>());
 const latest=useRef(content);
 latest.current=content;
 async function saveOne(key:SectionKey,value:CMSContent[SectionKey]){
  if(saving.current.has(key))return;
  saving.current.add(key);setStatus('Saving changes…');
  let success=false;
  try {
   const result=await api<{saved:boolean;value:CMSContent[SectionKey]}>(`/content/${key}`,{
    method:'PUT',headers:{'Content-Type':'application/json','X-CMS-CSRF':csrf},body:JSON.stringify({value})
   });
   setSaved(old=>({...old,[key]:result.value}));
   // Keep the canonical server value in sync when the user has not typed again.
   setContent(old=>JSON.stringify(old[key])===JSON.stringify(value)?{...old,[key]:result.value}:old);
   setStatus('Saved successfully');setError('');success=true;
  }catch(e){setError(e instanceof Error?e.message:'Save failed');setStatus('Save failed')}
  finally{
   saving.current.delete(key);
   // A user may have typed while the previous save was in flight: persist the latest snapshot.
   if(success && JSON.stringify(latest.current[key])!==JSON.stringify(value)) {
    window.setTimeout(()=>void saveOne(key,latest.current[key]),300);
   }
  }
 }
 useEffect(()=>{
  if(!csrf||!pending.length)return;
  const timeout=window.setTimeout(()=>{
   for(const key of pending) if(!saving.current.has(key)) void saveOne(key,content[key]);
  },1200);
  return ()=>window.clearTimeout(timeout);
 },[content,saved,csrf,pending.join(',')]);
 async function saveAll(){for(const key of pending)await saveOne(key,content[key]);}
 function changeSection(value:CMSContent[SectionKey]){setContent(old=>({...old,[section]:value}));setStatus('Unsaved changes…')}
 if(initializing)return <div className="cms-app cms-center"><LoaderCircle className="cms-spin"/> Checking administrator session…</div>;
 if(!csrf)return <div className="cms-app cms-login-shell"><div className="cms-login"><span className="cms-logo">JM</span><p className="cms-overline">JUARAMETACORP / ADMIN</p><h1>Welcome back.</h1><p>Sign in to manage your website content securely.</p><form onSubmit={signIn}><label className="cms-field"><span>Administrator password</span><input autoFocus type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Enter your password"/></label>{error&&<p className="cms-error" role="alert">{error}</p>}<button className="cms-btn cms-btn-primary cms-login-button" disabled={busy}>{busy?<LoaderCircle className="cms-spin" size={18}/>:<Lock size={18}/>} Sign in</button></form><Link to="/" className="cms-back"><ArrowLeft size={16}/> Back to website</Link></div></div>;
 return <div className="cms-app cms-layout"><aside className={`cms-sidebar ${mobileNav?'cms-sidebar-open':''}`}><div className="cms-logo-line"><span className="cms-logo">JM</span><div><b>JuaraMetaCorp</b><small>Content Studio</small></div></div><div className="cms-side-label">CONTENT MANAGEMENT</div><nav className="cms-nav">{tabs.map(tab=><button type="button" key={tab.key} onClick={()=>{setSection(tab.key);setMobileNav(false)}} className={section===tab.key?'selected':''}><span>{tab.icon}</span> {tab.label}{pending.includes(tab.key)&&<span className="cms-dot"/>}</button>)}</nav><div className="cms-side-bottom"><Link to="/" target="_blank"><ExternalLink size={16}/> View live website</Link><button type="button" onClick={logout}><LogOut size={16}/> Sign out</button></div></aside>
  <div className="cms-main"><header className="cms-header"><button type="button" className="cms-mobile-trigger" onClick={()=>setMobileNav(!mobileNav)}>Sections <ChevronDown size={16}/></button><div><div className="cms-overline">CONTENT DASHBOARD</div><h1>{tabs.find(t=>t.key===section)?.label}</h1></div><div className="cms-header-actions"><span className="cms-save-label"><Check size={15}/>{status}</span><button disabled={!pending.length} type="button" onClick={()=>void saveAll()} className="cms-btn cms-btn-primary"><Save size={16}/> Save now</button></div></header>
   <main className="cms-content"><div className="cms-intro"><div><h2>Edit {tabs.find(t=>t.key===section)?.label}</h2><p>Changes save automatically after you stop typing. Drag the handle to reorder collections.</p></div><span className="cms-live"><span/> LIVE CONTENT</span></div>{error&&<div className="cms-alert" role="alert">{error}</div>}<div className="cms-panel" key={section}><Editor section={section} content={content} setSection={changeSection} csrf={csrf}/></div><p className="cms-bottom-note"><ShieldCheck size={16}/> On Vercel, content and images are stored permanently in Supabase. Keep regular Supabase backups.</p></main>
  </div>
 </div>;
}
