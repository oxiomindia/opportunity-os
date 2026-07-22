import { Agent, Country, DepthOption, OpportunityResult, Notification, KPIData, SidebarItem } from '../types';

export const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
  { id: 'research', label: 'Research', iconName: 'Search' },
  { id: 'agents', label: 'Agents', iconName: 'Bot' },
  { id: 'opportunities', label: 'Opportunities', iconName: 'Briefcase' },
  { id: 'reports', label: 'Reports', iconName: 'FileText' },
  { id: 'settings', label: 'Settings', iconName: 'Settings' },
];

export const agents: Agent[] = [
  { id: 'market-research', name: 'Market Research Agent' },
  { id: 'competitor', name: 'Competitor Analysis Agent' },
  { id: 'sentiment', name: 'Sentiment Analysis Agent' },
  { id: 'trend', name: 'Trend Detection Agent' },
];

export const countries: Country[] = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
];

export const depthOptions: DepthOption[] = [
  { value: 'shallow', label: 'Shallow (Top 50)' },
  { value: 'standard', label: 'Standard (Top 200)' },
  { value: 'deep', label: 'Deep (Top 500)' },
  { value: 'exhaustive', label: 'Exhaustive (Top 1000)' },
];

export const mockResults: OpportunityResult[] = [
  { id: 1, source: 'Reddit /r/startups', title: 'Developers frustrated with current CI/CD pipeline complexity', summary: 'Multiple threads highlight pain points around GitHub Actions configuration and slow build times. Users seeking simpler alternatives.', severity: 'High', score: 92, link: '#' },
  { id: 2, source: 'Hacker News', title: 'Growing demand for AI-powered code review tools', summary: 'Discussion around manual code review bottlenecks. Strong interest in automated PR review solutions with context awareness.', severity: 'Medium', score: 87, link: '#' },
  { id: 3, source: 'LinkedIn', title: 'Enterprise teams struggling with cross-functional communication', summary: 'Posts from engineering managers describing siloed teams and lack of visibility into project status across departments.', severity: 'High', score: 85, link: '#' },
  { id: 4, source: 'Twitter/X', title: 'Indie hackers looking for better analytics without GA complexity', summary: 'Trending complaints about Google Analytics 4 complexity. Demand for privacy-first, simple analytics for small products.', severity: 'Low', score: 78, link: '#' },
  { id: 5, source: 'Product Hunt', title: 'Feature request: unified API for payment providers', summary: 'Top comment on a fintech tool requesting a single abstraction layer for Stripe, Paddle, and Lemon Squeezy.', severity: 'Medium', score: 81, link: '#' },
  { id: 6, source: 'Stack Overflow', title: 'React developers seeking state management simplification', summary: 'High-engagement question about reducing boilerplate in Redux/Zustand. Interest in signals-based reactivity.', severity: 'Medium', score: 76, link: '#' },
];

export const mockLogs: string[] = [
  '[14:32:01] Initializing Market Research Agent...',
  '[14:32:02] Loading keyword corpus: "CI/CD pipeline", "developer tools", "automation"',
  '[14:32:03] Connected to Reddit API (rate limit: 60/min)',
  '[14:32:04] Scanning r/startups, r/webdev, r/programming...',
  '[14:32:15] Found 23 relevant threads. Filtering by engagement > 50...',
  '[14:32:18] Thread #1: "GitHub Actions is too complex" — 342 upvotes, 89 comments',
  '[14:32:22] Thread #2: "Looking for simpler CI alternatives" — 156 upvotes, 34 comments',
  '[14:32:25] Connected to Hacker News API',
  '[14:32:30] Scanning "Ask HN" posts from last 30 days...',
  '[14:32:35] Post #1: "Show HN: AI code reviewer" — 512 points, 127 comments',
  '[14:32:40] Post #2: "What tools do you use for code review?" — 289 points, 64 comments',
  '[14:32:45] Analyzing sentiment and extracting pain points...',
  '[14:32:50] Sentiment analysis complete. 78% negative, 15% neutral, 7% positive',
  '[14:32:55] Extracting 12 distinct pain points...',
  '[14:33:01] Scoring opportunities based on market size and urgency...',
  '[14:33:05] Top opportunity: CI/CD simplification (Score: 92)',
  '[14:33:08] Research complete. 6 opportunities identified.',
];

export const notifications: Notification[] = [
  { id: 1, title: 'Research complete', desc: 'Market Research Agent found 6 new opportunities', time: '2 min ago', unread: true },
  { id: 2, title: 'New pain point detected', desc: 'High severity issue found on Hacker News', time: '15 min ago', unread: true },
  { id: 3, title: 'Weekly report ready', desc: 'Your weekly opportunity report is available', time: '1 hour ago', unread: false },
];

export const kpiData: KPIData[] = [
  { title: 'Sources Scanned', value: '2,847', change: '12.5%', changeType: 'up', iconName: 'Database', color: 'blue' },
  { title: 'Pain Points Found', value: '186', change: '8.3%', changeType: 'up', iconName: 'AlertTriangle', color: 'amber' },
  { title: 'Opportunities', value: '42', change: '15.2%', changeType: 'up', iconName: 'TrendingUp', color: 'green' },
  { title: 'Last Run', value: '2m ago', iconName: 'Clock', color: 'slate' },
];