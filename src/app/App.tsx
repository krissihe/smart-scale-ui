import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Wifi,
  Battery,
  ChevronLeft,
  Check,
  X,
  User,
  Settings,
  Search,
  Star,
  Smartphone,
  Edit,
  Sun,
  RefreshCw,
  Info,
  Trash2,
  Bell,
  Shield,
  Zap,
  Plus,
  Scale,
  History,
  Camera,
  List,
  AlertTriangle,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import AppIconRaw from "@/imports/AppIcon/index";
import HorizontalLogoRaw from "@/imports/HorizontalLogo/index";
import ContainerRaw from "@/imports/Container/index";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Screen =
  | "boot"
  | "onboarding-welcome"
  | "onboarding-explain"
  | "onboarding-ready"
  | "returning-user"
  | "profile-selection"
  | "create-profile"
  | "login"
  | "home"
  | "manual-weigh"
  | "food-detection"
  | "low-confidence"
  | "recognition-result"
  | "confirmation"
  | "tracking-animation"
  | "success"
  | "standby"
  | "guest-weighing"
  | "history"
  | "profile-screen"
  | "settings";

type Dialog =
  | "food-select"
  | "calorie-goal"
  | "guest-mode"
  | null;
type WeighMode = "ki" | "manual" | "scale-only";
type GuestMode = "smart" | "scale-only";

interface ProfileData {
  id: string;
  name: string;
  initials: string;
  goal: string;
  calories: number;
  lastSync: string;
  color: string;
}

interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  caloriesPer100g: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  confidence: number;
  image?: string;
}

// ─── Static Data ───────────────────────────────────────────────────────────────

const PROFILES: ProfileData[] = [
  {
    id: "1",
    name: "Kristina",
    initials: "K",
    goal: "Gewicht verlieren",
    calories: 1600,
    lastSync: "heute",
    color: "#EC4899",
  },
  {
    id: "2",
    name: "Daniel",
    initials: "D",
    goal: "Muskelaufbau",
    calories: 2800,
    lastSync: "vor 2 Tagen",
    color: "#3B82F6",
  },
  {
    id: "3",
    name: "Emma",
    initials: "E",
    goal: "Gewicht halten",
    calories: 1900,
    lastSync: "vor 1 Woche",
    color: "#8B5CF6",
  },
];

const FOOD_DB: Record<string, FoodItem[]> = {
  Obst: [
    {
      id: "apple",
      name: "Apfel",
      emoji: "🍎",
      caloriesPer100g: 52,
      protein: 0.3,
      fat: 0.2,
      carbs: 14,
      fiber: 2.4,
      confidence: 97,
      image:
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=480&h=480&fit=crop&auto=format",
    },
    {
      id: "banana",
      name: "Banane",
      emoji: "🍌",
      caloriesPer100g: 89,
      protein: 1.1,
      fat: 0.3,
      carbs: 23,
      fiber: 2.6,
      confidence: 96,
      image:
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=480&h=480&fit=crop&auto=format",
    },
    {
      id: "kiwi",
      name: "Kiwi",
      emoji: "🥝",
      caloriesPer100g: 61,
      protein: 1.1,
      fat: 0.5,
      carbs: 15,
      fiber: 3.0,
      confidence: 93,
    },
    {
      id: "orange",
      name: "Orange",
      emoji: "🍊",
      caloriesPer100g: 47,
      protein: 0.9,
      fat: 0.1,
      carbs: 12,
      fiber: 2.4,
      confidence: 95,
      image:
        "https://images.unsplash.com/photo-1547514701-42782101795e?w=480&h=480&fit=crop&auto=format",
    },
    {
      id: "grapes",
      name: "Weintrauben",
      emoji: "🍇",
      caloriesPer100g: 69,
      protein: 0.7,
      fat: 0.2,
      carbs: 18,
      fiber: 0.9,
      confidence: 84,
    },
    {
      id: "strawberry",
      name: "Erdbeere",
      emoji: "🍓",
      caloriesPer100g: 32,
      protein: 0.7,
      fat: 0.3,
      carbs: 8,
      fiber: 2.0,
      confidence: 91,
      image:
        "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=480&h=480&fit=crop&auto=format",
    },
  ],
  Gemüse: [
    {
      id: "cucumber",
      name: "Gurke",
      emoji: "🥒",
      caloriesPer100g: 15,
      protein: 0.7,
      fat: 0.1,
      carbs: 3.6,
      fiber: 0.5,
      confidence: 94,
    },
    {
      id: "pepper",
      name: "Paprika",
      emoji: "🫑",
      caloriesPer100g: 31,
      protein: 1.0,
      fat: 0.3,
      carbs: 6,
      fiber: 2.1,
      confidence: 92,
    },
    {
      id: "tomato",
      name: "Tomate",
      emoji: "🍅",
      caloriesPer100g: 18,
      protein: 0.9,
      fat: 0.2,
      carbs: 3.9,
      fiber: 1.2,
      confidence: 96,
      image:
        "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=480&h=480&fit=crop&auto=format",
    },
    {
      id: "broccoli",
      name: "Brokkoli",
      emoji: "🥦",
      caloriesPer100g: 34,
      protein: 2.8,
      fat: 0.4,
      carbs: 7,
      fiber: 2.6,
      confidence: 97,
      image:
        "https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=480&h=480&fit=crop&auto=format",
    },
    {
      id: "carrot",
      name: "Karotte",
      emoji: "🥕",
      caloriesPer100g: 41,
      protein: 0.9,
      fat: 0.2,
      carbs: 10,
      fiber: 2.8,
      confidence: 98,
      image:
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=480&h=480&fit=crop&auto=format",
    },
    {
      id: "avocado",
      name: "Avocado",
      emoji: "🥑",
      caloriesPer100g: 160,
      protein: 2.0,
      fat: 15,
      carbs: 9,
      fiber: 6.7,
      confidence: 98,
      image:
        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=480&h=480&fit=crop&auto=format",
    },
  ],
  Milchprodukte: [
    {
      id: "yogurt",
      name: "Joghurt",
      emoji: "🥛",
      caloriesPer100g: 61,
      protein: 3.5,
      fat: 3.3,
      carbs: 4.7,
      fiber: 0,
      confidence: 90,
    },
    {
      id: "cheese",
      name: "Käse",
      emoji: "🧀",
      caloriesPer100g: 402,
      protein: 25,
      fat: 33,
      carbs: 1.3,
      fiber: 0,
      confidence: 88,
    },
    {
      id: "egg",
      name: "Ei",
      emoji: "🥚",
      caloriesPer100g: 155,
      protein: 13,
      fat: 11,
      carbs: 1.1,
      fiber: 0,
      confidence: 99,
    },
  ],
  Fleisch: [
    {
      id: "chicken",
      name: "Hähnchenbrust",
      emoji: "🍗",
      caloriesPer100g: 165,
      protein: 31,
      fat: 3.6,
      carbs: 0,
      fiber: 0,
      confidence: 91,
    },
    {
      id: "beef",
      name: "Rindfleisch",
      emoji: "🥩",
      caloriesPer100g: 250,
      protein: 26,
      fat: 17,
      carbs: 0,
      fiber: 0,
      confidence: 87,
    },
  ],
  "Brot & Backwaren": [
    {
      id: "bread",
      name: "Vollkornbrot",
      emoji: "🍞",
      caloriesPer100g: 247,
      protein: 9,
      fat: 3.3,
      carbs: 46,
      fiber: 7.4,
      confidence: 89,
    },
    {
      id: "roll",
      name: "Brötchen",
      emoji: "🥐",
      caloriesPer100g: 289,
      protein: 9,
      fat: 2.5,
      carbs: 56,
      fiber: 2.1,
      confidence: 93,
    },
  ],
  Sonstiges: [
    {
      id: "nuts",
      name: "Nüsse",
      emoji: "🥜",
      caloriesPer100g: 567,
      protein: 20,
      fat: 49,
      carbs: 16,
      fiber: 8.5,
      confidence: 88,
    },
    {
      id: "rice",
      name: "Reis",
      emoji: "🍚",
      caloriesPer100g: 130,
      protein: 2.7,
      fat: 0.3,
      carbs: 28,
      fiber: 0.4,
      confidence: 94,
    },
  ],
};

const ALL_FOODS: FoodItem[] = Object.values(FOOD_DB).flat();

const CATEGORY_META: {
  key: string;
  emoji: string;
  label: string;
}[] = [
  { key: "Obst", emoji: "🍎", label: "Obst" },
  { key: "Gemüse", emoji: "🥦", label: "Gemüse" },
  { key: "Milchprodukte", emoji: "🥛", label: "Milchprodukte" },
  { key: "Fleisch", emoji: "🥩", label: "Fleisch" },
  { key: "Fisch", emoji: "🐟", label: "Fisch" },
  { key: "Brot & Backwaren", emoji: "🍞", label: "Brot" },
  { key: "Getränke", emoji: "🥤", label: "Getränke" },
  { key: "Sonstiges", emoji: "✨", label: "Sonstiges" },
];

const HISTORY_ITEMS = [
  {
    id: 1,
    name: "Apfel",
    emoji: "🍎",
    weight: 180,
    calories: 94,
    time: "8:32 Uhr",
    date: "Heute",
  },
  {
    id: 2,
    name: "Joghurt",
    emoji: "🥛",
    weight: 150,
    calories: 92,
    time: "7:15 Uhr",
    date: "Heute",
  },
  {
    id: 3,
    name: "Banane",
    emoji: "🍌",
    weight: 118,
    calories: 105,
    time: "18:45 Uhr",
    date: "Gestern",
  },
  {
    id: 4,
    name: "Brokkoli",
    emoji: "🥦",
    weight: 200,
    calories: 68,
    time: "13:00 Uhr",
    date: "Gestern",
  },
  {
    id: 5,
    name: "Hähnchenbrust",
    emoji: "🍗",
    weight: 200,
    calories: 330,
    time: "12:30 Uhr",
    date: "Mo., 7. Jul.",
  },
];

// ─── Appearance & Theme ────────────────────────────────────────────────────────

type AppearanceSetting = "light" | "dark" | "auto";

function getAutoTheme(): "light" | "dark" {
  const h = new Date().getHours();
  return h >= 7 && h < 20 ? "light" : "dark";
}

/** CSS custom-property values injected on .ss-themed container — theme-switched at runtime */
const THEME_VARS: Record<"light" | "dark", string> = {
  light: `
    --c-blue:#007AFF; --c-blue-lt:#EAF3FF;
    --c-green:#30D158; --c-green-lt:#ECFDF1;
    --c-orange:#F97316; --c-red:#EF4444;
    --c-gray1:#1C1C1E; --c-gray2:#6E6E73; --c-gray3:#AEAEB2;
    --c-card:#FFFFFF; --c-border:rgba(60,60,67,.14); --c-bg:#F7F7FA; --c-muted:#EDEEF2;
    --c-elevated:#FFFFFF; --c-input:#F2F2F7;
    --c-btn-shadow:rgba(59,130,246,0.28); --c-ok-shadow:rgba(34,197,94,0.32);
    --c-standby-bg:#F4F4F6; --c-standby-text:#1C1C1E; --c-standby-sub:#6E6E73;
    --logo-filter:none;
  `,
  dark: `
    --c-blue:#0A84FF; --c-blue-lt:rgba(10,132,255,0.16);
    --c-green:#30D158; --c-green-lt:rgba(48,209,88,0.14);
    --c-orange:#F97316; --c-red:#EF4444;
    --c-gray1:#F2F2F4; --c-gray2:#9B9BA4; --c-gray3:#6C6C75;
    --c-card:#1C1C1E; --c-border:rgba(255,255,255,.12); --c-bg:#000000; --c-muted:#2C2C2E;
    --c-elevated:#1B1D21; --c-input:#25272B;
    --c-btn-shadow:rgba(59,130,246,0.18); --c-ok-shadow:rgba(34,197,94,0.20);
    --c-standby-bg:#0B0D10; --c-standby-text:#F2F2F4; --c-standby-sub:#6C6C75;
    --logo-filter:brightness(0) invert(1);
  `,
};

// ─── Colors (all reference CSS custom properties set by THEME_VARS) ───────────

