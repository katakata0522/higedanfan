"""Private audit of public store previews. Audio is temporary and never uploaded.
A preview is not a full recording. No vocal extrema, chest/falsetto attribution,
or modulation count is certified from accompaniment or a preview.
"""
import os, json, re, math, hashlib, tempfile, subprocess, time, unicodedata
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import numpy as np
import scipy.signal
import requests
import librosa

OUT=Path('audio-evidence'); OUT.mkdir(exist_ok=True)
CAT=json.loads(Path('audit-evidence/catalog.json').read_text())
META=json.loads(Path('audit-evidence/audio-source-availability.json').read_text())
tracks=META.get('tracks',[])
norm=lambda x:re.sub(r"[\s・…！!？?.,’'\"〜～~‐–—-]",'',unicodedata.normalize('NFKC',x).lower())
results=[]
# This is an access test of one publicly published official video, not a claim
# that all recordings were obtained. Do not use cookies, accounts, proxies,
# CAPTCHA solvers or authentication/DRM bypasses.
full_source={'url':'https://www.youtube.com/watch?v=TQ8WlA2GXbk','officialSourceEvidence':'https://news.ponycanyon.co.jp/2019/05/31974','status':'not-tested','fullAudioAnalysed':False}
try:
 cmd=['yt-dlp','--skip-download','--dump-single-json','--no-playlist','--socket-timeout','15','--retries','0','https://www.youtube.com/watch?v=TQ8WlA2GXbk']
 p=subprocess.run(cmd,capture_output=True,text=True,timeout=60)
 full_source['exitCode']=p.returncode
 full_source['error']=p.stderr[-4000:]
 if p.returncode==0:
  v=json.loads(p.stdout);full_source.update(status='metadata-accessible',title=v.get('title'),uploader=v.get('uploader'),channelId=v.get('channel_id'),duration=v.get('duration'),audioFormatCount=sum(1 for f in v.get('formats',[]) if f.get('acodec') not in [None,'none']))
 else:full_source['status']='access-unavailable'
except Exception as e:full_source.update(status='access-unavailable',error=str(e))
(OUT/'full-recording-access.json').write_text(json.dumps(full_source,ensure_ascii=False,indent=2))

session=requests.Session();session.headers['User-Agent']='HigedanFanSite-PrivateAudit/1.0'
def choose(s):
 expected='可能性' if s['id']=='kanousei-song' else 'Anarchy (Rejoice ver.)' if s['id']=='anarchy-song' else s['title']
 candidates=[t for t in tracks if norm(t['trackName'])==norm(expected) and not re.search(r'live|tour|stadium|instrumental|karaoke',t['collectionName']+' '+t['trackName'],re.I)]
 expected_album={'ミックスナッツ EP':'ミックスナッツEP',"What's Going On? EP":"What's Going On?"}.get(s['album'],s['album'])
 candidates.sort(key=lambda t:t['collectionName']!=expected_album)
 return candidates[0] if candidates else None

