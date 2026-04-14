import EnterpriseBreadcrumbs from "./EnterpriseBreadcrumbs";
import { useLocation } from "react-router-dom";

export default function EnterpriseLayout({ children }) {
  const location = useLocation();
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <main key={location.pathname} style={{ minWidth: 0 }}>
        <EnterpriseBreadcrumbs />
        {children}
      </main>
    </div>
  );
}
