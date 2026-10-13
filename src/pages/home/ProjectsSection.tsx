import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { useProjects } from "@/api/projects";
import { Chip, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import SectionHeading from "./SectionHeading";

export default function ProjectsSection() {
  const { data: projects, isPending, isError, error, refetch } = useProjects();
  const [skill, setSkill] = useState<string | null>(null);

  const skillNames = useMemo(() => {
    const names = new Set<string>();
    projects?.forEach((project) => project.skills.forEach(({ skill }) => names.add(skill.name)));
    return [...names].sort();
  }, [projects]);

  const visible = projects?.filter((project) => !skill || project.skills.some((entry) => entry.skill.name === skill));

  return (
    <section id="projects" className="scroll-mt-20 border-t border-line bg-paper py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading title="Selected work" description="Things I've built, from the idea to the live site. Open a project to see how it works." />

        {skillNames.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by skill">
            {["All", ...skillNames].map((name) => {
              const active = name === "All" ? skill === null : skill === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSkill(name === "All" ? null : name)}
                  className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors", active ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {isPending && (
          <div className="space-y-6" aria-busy="true">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-40 w-full" />
            ))}
          </div>
        )}

        {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}

        {visible && visible.length === 0 && (
          <EmptyState
            title={skill ? `No projects with ${skill} yet` : "Projects are on the way"}
            text={skill ? "Try another skill, or show all projects." : "I'm still adding my work here. Check back soon."}
            action={
              skill ? (
                <button type="button" onClick={() => setSkill(null)} className="rounded-full bg-ink px-5 py-2.5 font-semibold text-white">
                  Show all projects
                </button>
              ) : undefined
            }
          />
        )}

        {visible && visible.length > 0 && (
          <ul className="border-b border-line">
            {visible.map((project) => (
              <li key={project.id} className="group relative -mx-5 grid gap-5 border-t border-line px-5 py-8 transition-colors hover:bg-marigold-soft md:grid-cols-[220px_1fr_auto] md:items-center md:gap-8">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-xl border border-line bg-white object-cover" />
                ) : (
                  <div aria-hidden className="grid aspect-[4/3] w-full place-items-center rounded-xl border border-line bg-white font-display text-4xl font-extrabold text-ink/25">
                    {project.title.slice(0, 2)}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-extrabold sm:text-3xl">
                      <Link to={`/projects/${project.slug}`} className="after:absolute after:inset-0 focus-visible:after:outline-2">
                        {project.title}
                      </Link>
                    </h3>
                    {project.featured && <Chip tone="gold">Featured</Chip>}
                  </div>
                  <p className="mt-2 max-w-2xl text-mute">{project.summary}</p>
                  {project.skills.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {project.skills.map(({ skill }) => (
                        <li key={skill.id}>
                          <Chip>{skill.name}</Chip>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="relative z-10 flex items-center gap-4 md:flex-col md:items-end">
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline">
                      Live site <ExternalLink className="size-4" aria-hidden />
                    </a>
                  )}
                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline">
                      Code <ExternalLink className="size-4" aria-hidden />
                    </a>
                  )}
                  <ArrowUpRight aria-hidden className="hidden size-7 text-ink/30 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ink md:block" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