def analyze(s):
 start=time.time();t=choose(s)
 row={'id':s['id'],'title':s['title'],'siteBpm':s['bpm'],'siteDurationSec':s['durationSec'],'fullRecordingAnalyzed':False,'vocalExtremaVerified':False,'chestFalsettoVerified':False,'modulationCountVerified':False,'scope':'store-preview-only'}
 if not t:return dict(row,status='no-matching-preview')
 row['recording']={k:t.get(k) for k in ['trackId','trackName','artistName','collectionName','trackTimeMillis','releaseDate','trackViewUrl','previewUrl']}
 row['matchNote']='Anarchy mapped to Rejoice ver. because the site assigns Rejoice M11; original version must be kept separate.' if s['id']=='anarchy-song' else 'Producer credit omitted from storefront track title; album and track identity matched.' if s['id']=='kanousei-song' else 'Title and studio recording identity matched; album selected when available.'
 try:
  u=t.get('previewUrl');assert u and u.startswith('https://audio-ssl.itunes.apple.com/')
  response=session.get(u,timeout=25);row['httpStatus']=response.status_code;response.raise_for_status()
  audio=response.content
  if len(audio)>10000000:raise ValueError('Preview unexpectedly exceeds 10 MB')
  row['audioSha256']=hashlib.sha256(audio).hexdigest();row['byteCount']=len(audio)
  with tempfile.TemporaryDirectory() as d:
   src=Path(d)/'preview.m4a';wav=Path(d)/'preview.wav';src.write_bytes(audio)
   p=subprocess.run(['ffmpeg','-v','error','-i',str(src),'-ac','1','-ar','22050','-f','wav',str(wav)],capture_output=True,timeout=30)
   if p.returncode:raise ValueError(p.stderr.decode()[-400:])
   y,sr=librosa.load(wav,sr=22050,mono=True)
   duration=len(y)/sr
   row['decodedPreviewSeconds']=round(duration,3)
   row['fullTrackMetadataSeconds']=round(t.get('trackTimeMillis',0)/1000,3)
   row['coverageFraction']=round(duration/(t['trackTimeMillis']/1000),4) if t.get('trackTimeMillis') else None
   row['timelineOffsetKnown']=False
   row['rmsDbfs']=round(float(20*np.log10(max(np.sqrt(np.mean(y*y)),1e-12))),2)
   row['samplePeakDbfs']=round(float(20*np.log10(max(np.max(np.abs(y)),1e-12))),2)
   onset=librosa.onset.onset_strength(y=y,sr=sr,hop_length=512)
   tempo,beats=librosa.beat.beat_track(onset_envelope=onset,sr=sr,hop_length=512)
   est=float(np.asarray(tempo).reshape(-1)[0]);row['estimatedBeatTempo']=round(est,2);row['detectedBeats']=len(beats)
   ac=librosa.autocorrelate(onset,max_size=min(len(onset),int(sr/512*2)))
   peaks,_=scipy.signal.find_peaks(ac)
   vals=[]
   for n in peaks:
    if n==0:continue
    bpm=60*sr/(512*n)
    if 55<=bpm<=240:vals.append((float(ac[n]),float(bpm)))
   vals.sort(reverse=True)
   row['tempoCandidates']=[{'bpm':round(bpm,2),'relativeStrength':round(score/max(ac[0],1e-9),3)}for score,bpm in vals[:5]]
   candidates=[est]+[v[1] for v in vals[:5]]
   nearest=min((abs(math.log2(max(v,1)/s['bpm'])-round(math.log2(max(v,1)/s['bpm']))),v)for v in candidates)
   row['siteTempoCompatibleWithCandidateWithin3Percent']=nearest[0] < math.log2(1.03)
   row['closestTempoCandidateOctaveEquivalent']=round(nearest[1],2)
   # A mixed-track tonal profile is NOT a vocal pitch range and NOT a key-change count.
   chroma=librosa.feature.chroma_stft(y=y,sr=sr,hop_length=1024)
   row['mixedAudioChromaProfile']=[round(float(v),4)for v in chroma.mean(axis=1)]
   row['analysisCaveat']='Automatic tempo candidates from a partial mixed recording; octave/half-time ambiguity and beat changes remain. No whole-track claim, no vocal-range/chest/falsetto/modulation verdict.'
   row['status']='preview-measured'
 except Exception as e:row.update(status='analysis-error',error=str(e))
 row['elapsedSeconds']=round(time.time()-start,2)
 return row

# Initialize JIT once before using two bounded workers.
librosa.onset.onset_strength(y=np.zeros(22050),sr=22050)
with ThreadPoolExecutor(max_workers=2) as pool:
 for row in pool.map(analyze,CAT['songs']):
  results.append(row)
  (OUT/'audio-preview-analysis.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
  print(json.dumps({k:row.get(k) for k in ['id','title','status','decodedPreviewSeconds','estimatedBeatTempo']},ensure_ascii=False),flush=True)
summary={'songsRequested':86,'previewMeasured':sum(r['status']=='preview-measured' for r in results),'fullRecordingsAnalyzed':0,'vocalExtremaVerified':0,'modulationCountsVerified':0,'records':len(results),'totalPreviewSeconds':round(sum(r.get('decodedPreviewSeconds',0)for r in results),3),'audioFilesRetained':False,'method':'librosa 0.11.0 onset autocorrelation and dynamic-programming beat tracker; partial mixed audio only','fullSourceAccess':full_source}
(OUT/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False,indent=2))
