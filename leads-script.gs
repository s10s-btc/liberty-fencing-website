// ── Liberty Fencing — Google Apps Script Backend ──
// Handles: lead intake, leads listing, products CRUD
// MODIFIED 2026-09-11: Bridge estimator leads → main CRM + JSONP support
// Deploy: Deploy > New deployment > Web app > Anyone > Deploy
// After ANY edit: Deploy > Manage deployments > Edit (pencil) > New version > Deploy

// ── CONFIG ──
var LEADS_SHEET = "Leads";
var PRODUCTS_SHEET = "Products";

// Main CRM (Liberty Fencing CRM — Master)
var MAIN_CRM_ID = "1k9CmGvdgkVrFWC5itgKoeHJY47ww7eeSMzC1sjOyc0U";
var MAIN_CRM_LEADS_TAB = "Leads";
var MAIN_CRM_CONTACTS_TAB = "Contacts";
var ESTIMATOR_SHEET_ID = "1QwOoy3iYSjmaX3tSrq18S4lupuRiMB_nQOnN98LsLVg";

// ── ROUTING ──
function doPost(e) {
  var params = e.parameter || {};
  var action = params.action || "lead";
  var callback = params.callback || "";
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = {};
  }

  var result;
  if (action === "lead") result = handleNewLead(data);
  else if (action === "saveProduct") result = handleSaveProduct(data);
  else if (action === "deleteProduct") result = handleDeleteProduct(data);
  else result = { error: "Unknown action: " + action };

  // Support JSONP for cross-origin client error reporting
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + JSON.stringify(result) + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // Return plain text JSON so client can read it (even with no-cors mode)
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.TEXT);
}

function doGet(e) {
  var params = e.parameter || {};
  var action = params.action || "status";
  var callback = params.callback || "";

  var result;
  if (action === "leads") result = getLeadsData();
  else if (action === "products") result = getProductsData();
  else if (action === "syncTest") result = syncToMainCRM_test();
  else if (action === "ping") result = { status: "ok", timestamp: new Date().toISOString() };
  else if (action === "leadJsonp") {
    // JSONP-style lead intake — for cross-origin error detection
    var leadData = {};
    try {
      leadData = JSON.parse(params.payload || "{}");
    } catch (e) {}
    result = handleNewLead(leadData);
  }
  else result = { status: "ok" };

  // JSONP support — wrap in callback for cross-origin script tags
  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + JSON.stringify(result) + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOut(result);
}

// ── LEADS ──
function handleNewLead(data) {
  var sheet = getOrCreateSheet(LEADS_SHEET, ["Date", "Name", "Phone", "Email", "Service", "Description", "Estimated Value", "Design URL", "Status", "Source"]);

  sheet.appendRow([
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }),
    data.name || "",
    data.phone || "",
    data.email || "",
    data.service_requested || "",
    data.description || "",
    data.estimated_value || "",
    data.design && data.design.shareUrl ? data.design.shareUrl : "",
    "New",
    data.source || "fence_designer"
  ]);

  // Send email notification
  try {
    MailApp.sendEmail({
      to: "ryan120v@gmail.com",
      subject: "New Fence Lead: " + (data.name || "Unknown"),
      body: "Name: " + (data.name || "") + "\n" +
            "Phone: " + (data.phone || "") + "\n" +
            "Email: " + (data.email || "") + "\n" +
            "Source: " + (data.source || "fence_designer") + "\n" +
            "Service: " + (data.service_requested || "") + "\n" +
            "Estimated Value: $" + (data.estimated_value || 0) + "\n" +
            "Description: " + (data.description || "") + "\n" +
            "Design: " + (data.design && data.design.shareUrl ? data.design.shareUrl : "No design") + "\n"
    });
  } catch (emailErr) {
    console.error('Email send failed:', emailErr);
  }

  // BRIDGE: Sync to main CRM
  var syncResult = null;
  try {
    syncResult = syncToMainCRM(data);
  } catch (e) {
    syncResult = { error: e.toString() };
  }

  return { success: true, sync: syncResult };
}

function getLeadsData() {
  var sheet = getOrCreateSheet(LEADS_SHEET, ["Date", "Name", "Phone", "Email", "Service", "Description", "Estimated Value", "Design URL", "Status", "Source"]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { leads: [] };

  var headers = data[0];
  var leads = [];
  for (var i = data.length - 1; i >= 1; i--) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    row._row = i + 1;
    leads.push(row);
  }
  return { leads: leads };
}

function handleGetLeads() { return jsonOut(getLeadsData()); }

