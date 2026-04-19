type Props = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function Intro({ eyebrow, title, description }: Props) {
  return (
    <div className="py-12 md:py-16 border-b border-border">
      <p className="label-eyebrow mb-4">{eyebrow}</p>
      <h1 className="display-2xl">{title}</h1>
      {description && (
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
