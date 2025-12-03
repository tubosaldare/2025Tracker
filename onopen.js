function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('My Custom Menu')
    .addItem('Say Hello', 'getSheetDataValues')
    .addItem('Create Timesheet Docs', 'docMaker1')
    .addItem('Email Last Day Files', 'emailLastDayFiles')
    .addToUi();
}
