/** Edit the official contact channels here when approved. No fabricated addresses or numbers. */
export const COMPANY = {
  name: 'JuaraMetaCorp',
  slogan: 'Own the Future.',
  email: 'juarametacorp@gmail.com',
  // Enter the verified, official profile URL only. Never guess a social handle.
  instagramUrl: '',
  whatsappNumber: '',
  office: { lines: [] as string[], mapsQuery: '' },
  hours: '',
  social: [] as Array<{label:string;href:string}>,
};
export const mailtoHref = COMPANY.email ? `mailto:${COMPANY.email}` : '';
export const whatsappHref = COMPANY.whatsappNumber ? `https://wa.me/${COMPANY.whatsappNumber.replace(/\D/g,'')}` : '';
export const mapsHref = COMPANY.office.mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(COMPANY.office.mapsQuery)}` : '';
