/**
 * Frankly Speaking — Form Alerts
 * Emails the team whenever someone submits "Become a Partner" or "Be On The Show"
 * on franklyspeakingshow.com. Standalone Apps Script owned by mergedmediateam@gmail.com,
 * with one installable "on form submit" trigger per responses spreadsheet.
 *
 * To (re)install triggers: run setup() once from the editor (needs authorization).
 */

var NOTIFY_EMAILS = [
  'lorilee@touchheaven.com',
  'frank@tcpropertysolutions.net',
  'mergedmediateam@gmail.com',
];

var SHEETS = {
  '16XrDmRJ8e6Lwc8Sj8gWkgMrC6-b6uVevqntq_OPm3dI': 'Become a Partner',
  '1NKrmQcPCr8K49kPbRfo8cRPmSeFpi_RMAtkjYoulr-w': 'Be On The Show',
};

function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    ScriptApp.deleteTrigger(t);
  });
  Object.keys(SHEETS).forEach(function (id) {
    ScriptApp.newTrigger('onFormSubmit').forSpreadsheet(id).onFormSubmit().create();
  });
}

function onFormSubmit(e) {
  var ssId = e.source.getId();
  var formName = SHEETS[ssId] || 'Frankly Speaking form';
  var values = e.namedValues || {};
  var name = (values['Name'] || [''])[0];

  var lines = Object.keys(values)
    .filter(function (k) { return (values[k] || []).join('').trim() !== ''; })
    .map(function (k) { return k + ': ' + values[k].join(', '); });

  MailApp.sendEmail({
    to: NOTIFY_EMAILS.join(','),
    subject: '[Frankly Speaking] New "' + formName + '" submission' + (name ? ' — ' + name : ''),
    body:
      'Someone just submitted the "' + formName + '" form on franklyspeakingshow.com:\n\n' +
      lines.join('\n') +
      '\n\nAll responses: https://docs.google.com/spreadsheets/d/' + ssId + '\n',
  });
}
