import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateExperience, useDeleteExperience, useExperience, useUpdateExperience, type ExperiencePayload } from "@/api/experience";
import { Button, Checkbox, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton, Textarea } from "@/components/ui";
import { experienceFormSchema, type Experience, type ExperienceFormValues } from "@/schemas";
import { emptyToNull, formatMonth, toDateInput, useTitle } from "@/lib/utils";

const toForm = (item: Experience | null): ExperienceFormValues => ({
  company: item?.company ?? "",
  position: item?.position ?? "",
  location: item?.location ?? "",
  description: item?.description ?? "",
  startDate: item ? toDateInput(item.startDate) : "",
  endDate: item?.endDate ? toDateInput(item.endDate) : "",
  current: item ? item.endDate === null : false,
  order: item?.order ?? 0,
});

const toPayload = (values: ExperienceFormValues): ExperiencePayload => ({
  company: values.company.trim(),
  position: values.position.trim(),
  location: emptyToNull(values.location),
  description: emptyToNull(values.description),
  startDate: values.startDate,
  endDate: values.current ? null : values.endDate,
  order: values.order,
});

function ExperienceForm({ item, onDone }: { item: Experience | null; onDone: () => void }) {
  const create = useCreateExperience();
  const update = useUpdateExperience();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExperienceFormValues>({ resolver: zodResolver(experienceFormSchema), defaultValues: toForm(item) });
  const current = watch("current");

  const onSubmit = (values: ExperienceFormValues) => {
    const payload = toPayload(values);
    const done = () => {
      toast.success(item ? "Experience saved" : "Experience added");
      onDone();
    };
    if (item) update.mutate({ id: item.id, payload }, { onSuccess: done });
    else create.mutate(payload, { onSuccess: done });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Position" htmlFor="e-position" error={errors.position?.message}>
          <Input id="e-position" invalid={!!errors.position} {...register("position")} />
        </Field>
        <Field label="Company" htmlFor="e-company" error={errors.company?.message}>
          <Input id="e-company" invalid={!!errors.company} {...register("company")} />
        </Field>
      </div>
      <Field label="Location (optional)" htmlFor="e-location">
        <Input id="e-location" placeholder="Remote, or a city" {...register("location")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Start date" htmlFor="e-start" error={errors.startDate?.message}>
          <Input id="e-start" type="date" invalid={!!errors.startDate} {...register("startDate")} />
        </Field>
        <Field label="End date" htmlFor="e-end" error={errors.endDate?.message}>
          <Input id="e-end" type="date" disabled={current} invalid={!!errors.endDate} {...register("endDate")} />
        </Field>
      </div>
      <Checkbox label="I work here now" {...register("current")} />
      <Field label="What you did (optional)" htmlFor="e-description">
        <Textarea id="e-description" rows={4} {...register("description")} />
      </Field>
      <Field label="Position in list" htmlFor="e-order" error={errors.order?.message} hint="Lower comes first. Leave at 0 to sort by date.">
        <Input id="e-order" type="number" className="max-w-32" invalid={!!errors.order} {...register("order", { valueAsNumber: true })} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={create.isPending || update.isPending}>
          {item ? "Save changes" : "Add experience"}
        </Button>
      </div>
    </form>
  );
}

export default function ExperienceAdmin() {
  useTitle("Experience | Portfulio admin");
  const { data: items, isPending, isError, error, refetch } = useExperience();
  const remove = useDeleteExperience();
  const [editing, setEditing] = useState<Experience | "new" | null>(null);
  const [deleting, setDeleting] = useState<Experience | null>(null);

  return (
    <>
      <PageHeader
        title="Experience"
        description="Jobs, internships and training, shown as a timeline on your site."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden />
            Add experience
          </Button>
        }
      />

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {items?.length === 0 && <EmptyState title="No experience yet" text="Add a job, internship or course to start your timeline." action={<Button onClick={() => setEditing("new")}>Add your first entry</Button>} />}

      {items && items.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold">
                  {item.position} at {item.company}
                </h2>
                <p className="text-sm text-mute">
                  {formatMonth(item.startDate)} to {item.endDate ? formatMonth(item.endDate) : "now"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="px-4 py-2" onClick={() => setEditing(item)} aria-label={`Edit ${item.position} at ${item.company}`}>
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </Button>
                <Button variant="ghost" className="px-3 py-2 text-danger hover:bg-danger/10" onClick={() => setDeleting(item)} aria-label={`Delete ${item.position} at ${item.company}`}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add experience" : "Edit experience"} wide>
        {editing !== null && <ExperienceForm item={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this entry?"
        text="It will be removed from your timeline. This can't be undone."
        confirmLabel="Delete entry"
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Entry deleted"); setDeleting(null); } })}
      />
    </>
  );
}
