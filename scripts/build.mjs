import fs from 'node:fs';
const assets = {};
for (const [file,type] of [['index.html','text/html'],['styles.css','text/css'],['app.js','text/javascript']]) assets['/'+file] = {body:fs.readFileSync('dist/'+file,'utf8'),type:type+'; charset=utf-8'};
fs.mkdirSync('dist/server',{recursive:true});
fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const assets = '+JSON.stringify(assets)+';\n'+fs.readFileSync('server/worker.js','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
if(fs.existsSync('drizzle'))fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Built MCCIA application and booking API.');
