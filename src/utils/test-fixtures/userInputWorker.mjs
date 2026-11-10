import { parentPort, workerData } from 'node:worker_threads';
import { tsImport } from 'tsx/esm/api';

const { parseFanRecordBackup } = await tsImport(workerData.backupUrl, import.meta.url);
const { restoreFanRecords } = await tsImport(workerData.storageUrl, import.meta.url);
parentPort.postMessage({ ready: true });
parentPort.once('message', cases => {
  const results = cases.map(({ raw, restoreOnly }) => {
    try {
      const restored = restoreOnly ? restoreFanRecords(raw) : parseFanRecordBackup(raw);
      return { accepted: true, title: restored.setlistTitle };
    } catch { return { accepted: false }; }
  });
  parentPort.postMessage({ results });
});
