import { cn } from "@/lib/utils";

export function Heading1({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h1 className={cn('font-display text-3xl text-ink sm:text-4xl', className)}>{children}</h1>
}

export function Heading2({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('font-display text-2xl text-ink', className)}>{children}</h2>
}

export function Heading3({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('text-xs font-bold uppercase tracking-widest text-team-deep', className)}>
      {children}
    </h3>
  )
}

export function Heading4({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h4 className={cn('text-base font-semibold text-ink', className)}>{children}</h4>
}
