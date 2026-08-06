export const siteConfig = {
  name: "DHARMA",
  title: "DHARMA — Ancient wisdom, thoughtfully retrieved",
  // Kept short and front-loaded on purpose: most link-preview surfaces
  // (Slack, Discord, WhatsApp, iMessage) truncate around 80-160 characters,
  // so the value has to land before the cutoff, not after it.
  description:
    "An AI assistant for the Bhagavad Gita and Yoga Sutras — grounded, cited answers rooted in the actual verses, not open-ended generation.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dharma.nikhilyadav.dev",
  links: {
    github: "https://github.com/nikhilyadav09/Dharma_RAG",
    portfolio: "https://nikhilyadav.dev",
  },
};
