import { useExperience } from "@/api/experience";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { formatMonth } from "@/lib/utils";
import SectionHeading from "./SectionHeading";

export default function ExperienceSection() {
  const { data: items, isPending, isError, error, refetch } = useExperience();

  return (
    <section id="experience" className="scroll-mt-20 border-t border-line bg-paper py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading title="Where I've worked" description="My path so far, newest first." />

        {isPending && <Skeleton className="h-48 w-full" />}
        {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
        {items && items.length === 0 && <EmptyState title="Experience coming soon" text="I'll add my work history here shortly." />}

        {items && items.length > 0 && (
          <ol className="relative ml-2 space-y-10 border-l-2 border-ink/15 pl-8">
            {items.map((item) => (
              <li key={item.id} className="relative">
                <span aria-hidden className="absolute -left-[41px] top-2 size-4 rounded-full border-2 border-ink bg-marigold" />
                <h3 className="text-2xl font-extrabold">
                  {item.position} at {item.company}
                </h3>
                <p className="mt-1 text-mute">
                  {formatMonth(item.startDate)} to {item.endDate ? formatMonth(item.endDate) : "now"}
                  {item.location ? `, ${item.location}` : ""}
                </p>
                {item.description && <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed">{item.description}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
