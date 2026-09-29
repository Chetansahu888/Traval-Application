/**
 * GOOGLE APPS SCRIPT CODE - FMS SYSTEM V5
 * Mapping: 54 Columns (A to BB), data starts at row 7 of the "FMS" sheet.
 *
 * SETUP
 * 1. Script ko spreadsheet ke andar se kholo: Extensions -> Apps Script.
 *    (Agar script alag project hai, to SPREADSHEET_ID me sheet ki ID daalo.)
 * 2. Deploy -> Manage deployments -> Edit -> Version: New version -> Deploy
 *    Execute as: Me, Who has access: Anyone
 * 3. Editor me testSetup() ek baar Run karo - Logs me dikhega sab sahi hai ya nahi.
 */

// Blank rakho agar script spreadsheet se bound hai. Warna sheet URL ke /d/ aur /edit ke beech wali ID daalo.
const SPREADSHEET_ID = "";
const UPLOAD_FOLDER_ID = "1vdYg11CiW6mmsJs3-I0pmVwAOgWKLz3_";

const LOGIN_SHEET = "Login Page";
const FMS_SHEET = "FMS";
const HEADER_ROWS = 6;          // data row 7 se shuru
const FIRST_DATA_ROW = HEADER_ROWS + 1;
const TOTAL_COLS = 54;
const BOOKING_NO_COL = 2;       // Column B

// Stage -> "Actual" timestamp column
const ACTUAL_COLS = { 1: 16, 2: 28, 3: 35, 4: 46, 5: 51 };
// Stage -> file URL column (Stage 1: Photo ClearTrip, Stage 3: Copy of Bill)
const FILE_COLS = { 1: 26, 3: 43 };

/* ---------------------------------- ROUTING ---------------------------------- */

