import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useSaveProfile } from "@/api/profile";
import { Button, ErrorState, Field, Input, PageHeader, Skeleton, Textarea } from "@/components/ui";
import { profileFormSchema, type Profile, type ProfileFormValues } from "@/schemas";
import { emptyToNull, useTitle } from "@/lib/utils";

const toForm = (profile: Profile | null | undefined): ProfileFormValues => ({
  fullName: profile?.fullName ?? "",
  headline: profile?.headline ?? "",
  bio: profile?.bio ?? "",
  location: profile?.location ?? "",
  contactEmail: profile?.contactEmail ?? "",
  avatarUrl: profile?.avatarUrl ?? "",
  resumeUrl: profile?.resumeUrl ?? "",
  socialLinks: profile?.socialLinks.map(({ platform, url }) => ({ platform, url })) ?? [],
});

function ProfileForm({ profile }: { profile: Profile | null }) {
  const save = useSaveProfile();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileFormSchema), defaultValues: toForm(profile) });
  const links = useFieldArray({ control, name: "socialLinks" });

  const onSubmit = (values: ProfileFormValues) =>
    save.mutate(
      {
        fullName: values.fullName.trim(),
        headline: values.headline.trim(),
        bio: values.bio.trim(),
        location: emptyToNull(values.location),
        contactEmail: emptyToNull(values.contactEmail),
        avatarUrl: emptyToNull(values.avatarUrl),
        resumeUrl: emptyToNull(values.resumeUrl),
        socialLinks: values.socialLinks.map((link, index) => ({ platform: link.platform.trim(), url: link.url.trim(), order: index })),
      },
      { onSuccess: () => toast.success("Profile saved") },
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <section className="space-y-5 rounded-2xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold">About you</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="f-name" error={errors.fullName?.message}>
            <Input id="f-name" autoComplete="name" invalid={!!errors.fullName} {...register("fullName")} />
          </Field>
          <Field label="Headline" htmlFor="f-headline" error={errors.headline?.message}>
            <Input id="f-headline" placeholder="Full-Stack Developer" invalid={!!errors.headline} {...register("headline")} />
          </Field>
        </div>
        <Field label="Bio" htmlFor="f-bio" error={errors.bio?.message} hint="Two or three sentences about what you build and what you're looking for.">
          <Textarea id="f-bio" rows={5} invalid={!!errors.bio} {...register("bio")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Location" htmlFor="f-location">
            <Input id="f-location" placeholder="Dhaka, Bangladesh" {...register("location")} />
          </Field>
          <Field label="Contact email" htmlFor="f-email" error={errors.contactEmail?.message}>
            <Input id="f-email" type="email" invalid={!!errors.contactEmail} {...register("contactEmail")} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Photo link" htmlFor="f-avatar" error={errors.avatarUrl?.message}>
            <Input id="f-avatar" type="url" placeholder="https://" invalid={!!errors.avatarUrl} {...register("avatarUrl")} />
          </Field>
          <Field label="Resume link" htmlFor="f-resume" error={errors.resumeUrl?.message}>
            <Input id="f-resume" type="url" placeholder="https://" invalid={!!errors.resumeUrl} {...register("resumeUrl")} />
          </Field>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-extrabold">Links</h2>
          <Button type="button" variant="secondary" className="px-4 py-2" onClick={() => links.append({ platform: "", url: "" })}>
            <Plus className="size-4" aria-hidden />
            Add link
          </Button>
        </div>
        {links.fields.length === 0 && <p className="text-mute">Add your GitHub, LinkedIn or any other place people can find you.</p>}
        {links.fields.map((field, index) => (
          <div key={field.id} className="grid items-start gap-4 sm:grid-cols-[180px_1fr_auto]">
            <Field label="Name" htmlFor={`link-name-${index}`} error={errors.socialLinks?.[index]?.platform?.message}>
              <Input id={`link-name-${index}`} placeholder="GitHub" invalid={!!errors.socialLinks?.[index]?.platform} {...register(`socialLinks.${index}.platform`)} />
            </Field>
            <Field label="Link" htmlFor={`link-url-${index}`} error={errors.socialLinks?.[index]?.url?.message}>
              <Input id={`link-url-${index}`} type="url" placeholder="https://github.com/you" invalid={!!errors.socialLinks?.[index]?.url} {...register(`socialLinks.${index}.url`)} />
            </Field>
            <Button type="button" variant="ghost" className="mt-7 px-3 py-2 text-danger hover:bg-danger/10" aria-label={`Remove link ${index + 1}`} onClick={() => links.remove(index)}>
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        ))}
      </section>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" loading={save.isPending} disabled={!isDirty && profile !== null} className="shadow-lg">
          {save.isPending ? "Saving" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}

export default function ProfileAdmin() {
  useTitle("Profile | Portfulio admin");
  const { data: profile, isPending, isError, error, refetch } = useProfile();

  return (
    <>
      <PageHeader title="Profile" description="The introduction at the top of your site and in the footer." />
      {isPending && <Skeleton className="h-96 w-full" />}
      {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {/* key remounts the form with fresh values after a save */}
      {!isPending && !isError && <ProfileForm key={profile?.id ?? "new"} profile={profile ?? null} />}
    </>
  );
}
