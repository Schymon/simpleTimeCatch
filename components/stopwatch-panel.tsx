"use client"

import { PauseIcon, PlayIcon, SquareIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatStopwatch, formatWeekdayDateBerlin } from "@/lib/time"
import type { RunningTimer } from "@/lib/types"

interface StopwatchPanelProps {
  running: RunningTimer | null
  elapsedMs: number
  busy: boolean
  onStart: () => void
  onPauseToggle: () => void
  onStop: () => void
}

export function StopwatchPanel({
  running,
  elapsedMs,
  busy,
  onStart,
  onPauseToggle,
  onStop,
}: StopwatchPanelProps) {
  const today = formatWeekdayDateBerlin(new Date().toISOString())

  return (
    <Card className="sticky top-0 z-10 rounded-none border-b ring-0">
      <CardContent className="flex flex-col items-center gap-3 py-2">
        <p className="text-sm text-muted-foreground">{today}</p>
        <p className="font-mono text-4xl font-medium tabular-nums">
          {formatStopwatch(elapsedMs)}
        </p>
        {/* Start/Pause/Stop sind immer alle drei sichtbar (nicht je nach
            Zustand ein-/ausgeblendet) und nur je nach Logik deaktiviert –
            so bleibt die Bedienung an fester Position vorhersehbar. */}
        <div className="flex items-center gap-2">
          <Button onClick={onStart} disabled={busy || !!running} size="lg">
            <PlayIcon data-icon="inline-start" />
            Start
          </Button>
          <Button
            onClick={onPauseToggle}
            disabled={busy || !running}
            variant="outline"
            size="lg"
          >
            {running?.isPaused ? (
              <>
                <PlayIcon data-icon="inline-start" />
                Weiter
              </>
            ) : (
              <>
                <PauseIcon data-icon="inline-start" />
                Pause
              </>
            )}
          </Button>
          <Button
            onClick={onStop}
            disabled={busy || !running}
            variant="destructive"
            size="lg"
          >
            <SquareIcon data-icon="inline-start" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
