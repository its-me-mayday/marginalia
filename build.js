const fs=require('fs');
const js=['core','levels','game','render','ui'].map(f=>fs.readFileSync(__dirname+'/src/'+f+'.js','utf8')).join('\n');

const FD=__dirname+'/fonts/';
const face=(f,style)=>`@font-face{font-family:"EB Garamond";font-style:${style};font-weight:500;font-display:block;src:url(data:font/woff2;base64,${fs.readFileSync(FD+f).toString('base64')}) format("woff2")}`;
// EB Garamond — SIL Open Font License 1.1
const fonts=face('eb-garamond-latin-500-normal.woff2','normal')+'\n'+face('eb-garamond-latin-500-italic.woff2','italic');
fs.writeFileSync(__dirname+'/index.html',fs.readFileSync(__dirname+'/index.tpl.html','utf8').replace('/*__FONTS__*/',()=>fonts).replace('/*__JS__*/',()=>js));
console.log('built',(fs.statSync(__dirname+'/index.html').size/1024).toFixed(1)+'KB');
