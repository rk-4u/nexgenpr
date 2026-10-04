import ParticleBackground from './ParticleBackground.jsx';
import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '';
const EMAIL = 'enquiry.pankajkumar@gmail.com';
const PHONES = ['9926494532', '7000841088'];

const SERVICES = [
  ['Social Media Marketing', 'Engages audiences, builds brand awareness, drives website traffic.', 'bg-lime'],
  ['Media Relations (PR)', 'Builds relationships, manages reputation, communicates messages, influences public perception.', 'bg-violet'],
  ['Web Design', 'Creates user-friendly, visually appealing, responsive, and functional websites.', 'bg-ember'],
  ['Branding and Graphic Design', 'Creates impactful visuals, strengthens identity, enhances recognition.', 'bg-[#6b8bff]'],
  ['CGI Ads and Video Editing', 'Realistic visual effects and animations for entertainment, advertising.', 'bg-[#6b8bff]'],
  ['Search Engine Optimization', 'Improves rankings, drives traffic, optimizes content, enhances visibility.', 'bg-violet'],
  // NOTE: text was cut off in the source screenshot; reconstructed from visible fragments. Please verify.
  ['Influencer Marketing', 'Leverages influencers to promote brands, build credibility, and drive engagement.', 'bg-lime'],
];
const BLOGS = [
  'The Power of Personalization in Digital Marketing',
  'How to Build an Effective PR Strategy for Your Brand',
  'Top Digital Marketing Trends to Watch in 2025',
  'Effective Crisis Management in PR: What Every Brand Should Know',
];
const TRENDS = [
  ['Artificial Intelligence (AI)', 'AI is becoming a game-changer for marketing strategies. From chatbots to predictive analytics and content personalization, AI helps streamline processes, improve customer experiences, and optimize campaigns.'],
  ['Video Marketing Dominance', 'Video content continues to rise in popularity, with platforms like YouTube, TikTok, and Instagram Reels leading the way. Short-form video is particularly popular, and live-streaming continues to gain traction as a tool for real-time engagement.'],
  ['Augmented Reality (AR)', 'AR is becoming more widely used in digital marketing. Brands use it to allow customers to visualize products in their own space or try on items virtually.'],
  ['Content Repurposing', 'Brands are getting more efficient with their content by repurposing it across different formats. For instance, turning blog posts into infographics, podcasts into YouTube videos, or webinars into social media snippets to maximize reach.'],
];
const TEAM = [
  ['Pankaj Kumar', 'Founder', 'Leads a digital marketing and PR company, specializing in strategy, brand management, content creation, and client relations.'],
  ['Jayesh Acharya', 'Co-Founder', 'Managing client relationships, strategizing marketing campaigns, overseeing content development, and driving company growth and innovation.'],
];
const NAV = [['About', '#about'], ['Services', '#services'], ['Work', '#work'], ['Insights', '#insights'], ['Clients', '#clients'], ['Team', '#team'], ['Contact', '#contact']];

