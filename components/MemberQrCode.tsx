"use client";

import { QRCodeSVG } from "qrcode.react";

export function memberCardPayload(cardId: string) {
  return `SVFERMI:MEMBER:v1:${cardId}`;
}

export default function MemberQrCode({
  cardId,
  enabled = true,
  size = 112,
}: {
  cardId?: string | null;
  enabled?: boolean;
  size?: number;
}) {
  if (!enabled || !cardId) {
    return <div className="member-qr-unavailable" aria-label="Ledenpas QR-code niet beschikbaar">QR niet beschikbaar</div>;
  }

  return (
    <div className="member-qr-code" aria-label="Persoonlijke QR-code van de ledenpas">
      <QRCodeSVG
        value={memberCardPayload(cardId)}
        size={size}
        level="M"
        marginSize={1}
        bgColor="#fff9f0"
        fgColor="#06283b"
        title="S.V. Fermi ledenpas"
      />
    </div>
  );
}