const C = {
  blue: "var(--c-blue)",
  blueLt: "var(--c-blue-lt)",
  green: "var(--c-green)",
  greenLt: "var(--c-green-lt)",
  orange: "var(--c-orange)",
  red: "var(--c-red)",
  gray1: "var(--c-gray1)",
  gray2: "var(--c-gray2)",
  gray3: "var(--c-gray3)",
  card: "var(--c-card)",
  border: "var(--c-border)",
  bg: "var(--c-bg)",
  muted: "var(--c-muted)",
  elevated: "var(--c-elevated)",
  input: "var(--c-input)",
  btnShadow: "var(--c-btn-shadow)",
  okShadow: "var(--c-ok-shadow)",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcNutrition(food: FoodItem, weightG: number) {
  const f = weightG / 100;
  return {
    calories: Math.round(food.caloriesPer100g * f),
    protein: Math.round(food.protein * f * 10) / 10,
    fat: Math.round(food.fat * f * 10) / 10,
    carbs: Math.round(food.carbs * f * 10) / 10,
    fiber: Math.round(food.fiber * f * 10) / 10,
  };
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

function formatDE(d: Date, opts: Intl.DateTimeFormatOptions) {
  return d.toLocaleDateString("de-DE", opts);
}

// ─── Shared Components ─────────────────────────────────────────────────────────

// ─── Smart Scale Logo (Figma brand icon) ──────────────────────────────────────

/**
 * Renders the official Smart Scale app icon from the Figma import.
 * The icon is self-contained (blue rounded rect + white mark) at any size.
 */
function SmartScaleLogo({ size = 72 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <AppIconRaw />
    </div>
  );
}

/**
 * Horizontal logo (mark + "Smart Scale" wordmark) from the Figma import.
 * Native size: ~258 × 52 px. Use `scale` to resize proportionally.
 *
 * `light`  — white variant via CSS filter; for use on dark/coloured backgrounds.
 * `themed` — reads `--logo-filter` from the nearest `.ss-themed` ancestor,
 *             so the logo automatically adapts to the active Light/Dark theme.
 */
function HorizontalLogo({
  scale = 1,
  light = false,
  themed = false,
}: {
  scale?: number;
  light?: boolean;
  themed?: boolean;
}) {
  const W = 258,
    H = 52;
  const filter = themed
    ? "var(--logo-filter, none)"
    : light
      ? "brightness(0) invert(1)"
      : "none";

  return (
    <div
      style={{
        width: W * scale,
        height: H * scale,
        flexShrink: 0,
        overflow: "hidden",
        position: "relative" as const,
      }}
    >
      <div
        style={
          {
            position: "absolute" as const,
            top: 0,
            left: 0,
            width: W,
            height: H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            filter,
            // Override SVG fill variable; CSS text-color is handled by filter above
            "--fill-0": "#0F172A",
          } as React.CSSProperties
        }
      >
        <HorizontalLogoRaw />
      </div>
    </div>
  );
}

/**
 * Renders the Container icon (scanner mark) from the Figma import at any size.
 * Native canvas: 64×64 px. Uses CSS transform-scale to resize cleanly.
 * `light`  — white variant (dark backgrounds).
 * `themed` — reads --logo-filter from nearest .ss-themed ancestor.
 */
function ContainerIcon({
  size = 64,
  light = false,
  themed = false,
}: {
  size?: number;
  light?: boolean;
  themed?: boolean;
}) {
  const NATIVE = 64;
  const scale = size / NATIVE;
  const filter = themed
    ? "var(--logo-filter, none)"
    : light
      ? "brightness(0) invert(1)"
      : "none";
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        overflow: "hidden",
        position: "relative" as const,
      }}
    >
      <div
        style={
          {
            position: "absolute" as const,
            top: 0,
            left: 0,
            width: NATIVE,
            height: NATIVE,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            filter,
            "--fill-0": "#0F172A",
          } as React.CSSProperties
        }
      >
        <ContainerRaw />
      </div>
    </div>
  );
}

// ─── Status Bar ────────────────────────────────────────────────────────────────

function StatusBar({ light }: { light?: boolean }) {
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  });
  useEffect(() => {
    const iv = setInterval(() => {
      const d = new Date();
      setTime(
        `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`,
      );
    }, 10000);
    return () => clearInterval(iv);
  }, []);
  const col = light ? "rgba(255,255,255,0.85)" : C.gray1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 18px 0",
        height: 30,
        flexShrink: 0,
      }}
    >
      <span
        style={{ fontSize: 12, fontWeight: 600, color: col }}
      >
        {time}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Wifi className="w-3 h-3" color={col} />
        <Battery className="w-3 h-3" color={col} />
        <span
          style={{ fontSize: 11, fontWeight: 600, color: col }}
        >
          87%
        </span>
      </div>
    </div>
  );
}

function Avatar({
  initials,
  color,
  size = 40,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function PrimaryBtn({
  label,
  onClick,
  disabled,
  style,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? C.gray3 : C.blue,
        color: "#fff",
        border: "none",
        minHeight: 44,
        borderRadius: 14,
        padding: "10px 22px",
        fontWeight: 650,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled
          ? "none"
          : "0 6px 18px rgba(0,122,255,0.22)",
        transition: "transform 0.15s ease, opacity 0.15s ease",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {label}
    </button>
  );
}

function SecondaryBtn({
  label,
  onClick,
  disabled,
  style,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: C.muted,
        color: C.gray1,
        border: "none",
        minHeight: 44,
        borderRadius: 14,
        padding: "10px 20px",
        fontWeight: 600,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {label}
    </button>
  );
}

function GhostBtn({
  label,
  onClick,
  style,
}: {
  label: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: C.blue,
        border: "none",
        borderRadius: 12,
        padding: "8px 16px",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        ...style,
      }}
    >
      {label}
    </button>
  );
}

function MacroBar({
  label,
  value,
  unit,
  color,
  max,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  max: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: C.gray2,
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 11,
            color: C.gray1,
            fontWeight: 600,
          }}
        >
          {value}
          {unit}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: C.border,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 3,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

function CalorieProgress({
  current,
  goal,
}: {
  current: number;
  goal: number;
}) {
  const pct = Math.min(120, (current / goal) * 100);
  const over = current - goal;
  const color =
    over > 50 ? C.red : over > 0 ? C.orange : C.green;
  const label =
    over > 50
      ? "deutlich überschritten"
      : over > 0
        ? "leicht überschritten"
        : "Kalorienziel eingehalten";
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.gray1,
          }}
        >
          Kalorien heute
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          {current} / {goal} kcal
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: C.border,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 4,
            transition: "width 0.5s",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          color,
          fontWeight: 600,
          marginTop: 4,
          display: "block",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ScaleIllustration({
  width = 280,
}: {
  width?: number;
}) {
  return (
    <svg
      viewBox="0 0 280 290"
      width={width}
      style={{
        display: "block",
        filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.22))",
      }}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="st-rim" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#4C4C4E" />
          <stop offset="100%" stopColor="#1C1C1E" />
        </radialGradient>
        <radialGradient id="st-glass" cx="36%" cy="26%">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="45%" stopColor="#F2F2F4" />
          <stop offset="100%" stopColor="#D6D6DA" />
        </radialGradient>
        <linearGradient
          id="st-body"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#3C3C3E" />
          <stop offset="100%" stopColor="#1A1A1C" />
        </linearGradient>
        <radialGradient id="st-body-top" cx="50%" cy="0%">
          <stop
            offset="0%"
            stopColor="rgba(255,255,255,0.06)"
          />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Scale body — front-visible strip */}
      <rect
        x="44"
        y="228"
        width="192"
        height="48"
        rx="16"
        fill="url(#st-body)"
      />
      <rect
        x="44"
        y="228"
        width="192"
        height="4"
        rx="2"
        fill="url(#st-body-top)"
      />

      {/* Display */}
      <rect
        x="88"
        y="237"
        width="104"
        height="22"
        rx="7"
        fill="#060608"
      />
      <text
        x="140"
        y="252"
        textAnchor="middle"
        fill="#22C55E"
        fontSize="13"
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
      >
        0 g
      </text>
      <circle
        cx="100"
        cy="248"
        r="2.5"
        fill="#22C55E"
        opacity="0.9"
      />
      <circle
        cx="100"
        cy="248"
        r="5"
        fill="#22C55E"
        opacity="0.12"
      />

      {/* TARA button on body */}
      <rect
        x="200"
        y="240"
        width="28"
        height="16"
        rx="5"
        fill="rgba(255,255,255,0.08)"
      />
      <text
        x="214"
        y="251"
        textAnchor="middle"
        fill="rgba(255,255,255,0.35)"
        fontSize="5.5"
        fontFamily="Inter, system-ui"
        fontWeight="700"
        letterSpacing="1"
      >
        TARA
      </text>

      {/* Brand on body */}
      <text
        x="56"
        y="265"
        fill="rgba(255,255,255,0.16)"
        fontSize="5"
        fontFamily="Inter, system-ui"
        letterSpacing="2.5"
        fontWeight="600"
      >
        SMART SCALE
      </text>

      {/* Platform depth shadow ellipse */}
      <ellipse
        cx="140"
        cy="176"
        rx="106"
        ry="7"
        fill="rgba(0,0,0,0.16)"
      />

      {/* Outer rim ring */}
      <circle cx="140" cy="136" r="112" fill="url(#st-rim)" />

      {/* Glass weighing surface */}
      <circle cx="140" cy="136" r="104" fill="url(#st-glass)" />

      {/* Concentric ring texture on glass */}
      <circle
        cx="140"
        cy="136"
        r="82"
        fill="none"
        stroke="rgba(0,0,0,0.045)"
        strokeWidth="1"
      />
      <circle
        cx="140"
        cy="136"
        r="58"
        fill="none"
        stroke="rgba(0,0,0,0.04)"
        strokeWidth="1"
      />
      <circle
        cx="140"
        cy="136"
        r="34"
        fill="none"
        stroke="rgba(0,0,0,0.035)"
        strokeWidth="1"
      />

      {/* Glass highlight — main arc */}
      <path
        d="M 76 94 Q 140 56 204 94"
        stroke="rgba(255,255,255,0.68)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Glass highlight — secondary softer arc */}
      <path
        d="M 98 80 Q 140 58 182 80"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Center sensor dot */}
      <circle cx="140" cy="136" r="5" fill="rgba(0,0,0,0.09)" />
      <circle cx="140" cy="136" r="2" fill="rgba(0,0,0,0.16)" />

      {/* Rim top highlight */}
      <path
        d="M 50 86 Q 140 38 230 86"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Subtle brand on platform */}
      <text
        x="140"
        y="174"
        textAnchor="middle"
        fill="rgba(0,0,0,0.06)"
        fontSize="6.5"
        fontFamily="Inter, system-ui"
        letterSpacing="3.5"
        fontWeight="600"
      >
        SMART SCALE
      </text>
    </svg>
  );
}

// ─── Screen: Boot ──────────────────────────────────────────────────────────────

function BootScreen({
  onDone,
  isFirstUse,
}: {
  onDone: (first: boolean) => void;
  isFirstUse: boolean;
}) {
  const messages = [
    "Smart Scale wird vorbereitet…",
    "KI-Kamera wird initialisiert…",
    "Nährstoffdatenbank wird geladen…",
    "Bereit",
  ];
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // Stable ref so the effect never re-runs when the parent re-renders
  const cbRef = useRef(onDone);
  const firstRef = useRef(isFirstUse);

  useEffect(() => {
    const steps = [
      { pct: 25, delay: 400 },
      { pct: 55, delay: 900 },
      { pct: 85, delay: 1500 },
      { pct: 100, delay: 2100 },
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach(({ pct, delay }, i) => {
      timers.push(
        setTimeout(() => {
          setProgress(pct);
          setMsgIdx(i);
        }, delay),
      );
    });
    timers.push(
      setTimeout(() => cbRef.current(firstRef.current), 2900),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: C.bg,
        gap: 20,
      }}
    >
      {/* Brand mark + wordmark — Figma horizontal logo at native scale */}
      <HorizontalLogo scale={0.9} />
      <div
        style={{ fontSize: 13, color: C.gray2, marginTop: -4 }}
      >
        Intelligente Küchenwaage
      </div>
      <div style={{ width: 240 }}>
        <div
          style={{
            height: 4,
            background: C.border,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: C.blue,
              borderRadius: 2,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 12,
            color: C.gray2,
            height: 16,
          }}
        >
          {messages[msgIdx]}
        </div>
      </div>
    </div>
  );
}

function OnboardingScreen({
  step,
  onNext,
  onSkip,
}: {
  step: "welcome" | "explain" | "ready";
  onNext: () => void;
  onSkip?: () => void;
}) {
  const content = {
    welcome: {
      eyebrow: "WILLKOMMEN",
      title: "Schön, dass du da bist.",
      text: "In weniger als einer Minute ist deine Smart Scale bereit.",
      icon: <HorizontalLogo scale={0.72} themed />,
      action: "Einrichtung starten",
    },
    explain: {
      eyebrow: "SO FUNKTIONIERT’S",
      title: "Auflegen. Erkennen. Fertig.",
      text: "Die Waage misst präzise. Mit KI erkennt sie Lebensmittel und berechnet direkt die Nährwerte.",
      icon: (
        <div style={{ display: "flex", gap: 10 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 17,
              background: C.blueLt,
              color: C.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Scale />
          </div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 17,
              background: C.greenLt,
              color: C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Camera />
          </div>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 17,
              background: C.muted,
              color: C.orange,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap />
          </div>
        </div>
      ),
      action: "Profil anlegen",
    },
    ready: {
      eyebrow: "GESCHAFFT",
      title: "Du bist startklar.",
      text: "Lege ein Lebensmittel auf oder nutze die Waage ganz einfach ohne Tracking.",
      icon: (
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            background: C.greenLt,
            color: C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={38} strokeWidth={2.5} />
        </div>
      ),
      action: "Smart Scale verwenden",
    },
  }[step];

  return (
    <div
      style={{
        flex: 1,
        background: C.bg,
        padding: "26px 34px",
        display: "grid",
        gridTemplateColumns: "1fr 1.08fr",
        alignItems: "center",
        gap: 34,
      }}
    >
      <div
        style={{
          minHeight: 190,
          borderRadius: 26,
          background: `linear-gradient(145deg, ${C.card}, ${C.blueLt})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${C.border}`,
        }}
      >
        {content.icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 750,
            letterSpacing: 1.2,
            color: C.blue,
            marginBottom: 8,
          }}
        >
          {content.eyebrow}
        </div>
        <div
          style={{
            fontSize: 29,
            lineHeight: 1.06,
            letterSpacing: "-.7px",
            fontWeight: 780,
            color: C.gray1,
          }}
        >
          {content.title}
        </div>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.5,
            color: C.gray2,
            margin: "10px 0 20px",
          }}
        >
          {content.text}
        </p>
        <PrimaryBtn
          label={content.action}
          onClick={onNext}
          style={{ width: "100%" }}
        />
        {onSkip && (
          <GhostBtn
            label="Später einrichten"
            onClick={onSkip}
            style={{ width: "100%", marginTop: 5 }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Screen: ReturningUser ─────────────────────────────────────────────────────

function ReturningUserScreen({
  onSelectProfile,
  onGuest,
  onCreate,
  onScaleOnly,
}: {
  onSelectProfile: (p: ProfileData) => void;
  onGuest: () => void;
  onCreate: () => void;
  onScaleOnly: () => void;
}) {
  const primary = PROFILES[0];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        padding: "18px 22px 16px",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: C.gray2 }}>
            {getGreeting()}
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 750,
              color: C.gray1,
            }}
          >
            Wer verwendet die Waage?
          </div>
        </div>
        <button
          onClick={onCreate}
          style={{
            border: "none",
            background: C.blueLt,
            color: C.blue,
            borderRadius: 12,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 650,
            cursor: "pointer",
            display: "flex",
            gap: 5,
            alignItems: "center",
          }}
        >
          <Plus className="w-3 h-3" /> Neues Profil
        </button>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1.55fr .72fr .72fr",
          gap: 12,
        }}
      >
        <button
          onClick={() => onSelectProfile(primary)}
          style={{
            border: `1px solid ${C.border}`,
            background: C.card,
            borderRadius: 22,
            padding: 18,
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 18,
            boxShadow: "0 12px 32px rgba(0,0,0,.08)",
          }}
        >
          <Avatar
            initials={primary.initials}
            color={primary.color}
            size={88}
          />
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.green,
              }}
            >
              VORGESCHLAGEN
            </div>
            <div
              style={{
                fontSize: 25,
                fontWeight: 780,
                color: C.gray1,
              }}
            >
              {primary.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.gray2,
                margin: "3px 0 12px",
              }}
            >
              {primary.goal}
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 650,
                color: C.blue,
              }}
            >
              Mit PIN anmelden{" "}
              <ChevronRight
                className="w-3 h-3"
                style={{ display: "inline" }}
              />
            </span>
          </div>
        </button>
        {PROFILES.slice(1).map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProfile(p)}
            style={{
              border: `1px solid ${C.border}`,
              background: C.card,
              borderRadius: 20,
              padding: 12,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Avatar
              initials={p.initials}
              color={p.color}
              size={52}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              {p.name}
            </span>
            <span style={{ fontSize: 10, color: C.gray2 }}>
              {p.goal}
            </span>
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 2,
        }}
      >
        <button
          onClick={onScaleOnly}
          style={{
            border: "none",
            background: C.muted,
            color: C.gray1,
            borderRadius: 14,
            minHeight: 40,
            padding: "0 16px",
            fontSize: 12,
            fontWeight: 650,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Scale className="w-4 h-4" /> Direkt nur wiegen
        </button>
        <button
          onClick={onGuest}
          style={{
            border: "none",
            background: "transparent",
            color: C.blue,
            padding: 10,
            fontSize: 12,
            fontWeight: 650,
            cursor: "pointer",
          }}
        >
          KI als Gast verwenden →
        </button>
      </div>
    </div>
  );
}

