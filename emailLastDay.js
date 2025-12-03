/**
 * Finds the correct Month folder, then the most recent day-folder, 
 * and emails a list of its files to two different recipients.
 */
function emailLastDayFiles() {
  // 1. UPDATED: Point to the ROOT Year Folder (not the specific month folder)
  const rootFolderId = "1Y_49h1ZxbTMuxW0UOQHIwUbO8zc-orA3";

  const emailAddress1 = "dwaynekutz@gmail.com"; // Email that GETS the folder link & file list
  const emailAddress2 = "dwayne.kutz@reedenergy.ca";  // Email that GETS PDF attachments (with custom subject/body)

  const timeZone = Session.getScriptTimeZone();

  try {
    const rootFolder = DriveApp.getFolderById(rootFolderId);

    // 2. FIND THE CORRECT MONTH FOLDER
    // We generate the folder name for the CURRENT month (e.g., "12 December")
    const currentMonthName = Utilities.formatDate(new Date(), timeZone, "MM MMMM");

    // Check if the current month folder exists
    const monthFolders = rootFolder.getFoldersByName(currentMonthName);
    let mainFolder = null;

    if (monthFolders.hasNext()) {
      mainFolder = monthFolders.next();
      Logger.log(`Found month folder: ${mainFolder.getName()}`);
    } else {
      // If today is the 1st, we might need to look for the previous month here.
      Logger.log(`Could not find a folder named '${currentMonthName}' in the root.`);
      return;
    }

    // 3. FIND THE LAST DAY FOLDER
    const subfolders = mainFolder.getFolders();
    let lastDayFolder = null;
    let lastDayNumber = -1;

    while (subfolders.hasNext()) {
      const folder = subfolders.next();
      const folderName = folder.getName();
      const dayNumber = parseInt(folderName, 10);

      if (!isNaN(dayNumber) && dayNumber > lastDayNumber) {
        lastDayNumber = dayNumber;
        lastDayFolder = folder;
      }
    }

    // 4. VALIDATION
    if (!lastDayFolder) {
      Logger.log("No valid 'day' subfolders found in " + mainFolder.getName());
      const errorBody = `Hi Dwayne,\n\nI looked in '${mainFolder.getName()}' but couldn't find any numeric day subfolders.`;
      MailApp.sendEmail(emailAddress1, "Daily File Report: Error", errorBody);
      MailApp.sendEmail(emailAddress2, "Daily File Report: Error", errorBody);
      return;
    }

    const folderName = lastDayFolder.getName();
    const folderUrl = lastDayFolder.getUrl();
    Logger.log(`Found last day folder: ${folderName}`);

    // --- DETERMINE REPORT DATE STRING ---
    const now = new Date();
    // Create a date object for the report day, assuming the same month and year
    const reportDate = new Date(now.getFullYear(), now.getMonth(), lastDayNumber);
    const reportDateString = Utilities.formatDate(reportDate, timeZone, "MM/dd/yyyy");

    // 5. GET FILES & PDF CONVERSION
    const files = lastDayFolder.getFiles();
    let fileListHtml = "";
    let pdfAttachments = [];
    let fileCount = 0;

    while (files.hasNext()) {
      const file = files.next();
      fileListHtml += `<li><a href="${file.getUrl()}">${file.getName()}</a></li>`;
      fileCount++;

      try {
        if (file.getMimeType() === MimeType.GOOGLE_DOCS) {
          const pdfBlob = file.getAs(MimeType.PDF);
          pdfBlob.setName(file.getName() + ".pdf");
          pdfAttachments.push(pdfBlob);
        }
      } catch (e) {
        Logger.log(`Could not convert ${file.getName()} to PDF. Skipping. Error: ${e}`);
      }
    }

    // 6. BUILD EMAIL BODIES

    // Subject and Body for Email 1 (with link, full file list)
    const subject1 = `Daily File Report for Day ${folderName} (${fileCount} files)`;
    let htmlBody1 = "";

    if (fileCount === 0) {
      htmlBody1 = `
        <p>Hi Dwayne,</p>
        <p>No files were found in the folder for day ${folderName}.</p>
        <p>Folder link: <a href="${folderUrl}">${folderName}</a></p>
      `;
    } else {
      htmlBody1 = `
        <p>Hi Dwayne,</p>
        <p>Here are the ${fileCount} files created for day ${folderName}:</p>
        <ul>${fileListHtml}</ul>
        <p>Folder link: <a href="${folderUrl}">${folderName}</a></p>
      `;
    }

    // Subject and Body for Email 2 (custom request)
    const subject2 = `Time for ${reportDateString}`;
    const htmlBody2 = `<p>See attached for my time for ${reportDateString}</p>`;


    // 7. SEND EMAILS

    // Send Email 1 (Original recipient with folder link)
    MailApp.sendEmail({
      to: emailAddress1,
      subject: subject1,
      htmlBody: htmlBody1
    });
    Logger.log(`Email 1 sent to ${emailAddress1}.`);

    // Send Email 2 (Custom recipient with PDF attachments and custom subject/body)
    MailApp.sendEmail({
      to: emailAddress2,
      subject: subject2,
      htmlBody: htmlBody2,
      attachments: pdfAttachments
    });
    Logger.log(`Email 2 sent to ${emailAddress2}.`);

  } catch (e) {
    Logger.log(`Error in emailLastDayFiles: ${e}`);
    const errorBody = `The script failed with this error: ${e.message}`;
    MailApp.sendEmail(emailAddress1, "Daily File Report: SCRIPT FAILED", errorBody);
    MailApp.sendEmail(emailAddress2, "Daily File Report: SCRIPT FAILED", errorBody);
  }
}