export const TABLE_CATEGORY_STYLES = [
  { key: 'VIP', label: 'VIP', color: '#C9A96E', textColor: '#241A0B' },
  { key: 'FAMILLE', label: 'Famille', color: '#8D3D4D', textColor: '#FFFFFF' },
  { key: 'AMI', label: 'Ami', color: '#4F78B8', textColor: '#FFFFFF' },
  { key: 'AUTRES', label: 'Autres', color: '#4F8A68', textColor: '#FFFFFF' },
] as const

export function getTableCategoryStyle(category: string) {
  const normalized = category.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
  if (normalized === 'VIP') return TABLE_CATEGORY_STYLES[0]
  if (normalized.startsWith('FAMIL')) return TABLE_CATEGORY_STYLES[1]
  if (normalized.startsWith('AMI')) return TABLE_CATEGORY_STYLES[2]
  return TABLE_CATEGORY_STYLES[3]
}
