# 2025 Vessel Tracker

**Owner:** Dwayne Kutz  
**Context:** Smoky Energy Solutions Inc. - Vessel Production Tracking

This repository contains the backend Google Apps Script code for the 2025 Vessel Tracker Google Sheet.

## 🚀 Workflow

**Deployment:**
This project is configured with GitHub Actions.
* **Push to GitHub:** Any commit to the `main` branch is automatically pushed to the live Google Script.
* **Manual Option:** Can also use `clasp push` from the local terminal if strictly necessary.

## 📂 File Directory

* **`Code.js`**: Core logic, menu creation (`onOpen`), and global triggers.
* **`emailLastDay.js`**: Automation for sending end-of-day status reports and notifications.
* **`getOrCreateFolder.js`**: Utility script to manage Google Drive folder hierarchy for vessel documentation.
* **`getSheetDataValues.js`**: Helper function to retrieve and sanitize data ranges from the Sheet.

## ⚙️ Setup Notes

* **Linked Script ID:** Defined in `.clasp.json`.
* **Dependencies:** None (Standard Google Apps Script services: `SpreadsheetApp`, `DriveApp`, `MailApp`).
