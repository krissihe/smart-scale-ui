import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import VirtualKeyboard from "@/components/VirtualKeyboard";
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
  LogIn,
  ChevronRight,
  Power,
  House,
  Apple,
  CalendarDays,
  Flame,
} from "lucide-react";
import AppIconRaw from "@/imports/AppIcon/index";
import ContainerRaw from "@/imports/Container/index";
import iPhoneImage from "@/assets/iPhone-transparent.png";
import welcomeLogo from "@/assets/logo.png";
import welcomeLogoDark from "@/assets/logo-dark.png";

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
  | "standby-logout"
  | "standby"
  | "powered-off"
  | "guest-weighing"
  | "history"
  | "profile-screen"
  | "settings";

type Dialog =
  | "food-select"
  | "manual-confirm"
  | "edit-profile"
  | "edit-goals"
  | "weight-entry"
  | "change-pin"
  | "delete-profile"
  | "calorie-goal"
  | "guest-mode"
  | "power-off"
  | null;
type WeighMode = "ki" | "manual" | "scale-only";
type GuestMode = "smart" | "manual" | "scale-only";

interface ProfileData {
  id: string;
  name: string;
  initials: string;
  pin?: string;
  goal: string;
  calories: number;
  lastSync: string;
  color: string;
  macroTargets?: {
    protein: number;
    fat: number;
    carbs: number;
  };
  bodyData?: {
    age: number;
    height: number;
    weight: number;
    gender?: "female" | "male";
  };
  currentWeight?: number;
  targetWeight?: number;
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
    pin: "1234",
    goal: "Gewicht verlieren",
    calories: 1600,
    lastSync: "heute",
    color: "#EC4899",
    currentWeight: 68,
    targetWeight: 62,
  },
  {
    id: "2",
    name: "Ron",
    initials: "R",
    pin: "1234",
    goal: "Muskelaufbau",
    calories: 2800,
    lastSync: "vor 2 Tagen",
    color: "#3B82F6",
    currentWeight: 82,
    targetWeight: 88,
  },
  {
    id: "3",
    name: "Michelle",
    initials: "M",
    pin: "1234",
    goal: "Gewicht halten",
    calories: 1900,
    lastSync: "vor 1 Woche",
    color: "#8B5CF6",
    currentWeight: 64,
  },
  {
    id: "4",
    name: "Enzo",
    initials: "E",
    pin: "1234",
    goal: "Gewicht halten",
    calories: 2200,
    lastSync: "heute",
    color: "#F97316",
    currentWeight: 78,
  },
];

const PROFILE_ICONS = [
  { icon: "👩", label: "Frau" },
  { icon: "👨", label: "Mann" },
  { icon: "👧", label: "Mädchen" },
  { icon: "👦", label: "Junge" },
  { icon: "🧑", label: "Erwachsen" },
  { icon: "👵", label: "Seniorin" },
  { icon: "👴", label: "Senior" },
  { icon: "🙂", label: "Smiley" },
  { icon: "😎", label: "Cool" },
  { icon: "🥦", label: "Gemüse" },
  { icon: "🥕", label: "Karotte" },
  { icon: "🍎", label: "Obst" },
  { icon: "🏃", label: "Sport" },
  { icon: "⭐", label: "Stern" },
  { icon: "🐶", label: "Hund" },
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
    {
      id: "turkey",
      name: "Putenbrust",
      emoji: "🍗",
      caloriesPer100g: 107,
      protein: 24,
      fat: 1.2,
      carbs: 0,
      fiber: 0,
      confidence: 91,
    },
  ],
  Fisch: [
    {
      id: "salmon",
      name: "Lachs",
      emoji: "🐟",
      caloriesPer100g: 208,
      protein: 20,
      fat: 13,
      carbs: 0,
      fiber: 0,
      confidence: 94,
    },
    {
      id: "tuna",
      name: "Thunfisch",
      emoji: "🐟",
      caloriesPer100g: 132,
      protein: 29,
      fat: 1.3,
      carbs: 0,
      fiber: 0,
      confidence: 92,
    },
    {
      id: "cod",
      name: "Kabeljau",
      emoji: "🐠",
      caloriesPer100g: 82,
      protein: 18,
      fat: 0.7,
      carbs: 0,
      fiber: 0,
      confidence: 90,
    },
    {
      id: "shrimp",
      name: "Garnelen",
      emoji: "🦐",
      caloriesPer100g: 99,
      protein: 24,
      fat: 0.3,
      carbs: 0.2,
      fiber: 0,
      confidence: 93,
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
    {
      id: "pretzel",
      name: "Brezel",
      emoji: "🥨",
      caloriesPer100g: 338,
      protein: 9,
      fat: 3.1,
      carbs: 69,
      fiber: 2.6,
      confidence: 92,
    },
    {
      id: "croissant",
      name: "Croissant",
      emoji: "🥐",
      caloriesPer100g: 406,
      protein: 8.2,
      fat: 21,
      carbs: 46,
      fiber: 2.6,
      confidence: 94,
    },
  ],
  Getränke: [
    {
      id: "orange-juice",
      name: "Orangensaft",
      emoji: "🧃",
      caloriesPer100g: 45,
      protein: 0.7,
      fat: 0.2,
      carbs: 10,
      fiber: 0.2,
      confidence: 94,
    },
    {
      id: "milk-drink",
      name: "Milch",
      emoji: "🥛",
      caloriesPer100g: 64,
      protein: 3.3,
      fat: 3.6,
      carbs: 4.8,
      fiber: 0,
      confidence: 96,
    },
    {
      id: "smoothie",
      name: "Smoothie",
      emoji: "🥤",
      caloriesPer100g: 62,
      protein: 0.8,
      fat: 0.3,
      carbs: 14,
      fiber: 1.4,
      confidence: 88,
    },
    {
      id: "cola",
      name: "Cola",
      emoji: "🥤",
      caloriesPer100g: 42,
      protein: 0,
      fat: 0,
      carbs: 10.6,
      fiber: 0,
      confidence: 95,
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
    {
      id: "pasta",
      name: "Nudeln",
      emoji: "🍝",
      caloriesPer100g: 158,
      protein: 5.8,
      fat: 0.9,
      carbs: 31,
      fiber: 1.8,
      confidence: 93,
    },
    {
      id: "potato",
      name: "Kartoffeln",
      emoji: "🥔",
      caloriesPer100g: 77,
      protein: 2,
      fat: 0.1,
      carbs: 17,
      fiber: 2.2,
      confidence: 96,
    },
    {
      id: "tofu",
      name: "Tofu",
      emoji: "🍱",
      caloriesPer100g: 144,
      protein: 17,
      fat: 8.7,
      carbs: 2.8,
      fiber: 2.3,
      confidence: 89,
    },
  ],
};

const ALL_FOODS: FoodItem[] = Object.values(FOOD_DB).flat();

/** Below this value, the user must confirm the detected food. */
const MIN_CONFIDENCE_FOR_DIRECT_RESULT = 85;

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

interface HistoryItem {
  id: string | number;
  name: string;
  emoji: string;
  weight: number;
  calories: number;
  time: string;
  date: string;
  isoDate?: string;
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftedDateKey(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function historyItemDateKey(item: HistoryItem) {
  if (item.isoDate) return item.isoDate;
  if (item.date === "Heute") return shiftedDateKey(0);
  if (item.date === "Gestern") return shiftedDateKey(-1);
  return shiftedDateKey(-3);
}

const HISTORY_ITEMS: HistoryItem[] = [
  {
    id: 1,
    name: "Apfel",
    emoji: "🍎",
    weight: 180,
    calories: 94,
    time: "8:32 Uhr",
    date: "Heute",
    isoDate: shiftedDateKey(0),
  },
  {
    id: 2,
    name: "Joghurt",
    emoji: "🥛",
    weight: 150,
    calories: 92,
    time: "7:15 Uhr",
    date: "Heute",
    isoDate: shiftedDateKey(0),
  },
  {
    id: 3,
    name: "Banane",
    emoji: "🍌",
    weight: 118,
    calories: 105,
    time: "18:45 Uhr",
    date: "Gestern",
    isoDate: shiftedDateKey(-1),
  },
  {
    id: 4,
    name: "Brokkoli",
    emoji: "🥦",
    weight: 200,
    calories: 68,
    time: "13:00 Uhr",
    date: "Gestern",
    isoDate: shiftedDateKey(-1),
  },
  {
    id: 5,
    name: "Hähnchenbrust",
    emoji: "🍗",
    weight: 200,
    calories: 330,
    time: "12:30 Uhr",
    date: "Mo., 7. Jul.",
    isoDate: shiftedDateKey(-3),
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
    --c-blue:#2CCEF5; --c-blue-strong:#18C4F0; --c-blue-dark:#00A9E8; --c-blue-glow:#8EEBFF; --c-blue-lt:#D7F3FD;
    --c-green:#34D399; --c-green-lt:#DCFCE7;
    --c-orange:#F97316; --c-red:#EF4444;
    --c-gray1:#101828; --c-gray2:#475569; --c-gray3:#64748B;
    --c-card:#FFFFFF; --c-border:rgba(44,206,245,.12); --c-bg:#FFFFFF; --c-muted:#F7FBFD;
    --c-elevated:#FFFFFF; --c-input:#FFFFFF;
    --c-overlay:rgba(244,248,255,.9);
    --c-warning-bg:#FFFBEB; --c-warning-text:#B45309;
    --c-tracking-device:#8EEBFF; --c-tracking-screen:#FFFFFF;
    --c-countdown-bg:rgba(255,255,255,.94); --c-countdown-text:#101828;
    --c-btn-shadow:rgba(24,196,240,0.28); --c-ok-shadow:rgba(52,211,153,0.24);
    --c-standby-bg:#EAF5FF; --c-standby-text:#101828; --c-standby-sub:#64748B;
    --brand-blue:#2CCEF5; --brand-blue-strong:#18C4F0; --brand-blue-dark:#00A9E8; --brand-blue-glow:#8EEBFF; --brand-text:#101828;
    --logo-filter:none;
  `,
  dark: `
    --c-blue:#2CCEF5; --c-blue-strong:#18C4F0; --c-blue-dark:#00A9E8; --c-blue-glow:#8EEBFF; --c-blue-lt:rgba(44,206,245,0.18);
    --c-green:#34D399; --c-green-lt:rgba(52,211,153,0.18);
    --c-orange:#FB923C; --c-red:#F87171;
    --c-gray1:#F8FAFC; --c-gray2:#94A3B8; --c-gray3:#6C7D93;
    --c-card:#111114; --c-border:rgba(255,255,255,.08); --c-bg:#090909; --c-muted:#121214;
    --c-elevated:#111114; --c-input:#141418;
    --c-overlay:rgba(0,0,0,.72);
    --c-warning-bg:rgba(255,243,224,.9); --c-warning-text:#F8FAFC;
    --c-tracking-device:#8EEBFF; --c-tracking-screen:#121214;
    --c-countdown-bg:rgba(10,10,10,.88); --c-countdown-text:#F8FAFC;
    --c-btn-shadow:rgba(24,196,240,0.2); --c-ok-shadow:rgba(52,211,153,0.18);
    --c-standby-bg:#090909; --c-standby-text:#F8FAFC; --c-standby-sub:#94A3B8;
    --brand-blue:#2CCEF5; --brand-blue-strong:#18C4F0; --c-brand-blue-dark:#00A9E8; --brand-blue-glow:#8EEBFF; --brand-text:#F8FAFC;
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
 * `light`  — dark-background variant with white lettering and turquoise accent.
 * `themed` — switches between both source images with the active theme.
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
  return (
    <div
      className={`${themed ? "ss-horizontal-logo-themed" : ""} ${light ? "ss-horizontal-logo-force-dark" : ""}`}
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
          } as React.CSSProperties
        }
      >
        <img
          src={welcomeLogo}
          alt="Smart Scale"
          className="ss-horizontal-logo-light"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "none" }}
        />
        <img
          src={welcomeLogoDark}
          alt=""
          aria-hidden="true"
          className="ss-horizontal-logo-dark"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "none" }}
        />
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

