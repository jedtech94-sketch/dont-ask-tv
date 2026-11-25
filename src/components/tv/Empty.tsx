import type { ReactNode } from "react";

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      {children && <p className="mt-2 text-sm text-muted-foreground">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="px-4 pb-6 pt-24 sm:px-8 lg:px-12">
      <h1 className="font-display text-5xl md:text-6xl">{title}</h1>
      {children && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{children}</p>}
    </header>
  );
}
