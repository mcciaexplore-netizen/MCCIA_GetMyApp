const apps = [
{id:'dispatch-flow',name:'Dispatch Flow',title:'Dispatch<br>Flow',category:'Operations / Logistics',tagline:'Receipt & Delivery Tracker',audience:'Manufacturers, traders & distributors',features:['Scan receipts with phone camera','Auto-generate delivery slips as PDF','Track dispatch history & status','Export daily dispatch reports'],description:'Keep receipts, deliveries and dispatch records together. Turn a receipt into a delivery slip and follow your dispatches from one place.',bg:'#173d46',ink:'#b9eee0',symbol:'↗',label:'KEEP BUSINESS MOVING'},
{id:'tendersetu',name:'TenderSetu',title:'Tender<br>Setu',category:'Business Development',tagline:'Government Tender Finder',audience:'MSMEs bidding for government work',features:['Search tenders by keyword & state','AI matches tenders to your business','One-click alerts for new tenders','Download bid documents instantly'],description:'Discover government tenders that fit your business. Search opportunities, find relevant matches and get the documents you need to take the next step.',bg:'#ded5f5',ink:'#473471',symbol:'⌕',label:'YOUR NEXT OPPORTUNITY'},
{id:'gst-reconciliation',name:'GST Reconciliation',title:'GST.<br>Matched.',category:'Finance & Accounts',tagline:'2B vs Purchase Register Matcher',audience:'Accountants, finance teams, MSMEs',features:['Upload GSTR-2B & purchase register','Auto-match invoices, flag mismatches','Summary of missing / extra credits','Export clean report for CA / filing'],description:'Compare your GSTR-2B with your purchase register. Find invoice mismatches and missing or extra credits, then export a clear report for your accountant.',bg:'#213b6a',ink:'#cadfff',symbol:'≡',label:'MAKE EVERY INVOICE COUNT'},
{id:'card-scanner',name:'Card Scanner',title:'Meet.<br>Scan.<br>Connect.',category:'Sales & Networking',tagline:'Business Card to Digital Contact',audience:'Sales teams, event attendees',features:['Click photo of any business card','AI extracts name, phone & email','Save to contacts or export CSV','Build lead list from events in seconds'],description:'Turn a business card into a useful digital contact. Capture contact details from a photo and build a lead list after meetings and events.',bg:'#efbba4',ink:'#653626',symbol:'+',label:'CONNECTIONS THAT STAY'},
{id:'social-media-planner',name:'Social Media Planner',title:'A month.<br>All<br>planned.',category:'Marketing',tagline:'AI Content Calendar for Your Brand',audience:'Business owners & marketing teams',features:['Generate a 30-day content plan','Platform-specific captions (Insta, LinkedIn)','Hashtag suggestions included','Download full plan as editable doc'],description:'Plan your brand’s next month of social content. Create a content calendar with captions for each platform and hashtag suggestions, ready to edit and use.',bg:'#e9c858',ink:'#504018',symbol:'✳',label:'SHOW UP. STAND OUT.'},
{id:'digital-profile-creator',name:'Digital Profile Creator',title:'Your work.<br>Your<br>world.',category:'Personal Branding',tagline:'Your AI-Powered Bio & Portfolio Page',audience:'Freelancers, consultants, MSME owners',features:['Fill a simple form — get a live webpage','Add products, services & contact info','Share via QR code or short link','Update content anytime'],description:'Bring your bio, work and business information together on a shareable webpage. Introduce your products and services with a profile you can keep up to date.',bg:'#3659a0',ink:'#e0e8ff',symbol:'↗',label:'MAKE YOUR MARK'},
{id:'mr-wasooli',name:'Payment Followup Agent',title:'Payment<br>Followup<br>Agent',category:'Finance / Collections',tagline:'AI Payment Recovery Follow-up Agent',audience:'Any business with outstanding payments',features:['Upload pending invoice list via CSV','AI drafts polite payment reminders','Tracks follow-up dates & responses','Multi-channel: email, WhatsApp, SMS'],description:'Give payment follow-ups a consistent routine. Turn your pending invoice list into polite reminders and keep track of follow-up dates and responses.',bg:'#bddac6',ink:'#234b39',symbol:'₹',label:'FOLLOW UP. MOVE FORWARD.'},
{id:'hr-studio',name:'HR Studio',title:'People<br>first.<br>Paperwork<br>second.',category:'Human Resources',tagline:'HR Document Generator',audience:'HR managers & growing businesses',features:['Generate offer letters in one click','Create employee ID cards & certificates','Bulk generate from employee CSV','Download print-ready PDFs instantly'],description:'Create everyday HR documents with less repetitive work. Generate offer letters, employee ID cards and certificates, individually or in bulk.',bg:'#643b50',ink:'#f5cfda',symbol:'+',label:'MORE TIME FOR YOUR PEOPLE'},
{id:'stocklist',name:'Stocklist',title:'Stock.<br>Sorted.',category:'Operations / Inventory',tagline:'Inventory & Reorder Manager',audience:'Retailers, wholesalers, manufacturers',features:['Upload product list with quantities','AI flags low-stock & slow-moving items','Automatic reorder quantity suggestions','Export purchase order draft to Excel'],description:'Get a clearer view of what is on your shelves. Identify low stock and slow-moving products, review reorder suggestions and prepare a purchase order draft.',bg:'#c8d8e9',ink:'#304e68',symbol:'≡',label:'KNOW WHAT COMES NEXT'},
{id:'minicrm',name:'MiniCRM',title:'Small team.<br>Big<br>possibilities.',category:'Sales & CRM',tagline:'Lightweight Lead & Sales Tracker',audience:'Small sales teams & solo entrepreneurs',features:['Add leads, notes & next follow-up date','Visual pipeline: New → Won / Lost','WhatsApp reminders before follow-up','No setup, no IT team — start in 2 min'],description:'Keep your leads and next steps in view. Track conversations, follow-up dates and sales progress in a lightweight pipeline built for small teams.',bg:'#c6573b',ink:'#ffe4c2',symbol:'↗',label:'KEEP THE CONVERSATION GOING'},
{"id":"compliance-calender","name":"Compliance Calender","title":"Stay<br>ahead.<br>Stay ready.","category":"Compliance","tagline":"Your MSME Compliance Schedule","audience":"MSME owners, compliance teams & finance teams","features":["Create a personalized compliance schedule","Track statutory deadlines and receive reminders","Store filing documents in one place","Stay on top of obligations to help prevent penalties"],"description":"Create a personalized compliance schedule for your MSME. Track statutory deadlines, receive reminders and store filing documents to help keep obligations on track and prevent penalties.","bg":"#284b69","ink":"#d2ebff","symbol":"✓","label":"YOUR DEADLINES. IN VIEW."},
{"id":"yojanasetu","name":"YojanaSetu","title":"Find your<br>next<br>advantage.","category":"Business Development","tagline":"Government Schemes & Incentives Finder","audience":"MSME owners & business development teams","features":["Match your business profile with relevant schemes","Discover government subsidies and incentives","Review eligibility, required documents and deadlines","Find official application links"],"description":"Match your MSME’s business profile with relevant government schemes, subsidies and incentives. Review eligibility, required documents and deadlines, then follow official links to apply.","bg":"#f0d69b","ink":"#655020","symbol":"↗","label":"OPPORTUNITIES THAT FIT"},
{"id":"hisabtalk-ai","name":"HisabTalk AI","title":"Ask.<br>Find.<br>Know.","category":"Knowledge Management","tagline":"Answers From Your Company Documents","audience":"Business owners & teams working with company documents","features":["Search across company spreadsheets, PDFs and slide decks","Ask questions and get direct answers","Trace answers to the exact source document","Receive the referenced document as an attachment"],"description":"Search across your company’s spreadsheets, PDFs and slide decks to get direct answers backed by the exact source document. HisabTalk AI also attaches the document it referred to, so you can review the source.","bg":"#4c386b","ink":"#ecdcff","symbol":"⌕","label":"ANSWERS. WITH THE SOURCE."},
{"id":"review-desk","name":"Review Desk","title":"See the<br>change.<br>Know the<br>impact.","category":"Engineering & Quality","tagline":"Engineering Revision & Impact Review","audience":"Engineering, manufacturing & quality teams","features":["Compare old and new drawings, specifications, BOMs and controlled documents","Identify changes between document revisions","Assess impact on manufacturing, quality, inspection, inventory and related processes","Generate review actions before releasing the new revision"],"description":"Compare old and new engineering drawings, specifications, BOMs and controlled documents to identify what changed. Assess the impact on manufacturing, quality, inspection, inventory and related processes, and generate review actions before the new revision is released.","bg":"#bddbd8","ink":"#265956","symbol":"≠","label":"REVIEW BEFORE RELEASE"},
{"id":"production-saathi","name":"Production Saathi","title":"Plan it.<br>Make it.<br>Deliver.","category":"Operations / Production","tagline":"Production Capacity & Delivery Planner","audience":"Manufacturers, production planners & operations teams","features":["Check whether customer delivery dates are realistic","Analyze capacity, machines, materials, shifts, existing jobs and constraints","Identify bottlenecks and recommend alternative production plans","Dynamically reschedule work when disruptions occur"],"description":"Check whether customer orders can realistically be delivered on time by analyzing production capacity, machines, materials, shifts, existing jobs and operational constraints. Identify bottlenecks, consider alternative production plans and dynamically reschedule work when disruptions occur.","bg":"#a64331","ink":"#ffe1c1","symbol":"↗","label":"TURN PLANS INTO PROGRESS"}
];
const root=document.getElementById('app');
let selectedDate=null,selectedSlot=null,selectionSaved=false;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function poster(a){return `<div class="poster" style="--bg:${a.bg};--ink:${a.ink}" aria-hidden="true"><div class="poster-inner"><div class="poster-lines"></div><div class="poster-top"><span>APPLIED AI STUDIO</span></div><div class="poster-title"${['hr-studio','review-desk','mr-wasooli'].includes(a.id)?' style="font-size:25px"':''}>${a.title}</div><div class="poster-subtitle">${a.tagline}</div><div class="poster-shape"></div><div class="poster-symbol">${a.symbol}</div></div><div class="poster-strip"><span>✦</span> ${a.label}</div></div>`}
const applicationDomains = {
 'dispatch-flow':'Operations','stocklist':'Operations','tendersetu':'Business Development',
 'gst-reconciliation':'Finance','mr-wasooli':'Finance','card-scanner':'Sales','minicrm':'Sales',
 'social-media-planner':'Marketing','digital-profile-creator':'Personal Branding','hr-studio':'Human Resources',
 'compliance-calender':'Compliance','yojanasetu':'Business Development','hisabtalk-ai':'Knowledge Management','review-desk':'Engineering & Quality','production-saathi':'Operations'
};
function catalog(selectedDomain='All'){
 document.title='Explore applications | MCCIA AI Studio';
 const domains=['All',...new Set(apps.map(a=>applicationDomains[a.id]))];
 const visibleApps=selectedDomain==='All'?apps:apps.filter(a=>applicationDomains[a.id]===selectedDomain);
 root.innerHTML=`<div class="container"><div class="intro"><div><div class="eyebrow">MCCIA APPLIED AI STUDIO</div><h1>Small business. Meet big possibilities.</h1><p>Discover practical AI applications built for the way you work.</p></div><div class="collection-count" role="status"><b>${visibleApps.length} ${visibleApps.length===1?'application':'applications'}</b> to explore</div></div><div class="domain-filters" role="group" aria-label="Filter applications by domain">${domains.map(domain=>`<button type="button" class="domain-filter ${domain===selectedDomain?'selected':''}" data-domain="${domain}" aria-pressed="${domain===selectedDomain}">${domain}</button>`).join('')}</div><div class="grid">${visibleApps.map(a=>`<a class="card" href="#/apps/${a.id}" aria-label="View ${a.name} details">${poster(a)}<h2>${a.name}</h2><p class="category">${a.category}</p><p>${a.tagline}</p></a>`).join('')}</div><div class="catalog-note"><span class="note-icon" aria-hidden="true">✧</span><div><strong>Find the right AI application for your business.</strong><p>Explore an application to see what it does, who it’s for, and choose a session with the studio.</p></div></div></div>`;
 root.querySelectorAll('[data-domain]').forEach(button=>button.onclick=()=>{catalog(button.dataset.domain);root.querySelector('[data-domain="'+button.dataset.domain+'"]')?.focus({preventScroll:true});});
}
function landing(){document.title='Your next big move | MCCIA AI Studio';root.innerHTML=`<section class="landing"><div class="landing-grid"></div><div class="orb orb-one"></div><div class="orb orb-two"></div><div class="landing-topline"><span>THE MCCIA APPLIED AI STUDIO</span></div><div class="landing-copy"><h1>Less busywork.<br>More <span>possibility.</span></h1><p>${apps.length} practical AI applications.<br>One big leap for your business.</p></div><div class="card-universe" aria-hidden="true">${[apps[0],apps[4],apps[8]].map((a,i)=>`<div class="floating-card float-${i}">${poster(a)}</div>`).join('')}<div class="orbit-label">${apps.length} APPLICATIONS<br><strong>Endless possibilities.</strong></div></div><div class="landing-action"><a class="primary landing-cta" href="#/apps">Find your application <span>↗</span></a><div class="landing-caption">EXPLORE IT. MAKE IT YOURS. BUILD WHAT’S NEXT.</div></div><div class="landing-bottom"><span>FROM EVERYDAY CHALLENGES</span><div class="ticker"><div>OPERATIONS &nbsp; ✳ &nbsp; FINANCE &nbsp; ✳ &nbsp; MARKETING &nbsp; ✳ &nbsp; SALES &nbsp; ✳ &nbsp; PEOPLE &nbsp; ✳ &nbsp; OPERATIONS &nbsp; ✳ &nbsp; FINANCE &nbsp; ✳ &nbsp; MARKETING &nbsp; ✳ &nbsp; SALES &nbsp; ✳ &nbsp; PEOPLE</div></div><span>TO EXTRAORDINARY PROGRESS ↗</span></div></section>`;}
const trailers = {
 'hisabtalk-ai':'hisabtalk-ai.mp4', 'stocklist':'stocklist.mp4',
 'review-desk':'review-desk.mp4', 'production-saathi':'production-saathi.mp4',
 'minicrm':'minicrm.mp4', 'mr-wasooli':'payment-followup-agent.mp4', 'hr-studio':'hr-studio.mp4'
};
function openTrailer(a){
 const dialog=document.createElement('dialog');
 dialog.className='trailer-dialog';
 dialog.setAttribute('aria-labelledby','trailer-heading');
 dialog.innerHTML=`<div class="trailer-heading"><div><small>APPLICATION TRAILER</small><h2 id="trailer-heading">${esc(a.name)}</h2></div><button type="button" class="trailer-close" aria-label="Close trailer">×</button></div><video controls playsinline preload="metadata" aria-label="${esc(a.name)} trailer"><source src="/trailers/${trailers[a.id]}" type="video/mp4">Your browser does not support this video.</video><p class="trailer-error" role="status"></p>`;
 document.body.append(dialog);
 const video=dialog.querySelector('video');
 const previousOverflow=document.body.style.overflow;
 document.body.style.overflow='hidden';
 const onRoute=()=>dialog.close();
 window.addEventListener('hashchange',onRoute);
 dialog.addEventListener('close',()=>{video.pause();video.removeAttribute('src');video.querySelector('source').removeAttribute('src');video.load();document.body.style.overflow=previousOverflow;window.removeEventListener('hashchange',onRoute);dialog.remove();},{once:true});
 dialog.querySelector('.trailer-close').onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
 const error=()=>{dialog.querySelector('.trailer-error').textContent='This trailer could not be played. Please try again later.';};
 video.addEventListener('error',error);video.querySelector('source').addEventListener('error',error);
 dialog.showModal();
 video.play().catch(()=>{if(!video.error)dialog.querySelector('.trailer-error').textContent='Press play to watch the trailer.';});
}
function detail(a){document.title=`${a.name} | MCCIA AI Studio`;root.innerHTML=`<div class="container" style="padding-top:20px;padding-bottom:0"><div class="breadcrumb"><a href="#/">Applications</a><span>/</span><span>${a.name}</span></div></div><section class="detail-hero" style="--hero-accent:${a.ink}"><div class="hero-inner"><div class="detail-poster">${poster(a)}</div><div class="detail-copy"><div class="eyebrow">${a.category}</div><h1>${a.name}</h1><p class="detail-tagline">${a.tagline}</p><div class="audience-box"><small>BUILT FOR</small><strong>${a.audience}</strong></div><p class="detail-meta">AI-powered &nbsp; · &nbsp; Built for MSMEs &nbsp; · &nbsp; MCCIA, Pune</p><div class="detail-actions"><a href="#/apps/${a.id}/book" class="primary">Book here <span aria-hidden="true">→</span></a>${trailers[a.id]?'<button type="button" class="trailer-button" id="watch-trailer"><span aria-hidden="true">▶</span> Trailer</button>':''}</div></div></div></section><div class="container detail-body"><section><h2>About the application</h2><p>${a.description}</p><h2 style="margin-top:32px">What you can do</h2><ul class="features">${a.features.map(f=>`<li><span class="check" aria-hidden="true">✓</span>${f}</li>`).join('')}</ul></section><aside class="side-note"><div class="eyebrow">LET’S MAKE AI WORK FOR YOU</div><h3>Build it for your business</h3><p>Book a one-hour app-development session for ${a.name} with MCCIA Applied AI Studio.</p></aside></div>`;root.querySelector('#watch-trailer')?.addEventListener('click',()=>openTrailer(a));}
const appSchedule={
 'dispatch-flow':[{date:'2026-09-28',slot:'11:00'},{date:'2026-10-06',slot:'14:30'}],
 'tendersetu':[{date:'2026-09-28',slot:'14:30'},{date:'2026-10-06',slot:'11:00'}],
 'gst-reconciliation':[{date:'2026-09-29',slot:'11:00'},{date:'2026-10-07',slot:'14:30'}],
 'card-scanner':[{date:'2026-09-29',slot:'14:30'},{date:'2026-10-07',slot:'11:00'}],
 'social-media-planner':[{date:'2026-09-29',slot:'15:30'},{date:'2026-10-05',slot:'11:00'}],
 'digital-profile-creator':[{date:'2026-09-30',slot:'11:00'},{date:'2026-10-08',slot:'14:30'}],
 'mr-wasooli':[{date:'2026-09-30',slot:'14:30'},{date:'2026-10-08',slot:'11:00'}],
 'hr-studio':[{date:'2026-10-01',slot:'11:00'},{date:'2026-10-05',slot:'15:30'}],
 'stocklist':[{date:'2026-10-01',slot:'14:30'},{date:'2026-10-07',slot:'15:30'}],
 'minicrm':[{date:'2026-10-01',slot:'15:30'},{date:'2026-10-09',slot:'11:00'}],
 'compliance-calender':[{date:'2026-10-09',slot:'14:30'}],
 'yojanasetu':[{date:'2026-10-09',slot:'15:30'}],
 'hisabtalk-ai':[{date:'2026-10-03',slot:'11:00'},{date:'2026-10-06',slot:'15:30'}],
 'review-desk':[{date:'2026-10-03',slot:'14:30'},{date:'2026-10-08',slot:'15:30'}],
 'production-saathi':[{date:'2026-10-03',slot:'15:30'},{date:'2026-10-05',slot:'14:30'}]
};
const eventDates=[...new Set(Object.values(appSchedule).flat().map(({date})=>date))].sort();
const times=['11:00','14:30','15:30'];
let availabilityConfirmed=false;
const timeLabels={'11:00':'11:00 AM – 12:00 PM','14:30':'2:30 PM – 3:30 PM','15:30':'3:30 PM – 4:30 PM'};
const dateLabel=d=>new Date(d+'T12:00:00Z').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',timeZone:'Asia/Kolkata'});
let availability=[],schedule=[],loading=false,bookingError='',receipt=null,bookingBusy=false,requestNumber=0,week=0,activeApp=null;
let contact={name:'',phone:'',email:'',company:'',memberId:''};
const originalDetail=detail;
detail=function(a){originalDetail(a);root.querySelector('.breadcrumb a').href='#/apps';const hero=root.querySelector('.detail-hero');hero.style.setProperty('--app-bg',a.bg);hero.style.setProperty('--app-ink',a.ink);hero.insertAdjacentHTML('afterbegin','<div class="hero-mesh" aria-hidden="true"></div>');root.querySelector('.detail-copy').insertAdjacentHTML('beforeend','<div class="hero-promise"><span>01 · Explore the app</span><span>02 · Pick your slot</span><span>03 · Let’s build</span></div>');root.querySelector('.detail-meta').textContent='Made for your business. Built with the studio.';};

