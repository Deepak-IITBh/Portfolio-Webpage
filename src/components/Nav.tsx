import { useEffect, useRef } from 'react';
import { Icon, type IconName } from './Icon';
import { links } from '../data/site';
import { projects } from '../data/projects';
import { openPalette } from '../lib/search';
import '../styles/components/Nav.css';

const ITEMS: { href: string; label: string; icon: IconName; section: string }[] = [
  { href: '#top', label: 'Home', icon: 'home', section: 'top' },
  { href: '#work', label: 'Work', icon: 'work', section: 'work' },
  { href: '#experience', label: 'Experience', icon: 'timeline', section: 'experience' },
  { href: '#capabilities', label: 'Capabilities', icon: 'grid', section: 'capabilities' },
  { href: '#about', label: 'About', icon: 'user', section: 'about' },
  { href: '#contact', label: 'Contact', icon: 'mail', section: 'contact' },
];

// Floating position indicator: every section, with the five projects nested under Work.
const SHORT_NAME: Record<string, string> = {
  dpr: 'Multilingual DPR',
  'math-agent': 'Math Routing Agent',
  'meeting-agent': 'Meeting Intelligence',
  invoice: 'Invoice Extraction',
  attendance: 'Attendance OMR',
};
const RAIL: { id: string; label: string; sub?: boolean }[] = [
  { id: 'top', label: 'Home' },
  { id: 'ask', label: 'Ask' },
  { id: 'work', label: 'Work' },
  ...projects.map((p, i) => ({ id: p.id, label: `${String(i + 1).padStart(2, '0')} ${SHORT_NAME[p.id] ?? p.title}`, sub: true })),
  { id: 'experience', label: 'Experience' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

export function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const iconsRef = useRef<HTMLElement>(null);
  const glideRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const kbdRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const nav = navRef.current!;
    const icons = iconsRef.current!;
    const glide = glideRef.current!;
    const rail = railRef.current!;
    const dock = dockRef.current!;
    const fab = fabRef.current!;
    const toggle = toggleRef.current!;
    if (kbdRef.current && !/Mac|iPhone|iPad/.test(navigator.userAgent)) kbdRef.current.textContent = 'Ctrl K';
    else if (kbdRef.current) kbdRef.current.textContent = '⌘K';

    // ── Which section is the visitor reading? (one source of truth for capsule, dock and rail) ──
    const railLinks = [...rail.querySelectorAll<HTMLAnchorElement>('[data-rail-link]')];
    const railIds = railLinks.map((a) => a.dataset.railLink!);
    const targets = railIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const projectIds = new Set(railIds.slice(railIds.indexOf('work') + 1, railIds.indexOf('experience')));
    const navFor = (id: string) => (id === 'ask' ? 'top' : projectIds.has(id) ? 'work' : id);
    const navLinks = [...nav.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'), ...dock.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
    const iconLinks = [...icons.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];

    let activeIcon: HTMLElement | undefined;
    const placeGlide = (el: HTMLElement | undefined, preview = false) => {
      if (!el || !el.offsetParent) return;
      glide.style.transform = `translateX(${el.offsetLeft}px)`;
      glide.classList.add('is-shown');
      glide.classList.toggle('is-preview', preview);
    };

    let current = '';
    let flashTimer: number | undefined;
    const update = () => {
      const line = innerHeight * 0.4;
      let id = targets[0]?.id ?? 'top';
      for (const t of targets) if (t.getBoundingClientRect().top <= line) id = t.id;
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) id = 'contact';
      if (id === current) return;
      current = id;
      const section = navFor(id);

      navLinks.forEach((a) => {
        const on = a.dataset.navLink === section;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      activeIcon = iconLinks.find((a) => a.dataset.navLink === section);
      placeGlide(activeIcon);

      rail.classList.add('is-flash');
      window.clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => rail.classList.remove('is-flash'), 1600);
      railLinks.forEach((a) => {
        const rid = a.dataset.railLink!;
        a.classList.toggle('is-active', rid === id);
        a.classList.toggle('is-parent', rid === 'work' && projectIds.has(id));
        if (rid === id) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    };

    // Contact has its own form + links, so the floating ask button steps aside there.
    let inContact = false;
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', scrollY > 8);
      const pastHero = scrollY > innerHeight * 0.6;
      fab.classList.toggle('is-shown', pastHero && !inContact);
      rail.classList.toggle('is-shown', pastHero);
      update();
    };
    const contact = document.getElementById('contact');
    const contactObserver = contact
      ? new IntersectionObserver(([e]) => {
          inContact = e.isIntersecting;
          onScroll();
        }, { rootMargin: '0px 0px -30% 0px' })
      : null;
    if (contact) contactObserver!.observe(contact);

    let ticking = false;
    const onScrollThrottled = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        onScroll();
      });
    };
    const onResize = () => placeGlide(activeIcon);
    window.addEventListener('scroll', onScrollThrottled, { passive: true });
    window.addEventListener('resize', onResize);
    onScroll();
    // Enable the glide's spring only after it has been placed, so it doesn't fly in on load.
    const ready = requestAnimationFrame(() => requestAnimationFrame(() => glide.classList.add('is-ready')));

    // Hover / focus previews where the glide would go; it settles back on the active section.
    const cleanups: (() => void)[] = [];
    iconLinks.forEach((a) => {
      const enter = () => placeGlide(a, a !== activeIcon);
      const leave = () => placeGlide(activeIcon);
      a.addEventListener('pointerenter', enter);
      a.addEventListener('focus', enter);
      a.addEventListener('blur', leave);
      cleanups.push(() => {
        a.removeEventListener('pointerenter', enter);
        a.removeEventListener('focus', enter);
        a.removeEventListener('blur', leave);
      });
    });
    const leaveIcons = () => placeGlide(activeIcon);
    icons.addEventListener('pointerleave', leaveIcons);

    // ── Theme toggle is a light switch: the new theme spreads out in a circle from the button. ──
    const root = document.documentElement;
    const onToggle = () => {
      const next = root.dataset.theme === 'light' ? 'dark' : 'light';
      const apply = () => {
        root.dataset.theme = next;
        try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
      };
      const doc = document as ViewTransitionDoc;
      if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        apply();
        return;
      }
      const r = toggle.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      void doc.startViewTransition(apply).ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
        );
      });
    };
    toggle.addEventListener('click', onToggle);

    return () => {
      window.removeEventListener('scroll', onScrollThrottled);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(ready);
      window.clearTimeout(flashTimer);
      contactObserver?.disconnect();
      icons.removeEventListener('pointerleave', leaveIcons);
      toggle.removeEventListener('click', onToggle);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <header className="nav" ref={navRef}>
        <div className="capsule">
          <a href="#top" className="mark" aria-label="Deepak — home">
            <span className="mark__name">Deepak</span><span className="mark__lamp" aria-hidden="true" />
          </a>

          <span className="sep sep--wide" aria-hidden="true" />

          <nav className="nav__icons" aria-label="Primary" ref={iconsRef}>
            <span className="glide" aria-hidden="true" ref={glideRef} />
            <ul>
              {ITEMS.map((item) => (
                <li key={item.section}>
                  <a href={item.href} className="ico" data-nav-link={item.section}>
                    <Icon name={item.icon} size={19} />
                    <span className="tip">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <span className="sep sep--wide" aria-hidden="true" />

          <div className="nav__tools">
            <button className="ico" type="button" onClick={openPalette}>
              <Icon name="search" size={18} />
              <span className="tip">Search <span className="tip__kbd" ref={kbdRef}>Ctrl K</span></span>
            </button>
            <a className="ico" href={links.resume} target="_blank" rel="noopener noreferrer">
              <Icon name="file" size={18} />
              <span className="tip">Resume (PDF)</span>
            </a>
            <button className="ico" type="button" ref={toggleRef}>
              <Icon name="sun" size={18} className="icon-sun" />
              <Icon name="moon" size={18} className="icon-moon" />
              <span className="tip">Switch theme</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating position indicator (wide screens). */}
      <nav className="rail" aria-label="Page position" ref={railRef}>
        <ol>
          {RAIL.map((r) => (
            <li key={r.id}>
              <a href={`#${r.id}`} className={`rail__item${r.sub ? ' rail__item--sub' : ''}`} data-rail-link={r.id}>
                <span className="rail__label mono">{r.label}</span>
                <span className="rail__tick" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Phones: app-style dock. */}
      <nav className="dock" aria-label="Sections" ref={dockRef}>
        <ul>
          {ITEMS.map((item) => (
            <li key={item.section}>
              <a href={item.href} className="dock__item" data-nav-link={item.section}>
                <Icon name={item.icon} size={20} />
                <span>{item.label === 'Capabilities' ? 'Skills' : item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Floating ask-my-work: the same BM25 palette, one click away. */}
      <button className="fab" type="button" ref={fabRef} onClick={openPalette} aria-label="Ask my work: search everything on this page">
        <span className="fab__icon"><Icon name="spark" size={20} /></span>
        <span className="fab__label" aria-hidden="true">Ask my work</span>
      </button>
    </>
  );
}