// ─── Screen: ProfileSelection ──────────────────────────────────────────────────

function ProfileSelectionScreen({
  onBack,
  onSelect,
  onCreate,
}: {
  onBack: () => void;
  onSelect: (p: ProfileData) => void;
  onCreate: () => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.blue,
            display: "flex",
            alignItems: "center",
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          Profil auswählen
        </span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          overflowX: "auto" as const,
        }}
      >
        {PROFILES.map((p) => (
          <div
            key={p.id}
            style={{
              width: 188,
              minHeight: 215,
              background: C.card,
              borderRadius: 18,
              border: `2px solid ${C.border}`,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <Avatar
              initials={p.initials}
              color={p.color}
              size={56}
            />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.gray1,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.gray2,
                  marginTop: 2,
                }}
              >
                {p.goal}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: C.gray3,
                  marginTop: 2,
                }}
              >
                {p.calories} kcal · {p.lastSync}
              </div>
            </div>
            <PrimaryBtn
              label="Auswählen"
              onClick={() => onSelect(p)}
              style={{ width: "100%", padding: "8px 0" }}
            />
          </div>
        ))}
        <div
          onClick={onCreate}
          style={{
            width: 188,
            minHeight: 215,
            background: C.card,
            borderRadius: 18,
            border: `2px dashed ${C.border}`,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: C.blueLt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus className="w-5 h-5" />
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: C.blue,
            }}
          >
            Neues Profil
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: CreateProfile ─────────────────────────────────────────────────────

