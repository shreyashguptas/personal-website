import Image from 'next/image'

export default function Home() {
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
            Hi, I'm Shreyash - a technologist driven by curiosity to explore how technology, business, economics, history and politics shape our world. I'm passionate about creating beautiful software and working with cutting-edge hardware, while maintaining a strong mind and body to pursue these interests.
          </h1>
        </div>
      </section>
    </div>
  )
}
