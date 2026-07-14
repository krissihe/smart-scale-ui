import React from "react";
import { Scale, Camera, Smartphone } from "lucide-react";
import welcomeLogo from "@/assets/logo.png";
import iPhoneImage from "@/assets/iPhone-transparent.png";

export default function WelcomeScreen({
  onNext,
  onSkip,
  profile,
}: {
  onNext: () => void;
  onSkip?: () => void;
  profile?: { name?: string } | null;
}) {
  const headline = profile ? `Willkommen, ${profile.name}` : "Schön, dass du da bist.";
  const subtext = "In nur wenigen Schritten ist deine Smart Scale bereit.";

  return (
    <div
      style={{
        flex: 1,
        background: "#f7f8fa",
        padding: "26px 34px",
        display: "grid",
        gridTemplateColumns: "1fr 0.95fr",
        alignItems: "center",
        gap: 24,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
      }}
    >
      <div
        style={{
          minHeight: 240,
          borderRadius: 26,
          background: "linear-gradient(145deg,#fff,#D7F3FD)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(44,206,245,.12)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={welcomeLogo}
            alt="Smart Scale"
            style={{ width: 180, height: "auto", objectFit: "contain" }}
          />
          <div style={{ marginTop: 18 }}>
            <img
              src={iPhoneImage}
              alt="Device"
              style={{ width: 220, height: "auto", objectFit: "contain", opacity: 0.95 }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "flex-start", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#D7F3FD", display: "grid", placeItems: "center" }}>
              <Scale />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#DCFCE7", display: "grid", placeItems: "center" }}>
              <Camera />
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F3F4F6", display: "grid", placeItems: "center" }}>
              <Smartphone />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 750, color: "#2CCEF5", marginBottom: 8 }}>WILLKOMMEN</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#101828", marginBottom: 10 }}>{headline}</div>
            <div style={{ fontSize: 14, color: "#475569", maxWidth: 460 }}>{subtext}</div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={onNext}
            style={{
              background: "#2CCEF5",
              color: "#fff",
              border: "none",
              padding: "12px 14px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Einrichtung starten
          </button>
          {onSkip && (
            <button
              onClick={onSkip}
              style={{
                background: "transparent",
                color: "#475569",
                border: "1px solid rgba(0,0,0,0.06)",
                padding: "10px 12px",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              Später einrichten
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
