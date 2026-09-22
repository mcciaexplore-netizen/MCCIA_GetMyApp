/**
 * GetMyApp master session/progress Google Sheet sync.
 *
 * This is a STANDALONE Apps Script project, separate from any other MCCIA Apps Script project
 * (e.g. SyncUp's). It is the server-side counterpart of GetMyApp's `upsertSheetRow()` helper in
 * server/worker.js: GetMyApp's Vercel server calls this Web App to create/update one row per
 * booking in a master Google Sheet, which acts as the authoritative store for session/progress
 * data (attendance, hours, stage, percent, remarks). GetMyApp's own Supabase `session_progress`
 * table is kept as a fast-read mirror, updated only after a call here succeeds.
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
  'Booking ID', 'Date', 'Time', 'Application', 'Participant', 'Company',
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
      attendance: 'Present',
      hoursCompleted: 0.75,
      progressStage: 'In Progress',
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
