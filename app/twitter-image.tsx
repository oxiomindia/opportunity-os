import { ImageResponse } from 'next/og';

export const alt = 'Oxiom | Finance Automation Platform for Accounts Payable & Receivable';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#0f172a',
          padding: '80px',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 88,
            height: 88,
            borderRadius: 16,
            background: '#2563eb',
            color: 'white',
            fontSize: 52,
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          O
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: 'white', lineHeight: 1.15 }}>
          Oxiom
        </div>
        <div style={{ display: 'flex', marginTop: 20, fontSize: 32, color: '#cbd5e1', maxWidth: 900 }}>
          Finance automation for Accounts Payable, Accounts Receivable, and Finance Suite
        </div>
      </div>
    ),
    { ...size }
  );
}
