import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <Logo className="mx-auto mb-8" />
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sorry, we couldn&apos;t find what you&apos;re looking for. The page may have moved, or
          the link is wrong.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Back to homepage</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">Browse marketplace</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
