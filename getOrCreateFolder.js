/**
 * Helper function to get a subfolder by name, or create it if it doesn't exist.
 * @param {GoogleAppsScript.Drive.Folder} parentFolder The parent folder to search within.
 * @param {string} childFolderName The name of the subfolder to find or create.
 * @return {GoogleAppsScript.Drive.Folder} The found or newly created subfolder.
 */
function getOrCreateFolder(parentFolder, childFolderName) {
  const folders = parentFolder.getFoldersByName(childFolderName);
  
  if (folders.hasNext()) {
    // Folder already exists, return it
    return folders.next();
  } else {
    // Folder doesn't exist, create it and return it
    Logger.log(`Creating new subfolder: ${childFolderName}`);
    return parentFolder.createFolder(childFolderName);
  }
}
