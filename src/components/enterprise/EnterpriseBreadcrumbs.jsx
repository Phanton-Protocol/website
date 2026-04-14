import { Link, useLocation } from "react-router-dom";

const labels = {
  "/enterprise": "Home",
  "/enterprise/payroll": "Payroll (Coming Soon)",
  "/enterprise/compliance": "Compliance",
  "/enterprise/governance": "Governance",
  "/enterprise/audit": "Audit",
};

export default function EnterpriseBreadcrumbs() {
  const location = useLocation();
  const current = labels[location.pathname] || "Module";
  return (
    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginBottom: 10 }}>
      <Link to="/enterprise" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>Enterprise</Link>
      <span> / </span>
      <span>{current}</span>
    </div>
  );
}
