import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const records = 'src/data/songAnnouncementRecords.json';
const allowed = new Set([records, 'discography/index.html', 'vocal-range/index.html']);
const releaseDocs = new Set(['README.md', 'docs/release-workflow.md']);

export function browserScope(rawDiff) {
  const fields = rawDiff.split('\0');
  if (fields.pop() !== '' || !fields.length || fields.length % 2 !== 0) return 'full';
  const files = [];
  for (let i = 0; i < fields.length; i += 2) {
    // 通常ファイルの内容変更だけを許可し、削除・改名・型変更は全件検証する。
    if (!/^:100644 100644 [0-9a-f]+ [0-9a-f]+ M$/.test(fields[i])) return 'full';
    files.push(fields[i + 1]);
  }
  if (files.every(file => releaseDocs.has(file))) return 'docs';
  if (files.includes(records) && files.every(file => allowed.has(file))) return 'announcements';
  if (files.length === 1 && files[0] === 'src/components/home/HomePage.tsx') return 'home';
  const tourData = ['src/data/tourArchiveRecords.json', 'src/data/tourSetlistRecords.json'];
  if (files.some(file => tourData.includes(file)) &&
      files.every(file => tourData.includes(file) || file === 'tour-archive/index.html')) return 'tour';
  return 'full';
}

export async function selectScope(env = process.env, cwd = process.cwd(), fetchMarker = fetch) {
  const mainPush = env.GITHUB_EVENT_NAME === 'push' && env.GITHUB_REF === 'refs/heads/main';
  const base = mainPush ? env.PUSH_BASE_SHA : env.PR_BASE_SHA;
  if ((!mainPush && env.GITHUB_EVENT_NAME !== 'pull_request') || !/^[0-9a-f]{40}$/.test(base ?? '')) return 'full';
  try {
    const git = (...args) => execFileSync('git', ['-c', 'safe.directory=' + cwd, ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    if (git('rev-parse', 'HEAD^1').trim() !== base) return 'full';
    const scope = browserScope(git('diff', '--raw', '--no-renames', '-z', base, 'HEAD'));
    if (!mainPush || scope === 'full') return scope;
    // 未配信の変更を取りこぼさないよう、mainの基点は本番採用版とも照合する。
    const marker = await fetchMarker('https://katakatalab.com/higedanfan/public-source-version.txt', {
      cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(4000),
    });
    return marker.ok && (await marker.text()).trim() === base ? scope : 'full';
  } catch {
    return 'full';
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(await selectScope());
}
