"use client"

import { BOXING_ACTIONS, type Segment } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileJson } from "lucide-react"

interface ExportPreviewProps {
  videoFile: string
  segments: Segment[]
  fps: number
}

export function ExportPreview({ videoFile, segments, fps }: ExportPreviewProps) {
  const exportData = {
    video_file: videoFile,
    labeled_by: "annotator_username",
    date: new Date().toISOString().split("T")[0],
    segments: segments.map((segment) => {
      const action = BOXING_ACTIONS.find((a) => a.id === segment.actionId)
      return {
        id: segment.id,
        action: action?.shortName.replace("-", "_").toUpperCase() || "UNKNOWN",
        action_id: segment.actionId,
        start_time: Number(segment.startTime.toFixed(3)),
        end_time: Number(segment.endTime.toFixed(3)),
        start_frame: Math.round(segment.startTime * fps),
        end_frame: Math.round(segment.endTime * fps),
      }
    }),
  }

  const jsonString = JSON.stringify(exportData, null, 2)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <FileJson className="h-4 w-4" />
          Preview Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Export Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This is a preview of the data that will be exported. The actual export will include all labeled segments.
          </p>

          <ScrollArea className="h-[400px] rounded-md border border-border bg-secondary/30">
            <pre className="p-4 text-xs font-mono text-foreground whitespace-pre overflow-x-auto">
              {jsonString}
            </pre>
          </ScrollArea>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{segments.length} segments</span>
            <span>{(jsonString.length / 1024).toFixed(1)} KB</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
