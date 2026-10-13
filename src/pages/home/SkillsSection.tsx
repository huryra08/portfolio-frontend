import { useMemo } from "react";
import { useSkills } from "@/api/skills";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import type { Skill } from "@/schemas";
import SectionHeading from "./SectionHeading";

function LevelDots({ level }: { level: number }) {
  return (
    <span role="img" aria-label={`Level ${level} of 5`} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((dot) => (
        <span key={dot} className={dot <= level ? "size-2 rounded-full bg-ink" : "size-2 rounded-full bg-ink/15"} />
      ))}
    </span>
  );
}

export default function SkillsSection() {
  const { data: skills, isPending, isError, error, refetch } = useSkills();

  const groups = useMemo(() => {
    const map = new Map<string, Skill[]>();
    skills?.forEach((skill) => map.set(skill.category, [...(map.get(skill.category) ?? []), skill]));
    return [...map.entries()];
  }, [skills]);

  return (
    <section id="skills" className="scroll-mt-20 border-t border-line bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading title="What I work with" description="The tools I reach for, grouped by what they're used for. The dots show how comfortable I am with each." />

        {isPending && <Skeleton className="h-48 w-full" />}
        {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
        {skills && skills.length === 0 && <EmptyState title="Skills coming soon" text="I'm still putting my toolbox together." />}

        <div className="divide-y divide-line">
          {groups.map(([category, items]) => (
            <div key={category} className="grid gap-4 py-7 md:grid-cols-[220px_1fr]">
              <h3 className="text-xl font-extrabold">{category}</h3>
              <ul className="flex flex-wrap gap-3">
                {items.map((skill) => (
                  <li key={skill.id} className="flex items-center gap-3 rounded-full border border-line bg-paper px-4 py-2">
                    <span className="font-semibold">{skill.name}</span>
                    {skill.level && <LevelDots level={skill.level} />}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
