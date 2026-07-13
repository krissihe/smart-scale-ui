import logo from "@/assets/logo.png";

export default function AppIcon() {
  return (
    <div className="relative size-full" data-name="AppIcon">
      <img
        src={logo}
        alt="Smart Scale"
        className="absolute inset-0 block"
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    </div>
  );
}
