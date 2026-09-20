export const palettes={
  garden:{label:'Botanical',accent:'#f2cf59',mint:'#8ec9bb',peach:'#f8ca9d',sage:'#c5d7c0',teal:'#20555a'},
  sunset:{label:'Sunset',accent:'#fb8e7e',mint:'#e4b5a2',peach:'#f8ca9d',sage:'#e2ccbd',teal:'#663f48'},
  ocean:{label:'Ocean',accent:'#8fd8eb',mint:'#a0d4d5',peach:'#e3c9a4',sage:'#c4dbe0',teal:'#234d67'},
  lavender:{label:'Lavender',accent:'#ceb9f0',mint:'#b8d5c5',peach:'#edc9d5',sage:'#d4cee3',teal:'#514569'}
};
export function cleanAppearance(value={}){
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Check appearance settings.');
  const out={palette:value.palette??'garden',mode:value.mode??'day',accent:value.accent??'',fit:value.fit??'cover',textSize:value.textSize??'standard'};
  if(!Object.hasOwn(palettes,out.palette)||!['day','night','system'].includes(out.mode)||!['cover','contain'].includes(out.fit)||!['standard','large'].includes(out.textSize)||typeof out.accent!=='string'||out.accent!==''&&!/^#[0-9a-f]{6}$/i.test(out.accent))throw Error('Choose a valid colour, display mode and media fit.');
  return out;
}
export function accentInk(hex){const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);const l=.2126*c[0]+.7152*c[1]+.0722*c[2];return l>.179?'#111111':'#ffffff';}
export function checkMedia(file,kind){
  const image=['image/jpeg','image/png','image/webp'],video=['video/mp4','video/webm','video/quicktime'];
  if(!file||file.size===0||!(kind==='avatar'?image:[...image,...video]).includes(file.type))throw Error(kind==='avatar'?'Choose a JPG, PNG or WebP portrait.':'Choose a JPG, PNG, WebP, MP4, WebM or MOV file.');
  const limit=file.type.startsWith('video/')?40:8;
  if(file.size>limit*1024*1024)throw Error('Choose a '+(limit===40?'video up to 40 MB.':'photo up to 8 MB.'));
  return file.type.startsWith('video/')?'video':'image';
}
