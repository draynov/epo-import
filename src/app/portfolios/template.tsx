/**
 * Portfolio Pages Template
 * Wraps all portfolio pages with authentication
 */

import { ProtectedRoute } from "@/lib/auth/protected-route";

export default function PortfoliosTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
