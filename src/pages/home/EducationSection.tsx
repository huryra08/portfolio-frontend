import { useEducation } from "@/api/education";
import { Chip, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { formatMonth } from "@/lib/utils";
import SectionHeading from "./SectionHeading";

export default function EducationSection() {
  const { data: items, isPending, isError, error, refetch } = useEducation();

  return (
    <section id="education" className="scroll-mt-20 border-t border-line bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading title="Education" description="Where I studied and what I focused on." />

        {isPending && <Skeleton className="h-40 w-full" />}
        {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
        {items && items.length === 0 && <EmptyState title="Education coming soon" text="I'll add my studies here shortly." />}

        {items && items.length > 0 && (
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.id} className="grid gap-3 py-8 md:grid-cols-[220px_1fr] md:gap-10">
                <p className="font-semibold text-mute">
                  {formatMonth(item.startDate)} to {item.endDate ? formatMonth(item.endDate) : "now"}
                </p>
                <div>
                  <h3 className="text-2xl font-extrabold">{item.institution}</h3>
                  <p className="mt-1 text-lg font-semibold">
                    {item.degree}
                    {item.field ? `, ${item.field}` : ""}
                  </p>
                  {(item.grade || item.location) && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {item.grade && <Chip tone="gold">{item.grade}</Chip>}
                      {item.location && <Chip>{item.location}</Chip>}
                    </div>
                  )}
                  {item.description && <p className="mt-4 max-w-2xl whitespace-pre-line leading-relaxed text-mute">{item.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
