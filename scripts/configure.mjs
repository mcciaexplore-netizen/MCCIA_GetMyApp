import fs from 'node:fs';
const p='.openai/hosting.json';const c=JSON.parse(fs.readFileSync(p,'utf8'));c.d1='DB';fs.writeFileSync(p,JSON.stringify(c,null,2));
