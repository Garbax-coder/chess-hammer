import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { deleteOwnAccount } from '@/lib/auth'
import { useAuth } from '@/lib/auth-context'
import { useTranslations } from '@/lib/language-context'

export function DeleteAccountDialog() {
  const { user } = useAuth()
  const t = useTranslations()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(false)

  const email = user?.email ?? ''
  // Riscrivere la propria email e' la conferma: evita che un click distratto
  // o un tocco accidentale su mobile basti a distruggere l'account.
  const confirmed = email !== '' && confirmText.trim().toLowerCase() === email.toLowerCase()

  function handleOpenChange(next: boolean) {
    if (deleting) return
    setOpen(next)
    if (!next) {
      setConfirmText('')
      setError(false)
    }
  }

  async function handleDelete() {
    if (!confirmed) return
    setDeleting(true)
    setError(false)
    try {
      await deleteOwnAccount()
      navigate('/', { replace: true })
    } catch (e) {
      console.error('Eliminazione account fallita', e)
      setError(true)
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm">
          {t.profile.deleteAccount}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.profile.deleteDialogTitle}</DialogTitle>
          <DialogDescription className="text-destructive">
            {t.profile.deleteDialogWarning}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delete-confirm">{t.profile.deleteConfirmLabel(email)}</Label>
          <Input
            id="delete-confirm"
            type="email"
            autoComplete="off"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
          />
        </div>

        {error && <p className="text-destructive text-sm">{t.profile.deleteError}</p>}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm" disabled={deleting}>
              {t.profile.cancel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={!confirmed}
            loading={deleting}
            onClick={handleDelete}
          >
            {deleting ? t.profile.deleting : t.profile.deleteConfirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
