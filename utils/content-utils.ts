export function getTopItems<T>(items: T[], count: number): T[] {
    return items.slice(0, count)
  }
  
  // Keep the sortByDate function for potential future use
  export function sortByDate<T extends { date: Date }>(items: T[]): T[] {
    return [...items].sort((a, b) => b.date.getTime() - a.date.getTime())
  }
  
  