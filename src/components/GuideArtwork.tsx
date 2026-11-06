import type { ImgHTMLAttributes } from 'react';

// サイト独自の幾何学模様。公式ジャケットや公演写真は使用しない。
export function GuideArtwork({src, className, alt}: ImgHTMLAttributes<HTMLImageElement>) {
  const themes: [string,string,string][] = [
    ['rejoice','#d16638','#592243'], ['editorial','#384a55','#a0b7a4'],
    ['traveler','#bc8549','#133b53'], ['same_blue','#82bade','#254f86'],
    ['matsue','#e3a375','#355e70'], ['stadium','#e6a652','#69394b']
  ];
  const [,a,b] = themes.find(([key])=>String(src).includes(key)) ?? ['', '#af7251','#453841'];
  return <span role="img" aria-label={String(alt || 'ファンノートのイメージ図柄')}
    className={(className || '')+' block'} style={{backgroundColor:b,
    backgroundImage: 'radial-gradient(ellipse at 75% 22%, '+a+' 0 9%, transparent 10%), repeating-radial-gradient(ellipse at 10% 120%, transparent 0 8px, #ffffff30 9px 10px, transparent 11px 18px), linear-gradient(145deg,'+a+','+b+' 65%)'}} />;
}
