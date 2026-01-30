"use client"

import { KEYBOARD_SHORTCUTS, BOXING_ACTIONS } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface KeyboardHelpProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function ShortcutSection({
  title,
  shortcuts,
}: {
  title: string
  shortcuts: Array<{ key: string; description: string }>
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-1">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center justify-between py-1">
            <kbd className="px-2 py-1 bg-secondary rounded text-xs font-mono text-foreground min-w-[80px] text-center">
              {shortcut.key}
            </kbd>
            <span className="text-sm text-muted-foreground flex-1 ml-4">
              {shortcut.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function KeyboardHelp({ isOpen, onOpenChange }: KeyboardHelpProps) {
  const actionShortcuts = BOXING_ACTIONS.map((action) => ({
    key: action.hotkey,
    description: action.name,
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ShortcutSection title="PLAYBACK" shortcuts={KEYBOARD_SHORTCUTS.playback} />
            <ShortcutSection title="SEGMENT EDITING" shortcuts={KEYBOARD_SHORTCUTS.segment} />
            <ShortcutSection title="NAVIGATION" shortcuts={KEYBOARD_SHORTCUTS.navigation} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">ACTION HOTKEYS</h3>
            
            {/* Straights */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-400">Straights</p>
              {actionShortcuts.slice(0, 4).map((s) => (
                <div key={s.key} className="flex items-center gap-3 py-0.5">
                  <kbd className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-xs font-mono text-blue-400 w-8 text-center">
                    {s.key}
                  </kbd>
                  <span className="text-sm text-muted-foreground">{s.description}</span>
                </div>
              ))}
            </div>

            {/* Hooks */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-green-400">Hooks</p>
              {actionShortcuts.slice(4, 8).map((s) => (
                <div key={s.key} className="flex items-center gap-3 py-0.5">
                  <kbd className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs font-mono text-green-400 w-8 text-center">
                    {s.key}
                  </kbd>
                  <span className="text-sm text-muted-foreground">{s.description}</span>
                </div>
              ))}
            </div>

            {/* Uppercuts */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-orange-400">Uppercuts</p>
              {actionShortcuts.slice(8, 10).map((s) => (
                <div key={s.key} className="flex items-center gap-3 py-0.5">
                  <kbd className="px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded text-xs font-mono text-orange-400 w-8 text-center">
                    {s.key}
                  </kbd>
                  <span className="text-sm text-muted-foreground">{s.description}</span>
                </div>
              ))}
            </div>

            {/* Other */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400">Other</p>
              {actionShortcuts.slice(10).map((s) => (
                <div key={s.key} className="flex items-center gap-3 py-0.5">
                  <kbd className="px-2 py-0.5 bg-gray-500/20 border border-gray-500/30 rounded text-xs font-mono text-gray-400 w-8 text-center">
                    {s.key}
                  </kbd>
                  <span className="text-sm text-muted-foreground">{s.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">?</kbd> to toggle this help overlay
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