function StatusBar({
  light,
  onHome,
  onPowerOff,
}: {
  light?: boolean;
  onHome?: () => void;
  onPowerOff?: () => void;
}) {
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
        background: C.bg,
        padding: "0 18px",
        height: 30,
        flexShrink: 0,
        position: "relative",
      }}
    >
      <span
        style={{ fontSize: 12, fontWeight: 600, color: col }}
      >
        {time}
      </span>
      {onHome && (
        <button
          onClick={onHome}
          aria-label="Zum Home-Screen"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            height: 23,
            padding: "0 10px",
            borderRadius: 999,
            border: `1px solid ${C.border}`,
            background: C.card,
            color: C.blue,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 9,
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <House className="w-3 h-3" /> Home
        </button>
      )}
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
        {onPowerOff && (
          <button
            onClick={onPowerOff}
            aria-label="Gerät ausschalten"
            style={{
              width: 22,
              height: 22,
              marginLeft: 3,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,59,48,.12)",
              color: C.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <Power className="w-3 h-3" />
          </button>
        )}
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
  const usesIcon = !/^[A-Za-z]$/.test(initials);
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
        fontSize: size * (usesIcon ? 0.56 : 0.38),
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
      <HorizontalLogo scale={4} themed />
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

function OnboardingFlowAnimation() {
  const steps = [
    {
      label: "Wiegen",
      color: C.blue,
      background:
        "color-mix(in srgb, var(--c-blue) 15%, var(--c-elevated))",
      icon: <Scale className="w-6 h-6" />,
      animation: "introScale 4.8s ease-in-out infinite",
    },
    {
      label: "Erkennen",
      color: C.green,
      background:
        "color-mix(in srgb, var(--c-green) 15%, var(--c-elevated))",
      icon: <Camera className="w-6 h-6" />,
      animation: "introDetect 4.8s ease-in-out infinite",
    },
    {
      label: "Übertragen",
      color: "#8B5CF6",
      background:
        "color-mix(in srgb, #8B5CF6 16%, var(--c-elevated))",
      icon: <Smartphone className="w-6 h-6" />,
      animation: "introTransfer 4.8s ease-in-out infinite",
    },
  ];

  return (
    <div
      style={{
        width: 270,
        height: 150,
        position: "relative" as const,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 10px 0",
      }}
    >
      <style>{`
        @keyframes introScale {
          0%,8% { transform:translateY(8px) scale(.92) }
          16%,42% { transform:translateY(0) scale(1.06) }
          50%,100% { transform:translateY(0) scale(1) }
        }
        @keyframes introFood {
          0%,5% { transform:translateY(-18px) rotate(-8deg); opacity:0 }
          16%,42% { transform:translateY(0) rotate(0); opacity:1 }
          50%,100% { transform:translateY(0); opacity:.8 }
        }
        @keyframes introDetect {
          0%,30% { transform:scale(.94) }
          42%,66% { transform:scale(1.08) }
          74%,100% { transform:scale(1) }
        }
        @keyframes introScanRing {
          0%,32% { transform:scale(.7); opacity:0 }
          45% { transform:scale(.9); opacity:.8 }
          66% { transform:scale(1.35); opacity:0 }
          100% { opacity:0 }
        }
        @keyframes introTransfer {
          0%,58% { transform:scale(.94) }
          70%,92% { transform:scale(1.08) }
          100% { transform:scale(1) }
        }
        @keyframes introSuccess {
          0%,64% { transform:scale(.6); opacity:0 }
          74%,92% { transform:scale(1); opacity:1 }
          100% { transform:scale(.85); opacity:.75 }
        }
        @keyframes introLine {
          0%,14% { transform:scaleX(0); opacity:.25 }
          48% { transform:scaleX(.5); opacity:1 }
          82%,100% { transform:scaleX(1); opacity:1 }
        }
        @keyframes introDataDot {
          0%,22% { left:45px; opacity:0 }
          30% { opacity:1 }
          52% { left:128px; opacity:1 }
          62% { opacity:0 }
          68% { left:128px; opacity:0 }
          74% { opacity:1 }
          94% { left:215px; opacity:1 }
          100% { left:215px; opacity:0 }
        }
      `}</style>

      <div
        style={{
          position: "absolute" as const,
          left: 42,
          right: 42,
          top: 65,
          height: 3,
          borderRadius: 99,
          background: C.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            transformOrigin: "left center",
            background: `linear-gradient(90deg, ${C.blue}, ${C.green}, #8B5CF6)`,
            animation: "introLine 4.8s ease-in-out infinite",
          }}
        />
      </div>
      <div
        style={{
          position: "absolute" as const,
          top: 61,
          left: 45,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#fff",
          border: `3px solid ${C.blue}`,
          boxShadow: "0 2px 8px rgba(44,206,245,.4)",
          animation: "introDataDot 4.8s ease-in-out infinite",
          zIndex: 2,
        }}
      />

      {steps.map((step, index) => (
        <div
          key={step.label}
          style={{
            width: 72,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 9,
            position: "relative" as const,
            zIndex: 3,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 18,
              background: step.background,
              color: step.color,
              border: `1px solid ${C.border}`,
              boxShadow: "0 9px 22px rgba(0,0,0,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative" as const,
              animation: step.animation,
            }}
          >
            {index === 0 && (
              <div
                style={{
                  position: "absolute" as const,
                  top: -17,
                  width: 27,
                  height: 27,
                  borderRadius: "50%",
                  background: C.elevated,
                  color: C.red,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 5px 12px rgba(0,0,0,.12)",
                  animation: "introFood 4.8s ease-in-out infinite",
                }}
              >
                <Apple className="w-4 h-4" />
              </div>
            )}
            {index === 1 && (
              <div
                style={{
                  position: "absolute" as const,
                  inset: -5,
                  borderRadius: 22,
                  border: `2px solid ${C.green}`,
                  animation: "introScanRing 4.8s ease-out infinite",
                }}
              />
            )}
            {step.icon}
            {index === 2 && (
              <div
                style={{
                  position: "absolute" as const,
                  right: -5,
                  top: -5,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: C.green,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "introSuccess 4.8s ease-in-out infinite",
                }}
              >
                <Check className="w-3 h-3" strokeWidth={3} />
              </div>
            )}
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: C.gray2,
            }}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function OnboardingScreen({
  step,
  onNext,
  onSkip,
  profile,
}: {
  step: "welcome" | "explain" | "ready";
  onNext: () => void;
  onSkip?: () => void;
  profile?: ProfileData | null;
}) {
  const content = {
    welcome: {
      eyebrow: "WILLKOMMEN",
      title: "Schön, dass du da bist.",
      text: "In wenigen Schritten ist deine Smart Scale bereit.",
      icon: (
        <div
          className="ss-horizontal-logo-themed"
          style={{
            width: 280,
            height: 120,
            position: "relative",
          }}
        >
          <img
            src={welcomeLogo}
            alt="Smart Scale Logo"
            className="ss-horizontal-logo-light"
            style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  maxWidth: "90%",
                  objectFit: "contain",
                  display: "block",
                  filter: "none",
                  transform: "scale(2)",
                  transformOrigin: "center",
                  pointerEvents: "none",
            }}
          />
          <img
            src={welcomeLogoDark}
            alt=""
            aria-hidden="true"
            className="ss-horizontal-logo-dark"
            style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  maxWidth: "90%",
                  objectFit: "contain",
                  display: "block",
                  filter: "none",
                  transform: "scale(2)",
                  transformOrigin: "center",
                  pointerEvents: "none",
            }}
          />
        </div>
      ),
      action: "Einrichtung starten",
    },
    explain: {
      eyebrow: "SO FUNKTIONIERT’S",
      title: "Wiegen. Erkennen. Übertragen.",
      text: "Lege dein Lebensmittel auf die Waage. Die KI erkennt es und sendet Gewicht und Nährwerte direkt an deine verbundene App.",
      icon: <OnboardingFlowAnimation />,
      action: "Profil anlegen",
    },
    ready: {
      eyebrow: "GLÜCKWUNSCH",
      title: profile
        ? `Willkommen, ${profile.name}!`
        : "Du bist startklar.",
      text: profile
        ? "Dein Profil ist eingerichtet und deine Smart Scale ist startklar."
        : "Lege ein Lebensmittel auf oder nutze die Waage ganz einfach ohne Tracking.",
      icon: profile ? (
        <Avatar
          initials={profile.initials}
          color={profile.color}
          size={96}
        />
      ) : (
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
        padding: step === "welcome" ? "24px 26px" : "26px 34px",
        display: "grid",
        gridTemplateColumns:
          step === "welcome" ? "0.82fr 1.18fr" : "1fr 1.08fr",
        alignItems: "center",
        gap: step === "welcome" ? 20 : 34,
      }}
    >
      <div
        style={{
          minHeight: 190,
          borderRadius: 26,
          // show transparent container for the welcome step so only the logo is visible
          background: step === "welcome" ? "transparent" : `linear-gradient(145deg, ${C.card}, ${C.blueLt})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: step === "welcome" ? "none" : `1px solid ${C.border}`,
          overflow: "visible",
        }}
      >
        {content.icon}
      </div>
      <div style={{ minWidth: 0 }}>
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
  profiles,
  onSelectProfile,
  onGuest,
  onCreate,
}: {
  profiles: ProfileData[];
  onSelectProfile: (p: ProfileData) => void;
  onGuest: () => void;
  onCreate: () => void;
}) {
  const primary = profiles[0];

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
          display: "flex",
          gap: 9,
          overflowX: "auto",
        }}
      >
        <button
          onClick={() => onSelectProfile(primary)}
          style={{
            flex: "1.45 0 270px",
            border: `1px solid ${C.border}`,
            background: C.card,
            borderRadius: 22,
            padding: 14,
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,.08)",
          }}
        >
          <Avatar
            initials={primary.initials}
            color={primary.color}
            size={72}
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
                fontSize: 22,
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
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                whiteSpace: "nowrap",
              }}
            >
              {primary.pin ? "Mit PIN anmelden" : "Ohne PIN anmelden"}
              <ChevronRight
                className="w-3 h-3"
                style={{ flexShrink: 0 }}
              />
            </span>
          </div>
        </button>
        {profiles.slice(1).map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProfile(p)}
            style={{
              border: `1px solid ${C.border}`,
              background: C.card,
              borderRadius: 18,
              padding: 9,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              flex: "0 0 132px",
            }}
          >
            <Avatar
              initials={p.initials}
              color={p.color}
              size={46}
            />
            <span
              style={{
                fontSize: 12,
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
          justifyContent: "flex-end",
          alignItems: "center",
          paddingTop: 2,
        }}
      >
        <button
          onClick={onGuest}
          style={{
            border: "none",
            background: C.muted,
            color: C.blue,
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
          <Scale className="w-4 h-4" /> Waage als Gast verwenden →
        </button>
      </div>
    </div>
  );
}

// ─── Screen: ProfileSelection ──────────────────────────────────────────────────

function ProfileSelectionScreen({
  profiles,
  onBack,
  onSelect,
  onCreate,
}: {
  profiles: ProfileData[];
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
        {profiles.map((p) => (
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
              label={p.pin ? "Mit PIN anmelden" : "Ohne PIN anmelden"}
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

function PairingQrCode({ connecting }: { connecting: boolean }) {
  const size = 21;
  const finderValue = (
    row: number,
    column: number,
    originRow: number,
    originColumn: number,
  ): boolean | null => {
    const localRow = row - originRow;
    const localColumn = column - originColumn;
    if (
      localRow < 0 ||
      localRow > 6 ||
      localColumn < 0 ||
      localColumn > 6
    ) {
      return null;
    }
    const outer =
      localRow === 0 ||
      localRow === 6 ||
      localColumn === 0 ||
      localColumn === 6;
    const center =
      localRow >= 2 &&
      localRow <= 4 &&
      localColumn >= 2 &&
      localColumn <= 4;
    return outer || center;
  };

  return (
    <div
      style={{
        width: 176,
        height: 176,
        padding: 13,
        borderRadius: 20,
        background: "#fff",
        border: `1px solid ${connecting ? C.green : C.border}`,
        boxShadow: connecting
          ? "0 12px 34px rgba(52,211,153,.22)"
          : "0 12px 34px rgba(0,0,0,.13)",
        position: "relative" as const,
        overflow: "hidden",
        transition: "border-color .3s ease, box-shadow .3s ease",
      }}
      aria-label="QR-Code zur Verbindung mit der Tracking-App"
    >
      <style>{`
        @keyframes pairingScanLine {
          0% { top:12px; opacity:0 }
          10% { opacity:1 }
          90% { opacity:1 }
          100% { top:158px; opacity:0 }
        }
      `}</style>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
        }}
      >
        {Array.from({ length: size * size }, (_, index) => {
          const row = Math.floor(index / size);
          const column = index % size;
          const finderCandidates = [
            finderValue(row, column, 0, 0),
            finderValue(row, column, 0, size - 7),
            finderValue(row, column, size - 7, 0),
          ];
          const finder = finderCandidates.find((value) => value !== null);
          const dataModule =
            ((row * 3 + column * 5 + (row ^ column)) % 7 < 3 ||
              (row + column * 2) % 11 === 0) &&
            row !== 7 &&
            column !== 7;
          return (
            <span
              key={index}
              style={{
                background:
                  finder !== undefined
                    ? finder
                      ? "#09090B"
                      : "#fff"
                    : dataModule
                      ? "#09090B"
                      : "#fff",
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: "absolute" as const,
          left: 8,
          right: 8,
          top: 12,
          height: 2,
          borderRadius: 99,
          background: connecting ? C.green : C.blue,
          boxShadow: `0 0 12px ${connecting ? C.green : C.blue}`,
          animation: `pairingScanLine ${connecting ? 1 : 2.2}s linear infinite`,
        }}
      />
      {connecting && (
        <div
          style={{
            position: "absolute" as const,
            inset: 0,
            background: "rgba(255,255,255,.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: `3px solid ${C.greenLt}`,
              borderTopColor: C.green,
              animation: "spin .8s linear infinite",
            }}
          />
        </div>
      )}
    </div>
  );
}

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
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<"female" | "male" | "">("");
  const [targetWeight, setTargetWeight] = useState("");
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showAppReminder, setShowAppReminder] = useState(false);
  const [continueAfterAppConnection, setContinueAfterAppConnection] =
    useState(false);
  const [showApps, setShowApps] = useState(false);
  const [pairingApp, setPairingApp] = useState<string | null>(null);
  const [pairingStage, setPairingStage] = useState<
    "select" | "qr" | "connecting" | "success"
  >("select");
  const [showIcons, setShowIcons] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("👩");
  const [showPinChoice, setShowPinChoice] = useState(false);
  const [pinStage, setPinStage] = useState<"choose" | "enter">("choose");
  const [profilePin, setProfilePin] = useState("");
  const [connectedApp, setConnectedApp] = useState<
    string | null
  >(null);
  const [importedTargets, setImportedTargets] = useState<{
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    goal: string;
    age: number;
    height: number;
    weight: number;
    targetWeight: number;
  } | null>(null);

  useEffect(() => {
    if (pairingStage !== "connecting") return;
    const timer = setTimeout(() => {
      setConnectedApp(pairingApp);
      const appTargets =
        pairingApp === "YAZIO"
          ? { calories: 1850, protein: 120, fat: 62, carbs: 203, goal: "Gewicht verlieren", age: 29, height: 170, weight: 68, targetWeight: 62 }
          : pairingApp === "MyFitnessPal"
            ? { calories: 2000, protein: 125, fat: 67, carbs: 250, goal: "Gewicht halten", age: 32, height: 176, weight: 72, targetWeight: 0 }
            : { calories: 2300, protein: 130, fat: 72, carbs: 282, goal: "Zunehmen", age: 27, height: 182, weight: 74, targetWeight: 80 };
      setImportedTargets(appTargets);
      setKcal(appTargets.calories.toString());
      setGoal(appTargets.goal);
      setAge(appTargets.age.toString());
      setHeight(appTargets.height.toString());
      setWeight(appTargets.weight.toString());
      setTargetWeight(appTargets.targetWeight ? appTargets.targetWeight.toString() : "");
      setPairingStage("success");
    }, 1500);
    return () => clearTimeout(timer);
  }, [pairingApp, pairingStage]);
  const goals = [
    "Gewicht verlieren",
    "Gewicht halten",
    "Muskelaufbau",
    "Zunehmen",
  ];
  const ageValue = Number(age);
  const heightValue = Number(height);
  const weightValue = Number(weight);
  const targetWeightValue = Number(targetWeight);
  const bodyDataValid =
    ageValue >= 10 &&
    ageValue <= 100 &&
    heightValue >= 100 &&
    heightValue <= 230 &&
    weightValue >= 25 &&
    weightValue <= 250;
  const targetWeightRequired = Boolean(goal) && goal !== "Gewicht halten";
  const targetWeightValid =
    !targetWeightRequired ||
    (targetWeightValue >= 25 &&
      targetWeightValue <= 300 &&
      (goal === "Gewicht verlieren"
        ? targetWeightValue < weightValue
        : targetWeightValue > weightValue));
  const maintenanceCalories = bodyDataValid && gender
    ? Math.round(
        (10 * weightValue +
          6.25 * heightValue -
          5 * ageValue +
          (gender === "male" ? 5 : -161)) *
          1.45,
      )
    : 0;
  const recommendedCalories = bodyDataValid
    ? Math.max(
        1200,
        Math.min(
          4500,
          maintenanceCalories +
            (goal === "Gewicht verlieren"
              ? -350
              : goal === "Muskelaufbau" || goal === "Zunehmen"
                ? 250
                : 0),
        ),
      )
    : 0;
  const targetCalories = Number(kcal) || recommendedCalories;
  const proteinFactor =
    goal === "Muskelaufbau" ? 2 : goal === "Gewicht verlieren" ? 1.8 : 1.6;
  const calculatedMacroTargets = bodyDataValid && targetCalories
    ? (() => {
        const protein = Math.min(
          Math.round(weightValue * proteinFactor),
          Math.round((targetCalories * 0.35) / 4),
        );
        const fat = Math.round((targetCalories * 0.28) / 9);
        const carbs = Math.max(
          0,
          Math.round((targetCalories - protein * 4 - fat * 9) / 4),
        );
        return { protein, fat, carbs };
      })()
    : null;
  const macroTargets = importedTargets
    ? {
        protein: importedTargets.protein,
        fat: importedTargets.fat,
        carbs: importedTargets.carbs,
      }
    : calculatedMacroTargets;
  const targetsAvailable =
    Boolean(importedTargets) ||
    (Boolean(goal) && Boolean(gender) && bodyDataValid && targetWeightValid);
  const createProfileDraft = (pin?: string): ProfileData => ({
    id: `new-${Date.now()}`,
    name: name.trim(),
    initials: selectedIcon,
    ...(pin ? { pin } : {}),
    goal,
    calories: targetCalories || 2000,
    lastSync: connectedApp ? `mit ${connectedApp}` : "nicht verbunden",
    color: "#007AFF",
    ...(macroTargets ? { macroTargets } : {}),
    ...(bodyDataValid
      ? {
          bodyData: {
            age: ageValue,
            height: heightValue,
            weight: weightValue,
            ...(gender ? { gender } : {}),
          },
          currentWeight: weightValue,
        }
      : {}),
    ...(goal !== "Gewicht halten" && Number(targetWeight) >= 25
      ? { targetWeight: Number(targetWeight) }
      : {}),
  });
  const continueToPinChoice = () => {
    setShowAppReminder(false);
    setShowPinChoice(true);
    setPinStage("choose");
    setProfilePin("");
  };
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        position: "relative" as const,
        overflow: "hidden",
        background: C.bg,
      }}
    >
      <div
        style={{
          width: 315,
          background: C.bg,
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 11,
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
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {["Profil", "Ziele", "PIN"].map((step, index) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 5, flex: index < 2 ? 1 : undefined }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: index === 0 ? C.blue : C.gray2,
                  fontSize: 9,
                  fontWeight: 750,
                  whiteSpace: "nowrap",
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: index === 0 ? C.blue : C.muted,
                    color: index === 0 ? "white" : C.gray2,
                  }}
                >
                  {index + 1}
                </span>
                {step}
              </div>
              {index < 2 && <div style={{ height: 1, background: C.border, flex: 1 }} />}
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowIcons(true)}
          aria-label="Profilicon auswählen"
          style={{
            border: `1.5px solid ${C.border}`,
            background: C.elevated,
            borderRadius: 14,
            padding: "9px 11px",
            display: "flex",
            alignItems: "center",
            gap: 11,
            cursor: "pointer",
            textAlign: "left" as const,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: C.blueLt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 27,
              flexShrink: 0,
            }}
          >
            {selectedIcon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 750, color: C.gray1 }}>
              Profilicon
            </div>
            <div style={{ fontSize: 10, color: C.gray2, marginTop: 2 }}>
              Dein Profilbild auswählen
            </div>
          </div>
          <span style={{ fontSize: 8, fontWeight: 800, color: C.blue, letterSpacing: ".04em" }}>
            AUSWÄHLEN
          </span>
          <ChevronRight className="w-4 h-4" color={C.blue} />
        </button>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <label style={{ fontSize: 11, color: C.gray2, fontWeight: 500 }}>
            Dein Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dein Name"
              style={{
                display: "block",
                width: "100%",
                height: 34,
                marginTop: 4,
                padding: "7px 9px",
                borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                fontSize: 12,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box" as const,
              }}
            />
          </label>
          <div>
            <div style={{ fontSize: 11, color: C.gray2, fontWeight: 500, marginBottom: 4 }}>
              Geschlecht
            </div>
            <div
              role="group"
              aria-label="Geschlecht für die Kalorienberechnung"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}
            >
              {([
                { value: "female", label: "Weiblich" },
                { value: "male", label: "Männlich" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGender(option.value)}
                  aria-pressed={gender === option.value}
                  style={{
                    height: 34,
                    padding: "0 3px",
                    borderRadius: 10,
                    border: `1.5px solid ${gender === option.value ? C.blue : C.border}`,
                    background: gender === option.value ? C.blueLt : C.elevated,
                    color: gender === option.value ? C.blue : C.gray1,
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {/* Virtual keyboard is rendered globally by App; no local render here */}
        </div>
        <div
          style={{
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: C.muted,
            padding: "10px 11px",
            display: "flex",
            gap: 9,
            alignItems: "flex-start",
          }}
        >
          <Info className="w-4 h-4" color={C.gray2} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 750, color: C.gray1 }}>
              Danach geht es weiter
            </div>
            <div style={{ fontSize: 9, lineHeight: 1.4, color: C.gray2, marginTop: 2 }}>
              Gib deinen Namen ein und wähle rechts eine der beiden Möglichkeiten aus.
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.gray1,
          }}
        >
          2. Zielquelle wählen
        </div>
        <div style={{ fontSize: 10, color: C.gray2, lineHeight: 1.4 }}>
          Wähle aus, woher Kalorien, Makros und dein Ziel kommen sollen.
        </div>
        <button
          disabled={!name.trim()}
          onClick={() => {
            if (!name.trim()) return;
            setContinueAfterAppConnection(true);
            setPairingApp(null);
            setPairingStage("select");
            setShowApps(true);
          }}
          style={{
            background: C.blueLt,
            borderRadius: 14,
            padding: "12px 13px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: `1.5px solid ${C.blue}`,
            textAlign: "left",
            cursor: "pointer",
            opacity: name.trim() ? 1 : 0.5,
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.elevated, display: "flex", alignItems: "center", justifyContent: "center", color: C.blue, flexShrink: 0 }}>
            <Smartphone className="w-4 h-4" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              {connectedApp
                ? `${connectedApp} verbunden`
                : "Daten aus App übernehmen"}
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              {connectedApp
                ? "Tracking wird automatisch synchronisiert"
                : "QR-Code scannen und Ziele automatisch importieren"}
            </div>
          </div>
          <span style={{ fontSize: 8, fontWeight: 800, color: C.blue, letterSpacing: ".04em" }}>
            AUSWÄHLEN
          </span>
          <ChevronRight
            className="w-4 h-4"
            style={{ color: C.blue, flexShrink: 0 }}
          />
        </button>
        <button
          onClick={() => {
            if (!name.trim()) return;
            setGoal("");
            setKcal("");
            setImportedTargets(null);
            setShowRecommendation(true);
          }}
          disabled={!name.trim()}
          style={{
            width: "100%",
            borderRadius: 14,
            padding: "12px 13px",
            background: C.elevated,
            border: `1.5px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            textAlign: "left",
            cursor: name.trim() ? "pointer" : "default",
            opacity: name.trim() ? 1 : 0.5,
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.muted, display: "flex", alignItems: "center", justifyContent: "center", color: C.gray1, flexShrink: 0 }}>
            <Zap className="w-4 h-4" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.gray1 }}>
              Eigenes Ziel festlegen
            </div>
            <div style={{ fontSize: 10, color: C.gray2, marginTop: 2 }}>
              Ziel wählen, Angaben ergänzen und Empfehlung erhalten
            </div>
          </div>
          <span style={{ fontSize: 8, fontWeight: 800, color: C.blue, letterSpacing: ".04em" }}>
            AUSWÄHLEN
          </span>
          <ChevronRight className="w-4 h-4" style={{ color: C.blue, flexShrink: 0 }} />
        </button>
        {!name.trim() && (
          <div style={{ fontSize: 10, fontWeight: 650, color: C.gray2, display: "flex", alignItems: "center", gap: 5 }}>
            <Info className="w-3.5 h-3.5" />
            Gib zuerst links deinen Namen ein.
          </div>
        )}
        {showRecommendation && (
          <div
            style={{
              position: "absolute" as const,
              inset: 10,
              zIndex: 35,
              borderRadius: 22,
              background: C.elevated,
              border: `1px solid ${C.border}`,
              boxShadow: "0 24px 70px rgba(0,0,0,.26)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 11,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 820, color: C.gray1 }}>
                  Deine persönliche Empfehlung
                </div>
                <div style={{ fontSize: 10, color: C.gray2, marginTop: 2 }}>
                  {goal
                    ? `Auf Basis deiner Angaben und dem Ziel „${goal}“`
                    : "Wähle zuerst dein persönliches Ziel aus."}
                </div>
              </div>
              <button
                onClick={() => setShowRecommendation(false)}
                aria-label="Empfehlung schließen"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  border: "none",
                  background: C.muted,
                  color: C.gray1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div style={{ fontSize: 9, fontWeight: 750, color: C.gray2, marginBottom: 5 }}>
                WAS MÖCHTEST DU ERREICHEN?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                {goals.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setGoal(option);
                      if (option === "Gewicht halten") setTargetWeight("");
                    }}
                    style={{ minHeight: 34, padding: "5px 4px", borderRadius: 9, border: `1.5px solid ${goal === option ? C.blue : C.border}`, background: goal === option ? C.blueLt : C.card, color: goal === option ? C.blue : C.gray1, fontSize: 9, fontWeight: 750, cursor: "pointer" }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 14, minHeight: 0 }}>
              <div
                style={{
                  borderRadius: 16,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  padding: "8px 12px 10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginBottom: 5,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 750, color: C.gray1 }}>
                    Körperdaten
                  </div>
                  <div
                    role="group"
                    aria-label="Geschlecht für die Kalorienberechnung"
                    style={{ display: "flex", gap: 3 }}
                  >
                    {([
                      { value: "female", label: "Weiblich" },
                      { value: "male", label: "Männlich" },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGender(option.value)}
                        aria-pressed={gender === option.value}
                        style={{
                          height: 22,
                          padding: "0 7px",
                          borderRadius: 7,
                          border: `1px solid ${gender === option.value ? C.blue : C.border}`,
                          background: gender === option.value ? C.blueLt : C.elevated,
                          color: gender === option.value ? C.blue : C.gray2,
                          fontSize: 8,
                          fontWeight: 750,
                          cursor: "pointer",
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${targetWeightRequired ? 4 : 3}, 1fr)`, gap: 5 }}>
                  {[
                    { label: "Alter", value: age, setValue: setAge, placeholder: "28", unit: "J." },
                    { label: "Größe", value: height, setValue: setHeight, placeholder: "170", unit: "cm" },
                    { label: "Gewicht", value: weight, setValue: setWeight, placeholder: "65", unit: "kg" },
                    ...(targetWeightRequired
                      ? [{
                          label: "Ziel",
                          value: targetWeight,
                          setValue: setTargetWeight,
                          placeholder:
                            goal === "Gewicht verlieren" ? "60" : "75",
                          unit: "kg",
                        }]
                      : []),
                  ].map((field) => (
                    <label key={field.label} style={{ fontSize: 9, fontWeight: 650, color: C.gray2 }}>
                      {field.label}
                      <div style={{ display: "flex", marginTop: 4 }}>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={field.value}
                          onChange={(event) => field.setValue(event.target.value)}
                          placeholder={field.placeholder}
                          style={{
                            width: "100%",
                            minWidth: 0,
                            height: 34,
                            padding: "6px 5px",
                            borderRadius: "9px 0 0 9px",
                            border: `1px solid ${C.border}`,
                            borderRight: "none",
                            background: C.input,
                            color: C.gray1,
                            fontSize: 12,
                            fontFamily: "inherit",
                            outline: "none",
                            textAlign: "center",
                          }}
                        />
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0 5px",
                          borderRadius: "0 9px 9px 0",
                          border: `1px solid ${C.border}`,
                          borderLeft: "none",
                          background: C.muted,
                          color: C.gray2,
                          fontSize: 8,
                        }}>
                          {field.unit}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: 9, lineHeight: 1.35, color: C.gray3, marginTop: 9 }}>
                  Die Werte dienen nur zur unverbindlichen Berechnung und können später geändert werden.
                </div>
              </div>

              <div
                style={{
                  borderRadius: 16,
                  background: targetsAvailable ? C.blueLt : C.muted,
                  border: `1px solid ${targetsAvailable ? C.blue : C.border}`,
                  padding: 12,
                  minHeight: 126,
                }}
              >
                {!targetsAvailable || !macroTargets ? (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                    <Zap className="w-6 h-6" color={C.blue} />
                    <div style={{ fontSize: 12, fontWeight: 750, color: C.gray1, marginTop: 6 }}>
                      Angaben vervollständigen
                    </div>
                    <div style={{ fontSize: 9, color: C.gray2, marginTop: 2 }}>
                      Danach erscheinen Kalorien- und Makro-Vorschlag automatisch.
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 750, color: C.blue }}>
                          {importedTargets ? `AUS ${connectedApp?.toUpperCase()} ÜBERNOMMEN` : "EMPFOHLENES TAGESZIEL"}
                        </div>
                        <div style={{ fontSize: 27, lineHeight: 1, fontWeight: 850, color: C.gray1, marginTop: 4 }}>
                          {targetCalories} <span style={{ fontSize: 11, color: C.gray2 }}>kcal</span>
                        </div>
                      </div>
                      <Check className="w-6 h-6" color={C.green} strokeWidth={3} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginTop: 10 }}>
                      {[
                        { label: "Protein", value: macroTargets.protein, color: C.blue },
                        { label: "Fett", value: macroTargets.fat, color: C.orange },
                        { label: "Kohlenhydrate", value: macroTargets.carbs, color: "#8B5CF6" },
                      ].map((macro) => (
                        <div key={macro.label} style={{ borderRadius: 9, background: C.elevated, padding: "6px 5px", textAlign: "center" }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: macro.color }}>{macro.value} g</div>
                          <div style={{ fontSize: 8, color: C.gray2, marginTop: 1 }}>{macro.label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "320px 1fr",
                gap: 14,
                alignItems: "end",
              }}
            >
              <label
                style={{
                  width: "100%",
                  padding: "0 12px",
                  boxSizing: "border-box",
                  fontSize: 9,
                  fontWeight: 650,
                  color: C.gray2,
                }}
              >
                Kalorien manuell anpassen (optional)
                <div style={{ display: "flex", marginTop: 7 }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={kcal}
                    onChange={(event) => {
                      setKcal(event.target.value);
                      setImportedTargets(null);
                    }}
                    placeholder={recommendedCalories ? `${recommendedCalories}` : "kcal"}
                    style={{
                      width: "100%",
                      minWidth: 0,
                      height: 34,
                      padding: "6px 10px",
                      borderRadius: "9px 0 0 9px",
                      border: `1px solid ${C.border}`,
                      borderRight: "none",
                      background: C.input,
                      color: C.gray1,
                      fontFamily: "inherit",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                  <span style={{ display: "flex", alignItems: "center", padding: "0 8px", borderRadius: "0 9px 9px 0", border: `1px solid ${C.border}`, borderLeft: "none", background: C.muted, fontSize: 9, color: C.gray2 }}>
                    kcal
                  </span>
                </div>
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
                <SecondaryBtn
                  label="Zurück"
                  onClick={() => setShowRecommendation(false)}
                  style={{ minHeight: 36, padding: "7px 10px", fontSize: 10 }}
                />
                <PrimaryBtn
                  label="Vorschlag übernehmen"
                  disabled={!targetsAvailable || targetCalories < 800 || targetCalories > 6000}
                  onClick={() => {
                    setShowRecommendation(false);
                    if (connectedApp) {
                      continueToPinChoice();
                    } else {
                      setShowAppReminder(true);
                    }
                  }}
                  style={{ minHeight: 36, padding: "7px 10px", fontSize: 10 }}
                />
              </div>
            </div>
          </div>
        )}
        {showAppReminder && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 38,
              background: "rgba(15,23,42,.58)",
              backdropFilter: "blur(7px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div style={{ width: 410, maxWidth: "100%", borderRadius: 22, background: C.elevated, border: `1px solid ${C.border}`, boxShadow: "0 26px 70px rgba(0,0,0,.28)", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: C.blueLt, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 820, color: C.gray1 }}>
                    Noch eine App verbinden?
                  </div>
                  <div style={{ fontSize: 10, lineHeight: 1.45, color: C.gray2, marginTop: 4 }}>
                    Ohne verbundene App kannst du wiegen und Nährwerte ansehen. Deine Mahlzeiten werden aber nicht automatisch an deine Tracking-App übertragen.
                  </div>
                </div>
                <button onClick={() => setShowAppReminder(false)} aria-label="Nachfrage schließen" style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: C.muted, color: C.gray1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
                <SecondaryBtn
                  label="Ohne App fortfahren"
                  onClick={continueToPinChoice}
                  style={{ minHeight: 38, padding: "7px 10px", fontSize: 11 }}
                />
                <PrimaryBtn
                  label="App jetzt verbinden"
                  onClick={() => {
                    setShowAppReminder(false);
                    setContinueAfterAppConnection(true);
                    setPairingApp(null);
                    setPairingStage("select");
                    setShowApps(true);
                  }}
                  style={{ minHeight: 38, padding: "7px 10px", fontSize: 11 }}
                />
              </div>
            </div>
          </div>
        )}
        {showPinChoice && (
          <div
            style={{
              position: "absolute" as const,
              inset: 0,
              zIndex: 40,
              background: "rgba(15, 23, 42, 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                width: 340,
                maxWidth: "100%",
                borderRadius: 24,
                background: C.bg,
                border: `1px solid ${C.border}`,
                boxShadow: "0 30px 70px rgba(0,0,0,.25)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: C.gray1,
                    }}
                  >
                    Profil erstellen
                  </div>
                  <div style={{ fontSize: 12, color: C.gray2, marginTop: 4 }}>
                    Wähle jetzt, ob du eine PIN festlegen möchtest.
                  </div>
                </div>
                <button
                  onClick={() => setShowPinChoice(false)}
                  aria-label="Popup schließen"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: C.muted,
                    color: C.gray1,
                    cursor: "pointer",
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {pinStage === "choose" ? (
                <div style={{ display: "grid", gap: 12 }}>
                  <PrimaryBtn
                    label="PIN festlegen"
                    onClick={() => setPinStage("enter")}
                  />
                  <GhostBtn
                    label="Ohne PIN fortfahren"
                    onClick={() => {
                      setShowPinChoice(false);
                      onCreate(createProfileDraft());
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: "grid", gap: 7 }}>
                  <div style={{ fontSize: 11, lineHeight: 1.35, color: C.gray2 }}>
                    Gib deine vierstellige Profil-PIN ein, um später schneller ins Profil zu kommen.
                  </div>
                  <div
                    aria-label={`${profilePin.length} von 4 PIN-Ziffern eingegeben`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 11,
                      minHeight: 24,
                    }}
                  >
                    {[0, 1, 2, 3].map((index) => (
                      <span
                        key={index}
                        style={{
                          width: 13,
                          height: 13,
                          borderRadius: "50%",
                          background:
                            profilePin.length > index ? C.blue : C.border,
                          transition: "background .15s ease, transform .15s ease",
                          transform:
                            profilePin.length === index + 1
                              ? "scale(1.12)"
                              : "scale(1)",
                        }}
                      />
                    ))}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 4,
                      width: 214,
                      alignSelf: "center",
                      justifySelf: "center",
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
                    ].map((key, index) =>
                      key === "" ? (
                        <span key={index} />
                      ) : (
                        <button
                          key={key}
                          type="button"
                          aria-label={key === "del" ? "Letzte Ziffer löschen" : key}
                          onClick={() => {
                            if (key === "del") {
                              setProfilePin((current) => current.slice(0, -1));
                            } else {
                              setProfilePin((current) =>
                                current.length < 4 ? current + key : current,
                              );
                            }
                          }}
                          style={{
                            height: 29,
                            borderRadius: 10,
                            border: `1px solid ${C.border}`,
                            background: C.muted,
                            color: C.gray1,
                            fontSize: key === "del" ? 15 : 16,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {key === "del" ? "⌫" : key}
                        </button>
                      ),
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <GhostBtn
                      label="Zurück"
                      onClick={() => setPinStage("choose")}
                      style={{ flex: 1 }}
                    />
                    <PrimaryBtn
                      label="Profil erstellen"
                      onClick={() => {
                        if (profilePin.length !== 4) return;
                        setShowPinChoice(false);
                        onCreate(createProfileDraft(profilePin));
                      }}
                      disabled={profilePin.length !== 4}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {showIcons && (
          <div
            style={{
              position: "absolute" as const,
              inset: 10,
              zIndex: 30,
              borderRadius: 20,
              background: C.elevated,
              border: `1px solid ${C.border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,.24)",
              padding: 18,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.gray1 }}>
                  Profilicon auswählen
                </div>
                <div style={{ fontSize: 11, color: C.gray2 }}>
                  Personen, Smileys und weitere Symbole
                </div>
              </div>
              <button
                onClick={() => setShowIcons(false)}
                aria-label="Icon-Auswahl schließen"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: C.muted,
                  color: C.gray1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  flexShrink: 0,
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
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 9,
                paddingRight: 5,
              }}
            >
              {PROFILE_ICONS.map((option) => (
                <button
                  key={`${option.icon}-${option.label}`}
                  onClick={() => {
                    setSelectedIcon(option.icon);
                    setShowIcons(false);
                  }}
                  style={{
                    minHeight: 68,
                    borderRadius: 14,
                    border: `2px solid ${
                      selectedIcon === option.icon ? C.blue : C.border
                    }`,
                    background:
                      selectedIcon === option.icon ? C.blueLt : C.card,
                    color: C.gray1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  aria-label={option.label}
                >
                  <span style={{ fontSize: 34 }}>{option.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
                  {pairingStage === "select"
                    ? "Tracking-App auswählen"
                    : pairingStage === "qr" || pairingStage === "connecting"
                      ? `${pairingApp} verbinden`
                      : "Verbindung hergestellt"}
                </div>
                <div style={{ fontSize: 11, color: C.gray2 }}>
                  {pairingStage === "select"
                    ? "Wähle die App aus, die du verbinden möchtest."
                    : pairingStage === "qr" || pairingStage === "connecting"
                      ? pairingStage === "connecting"
                        ? "Deine Verbindung wird sicher eingerichtet."
                        : "Scanne den QR-Code mit deinem Handy."
                      : `${pairingApp} ist jetzt mit deinem Profil verbunden.`}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowApps(false);
                  setContinueAfterAppConnection(false);
                }}
                aria-label="Schließen"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  border: "none",
                  background: C.muted,
                  cursor: "pointer",
                  color: C.gray1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {pairingStage === "select" && (
              <>
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
                        setPairingApp(app.name);
                        setPairingStage("qr");
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
                  onClick={() => {
                    setShowApps(false);
                    if (continueAfterAppConnection) {
                      setContinueAfterAppConnection(false);
                      continueToPinChoice();
                    }
                  }}
                  style={{ alignSelf: "center" }}
                />
              </>
            )}

            {(pairingStage === "qr" || pairingStage === "connecting") && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 28,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <PairingQrCode connecting={pairingStage === "connecting"} />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 9,
                      fontWeight: 750,
                      color: C.gray2,
                    }}
                  >
                    <Lock className="w-3 h-3" color={C.green} />
                    Einmaliger, sicherer Verbindungscode
                  </div>
                </div>
                <div style={{ width: 230 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginBottom: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 11,
                        background: C.blueLt,
                        color: C.blue,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: C.gray1,
                      }}
                    >
                      Mit dem Handy scannen
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                      marginBottom: 13,
                    }}
                  >
                    {[
                      `${pairingApp} auf dem Handy öffnen`,
                      "QR-Scanner in der App auswählen",
                      "Code scannen und Verbindung bestätigen",
                    ].map((instruction, index) => (
                      <div
                        key={instruction}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          fontSize: 10,
                          color: C.gray2,
                        }}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: C.muted,
                            color: C.blue,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 850,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </span>
                        {instruction}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color:
                        pairingStage === "connecting" ? C.green : C.gray2,
                      marginBottom: 7,
                    }}
                  >
                    {pairingStage === "connecting"
                      ? "Verbindung wird hergestellt…"
                      : "Bereit zum Scannen"}
                  </div>
                  <PrimaryBtn
                    label={
                      pairingStage === "connecting"
                        ? "Verbindung wird hergestellt…"
                        : "Verbindung herstellen"
                    }
                    disabled={pairingStage === "connecting"}
                    onClick={() => setPairingStage("connecting")}
                    style={{ width: "100%" }}
                  />
                  {pairingStage === "qr" && (
                    <GhostBtn
                      label="Andere App wählen"
                      onClick={() => setPairingStage("select")}
                      style={{ paddingLeft: 0, marginTop: 7 }}
                    />
                  )}
                </div>
              </div>
            )}

            {pairingStage === "success" && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center" as const,
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    background: C.greenLt,
                    color: C.green,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "popIn .45s ease",
                  }}
                >
                  <Check className="w-10 h-10" strokeWidth={3} />
                </div>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 21,
                    fontWeight: 850,
                    color: C.green,
                  }}
                >
                  Verbindung hergestellt
                </div>
                <div style={{ marginTop: 5, fontSize: 12, color: C.gray2 }}>
                  {pairingApp} ist verbunden. Deine Ziele wurden automatisch übernommen.
                </div>
                {importedTargets && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {[
                      { label: "Kalorien", value: `${importedTargets.calories} kcal` },
                      { label: "Protein", value: `${importedTargets.protein} g` },
                      { label: "Fett", value: `${importedTargets.fat} g` },
                      { label: "Kohlenhydrate", value: `${importedTargets.carbs} g` },
                    ].map((target) => (
                      <div key={target.label} style={{ minWidth: 74, borderRadius: 9, background: C.card, border: `1px solid ${C.border}`, padding: "6px 7px" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: C.gray1 }}>{target.value}</div>
                        <div style={{ fontSize: 7, color: C.gray3, marginTop: 1 }}>{target.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <PrimaryBtn
                  label="✓ Verbindung hergestellt"
                  onClick={() => {
                    setShowApps(false);
                    if (continueAfterAppConnection) {
                      setContinueAfterAppConnection(false);
                      continueToPinChoice();
                    }
                  }}
                  style={{ marginTop: 8, minHeight: 38, padding: "7px 18px" }}
                />
              </div>
            )}
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
  const [pinError, setPinError] = useState(false);
  const onLoginRef = useRef(onLogin);
  onLoginRef.current = onLogin;

  useEffect(() => {
    if (pin.length === 4) {
      const t = setTimeout(() => {
        const isCreatedProfile = profile.id.startsWith("new-");
        if (!isCreatedProfile || !profile.pin || pin === profile.pin) {
          onLoginRef.current();
        } else {
          setPinError(true);
          setPin("");
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [pin, profile.pin]);

  const handleKey = (k: string) => {
    setPinError(false);
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
              color: pinError ? C.red : C.gray2,
              marginTop: 3,
            }}
          >
            {pinError
              ? "PIN nicht korrekt. Bitte erneut versuchen."
              : "Bitte gib deinen 4-stelligen PIN ein."}
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
  showProfileWelcome,
  onDismissProfileWelcome,
  weighMode,
  setWeighMode,
  automaticDetection,
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
  onSwitchProfile,
  onLogout,
  onSettings,
}: any) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [directWeight, setDirectWeight] = useState(0);
  const taraFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (taraFeedbackTimer.current) {
        clearTimeout(taraFeedbackTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (weighMode !== "scale-only") return;
    const targetWeight = 142;
    const duration = 1050;
    const startedAt = performance.now();
    let frame = 0;
    setDirectWeight(0);

    const animateWeight = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDirectWeight(Math.round(targetWeight * eased));
      if (progress < 1) frame = requestAnimationFrame(animateWeight);
    };
    frame = requestAnimationFrame(animateWeight);
    return () => cancelAnimationFrame(frame);
  }, [weighMode]);
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
      ? automaticDetection
        ? "Scan startet automatisch"
        : "Kamera startet nur auf Knopfdruck"
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
    if (mode === "scale-only") {
      setDirectWeight(0);
      setTaraActive(false);
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
        position: "relative" as const,
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
          <div style={{ position: "relative" as const }}>
            <button
              onClick={() => setProfileMenuOpen((open) => !open)}
              aria-label="Profilmenü öffnen"
              aria-expanded={profileMenuOpen}
              style={{
                height: 24,
                border: `1px solid ${C.border}`,
                background: C.card,
                borderRadius: 999,
                padding: "0 9px 0 5px",
                fontSize: 10,
                fontWeight: 800,
                color: C.gray1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {profile ? (
                <Avatar
                  initials={profile.initials}
                  color={profile.color}
                  size={17}
                />
              ) : (
                <User className="w-3 h-3" />
              )}
              {profile ? profile.name : "Gast"}
              <ChevronRight
                className="w-3 h-3"
                style={{
                  transform: profileMenuOpen
                    ? "rotate(90deg)"
                    : "rotate(0deg)",
                  transition: "transform .2s ease",
                }}
              />
            </button>

            {profileMenuOpen && (
              <div
                style={{
                  position: "absolute" as const,
                  top: 29,
                  right: 0,
                  width: 168,
                  padding: 6,
                  borderRadius: 13,
                  background: C.elevated,
                  border: `1px solid ${C.border}`,
                  boxShadow: "0 12px 30px rgba(0,0,0,.16)",
                  zIndex: 100,
                }}
              >
                {(profile
                  ? [
                      {
                        label: "Profil ansehen",
                        icon: <User className="w-3.5 h-3.5" />,
                        action: onProfile,
                        color: C.gray1,
                      },
                      {
                        label: "Profil wechseln",
                        icon: <RefreshCw className="w-3.5 h-3.5" />,
                        action: onSwitchProfile,
                        color: C.blue,
                      },
                      {
                        label: "Logout",
                        icon: <LogOut className="w-3.5 h-3.5" />,
                        action: onLogout,
                        color: C.red,
                      },
                    ]
                  : [
                      {
                        label: "Profil einrichten",
                        icon: <Plus className="w-3.5 h-3.5" />,
                        action: onSwitchProfile,
                        color: C.blue,
                      },
                    ]
                ).map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      item.action();
                    }}
                    style={{
                      width: "100%",
                      height: 32,
                      padding: "0 9px",
                      border: "none",
                      borderRadius: 9,
                      background: "transparent",
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 11,
                      fontWeight: 750,
                      cursor: "pointer",
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {showProfileWelcome && profile && (
        <div
          role="status"
          style={{
            position: "absolute" as const,
            top: 38,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 80,
            minWidth: 310,
            padding: "10px 12px",
            borderRadius: 16,
            background: C.elevated,
            border: `1px solid ${C.border}`,
            boxShadow: "0 12px 30px rgba(0,0,0,.16)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation:
              "profileWelcomeToast 3.5s cubic-bezier(.22,.8,.3,1) forwards",
            willChange: "transform, opacity",
          }}
        >
          <Avatar
            initials={profile.initials}
            color={profile.color}
            size={38}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.gray1 }}>
              Willkommen, {profile.name}!
            </div>
            <div style={{ fontSize: 10, color: C.gray2, marginTop: 1 }}>
              Dein Profil wurde erfolgreich eingerichtet.
            </div>
          </div>
          <button
            onClick={onDismissProfileWelcome}
            aria-label="Begrüßung schließen"
            style={{
              width: 25,
              height: 25,
              borderRadius: "50%",
              border: "none",
              background: C.muted,
              color: C.gray2,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

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
              {weighMode === "scale-only" ? directWeight : 0}
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
            onClick={() => {
              setTaraActive(true);
              if (weighMode === "scale-only") setDirectWeight(0);
              if (taraFeedbackTimer.current) {
                clearTimeout(taraFeedbackTimer.current);
              }
              taraFeedbackTimer.current = setTimeout(
                () => setTaraActive(false),
                700,
              );
            }}
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
                label={
                  automaticDetection
                    ? "Scan manuell starten"
                    : "KI-Scan starten"
                }
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
              <div
                style={{
                  height: 27,
                  padding: "0 11px",
                  borderRadius: 999,
                  background: C.greenLt,
                  color: C.green,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: C.green,
                  }}
                />
                Direktmessung aktiv
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation / guest notice */}
      {profile ? (
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
            icon: <Settings className="w-3 h-3" />,
            label: "Einstellungen",
            onClick: onSettings,
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
      ) : (
        <div
          style={{
            height: 27,
            flexShrink: 0,
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            color: C.gray3,
            fontSize: 9,
            fontWeight: 750,
          }}
        >
          <Shield className="w-3 h-3" /> Gastmodus · keine Speicherung oder
          App-Übertragung
        </div>
      )}
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
        if (next >= finalRef.current) {
          clearInterval(iv);
          return finalRef.current;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (weight < finalRef.current) return;

    setStable(true);
    const t = setTimeout(
      () => onComplete(food, finalRef.current),
      800,
    );
    return () => clearTimeout(t);
  }, [weight, food, onComplete]);

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
  food,
  onDone,
  onCancel,
}: {
  food?: FoodItem | null;
  onDone: (food: FoodItem, weight: number) => void;
  onCancel: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [weight, setWeight] = useState(0);
  const [weightStable, setWeightStable] = useState(false);

  const foodRef = useRef<FoodItem>(
    food ?? ALL_FOODS[Math.floor(Math.random() * ALL_FOODS.length)],
  );
  const weightRef = useRef(
    Math.floor(Math.random() * 171) + 80,
  );

  useEffect(() => {
    if (!weightStable) return;

    let animationFrame = 0;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = performance.now();
    const analysisDuration = 3200;

    const animateProgress = (now: number) => {
      const elapsed = now - startedAt;
      const fraction = Math.min(elapsed / analysisDuration, 1);
      setProgress(fraction * 100);

      if (fraction < 1) {
        animationFrame = requestAnimationFrame(animateProgress);
      } else {
        finishTimer = setTimeout(() => {
          onDone(foodRef.current, weightRef.current);
        }, 500);
      }
    };

    animationFrame = requestAnimationFrame(animateProgress);

    return () => {
      cancelAnimationFrame(animationFrame);
      if (finishTimer) clearTimeout(finishTimer);
    };
  }, [onDone, weightStable]);

  useEffect(() => {
    const weightTimer = setInterval(() => {
      setWeight((w) => {
        const next = Math.min(
          w + Math.ceil(weightRef.current / 13),
          weightRef.current,
        );
        if (next >= weightRef.current) {
          clearInterval(weightTimer);
          setProgress(0);
          setWeightStable(true);
        }
        return next;
      });
    }, 65);

    return () => clearInterval(weightTimer);
  }, []);

  const statusText = !weightStable
    ? "Gewicht wird stabilisiert..."
    : progress < 30
      ? "Kamera wird vorbereitet..."
      : progress < 65
        ? "Lebensmittel wird analysiert..."
        : progress < 100
          ? "Nährwerte werden berechnet..."
          : "Erkennung abgeschlossen";

  const isDone = progress >= 100;
  const naturalProgressSteps = [
    0, 6, 14, 23, 35, 49, 63, 76, 87, 95, 100,
  ];
  const displayedProgress =
    [...naturalProgressSteps]
      .reverse()
      .find((step) => progress >= step) ?? 0;

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
              background: !weightStable
                ? C.gray3
                : isDone
                  ? C.green
                  : C.blue,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.gray2,
            }}
          >
            {!weightStable
              ? "Gewicht wird ermittelt"
              : isDone
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
                border: `2px solid ${
                  !weightStable
                    ? C.gray3
                    : isDone
                      ? C.green
                      : C.blue
                }`,
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
                    color={weightStable ? C.blue : C.gray3}
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
            Lebensmittel erfassen
          </h2>

          <p
            style={{
              margin: "6px 0 22px",
              fontSize: 13,
              lineHeight: 1.35,
              color: C.gray2,
            }}
          >
            Zuerst wird das Gewicht ermittelt. Anschließend analysiert die KI
            das Lebensmittel und berechnet die Nährwerte.
          </p>

          <div style={{ minHeight: 52 }}>
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
                    color: !weightStable
                      ? C.gray2
                      : isDone
                        ? C.green
                        : C.blue,
                  }}
                >
                  {statusText}
                </span>

                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 850,
                    color: isDone ? C.green : C.gray1,
                    opacity: weightStable ? 1 : 0,
                  }}
                >
                  {`${displayedProgress}%`}
                </span>
              </div>

              <div
              style={{
                height: 13,
                background: C.card,
                borderRadius: 999,
                overflow: "hidden",
                border: `1.5px solid ${C.border}`,
                opacity: weightStable ? 1 : 0,
                transition: "opacity .25s ease",
              }}
            >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(90deg, ${C.blue}, var(--c-blue-dark))`,
                    borderRadius: 999,
                    transform: `scaleX(${displayedProgress / 100})`,
                    transformOrigin: "left center",
                    transition: "transform .3s ease-out",
                    boxShadow:
                      displayedProgress > 0
                        ? `0 0 8px ${C.blue}`
                        : "none",
                  }}
                />
              </div>
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
              background: "var(--c-warning-bg)",
              backdropFilter: "blur(10px)",
              color: "var(--c-warning-text)",
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
  source,
  onSave,
  onChangeFood,
  onCancel,
}: {
  food: FoodItem;
  weight: number;
  profile: ProfileData | null;
  source: "ai" | "manual";
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
            {source === "manual"
              ? "Manuelle Messung"
              : "Lebensmittel erkannt"}
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
            width: 246,
            flexShrink: 0,
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: "12px 15px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {source === "ai" && (
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
          )}

          <div
            style={{
              marginTop: source === "ai" ? 9 : 0,
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

              {source === "ai" && (
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
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 14,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 9,
            }}
          >
            <div
              style={{
                background: C.elevated,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "8px 11px",
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
                padding: "8px 11px",
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
                  marginTop: 5,
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

          {isGuest ? (
            <div style={{ marginTop: 10 }}>
              <PrimaryBtn
                label="Tracking nur mit Profil"
                disabled
                style={{
                  width: "100%",
                  height: 34,
                  padding: 0,
                }}
              />
              <div
                style={{
                  marginTop: 4,
                  fontSize: 9,
                  color: C.gray2,
                  textAlign: "center" as const,
                }}
              >
                Im Gastmodus werden keine Daten übertragen.
              </div>
            </div>
          ) : (
            <PrimaryBtn
              label="Zur App übertragen"
              onClick={onSave}
              style={{
                width: "100%",
                height: 34,
                padding: 0,
                marginTop: 12,
              }}
            />
          )}

          <button
            onClick={onChangeFood}
            style={{
              marginTop: 9,
              height: 34,
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
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            alignSelf: "stretch",
            position: "relative" as const,
            background: C.elevated,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div
            className={expanded ? "ss-nutrition-scroll" : undefined}
            style={{
              position: "absolute" as const,
              inset: 0,
              padding: "13px 18px 14px",
              overflowY: expanded ? "scroll" : "hidden",
              overflowX: "hidden" as const,
              overscrollBehaviorY: "contain" as const,
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
              scrollbarGutter: "stable",
              scrollbarColor: `${C.gray3} ${C.muted}`,
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {expanded && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: C.blue,
                    background: C.blueLt,
                    borderRadius: 999,
                    padding: "4px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ↓ scrollen
                </span>
              )}
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
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            {macroItems.map((item) => (
              <NutritionBar key={item.label} item={item} />
            ))}
          </div>

          <div
            style={{
              marginTop: 9,
              paddingTop: 7,
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 850,
                color: C.gray3,
                letterSpacing: 1.1,
                marginBottom: 6,
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
              marginTop: 9,
              height: 36,
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

function AppTransferFlowScreen({
  food,
  onDone,
}: {
  food: FoodItem;
  onDone: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const onDoneRef = useRef(onDone);
  const completionSentRef = useRef(false);
  onDoneRef.current = onDone;
  const duration = 6200;
  const phase = elapsed < 2000 ? 0 : elapsed < 3200 ? 1 : elapsed < 5000 ? 2 : 3;
  const rawTransfer = Math.min(1, elapsed / 2000);
  const transfer = 1 - Math.pow(1 - rawTransfer, 3);
  const syncProgress = Math.min(100, Math.max(0, ((elapsed - 3200) / 1800) * 100));
  useEffect(() => {
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(duration, now - startedAt);
      setElapsed(next);
      if (next < duration) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const finish = setTimeout(() => {
      if (completionSentRef.current) return;
      completionSentRef.current = true;
      onDoneRef.current();
    }, duration + 250);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(finish);
    };
  }, []);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        padding: "8px 22px 12px",
        background: C.bg,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes phoneReceivePulse {
          0%,100% { transform:scale(.88); opacity:.35 }
          50% { transform:scale(1.18); opacity:.8 }
        }
        @keyframes phoneSuccessPop {
          0% { transform:scale(.55); opacity:0 }
          70% { transform:scale(1.12); opacity:1 }
          100% { transform:scale(1); opacity:1 }
        }
      `}</style>

      <div style={{ textAlign: "center", minHeight: 61 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 850,
            letterSpacing: 1.2,
            color: C.blue,
          }}
        >
          SICHERE SYNCHRONISIERUNG
        </div>
        <div
          style={{
            marginTop: 3,
            fontSize: 19,
            fontWeight: 850,
            color: C.gray1,
            letterSpacing: "-.3px",
          }}
        >
          In die App übertragen
        </div>
        <div style={{ marginTop: 2, fontSize: 10, color: C.gray2 }}>
          {food.name} wird sicher übertragen und in deiner Tracking-App
          gespeichert.
        </div>
      </div>

      <div
        style={{
          position: "relative" as const,
          width: 500,
          maxWidth: "94%",
          height: 218,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute" as const,
            left: 77,
            right: 82,
            top: 107,
            height: 2,
            background: `repeating-linear-gradient(90deg, ${C.blue} 0 7px, transparent 7px 13px)`,
            opacity: phase === 0 ? 0.65 : 0.18,
          }}
        />
        <div
          style={{
            position: "absolute" as const,
            left: 25,
            top: 61,
            width: 92,
            height: 92,
            borderRadius: 24,
            background: C.elevated,
            border: `1px solid ${C.border}`,
            boxShadow: "0 14px 34px rgba(0,0,0,.12)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            opacity: phase === 0 ? 1 : 0.42,
            transition: "opacity .4s ease",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: C.blueLt,
              color: C.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Scale className="w-5 h-5" />
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, color: C.gray1 }}>
            {food.name}
          </span>
        </div>

        {phase === 0 && (
          <div
            style={{
              position: "absolute" as const,
              left: 55,
              top: 78,
              width: 58,
              height: 58,
              borderRadius: 18,
              background: C.card,
              border: `1px solid ${C.border}`,
              boxShadow: "0 12px 28px rgba(0,0,0,.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 31,
              transform: `translateX(${298 * transfer}px) scale(${1 - transfer * 0.45}) rotate(${transfer * 8}deg)`,
              opacity: rawTransfer > 0.92 ? (1 - rawTransfer) / 0.08 : 1,
              willChange: "transform, opacity",
              zIndex: 5,
            }}
          >
            {food.emoji}
          </div>
        )}

        <div
          style={{
            position: "absolute" as const,
            right: 42,
            top: 0,
            width: 126,
            height: 218,
          }}
        >
          <div
            style={{
              position: "absolute" as const,
              right: -3,
              top: 52,
              width: 3,
              height: 34,
              borderRadius: "0 3px 3px 0",
              background: "#34363B",
            }}
          />
          <div
            style={{
              position: "relative" as const,
              width: "100%",
              height: "100%",
              padding: 5,
              borderRadius: 22,
              background: "linear-gradient(145deg,#31343A,#07080A 55%,#25272C)",
              border: "1px solid rgba(255,255,255,.22)",
              boxShadow: "0 22px 50px rgba(0,0,0,.3)",
            }}
          >
            <div
              style={{
                position: "relative" as const,
                width: "100%",
                height: "100%",
                borderRadius: 17,
                overflow: "hidden",
                background: "linear-gradient(165deg,#F8FBFF,#EAF7FC)",
                color: "#111827",
              }}
            >
              <div
                style={{
                  position: "absolute" as const,
                  top: 6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 39,
                  height: 11,
                  borderRadius: 99,
                  background: "#08090B",
                  zIndex: 3,
                }}
              />
              <div
                style={{
                  height: 29,
                  padding: "8px 10px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 6,
                  fontWeight: 800,
                }}
              >
                <span>9:41</span>
                <span>●●●</span>
              </div>
              <div
                key={phase}
                style={{
                  height: "calc(100% - 29px)",
                  padding: "9px 10px 13px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center" as const,
                  animation: "fadeUp .35s ease",
                }}
              >
                {phase === 0 && (
                  <>
                    <div style={{ position: "relative", width: 47, height: 47 }}>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: "50%",
                          background: C.blueLt,
                          animation: "phoneReceivePulse 1.3s ease-in-out infinite",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 8,
                          borderRadius: "50%",
                          background: C.blue,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Smartphone className="w-4 h-4" />
                      </div>
                    </div>
                    <div style={{ marginTop: 9, fontSize: 10, fontWeight: 850 }}>
                      Bereit zum Empfang
                    </div>
                    <div style={{ marginTop: 3, fontSize: 7, color: "#64748B" }}>
                      Sichere Verbindung aktiv
                    </div>
                  </>
                )}
                {phase === 1 && (
                  <>
                    <div
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: 15,
                        background: "#fff",
                        boxShadow: "0 8px 20px rgba(0,0,0,.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 27,
                      }}
                    >
                      {food.emoji}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 10, fontWeight: 850 }}>
                      1 Eintrag empfangen
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        color: C.green,
                        fontSize: 7,
                        fontWeight: 800,
                      }}
                    >
                      <Check className="w-3 h-3" /> Übertragung bestätigt
                    </div>
                  </>
                )}
                {phase === 2 && (
                  <>
                    <RefreshCw
                      className="w-7 h-7"
                      color={C.blue}
                      style={{ animation: "spin 1.1s linear infinite" }}
                    />
                    <div style={{ marginTop: 9, fontSize: 10, fontWeight: 850 }}>
                      Synchronisierung
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        width: "100%",
                        height: 6,
                        borderRadius: 99,
                        background: "#DDE7EE",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${syncProgress}%`,
                          height: "100%",
                          borderRadius: 99,
                          background: C.blue,
                        }}
                      />
                    </div>
                    <div style={{ marginTop: 4, fontSize: 7, color: "#64748B" }}>
                      {Math.round(syncProgress)} %
                    </div>
                  </>
                )}
                {phase === 3 && (
                  <>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: C.green,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "phoneSuccessPop .45s ease both",
                        boxShadow: "0 10px 24px rgba(52,211,153,.28)",
                      }}
                    >
                      <Check className="w-7 h-7" strokeWidth={3} />
                    </div>
                    <div style={{ marginTop: 9, fontSize: 12, fontWeight: 900 }}>
                      Fertig
                    </div>
                    <div style={{ marginTop: 3, fontSize: 7, color: "#64748B" }}>
                      In deiner App gespeichert
                    </div>
                  </>
                )}
              </div>
              <div
                style={{
                  position: "absolute" as const,
                  bottom: 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 35,
                  height: 3,
                  borderRadius: 99,
                  background: "rgba(15,23,42,.35)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        {["Senden", "Empfangen", "Synchronisieren", "Fertig"].map(
          (label, index) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color:
                  index < phase
                    ? C.green
                    : index === phase
                      ? C.blue
                      : C.gray3,
                fontSize: 8,
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    index < phase
                      ? C.green
                      : index === phase
                        ? C.blue
                        : C.border,
                }}
              />
              {label}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function TrackingAnimationScreen({
  food,
  onDone,
}: {
  food: FoodItem;
  onDone: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const duration = 7000;
  const progress = Math.min(100, (elapsed / duration) * 100);
  const phase = elapsed < 2200 ? 0 : elapsed < 4300 ? 1 : 2;
  const rawTransferProgress = Math.min(
    1,
    Math.max(0, (elapsed - 2200) / 2100),
  );
  const transferProgress =
    1 - Math.pow(1 - rawTransferProgress, 3);
  const message =
    phase === 0
      ? "Lebensmittel wird für die Übertragung vorbereitet…"
      : phase === 1
        ? "Nährwerte werden sicher an die App übertragen…"
        : "Erfolgreich in deiner App gespeichert!";

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.min(duration, Date.now() - startedAt));
    }, 16);
    const finishTimer = setTimeout(() => onDoneRef.current(), duration);
    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
    };
  }, []);

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
          position: "relative" as const,
          width: 390,
          maxWidth: "90%",
          height: 170,
        }}
      >
        <div
          style={{
            position: "absolute" as const,
            left: "9%",
            top: 25,
            width: 112,
            height: 112,
            borderRadius: 24,
            background: C.card,
            border: `2px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 62,
            transform: `translate(${170 * transferProgress}px, ${5 * transferProgress}px) scale(${1 - 0.68 * transferProgress})`,
            opacity:
              rawTransferProgress > 0.88
                ? Math.max(
                    0,
                    (1 - rawTransferProgress) / 0.12,
                  )
                : 1,
            willChange: "transform, opacity",
            zIndex: 2,
          }}
        >
          {food.emoji}
        </div>
        <div
          style={{
            position: "absolute" as const,
            left: phase >= 2 ? "50%" : "67%",
            top: phase >= 2 ? 4 : 15,
            width: 96,
            height: 190,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform:
              phase >= 2
                ? "translateX(-50%) scale(1.12)"
                : "translateX(-50%) scale(1)",
            transition: "all 1.1s cubic-bezier(0.34,1.2,0.64,1)",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "relative" as const,
              width: 94,
              height: 188,
              borderRadius: 42,
              background: "linear-gradient(180deg, #111214 0%, #070809 100%)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow:
                "0 28px 70px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.02)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute" as const,
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.02) 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute" as const,
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                width: 40,
                height: 4,
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                boxShadow: "0 0 6px rgba(255,255,255,0.1)",
              }}
            />
            <div
              style={{
                width: "88%",
                height: "86%",
                borderRadius: 34,
                background: "linear-gradient(180deg, #050607 0%, #111317 100%)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "rgba(255,255,255,0.78)",
                  fontSize: 9,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                }}
              >
                <span>SMART SCALE</span>
                <span>9:41</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  color: "#F8FAFB",
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Synchronisierung abgeschlossen
                </div>
                <div
                  style={{
                    width: "100%",
                    minHeight: 72,
                    borderRadius: 26,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: 12,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.7)",
                          marginBottom: 2,
                        }}
                      >
                        Letzte Messung
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>
                        68,2 kg
                      </span>
                    </div>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.1)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <span style={{ color: "#6EE7B7", fontSize: 12 }}>
                        +1.2%
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 6,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "72%",
                        height: "100%",
                        background: "#6EE7B7",
                      }}
                    />
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Sicher und privat
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  14:22
                </span>
              </div>
            </div>
            {phase >= 2 && (
              <div
                style={{
                  position: "absolute" as const,
                  top: -8,
                  right: -8,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
                }}
              >
                <Check color="#0F766E" strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          minHeight: 42,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: phase >= 2 ? 750 : 650,
            color: phase >= 2 ? C.green : C.gray1,
            textAlign: "center" as const,
          }}
        >
          {message}
        </div>
        <div style={{ fontSize: 11, color: C.gray2 }}>
          {phase < 2 ? "Bitte einen Moment warten" : food.name}
        </div>
      </div>

      <div style={{ width: 340, maxWidth: "78%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            fontSize: 11,
            fontWeight: 700,
            color: C.gray2,
          }}
        >
          <span>Übertragung</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div
          style={{
            height: 9,
            borderRadius: 999,
            background: C.muted,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 999,
              background: phase >= 2 ? C.green : C.blue,
              transition: "background-color .4s ease",
            }}
          />
        </div>
      </div>
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
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 30,
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#F7F8FA",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          padding: "34px 24px 26px",
          background: "#FFFFFF",
          borderRadius: 38,
          boxShadow: "0 28px 60px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            color: "#111827",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          Synchronisierung abgeschlossen
        </div>
        <div
          style={{
            color: C.gray2,
            fontSize: 15,
            lineHeight: 1.7,
            textAlign: "center",
            maxWidth: 420,
          }}
        >
          Deine Messung wurde erfolgreich in der App gespeichert.
        </div>
        <div
          style={{
            position: "relative" as const,
            width: 340,
            maxWidth: "100%",
            paddingTop: 640 / 340 * 100 + "%",
            overflow: "visible",
          }}
        >
          <div
            style={{
              position: "absolute" as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute" as const,
                top: "-16%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.18)",
                boxShadow: "0 22px 50px rgba(16, 185, 129, 0.18)",
                backdropFilter: "blur(18px)",
                border: "1px solid rgba(16, 185, 129, 0.24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <Check
                className="w-10 h-10"
                color="#ffffff"
                strokeWidth={3}
              />
            </div>
            <div
              style={{
                position: "relative" as const,
                width: "100%",
                height: "100%",
                maxWidth: 340,
                maxHeight: 640,
                borderRadius: 52,
                background: "linear-gradient(180deg, #101214 0%, #070809 100%)",
                boxShadow:
                  "0 40px 80px rgba(15, 23, 42, 0.18), inset 0 0 0 1px rgba(255,255,255,0.04)",
                overflow: "hidden",
              }}
            >
              <img
                src={iPhoneImage}
                alt="Flagship phone"
                style={{
                  position: "absolute" as const,
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute" as const,
                  top: 16,
                  left: 14,
                  right: 14,
                  bottom: 18,
                  borderRadius: 38,
                  background: "rgba(15, 23, 42, 0.92)",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 18px 34px rgba(255,255,255,0.02)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    padding: "18px 18px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>Smart Scale</span>
                  <span>9:41</span>
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 20px 20px",
                    color: "#F9FAFB",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      lineHeight: 1.12,
                      marginBottom: 10,
                    }}
                  >
                    Synchronisierung abgeschlossen
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.78)",
                      marginBottom: 24,
                    }}
                  >
                    Deine Messung wurde erfolgreich in der App gespeichert.
                  </div>
                  <div
                    style={{
                      minHeight: 100,
                      borderRadius: 30,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: 18,
                      boxShadow:
                        "inset 0 0 0 1px rgba(255,255,255,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: "0.18em",
                            color: "rgba(255,255,255,0.65)",
                            marginBottom: 4,
                          }}
                        >
                          Aktuelle Messung
                        </div>
                        <div
                          style={{
                            fontSize: 28,
                            fontWeight: 700,
                            color: "#F9FAFB",
                          }}
                        >
                          68,2 kg
                        </div>
                      </div>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: "rgba(34,197,94,0.15)",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Check color="#22C55E" strokeWidth={3} />
                      </div>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 6,
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.12)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "68%",
                          height: "100%",
                          borderRadius: 999,
                          background: "#22C55E",
                        }}
                      >
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: "0 18px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 11,
                  }}
                >
                  <span>Automatische Synchronisierung</span>
                  <span>WLAN verbunden</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          style={{
            width: "100%",
            maxWidth: 260,
            padding: "16px 24px",
            borderRadius: 999,
            background:
              "linear-gradient(135deg, #22C55E 0%, #10B981 100%)",
            border: "none",
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.02em",
            cursor: "pointer",
            boxShadow: "0 18px 50px rgba(16, 185, 129, 0.26)",
          }}
        >
          In App öffnen
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Standby ───────────────────────────────────────────────────────────

