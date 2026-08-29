/* Both artboards from the agents-feed design file, exported and mechanically
   converted. The design's runtime is gone: hover states are real classes and
   every piece of state the panel had is a data attribute that Feed.tsx reads.
   Re-export from Claude Design and re-run the port rather than editing this. */
export const PANEL = `<div style="width:500px;box-sizing:border-box;display:flex;flex-direction:column;border:1px solid #e2ddd2;border-radius:18px;background:#faf9f6;overflow:hidden;box-shadow:0 24px 60px -34px rgba(28,25,23,0.45);font-family:'DM Sans',system-ui,sans-serif">

  <div style="flex-shrink:0;display:flex;align-items:center;gap:10px;height:52px;padding:0 20px;border-bottom:1px solid #e9e5dc;background:#ffffff">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#57534e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
    <span style="font-size:15px;font-weight:600;color:#1c1917">Agents Feed</span>
    <span style="width:8px;height:8px;border-radius:9999px;background:#16a34a;animation:okara-pulse 2.4s ease-in-out infinite"></span>
    <span style="margin-left:auto;display:flex;align-items:center;gap:15px;color:#a8a29e">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"></rect><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"></path><path d="M10 12h4"></path></svg>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path><path d="M12 8v4l3 2"></path></svg>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V22a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 20.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15H2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3.7 7l-.1-.1a2 2 0 1 1 2.8-2.8L6.5 4A1.7 1.7 0 0 0 9 3.7V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17 4.7l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11h.1a2 2 0 1 1 0 4H21Z"></path></svg>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>
    </span>
  </div>

  <div style="padding:16px 16px 16px">

    <div style="box-sizing:border-box;border:1px solid #e2ddd2;border-radius:16px;background:#ffffff;overflow:hidden;box-shadow:0 6px 16px -10px rgba(28,25,23,0.22);flex-shrink:0;transition:border-color .25s ease, box-shadow .25s ease" class="okf-0">
      <div role="button" tabindex="0" data-act="toggleX" role="button" tabindex="0" style="display:flex;align-items:flex-start;gap:14px;padding:20px 22px;cursor:pointer;user-select:none" class="okf-1">
        <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#0d0d0c"><svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg></span>
        <span style="min-width:0;flex:1">
          <span style="display:flex;align-items:center;gap:9px">
            <span style="font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#1c1917"><svg width="12" height="12" viewBox="0 0 24 24" fill="#1c1917" style="vertical-align:-1px"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg> Agent</span>
            
          </span>
          <span style="display:block;margin-top:5px;font-size:14.5px;line-height:24px;color:#57534e">Set up your <span style="display:inline-flex;align-items:baseline;gap:6px;padding:1px 9px 2px;margin:0 2px;border-radius:8px;background:#f6f4ef;white-space:nowrap"><span style="display:inline-flex;align-self:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><path d="M12 19v3"></path></svg></span>brand voice</span> to get started</span>
        </span>
        <span data-rot="x" style="flex-shrink:0;display:flex;color:#a8a29e;transition:transform .28s cubic-bezier(.22,.7,.2,1);transform:rotate(0deg)"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"></path></svg></span>
      </div>
      <div data-wrap="x" style="overflow:hidden;max-height:none;opacity:1;transition:max-height .38s cubic-bezier(.22,.7,.2,1), opacity .26s ease">
      <div style="padding:18px 22px 22px;border-top:1px solid #f1ede4">
        <span data-when="xShowFirst" style="display:contents">
        <div data-fly="x" style="box-sizing:border-box;border:1px solid #f1ede4;border-radius:13px;background:#fbfaf8;padding:16px 18px">
          <p style="margin:0;font-size:14px;line-height:23px;color:#1c1917">i just hired an ai cmo from <span style="color:#2f80ed">@askokara</span> to help grow Skribbl</p>
          <p style="margin:11px 0 0;font-size:14px;line-height:23px;color:#1c1917">so far it has:</p>
          <p style="margin:4px 0 0;font-size:14px;line-height:25px;color:#1c1917">&#8226; identified reddit opportunities<br />&#8226; discovered seo issues<br />&#8226; analyzed competitors</p>
          
        </div>
        </span>
        <span data-when="xShowNext" style="display:contents">
          <div class="okara-arrive" style="position:relative;box-sizing:border-box;border:1px solid #f1ede4;border-radius:13px;background:#fbfaf8;padding:16px 18px;overflow:hidden">
            <div data-blur style="filter:blur(5px);transition:filter .5s cubic-bezier(.22,.7,.2,1)">
              <p style="margin:0;font-size:14px;line-height:23px;color:#1c1917">week one with an ai cmo running Skribbl&#8217;s marketing</p>
              <p style="margin:11px 0 0;font-size:14px;line-height:25px;color:#1c1917">&#8226; 24 pages read<br />&#8226; 4 competitors found<br />&#8226; 5 strategy docs written</p>
              
            </div>
            <span data-when="xHidden" style="display:contents">
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(251,250,248,0.55)">
                <span style="font-family:'Chillax','Sora',sans-serif;font-size:14px;font-weight:600;color:#1c1917">Next draft ready</span>
                <button type="button" data-act="reveal" role="button" tabindex="0" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;height:36px;padding:0 16px;border-radius:10px;border:1px solid #e2ddd2;background:#ffffff;font-family:inherit;font-size:12.5px;font-weight:600;color:#44403c;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease" class="okf-2"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M2.1 12S5.6 5.5 12 5.5 21.9 12 21.9 12 18.4 18.5 12 18.5 2.1 12 2.1 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>Reveal</button>
              </div>
            </span>
          </div>
        </span>
        <div style="display:flex;align-items:center;gap:10px;margin-top:16px;min-height:40px">
          <span data-when="xIdle" style="display:contents">
            <a href="#"  style="flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;font-size:13px;font-weight:600;color:#57534e;transition:color .2s ease" class="okf-3"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>Edit draft</a>
            <button type="button" data-act="post" role="button" tabindex="0" style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" style-active="transform:translateY(0)" class="okf-4"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>Post now</button>
          </span>
          <span data-when="xFlying" style="display:contents">
            <span style="flex-shrink:0;display:inline-flex;align-items:center;height:40px;font-size:13px;font-weight:500;color:#a8a29e">Sending to X</span>
            <span style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;cursor:default"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>Posting</span>
          </span>
          <span data-when="xDone" style="display:contents">
            <span style="flex-shrink:0;display:inline-flex;align-items:center;gap:7px;height:40px;font-size:13px;font-weight:500;color:#15803d;animation:okara-lift .34s ease both"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>Posted to X</span>
            <a href="#"  style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;font-size:13px;font-weight:600;color:#57534e;transition:color .2s ease" class="okf-5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>Edit draft</a>
            <button type="button" data-act="post" role="button" tabindex="0" style="flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" class="okf-6"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>Post now</button>
          </span>
        </div>
      </div>
      </div>
    </div>

    <div style="margin-top:12px;box-sizing:border-box;border:1px solid #e2ddd2;border-radius:16px;background:#ffffff;overflow:hidden;box-shadow:0 6px 16px -10px rgba(28,25,23,0.22);flex-shrink:0;transition:border-color .25s ease, box-shadow .25s ease" class="okf-7">
      <div role="button" tabindex="0" data-act="toggleInf" role="button" tabindex="0" style="display:flex;align-items:flex-start;gap:14px;padding:20px 22px;cursor:pointer;user-select:none" class="okf-8">
        <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#16a34a;box-shadow:0 5px 12px -6px rgba(22,163,74,0.7)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg></span>
        <span style="min-width:0;flex:1">
          <span style="display:flex;align-items:center;gap:9px">
            <span style="font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#1c1917"><svg width="12" height="12" viewBox="0 0 24 24" fill="#1c1917" style="vertical-align:-1px"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg> Influencer Agent</span>
            
          </span>
          <span style="display:block;margin-top:5px;font-size:14.5px;line-height:24px;color:#57534e">Launch your first campaign. <span style="display:inline-flex;align-items:baseline;gap:6px;padding:1px 9px 2px;margin:0 2px;border-radius:8px;background:#f6f4ef;white-space:nowrap"><span style="display:inline-flex;align-self:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path></svg></span>1000+ influencers</span> are waiting.</span>
        </span>
        <span data-rot="inf" style="flex-shrink:0;display:flex;color:#a8a29e;transition:transform .28s cubic-bezier(.22,.7,.2,1);transform:rotate(0deg)"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"></path></svg></span>
      </div>
      <div data-wrap="inf" style="overflow:hidden;max-height:none;opacity:1;transition:max-height .38s cubic-bezier(.22,.7,.2,1), opacity .26s ease">
      <div style="border-top:1px solid #f1ede4">
        <span data-when="infIdle" style="display:contents">
          <div style="padding:16px 22px 4px">
            <div style="box-sizing:border-box;border:1px solid #f1ede4;border-radius:13px;background:#fbfaf8;padding:14px 18px">
              <p style="margin:0;display:flex;align-items:center;gap:8px;font-family:'Chillax','Sora',sans-serif;font-size:12px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#a8a29e">Suggested brief</p>
              <p style="margin:9px 0 0;font-size:14px;line-height:23px;color:#1c1917">Show four coding agents running side by side in one terminal.</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;padding:14px 22px 20px">
            <span style="min-width:0;flex:1">
              <span style="display:block;font-size:15px;font-weight:600;color:#1c1917">Create an influencer campaign</span>
            </span>
            <button type="button" data-act="create" role="button" tabindex="0" style="flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" style-active="transform:translateY(0)" class="okf-9"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>Create</button>
          </div>
        </span>
        <span data-when="infPaywall" style="display:contents">
          <div class="okara-paywall" style="position:relative;overflow:hidden;padding:22px;background:linear-gradient(180deg,#fbfaf8,#f6f4ef)">
            <div style="position:relative;display:flex;align-items:flex-start;gap:13px">
              <span class="okara-lock" style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:12px;background:#1c1917"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg></span>
              <span style="min-width:0;flex:1">
                <span style="display:block;font-family:'Chillax','Sora',sans-serif;font-size:16px;font-weight:600;letter-spacing:-0.2px;color:#1c1917">Campaigns need a paid plan</span>
                <span style="display:block;margin-top:5px;font-size:13.5px;line-height:21px;color:#57534e">AI CMO Lite is <span style="font-weight:600;color:#1c1917">$129</span>/month, or $108 billed annually.</span>
              </span>
            </div>
            <div style="position:relative;margin-top:14px">
                <span class="okara-perk" style="display:flex;align-items:center;gap:9px;padding:9px 0;font-size:13px;color:#44403c">
                  <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:7px;background:#ffffff;border:1px solid #f1ede4"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span>Influencer campaigns, unlimited
                </span>
                <span class="okara-perk" style="display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid #f1ede4;font-size:13px;color:#44403c">
                  <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:7px;background:#ffffff;border:1px solid #f1ede4"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span>All eight sleeping agents wake up
                </span>
            </div>
            <div style="position:relative;display:flex;align-items:center;gap:10px;margin-top:16px">
              <button type="button" data-act="cancel" role="button" tabindex="0" style="flex-shrink:0;display:inline-flex;align-items:center;height:40px;font-family:inherit;font-size:13px;font-weight:600;color:#57534e;background:none;border:0;cursor:pointer;transition:color .2s ease" class="okf-10">Not now</button>
              <a href="#" style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" class="okf-11"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path></svg>See plans</a>
            </div>
          </div>
        </span>
      </div>
      </div>
    </div>


    <div style="display:flex;align-items:center;gap:18px;padding:26px 22px;box-sizing:border-box;border-radius:16px;background:#0d0d0c;flex-shrink:0">
      <span style="min-width:0;flex:1">
        <span style="display:block;font-family:'Chillax','Sora',sans-serif;font-size:16px;font-weight:600;line-height:1.3;letter-spacing:-0.2px;color:#ffffff">Eight agents are asleep</span>
        <span style="display:flex;align-items:center;gap:12px;margin-top:12px"><span style="display:flex;align-items:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-11deg);"><img src="/okara/agentsfeed/assets/agent-icons/reddit.svg" alt="Reddit Agent" style="width:14px;height:14px;object-fit:contain" /></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(7deg);margin-left:-6px;"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-5deg);margin-left:-6px;"><img src="/okara/agentsfeed/assets/agent-icons/seo-agent.svg" alt="SEO Agent" style="width:14px;height:14px;object-fit:contain" /></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(10deg);margin-left:-6px;"><svg width="13" height="13" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.75 0.189331L9.28033 0.719661L15.2803 6.71966L15.8107 7.24999L15.2803 7.78032L13.7374 9.32322C13.1911 9.8696 12.3733 9.97916 11.718 9.65188L9.54863 13.5568C8.71088 15.0648 7.12143 16 5.39639 16H0.75H0V15.25V10.6036C0 8.87856 0.935237 7.28911 2.4432 6.45136L6.34811 4.28196C6.02084 3.62674 6.13039 2.80894 6.67678 2.26255L8.21967 0.719661L8.75 0.189331ZM7.3697 5.43035L10.5696 8.63029L8.2374 12.8283C7.6642 13.8601 6.57668 14.5 5.39639 14.5H2.56066L5.53033 11.5303L4.46967 10.4697L1.5 13.4393V10.6036C1.5 9.42331 2.1399 8.33579 3.17166 7.76259L7.3697 5.43035ZM12.6768 8.26256C12.5791 8.36019 12.4209 8.36019 12.3232 8.26255L12.0303 7.96966L8.03033 3.96966L7.73744 3.67677C7.63981 3.57914 7.63981 3.42085 7.73744 3.32321L8.75 2.31065L13.6893 7.24999L12.6768 8.26256Z" fill="#ffffff"></path></svg></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-8deg);margin-left:-6px;"><img src="/okara/agentsfeed/assets/agent-icons/hacker-news.png" alt="Hacker News Agent" style="width:14px;height:14px;object-fit:contain" /></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(6deg);margin-left:-6px;"><img src="/okara/agentsfeed/assets/linkedin-agent-28x28.svg" alt="LinkedIn Agent" style="width:14px;height:14px;object-fit:contain;filter:brightness(0) invert(1)" /></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-3deg);margin-left:-6px;"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"></path><path d="m6.2 5.3 3.1 3.9"></path><path d="m12.4 3.4 3.1 4"></path><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path></svg></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-9deg);margin-left:-6px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path></svg></span></span><span style="flex-shrink:0;font-family:'Chillax','Sora',sans-serif;font-size:12px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.45)">already done</span></span>
      </span>
      <a href="#" style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#ffffff;color:#0d0d0c;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" class="okf-12"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path></svg>Upgrade</a>
    </div>
  </div>
</div>
</x-dc>`;

