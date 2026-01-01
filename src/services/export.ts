import { format } from 'date-fns';
import type { Post, Platform, AnalyticsData, ActivityLog } from '@/types';

// Platform labels for export
const platformLabels: Record<Platform, string> = {
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook',
};

// Convert data to CSV format
function toCSV(headers: string[], rows: string[][]): string {
  const headerRow = headers.join(',');
  const dataRows = rows.map(row =>
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const escaped = String(cell).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('\n')
        ? `"${escaped}"`
        : escaped;
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\n');
}

// Download file
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export posts to CSV
export function exportPostsToCSV(posts: Post[]) {
  const headers = [
    'ID',
    'Content',
    'Caption',
    'Hashtags',
    'Platform',
    'Status',
    'Scheduled For',
    'Image URL',
  ];

  const rows = posts.map(post => [
    post.id,
    post.content || '',
    post.caption || '',
    post.hashtags.map(h => `#${h}`).join(' '),
    platformLabels[post.platform],
    post.status,
    post.scheduledFor ? format(new Date(post.scheduledFor), 'yyyy-MM-dd HH:mm') : '',
    post.imageUrl || '',
  ]);

  const csv = toCSV(headers, rows);
  const filename = `soci-posts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

// Export analytics to CSV
export function exportAnalyticsToCSV(analytics: AnalyticsData) {
  // Summary section
  const summaryHeaders = ['Metric', 'Value', 'Change'];
  const summaryRows = [
    ['Total Followers', analytics.followers.toString(), `${analytics.followersChange}%`],
    ['Engagement Rate', `${analytics.engagement}%`, `${analytics.engagementChange}%`],
    ['Weekly Reach', analytics.reach.toString(), `${analytics.reachChange}%`],
  ];

  // Audience growth section
  const growthHeaders = ['Date', 'Followers'];
  const growthRows = analytics.audienceGrowth.map(point => [
    point.name,
    point.value.toString(),
  ]);

  // Engagement section
  const engagementHeaders = ['Day', 'Posts', 'Engagement'];
  const engagementRows = analytics.engagementByDay.map(point => [
    point.name,
    (point.posts || 0).toString(),
    (point.engagement || point.value || 0).toString(),
  ]);

  // Combine all sections
  const content = [
    '=== ANALYTICS SUMMARY ===',
    toCSV(summaryHeaders, summaryRows),
    '',
    '=== AUDIENCE GROWTH ===',
    toCSV(growthHeaders, growthRows),
    '',
    '=== ENGAGEMENT BY DAY ===',
    toCSV(engagementHeaders, engagementRows),
  ].join('\n');

  const filename = `soci-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(content, filename, 'text/csv');
}

// Export activity log to CSV
export function exportActivityToCSV(activities: ActivityLog[]) {
  const headers = ['Timestamp', 'Action', 'Description', 'Status', 'Platform'];

  const rows = activities.map(activity => [
    format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm:ss'),
    activity.action,
    activity.description,
    activity.status,
    activity.platform ? platformLabels[activity.platform] : '',
  ]);

  const csv = toCSV(headers, rows);
  const filename = `soci-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  downloadFile(csv, filename, 'text/csv');
}

// Generate PDF report (HTML-based for simplicity)
export function exportAnalyticsToPDF(analytics: AnalyticsData, posts: Post[]) {
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  // Platform breakdown
  const platformCounts = posts.reduce((acc, post) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1;
    return acc;
  }, {} as Record<Platform, number>);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SOCI Analytics Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1f2937;
          background: #f9fafb;
        }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
        .header h1 { font-size: 28px; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header p { color: #6b7280; margin-top: 8px; }
        .section { margin-bottom: 32px; }
        .section h2 { font-size: 18px; color: #374151; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .stat-card { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; color: #6366f1; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .stat-change { font-size: 12px; margin-top: 4px; }
        .stat-change.positive { color: #22c55e; }
        .stat-change.negative { color: #ef4444; }
        .pipeline-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .pipeline-item { background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; }
        .pipeline-value { font-size: 24px; font-weight: bold; }
        .pipeline-label { font-size: 11px; color: #6b7280; margin-top: 4px; text-transform: uppercase; }
        .platform-list { display: flex; flex-wrap: wrap; gap: 12px; }
        .platform-item { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #f3f4f6; border-radius: 6px; }
        .platform-dot { width: 10px; height: 10px; border-radius: 50%; }
        .platform-dot.twitter { background: #1DA1F2; }
        .platform-dot.linkedin { background: #0A66C2; }
        .platform-dot.instagram { background: #E4405F; }
        .platform-dot.tiktok { background: #000000; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
        @media print {
          body { padding: 0; background: white; }
          .container { box-shadow: none; padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SOCI Analytics Report</h1>
          <p>Generated on ${format(new Date(), 'MMMM d, yyyy')} at ${format(new Date(), 'h:mm a')}</p>
        </div>

        <div class="section">
          <h2>Performance Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${formatNumber(analytics.followers)}</div>
              <div class="stat-label">Total Followers</div>
              <div class="stat-change ${analytics.followersChange >= 0 ? 'positive' : 'negative'}">
                ${analytics.followersChange >= 0 ? '↑' : '↓'} ${Math.abs(analytics.followersChange)}%
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${analytics.engagement}%</div>
              <div class="stat-label">Engagement Rate</div>
              <div class="stat-change ${analytics.engagementChange >= 0 ? 'positive' : 'negative'}">
                ${analytics.engagementChange >= 0 ? '↑' : '↓'} ${Math.abs(analytics.engagementChange)}%
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${formatNumber(analytics.reach)}</div>
              <div class="stat-label">Weekly Reach</div>
              <div class="stat-change ${analytics.reachChange >= 0 ? 'positive' : 'negative'}">
                ${analytics.reachChange >= 0 ? '↑' : '↓'} ${Math.abs(analytics.reachChange)}%
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Content Pipeline</h2>
          <div class="pipeline-grid">
            <div class="pipeline-item">
              <div class="pipeline-value" style="color: #6b7280;">${draftCount}</div>
              <div class="pipeline-label">Drafts</div>
            </div>
            <div class="pipeline-item">
              <div class="pipeline-value" style="color: #6366f1;">${scheduledCount}</div>
              <div class="pipeline-label">Scheduled</div>
            </div>
            <div class="pipeline-item">
              <div class="pipeline-value" style="color: #22c55e;">${publishedCount}</div>
              <div class="pipeline-label">Published</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Platform Breakdown</h2>
          <div class="platform-list">
            ${Object.entries(platformCounts).map(([platform, count]) => `
              <div class="platform-item">
                <span class="platform-dot ${platform}"></span>
                <span>${platformLabels[platform as Platform]}: ${count} posts</span>
              </div>
            `).join('')}
            ${Object.keys(platformCounts).length === 0 ? '<p style="color: #9ca3af;">No posts yet</p>' : ''}
          </div>
        </div>

        <div class="footer">
          <p>Generated by SOCI - AI Growth Engine</p>
          <p style="margin-top: 4px;">Total Posts: ${posts.length}</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

// Helper function
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Export all data as JSON
export function exportAllDataToJSON(data: {
  posts: Post[];
  activities: ActivityLog[];
  analytics?: AnalyticsData;
}) {
  const content = JSON.stringify(data, null, 2);
  const filename = `soci-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadFile(content, filename, 'application/json');
}