function StandbyLogoutScreen({
  profile,
  onDone,
}: {
  profile: ProfileData;
  onDone: () => void;
}) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current(), 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ flex: 1, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 440, maxWidth: "100%", borderRadius: 24, background: C.elevated, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,.2)", padding: 22, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 17, background: C.blueLt, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Lock className="w-6 h-6" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 820, color: C.gray1 }}>
            {profile.name} wird automatisch ausgeloggt
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.45, color: C.gray2, marginTop: 4 }}>
            Damit niemand als Nächstes auf dein Profil zugreifen kann, wird die Sitzung beendet. Die Waage wechselt anschließend in den Standby.
          </div>
          <div style={{ height: 4, borderRadius: 99, background: C.muted, overflow: "hidden", marginTop: 12 }}>
            <div style={{ height: "100%", borderRadius: 99, background: C.blue, animation: "fillBar 2.6s linear forwards" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

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
        background: C.bg,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20,
          paddingTop: 24,
        }}
      >
        {/* Top: horizontal logo — same size as the Boot screen and centered with the rest */}
        <div style={{ transform: "translateY(-20%)" }}>
          <HorizontalLogo scale={4} themed />
        </div>

        {/* Center: clock */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            transform: "translateY(-60%)",
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
            Auf den Bildschirm tippen
          </span>
        </div>
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
  onBack,
  onLogin,
}: {
  guestMode: GuestMode;
  food: FoodItem | null;
  weight: number;
  onDone: () => void;
  onNew: () => void;
  onBack: () => void;
  onLogin: () => void;
}) {
  const [unit, setUnit] = useState<"g" | "oz">("g");
  const [taraActive, setTaraActive] = useState(false);
  const [taraFeedback, setTaraFeedback] = useState(false);
  const taraFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  useEffect(() => {
    return () => {
      if (taraFeedbackTimer.current) {
        clearTimeout(taraFeedbackTimer.current);
      }
    };
  }, []);

  const handleTara = () => {
    setTaraActive(true);
    setTaraFeedback(true);
    if (taraFeedbackTimer.current) {
      clearTimeout(taraFeedbackTimer.current);
    }
    taraFeedbackTimer.current = setTimeout(
      () => setTaraFeedback(false),
      850,
    );
  };
  const displayed =
    unit === "g"
      ? weight
      : Math.round(weight * 0.03527 * 10) / 10;

  if (guestMode === "scale-only") {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: C.bg,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 36,
            flexShrink: 0,
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={onBack}
            style={{
              height: 27,
              padding: "0 10px",
              border: "none",
              borderRadius: 10,
              background: C.muted,
              color: C.gray1,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 10,
              fontWeight: 750,
              cursor: "pointer",
            }}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Zurück
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 800,
              color: C.gray2,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: C.green,
              }}
            />
            Bereit zum Wiegen
          </div>

          <button
            onClick={onLogin}
            style={{
              height: 27,
              padding: "0 11px",
              border: `1px solid ${C.blue}`,
              borderRadius: 10,
              background: C.blueLt,
              color: C.blue,
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <LogIn className="w-3.5 h-3.5" /> Einloggen
          </button>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            padding: "8px 18px 13px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: C.gray3 }}>
              AKTUELLES GEWICHT
            </div>
            <div
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "baseline",
                gap: 7,
              }}
            >
              <span
                style={{
                  fontSize: 76,
                  lineHeight: 0.95,
                  fontWeight: 900,
                  letterSpacing: "-0.06em",
                  color: C.gray1,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {taraActive ? 0 : displayed}
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.gray3 }}>
                {unit}
              </span>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 3,
                borderRadius: 12,
                background: C.muted,
                display: "flex",
                gap: 3,
              }}
            >
              {(["g", "oz"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  style={{
                    width: 62,
                    height: 27,
                    border: "none",
                    borderRadius: 9,
                    background: unit === u ? C.blue : "transparent",
                    color: unit === u ? "#fff" : C.gray2,
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {u}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 14, display: "flex", gap: 9 }}>
              <button
                onClick={handleTara}
                style={{
                  minWidth: 116,
                  height: 42,
                  borderRadius: 14,
                  border: `1.5px solid ${taraFeedback ? C.green : C.border}`,
                  background: taraFeedback ? C.greenLt : C.card,
                  color: taraFeedback ? C.green : C.gray1,
                  fontSize: 13,
                  fontWeight: 850,
                  cursor: "pointer",
                  transition:
                    "background-color .2s ease, color .2s ease, border-color .2s ease, transform .15s ease",
                  transform: taraFeedback ? "scale(.97)" : "scale(1)",
                }}
              >
                {taraFeedback ? "✓ TARA gesetzt" : "TARA"}
              </button>
              <button
                onClick={onBack}
                style={{
                  minWidth: 116,
                  height: 42,
                  borderRadius: 14,
                  border: `1px solid ${C.border}`,
                  background: C.card,
                  color: C.gray1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <House className="w-4 h-4" /> Home
              </button>
            </div>
          </div>

          <div
            style={{
              width: "100%",
              minHeight: 40,
              padding: "0 14px",
              borderRadius: 13,
              background: C.blueLt,
              border: `1px solid ${C.border}`,
              color: C.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 11,
              fontWeight: 750,
            }}
          >
            <Info className="w-4 h-4" />
            Nur Gewichtsmessung – keine Lebensmittel- oder Nährwertanalyse
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: C.bg,
      }}
    >
      <div
        style={{
          height: 42,
          flexShrink: 0,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            height: 30,
            padding: "0 11px",
            border: "none",
            borderRadius: 11,
            background: C.muted,
            color: C.gray1,
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            fontWeight: 750,
            cursor: "pointer",
          }}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Zurück
        </button>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.gray1 }}>
          Direkt wiegen
        </div>
        <button
          onClick={onLogin}
          style={{
            height: 30,
            padding: "0 12px",
            border: `1px solid ${C.blue}`,
            borderRadius: 11,
            background: C.blueLt,
            color: C.blue,
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          <LogIn className="w-3.5 h-3.5" /> Einloggen
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
      <div
        style={{
          width: 330,
          margin: "0 0 14px 14px",
          background: C.elevated,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          padding: "18px 22px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 13,
        }}
      >
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
          <Scale className="w-7 h-7" />
        </div>
        <div style={{ textAlign: "center" as const }}>
          <div
            style={{
              marginBottom: 5,
              fontSize: 10,
              fontWeight: 850,
              letterSpacing: 1.2,
              color: C.gray3,
            }}
          >
            AKTUELLES GEWICHT
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 900,
              color: C.gray1,
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
            }}
          >
            {displayed}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginTop: 12,
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
                  background: unit === u ? C.blueLt : C.card,
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
        <div
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            background: C.greenLt,
            fontSize: 10,
            fontWeight: 750,
            color: C.green,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Check className="w-3 h-3" /> Gewicht stabil
        </div>
        <div style={{ fontSize: 10, color: C.gray3 }}>
          Ohne Profil wird diese Messung nicht gespeichert.
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: "10px 18px 18px",
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
    </div>
  );
}

