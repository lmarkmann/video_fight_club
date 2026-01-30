export type ActionCategory = "straight" | "hook" | "uppercut" | "other"

export interface BoxingAction {
  id: number
  name: string
  shortName: string
  hotkey: string
  category: ActionCategory
}

export const BOXING_ACTIONS: BoxingAction[] = [
  { id: 0, name: "Jab to Head", shortName: "JAB-H", hotkey: "1", category: "straight" },
  { id: 1, name: "Jab to Body", shortName: "JAB-B", hotkey: "2", category: "straight" },
  { id: 2, name: "Cross to Head", shortName: "CROSS-H", hotkey: "3", category: "straight" },
  { id: 3, name: "Cross to Body", shortName: "CROSS-B", hotkey: "4", category: "straight" },
  { id: 4, name: "Lead Hook to Head", shortName: "L-HOOK-H", hotkey: "5", category: "hook" },
  { id: 5, name: "Lead Hook to Body", shortName: "L-HOOK-B", hotkey: "6", category: "hook" },
  { id: 6, name: "Rear Hook to Head", shortName: "R-HOOK-H", hotkey: "7", category: "hook" },
  { id: 7, name: "Rear Hook to Body", shortName: "R-HOOK-B", hotkey: "8", category: "hook" },
  { id: 8, name: "Lead Uppercut", shortName: "L-UPPER", hotkey: "9", category: "uppercut" },
  { id: 9, name: "Rear Uppercut", shortName: "R-UPPER", hotkey: "0", category: "uppercut" },
  { id: 10, name: "Overhand", shortName: "OVER", hotkey: "O", category: "other" },
  { id: 11, name: "Defensive Movement", shortName: "DEF", hotkey: "D", category: "other" },
  { id: 12, name: "Idle / Stance", shortName: "IDLE", hotkey: "I", category: "other" },
]

export interface Segment {
  id: number
  actionId: number
  startTime: number
  endTime: number
  startFrame: number
  endFrame: number
}

export interface VideoFile {
  id: string
  filename: string
  duration: number
  resolution: string
  fps: number
  bitrate: number
  status: "not_started" | "in_progress" | "complete"
  segmentsLabeled: number
  estimatedSegments: number
  thumbnail?: string
}

export interface QualityMetrics {
  fps: { value: number; required: number; passed: boolean }
  resolution: { value: string; required: string; passed: boolean }
  bitrate: { value: number; required: number; passed: boolean }
  duration: { value: number; required: number; passed: boolean }
  codec: string
}

export const CATEGORY_COLORS: Record<ActionCategory, string> = {
  straight: "#3B82F6",
  hook: "#22C55E",
  uppercut: "#F97316",
  other: "#6B7280",
}

export const KEYBOARD_SHORTCUTS = {
  playback: [
    { key: "Space", description: "Play / Pause" },
    { key: "←", description: "Previous frame" },
    { key: "→", description: "Next frame" },
    { key: "Shift+←", description: "Back 1 second" },
    { key: "Shift+→", description: "Forward 1 second" },
  ],
  segment: [
    { key: "[", description: "Mark segment start (In point)" },
    { key: "]", description: "Mark segment end (Out point)" },
    { key: "Enter", description: "Confirm segment with selected action" },
    { key: "Backspace", description: "Delete current segment" },
    { key: "Escape", description: "Cancel current selection" },
  ],
  navigation: [
    { key: "N", description: "Next video in queue" },
    { key: "P", description: "Previous video in queue" },
    { key: "?", description: "Show/hide this help" },
  ],
}
