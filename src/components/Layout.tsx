import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <main className="app-shell">
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />
      {children}
    </main>
  );
}
