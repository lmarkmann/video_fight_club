"use client"

import { cn } from "@/lib/utils"
import { BOXING_ACTIONS, type BoxingAction, type ActionCategory } from "@/lib/types"

interface ActionPanelProps {
  selectedActionId: number | null
  onSelectAction: (actionId: number) => void
  lastPressedKey: string | null
}

const categoryConfig: Record<
  ActionCategory,
  { label: string; bgClass: string; borderClass: string; activeClass: string }
> = {
  straight: {
    label: "STRAIGHTS",
    bgClass: "bg-blue-500/10 hover:bg-blue-500/20",
    borderClass: "border-blue-500/30",
    activeClass: "bg-blue-500 text-white border-blue-400",
  },
  hook: {
    label: "HOOKS",
    bgClass: "bg-green-500/10 hover:bg-green-500/20",
    borderClass: "border-green-500/30",
    activeClass: "bg-green-500 text-white border-green-400",
  },
  uppercut: {
    label: "UPPERCUTS",
    bgClass: "bg-orange-500/10 hover:bg-orange-500/20",
    borderClass: "border-orange-500/30",
    activeClass: "bg-orange-500 text-white border-orange-400",
  },
  other: {
    label: "OTHER",
    bgClass: "bg-gray-500/10 hover:bg-gray-500/20",
    borderClass: "border-gray-500/30",
    activeClass: "bg-gray-500 text-white border-gray-400",
  },
}

function ActionButton({
  action,
  isSelected,
  isKeyPressed,
  onClick,
}: {
  action: BoxingAction
  isSelected: boolean
  isKeyPressed: boolean
  onClick: () => void
}) {
  const config = categoryConfig[action.category]

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-md border transition-all text-sm text-left",
        isSelected ? config.activeClass : `${config.bgClass} ${config.borderClass}`,
        isKeyPressed && "ring-2 ring-accent ring-offset-2 ring-offset-card scale-95"
      )}
    >
      {/* Hotkey badge */}
      <span
        className={cn(
          "inline-flex items-center justify-center w-6 h-6 rounded text-xs font-mono font-bold shrink-0",
          isSelected
            ? "bg-white/20 text-white"
            : "bg-secondary text-foreground"
        )}
      >
        {action.hotkey}
      </span>
      <span className="truncate">{action.name}</span>
    </button>
  )
}

function CategoryGroup({
  category,
  actions,
  selectedActionId,
  lastPressedKey,
  onSelectAction,
}: {
  category: ActionCategory
  actions: BoxingAction[]
  selectedActionId: number | null
  lastPressedKey: string | null
  onSelectAction: (actionId: number) => void
}) {
  const config = categoryConfig[category]

  return (
    <div className="space-y-2">
      <h3
        className={cn(
          "text-xs font-semibold tracking-wider px-1",
          category === "straight" && "text-blue-400",
          category === "hook" && "text-green-400",
          category === "uppercut" && "text-orange-400",
          category === "other" && "text-gray-400"
        )}
      >
        {config.label}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            isSelected={selectedActionId === action.id}
            isKeyPressed={lastPressedKey?.toUpperCase() === action.hotkey.toUpperCase()}
            onClick={() => onSelectAction(action.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function ActionPanel({
  selectedActionId,
  onSelectAction,
  lastPressedKey,
}: ActionPanelProps) {
  const straights = BOXING_ACTIONS.filter((a) => a.category === "straight")
  const hooks = BOXING_ACTIONS.filter((a) => a.category === "hook")
  const uppercuts = BOXING_ACTIONS.filter((a) => a.category === "uppercut")
  const others = BOXING_ACTIONS.filter((a) => a.category === "other")

  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-lg h-full overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Actions</h2>
        {selectedActionId !== null && (
          <span className="text-xs text-muted-foreground">
            Selected: {BOXING_ACTIONS.find((a) => a.id === selectedActionId)?.shortName}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <CategoryGroup
          category="straight"
          actions={straights}
          selectedActionId={selectedActionId}
          lastPressedKey={lastPressedKey}
          onSelectAction={onSelectAction}
        />

        <CategoryGroup
          category="hook"
          actions={hooks}
          selectedActionId={selectedActionId}
          lastPressedKey={lastPressedKey}
          onSelectAction={onSelectAction}
        />

        <CategoryGroup
          category="uppercut"
          actions={uppercuts}
          selectedActionId={selectedActionId}
          lastPressedKey={lastPressedKey}
          onSelectAction={onSelectAction}
        />

        <CategoryGroup
          category="other"
          actions={others}
          selectedActionId={selectedActionId}
          lastPressedKey={lastPressedKey}
          onSelectAction={onSelectAction}
        />
      </div>

      {/* Hint */}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Press hotkey or click to select action, then mark segment with{" "}
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">[</kbd> and{" "}
          <kbd className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono">]</kbd>
        </p>
      </div>
    </div>
  )
}
