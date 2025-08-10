---
title: "Adding Wi‑Fi to a Dumb Thermostat"
excerpt: "How I taught a non‑Wi‑Fi Honeywell thermostat new tricks with six wires, a relay, and a Raspberry Pi Pico W—so my sleep routine runs itself."
date: "2025-08-04T00:00:00.000Z"
author:
  name: Shreyash Gupta
  picture: "/blog/authors/shreyash.png"
coverImage: "/blog/content/honeywell-home-thermostat-on-the-wall-with-the-raspberry-pi-pico.jpeg"
---

I care a lot about sleep. One small ritual that matters is temperature: cooler at night, warmer in the morning. The problem is that rituals become chores when you do them manually. Every night I’d tell myself to tap the thermostat down. Some nights I forgot. And like all small frictions, it added up—not just the time, but the mental bookkeeping.

This is the kind of problem that invites a hack. Not a polished product, not an elegant abstraction—just something that makes the right thing effortless.

![honeywell-home-thermostat](/blog/content/honeywell-home-thermostat.jpeg)

The thermostat in question is a basic Honeywell unit with three capacitive buttons. No Wi‑Fi, no app, no API. But it does have a PCB and contacts. If you can press a button, you can simulate a press. So I opened it up and traced the three buttons—mode, plus, minus. Each button is essentially a short between an outer and inner ring on the board.

I soldered two leads per button (outer ring: red, inner ring: blue). Six wires total, brought out to a small bank of relays. Those relays were driven by a Raspberry Pi Pico W. The Pico connected to Home Assistant, which meant software could “press” the hardware buttons on a schedule.

![honeywell-home-thermostat-connected-to-raspberry-pi-pico](/blog/content/honeywell-home-thermostat-connected-to-raspberry-pi-pico.jpeg)

At 9:30 p.m., Home Assistant sends a command to the Pico, which clicks the minus relay three times—like tapping the button with your finger—to nudge the setpoint down to 68°F. In the morning, it bumps the temperature back up to 73°F. The Pico doesn’t know anything about HVAC; it just knows how to impersonate three button taps. The thermostat happily believes a human did it.

What I like about this is the constraint. There’s something clarifying about working with what exists. Instead of replacing the thermostat with a smart one, I made the dumb one obedient. The solution is crude in one sense (wires soldered to pads, relays clicking), but precise in another: it solves exactly the problem I had, no more. And it’s reversible.

People think the hard part of projects like this is the electronics. Often it’s the psychology. The goal wasn’t a dashboard or a graph. It was to remove a recurring decision from my day. The best automations are the ones you stop noticing.

### How it works, in brief:

- The thermostat’s capacitive buttons are just contacts on a PCB.
- Each of the three buttons has two pads; I soldered a pair of leads to each.
- Those six leads route to relays controlled by a Raspberry Pi Pico W.
- The Pico W is connected to Home Assistant.
- Home Assistant runs two automations on a schedule: lower at night, raise in the morning.

![honeywell-home-thermostat-on-the-wall-with-the-raspberry-pi-pico](/blog/content/honeywell-home-thermostat-on-the-wall-with-the-raspberry-pi-pico.jpeg)

There’s a nice honesty to prototypes. You can see exactly how they work. The wires are visible. The relay clicks are audible. When it runs at 9:30 p.m., you hear three soft ticks and feel the room take care of itself.

Could I buy a thermostat that does this out of the box? Sure. But I like the feeling of bending a simple object to my will. And there’s a hidden advantage: debugging your own tools teaches you more than using someone else’s finished ones. When something misbehaves, you don’t wait for a firmware update—you fix it. That habit compounds.

The other thing I learned is that “done” can be smaller than you think. I didn’t build a temperature model of the house. I didn’t do predictive control. I soldered six wires and wrote a tiny script. It’s not the final system; it’s the version that removes the daily friction. If a project erases a repeating decision, it’s probably good enough to ship.

Sleep is a leverage point. You can try to optimize your day with more discipline, or you can tweak the environment so the right thing happens by default. This little thermostat hack is the second kind. It doesn’t ask me to remember anything. It doesn’t ask me to be better. It just runs.

In the end that’s what I wanted: not a smarter thermostat, but a dumber day. Fewer things to think about, more space for the things that matter.