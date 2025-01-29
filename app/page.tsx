import Image from 'next/image'
import Link from 'next/link'
import { projects } from './projects/data'
import { readings } from './readings/data'
import { getTopItems } from './utils/content-utils'
import { ProjectList } from './projects/components/project-list'
import { BlogPreviewList } from './blogs/components/blog-preview-list'
import { ReadingList } from './readings/components/reading-list'
import { getAllBlogs } from './blogs/service'

export default async function Home() {
  const topProjects = projects.filter(project => project.pinned)
  const allPosts = await getAllBlogs()
  const topPosts = allPosts.slice(0, 3)
  const topReadings = readings
    .filter(reading => reading.recommendation)
    .sort((a, b) => (a.recommendation || 0) - (b.recommendation || 0))
    .slice(0, 3)

  return (
    <div className="space-y-16">
      <section className="min-h-[calc(100vh-12rem)] flex flex-col justify-center animate-fade-in">
        <div className="space-y-10">
          <div className="w-[140px] h-[140px] md:w-[160px] md:h-[160px] relative overflow-hidden rounded-lg">
            <Image
              src="/images/headshot.jpg"
              alt="Shreyash Gupta Headshot"
              fill
              className="object-cover"
            />
          </div>
          
          <h1 className="text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-normal tracking-[-0.02em] leading-[1.2]">
            Hi, I'm Shreyash - a technologist driven by curiosity to explore how technology, business, economics, history and politics shape our world. I'm passionate about creating beautiful software and working with cutting-edge hardware, while maintaining a strong mind and body to pursue these interests.
          </h1>
        </div>
      </section>

      <div className="snap-y snap-mandatory h-screen overflow-y-auto">
        <section className="space-y-8 snap-start h-screen pt-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Live Projects</h2>
            <p className="text-gray-600">Check out some of my recent work</p>
          </div>
          <ProjectList projects={topProjects} showImages={true} showTags={false} />
          <div>
            <Link 
              href="/projects" 
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              View all projects →
            </Link>
          </div>
        </section>

        <section className="space-y-8 snap-start h-screen pt-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Latest Blog Posts</h2>
            <p className="text-gray-600">Thoughts on technology, software, and life</p>
          </div>
          <BlogPreviewList posts={topPosts} />
          <div>
            <Link 
              href="/blogs" 
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              View all posts →
            </Link>
          </div>
        </section>

        <section className="space-y-8 snap-start h-screen pt-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Recommended Readings</h2>
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
    </div>
  )
}