function slotSummary(a){return `<div class="session-chip"><span class="mini-icon" style="--bg:${a.bg};--ink:${a.ink}">${a.symbol}</span><div><strong>${a.name}</strong><small>${selectedDate?dateLabel(selectedDate):'App-development session'}${selectedSlot?' · '+timeLabels[selectedSlot]:' · 1 hour'} · IST</small></div></div>`}
function booking(a){activeApp=a;document.title=`Choose your slot | ${a.name}`;const days=schedule;root.innerHTML=`<div class="booking-shell"><div class="booking-title"><a class="back" href="#/apps/${a.id}">← ${a.name}</a><h1>A little time.<br class="mobile-break"> A big next step.</h1><p>Choose your one-hour app-development session.</p></div><div class="slot-workspace"><section><div class="section-heading"><h2>Pick a day</h2><span class="event-date-range">APPLICATION SCHEDULE</span></div><div class="dates">${days.map(d=>`<button class="date ${selectedDate===d.date?'selected':''}" data-day="${d.date}" aria-pressed="${selectedDate===d.date}" ${!d.active?'disabled':''}><span>${new Date(d.date+'T12:00Z').toLocaleDateString('en-IN',{weekday:'short'})}</span><strong>${Number(d.date.slice(-2))}</strong><span>${new Date(d.date+'T12:00Z').toLocaleDateString('en-IN',{month:'short'})}</span></button>`).join('')}</div>${loading&&!days.length?'<p role="status">Loading the studio schedule…</p>':''}<div class="section-heading"><h2>Make it your time</h2><span class="timezone">IST · 1 hour</span></div><div class="slots">${availability.filter(s=>s.visible!==false).map(t=>`<button class="slot ${selectedSlot===t.time?'selected':''}" data-time="${t.time}" ${!t.available||loading?'disabled':''} aria-pressed="${selectedSlot===t.time}"><span>${timeLabels[t.time]}</span><small>${selectedSlot===t.time?'✓ Selected':t.available?(availabilityConfirmed?'Available':'Scheduled'):'Unavailable'}</small></button>`).join('')}</div>${!selectedDate?'<p class="slot-hint">Select a day to reveal the available times.</p>':loading?'<p class="slot-hint" role="status">Checking available times…</p>':availability.length===0?'<p class="slot-hint">No sessions are displayed for this day.</p>':''}${bookingError?`<p class="error" role="alert">${esc(bookingError)} <button id="retry">Try again</button></p>`:''}</section><aside class="slot-aside"><div class="eyebrow">YOUR NEXT CHAPTER</div><h2>${a.name}</h2><p>${a.tagline}</p><div class="aside-orbit" aria-hidden="true">${a.symbol}</div><span>1 hour. Your business. Our studio.</span></aside></div><div class="booking-bottom"><div><strong>${selectedSlot?'Nice choice. Your slot is selected.':'Your next step starts here.'}</strong><small>${selectedSlot?dateLabel(selectedDate)+' · '+timeLabels[selectedSlot]+' IST':'Pick a day and time to continue.'}</small></div><a class="primary ${selectedSlot?'':'disabled-link'}" ${selectedSlot?`href="#/apps/${a.id}/details"`:'aria-disabled="true"'}>Continue <span>→</span></a></div></div>`;
root.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>loadDay(a,b.dataset.day));root.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{selectedSlot=b.dataset.time;booking(a);root.querySelector(`[data-time="${selectedSlot}"]`).focus()});root.querySelector('#retry')?.addEventListener('click',()=>loadSchedule(a));}
async function api(path,options={}){const r=await fetch('/api/'+path,options);let raw;try{raw=await r.text()}catch{throw Error('The booking service is not connected yet. Please contact the studio.')}let data;try{data=raw?JSON.parse(raw):null}catch{throw Error(`The booking service is not connected yet. Please contact the studio. (status ${r.status}: ${raw.slice(0,120)})`)}if(!r.ok)throw Error(data?.error||'Something went wrong. Please try again.');return data;}
function scheduledSlots(a,date){return (appSchedule[a.id]||[]).filter(s=>s.date===date).map(s=>({time:s.slot,visible:true,available:+new Date(date+'T'+s.slot+':00+05:30')>Date.now()}));}
async function loadSchedule(a){const n=++requestNumber;loading=true;availabilityConfirmed=false;bookingError='';schedule=(appSchedule[a.id]||[]).filter(({date})=>date>=new Date(Date.now()+19800000).toISOString().slice(0,10)).map(({date})=>({date,active:true}));selectedDate=schedule[0]?.date||null;availability=selectedDate?scheduledSlots(a,selectedDate):[];booking(a);try{const result=await api('schedule?appId='+encodeURIComponent(a.id));if(n!==requestNumber)return;schedule=result.days;selectedDate=schedule.find(d=>d.active)?.date||null;availability=selectedDate?scheduledSlots(a,selectedDate):[];}catch(e){if(n===requestNumber)bookingError='Showing the planned schedule. Live availability will be checked when the booking service connects.';}finally{if(n===requestNumber){loading=false;booking(a);if(selectedDate)loadDay(a,selectedDate);}}}
function pickDefaultSlot(list){return list.find(s=>s.visible!==false&&s.available)?.time||null}
async function loadDay(a,date){const n=++requestNumber;selectedDate=date;availabilityConfirmed=false;availability=scheduledSlots(a,date);selectedSlot=pickDefaultSlot(availability);loading=true;bookingError='';booking(a);try{const data=await api('availability?date='+date+'&appId='+encodeURIComponent(a.id));if(n===requestNumber){availability=data.slots;availabilityConfirmed=true;selectedSlot=pickDefaultSlot(availability);}}catch(e){if(n===requestNumber)bookingError='Planned slots shown. Live booking is currently unavailable; a selection is not a reservation.';}finally{if(n===requestNumber){loading=false;booking(a)}}}
function finalDetails(a){
 if(!selectedSlot||!selectedDate){location.hash=`#/apps/${a.id}/book`;return}
 document.title='One last step | MCCIA AI Studio';
 root.innerHTML=`<div class="final-shell"><div class="finish-header"><div class="finish-check">✓</div><div class="eyebrow">THE BIG DECISIONS ARE DONE</div><h1>One last step.<br><span>Then you’re ready.</span></h1><p>Add your details to reserve your session and create your downloadable session card.</p></div><div class="final-card">${slotSummary(a)}<a class="change-slot" href="#/apps/${a.id}/book">Change slot</a><form id="booking-form"><div class="form-grid"><label>Full name<input required minlength="2" maxlength="100" name="name" autocomplete="name" value="${esc(contact.name)}" placeholder="Your full name" ${bookingBusy?'disabled':''}></label><label>Phone number<input required type="tel" inputmode="tel" name="phone" autocomplete="tel" maxlength="25" value="${esc(contact.phone||'')}" placeholder="+91 98765 43210" ${bookingBusy?'disabled':''}></label><label class="full-width">Email address<input required type="email" maxlength="254" name="email" autocomplete="email" value="${esc(contact.email)}" placeholder="you@company.com" ${bookingBusy?'disabled':''}></label><label>Member ID<input required maxlength="50" name="memberId" autocomplete="off" value="${esc(contact.memberId||'')}" placeholder="Your MCCIA member ID" ${bookingBusy?'disabled':''}></label><label class="full-width">Company <span>(optional)</span><input maxlength="150" name="company" autocomplete="organization" value="${esc(contact.company)}" placeholder="Your company" ${bookingBusy?'disabled':''}></label></div>${bookingError?`<p class="error" role="alert">${esc(bookingError)}</p>`:''}<button class="primary" ${bookingBusy?'disabled':''}>${bookingBusy?'Reserving your session…':'Reserve my session'} <span>↗</span></button><p class="form-note">Submits your booking to the studio and creates your downloadable session card.</p></form></div></div>`;
 const form=root.querySelector('#booking-form');
 root.querySelectorAll('input').forEach(input=>input.oninput=()=>{contact[input.name]=input.value;input.setCustomValidity('')});
 form.onsubmit=async e=>{
  e.preventDefault();
  const phone=form.elements.phone;const digits=phone.value.replace(/\D/g,'');
  if(digits.length<7||digits.length>15||!/^\+?[\d\s().-]+$/.test(phone.value)){phone.setCustomValidity('Enter a valid phone number with 7–15 digits.');phone.reportValidity();return}
  if(!contact.name.trim()){form.elements.name.setCustomValidity('Enter your full name.');form.elements.name.reportValidity();return}
  if(!contact.memberId||!contact.memberId.trim()){form.elements.memberId.setCustomValidity('Enter your member ID.');form.elements.memberId.reportValidity();return}
  bookingBusy=true;bookingError='';finalDetails(a);
  try{
   const saved=await api('bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appId:a.id,date:selectedDate,slot:selectedSlot,name:contact.name.trim(),phone:contact.phone.trim(),email:contact.email.trim(),company:contact.company.trim(),memberId:contact.memberId.trim()})});
   receipt={id:saved.id,appId:saved.appId,appName:saved.appName,date:saved.date,slot:saved.slot,name:contact.name.trim(),phone:contact.phone.trim(),email:contact.email.trim(),company:contact.company.trim(),memberId:contact.memberId.trim()};
   bookingBusy=false;
   location.hash=`#/apps/${a.id}/confirmed`;
  }catch(err){bookingBusy=false;bookingError=err.message;finalDetails(a)}
 };
}
function cardFields(r){return [['Full name',r.name],['Phone number',r.phone],['Email address',r.email],['Member ID',r.memberId],...(r.company?[['Company',r.company]]:[]),['Application',r.appName],['Date',new Date(r.date+'T12:00Z').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'})],['Time',timeLabels[r.slot]+' IST']];}
// window.location.origin so this works unchanged in local dev, Vercel previews and production --
// never a hard-coded domain. The QR encodes only this public URL, nothing else.
function sessionUrl(bookingId){return `${location.origin}/#/session/${bookingId}`}
function qrDataUrl(url,cellSize=6,margin=24){
 try{if(typeof qrcode!=='function')return null;const qr=qrcode(0,'M');qr.addData(url);qr.make();return qr.createDataURL(cellSize,margin)}catch(e){return null}
}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('QR image failed to load'));img.src=src})}
function qrBlockHTML(url){
 let img='';
 try{if(typeof qrcode==='function'){const qr=qrcode(0,'M');qr.addData(url);qr.make();img=qr.createImgTag(6,24,'QR code linking to this session’s public progress page')}}catch(e){img=''}
 return `<div class="session-qr"><div class="eyebrow">SCAN TO VIEW YOUR SESSION</div>${img||'<p class="error" role="status">QR code unavailable right now. Use the View session link below instead.</p>'}<p>This code opens your session’s public progress page. It shows only your name, application, date, time and progress — never your phone, email or company.</p></div>`;
}
function confirmed(a){
 if(!receipt||receipt.appId!==a.id){location.hash='#/apps';return}
 document.title='Your session card | MCCIA AI Studio';
 root.innerHTML=`<div class="session-result"><div class="finish-header"><div class="finish-check">✓</div><h1>Your session is reserved.</h1><p>Download your card and keep your selected session details together.</p></div><article class="download-card" aria-label="Your session request card"><div class="download-card-head"><span>MCCIA <small>APPLIED AI STUDIO</small></span><span class="card-status">SESSION RESERVED</span></div><div class="download-card-body"><div class="eyebrow">LET’S BUILD WHAT’S NEXT</div><h2>${esc(receipt.appName)}</h2><dl>${cardFields(receipt).map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>${qrBlockHTML(sessionUrl(receipt.id))}</div><div class="download-card-foot"><strong>Card reference · ${esc(receipt.id.slice(0,8).toUpperCase())}</strong><span>Reserved with MCCIA Applied AI Studio.</span></div></article><div class="card-actions"><button id="download-card" class="primary">Download card (PNG) ↓</button><a class="text-button" href="#/session/${receipt.id}">View session →</a><a class="text-button" href="#/apps/${a.id}/details">Edit details</a></div><p id="card-download-status" role="status"></p><p class="card-privacy-note">This card image is only saved to your device when you download it.</p><p class="progress-link"><a class="text-button" href="#/progress">See everyone’s progress →</a></p><a class="back" href="#/apps">← Explore applications</a></div>`;
 root.querySelector('#download-card').onclick=async e=>{const button=e.currentTarget;button.disabled=true;button.textContent='Preparing your card…';try{await downloadSessionCard(receipt);root.querySelector('#card-download-status').textContent='Download started. Your session card is ready to save.'}catch{root.querySelector('#card-download-status').textContent='The download could not be created. Please try again.'}finally{button.disabled=false;button.textContent='Download card (PNG) ↓'}};
}
async function downloadSessionCard(r){
 await document.fonts.ready;
 // The QR must be drawn onto this SAME canvas -- the on-screen <img> the browser renders for
 // the confirmation card lives in the DOM and is never captured by canvas drawing alone.
 const qrSrc=qrDataUrl(sessionUrl(r.id),6,24);
 const qrImg=qrSrc?await loadImage(qrSrc).catch(()=>null):null;
 const QR_LABEL_H=44,QR_GAP=18,QR_CAPTION_H=45;
 const qrBlockHeight=qrImg?(QR_LABEL_H+QR_GAP+qrImg.width+QR_GAP+QR_CAPTION_H):0;
 const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');
 const width=1080,pad=70,textWidth=width-pad*2;
 function wrap(text,maxWidth){const lines=[];let line='';for(const char of String(text)){if(ctx.measureText(line+char).width>maxWidth&&line){lines.push(line.trimEnd());line=char}else line+=char}if(line)lines.push(line);return lines}
 ctx.font='600 31px Manrope, sans-serif';const rows=cardFields(r).map(([label,value])=>({label,lines:wrap(value,textWidth)}));
 const height=350+rows.reduce((sum,row)=>sum+72+row.lines.length*39,0)+140+qrBlockHeight;
 canvas.width=width*2;canvas.height=height*2;ctx.scale(2,2);
 ctx.fillStyle='#f4f2fb';ctx.fillRect(0,0,width,height);ctx.fillStyle='#171b31';ctx.fillRect(0,0,width,230);
 ctx.fillStyle='#fff';ctx.font='800 39px Manrope, sans-serif';ctx.fillText('MCCIA',pad,85);ctx.fillStyle='#c6b8ff';ctx.font='600 19px Manrope, sans-serif';ctx.fillText('APPLIED AI STUDIO',pad,125);ctx.fillStyle='#d0ffa7';ctx.font='700 24px Manrope, sans-serif';ctx.fillText('SESSION RESERVED',pad,187);
 ctx.fillStyle='#fff';ctx.fillRect(35,260,width-70,height-395);
 let y=318;
 for(const row of rows){ctx.fillStyle='#788093';ctx.font='500 19px Manrope, sans-serif';ctx.fillText(row.label.toUpperCase(),pad,y);y+=37;ctx.fillStyle='#232b40';ctx.font='600 31px Manrope, sans-serif';for(const line of row.lines){ctx.fillText(line,pad,y);y+=39}ctx.strokeStyle='#e5e6ed';ctx.beginPath();ctx.moveTo(pad,y+8);ctx.lineTo(width-pad,y+8);ctx.stroke();y+=35;}
 if(qrImg){
  ctx.fillStyle='#5a42be';ctx.font='700 20px Manrope, sans-serif';ctx.textAlign='center';ctx.fillText('SCAN TO VIEW YOUR SESSION',width/2,y+QR_LABEL_H-14);ctx.textAlign='left';
  y+=QR_LABEL_H+QR_GAP;
  ctx.drawImage(qrImg,(width-qrImg.width)/2,y,qrImg.width,qrImg.width);
  y+=qrImg.width+QR_GAP;
  ctx.fillStyle='#788093';ctx.font='500 15px Manrope, sans-serif';ctx.textAlign='center';ctx.fillText("Scan to open your session's live progress page.",width/2,y+QR_CAPTION_H-30);ctx.textAlign='left';
  y+=QR_CAPTION_H;
 }
 ctx.fillStyle='#5a42be';ctx.font='700 22px Manrope, sans-serif';ctx.fillText('CARD REFERENCE · '+r.id.slice(0,8).toUpperCase(),pad,height-83);ctx.fillStyle='#677183';ctx.font='500 20px Manrope, sans-serif';ctx.fillText('Reserved with MCCIA Applied AI Studio.',pad,height-43);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Could not create PNG')),'image/png'));
 const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`MCCIA-${r.appId}-${r.date}-${r.id.slice(0,8)}.png`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}

