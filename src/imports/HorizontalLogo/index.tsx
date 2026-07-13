import logo from "@/assets/logo.png";

export default function HorizontalLogo() {
  return (
    <div className="relative" style={{ minHeight: 52 }}>
      <img
        src={logo}
        alt="Smart Scale"
        className="absolute inset-0 block"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}
