interface Reading {
  id: string
  title: string
  description: string
  url: string
  date: string
}

const readings: Reading[] = [
  {
    id: '1',
    title: 'The Pragmatic Programmer',
    description: 'A classic book about software development best practices and principles.',
    url: 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/',
    date: 'March 2024'
  },
  {
    id: '2',
    title: 'Clean Code',
    description: 'A handbook of agile software craftsmanship by Robert C. Martin.',
    url: 'https://www.oreilly.com/library/view/clean-code-a/9780136083238/',
    date: 'February 2024'
  },
  {
    id: '3',
    title: 'Design Patterns',
    description: 'Elements of Reusable Object-Oriented Software by the Gang of Four.',
    url: 'https://www.oreilly.com/library/view/design-patterns-elements/0201633612/',
    date: 'January 2024'
  }
]

export default function ReadingsPage() {
  return (
    <main className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Readings</h1>
          <p className="text-muted-foreground">
            A collection of articles, books, and other content I've been reading.
          </p>
        </div>
        
        <div className="grid gap-6">
          {readings.map((reading) => (
            <a
              key={reading.id}
              href={reading.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex flex-col gap-2">
                <h2 className="font-semibold">{reading.title}</h2>
                <p className="text-sm text-muted-foreground">{reading.description}</p>
                <div className="text-sm text-muted-foreground">{reading.date}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