export const DASHBOARD = `<div style="width:1560px;height:940px;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;font-family:'DM Sans',system-ui,sans-serif;background:#ffffff">

  <div style="flex-shrink:0;display:flex;align-items:center;gap:14px;height:58px;padding:0 16px;background:#0d0d0c">
    <span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;color:rgba(255,255,255,0.5)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg></span>
    <span style="display:inline-flex;align-items:center;gap:9px;height:34px;padding:0 12px;border-radius:9px;background:rgba(255,255,255,0.1)">
      <span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;background:#ffffff"><svg width="10" height="12" viewBox="0 0 85 105" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M28.0518 104.559H18.7012V87.5576H28.0518V104.559ZM74.8066 87.5586H65.4551V70.5566H56.1055V87.5576H65.4551V104.559H56.1045V87.5586H46.7539V70.5566H37.4033V87.5576H46.7539V104.559H37.4023V87.5586H28.0518V70.5566H18.7012V87.5586H9.35059V61.2061H74.8066V87.5586ZM9.35059 61.2051H0V18.7021H9.35059V61.2051ZM84.1572 61.2051H74.8057V18.7021H84.1572V61.2051ZM18.6982 18.6982H9.35059V9.35059H18.6982V18.6982ZM74.8027 18.6982H65.4551V9.35059H74.8027V18.6982ZM65.4551 9.35059H18.7012V0H65.4551V9.35059Z" fill="#0d0d0c"></path><rect x="19.9766" y="28.0518" width="9.3505" height="9.3505" fill="#0d0d0c"></rect><rect x="54.8291" y="28.0518" width="9.3506" height="9.3505" fill="#0d0d0c"></rect></svg></span>
      <span style="font-size:14px;font-weight:600;color:#ffffff">Skribbl</span>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
    </span>
    <span style="position:relative;display:flex;align-items:center;gap:9px">
      <span style="position:relative;display:flex"><svg width="17" height="21" viewBox="0 0 85 105" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M28.0518 104.559H18.7012V87.5576H28.0518V104.559ZM74.8066 87.5586H65.4551V70.5566H56.1055V87.5576H65.4551V104.559H56.1045V87.5586H46.7539V70.5566H37.4033V87.5576H46.7539V104.559H37.4023V87.5586H28.0518V70.5566H18.7012V87.5586H9.35059V61.2061H74.8066V87.5586ZM9.35059 61.2051H0V18.7021H9.35059V61.2051ZM84.1572 61.2051H74.8057V18.7021H84.1572V61.2051ZM18.6982 18.6982H9.35059V9.35059H18.6982V18.6982ZM74.8027 18.6982H65.4551V9.35059H74.8027V18.6982ZM65.4551 9.35059H18.7012V0H65.4551V9.35059Z" fill="#ffffff"></path><rect x="19.9766" y="28.0518" width="9.3505" height="9.3505" fill="#ffffff" style="transform-origin:24px 33px;animation:okara-blink 6s ease-in-out infinite"></rect><rect x="54.8291" y="28.0518" width="9.3506" height="9.3505" fill="#ffffff" style="transform-origin:59px 33px;animation:okara-blink 6s ease-in-out infinite"></rect></svg><span style="position:absolute;top:-1px;right:-3px;width:6px;height:6px;border-radius:9999px;background:#22c55e"></span></span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:13px;color:rgba(255,255,255,0.85)">Okara Terminal</span>
    </span>
    <span style="width:1px;height:22px;background:rgba(255,255,255,0.16)"></span>
    <span style="display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:13px;color:#4ade80"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>Documents loaded and CMO initialized. Chat with your CMO.</span>
    <span style="margin-left:auto;display:flex;align-items:center;gap:10px">
      <span style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:#3f3f3a;font-size:11px;font-weight:700;color:#ffffff">JJ</span>
      <span style="display:block"><span style="display:block;font-size:13px;font-weight:600;color:#ffffff">Jawad Jalal</span><span style="display:block;font-size:11px;color:rgba(255,255,255,0.5)">14 Credits</span></span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
    </span>
  </div>

  <div style="flex:1;min-height:0;display:grid;grid-template-columns:300px 340px 500px minmax(0,1fr);grid-template-rows:minmax(0, 1fr)">

    <div class="okara-scroll" style="min-width:0;overflow-y:auto;border-right:1px solid #e9e5dc;background:#ffffff">
      <div style="display:flex;align-items:center;gap:10px;height:48px;padding:0 18px;border-bottom:1px solid #f1ede4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M9 8h1"></path><path d="M9 12h1"></path><path d="M9 16h1"></path><path d="M14 8h1"></path><path d="M14 12h1"></path></svg>
        <span style="font-size:14.5px;font-weight:600;color:#1c1917">Company</span>
        <span style="margin-left:auto;display:flex;color:#a8a29e"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg></span>
      </div>

      <div style="padding:18px 18px 22px;border-bottom:1px solid #f1ede4">
        <div style="display:flex;align-items:center;gap:11px">
          <img src="/okara/agentsfeed/logos/skribbl-dev-128.png" alt="Skribbl" style="width:30px;height:30px;object-fit:contain;border-radius:9px" />
          <span style="font-family:'Chillax','Sora',sans-serif;font-size:21px;font-weight:600;letter-spacing:-0.4px;color:#1c1917">Skribbl</span>
          <span style="margin-left:auto;display:flex;color:#a8a29e"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg></span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;margin-top:14px">
          <span style="display:inline-flex;align-items:center;gap:6px;height:27px;padding:0 10px;border-radius:8px;border:1px solid #e9e5dc;font-size:12px;color:#44403c"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.5 12 22l-9-9V4a1 1 0 0 1 1-1h9l7.6 7.6a2 2 0 0 1 0 2.9Z"></path><circle cx="8" cy="8" r="1.2"></circle></svg>Hybrid</span>
          <span style="display:inline-flex;align-items:center;gap:6px;height:27px;padding:0 10px;border-radius:8px;border:1px solid #e9e5dc;font-size:12px;color:#44403c"><span style="color:#a8a29e">@</span>skribbldev</span>
          <span style="display:inline-flex;align-items:center;gap:6px;height:27px;padding:0 10px;border-radius:8px;border:1px solid #e9e5dc;font-size:12px;color:#44403c"><img src="/okara/agentsfeed/assets/linkedin-agent-28x28.svg" alt="LinkedIn" style="width:12px;height:12px;object-fit:contain" />skribbl.dev</span>
        </div>
        <span style="display:inline-flex;align-items:center;gap:8px;height:34px;margin-top:12px;padding:0 13px;border-radius:9999px;border:1px solid #e9e5dc;font-size:12.5px;color:#44403c"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></svg>Add team size &amp; category</span>
        <p style="margin:16px 0 0;font-size:14px;line-height:23px;color:#44403c;text-wrap:pretty">Skribbl is a desktop application that gives developers a unified interface to run multiple AI coding agents, Claude, Codex, Gemini, and Grok, side by side, each in its own real terminal. Users can assign agents to separate git worktrees, chain them together with authority grants, and manage swarms of parallel runs without a proxy or relay.</p>
      </div>

      <div style="padding:18px 18px 20px;border-bottom:1px solid #f1ede4">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;color:#a8a29e">Documents</p>
        <a href="#" style="display:flex;align-items:center;gap:11px;padding:11px 0;font-size:14px;color:#1c1917"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>Product Information<span style="margin-left:auto;display:flex;color:#c8c2b6"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg></span></a>
        <a href="#" style="display:flex;align-items:center;gap:11px;padding:11px 0;font-size:14px;color:#1c1917"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>Marketing Strategy<span style="margin-left:auto;display:flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:9999px;background:#16a34a;animation:okara-pulse 2.4s ease-in-out infinite"></span><span style="display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:7px;background:#eef8f1;font-size:11px;font-weight:600;color:#15803d">New</span><span style="display:flex;color:#c8c2b6"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg></span></span></a>
        <a href="#" style="display:flex;align-items:center;gap:11px;padding:11px 0;font-size:14px;color:#1c1917"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>Competitor Analysis<span style="margin-left:auto;display:flex;color:#c8c2b6"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg></span></a>
        <a href="#" style="display:flex;align-items:center;gap:11px;padding:11px 0;font-size:14px;color:#1c1917"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>Design Guide<span style="margin-left:auto;display:flex;color:#c8c2b6"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg></span></a>
        <a href="#" style="display:flex;align-items:center;gap:11px;padding:11px 0;font-size:14px;color:#1c1917"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg>Content Strategy<span style="margin-left:auto;display:flex;color:#c8c2b6"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg></span></a>
        <a href="#" style="display:flex;align-items:center;gap:11px;padding:11px 0;font-size:14px;color:#1c1917"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7L11 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"></path></svg>Articles<span style="margin-left:auto;display:flex;color:#c8c2b6"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg></span></a>
      </div>

      <div style="padding:18px 18px 26px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;color:#a8a29e">Competitors</p>
          <span style="margin-left:auto;display:flex;color:#a8a29e"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg></span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px 12px">
          <a href="#" style="display:flex;align-items:center;gap:9px;min-width:0;font-size:13px;color:#1c1917"><img src="/okara/agentsfeed/logos/conductor-build-64.png" alt="" style="flex-shrink:0;width:22px;height:22px;object-fit:contain;border-radius:6px" /><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">conductor.build</span></a>
          <a href="#" style="display:flex;align-items:center;gap:9px;min-width:0;font-size:13px;color:#1c1917"><img src="/okara/agentsfeed/logos/parallelcode-app-64.png" alt="" style="flex-shrink:0;width:22px;height:22px;object-fit:contain;border-radius:6px" /><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">parallelcode.app</span></a>
          <a href="#" style="display:flex;align-items:center;gap:9px;min-width:0;font-size:13px;color:#1c1917"><img src="/okara/agentsfeed/logos/nimbalyst-com-64.png" alt="" style="flex-shrink:0;width:22px;height:22px;object-fit:contain;border-radius:6px" /><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">nimbalyst.com</span></a>
          <a href="#" style="display:flex;align-items:center;gap:9px;min-width:0;font-size:13px;color:#1c1917"><img src="/okara/agentsfeed/logos/codeagentswarm-com-64.png" alt="" style="flex-shrink:0;width:22px;height:22px;object-fit:contain;border-radius:6px" /><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">codeagentswarm...</span></a>
          <a href="#" style="display:flex;align-items:center;gap:9px;min-width:0;font-size:13px;color:#1c1917"><img src="/okara/agentsfeed/logos/github-com-64.png" alt="" style="flex-shrink:0;width:22px;height:22px;object-fit:contain;border-radius:6px" /><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">github.com</span></a>
          <a href="#" style="display:flex;align-items:center;gap:9px;min-width:0;font-size:13px;color:#1c1917"><img src="/okara/agentsfeed/logos/augmentcode-com-64.png" alt="" style="flex-shrink:0;width:22px;height:22px;object-fit:contain;border-radius:6px" /><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">augmentcode.com</span></a>
        </div>
      </div>
    </div>

    <div class="okara-scroll" style="min-width:0;overflow-y:auto;border-right:1px solid #e9e5dc;background:#ffffff">
      <div style="display:flex;align-items:center;gap:10px;height:48px;padding:0 18px;border-bottom:1px solid #f1ede4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><rect x="7" y="12" width="3" height="6"></rect><rect x="13" y="8" width="3" height="10"></rect></svg>
        <span style="font-size:14.5px;font-weight:600;color:#1c1917">Analytics</span>
        <span style="width:8px;height:8px;border-radius:9999px;background:#16a34a;animation:okara-pulse 2.4s ease-in-out infinite"></span>
        <span style="margin-left:auto;display:flex;color:#a8a29e"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg></span>
      </div>

      <div style="padding:16px 18px 0">
        <div style="display:flex;gap:2px;padding:4px;box-sizing:border-box;border-radius:11px;background:#f6f4ef">
          <span style="flex:1;display:flex;align-items:center;justify-content:center;height:32px;border-radius:8px;background:#ffffff;border:1px solid #e9e5dc;font-size:12.5px;font-weight:600;color:#1c1917">Traffic</span>
          <span style="flex:1;display:flex;align-items:center;justify-content:center;height:32px;border-radius:8px;font-size:12.5px;font-weight:500;color:#78716c">SEO</span>
          <span style="flex:1;display:flex;align-items:center;justify-content:center;height:32px;border-radius:8px;font-size:12.5px;font-weight:500;color:#78716c">Links</span>
          <span style="flex:1;display:flex;align-items:center;justify-content:center;height:32px;border-radius:8px;font-size:12.5px;font-weight:500;color:#78716c">Technical</span>
          <span style="flex:1;display:flex;align-items:center;justify-content:center;height:32px;border-radius:8px;font-size:12.5px;font-weight:500;color:#78716c">GEO</span>
        </div>
      </div>

      <div style="padding:20px 18px 0">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.11em;text-transform:uppercase;color:#a8a29e">Finish setup</p>
        <div style="box-sizing:border-box;border:1px solid #e9e5dc;border-radius:14px;background:#faf9f6;padding:16px">
          <div style="display:flex;gap:12px">
            <span style="flex-shrink:0;display:flex;align-items:flex-start"><img src="/okara/agentsfeed/assets/ga.png" alt="Google Analytics" style="width:22px;height:22px;object-fit:contain" /></span>
            <span style="min-width:0;flex:1">
              <span style="display:block;font-size:14px;font-weight:600;color:#1c1917">Google Analytics</span>
              <span style="display:block;margin-top:2px;font-size:13px;color:#78716c">Select a property to track</span>
            </span>
          </div>
          <p style="margin:14px 0 0;font-size:13px;line-height:20px;color:#dc2626">No GA4 properties found on this account.</p>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:8px;padding:22px 18px 0">
        <span style="font-size:13.5px;color:#78716c">Showing</span>
        <span style="margin-left:auto;display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:9px;background:#1c1917;color:#ffffff;font-size:12.5px;font-weight:600">Last 7 days</span>
        <span style="display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:9px;background:#f6f4ef;font-size:12.5px;font-weight:500;color:#78716c">Last 30 days</span>
      </div>

      <div style="padding:22px 18px 0">
        <p style="margin:0;font-size:15px;font-weight:600;color:#1c1917">Performance over time</p>
        <p style="margin:3px 0 0;font-size:12.5px;color:#a8a29e">Last 7 days</p>
        <div style="margin-top:12px;box-sizing:border-box;border:1px solid #eae6de;border-radius:12px;background:#fbfaf8;padding:12px 8px 4px">
          <svg viewBox="0 0 320 96" width="100%" height="96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M14 82 C40 82 44 22 70 22 C96 22 100 22 126 22 C152 22 156 24 182 24 C196 24 200 84 212 84 C226 84 232 22 254 22 C278 22 286 22 306 22" fill="none" stroke="#93b8f5" stroke-width="2" stroke-dasharray="5 5" stroke-linecap="round" style="stroke-dasharray:5 5"></path>
            <circle cx="14" cy="82" r="3.2" fill="#93b8f5"></circle><circle cx="70" cy="22" r="3.2" fill="#93b8f5"></circle><circle cx="126" cy="22" r="3.2" fill="#93b8f5"></circle><circle cx="182" cy="24" r="3.2" fill="#93b8f5"></circle><circle cx="212" cy="84" r="3.2" fill="#93b8f5"></circle><circle cx="254" cy="22" r="3.2" fill="#93b8f5"></circle><circle cx="306" cy="22" r="3.2" fill="#93b8f5"></circle>
          </svg>
          <div style="display:flex;justify-content:space-between;padding:0 6px 8px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#b3aca1"><span>8/9</span><span>8/10</span><span>8/11</span><span>8/12</span><span>8/13</span><span>8/14</span><span>8/15</span></div>
        </div>
        <p style="margin:12px 0 0;display:flex;align-items:center;gap:9px;font-size:12.5px;color:#57534e"><span style="width:16px;height:2px;background:#93b8f5"></span>Search clicks</p>
      </div>

      <div style="padding:22px 18px 0">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <p style="margin:0;font-size:15px;font-weight:600;color:#1c1917">Performance over time</p>
          <span style="display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:8px;background:#1c1917;color:#ffffff;font-size:11.5px;font-weight:600">Clicks</span>
          <span style="display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:8px;background:#f6f4ef;font-size:11.5px;font-weight:500;color:#78716c">Impressions</span>
          <span style="display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:8px;background:#f6f4ef;font-size:11.5px;font-weight:500;color:#78716c">CTR</span>
          <span style="display:inline-flex;align-items:center;height:26px;padding:0 11px;border-radius:8px;background:#f6f4ef;font-size:11.5px;font-weight:500;color:#78716c">Position</span>
        </div>
        <div style="margin-top:12px;box-sizing:border-box;border:1px solid #eae6de;border-radius:12px;background:#fbfaf8;padding:12px 8px 4px">
          <svg viewBox="0 0 320 96" width="100%" height="96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M14 84 C40 84 44 20 70 20 C96 20 100 20 126 20 C152 20 156 22 182 22 C196 22 200 86 212 86 C226 86 232 20 254 20 C278 20 286 20 306 20 L306 92 L14 92 Z" fill="#dce9fd"></path>
            <path d="M14 84 C40 84 44 20 70 20 C96 20 100 20 126 20 C152 20 156 22 182 22 C196 22 200 86 212 86 C226 86 232 20 254 20 C278 20 286 20 306 20" fill="none" stroke="#2f80ed" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="900" stroke-dashoffset="900" style="animation:okara-draw 1.6s .3s cubic-bezier(.22,.7,.2,1) forwards"></path>
            <circle cx="14" cy="84" r="3.4" fill="#2f80ed"></circle><circle cx="70" cy="20" r="3.4" fill="#2f80ed"></circle><circle cx="126" cy="20" r="3.4" fill="#2f80ed"></circle><circle cx="182" cy="22" r="3.4" fill="#2f80ed"></circle><circle cx="212" cy="86" r="3.4" fill="#2f80ed"></circle><circle cx="254" cy="20" r="3.4" fill="#2f80ed"></circle><circle cx="306" cy="20" r="3.4" fill="#2f80ed"></circle>
          </svg>
          <div style="display:flex;justify-content:space-between;padding:0 6px 8px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#b3aca1"><span>8/9</span><span>8/10</span><span>8/11</span><span>8/12</span><span>8/13</span><span>8/14</span><span>8/15</span></div>
        </div>
      </div>

      <div style="padding:24px 18px 28px">
        <p style="margin:0;font-size:15px;font-weight:600;color:#1c1917">How well you&#8217;re ranking</p>
        <p style="margin:4px 0 0;font-size:13px;line-height:20px;color:#78716c">Your position in Google and the queries bringing traffic</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px">
          <div style="box-sizing:border-box;border:1px solid #eae6de;border-radius:12px;padding:12px 13px">
            <p style="margin:0;display:flex;align-items:center;gap:5px;font-size:12px;color:#78716c">Avg. position<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c2b6" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01M11 12h1v4h1"></path></svg></p>
            <p style="margin:8px 0 0;font-family:'Chillax','Sora',sans-serif;font-size:24px;font-weight:600;letter-spacing:-0.6px;color:#1c1917">#43.1</p>
            <p style="margin:6px 0 0;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#dc2626"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"></path><path d="M8 7h9v9"></path></svg>+129.3%</p>
          </div>
          <div style="box-sizing:border-box;border:1px solid #eae6de;border-radius:12px;padding:12px 13px">
            <p style="margin:0;display:flex;align-items:center;gap:5px;font-size:12px;color:#78716c">Click rate<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c2b6" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01M11 12h1v4h1"></path></svg></p>
            <p style="margin:8px 0 0;font-family:'Chillax','Sora',sans-serif;font-size:24px;font-weight:600;letter-spacing:-0.6px;color:#1c1917">3.11%</p>
            <p style="margin:6px 0 0;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:#dc2626"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M17 17 7 7"></path><path d="M16 17h-9V8"></path></svg>-599.0%</p>
          </div>
          <div style="box-sizing:border-box;border:1px solid #eae6de;border-radius:12px;padding:12px 13px">
            <p style="margin:0;display:flex;align-items:center;gap:5px;font-size:12px;color:#78716c">Total clicks<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8c2b6" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01M11 12h1v4h1"></path></svg></p>
            <p style="margin:8px 0 0;font-family:'Chillax','Sora',sans-serif;font-size:24px;font-weight:600;letter-spacing:-0.6px;color:#1c1917">5</p>
            <p style="margin:6px 0 0;display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#a8a29e"><span style="width:8px;height:1.5px;background:currentColor"></span>0.0%</p>
          </div>
        </div>
      </div>
    </div>

    <div style="min-width:0;display:flex;flex-direction:column;border-right:1px solid #e9e5dc;background:#faf9f6">
      <div style="display:flex;align-items:center;gap:10px;height:48px;padding:0 18px;border-bottom:1px solid #e9e5dc;background:#ffffff">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#57534e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
        <span style="font-size:14.5px;font-weight:600;color:#1c1917">Agents Feed</span>
        <span style="width:8px;height:8px;border-radius:9999px;background:#16a34a;animation:okara-pulse 2.4s ease-in-out infinite"></span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:14px;color:#a8a29e">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"></rect><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"></path><path d="M10 12h4"></path></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path><path d="M12 8v4l3 2"></path></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V22a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 20.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15H2a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 3.7 7l-.1-.1a2 2 0 1 1 2.8-2.8L6.5 4A1.7 1.7 0 0 0 9 3.7V3a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17 4.7l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11h.1a2 2 0 1 1 0 4H21Z"></path></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>
        </span>
      </div>

      <div class="okara-scroll" style="flex:1;min-height:0;overflow-y:auto;padding:16px 16px 0">

    <div style="box-sizing:border-box;border:1px solid #e2ddd2;border-radius:16px;background:#ffffff;overflow:hidden;box-shadow:0 6px 16px -10px rgba(28,25,23,0.22);flex-shrink:0;transition:border-color .25s ease, box-shadow .25s ease" class="okf-13">
      <div role="button" tabindex="0" data-act="toggleX" role="button" tabindex="0" style="display:flex;align-items:flex-start;gap:14px;padding:20px 22px;cursor:pointer;user-select:none" class="okf-14">
        <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#0d0d0c"><svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg></span>
        <span style="min-width:0;flex:1">
          <span style="display:flex;align-items:center;gap:9px">
            <span style="font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#1c1917"><svg width="12" height="12" viewBox="0 0 24 24" fill="#1c1917" style="vertical-align:-1px"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg> Agent</span>
            
          </span>
          <span style="display:block;margin-top:5px;font-size:14.5px;line-height:24px;color:#57534e">Set up your <span style="display:inline-flex;align-items:baseline;gap:6px;padding:1px 9px 2px;margin:0 2px;border-radius:8px;background:#f6f4ef;white-space:nowrap"><span style="display:inline-flex;align-self:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v1a7 7 0 0 1-14 0v-1"></path><path d="M12 19v3"></path></svg></span>brand voice</span> to get started</span>
        </span>
        <span data-rot="x" style="flex-shrink:0;display:flex;color:#a8a29e;transition:transform .28s cubic-bezier(.22,.7,.2,1);transform:rotate(0deg)"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"></path></svg></span>
      </div>
      <div data-wrap="x" style="overflow:hidden;max-height:none;opacity:1;transition:max-height .38s cubic-bezier(.22,.7,.2,1), opacity .26s ease">
      <div style="padding:18px 22px 22px;border-top:1px solid #f1ede4">
        <span data-when="xShowFirst" style="display:contents">
        <div data-fly="x" style="box-sizing:border-box;border:1px solid #f1ede4;border-radius:13px;background:#fbfaf8;padding:16px 18px">
          <p style="margin:0;font-size:14px;line-height:23px;color:#1c1917">i just hired an ai cmo from <span style="color:#2f80ed">@askokara</span> to help grow Skribbl</p>
          <p style="margin:11px 0 0;font-size:14px;line-height:23px;color:#1c1917">so far it has:</p>
          <p style="margin:4px 0 0;font-size:14px;line-height:25px;color:#1c1917">&#8226; identified reddit opportunities<br />&#8226; discovered seo issues<br />&#8226; analyzed competitors</p>
          
        </div>
        </span>
        <span data-when="xShowNext" style="display:contents">
          <div class="okara-arrive" style="position:relative;box-sizing:border-box;border:1px solid #f1ede4;border-radius:13px;background:#fbfaf8;padding:16px 18px;overflow:hidden">
            <div data-blur style="filter:blur(5px);transition:filter .5s cubic-bezier(.22,.7,.2,1)">
              <p style="margin:0;font-size:14px;line-height:23px;color:#1c1917">week one with an ai cmo running Skribbl&#8217;s marketing</p>
              <p style="margin:11px 0 0;font-size:14px;line-height:25px;color:#1c1917">&#8226; 24 pages read<br />&#8226; 4 competitors found<br />&#8226; 5 strategy docs written</p>
              
            </div>
            <span data-when="xHidden" style="display:contents">
              <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(251,250,248,0.55)">
                <span style="font-family:'Chillax','Sora',sans-serif;font-size:14px;font-weight:600;color:#1c1917">Next draft ready</span>
                <button type="button" data-act="reveal" role="button" tabindex="0" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;height:36px;padding:0 16px;border-radius:10px;border:1px solid #e2ddd2;background:#ffffff;font-family:inherit;font-size:12.5px;font-weight:600;color:#44403c;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease" class="okf-15"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M2.1 12S5.6 5.5 12 5.5 21.9 12 21.9 12 18.4 18.5 12 18.5 2.1 12 2.1 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>Reveal</button>
              </div>
            </span>
          </div>
        </span>
        <div style="display:flex;align-items:center;gap:10px;margin-top:16px;min-height:40px">
          <span data-when="xIdle" style="display:contents">
            <a href="#"  style="flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;font-size:13px;font-weight:600;color:#57534e;transition:color .2s ease" class="okf-16"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>Edit draft</a>
            <button type="button" data-act="post" role="button" tabindex="0" style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" style-active="transform:translateY(0)" class="okf-17"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>Post now</button>
          </span>
          <span data-when="xFlying" style="display:contents">
            <span style="flex-shrink:0;display:inline-flex;align-items:center;height:40px;font-size:13px;font-weight:500;color:#a8a29e">Sending to X</span>
            <span style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;cursor:default"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>Posting</span>
          </span>
          <span data-when="xDone" style="display:contents">
            <span style="flex-shrink:0;display:inline-flex;align-items:center;gap:7px;height:40px;font-size:13px;font-weight:500;color:#15803d;animation:okara-lift .34s ease both"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>Posted to X</span>
            <a href="#"  style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;font-size:13px;font-weight:600;color:#57534e;transition:color .2s ease" class="okf-18"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>Edit draft</a>
            <button type="button" data-act="post" role="button" tabindex="0" style="flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" class="okf-19"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>Post now</button>
          </span>
        </div>
      </div>
      </div>
    </div>

    <div style="margin-top:12px;box-sizing:border-box;border:1px solid #e2ddd2;border-radius:16px;background:#ffffff;overflow:hidden;box-shadow:0 6px 16px -10px rgba(28,25,23,0.22);flex-shrink:0;transition:border-color .25s ease, box-shadow .25s ease" class="okf-20">
      <div role="button" tabindex="0" data-act="toggleInf" role="button" tabindex="0" style="display:flex;align-items:flex-start;gap:14px;padding:20px 22px;cursor:pointer;user-select:none" class="okf-21">
        <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#16a34a;box-shadow:0 5px 12px -6px rgba(22,163,74,0.7)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg></span>
        <span style="min-width:0;flex:1">
          <span style="display:flex;align-items:center;gap:9px">
            <span style="font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#1c1917"><svg width="12" height="12" viewBox="0 0 24 24" fill="#1c1917" style="vertical-align:-1px"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg> Influencer Agent</span>
            
          </span>
          <span style="display:block;margin-top:5px;font-size:14.5px;line-height:24px;color:#57534e">Launch your first campaign. <span style="display:inline-flex;align-items:baseline;gap:6px;padding:1px 9px 2px;margin:0 2px;border-radius:8px;background:#f6f4ef;white-space:nowrap"><span style="display:inline-flex;align-self:center;flex-shrink:0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path></svg></span>1000+ influencers</span> are waiting.</span>
        </span>
        <span data-rot="inf" style="flex-shrink:0;display:flex;color:#a8a29e;transition:transform .28s cubic-bezier(.22,.7,.2,1);transform:rotate(0deg)"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"></path></svg></span>
      </div>
      <div data-wrap="inf" style="overflow:hidden;max-height:none;opacity:1;transition:max-height .38s cubic-bezier(.22,.7,.2,1), opacity .26s ease">
      <div style="border-top:1px solid #f1ede4">
        <span data-when="infIdle" style="display:contents">
          <div style="padding:16px 22px 4px">
            <div style="box-sizing:border-box;border:1px solid #f1ede4;border-radius:13px;background:#fbfaf8;padding:14px 18px">
              <p style="margin:0;display:flex;align-items:center;gap:8px;font-family:'Chillax','Sora',sans-serif;font-size:12px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:#a8a29e">Suggested brief</p>
              <p style="margin:9px 0 0;font-size:14px;line-height:23px;color:#1c1917">Show four coding agents running side by side in one terminal.</p>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:14px;padding:14px 22px 20px">
            <span style="min-width:0;flex:1">
              <span style="display:block;font-size:15px;font-weight:600;color:#1c1917">Create an influencer campaign</span>
            </span>
            <button type="button" data-act="create" role="button" tabindex="0" style="flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" style-active="transform:translateY(0)" class="okf-22"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>Create</button>
          </div>
        </span>
        <span data-when="infPaywall" style="display:contents">
          <div class="okara-paywall" style="position:relative;overflow:hidden;padding:22px;background:linear-gradient(180deg,#fbfaf8,#f6f4ef)">
            <div style="position:relative;display:flex;align-items:flex-start;gap:13px">
              <span class="okara-lock" style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:12px;background:#1c1917"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg></span>
              <span style="min-width:0;flex:1">
                <span style="display:block;font-family:'Chillax','Sora',sans-serif;font-size:16px;font-weight:600;letter-spacing:-0.2px;color:#1c1917">Campaigns need a paid plan</span>
                <span style="display:block;margin-top:5px;font-size:13.5px;line-height:21px;color:#57534e">AI CMO Lite is <span style="font-weight:600;color:#1c1917">$129</span>/month, or $108 billed annually.</span>
              </span>
            </div>
            <div style="position:relative;margin-top:14px">
                <span class="okara-perk" style="display:flex;align-items:center;gap:9px;padding:9px 0;font-size:13px;color:#44403c">
                  <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:7px;background:#ffffff;border:1px solid #f1ede4"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span>Influencer campaigns, unlimited
                </span>
                <span class="okara-perk" style="display:flex;align-items:center;gap:9px;padding:9px 0;border-top:1px solid #f1ede4;font-size:13px;color:#44403c">
                  <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:7px;background:#ffffff;border:1px solid #f1ede4"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg></span>All eight sleeping agents wake up
                </span>
            </div>
            <div style="position:relative;display:flex;align-items:center;gap:10px;margin-top:16px">
              <button type="button" data-act="cancel" role="button" tabindex="0" style="flex-shrink:0;display:inline-flex;align-items:center;height:40px;font-family:inherit;font-size:13px;font-weight:600;color:#57534e;background:none;border:0;cursor:pointer;transition:color .2s ease" class="okf-23">Not now</button>
              <a href="#" style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#1c1917;color:#ffffff;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" class="okf-24"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path></svg>See plans</a>
            </div>
          </div>
        </span>
      </div>
      </div>
    </div>


      </div>
      <div style="flex-shrink:0;padding:12px 16px 16px">
    <div style="display:flex;align-items:center;gap:18px;padding:26px 22px;box-sizing:border-box;border-radius:16px;background:#0d0d0c;flex-shrink:0">
      <span style="min-width:0;flex:1">
        <span style="display:block;font-family:'Chillax','Sora',sans-serif;font-size:16px;font-weight:600;line-height:1.3;letter-spacing:-0.2px;color:#ffffff">Eight agents are asleep</span>
        <span style="display:flex;align-items:center;gap:12px;margin-top:12px"><span style="display:flex;align-items:center"><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-11deg);"><img src="/okara/agentsfeed/assets/agent-icons/reddit.svg" alt="Reddit Agent" style="width:14px;height:14px;object-fit:contain" /></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(7deg);margin-left:-6px;"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-5deg);margin-left:-6px;"><img src="/okara/agentsfeed/assets/agent-icons/seo-agent.svg" alt="SEO Agent" style="width:14px;height:14px;object-fit:contain" /></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(10deg);margin-left:-6px;"><svg width="13" height="13" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.75 0.189331L9.28033 0.719661L15.2803 6.71966L15.8107 7.24999L15.2803 7.78032L13.7374 9.32322C13.1911 9.8696 12.3733 9.97916 11.718 9.65188L9.54863 13.5568C8.71088 15.0648 7.12143 16 5.39639 16H0.75H0V15.25V10.6036C0 8.87856 0.935237 7.28911 2.4432 6.45136L6.34811 4.28196C6.02084 3.62674 6.13039 2.80894 6.67678 2.26255L8.21967 0.719661L8.75 0.189331ZM7.3697 5.43035L10.5696 8.63029L8.2374 12.8283C7.6642 13.8601 6.57668 14.5 5.39639 14.5H2.56066L5.53033 11.5303L4.46967 10.4697L1.5 13.4393V10.6036C1.5 9.42331 2.1399 8.33579 3.17166 7.76259L7.3697 5.43035ZM12.6768 8.26256C12.5791 8.36019 12.4209 8.36019 12.3232 8.26255L12.0303 7.96966L8.03033 3.96966L7.73744 3.67677C7.63981 3.57914 7.63981 3.42085 7.73744 3.32321L8.75 2.31065L13.6893 7.24999L12.6768 8.26256Z" fill="#ffffff"></path></svg></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-8deg);margin-left:-6px;"><img src="/okara/agentsfeed/assets/agent-icons/hacker-news.png" alt="Hacker News Agent" style="width:14px;height:14px;object-fit:contain" /></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(6deg);margin-left:-6px;"><img src="/okara/agentsfeed/assets/linkedin-agent-28x28.svg" alt="LinkedIn Agent" style="width:14px;height:14px;object-fit:contain;filter:brightness(0) invert(1)" /></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-3deg);margin-left:-6px;"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"></path><path d="m6.2 5.3 3.1 3.9"></path><path d="m12.4 3.4 3.1 4"></path><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path></svg></span><span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:8px;background:#26251f;box-shadow:0 0 0 1.5px #0d0d0c;transform:rotate(-9deg);margin-left:-6px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path></svg></span></span><span style="flex-shrink:0;font-family:'Chillax','Sora',sans-serif;font-size:12px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.45)">already done</span></span>
      </span>
      <a href="#" style="margin-left:auto;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:140px;height:40px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;border:0;font-family:inherit;background:#ffffff;color:#0d0d0c;transition:transform .2s cubic-bezier(.22,.7,.2,1), box-shadow .2s ease" class="okf-25"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 7 13.5 15.5 8.5 10.5 2 17"></path><path d="M16 7h6v6"></path></svg>Upgrade</a>
    </div>
      </div>
    </div>

    <div style="min-width:0;display:flex;flex-direction:column;background:#0d0d0c">
      <div style="flex-shrink:0;display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.09)">
        <span style="flex-shrink:0;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:#ffffff"><svg width="17" height="21" viewBox="0 0 85 105" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M28.0518 104.559H18.7012V87.5576H28.0518V104.559ZM74.8066 87.5586H65.4551V70.5566H56.1055V87.5576H65.4551V104.559H56.1045V87.5586H46.7539V70.5566H37.4033V87.5576H46.7539V104.559H37.4023V87.5586H28.0518V70.5566H18.7012V87.5586H9.35059V61.2061H74.8066V87.5586ZM9.35059 61.2051H0V18.7021H9.35059V61.2051ZM84.1572 61.2051H74.8057V18.7021H84.1572V61.2051ZM18.6982 18.6982H9.35059V9.35059H18.6982V18.6982ZM74.8027 18.6982H65.4551V9.35059H74.8027V18.6982ZM65.4551 9.35059H18.7012V0H65.4551V9.35059Z" fill="#0d0d0c"></path><rect x="19.9766" y="28.0518" width="9.3505" height="9.3505" fill="#0d0d0c" style="transform-origin:24px 33px;animation:okara-blink 5.5s ease-in-out infinite"></rect><rect x="54.8291" y="28.0518" width="9.3506" height="9.3505" fill="#0d0d0c" style="transform-origin:59px 33px;animation:okara-blink 5.5s ease-in-out infinite"></rect></svg></span>
        <span style="min-width:0;flex:1">
          <span style="display:block;font-family:'Chillax','Sora',sans-serif;font-size:17px;font-weight:600;letter-spacing:-0.3px;color:#ffffff">Hire your full-time CMO</span>
          <span style="display:block;margin-top:3px;font-size:13px;line-height:19px;color:rgba(255,255,255,0.6)">AI-powered marketing starting at $129/month</span>
        </span>
        <a href="#" style="flex-shrink:0;display:inline-flex;align-items:center;height:38px;padding:0 17px;border-radius:9999px;background:#ffffff;color:#0d0d0c;font-size:13px;font-weight:600">Hire Now</a>
      </div>

      <div style="flex-shrink:0;display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.09)">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span style="font-size:14.5px;font-weight:600;color:#ffffff">Talk to AI CMO</span>
        <span style="width:8px;height:8px;border-radius:9999px;background:#16a34a;animation:okara-pulse 2.4s ease-in-out infinite"></span>
        <span style="margin-left:auto;display:flex;align-items:center;gap:14px;color:rgba(255,255,255,0.45)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="12" cy="19" r="1.6"></circle></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"></path></svg>
        </span>
      </div>

      <div class="okara-scroll" style="flex:1;min-height:0;overflow-y:auto;padding:18px 18px 8px">
        <p style="margin:0;font-size:14.5px;line-height:25px;color:rgba(255,255,255,0.82);text-wrap:pretty">Here is what I would change about the feed itself, based on how you are actually using it:</p>
        <ul style="margin:16px 0 0;padding-left:20px;display:flex;flex-direction:column;gap:14px">
          <li style="font-size:14.5px;line-height:25px;color:rgba(255,255,255,0.82);text-wrap:pretty"><span style="font-weight:700;color:#ffffff">Credit cost transparency upfront.</span> Right now it is not always obvious how many credits an action will cost before you commit. A visible cost preview before every paid action would reduce hesitation.</li>
          <li style="font-size:14.5px;line-height:25px;color:rgba(255,255,255,0.82);text-wrap:pretty"><span style="font-weight:700;color:#ffffff">Unified next best action feed.</span> SEO recs, Reddit opportunities, article suggestions and social drafts currently live in separate tabs. A single ranked feed would cut down on tab switching.</li>
          <li style="font-size:14.5px;line-height:25px;color:rgba(255,255,255,0.82);text-wrap:pretty"><span style="font-weight:700;color:#ffffff">Inline diff previews for auto-fixes.</span> Before a PR opens, a lightweight before and after snippet of what the coding agent will change would reduce the black box feeling.</li>
          <li style="font-size:14.5px;line-height:25px;color:rgba(255,255,255,0.82);text-wrap:pretty"><span style="font-weight:700;color:#ffffff">Progress and freshness indicators.</span> Since Content Strategy and Marketing Strategy regenerate monthly, a visible last refreshed badge would clarify why things update on their own.</li>
        </ul>
        <div style="display:flex;align-items:center;gap:10px;margin-top:20px">
          <span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.5)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15V5a2 2 0 0 1 2-2h10"></path></svg></span>
          <span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.5)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"></path><path d="M15 5.9 14 10h5.6a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.2 22H7V10l4-8a2 2 0 0 1 4 1.4Z"></path></svg></span>
          <span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.5)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"></path><path d="M9 18.1 10 14H4.4a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.8 2H17v12l-4 8a2 2 0 0 1-4-1.4Z"></path></svg></span>
        </div>
      </div>

      <div style="flex-shrink:0;padding:14px 18px 18px">
        <div style="box-sizing:border-box;border:1px solid rgba(255,255,255,0.14);border-radius:16px;background:rgba(255,255,255,0.04);padding:14px 16px">
          <input type="text" placeholder="Ask me anything..." style="width:100%;box-sizing:border-box;border:0;outline:0;background:transparent;font-family:'DM Sans',system-ui,sans-serif;font-size:14.5px;color:#ffffff" />
          <div style="display:flex;align-items:center;gap:14px;margin-top:26px;color:rgba(255,255,255,0.4)">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.4 11.1-9.2 9.2a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 1 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 1 1-2.3-2.3l7.8-7.8"></path></svg>
            <span style="width:1px;height:16px;background:rgba(255,255,255,0.14)"></span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"></path></svg>
            <span style="margin-left:auto;display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:rgba(255,255,255,0.1);color:#ffffff"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg></span>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>
</x-dc>`;
