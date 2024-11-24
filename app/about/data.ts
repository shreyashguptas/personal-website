import { Section } from './types'
import { BookOpen, Dog, MountainIcon as Mountains, Ribbon, Candy } from 'lucide-react'

export const sections: Section[] = [
  {
    title: "My dog Kunu",
    Icon: Dog,
    content: `Kunu is my ${new Date().getFullYear() - 2012} year old Husky. She loves treats, treats and more treats.`,
    image: "/images/kunu.jpg",
  },
  {
    title: "Exploring Volcanoes", 
    Icon: Mountains,
    content: "It is 3AM in Guatemala and we hiked to watch the Volcano Fuego erupt. The experience of witnessing nature's raw power under the stars was absolutely breathtaking.",
    image: "/images/volcano.jpg",
  },
  {
    title: "Running Ultra Races",
    Icon: Ribbon,
    content: "Running 4.1 miles every hour for six hours, totalling 25 miles. This unique format pushed me to my limits, teaching me valuable lessons about endurance and mental strength.", 
    image: "/images/cotter-ultra.jpg",
  },
  {
    title: "Seeing the US Declaration of Independence",
    Icon: BookOpen,
    content: "One of the most impactful moments of my life was seeing the US Declaration of Independence in Washington D.C. Standing before this foundational document of democracy was truly humbling.", 
    image: "/images/US-declaration-of-independence.jpg",
  },
  {
    title: "Making Chocolate in Costa Rica",
    Icon: Candy,
    content: "That chocolate paste was cacao beans a few minutes ago. Kind of mind-blowing how much work goes into making something as simple as chocolate.", 
    image: "/images/making-chocolate-in-costa-rica.jpeg",
  },
] 