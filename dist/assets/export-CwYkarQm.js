import{k as f}from"./index-1jq80nBD.js";import{f as l}from"./format-Bki_3ahu.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=f("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=f("FileSpreadsheet",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]]),m={twitter:"Twitter/X",linkedin:"LinkedIn",instagram:"Instagram",tiktok:"TikTok",facebook:"Facebook"};function c(e,a){const n=e.join(","),d=a.map(i=>i.map(t=>{const r=String(t).replace(/"/g,'""');return r.includes(",")||r.includes(`
`)?`"${r}"`:r}).join(","));return[n,...d].join(`
`)}function g(e,a,n){const d=new Blob([e],{type:n}),i=URL.createObjectURL(d),t=document.createElement("a");t.href=i,t.download=a,document.body.appendChild(t),t.click(),document.body.removeChild(t),URL.revokeObjectURL(i)}function w(e){const a=["ID","Content","Caption","Hashtags","Platform","Status","Scheduled For","Image URL"],n=e.map(t=>[t.id,t.content||"",t.caption||"",t.hashtags.map(r=>`#${r}`).join(" "),m[t.platform],t.status,t.scheduledFor?l(new Date(t.scheduledFor),"yyyy-MM-dd HH:mm"):"",t.imageUrl||""]),d=c(a,n),i=`soci-posts-${l(new Date,"yyyy-MM-dd")}.csv`;g(d,i,"text/csv")}function y(e){const a=["Metric","Value","Change"],n=[["Total Followers",e.followers.toString(),`${e.followersChange}%`],["Engagement Rate",`${e.engagement}%`,`${e.engagementChange}%`],["Weekly Reach",e.reach.toString(),`${e.reachChange}%`]],d=["Date","Followers"],i=e.audienceGrowth.map(s=>[s.name,s.value.toString()]),t=["Day","Posts","Engagement"],r=e.engagementByDay.map(s=>[s.name,(s.posts||0).toString(),(s.engagement||s.value||0).toString()]),p=["=== ANALYTICS SUMMARY ===",c(a,n),"","=== AUDIENCE GROWTH ===",c(d,i),"","=== ENGAGEMENT BY DAY ===",c(t,r)].join(`
`),o=`soci-analytics-${l(new Date,"yyyy-MM-dd")}.csv`;g(p,o,"text/csv")}function k(e){const a=["Timestamp","Action","Description","Status","Platform"],n=e.map(t=>[l(new Date(t.timestamp),"yyyy-MM-dd HH:mm:ss"),t.action,t.description,t.status,t.platform?m[t.platform]:""]),d=c(a,n),i=`soci-activity-${l(new Date,"yyyy-MM-dd")}.csv`;g(d,i,"text/csv")}function $(e,a){const n=a.filter(o=>o.status==="draft").length,d=a.filter(o=>o.status==="scheduled").length,i=a.filter(o=>o.status==="published").length,t=a.reduce((o,s)=>(o[s.platform]=(o[s.platform]||0)+1,o),{}),r=`
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
          <p>Generated on ${l(new Date,"MMMM d, yyyy")} at ${l(new Date,"h:mm a")}</p>
        </div>

        <div class="section">
          <h2>Performance Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${h(e.followers)}</div>
              <div class="stat-label">Total Followers</div>
              <div class="stat-change ${e.followersChange>=0?"positive":"negative"}">
                ${e.followersChange>=0?"↑":"↓"} ${Math.abs(e.followersChange)}%
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${e.engagement}%</div>
              <div class="stat-label">Engagement Rate</div>
              <div class="stat-change ${e.engagementChange>=0?"positive":"negative"}">
                ${e.engagementChange>=0?"↑":"↓"} ${Math.abs(e.engagementChange)}%
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${h(e.reach)}</div>
              <div class="stat-label">Weekly Reach</div>
              <div class="stat-change ${e.reachChange>=0?"positive":"negative"}">
                ${e.reachChange>=0?"↑":"↓"} ${Math.abs(e.reachChange)}%
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Content Pipeline</h2>
          <div class="pipeline-grid">
            <div class="pipeline-item">
              <div class="pipeline-value" style="color: #6b7280;">${n}</div>
              <div class="pipeline-label">Drafts</div>
            </div>
            <div class="pipeline-item">
              <div class="pipeline-value" style="color: #6366f1;">${d}</div>
              <div class="pipeline-label">Scheduled</div>
            </div>
            <div class="pipeline-item">
              <div class="pipeline-value" style="color: #22c55e;">${i}</div>
              <div class="pipeline-label">Published</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Platform Breakdown</h2>
          <div class="platform-list">
            ${Object.entries(t).map(([o,s])=>`
              <div class="platform-item">
                <span class="platform-dot ${o}"></span>
                <span>${m[o]}: ${s} posts</span>
              </div>
            `).join("")}
            ${Object.keys(t).length===0?'<p style="color: #9ca3af;">No posts yet</p>':""}
          </div>
        </div>

        <div class="footer">
          <p>Generated by SOCI - AI Growth Engine</p>
          <p style="margin-top: 4px;">Total Posts: ${a.length}</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      <\/script>
    </body>
    </html>
  `,p=window.open("","_blank");p&&(p.document.write(r),p.document.close())}function h(e){return e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:e.toString()}function C(e){const a=JSON.stringify(e,null,2),n=`soci-backup-${l(new Date,"yyyy-MM-dd")}.json`;g(a,n,"application/json")}export{u as D,x as F,k as a,w as b,$ as c,y as d,C as e};
