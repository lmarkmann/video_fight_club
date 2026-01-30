"use client"

import { useCallback, useEffect, useState } from "react"
import { VideoPlayer } from "@/components/video-player"
import { ActionPanel } from "@/components/action-panel"
import { Timeline } from "@/components/timeline"
import { SegmentList } from "@/components/segment-list"
import { VideoQueue } from "@/components/video-queue"
import { QualityPanel } from "@/components/quality-panel"
import { KeyboardHelp } from "@/components/keyboard-help"
import { ExportPreview } from "@/components/export-preview"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BOXING_ACTIONS, type Segment, type VideoFile, type QualityMetrics, type ActionCategory } from "@/lib/types"
import { Save, HelpCircle, SkipForward, SkipBack, Monitor } from "lucide-react"
import { Toaster, toast } from "sonner"

// Sample data
const SAMPLE_VIDEOS: VideoFile[] = [
  {
    id: "1",
    filename: "fight_001.mp4",
    duration: 125,
    resolution: "1920x1080",
    fps: 30,
    bitrate: 2500,
    status: "in_progress",
    segmentsLabeled: 12,
    estimatedSegments: 30,
  },
  {
    id: "2",
    filename: "fight_002.mp4",
    duration: 95,
    resolution: "1280x720",
    fps: 24,
    bitrate: 1500,
    status: "not_started",
    segmentsLabeled: 0,
    estimatedSegments: 25,
  },
  {
    id: "3",
    filename: "fight_003.mp4",
    duration: 180,
    resolution: "1920x1080",
    fps: 60,
    bitrate: 4000,
    status: "complete",
    segmentsLabeled: 45,
    estimatedSegments: 45,
  },
]

const SAMPLE_SEGMENTS: Segment[] = [
  { id: 1, actionId: 0, startTime: 5.2, endTime: 5.8, startFrame: 156, endFrame: 174 },
  { id: 2, actionId: 2, startTime: 12.5, endTime: 13.2, startFrame: 375, endFrame: 396 },
  { id: 3, actionId: 4, startTime: 18.1, endTime: 18.9, startFrame: 543, endFrame: 567 },
  { id: 4, actionId: 8, startTime: 25.3, endTime: 26.0, startFrame: 759, endFrame: 780 },
  { id: 5, actionId: 11, startTime: 32.0, endTime: 34.5, startFrame: 960, endFrame: 1035 },
]

