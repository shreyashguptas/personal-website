"use client"

import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./navigation-menu"
import { Kbd } from "./kbd"

export function SiteNavigation() {
  return (
    <div className="flex justify-center w-full py-3 sm:py-4">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/" data-cursor-intent="hover" className="group flex items-center gap-2">
                Home
                <Kbd keys={['mod', '1']} className="ml-1" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/blog" data-cursor-intent="hover" className="group flex items-center gap-2">
                Blog
                <Kbd keys={['mod', '2']} className="ml-1" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
            <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/projects" data-cursor-intent="hover" className="group flex items-center gap-2">
                Project
                <Kbd keys={['mod', '3']} className="ml-1" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
} 