import React from 'react';
import Masthead from './Masthead';
import FooterDisclaimer from './FooterDisclaimer';

interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function EditorialShell({ children, className = '' }: Props) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--canvas)' }}>
      <Masthead />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <FooterDisclaimer />
    </div>
  );
}
