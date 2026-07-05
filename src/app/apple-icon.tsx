import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="white"/>
  <defs>
    <linearGradient id="kg" gradientUnits="userSpaceOnUse" x1="256" y1="100" x2="256" y2="412">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="55%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#4ade80"/>
    </linearGradient>
  </defs>
  <line x1="185" y1="100" x2="185" y2="412" stroke="url(#kg)" stroke-width="32" stroke-linecap="round"/>
  <line x1="185" y1="256" x2="360" y2="100" stroke="url(#kg)" stroke-width="32" stroke-linecap="round"/>
  <line x1="185" y1="256" x2="360" y2="412" stroke="url(#kg)" stroke-width="32" stroke-linecap="round"/>
</svg>`;

export default function AppleIcon() {
  const src = `data:image/svg+xml;base64,${Buffer.from(SVG).toString('base64')}`;
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={180} height={180} alt="" />
    </div>,
    { width: 180, height: 180 }
  );
}
