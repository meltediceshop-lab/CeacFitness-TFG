import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="white"/>
  <defs>
    <linearGradient id="kg" gradientUnits="userSpaceOnUse" x1="181.49" y1="-305.36" x2="181.49" y2="0">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#4ade80"/>
    </linearGradient>
  </defs>
  <g transform="translate(74.51,408.68)">
    <path d="M198.72-164.06L324.02 0L227.43 0L136.17-122.23L117.71-99.87L117.71 0L38.96 0L38.96-305.36L117.71-305.36L117.71-167.14L226.82-305.36L318.08-305.36Z" fill="url(#kg)"/>
  </g>
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
