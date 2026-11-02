"use client"

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
import type { TimeEntry } from "@/lib/types"

interface DeleteConfirmDialogProps {
  entry: TimeEntry | null
  onOpenChange: (open: boolean) => void
  onConfirm: (id: string) => void
}

export function DeleteConfirmDialog({
  entry,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={entry !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eintrag wirklich löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            {entry && (
              <>
                &bdquo;{entry.activity}&ldquo; wird unwiderruflich gelöscht.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => entry && onConfirm(entry.id)}
          >
            Löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
