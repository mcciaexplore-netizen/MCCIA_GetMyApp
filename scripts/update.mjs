import fs from 'node:fs';
const file='dist/app.js';
let s=fs.readFileSync(file,'utf8');
s=s.slice(0,s.indexOf('function availableDays()'));
s=s.replace('See it in action','Build it for your business').replace('Choose a day and time to explore ${a.name} with MCCIA Applied AI Studio.','Book a one-hour app-development session for ${a.name} with MCCIA Applied AI Studio.');
fs.writeFileSync(file,s);
const h=JSON.parse(fs.readFileSync('.openai/hosting.json','utf8'));delete h.static;h.d1={binding:'DB'};h.r2=null;fs.writeFileSync('.openai/hosting.json',JSON.stringify(h,null,2));
