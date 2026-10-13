import { useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteMessage, useMarkMessageRead, useMessages } from "@/api/messages";
import { Button, ConfirmDialog, EmptyState, ErrorState, PageHeader, Skeleton } from "@/components/ui";
import type { Message } from "@/schemas";
import { cn, formatDateTime, useTitle } from "@/lib/utils";

export default function MessagesAdmin() {
  useTitle("Messages | Portfulio admin");
  const { data: messages, isPending, isError, error, refetch } = useMessages();
  const markRead = useMarkMessageRead();
  const remove = useDeleteMessage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Message | null>(null);

  const selected = messages?.find((message) => message.id === selectedId) ?? null;

  const open = (message: Message) => {
    setSelectedId(message.id);
    if (!message.isRead) markRead.mutate(message.id);
  };

  return (
    <>
      <PageHeader title="Messages" description="Everything sent through your contact form, newest first." />

      {isPending && <Skeleton className="h-64 w-full" />}
      {isError && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {messages?.length === 0 && <EmptyState title="No messages yet" text="When someone uses the contact form on your site, their message shows up here." />}

      {messages && messages.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ul className="divide-y divide-line self-start rounded-2xl border border-line bg-white">
            {messages.map((message) => (
              <li key={message.id}>
                <button
                  type="button"
                  onClick={() => open(message)}
                  aria-current={message.id === selectedId}
                  className={cn("flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-marigold-soft/60", message.id === selectedId && "bg-marigold-soft")}
                >
                  <span aria-label={message.isRead ? "Read" : "Unread"} className={cn("mt-2 size-2.5 shrink-0 rounded-full", message.isRead ? "bg-transparent" : "bg-ink")} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate", message.isRead ? "font-medium" : "font-bold")}>{message.name}</span>
                    <span className="block truncate text-sm text-mute">{message.subject || message.body}</span>
                    <span className="mt-1 block text-xs text-mute">{formatDateTime(message.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <section aria-live="polite" className="self-start rounded-2xl border border-line bg-white p-6">
            {selected ? (
              <>
                <h2 className="text-2xl font-extrabold">{selected.subject || "No subject"}</h2>
                <p className="mt-1 text-mute">
                  From {selected.name} ({selected.email}) on {formatDateTime(selected.createdAt)}
                </p>
                <p className="mt-6 whitespace-pre-line leading-relaxed">{selected.body}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject ?? "Your message"}`)}`}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink/85"
                  >
                    <Mail className="size-4" aria-hidden />
                    Reply by email
                  </a>
                  <Button variant="ghost" className="text-danger hover:bg-danger/10" onClick={() => setDeleting(selected)}>
                    <Trash2 className="size-4" aria-hidden />
                    Delete
                  </Button>
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-mute">Pick a message on the left to read it.</p>
            )}
          </section>
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this message?"
        text={`The message from ${deleting?.name ?? "this visitor"} will be removed for good.`}
        confirmLabel="Delete message"
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success("Message deleted");
              setSelectedId(null);
              setDeleting(null);
            },
          })
        }
      />
    </>
  );
}
