// Netlify Function: Empfängt Formular-Daten, erstellt Brevo-Kontakt + sendet Benachrichtigung
// Env-Variablen (in Netlify Dashboard eintragen):
//   BREVO_API_KEY    → dein Brevo API-Key (Einstellungen → API-Key)
//   BREVO_LIST_ID    → ID der Kontaktliste in Brevo (Standard: 2)
//   BREVO_SENDER_MAIL → verifizierte Absender-E-Mail in Brevo (z.B. paul.web@outlook.de)

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try { data = JSON.parse(event.body); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('BREVO_API_KEY fehlt – Daten:', data);
    return { statusCode: 200, body: JSON.stringify({ success: true, dev: true }) };
  }

  const listId = parseInt(process.env.BREVO_LIST_ID || '2', 10);
  const senderMail = process.env.BREVO_SENDER_MAIL || 'paul.web@outlook.de';
  const { name, email, telefon, betrieb, ziel, anfragen, budget, zeitpunkt, nachricht } = data;

  const nameParts = (name || '').trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Kontakt in Brevo anlegen / updaten
  // Hinweis: Custom-Attribute (BETRIEB, ZIEL usw.) müssen einmalig in Brevo erstellt werden.
  // → Brevo Dashboard: Kontakte → Kontakt-Attribute → Attribut hinzufügen (Text)
  try {
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: telefon,
          BETRIEB: betrieb || '',
          ZIEL: ziel || '',
          ANFRAGEN_MONAT: anfragen || '',
          BUDGET_MONAT: budget || '',
          ZEITPUNKT_START: zeitpunkt || '',
          QUELLE: 'fastraone.de/kontakt',
        },
        listIds: [listId],
        updateEnabled: true,
      }),
    });
  } catch (err) {
    console.error('Brevo contact error:', err);
  }

  // Benachrichtigungs-Mail an Paul
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Fastra One Website', email: senderMail },
        to: [{ email: 'paul.web@outlook.de', name: 'Paul Fasterding' }],
        subject: `🌱 Neue Anfrage: ${name} – ${ziel || 'Kontaktformular'}`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:600px;padding:24px">
            <h2 style="color:#0e8f57;margin:0 0 20px">Neue Anfrage über fastraone.de</h2>
            <table style="border-collapse:collapse;width:100%">
              <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:40%">Name</td><td style="padding:8px 12px">${name}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:600">Betrieb</td><td style="padding:8px 12px">${betrieb || '–'}</td></tr>
              <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">E-Mail</td><td style="padding:8px 12px"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px 12px;font-weight:600">Telefon</td><td style="padding:8px 12px"><a href="tel:${telefon}">${telefon}</a></td></tr>
              <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Was sucht er?</td><td style="padding:8px 12px">${ziel || '–'}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:600">Anfragen/Monat</td><td style="padding:8px 12px">${anfragen || '–'}</td></tr>
              <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Budget/Monat</td><td style="padding:8px 12px">${budget || '–'}</td></tr>
              <tr><td style="padding:8px 12px;font-weight:600">Zeitpunkt</td><td style="padding:8px 12px">${zeitpunkt || '–'}</td></tr>
              ${nachricht ? `<tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Nachricht</td><td style="padding:8px 12px">${nachricht}</td></tr>` : ''}
            </table>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error('Brevo email error:', err);
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
