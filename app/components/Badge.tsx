'use client';

interface BadgeProps {
  children: React.ReactNode;
}

export default function Badge({ children }: BadgeProps) {
  return (
    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
      {children}
    </span>
  );
}