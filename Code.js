function docMaker1() {
  // --- FOLDER CONFIGURATION ---
  
  // 1. The existing folder for 2025 data (Legacy)
  // This ensures your current November/December files go where they always have.
  const folderId_2025 = `1Y_49h1ZxbTMuxW0UOQHIwUbO8zc-orA3`; 
  
  // 2. The NEW Master folder for 2026 and onwards
  // On Jan 1, 2026, the script will look here, create a "2026" folder, and start saving.
  const folderId_Master = `1ib-2RNDoIENXy3TUglRN5fEJmSCBTP1s`;
  
  const sheetId = `1kQp4o7d2TATDJR5CLDMvN_iZy3EjGliVob2AYWjuiBA`;
  const templateId = `1LQkjttnyE9bQfeMrLi4JX53QxTHEPVILFWHaBB9oFwU`;
  
  const ss = SpreadsheetApp.openById(sheetId);
  const timeZone = ss.getSpreadsheetTimeZone();

  // --- GET SETTINGS ---
  const summarySheet = ss.getSheetByName("2025 Summary");
  const firstName = summarySheet.getRange("B2").getValue();
  const lastName = summarySheet.getRange("C2").getValue();
  const position = summarySheet.getRange("D2").getValue();
  
  const ppControlRange = summarySheet.getRange("H1"); 
  const currentPPName = ppControlRange.getValue(); 
  
  Logger.log(`Processing Sheet: ${currentPPName}`);
  
  const sheet = ss.getSheetByName(currentPPName);
  if (!sheet) {
    Logger.log(`Error: Could not find sheet named ${currentPPName}`);
    return;
  }

  const tempDoc = DriveApp.getFileById(templateId);
  
  // Pre-load the main folder objects to save time
  const folder2025Object = DriveApp.getFolderById(folderId_2025);
  const folderMasterObject = DriveApp.getFolderById(folderId_Master);

  // --- GET DATA ---
  const startRow = 5; 
  const startCol = 4; 
  const numRows = sheet.getLastRow() - startRow + 1;
  const numCols = sheet.getLastColumn() - startCol + 1;
  
  const data = sheet.getRange(startRow, startCol, numRows, numCols).getValues();

  // --- MAIN LOOP ---
  for (const row of data) {
    let dateObject = row[0];
    
    // 1. DATE VALIDATION
    if (!dateObject || !(dateObject instanceof Date)) {
       const testDate = new Date(dateObject);
       if (!isNaN(testDate.getTime()) && row[0] !== "") {
         dateObject = testDate;
       } else {
         continue; // Skip invalid dates
       }
    }

    // 2. CHECK DATA VALIDITY (Skip "Off" or empty rows)
    const colE = row[1] ? row[1].toString().toLowerCase().trim() : "";
    const isOff = (colE === 'off');
    const isData = (colE && colE !== 'off');

    if (isData && !isOff) {
      
      // --- DYNAMIC FOLDER LOGIC ---

      // A. Determine the Year and the Correct Root Folder
      const year = dateObject.getFullYear();
      let targetYearFolder;

      if (year === 2025) {
        // CASE 1: 2025 Data -> Goes to the existing 2025 folder
        targetYearFolder = folder2025Object;
      } else {
        // CASE 2: 2026+ Data -> Goes to Master Folder -> "2026" Subfolder
        // This line checks if "2026" exists in the master folder; if not, it creates it.
        targetYearFolder = getOrCreateFolder(folderMasterObject, year.toString());
      }
      
      // B. Generate Month Name (e.g., "12 December", "01 January")
      const monthFolderName = Utilities.formatDate(dateObject, timeZone, "MM MMMM");
      
      // C. Generate Day Name (e.g., "1", "29")
      const dayFolderName = dateObject.getDate().toString();
      
      // D. Get or Create the Folder Structure
      // Step 1: Find/Create Month folder inside the correct Year folder
      const monthFolder = getOrCreateFolder(targetYearFolder, monthFolderName);
      
      // Step 2: Find/Create Day folder inside Month
      const targetFolder = getOrCreateFolder(monthFolder, dayFolderName);

      // --- FILE CREATION ---
      
      const formattedDate = Utilities.formatDate(dateObject, timeZone, "MMM d, yyyy");
      const docName = `${row[1]} - ${row[3]} - ${formattedDate}`; 

      // E. Duplicate Check
      // We check the specific day folder for the file
      const existingFiles = targetFolder.getFilesByName(docName);
      if (existingFiles.hasNext()) {
         Logger.log(`Skipping ${docName}: File already exists in ${targetYearFolder.getName()}/${monthFolderName}/${dayFolderName}`);
         continue; 
      }
      
      Logger.log(`Creating: ${docName} in ${targetYearFolder.getName()}/${monthFolderName}/${dayFolderName}`);
      
      const newDocFile = tempDoc.makeCopy(docName.toString());
      newDocFile.moveTo(targetFolder); 
      
      const newDoc = DocumentApp.openById(newDocFile.getId());
      const body = newDoc.getBody();
      
      body.replaceText("{first}", firstName);
      body.replaceText("{last}", lastName);
      body.replaceText("{position}", position);
      
      body.replaceText("{date}", formattedDate);
      body.replaceText("{hours}", row[4]);
      body.replaceText("{client}", row[1]);
      body.replaceText("{id}", row[3]);
      body.replaceText("{description}", row[2]);
      
      newDoc.saveAndClose();

    }
  }
  
  Logger.log("Processing complete.");
}

/**
 * Standard Helper: Finds a folder or creates it if missing.
 */
function getOrCreateFolder(parentFolder, childFolderName) {
  const folders = parentFolder.getFoldersByName(childFolderName);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    // Logger.log(`Creating new folder: ${childFolderName}`);
    return parentFolder.createFolder(childFolderName);
  }
}