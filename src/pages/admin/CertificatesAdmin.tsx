import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCertificates, useCreateCertificate, useDeleteCertificate, useUpdateCertificate, type CertificatePayload } from "@/api/certificates";
import { Button, Checkbox, ConfirmDialog, EmptyState, ErrorState, Field, Input, Modal, PageHeader, Skeleton, Textarea } from "@/components/ui";
import { certificateFormSchema, type Certificate, type CertificateFormValues } from "@/schemas";
import { emptyToNull, formatMonth, toDateInput, useTitle } from "@/lib/utils";

const toForm = (item: Certificate | null): CertificateFormValues => ({
  title: item?.title ?? "",
  issuer: item?.issuer ?? "",
  issueDate: item ? toDateInput(item.issueDate) : "",
  expiryDate: item?.expiryDate ? toDateInput(item.expiryDate) : "",
  noExpiry: item ? item.expiryDate === null : true,
  credentialId: item?.credentialId ?? "",
  credentialUrl: item?.credentialUrl ?? "",
  imageUrl: item?.imageUrl ?? "",
  description: item?.description ?? "",
  order: item?.order ?? 0,
});

const toPayload = (values: CertificateFormValues): CertificatePayload => ({
  title: values.title.trim(),
  issuer: values.issuer.trim(),
  issueDate: values.issueDate,
  expiryDate: values.noExpiry || !values.expiryDate ? null : values.expiryDate,
  credentialId: emptyToNull(values.credentialId),
  credentialUrl: emptyToNull(values.credentialUrl),
  imageUrl: emptyToNull(values.imageUrl),
  description: emptyToNull(values.description),
  order: values.order,
});

function CertificateForm({ item, onDone }: { item: Certificate | null; onDone: () => void }) {
  const create = useCreateCertificate();
  const update = useUpdateCertificate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CertificateFormValues>({ resolver: zodResolver(certificateFormSchema), defaultValues: toForm(item) });
  const noExpiry = watch("noExpiry");

  const onSubmit = (values: CertificateFormValues) => {
    const payload = toPayload(values);
    const done = () => {
      toast.success(item ? "Certificate saved" : "Certificate added");
      onDone();
    };
    if (item) update.mutate({ id: item.id, payload }, { onSuccess: done });
    else create.mutate(payload, { onSuccess: done });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Certificate name" htmlFor="ce-title" error={errors.title?.message}>
          <Input id="ce-title" invalid={!!errors.title} {...register("title")} />
        </Field>
        <Field label="Issued by" htmlFor="ce-issuer" error={errors.issuer?.message}>
          <Input id="ce-issuer" placeholder="Apollo, Coursera..." invalid={!!errors.issuer} {...register("issuer")} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Issue date" htmlFor="ce-issue" error={errors.issueDate?.message}>
          <Input id="ce-issue" type="date" invalid={!!errors.issueDate} {...register("issueDate")} />
        </Field>
        <Field label="Expiry date" htmlFor="ce-expiry" error={errors.expiryDate?.message}>
          <Input id="ce-expiry" type="date" disabled={noExpiry} invalid={!!errors.expiryDate} {...register("expiryDate")} />
        </Field>
      </div>
      <Checkbox label="It does not expire" {...register("noExpiry")} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Credential ID (optional)" htmlFor="ce-cred-id">
          <Input id="ce-cred-id" {...register("credentialId")} />
        </Field>
        <Field label="Verify link (optional)" htmlFor="ce-cred-url" error={errors.credentialUrl?.message}>
          <Input id="ce-cred-url" type="url" placeholder="https://" invalid={!!errors.credentialUrl} {...register("credentialUrl")} />
        </Field>
      </div>
      <Field label="Certificate image link (optional)" htmlFor="ce-image" error={errors.imageUrl?.message}>
        <Input id="ce-image" type="url" placeholder="https://" invalid={!!errors.imageUrl} {...register("imageUrl")} />
      </Field>
      <Field label="About it (optional)" htmlFor="ce-description">
        <Textarea id="ce-description" rows={3} {...register("description")} />
      </Field>
      <Field label="Position in list" htmlFor="ce-order" error={errors.order?.message} hint="Lower comes first. Leave at 0 to sort by date.">
        <Input id="ce-order" type="number" className="max-w-32" invalid={!!errors.order} {...register("order", { valueAsNumber: true })} />
      </Field>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" loading={create.isPending || update.isPending}>
          {item ? "Save changes" : "Add certificate"}
        </Button>
      </div>
    </form>
  );
}

export default function CertificatesAdmin() {
  useTitle("Certificates | Portfulio admin");
  const { data: items, isPending, isError, error, refetch } = useCertificates();
  const remove = useDeleteCertificate();
  const [editing, setEditing] = useState<Certificate | "new" | null>(null);
  const [deleting, setDeleting] = useState<Certificate | null>(null);

  return (
    <>
      <PageHeader
        title="Certificates"
        description="Courses and programs you've completed."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" aria-hidden />
            Add certificate
          </Button>
        }
      />

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {items?.length === 0 && <EmptyState title="No certificates yet" text="Add a certificate so visitors can see and verify what you've completed." action={<Button onClick={() => setEditing("new")}>Add your first certificate</Button>} />}

      {items && items.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="text-sm text-mute">
                  {item.issuer}, issued {formatMonth(item.issueDate)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" className="px-4 py-2" onClick={() => setEditing(item)} aria-label={`Edit ${item.title}`}>
                  <Pencil className="size-4" aria-hidden />
                  Edit
                </Button>
                <Button variant="ghost" className="px-3 py-2 text-danger hover:bg-danger/10" onClick={() => setDeleting(item)} aria-label={`Delete ${item.title}`}>
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add certificate" : "Edit certificate"} wide>
        {editing !== null && <CertificateForm item={editing === "new" ? null : editing} onDone={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this certificate?"
        text={`"${deleting?.title ?? ""}" will be removed from your site. This can't be undone.`}
        confirmLabel="Delete certificate"
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => { toast.success("Certificate deleted"); setDeleting(null); } })}
      />
    </>
  );
}
