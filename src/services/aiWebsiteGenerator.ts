import { GeneratedFile, GenerationOptions, WebsiteProject } from '../types/websiteBuilder';

const DEFAULT_API_KEY = '';

export async function generateWebsiteWithAi(
  prompt: string,
  options: GenerationOptions,
  userApiKey?: string,
  onProgress?: (step: string) => void
): Promise<WebsiteProject> {
  const apiKey = userApiKey?.trim() || DEFAULT_API_KEY;

  if (onProgress) onProgress('Understanding website concept...');
  await new Promise(r => setTimeout(r, 600));

  if (onProgress) onProgress('Planning page architecture & site map...');
  await new Promise(r => setTimeout(r, 700));

  if (onProgress) onProgress('Designing design system, colors & typography...');
  await new Promise(r => setTimeout(r, 800));

  if (onProgress) onProgress('Generating HTML pages, CSS styles & JS interactions...');

  try {
    const response = await fetch('/api/generate-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        options,
        userApiKey: apiKey
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result && data.result.files && data.result.files.length > 0) {
        if (onProgress) onProgress('Finalizing project & building live preview...');
        await new Promise(r => setTimeout(r, 500));

        const res = data.result;
        return {
          id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          name: res.projectName || extractProjectTitle(prompt, options.type),
          description: res.description || prompt,
          type: options.type || 'Business',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          files: sanitizeGeneratedFiles(res.files),
          activePagePath: 'index.html',
          settings: options
        };
      }
    }
  } catch (err) {
    console.warn('Backend API request failed, falling back to intelligent client synthesis engine:', err);
  }

  // Client-side fallback generator if backend/network is unavailable
  if (onProgress) onProgress('Synthesizing custom multi-page architecture...');
  await new Promise(r => setTimeout(r, 600));

  return buildTemplateFallbackWebsite(prompt, options);
}

export async function modifyWebsiteWithAi(
  instruction: string,
  currentFiles: GeneratedFile[],
  userApiKey?: string
): Promise<GeneratedFile[]> {
  const apiKey = userApiKey?.trim() || DEFAULT_API_KEY;

  try {
    const response = await fetch('/api/modify-website', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instruction,
        currentFiles,
        userApiKey: apiKey
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.result && Array.isArray(data.result.modifiedFiles)) {
        const modFiles: GeneratedFile[] = data.result.modifiedFiles;
        const fileMap = new Map<string, GeneratedFile>();
        currentFiles.forEach(f => fileMap.set(f.path, f));
        modFiles.forEach(f => fileMap.set(f.path, f));
        return Array.from(fileMap.values());
      }
    }
  } catch (err) {
    console.warn('AI modify API failed, applying smart local modification:', err);
  }

  // Smart local edit fallback
  return applyLocalInstructionToFiles(instruction, currentFiles);
}

function extractProjectTitle(prompt: string, type: string): string {
  const words = prompt.split(' ');
  const title = words.slice(0, 4).join(' ').replace(/[^a-zA-Z0-9 ]/g, '');
  return title ? title : `${type} Website`;
}

function sanitizeGeneratedFiles(files: any[]): GeneratedFile[] {
  return files.map(f => {
    let cleanContent = typeof f.content === 'string' ? f.content : '';
    cleanContent = cleanContent.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();

    return {
      path: f.path || f.name || 'index.html',
      name: f.name || (f.path ? f.path.split('/').pop() : 'index.html'),
      type: f.type || (f.path?.endsWith('.css') ? 'css' : f.path?.endsWith('.js') ? 'js' : 'html'),
      content: cleanContent
    };
  });
}

