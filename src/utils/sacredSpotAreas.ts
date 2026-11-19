export type SacredSpotRegion = 'all' | 'sanin' | 'kanto' | 'domestic_other' | 'overseas';

export const SACRED_SPOT_REGIONS: readonly { id: SacredSpotRegion; label: string }[] = [
  { id: 'all', label: 'すべてのエリア' },
  { id: 'sanin', label: '山陰（島根・鳥取）' },
  { id: 'kanto', label: '関東' },
  { id: 'domestic_other', label: '北海道・中部・関西' },
  { id: 'overseas', label: '海外' },
];

export function getSacredSpotRegion(area: string): Exclude<SacredSpotRegion, 'all'> {
  if (/^(島根|鳥取)/.test(area)) return 'sanin';
  if (/^(東京|横浜|神奈川|茨城|千葉|埼玉|群馬|栃木)/.test(area)) return 'kanto';
  if (/^(台湾|グアム|アメリカ)/.test(area)) return 'overseas';
  return 'domestic_other';
}
