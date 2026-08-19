/**
 * Anklickbares Foto-Grid mit Kategoriefilter-Tabs für Restaurant-Fotos.
 * @prop items - Liste der Foto-Einträge mit id, titel, datei, beschreibung, kategorie, kategorieLabel
 * @prop onPhotoClick - Callback wenn ein Foto angeklickt wird (übergibt id)
 * @prop onAddPhoto - Callback für den Plus-Button zum Hinzufügen neuer Fotos
 */
import { useState } from 'react';
import { tx } from '@/i18n';
import { IconPhoto, IconPlus } from '@tabler/icons-react';

export interface GalerieGridProps {
  items: Array<{
    id: string;
    titel: string;
    datei?: string;
    beschreibung?: string;
    kategorie?: string;
    kategorieLabel?: string;
  }>;
  onPhotoClick: (id: string) => void;
  onAddPhoto: () => void;
}

export function GalerieGrid({ items, onPhotoClick, onAddPhoto }: GalerieGridProps) {
  const [activeTab, setActiveTab] = useState<string>('alle');

  const kategorien = Array.from(
    items
      .filter(i => i.kategorie)
      .reduce((map, i) => {
        if (i.kategorie && !map.has(i.kategorie)) {
          map.set(i.kategorie, i.kategorieLabel ?? i.kategorie);
        }
        return map;
      }, new Map<string, string>())
      .entries()
  );

  const filtered = activeTab === 'alle' ? items : items.filter(i => i.kategorie === activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('alle')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'alle'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {tx('Alle')}
        </button>
        {kategorien.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Leerer Zustand */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <IconPhoto size={48} className="text-muted-foreground" stroke={1.5} />
          <p className="text-muted-foreground text-sm">
            {tx('Noch keine Fotos — Jetzt erstes Foto hinzufügen')}
          </p>
          <button
            onClick={onAddPhoto}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <IconPlus size={16} className="shrink-0" />
            {tx('Foto hinzufügen')}
          </button>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(item => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => onPhotoClick(item.id)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onPhotoClick(item.id); }}
                className="flex flex-col gap-1 cursor-pointer group"
                title={item.titel}
              >
                <div className="overflow-hidden rounded-md bg-muted">
                  {item.datei ? (
                    <img
                      src={item.datei}
                      alt={item.titel}
                      className="object-cover w-full h-40 rounded-md group-hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-40 rounded-md bg-muted">
                      <IconPhoto size={32} className="text-muted-foreground" stroke={1.5} />
                    </div>
                  )}
                </div>
                <span className="text-sm truncate min-w-0 text-foreground">{item.titel}</span>
              </div>
            ))}
          </div>

          {/* Plus-Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onAddPhoto}
              aria-label={tx('Foto hinzufügen')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <IconPlus size={16} className="shrink-0" />
              {tx('Foto hinzufügen')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