const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function progressBar(percent){return `<div class="progress-track" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${percent}%"></div></div>`}
function fullDate(date){return new Date(date+'T12:00Z').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'})}

// ---- Public session view (#/session/:bookingId) ----
// Also doubles as the QR-scanned staff edit view: if a staff member is already signed in
// (editorToken set, e.g. from a previous #/editor visit in this browser), or unlocks inline with
// the access key on this page, the SAME url shows editable fields instead of the read-only card.
let sessionData=null,sessionError='',sessionLoading=false,sessionInvalidId=false;
let sessionEditForm=null,sessionSaveBusy=false,sessionSaveError='',sessionSaveMessage='';
let sessionUnlockBusy=false,sessionUnlockError='';
async function sessionView(bookingId){
 document.title='Session | MCCIA AI Studio';
 sessionData=null;sessionError='';sessionEditForm=null;sessionSaveMessage='';sessionSaveError='';sessionUnlockError='';
 sessionInvalidId=!uuidPattern.test(bookingId);
 if(sessionInvalidId){renderSessionView(bookingId);return}
 sessionLoading=true;renderSessionView(bookingId);
 try{
  if(editorToken){
   // Already signed in as staff in this browser -- load full admin-level fields and go
   // straight to the editable view, matching what the dashboard's "View session" link shows.
   const r=await api('editor-sessions',{headers:{Authorization:'Bearer '+editorToken}});
   const row=r.sessions.find(s=>s.id===bookingId);
   if(!row)sessionError='Session not found.';
   else{sessionData=row;sessionEditForm={attendance:row.attendance,hoursCompleted:row.hoursCompleted,progressStage:row.progressStage,progressPercent:row.progressPercent,remarks:row.remarks}}
  }else{
   sessionData=await api('session?id='+encodeURIComponent(bookingId));
  }
 }catch(e){sessionError=e.message}
 finally{sessionLoading=false;renderSessionView(bookingId)}
}
function renderSessionView(bookingId){
 const editMode=!!(editorToken&&sessionEditForm);
 root.innerHTML=`<div class="container session-view"><div class="finish-header"><div class="eyebrow">MCCIA APPLIED AI STUDIO</div><h1>Session</h1></div>${
  sessionInvalidId?`<p class="error" role="alert">This session link is not valid.</p>`
  :sessionLoading?`<p role="status">Loading session…</p>`
  :sessionError?`<p class="error" role="alert">${esc(sessionError)}</p>`
  :!sessionData?''
  :editMode?`<div class="editor-board"><dl class="session-summary-grid"><div><dt>Participant</dt><dd>${esc(sessionData.name)}</dd></div><div><dt>Application</dt><dd>${esc(sessionData.appName)}</dd></div><div><dt>Date</dt><dd>${dateLabel(sessionData.date)}</dd></div><div><dt>Time</dt><dd>${timeLabels[sessionData.slot]||esc(sessionData.slot)}</dd></div><div><dt>Phone</dt><dd>${esc(sessionData.phone||'—')}</dd></div><div><dt>Email</dt><dd>${esc(sessionData.email||'—')}</dd></div><div><dt>Member ID</dt><dd>${esc(sessionData.memberId||'—')}</dd></div><div><dt>Company</dt><dd>${esc(sessionData.company||'—')}</dd></div></dl>
    ${progressEditFormHTML(sessionEditForm,sessionSaveBusy,sessionSaveError)}
    ${sessionSaveMessage?`<p class="editor-message" role="status">${esc(sessionSaveMessage)}</p>`:''}
    <button type="button" class="text-button" id="session-staff-signout" style="margin-top:14px">Sign out of staff mode</button>
   </div>`
  :`<article class="download-card" aria-label="Session progress"><div class="download-card-head"><span>MCCIA <small>APPLIED AI STUDIO</small></span><span class="card-status">${esc(sessionData.progressStage.toUpperCase())}</span></div><div class="download-card-body"><div class="eyebrow">PARTICIPANT</div><h2>${esc(sessionData.name)}</h2><dl class="session-summary-grid"><div><dt>Application</dt><dd>${esc(sessionData.appName)}</dd></div><div><dt>Date</dt><dd>${fullDate(sessionData.date)}</dd></div><div><dt>Time</dt><dd>${timeLabels[sessionData.slot]||esc(sessionData.slot)} IST</dd></div></dl><div class="progress-block"><div class="eyebrow">PROGRESS</div><strong>${esc(sessionData.progressStage)}</strong>${progressBar(sessionData.progressPercent)}<span class="progress-percent">${sessionData.progressPercent}%</span></div></div></article>
   <p class="progress-link"><a class="text-button" href="#/progress">See everyone's progress →</a></p>
   <details class="staff-unlock"><summary>Staff sign-in</summary><form id="session-unlock-form"><label>Access key<div class="password-field"><input type="password" name="key" required id="session-key-input"><button type="button" id="session-toggle-key">Show</button></div></label>${sessionUnlockError?`<p class="error" role="alert">${esc(sessionUnlockError)}</p>`:''}<button class="primary" ${sessionUnlockBusy?'disabled':''}>${sessionUnlockBusy?'Checking…':'Unlock editing'}</button></form></details>`
 }<a class="back" href="#/apps">← Explore applications</a></div>`;
 root.querySelector('#session-toggle-key')?.addEventListener('click',e=>{const input=root.querySelector('#session-key-input'),btn=e.currentTarget;const showing=input.type==='text';input.type=showing?'password':'text';btn.textContent=showing?'Show':'Hide'});
 root.querySelector('#session-unlock-form')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const key=new FormData(e.target).get('key').trim();
  sessionUnlockBusy=true;sessionUnlockError='';renderSessionView(bookingId);
  try{await api('editor-session',{headers:{Authorization:'Bearer '+key}});editorToken=key;sessionUnlockBusy=false;sessionView(bookingId)}
  catch(err){sessionUnlockBusy=false;sessionUnlockError=err.message;renderSessionView(bookingId)}
 });
 root.querySelector('#session-staff-signout')?.addEventListener('click',()=>{editorToken='';sessionEditForm=null;sessionView(bookingId)});
 bindProgressForm(bookingId,
  form=>{sessionEditForm=form;sessionData={...sessionData,...form}},
  busy=>sessionSaveBusy=busy,
  err=>sessionSaveError=err,
  msg=>sessionSaveMessage=msg,
  ()=>renderSessionView(bookingId));
}

