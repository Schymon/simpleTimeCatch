"use client"

import { useRef } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface StopConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function StopConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: StopConfirmDialogProps) {
  // AlertDialogAction ist intern ein DialogPrimitive.Close und schließt den
  // Dialog daher immer selbst mit (löst onOpenChange(false) aus) – dieser
  // Ref unterscheidet "geschlossen durch Bestätigen" von "geschlossen durch
  // Abbrechen/Escape", damit onCancel nicht direkt nach onConfirm nochmal
  // feuert und den gerade bestätigten Stop sofort wieder rückgängig macht.
  const confirmedRef = useRef(false)

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (next) return
        if (confirmedRef.current) {
          confirmedRef.current = false
          return
        }
        onCancel()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zeiterfassung stoppen?</AlertDialogTitle>
          <AlertDialogDescription>
            Die Stoppuhr wird angehalten. Danach trägst du die Tätigkeit und bei
            Bedarf die Endzeit ein.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              confirmedRef.current = true
              onConfirm()
            }}
          >
            Bestätigen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
