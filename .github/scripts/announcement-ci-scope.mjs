import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const records = 'src/data/songAnnouncementRecords.json';
const allowed = new Set([records, 'discography/index.html', 'vocal-range/index.html']);

export function browserScope(rawDiff) {
  const fields = rawDiff.split('\0');
  if (fields.pop() !== '' || !fields.length || fields.length % 2 !== 0) return 'full';
  const files = [];
  for (let i = 0; i < fields.length; i += 2) {
    // 通常ファイルの内容変更だけを許可し、削除・改名・型変更は全件検証する。
    if (!/^:100644 100644 [0-9a-f]+ [0-9a-f]+ M$/.test(fields[i])) return 'full';
    files.push(fields[i + 1]);
  }
  if (files.includes(records) && files.every(file => allowed.has(file))) return 'announcements';
  if (files.length === 1 && files[0] === 'src/components/home/HomePage.tsx') return 'home';
  const tourData = ['src/data/tourArchiveRecords.json', 'src/data/tourSetlistRecords.json'];
  if (files.some(file => tourData.includes(file)) &&
      files.every(file => tourData.includes(file) || file === 'tour-archive/index.html')) return 'tour';
  return 'full';
}

function selectScope() {
  const base = process.env.PR_BASE_SHA;
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request' || !/^[0-9a-f]{40}$/.test(base ?? '')) return 'full';
  try {
    const git = (...args) => execFileSync('git', ['-c', 'safe.directory=' + process.cwd(), ...args], { encoding: 'utf8' });
    if (git('rev-parse', 'HEAD^1').trim() !== base) return 'full';
    return browserScope(git('diff', '--raw', '--no-renames', '-z', base, 'HEAD'));
  } catch {
    return 'full';
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(selectScope());
}
