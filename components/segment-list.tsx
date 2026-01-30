"use client"

import { cn } from "@/lib/utils"
import { BOXING_ACTIONS, CATEGORY_COLORS, type Segment, type ActionCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2 } from "lucide-react"

interface SegmentListProps {
  segments: Segment[]
  sortBy: "time" | "action"
  filterCategory: ActionCategory | "all"
  onSortChange: (sort: "time" | "action") => void
  onFilterChange: (filter: ActionCategory | "all") => void
  onEditSegment: (segmentId: number) => void
  onDeleteSegment: (segmentId: number) => void
}

function formatTimeRange(start: number, end: number): string {
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    const ms = Math.floor((s % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  }
  return `${formatTime(start)} → ${formatTime(end)}`
}

export function SegmentList({
  segments,
  sortBy,
  filterCategory,
  onSortChange,
  onFilterChange,
  onEditSegment,
  onDeleteSegment,
}: SegmentListProps) {
  const filteredSegments = segments.filter((segment) => {
    if (filterCategory === "all") return true
    const action = BOXING_ACTIONS.find((a) => a.id === segment.actionId)
    return action?.category === filterCategory
  })

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    if (sortBy === "time") {
      return a.startTime - b.startTime
    }
    return a.actionId - b.actionId
  })

  return (
    <div className="flex flex-col h-full bg-card rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Segments</h3>
        <span className="text-xs text-muted-foreground">
          {filteredSegments.length} of {segments.length}
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as "time" | "action")}>
          <SelectTrigger className="h-8 w-24 text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="time">By Time</SelectItem>
            <SelectItem value="action">By Action</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filterCategory}
          onValueChange={(v) => onFilterChange(v as ActionCategory | "all")}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="straight">Straights</SelectItem>
            <SelectItem value="hook">Hooks</SelectItem>
            <SelectItem value="uppercut">Uppercuts</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Segment List */}
      <ScrollArea className="flex-1">
        {sortedSegments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <p className="text-sm text-muted-foreground">No segments yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Mark your first segment using [ and ] keys
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sortedSegments.map((segment, index) => {
              const action = BOXING_ACTIONS.find((a) => a.id === segment.actionId)
              if (!action) return null

              const duration = segment.endTime - segment.startTime

              return (
                <div
                  key={segment.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 group"
                >
                  {/* Index */}
                  <span className="text-xs text-muted-foreground w-6 shrink-0 font-mono">
                    #{index + 1}
                  </span>

                  {/* Category color indicator */}
                  <div
                    className="w-1 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[action.category as ActionCategory] }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {action.name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-mono",
                          action.category === "straight" && "bg-blue-500/20 text-blue-400",
                          action.category === "hook" && "bg-green-500/20 text-green-400",
                          action.category === "uppercut" && "bg-orange-500/20 text-orange-400",
                          action.category === "other" && "bg-gray-500/20 text-gray-400"
                        )}
                      >
                        {action.shortName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <span>{formatTimeRange(segment.startTime, segment.endTime)}</span>
                      <span className="text-foreground/50">|</span>
                      <span>{duration.toFixed(2)}s</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditSegment(segment.id)}
                      title="Jump to segment"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDeleteSegment(segment.id)}
                      title="Delete segment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>

      {/* Summary */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {segments.length} segments labeled
        </p>
      </div>
    </div>
  )
}
