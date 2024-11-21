import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">About Me</h1>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="space-y-4 flex-1">
          <p>
            I am an Associate Director of Analysis and Strategy at the
            University of Arkansas. I help in building a healthy culture of
            delivering analytics to organizations that serve students on
            campus. There are ~33,000 students on campus so the impact
            is huge.
          </p>
          <p>
            My interests span from machine learning, data analysis to
            financial technology and educational innovation. I&apos;m constantly
            finding ways on being a positive impact to society.
          </p>
        </div>
        <div className="w-full md:w-1/2 lg:w-2/5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
            <Image
              src="/about-image.jpg"
              alt="Shreyash presenting a poster to two people in a university setting"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}