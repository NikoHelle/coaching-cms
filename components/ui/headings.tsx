import { cn } from "@/lib/utils";

export function Heading1({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h1 className={cn('text-2xl font-bold', className)}>{children}</h1>
}

export function Heading2({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('text-xl font-semibold', className)}>{children}</h2>
}

export function Heading3({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>
}

export function Heading4({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h4 className={cn('text-base font-semibold', className)}>{children}</h4>
}