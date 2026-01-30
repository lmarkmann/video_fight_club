"use client"

import type { QualityMetrics } from "@/lib/types"
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface QualityPanelProps {
  metrics: QualityMetrics | null
}

function MetricRow({
  label,
  value,
  required,
  passed,
  unit,
}: {
  label: string
  value: string | number
  required: string | number
  passed: boolean
  unit?: string
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-foreground">
          {value}{unit}
        </span>
        <span className="text-xs text-muted-foreground">
          (min: {required}{unit})
        </span>
        {passed ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  )
}

export function QualityPanel({ metrics }: QualityPanelProps) {
  if (!metrics) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-2 text-muted-foreground">
        <AlertTriangle className="h-4 w-4" />
        No video loaded
      </Button>
    )
  }

  const allPassed = metrics.fps.passed && metrics.resolution.passed && metrics.bitrate.passed && metrics.duration.passed

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 ${allPassed ? "text-green-400" : "text-yellow-400"}`}
        >
          {allPassed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          Quality: {allPassed ? "Pass" : "Warning"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-card border-border" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-foreground">Video Quality Check</h4>
          
          <div className="space-y-0">
            <MetricRow
              label="FPS"
              value={metrics.fps.value}
              required={metrics.fps.required}
              passed={metrics.fps.passed}
            />
            <MetricRow
              label="Resolution"
              value={metrics.resolution.value}
              required={metrics.resolution.required}
              passed={metrics.resolution.passed}
            />
            <MetricRow
              label="Bitrate"
              value={metrics.bitrate.value}
              required={metrics.bitrate.required}
              passed={metrics.bitrate.passed}
              unit=" kbps"
            />
            <MetricRow
              label="Duration"
              value={metrics.duration.value}
              required={metrics.duration.required}
              passed={metrics.duration.passed}
              unit="s"
            />
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Codec: <span className="font-mono text-foreground">{metrics.codec}</span>
            </p>
          </div>

          {!allPassed && (
            <div className="pt-2 bg-yellow-500/10 -mx-4 -mb-4 px-4 py-3 rounded-b-lg border-t border-yellow-500/20">
              <p className="text-xs text-yellow-400">
                Video does not meet all quality requirements but can still be labeled.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
