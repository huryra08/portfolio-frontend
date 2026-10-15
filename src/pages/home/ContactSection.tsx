import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Mail, Phone } from "lucide-react";
import { useSendMessage } from "@/api/messages";
import { useProfile } from "@/api/profile";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { contactSchema, type ContactValues } from "@/schemas";
import SectionHeading from "./SectionHeading";

export default function ContactSection() {
  const { data: profile } = useProfile();
  const send = useSendMessage();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", body: "" },
  });

  const onSubmit = (values: ContactValues) =>
    send.mutate(values, {
      onSuccess: () => {
        reset();
        setSent(true);
      },
    });

  return (
    <section id="contact" className="scroll-mt-20 border-t border-line bg-white py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading title="Let's work together" description="Have a project, a job opening or a question? Send a message and I'll reply by email." />
          <div className="flex flex-col items-start gap-3">
            {profile?.contactEmail && (
              <a href={`mailto:${profile.contactEmail}`} className="inline-flex items-center gap-2 text-lg font-semibold underline underline-offset-4">
                <Mail className="size-5" aria-hidden />
                {profile.contactEmail}
              </a>
            )}
            {profile?.phone && (
              <a href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-2 text-lg font-semibold underline underline-offset-4">
                <Phone className="size-5" aria-hidden />
                {profile.phone}
              </a>
            )}
          </div>
        </div>

        {sent ? (
          <div role="status" className="self-start rounded-2xl border-2 border-ink bg-marigold-soft p-8">
            <CheckCircle2 className="size-8 text-teal" aria-hidden />
            <h3 className="mt-3 text-2xl font-extrabold">Message sent</h3>
            <p className="mt-2 text-mute">Thanks for reaching out. I'll get back to you by email soon.</p>
            <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-2xl border border-line bg-paper p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name" htmlFor="c-name" error={errors.name?.message}>
                <Input id="c-name" autoComplete="name" invalid={!!errors.name} {...register("name")} />
              </Field>
              <Field label="Your email" htmlFor="c-email" error={errors.email?.message}>
                <Input id="c-email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} />
              </Field>
            </div>
            <Field label="Subject (optional)" htmlFor="c-subject" error={errors.subject?.message}>
              <Input id="c-subject" invalid={!!errors.subject} {...register("subject")} />
            </Field>
            <Field label="Message" htmlFor="c-body" error={errors.body?.message}>
              <Textarea id="c-body" rows={5} invalid={!!errors.body} {...register("body")} />
            </Field>
            <Button type="submit" loading={send.isPending}>
              {send.isPending ? "Sending" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
