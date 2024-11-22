import Image from 'next/image'
import Link from 'next/link'
import { projects } from './projects/data'
import { readings } from './readings/data'
import { posts } from './blogs/data'
import { getTopItems } from './utils/content-utils'
import { ProjectList } from './projects/components/project-list'
import { ReadingList } from './readings/components/reading-list'
import { BlogList } from './blogs/components/blog-list'

export default function Home() {
  const topProjects = getTopItems(projects, 3)
  const topReadings = getTopItems(readings, 3)
  const topPosts = getTopItems(posts, 3)

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-bold">Introduction</h1>
            <p className="text-lg text-muted-foreground">
              I am driven by my curiosity in technology, business, economics, history and politics to understand how they shape the world we live in.
              Things outside of them bore me.
              <br />
              <br />
              My mission centers on creating beautiful software, working with cutting-edge hardware by maintaining a strong mind and body.
            </p>
          </div>

          <div className="w-full md:w-[400px] h-[400px] relative overflow-hidden rounded-lg">
            <Image
              src="/images/headshot.jpg"
              alt="Shreyash Gupta Headshot"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-12">
        <section>
          <h2 className="mb-2 text-2xl font-bold">Projects</h2>
          <div className="bg-border mb-6"></div>
          <ProjectList projects={topProjects} showTags={false} />
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all projects →
          </Link>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Readings</h2>
          <div className="bg-border mb-6"></div>
          <ReadingList readings={topReadings} showTags={false} />
          <Link href="/readings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all readings →
          </Link>
        </section>

        <section>
          <h2 className="mb-2 text-2xl font-bold">Blogs</h2>
          <div className="bg-border mb-6"></div>
          <BlogList posts={topPosts} />
          <Link href="/blogs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all blogs →
          </Link>
        </section>
      </div>
    </div>
  )
}
