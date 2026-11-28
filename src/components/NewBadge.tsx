'use client'

import { useEffect, useState } from 'react'
import { dict, type Lang } from '@/lib/i18n'

// Sahibin ağacı en son açtığında kaç süs gördüğü tarayıcıda saklanır. Ana sayfada aradaki fark
// yeni süs olarak gösterilir; ağacı hiç bu tarayıcıdan açmadıysa rozet çıkmaz.
export function NewBadge({ lang, treeId, total }: { lang: Lang; treeId: string; total: number }) {
  const [fresh, setFresh] = useState(0)

  useEffect(() => {
    try {
      const seen = localStorage.getItem(`susle-gorulen-${treeId}`)
      if (seen !== null) setFresh(Math.max(0, total - Number(seen)))
    } catch {
      // Depolama kapalıysa rozet görünmez.
    }
  }, [treeId, total])

  if (fresh === 0) return null
  return <span className="new-badge">{dict(lang).home.newOrnaments(fresh)}</span>
}