function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : null;
    if (!action) return jsonOut({ success: true, message: "FMS API ACTIVE" });
    if (action === "getUsers") return jsonOut(getUsers());
    if (action === "getData") return jsonOut(getData());
    return jsonOut({ success: false, error: "Invalid action: " + action });
  } catch (err) {
    return jsonOut({ success: false, error: err.message || String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // ek saath do booking aaye to rows overwrite na hon
    const data = JSON.parse(e.postData.contents);
    if (data.action === "createBooking") return jsonOut(createBooking(data));
    if (data.action === "updateActual") return jsonOut(updateStep(data));
    if (data.action === "uploadFile") return jsonOut(uploadFile(data));
    return jsonOut({ success: false, error: "Unknown action: " + data.action });
  } catch (err) {
    return jsonOut({ success: false, error: err.message || String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ---------------------------------- HANDLERS --------------------------------- */

function getUsers() {
  const values = getSheet(LOGIN_SHEET).getDataRange().getValues();
  return values.slice(1)
    .filter(row => String(row[0]).trim() !== "")
    .map(row => ({
      // Password jaan-boojh kar nahi bheja jaata (browser me sabko dikh jaata)
      username: String(row[0]).trim(),
      role: String(row[2]).trim(),
      firmName: String(row[3]).trim(),
      permissions: {
        bookingDetails: isYes(row[4]),
        indentForm: isYes(row[5]),
        bookingOfTicket: isYes(row[6]),
        travelCancelled: isYes(row[7]),
        getPayment: isYes(row[8]),
        tallyEntry: isYes(row[9])
      }
    }));
}

function getData() {
  const sheet = getSheet(FMS_SHEET);
  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) return [];
  // getValues: dates ISO string ban kar jaati hain, FmsTable unhe khud format karta hai
  return sheet.getRange(FIRST_DATA_ROW, 1, lastRow - HEADER_ROWS, TOTAL_COLS)
    .getValues()
    .filter(row => String(row[BOOKING_NO_COL - 1]).trim() !== "");
}

function createBooking(p) {
  const sheet = getSheet(FMS_SHEET);
  const row = new Array(TOTAL_COLS).fill("");
  row[0] = new Date();              // A: Timestamp
  row[1] = p.bookingNo || "";       // B: Booking No
  row[2] = p.firmName || "";        // C
  row[3] = p.headTraveler || "";    // D
  row[4] = p.otherTravelers || "";  // E
  row[5] = p.flightDate || "";      // F
  row[6] = p.flightTime || "";      // G
  row[7] = p.noOfTickets || "";     // H
  row[8] = p.typeOfBooking || "";   // I
  row[9] = p.bookedBy || "";        // J
  row[10] = p.agentName || "";      // K
  row[11] = p.agentRate || "";      // L
  row[12] = p.selfName || "";       // M
  row[13] = p.selfRate || "";       // N

  // Sirf A-N likhte hain taaki Planned/Delay columns ke formulas na mitein
  const target = getNextEmptyRow(sheet);
  sheet.getRange(target, 1, 1, 14).setValues([row.slice(0, 14)]);
  return { success: true, row: target };
}

function updateStep(p) {
  const sheet = getSheet(FMS_SHEET);
  const rowIndex = findRowByBookingNo(sheet, p.bookingNo);
  if (rowIndex === -1) return { success: false, error: "Record not found: " + p.bookingNo };

  const stage = Number(p.stage);
  if (!ACTUAL_COLS[stage]) return { success: false, error: "Invalid stage: " + p.stage };

  sheet.getRange(rowIndex, ACTUAL_COLS[stage]).setValue(new Date());

  if (stage === 1) {
    // R-Y (18-25): TRP, Person, Count, From, To, Type, Departure Date, Reason
    sheet.getRange(rowIndex, 18, 1, 8).setValues([[
      val(p.trpNo), val(p.personName), val(p.noOfPersons), val(p.from), val(p.to),
      val(p.typeOfTravel), val(p.departureDate), val(p.reason)
    ]]);
  } else if (stage === 2) {
    // AD-AG (30-33): Travels, Per Ticket, Total, Status1
    sheet.getRange(rowIndex, 30, 1, 4).setValues([[
      val(p.travelsName1), val(p.perTicketAmount1), val(p.totalAmount1), val(p.status1)
    ]]);
  } else if (stage === 3) {
    // AK-AO (37-42): Status, Travels, Per Ticket, Total, Bill No, Bill Type
    sheet.getRange(rowIndex, 37, 1, 6).setValues([[
      val(p.statusOfTravel), val(p.travelsName2), val(p.perTicketAmount2),
      val(p.totalAmount2), val(p.billNumber), val(p.typeOfBill)
    ]]);
    // AQ (44): Charges. AP (43) = Copy of Bill, uploadFile se aata hai - usko overwrite nahi karte
    sheet.getRange(rowIndex, 44).setValue(val(p.charges));
  } else if (stage === 4) {
    // AV-AW (48-49): Status2, Amount Paid
    sheet.getRange(rowIndex, 48, 1, 2).setValues([[val(p.status2), val(p.amountPaid)]]);
  } else if (stage === 5) {
    // BA-BB (53-54): Status3, Remark
    sheet.getRange(rowIndex, 53, 1, 2).setValues([[val(p.status3), val(p.remark)]]);
  }
  return { success: true };
}

function uploadFile(p) {
  if (!p.base64) return { success: false, error: "No file data" };
  const folder = DriveApp.getFolderById(UPLOAD_FOLDER_ID);
  const blob = Utilities.newBlob(
    Utilities.base64Decode(p.base64),
    p.mimeType || "application/octet-stream",
    (p.bookingNo ? p.bookingNo + "_" : "") + (p.fileName || "upload")
  );
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const url = file.getUrl();

  const col = FILE_COLS[Number(p.stage)];
  if (col) {
    const sheet = getSheet(FMS_SHEET);
    const rowIndex = findRowByBookingNo(sheet, p.bookingNo);
    if (rowIndex !== -1) sheet.getRange(rowIndex, col).setValue(url);
  }
  return { success: true, url: url };
}

/* ---------------------------------- HELPERS ---------------------------------- */

function getSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("Spreadsheet nahi mili. SPREADSHEET_ID set karo ya script ko sheet ke Extensions > Apps Script se kholo.");
  return ss;
}

// Sheet naam exact match na ho (extra space / capital letters) tab bhi mil jaaye
function getSheet(name) {
  const ss = getSpreadsheet();
  const exact = ss.getSheetByName(name);
  if (exact) return exact;
  const wanted = name.trim().toLowerCase();
  const match = ss.getSheets().find(s => s.getName().trim().toLowerCase() === wanted);
  if (match) return match;
  const available = ss.getSheets().map(s => '"' + s.getName() + '"').join(", ");
  throw new Error('Sheet "' + name + '" nahi mili. Available sheets: ' + available);
}

function findRowByBookingNo(sheet, bookingNo) {
  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW || bookingNo === undefined || bookingNo === null) return -1;
  const target = String(bookingNo).trim();
  const values = sheet.getRange(FIRST_DATA_ROW, BOOKING_NO_COL, lastRow - HEADER_ROWS, 1).getDisplayValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === target) return i + FIRST_DATA_ROW;
  }
  return -1;
}

// Column B ki pehli khaali row (formulas wale columns ki wajah se getLastRow galat ho sakta hai)
function getNextEmptyRow(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < FIRST_DATA_ROW) return FIRST_DATA_ROW;
  const values = sheet.getRange(FIRST_DATA_ROW, BOOKING_NO_COL, lastRow - HEADER_ROWS, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]).trim() !== "") return i + FIRST_DATA_ROW + 1;
  }
  return FIRST_DATA_ROW;
}

function isYes(v) {
  return String(v).trim().toLowerCase() === "yes";
}

function val(v) {
  return v === undefined || v === null ? "" : v;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------- TEST (editor) ------------------------------- */

// Apps Script editor me ise select karke Run dabao, phir View > Logs dekho.
function testSetup() {
  const ss = getSpreadsheet();
  Logger.log("Spreadsheet: " + ss.getName());
  Logger.log("Sheets: " + ss.getSheets().map(s => '"' + s.getName() + '"').join(", "));
  Logger.log("Users: " + JSON.stringify(getUsers()));
  Logger.log("FMS rows: " + getData().length);
  Logger.log("Upload folder: " + DriveApp.getFolderById(UPLOAD_FOLDER_ID).getName());
}