function CreateProfileScreen({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (profile: ProfileData) => void;
}) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [kcal, setKcal] = useState("");
  const [showApps, setShowApps] = useState(false);
  const [connectedApp, setConnectedApp] = useState<
    string | null
  >(null);
  const goals = [
    "Gewicht verlieren",
    "Gewicht halten",
    "Muskelaufbau",
    "Leistungssport",
  ];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        position: "relative" as const,
      }}
    >
      <div
        style={{
          width: 315,
          background: C.card,
          borderRight: `1px solid ${C.border}`,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.blue,
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.gray1,
            }}
          >
            Neues Profil
          </span>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: C.gray2,
              fontWeight: 500,
            }}
          >
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein Name"
            style={{
              display: "block",
              width: "100%",
              marginTop: 4,
              padding: "9px 12px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box" as const,
            }}
          />
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: C.gray2,
              fontWeight: 500,
            }}
          >
            Kalorienziel (kcal/Tag)
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              marginTop: 4,
            }}
          >
            <input
              type="number"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              placeholder="z.B. 1800"
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: "10px 0 0 10px",
                border: `1.5px solid ${C.border}`,
                borderRight: "none",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box" as const,
              }}
            />
            <div
              style={{
                padding: "9px 10px",
                background: C.muted,
                borderRadius: "0 10px 10px 0",
                border: `1.5px solid ${C.border}`,
                borderLeft: "none",
                fontSize: 13,
                color: C.gray2,
                fontWeight: 600,
              }}
            >
              kcal
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.gray1,
          }}
        >
          Ziel auswählen
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridAutoRows: "1fr",
            gap: 10,
            flex: 1,
          }}
        >
          {goals.map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              style={{
                borderRadius: 12,
                border: `2px solid ${goal === g ? C.blue : C.border}`,
                background: goal === g ? C.blueLt : C.card,
                color: goal === g ? C.blue : C.gray1,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                padding: "12px 8px",
                minHeight: 58,
              }}
            >
              {g}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowApps(true)}
          style={{
            background: C.blueLt,
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "none",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <Smartphone className="w-4 h-4" />
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              {connectedApp
                ? `${connectedApp} verbunden`
                : "Verbindung mit App einrichten"}
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              {connectedApp
                ? "Tracking wird automatisch synchronisiert"
                : "YAZIO, MyFitnessPal oder weitere"}
            </div>
          </div>
          <ChevronRight
            className="w-4 h-4"
            style={{ marginLeft: "auto", color: C.blue }}
          />
        </button>
        {!connectedApp && (
          <div
            style={{
              fontSize: 10,
              color: C.gray2,
              marginTop: -10,
            }}
          >
            Ohne App kannst du wiegen und Nährwerte sehen, aber
            Mahlzeiten nicht automatisch tracken.
          </div>
        )}
        <PrimaryBtn
          label="Profil erstellen"
          onClick={() =>
            onCreate({
              id: `new-${Date.now()}`,
              name: name.trim(),
              initials: name.trim().slice(0, 1).toUpperCase(),
              goal,
              calories: Number(kcal) || 2000,
              lastSync: connectedApp
                ? `mit ${connectedApp}`
                : "nicht verbunden",
              color: "#007AFF",
            })
          }
          disabled={!name.trim() || !goal}
          style={{
            alignSelf: "flex-end",
            padding: "11px 28px",
          }}
        />
        {showApps && (
          <div
            style={{
              position: "absolute" as const,
              inset: 10,
              zIndex: 20,
              borderRadius: 20,
              background: C.elevated,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
              padding: 22,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 750,
                    color: C.gray1,
                  }}
                >
                  Tracking-App verbinden
                </div>
                <div style={{ fontSize: 11, color: C.gray2 }}>
                  Du kannst diesen Schritt jederzeit nachholen.
                </div>
              </div>
              <button
                onClick={() => setShowApps(false)}
                aria-label="Schließen"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  border: "none",
                  background: C.muted,
                  cursor: "pointer",
                  color: C.gray1,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                flex: 1,
              }}
            >
              {[
                { name: "YAZIO", color: "#6C5CE7" },
                { name: "MyFitnessPal", color: "#0072CE" },
                { name: "Weitere Apps", color: C.gray2 },
              ].map((app) => (
                <button
                  key={app.name}
                  onClick={() => {
                    setConnectedApp(app.name);
                    setShowApps(false);
                  }}
                  style={{
                    border: `1px solid ${C.border}`,
                    background: C.card,
                    borderRadius: 16,
                    cursor: "pointer",
                    color: C.gray1,
                    fontWeight: 700,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: app.color,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    {app.name[0]}
                  </div>
                  {app.name}
                </button>
              ))}
            </div>
            <GhostBtn
              label="Ohne App fortfahren"
              onClick={() => setShowApps(false)}
              style={{ alignSelf: "center" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen: Login ─────────────────────────────────────────────────────────────

function LoginScreen({
  profile,
  onBack,
  onLogin,
}: {
  profile: ProfileData;
  onBack: () => void;
  onLogin: () => void;
}) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (pin.length === 4) {
      const t = setTimeout(() => onLogin(), 300);
      return () => clearTimeout(t);
    }
  }, [pin, onLogin]);

  const handleKey = (k: string) => {
    if (k === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length < 4) setPin((p) => p + k);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        position: "relative" as const,
        padding: "18px 22px",
      }}
    >
      <button
        onClick={onBack}
        aria-label="Zurück zur Profilauswahl"
        style={{
          position: "absolute",
          top: 14,
          left: 18,
          zIndex: 2,
          width: 34,
          height: 34,
          borderRadius: 17,
          border: "none",
          background: C.muted,
          cursor: "pointer",
          color: C.blue,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <div
        style={{
          width: 315,
          background: C.card,
          borderRadius: 22,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <Avatar
          initials={profile.initials}
          color={profile.color}
          size={80}
        />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: C.gray1,
            }}
          >
            Hallo {profile.name}!
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.gray2,
              marginTop: 4,
            }}
          >
            {profile.goal}
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: C.gray1,
            }}
          >
            PIN eingeben
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.gray2,
              marginTop: 3,
            }}
          >
            Bitte gib deinen 4-stelligen PIN ein.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: pin.length > i ? C.blue : C.border,
                transition: "background 0.15s",
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 8,
          }}
        >
          {[
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "",
            "0",
            "del",
          ].map((k, i) =>
            k === "" ? (
              <div key={i} />
            ) : (
              <button
                key={i}
                onClick={() => handleKey(k)}
                style={{
                  width: 66,
                  height: 48,
                  borderRadius: 10,
                  background: C.muted,
                  border: "none",
                  fontSize: k === "del" ? 16 : 18,
                  fontWeight: 600,
                  color: C.gray1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {k === "del" ? "⌫" : k}
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Home ──────────────────────────────────────────────────────────────

function HomeScreen({
  profile,
  weighMode,
  setWeighMode,
  selectedFood,
  setSelectedFood,
  taraActive,
  setTaraActive,
  onCameraScan,
  onOpenFoodSelect,
  onManualWeigh,
  onScaleOnly,
  onHistory,
  onProfile,
  onSettings,
}: any) {
  const modes = [
    {
      key: "ki",
      label: "KI",
      icon: <Camera className="w-3 h-3" />,
    },
    {
      key: "manual",
      label: "Manuell",
      icon: <List className="w-3 h-3" />,
    },
    {
      key: "scale-only",
      label: "Nur wiegen",
      icon: <Scale className="w-3 h-3" />,
    },
  ];

  const title =
    weighMode === "ki"
      ? "Lebensmittel auflegen"
      : weighMode === "manual" && !selectedFood
        ? "Lebensmittel wählen"
        : weighMode === "manual"
          ? `${selectedFood?.name} wiegen`
          : "Nur wiegen";

  const subtitle =
    weighMode === "ki"
      ? "Scan startet automatisch"
      : weighMode === "manual" && !selectedFood
        ? "Erst auswählen, dann wiegen"
        : weighMode === "manual"
          ? "Jetzt auf die Waage legen"
          : "Gewicht ohne Erkennung und Tracking";

  const handleModeChange = (mode: WeighMode) => {
    setWeighMode(mode);

    if (mode !== "manual") {
      setSelectedFood(null);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        minHeight: 0,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 30,
          flexShrink: 0,
          padding: "0 12px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.green,
            }}
          />

          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: C.gray2,
            }}
          >
            Bereit
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <button
            onClick={onProfile}
            style={{
              height: 24,
              border: "none",
              background: C.muted,
              borderRadius: 999,
              padding: "0 10px",
              fontSize: 10,
              fontWeight: 800,
              color: C.gray1,
              cursor: "pointer",
            }}
          >
            {profile ? profile.name : "Gast"}
          </button>

          <button
            onClick={onSettings}
            aria-label="Einstellungen öffnen"
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              border: "none",
              background: C.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: C.gray1,
            }}
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: "8px 10px 7px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-evenly",
          overflow: "hidden",
        }}
      >
        {/* Weight and TARA */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 5,
            }}
          >
            <span
              style={{
                fontSize: 52,
                fontWeight: 900,
                color: C.gray1,
                lineHeight: 0.9,
                letterSpacing: "-0.06em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              0
            </span>

            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: C.gray3,
              }}
            >
              g
            </span>
          </div>

          <button
            onClick={() => setTaraActive(true)}
            style={{
              marginTop: 5,
              height: 23,
              minWidth: 66,
              padding: "0 14px",
              borderRadius: 999,
              border: `1.5px solid ${
                taraActive ? C.blue : C.border
              }`,
              background: taraActive ? C.blueLt : C.card,
              color: taraActive ? C.blue : C.gray1,
              fontSize: 10,
              fontWeight: 850,
              cursor: "pointer",
            }}
          >
            TARA
          </button>
        </div>

        {/* Mode Selector */}
        <div
          style={{
            flexShrink: 0,
            background: C.muted,
            borderRadius: 12,
            padding: 3,
            display: "flex",
            gap: 3,
          }}
        >
          {modes.map((mode) => {
            const active = weighMode === mode.key;

            return (
              <button
                key={mode.key}
                onClick={() =>
                  handleModeChange(mode.key as WeighMode)
                }
                style={{
                  width: 98,
                  height: 26,
                  borderRadius: 9,
                  border: "none",
                  background: active ? C.blue : "transparent",
                  color: active ? "#FFFFFF" : C.gray2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  fontSize: 10,
                  fontWeight: 850,
                  cursor: "pointer",
                  transition:
                    "background 0.2s ease, color 0.2s ease",
                }}
              >
                {mode.icon}
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Instruction and Action */}
        <div
          style={{
            flexShrink: 0,
            minHeight: 82,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 900,
              color: C.gray1,
              lineHeight: 1.08,
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 10,
              fontWeight: 650,
              color: C.gray2,
            }}
          >
            {subtitle}
          </div>

          <div
            style={{
              minHeight: 30,
              marginTop: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {weighMode === "ki" && (
              <GhostBtn
                label="Scan manuell starten"
                onClick={onCameraScan}
                style={{
                  fontSize: 10,
                  padding: "4px 9px",
                }}
              />
            )}

            {weighMode === "manual" && !selectedFood && (
              <PrimaryBtn
                label="Lebensmittel auswählen"
                onClick={onOpenFoodSelect}
                style={{
                  height: 27,
                  padding: "0 12px",
                  fontSize: 10,
                }}
              />
            )}

            {weighMode === "manual" && selectedFood && (
              <>
                <SecondaryBtn
                  label="Ändern"
                  onClick={onOpenFoodSelect}
                  style={{
                    height: 27,
                    padding: "0 10px",
                    fontSize: 10,
                  }}
                />

                <PrimaryBtn
                  label="Wiegen"
                  onClick={onManualWeigh}
                  style={{
                    height: 27,
                    padding: "0 12px",
                    fontSize: 10,
                  }}
                />
              </>
            )}

            {weighMode === "scale-only" && (
              <PrimaryBtn
                label="Wiegen starten"
                onClick={onScaleOnly}
                style={{
                  height: 27,
                  padding: "0 12px",
                  fontSize: 10,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          height: 27,
          flexShrink: 0,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          background: C.bg,
        }}
      >
        {[
          {
            icon: <History className="w-3 h-3" />,
            label: "Verlauf",
            onClick: onHistory,
          },
          {
            icon: <User className="w-3 h-3" />,
            label: "Profil",
            onClick: onProfile,
          },
        ].map(({ icon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              color: C.gray3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              fontSize: 9,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen: ManualWeigh ───────────────────────────────────────────────────────

function ManualWeighScreen({
  food,
  onComplete,
  onCancel,
}: {
  food: FoodItem;
  onComplete: (food: FoodItem, weight: number) => void;
  onCancel: () => void;
}) {
  const [weight, setWeight] = useState(0);
  const [stable, setStable] = useState(false);
  const finalRef = useRef(Math.round(Math.random() * 170 + 80));

  useEffect(() => {
    const iv = setInterval(() => {
      setWeight((w) => {
        const next = w + Math.ceil(finalRef.current / 20);
        return next >= finalRef.current
          ? finalRef.current
          : next;
      });
    }, 80);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (weight >= finalRef.current && !stable) {
      setStable(true);
      const t = setTimeout(
        () => onComplete(food, finalRef.current),
        800,
      );
      return () => clearTimeout(t);
    }
  }, [weight, stable, food, onComplete]);

  return (
    <div style={{ flex: 1, display: "flex" }}>
      <div
        style={{
          width: 340,
          background: C.card,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
        }}
      >
        <span style={{ fontSize: 80 }}>{food.emoji}</span>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          {food.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: C.gray2,
          }}
        >
          {!stable && (
            <div
              style={{
                width: 16,
                height: 16,
                border: `2px solid ${C.blue}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
          )}
          <span style={{ fontSize: 14 }}>
            {stable ? "Gewicht stabil" : "Wird gewogen…"}
          </span>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: 24,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          Gewicht wird gemessen
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: C.gray1,
              lineHeight: 1,
            }}
          >
            {weight}
          </span>
          <span
            style={{
              fontSize: 24,
              color: C.gray3,
              fontWeight: 400,
            }}
          >
            g
          </span>
        </div>
        {stable && (
          <div
            style={{
              background: C.greenLt,
              borderRadius: 12,
              padding: "8px 20px",
              color: C.green,
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Fertig
          </div>
        )}
        <SecondaryBtn label="Abbrechen" onClick={onCancel} />
      </div>
    </div>
  );
}

// ─── Screen: FoodDetection ─────────────────────────────────────────────────────

function FoodDetectionScreen({
  onDone,
  onCancel,
}: {
  onDone: (food: FoodItem, weight: number) => void;
  onCancel: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [weight, setWeight] = useState(0);

  const foodRef = useRef<FoodItem>(
    ALL_FOODS[Math.floor(Math.random() * ALL_FOODS.length)],
  );
  const weightRef = useRef(
    Math.floor(Math.random() * 171) + 80,
  );

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return Math.min(p + 4, 100);
      });
    }, 120);

    const finishTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        onDone(foodRef.current, weightRef.current);
      }, 500);
    }, 3200);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(finishTimer);
    };
  }, [onDone]);

  useEffect(() => {
    const weightTimer = setInterval(() => {
      setWeight((w) =>
        w < weightRef.current
          ? Math.min(
              w + Math.ceil(weightRef.current / 22),
              weightRef.current,
            )
          : weightRef.current,
      );
    }, 80);

    return () => clearInterval(weightTimer);
  }, []);

  const statusText =
    progress < 30
      ? "Kamera wird vorbereitet..."
      : progress < 65
        ? "Lebensmittel wird analysiert..."
        : progress < 100
          ? "Nährwerte werden berechnet..."
          : "Erkennung abgeschlossen";

  const isDone = progress >= 100;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: isDone ? C.green : C.blue,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.gray2,
            }}
          >
            {isDone
              ? "Erkennung abgeschlossen"
              : "KI-Erkennung läuft"}
          </span>
        </div>

        <button
          onClick={onCancel}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            border: "none",
            background: C.muted,
            color: C.gray1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: 16,
          padding: "14px 20px 18px",
          overflow: "hidden",
        }}
      >
        {/* Scanner Area */}
        <div
          style={{
            flex: 0.85,
            minWidth: 0,
            borderRadius: 18,
            background: C.card,
            position: "relative" as const,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 18,
            border: `1px solid ${C.border}`,
          }}
        >
          {/* subtle blue dot pattern */}
          <div
            style={{
              position: "absolute" as const,
              inset: 0,
              backgroundImage:
                "radial-gradient(rgba(59,130,246,0.22) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
              opacity: 0.28,
              maskImage:
                "radial-gradient(circle at 50% 42%, black 0%, black 38%, transparent 66%)",
              WebkitMaskImage:
                "radial-gradient(circle at 50% 42%, black 0%, black 38%, transparent 66%)",
            }}
          />

          {/* soft center glow */}
          <div
            style={{
              position: "absolute" as const,
              top: "13%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 230,
              height: 230,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.06) 45%, transparent 72%)",
              animation: "breathing 4s ease-in-out infinite",
            }}
          />

          {/* AI scan visual */}
          <div
            style={{
              position: "relative" as const,
              flex: 1,
              minHeight: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 165,
                height: 165,
                borderRadius: "50%",
                border: `2px solid ${isDone ? C.green : C.blue}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 30px ${
                  isDone
                    ? "rgba(34,197,94,0.22)"
                    : "rgba(59,130,246,0.22)"
                }`,
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.04) 58%, transparent 74%)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 28,
                  background: C.blueLt,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow:
                    "0 10px 26px rgba(59,130,246,0.12)",
                }}
              >
                {isDone ? (
                  <Check
                    className="w-10 h-10"
                    color={C.green}
                  />
                ) : (
                  <Camera
                    className="w-10 h-10"
                    color={C.blue}
                  />
                )}
              </div>
            </div>
          </div>

          {/* weight */}
          <div style={{ position: "relative" as const }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: C.gray3,
                letterSpacing: 1,
              }}
            >
              GEWICHT
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 56,
                  fontWeight: 850,
                  color: C.gray1,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {weight}
              </span>
              <span
                style={{
                  fontSize: 19,
                  fontWeight: 600,
                  color: C.gray3,
                }}
              >
                g
              </span>
            </div>
          </div>
        </div>

        {/* Info Area */}
        <div
          style={{
            flex: 1.15,
            minWidth: 0,
            background: C.elevated,
            border: `1px solid ${C.border}`,
            borderRadius: 18,
            padding: 18,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 850,
              color: C.gray1,
            }}
          >
            Lebensmittel wird erkannt
          </h2>

          <p
            style={{
              margin: "6px 0 22px",
              fontSize: 13,
              lineHeight: 1.35,
              color: C.gray2,
            }}
          >
            Die KI analysiert dein Lebensmittel und berechnet
            die passenden Nährwerte.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: isDone ? C.green : C.blue,
              }}
            >
              {statusText}
            </span>

            <span
              style={{
                fontSize: 22,
                fontWeight: 850,
                color: isDone ? C.green : C.gray1,
              }}
            >
              {progress}%
            </span>
          </div>

          <div
            style={{
              height: 12,
              background: C.muted,
              borderRadius: 999,
              overflow: "hidden",
              border: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: isDone ? C.green : C.blue,
                borderRadius: 999,
                transition:
                  "width 0.2s ease, background 0.3s ease",
              }}
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <SecondaryBtn
              label="Abbrechen"
              onClick={onCancel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: LowConfidence ─────────────────────────────────────────────────────

function LowConfidenceScreen({
  food,
  onRescan,
  onFoodSelect,
  onUseAnyway,
}: {
  food: FoodItem;
  onRescan: () => void;
  onFoodSelect: () => void;
  onUseAnyway: () => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1.05fr 1fr",
        background: C.bg,
        padding: "18px 22px",
        gap: 18,
      }}
    >
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 24,
          position: "relative" as const,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: 14,
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            borderRadius: 17,
            background: C.muted,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative" as const,
          }}
        >
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover" as const,
              }}
            />
          ) : (
            <span style={{ fontSize: 76 }}>{food.emoji}</span>
          )}
          <div
            style={{
              position: "absolute" as const,
              top: 10,
              left: 10,
              background: "rgba(20,20,22,.76)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              borderRadius: 999,
              padding: "6px 9px",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertTriangle className="w-3 h-3" /> Bitte prüfen
          </div>
        </div>
        <div
          style={{
            padding: "12px 3px 1px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Unser Vorschlag
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 760,
                color: C.gray1,
              }}
            >
              {food.name}
            </div>
          </div>
          <div
            style={{
              background: C.blueLt,
              color: C.blue,
              borderRadius: 12,
              padding: "7px 10px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {food.confidence}% sicher
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: 1,
              color: C.orange,
              marginBottom: 5,
            }}
          >
            KURZ PRÜFEN
          </div>
          <div
            style={{
              fontSize: 23,
              lineHeight: 1.1,
              fontWeight: 770,
              color: C.gray1,
            }}
          >
            Ist das {food.name}?
          </div>
          <div
            style={{
              fontSize: 12,
              lineHeight: 1.45,
              color: C.gray2,
              marginTop: 7,
            }}
          >
            Die Erkennung ist noch nicht ganz sicher. Wähle die
            passende Aktion.
          </div>
        </div>
        <PrimaryBtn
          label={`Ja, ${food.name} bestätigen`}
          onClick={onUseAnyway}
          style={{ width: "100%" }}
        />
        <SecondaryBtn
          label="Erneut scannen"
          onClick={onRescan}
          style={{ width: "100%" }}
        />
        <GhostBtn
          label="Anderes Lebensmittel manuell auswählen"
          onClick={onFoodSelect}
          style={{ width: "100%", color: C.gray2 }}
        />
      </div>
    </div>
  );
}

// ─── Screen: RecognitionResult ─────────────────────────────────────────────────

function RecognitionResultScreen({
  food,
  weight,
  profile,
  onSave,
  onChangeFood,
  onCancel,
}: {
  food: FoodItem;
  weight: number;
  profile: ProfileData | null;
  onSave: () => void;
  onChangeFood: () => void;
  onCancel: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const nutr = calcNutrition(food, weight);
  const isGuest = !profile;

  const macroItems = [
    {
      label: "Protein",
      value: nutr.protein,
      unit: "g",
      max: 40,
      color: "#3B82F6",
    },
    {
      label: "Kohlenhydrate",
      value: nutr.carbs,
      unit: "g",
      max: 60,
      color: "#14B8A6",
    },
    {
      label: "Fett",
      value: nutr.fat,
      unit: "g",
      max: 35,
      color: "#8B5CF6",
    },
  ];

  const additionalItems = [
    {
      label: "Ballaststoffe",
      value: nutr.fiber,
      unit: "g",
      max: 15,
      color: "#F97316",
    },
  ];

  const NutritionBar = ({
    item,
  }: {
    item: (typeof macroItems)[number];
  }) => {
    const pct = Math.min(100, (item.value / item.max) * 100);

    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: item.color,
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: C.gray1,
            }}
          >
            {item.value}
            {item.unit}
          </span>
        </div>

        <div
          style={{
            height: 7,
            borderRadius: 999,
            background: C.muted,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              borderRadius: 999,
              background: item.color,
              transition: "width 0.45s ease",
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 42,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.green,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.gray2,
            }}
          >
            Lebensmittel erkannt
          </span>
        </div>

        <button
          onClick={onCancel}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            border: "none",
            background: C.muted,
            color: C.gray1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          gap: 12,
          padding: 12,
          overflow: "hidden",
        }}
      >
        {/* Left Food Card */}
        <div
          style={{
            width: 218,
            flexShrink: 0,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              alignSelf: "flex-start",
              background: C.greenLt,
              color: C.green,
              borderRadius: 999,
              padding: "4px 8px",
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            <Check className="w-3 h-3" />
            KI erkannt
          </div>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 17,
                background: C.elevated,
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {food.image ? (
                <img
                  src={food.image}
                  alt={food.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover" as const,
                  }}
                />
              ) : (
                <span style={{ fontSize: 38 }}>
                  {food.emoji}
                </span>
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: food.name.length > 10 ? 17 : 21,
                  fontWeight: 850,
                  color: C.gray1,
                  lineHeight: 1.05,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {food.name}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  color: C.gray2,
                  fontWeight: 700,
                }}
              >
                {food.confidence}% Sicherheit
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 7,
            }}
          >
            <div
              style={{
                background: C.elevated,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "9px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.gray3,
                  letterSpacing: 0.8,
                }}
              >
                GEWICHT
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 23,
                  fontWeight: 850,
                  color: C.gray1,
                }}
              >
                {weight}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.gray3,
                    marginLeft: 3,
                  }}
                >
                  g
                </span>
              </div>
            </div>

            <div
              style={{
                background: C.blueLt,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "9px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: C.gray3,
                  letterSpacing: 0.8,
                }}
              >
                KALORIEN
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 23,
                  fontWeight: 850,
                  color: C.blue,
                }}
              >
                {nutr.calories}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.gray2,
                    marginLeft: 3,
                  }}
                >
                  kcal
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onChangeFood}
            style={{
              marginTop: 10,
              height: 36,
              borderRadius: 13,
              border: `1px solid ${C.border}`,
              background: C.elevated,
              color: C.gray1,
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Lebensmittel ändern
          </button>
        </div>

        {/* Right Nutrition Card */}
        <div
          className="ss-nutrition-scroll"
          style={{
            flex: 1,
            minWidth: 0,
            background: C.elevated,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: "16px 18px 18px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto" as const,
            overflowX: "hidden" as const,
            scrollbarGutter: "stable",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 850,
                color: C.gray1,
              }}
            >
              Nährwerte
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: C.gray2,
              }}
            >
              pro Portion
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            {macroItems.map((item) => (
              <NutritionBar key={item.label} item={item} />
            ))}
          </div>

          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 850,
                color: C.gray3,
                letterSpacing: 1.1,
                marginBottom: 8,
              }}
            >
              WEITERE NÄHRWERTE
            </div>

            {additionalItems.map((item) => (
              <NutritionBar key={item.label} item={item} />
            ))}
          </div>

          <button
            onClick={() => setExpanded((e) => !e)}
            style={{
              marginTop: 12,
              height: 38,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 13,
              padding: "0 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
              color: C.gray1,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {expanded
              ? "Mikronährstoffe ausblenden"
              : "Mikronährstoffe anzeigen"}
            <ChevronRight
              className="w-3.5 h-3.5"
              style={{
                transform: expanded ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {expanded && (
            <div
              style={{
                flex: "none",
                overflow: "visible",
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 14,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                }}
              >
                {/* Vitamine */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.gray3,
                      marginBottom: 10,
                      letterSpacing: 0.5,
                    }}
                  >
                    VITAMINE
                  </div>

                  {[
                    ["Vitamin A", "42 µg"],
                    ["Vitamin C", "18 mg"],
                    ["Vitamin D", "0 µg"],
                    ["Vitamin E", "1.2 mg"],
                    ["Vitamin K", "73 µg"],
                    ["Vitamin B1", "0.08 mg"],
                    ["Vitamin B2", "0.09 mg"],
                    ["Vitamin B6", "0.13 mg"],
                    ["Vitamin B12", "0 µg"],
                    ["Folsäure", "41 µg"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: C.gray2 }}>
                        {label}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Mineralstoffe */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.gray3,
                      marginBottom: 10,
                      letterSpacing: 0.5,
                    }}
                  >
                    MINERALSTOFFE
                  </div>

                  {[
                    ["Kalium", "412 mg"],
                    ["Calcium", "25 mg"],
                    ["Magnesium", "18 mg"],
                    ["Phosphor", "29 mg"],
                    ["Natrium", "7 mg"],
                    ["Eisen", "0.4 mg"],
                    ["Zink", "0.2 mg"],
                    ["Kupfer", "0.09 mg"],
                    ["Mangan", "0.2 mg"],
                    ["Selen", "0.3 µg"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: C.gray2 }}>
                        {label}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: 14,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {isGuest ? (
              <>
                <PrimaryBtn
                  label="Tracking nur mit Benutzerprofil möglich"
                  disabled
                  style={{
                    width: "100%",
                    height: 36,
                    padding: 0,
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color: C.gray2,
                    textAlign: "center" as const,
                  }}
                >
                  Im Gastmodus werden keine Daten übertragen.
                </div>
              </>
            ) : (
              <PrimaryBtn
                label="Zur App übertragen"
                onClick={onSave}
                style={{
                  width: "100%",
                  height: 36,
                  padding: 0,
                }}
              />
            )}

            <GhostBtn
              label="Abbrechen"
              onClick={onCancel}
              style={{ width: "100%", padding: "5px 0" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Confirmation ──────────────────────────────────────────────────────

function ConfirmationScreen({
  food,
  weight,
  profile,
  onSave,
  onCancel,
  onSelectProfile,
}: {
  food: FoodItem;
  weight: number;
  profile: ProfileData | null;
  onSave: () => void;
  onCancel: () => void;
  onSelectProfile: () => void;
}) {
  const nutr = calcNutrition(food, weight);
  const isGuest = !profile;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: 24,
      }}
    >
      <div
        style={{
          width: 245,
          background: C.card,
          borderRadius: 20,
          border: `1.5px solid ${C.border}`,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: 140,
            background: C.muted,
            position: "relative" as const,
            overflow: "hidden",
          }}
        >
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover" as const,
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 60,
              }}
            >
              {food.emoji}
            </div>
          )}
        </div>
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.gray1,
            }}
          >
            {food.name}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div
              style={{
                flex: 1,
                background: C.blueLt,
                borderRadius: 8,
                padding: "6px 8px",
                textAlign: "center" as const,
              }}
            >
              <div style={{ fontSize: 10, color: C.gray2 }}>
                Gewicht
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.gray1,
                }}
              >
                {weight}g
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: C.greenLt,
                borderRadius: 8,
                padding: "6px 8px",
                textAlign: "center" as const,
              }}
            >
              <div style={{ fontSize: 10, color: C.gray2 }}>
                Kalorien
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.green,
                }}
              >
                {nutr.calories}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 4,
            }}
          >
            {[
              {
                label: "P",
                value: nutr.protein,
                color: C.blue,
              },
              { label: "F", value: nutr.fat, color: C.orange },
              {
                label: "K",
                value: nutr.carbs,
                color: "#8B5CF6",
              },
              { label: "B", value: nutr.fiber, color: C.green },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: color,
                  }}
                />
                <span style={{ fontSize: 11, color: C.gray2 }}>
                  {label}: {value}g
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 260,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: C.gray1,
            }}
          >
            Lebensmittel speichern?
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.gray2,
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            {isGuest
              ? "Im Gastmodus werden keine Nährwerte gespeichert."
              : `${food.name} wird zu deinem heutigen Protokoll hinzugefügt.`}
          </div>
        </div>
        {isGuest ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <PrimaryBtn
              label="Tracking nur mit Benutzerprofil möglich"
              disabled
              style={{ width: "100%", fontSize: 12 }}
            />
            <button
              onClick={onSelectProfile}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.blue,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "left" as const,
              }}
            >
              Profil auswählen →
            </button>
          </div>
        ) : (
          <PrimaryBtn
            label="Lebensmittel speichern"
            onClick={onSave}
            style={{ width: "100%" }}
          />
        )}
        <SecondaryBtn label="Abbrechen" onClick={onCancel} />
      </div>
    </div>
  );
}

// ─── Screen: TrackingAnimation ─────────────────────────────────────────────────

function TrackingAnimationScreen({
  food,
  onDone,
}: {
  food: FoodItem;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const [shrink, setShrink] = useState(false);
  const [done, setDone] = useState(false);
  const steps = [
    "Wird gespeichert…",
    "Kalorien werden berechnet…",
    "Protokoll wird aktualisiert…",
    "Erfolgreich gespeichert!",
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => {
        setStep(1);
      }, 400),
      setTimeout(() => {
        setStep(2);
        setShrink(true);
      }, 900),
      setTimeout(() => {
        setStep(3);
      }, 1500),
      setTimeout(() => {
        setDone(true);
      }, 2000),
      setTimeout(() => {
        onDone();
      }, 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: C.bg,
      }}
    >
      <div
        style={{
          position: "relative" as const,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        <div
          style={{
            width: shrink ? 60 : 100,
            height: shrink ? 60 : 100,
            borderRadius: shrink ? 12 : 20,
            background: C.card,
            border: `2px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: shrink ? 32 : 56,
            transition:
              "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            transform: shrink
              ? "translateX(60px) scale(0.6)"
              : "none",
            opacity: shrink ? 0 : 1,
          }}
        >
          {food.emoji}
        </div>
        <div
          style={{
            width: 48,
            height: 80,
            borderRadius: 10,
            background: C.gray1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative" as const,
          }}
        >
          <div
            style={{
              width: 36,
              height: 60,
              borderRadius: 6,
              background: "#2C2C2E",
            }}
          />
          {shrink && (
            <div
              style={{
                position: "absolute" as const,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                fontSize: 20,
              }}
            >
              {food.emoji}
            </div>
          )}
        </div>
      </div>
      {done ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: C.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check className="w-7 h-7" />
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: C.green,
            }}
          >
            Erfolgreich gespeichert!
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 14, color: C.gray2 }}>
          {steps[step]}
        </div>
      )}
    </div>
  );
}

// ─── Screen: Success ───────────────────────────────────────────────────────────

function SuccessScreen({
  food,
  onDone,
}: {
  food: FoodItem;
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background: C.bg,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: C.green,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation:
            "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <Check className="w-9 h-9" strokeWidth={3} />
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: C.gray1,
        }}
      >
        Erfolgreich gespeichert
      </div>
      <div style={{ fontSize: 14, color: C.gray2 }}>
        {food.emoji} {food.name} wurde hinzugefügt
      </div>
      <div
        style={{
          width: 200,
          height: 1,
          background: C.border,
          margin: "4px 0",
        }}
      />
      <div style={{ fontSize: 13, color: C.gray3 }}>
        Bereit für das nächste Lebensmittel
      </div>
      <div
        style={{
          width: 100,
          height: 3,
          background: C.border,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: C.blue,
            borderRadius: 2,
            animation: "fillBar 2.5s linear forwards",
          }}
        />
      </div>
    </div>
  );
}

// ─── Screen: Standby ───────────────────────────────────────────────────────────

function StandbyScreen({ onWake }: { onWake: () => void }) {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const [dateStr, setDateStr] = useState(() =>
    formatDE(new Date(), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );

  useEffect(() => {
    const iv = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setDateStr(
        formatDE(now, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      onClick={onWake}
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 48px",
        cursor: "pointer",
        background: "var(--c-standby-bg)",
      }}
    >
      {/* Top: horizontal logo — adapts to light/dark via --logo-filter */}
      <HorizontalLogo scale={0.44} themed />

      {/* Center: clock */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Subtle ambient glow behind time — dark mode only visible */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 200,
            color: "var(--c-standby-text)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            textShadow: "0 0 60px rgba(59,130,246,0.06)",
          }}
        >
          {time}
        </div>
        <div
          style={{
            fontSize: 15,
            color: "var(--c-standby-sub)",
            opacity: 0.7,
          }}
        >
          {dateStr}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.green,
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: "var(--c-standby-sub)",
              opacity: 0.65,
            }}
          >
            Bereit zum Wiegen
          </span>
        </div>
      </div>

      {/* Bottom */}
      <div
        style={{
          textAlign: "center" as const,
          fontSize: 11,
          color: "var(--c-standby-sub)",
          opacity: 0.35,
        }}
      >
        Display berühren oder Lebensmittel auflegen
      </div>
    </div>
  );
}

// ─── Screen: GuestWeighing ─────────────────────────────────────────────────────

function GuestWeighingScreen({
  guestMode,
  food,
  weight,
  onDone,
  onNew,
}: {
  guestMode: GuestMode;
  food: FoodItem | null;
  weight: number;
  onDone: () => void;
  onNew: () => void;
}) {
  const [unit, setUnit] = useState<"g" | "oz">("g");
  const displayed =
    unit === "g"
      ? weight
      : Math.round(weight * 0.03527 * 10) / 10;

  return (
    <div style={{ flex: 1, display: "flex" }}>
      <div
        style={{
          width: 380,
          background: C.card,
          borderRight: `1px solid ${C.border}`,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <div style={{ textAlign: "center" as const }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: C.gray1,
              lineHeight: 1,
            }}
          >
            {displayed}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            {(["g", "oz"] as const).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                style={{
                  padding: "4px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${unit === u ? C.blue : C.border}`,
                  background: unit === u ? C.blueLt : "#fff",
                  color: unit === u ? C.blue : C.gray2,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <ScaleIllustration width={240} />
        <div
          style={{
            fontSize: 12,
            color: C.gray3,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <User className="w-3 h-3" />
          Kein Profil · Kein Tracking
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {guestMode === "scale-only" ? (
          <div
            style={{
              background: C.card,
              borderRadius: 18,
              padding: 20,
              border: `1.5px solid ${C.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Scale className="w-5 h-5" />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.gray1,
                }}
              >
                Klassische Küchenwaage
              </div>
            </div>
            <div style={{ fontSize: 13, color: C.gray2 }}>
              Nur Gewicht wird gemessen. Keine Nährwertanalyse
              aktiv.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <PrimaryBtn label="Fertig" onClick={onDone} />
              <SecondaryBtn
                label="Weiteres wiegen"
                onClick={onNew}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {food && (
              <div
                style={{
                  background: C.card,
                  borderRadius: 16,
                  border: `1.5px solid ${C.border}`,
                  padding: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 36 }}>
                  {food.emoji}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.gray1,
                    }}
                  >
                    {food.name}
                  </div>
                  <div style={{ fontSize: 12, color: C.gray2 }}>
                    {calcNutrition(food, weight).calories} kcal
                    · {weight}g
                  </div>
                </div>
              </div>
            )}
            <div
              style={{
                background: C.card,
                borderRadius: 12,
                padding: "10px 14px",
                border: `1px solid ${C.orange}`,
                fontSize: 12,
                color: C.orange,
              }}
            >
              KI-Gastmodus aktiv — Nährwerte werden angezeigt,
              aber nicht gespeichert.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <PrimaryBtn label="Fertig" onClick={onDone} />
              <SecondaryBtn
                label="Weiteres wiegen"
                onClick={onNew}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Screen: History ───────────────────────────────────────────────────────────

function HistoryScreen({
  onBack,
  calorieGoal,
  onReweigh,
}: {
  onBack: () => void;
  calorieGoal: number;
  onReweigh: (food: FoodItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(HISTORY_ITEMS);
  const [selectedItem, setSelectedItem] = useState<
    (typeof HISTORY_ITEMS)[number] | null
  >(null);
  const todayItems = items.filter((i) => i.date === "Heute");
  const yesterdayItems = items.filter(
    (i) => i.date === "Gestern",
  );
  const olderItems = items.filter(
    (i) => i.date !== "Heute" && i.date !== "Gestern",
  );
  const todayCal = todayItems.reduce(
    (s, i) => s + i.calories,
    0,
  );

  const allFiltered = items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase()),
  );

  const grouped: {
    label: string;
    items: typeof HISTORY_ITEMS;
  }[] = query
    ? [{ label: "Suchergebnisse", items: allFiltered }]
    : [
        { label: "Heute", items: todayItems },
        { label: "Gestern", items: yesterdayItems },
        { label: "Mo., 7. Jul.", items: olderItems },
      ].filter((g) => g.items.length > 0);
  const calorieColor =
    todayCal <= calorieGoal
      ? C.green
      : todayCal <= calorieGoal + 50
        ? "#F59E0B"
        : C.red;
  const caloriePct = Math.min(
    100,
    (todayCal / calorieGoal) * 100,
  );
  const detailFood = selectedItem
    ? (ALL_FOODS.find((f) => f.name === selectedItem.name) ?? {
        id: `history-${selectedItem.id}`,
        name: selectedItem.name,
        emoji: selectedItem.emoji,
        caloriesPer100g:
          (selectedItem.calories / selectedItem.weight) * 100,
        protein: 2.4,
        fat: 1.2,
        carbs: 12.5,
        fiber: 2.1,
        confidence: 100,
      })
    : null;
  const detailNutrition =
    selectedItem && detailFood
      ? calcNutrition(detailFood, selectedItem.weight)
      : null;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        position: "relative" as const,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 248,
          background: C.card,
          borderRight: `1px solid ${C.border}`,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.blue,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            padding: 0,
          }}
        >
          <ChevronLeft className="w-4 h-4" /> Zurück
        </button>
        <div style={{ color: C.gray1 }}>
          <div style={{ fontSize: 12, color: C.gray2 }}>
            Heute gegessen
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              marginTop: 2,
            }}
          >
            {todayCal}
          </div>
          <div style={{ fontSize: 13, color: C.gray2 }}>
            von {calorieGoal} kcal
          </div>
        </div>
        <div>
          <div
            style={{
              height: 10,
              borderRadius: 999,
              background: C.muted,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${caloriePct}%`,
                height: "100%",
                background: calorieColor,
                borderRadius: 999,
                transition:
                  "width .4s ease, background .3s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 7,
              fontSize: 11,
            }}
          >
            <span
              style={{ color: calorieColor, fontWeight: 700 }}
            >
              {todayCal <= calorieGoal
                ? `${calorieGoal - todayCal} kcal übrig`
                : `${todayCal - calorieGoal} kcal darüber`}
            </span>
            <span style={{ color: C.gray3 }}>
              {Math.round((todayCal / calorieGoal) * 100)}%
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 11,
              fontSize: 9,
              color: C.gray3,
            }}
          >
            <span>● Grün: im Ziel</span>
            <span>● Gelb: ≤ 50 drüber</span>
            <span>● Rot: &gt; 50</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[
            {
              label: "Protein",
              value: "4.2g",
              color: "#93C5FD",
            },
            { label: "Fett", value: "3.5g", color: "#FED7AA" },
            {
              label: "Kohlenhydrate",
              value: "37g",
              color: "#C4B5FD",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  color: C.gray2,
                  fontSize: 12,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  color: C.gray1,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className="ss-nutrition-scroll"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px 18px",
          gap: 12,
          overflowY: "auto" as const,
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: C.muted,
            borderRadius: 10,
            padding: "7px 12px",
          }}
        >
          <Search className="w-3.5 h-3.5" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen…"
            style={{
              border: "none",
              background: "transparent",
              fontSize: 13,
              outline: "none",
              flex: 1,
              fontFamily: "inherit",
              color: C.gray1,
            }}
          />
        </div>
        {grouped.map((group) => (
          <div key={group.label}>
            <div
              style={{
                fontSize: 11,
                color: C.gray3,
                fontWeight: 600,
                textTransform: "uppercase" as const,
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              {group.label}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: C.card,
                    borderRadius: 12,
                    padding: "10px 14px",
                    border: `1px solid ${C.border}`,
                    width: "100%",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 28 }}>
                    {item.emoji}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: C.gray1,
                      }}
                    >
                      {item.name}
                    </div>
                    <div
                      style={{ fontSize: 11, color: C.gray2 }}
                    >
                      {item.weight}g · {item.time}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: C.gray1,
                      }}
                    >
                      {item.calories} kcal
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.blue,
                        marginTop: 2,
                      }}
                    >
                      Details
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedItem && detailFood && detailNutrition && (
        <div
          style={{
            position: "absolute" as const,
            top: 12,
            right: 14,
            bottom: 12,
            left: 262,
            zIndex: 10,
            background: C.elevated,
            border: `1px solid ${C.border}`,
            borderRadius: 22,
            boxShadow: "0 20px 60px rgba(0,0,0,.22)",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 36 }}>
              {selectedItem.emoji}
            </span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 760,
                  color: C.gray1,
                }}
              >
                {selectedItem.name}
              </div>
              <div style={{ fontSize: 11, color: C.gray2 }}>
                {selectedItem.weight} g ·{" "}
                {selectedItem.calories} kcal ·{" "}
                {selectedItem.time}
              </div>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              aria-label="Details schließen"
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                border: "none",
                background: C.muted,
                color: C.gray1,
                cursor: "pointer",
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            className="ss-nutrition-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              margin: "12px 0",
              paddingRight: 8,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
              }}
            >
              {[
                ["Protein", `${detailNutrition.protein} g`],
                ["Fett", `${detailNutrition.fat} g`],
                ["Kohlenhydrate", `${detailNutrition.carbs} g`],
                ["Ballaststoffe", `${detailNutrition.fiber} g`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: 10,
                  }}
                >
                  <div style={{ fontSize: 9, color: C.gray3 }}>
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.gray1,
                      marginTop: 3,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.gray3,
                fontWeight: 750,
                letterSpacing: 0.8,
                margin: "14px 0 7px",
              }}
            >
              MIKRONÄHRSTOFFE
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "7px 18px",
              }}
            >
              {[
                ["Vitamin A", "42 µg"],
                ["Vitamin C", "18 mg"],
                ["Kalium", "412 mg"],
                ["Calcium", "25 mg"],
                ["Magnesium", "18 mg"],
                ["Eisen", "0,4 mg"],
                ["Zink", "0,2 mg"],
                ["Folsäure", "41 µg"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    borderBottom: `1px solid ${C.border}`,
                    paddingBottom: 5,
                  }}
                >
                  <span style={{ color: C.gray2 }}>
                    {label}
                  </span>
                  <span
                    style={{ color: C.gray1, fontWeight: 600 }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryBtn
              label="Erneut wiegen & scannen"
              onClick={() => onReweigh(detailFood)}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => {
                setItems((current) =>
                  current.filter(
                    (i) => i.id !== selectedItem.id,
                  ),
                );
                setSelectedItem(null);
              }}
              style={{
                width: 44,
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: C.card,
                color: C.red,
                cursor: "pointer",
              }}
              aria-label="Lebensmittel entfernen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: ProfileScreen ─────────────────────────────────────────────────────

function ProfileScreenView({
  profile,
  calorieGoal,
  onBack,
  onOpenCalorieGoal,
  onProfileSelect,
}: {
  profile: ProfileData;
  calorieGoal: number;
  onBack: () => void;
  onOpenCalorieGoal: () => void;
  onProfileSelect: () => void;
}) {
  const consumed = HISTORY_ITEMS.filter(
    (i) => i.date === "Heute",
  ).reduce((s, i) => s + i.calories, 0);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        gap: 16,
        padding: "16px 20px 18px",
        background: C.bg,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 220,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 11,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.blue,
            display: "flex",
            alignItems: "center",
            fontSize: 13,
            padding: 0,
            fontWeight: 500,
          }}
        >
          <ChevronLeft className="w-4 h-4" /> Zurück
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Avatar
            initials={profile.initials}
            color={profile.color}
            size={56}
          />
          <div style={{ textAlign: "center" as const }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: C.gray1,
              }}
            >
              {profile.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: C.gray2,
                marginTop: 2,
              }}
            >
              {profile.goal}
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {[
            {
              icon: <Edit className="w-3.5 h-3.5" />,
              label: "Bearbeiten",
            },
            {
              icon: <Lock className="w-3.5 h-3.5" />,
              label: "PIN ändern",
            },
            {
              icon: <RefreshCw className="w-3.5 h-3.5" />,
              label: "Profil wechseln",
              onClick: onProfileSelect,
            },
            {
              icon: <LogOut className="w-3.5 h-3.5" />,
              label: "Abmelden",
              red: true,
            },
          ].map(({ icon, label, onClick, red }) => (
            <button
              key={label}
              onClick={onClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: C.muted,
                border: "none",
                borderRadius: 10,
                padding: "7px 11px",
                cursor: "pointer",
                fontSize: 13,
                color: red ? C.red : C.gray1,
                fontWeight: 500,
              }}
            >
              <span style={{ color: red ? C.red : C.gray2 }}>
                {icon}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "0 6px 4px 0",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflowY: "auto" as const,
          minHeight: 0,
        }}
      >
        <div
          style={{
            background: C.card,
            borderRadius: 16,
            padding: "14px 16px",
            border: `1px solid ${C.border}`,
          }}
        >
          <CalorieProgress
            current={consumed}
            goal={calorieGoal}
          />
          <button
            onClick={onOpenCalorieGoal}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.blue,
              fontSize: 11,
              fontWeight: 600,
              padding: 0,
              marginTop: 4,
            }}
          >
            Kalorienziel bearbeiten
          </button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            {
              label: "Protein",
              value: "4g",
              color: C.blue,
              bg: C.blueLt,
            },
            {
              label: "Fett",
              value: "3.5g",
              color: C.orange,
              bg: C.card,
            },
            {
              label: "Kohlenhydrate",
              value: "37g",
              color: "#8B5CF6",
              bg: C.card,
            },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              style={{
                flex: 1,
                background: bg,
                borderRadius: 12,
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: 11, color: C.gray2 }}>
                {label}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color,
                  marginTop: 2,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: C.card,
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: `1px solid #FED7AA`,
          }}
        >
          <Star className="w-5 h-5" fill={C.orange} />
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              5-Tage-Streak
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Weiter so! Du bleibst konsequent.
            </div>
          </div>
        </div>
        <div
          style={{
            background: C.blueLt,
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: `1px solid #BFDBFE`,
          }}
        >
          <Smartphone className="w-5 h-5" />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              Verbunden mit YAZIO
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Letzter Sync: vor 1 Stunde
            </div>
          </div>
          <div
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: C.blue,
              position: "relative" as const,
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute" as const,
                top: 2,
                right: 2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen: Settings ──────────────────────────────────────────────────────────

