/**
 * Home Page - Portfolio List
 */

import { PortfolioList } from "@/components/portfolio";
import { ProtectedRoute } from "@/lib/auth/protected-route";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <PortfolioList />
    </ProtectedRoute>
  );
}
