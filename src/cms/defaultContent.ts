import type { CMSContent } from './schema.js';
export const defaultContent: CMSContent = {
  hero:{eyebrow:'Creative Technology Studio',headline:'JuaraMetaCorp',tagline:'Immersive Digital Experiences',description:'We build metaverse worlds, virtual environments, websites, applications, and interactive digital experiences for education, businesses, entrepreneurs, and public institutions.',primaryLabel:'Start Project',primaryHref:'/contact',secondaryLabel:'Explore Products',secondaryHref:'/product',image:''},
  about:{description:'We bring creativity, digital innovation, and immersive experiences together to shape new possibilities.',vision:'To be a leading creative technology company delivering immersive digital worlds for Indonesia and beyond.',mission:'<ul><li>Deliver high-quality metaverse worlds, virtual environments, and interactive digital experiences.</li><li>Help education, businesses, small enterprises, and public institutions benefit from creative technology.</li><li>Build relevant, intuitive solutions that create meaningful value for the people using them.</li></ul>'},
  products:[
    {id:'rumah-adat-lampung',title:'Rumah Adat Lampung 360',subtitle:'Explore heritage beyond boundaries',category:'360° VIRTUAL TOUR',description:'An interactive 360° experience that lets visitors explore Lampung traditional architecture and discover cultural heritage virtually.',image:'/images/projects/rumah-adat-lampung-concept.svg',technologies:['360 Virtual Tour','Three.js','WebGL','Interactive Experience'],link:'https://drive.google.com/file/d/1TyoLyvYYS73jeJcCYg5vKFSajrLSRwE4/view?usp=drive_link',order:0},
    {id:'metaschool-smkn-4',title:'MetaSchool SMKN 4 Bandar Lampung',subtitle:'A new world of learning',category:'VIRTUAL CAMPUS',description:'An interactive virtual school campus supporting learning and school discovery through immersive 3D exploration and multiplayer interaction.',image:'/images/projects/metaschool-concept.svg',technologies:['Roblox','3D Environment','Multiplayer','Educational Experience'],link:'',order:1},
    {id:'smk-al-kautsar',title:'SMK Al Kautsar — Roblox Experience',subtitle:'Explore the experience on Roblox',category:'ROBLOX EXPERIENCE',description:'Visit the published Roblox experience shared for SMK Al Kautsar.',image:'/images/projects/future-concept.svg',technologies:['Roblox','Interactive Experience','3D World'],link:'https://www.roblox.com/share?code=6eaf53e5e55baa488f57438bc19448c7&type=ExperienceDetails&stamp=1790613151879',order:2}
  ],
  partners:[
    {id:'ptba',name:'PT Bukit Asam Tbk',logo:'https://www.ptba.co.id/content/themes/ptba/assets/img/PTBA-logo.svg',website:'https://www.ptba.co.id/',category:'Enterprise',order:0},
    {id:'smkn4',name:'SMKN 4 Bandar Lampung',logo:'https://file.data.kemendikdasmen.go.id/sekolahkita/10/1080/10807215-7.jpg',website:'https://www.smkn4-bdl.sch.id/',category:'Education',order:1},
    {id:'stkip',name:'STKIP PGRI Bandar Lampung',logo:'https://i.imgur.com/LdbtroH.jpeg',website:'https://stkippgribl.ac.id/',category:'Education',order:2},
    {id:'uti',name:'Universitas Teknokrat Indonesia',logo:'https://cdn.annibuku.com/uploads/logo-kampus/7403-universitas-teknokrat-indonesia.png',website:'https://teknokrat.ac.id/',category:'Education',order:3}
  ],
  leadership:[
    {id:'qadhli',name:'Qadhli Jafar Adrian, B.M.M., M.I.T',role:'Board of Directors',bio:'',photo:'/images/team/qadhli-jafar-adrian.png',group:'board',order:0},
    {id:'yuri',name:'Yuri Rahmanto, M.Kom',role:'Board of Directors',bio:'',photo:'/images/team/yuri-rahmanto.png',group:'board',order:1},
    {id:'ryan',name:'Dr. Ryan Randy Suryono, M.Kom',role:'Board of Directors',bio:'',photo:'/images/team/ryan-randy-suryono.png',group:'board',order:2},
    {id:'risma',name:'Risma Oktaviani',role:'Chief Executive Officer',bio:'',photo:'/images/team/risma-oktaviani.png',group:'ceo',order:3},
    {id:'rahman',name:'Muhammad Rahman',role:'Project Manager',bio:'',photo:'/images/team/muhammad-rahman.png',group:'management',order:4},
    {id:'sarina',name:'Sarina Septia',role:'Finance & Admin',bio:'',photo:'/images/team/sarina-septia.png',group:'management',order:5},
    {id:'jois',name:'Jois Romauli Simarmata',role:'Creative Content & Marketing',bio:'',photo:'/images/team/jois-romauli-simarmata.png',group:'management',order:6}
  ],
  contact:{email:'juarametacorp@gmail.com',phone:'',address:'',mapsUrl:'',instagram:'',linkedin:'',website:''},
  footer:{description:'Immersive digital experiences for education, businesses, and a world that keeps evolving.',copyright:'JuaraMetaCorp. All rights reserved.',tagline:'Own the Future.',socialLinks:[]}
};
