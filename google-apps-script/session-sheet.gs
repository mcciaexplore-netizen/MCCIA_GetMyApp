/**
 * GetMyApp master session/progress Google Sheet sync + booking confirmation email.
 *
 * This is a STANDALONE Apps Script project, separate from any other MCCIA Apps Script project
 * (e.g. SyncUp's). It is the server-side counterpart of two GetMyApp server/worker.js helpers:
 *  - `upsertSheetRow()`: creates/updates one row per booking in a master Google Sheet, which acts
 *    as the authoritative store for session/progress data (attendance, hours, stage, percent,
 *    remarks). GetMyApp's own Supabase `session_progress` table is kept as a fast-read mirror,
 *    updated only after a call here succeeds.
 *  - `sendBookingEmail()`: sends a booking confirmation email to the VISITOR only, right after a
 *    booking is created. Best-effort -- a failure here is logged server-side and never blocks or
 *    fails the booking itself.
 *
 * SETUP:
 * 1. Create a new Google Sheet (this will be the master sheet).
 * 2. In the Sheet: Extensions -> Apps Script. Paste this file's contents into the editor.
 * 3. Project Settings -> Script Properties -> add a property named GETMYAPP_WEBHOOK_SECRET with
 *    a random value (>=32 chars) -- this must match the GOOGLE_SHEETS_WEBHOOK_SECRET Vercel env
 *    var exactly. Never commit this value anywhere.
 * 4. Deploy -> New deployment -> Web app. Execute as: Me. Who has access: Anyone.
 * 5. Copy the deployed Web App URL into the GOOGLE_SHEETS_WEBHOOK_URL Vercel env var.
 *
 * The sheet/tab is created automatically (named by SHEET_NAME below) with a header row on first
 * use -- nothing needs to be pre-created inside the spreadsheet itself.
 */

const SHEET_NAME = 'Sessions';
const HEADERS = [
  'Booking ID', 'Date', 'Time', 'Application', 'Participant', 'Company', 'Member ID',
  'Attendance', 'Hours Completed', 'Progress Stage', 'Progress %', 'Remarks',
  'Created At', 'Updated At'
];
const BOOKING_ID_COL = 1; // column A, 1-based

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('doPost was invoked without a POST body.');
    }
    const data = JSON.parse(e.postData.contents);

    const expectedSecret = PropertiesService.getScriptProperties().getProperty('GETMYAPP_WEBHOOK_SECRET');
    if (!expectedSecret || data.secret !== expectedSecret) {
      return jsonResponse({ success: false, error: 'INVALID_SECRET' });
    }

    if (data.action === 'SEND_BOOKING_EMAIL') {
      return sendBookingEmail(data);
    }

    if (data.action === 'DELETE_SESSION') {
      if (!data.bookingId) {
        return jsonResponse({ success: false, error: 'MISSING_BOOKING_ID' });
      }
      deleteSessionRow(data.bookingId);
      return jsonResponse({ success: true });
    }

    if (data.action !== 'UPSERT_SESSION') {
      return jsonResponse({ success: false, error: 'UNKNOWN_ACTION' });
    }

    const s = data.session || {};
    if (!s.bookingId) {
      return jsonResponse({ success: false, error: 'MISSING_BOOKING_ID' });
    }

    upsertSessionRow(s);
    return jsonResponse({ success: true });
  } catch (err) {
    console.error('[session-sheet] doPost failed: ' + err);
    return jsonResponse({ success: false, error: String(err && err.message || err) });
  }
}

/**
 * Sends whatever email GetMyApp's server already built (subject/text/html) -- this script no
 * longer does any of its own email templating. GetMyApp's server (server/worker.js) builds the
 * full HTML "session card" (with the QR code, date/time, and links back to the site) plus a
 * plain-text fallback, and this function just relays it via MailApp. Best-effort from GetMyApp's
 * side: a failure here is logged by the caller and never blocks or fails the booking/reschedule
 * itself. Sent from whichever Google account this Apps Script project is deployed under
 * ("Execute as: Me" in the deployment settings).
 */
function sendBookingEmail(data) {
  try {
    if (!data.to) return jsonResponse({ success: false, error: 'MISSING_RECIPIENT' });
    const options = { to: data.to, subject: data.subject || '', body: data.text || '' };
    if (data.html) options.htmlBody = data.html;
    MailApp.sendEmail(options);
    return jsonResponse({ success: true });
  } catch (err) {
    console.error('[session-sheet] sendBookingEmail failed: ' + err);
    return jsonResponse({ success: false, error: String(err && err.message || err) });
  }
}

