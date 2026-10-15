import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useProject } from "@/api/projects";
import { ApiError } from "@/lib/http";
import { useTitle } from "@/lib/utils";
import { Chip, ErrorState, Skeleton } from "@/components/ui";

export default function ProjectDetail() {
  const { slug = "" } = useParams();
  const { data: project, isPending, isError, error, refetch } = useProject(slug);
  useTitle(project ? `${project.title} | Portfulio` : "Project | Portfulio");

  const notFound = isError && error instanceof ApiError && error.status === 404;

  return (
    <article className="mx-auto max-w-4xl px-5 py-12 md:py-16">
      <Link to="/#projects" className="inline-flex items-center gap-2 font-semibold text-mute hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        All projects
      </Link>

      {isPending && (
        <div className="mt-8 space-y-4" aria-busy="true">
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {notFound && (
        <div className="mt-10">
          <h1 className="text-4xl font-extrabold">That project doesn't exist</h1>
          <p className="mt-3 text-mute">It may have been renamed or taken down. Head back to see all projects.</p>
        </div>
      )}

      {isError && !notFound && (
        <div className="mt-8">
          <ErrorState message={error.message} onRetry={() => void refetch()} />
        </div>
      )}

      {project && (
        <div className="mt-8">
          <h1 className="text-4xl font-extrabold sm:text-6xl">{project.title}</h1>
          <p className="mt-4 text-xl text-mute">{project.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink/85">
                Visit live site <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ink/25 bg-white px-5 py-2.5 font-semibold hover:border-ink">
                View the code <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
          </div>

          {project.skills.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Built with">
              {project.skills.map(({ skill }) => (
                <li key={skill.id}>
                  <Chip>{skill.name}</Chip>
                </li>
              ))}
            </ul>
          )}

          {project.thumbnail && <img src={project.thumbnail} alt={`${project.title} preview`} className="mt-10 w-full rounded-2xl border border-line bg-white object-cover" />}

          <p className="mt-10 max-w-2xl whitespace-pre-line text-lg leading-relaxed">{project.description}</p>

          {project.challenges.length > 0 && (
            <section className="mt-14" aria-labelledby="challenges-heading">
              <h2 id="challenges-heading" className="text-3xl font-extrabold">
                Problems I ran into and how I fixed them
              </h2>
              <ol className="mt-6 divide-y divide-line border-y border-line">
                {project.challenges.map((item, index) => (
                  <li key={item.id} className="grid gap-5 py-7 md:grid-cols-2 md:gap-10">
                    <div>
                      <p className="font-bold text-danger">Problem {index + 1}</p>
                      <p className="mt-2 whitespace-pre-line leading-relaxed">{item.problem}</p>
                    </div>
                    <div>
                      <p className="font-bold text-teal">How I fixed it</p>
                      <p className="mt-2 whitespace-pre-line leading-relaxed">{item.solution}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {project.images.length > 0 && (
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {project.images.map((image) => (
                <figure key={image.id}>
                  <img src={image.url} alt={image.caption ?? `${project.title} screenshot`} loading="lazy" className="w-full rounded-xl border border-line bg-white" />
                  {image.caption && <figcaption className="mt-2 text-sm text-mute">{image.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
