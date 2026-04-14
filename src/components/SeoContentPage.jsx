import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import SeoHead from './SeoHead';

const SeoContentPage = ({ title, description, path, heading, intro, bullets }) => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <SeoHead title={title} description={description} path={path} />
      <Navbar />
      <section className="section" style={{ paddingTop: '7rem' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="section-label">Phantom Protocol</div>
          <h1 className="display-lg" style={{ marginBottom: '1.25rem' }}>{heading}</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '65ch', marginBottom: '1.75rem' }}>{intro}</p>
          <ul style={{ marginLeft: '1.2rem', display: 'grid', gap: '0.6rem', color: 'rgba(255,255,255,0.86)' }}>
            {bullets.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <Link to="/trade" className="btn-outline btn-outline-cyan">Open InternalMatching</Link>
            <Link to="/user" className="btn-outline">Open User Console</Link>
            <Link to="/" className="btn-outline">Back to Homepage</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SeoContentPage;