/* ---------- helpers ---------- */
const opt = (u, w) => (u && u.includes('/upload/') ? u.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`) : u);

async function api(path, { method = 'GET', body, token } = {}) {
  const isForm = body instanceof FormData;
  const r = await fetch(API + path, {
    method,
    headers: { ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'Request failed');
  return d;
}

const Img = ({ src, alt, className = '', sizes = '(min-width:1024px) 40vw, 100vw' }) => (
  <img
    src={opt(src, 900)}
    srcSet={src.includes('/upload/') ? `${opt(src, 500)} 500w, ${opt(src, 900)} 900w, ${opt(src, 1600)} 1600w` : undefined}
    sizes={sizes} alt={alt} loading="lazy" decoding="async" className={className}
  />
);

const Cover = ({ p, className = '' }) =>
  p.cover ? <Img src={p.cover} alt={p.title} className={`w-full h-auto block ${className}`} />
    : <div className={`aspect-[4/5] grid place-items-center bg-ink2 text-violet text-8xl font-light ${className}`} aria-label={p.title}>{p.title[0]}</div>;

function useReveal(dep) {
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.1 });
    document.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

const Label = ({ children }) => <p className="font-mono text-xs uppercase tracking-[.25em] text-lime">{children}</p>;
const H2 = 'text-[clamp(2.5rem,7vw,6.5rem)] leading-[.95] tracking-tight font-light';
const pad = 'px-5 md:px-12';

/* ---------- public site ---------- */
function Nav() {
  const [o, setO] = useState(false);
  return (
    <nav className={`fixed top-0 inset-x-0 z-40 flex items-center justify-between ${pad} py-4 bg-ink/80 backdrop-blur`} aria-label="Main">
      <a href="#top" className="flex items-center gap-3" aria-label="NexGenPR home">
        <span className="bg-bone text-ink font-semibold px-2 py-1 leading-none tracking-tighter">NG</span>
        <span className="font-mono text-xs tracking-[.2em] hidden sm:block">NEXGENPR</span>
      </a>
      <ul className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-widest">
        {NAV.map(([n, h]) => <li key={n}><a href={h} className="hover:text-lime transition-colors">{n}</a></li>)}
      </ul>
      <button className="md:hidden font-mono text-xs uppercase tracking-widest" aria-expanded={o} onClick={() => setO(!o)}>{o ? 'Close' : 'Menu'}</button>
      {o && (
        <ul className="md:hidden absolute top-full inset-x-0 bg-ink border-t border-white/10 p-5 space-y-4 text-3xl font-light">
          {NAV.map(([n, h]) => <li key={n}><a href={h} onClick={() => setO(false)}>{n}</a></li>)}
        </ul>
      )}
    </nav>
  );
}

function Modal({ p, onClose }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 bg-ink overflow-y-auto" role="dialog" aria-modal="true" aria-label={p.title}>
      <div className={`${pad} py-6 flex justify-between items-center sticky top-0 bg-ink/90 backdrop-blur z-10`}>
        <Label>{p.category || 'Project'}</Label>
        <button onClick={onClose} className="font-mono text-xs uppercase tracking-widest hover:text-lime">Close ✕</button>
      </div>
      <div className={`${pad} pb-20 grid lg:grid-cols-12 gap-10`}>
        <div className="lg:col-span-7 space-y-6">
          <Cover p={p} />
          {p.images?.map((u, i) => <Img key={u} src={u} alt={`${p.title} ${i + 2}`} className="w-full h-auto block" sizes="(min-width:1024px) 55vw, 100vw" />)}
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <h3 className="text-5xl md:text-7xl font-light leading-none tracking-tight">{p.title}</h3>
          <dl className="mt-8 grid grid-cols-2 gap-4 font-mono text-xs uppercase tracking-widest text-white/60">
            {p.client && <div><dt>Client</dt><dd className="text-bone mt-1">{p.client}</dd></div>}
            {p.year && <div><dt>Year</dt><dd className="text-bone mt-1">{p.year}</dd></div>}
          </dl>
          {p.description && <p className="mt-8 text-lg text-white/75 leading-relaxed whitespace-pre-line">{p.description}</p>}
          {p.tags?.length > 0 && <ul className="mt-6 flex flex-wrap gap-2 font-mono text-xs">{p.tags.map((t) => <li key={t} className="border border-white/25 px-3 py-1">{t}</li>)}</ul>}
          {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-8 bg-lime text-ink font-mono text-sm uppercase tracking-widest px-6 py-3 hover:bg-violet transition-colors">Visit project ↗</a>}
        </div>
      </div>
    </div>
  );
}

const Stars = ({ n }) => (
  <span role="img" aria-label={`${n} out of 5`} className="text-lime tracking-widest">
    {'★'.repeat(n)}<span className="text-white/20">{'★'.repeat(5 - n)}</span>
  </span>
);

function Reviews({ items }) {
  if (!items.length) return null;
  const avg = items.reduce((s, r) => s + r.rating, 0) / items.length;
  return (
    <section id="clients" className={`${pad} py-28 md:py-40`}>
      <div className="rv mb-16 flex flex-wrap items-end justify-between gap-8">
        <div><Label>Clients</Label><h2 className={`${H2} mt-4`}>Kind words<br />from clients</h2></div>
        <div>
          <p className="text-7xl font-light leading-none">{avg.toFixed(1)}<span className="text-3xl text-white/40"> / 5</span></p>
          <div className="mt-3"><Stars n={Math.round(avg)} /></div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/50 mt-2">{items.length} reviews</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-14">
        {items.map((r, i) => (
          <figure key={r._id} className={`rv border-t border-white/15 pt-6 ${i % 2 ? 'md:mt-16' : ''}`}>
            <Stars n={r.rating} />
            <blockquote className="mt-4 text-xl md:text-2xl font-light leading-snug">“{r.text}”</blockquote>
            <figcaption className="mt-6 font-mono text-xs uppercase tracking-widest text-white/60">
              <span className="text-bone">{r.name}</span>{r.company && ` · ${r.company}`}
              {r.demo && <span className="ml-3 text-ember">Demo</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Site() {
    const [projects, setProjects] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [open, setOpen] = useState(null);
    const [cat, setCat] = useState('All');
    useEffect(() => {
    api('/api/projects').then(setProjects).catch(() => setProjects([]));
    api('/api/reviews').then(setReviews).catch(() => {});
    }, []);
    useReveal(`${projects ? projects.length : -1}:${reviews.length}`);

  const list = projects || [];
  const featured = list.filter((p) => p.featured).slice(0, 3);
  const cats = ['All', ...new Set(list.map((p) => p.category).filter(Boolean))];
  const shown = cat === 'All' ? list : list.filter((p) => p.category === cat);
  const span = ['lg:col-span-7', 'lg:col-span-5 lg:mt-32', 'lg:col-span-6 lg:col-start-4'];

  const send = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Enquiry from ' + f.get('name'))}&body=${encodeURIComponent(f.get('message') + '\n\nReply to: ' + f.get('email'))}`;
  };
  const inp = 'w-full bg-transparent border-b border-white/30 focus:border-lime outline-none py-3 text-lg placeholder:text-white/40';

  return (
    <>
    <ParticleBackground/>
      <Nav />
      <main id="top">
        {/* Hero */}
        <header className={`min-h-svh ${pad} pt-28 pb-10 flex flex-col justify-between`}>
          <Label>Since 2025 · Mandsaur, Madhya Pradesh</Label>
          <h1 className="text-[clamp(2.75rem,9.5vw,10rem)] leading-[.92] tracking-tighter font-light my-10">
            Strategic PR and Digital Marketing for <span className="text-violet">Powerful</span> Brand Presence
          </h1>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <p className="font-mono text-xs uppercase tracking-[.25em] text-white/60">NexGenPR</p>
            <a href="#contact" className="bg-bone text-ink font-mono text-sm uppercase tracking-widest px-8 py-4 hover:bg-lime transition-colors">Contact now →</a>
          </div>
        </header>

        {/* About */}
        <section id="about" className={`${pad} py-28 md:py-40 grid lg:grid-cols-12 gap-10`}>
          <div className="lg:col-span-3 rv"><Label>About</Label></div>
          <div className="lg:col-span-9 rv">
            <p className={H2}>You dared to dream bigger, and together we turned those dreams into reality. <span className="text-white/40">Our collaboration made us unstoppable.</span></p>
            <p className="mt-10 max-w-xl text-lg text-white/70">NexGenPR is a PR and digital marketing company founded in 2025, building strategic brand presence from Mandsaur, Madhya Pradesh.</p>
          </div>
        </section>

        {/* Services */}
        <section id="services" className={`${pad} py-20`}>
          <div className="rv mb-14"><Label>Services</Label><h2 className={`${H2} mt-4`}>Imaginative Services</h2></div>
          <ul>
            {SERVICES.map(([t, d, c], i) => (
              <li key={t} className="rv group grid md:grid-cols-12 gap-3 md:gap-6 border-t border-white/15 py-8 md:py-10 items-baseline">
                <span className="md:col-span-1 font-mono text-xs text-white/50 flex items-center gap-2"><i className={`w-2.5 h-2.5 rounded-full ${c}`} />0{i + 1}</span>
                <h3 className="md:col-span-7 text-3xl md:text-6xl font-light tracking-tight transition-all duration-500 md:group-hover:translate-x-4 group-hover:text-violet">{t}</h3>
                <p className="md:col-span-4 text-white/65">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Featured work */}
        {featured.length > 0 && (
          <section className={`${pad} py-28 md:py-40`}>
            <div className="rv mb-16"><Label>Featured work</Label><h2 className={`${H2} mt-4`}>Creative work<br />you may like</h2></div>
            <div className="grid lg:grid-cols-12 gap-x-10 gap-y-16">
              {featured.map((p, i) => (
                <button key={p._id} onClick={() => setOpen(p)} className={`rv group text-left col-span-12 ${span[i]}`}>
                  <div className="overflow-hidden"><Cover p={p} className="transition-transform duration-700 group-hover:scale-[1.03]" /></div>
                  <div className="mt-4 flex justify-between gap-4 items-baseline">
                    <h3 className="text-2xl md:text-3xl font-light">{p.title}</h3>
                    <span className="font-mono text-xs uppercase tracking-widest text-white/50">{[p.client, p.year].filter(Boolean).join(' · ') || p.category}</span>
                  </div>
                  {p.description && <p className="mt-2 text-white/60 max-w-md">{p.description}</p>}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Portfolio */}
        <section id="work" className={`${pad} py-20`}>
          <div className="rv flex flex-wrap items-end justify-between gap-6 mb-12">
            <div><Label>Portfolio</Label><h2 className={`${H2} mt-4`}>All work</h2></div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
              {cats.map((c) => (
                <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)}
                  className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${cat === c ? 'bg-lime text-ink border-lime' : 'border-white/25 hover:border-lime'}`}>{c}</button>
              ))}
            </div>
          </div>
          {projects === null && <p className="font-mono text-sm text-white/50">Loading…</p>}
          {projects && shown.length === 0 && <p className="font-mono text-sm text-white/50">No projects yet.</p>}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {shown.map((p, i) => (
              <button key={p._id} onClick={() => setOpen(p)} className={`rv group block w-full text-left break-inside-avoid mb-10 ${i % 3 === 1 ? 'lg:mt-12' : ''}`}>
                <div className="overflow-hidden"><Cover p={p} className="transition-transform duration-700 group-hover:scale-[1.04]" /></div>
                <div className="mt-3 flex justify-between gap-3 items-baseline">
                  <h3 className="text-xl font-light group-hover:text-violet transition-colors">{p.title}</h3>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-white/45 shrink-0">{p.year || p.category}</span>
                </div>
                {p.client && <p className="font-mono text-xs text-white/45 mt-1">{p.client}</p>}
              </button>
            ))}
          </div>
        </section>

        {/* Insights */}
        <section id="insights" className={`${pad} py-28 md:py-40`}>
          <div className="rv mb-14"><Label>Insights</Label><h2 className={`${H2} mt-4`}>Looking ahead:<br />Marketing trends 2025</h2></div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-14 mb-28">
            {TRENDS.map(([t, d], i) => (
              <article key={t} className={`rv border-t-2 pt-5 ${['border-violet', 'border-ember', 'border-lime', 'border-bone'][i]} ${i % 2 ? 'md:mt-16' : ''}`}>
                <span className="font-mono text-xs text-white/50">[{i + 1}]</span>
                <h3 className="text-3xl md:text-4xl font-light mt-2">{t}</h3>
                <p className="mt-4 text-white/65 max-w-md">{d}</p>
              </article>
            ))}
          </div>
          <ol>
            {BLOGS.map((b, i) => (
              <li key={b} className="rv flex flex-wrap items-baseline justify-between gap-3 border-t border-white/15 py-6">
                <span className="font-mono text-xs text-white/50">Blog {i + 1}</span>
                <h3 className="flex-1 min-w-[16rem] text-2xl md:text-4xl font-light">{b}</h3>
                <span className="font-mono text-xs uppercase tracking-widest text-lime">Coming soon</span>
              </li>
            ))}
          </ol>
        </section>

            <Reviews items={reviews} />

        {/* Team */}
        <section id="team" className={`${pad} py-20`}>
          <div className="rv mb-14"><Label>Our team</Label></div>
          <div className="grid md:grid-cols-2 gap-16 md:gap-8">
            {TEAM.map(([n, r, b], i) => (
              <article key={n} className={`rv ${i ? 'md:mt-24' : ''}`}>
                <div className={`w-28 h-28 rounded-full grid place-items-center text-3xl font-light text-ink ${i ? 'bg-lime' : 'bg-violet'}`} aria-hidden="true">{n.split(' ').map((x) => x[0]).join('')}</div>
                <h3 className="text-4xl md:text-5xl font-light mt-6">{n}</h3>
                <p className="font-mono text-xs uppercase tracking-widest text-lime mt-2">{r}</p>
                <p className="mt-5 text-white/65 max-w-md">{b}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className={`${pad} py-28 md:py-40`}>
          <h2 className="rv text-[clamp(3rem,14vw,14rem)] leading-[.85] tracking-tighter font-light">Onward <span className="text-lime">2025</span></h2>
          <p className="rv mt-6 text-white/60">So much more is coming in 2026.</p>
          <div className="mt-16 grid lg:grid-cols-12 gap-14">
            <address className="rv not-italic lg:col-span-4 space-y-3 font-mono text-sm uppercase tracking-wider">
              <p className="text-white/60">Mandsaur, Madhya Pradesh</p>
              {PHONES.map((p) => <p key={p}><a href={`tel:${p}`} className="hover:text-lime">{p}</a></p>)}
              <p className="normal-case break-all"><a href={`mailto:${EMAIL}`} className="hover:text-lime">{EMAIL}</a></p>
            </address>
            <form onSubmit={send} className="rv lg:col-span-7 lg:col-start-6 space-y-8">
              <label className="block"><span className="sr-only">First name</span><input name="name" required placeholder="First name" className={inp} /></label>
              <label className="block"><span className="sr-only">Email</span><input name="email" type="email" required placeholder="Email" className={inp} /></label>
              <label className="block"><span className="sr-only">Message</span><textarea name="message" required rows="4" placeholder="Message" className={inp} /></label>
              <button className="bg-lime text-ink font-mono text-sm uppercase tracking-widest px-10 py-4 hover:bg-violet transition-colors">Submit</button>
            </form>
          </div>
        </section>
      </main>

      <footer className={`${pad} py-8 border-t border-white/10 flex flex-wrap gap-x-8 gap-y-2 justify-between font-mono text-xs uppercase tracking-widest text-white/50`}>
        <a href="#privacy" className="hover:text-lime">Privacy Policy</a>
        <a href="#accessibility" className="hover:text-lime">Accessibility Statement</a>
        <span>© {new Date().getFullYear()} NexGen PR</span>
      </footer>
      {open && <Modal p={open} onClose={() => setOpen(null)} />}
    </>
  );
}

/* ---------- admin ---------- */
const EMPTY = { title: '', category: '', client: '', year: '', description: '', tags: '', cover: '', images: [], url: '', featured: false, published: true };
const ai = 'w-full bg-ink2 border border-white/20 focus:border-lime outline-none px-3 py-2.5';
const ab = 'font-mono text-xs uppercase tracking-widest px-4 py-2.5 border border-white/25 hover:border-lime hover:text-lime transition-colors disabled:opacity-40';

function Login({ onToken }) {
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    try { onToken((await api('/api/admin/login', { method: 'POST', body: { email: f.get('email'), password: f.get('password') } })).token); }
    catch (x) { setErr(x.message); }
  };
  return (
    <main className="min-h-svh grid place-items-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <Label>NexGenPR admin</Label>
        <h1 className="text-4xl font-light pb-4">Sign in</h1>
        <input name="email" type="email" required placeholder="Email" autoComplete="username" className={ai} />
        <input name="password" type="password" required placeholder="Password" autoComplete="current-password" className={ai} />
        {err && <p className="text-ember text-sm" role="alert">{err}</p>}
        <button className="w-full bg-lime text-ink font-mono text-sm uppercase tracking-widest py-3">Login</button>
      </form>
    </main>
  );
}

function AdminReviews({ token, onErr }) {
  const [list, setList] = useState([]);
  const [f, setF] = useState(null);
  const load = () => api('/api/reviews?all=1', { token }).then(setList).catch((e) => onErr(e.message));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const run = async (fn) => { try { await fn(); setF(null); load(); } catch (x) { onErr(x.message); } };
  const save = (e) => { e.preventDefault(); run(() => api(f._id ? `/api/reviews/${f._id}` : '/api/reviews', { method: f._id ? 'PUT' : 'POST', body: f, token })); };
  const del = (r) => confirm(`Delete review by ${r.name}?`) && run(() => api(`/api/reviews/${r._id}`, { method: 'DELETE', token }));
  const clearDemo = () => confirm('Remove all demo reviews?') && run(() => api('/api/demo-reviews', { method: 'DELETE', token }));

  if (f) return (
    <form onSubmit={save} className="space-y-5">
      <h2 className="text-2xl font-light">{f._id ? 'Edit review' : 'New review'}</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <label>Client name *<input required value={f.name} onChange={set('name')} className={ai} /></label>
        <label>Company<input value={f.company} onChange={set('company')} className={ai} /></label>
        <label>Rating<select value={f.rating} onChange={set('rating')} className={ai}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select></label>
      </div>
      <label className="block">Review *<textarea required rows="4" maxLength="1000" value={f.text} onChange={set('text')} className={ai} /></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={f.published} onChange={set('published')} /> Published</label>
      <div className="flex gap-3">
        <button className="bg-lime text-ink font-mono text-xs uppercase tracking-widest px-6 py-3">Save review</button>
        <button type="button" className={ab} onClick={() => setF(null)}>Cancel</button>
      </div>
    </form>
  );
  return (
    <>
      <div className="flex gap-2 mb-6">
        <button className={ab} onClick={() => setF({ name: '', company: '', rating: 5, text: '', published: true })}>+ Add review</button>
        <button className={ab} onClick={clearDemo}>Remove demo reviews</button>
      </div>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {list.length === 0 && <li className="py-6 text-white/50">No reviews yet.</li>}
        {list.map((r) => (
          <li key={r._id} className="flex items-center gap-4 py-4">
            <div className="flex-1 min-w-0">
              <p className="truncate">{r.name} <span className="text-lime">{'★'.repeat(r.rating)}</span></p>
              <p className="font-mono text-xs text-white/50 truncate">{r.company} — {r.text}</p>
            </div>
            {r.demo && <span className="font-mono text-xs text-ember">DEMO</span>}
            {!r.published && <span className="font-mono text-xs text-ember">DRAFT</span>}
            <button className={ab} onClick={() => setF({ ...r })}>Edit</button>
            <button className={ab} onClick={() => del(r)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Admin() {
  const [token, setToken] = useState(localStorage.getItem('ng_token') || '');
  const [list, setList] = useState([]);
  const [f, setF] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const logout = () => { localStorage.removeItem('ng_token'); setToken(''); };
  const load = () => api('/api/projects?all=1', { token }).then(setList).catch((e) => { setMsg(e.message); if (/auth/i.test(e.message)) logout(); });
  useEffect(() => { if (token) load(); }, [token]);

  const [tab, setTab] = useState('projects');

  if (!token) return <Login onToken={(t) => { localStorage.setItem('ng_token', t); setToken(t); }} />;

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const upload = async (files, multi) => {
    if (!files.length) return;
    setBusy(true); setMsg('');
    try {
      const fd = new FormData();
      [...files].forEach((x) => fd.append('images', x));
      const { urls } = await api('/api/upload', { method: 'POST', body: fd, token });
      setF((p) => (multi ? { ...p, images: [...p.images, ...urls] } : { ...p, cover: urls[0] }));
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const body = { ...f, tags: String(f.tags).split(',').map((t) => t.trim()).filter(Boolean) };
      await api(f._id ? `/api/projects/${f._id}` : '/api/projects', { method: f._id ? 'PUT' : 'POST', body, token });
      setF(null); load();
    } catch (e2) { setMsg(e2.message); }
    setBusy(false);
  };

  const del = async (p) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try { await api(`/api/projects/${p._id}`, { method: 'DELETE', token }); load(); } catch (e) { setMsg(e.message); }
  };

  return (
    <main className="max-w-5xl mx-auto px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <div><Label>Admin</Label><h1 className="text-4xl font-light mt-2">Projects</h1></div>
        <div className="flex gap-2">
          <a href="/" className={ab}>View site</a>
          <button className={ab} onClick={() => setF({ ...EMPTY })}>+ Add project</button>
          <button className={ab} onClick={logout}>Logout</button>
          <button className={ab} onClick={() => { setF(null); setTab(tab === 'reviews' ? 'projects' : 'reviews'); }}>{tab === 'reviews' ? 'Projects' : 'Reviews'}</button>
        </div>
      </header>
      {msg && <p className="text-ember text-sm mb-4" role="alert">{msg}</p>}

      {tab === 'reviews' ? <AdminReviews token={token} onErr={setMsg} /> : f ? (
        <form onSubmit={save} className="space-y-5">
          <h2 className="text-2xl font-light">{f._id ? 'Edit project' : 'New project'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label>Title *<input required value={f.title} onChange={set('title')} className={ai} /></label>
            <label>Category<input list="cats" value={f.category} onChange={set('category')} className={ai} /></label>
            <datalist id="cats">{SERVICES.map((s) => <option key={s[0]} value={s[0]} />)}</datalist>
            <label>Client<input value={f.client} onChange={set('client')} className={ai} /></label>
            <label>Year<input type="number" min="2000" max="2100" value={f.year} onChange={set('year')} className={ai} /></label>
            <label>External URL<input type="url" placeholder="https://" value={f.url} onChange={set('url')} className={ai} /></label>
            <label>Tags (comma separated)<input value={f.tags} onChange={set('tags')} className={ai} /></label>
          </div>
          <label className="block">Description<textarea rows="5" value={f.description} onChange={set('description')} className={ai} /></label>

          <div>
            <p className="mb-2">Cover image</p>
            {f.cover && <img src={opt(f.cover, 400)} alt="Cover preview" className="h-40 mb-2" />}
            <input type="file" accept="image/*" onChange={(e) => upload(e.target.files, false)} />
          </div>
          <div>
            <p className="mb-2">Additional images</p>
            <div className="flex flex-wrap gap-3 mb-2">
              {f.images.map((u) => (
                <div key={u} className="relative">
                  <img src={opt(u, 300)} alt="" className="h-24" />
                  <button type="button" aria-label="Remove image" onClick={() => setF((p) => ({ ...p, images: p.images.filter((x) => x !== u) }))} className="absolute top-0 right-0 bg-ink px-2">✕</button>
                </div>
              ))}
            </div>
            <input type="file" accept="image/*" multiple onChange={(e) => upload(e.target.files, true)} />
          </div>

          <div className="flex gap-8">
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.featured} onChange={set('featured')} /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={f.published} onChange={set('published')} /> Published</label>
          </div>
          <div className="flex gap-3">
            <button disabled={busy} className="bg-lime text-ink font-mono text-xs uppercase tracking-widest px-6 py-3 disabled:opacity-40">{busy ? 'Working…' : 'Save project'}</button>
            <button type="button" className={ab} onClick={() => setF(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {list.length === 0 && <li className="py-6 text-white/50">No projects yet.</li>}
          {list.map((p) => (
            <li key={p._id} className="flex items-center gap-4 py-4">
              {p.cover ? <img src={opt(p.cover, 160)} alt="" className="w-16 h-16 object-cover" /> : <div className="w-16 h-16 bg-ink2 grid place-items-center text-violet">{p.title[0]}</div>}
              <div className="flex-1 min-w-0">
                <p className="truncate">{p.title}</p>
                <p className="font-mono text-xs text-white/50">{[p.category, p.client, p.year].filter(Boolean).join(' · ')}</p>
              </div>
              {p.featured && <span className="font-mono text-xs text-lime">FEATURED</span>}
              {!p.published && <span className="font-mono text-xs text-ember">DRAFT</span>}
              <button className={ab} onClick={() => setF({ ...EMPTY, ...p, tags: (p.tags || []).join(', '), year: p.year || '' })}>Edit</button>
              <button className={ab} onClick={() => del(p)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default function App() {
  return location.pathname.startsWith('/admin') ? <Admin /> : <Site />;
}