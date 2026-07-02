import type { Metadata } from "next";

import { ChatLayout } from "@/components/chat/chat-layout";

export const metadata: Metadata = {
  title: "Chat",
  description: "Ask questions about dharma, yoga, and consciousness.",
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <ChatLayout initialQuery={params.q} />;
}