// ── BRIDGE: Sync to Main CRM ──
function syncToMainCRM(data) {
  var mainSpreadsheet = SpreadsheetApp.openById(MAIN_CRM_ID);
  var leadsSheet = mainSpreadsheet.getSheetByName(MAIN_CRM_LEADS_TAB);
  var contactsSheet = mainSpreadsheet.getSheetByName(MAIN_CRM_CONTACTS_TAB);

  if (!leadsSheet || !contactsSheet) {
    return { error: "Main CRM tabs not found" };
  }

  // Get next available LF-ID by scanning column A
  var lastRow = leadsSheet.getLastRow();
  var maxLF = 200;
  if (lastRow > 1) {
    var colA = leadsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < colA.length; i++) {
      var id = colA[i][0].toString();
      if (id.indexOf("LF-") === 0) {
        var n = parseInt(id.substring(3), 10);
        if (!isNaN(n) && n > maxLF) maxLF = n;
      }
    }
  }
  var newLFId = "LF-" + String(maxLF + 1).padStart(3, "0");

  // Get next available Contact ID
  var lastContactRow = contactsSheet.getLastRow();
  var maxCT = 700;
  if (lastContactRow > 1) {
    var colA = contactsSheet.getRange(2, 1, lastContactRow - 1, 1).getValues();
    for (var i = 0; i < colA.length; i++) {
      var id = colA[i][0].toString();
      if (id.indexOf("CT-") === 0) {
        var n = parseInt(id.substring(3), 10);
        if (!isNaN(n) && n > maxCT) maxCT = n;
      }
    }
  }
  var newCTId = "CT-" + String(maxCT + 1).padStart(3, "0");

  // Add Contact row
  var nameParts = (data.name || "").split(" ");
  var firstName = nameParts[0] || "";
  var lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  contactsSheet.appendRow([
    newCTId,
    "Lead",
    firstName,
    lastName,
    ""
  ]);

  // Parse linear feet from description
  var lf = "";
  var description = data.description || "";
  var lfMatch = description.match(/(\d+)\s*ft/);
  if (lfMatch) lf = lfMatch[1];

  var now = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });
  var note = "Source: " + (data.source || "fence_designer") +
             ". Service: " + (data.service_requested || "") +
             ". Description: " + description.substring(0, 200) +
             ". Design URL: " + (data.design && data.design.shareUrl ? data.design.shareUrl : "") +
             ". Auto-synced 2026-09-11.";

  var leadRow = [
    newLFId, newCTId, "Warm", "New",
    data.name || "", data.phone || "",
    data.service_requested || "", lf, "", "",
    "", data.estimated_value || "", now,
    "Website", "Estimator tool design URL: " + (data.design && data.design.shareUrl ? data.design.shareUrl : ""),
    "", now, "0", "", note, now, now
  ];

  leadsSheet.appendRow(leadRow);

  return { success: true, leadId: newLFId, contactId: newCTId };
}

function syncToMainCRM_test() {
  var testData = {
    name: "BRIDGE TEST Mater Audit",
    phone: "555-555-5555",
    email: "mater-bridge-test@liberty-fencing.com",
    service_requested: "Bridge Test Service",
    description: "Test lead for bridge verification",
    estimated_value: "0",
    design: { shareUrl: "https://liberty-fencing.com/fence-design#BRIDGE-TEST" }
  };

  var result = syncToMainCRM(testData);

  if (result.success) {
    var mainSpreadsheet = SpreadsheetApp.openById(MAIN_CRM_ID);
    var leadsSheet = mainSpreadsheet.getSheetByName(MAIN_CRM_LEADS_TAB);
    var contactsSheet = mainSpreadsheet.getSheetByName(MAIN_CRM_CONTACTS_TAB);

    var lastRow = leadsSheet.getLastRow();
    var colA = leadsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = colA.length - 1; i >= 0; i--) {
      if (colA[i][0] === result.leadId) {
        leadsSheet.deleteRow(i + 2);
        break;
      }
    }

    lastRow = contactsSheet.getLastRow();
    colA = contactsSheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = colA.length - 1; i >= 0; i--) {
      if (colA[i][0] === result.contactId) {
        contactsSheet.deleteRow(i + 2);
        break;
      }
    }

    return { success: true, cleaned: true, leadId: result.leadId };
  }

  return result;
}

// ── PRODUCTS ──
function getProductsData() {
  var sheet = getOrCreateSheet(PRODUCTS_SHEET, ["ID", "Type", "Label", "Price Per Ft", "Color", "Category", "FenceType"]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { products: [] };

  var headers = data[0];
  var products = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    products.push(row);
  }

  return { products: products };
}

function handleSaveProduct(data) {
  var sheet = getOrCreateSheet(PRODUCTS_SHEET, ["ID", "Type", "Label", "Price Per Ft", "Color", "Category", "FenceType"]);
  sheet.appendRow([
    data.ID || Utilities.getUuid().substring(0, 8),
    data.Type || "",
    data.Label || "",
    data["Price Per Ft"] || 0,
    data.Color || "#333",
    data.Category || "fence",
    data.FenceType || ""
  ]);
  return { success: true };
}

function handleDeleteProduct(data) {
  var sheet = getOrCreateSheet(PRODUCTS_SHEET, ["ID", "Type", "Label", "Price Per Ft", "Color", "Category", "FenceType"]);
  var lastRow = sheet.getLastRow();
  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (ids[i][0] === data.ID) {
      sheet.deleteRow(i + 2);
      return { success: true };
    }
  }
  return { success: false, error: "ID not found" };
}

// ── UTILITIES ──
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
