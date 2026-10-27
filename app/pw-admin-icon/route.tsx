import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0369A1',
          color: '#FFFFFF',
          fontSize: 190,
          fontWeight: 800,
          letterSpacing: '-18px',
          paddingRight: '18px',
        }}
      >
        PW
      </div>
    ),
    { width: 512, height: 512 }
  );
}
