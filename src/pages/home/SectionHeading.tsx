import type { ReactNode } from "react";

export default function SectionHeading({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div className="mb-10 max-w-2xl">
      <h2 className="text-4xl font-extrabold sm:text-5xl">{title}</h2>
      {description && <p className="mt-3 text-lg text-mute">{description}</p>}
    </div>
  );
}
