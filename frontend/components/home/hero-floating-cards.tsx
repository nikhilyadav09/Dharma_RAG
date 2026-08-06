"use client";

import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Decorative product-preview cards floating beside the hero copy — real
 * verses from the corpus, styled like an actual answer/citation, rather
 * than empty gradient space. Hidden below lg to avoid crowding the hero on
 * small screens, and aria-hidden since they're purely illustrative.
 */

interface FloatingCard {
  icon: LucideIcon;
  kicker: string;
  quote: string;
  sanskrit?: boolean;
  badge: string;
  badgeClass: string;
  position: string;
  rotate: string;
  width: string;
  floatY: number;
  duration: number;
  delay: number;
}

const AMBER_BADGE =
  "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200";
const VIOLET_BADGE =
  "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-200";

const cards: FloatingCard[] = [
  {
    icon: Sparkles,
    kicker: "Wisdom Chat",
    quote:
      "Your right is only to work, but not to its results — let not the fruits of action be your motive.",
    badge: "Bhagavad Gita 2.47",
    badgeClass: AMBER_BADGE,
    position: "left-[5%] top-[16%]",
    rotate: "-rotate-6",
    width: "w-56",
    floatY: -10,
    duration: 6,
    delay: 1,
  },
  {
    icon: BookOpen,
    kicker: "Source verse",
    quote: "योगश्चित्तवृत्तिनिरोधः",
    sanskrit: true,
    badge: "Yoga Sutras 1.2",
    badgeClass: VIOLET_BADGE,
    position: "right-[6%] top-[30%]",
    rotate: "rotate-6",
    width: "w-52",
    floatY: 10,
    duration: 7,
    delay: 1.4,
  },
  {
    icon: Sparkles,
    kicker: "Wisdom Chat",
    quote:
      "Whenever there is a decline of righteousness, O Arjuna, then I manifest Myself.",
    badge: "Bhagavad Gita 4.7",
    badgeClass: AMBER_BADGE,
    position: "left-[9%] top-[64%]",
    rotate: "rotate-3",
    width: "w-56",
    floatY: 12,
    duration: 6.5,
    delay: 0.6,
  },
  {
    icon: BookOpen,
    kicker: "Source verse",
    quote: "स्थिरसुखमासनम्",
    sanskrit: true,
    badge: "Yoga Sutras 2.46",
    badgeClass: VIOLET_BADGE,
    position: "right-[4%] top-[68%]",
    rotate: "-rotate-3",
    width: "w-48",
    floatY: -12,
    duration: 5.5,
    delay: 1.8,
  },
];

export function HeroFloatingCards() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      {cards.map((card, index) => (
        <motion.div
          key={card.badge}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, card.floatY, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.3 + index * 0.15 },
            y: {
              duration: card.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: card.delay,
            },
          }}
          className={`absolute ${card.position} ${card.width} ${card.rotate} rounded-xl border border-border/80 bg-card/90 p-4 shadow-lg backdrop-blur-sm`}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <card.icon className="h-3.5 w-3.5 text-accent" />
            {card.kicker}
          </div>
          <p
            className={
              card.sanskrit
                ? "font-devanagari mt-2 text-sm leading-snug text-foreground"
                : "mt-2 text-sm leading-snug text-foreground"
            }
          >
            {card.sanskrit ? card.quote : `“${card.quote}”`}
          </p>
          <span
            className={`mt-3 inline-block rounded-full border px-2 py-0.5 text-[11px] ${card.badgeClass}`}
          >
            {card.badge}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
