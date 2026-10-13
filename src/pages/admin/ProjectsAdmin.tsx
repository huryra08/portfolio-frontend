import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminProjects, useCreateProject, useDeleteProject, useUpdateProject, type ProjectPayload } from "@/api/projects";
import { useSkills } from "@/api/skills";
import { Button, Checkbox, Chip, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton, Textarea } from "@/components/ui";
import { projectFormSchema, type Project, type ProjectFormValues } from "@/schemas";
import { cn, emptyToNull, slugify, useTitle } from "@/lib/utils";

const emptyForm: ProjectFormValues = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  thumbnail: "",
  liveUrl: "",
  repoUrl: "",
  screenshots: "",
  featured: false,
  published: true,
  order: 0,
  skillIds: [],
};

const toForm = (project: Project): ProjectFormValues => ({
  title: project.title,
  slug: project.slug,
  summary: project.summary,
  description: project.description,
  thumbnail: project.thumbnail ?? "",
  liveUrl: project.liveUrl ?? "",
  repoUrl: project.repoUrl ?? "",
  screenshots: project.images.map((image) => image.url).join("\n"),
  featured: project.featured,
  published: project.published,
  order: project.order,
  skillIds: project.skills.map(({ skill }) => skill.id),
});

const toPayload = (values: ProjectFormValues): ProjectPayload => ({
  title: values.title.trim(),
  slug: values.slug.trim(),
  summary: values.summary.trim(),
  description: values.description.trim(),
  thumbnail: emptyToNull(values.thumbnail),
  liveUrl: emptyToNull(values.liveUrl),
  repoUrl: emptyToNull(values.repoUrl),
  featured: values.featured,
  published: values.published,
  order: values.order,
  skillIds: values.skillIds,
  images: values.screenshots
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((url, index) => ({ url, order: index })),
});

function ProjectForm({ project, onDone }: { project: Project | null; onDone: () => void }) {
  const skills = useSkills();
  const create = useCreateProject();
  const update = useUpdateProject();
  const saving = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<ProjectFormValues>({ resolver: zodResolver(projectFormSchema), defaultValues: project ? toForm(project) : emptyForm });

  // while writing a NEW project, the slug follows the title until you edit it yourself
  const title = watch("title");
  useEffect(() => {
    if (!project && !dirtyFields.slug) setValue("slug", slugify(title));
  }, [title, project, dirtyFields.slug, setValue]);

  const selected = watch("skillIds");
  const toggleSkill = (id: string) =>
    setValue("skillIds", selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id], { shouldDirty: true });

  const onSubmit = (values: ProjectFormValues) => {
    const payload = toPayload(values);
    const done = () => {
      toast.success(project ? "Project saved" : "Project added");
      onDone();
    };
    if (project) update.mutate({ id: project.id, payload }, { onSuccess: done });
    else create.mutate(payload, { onSuccess: done });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field label="Title" htmlFor="p-title" error={errors.title?.message}>
        <Input id="p-title" invalid={!!errors.title} {...register("title")} />
      </Field>
      <Field label="Link name (slug)" htmlFor="p-slug" error={errors.slug?.message} hint="Used in the project's web address, like /projects/my-app.">
        <Input id="p-slug" invalid={!!errors.slug} {...register("slug")} />
      </Field>
      <Field label="Short summary" htmlFor="p-summary" error={errors.summary?.message} hint="One or two sentences shown in the project list.">
        <Input id="p-summary" invalid={!!errors.summary} {...register("summary")} />
      </Field>
      <Field label="Description" htmlFor="p-description" error={errors.description?.message}>
        <Textarea id="p-description" rows={6} invalid={!!errors.description} {...register("description")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Live site link" htmlFor="p-live" error={errors.liveUrl?.message}>
          <Input id="p-live" type="url" placeholder="https://" invalid={!!errors.liveUrl} {...register("liveUrl")} />
        </Field>
        <Field label="Code link" htmlFor="p-repo" error={errors.repoUrl?.message}>
          <Input id="p-repo" type="url" placeholder="https://github.com/..." invalid={!!errors.repoUrl} {...register("repoUrl")} />
        </Field>
      </div>

      <Field label="Cover image link" htmlFor="p-thumb" error={errors.thumbnail?.message}>
        <Input id="p-thumb" type="url" placeholder="https://" invalid={!!errors.thumbnail} {...register("thumbnail")} />
      </Field>
      <Field label="Screenshot links" htmlFor="p-shots" hint="Paste one image link per line.">
        <Textarea id="p-shots" rows={3} {...register("screenshots")} />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Skills used</legend>
        {skills.isPending && <Skeleton className="h-10 w-full" />}
        {skills.data?.length === 0 && <p className="text-sm text-mute">You haven't added any skills yet. Add some on the Skills page first.</p>}
        <div className="flex flex-wrap gap-2">
          {skills.data?.map((skill) => {
            const on = selected.includes(skill.id);
            return (
              <button
                key={skill.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleSkill(skill.id)}
                className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors", on ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}
              >
                {skill.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <div className="space-y-4">
          <Checkbox label="Published" hint="Visitors can see it on your site." {...register("published")} />
          <Checkbox label="Featured" hint="Shows a Featured badge." {...register("featured")} />
        </div>
        <Field label="Position" htmlFor="p-order" error={errors.order?.message} hint="Lower comes first.">
          <Input id="p-order" type="number" invalid={!!errors.order} {...register("order", { valueAsNumber: true })} />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {project ? "Save changes" : "Add project"}
        </Button>
      </div>
    </form>
  );
}

export default function ProjectsAdmin() {
  useTitle("Projects | Portfulio admin");
  const { data: projects, isPending, isError, error, refetch } = useAdminProjects();
  const remove = useDeleteProject();
  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  return (
    <>
      <PageHeader
        title="Projects"
        description="The work shown on your site. Drafts stay hidden until you publish them."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden />
            Add project
          </Button>
        }
      />

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {projects?.length === 0 && (
        <EmptyState title="No projects yet" text="Add your first project so visitors can see what you've built." action={<Button onClick={() => setEditing("new")}>Add your first project</Button>} />
      )}

      {projects && projects.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {projects.map((project) => (
            <li key={project.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold">{project.title}</h2>
                  <Chip tone={project.published ? "teal" : "muted"}>{project.published ? "Published" : "Draft"}</Chip>
                  {project.featured && <Chip tone="gold">Featured</Chip>}
                </div>
                <p className="mt-1 truncate text-sm text-mute">{project.summary}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="px-4 py-2" onClick={() => setEditing(project)} aria-label={`Edit ${project.title}`}>
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </Button>
                <Button variant="ghost" className="px-3 py-2 text-danger hover:bg-danger/10" onClick={() => setDeleting(project)} aria-label={`Delete ${project.title}`}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add a project" : "Edit project"} wide>
        {editing !== null && <ProjectForm project={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this project?"
        text={`"${deleting?.title ?? ""}" will be removed from your site. This can't be undone.`}
        confirmLabel="Delete project"
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Project deleted"); setDeleting(null); } })}
      />
    </>
  );
}
