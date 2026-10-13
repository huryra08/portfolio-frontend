import { useEffect, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Button ---------- */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

const buttonStyles = {
  primary: "bg-ink text-white hover:bg-ink/85",
  secondary: "border border-ink/25 bg-white text-ink hover:border-ink",
  ghost: "text-ink hover:bg-ink/5",
  danger: "bg-danger text-white hover:bg-danger/90",
};

export function Button({ variant = "primary", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        buttonStyles[variant],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Form fields ---------- */
const fieldBase =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-mute/70 transition-colors focus:border-ink";

export function Input({ invalid, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...props} aria-invalid={invalid || undefined} className={cn(fieldBase, invalid ? "border-danger" : "border-line", className)} />;
}

export function Textarea({ invalid, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea {...props} aria-invalid={invalid || undefined} className={cn(fieldBase, "min-h-28 resize-y", invalid ? "border-danger" : "border-line", className)} />;
}

export function Select({ invalid, className, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return <select {...props} aria-invalid={invalid || undefined} className={cn(fieldBase, invalid ? "border-danger" : "border-line", className)} />;
}

export function Field({ label, htmlFor, error, hint, children }: { label: string; htmlFor: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-sm text-mute">{hint}</p>}
      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" {...props} className="mt-0.5 size-5 shrink-0 cursor-pointer accent-ink" />
      <span>
        <span className="block text-[15px] font-semibold">{label}</span>
        {hint && <span className="block text-sm text-mute">{hint}</span>}
      </span>
    </label>
  );
}

/* ---------- Feedback ---------- */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-ink/8", className)} />;
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-mute">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/25 bg-white/60 px-6 py-12 text-center">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-mute">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-2xl border border-danger/30 bg-white px-6 py-10 text-center">
      <AlertCircle className="size-7 text-danger" aria-hidden />
      <div>
        <h3 className="text-lg font-bold">Couldn't load this</h3>
        <p className="mt-1 text-mute">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Chip({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "gold" | "teal" | "muted" }) {
  const tones = {
    plain: "border border-line bg-white text-ink",
    gold: "bg-marigold text-ink",
    teal: "bg-teal/10 text-teal",
    muted: "bg-ink/8 text-mute",
  };
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", tones[tone])}>{children}</span>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {description && <p className="mt-1 max-w-xl text-mute">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Modal (native <dialog>: focus trap + Esc handled by the browser) ---------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className={cn("m-auto w-[calc(100%-2rem)] rounded-2xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/50", wide ? "max-w-2xl" : "max-w-md")}
    >
      {open && (
        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 className="text-2xl font-extrabold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-mute hover:bg-ink/8 hover:text-ink">
              <X className="size-5" aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({ open, title, text, confirmLabel, loading, onConfirm, onClose }: { open: boolean; title: string; text: string; confirmLabel: string; loading?: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-mute">{text}</p>
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Keep it
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
