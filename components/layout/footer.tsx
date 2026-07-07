import Link from 'next/link'
import { GitPullRequest } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-main py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Made by Bhavan</p>
        <Link
          href="https://github.com/Bhavan24/dev-tools-b4"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <GitPullRequest size={15} />
          View on GitHub
        </Link>
      </div>
    </footer>
  )
}