/**
 * Finds the row for this booking ID (if any) and overwrites it, or appends a new row.
 * Locked so two near-simultaneous saves for different bookings can't corrupt the row search.
 */
function upsertSessionRow(s) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getOrCreateSheet();
    const row = [
      s.bookingId,
      s.date || '',
      s.slot || '',
      s.appName || '',
      s.name || '',
      s.company || '',
      s.memberId || '',
      s.attendance || 'Not Marked',
      (s.hoursCompleted !== undefined && s.hoursCompleted !== null) ? s.hoursCompleted : 0,
      s.progressStage || 'Not Started',
      (s.progressPercent !== undefined && s.progressPercent !== null) ? s.progressPercent : 0,
      s.remarks || '',
      s.createdAt || '',
      s.updatedAt || ''
    ];

    const targetRow = findRowByBookingId(sheet, s.bookingId);
    if (targetRow === -1) {
      sheet.appendRow(row);
    } else {
      sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
    }
  } finally {
    lock.releaseLock();
  }
}

/**
 * Removes a booking's row from the sheet entirely (called when an admin deletes the booking from
 * GetMyApp). Locked for the same reason as upsertSessionRow. A no-op if the row is already gone.
 */
function deleteSessionRow(bookingId) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getOrCreateSheet();
    const targetRow = findRowByBookingId(sheet, bookingId);
    if (targetRow !== -1) {
      sheet.deleteRow(targetRow);
    }
  } finally {
    lock.releaseLock();
  }
}

function findRowByBookingId(sheet, bookingId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  const ids = sheet.getRange(2, BOOKING_ID_COL, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(bookingId).trim()) {
      return i + 2; // +2: 1-based, plus header row
    }
  }
  return -1;
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * TEST HARNESS -- run this from the Apps Script editor to verify the sheet write works, without
 * needing GetMyApp's server. Check the execution log and the Sheet itself afterward.
 */
function testUpsertSession() {
  const props = PropertiesService.getScriptProperties();
  const secret = props.getProperty('GETMYAPP_WEBHOOK_SECRET');
  if (!secret) {
    console.log('Set the GETMYAPP_WEBHOOK_SECRET script property before running this test.');
    return;
  }
  const payload = {
    secret: secret,
    action: 'UPSERT_SESSION',
    session: {
      bookingId: 'test-' + Date.now(),
      date: '2026-10-01',
      slot: '14:30',
      appName: 'Stocklist',
      name: 'Test Participant',
      company: 'Test Co',
      memberId: 'MCCIA-TEST-001',
      attendance: 'Present',
      hoursCompleted: 0.75,
      progressStage: 'In Development',
      progressPercent: 50,
      remarks: 'Test run from testUpsertSession()',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  const fakeEvent = { postData: { contents: JSON.stringify(payload) } };
  const response = doPost(fakeEvent);
  console.log('testUpsertSession response: ' + response.getContent());
}

/**
 * TEST HARNESS -- run this from the Apps Script editor to verify email sending actually works
 * (e.g. after fixing the MailApp authorization issue). Edit the `to` address below to your own
 * inbox before running. Check the execution log and your inbox afterward -- this should arrive as
 * an HTML email with a purple button, matching what a real booking confirmation looks like
 * (GetMyApp's server builds the real content; this is just a representative stand-in for testing
 * MailApp itself).
 */
function testSendBookingEmail() {
  const props = PropertiesService.getScriptProperties();
  const secret = props.getProperty('GETMYAPP_WEBHOOK_SECRET');
  if (!secret) {
    console.log('Set the GETMYAPP_WEBHOOK_SECRET script property before running this test.');
    return;
  }
  const payload = {
    secret: secret,
    action: 'SEND_BOOKING_EMAIL',
    to: 'CHANGE_ME@example.com',
    subject: 'Test email from GetMyApp (session-sheet.gs)',
    text: 'This is a plain-text fallback. If you can read this instead of a styled card, your email client is not rendering HTML.',
    html: '<div style="font-family:Arial,sans-serif;max-width:420px;margin:0 auto;padding:20px;background:#171b31;color:#fff;border-radius:12px;text-align:center"><h2 style="margin:0 0 8px">MailApp test succeeded</h2><p style="color:#c6b8ff;margin:0">If you can see this styled card, HTML email sending is working correctly.</p></div>'
  };
  const fakeEvent = { postData: { contents: JSON.stringify(payload) } };
  const response = doPost(fakeEvent);
  console.log('testSendBookingEmail response: ' + response.getContent());
}
