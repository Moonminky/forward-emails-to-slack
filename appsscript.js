// Get data that hasn't been forwarded yet from Spreadsheet
function buildEmailList() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet1 = ss.getSheetByName(""); //TODO: paste your spreadsheet's name
  var rawData = sheet1
    .getRange("F2:K1000")
    .getValues()
    .filter(x => x[5] != "x" && x[0] != "")
    .map(row => [row[0], row[4]]); //TODO: Make sure these ranges fit with your spreadsheet
  var payload = buildAlert(rawData);
  sendAlert(payload);
}

// Update data rows: mark as forwarded
function updateRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet1 = ss.getSheetByName(""); //TODO: paste your spreadsheet's name
  // get last row with content
  var lastRow = sheet1.getLastRow();
  var update_range = sheet1.getRange("K2");
  // set the first value
  update_range.setValue("x");
  // copy that value in all rows in col L until the last non empty row index
  update_range.copyValuesToRange(sheet1.getSheetId(), 11, 11, 2, lastRow);
  console.log("updated rows");
}

//Transform data into Slack format (blocks)
function buildAlert(data) {
  console.log("building payload");
  var payload = {
    blocks: []
  };
  for (var counter = 0; counter < data.length; counter = counter + 1) {
    var subject = data[counter][0];
    var message = data[counter][1];
    // each email has subject & message & a divider block between emails
    payload["blocks"].push(
      { type: "section", text: { type: "mrkdwn", text: subject } },
      { type: "section", text: { type: "mrkdwn", text: message } },
      { type: "divider" }
    );
  }
  console.log("Built the alert");
  return payload;
}

function sendAlert(payload) {
  const webhook = ""; //TODO: Paste your webhook URL here
  var options = {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: false,
    payload: JSON.stringify(payload)
  };

  try {
    console.log("Trying to send");
    UrlFetchApp.fetch(webhook, options);
    updateRows();
  } catch (e) {
    Logger.log(e);
  }
}
