interface SectionHeadingProps {
  title: string;
  description?: string;
  className?: string;
  id?: string;
}

export function SectionHeading({
  title,
  description,
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2
        id={id}
        className="text-xl font-semibold tracking-tight md:text-2xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
