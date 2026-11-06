import fs from 'node:fs';
import * as data from '../src/data/higedanData';
import * as logic from '../src/utils/fanLogic';

fs.mkdirSync('audit-evidence', {recursive:true});
const songs=data.HIGEDAN_SONGS;
const questions=data.QUIZ_QUESTIONS;
const note=(v:string)=>{const m=v.match(/\(([A-G])([#b]?)(\d)/);if(!m)return null;return (Number(m[3])+1)*12+({C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]??0)+(m[2]==='#'?1:m[2]==='b'?-1:0)};
const integrity=songs.map(s=>{
 const v=s.vocalRange, low=note(v.lowestNote), chest=note(v.highestChestNote), falsetto=note(v.highestFalsettoNote);
 const expectedSpan=low!==null&&chest!==null?Math.max(chest,falsetto??chest)-low:null;
 const timestamps=[...`${v.highNoteSection} ${v.lowNoteSection}`.matchAll(/(\d+):(\d{2})/g)].map(m=>Number(m[1])*60+Number(m[2]));
 return {id:s.id,title:s.title,lowMidi:low,chestMidi:chest,falsettoMidi:falsetto,storedChestScore:v.chestSemitoneScore,storedSpan:v.rangeSpanSemitones,expectedSpan,scoreConsistent:chest===v.chestSemitoneScore,spanConsistent:expectedSpan===v.rangeSpanSemitones,timestampsBeyondDuration:timestamps.filter(t=>t>s.durationSec),generatedQuote:s.iconicLyricQuote.includes('収録曲 — '),audioAnalysisPerformed:false};
});
const criteria:any[]=[];
for(const mood of Object.keys(logic.MOOD_LABELS)) for(const situation of Object.keys(logic.SITUATION_LABELS)) for(const sound of Object.keys(logic.SOUND_LABELS)){
 const c:any={mood,situation,sound};const results=logic.scoreSongsByMood(songs,c);
 criteria.push({criteria:c,top3:results.slice(0,3).map(r=>({id:r.song.id,title:r.song.title,score:r.matchScore,breakdown:r.matchBreakdown}))});
}
const sources=questions.flatMap(q=>q.sources.map((s,i)=>({questionId:q.id,sourceIndex:i+1,...s})));
const catalog={baseline:'04857ef1f88bcb9b788a2bc260eb6d58419d19d9',songs,questions,sources,tours:data.TOUR_ARCHIVES,spots:data.SACRED_SPOTS,members:data.HIGEDAN_MEMBERS,integrity,diagnoses:criteria};
fs.writeFileSync('audit-evidence/catalog.json',JSON.stringify(catalog,null,2));
const summary={songs:songs.length,questions:questions.length,sourceEntries:sources.length,uniqueSourceUrls:new Set(sources.map(s=>s.url)).size,duplicateSongIds:songs.filter((s,i)=>songs.findIndex(x=>x.id===s.id)!==i).map(s=>s.id),numericChestMismatch:integrity.filter(s=>!s.scoreConsistent).length,numericSpanMismatch:integrity.filter(s=>!s.spanConsistent).length,timestampsBeyondDuration:integrity.filter(s=>s.timestampsBeyondDuration.length).length,generatedQuotes:integrity.filter(s=>s.generatedQuote).length,diagnosisCombinations:criteria.length,distinctDiagnosisWinners:new Set(criteria.map(c=>c.top3[0].id)).size,orderingQuestions:questions.filter(q=>q.questionType==='ordering').length};
fs.writeFileSync('audit-evidence/catalog-summary.json',JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