// ---- Shared progress view (#/progress) -- public, company + application only, never names ----
let progressList=null,progressError='',progressLoading=false;
async function progressView(){
 document.title='Everyone’s progress | MCCIA AI Studio';
 progressLoading=true;progressError='';renderProgressView();
 try{progressList=(await api('progress')).sessions}
 catch(e){progressError=e.message}
 finally{progressLoading=false;renderProgressView()}
}
function renderProgressView(){
 root.innerHTML=`<div class="container session-view"><div class="finish-header"><div class="eyebrow">MCCIA APPLIED AI STUDIO</div><h1>Everyone’s progress</h1><p>See how other MSMEs are progressing through their sessions.</p></div>${
  progressLoading?'<p role="status">Loading…</p>'
  :progressError?`<p class="error" role="alert">${esc(progressError)}</p>`
  :!progressList?''
  :progressList.length?`<div class="sessions-table-wrap"><table class="sessions-table"><thead><tr><th>Company</th><th>Application</th><th>Stage</th><th>%</th></tr></thead><tbody>${progressList.map(s=>`<tr><td>${esc(s.company||'—')}</td><td>${esc(s.appName)}</td><td><span class="status-pill" style="${stageStyles[s.progressStage]||''}">${esc(s.progressStage)}</span></td><td>${s.progressPercent}%</td></tr>`).join('')}</tbody></table></div>`
  :'<p>No sessions yet.</p>'
 }<a class="back" href="#/apps">← Explore applications</a></div>`;
}

