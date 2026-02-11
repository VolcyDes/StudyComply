import RoleGate from '../_components/RoleGate';

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate requiredRole="UNIVERSITY" fallbackPath="/dashboard/student">
      {children}
    </RoleGate>
  );
}