function SettingsScreen({
  onBack,
  appearance,
  setAppearance,
}: {
  onBack: () => void;
  appearance: AppearanceSetting;
  setAppearance: (a: AppearanceSetting) => void;
}) {
  const [activeNav, setActiveNav] = useState("Messung");
  const navItems = [
    "Messung",
    "Darstellung",
    "Anzeige",
    "Verbindung",
    "System",
  ];

  const content: Record<string, React.ReactNode> = {
    Messung: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          Messung
        </div>
        {[
          {
            label: "Automatische Erkennung",
            desc: "KI erkennt Lebensmittel per Kamera",
            on: true,
          },
          {
            label: "Gewichtseinheit",
            desc: "Gramm (g)",
            toggle: false,
          },
          {
            label: "Tarieren beim Start",
            desc: "Waage beim Einschalten nullen",
            on: true,
          },
        ].map(({ label, desc, on, toggle }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: C.card,
              borderRadius: 12,
              padding: "10px 14px",
              border: `1px solid ${C.border}`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.gray1,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 11, color: C.gray2 }}>
                {desc}
              </div>
            </div>
            {toggle !== false && (
              <div
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: on ? C.blue : C.gray3,
                  position: "relative" as const,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#fff",
                    position: "absolute" as const,
                    top: 2,
                    ...(on ? { right: 2 } : { left: 2 }),
                    transition: "all 0.2s",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    ),
    Darstellung: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          Darstellung
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.gray2,
            lineHeight: 1.5,
          }}
        >
          Wähle, wie Smart Scale aussehen soll.{" "}
          <em>Automatisch</em> passt das Erscheinungsbild
          abhängig von der Tageszeit an.
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {(
            [
              {
                id: "light" as AppearanceSetting,
                icon: "☀️",
                label: "Hell",
                desc: "Helles Interface mit weißem Hintergrund",
              },
              {
                id: "dark" as AppearanceSetting,
                icon: "🌙",
                label: "Dunkel",
                desc: "Dunkles Premium-Interface, schonend für die Augen",
              },
              {
                id: "auto" as AppearanceSetting,
                icon: "🌅",
                label: "Automatisch",
                desc: "Hell am Tag, dunkel am Abend & nachts",
              },
            ] as {
              id: AppearanceSetting;
              icon: string;
              label: string;
              desc: string;
            }[]
          ).map((opt) => {
            const active = appearance === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAppearance(opt.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: active ? C.blueLt : C.card,
                  border: `1.5px solid ${active ? C.blue : C.border}`,
                  borderRadius: 14,
                  padding: "12px 16px",
                  cursor: "pointer",
                  textAlign: "left" as const,
                  width: "100%",
                }}
              >
                <span style={{ fontSize: 22 }}>{opt.icon}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: active ? C.blue : C.gray1,
                    }}
                  >
                    {opt.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.gray2,
                      marginTop: 2,
                    }}
                  >
                    {opt.desc}
                  </div>
                </div>
                {active && (
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: C.blue,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Check
                      className="w-3 h-3"
                      style={{ color: "#fff" }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    ),
    Anzeige: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          Anzeige
        </div>
        {[
          {
            label: "Helligkeit",
            desc: "Automatisch anpassen",
            icon: <Sun className="w-4 h-4" />,
          },
          {
            label: "Benachrichtigungen",
            desc: "Ziel-Erinnerungen",
            icon: <Bell className="w-4 h-4" />,
          },
          {
            label: "Sprache",
            desc: "Deutsch",
            icon: <Info className="w-4 h-4" />,
          },
        ].map(({ label, desc, icon }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: C.card,
              borderRadius: 12,
              padding: "10px 14px",
              border: `1px solid ${C.border}`,
            }}
          >
            {icon}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.gray1,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 11, color: C.gray2 }}>
                {desc}
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        ))}
      </div>
    ),
    Verbindung: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          Verbindung
        </div>
        {[
          {
            label: "WLAN",
            desc: "SmartHome_5G",
            icon: <Wifi className="w-4 h-4" />,
            connected: true,
          },
          {
            label: "Bluetooth",
            desc: "YAZIO · letzter Sync vor 1 Stunde",
            icon: <Smartphone className="w-4 h-4" />,
            connected: true,
          },
          {
            label: "Cloud-Sync",
            desc: "Automatisch",
            icon: <RefreshCw className="w-4 h-4" />,
            connected: true,
          },
        ].map(({ label, desc, icon, connected }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: C.card,
              borderRadius: 12,
              padding: "10px 14px",
              border: `1px solid ${C.border}`,
            }}
          >
            {icon}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.gray1,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 11, color: C.gray2 }}>
                {desc}
              </div>
            </div>
            {connected && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: C.green,
                }}
              />
            )}
          </div>
        ))}
      </div>
    ),
    System: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: C.gray1,
          }}
        >
          System
        </div>
        {[
          {
            label: "Firmware",
            desc: "Version 2.4.1 (aktuell)",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            label: "Datenschutz",
            desc: "Alle Daten lokal",
            icon: <Shield className="w-4 h-4" />,
          },
          {
            label: "Daten löschen",
            desc: "Alle Messdaten entfernen",
            icon: <Trash2 className="w-4 h-4" />,
          },
        ].map(({ label, desc, icon }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: C.card,
              borderRadius: 12,
              padding: "10px 14px",
              border: `1px solid ${C.border}`,
              cursor: "pointer",
            }}
          >
            {icon}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.gray1,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 11, color: C.gray2 }}>
                {desc}
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        ))}
      </div>
    ),
  };

  return (
    <div style={{ flex: 1, display: "flex" }}>
      <div
        style={{
          width: 202,
          background: C.card,
          borderRight: `1px solid ${C.border}`,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: C.blue,
            fontSize: 12,
            fontWeight: 500,
            padding: "6px 8px",
            marginBottom: 4,
          }}
        >
          <ChevronLeft className="w-4 h-4" /> Zurück
        </button>
        <div
          style={{
            fontSize: 11,
            color: C.gray3,
            fontWeight: 600,
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
            padding: "0 8px",
            marginBottom: 4,
          }}
        >
          Einstellungen
        </div>
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => setActiveNav(item)}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "9px 12px",
              borderRadius: 10,
              background:
                activeNav === item ? C.blue : "transparent",
              color: activeNav === item ? "#fff" : C.gray1,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeNav === item ? 700 : 500,
              textAlign: "left" as const,
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div
        style={{
          flex: 1,
          padding: "18px 20px",
          overflowY: "auto" as const,
        }}
      >
        {content[activeNav]}
      </div>
    </div>
  );
}