// ---- Shared attendance/progress edit form (used by the admin edit page AND the QR/public
// session page once a staff member unlocks it inline) ----
const attendanceOptions=['Not Marked','Present','Absent'],progressStageOptions=['Not Started','In Progress','Completed'];
function progressEditFormHTML(form,busy,error){return `<form id="session-edit-form" class="session-edit-form">
 <label>Attendance<select name="attendance">${attendanceOptions.map(v=>`<option value="${v}" ${form.attendance===v?'selected':''}>${v}</option>`).join('')}</select></label>
 <label>Hours completed<input type="number" name="hoursCompleted" min="0" max="99.99" step="0.25" value="${form.hoursCompleted}"></label>
 <label>Progress stage<select name="progressStage">${progressStageOptions.map(v=>`<option value="${v}" ${form.progressStage===v?'selected':''}>${v}</option>`).join('')}</select></label>
 <label>Progress percentage<input type="number" name="progressPercent" min="0" max="100" step="1" value="${form.progressPercent}"></label>
 <label>Remarks<textarea name="remarks" maxlength="2000">${esc(form.remarks)}</textarea></label>
 ${error?`<p class="error" role="alert">${esc(error)}</p>`:''}
 <button class="primary" ${busy?'disabled':''}>${busy?'Saving…':'Save progress'}</button>
</form>`}
// Wires the #session-edit-form submit handler. getForm/setForm/setBusy/setError/setMessage are
// small closures owned by the caller so this same wiring works for both the admin edit page and
// the QR/public page's inline unlocked edit, each with their own local state + re-render.
function bindProgressForm(bookingId,setForm,setBusy,setError,setMessage,rerender){
 root.querySelector('#session-edit-form')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.target,fd=new FormData(form);
  const hours=parseFloat(fd.get('hoursCompleted')),percent=parseInt(fd.get('progressPercent'),10);
  if(isNaN(hours)||hours<0){form.elements.hoursCompleted.setCustomValidity('Enter hours completed as 0 or greater.');form.elements.hoursCompleted.reportValidity();return}
  if(isNaN(percent)||percent<0||percent>100){form.elements.progressPercent.setCustomValidity('Enter a percentage between 0 and 100.');form.elements.progressPercent.reportValidity();return}
  const payload={attendance:fd.get('attendance'),hoursCompleted:hours,progressStage:fd.get('progressStage'),progressPercent:percent,remarks:fd.get('remarks')};
  setForm(payload);setBusy(true);setError('');setMessage('');rerender();
  try{
   const saved=await api('editor-session?id='+encodeURIComponent(bookingId),{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+editorToken},body:JSON.stringify(payload)});
   setForm({attendance:saved.attendance,hoursCompleted:saved.hoursCompleted,progressStage:saved.progressStage,progressPercent:saved.progressPercent,remarks:saved.remarks});
   setMessage('Progress saved.');
  }catch(err){setError(err.message)}
  finally{setBusy(false);rerender()}
 });
}

