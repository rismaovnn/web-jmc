import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultContent } from './defaultContent';
import type { CMSContent } from './schema';
const ContentContext = createContext<CMSContent>(defaultContent);
export const useContent = () => useContext(ContentContext);
export function ContentProvider({children}:{children:ReactNode}) {
  const [content,setContent] = useState<CMSContent>(defaultContent);
  useEffect(()=>{
    let alive = true;
    const refresh=()=>fetch('/api/content',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(alive)setContent(data)}).catch(()=>{});
    refresh();
    const t=window.setInterval(refresh,30000);
    window.addEventListener('focus',refresh);
    return ()=>{alive=false;window.clearInterval(t);window.removeEventListener('focus',refresh)};
  },[]);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
