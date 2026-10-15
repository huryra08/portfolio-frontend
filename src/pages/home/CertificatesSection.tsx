import { ExternalLink } from "lucide-react";
import { useCertificates } from "@/api/certificates";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { formatMonth } from "@/lib/utils";
import SectionHeading from "./SectionHeading";

export default function CertificatesSection() {
  const { data: items, isPending, isError, error, refetch } = useCertificates();

  return (
    <section id="certificates" className="scroll-mt-20 border-t border-line bg-paper py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading title="Certificates" description="Courses and programs I've completed. Use the verify link to check any of them." />

        {isPending && <Skeleton className="h-40 w-full" />}
        {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
        {items && items.length === 0 && <EmptyState title="Certificates coming soon" text="I'll add what I've completed here shortly." />}

        {items && items.length > 0 && (
          <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {items.map((item) => (
              <li key={item.id} className="flex gap-5 border-t-2 border-ink pt-5">
                {item.imageUrl && <img src={item.imageUrl} alt={`${item.title} certificate`} loading="lazy" className="h-24 w-32 shrink-0 rounded-lg border border-line bg-white object-cover" />}
                <div className="min-w-0">
                  <h3 className="text-xl font-extrabold">{item.title}</h3>
                  <p className="mt-1 font-semibold">{item.issuer}</p>
                  <p className="mt-1 text-sm text-mute">
                    Issued {formatMonth(item.issueDate)}
                    {item.expiryDate ? `, expires ${formatMonth(item.expiryDate)}` : ""}
                  </p>
                  {item.description && <p className="mt-3 text-mute">{item.description}</p>}
                  {(item.credentialId || item.credentialUrl) && (
                    <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      {item.credentialId && <span className="text-mute">ID {item.credentialId}</span>}
                      {item.credentialUrl && (
                        <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold underline underline-offset-4">
                          Verify <ExternalLink className="size-3.5" aria-hidden />
                        </a>
                      )}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
