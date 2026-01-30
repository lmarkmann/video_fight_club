"use client"

import React from "react"

import { useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import { BOXING_ACTIONS, CATEGORY_COLORS, type Segment, type ActionCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut } from "lucide-react"

interface TimelineProps {
  duration: number
  currentTime: number
  segments: Segment[]
  markIn: number | null
  markOut: number | null
  zoom: number
  onTimeChange: (time: number) => void
  onZoomChange: (zoom: number) => void
  onSegmentClick: (segmentId: number) => void
}

function formatTimeShort(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function Timeline({
  duration,
  currentTime,
  segments,
  markIn,
  markOut,
  zoom,
  onTimeChange,
  onZoomChange,
  onSegmentClick,
}: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)

  const visibleDuration = duration / zoom
  const scrollOffset = Math.max(0, currentTime - visibleDuration / 2)

  const timeMarkers = useMemo(() => {
    const markers: number[] = []
    const interval = Math.max(1, Math.floor(visibleDuration / 10))
    const start = Math.floor(scrollOffset / interval) * interval
    for (let t = start; t <= Math.min(duration, scrollOffset + visibleDuration + interval); t += interval) {
      markers.push(t)
    }
    return markers
  }, [duration, visibleDuration, scrollOffset])

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return
    const rect = timelineRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    const newTime = scrollOffset + percent * visibleDuration
    onTimeChange(Math.max(0, Math.min(duration, newTime)))
  }

  const getPositionPercent = (time: number) => {
    return ((time - scrollOffset) / visibleDuration) * 100
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-card rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Timeline</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onZoomChange(Math.max(1, zoom - 0.5))}
            disabled={zoom <= 1}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono w-12 text-center">
            {zoom.toFixed(1)}x
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onZoomChange(Math.min(10, zoom + 0.5))}
            disabled={zoom >= 10}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline track */}
      <div
        ref={timelineRef}
        className="relative h-16 bg-secondary/50 rounded-md overflow-hidden cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Time markers */}
        <div className="absolute inset-x-0 top-0 h-4 border-b border-border">
          {timeMarkers.map((time) => {
            const pos = getPositionPercent(time)
            if (pos < -5 || pos > 105) return null
            return (
              <div
                key={time}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
              >
                <span className="text-[10px] text-muted-foreground font-mono">
                  {formatTimeShort(time)}
                </span>
                <div className="w-px h-2 bg-border" />
              </div>
            )
          })}
        </div>

        {/* Segment blocks */}
        <div className="absolute inset-x-0 top-5 bottom-1">
          {segments.map((segment) => {
            const action = BOXING_ACTIONS.find((a) => a.id === segment.actionId)
            if (!action) return null

            const startPos = getPositionPercent(segment.startTime)
            const endPos = getPositionPercent(segment.endTime)
            const width = endPos - startPos

            if (endPos < 0 || startPos > 100) return null

            return (
              <button
                key={segment.id}
                onClick={(e) => {
                  e.stopPropagation()
                  onSegmentClick(segment.id)
                }}
                className={cn(
                  "absolute top-1 bottom-1 rounded text-[10px] font-mono text-white px-1 truncate transition-opacity hover:opacity-80",
                  "flex items-center justify-center"
                )}
                style={{
                  left: `${Math.max(0, startPos)}%`,
                  width: `${Math.min(100 - startPos, width)}%`,
                  backgroundColor: CATEGORY_COLORS[action.category as ActionCategory],
                }}
                title={`${action.name} (${formatTimeShort(segment.startTime)} - ${formatTimeShort(segment.endTime)})`}
              >
                {width > 5 && action.shortName}
              </button>
            )
          })}
        </div>

        {/* Mark in/out selection */}
        {markIn !== null && (
          <div
            className="absolute top-5 bottom-1 bg-accent/30 border-l-2 border-accent"
            style={{
              left: `${getPositionPercent(markIn)}%`,
              width: markOut !== null 
                ? `${getPositionPercent(markOut) - getPositionPercent(markIn)}%` 
                : "2px",
            }}
          >
            {/* In marker handle */}
            <div className="absolute -left-1.5 top-0 w-3 h-full flex flex-col items-center">
              <div className="w-3 h-3 bg-accent rounded-full border-2 border-accent-foreground" />
              <div className="text-[9px] font-mono text-accent mt-0.5">IN</div>
            </div>
          </div>
        )}

        {markOut !== null && markIn !== null && (
          <div
            className="absolute top-5 bottom-1"
            style={{ left: `${getPositionPercent(markOut)}%` }}
          >
            {/* Out marker handle */}
            <div className="absolute -left-1.5 top-0 w-3 h-full flex flex-col items-center">
              <div className="w-3 h-3 bg-accent rounded-full border-2 border-accent-foreground" />
              <div className="text-[9px] font-mono text-accent mt-0.5">OUT</div>
            </div>
          </div>
        )}

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${getPositionPercent(currentTime)}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-red-500" />
        </div>
      </div>

      {/* Mark in/out buttons */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Mark In:</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">[</kbd>
          <span className="text-foreground font-mono">
            {markIn !== null ? formatTimeShort(markIn) : "--:--"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Mark Out:</span>
          <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">]</kbd>
          <span className="text-foreground font-mono">
            {markOut !== null ? formatTimeShort(markOut) : "--:--"}
          </span>
        </div>
        {markIn !== null && markOut !== null && (
          <span className="text-muted-foreground ml-auto">
            Duration: <span className="text-foreground font-mono">{(markOut - markIn).toFixed(2)}s</span>
          </span>
        )}
      </div>
    </div>
  )
}
