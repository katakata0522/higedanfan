import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire('/tmp/higedan-audit-tools/package.json');
const {chromium}=require('playwright');
const catalog=JSON.parse(fs.readFileSync('audit-evidence/catalog.json','utf8'));
const {songs,questions}=catalog;
const out='audit-evidence';
fs.mkdirSync(`${out}/screenshots`,{recursive:true});
const result={baseline:catalog.baseline,browser:'Chromium',baseUrl:'http://127.0.0.1:4173',startedAt:new Date().toISOString(),screens:[],modals:[],quiz:[],diagnoses:[],cases:[],consoleErrors:[],pageErrors:[]};
const save=()=>fs.writeFileSync(`${out}/browser-results.json`,JSON.stringify(result,null,2));
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const browser=await chromium.launch({headless:true});
result.browserVersion=browser.version();
const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'ja-JP',reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(6000);
page.on('pageerror',e=>result.pageErrors.push(String(e)));
page.on('console',m=>{if(m.type()==='error'&&result.consoleErrors.length<150)result.consoleErrors.push(m.text());});
const names=['home','mood','discography','vocal_range','sacred_map','setlist','tour_archive','community','fan_reviews','quiz','quiz_archive'];
async function navigate(index,p=page){
 const close=p.getByRole('button',{name:'メニューを閉じる',exact:true});
 if(await close.count())await close.click();
 await p.getByRole('button',{name:'メニューを開く',exact:true}).click();
 await p.locator('#global-nav-drawer button').nth(index).click();
 await p.waitForTimeout(100);
}
async function fresh(index,p=page){await p.goto(result.baseUrl,{waitUntil:'networkidle'});await navigate(index,p);}
async function record(name,fn){try{const evidence=await fn();result.cases.push({name,status:'executed',evidence});}catch(e){result.cases.push({name,status:'test-error',error:String(e)});}save();}
async function screenshot(name,p=page){const file=`screenshots/${name}.jpg`;await p.screenshot({path:`${out}/${file}`,fullPage:true,type:'jpeg',quality:70,timeout:25000});return file;}
await page.goto(result.baseUrl,{waitUntil:'networkidle'});
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:width===1440?1000:844});
 for(let i=0;i<names.length;i++){
  try{
   await navigate(i);
   const image=await screenshot(`${width}-${names[i]}`);
   const metrics=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,headings:[...document.querySelectorAll('main h1,main h2,main h3')].map(x=>x.textContent),brokenImages:[...document.images].filter(x=>!x.complete||!x.naturalWidth).map(x=>({src:x.getAttribute('src'),alt:x.alt})),overflow:[...document.querySelectorAll('main *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+2||r.left< -2)}).slice(0,15).map(e=>({tag:e.tagName,text:e.textContent?.slice(0,80),right:e.getBoundingClientRect().right})),url:location.href}));
   let accessibility;
   try{await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});accessibility=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,8),totalNodes:v.nodes.length}));});}catch(e){accessibility={error:String(e)}}
   result.screens.push({screen:names[i],width,image,metrics,accessibility});save();
  }catch(e){result.screens.push({screen:names[i],width,error:String(e)});save();}
 }
}
await page.setViewportSize({width:1440,height:1000});
await record('all 86 song dialogs: open, content, Escape close',async()=>{
 await fresh(2);
 await page.getByRole('button',{name:/全 \d+ 曲をすべて表示/}).click();
 for(const s of songs){
  try{
   const card=page.locator('main article').filter({has:page.getByRole('heading',{name:s.title,exact:true})});
   await card.getByRole('button',{name:'音域・解説を見る',exact:true}).click();
   const dialog=page.getByRole('dialog');await dialog.waitFor();
   const title=await dialog.locator('#song-modal-title').innerText();
   const text=await dialog.innerText();
   const focusInside=await page.evaluate(()=>!!document.activeElement?.closest('[role="dialog"]'));
   const image=await screenshot(`song-${s.id}`);
   await page.keyboard.press('Escape');
   result.modals.push({id:s.id,title,titleMatches:title===s.title,hasVocalRange:text.includes(s.vocalRange.lowestNote),hasGeneratedQuote:s.iconicLyricQuote.includes('収録曲 — ')&&text.includes(s.iconicLyricQuote),focusInsideOnOpen:focusInside,closedByEscape:await dialog.count()===0,image});
  }catch(e){result.modals.push({id:s.id,title:s.title,error:String(e)});await page.keyboard.press('Escape').catch(()=>{});}
  save();
 }
 return {attempted:result.modals.length,success:result.modals.filter(x=>x.titleMatches&&x.closedByEscape).length};
});
await record('all 64 diagnosis paths',async()=>{
 await fresh(1);
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++){
  const expected=catalog.diagnoses[a*16+b*4+c];
  try{
   for(const choice of [a,b,c]){
    const optionButtons=page.locator('#section-mood button').filter({has:page.locator('div.text-sm')});
    if(await optionButtons.count()===4)await optionButtons.nth(choice).click();
    else {
     const stage=await page.locator('#section-mood h3').first().innerText();
     const opts=stage.startsWith('Q1')?['背中を押してほしい','切ない夜に浸りたい','最高に盛り上がりたい','深い歌詞を味わいたい']:stage.startsWith('Q2')?['朝の通勤・通学','ひとり静かな夜','ライブ前・ドライブ','休日の散歩・カフェ']:['王道ピアノポップ','ブラス＆ファンク','エモーショナルバラード','スタジアムロック'];
     await page.getByRole('button',{name:new RegExp(esc(opts[choice]))}).click();
    }
   }
   const title=await page.locator('#section-mood article h3').first().innerText();
   const body=await page.locator('#section-mood').innerText();
   result.diagnoses.push({choices:[a,b,c],title,expected:expected.top3[0].title,matches:title===expected.top3[0].title,scoreVisible:body.includes(`マッチ度 ${expected.top3[0].score}%`)});
   if(a===0&&b===0&&c===0){await screenshot('diagnosis-result');const share=page.getByRole('button',{name:/シェアカード/}).first();if(await share.count()){await share.click();await screenshot('diagnosis-share');}}
   await page.getByRole('button',{name:'最初から診断し直す',exact:true}).click();
  }catch(e){result.diagnoses.push({choices:[a,b,c],error:String(e)});await fresh(1);}
  save();
 }
 return {attempted:result.diagnoses.length,matched:result.diagnoses.filter(x=>x.matches).length};
});
for(const correct of [true,false])await record(`all 60 quiz questions: ${correct?'correct':'incorrect'} path`,async()=>{
 await fresh(9);
 await page.getByRole('button',{name:/総合チャレンジコース/}).click();
 for(const q of questions){
  const before=await page.locator('#section-quiz h3').last().innerText();
  if(q.questionType==='ordering'){
   const order=correct?q.correctOrder:[...q.correctOrder].reverse();
   for(const n of order)await page.getByRole('button',{name:q.options[n],exact:true}).click();
   await page.getByRole('button',{name:'この順番で回答する',exact:true}).click();
  }else{
   const n=correct?q.correctIndex:(q.correctIndex+1)%q.options.length;
   await page.getByRole('button',{name:`${n+1}. ${q.options[n]}`,exact:true}).click();
  }
  const text=await page.locator('#section-quiz').innerText();
  const sourceLinks=await page.locator('#section-quiz a').evaluateAll(xs=>xs.map(x=>x.href));
  const feedback=correct?text.includes('正解です！'):text.includes('惜しい！');
  result.quiz.push({id:q.id,path:correct?'correct':'incorrect',questionRendered:before.includes(q.prompt),feedbackCorrect:feedback,sourceLinks,sourceLinksMatch:q.sources.every(s=>sourceLinks.includes(s.url))});save();
  if(correct&&(q.id==='q1'||q.questionType==='ordering'))await screenshot(`quiz-${q.id}-answer`);
  await page.getByRole('button',{name:q===questions.at(-1)?'検定結果を見る':'次の問題へ進む',exact:true}).click();
 }
 const summary=await page.locator('#section-quiz').innerText();
 await screenshot(`quiz-${correct?'full-score':'zero-score'}`);
 if(correct){await page.getByRole('button',{name:'シェアカード生成',exact:true}).click();await screenshot('quiz-certificate');}
 return {resultText:summary.slice(0,2000),expectedScore:correct?60:0};
});
await record('discography search, zero results, all sort options, all album filters',async()=>{
 await fresh(2);const checks=[];
 for(const query of ['Pretender','Subtitle','存在しない楽曲audit000']){await page.locator('#discography-search').fill(query);await page.waitForTimeout(100);checks.push({query,text:(await page.locator('#section-discography').innerText()).slice(0,750),cards:await page.locator('main article').count()});}
 await page.locator('#discography-search').fill('');
 const sorts=await page.locator('#discography-sort-select option').evaluateAll(xs=>xs.map(x=>x.value));
 for(const value of sorts){await page.locator('#discography-sort-select').selectOption(value);checks.push({sort:value,first:await page.locator('main article h3').first().innerText()});}
 const albums=await page.locator('#album-filter-select option').evaluateAll(xs=>xs.map(x=>({value:x.value,label:x.textContent})));
 for(const opt of albums){await page.locator('#album-filter-select').selectOption(opt.value);await page.waitForTimeout(60);checks.push({album:opt.label,cards:await page.locator('main article').count(),titles:await page.locator('main article h3').allInnerTexts()});}
 return checks;
});
await record('subtab navigation: parent selection consistency',async()=>{
 await fresh(2);await page.getByRole('tab',{name:'音域・発売日表',exact:true}).click();
 return {header:await page.locator('header').innerText(),heading:await page.locator('#discography-heading').innerText(),image:await screenshot('subtab-parent-state')};
});
await record('26-song setlist persisted then reloaded via real UI',async()=>{
 await fresh(5);
 while(await page.getByRole('button',{name:/をセットリストから削除$/}).count())await page.getByRole('button',{name:/をセットリストから削除$/}).first().click();
 for(const s of songs.slice(0,26)){await page.locator('#add-song-select').selectOption(s.id);await page.getByRole('button',{name:'曲を追加',exact:true}).click();}
 await page.waitForTimeout(200);
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist);
 await screenshot('setlist-26-before-reload');
 await page.reload({waitUntil:'networkidle'});await navigate(5);
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist);
 await screenshot('setlist-after-reload');
 return {beforeCount:before.length,afterCount:after.length,lostIds:before.filter(x=>!after.some(y=>x.songId===y.songId)).map(x=>x.songId)};
});
await record('setlist empty search must not add hidden selection',async()=>{
 await fresh(5);await page.locator('#add-song-select').selectOption(songs[30].id);
 await page.locator('#setlist-song-filter').fill('存在しない曲audit000');
 const visibleOptions=await page.locator('#add-song-select option').count();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.length);
 const add=page.getByRole('button',{name:'曲を追加',exact:true});const enabled=await add.isEnabled();if(enabled)await add.click();
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).setlist.length);
 return {visibleOptions,enabled,before,after,image:await screenshot('setlist-zero-results')};
});
await record('all seven tour preset loads',async()=>{
 const rows=[];
 for(const tour of catalog.tours){await fresh(6);const card=page.locator('main article').filter({has:page.getByRole('heading',{name:tour.tourTitle,exact:true})});await card.getByRole('button',{name:'このツアー曲をマイセトリに読込',exact:true}).click();const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')));rows.push({id:tour.id,title:state.setlistTitle,loaded:state.setlist.length,expectedSourceNames:tour.signatureSetlistIds.length+tour.encoreSetlistIds.length});}
 return rows;
});
await record('all pilgrimage visit toggles and persistence',async()=>{
 await fresh(4);const initial=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).visitedSpotIds);const toggled=[];
 for(const spot of catalog.spots){const card=page.locator('main article').filter({has:page.getByRole('heading',{name:spot.name,exact:true})});const b=card.getByRole('button');const before=await b.getAttribute('aria-pressed');await b.click();toggled.push({id:spot.id,before,after:await b.getAttribute('aria-pressed')});}
 await page.reload({waitUntil:'networkidle'});await navigate(4);const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')).visitedSpotIds);return {initial,toggled,after};
});
await record('four vote categories, increment and reload',async()=>{
 await fresh(7);const rows=[];
 for(const label of ['総合ベストソング','歌詞が刺さる曲','ライブで盛り上がる曲','隠れた名曲・アルバム曲']){await page.getByRole('button',{name:label,exact:true}).click();await page.locator('#poll-song-search').fill('Pretender');const card=page.locator('#section-community').getByRole('button',{name:'Pretenderに投票する',exact:true});const disabled=await card.isDisabled();if(!disabled)await card.click();rows.push({category:label,becameDisabled:await card.isDisabled()});}
 await page.reload({waitUntil:'networkidle'});const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')));return {rows,keys:state.votedKeys,votes:state.songs.find(s=>s.id==='pretender').votes};
});
await record('review form invalid, multiline, submit and reload',async()=>{
 await fresh(8);await page.getByRole('button',{name:'推し曲の感想・考察を投稿する',exact:true}).click();await page.getByRole('button',{name:'感想ノートに投稿する',exact:true}).click();const error=await page.getByRole('alert').innerText();
 await page.locator('#review-author').fill('検証用ユーザー');await page.locator('#review-title').fill('自動検証の一時メモ');await page.locator('#review-comment').fill('これは検証用の感想です。\n二行目を保存できるか確認します。');const inputValue=await page.locator('#review-comment').inputValue();await page.getByRole('button',{name:'感想ノートに投稿する',exact:true}).click();
 await page.reload({waitUntil:'networkidle'});await navigate(8);const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')));return {emptyError:error,inputValue,saved:state.reviews.find(r=>r.title==='自動検証の一時メモ'),image:await screenshot('reviews-saved')};
});
await record('clipboard rejected: success message accuracy',async()=>{
 const p=await context.newPage();await p.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw new DOMException('Audit denied','NotAllowedError')}}}));await p.goto(result.baseUrl);await navigate(5,p);await p.getByRole('button',{name:'セットリストをテキストでコピー',exact:true}).click();const falseSuccess=await p.getByRole('button',{name:'セットリストをコピーしました！',exact:true}).count()>0;await p.close();return {failureInjected:true,falseSuccess};
});
await record('browser history and refresh restore current screen',async()=>{
 const p=await context.newPage();await p.goto('about:blank');await p.goto(result.baseUrl);const h0=await p.evaluate(()=>history.length);await navigate(2,p);await navigate(9,p);const h1=await p.evaluate(()=>history.length);const url=p.url();await p.goBack();const backUrl=p.url();await p.close();return {historyBefore:h0,historyAfter:h1,url,backUrl};
});
await record('first-visit personal data and reset confirmation',async()=>{
 const c=await browser.newContext({viewport:{width:390,height:844}});const p=await c.newPage();await p.goto(result.baseUrl,{waitUntil:'networkidle'});const initial=await p.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')));let dialogs=0;p.on('dialog',async d=>{dialogs++;await d.dismiss();});await p.getByRole('button',{name:'保存データを初期状態に戻す',exact:true}).click();const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('higedan_fan_magazine_state_v1')));await c.close();return {initialBestQuiz:initial.bestQuizScore,initialVisited:initial.visitedSpotIds,initialAttended:initial.attendedTourIds,confirmationDialogs:dialogs,afterBestQuiz:after.bestQuizScore};
});
await record('development versus production assets',async()=>{
 const p=await context.newPage();await p.goto('http://127.0.0.1:3000',{waitUntil:'networkidle'});const images=await p.evaluate(()=>[...document.images].map(x=>({src:x.getAttribute('src'),loaded:x.complete&&x.naturalWidth>0})));await screenshot('development-home',p);await p.close();return images;
});
result.finishedAt=new Date().toISOString();save();await browser.close();
console.log(JSON.stringify({screens:result.screens.length,modals:result.modals.length,quizAnswers:result.quiz.length,diagnoses:result.diagnoses.length,cases:result.cases.map(c=>({name:c.name,status:c.status}))},null,2));
