import fs from 'node:fs';
const assets = {};
const publicFiles = [['index.html','text/html'],['styles.css','text/css'],['app.js','text/javascript'],['experience.css','text/css']];
for (const [file,type] of publicFiles) assets['/'+file] = {body:fs.readFileSync('dist/'+file,'utf8'),type:type+'; charset=utf-8'};
assets['/index.html'].body = assets['/index.html'].body.replaceAll('src="mccia-logo.png"', 'src="data:image/png;base64,' + fs.readFileSync('dist/mccia-logo.png').toString('base64') + '"');
// Vercel serves only these public assets, never Worker code or database metadata.
fs.mkdirSync('dist/client',{recursive:true});
for (const file of [...publicFiles.map(([file])=>file), 'mccia-logo.png']) {
  fs.copyFileSync('dist/'+file,'dist/client/'+file);
}
// Preserve the existing Cloudflare/Sites application and its booking database.
fs.cpSync('dist/trailers','dist/client/trailers',{recursive:true});
fs.mkdirSync('dist/server',{recursive:true});
fs.mkdirSync('dist/.openai',{recursive:true});
fs.writeFileSync('dist/server/index.js','const assets = '+JSON.stringify(assets)+';\n'+fs.readFileSync('server/worker.js','utf8'));
fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
if(fs.existsSync('drizzle'))fs.cpSync('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Built public assets in dist/client and Cloudflare booking API in dist/server.');
