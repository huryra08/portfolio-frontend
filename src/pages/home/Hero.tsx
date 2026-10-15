import { Link } from "react-router-dom";
import { ArrowDown, ExternalLink, FileText, MapPin, Phone } from "lucide-react";
import { useProfile } from "@/api/profile";
import { initials } from "@/lib/utils";
import { ErrorState, Skeleton } from "@/components/ui";

export default function Hero() {
  const { data: profile, isPending, isError, error, refetch } = useProfile();

  if (isPending) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-24" aria-busy="true">
        <Skeleton className="h-24 w-3/4" />
        <Skeleton className="mt-6 h-8 w-1/2" />
        <Skeleton className="mt-8 h-24 w-full max-w-xl" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-24">
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="mx-auto max-w-6xl px-5 py-28">
        <h1 className="text-5xl font-extrabold sm:text-6xl">This portfolio is still being set up.</h1>
        <p className="mt-5 max-w-xl text-lg text-mute">Check back soon. If this is your site, log in to add your name, projects and skills.</p>
        <Link to="/admin" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-ink/85">
          Set up your portfolio
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 md:grid-cols-[1fr_auto] md:pb-28 md:pt-24">
      <div>
        <h1 className="break-words text-5xl font-extrabold leading-[0.95] sm:text-7xl lg:text-8xl">{profile.fullName}</h1>
        <p className="mt-6 font-display text-2xl font-bold text-ink/80 sm:text-3xl">{profile.headline}</p>
        <p className="mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed text-mute">{profile.bio}</p>

        {(profile.location || profile.phone) && (
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-mute">
            {profile.location && (
              <p className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden />
                {profile.location}
              </p>
            )}
            {profile.phone && (
              <a href={`tel:${profile.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 hover:text-ink">
                <Phone className="size-4" aria-hidden />
                {profile.phone}
              </a>
            )}
          </div>
        )}

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link to="/#projects" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-ink/85">
            See my work
            <ArrowDown className="size-4" aria-hidden />
          </Link>
          <Link to="/#contact" className="rounded-full border border-ink/25 bg-white px-6 py-3 font-semibold hover:border-ink">
            Get in touch
          </Link>
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-3 font-semibold underline-offset-4 hover:underline">
              <FileText className="size-4" aria-hidden />
              Resume
            </a>
          )}
        </div>

        {profile.socialLinks.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {profile.socialLinks.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-ink/80 underline-offset-4 hover:text-ink hover:underline">
                  {link.platform}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* the one loud element: a photo block with a marigold offset */}
      <div className="hidden md:block">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`Portrait of ${profile.fullName}`} className="size-72 rounded-3xl border-2 border-ink object-cover shadow-[14px_14px_0_var(--color-marigold)] lg:size-80" />
        ) : (
          <div aria-hidden className="grid size-72 place-items-center rounded-3xl border-2 border-ink bg-white font-display text-8xl font-extrabold shadow-[14px_14px_0_var(--color-marigold)] lg:size-80">
            {initials(profile.fullName)}
          </div>
        )}
      </div>
    </section>
  );
}