function applyLocalInstructionToFiles(instruction: string, currentFiles: GeneratedFile[]): GeneratedFile[] {
  const lower = instruction.toLowerCase();
  const updated = currentFiles.map(file => {
    if (file.type === 'css') {
      let extraCss = '';
      if (lower.includes('sticky') || lower.includes('nav')) {
        extraCss += `\n/* AI Added: Sticky Navbar */\n.navbar { position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(10px); }\n`;
      }
      if (lower.includes('gold') || lower.includes('yellow')) {
        extraCss += `\n/* AI Added: Gold Accents */\n:root { --primary-color: #f59e0b; --primary-hover: #d97706; }\n.btn-primary { background-color: #f59e0b !important; color: #000 !important; }\n`;
      }
      if (lower.includes('dark') || lower.includes('black')) {
        extraCss += `\n/* AI Added: Dark Theme Override */\nbody { background-color: #0b132b !important; color: #f8fafc !important; }\n.card, .navbar, footer { background-color: #111c38 !important; color: #ffffff !important; border-color: #1e293b !important; }\n`;
      }
      if (lower.includes('smooth scroll')) {
        extraCss += `\nhtml { scroll-behavior: smooth; }\n`;
      }
      return { ...file, content: file.content + extraCss };
    }

    if (file.path === 'index.html' && (lower.includes('testimonial') || lower.includes('review'))) {
      const testimonialSection = `
    <!-- AI Added Testimonial Section -->
    <section class="section testimonials-section" id="testimonials" style="padding: 60px 20px; background: rgba(255,255,255,0.03); border-top: 1px solid rgba(255,255,255,0.1);">
      <div class="container" style="max-width: 1100px; margin: 0 auto; text-align: center;">
        <span style="color: #f59e0b; font-weight: 700; text-transform: uppercase; font-size: 12px; tracking: 1px;">Client Feedback</span>
        <h2 style="font-size: 28px; font-weight: 800; margin: 8px 0 30px;">What Our Clients Say</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; text-align: left;">
          <div style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #f59e0b; font-size: 18px; margin-bottom: 12px;">★★★★★</div>
            <p style="font-style: italic; font-size: 14px; margin-bottom: 16px; opacity: 0.9;">"Outstanding service and design! Delivered beyond our expectations."</p>
            <div style="font-weight: 700; font-size: 14px;">Sarah Jenkins</div>
            <div style="font-size: 12px; opacity: 0.6;">CEO, Elevate Media</div>
          </div>
          <div style="background: rgba(255,255,255,0.05); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #f59e0b; font-size: 18px; margin-bottom: 12px;">★★★★★</div>
            <p style="font-style: italic; font-size: 14px; margin-bottom: 16px; opacity: 0.9;">"The turnaround time was fast and the final website is super clean."</p>
            <div style="font-weight: 700; font-size: 14px;">Marcus Vance</div>
            <div style="font-size: 12px; opacity: 0.6;">Founder, TechPulse</div>
          </div>
        </div>
      </div>
    </section>`;

      const bodyEnd = file.content.lastIndexOf('</main>') !== -1 
        ? file.content.lastIndexOf('</main>') 
        : file.content.lastIndexOf('</body>');

      if (bodyEnd !== -1) {
        const newHtml = file.content.slice(0, bodyEnd) + testimonialSection + '\n' + file.content.slice(bodyEnd);
        return { ...file, content: newHtml };
      }
    }

    return file;
  });

  return updated;
}

