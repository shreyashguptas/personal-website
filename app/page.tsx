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
  const topProjects = getTopItems(projects, 5)
  const topReadings = getTopItems(readings, 5)
  const topPosts = getTopItems(posts, 5)

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <h2>Introduction</h2>
        <p className="text-lg text-muted-foreground">
          As Associate Director at the University of Arkansas, I lead analytics for student-serving organizations. 
          I&apos;m constantly critiquing my knowledge of technical skills, economics, and business then consistently 
          learning and applying. I then find time to lift weights, run, bike and eat a lot of homemade sourdough pizza.
        </p>
        <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
          <Image
            src="/images/headshot.jpg"
            alt="Shreyash Gupta Headshot"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-12">
        <section>
          <h2 className="mb-6">Top Projects</h2>
          <ProjectList projects={topProjects} />
          <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all projects →
          </Link>
        </section>

        <section>
          <h2 className="mb-6">Top Readings</h2>
          <ReadingList readings={topReadings} />
          <Link href="/readings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all readings →
          </Link>
        </section>

        <section>
          <h2 className="mb-6">Recent Blog Posts</h2>
          <BlogList posts={topPosts} />
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all blog posts →
          </Link>
        </section>
      </div>
    </div>
  )
}

