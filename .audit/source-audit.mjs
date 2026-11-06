import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('audit-evidence/catalog.json','utf8'));
const results=[];
const htmlText=s=>s.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const urls=[...new Set(catalog.sources.map(s=>s.url))];
for(const url of urls){
 const row={url,entries:catalog.sources.filter(s=>s.url===url).map(s=>`${s.questionId}-${s.sourceIndex}`)};
 try{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||/^(localhost|127\.|10\.|192\.168\.|169\.254\.)/.test(parsed.hostname))throw new Error('Non-public HTTPS URL rejected');
  row.linkKind=parsed.pathname==='/'?'site-home':/\/artist\/|\/artists\/|\/\@/.test(parsed.pathname)?'artist-index':'specific-path';
  const res=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'HigedanFanSite-QA/1.0 (citation validation)'}});
  row.status=res.status;row.finalUrl=res.url;row.contentType=res.headers.get('content-type');
  const text=(await res.text()).slice(0,1000000);
  row.pageTitle=htmlText(text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??'');
  row.firstHeading=htmlText(text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]??'').slice(0,160);
  row.mentionsBand=/Official髭男dism|Official HIGE|ヒゲダン/i.test(text);
  row.challengeDetected=/Just a moment|Access Denied|Checking your browser/i.test(row.pageTitle);
 }catch(e){row.error=String(e)}
 results.push(row);fs.writeFileSync('audit-evidence/source-http.json',JSON.stringify(results,null,2));
}
const lookup={method:'Apple iTunes public search/lookup metadata. Preview is NOT a full recording and cannot validate full-track vocal extrema or modulation counts.',requests:[],tracks:[],matches:[]};
const norm=s=>s.normalize('NFKC').toLowerCase().replace(/[\s・…！!？?.,’'"〜～~‐–—-]/g,'');
async function getJson(url){const res=await fetch(url,{signal:AbortSignal.timeout(20000)});lookup.requests.push({url,status:res.status});if(!res.ok)throw new Error(`HTTP ${res.status}`);return res.json()}
try{
 let json=await getJson('https://itunes.apple.com/search?term='+encodeURIComponent('Official髭男dism')+'&country=jp&media=music&entity=song&limit=200');
 const trackMap=new Map();for(const t of json.results??[])if(t.kind==='song'&&/Official髭男dism/i.test(t.artistName??''))trackMap.set(t.trackId,t);
 for(const s of catalog.songs){
  let matches=[...trackMap.values()].filter(t=>norm(t.trackName)===norm(s.title)&&!/(live|tour|stadium|instrumental|karaoke)/i.test(`${t.trackName} ${t.collectionName}`));
  if(!matches.length){
   try{const more=await getJson('https://itunes.apple.com/search?term='+encodeURIComponent('Official髭男dism '+s.title)+'&country=jp&media=music&entity=song&limit=25');for(const t of more.results??[])if(t.kind==='song'&&/Official髭男dism/i.test(t.artistName??''))trackMap.set(t.trackId,t);matches=[...trackMap.values()].filter(t=>norm(t.trackName)===norm(s.title)&&!/(live|tour|stadium|instrumental|karaoke)/i.test(`${t.trackName} ${t.collectionName}`));await new Promise(r=>setTimeout(r,500));}catch(e){lookup.requests.push({song:s.id,error:String(e)})}
  }
  matches.sort((a,b)=>Number(b.collectionName===s.album)-Number(a.collectionName===s.album));
  lookup.matches.push({id:s.id,title:s.title,siteDurationSec:s.durationSec,siteReleaseDate:s.releaseDate,matchCount:matches.length,versions:matches.map(t=>({trackId:t.trackId,trackName:t.trackName,artistName:t.artistName,collectionName:t.collectionName,trackNumber:t.trackNumber,trackTimeMillis:t.trackTimeMillis,releaseDate:t.releaseDate,trackViewUrl:t.trackViewUrl,previewUrl:t.previewUrl})),fullRecordingAvailable:false});
  fs.writeFileSync('audit-evidence/audio-source-availability.json',JSON.stringify(lookup,null,2));
 }
 lookup.tracks=[...trackMap.values()].map(t=>({trackId:t.trackId,trackName:t.trackName,artistName:t.artistName,collectionName:t.collectionName,trackTimeMillis:t.trackTimeMillis,releaseDate:t.releaseDate,trackViewUrl:t.trackViewUrl,previewUrl:t.previewUrl}));
}catch(e){lookup.error=String(e);lookup.matches=catalog.songs.map(s=>({id:s.id,title:s.title,fullRecordingAvailable:false,status:'lookup-unavailable'}));}
fs.writeFileSync('audit-evidence/audio-source-availability.json',JSON.stringify(lookup,null,2));
console.log(JSON.stringify({sourceEntries:catalog.sources.length,uniqueUrls:urls.length,httpChecked:results.length,audioMetadataMatches:lookup.matches.filter(x=>x.matchCount>0).length,fullAudioAnalysed:0},null,2));
