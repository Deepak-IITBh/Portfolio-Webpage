import { profile, links } from '../data/site';
import '../styles/components/Footer.css';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__sign">
          <p className="footer__name">{profile.name}<span className="footer__lamp" aria-hidden="true" /></p>
          <p className="footer__note"><span lang="hi">दीपक</span> means <span className="serif">lamp</span>, hence the amber.</p>
        </div>
        <div className="footer__meta">
          <p>Built from scratch in Bhilai · React + Vite · no trackers.</p>
          <p className="mono footer__links">
            <span>© {year}</span>
            <a className="link" href={links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="link" href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className="link" href={links.resume} target="_blank" rel="noopener noreferrer">Resume</a>
            <a className="link" href="#top">Back to top ↑</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
