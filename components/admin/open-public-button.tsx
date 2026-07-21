import { Button } from '@/components/ui/button'

export function OpenPublicButton({ href }: { href: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      render={
        <a href={href} target="_blank" rel="noopener noreferrer">
          Open ↗
        </a>
      }
    >
      Open ↗
    </Button>
  )
}
