import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultContent } from './defaultContent';
import type { CMSContent } from './schema';
import { requestJson } from '../lib/http';
const ContentContext = createContext<CMSContent>(defaultContent);
export const useContent = () => useContext(ContentContext);
export function ContentProvider({children}:{children:ReactNode}) {
  const [content,setContent] = useState<CMSContent>(defaultContent);
  useEffect(()=>{
    let alive = true;
    const refresh=()=>requestJson<CMSContent>('/api/content').then(data=>{if(alive)setContent(data)}).catch(()=>{/* Leave last known/default content visible if API is temporarily down. */});
    refresh();
    const t=window.setInterval(refresh,30000);
    window.addEventListener('focus',refresh);
    return ()=>{alive=false;window.clearInterval(t);window.removeEventListener('focus',refresh)};
  },[]);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
