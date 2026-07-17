// api/send-checkin.js
// Vercel serverless function — deploy alongside index.html in the repo root.
// Requires env var: RESEND_API_KEY (set in Vercel dashboard → Settings → Environment Variables)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, scores, notes, avg, state, body, practice, date } = req.body;

  if (!scores || avg == null || !state) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  // ── Score bar helper ──────────────────────────────────
  const bar = (v) => {
    const filled = Math.round(v);
    return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${v}/10`;
  };

  // ── Score colour ──────────────────────────────────────
  const scoreColor = avg <= 3 ? '#6DB87A' : avg <= 5 ? '#C9A96E' : avg <= 7 ? '#E8A84A' : '#C05C3A';

  // ── HTML email ────────────────────────────────────────
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Check-In · Level One Bodywork</title>
</head>
<body style="margin:0;padding:0;background:#0E0C0F;font-family:Georgia,serif;color:#F5EED8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0C0F;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:0 0 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-family:Georgia,serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A96E;">
                    Brock John · Level One Bodywork
                  </span>
                </td>
                <td align="right">
                  <span style="font-size:11px;color:#8B7355;">${date || new Date().toLocaleString()}</span>
                </td>
              </tr>
              ${name ? `<tr><td colspan="2" style="padding-top:8px;">
                <span style="font-size:22px;font-weight:700;color:#F5EED8;font-family:Georgia,serif;">${name}</span>
              </td></tr>` : ''}
            </table>
          </td>
        </tr>

        <!-- Score card -->
        <tr>
          <td style="background:rgba(201,169,110,0.08);border:1px solid rgba(201,169,110,0.25);border-radius:16px;padding:28px 32px 24px;">

            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(201,169,110,0.7);">
              Member Check-In · Received
            </p>

            <!-- Score row -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 20px;border-bottom:1px solid rgba(201,169,110,0.2);padding-bottom:20px;">
              <tr>
                <td width="60" valign="middle">
                  <div style="width:52px;height:52px;border-radius:50%;border:1.5px solid rgba(201,169,110,0.4);background:rgba(201,169,110,0.1);display:flex;align-items:center;justify-content:center;text-align:center;line-height:52px;font-size:20px;font-weight:700;color:${scoreColor};">
                    ${avg.toFixed(1)}
                  </div>
                </td>
                <td valign="middle" style="padding-left:16px;">
                  <p style="margin:0;font-size:17px;font-weight:700;color:#F5EED8;">${state}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#C8BC9E;">Average across five check-in areas</p>
                </td>
              </tr>
            </table>

            <!-- Individual scores -->
            <table width="100%" cellpadding="0" cellspacing="4" style="margin-bottom:20px;">
              <tr>
                <td style="font-size:11px;color:#C8BC9E;padding:3px 0;">Activation</td>
                <td align="right" style="font-size:11px;font-family:monospace;color:#C9A96E;letter-spacing:-0.02em;">${bar(scores.activation)}</td>
              </tr>
              <tr>
                <td style="font-size:11px;color:#C8BC9E;padding:3px 0;">Fatigue</td>
                <td align="right" style="font-size:11px;font-family:monospace;color:#C9A96E;letter-spacing:-0.02em;">${bar(scores.fatigue)}</td>
              </tr>
              <tr>
                <td style="font-size:11px;color:#C8BC9E;padding:3px 0;">Tension</td>
                <td align="right" style="font-size:11px;font-family:monospace;color:#C9A96E;letter-spacing:-0.02em;">${bar(scores.tension)}</td>
              </tr>
              <tr>
                <td style="font-size:11px;color:#C8BC9E;padding:3px 0;">Breath</td>
                <td align="right" style="font-size:11px;font-family:monospace;color:#C9A96E;letter-spacing:-0.02em;">${bar(scores.breath)}</td>
              </tr>
              <tr>
                <td style="font-size:11px;color:#C8BC9E;padding:3px 0;">Support</td>
                <td align="right" style="font-size:11px;font-family:monospace;color:#C9A96E;letter-spacing:-0.02em;">${bar(scores.support)}</td>
              </tr>
            </table>

            <!-- Body text -->
            <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:rgba(245,238,216,0.88);">${body}</p>

            <!-- Practice block -->
            <div style="background:rgba(201,169,110,0.1);border:1px solid rgba(201,169,110,0.25);border-radius:10px;padding:16px 18px;">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A96E;">Practice for Right Now</p>
              <p style="margin:0;font-size:13px;line-height:1.65;color:#F5EED8;">${practice}</p>
            </div>

            ${notes ? `
            <!-- Notes -->
            <div style="margin-top:16px;border-top:1px solid rgba(201,169,110,0.15);padding-top:16px;">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(201,169,110,0.6);">Member Notes</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(245,238,216,0.75);font-style:italic;">"${notes}"</p>
            </div>` : ''}

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 0 0;text-align:center;">
            <p style="margin:0;font-size:10px;color:#5A4D38;line-height:1.6;">
              Brock John · Level One Bodywork · Houston, TX<br>
              brockjohn.com · 346-219-1603<br>
              This check-in is a wellness tool, not medical advice.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`.trim();

  // ── Plain text fallback ───────────────────────────────
  const text = [
    `BROCK CHECK-IN · LEVEL ONE BODYWORK`,
    name ? `From: ${name}` : '',
    `Date: ${date || new Date().toLocaleString()}`,
    ``,
    `SCORE: ${avg.toFixed(1)}/10 — ${state}`,
    ``,
    `Activation : ${scores.activation}/10`,
    `Fatigue    : ${scores.fatigue}/10`,
    `Tension    : ${scores.tension}/10`,
    `Breath     : ${scores.breath}/10`,
    `Support    : ${scores.support}/10`,
    ``,
    body,
    ``,
    `PRACTICE FOR RIGHT NOW`,
    practice,
    notes ? `\nMEMBER NOTES\n"${notes}"` : '',
    ``,
    `---`,
    `Brock John · Level One Bodywork · brockjohn.com`
  ].filter(l => l !== null).join('\n');

  // ── Send via Resend ───────────────────────────────────
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Check-In App <checkin@brockjohn.com>',
        to:      ['bhhm2020@gmail.com'],
        reply_to: 'bhhm2020@gmail.com',
        subject: `${name ? name + ' · ' : ''}Check-In · ${state} · ${avg.toFixed(1)}/10`,
        html,
        text,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend error:', result);
      return res.status(502).json({ error: 'Email delivery failed', detail: result });
    }

    return res.status(200).json({ ok: true, id: result.id });

  } catch (err) {
    console.error('Fetch to Resend failed:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
