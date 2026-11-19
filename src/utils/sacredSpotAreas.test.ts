import assert from 'node:assert/strict';
import test from 'node:test';
import { HISTORICAL_SACRED_SPOTS, SACRED_SPOTS } from '../data/higedanData';
import { getSacredSpotRegion, SACRED_SPOT_REGIONS } from './sacredSpotAreas';

test('all active and historical sacred spots map to a valid region bucket', () => {
  const validRegions = new Set(SACRED_SPOT_REGIONS.filter(r => r.id !== 'all').map(r => r.id));
  const counts = new Map<string, number>();

  for (const spot of [...SACRED_SPOTS, ...HISTORICAL_SACRED_SPOTS]) {
    const region = getSacredSpotRegion(spot.area);
    assert.ok(validRegions.has(region), `unexpected region for ${spot.area}`);
    counts.set(region, (counts.get(region) ?? 0) + 1);
  }

  assert.ok((counts.get('sanin') ?? 0) > 0);
  assert.ok((counts.get('kanto') ?? 0) > 0);
  assert.ok((counts.get('domestic_other') ?? 0) > 0);
  assert.ok((counts.get('overseas') ?? 0) > 0);

  assert.equal(getSacredSpotRegion('島根・松江'), 'sanin');
  assert.equal(getSacredSpotRegion('横浜・スタジアム'), 'kanto');
  assert.equal(getSacredSpotRegion('大阪・長居'), 'domestic_other');
  assert.equal(getSacredSpotRegion('台湾・台北'), 'overseas');
});