// ---- Admin session detail (#/editor/session/:bookingId) ----
let editorSessionDetail=null,editorSessionDetailError='',editorSessionDetailLoading=false,editorSessionForm=null,editorSessionSaveBusy=false,editorSessionSaveMessage='',editorSessionSaveError='';
let editorDeleteConfirming=false,editorDeleteBusy=false,editorDeleteError='';
let editorRescheduleOpen=false,editorRescheduleForm=null,editorRescheduleBusy=false,editorRescheduleError='',editorRescheduleMessage='',editorRescheduleConfirming=false;
async function editorSessionView(bookingId){
 if(!editorToken){location.hash='#/editor';return}
 document.title='Session detail | MCCIA AI Studio';
 editorSessionDetailError='';editorSessionSaveMessage='';editorSessionSaveError='';
 editorDeleteConfirming=false;editorDeleteBusy=false;editorDeleteError='';
 editorRescheduleOpen=false;editorRescheduleForm=null;editorRescheduleBusy=false;editorRescheduleError='';editorRescheduleMessage='';
 if(!editorSessions){
  editorSessionDetailLoading=true;renderEditorSessionView(bookingId);
  try{const r=await api('editor-sessions',{headers:{Authorization:'Bearer '+editorToken}});editorSessions=r.sessions}
  catch(e){editorSessionDetailError=e.message;editorSessionDetailLoading=false;renderEditorSessionView(bookingId);return}
 }
 editorSessionDetailLoading=false;
 editorSessionDetail=editorSessions.find(s=>s.id===bookingId)||null;
 if(editorSessionDetail)editorSessionForm={attendance:editorSessionDetail.attendance,hoursCompleted:editorSessionDetail.hoursCompleted,progressStage:editorSessionDetail.progressStage,progressPercent:editorSessionDetail.progressPercent,remarks:editorSessionDetail.remarks};
 renderEditorSessionView(bookingId);
}
// Every date/slot combination scheduled for this app, so a reschedule can only ever move a
// booking onto a combination the application actually runs at.
function rescheduleOptionsHTML(s){
 return (appSchedule[s.appId]||[]).map(entry=>{
  const value=entry.date+'|'+entry.slot,current=entry.date===s.date&&entry.slot===s.slot;
  return `<option value="${value}" ${current?'selected':''}>${dateLabel(entry.date)} — ${timeLabels[entry.slot]||entry.slot}${current?' (current)':''}</option>`;
 }).join('');
}
function renderEditorSessionView(bookingId){
 const s=editorSessionDetail;
 root.innerHTML=`<div class="editor-shell"><a class="back" href="#/editor">← Back to Dashboard</a><div class="eyebrow">SESSION</div><h1>Session detail</h1>${
  editorSessionDetailLoading?'<p role="status">Loading session…</p>'
  :editorSessionDetailError?`<p class="error" role="alert">${esc(editorSessionDetailError)}</p>`
  :!s?'<p class="error" role="alert">Session not found.</p>'
  :`<div class="editor-board"><dl class="session-summary-grid"><div><dt>Participant</dt><dd>${esc(s.name)}</dd></div><div><dt>Application</dt><dd>${esc(s.appName)}</dd></div><div><dt>Date</dt><dd>${dateLabel(s.date)}</dd></div><div><dt>Time</dt><dd>${timeLabels[s.slot]||esc(s.slot)}</dd></div><div><dt>Phone</dt><dd>${esc(s.phone||'—')}</dd></div><div><dt>Email</dt><dd>${esc(s.email||'—')}</dd></div><div><dt>Member ID</dt><dd>${esc(s.memberId||'—')}</dd></div><div><dt>Company</dt><dd>${esc(s.company||'—')}</dd></div><div><dt>Booking ID</dt><dd>${esc(s.id)}</dd></div></dl>
    ${progressEditFormHTML(editorSessionForm,editorSessionSaveBusy,editorSessionSaveError)}
    ${editorSessionSaveMessage?`<p class="editor-message" role="status">${esc(editorSessionSaveMessage)}</p>`:''}
    <div class="editor-subsection">
     <h3>Reschedule</h3>
     <p>Move this booking to a different scheduled date/time for ${esc(s.appName)}. The visitor will be emailed automatically once you confirm.</p>
     <form id="reschedule-form" class="reschedule-form">
      <select name="dateSlot">${rescheduleOptionsHTML(s)}</select>
      ${editorRescheduleError?`<p class="error" role="alert">${esc(editorRescheduleError)}</p>`:''}
      <button class="primary" ${editorRescheduleBusy?'disabled':''}>${editorRescheduleBusy?'Saving…':'Save new date & time'}</button>
     </form>
     ${editorRescheduleMessage?`<p class="editor-message" role="status">${esc(editorRescheduleMessage)}</p>`:''}
    </div>
    <div class="editor-subsection editor-danger-zone">
     <h3>Delete booking</h3>
     <p>Removes this booking permanently. The visitor is <strong>not</strong> notified. Once deleted, the same email address can book this application's slots again.</p>
     ${editorDeleteError?`<p class="error" role="alert">${esc(editorDeleteError)}</p>`:''}
     ${editorDeleteConfirming
      ?`<p>Are you sure? This cannot be undone.</p><button type="button" class="danger" id="delete-confirm-yes" ${editorDeleteBusy?'disabled':''}>${editorDeleteBusy?'Deleting…':'Yes, delete this booking'}</button> <button type="button" class="text-button" id="delete-confirm-no" ${editorDeleteBusy?'disabled':''}>Cancel</button>`
      :`<button type="button" class="danger" id="delete-start">Delete booking</button>`}
    </div>
   </div>`
 }</div>`;
 bindProgressForm(bookingId,
  form=>{editorSessionForm=form;editorSessionDetail={...editorSessionDetail,...form};const idx=editorSessions.findIndex(s=>s.id===bookingId);if(idx!==-1)editorSessions[idx]={...editorSessions[idx],...form}},
  busy=>editorSessionSaveBusy=busy,
  err=>editorSessionSaveError=err,
  msg=>editorSessionSaveMessage=msg,
  ()=>renderEditorSessionView(bookingId));
 root.querySelector('#reschedule-form')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const [date,slot]=new FormData(e.target).get('dateSlot').split('|');
  if(date===s.date&&slot===s.slot)return;
  if(!confirm(`Move this booking to ${dateLabel(date)}, ${timeLabels[slot]||slot}? An email will be sent to the participant's registered address.`))return;
  editorRescheduleBusy=true;editorRescheduleError='';editorRescheduleMessage='';renderEditorSessionView(bookingId);
  try{
   const saved=await api('editor-booking?id='+encodeURIComponent(bookingId),{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+editorToken},body:JSON.stringify({date,slot})});
   const idx=editorSessions.findIndex(r=>r.id===bookingId);if(idx!==-1)editorSessions[idx]={...editorSessions[idx],date:saved.date,slot:saved.slot};
   editorSessionDetail={...editorSessionDetail,date:saved.date,slot:saved.slot};
   editorRescheduleMessage=saved.emailSent?'Booking rescheduled. The participant has been emailed.':'Booking rescheduled, but the notification email could not be sent — please let the participant know directly.';
  }catch(err){editorRescheduleError=err.message}
  finally{editorRescheduleBusy=false;renderEditorSessionView(bookingId)}
 });
 root.querySelector('#delete-start')?.addEventListener('click',()=>{editorDeleteConfirming=true;renderEditorSessionView(bookingId)});
 root.querySelector('#delete-confirm-no')?.addEventListener('click',()=>{editorDeleteConfirming=false;renderEditorSessionView(bookingId)});
 root.querySelector('#delete-confirm-yes')?.addEventListener('click',async()=>{
  editorDeleteBusy=true;editorDeleteError='';renderEditorSessionView(bookingId);
  try{
   await api('editor-session?id='+encodeURIComponent(bookingId),{method:'DELETE',headers:{Authorization:'Bearer '+editorToken}});
   editorSessions=editorSessions.filter(r=>r.id!==bookingId);
   location.hash='#/editor';
  }catch(err){editorDeleteBusy=false;editorDeleteConfirming=false;editorDeleteError=err.message;renderEditorSessionView(bookingId)}
 });
}

