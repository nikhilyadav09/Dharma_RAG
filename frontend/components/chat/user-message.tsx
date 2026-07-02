interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <article className="flex justify-end" aria-label="Your question">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-muted px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] sm:text-base">
        {content}
      </div>
    </article>
  );
}
