import { editorialShard1 } from './editorial/shard1';
import { editorialShard2 } from './editorial/shard2';
import { editorialShard3 } from './editorial/shard3';
import { editorialShard4 } from './editorial/shard4';
import { editorialShard5 } from './editorial/shard5';
import { editorialShard6 } from './editorial/shard6';
import type { SongEditorial } from './editorial/types';

export type { SongEditorial };

// Each article is written for the specific recording used by the guide.
export const editorialArticles: Record<string, SongEditorial> = {
  ...editorialShard1,
  ...editorialShard2,
  ...editorialShard3,
  ...editorialShard4,
  ...editorialShard5,
  ...editorialShard6,
};
