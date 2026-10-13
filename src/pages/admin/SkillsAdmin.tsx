import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateSkill, useDeleteSkill, useSkills, useUpdateSkill } from "@/api/skills";
import { Button, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Select, Skeleton } from "@/components/ui";
import { skillFormSchema, type Skill, type SkillFormValues } from "@/schemas";
import { useTitle } from "@/lib/utils";

const levels = [
  { value: 1, label: "1 - Just started" },
  { value: 2, label: "2 - Learning" },
  { value: 3, label: "3 - Comfortable" },
  { value: 4, label: "4 - Strong" },
  { value: 5, label: "5 - Expert" },
];

function SkillForm({ skill, categories, onDone }: { skill: Skill | null; categories: string[]; onDone: () => void }) {
  const create = useCreateSkill();
  const update = useUpdateSkill();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: { name: skill?.name ?? "", category: skill?.category ?? "", level: skill?.level ?? 3, order: skill?.order ?? 0 },
  });

  const onSubmit = (values: SkillFormValues) => {
    const done = () => {
      toast.success(skill ? "Skill saved" : "Skill added");
      onDone();
    };
    const payload = { ...values, name: values.name.trim(), category: values.category.trim() };
    if (skill) update.mutate({ id: skill.id, payload }, { onSuccess: done });
    else create.mutate(payload, { onSuccess: done });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field label="Skill" htmlFor="s-name" error={errors.name?.message}>
        <Input id="s-name" placeholder="TypeScript" invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field label="Category" htmlFor="s-category" error={errors.category?.message} hint="Skills with the same category are grouped together.">
        <Input id="s-category" list="category-options" placeholder="Backend" invalid={!!errors.category} {...register("category")} />
        <datalist id="category-options">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="How comfortable are you?" htmlFor="s-level" error={errors.level?.message}>
          <Select id="s-level" invalid={!!errors.level} {...register("level", { valueAsNumber: true })}>
            {levels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Position" htmlFor="s-order" error={errors.order?.message} hint="Lower comes first.">
          <Input id="s-order" type="number" invalid={!!errors.order} {...register("order", { valueAsNumber: true })} />
        </Field>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={create.isPending || update.isPending}>
          {skill ? "Save changes" : "Add skill"}
        </Button>
      </div>
    </form>
  );
}

export default function SkillsAdmin() {
  useTitle("Skills | Portfulio admin");
  const { data: skills, isPending, isError, error, refetch } = useSkills();
  const remove = useDeleteSkill();
  const [editing, setEditing] = useState<Skill | "new" | null>(null);
  const [deleting, setDeleting] = useState<Skill | null>(null);
  const categories = [...new Set(skills?.map((skill) => skill.category))];

  return (
    <>
      <PageHeader
        title="Skills"
        description="Technologies and tools you use. You can attach them to projects."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden />
            Add skill
          </Button>
        }
      />

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {skills?.length === 0 && <EmptyState title="No skills yet" text="Add the languages and tools you work with." action={<Button onClick={() => setEditing("new")}>Add your first skill</Button>} />}

      {skills && skills.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {skills.map((skill) => (
            <li key={skill.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold">{skill.name}</h2>
                <p className="text-sm text-mute">
                  {skill.category}
                  {skill.level ? `, level ${skill.level} of 5` : ""}
                  {skill._count ? `, used in ${skill._count.projects} ${skill._count.projects === 1 ? "project" : "projects"}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="px-4 py-2" onClick={() => setEditing(skill)} aria-label={`Edit ${skill.name}`}>
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </Button>
                <Button variant="ghost" className="px-3 py-2 text-danger hover:bg-danger/10" onClick={() => setDeleting(skill)} aria-label={`Delete ${skill.name}`}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add a skill" : "Edit skill"}>
        {editing !== null && <SkillForm skill={editing === "new" ? null : editing} categories={categories} onDone={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this skill?"
        text={`"${deleting?.name ?? ""}" will also be removed from any projects that use it.`}
        confirmLabel="Delete skill"
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Skill deleted"); setDeleting(null); } })}
      />
    </>
  );
}
