import type { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-frame">
      <div className="ambient ambient--left" />
      <div className="ambient ambient--right" />
      {children}
    </div>
  );
}