function buildTemplateFallbackWebsite(prompt: string, options: GenerationOptions): WebsiteProject {
  const brandName = extractProjectTitle(prompt, options.type);
  const pagesCount = Math.min(Math.max(options.pagesCount || 5, 1), 7);

  const pageDefs = [
    { name: 'Home', filename: 'index.html' },
    { name: 'About Us', filename: 'about.html' },
    { name: 'Services', filename: 'services.html' },
    { name: 'Portfolio', filename: 'portfolio.html' },
    { name: 'Contact', filename: 'contact.html' },
    { name: 'Blog', filename: 'blog.html' },
    { name: 'Pricing', filename: 'pricing.html' }
  ].slice(0, pagesCount);

  const navLinks = pageDefs.map(p => `<a href="${p.filename}">${p.name}</a>`).join('\n          ');

  const cssContent = `/* Stylesheet for ${brandName} */
:root {
  --primary: #f59e0b;
  --primary-hover: #d97706;
  --bg-dark: #0b132b;
  --bg-card: #111c38;
  --bg-input: #162244;
  --text-light: #f8fafc;
  --text-muted: #94a3b8;
  --border: #1e293b;
  --radius: 12px;
  --transition: all 0.25s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-light);
  line-height: 1.6;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Header & Nav */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11, 19, 43, 0.9);
  backdrop-filter: blur(12px);
  border-b: 1px solid var(--border);
  padding: 16px 24px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo span {
  color: var(--primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-links a {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  transition: var(--transition);
}

.nav-links a:hover, .nav-links a.active {
  color: var(--text-light);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-primary {
  background-color: var(--primary);
  color: #0f172a;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--bg-card);
  color: var(--text-light);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background-color: var(--bg-input);
}

/* Hero Section */
.hero {
  padding: 100px 24px 60px;
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.hero-tag {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.15);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.hero h1 {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 20px;
  letter-spacing: -1px;
}

.hero p {
  font-size: 18px;
  color: var(--text-muted);
  margin-bottom: 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Grid & Cards */
.section {
  padding: 80px 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 12px;
}

.section-subtitle {
  text-align: center;
  color: var(--text-muted);
  margin-bottom: 48px;
  font-size: 16px;
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 32px;
  transition: var(--transition);
}

.card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.15);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 20px;
}

.card h3 {
  font-size: 20px;
  margin-bottom: 12px;
}

.card p {
  color: var(--text-muted);
  font-size: 14px;
}

/* Footer */
footer {
  background-color: #060a17;
  border-t: 1px solid var(--border);
  padding: 60px 24px 30px;
  margin-top: 80px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--border);
}

.footer-bottom {
  max-width: 1200px;
  margin: 24px auto 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

/* Responsive */
@media (max-width: 768px) {
  .hero h1 { font-size: 32px; }
  .nav-links { display: none; }
}
`;

  const jsContent = `/* JavaScript Interactive Logic for ${brandName} */
document.addEventListener('DOMContentLoaded', () => {
  console.log('${brandName} initialized successfully.');

  // Form submission handling
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Sending...';
        btn.disabled = true;

        setTimeout(() => {
          alert('Thank you! Your submission was received successfully.');
          btn.innerHTML = 'Submitted ✓';
          btn.style.backgroundColor = '#10b981';
          form.reset();

          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.backgroundColor = '';
          }, 3000);
        }, 1000);
      }
    });
  });

  // Smooth active nav link highlight
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
});
`;

  const files: GeneratedFile[] = [];

  pageDefs.forEach((p, idx) => {
    let mainContent = '';

    if (p.filename === 'index.html') {
      mainContent = `
    <section class="hero">
      <span class="hero-tag">⚡ Next-Gen Solutions</span>
      <h1>Empowering Innovation for ${brandName}</h1>
      <p>Transforming complex challenges into elegant digital experiences with speed and precision.</p>
      <div class="hero-actions">
        <a href="services.html" class="btn btn-primary">Explore Services</a>
        <a href="contact.html" class="btn btn-secondary">Get in Touch</a>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Why Choose Us</h2>
        <p class="section-subtitle">Crafted with attention to detail and unmatched excellence.</p>

        <div class="grid-3">
          <div class="card">
            <div class="card-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Engineered for maximum performance, minimal latency, and instant responsiveness.</p>
          </div>
          <div class="card">
            <div class="card-icon">🛡️</div>
            <h3>Enterprise Security</h3>
            <p>Built with robust security protocols and end-to-end client privacy protection.</p>
          </div>
          <div class="card">
            <div class="card-icon">💎</div>
            <h3>Premium Design</h3>
            <p>Modern aesthetics paired with seamless intuitive user experiences.</p>
          </div>
        </div>
      </div>
    </section>`;
    } else if (p.filename === 'about.html') {
      mainContent = `
    <section class="hero">
      <span class="hero-tag">About Us</span>
      <h1>Driven by Passion & Excellence</h1>
      <p>Learn about our mission, vision, and the team pushing boundaries at ${brandName}.</p>
    </section>

    <section class="section">
      <div class="container" style="max-width: 800px;">
        <h2 class="section-title">Our Story</h2>
        <p style="color: var(--text-muted); font-size: 16px; line-height: 1.8; margin-bottom: 24px;">
          Founded with a clear commitment to digital craft, ${brandName} has evolved into an industry benchmark. 
          We believe in combining clean architecture, beautiful design, and human-centric experiences.
        </p>
        <div class="grid-3" style="margin-top: 40px;">
          <div class="card" style="text-align: center;">
            <h3 style="color: var(--primary); font-size: 36px; font-weight: 800;">500+</h3>
            <p>Projects Completed</p>
          </div>
          <div class="card" style="text-align: center;">
            <h3 style="color: var(--primary); font-size: 36px; font-weight: 800;">99.9%</h3>
            <p>Client Satisfaction</p>
          </div>
          <div class="card" style="text-align: center;">
            <h3 style="color: var(--primary); font-size: 36px; font-weight: 800;">10+</h3>
            <p>Years Experience</p>
          </div>
        </div>
      </div>
    </section>`;
    } else if (p.filename === 'services.html') {
      mainContent = `
    <section class="hero">
      <span class="hero-tag">Services</span>
      <h1>Comprehensive Capabilities</h1>
      <p>Tailored solutions designed specifically to accelerate your goals.</p>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid-3">
          <div class="card">
            <div class="card-icon">🚀</div>
            <h3>Custom Web Development</h3>
            <p>Scalable, high-performance web applications tailored to your precise workflow.</p>
          </div>
          <div class="card">
            <div class="card-icon">🎨</div>
            <h3>UI/UX Product Design</h3>
            <p>Intuitive user interfaces and interactive prototypes that delight users.</p>
          </div>
          <div class="card">
            <div class="card-icon">📊</div>
            <h3>Digital Strategy & Analytics</h3>
            <p>Data-driven insights to maximize conversions, engagement, and sustainable growth.</p>
          </div>
        </div>
      </div>
    </section>`;
    } else if (p.filename === 'contact.html') {
      mainContent = `
    <section class="hero">
      <span class="hero-tag">Contact</span>
      <h1>Let's Start a Conversation</h1>
      <p>Reach out to discover how ${brandName} can bring your project to life.</p>
    </section>

    <section class="section">
      <div class="container" style="max-width: 600px;">
        <form style="background: var(--bg-card); padding: 32px; border-radius: var(--radius); border: 1px solid var(--border);">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">Your Name</label>
            <input type="text" required placeholder="John Doe" style="width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; color: #fff; font-size: 14px;" />
          </div>
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">Email Address</label>
            <input type="email" required placeholder="john@example.com" style="width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; color: #fff; font-size: 14px;" />
          </div>
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">Message</label>
            <textarea rows="4" required placeholder="Tell us about your project..." style="width: 100%; padding: 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; color: #fff; font-size: 14px;"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
        </form>
      </div>
    </section>`;
    } else {
      mainContent = `
    <section class="hero">
      <span class="hero-tag">${p.name}</span>
      <h1>Welcome to ${p.name}</h1>
      <p>Explore resources and information tailored for ${brandName}.</p>
    </section>
    <section class="section">
      <div class="container">
        <div class="card">
          <h3>${p.name} Section</h3>
          <p>Custom content for ${p.name} page.</p>
        </div>
      </div>
    </section>`;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.name} - ${brandName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <script src="js/script.js" defer></script>
</head>
<body>

  <header class="header">
    <div class="nav-container">
      <a href="index.html" class="logo">
        <span>⚡</span> ${brandName}
      </a>
      <nav class="nav-links">
        ${navLinks}
      </nav>
      <a href="contact.html" class="btn btn-primary">Get Started</a>
    </div>
  </header>

  <main>
    ${mainContent}
  </main>

  <footer>
    <div class="footer-container">
      <div>
        <div class="logo"><span>⚡</span> ${brandName}</div>
        <p style="color: var(--text-muted); font-size: 14px; max-width: 300px; margin-top: 12px;">
          Empowering modern teams with cutting-edge web tools and digital architecture.
        </p>
      </div>
      <div>
        <h4 style="font-size: 14px; margin-bottom: 12px;">Navigation</h4>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: var(--text-muted);">
          ${pageDefs.map(pd => `<a href="${pd.filename}">${pd.name}</a>`).join('\n          ')}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
    </div>
  </footer>

</body>
</html>`;

    files.push({
      path: p.filename,
      name: p.filename,
      type: 'html',
      content: htmlContent
    });
  });

  files.push({
    path: 'css/style.css',
    name: 'style.css',
    type: 'css',
    content: cssContent
  });

  files.push({
    path: 'js/script.js',
    name: 'script.js',
    type: 'js',
    content: jsContent
  });

  return {
    id: 'proj_' + Date.now(),
    name: brandName,
    description: prompt,
    type: options.type || 'Business',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    files,
    activePagePath: 'index.html',
    settings: options
  };
}