// ─── Dialog: FoodSelect ────────────────────────────────────────────────────────

function FoodSelectDialog({
  onSelect,
  onClose,
}: {
  onSelect: (food: FoodItem) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const noData = ["Fisch", "Getränke"];

  return (
    <div
      style={{
        position: "absolute" as const,
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: C.elevated,
          borderRadius: 20,
          width: 560,
          maxHeight: 380,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {category && (
              <button
                onClick={() => setCategory(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.blue,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              {category ?? "Lebensmittel auswählen"}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: C.muted,
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto" as const,
            padding: 14,
          }}
        >
          {!category ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
              }}
            >
              {CATEGORY_META.map(({ key, emoji, label }) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  style={{
                    background: C.card,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "12px 8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 26 }}>{emoji}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: C.gray1,
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          ) : noData.includes(category) ? (
            <div
              style={{
                textAlign: "center" as const,
                color: C.gray3,
                fontSize: 13,
                padding: 24,
              }}
            >
              Bald verfügbar
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
              }}
            >
              {(FOOD_DB[category] || []).map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    onSelect(food);
                    onClose();
                  }}
                  style={{
                    background: C.card,
                    border: `1.5px solid ${C.border}`,
                    borderRadius: 12,
                    padding: "12px 8px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ fontSize: 30 }}>
                    {food.emoji}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: C.gray1,
                      fontWeight: 600,
                      textAlign: "center" as const,
                    }}
                  >
                    {food.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dialog: GuestMode ─────────────────────────────────────────────────────────

function GuestModeDialog({
  onSelect,
  onClose,
}: {
  onSelect: (mode: GuestMode) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute" as const,
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: C.elevated,
          borderRadius: 20,
          width: 460,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.gray1,
            }}
          >
            Gastmodus wählen
          </span>
          <button
            onClick={onClose}
            style={{
              background: C.muted,
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => onSelect("smart")}
            style={{
              flex: 1,
              background: C.blueLt,
              border: `2px solid ${C.blue}`,
              borderRadius: 16,
              padding: 16,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              textAlign: "center" as const,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: C.blue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera className="w-5 h-5" />
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              KI-Gast
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Kalorien & Nährstoffe
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Kamera erkennt Lebensmittel
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.blue,
                fontWeight: 600,
                background: C.blueLt,
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              Nichts wird gespeichert
            </div>
          </button>
          <button
            onClick={() => onSelect("scale-only")}
            style={{
              flex: 1,
              background: C.card,
              border: `2px solid ${C.border}`,
              borderRadius: 16,
              padding: 16,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              textAlign: "center" as const,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: C.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Scale className="w-5 h-5" />
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              Nur Waage
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Nur Gewicht
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Kamera deaktiviert
            </div>
            <div
              style={{
                fontSize: 10,
                color: C.gray2,
                fontWeight: 600,
                background: C.muted,
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              Klassische Küchenwaage
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dialog: CalorieGoal ───────────────────────────────────────────────────────

function CalorieGoalDialog({
  current,
  onSave,
  onClose,
}: {
  current: number;
  onSave: (v: number) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState(current.toString());
  return (
    <div
      style={{
        position: "absolute" as const,
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: C.elevated,
          borderRadius: 20,
          width: 380,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: C.gray1,
            }}
          >
            Kalorienziel bearbeiten
          </span>
          <button
            onClick={onClose}
            style={{
              background: C.muted,
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <label
            style={{
              fontSize: 12,
              color: C.gray2,
              fontWeight: 500,
            }}
          >
            Tägliches Kalorienziel
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              marginTop: 6,
            }}
          >
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "12px 0 0 12px",
                border: `1.5px solid ${C.border}`,
                borderRight: "none",
                fontSize: 18,
                fontWeight: 700,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box" as const,
                color: C.gray1,
              }}
            />
            <div
              style={{
                padding: "10px 14px",
                background: C.muted,
                borderRadius: "0 12px 12px 0",
                border: `1.5px solid ${C.border}`,
                borderLeft: "none",
                fontSize: 14,
                color: C.gray2,
                fontWeight: 600,
              }}
            >
              kcal
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <PrimaryBtn
            label="Speichern"
            onClick={() => {
              onSave(parseInt(val) || current);
              onClose();
            }}
            style={{ flex: 1 }}
          />
          <SecondaryBtn
            label="Abbrechen"
            onClick={onClose}
            style={{ flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Device Frame ──────────────────────────────────────────────────────────────

function DeviceFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative" as const,
        width: "min(640px, calc(100vw - 32px))",
        aspectRatio: "640 / 414",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute" as const,
          left: -4,
          top: 100,
          width: 4,
          height: 36,
          background: "#2A2A2A",
          borderRadius: "3px 0 0 3px",
        }}
      />
      <div
        style={{
          position: "absolute" as const,
          left: -4,
          top: 148,
          width: 4,
          height: 36,
          background: "#2A2A2A",
          borderRadius: "3px 0 0 3px",
        }}
      />
      <div
        style={{
          position: "absolute" as const,
          right: -4,
          top: 140,
          width: 4,
          height: 60,
          background: "#2A2A2A",
          borderRadius: "0 3px 3px 0",
        }}
      />
      <div
        style={{
          position: "absolute" as const,
          inset: 0,
          borderRadius: 26,
          background: "linear-gradient(145deg,#414146,#171719)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.45), 0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
          padding: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            borderRadius: 17,
            background: "transparent",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 8,
          }}
        >
          <div
            style={{
              width: 72,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.18)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("boot");
  const [fading, setFading] = useState(false);
  const [screenKey, setScreenKey] = useState(0);
  const [profile, setProfile] = useState<ProfileData | null>(
    PROFILES[0],
  );
  const [dialog, setDialog] = useState<Dialog>(null);
  const [currentFood, setCurrentFood] =
    useState<FoodItem | null>(null);
  const [demoWeight, setDemoWeight] = useState(0);
  const [guestMode, setGuestMode] =
    useState<GuestMode>("smart");
  const [calorieGoal, setCalorieGoal] = useState(1600);
  const [weighMode, setWeighMode] = useState<WeighMode>("ki");
  const [selectedFood, setSelectedFood] =
    useState<FoodItem | null>(null);
  const [taraActive, setTaraActive] = useState(false);
  const [isFirstUse, setIsFirstUse] = useState(false);
  const [onboardingActive, setOnboardingActive] =
    useState(false);
  const [demoLowConf, setDemoLowConf] = useState(false);
  const [secondsInactive, setSecondsInactive] = useState(0);
  const [appearance, setAppearance] =
    useState<AppearanceSetting>("light");
  const activeTheme = (
    appearance === "auto" ? getAutoTheme() : appearance
  ) as "light" | "dark";

  const STANDBY_WARNING_AT = 170; // show banner at 2 min 50 s
  const STANDBY_AT = 180; // enter standby at 3 min

  const resetTimer = useCallback(
    () => setSecondsInactive(0),
    [],
  );

  useEffect(() => {
    if (screen === "standby") return;
    const interval = setInterval(() => {
      setSecondsInactive((s) => {
        if (s + 1 >= STANDBY_AT) {
          setScreen("standby");
          setScreenKey((k) => k + 1);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen]);

  const go = useCallback(
    (to: Screen, delay = 0) => {
      setTimeout(() => {
        setFading(true);
        setTimeout(() => {
          setScreen(to);
          setScreenKey((k) => k + 1);
          setFading(false);
        }, 220);
      }, delay);
      resetTimer();
    },
    [resetTimer],
  );

  const openDialog = (d: Dialog) => {
    setDialog(d);
    resetTimer();
  };
  const closeDialog = () => setDialog(null);

  const handleFoodSelect = (food: FoodItem) => {
    if (weighMode === "manual") {
      setSelectedFood(food);
    } else {
      setCurrentFood(food);
      setDemoWeight(Math.round(Math.random() * 170 + 80));
      go("recognition-result");
    }
    closeDialog();
  };

  const handleScanComplete = useCallback(
    (food: FoodItem, weight: number) => {
      const f = demoLowConf
        ? { ...food, confidence: 78 }
        : food;
      setCurrentFood(f);
      setDemoWeight(weight);
      if (f.confidence < 90) go("low-confidence");
      else go("recognition-result");
    },
    [demoLowConf, go],
  );

  const handleManualWeighComplete = useCallback(
    (food: FoodItem, weight: number) => {
      setCurrentFood(food);
      setDemoWeight(weight);
      go("recognition-result");
    },
    [go],
  );

  const handleGuestModeSelect = (mode: GuestMode) => {
    setGuestMode(mode);
    closeDialog();
    if (mode === "smart") go("food-detection");
    else go("guest-weighing");
  };

  const NAV_SHORTCUTS: { label: string; screen: Screen }[] = [
    { label: "Boot", screen: "boot" },
    { label: "Zurück", screen: "returning-user" },
    { label: "Profile", screen: "profile-selection" },
    { label: "PIN", screen: "login" },
    { label: "Home", screen: "home" },
    { label: "Scan", screen: "food-detection" },
    { label: "Manuell", screen: "manual-weigh" },
    { label: "Ergebnis", screen: "recognition-result" },
    { label: "Standby", screen: "standby" },
    { label: "Verlauf", screen: "history" },
    { label: "Profil", screen: "profile-screen" },
    { label: "Einstellungen", screen: "settings" },
  ];

  const renderScreen = (): React.ReactNode => {
    switch (screen) {
      case "boot":
        return (
          <BootScreen
            onDone={(first) => {
              setOnboardingActive(first);
              go(
                first ? "onboarding-welcome" : "returning-user",
              );
            }}
            isFirstUse={isFirstUse}
          />
        );
      case "onboarding-welcome":
        return (
          <OnboardingScreen
            step="welcome"
            onNext={() => go("onboarding-explain")}
            onSkip={() => {
              setOnboardingActive(false);
              go("returning-user");
            }}
          />
        );
      case "onboarding-explain":
        return (
          <OnboardingScreen
            step="explain"
            onNext={() => go("create-profile")}
          />
        );
      case "onboarding-ready":
        return (
          <OnboardingScreen
            step="ready"
            onNext={() => {
              setOnboardingActive(false);
              go("home");
            }}
          />
        );
      case "returning-user":
        return (
          <ReturningUserScreen
            onSelectProfile={(p) => {
              setProfile(p);
              go("login");
            }}
            onCreate={() => go("create-profile")}
            onScaleOnly={() => {
              setProfile(null);
              setGuestMode("scale-only");
              go("guest-weighing");
            }}
            onGuest={() => {
              setProfile(null);
              openDialog("guest-mode");
            }}
          />
        );
      case "profile-selection":
        return (
          <ProfileSelectionScreen
            onBack={() => go("returning-user")}
            onSelect={(p) => {
              setProfile(p);
              go("login");
            }}
            onCreate={() => go("create-profile")}
          />
        );
      case "create-profile":
        return (
          <CreateProfileScreen
            onBack={() =>
              go(
                onboardingActive
                  ? "onboarding-explain"
                  : "returning-user",
              )
            }
            onCreate={(newProfile) => {
              setProfile(newProfile);
              go(
                onboardingActive ? "onboarding-ready" : "login",
              );
            }}
          />
        );
      case "login":
        return (
          <LoginScreen
            profile={profile ?? PROFILES[0]}
            onBack={() => go("returning-user")}
            onLogin={() => go("home")}
          />
        );
      case "home":
        return (
          <HomeScreen
            profile={profile}
            weighMode={weighMode}
            setWeighMode={(m) => {
              setWeighMode(m);
              if (m !== "manual") setSelectedFood(null);
            }}
            selectedFood={selectedFood}
            setSelectedFood={setSelectedFood}
            taraActive={taraActive}
            setTaraActive={setTaraActive}
            onCameraScan={() => go("food-detection")}
            onOpenFoodSelect={() => openDialog("food-select")}
            onManualWeigh={() => {
              if (selectedFood) go("manual-weigh");
            }}
            onScaleOnly={() => go("guest-weighing")}
            onHistory={() => go("history")}
            onProfile={() => go("profile-screen")}
            onSettings={() => go("settings")}
          />
        );
      case "manual-weigh":
        return selectedFood ? (
          <ManualWeighScreen
            food={selectedFood}
            onComplete={handleManualWeighComplete}
            onCancel={() => go("home")}
          />
        ) : null;
      case "food-detection":
        return (
          <FoodDetectionScreen
            onDone={handleScanComplete}
            onCancel={() => go("home")}
          />
        );
      case "low-confidence":
        return currentFood ? (
          <LowConfidenceScreen
            food={currentFood}
            onRescan={() => go("food-detection")}
            onFoodSelect={() => openDialog("food-select")}
            onUseAnyway={() => go("recognition-result")}
          />
        ) : null;
      case "recognition-result":
        return currentFood ? (
          <RecognitionResultScreen
            food={currentFood}
            weight={demoWeight}
            profile={profile}
            onSave={() => go("tracking-animation")}
            onChangeFood={() => openDialog("food-select")}
            onCancel={() => go("home")}
          />
        ) : null;
      case "confirmation":
        return currentFood ? (
          <ConfirmationScreen
            food={currentFood}
            weight={demoWeight}
            profile={profile}
            onSave={() => go("tracking-animation")}
            onCancel={() => go("home")}
            onSelectProfile={() => go("profile-selection")}
          />
        ) : null;
      case "tracking-animation":
        return currentFood ? (
          <TrackingAnimationScreen
            food={currentFood}
            onDone={() => go("success")}
          />
        ) : null;
      case "success":
        return currentFood ? (
          <SuccessScreen
            food={currentFood}
            onDone={() => {
              setCurrentFood(null);
              setSelectedFood(null);
              go(profile ? "home" : "returning-user");
            }}
          />
        ) : null;
      case "standby":
        return (
          <StandbyScreen onWake={() => go("returning-user")} />
        );
      case "guest-weighing":
        return (
          <GuestWeighingScreen
            guestMode={guestMode}
            food={currentFood}
            weight={demoWeight || 142}
            onDone={() =>
              go(profile ? "home" : "returning-user")
            }
            onNew={() =>
              go(
                guestMode === "smart"
                  ? "food-detection"
                  : "guest-weighing",
              )
            }
          />
        );
      case "history":
        return (
          <HistoryScreen
            calorieGoal={calorieGoal}
            onBack={() => go("home")}
            onReweigh={(food) => {
              setCurrentFood(food);
              setSelectedFood(food);
              go("food-detection");
            }}
          />
        );
      case "profile-screen":
        return profile ? (
          <ProfileScreenView
            profile={profile}
            calorieGoal={calorieGoal}
            onBack={() => go("home")}
            onOpenCalorieGoal={() => openDialog("calorie-goal")}
            onProfileSelect={() => go("profile-selection")}
          />
        ) : null;
      case "settings":
        return (
          <SettingsScreen
            onBack={() => go("home")}
            appearance={appearance}
            setAppearance={setAppearance}
          />
        );
      default:
        return null;
    }
  };

  const showStandbyBanner =
    secondsInactive >= STANDBY_WARNING_AT &&
    screen !== "standby";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 12%,#303038 0%,#151518 48%,#09090A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: 16,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
        width: "100%",
        overflow: "auto",
      }}
    >
      <style>{`
        @keyframes ss-ring  { 0%{transform:scale(0.86);opacity:0.55} 100%{transform:scale(1.6);opacity:0} }
        @keyframes ss-scan  { 0%{top:5px} 50%{top:calc(100% - 5px)} 100%{top:5px} }
        @keyframes ss-pulse { 0%,100%{transform:scale(0.82);opacity:0.45} 50%{transform:scale(1.18);opacity:1} }
        @keyframes ss-fade  { 0%,100%{opacity:0.28} 50%{opacity:0.55} }
        @keyframes ss-show  { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
        @keyframes ss-dot   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes popIn    { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
        @keyframes fillBar  { from{width:0} to{width:100%} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes breathing{ 0%,100%{opacity:0.55;transform:scale(0.96)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button { touch-action: manipulation; }
        button:focus-visible { outline: 3px solid rgba(10,132,255,.45); outline-offset: 2px; }
        .ss-nutrition-scroll { scrollbar-width: thin; scrollbar-color: rgba(110,110,115,.55) transparent; overscroll-behavior: contain; }
        .ss-nutrition-scroll::-webkit-scrollbar { width: 6px; }
        .ss-nutrition-scroll::-webkit-scrollbar-track { background: transparent; }
        .ss-nutrition-scroll::-webkit-scrollbar-thumb { background: rgba(110,110,115,.5); border-radius: 99px; }
        .ss-themed[data-theme="dark"] { color-scheme: dark; }
        .ss-themed[data-theme="dark"] input { background-color: var(--c-input); color: var(--c-gray1); border-color: var(--c-border) !important; }
        .ss-themed[data-theme="dark"] input::placeholder { color: var(--c-gray3); opacity: 1; }
        .ss-themed[data-theme="dark"] img { filter: brightness(.88) contrast(1.04); }
        .ss-themed[data-theme="dark"] svg { color: inherit; }
        @media (max-height: 600px) {
          .prototype-header, .prototype-controls, .prototype-nav, .prototype-hint { display:none !important; }
        }
      `}</style>

      {/* Header */}
      <div
        className="prototype-header"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Horizontal logo — white variant for dark page background */}
          <HorizontalLogo scale={0.5} light />
        </div>
        <span
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Interaktiver Prototyp · 5,5″ Landscape · 14,4 × 7,8 cm
        </span>
      </div>

      {/* Demo toggles */}
      <div
        className="prototype-controls"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap" as const,
          justifyContent: "center",
        }}
      >
        <button
          onClick={() => setIsFirstUse((f) => !f)}
          style={{
            background: isFirstUse
              ? C.blue
              : "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: "6px 16px",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {isFirstUse ? "Ersteinrichtung" : "Bekannter Nutzer"}
        </button>
        <button
          onClick={() => setDemoLowConf((d) => !d)}
          style={{
            background: demoLowConf
              ? C.orange
              : "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: "6px 16px",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {demoLowConf
            ? "Demo: Niedrige Konfidenz"
            : "Demo: Weintrauben (niedrige Konfidenz)"}
        </button>
        {/* Appearance quick-switch */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 3,
            gap: 2,
          }}
        >
          {(
            ["light", "dark", "auto"] as AppearanceSetting[]
          ).map((a) => (
            <button
              key={a}
              onClick={() => setAppearance(a)}
              style={{
                background:
                  appearance === a
                    ? "rgba(255,255,255,0.9)"
                    : "transparent",
                color:
                  appearance === a
                    ? "#111"
                    : "rgba(255,255,255,0.6)",
                border: "none",
                borderRadius: 18,
                padding: "4px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              {a === "light"
                ? "☀️ Hell"
                : a === "dark"
                  ? "🌙 Dunkel"
                  : "🌅 Auto"}
            </button>
          ))}
        </div>
      </div>

      {/* Device */}
      <DeviceFrame>
        {/* Theme CSS variables + smooth color transitions injected here */}
        <style>{`
          .ss-themed { ${THEME_VARS[activeTheme]} }
          .ss-themed, .ss-themed button, .ss-themed div,
          .ss-themed span, .ss-themed p, .ss-themed input {
            transition:
              background-color 400ms ease,
              color 380ms ease,
              border-color 380ms ease,
              box-shadow 380ms ease;
          }
        `}</style>
        <div
          className="ss-themed"
          data-theme={activeTheme}
          onClick={resetTimer}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            position: "relative" as const,
          }}
        >
          {screen !== "standby" && <StatusBar />}
          <div
            key={screenKey}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              opacity: fading ? 0 : 1,
              transition: "opacity 0.22s ease",
              position: "relative" as const,
            }}
          >
            {renderScreen()}
            {/* Dialogs */}
            {dialog === "food-select" && (
              <FoodSelectDialog
                onSelect={handleFoodSelect}
                onClose={closeDialog}
              />
            )}
            {dialog === "guest-mode" && (
              <GuestModeDialog
                onSelect={handleGuestModeSelect}
                onClose={closeDialog}
              />
            )}
            {dialog === "calorie-goal" && (
              <CalorieGoalDialog
                current={calorieGoal}
                onSave={(v) => setCalorieGoal(v)}
                onClose={closeDialog}
              />
            )}
            {/* Standby countdown banner */}
            {showStandbyBanner && (
              <div
                style={{
                  position: "absolute" as const,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 44,
                  zIndex: 150,
                  background: "rgba(10,10,20,0.78)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 16px",
                }}
              >
                <span style={{ fontSize: 13, color: "#fff" }}>
                  Standby in {STANDBY_AT - secondsInactive}{" "}
                  Sekunden…
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetTimer();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: C.blue,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Abbrechen
                </button>
              </div>
            )}
          </div>
        </div>
      </DeviceFrame>

      {/* Navigation shortcuts */}
      <div
        className="prototype-nav"
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap" as const,
          justifyContent: "center",
          maxWidth: 960,
        }}
      >
        {NAV_SHORTCUTS.map(({ label, screen: s }) => (
          <button
            key={s}
            onClick={() => go(s)}
            style={{
              background:
                screen === s ? C.blue : "rgba(255,255,255,0.1)",
              color:
                screen === s ? "#fff" : "rgba(255,255,255,0.7)",
              border:
                screen === s
                  ? `1px solid ${C.blue}`
                  : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        className="prototype-hint"
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.25)",
          textAlign: "center" as const,
        }}
      >
        Klicke auf ein Navigationskürzel oder bediene den
        Prototypen direkt im Gerät
      </div>
    </div>
  );
}