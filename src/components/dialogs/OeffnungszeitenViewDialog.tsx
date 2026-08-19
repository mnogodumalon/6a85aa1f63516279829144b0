import type { Oeffnungszeiten } from '@/types/app';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { APP_IDS } from '@/types/app';
import { AttachmentsSection } from '@/components/AttachmentsSection';
import { Badge } from '@/components/ui/badge';
import { IconPencil } from '@tabler/icons-react';
import { t, appLabel, fieldLabel, lookupLabel } from '@/i18n';

interface OeffnungszeitenViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Oeffnungszeiten | null;
  onEdit: (record: Oeffnungszeiten) => void;
}

export function OeffnungszeitenViewDialog({ open, onClose, record, onEdit }: OeffnungszeitenViewDialogProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('view_entity', { entity: appLabel('oeffnungszeiten') })}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            {t('edit_button')}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('oeffnungszeiten', 'wochentag')}</Label>
            <Badge variant="secondary">{lookupLabel('oeffnungszeiten', 'wochentag', record.fields.wochentag?.key) ?? record.fields.wochentag?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('oeffnungszeiten', 'geschlossen')}</Label>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              record.fields.geschlossen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {record.fields.geschlossen ? t('yes') : t('no')}
            </span>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('oeffnungszeiten', 'oeffnung_von')}</Label>
            <p className="text-sm">{record.fields.oeffnung_von ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('oeffnungszeiten', 'oeffnung_bis')}</Label>
            <p className="text-sm">{record.fields.oeffnung_bis ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('oeffnungszeiten', 'mittagspause_von')}</Label>
            <p className="text-sm">{record.fields.mittagspause_von ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('oeffnungszeiten', 'mittagspause_bis')}</Label>
            <p className="text-sm">{record.fields.mittagspause_bis ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('oeffnungszeiten', 'hinweis_tag')}</Label>
            <p className="text-sm">{record.fields.hinweis_tag ?? '—'}</p>
          </div>
          <div className="pt-2 border-t border-border">
            <AttachmentsSection appId={APP_IDS.OEFFNUNGSZEITEN} recordId={record.record_id} readOnly />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}