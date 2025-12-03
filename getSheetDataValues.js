function getSheetDataValues() {
  const id = `1YVpHg9lpsR5rURk6CHmkQ2G5eIvO4KfMUYMF0znDXJ4`;
  const ss = SpreadsheetApp.openById(id); // Gets the spreadsheet
  const sheet = ss.getSheetByName(`data`); // Gets the sheet named "data"
  // This log will show up in your "Executions" log
  Logger.log(sheet.getName()); 

  // This part requires the script to be BOUND to a spreadsheet
  var ui = SpreadsheetApp.getUi(); 
  ui.alert("Hello World!");
}