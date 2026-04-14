import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import SeoHead from "./SeoHead";
import { blogPosts } from "../data/blogPosts";

export default function BlogIndexPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <SeoHead
        title="Phantom Protocol Blog | Private DeFi Explained"
        description="Human-friendly articles on Phantom Protocol, private DeFi architecture, relayers, shielded pools, and enterprise use cases."
        path="/blog"
      />
      <Navbar />
      <section className="section" style={{ paddingTop: "7rem" }}>
        <div className="container" style={{ maxWidth: 920 }}>
          <div className="section-label">Blog</div>
          <h1 className="display-lg" style={{ marginBottom: "1.25rem" }}>Phantom <em>articles.</em></h1>
          <div style={{ display: "grid", gap: "1rem" }}>
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="card"
                style={{ textDecoration: "none", color: "inherit", padding: "1.4rem" }}
              >
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.65rem", marginBottom: "0.5rem" }}>{post.title}</h2>
                <p style={{ color: "rgba(255,255,255,0.75)" }}>{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
