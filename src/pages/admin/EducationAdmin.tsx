import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateEducation, useDeleteEducation, useEducation, useUpdateEducation, type EducationPayload } from "@/api/education";
import { Button, Checkbox, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton, Textarea } from "@/components/ui";
import { educationFormSchema, type Education, type EducationFormValues } from "@/schemas";
import { emptyToNull, formatMonth, toDateInput, useTitle } from "@/lib/utils";

const toForm = (item: Education | null): EducationFormValues => ({
  institution: item?.institution ?? "",
  degree: item?.degree ?? "",
  field: item?.field ?? "",
  grade: item?.grade ?? "",
  location: item?.location ?? "",
  description: item?.description ?? "",
  startDate: item ? toDateInput(item.startDate) : "",
  endDate: item?.endDate ? toDateInput(item.endDate) : "",
  current: item ? item.endDate === null : false,
  order: item?.order ?? 0,
});

const toPayload = (values: EducationFormValues): EducationPayload => ({
  institution: values.institution.trim(),
  degree: values.degree.trim(),
  field: emptyToNull(values.field),
  grade: emptyToNull(values.grade),
  location: emptyToNull(values.location),
  description: emptyToNull(values.description),
  startDate: values.startDate,
  endDate: values.current ? null : values.endDate,
  order: values.order,
});

function EducationForm({ item, onDone }: { item: Education | null; onDone: () => void }) {
  const create = useCreateEducation();
  const update = useUpdateEducation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EducationFormValues>({ resolver: zodResolver(educationFormSchema), defaultValues: toForm(item) });
  const current = watch("current");

  const onSubmit = (values: EducationFormValues) => {
    const payload = toPayload(values);
    const done = () => {
      toast.success(item ? "Education saved" : "Education added");
      onDone();
    };
    if (item) update.mutate({ id: item.id, payload }, { onSuccess: done });
    else create.mutate(payload, { onSuccess: done });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field label="School or university" htmlFor="ed-institution" error={errors.institution?.message}>
        <Input id="ed-institution" invalid={!!errors.institution} {...register("institution")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Degree or program" htmlFor="ed-degree" error={errors.degree?.message}>
          <Input id="ed-degree" placeholder="BSc" invalid={!!errors.degree} {...register("degree")} />
        </Field>
        <Field label="Field of study (optional)" htmlFor="ed-field">
          <Input id="ed-field" placeholder="Computer Science" {...register("field")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Grade (optional)" htmlFor="ed-grade">
          <Input id="ed-grade" placeholder="GPA 3.8" {...register("grade")} />
        </Field>
        <Field label="Location (optional)" htmlFor="ed-location">
          <Input id="ed-location" placeholder="Dhaka" {...register("location")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Start date" htmlFor="ed-start" error={errors.startDate?.message}>
          <Input id="ed-start" type="date" invalid={!!errors.startDate} {...register("startDate")} />
        </Field>
        <Field label="End date" htmlFor="ed-end" error={errors.endDate?.message}>
          <Input id="ed-end" type="date" disabled={current} invalid={!!errors.endDate} {...register("endDate")} />
        </Field>
      </div>
      <Checkbox label="I study here now" {...register("current")} />
      <Field label="About it (optional)" htmlFor="ed-description" hint="Main subjects, projects or achievements.">
        <Textarea id="ed-description" rows={4} {...register("description")} />
      </Field>
      <Field label="Position in list" htmlFor="ed-order" error={errors.order?.message} hint="Lower comes first. Leave at 0 to sort by date.">
        <Input id="ed-order" type="number" className="max-w-32" invalid={!!errors.order} {...register("order", { valueAsNumber: true })} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={create.isPending || update.isPending}>
          {item ? "Save changes" : "Add education"}
        </Button>
      </div>
    </form>
  );
}

export default function EducationAdmin() {
  useTitle("Education | Portfulio admin");
  const { data: items, isPending, isError, error, refetch } = useEducation();
  const remove = useDeleteEducation();
  const [editing, setEditing] = useState<Education | "new" | null>(null);
  const [deleting, setDeleting] = useState<Education | null>(null);

  return (
    <>
      <PageHeader
        title="Education"
        description="Schools, universities and programs, shown on your site."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden />
            Add education
          </Button>
        }
      />

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {items?.length === 0 && <EmptyState title="No education yet" text="Add your school, university or program." action={<Button onClick={() => setEditing("new")}>Add your first entry</Button>} />}

      {items && items.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold">{item.institution}</h2>
                <p className="text-sm text-mute">
                  {item.degree}
                  {item.field ? `, ${item.field}` : ""} ({formatMonth(item.startDate)} to {item.endDate ? formatMonth(item.endDate) : "now"})
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="px-4 py-2" onClick={() => setEditing(item)} aria-label={`Edit ${item.institution}`}>
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </Button>
                <Button variant="ghost" className="px-3 py-2 text-danger hover:bg-danger/10" onClick={() => setDeleting(item)} aria-label={`Delete ${item.institution}`}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add education" : "Edit education"} wide>
        {editing !== null && <EducationForm item={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this entry?"
        text={`"${deleting?.institution ?? ""}" will be removed from your site. This can't be undone.`}
        confirmLabel="Delete entry"
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Entry deleted"); setDeleting(null); } })}
      />
    </>
  );
}
