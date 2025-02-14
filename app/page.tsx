import Image from 'next/image'
import Link from 'next/link'

export default function Home(): JSX.Element {
  return (
    <div>
      <section className="min-h-[calc(100vh-12rem)] flex flex-col justify-center">
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
            Hi, I'm Shreyash
          </h1>

          <h1 className="text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-normal tracking-[-0.02em] leading-[1.2]">
            I <Link href="/projects" className="group relative hover:text-primary transition-colors">
              <span className="relative">
                build
                <span className="absolute -bottom-0 left-0 w-full h-[4px] bg-current" />
              </span>
            </Link> software that empowers informed decision-making and solves meaningful problems.
          </h1>

          <h1 className="text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-normal tracking-[-0.02em] leading-[1.2]">
            I <Link href="/blogs" className="group relative hover:text-primary transition-colors">
              <span className="relative">
                write
                <span className="absolute -bottom-0 left-0 w-full h-[4px] bg-current" />
              </span>
            </Link> about my journey in technology, sharing lessons learned and insights gained along the way.
          </h1>
          
          <h1 className="text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] font-normal tracking-[-0.02em] leading-[1.2]">
            I <Link href="/readings" className="group relative hover:text-primary transition-colors">
              <span className="relative">
                read
                <span className="absolute -bottom-0 left-0 w-full h-[4px] bg-current" />
              </span>
            </Link> widely—business, technology, history, and beyond—to fuel my curiosity and growth.
          </h1>
        </div>
      </section>
    </div>
  )
}
