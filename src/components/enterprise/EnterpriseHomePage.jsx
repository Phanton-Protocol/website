import { Link } from "react-router-dom";

export default function EnterpriseHomePage() {
  return (
    <div>
      <h2 style={{ color: "#fff" }}>Enterprise</h2>
      <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 640 }}>
        Use the main site navigation for product flows. Governance is available below when it ships.
      </p>
      <div style={{ marginTop: 16 }}>
        <Link to="/enterprise/governance" className="btn-outline">
          Governance
        </Link>
      </div>
    </div>
  );
}
