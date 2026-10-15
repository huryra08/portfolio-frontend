import { Link } from "react-router-dom";
import { ArrowRight, Check, Circle } from "lucide-react";
import { useAdminProjects } from "@/api/projects";
import { useSkills } from "@/api/skills";
import { useExperience } from "@/api/experience";
import { useEducation } from "@/api/education";
import { useCertificates } from "@/api/certificates";
import { useProfile } from "@/api/profile";
import { useMessages } from "@/api/messages";
import { useMe } from "@/api/auth";
import { PageHeader, Skeleton } from "@/components/ui";
import { cn, useTitle } from "@/lib/utils";

export default function Dashboard() {
  useTitle("Overview | Portfulio admin");
  const { data: me } = useMe();
  const profile = useProfile();
  const projects = useAdminProjects();
  const skills = useSkills();
  const experience = useExperience();
  const education = useEducation();
  const certificates = useCertificates();
  const messages = useMessages();

  const loading = [profile, projects, skills, experience, education, certificates, messages].some((query) => query.isPending);
  const unread = messages.data?.filter((message) => !message.isRead).length ?? 0;
  const published = projects.data?.filter((project) => project.published).length ?? 0;

  const stats = [
    { label: "Published projects", value: published, to: "/admin/projects" },
    { label: "Skills", value: skills.data?.length ?? 0, to: "/admin/skills" },
    { label: "Jobs listed", value: experience.data?.length ?? 0, to: "/admin/experience" },
    { label: "Education entries", value: education.data?.length ?? 0, to: "/admin/education" },
    { label: "Certificates", value: certificates.data?.length ?? 0, to: "/admin/certificates" },
    { label: "Unread messages", value: unread, to: "/admin/messages" },
  ];

  const steps = [
    { done: !!profile.data, label: "Write your profile", text: "Your name, headline and bio show at the top of your site.", to: "/admin/profile" },
    { done: (skills.data?.length ?? 0) > 0, label: "Add your skills", text: "Group them by category, like Frontend or Backend.", to: "/admin/skills" },
    { done: published > 0, label: "Publish your first project", text: "Add a link, a short summary and the skills you used.", to: "/admin/projects" },
    { done: (experience.data?.length ?? 0) > 0, label: "Add your experience", text: "Jobs, internships or courses, newest first.", to: "/admin/experience" },
    { done: (education.data?.length ?? 0) > 0, label: "Add your education", text: "Your school, university or program.", to: "/admin/education" },
    { done: (certificates.data?.length ?? 0) > 0, label: "Add a certificate", text: "Courses you completed, with a link to verify them.", to: "/admin/certificates" },
  ];
  const remaining = steps.filter((step) => !step.done);

  return (
    <>
      <PageHeader title={`Hi ${me?.name ?? "there"}`} description="Here's how your portfolio looks right now." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.to} className="rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink">
            {loading ? <Skeleton className="h-10 w-12" /> : <p className="font-display text-4xl font-extrabold">{stat.value}</p>}
            <p className="mt-1 text-sm font-medium text-mute">{stat.label}</p>
          </Link>
        ))}
      </div>

      {!loading && (
        <section className="mt-10" aria-labelledby="setup-heading">
          <h2 id="setup-heading" className="text-2xl font-extrabold">
            {remaining.length === 0 ? "Your portfolio is ready to share" : `Finish setting up (${steps.length - remaining.length} of ${steps.length} done)`}
          </h2>
          <ul className="mt-5 divide-y divide-line rounded-2xl border border-line bg-white">
            {steps.map((step) => (
              <li key={step.label}>
                <Link to={step.to} className="flex items-center gap-4 p-5 hover:bg-marigold-soft/60">
                  <span className={cn("grid size-7 shrink-0 place-items-center rounded-full border-2", step.done ? "border-teal bg-teal text-white" : "border-ink/30 text-ink/30")}>
                    {step.done ? <Check className="size-4" aria-hidden /> : <Circle className="size-3" aria-hidden />}
                  </span>
                  <span className="flex-1">
                    <span className={cn("block font-bold", step.done && "text-mute line-through")}>{step.label}</span>
                    <span className="block text-sm text-mute">{step.text}</span>
                  </span>
                  <ArrowRight className="size-5 text-ink/40" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
