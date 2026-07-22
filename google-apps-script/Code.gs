const SUBMISSIONS_SHEET = 'Submissions';
const COACH_SUMMARY_SHEET = 'Coach Summary';
const LOCATION_SUMMARY_SHEET = 'Location Summary';

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SUBMISSIONS_SHEET) || ss.insertSheet(SUBMISSIONS_SHEET);
  s.clear();
  s.getRange(1,1,1,9).setValues([['Submitted At','Submission ID','Coach Name','Email','Coaching Date','Training Location','Total Hours','Notes','Status']]);
  s.setFrozenRows(1);
  s.getRange('A1:I1').setFontWeight('bold').setBackground('#167447').setFontColor('#ffffff');
  s.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  s.getRange('E:E').setNumberFormat('yyyy-mm-dd');
  s.getRange('G:G').setNumberFormat('0.00');
  s.autoResizeColumns(1,9);
  s.getRange(1,1,s.getMaxRows(),9).createFilter();
  rebuildSummaries_();
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents || '{}');
    validate_(d);
    if (d.website) return json_({ok:true});
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SUBMISSIONS_SHEET);
    if (!s) throw new Error('Run setupSpreadsheet() first.');
    const ids = s.getLastRow()>1 ? s.getRange(2,2,s.getLastRow()-1,1).getDisplayValues().flat() : [];
    if (ids.includes(d.submissionId)) return json_({ok:true,duplicate:true});
    s.appendRow([new Date(),clean_(d.submissionId,60),clean_(d.name,80),clean_(d.email,120),new Date(d.coachingDate+'T12:00:00'),clean_(d.location,100),Number(d.hours),clean_(d.notes||'',300),'Approved']);
    rebuildSummaries_();
    return json_({ok:true});
  } catch (error) {
    console.error(error);
    return json_({ok:false,error:String(error.message||error)});
  } finally { lock.releaseLock(); }
}

function validate_(d) {
  if (!d.submissionId || !d.name || !d.location || !/^\d{4}-\d{2}-\d{2}$/.test(d.coachingDate||'')) throw new Error('Missing or invalid required fields.');
  const h = Number(d.hours);
  if (!Number.isFinite(h) || h<0.25 || h>24) throw new Error('Hours must be between 0.25 and 24.');
  const entered = new Date(d.coachingDate+'T12:00:00');
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate()+1);
  if (entered>tomorrow) throw new Error('Coaching date cannot be in the future.');
}

function clean_(value,max) {
  const text=String(value==null?'':value).trim().slice(0,max);
  return /^[=+\-@]/.test(text) ? "'"+text : text;
}

function rebuildSummaries_() {
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  buildQuerySheet_(ss,COACH_SUMMARY_SHEET,`=QUERY('${SUBMISSIONS_SHEET}'!A:I,"select C, sum(G), count(B) where C is not null and I = 'Approved' group by C order by sum(G) desc label C 'Coach Name', sum(G) 'Total Hours', count(B) 'Sessions'",1)`);
  buildQuerySheet_(ss,LOCATION_SUMMARY_SHEET,`=QUERY('${SUBMISSIONS_SHEET}'!A:I,"select F, sum(G), count(B) where F is not null and I = 'Approved' group by F order by sum(G) desc label F 'Training Location', sum(G) 'Total Hours', count(B) 'Sessions'",1)`);
}

function buildQuerySheet_(ss,name,formula) {
  let s=ss.getSheetByName(name)||ss.insertSheet(name);
  s.clear(); s.getRange('A1').setFormula(formula); SpreadsheetApp.flush();
  s.setFrozenRows(1); s.getRange('A1:C1').setFontWeight('bold').setBackground('#167447').setFontColor('#ffffff');
  s.getRange('B:B').setNumberFormat('0.00'); s.autoResizeColumns(1,3);
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