export default function LabelingInterface() {
  // Video state
  const [currentVideoId, setCurrentVideoId] = useState<string>("1")
  const [currentTime, setCurrentTime] = useState(12.5)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSkeleton, setShowSkeleton] = useState(true)

  // Get current video info
  const currentVideo = SAMPLE_VIDEOS.find((v) => v.id === currentVideoId) || SAMPLE_VIDEOS[0]
  const duration = currentVideo.duration
  const fps = currentVideo.fps
  const currentFrame = Math.round(currentTime * fps)
  const totalFrames = Math.round(duration * fps)

  // Segments and labeling state
  const [segments, setSegments] = useState<Segment[]>(SAMPLE_SEGMENTS)
  const [selectedActionId, setSelectedActionId] = useState<number | null>(null)
  const [markIn, setMarkIn] = useState<number | null>(null)
  const [markOut, setMarkOut] = useState<number | null>(null)

  // UI state
  const [zoom, setZoom] = useState(1)
  const [sortBy, setSortBy] = useState<"time" | "action">("time")
  const [filterCategory, setFilterCategory] = useState<ActionCategory | "all">("all")
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Quality metrics
  const qualityMetrics: QualityMetrics = {
    fps: { value: currentVideo.fps, required: 24, passed: currentVideo.fps >= 24 },
    resolution: {
      value: currentVideo.resolution,
      required: "640x480",
      passed: true,
    },
    bitrate: { value: currentVideo.bitrate, required: 1000, passed: currentVideo.bitrate >= 1000 },
    duration: { value: currentVideo.duration, required: 30, passed: currentVideo.duration >= 30 },
    codec: "h264",
  }

  // Playback simulation
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        const next = t + (0.033 * playbackSpeed)
        if (next >= duration) {
          setIsPlaying(false)
          return duration
        }
        return next
      })
    }, 33)
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed, duration])

  // Clear last pressed key after animation
  useEffect(() => {
    if (lastPressedKey) {
      const timeout = setTimeout(() => setLastPressedKey(null), 150)
      return () => clearTimeout(timeout)
    }
  }, [lastPressedKey])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const key = e.key.toLowerCase()
      setLastPressedKey(key)

      // Playback controls
      if (key === " ") {
        e.preventDefault()
        setIsPlaying((p) => !p)
        return
      }

      if (key === "arrowleft") {
        e.preventDefault()
        if (e.shiftKey) {
          setCurrentTime((t) => Math.max(0, t - 1))
        } else {
          setCurrentTime((t) => Math.max(0, t - 1 / fps))
        }
        return
      }

      if (key === "arrowright") {
        e.preventDefault()
        if (e.shiftKey) {
          setCurrentTime((t) => Math.min(duration, t + 1))
        } else {
          setCurrentTime((t) => Math.min(duration, t + 1 / fps))
        }
        return
      }

      // Segment marking
      if (key === "[") {
        e.preventDefault()
        setMarkIn(currentTime)
        toast.success("Mark In set", { description: `At ${currentTime.toFixed(2)}s` })
        return
      }

      if (key === "]") {
        e.preventDefault()
        if (markIn !== null && currentTime > markIn) {
          setMarkOut(currentTime)
          toast.success("Mark Out set", { description: `At ${currentTime.toFixed(2)}s` })
        } else {
          toast.error("Invalid mark out", { description: "Mark out must be after mark in" })
        }
        return
      }

      if (key === "enter") {
        e.preventDefault()
        if (markIn !== null && markOut !== null && selectedActionId !== null) {
          const minFrames = 5
          const minDuration = minFrames / fps
          if (markOut - markIn < minDuration) {
            toast.error("Segment too short", { description: `Minimum ${minFrames} frames required` })
            return
          }

          const newSegment: Segment = {
            id: Date.now(),
            actionId: selectedActionId,
            startTime: markIn,
            endTime: markOut,
            startFrame: Math.round(markIn * fps),
            endFrame: Math.round(markOut * fps),
          }
          setSegments((s) => [...s, newSegment])
          setMarkIn(null)
          setMarkOut(null)
          const action = BOXING_ACTIONS.find((a) => a.id === selectedActionId)
          toast.success("Segment saved", { description: action?.name })
        } else {
          toast.error("Cannot save", { description: "Mark in, out, and select an action first" })
        }
        return
      }

      if (key === "backspace" || key === "delete") {
        e.preventDefault()
        setMarkIn(null)
        setMarkOut(null)
        toast.info("Selection cleared")
        return
      }

      if (key === "escape") {
        e.preventDefault()
        setMarkIn(null)
        setMarkOut(null)
        setSelectedActionId(null)
        return
      }

      // Navigation
      if (key === "n") {
        e.preventDefault()
        const currentIndex = SAMPLE_VIDEOS.findIndex((v) => v.id === currentVideoId)
        if (currentIndex < SAMPLE_VIDEOS.length - 1) {
          loadVideo(SAMPLE_VIDEOS[currentIndex + 1].id)
        }
        return
      }

      if (key === "p") {
        e.preventDefault()
        const currentIndex = SAMPLE_VIDEOS.findIndex((v) => v.id === currentVideoId)
        if (currentIndex > 0) {
          loadVideo(SAMPLE_VIDEOS[currentIndex - 1].id)
        }
        return
      }

      if (key === "?") {
        e.preventDefault()
        setShowKeyboardHelp((s) => !s)
        return
      }

      // Action hotkeys
      const actionKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "o", "d", "i"]
      if (actionKeys.includes(key)) {
        e.preventDefault()
        const action = BOXING_ACTIONS.find(
          (a) => a.hotkey.toLowerCase() === key
        )
        if (action) {
          setSelectedActionId(action.id)
        }
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentTime, markIn, markOut, selectedActionId, fps, duration, currentVideoId])

  const loadVideo = useCallback((videoId: string) => {
    setIsLoading(true)
    setLoadingProgress(0)
    setCurrentVideoId(videoId)
    setCurrentTime(0)
    setMarkIn(null)
    setMarkOut(null)

    // Simulate loading
    const interval = setInterval(() => {
      setLoadingProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          return 100
        }
        return p + 10
      })
    }, 100)
  }, [])

  const handleSave = useCallback(() => {
    toast.success("Progress saved", { description: `${segments.length} segments` })
  }, [segments.length])

  const handleDeleteSegment = useCallback((segmentId: number) => {
    setSegments((s) => s.filter((seg) => seg.id !== segmentId))
    toast.info("Segment deleted")
  }, [])

  const handleEditSegment = useCallback((segmentId: number) => {
    const segment = segments.find((s) => s.id === segmentId)
    if (segment) {
      setCurrentTime(segment.startTime)
      setMarkIn(segment.startTime)
      setMarkOut(segment.endTime)
      setSelectedActionId(segment.actionId)
    }
  }, [segments])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 w-80">
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Loading video...</h2>
          <Progress value={loadingProgress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Extracting pose data... ({loadingProgress}%)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster richColors position="bottom-right" />

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground">Fight Club</h1>
          <span className="text-sm text-muted-foreground font-mono">
            {currentVideo.filename}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <QualityPanel metrics={qualityMetrics} />

          <VideoQueue
            videos={SAMPLE_VIDEOS}
            currentVideoId={currentVideoId}
            onSelectVideo={loadVideo}
            isOpen={showQueue}
            onOpenChange={setShowQueue}
          />

          <ExportPreview
            videoFile={currentVideo.filename}
            segments={segments}
            fps={fps}
          />

          <Button variant="ghost" size="icon" onClick={() => setShowKeyboardHelp(true)} title="Keyboard shortcuts (?)">
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button variant="default" size="sm" className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-[1fr_320px] gap-4 p-4 overflow-hidden">
        {/* Left Column - Video + Timeline */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-0">
            <VideoPlayer
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              currentFrame={currentFrame}
              totalFrames={totalFrames}
              fps={fps}
              showSkeleton={showSkeleton}
              onTimeChange={setCurrentTime}
              onPlayPause={() => setIsPlaying((p) => !p)}
              onFrameStep={(dir) =>
                setCurrentTime((t) =>
                  dir === "forward"
                    ? Math.min(duration, t + 1 / fps)
                    : Math.max(0, t - 1 / fps)
                )
              }
              onJumpSeconds={(s) =>
                setCurrentTime((t) => Math.max(0, Math.min(duration, t + s)))
              }
              onPlaybackSpeedChange={setPlaybackSpeed}
              onToggleSkeleton={setShowSkeleton}
              playbackSpeed={playbackSpeed}
            />
          </div>

          <Timeline
            duration={duration}
            currentTime={currentTime}
            segments={segments}
            markIn={markIn}
            markOut={markOut}
            zoom={zoom}
            onTimeChange={setCurrentTime}
            onZoomChange={setZoom}
            onSegmentClick={handleEditSegment}
          />
        </div>

        {/* Right Column - Actions + Segments */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <ActionPanel
              selectedActionId={selectedActionId}
              onSelectAction={setSelectedActionId}
              lastPressedKey={lastPressedKey}
            />
          </div>

          <div className="h-64">
            <SegmentList
              segments={segments}
              sortBy={sortBy}
              filterCategory={filterCategory}
              onSortChange={setSortBy}
              onFilterChange={setFilterCategory}
              onEditSegment={handleEditSegment}
              onDeleteSegment={handleDeleteSegment}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-4 py-2 border-t border-border bg-card text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-secondary rounded font-mono">?</kbd> for shortcuts
          </span>
          <span className="text-foreground/50">|</span>
          <button
            onClick={() => {
              const currentIndex = SAMPLE_VIDEOS.findIndex((v) => v.id === currentVideoId)
              if (currentIndex > 0) loadVideo(SAMPLE_VIDEOS[currentIndex - 1].id)
            }}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <SkipBack className="h-3 w-3" />
            <kbd className="px-1 py-0.5 bg-secondary rounded font-mono">P</kbd> Prev
          </button>
          <button
            onClick={() => {
              const currentIndex = SAMPLE_VIDEOS.findIndex((v) => v.id === currentVideoId)
              if (currentIndex < SAMPLE_VIDEOS.length - 1) loadVideo(SAMPLE_VIDEOS[currentIndex + 1].id)
            }}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <kbd className="px-1 py-0.5 bg-secondary rounded font-mono">N</kbd> Next
            <SkipForward className="h-3 w-3" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span>
            {segments.length} segments labeled
          </span>
          <span className="text-foreground/50">|</span>
          <span className="text-green-400">Auto-save: ON</span>
        </div>
      </footer>

      {/* Keyboard Help Modal */}
      <KeyboardHelp isOpen={showKeyboardHelp} onOpenChange={setShowKeyboardHelp} />
    </div>
  )
}
