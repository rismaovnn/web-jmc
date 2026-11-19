export type SectionKey = 'hero'|'about'|'products'|'partners'|'leadership'|'contact'|'footer';
export type Product = { id:string; title:string; subtitle:string; category:string; description:string; image:string; technologies:string[]; link:string; order:number };
export type Partner = { id:string; name:string; logo:string; category:string; website:string; order:number };
export type Leader = { id:string; name:string; role:string; bio:string; photo:string; group:'board'|'ceo'|'management'; order:number };
export type CMSContent = {
 hero:{eyebrow:string; headline:string; tagline:string; description:string; primaryLabel:string; primaryHref:string; secondaryLabel:string; secondaryHref:string; image:string};
 about:{description:string; vision:string; mission:string};
 products:Product[];
 partners:Partner[];
 leadership:Leader[];
 contact:{email:string; phone:string; address:string; mapsUrl:string; instagram:string; linkedin:string; website:string};
 footer:{description:string; copyright:string; tagline:string; socialLinks:{label:string;url:string}[]};
};
