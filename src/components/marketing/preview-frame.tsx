import { cn } from "@/lib/utils";

/** Small "browser window" chrome used to frame desktop mockups. */
export function BrowserFrame({
  url,
  className,
  children,
}: {
  url: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-elevated",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
        <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-xs text-ink-400 ring-1 ring-inset ring-ink-100">
          {url}
        </span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/** Small "phone" chrome used to frame mobile mockups. */
export function PhoneFrame({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[280px] overflow-hidden rounded-[2rem] border-8 border-ink-900 bg-white shadow-elevated",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 pb-1 pt-2 text-[11px] font-semibold text-ink-900">
        <span>9:41</span>
        <span className="h-1.5 w-14 rounded-full bg-ink-900" />
        <span>●●●</span>
      </div>
      <div className="px-4 pb-5">
        <p className="mb-3 text-sm font-bold text-ink-900">{title}</p>
        {children}
      </div>
    </div>
  );
}
