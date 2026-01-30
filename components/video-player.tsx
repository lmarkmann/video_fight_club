"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface VideoPlayerProps {
  currentTime: number
  duration: number
  isPlaying: boolean
  currentFrame: number
  totalFrames: number
  fps: number
  showSkeleton: boolean
  onTimeChange: (time: number) => void
  onPlayPause: () => void
  onFrameStep: (direction: "forward" | "backward") => void
  onJumpSeconds: (seconds: number) => void
  onPlaybackSpeedChange: (speed: number) => void
  onToggleSkeleton: (show: boolean) => void
  playbackSpeed: number
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
}

// Pose skeleton component
function PoseSkeleton() {
  // 17-point pose skeleton for boxing (simplified visualization)
  const points = {
    nose: { x: 200, y: 60 },
    leftEye: { x: 190, y: 55 },
    rightEye: { x: 210, y: 55 },
    leftEar: { x: 180, y: 60 },
    rightEar: { x: 220, y: 60 },
    leftShoulder: { x: 160, y: 100 },
    rightShoulder: { x: 240, y: 100 },
    leftElbow: { x: 130, y: 140 },
    rightElbow: { x: 270, y: 140 },
    leftWrist: { x: 110, y: 180 },
    rightWrist: { x: 290, y: 180 },
    leftHip: { x: 175, y: 180 },
    rightHip: { x: 225, y: 180 },
    leftKnee: { x: 170, y: 240 },
    rightKnee: { x: 230, y: 240 },
    leftAnkle: { x: 165, y: 300 },
    rightAnkle: { x: 235, y: 300 },
  }

  const connections = [
    ["nose", "leftEye"],
    ["nose", "rightEye"],
    ["leftEye", "leftEar"],
    ["rightEye", "rightEar"],
    ["leftShoulder", "rightShoulder"],
    ["leftShoulder", "leftElbow"],
    ["leftElbow", "leftWrist"],
    ["rightShoulder", "rightElbow"],
    ["rightElbow", "rightWrist"],
    ["leftShoulder", "leftHip"],
    ["rightShoulder", "rightHip"],
    ["leftHip", "rightHip"],
    ["leftHip", "leftKnee"],
    ["leftKnee", "leftAnkle"],
    ["rightHip", "rightKnee"],
    ["rightKnee", "rightAnkle"],
  ]

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 340"
      preserveAspectRatio="xMidYMid meet"
    >
      {connections.map(([from, to], i) => (
        <line
          key={i}
          x1={points[from as keyof typeof points].x}
          y1={points[from as keyof typeof points].y}
          x2={points[to as keyof typeof points].x}
          y2={points[to as keyof typeof points].y}
          stroke="#06B6D4"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      {Object.values(points).map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="5" fill="#06B6D4" />
      ))}
    </svg>
  )
}

export function VideoPlayer({
  currentTime,
  duration,
  isPlaying,
  currentFrame,
  totalFrames,
  fps,
  showSkeleton,
  onTimeChange,
  onPlayPause,
  onFrameStep,
  onJumpSeconds,
  onPlaybackSpeedChange,
  onToggleSkeleton,
  playbackSpeed,
}: VideoPlayerProps) {
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Video Display Area */}
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden min-h-[300px]">
        {/* Placeholder for video - in real app would be <video> element */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center text-muted-foreground">
            <div className="text-6xl font-mono mb-2 text-foreground/80">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm">Video playback area</div>
          </div>
        </div>

        {/* Pose Skeleton Overlay */}
        {showSkeleton && <PoseSkeleton />}

        {/* Frame counter overlay */}
        <div className="absolute top-3 left-3 bg-black/60 px-3 py-1.5 rounded text-xs font-mono text-foreground">
          Frame {currentFrame.toLocaleString()} / {totalFrames.toLocaleString()}
        </div>

        {/* FPS indicator */}
        <div className="absolute top-3 right-3 bg-black/60 px-3 py-1.5 rounded text-xs font-mono text-foreground">
          {fps} FPS
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 bg-card rounded-lg p-4">
        {/* Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted-foreground w-20">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[progressPercent]}
            max={100}
            step={0.1}
            onValueChange={([value]) =>
              onTimeChange((value / 100) * duration)
            }
            className="flex-1"
          />
          <span className="text-xs font-mono text-muted-foreground w-20 text-right">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Jump backward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onJumpSeconds(-1)}
              title="Jump back 1 second (Shift+←)"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {/* Frame backward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFrameStep("backward")}
              title="Previous frame (←)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Play/Pause */}
            <Button
              variant="default"
              size="icon"
              onClick={onPlayPause}
              className="h-10 w-10"
              title="Play/Pause (Space)"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Frame forward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFrameStep("forward")}
              title="Next frame (→)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Jump forward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onJumpSeconds(1)}
              title="Jump forward 1 second (Shift+→)"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-6">
            {/* Playback Speed */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Speed</Label>
              <Select
                value={playbackSpeed.toString()}
                onValueChange={(v) => onPlaybackSpeedChange(parseFloat(v))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Skeleton Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="skeleton-toggle"
                checked={showSkeleton}
                onCheckedChange={onToggleSkeleton}
              />
              <Label
                htmlFor="skeleton-toggle"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Pose Overlay
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
