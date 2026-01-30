"use client"

import { cn } from "@/lib/utils"
import type { VideoFile } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle, PlayCircle, List, X } from "lucide-react"

interface VideoQueueProps {
  videos: VideoFile[]
  currentVideoId: string | null
  onSelectVideo: (videoId: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function StatusBadge({ status, segmentsLabeled, estimatedSegments }: { 
  status: VideoFile["status"]
  segmentsLabeled: number
  estimatedSegments: number
}) {
  if (status === "complete") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Complete
      </span>
    )
  }
  if (status === "in_progress") {
    return (
      <span className="flex items-center gap-1 text-xs text-yellow-400">
        <PlayCircle className="h-3.5 w-3.5" />
        {segmentsLabeled}/~{estimatedSegments}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <AlertCircle className="h-3.5 w-3.5" />
      Not started
    </span>
  )
}

export function VideoQueue({
  videos,
  currentVideoId,
  onSelectVideo,
  isOpen,
  onOpenChange,
}: VideoQueueProps) {
  const completedCount = videos.filter((v) => v.status === "complete").length
  const progress = videos.length > 0 ? (completedCount / videos.length) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <List className="h-4 w-4" />
          Queue ({completedCount}/{videos.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Video Queue
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-mono text-foreground">
              {completedCount} / {videos.length} videos
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Video List */}
        <ScrollArea className="h-[400px] -mx-6 px-6">
          <div className="space-y-2">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => {
                  onSelectVideo(video.id)
                  onOpenChange(false)
                }}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg border transition-colors text-left",
                  currentVideoId === video.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/50 hover:bg-secondary/30"
                )}
              >
                {/* Thumbnail placeholder */}
                <div className="w-20 h-12 bg-secondary rounded flex items-center justify-center shrink-0">
                  <PlayCircle className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {video.filename}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatDuration(video.duration)}</span>
                    <span>|</span>
                    <span>{video.resolution}</span>
                    <span>|</span>
                    <span>{video.fps} FPS</span>
                  </div>
                  <div className="mt-1.5">
                    <StatusBadge
                      status={video.status}
                      segmentsLabeled={video.segmentsLabeled}
                      estimatedSegments={video.estimatedSegments}
                    />
                  </div>
                </div>

                {/* Quality indicator */}
                {video.fps >= 24 && video.bitrate >= 1000 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>

        {/* Empty state */}
        {videos.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No videos in queue</p>
          </div>
        )}

        {/* All done state */}
        {videos.length > 0 && completedCount === videos.length && (
          <div className="text-center py-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-green-400 font-medium">All videos have been labeled!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
