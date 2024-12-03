import Image from 'next/image'
import Link from 'next/link'
import { projects } from './projects/data'
import { posts } from './blogs/data'
import { readings } from './readings/data'
import { getTopItems } from './utils/content-utils'
import { ProjectList } from './projects/components/project-list'
import { BlogList } from './blogs/components/blog-list'
import { ReadingList } from './readings/components/reading-list'

export default function Home() {
  const topProjects = projects.filter(project => project.pinned).slice(0, 3)
  const topPosts = getTopItems(posts, 3)
  const topReadings = readings
    .filter(reading => reading.recommendation)
    .sort((a, b) => (a.recommendation || 0) - (b.recommendation || 0))
    .slice(0, 3)

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl font-bold">Introduction</h1>
            <p className="text-lg text-foreground">
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

      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Projects</h2>
          <p className="text-gray-600">Check out some of my recent work</p>
        </div>
        <ProjectList projects={topProjects} showImages={true} />
        <div>
          <Link 
            href="/projects" 
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            View all projects →
          </Link>
        </div>
      </section>

      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Latest Blog Posts</h2>
          <p className="text-gray-600">Thoughts on technology, software, and life</p>
        </div>
        <BlogList posts={topPosts} />
        <div>
          <Link 
            href="/blogs" 
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            View all posts →
          </Link>
        </div>
      </section>

      <section className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Recommended Readings</h2>
          <p className="text-gray-600">Books that have shaped my thinking</p>
        </div>
        <ReadingList readings={topReadings} isRecommendations={true} />
        <div>
          <Link 
            href="/readings" 
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            View all readings →
          </Link>
        </div>
      </section>
    </div>
  )
}
