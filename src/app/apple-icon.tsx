import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="white"/>
  <defs>
    <linearGradient id="barGrad" gradientUnits="userSpaceOnUse" x1="116" y1="84" x2="116" y2="428">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="55%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#4ade80"/>
    </linearGradient>
    <linearGradient id="topArmGrad" gradientUnits="userSpaceOnUse" x1="190" y1="256" x2="414" y2="96">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#2563eb"/>
    </linearGradient>
    <linearGradient id="bottomArmGrad" gradientUnits="userSpaceOnUse" x1="190" y1="256" x2="414" y2="416">
      <stop offset="0%" stop-color="#2dd4bf"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>
  </defs>
  <rect x="72" y="84" width="88" height="344" rx="20" fill="url(#barGrad)"/>
  <polygon points="164,220 388,60 440,132 216,292" fill="url(#topArmGrad)"/>
  <polygon points="216,220 440,380 388,452 164,292" fill="url(#bottomArmGrad)"/>
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
