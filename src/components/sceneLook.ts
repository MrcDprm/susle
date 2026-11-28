import type { Look } from '@/lib/look'

// Gökyüzü ve kar global sahnede çizilir; ağacın seçimi html etiketindeki data özellikleriyle iletilir.
export function applySceneLook(look: Pick<Look, 'sky' | 'snow'>): void {
  document.documentElement.dataset.sky = String(look.sky)
  document.documentElement.dataset.snow = String(look.snow)
}

export function clearSceneLook(): void {
  delete document.documentElement.dataset.sky
  delete document.documentElement.dataset.snow
}
