import React, { useEffect, useState } from "react";

export default function VirtualKeyboard({
  onInput,
  onBackspace,
  onEnter,
  onClose,
  mode = "text",
}: {
  value?: string;
  onInput: (ch: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onClose?: () => void;
  mode?: "text" | "numeric";
  masked?: boolean;
}) {
  const [shift, setShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  useEffect(() => {
    setShift(false);
    setCapsLock(false);
  }, [mode]);

  const rows =
    mode === "numeric"
      ? ["123", "456", "789", "0"]
      : ["qwertzuiopü", "asdfghjklöä", "yxcvbnmß"];

  const enterCharacter = (character: string) => {
    onInput(
      shift || capsLock
        ? character.toLocaleUpperCase("de-DE")
        : character,
    );
    if (shift && !capsLock) setShift(false);
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 300,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div
        data-virtual-keyboard="true"
        style={{
          width: mode === "numeric" ? 220 : 390,
          maxWidth: "100%",
          borderRadius: "12px 12px 0 0",
          padding: 5,
          background: "var(--c-elevated)",
          border: "1px solid var(--c-border)",
          boxShadow: "0 18px 46px rgba(0,0,0,0.24)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 3 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", color: "var(--c-gray2)", cursor: "pointer", fontSize: 10, padding: "2px 4px" }}
            >
              Schließen
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "center", gap: 4 }}>
              {r.split("").map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => enterCharacter(ch)}
                  style={{
                    minWidth: mode === "numeric" ? 49 : 28,
                    height: 24,
                    borderRadius: 6,
                    border: "1px solid var(--c-border)",
                    background: "var(--c-muted)",
                    color: "var(--c-gray1)",
                    fontSize: mode === "numeric" ? 14 : 12,
                    cursor: "pointer",
                  }}
                >
                  {shift || capsLock
                    ? ch.toLocaleUpperCase("de-DE")
                    : ch}
                </button>
              ))}
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {mode === "text" && (
              <>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    if (capsLock) {
                      setCapsLock(false);
                      setShift(false);
                    } else if (shift) {
                      setCapsLock(true);
                      setShift(false);
                    } else {
                      setShift(true);
                    }
                  }}
                  aria-label={
                    capsLock
                      ? "Dauerhafte Großschreibung deaktivieren"
                      : shift
                        ? "Dauerhafte Großschreibung aktivieren"
                        : "Nächsten Buchstaben großschreiben"
                  }
                  aria-pressed={shift || capsLock}
                  title="Umschalttaste"
                  style={{ width: 48, height: 26, borderRadius: 6, border: `1px solid ${shift || capsLock ? "var(--c-blue)" : "var(--c-border)"}`, background: capsLock ? "var(--c-blue-strong)" : shift ? "var(--c-blue)" : "var(--c-muted)", color: shift || capsLock ? "#fff" : "var(--c-gray1)", cursor: "pointer", fontSize: 17, fontWeight: 800 }}
                >
                  {capsLock ? "⇪" : "⇧"}
                </button>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onInput(" ")}
                  style={{ flex: 1, height: 26, borderRadius: 6, border: "1px solid var(--c-border)", background: "var(--c-muted)", color: "var(--c-gray1)", cursor: "pointer", fontSize: 10 }}
                >
                  Leertaste
                </button>
              </>
            )}
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onBackspace}
              style={{ width: 58, height: 26, borderRadius: 6, border: "1px solid var(--c-border)", background: "var(--c-muted)", color: "var(--c-gray1)", cursor: "pointer" }}
            >
              ⌫
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onEnter}
              style={{ width: 68, height: 26, borderRadius: 6, border: "none", background: "var(--c-blue)", color: "#fff", cursor: "pointer", fontSize: 10 }}
            >
              Fertig
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