let editorToken='',editorDate='',editorMessage='',editorSlots=null;
let editorTab='sessions',editorSessions=null,editorSessionsError='',editorSessionsLoading=false;
let calendarViewMode='all',calendarSelectedDate='',calendarModalId=null;
const attendanceStyles={'Not Marked':'background:#f1eefb;color:#6647eb','Present':'background:#e6f7ec;color:#1e8a4c','Absent':'background:#fdeceb;color:#c23b34'};
const stageStyles={'Not Started':'background:#f1eefb;color:#6647eb','In Progress':'background:#fff6df;color:#a5720b','Completed':'background:#e6f7ec;color:#1e8a4c'};
function todayISO(){return new Date(Date.now()+19800000).toISOString().slice(0,10)}
// Groups dates into calendar weeks (Monday start) so the dashboard's "Week" view can show one
// of the studio's two allocated weeks at a time.
function weekStartOf(dateStr){const d=new Date(dateStr+'T00:00:00Z');const day=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-day);return d.toISOString().slice(0,10);}
function computeStageCounts(sessions){const counts={'Not Started':0,'In Progress':0,'Completed':0};for(const s of sessions)counts[s.progressStage]=(counts[s.progressStage]||0)+1;return counts;}
function statsGridHTML(sessions){const counts=computeStageCounts(sessions);return `<div class="stats-grid">
 <div class="stat-card"><span class="stat-value">${sessions.length}</span><span class="stat-label">Total bookings</span></div>
 <div class="stat-card"><span class="stat-value" style="color:#6647eb">${counts['Not Started']}</span><span class="stat-label">Not started</span></div>
 <div class="stat-card"><span class="stat-value" style="color:#a5720b">${counts['In Progress']}</span><span class="stat-label">In progress</span></div>
 <div class="stat-card"><span class="stat-value" style="color:#1e8a4c">${counts['Completed']}</span><span class="stat-label">Completed</span></div>
</div>`}
function viewToggleHTML(){return `<div class="view-toggle" role="tablist">${[['day','Day'],['week','Week'],['all','All']].map(([key,label])=>`<button type="button" class="view-toggle-item ${calendarViewMode===key?'selected':''}" data-view-mode="${key}" role="tab" aria-selected="${calendarViewMode===key}">${label}</button>`).join('')}</div>`}
// Google-Calendar-style detail popup for one booking, opened by clicking its chip in the
// day/week/all list below -- shows the same fields as the admin table row, plus a link through
// to the full editable session page.
function calendarModalHTML(){
 const s=editorSessions.find(r=>r.id===calendarModalId);if(!s)return '';
 return `<div class="modal-backdrop" id="calendar-modal-backdrop"><div class="modal-card" role="dialog" aria-modal="true" aria-label="Booking details">
  <button type="button" class="modal-close" id="calendar-modal-close" aria-label="Close">×</button>
  <div class="eyebrow">${dateLabel(s.date)} · ${timeLabels[s.slot]||esc(s.slot)}</div>
  <h2>${esc(s.name)}</h2>
  <dl class="session-summary-grid">
   <div><dt>Application</dt><dd>${esc(s.appName)}</dd></div>
   <div><dt>Phone</dt><dd>${esc(s.phone||'—')}</dd></div>
   <div><dt>Email</dt><dd>${esc(s.email||'—')}</dd></div>
   <div><dt>Member ID</dt><dd>${esc(s.memberId||'—')}</dd></div>
   <div><dt>Company</dt><dd>${esc(s.company||'—')}</dd></div>
   <div><dt>Attendance</dt><dd><span class="status-pill" style="${attendanceStyles[s.attendance]||''}">${esc(s.attendance)}</span></dd></div>
   <div><dt>Stage</dt><dd><span class="status-pill" style="${stageStyles[s.progressStage]||''}">${esc(s.progressStage)}</span></dd></div>
   <div><dt>Progress</dt><dd>${s.progressPercent}%</dd></div>
   <div><dt>Hours</dt><dd>${s.hoursCompleted}</dd></div>
  </dl>
  ${s.remarks?`<p class="modal-remarks"><strong>Remarks:</strong> ${esc(s.remarks)}</p>`:''}
  <a class="primary" href="#/editor/session/${s.id}">Open full session →</a>
 </div></div>`;
}
function availabilityPanelHTML(){return `<div class="editor-toolbar"><label>Choose a date<select id="editor-date"><option value="">Select a scheduled date</option>${eventDates.map(date=>`<option value="${date}" ${date===editorDate?'selected':''}>${dateLabel(date)} 2026</option>`).join('')}</select></label></div><div class="editor-board">${editorSlots?`<div class="section-heading"><h2>${dateLabel(editorDate)}</h2><span>Changes apply to all applications</span></div><form id="editor-save"><div class="day-actions"><button type="button" data-day-action="show">Show day</button><button type="button" data-day-action="hide">Hide day</button><button type="button" data-day-action="activate">Activate day</button><button type="button" data-day-action="deactivate">Deactivate day</button></div><div class="editor-row editor-table-head"><span>One-hour session</span><span>Display</span><span>Active</span></div>${editorSlots.map(s=>`<div class="editor-row"><strong>${timeLabels[s.time]}</strong><label><input type="checkbox" data-visible="${s.time}" ${s.visible?'checked':''} aria-label="Display ${timeLabels[s.time]}"><span>Show</span></label><label><input type="checkbox" data-active="${s.time}" ${s.active?'checked':''} ${s.booked?'disabled':''} aria-label="Activate ${timeLabels[s.time]}"><span>${s.booked?'Booked':'Bookable'}</span></label></div>`).join('')}<p>Hidden slots do not appear to visitors. Inactive slots remain visible but cannot be booked. Existing bookings are preserved.</p><button class="primary">Save availability ✓</button></form>`:'<p>Select a scheduled date to manage its three session slots.</p>'}</div>`}
function sessionsPanelHTML(){return `<div class="editor-board"><div class="section-heading"><h2>Sessions</h2><span>${editorSessions?editorSessions.length+' total':''}</span></div>${editorSessionsLoading?'<p role="status">Loading sessions…</p>':''}${editorSessionsError?`<p class="error" role="alert">${esc(editorSessionsError)} <button type="button" id="retry-sessions">Try again</button></p>`:''}${editorSessions&&!editorSessionsLoading?(editorSessions.length?`<div class="sessions-table-wrap"><table class="sessions-table"><thead><tr><th>Participant</th><th>Application</th><th>Date</th><th>Time</th><th>Company</th><th>Attendance</th><th>Hours</th><th>Stage</th><th>%</th><th></th></tr></thead><tbody>${editorSessions.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.appName)}</td><td>${dateLabel(s.date)}</td><td>${timeLabels[s.slot]||esc(s.slot)}</td><td>${esc(s.company||'—')}</td><td><span class="status-pill" style="${attendanceStyles[s.attendance]||''}">${esc(s.attendance)}</span></td><td>${s.hoursCompleted}</td><td><span class="status-pill" style="${stageStyles[s.progressStage]||''}">${esc(s.progressStage)}</span></td><td>${s.progressPercent}%</td><td><a class="text-button" href="#/editor/session/${s.id}">View session</a></td></tr>`).join('')}</tbody></table></div>`:'<p>No bookings yet.</p>'):''}</div>`}
function calendarPanelHTML(){
 if(!editorSessions)return `<div class="editor-board">${editorSessionsLoading?'<p role="status">Loading calendar…</p>':editorSessionsError?`<p class="error" role="alert">${esc(editorSessionsError)} <button type="button" id="retry-sessions">Try again</button></p>`:''}</div>`;
 const byDate=new Map();
 for(const s of editorSessions){if(!byDate.has(s.date))byDate.set(s.date,[]);byDate.get(s.date).push(s)}
 const allDates=[...byDate.keys()].sort();
 if(!calendarSelectedDate||!allDates.includes(calendarSelectedDate))calendarSelectedDate=allDates.find(d=>d>=todayISO())||allDates[0]||'';
 const weekStarts=[...new Set(allDates.map(weekStartOf))].sort();
 const currentWeekStart=calendarSelectedDate?weekStartOf(calendarSelectedDate):weekStarts[0];
 let visibleDates;
 if(calendarViewMode==='day')visibleDates=calendarSelectedDate?[calendarSelectedDate]:[];
 else if(calendarViewMode==='week')visibleDates=allDates.filter(d=>weekStartOf(d)===currentWeekStart);
 else visibleDates=allDates;
 return `<div class="editor-board">
  <div class="section-heading"><h2>Dashboard</h2><span>Across both allocated weeks</span></div>
  ${statsGridHTML(editorSessions)}
  <div class="calendar-controls">
   ${viewToggleHTML()}
   ${calendarViewMode==='day'?`<select id="calendar-date-select">${allDates.map(d=>`<option value="${d}" ${d===calendarSelectedDate?'selected':''}>${dateLabel(d)}</option>`).join('')}</select>`
    :calendarViewMode==='week'?`<select id="calendar-date-select">${weekStarts.map(d=>`<option value="${d}" ${d===currentWeekStart?'selected':''}>Week of ${dateLabel(d)}</option>`).join('')}</select>`:''}
  </div>
  ${allDates.length===0?'<p>No bookings yet.</p>':visibleDates.length===0?'<p>No bookings in this range.</p>':`<div class="calendar-grid">${visibleDates.map(date=>{
   const daySessions=(byDate.get(date)||[]).slice().sort((a,b)=>a.slot.localeCompare(b.slot));
   return `<div class="calendar-day">
    <div class="calendar-day-header"><span class="calendar-day-date">${dateLabel(date)}</span><span class="calendar-day-count">${daySessions.length} ${daySessions.length===1?'booking':'bookings'}</span></div>
    ${daySessions.length?`<ul class="calendar-day-list">${daySessions.map(s=>`<li><button type="button" class="calendar-booking-chip" data-booking-id="${s.id}"><span class="chip-time">${timeLabels[s.slot]||esc(s.slot)}</span><span class="chip-name">${esc(s.name)}</span><span class="chip-app">${esc(s.appName)}</span><span class="status-pill" style="${stageStyles[s.progressStage]||''}">${esc(s.progressStage)}</span></button></li>`).join('')}</ul>`:'<p class="calendar-day-empty">No bookings.</p>'}
   </div>`;
  }).join('')}</div>`}
  ${calendarModalId?calendarModalHTML():''}
 </div>`;
}
async function loadEditorSessions(){editorSessionsLoading=true;editorSessionsError='';editor();try{const r=await api('editor-sessions',{headers:{Authorization:'Bearer '+editorToken}});editorSessions=r.sessions}catch(e){editorSessionsError=e.message}finally{editorSessionsLoading=false;editor()}}
function editor(){document.title='Studio access | MCCIA AI Studio';root.innerHTML=`<div class="editor-shell">${!editorToken?`<div class="eyebrow">STUDIO ACCESS</div><h1>Make room for what’s next.</h1><p>Manage the days and times people can book.</p><form id="editor-login" class="editor-login"><h2>Editor sign in</h2><p>Use your studio editor access key.</p><label>Access key<div class="password-field"><input type="password" name="key" required autocomplete="current-password" id="editor-key-input"><button type="button" id="toggle-key-visibility" aria-label="Show access key">Show</button></div></label><button class="primary">Sign in →</button></form>`:`<div class="editor-toolbar"><div class="eyebrow">GETMYAPP ADMIN</div><button class="text-button" id="sign-out">Sign out</button></div><div class="admin-nav" role="tablist">${[['dashboard','Dashboard'],['sessions','Sessions'],['availability','Availability']].map(([key,label])=>`<button type="button" class="admin-nav-item ${editorTab===key?'selected':''}" data-tab="${key}" role="tab" aria-selected="${editorTab===key}">${label}</button>`).join('')}</div>${editorTab==='availability'?availabilityPanelHTML():editorTab==='dashboard'?calendarPanelHTML():sessionsPanelHTML()}`}${editorMessage?`<p class="editor-message" role="status">${esc(editorMessage)}</p>`:''}</div>`;
root.querySelector('#editor-login')?.addEventListener('submit',async e=>{e.preventDefault();const key=new FormData(e.target).get('key').trim();try{await api('editor-session',{headers:{Authorization:'Bearer '+key}});editorToken=key;editorMessage='';loadEditorSessions()}catch(e){editorMessage=e.message;editor()}});
root.querySelector('#toggle-key-visibility')?.addEventListener('click',e=>{const input=root.querySelector('#editor-key-input'),btn=e.currentTarget;const showing=input.type==='text';input.type=showing?'password':'text';btn.textContent=showing?'Show':'Hide';btn.setAttribute('aria-label',showing?'Show access key':'Hide access key')});
root.querySelector('#sign-out')?.addEventListener('click',()=>{editorToken='';editorSlots=null;editorSessions=null;editorTab='sessions';calendarViewMode='all';calendarSelectedDate='';calendarModalId=null;editorMessage='';editor()});
root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{editorTab=b.dataset.tab;if((editorTab==='sessions'||editorTab==='dashboard')&&!editorSessions)loadEditorSessions();else editor()});
root.querySelector('#retry-sessions')?.addEventListener('click',()=>loadEditorSessions());
root.querySelectorAll('[data-view-mode]').forEach(b=>b.onclick=()=>{calendarViewMode=b.dataset.viewMode;editor()});
root.querySelector('#calendar-date-select')?.addEventListener('change',e=>{calendarSelectedDate=e.target.value;editor()});
root.querySelectorAll('[data-booking-id]').forEach(b=>b.onclick=()=>{calendarModalId=b.dataset.bookingId;editor()});
root.querySelector('#calendar-modal-backdrop')?.addEventListener('click',e=>{if(e.target.id==='calendar-modal-backdrop'){calendarModalId=null;editor()}});
root.querySelector('#calendar-modal-close')?.addEventListener('click',()=>{calendarModalId=null;editor()});
root.querySelector('#editor-date')?.addEventListener('change',async e=>{editorDate=e.target.value;editorSlots=null;try{const r=await api('editor-availability?date='+editorDate,{headers:{Authorization:'Bearer '+editorToken}});editorSlots=r.slots;editorMessage='';}catch(e){editorMessage=e.message}editor()});root.querySelectorAll('[data-day-action]').forEach(b=>b.onclick=()=>{const action=b.dataset.dayAction;const attr=['show','hide'].includes(action)?'data-visible':'data-active';root.querySelectorAll('['+attr+']').forEach(input=>{if(!input.disabled)input.checked=['show','activate'].includes(action)});});root.querySelector('#editor-save')?.addEventListener('submit',async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;const slots=editorSlots.map(s=>({time:s.time,visible:root.querySelector(`[data-visible="${s.time}"]`).checked,active:root.querySelector(`[data-active="${s.time}"]`).checked}));try{await api('editor-availability',{method:'PUT',headers:{'Content-Type':'application/json',Authorization:'Bearer '+editorToken},body:JSON.stringify({date:editorDate,slots})});editorSlots=editorSlots.map(s=>({...s,...slots.find(r=>r.time===s.time)}));editorMessage='Availability saved. Visitors will see the updated schedule.'}catch(e){editorMessage=e.message}editor()});}
function render(){requestNumber++;const parts=location.hash.slice(1).split('/').filter(Boolean);document.body.classList.toggle('is-landing',!parts.length);document.body.classList.toggle('is-booking',['book','details'].includes(parts[2]));document.body.classList.toggle('is-slot-page',parts[2]==='book');if(!parts.length)landing();else if(parts[0]==='progress')progressView();else if(parts[0]==='session'&&parts[1])sessionView(parts[1]);else if(parts[0]==='editor'&&parts[1]==='session'&&parts[2])editorSessionView(parts[2]);else if(parts[0]==='editor')editor();else if(parts[0]==='apps'&&parts.length===1)catalog();else{const a=apps.find(a=>a.id===parts[1]);if(a&&parts[0]==='apps'){if(activeApp?.id!==a.id){selectedDate=null;selectedSlot=null;schedule=[];availability=[];receipt=null;}activeApp=a;switch(parts[2]){case undefined:detail(a);break;case 'book':booking(a);if(!schedule.length)loadSchedule(a);break;case 'details':finalDetails(a);break;case 'confirmed':confirmed(a);break;default:location.hash='#/apps';}}else location.hash='#/apps';}window.scrollTo(0,0)}
window.addEventListener('hashchange',render);render();
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'start_app_booking',title:'Open app development booking',description:'Open an application’s date and time selection. This does not reserve a slot.',inputSchema:{type:'object',properties:{appId:{type:'string',enum:apps.map(a=>a.id)}},required:['appId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:async({appId})=>{if(!apps.some(a=>a.id===appId))throw new Error('Unknown application');history.replaceState(null,'',`#/apps/${appId}/book`);render();return {appId,stage:'select_date_and_time',booked:false}}})).catch(()=>{});}catch{}}