// ─── Screen: History ───────────────────────────────────────────────────────────

function HistoryScreen({
  onBack,
  calorieGoal,
  onReweigh,
  items,
  onDelete,
}: {
  onBack: () => void;
  calorieGoal: number;
  onReweigh: (food: FoodItem) => void;
  items: HistoryItem[];
  onDelete: (id: HistoryItem["id"]) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<HistoryItem | null>(null);
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const todayItems = items.filter(
    (item) => historyItemDateKey(item) === selectedDate,
  );
  const todayCal = todayItems.reduce(
    (s, i) => s + i.calories,
    0,
  );

  const allFiltered = todayItems.filter((i) =>
    i.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const grouped: {
    label: string;
    items: HistoryItem[];
  }[] = allFiltered.length
    ? [
        {
          label: new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
            "de-DE",
            { weekday: "long", day: "2-digit", month: "long" },
          ),
          items: allFiltered,
        },
      ]
    : [];
  const calorieColor = todayItems.length === 0
    ? C.gray3
    : todayCal <= calorieGoal
      ? C.green
      : todayCal <= calorieGoal + 50
        ? "#F59E0B"
        : C.red;
  const caloriePct = Math.min(
    100,
    (todayCal / calorieGoal) * 100,
  );
  const totalsByDate = items.reduce<Record<string, number>>((totals, item) => {
    const key = historyItemDateKey(item);
    totals[key] = (totals[key] ?? 0) + item.calories;
    return totals;
  }, {});
  const trackedDates = new Set(Object.keys(totalsByDate));
  const streak = (() => {
    let cursor = new Date();
    if (!trackedDates.has(localDateKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    let count = 0;
    while (trackedDates.has(localDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();
  const monthLabel = calendarMonth.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarOffset =
    (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const calendarDays: Array<number | null> = [
    ...Array.from({ length: calendarOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
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
        className="ss-nutrition-scroll"
        style={{
          width: 248,
          background: C.card,
          borderRight: `1px solid ${C.border}`,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflowY: "auto",
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
        <button
          onClick={() => setCalendarOpen(true)}
          style={{
            border: `1px solid ${C.border}`,
            background: C.elevated,
            borderRadius: 12,
            padding: "8px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: C.gray1,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <CalendarDays className="w-4 h-4" color={C.blue} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: C.gray3 }}>Ausgewählter Tag</div>
            <div style={{ fontSize: 11, fontWeight: 750, marginTop: 1 }}>
              {selectedDate === localDateKey()
                ? "Heute"
                : new Date(`${selectedDate}T12:00:00`).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5" color={C.gray3} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 11, padding: "7px 9px", background: C.blueLt }}>
          <Flame className="w-4 h-4" color={streak > 0 ? C.orange : C.gray3} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 820, color: C.gray1 }}>{streak} Tage Streak</div>
            <div style={{ fontSize: 8, color: C.gray2 }}>aufeinanderfolgend getrackt</div>
          </div>
        </div>
        <div style={{ color: C.gray1 }}>
          <div style={{ fontSize: 12, color: C.gray2 }}>
            {selectedDate === localDateKey() ? "Heute gegessen" : "An diesem Tag gegessen"}
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
              {todayItems.length === 0
                ? "Nicht getrackt"
                : todayCal <= calorieGoal
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
        {grouped.length === 0 && (
          <div style={{ flex: 1, minHeight: 170, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: C.gray2 }}>
            <CalendarDays className="w-8 h-8" color={C.gray3} />
            <div style={{ fontSize: 14, fontWeight: 750, color: C.gray1, marginTop: 9 }}>
              {query ? "Kein passender Eintrag" : "An diesem Tag wurde nichts getrackt"}
            </div>
            <div style={{ fontSize: 10, marginTop: 3 }}>
              Wähle im Kalender einen anderen Tag aus.
            </div>
          </div>
        )}
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
      {calendarOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            background: "var(--c-overlay)",
            backdropFilter: "blur(7px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div style={{ width: 430, maxWidth: "100%", borderRadius: 22, background: C.elevated, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,.26)", padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 820, color: C.gray1 }}>Tag auswählen</div>
                <div style={{ fontSize: 9, color: C.gray2, marginTop: 2 }}>Kalorienstatus und Tracking-Tage auf einen Blick</div>
              </div>
              <button onClick={() => setCalendarOpen(false)} aria-label="Kalender schließen" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.muted, color: C.gray1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "12px 0 8px" }}>
              <button onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} aria-label="Vorheriger Monat" style={{ width: 30, height: 28, borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, color: C.gray1, cursor: "pointer" }}>‹</button>
              <div style={{ fontSize: 13, fontWeight: 780, color: C.gray1, textTransform: "capitalize" }}>{monthLabel}</div>
              <button onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} aria-label="Nächster Monat" style={{ width: 30, height: 28, borderRadius: 9, border: `1px solid ${C.border}`, background: C.card, color: C.gray1, cursor: "pointer" }}>›</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
                <div key={day} style={{ textAlign: "center", fontSize: 8, fontWeight: 750, color: C.gray3, paddingBottom: 2 }}>{day}</div>
              ))}
              {calendarDays.map((day, index) => {
                if (day === null) return <span key={`empty-${index}`} />;
                const dateKey = localDateKey(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day));
                const total = totalsByDate[dateKey];
                const tracked = total !== undefined;
                const statusColor = !tracked
                  ? C.muted
                  : total <= calorieGoal
                    ? C.green
                    : total <= calorieGoal + 50
                      ? "#F59E0B"
                      : C.red;
                const selected = dateKey === selectedDate;
                return (
                  <button
                    key={dateKey}
                    onClick={() => {
                      setSelectedDate(dateKey);
                      setSelectedItem(null);
                      setQuery("");
                      setCalendarOpen(false);
                    }}
                    aria-label={`${day}. ${monthLabel}${tracked ? `, ${total} Kilokalorien` : ", nicht getrackt"}`}
                    style={{
                      height: 33,
                      borderRadius: 10,
                      border: `2px solid ${selected ? C.blue : "transparent"}`,
                      background: statusColor,
                      color: tracked ? "#fff" : C.gray2,
                      fontSize: 10,
                      fontWeight: selected || tracked ? 800 : 600,
                      cursor: "pointer",
                      boxShadow: selected ? "0 0 0 2px color-mix(in srgb, var(--c-blue) 20%, transparent)" : "none",
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 11, paddingTop: 9, borderTop: `1px solid ${C.border}` }}>
              {[
                { label: "Im Ziel", color: C.green },
                { label: "Etwas darüber", color: "#F59E0B" },
                { label: "Deutlich darüber", color: C.red },
                { label: "Nicht getrackt", color: C.muted },
              ].map((legend) => (
                <div key={legend.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8, color: C.gray2 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: legend.color, border: legend.label === "Nicht getrackt" ? `1px solid ${C.border}` : "none" }} />
                  {legend.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                flexShrink: 0,
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
                gap: 6,
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
                    padding: "9px 7px",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: label.length > 11 ? 8 : 9,
                      color: C.gray3,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.gray1,
                      marginTop: 3,
                      whiteSpace: "nowrap",
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
              label={`${detailFood.name} erneut wiegen`}
              onClick={() => onReweigh(detailFood)}
              style={{ flex: 1 }}
            />
            <button
              onClick={() => setDeleteCandidate(selectedItem)}
              style={{
                width: 44,
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: C.card,
                color: C.red,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
              aria-label="Lebensmittel entfernen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {deleteCandidate && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 50,
            background: "var(--c-overlay)",
            backdropFilter: "blur(7px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <div
            style={{
              width: 380,
              maxWidth: "100%",
              borderRadius: 22,
              background: C.elevated,
              border: `1px solid ${C.border}`,
              boxShadow: "0 24px 70px rgba(0,0,0,.26)",
              padding: 20,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 10px",
                borderRadius: "50%",
                background: "rgba(255,59,48,.12)",
                color: C.red,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 className="w-5 h-5" />
            </div>
            <div style={{ fontSize: 18, fontWeight: 820, color: C.gray1 }}>
              Lebensmittel wirklich löschen?
            </div>
            <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.45, color: C.gray2 }}>
              „{deleteCandidate.name}“ wird dauerhaft aus deinem Verlauf entfernt.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 17 }}>
              <SecondaryBtn
                label="Abbrechen"
                onClick={() => setDeleteCandidate(null)}
                style={{ minHeight: 40, padding: "8px 12px", fontSize: 12 }}
              />
              <button
                onClick={() => {
                  onDelete(deleteCandidate.id);
                  setSelectedItem(null);
                  setDeleteCandidate(null);
                }}
                style={{
                  minHeight: 40,
                  border: "none",
                  borderRadius: 13,
                  background: C.red,
                  color: "#fff",
                  padding: "8px 12px",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Löschen
              </button>
            </div>
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
  historyItems,
  onBack,
  onEdit,
  onEditGoals,
  onOpenWeightEntry,
  onChangePin,
  onProfileSelect,
  onLogout,
  onDelete,
}: {
  profile: ProfileData;
  calorieGoal: number;
  historyItems: HistoryItem[];
  onBack: () => void;
  onEdit: () => void;
  onEditGoals: () => void;
  onOpenWeightEntry: () => void;
  onChangePin: () => void;
  onProfileSelect: () => void;
  onLogout: () => void;
  onDelete: () => void;
}) {
  const consumed = historyItems.filter(
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
          minHeight: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
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
            gap: 4,
          }}
        >
          {[
            {
              icon: <Edit className="w-3.5 h-3.5" />,
              label: "Profildaten bearbeiten",
              onClick: onEdit,
            },
            {
              icon: <Star className="w-3.5 h-3.5" />,
              label: "Ziele bearbeiten",
              onClick: onEditGoals,
            },
            {
              icon: <Lock className="w-3.5 h-3.5" />,
              label: "PIN ändern",
              onClick: onChangePin,
            },
            {
              icon: <RefreshCw className="w-3.5 h-3.5" />,
              label: "Profil wechseln",
              onClick: onProfileSelect,
            },
            {
              icon: <LogOut className="w-3.5 h-3.5" />,
              label: "Abmelden",
              onClick: onLogout,
              red: true,
            },
            {
              icon: <Trash2 className="w-3.5 h-3.5" />,
              label: "Profil löschen",
              onClick: onDelete,
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
                padding: "5px 9px",
                cursor: "pointer",
                fontSize: 12,
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, borderRadius: 14, background: C.blueLt, border: `1px solid ${C.border}`, padding: "9px 13px" }}>
          <Star className="w-4 h-4" color={C.blue} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 750, color: C.gray2 }}>AKTUELLES ZIEL</div>
            <div style={{ fontSize: 14, fontWeight: 820, color: C.gray1, marginTop: 1 }}>{profile.goal}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.blue }}>{profile.calories} kcal</div>
            <div style={{ fontSize: 9, color: C.gray2 }}>
              {profile.goal === "Gewicht halten"
                ? "Gewicht halten"
                : profile.targetWeight
                  ? `Ziel: ${profile.targetWeight} kg`
                  : "Kein Zielgewicht"}
            </div>
          </div>
        </div>
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
        </div>
        <div
          style={{
            background: C.card,
            borderRadius: 14,
            border: `1px solid ${C.border}`,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.gray2 }}>Aktuelles Gewicht</div>
            <div style={{ fontSize: 19, fontWeight: 820, color: C.gray1, marginTop: 1 }}>
              {profile.currentWeight ? `${profile.currentWeight} kg` : "Noch nicht eingetragen"}
            </div>
          </div>
          <div style={{ width: 1, height: 34, background: C.border }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.gray2 }}>
              {profile.goal === "Gewicht halten" ? "Gewichtsziel" : "Zielgewicht"}
            </div>
            <div style={{ fontSize: 15, fontWeight: 760, color: C.blue, marginTop: 3 }}>
              {profile.goal === "Gewicht halten"
                ? "Gewicht halten"
                : profile.targetWeight
                  ? `${profile.targetWeight} kg`
                  : "Noch nicht festgelegt"}
            </div>
          </div>
          <SecondaryBtn
            label="Gewicht aktualisieren"
            onClick={onOpenWeightEntry}
            style={{ minHeight: 34, padding: "6px 12px", fontSize: 10 }}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            {
              label: "Protein",
              value: profile.macroTargets
                ? `4 / ${profile.macroTargets.protein} g`
                : "4 g",
              color: C.blue,
              bg: C.blueLt,
            },
            {
              label: "Fett",
              value: profile.macroTargets
                ? `3,5 / ${profile.macroTargets.fat} g`
                : "3,5 g",
              color: C.orange,
              bg: C.card,
            },
            {
              label: "Kohlenhydrate",
              value: profile.macroTargets
                ? `37 / ${profile.macroTargets.carbs} g`
                : "37 g",
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
                background: C.input,
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
  automaticDetection,
  setAutomaticDetection,
  tareOnStart,
  setTareOnStart,
  notifyCalories,
  setNotifyCalories,
  notifyTracking,
  setNotifyTracking,
  notifyGoal,
  setNotifyGoal,
  remainingCalories,
}: {
  onBack: () => void;
  appearance: AppearanceSetting;
  setAppearance: (a: AppearanceSetting) => void;
  automaticDetection: boolean;
  setAutomaticDetection: (enabled: boolean) => void;
  tareOnStart: boolean;
  setTareOnStart: (enabled: boolean) => void;
  notifyCalories: boolean;
  setNotifyCalories: (enabled: boolean) => void;
  notifyTracking: boolean;
  setNotifyTracking: (enabled: boolean) => void;
  notifyGoal: boolean;
  setNotifyGoal: (enabled: boolean) => void;
  remainingCalories: number;
}) {
  const [activeNav, setActiveNav] = useState("Messung");
  const [showNotificationOptions, setShowNotificationOptions] =
    useState(false);
  const [notificationPreview, setNotificationPreview] = useState(
    "Wähle aus, worüber du benachrichtigt werden möchtest.",
  );
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
            desc: automaticDetection
              ? "KI erkennt Lebensmittel automatisch per Kamera"
              : "KI-Scan wird manuell gestartet",
            on: automaticDetection,
            onToggle: () =>
              setAutomaticDetection(!automaticDetection),
          },
          {
            label: "Gewichtseinheit",
            desc: "Gramm (g)",
            toggle: false,
          },
          {
            label: "Tarieren beim Start",
            desc: tareOnStart
              ? "Waage wird beim Einschalten automatisch genullt"
              : "Waage wird beim Einschalten nicht genullt",
            on: tareOnStart,
            onToggle: () => setTareOnStart(!tareOnStart),
          },
        ].map(({ label, desc, on, toggle, onToggle }) => (
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
              <button
                type="button"
                role="switch"
                aria-label={label}
                aria-checked={Boolean(on)}
                onClick={onToggle}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: on ? C.blue : C.gray3,
                  position: "relative" as const,
                  cursor: "pointer",
                  flexShrink: 0,
                  border: "none",
                  padding: 0,
                  transition: "background 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: C.input,
                    position: "absolute" as const,
                    top: 2,
                    ...(on ? { right: 2 } : { left: 2 }),
                    transition: "all 0.2s",
                  }}
                />
              </button>
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
    Anzeige: showNotificationOptions ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => setShowNotificationOptions(false)}
          style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 4, border: "none", background: "none", color: C.blue, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0 }}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Anzeige
        </button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 750, color: C.gray1 }}>
            Benachrichtigungen
          </div>
          <div style={{ fontSize: 10, color: C.gray2, marginTop: 2 }}>
            Lege fest, welche Hinweise auf der Waage erscheinen.
          </div>
        </div>
        {[
          {
            label: "Verbleibende Kalorien",
            desc: `Informiert dich, wie viele Kalorien noch offen sind`,
            preview: remainingCalories > 0
              ? `Noch ${remainingCalories} kcal bis zu deinem Tagesziel.`
              : "Dein Kalorienziel für heute ist erreicht.",
            on: notifyCalories,
            setOn: setNotifyCalories,
            icon: <Bell className="w-4 h-4" />,
          },
          {
            label: "Tracking-Erinnerung",
            desc: "Erinnert dich, wenn längere Zeit nichts erfasst wurde",
            preview: "Nicht vergessen: Möchtest du deine nächste Mahlzeit tracken?",
            on: notifyTracking,
            setOn: setNotifyTracking,
            icon: <History className="w-4 h-4" />,
          },
          {
            label: "Zielstatus",
            desc: "Meldet, wenn du dein Tagesziel erreichst oder überschreitest",
            preview: remainingCalories > 0
              ? "Du bist auf Kurs – weiter so!"
              : "Tagesziel erreicht! Großartige Arbeit.",
            on: notifyGoal,
            setOn: setNotifyGoal,
            icon: <Star className="w-4 h-4" />,
          },
        ].map((option) => (
          <div key={option.label} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, padding: "9px 11px" }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: option.on ? C.blueLt : C.muted, color: option.on ? C.blue : C.gray3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {option.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.gray1 }}>{option.label}</div>
              <div style={{ fontSize: 9, lineHeight: 1.3, color: C.gray2, marginTop: 1 }}>{option.desc}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-label={option.label}
              aria-checked={option.on}
              onClick={() => {
                const next = !option.on;
                option.setOn(next);
                setNotificationPreview(
                  next ? option.preview : `${option.label} wurde deaktiviert.`,
                );
              }}
              style={{ width: 40, height: 22, borderRadius: 11, background: option.on ? C.blue : C.gray3, position: "relative", cursor: "pointer", flexShrink: 0, border: "none", padding: 0, transition: "background .2s ease" }}
            >
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: C.input, position: "absolute", top: 2, ...(option.on ? { right: 2 } : { left: 2 }), transition: "all .2s" }} />
            </button>
          </div>
        ))}
        <div style={{ borderRadius: 12, background: C.blueLt, border: `1px solid ${C.border}`, padding: "9px 11px", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <Bell className="w-4 h-4" color={C.blue} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: C.blue }}>VORSCHAU</div>
            <div style={{ fontSize: 10, color: C.gray1, marginTop: 2 }}>{notificationPreview}</div>
          </div>
        </div>
      </div>
    ) : (
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
            desc: `${[notifyCalories, notifyTracking, notifyGoal].filter(Boolean).length} von 3 aktiviert`,
            icon: <Bell className="w-4 h-4" />,
            onClick: () => setShowNotificationOptions(true),
          },
          {
            label: "Sprache",
            desc: "Deutsch",
            icon: <Info className="w-4 h-4" />,
          },
        ].map(({ label, desc, icon, onClick }) => (
          <div
            key={label}
            onClick={onClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: C.card,
              borderRadius: 12,
              padding: "10px 14px",
              border: `1px solid ${C.border}`,
              cursor: onClick ? "pointer" : "default",
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

function ManualFoodConfirmDialog({
  food,
  onConfirm,
  onChange,
  onCancel,
}: {
  food: FoodItem;
  onConfirm: () => void;
  onChange: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute" as const,
        inset: 0,
        zIndex: 210,
        background: "var(--c-overlay)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: 430,
          maxWidth: "100%",
          borderRadius: 22,
          background: C.elevated,
          border: `1px solid ${C.border}`,
          boxShadow: "0 22px 60px rgba(0,0,0,.22)",
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 22,
            background: C.card,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            flexShrink: 0,
          }}
        >
          {food.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: C.blue,
              fontSize: 9,
              fontWeight: 850,
              letterSpacing: 0.8,
            }}
          >
            <Scale className="w-3.5 h-3.5" /> AUSWAHL BESTÄTIGEN
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: 850,
              color: C.gray1,
            }}
          >
            {food.name} wiegen?
          </div>
          <div
            style={{
              marginTop: 4,
              marginBottom: 13,
              fontSize: 11,
              lineHeight: 1.4,
              color: C.gray2,
            }}
          >
            Bestätige die Auswahl und lege {food.name} anschließend direkt
            auf die Waage.
          </div>
          <PrimaryBtn
            label={`${food.name} jetzt wiegen`}
            onClick={onConfirm}
            style={{ width: "100%", height: 36, padding: 0 }}
          />
          <div style={{ display: "flex", gap: 7, marginTop: 6 }}>
            <GhostBtn
              label="Anderes wählen"
              onClick={onChange}
              style={{ flex: 1, padding: "6px 4px", fontSize: 10 }}
            />
            <GhostBtn
              label="Abbrechen"
              onClick={onCancel}
              style={{ flex: 1, padding: "6px 4px", fontSize: 10 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FoodSelectDialog({
  onSelect,
  onClose,
}: {
  onSelect: (food: FoodItem) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const searchResults = ALL_FOODS.filter((food) =>
    food.name.toLocaleLowerCase("de-DE").includes(
      query.trim().toLocaleLowerCase("de-DE"),
    ),
  );

  return (
    <div
      style={{
        position: "absolute" as const,
        inset: 0,
        background: "var(--c-overlay)",
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
            aria-label="Lebensmittelauswahl abbrechen"
            style={{
              background: C.muted,
              border: `1px solid ${C.border}`,
              borderRadius: "50%",
              width: 28,
              height: 28,
              color: C.gray1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,.12)",
            }}
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div
          style={{
            margin: "10px 14px 0",
            height: 38,
            flexShrink: 0,
            borderRadius: 12,
            background: C.muted,
            border: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 11px",
          }}
        >
          <Search className="w-4 h-4" color={C.gray3} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Lebensmittel suchen…"
            autoFocus
            style={{
              flex: 1,
              minWidth: 0,
              border: "none",
              outline: "none",
              background: "transparent",
              color: C.gray1,
              fontFamily: "inherit",
              fontSize: 13,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Suche leeren"
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: "none",
                background: C.card,
                color: C.gray2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto" as const,
            padding: 14,
          }}
        >
          {query.trim() ? (
            searchResults.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 8,
                }}
              >
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => onSelect(food)}
                    style={{
                      background: C.card,
                      border: `1.5px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "10px 8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                    }}
                  >
                    <span style={{ fontSize: 27 }}>{food.emoji}</span>
                    <span
                      style={{
                        fontSize: 11,
                        color: C.gray1,
                        fontWeight: 650,
                        textAlign: "left" as const,
                      }}
                    >
                      {food.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: 28,
                  textAlign: "center" as const,
                  color: C.gray3,
                  fontSize: 13,
                }}
              >
                Kein Lebensmittel für „{query}“ gefunden.
              </div>
            )
          ) : !category ? (
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
                  onClick={() => onSelect(food)}
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
        background: "var(--c-overlay)",
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
          width: 650,
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
            Wie möchtest du wiegen?
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
              Mit KI wiegen
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
            onClick={() => onSelect("manual")}
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
                background: C.blueLt,
                color: C.blue,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <List className="w-5 h-5" />
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.gray1,
              }}
            >
              Manuell auswählen
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Lebensmittel selbst wählen
            </div>
            <div style={{ fontSize: 11, color: C.gray2 }}>
              Anschließend wiegen
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
              Nur wiegen
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

function ChangePinDialog({
  profile,
  onSave,
  onClose,
}: {
  profile: ProfileData;
  onSave: (pin: string) => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<"old" | "new">(
    profile.pin ? "old" : "new",
  );
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (pinInput.length !== 4) return;
    if (stage === "old") {
      if (pinInput !== profile.pin) {
        setError(true);
        setPinInput("");
        return;
      }
      setError(false);
      setPinInput("");
      setStage("new");
      return;
    }
    onSave(pinInput);
    onClose();
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 225, background: "var(--c-overlay)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ width: 480, maxWidth: "100%", borderRadius: 22, background: C.elevated, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,.26)", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 820, color: C.gray1 }}>
              {stage === "old" ? "Alte PIN eingeben" : profile.pin ? "Neue PIN festlegen" : "PIN festlegen"}
            </div>
            <div style={{ fontSize: 10, color: error ? C.red : C.gray2, marginTop: 2 }}>
              {error
                ? "Die alte PIN ist nicht korrekt. Bitte erneut versuchen."
                : stage === "old"
                  ? "Bestätige zuerst deine bisherige vierstellige PIN."
                  : "Wähle eine neue vierstellige PIN für dein Profil."}
            </div>
          </div>
          <button onClick={onClose} aria-label="PIN-Änderung schließen" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.muted, color: C.gray1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 205px", gap: 22, alignItems: "center", marginTop: 14 }}>
          <div>
            <div aria-label={`${pinInput.length} von 4 PIN-Ziffern eingegeben`} style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {[0, 1, 2, 3].map((index) => (
                <span key={index} style={{ width: 15, height: 15, borderRadius: "50%", background: pinInput.length > index ? C.blue : C.border, transition: "background .15s ease, transform .15s ease", transform: pinInput.length === index + 1 ? "scale(1.12)" : "scale(1)" }} />
              ))}
            </div>
            <div style={{ marginTop: 14, borderRadius: 11, background: C.muted, padding: "9px 10px", fontSize: 9, lineHeight: 1.4, color: C.gray2, textAlign: "center" }}>
              Deine PIN wird aus Sicherheitsgründen nicht angezeigt.
            </div>
            <PrimaryBtn
              label={stage === "old" ? "Alte PIN bestätigen" : "Neue PIN speichern"}
              disabled={pinInput.length !== 4}
              onClick={submit}
              style={{ width: "100%", minHeight: 36, padding: "7px 10px", marginTop: 10, fontSize: 11 }}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key, index) =>
              key === "" ? (
                <span key={index} />
              ) : (
                <button
                  key={key}
                  type="button"
                  aria-label={key === "del" ? "Letzte Ziffer löschen" : key}
                  onClick={() => {
                    setError(false);
                    if (key === "del") {
                      setPinInput((current) => current.slice(0, -1));
                    } else {
                      setPinInput((current) => current.length < 4 ? current + key : current);
                    }
                  }}
                  style={{ height: 34, borderRadius: 10, border: `1px solid ${C.border}`, background: C.muted, color: C.gray1, fontSize: key === "del" ? 15 : 16, fontWeight: 750, cursor: "pointer" }}
                >
                  {key === "del" ? "⌫" : key}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightEntryDialog({
  profile,
  onSave,
  onClose,
}: {
  profile: ProfileData;
  onSave: (currentWeight: number, targetWeight?: number) => void;
  onClose: () => void;
}) {
  const [currentWeight, setCurrentWeight] = useState(
    profile.currentWeight?.toString() ?? "",
  );
  const [targetWeight, setTargetWeight] = useState(
    profile.targetWeight?.toString() ?? "",
  );
  const currentValue = Number(currentWeight);
  const targetValue = Number(targetWeight);
  const needsTarget = profile.goal !== "Gewicht halten";
  const valid =
    currentValue >= 25 &&
    currentValue <= 300 &&
    (!needsTarget || targetWeight === "" || (targetValue >= 25 && targetValue <= 300));

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 220, background: "var(--c-overlay)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 18 }}>
      <div style={{ width: 410, maxWidth: "100%", borderRadius: 22, background: C.elevated, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,.25)", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 820, color: C.gray1 }}>Gewicht aktualisieren</div>
            <div style={{ fontSize: 10, color: C.gray2, marginTop: 2 }}>Die neuen Werte werden direkt im Profil angezeigt.</div>
          </div>
          <button onClick={onClose} aria-label="Gewichtseingabe schließen" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.muted, color: C.gray1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: needsTarget ? "1fr 1fr" : "1fr", gap: 10, marginTop: 15 }}>
          <label style={{ fontSize: 10, fontWeight: 650, color: C.gray2 }}>
            Aktuelles Gewicht
            <div style={{ display: "flex", marginTop: 5 }}>
              <input type="number" inputMode="decimal" value={currentWeight} onChange={(event) => setCurrentWeight(event.target.value)} placeholder="z. B. 68" style={{ width: "100%", minWidth: 0, height: 38, padding: "7px 10px", borderRadius: "10px 0 0 10px", border: `1.5px solid ${C.border}`, borderRight: "none", background: C.input, color: C.gray1, fontFamily: "inherit", fontSize: 14, outline: "none" }} />
              <span style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRadius: "0 10px 10px 0", border: `1.5px solid ${C.border}`, borderLeft: "none", background: C.muted, color: C.gray2, fontSize: 10 }}>kg</span>
            </div>
          </label>
          {needsTarget && (
            <label style={{ fontSize: 10, fontWeight: 650, color: C.gray2 }}>
              Zielgewicht
              <div style={{ display: "flex", marginTop: 5 }}>
                <input type="number" inputMode="decimal" value={targetWeight} onChange={(event) => setTargetWeight(event.target.value)} placeholder={profile.goal === "Gewicht verlieren" ? "z. B. 62" : "z. B. 75"} style={{ width: "100%", minWidth: 0, height: 38, padding: "7px 10px", borderRadius: "10px 0 0 10px", border: `1.5px solid ${C.border}`, borderRight: "none", background: C.input, color: C.gray1, fontFamily: "inherit", fontSize: 14, outline: "none" }} />
                <span style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRadius: "0 10px 10px 0", border: `1.5px solid ${C.border}`, borderLeft: "none", background: C.muted, color: C.gray2, fontSize: 10 }}>kg</span>
              </div>
            </label>
          )}
        </div>
        {profile.goal === "Gewicht halten" && (
          <div style={{ marginTop: 9, padding: "7px 9px", borderRadius: 9, background: C.blueLt, color: C.blue, fontSize: 9, fontWeight: 650 }}>
            Dein Ziel ist „Gewicht halten“ – dein aktuelles Gewicht ist zugleich dein Orientierungswert.
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          <SecondaryBtn label="Abbrechen" onClick={onClose} style={{ minHeight: 36, padding: "7px 15px" }} />
          <PrimaryBtn
            label="Gewicht speichern"
            disabled={!valid}
            onClick={() => {
              if (!valid) return;
              onSave(currentValue, needsTarget && targetWeight !== "" ? targetValue : undefined);
              onClose();
            }}
            style={{ minHeight: 36, padding: "7px 17px" }}
          />
        </div>
      </div>
    </div>
  );
}

function EditProfileDialog({
  profile,
  onSave,
  onClose,
}: {
  profile: ProfileData;
  onSave: (profile: ProfileData) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.goal);
  const [calories, setCalories] = useState(profile.calories.toString());
  const [icon, setIcon] = useState(profile.initials);
  const [currentWeight, setCurrentWeight] = useState(
    profile.currentWeight?.toString() ?? profile.bodyData?.weight.toString() ?? "",
  );
  const [targetWeight, setTargetWeight] = useState(
    profile.targetWeight?.toString() ?? "",
  );
  const calorieValue = Number(calories);
  const currentWeightValue = Number(currentWeight);
  const targetWeightValue = Number(targetWeight);
  const currentWeightValid =
    currentWeight === "" || (currentWeightValue >= 25 && currentWeightValue <= 300);
  const targetWeightValid =
    goal === "Gewicht halten" ||
    targetWeight === "" ||
    (targetWeightValue >= 25 && targetWeightValue <= 300);
  const canSave =
    name.trim().length > 0 &&
    Number.isFinite(calorieValue) &&
    calorieValue >= 500 &&
    calorieValue <= 6000 &&
    currentWeightValid &&
    targetWeightValid;

  return (
    <div
      style={{
        position: "absolute" as const,
        inset: 0,
        zIndex: 220,
        background: "var(--c-overlay)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 14,
      }}
    >
      <div
        style={{
          width: 610,
          maxWidth: "100%",
          background: C.elevated,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          boxShadow: "0 24px 70px rgba(0,0,0,.24)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.gray1 }}>
              Profil bearbeiten
            </div>
            <div style={{ fontSize: 10, color: C.gray2, marginTop: 2 }}>
              Persönliche Angaben und Tagesziel anpassen
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Profilbearbeitung schließen"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: C.muted,
              color: C.gray1,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={icon} color={profile.color} size={52} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 750, color: C.gray1 }}>
                  Profilicon
                </div>
                <div style={{ fontSize: 9, color: C.gray2 }}>Rechts ein Icon auswählen</div>
              </div>
            </div>
            <label style={{ fontSize: 10, fontWeight: 650, color: C.gray2 }}>
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={24}
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  marginTop: 4,
                  height: 34,
                  padding: "7px 10px",
                  borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                  background: C.input,
                  color: C.gray1,
                  fontFamily: "inherit",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </label>
            <label style={{ fontSize: 10, fontWeight: 650, color: C.gray2 }}>
              Kalorienziel pro Tag
              <div style={{ display: "flex", marginTop: 4 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  value={calories}
                  onChange={(event) => setCalories(event.target.value)}
                  style={{
                    width: "100%",
                    minWidth: 0,
                    height: 34,
                    padding: "7px 10px",
                    borderRadius: "10px 0 0 10px",
                    border: `1.5px solid ${C.border}`,
                    borderRight: "none",
                    background: C.input,
                    color: C.gray1,
                    fontFamily: "inherit",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 9px",
                  borderRadius: "0 10px 10px 0",
                  border: `1.5px solid ${C.border}`,
                  borderLeft: "none",
                  background: C.muted,
                  color: C.gray2,
                  fontSize: 10,
                  fontWeight: 700,
                }}>
                  kcal
                </span>
              </div>
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 650, color: C.gray2, marginBottom: 5 }}>
                Ziel
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
                {["Gewicht verlieren", "Gewicht halten", "Muskelaufbau", "Zunehmen"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setGoal(option)}
                    style={{
                      minHeight: 38,
                      padding: "5px 4px",
                      borderRadius: 10,
                      border: `1.5px solid ${goal === option ? C.blue : C.border}`,
                      background: goal === option ? C.blueLt : C.card,
                      color: goal === option ? C.blue : C.gray1,
                      fontSize: 9,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: goal === "Gewicht halten" ? "1fr" : "1fr 1fr", gap: 6 }}>
              <label style={{ fontSize: 9, fontWeight: 650, color: C.gray2 }}>
                Aktuelles Gewicht
                <div style={{ display: "flex", marginTop: 4 }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={currentWeight}
                    onChange={(event) => setCurrentWeight(event.target.value)}
                    placeholder="z. B. 68"
                    style={{ width: "100%", minWidth: 0, height: 32, padding: "6px 8px", borderRadius: "9px 0 0 9px", border: `1px solid ${C.border}`, borderRight: "none", background: C.input, color: C.gray1, fontFamily: "inherit", fontSize: 11, outline: "none" }}
                  />
                  <span style={{ display: "flex", alignItems: "center", padding: "0 7px", borderRadius: "0 9px 9px 0", border: `1px solid ${C.border}`, borderLeft: "none", background: C.muted, color: C.gray2, fontSize: 9 }}>kg</span>
                </div>
              </label>
              {goal !== "Gewicht halten" && (
                <label style={{ fontSize: 9, fontWeight: 650, color: C.gray2 }}>
                  Zielgewicht
                  <div style={{ display: "flex", marginTop: 4 }}>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={targetWeight}
                      onChange={(event) => setTargetWeight(event.target.value)}
                      placeholder={goal === "Gewicht verlieren" ? "z. B. 62" : "z. B. 75"}
                      style={{ width: "100%", minWidth: 0, height: 32, padding: "6px 8px", borderRadius: "9px 0 0 9px", border: `1px solid ${C.border}`, borderRight: "none", background: C.input, color: C.gray1, fontFamily: "inherit", fontSize: 11, outline: "none" }}
                    />
                    <span style={{ display: "flex", alignItems: "center", padding: "0 7px", borderRadius: "0 9px 9px 0", border: `1px solid ${C.border}`, borderLeft: "none", background: C.muted, color: C.gray2, fontSize: 9 }}>kg</span>
                  </div>
                </label>
              )}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 650, color: C.gray2, marginBottom: 5 }}>
                Profilicon
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
                {PROFILE_ICONS.map((option) => (
                  <button
                    key={`${option.icon}-${option.label}`}
                    onClick={() => setIcon(option.icon)}
                    aria-label={option.label}
                    title={option.label}
                    style={{
                      height: 31,
                      borderRadius: 9,
                      border: `1.5px solid ${icon === option.icon ? C.blue : C.border}`,
                      background: icon === option.icon ? C.blueLt : C.card,
                      fontSize: 17,
                      cursor: "pointer",
                    }}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <SecondaryBtn label="Abbrechen" onClick={onClose} style={{ minHeight: 36, padding: "7px 16px" }} />
          <PrimaryBtn
            label="Änderungen speichern"
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onSave({
                ...profile,
                name: name.trim(),
                initials: icon,
                goal,
                calories: Math.round(calorieValue),
                currentWeight:
                  currentWeight === "" ? undefined : currentWeightValue,
                targetWeight:
                  goal === "Gewicht halten" || targetWeight === ""
                    ? undefined
                    : targetWeightValue,
                bodyData:
                  profile.bodyData && currentWeight !== ""
                    ? { ...profile.bodyData, weight: currentWeightValue }
                    : profile.bodyData,
              });
              onClose();
            }}
            style={{ minHeight: 36, padding: "7px 18px" }}
          />
        </div>
      </div>
    </div>
  );
}

function BasicProfileEditDialog({ profile, onSave, onClose }: { profile: ProfileData; onSave: (profile: ProfileData) => void; onClose: () => void }) {
  const [name, setName] = useState(profile.name);
  const [icon, setIcon] = useState(profile.initials);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 220, background: "var(--c-overlay)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16 }}>
      <div style={{ width: 500, maxWidth: "100%", borderRadius: 22, background: C.elevated, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,.25)", padding: 17 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 17, fontWeight: 820, color: C.gray1 }}>Profildaten bearbeiten</div><div style={{ fontSize: 10, color: C.gray2, marginTop: 2 }}>Name und Profilicon anpassen</div></div>
          <button onClick={onClose} aria-label="Profildaten schließen" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.muted, color: C.gray1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 14, marginTop: 14 }}>
          <div>
            <Avatar initials={icon} color={profile.color} size={58} />
            <label style={{ display: "block", fontSize: 10, fontWeight: 650, color: C.gray2, marginTop: 10 }}>Name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} style={{ display: "block", width: "100%", boxSizing: "border-box", height: 36, marginTop: 4, padding: "7px 10px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.input, color: C.gray1, fontFamily: "inherit", fontSize: 13, outline: "none" }} /></label>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 650, color: C.gray2, marginBottom: 5 }}>Profilicon</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4 }}>
              {PROFILE_ICONS.map((option) => <button key={`${option.icon}-${option.label}`} onClick={() => setIcon(option.icon)} aria-label={option.label} style={{ height: 32, borderRadius: 9, border: `1.5px solid ${icon === option.icon ? C.blue : C.border}`, background: icon === option.icon ? C.blueLt : C.card, fontSize: 17, cursor: "pointer" }}>{option.icon}</button>)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}><SecondaryBtn label="Abbrechen" onClick={onClose} style={{ minHeight: 36, padding: "7px 15px" }} /><PrimaryBtn label="Profildaten speichern" disabled={!name.trim()} onClick={() => { if (!name.trim()) return; onSave({ ...profile, name: name.trim(), initials: icon }); onClose(); }} style={{ minHeight: 36, padding: "7px 18px" }} /></div>
      </div>
    </div>
  );
}

function GoalsEditDialog({
  profile,
  onSave,
  onClose,
}: {
  profile: ProfileData;
  onSave: (profile: ProfileData) => void;
  onClose: () => void;
}) {
  const [goal, setGoal] = useState(profile.goal);
  const [calories, setCalories] = useState(profile.calories.toString());
  const [targetWeight, setTargetWeight] = useState(
    profile.targetWeight?.toString() ?? "",
  );
  const calorieValue = Number(calories);
  const targetValue = Number(targetWeight);
  const needsTarget = goal !== "Gewicht halten";
  const directionValid =
    !needsTarget ||
    targetWeight === "" ||
    !profile.currentWeight ||
    (goal === "Gewicht verlieren"
      ? targetValue < profile.currentWeight
      : targetValue > profile.currentWeight);
  const valid =
    calorieValue >= 500 &&
    calorieValue <= 6000 &&
    (!needsTarget ||
      (targetValue >= 25 && targetValue <= 300 && directionValid));

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 220, background: "var(--c-overlay)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 16 }}>
      <div style={{ width: 540, maxWidth: "100%", borderRadius: 22, background: C.elevated, border: `1px solid ${C.border}`, boxShadow: "0 24px 70px rgba(0,0,0,.25)", padding: 17 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 820, color: C.gray1 }}>Ziele bearbeiten</div>
            <div style={{ fontSize: 10, color: C.gray2, marginTop: 2 }}>Allgemeines Ziel, Kalorien und Zielgewicht anpassen</div>
          </div>
          <button onClick={onClose} aria-label="Zielbearbeitung schließen" style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: C.muted, color: C.gray1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ marginTop: 13 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gray2, marginBottom: 5 }}>Allgemeines Ziel</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5 }}>
            {["Gewicht verlieren", "Gewicht halten", "Muskelaufbau", "Zunehmen"].map((option) => (
              <button key={option} onClick={() => { setGoal(option); if (option === "Gewicht halten") setTargetWeight(""); }} style={{ minHeight: 38, borderRadius: 10, border: `1.5px solid ${goal === option ? C.blue : C.border}`, background: goal === option ? C.blueLt : C.card, color: goal === option ? C.blue : C.gray1, fontSize: 9, fontWeight: 750, cursor: "pointer", padding: "5px 3px" }}>{option}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: needsTarget ? "1fr 1fr" : "1fr", gap: 10, marginTop: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 650, color: C.gray2 }}>
            Kalorienziel pro Tag
            <div style={{ display: "flex", marginTop: 4 }}>
              <input type="number" inputMode="numeric" value={calories} onChange={(event) => setCalories(event.target.value)} style={{ width: "100%", minWidth: 0, height: 36, padding: "7px 10px", borderRadius: "10px 0 0 10px", border: `1.5px solid ${C.border}`, borderRight: "none", background: C.input, color: C.gray1, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
              <span style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRadius: "0 10px 10px 0", border: `1.5px solid ${C.border}`, borderLeft: "none", background: C.muted, color: C.gray2, fontSize: 9 }}>kcal</span>
            </div>
          </label>
          {needsTarget && (
            <label style={{ fontSize: 10, fontWeight: 650, color: C.gray2 }}>
              Zielgewicht
              <div style={{ display: "flex", marginTop: 4 }}>
                <input type="number" inputMode="decimal" value={targetWeight} onChange={(event) => setTargetWeight(event.target.value)} placeholder={goal === "Gewicht verlieren" ? "z. B. 62" : "z. B. 75"} style={{ width: "100%", minWidth: 0, height: 36, padding: "7px 10px", borderRadius: "10px 0 0 10px", border: `1.5px solid ${C.border}`, borderRight: "none", background: C.input, color: C.gray1, fontFamily: "inherit", fontSize: 13, outline: "none" }} />
                <span style={{ display: "flex", alignItems: "center", padding: "0 9px", borderRadius: "0 10px 10px 0", border: `1.5px solid ${C.border}`, borderLeft: "none", background: C.muted, color: C.gray2, fontSize: 9 }}>kg</span>
              </div>
            </label>
          )}
        </div>
        {!directionValid && <div style={{ fontSize: 9, color: C.red, marginTop: 6 }}>Das Zielgewicht passt nicht zur gewählten Zielrichtung.</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          <SecondaryBtn label="Abbrechen" onClick={onClose} style={{ minHeight: 36, padding: "7px 15px" }} />
          <PrimaryBtn label="Ziele speichern" disabled={!valid} onClick={() => { if (!valid) return; onSave({ ...profile, goal, calories: Math.round(calorieValue), targetWeight: needsTarget ? targetValue : undefined }); onClose(); }} style={{ minHeight: 36, padding: "7px 18px" }} />
        </div>
      </div>
    </div>
  );
}

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
        background: "var(--c-overlay)",
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

function DeleteProfileDialog({
  profile,
  onConfirm,
  onClose,
}: {
  profile: ProfileData;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute" as const,
        inset: 0,
        zIndex: 230,
        background: "var(--c-overlay)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: 390,
          maxWidth: "100%",
          borderRadius: 22,
          background: C.elevated,
          border: `1px solid ${C.border}`,
          boxShadow: "0 24px 70px rgba(0,0,0,.26)",
          padding: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            margin: "0 auto 10px",
            borderRadius: "50%",
            background: "rgba(255,59,48,.12)",
            color: C.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Trash2 className="w-5 h-5" />
        </div>
        <div style={{ fontSize: 19, fontWeight: 820, color: C.gray1 }}>
          Profil wirklich löschen?
        </div>
        <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.45, color: C.gray2 }}>
          Das Profil „{profile.name}“ und der zugehörige Verlauf werden dauerhaft entfernt.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginTop: 17 }}>
          <SecondaryBtn
            label="Abbrechen"
            onClick={onClose}
            style={{ minHeight: 40, padding: "8px 12px", fontSize: 12 }}
          />
          <button
            onClick={onConfirm}
            style={{
              minHeight: 40,
              border: "none",
              borderRadius: 13,
              background: C.red,
              color: "#fff",
              padding: "8px 12px",
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Profil löschen
          </button>
        </div>
      </div>
    </div>
  );
}

function PowerOffDialog({
  onConfirm,
  onStandby,
  onClose,
}: {
  onConfirm: () => void;
  onStandby: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute" as const,
        inset: 0,
        zIndex: 220,
        background: "var(--c-overlay)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 330,
          maxWidth: "100%",
          background: C.elevated,
          border: `1px solid ${C.border}`,
          borderRadius: 22,
          padding: 22,
          boxShadow: "0 20px 60px rgba(0,0,0,.2)",
          textAlign: "center" as const,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 12px",
            borderRadius: "50%",
            background: "rgba(239,68,68,.12)",
            color: C.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Power className="w-6 h-6" />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.gray1 }}>
          Energiemodus wählen
        </div>
        <div
          style={{
            margin: "7px 0 18px",
            fontSize: 12,
            lineHeight: 1.45,
            color: C.gray2,
          }}
        >
          Im Standby ist die Waage schnell wieder bereit. Beim Ausschalten
          gehen nicht gespeicherte Messungen verloren.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onStandby}
            style={{
              flex: 1,
              minHeight: 44,
              border: `1.5px solid ${C.blue}`,
              borderRadius: 14,
              background: C.blueLt,
              color: C.blue,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Standby
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              minHeight: 44,
              border: "none",
              borderRadius: 14,
              background: C.red,
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Ausschalten
          </button>
        </div>
        <GhostBtn
          label="Abbrechen"
          onClick={onClose}
          style={{ width: "100%", marginTop: 7 }}
        />
      </div>
    </div>
  );
}

function PoweredOffScreen({ onPowerOn }: { onPowerOn: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        background: "#050506",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <button
        onClick={onPowerOn}
        aria-label="Gerät einschalten"
        style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,.16)",
          background: "rgba(255,255,255,.07)",
          color: "rgba(255,255,255,.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Power className="w-8 h-8" />
      </button>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,.38)" }}>
        Zum Einschalten tippen
      </span>
    </div>
  );
}

// ─── Device Frame ──────────────────────────────────────────────────────────────

function DeviceFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const frameSide = "#111113";
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
          background: frameSide,
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
          background: frameSide,
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
          background: frameSide,
          borderRadius: "0 3px 3px 0",
        }}
      />
      <div
        style={{
          position: "absolute" as const,
          inset: 0,
          borderRadius: 26,
          background: "linear-gradient(145deg,#303034,#09090A)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.38), 0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.09)",
          padding: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
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
              background: "rgba(255,255,255,0.2)",
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
  const [profiles, setProfiles] = useState<ProfileData[]>(() => {
    try {
      const saved = window.localStorage.getItem("smart-scale-profiles");
      return saved ? (JSON.parse(saved) as ProfileData[]) : PROFILES;
    } catch {
      return PROFILES;
    }
  });
  const [profile, setProfile] = useState<ProfileData | null>(
    () => profiles[0] ?? null,
  );
  const [dialog, setDialog] = useState<Dialog>(null);
  const [currentFood, setCurrentFood] =
    useState<FoodItem | null>(null);
  const [demoWeight, setDemoWeight] = useState(0);
  const [guestMode, setGuestMode] =
    useState<GuestMode>("smart");
  const [guestReturnScreen, setGuestReturnScreen] = useState<
    "home" | "returning-user"
  >("returning-user");
  const [calorieGoal, setCalorieGoal] = useState(1600);
  const [historyByProfile, setHistoryByProfile] = useState<
    Record<string, HistoryItem[]>
  >(() => {
    try {
      const savedByProfile = window.localStorage.getItem(
        "smart-scale-history-by-profile",
      );
      if (savedByProfile) {
        return JSON.parse(savedByProfile) as Record<string, HistoryItem[]>;
      }
      const legacySaved = window.localStorage.getItem("smart-scale-history");
      const legacyItems = legacySaved
        ? (JSON.parse(legacySaved) as HistoryItem[])
        : HISTORY_ITEMS;
      const migratedItems = legacyItems.map((item) => ({
        ...item,
        isoDate: item.isoDate ?? historyItemDateKey(item),
      }));
      return Object.fromEntries(
        PROFILES.map((existingProfile, index) => [
          existingProfile.id,
          index === 0 ? migratedItems : HISTORY_ITEMS,
        ]),
      );
    } catch {
      return Object.fromEntries(
        PROFILES.map((existingProfile) => [existingProfile.id, HISTORY_ITEMS]),
      );
    }
  });
  const historyItems = profile ? (historyByProfile[profile.id] ?? []) : [];
  const setHistoryItems = useCallback(
    (update: (current: HistoryItem[]) => HistoryItem[]) => {
      if (!profile) return;
      setHistoryByProfile((current) => ({
        ...current,
        [profile.id]: update(current[profile.id] ?? []),
      }));
    },
    [profile],
  );
  const [weighMode, setWeighMode] = useState<WeighMode>("ki");
  const [selectedFood, setSelectedFood] =
    useState<FoodItem | null>(null);
  const [taraActive, setTaraActive] = useState(false);
  const [automaticDetection, setAutomaticDetection] =
    useState(true);
  const [tareOnStart, setTareOnStart] = useState(true);
  const [notifyCalories, setNotifyCalories] = useState(true);
  const [notifyTracking, setNotifyTracking] = useState(true);
  const [notifyGoal, setNotifyGoal] = useState(true);
  const [isFirstUse, setIsFirstUse] = useState(false);
  const [onboardingActive, setOnboardingActive] =
    useState(false);
  const [showProfileWelcome, setShowProfileWelcome] =
    useState(false);
  const [demoLowConf, setDemoLowConf] = useState(false);
  const [secondsInactive, setSecondsInactive] = useState(0);
  const [appearance, setAppearance] =
    useState<AppearanceSetting>("light");
  const activeTheme = (
    appearance === "auto" ? getAutoTheme() : appearance
  ) as "light" | "dark";
  const isDarkTheme = activeTheme === "dark";

  const STANDBY_WARNING_AT = 170; // show banner at 2 min 50 s
  const STANDBY_AT = 180; // enter standby at 3 min

  const resetTimer = useCallback(
    () => setSecondsInactive(0),
    [],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "smart-scale-history-by-profile",
        JSON.stringify(historyByProfile),
      );
    } catch {
      // The in-memory history remains available if storage is unavailable.
    }
  }, [historyByProfile]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "smart-scale-profiles",
        JSON.stringify(profiles),
      );
    } catch {
      // Profiles remain available for the current session.
    }
  }, [profiles]);

  useEffect(() => {
    if (!profile) return;
    setProfiles((current) =>
      current.map((item) => (item.id === profile.id ? profile : item)),
    );
  }, [profile]);

  // --- Virtual keyboard (global) ------------------------------------------------
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardValue, setKeyboardValue] = useState("");
  const [keyboardMode, setKeyboardMode] = useState<"text" | "numeric">(
    "text",
  );
  const [keyboardMasked, setKeyboardMasked] = useState(false);
  const [keyboardMaxLength, setKeyboardMaxLength] = useState<number | null>(
    null,
  );
  const keyboardOnInputRef = useRef<(ch: string) => void>(() => {});
  const keyboardOnBackspaceRef = useRef<() => void>(() => {});
  const keyboardOnEnterRef = useRef<() => void>(() => {});
  const keyboardOnCloseRef = useRef<() => void>(() => {});

  const openKeyboard = useCallback((opts: {
    value?: string;
    onInput: (ch: string) => void;
    onBackspace?: () => void;
    onEnter?: () => void;
    onClose?: () => void;
    mode?: "text" | "numeric";
    masked?: boolean;
    maxLength?: number;
  }) => {
    setKeyboardValue(opts.value ?? "");
    setKeyboardMode(opts.mode ?? "text");
    setKeyboardMasked(opts.masked ?? false);
    setKeyboardMaxLength(
      opts.maxLength && opts.maxLength > 0 ? opts.maxLength : null,
    );
    keyboardOnInputRef.current = opts.onInput;
    keyboardOnBackspaceRef.current = opts.onBackspace ?? (() => {});
    keyboardOnEnterRef.current = opts.onEnter ?? (() => {});
    keyboardOnCloseRef.current = opts.onClose ?? (() => {});
    setKeyboardVisible(true);
  }, []);

  const closeKeyboard = useCallback(() => {
    setKeyboardVisible(false);
    try {
      keyboardOnCloseRef.current();
    } catch (e) {
      /* ignore */
    }
  }, []);

  const handleTextFieldPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        !(
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        ) ||
        target.disabled ||
        target.readOnly
      ) {
        if (!target.closest('[data-virtual-keyboard="true"]')) {
          closeKeyboard();
        }
        return;
      }

      // A click on the browser's native number stepper still targets the
      // input itself. Keep that interaction separate from a direct click in
      // the editable text area so +/- arrows never summon the keyboard.
      if (target instanceof HTMLInputElement && target.type === "number") {
        const bounds = target.getBoundingClientRect();
        const clickedNativeStepper = event.clientX >= bounds.right - 28;
        if (clickedNativeStepper) {
          closeKeyboard();
          return;
        }
      }

      const numeric =
        target instanceof HTMLInputElement &&
        (target.type === "number" || target.inputMode === "numeric");
      const masked =
        target instanceof HTMLInputElement && target.type === "password";

      const setNativeValue = (nextValue: string, cursor: number) => {
        const prototype =
          target instanceof HTMLInputElement
            ? HTMLInputElement.prototype
            : HTMLTextAreaElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
        setter?.call(target, nextValue);
        target.dispatchEvent(new Event("input", { bubbles: true }));
        requestAnimationFrame(() => {
          target.focus();
          try {
            target.setSelectionRange(cursor, cursor);
          } catch {
            /* Number inputs do not support a text selection. */
          }
        });
      };

      openKeyboard({
        value: target.value,
        mode: numeric ? "numeric" : "text",
        masked,
        maxLength: target.maxLength,
        onInput: (character) => {
          const start = target.selectionStart ?? target.value.length;
          const end = target.selectionEnd ?? start;
          const unbounded =
            target.value.slice(0, start) +
            character +
            target.value.slice(end);
          const next =
            target.maxLength > 0
              ? unbounded.slice(0, target.maxLength)
              : unbounded;
          setNativeValue(
            next,
            Math.min(start + character.length, next.length),
          );
        },
        onBackspace: () => {
          const start = target.selectionStart ?? target.value.length;
          const end = target.selectionEnd ?? start;
          if (start === 0 && end === 0) return;
          const deleteFrom = start === end ? start - 1 : start;
          const next =
            target.value.slice(0, deleteFrom) + target.value.slice(end);
          setNativeValue(next, deleteFrom);
        },
        onEnter: () => target.blur(),
        onClose: () => target.blur(),
      });
    },
    [closeKeyboard, openKeyboard],
  );

  useEffect(() => {
    if (!keyboardVisible) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        target.closest('[data-virtual-keyboard="true"]') ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      closeKeyboard();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, [keyboardVisible, closeKeyboard]);

  useEffect(() => {
    if (
      screen === "standby" ||
      screen === "standby-logout" ||
      screen === "powered-off"
    ) return;
    const interval = setInterval(() => {
      setSecondsInactive((s) => {
        if (s + 1 >= STANDBY_AT) {
          setScreen(profile ? "standby-logout" : "standby");
          setScreenKey((k) => k + 1);
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, profile]);

  useEffect(() => {
    if (!showProfileWelcome) return;
    const timer = setTimeout(() => setShowProfileWelcome(false), 3500);
    return () => clearTimeout(timer);
  }, [showProfileWelcome]);

  const go = useCallback(
    (to: Screen, delay = 0) => {
      setKeyboardVisible(false);
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
  const closeDialog = () => {
    setDialog(null);
    closeKeyboard();
  };

  const handleFoodSelect = (food: FoodItem) => {
    if (weighMode === "manual") {
      setSelectedFood(food);
      setDialog("manual-confirm");
    } else {
      setCurrentFood(food);
      setDemoWeight(Math.round(Math.random() * 170 + 80));
      go("recognition-result");
      closeDialog();
    }
  };

  const handleScanComplete = useCallback(
    (food: FoodItem, weight: number) => {
      const f = demoLowConf
        ? { ...food, confidence: 78 }
        : food;
      setCurrentFood(f);
      setDemoWeight(weight);
      if (f.confidence < MIN_CONFIDENCE_FOR_DIRECT_RESULT) {
        go("low-confidence");
      } else {
        go("recognition-result");
      }
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
    if (mode === "smart") {
      setWeighMode("ki");
      go("food-detection");
    } else if (mode === "manual") {
      setWeighMode("manual");
      setSelectedFood(null);
      go("home");
      setTimeout(() => openDialog("food-select"), 260);
    } else {
      setWeighMode("scale-only");
      go("guest-weighing");
    }
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

  const todayTrackedCalories = historyItems
    .filter((item) => historyItemDateKey(item) === localDateKey())
    .reduce((sum, item) => sum + item.calories, 0);
  const remainingCalories = Math.max(
    0,
    calorieGoal - todayTrackedCalories,
  );

  const renderScreen = (): React.ReactNode => {
    switch (screen) {
      case "boot":
        return (
          <BootScreen
            onDone={(first) => {
              setTaraActive(tareOnStart);
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
              setProfile(null);
              setCurrentFood(null);
              setSelectedFood(null);
              setWeighMode("scale-only");
              setGuestMode("scale-only");
              setGuestReturnScreen("home");
              setOnboardingActive(false);
              go("home");
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
            profile={profile}
            onNext={() => {
              setOnboardingActive(false);
              go("home");
            }}
          />
        );
      case "returning-user":
        return (
          <ReturningUserScreen
            profiles={profiles}
            onSelectProfile={(p) => {
              setProfile(p);
              setCalorieGoal(p.calories);
              go(p.pin ? "login" : "home");
            }}
            onCreate={() => go("create-profile")}
            onGuest={() => {
              setProfile(null);
              setGuestReturnScreen("returning-user");
              openDialog("guest-mode");
            }}
          />
        );
      case "profile-selection":
        return (
          <ProfileSelectionScreen
            profiles={profiles}
            onBack={() => go(profile ? "home" : "returning-user")}
            onSelect={(p) => {
              setProfile(p);
              setCalorieGoal(p.calories);
              go(p.pin ? "login" : "home");
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
              setProfiles((current) => [
                ...current.filter((item) => item.id !== newProfile.id),
                newProfile,
              ]);
              setHistoryByProfile((current) => ({
                ...current,
                [newProfile.id]: [],
              }));
              setProfile(newProfile);
              setCalorieGoal(newProfile.calories);
              if (onboardingActive) {
                setOnboardingActive(false);
                setShowProfileWelcome(true);
                go("home");
              } else {
                go(newProfile.pin ? "login" : "home");
              }
            }}
          />
        );
      case "login":
        return (
          <LoginScreen
            profile={profile ?? profiles[0]}
            onBack={() => go("returning-user")}
            onLogin={() => go("home")}
          />
        );
      case "home":
        return (
          <HomeScreen
            profile={profile}
            showProfileWelcome={showProfileWelcome}
            onDismissProfileWelcome={() => setShowProfileWelcome(false)}
            weighMode={weighMode}
            automaticDetection={automaticDetection}
            setWeighMode={(m) => {
              setWeighMode(m);
              if (m !== "manual") setSelectedFood(null);
            }}
            selectedFood={selectedFood}
            setSelectedFood={setSelectedFood}
            taraActive={taraActive}
            setTaraActive={setTaraActive}
            onCameraScan={() => {
              setCurrentFood(null);
              go("food-detection");
            }}
            onOpenFoodSelect={() => openDialog("food-select")}
            onManualWeigh={() => {
              if (selectedFood) go("manual-weigh");
            }}
            onScaleOnly={() => {
              setGuestMode("scale-only");
              setGuestReturnScreen("home");
              go("guest-weighing");
            }}
            onHistory={() => go("history")}
            onProfile={() => go("profile-screen")}
            onSwitchProfile={() => go("profile-selection")}
            onLogout={() => {
              setProfile(null);
              setCurrentFood(null);
              setSelectedFood(null);
              go("returning-user");
            }}
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
            food={currentFood}
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
            source={weighMode === "manual" ? "manual" : "ai"}
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
          <AppTransferFlowScreen
            food={currentFood}
            onDone={() => {
              const nutrition = calcNutrition(currentFood, demoWeight);
              const time = new Date().toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              });
              setHistoryItems((items) => [
                {
                  id: `entry-${Date.now()}`,
                  name: currentFood.name,
                  emoji: currentFood.emoji,
                  weight: demoWeight,
                  calories: nutrition.calories,
                  time: `${time} Uhr`,
                  date: "Heute",
                  isoDate: localDateKey(),
                },
                ...items,
              ]);
              setCurrentFood(null);
              setSelectedFood(null);
              go("home");
            }}
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
      case "standby-logout":
        return profile ? (
          <StandbyLogoutScreen
            profile={profile}
            onDone={() => {
              setProfile(null);
              setCurrentFood(null);
              setSelectedFood(null);
              go("standby");
            }}
          />
        ) : (
          <StandbyScreen onWake={() => go("returning-user")} />
        );
      case "standby":
        return (
          <StandbyScreen onWake={() => go("returning-user")} />
        );
      case "powered-off":
        return <PoweredOffScreen onPowerOn={() => go("boot")} />;
      case "guest-weighing":
        return (
          <GuestWeighingScreen
            guestMode={guestMode}
            food={currentFood}
            weight={demoWeight || 142}
            onDone={() =>
              go(profile ? "home" : guestReturnScreen)
            }
            onNew={() =>
              go(
                guestMode === "smart"
                  ? "food-detection"
                  : "guest-weighing",
              )
            }
            onBack={() =>
              go(profile ? "home" : guestReturnScreen)
            }
            onLogin={() => {
              setProfile(null);
              go("returning-user");
            }}
          />
        );
      case "history":
        return (
          <HistoryScreen
            calorieGoal={calorieGoal}
            items={historyItems}
            onDelete={(id) =>
              setHistoryItems((current) =>
                current.filter((item) => item.id !== id),
              )
            }
            onBack={() => go("home")}
            onReweigh={(food) => {
              setCurrentFood(food);
              setSelectedFood(food);
              setWeighMode("manual");
              go("manual-weigh");
            }}
          />
        );
      case "profile-screen":
        return profile ? (
          <ProfileScreenView
            profile={profile}
            calorieGoal={profile.calories}
            historyItems={historyItems}
            onBack={() => go("home")}
            onEdit={() => openDialog("edit-profile")}
            onEditGoals={() => openDialog("edit-goals")}
            onOpenWeightEntry={() => openDialog("weight-entry")}
            onChangePin={() => openDialog("change-pin")}
            onProfileSelect={() => go("profile-selection")}
            onDelete={() => openDialog("delete-profile")}
            onLogout={() => {
              setProfile(null);
              setCurrentFood(null);
              setSelectedFood(null);
              setDialog(null);
              go("returning-user");
            }}
          />
        ) : null;
      case "settings":
        return (
          <SettingsScreen
            onBack={() => go("home")}
            appearance={appearance}
            setAppearance={setAppearance}
            automaticDetection={automaticDetection}
            setAutomaticDetection={setAutomaticDetection}
            tareOnStart={tareOnStart}
            setTareOnStart={(enabled) => {
              setTareOnStart(enabled);
              setTaraActive(enabled);
            }}
            notifyCalories={notifyCalories}
            setNotifyCalories={setNotifyCalories}
            notifyTracking={notifyTracking}
            setNotifyTracking={setNotifyTracking}
            notifyGoal={notifyGoal}
            setNotifyGoal={setNotifyGoal}
            remainingCalories={remainingCalories}
          />
        );
      default:
        return null;
    }
  };

  const showStandbyBanner =
    secondsInactive >= STANDBY_WARNING_AT &&
    screen !== "standby" &&
    screen !== "powered-off";
  const showGlobalHome =
    Boolean(profile) &&
    ![
      "boot",
      "onboarding-welcome",
      "onboarding-explain",
      "onboarding-ready",
      "returning-user",
      "profile-selection",
      "create-profile",
      "login",
      "home",
      "standby-logout",
      "standby",
      "powered-off",
    ].includes(screen);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: isDarkTheme
          ? "radial-gradient(circle at 50% 12%,#303038 0%,#151518 48%,#09090A 100%)"
          : "radial-gradient(circle at 50% 12%,#FFFFFF 0%,#F7F8FA 52%,#EEF1F5 100%)",
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
        @keyframes profileWelcomeToast {
          0% { opacity:0; transform:translate(-50%,-10px) }
          10%,88% { opacity:1; transform:translate(-50%,0) }
          100% { opacity:0; transform:translate(-50%,-6px) }
        }
        @keyframes fillBar  { from{width:0} to{width:100%} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes breathing{ 0%,100%{opacity:0.55;transform:scale(0.96)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        button { touch-action: manipulation; }
        button:focus-visible { outline: 3px solid rgba(10,132,255,.45); outline-offset: 2px; }
        .ss-nutrition-scroll { scrollbar-width: thin; scrollbar-color: rgba(110,110,115,.55) transparent; overscroll-behavior: contain; }
        .ss-nutrition-scroll::-webkit-scrollbar { width: 8px; }
        .ss-nutrition-scroll::-webkit-scrollbar-track { background: var(--c-muted); border-radius: 99px; }
        .ss-nutrition-scroll::-webkit-scrollbar-thumb { background: var(--c-gray3); border: 2px solid var(--c-muted); border-radius: 99px; }
        .ss-themed[data-theme="dark"] { color-scheme: dark; }
        .ss-themed[data-theme="dark"] input { background-color: var(--c-input); color: var(--c-gray1); border-color: var(--c-border) !important; }
        .ss-themed[data-theme="dark"] input::placeholder { color: var(--c-gray3); opacity: 1; }
        .ss-themed[data-theme="dark"] img { filter: brightness(.88) contrast(1.04); }
        .ss-horizontal-logo-light { opacity: 1; }
        .ss-horizontal-logo-dark { opacity: 0; }
        .ss-horizontal-logo-force-dark .ss-horizontal-logo-light,
        .ss-themed[data-theme="dark"] .ss-horizontal-logo-themed .ss-horizontal-logo-light { opacity: 0; }
        .ss-horizontal-logo-force-dark .ss-horizontal-logo-dark,
        .ss-themed[data-theme="dark"] .ss-horizontal-logo-themed .ss-horizontal-logo-dark { opacity: 1; }
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
          {/* Horizontal logo — adapts to the active page background */}
          <HorizontalLogo scale={0.5} light={isDarkTheme} />
        </div>
        <span
          style={{
            fontSize: 11,
            color: isDarkTheme
              ? "rgba(255,255,255,0.4)"
              : "rgba(28,28,30,0.58)",
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
              : isDarkTheme
                ? "rgba(255,255,255,0.1)"
                : C.card,
            border: isDarkTheme
              ? "1px solid rgba(255,255,255,0.2)"
              : "1px solid rgba(60,60,67,0.16)",
            borderRadius: 20,
            padding: "6px 16px",
            color: isFirstUse || isDarkTheme ? "#fff" : C.gray1,
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
              : isDarkTheme
                ? "rgba(255,255,255,0.1)"
                : C.card,
            border: isDarkTheme
              ? "1px solid rgba(255,255,255,0.2)"
              : "1px solid rgba(60,60,67,0.16)",
            borderRadius: 20,
            padding: "6px 16px",
            color: demoLowConf || isDarkTheme ? "#fff" : C.gray1,
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
            background: isDarkTheme
              ? "rgba(255,255,255,0.08)"
              : "#E8EBF0",
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
                    ? C.card
                    : "transparent",
                color:
                  appearance === a
                    ? C.gray1
                    : isDarkTheme
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(28,28,30,0.62)",
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
          onPointerDownCapture={handleTextFieldPointerDown}
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            position: "relative" as const,
            background: C.bg,
          }}
        >
          {screen !== "standby" && screen !== "powered-off" && (
            <StatusBar
              onPowerOff={() => openDialog("power-off")}
              onHome={
                showGlobalHome
                  ? () => {
                      setDialog(null);
                      setKeyboardVisible(false);
                      setCurrentFood(null);
                      setSelectedFood(null);
                      go("home");
                    }
                  : undefined
              }
            />
          )}
          <div
            key={screenKey}
            style={{
              flex: 1,
              minHeight: 0,
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
            {dialog === "manual-confirm" && selectedFood && (
              <ManualFoodConfirmDialog
                food={selectedFood}
                onConfirm={() => {
                  closeDialog();
                  go("manual-weigh");
                }}
                onChange={() => setDialog("food-select")}
                onCancel={() => {
                  setSelectedFood(null);
                  closeDialog();
                }}
              />
            )}
            {dialog === "guest-mode" && (
              <GuestModeDialog
                onSelect={handleGuestModeSelect}
                onClose={closeDialog}
              />
            )}
            {dialog === "edit-profile" && profile && (
              <BasicProfileEditDialog
                profile={{ ...profile, calories: calorieGoal }}
                onSave={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setCalorieGoal(updatedProfile.calories);
                }}
                onClose={closeDialog}
              />
            )}
            {dialog === "edit-goals" && profile && (
              <GoalsEditDialog
                profile={profile}
                onSave={(updatedProfile) => {
                  setProfile(updatedProfile);
                  setCalorieGoal(updatedProfile.calories);
                }}
                onClose={closeDialog}
              />
            )}
            {dialog === "weight-entry" && profile && (
              <WeightEntryDialog
                profile={profile}
                onSave={(currentWeight, targetWeight) => {
                  setProfile((current) =>
                    current
                      ? {
                          ...current,
                          currentWeight,
                          targetWeight:
                            current.goal === "Gewicht halten"
                              ? undefined
                              : targetWeight,
                          bodyData: current.bodyData
                            ? { ...current.bodyData, weight: currentWeight }
                            : current.bodyData,
                        }
                      : current,
                  );
                }}
                onClose={closeDialog}
              />
            )}
            {dialog === "change-pin" && profile && (
              <ChangePinDialog
                profile={profile}
                onSave={(pin) => {
                  setProfile((current) =>
                    current ? { ...current, pin } : current,
                  );
                }}
                onClose={closeDialog}
              />
            )}
            {dialog === "delete-profile" && profile && (
              <DeleteProfileDialog
                profile={profile}
                onConfirm={() => {
                  const profileId = profile.id;
                  const hasOtherProfiles = profiles.some(
                    (item) => item.id !== profileId,
                  );
                  setDialog(null);
                  setProfile(null);
                  setProfiles((current) =>
                    current.filter((item) => item.id !== profileId),
                  );
                  setHistoryByProfile((current) => {
                    const next = { ...current };
                    delete next[profileId];
                    return next;
                  });
                  setCurrentFood(null);
                  setSelectedFood(null);
                  go(hasOtherProfiles ? "returning-user" : "profile-selection");
                }}
                onClose={closeDialog}
              />
            )}
            {dialog === "calorie-goal" && (
              <CalorieGoalDialog
                current={calorieGoal}
                onSave={(v) => {
                  setCalorieGoal(v);
                  setProfile((current) =>
                    current ? { ...current, calories: v } : current,
                  );
                }}
                onClose={closeDialog}
              />
            )}
            {dialog === "power-off" && (
              <PowerOffDialog
                onClose={closeDialog}
                onStandby={() => {
                  closeDialog();
                  go(profile ? "standby-logout" : "standby");
                }}
                onConfirm={() => {
                  closeDialog();
                  setCurrentFood(null);
                  setSelectedFood(null);
                  go("powered-off");
                }}
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
                  background: "var(--c-countdown-bg)",
                  backdropFilter: "blur(12px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 16px",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--c-countdown-text)",
                  }}
                >
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

          {keyboardVisible && (
            <VirtualKeyboard
              value={keyboardValue}
              mode={keyboardMode}
              masked={keyboardMasked}
              onInput={(character) => {
                keyboardOnInputRef.current(character);
                setKeyboardValue((current) => {
                  const next = current + character;
                  return keyboardMaxLength
                    ? next.slice(0, keyboardMaxLength)
                    : next;
                });
              }}
              onBackspace={() => {
                keyboardOnBackspaceRef.current();
                setKeyboardValue((current) => current.slice(0, -1));
              }}
              onEnter={() => {
                keyboardOnEnterRef.current();
                closeKeyboard();
              }}
              onClose={closeKeyboard}
            />
          )}
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
                screen === s
                  ? C.blue
                  : isDarkTheme
                    ? "rgba(255,255,255,0.1)"
                    : "#FFFFFF",
              color:
                screen === s
                  ? "#fff"
                  : isDarkTheme
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(28,28,30,0.72)",
              border:
                screen === s
                  ? `1px solid ${C.blue}`
                  : isDarkTheme
                    ? "1px solid rgba(255,255,255,0.15)"
                    : "1px solid rgba(60,60,67,0.16)",
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
          color: isDarkTheme
            ? "rgba(255,255,255,0.25)"
            : "rgba(28,28,30,0.48)",
          textAlign: "center" as const,
        }}
      >
        Klicke auf ein Navigationskürzel oder bediene den
        Prototypen direkt im Gerät
      </div>
    </div>
  );
}
