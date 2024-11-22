'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MountainIcon as Mountains, Ribbon } from 'lucide-react'
import Image from 'next/image'

export default function AboutMe() {
  const [activeSection, setActiveSection] = useState(0)
  const [progress, setProgress] = useState(0)

  const sections = [
    {
      title: "Exploring Volcanoes", 
      icon: <Mountains className="w-6 h-6" />,
      content: "It is 3AM in Guatemala and we hiked to watch the Volcano Fuego erupt.",
      image: "/images/volcano.jpg",
    },
    {
      title: "Running Ultra Races",
      icon: <Ribbon className="w-6 h-6" />,
      content: "Running 4.1 miles every hour for six hours. Totalling 25 miles. Great way to test your limits.", 
      image: "/images/cotter-ultra.jpg",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSection((prevSection) => (prevSection + 1) % sections.length)
      setProgress(0)
    }, 7000)

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => Math.min(prevProgress + 1, 100))
    }, 70)

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
    }
  }, [sections.length])

  return (
    <div className="min-h-screen text-stone-800 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-stone-700">You&apos;re curious so here you go</h1>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 bg-stone-200 p-6 shadow-md relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-stone-700">{sections[activeSection].title}</h2>
              <div className="relative w-full aspect-[16/12] mb-4">
                <Image
                  src={sections[activeSection].image}
                  alt={sections[activeSection].title}
                  fill
                  className="rounded-md object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
              <div className="flex items-center mb-4">
                {sections[activeSection].icon}
                <p className="ml-4 text-stone-600">{sections[activeSection].content}</p>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-300">
            <motion.div
              className="h-full bg-stone-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
        </Card>
        <Card className="bg-stone-200 p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <Button
                  key={index}
                  variant={index === activeSection ? "default" : "outline"}
                  className={`w-full justify-start ${index === activeSection ? 'bg-stone-600 text-stone-100' : 'text-stone-700 hover:bg-stone-300'}`}
                  onClick={() => {
                    setActiveSection(index)
                    setProgress(0)
                  }}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
