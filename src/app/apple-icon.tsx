import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 38,
        }}
      >
        <div
          style={{
            fontSize: 132,
            fontWeight: 900,
            background: 'linear-gradient(150deg, #3b82f6 0%, #06b6d4 45%, #22c55e 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            lineHeight: 1,
            letterSpacing: -2,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          K
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
