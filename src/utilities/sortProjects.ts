type SortableProject = {
  sortOrder?: number | null
  year?: number | null
}

function toSortableNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function sortProjects<T extends SortableProject>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const sortOrderDiff = toSortableNumber(a.sortOrder) - toSortableNumber(b.sortOrder)

    if (sortOrderDiff !== 0) return sortOrderDiff

    return toSortableNumber(b.year) - toSortableNumber(a.year)
  })
}
