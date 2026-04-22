type Props = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function Intro({ eyebrow, title, description }: Props) {
  return (
    <div className="py-12 md:py-16 border-b border-border">
      <p className="label-eyebrow mb-4 stagger-child" style={{ ["--stagger-index" as string]: 0 }}>
        {eyebrow}
      </p>
      <h1 className="display-2xl stagger-child" style={{ ["--stagger-index" as string]: 1 }}>
        {title}
      </h1>
      {description && (
        <p
          className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground stagger-child"
          style={{ ["--stagger-index" as string]: 2 }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
