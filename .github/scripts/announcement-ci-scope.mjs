import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const records = 'src/data/songAnnouncementRecords.json';
const allowed = new Set([records, 'discography/index.html', 'vocal-range/index.html']);

export function announcementDataOnly(rawDiff) {
  const fields = rawDiff.split('\0');
  if (fields.pop() !== '' || fields.length % 2 !== 0) return false;
  let changedRecords = false;
  for (let i = 0; i < fields.length; i += 2) {
    // 通常ファイルの内容変更だけを許可し、削除・改名・型変更は全件検証する。
    if (!/^:100644 100644 [0-9a-f]+ [0-9a-f]+ M$/.test(fields[i]) || !allowed.has(fields[i + 1])) return false;
    if (fields[i + 1] === records) changedRecords = true;
  }
  return changedRecords;
}

function selectScope() {
  const base = process.env.PR_BASE_SHA;
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request' || !/^[0-9a-f]{40}$/.test(base ?? '')) return 'full';
  try {
    const git = (...args) => execFileSync('git', ['-c', 'safe.directory=' + process.cwd(), ...args], { encoding: 'utf8' });
    if (git('rev-parse', 'HEAD^1').trim() !== base) return 'full';
    return announcementDataOnly(git('diff', '--raw', '--no-renames', '-z', base, 'HEAD')) ? 'announcements' : 'full';
  } catch {
    return 'full';
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(selectScope());
}
