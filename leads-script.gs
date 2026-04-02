// ── Liberty Fencing — Google Apps Script Backend ──
// Handles: lead intake, leads listing, products CRUD
// Deploy: Deploy > New deployment > Web app > Anyone > Deploy
// After ANY edit: Deploy > Manage deployments > Edit (pencil) > New version > Deploy

// ── CONFIG ──
var LEADS_SHEET = "Leads";
var PRODUCTS_SHEET = "Products";

// ── ROUTING ──
function doPost(e) {
  var params = e.parameter || {};
  var action = params.action || "lead";
  var data = JSON.parse(e.postData.contents);

  if (action === "lead") return handleNewLead(data);
  if (action === "saveProduct") return handleSaveProduct(data);
  if (action === "deleteProduct") return handleDeleteProduct(data);

  return jsonOut({ error: "Unknown action: " + action });
}

function doGet(e) {
  var params = e.parameter || {};
  var action = params.action || "status";

  if (action === "leads") return handleGetLeads();
  if (action === "products") return handleGetProducts();

  return jsonOut({ status: "ok" });
}

// ── LEADS ──
function handleNewLead(data) {
  var sheet = getOrCreateSheet(LEADS_SHEET, ["Date", "Name", "Phone", "Email", "Service", "Description", "Estimated Value", "Design URL", "Status"]);

  sheet.appendRow([
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }),
    data.name || "",
    data.phone || "",
    data.email || "",
    data.service_requested || "",
    data.description || "",
    data.estimated_value || "",
    data.design && data.design.shareUrl ? data.design.shareUrl : "",
    "New"
  ]);

  MailApp.sendEmail({
    to: "ryan@liberty-fencing.com, esti@liberty-fencing.com",
    subject: "New Fence Lead: " + (data.name || "Unknown"),
    body: "Name: " + (data.name || "") + "\n" +
          "Phone: " + (data.phone || "") + "\n" +
          "Email: " + (data.email || "") + "\n" +
          "Service: " + (data.service_requested || "") + "\n" +
          "Estimated Value: $" + (data.estimated_value || 0) + "\n" +
          "Description: " + (data.description || "") + "\n" +
          "Design: " + (data.design && data.design.shareUrl ? data.design.shareUrl : "No design") + "\n"
  });

  return jsonOut({ success: true });
}

function handleGetLeads() {
  var sheet = getOrCreateSheet(LEADS_SHEET, ["Date", "Name", "Phone", "Email", "Service", "Description", "Estimated Value", "Design URL", "Status"]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonOut({ leads: [] });

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
  return jsonOut({ leads: leads });
}

// ── PRODUCTS ──
function handleGetProducts() {
  var sheet = getOrCreateSheet(PRODUCTS_SHEET, ["ID", "Type", "Label", "Price Per Ft", "Color", "Category"]);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonOut({ products: [] });

  var headers = data[0];
  var products = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    products.push(row);
  }
  return jsonOut({ products: products });
}

function handleSaveProduct(data) {
  var sheet = getOrCreateSheet(PRODUCTS_SHEET, ["ID", "Type", "Label", "Price Per Ft", "Color", "Category"]);
  var all = sheet.getDataRange().getValues();

  if (data.id) {
    // Update existing
    for (var i = 1; i < all.length; i++) {
      if (all[i][0] === data.id) {
        sheet.getRange(i + 1, 1, 1, 6).setValues([[data.id, data.type, data.label, data.pricePerFt, data.color, data.category]]);
        return jsonOut({ success: true, updated: data.id });
      }
    }
  }

  // New product
  var id = data.id || Utilities.getUuid().substring(0, 8);
  sheet.appendRow([id, data.type || "", data.label || "", data.pricePerFt || 0, data.color || "#333333", data.category || "fence"]);
  return jsonOut({ success: true, created: id });
}

function handleDeleteProduct(data) {
  var sheet = getOrCreateSheet(PRODUCTS_SHEET, ["ID", "Type", "Label", "Price Per Ft", "Color", "Category"]);
  var all = sheet.getDataRange().getValues();

  for (var i = 1; i < all.length; i++) {
    if (all[i][0] === data.id) {
      sheet.deleteRow(i + 1);
      return jsonOut({ success: true, deleted: data.id });
    }
  }
  return jsonOut({ error: "Product not found" });
}

// ── SETUP (run once) ──
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Leads sheet
  var leads = getOrCreateSheet(LEADS_SHEET, ["Date", "Name", "Phone", "Email", "Service", "Description", "Estimated Value", "Design URL", "Status"]);
  leads.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#1a1a1a").setFontColor("#f4a818");
  leads.setFrozenRows(1);
  leads.setColumnWidths(1, 1, 160);
  leads.setColumnWidths(2, 1, 150);
  leads.setColumnWidths(3, 1, 130);
  leads.setColumnWidths(4, 1, 200);
  leads.setColumnWidths(5, 1, 180);
  leads.setColumnWidths(6, 1, 350);
  leads.setColumnWidths(7, 1, 120);
  leads.setColumnWidths(8, 1, 300);
  leads.setColumnWidths(9, 1, 100);

  // Products sheet with default products
  var products = getOrCreateSheet(PRODUCTS_SHEET, ["ID", "Type", "Label", "Price Per Ft", "Color", "Category"]);
  products.getRange(1, 1, 1, 6).setFontWeight("bold").setBackground("#1a1a1a").setFontColor("#f4a818");
  products.setFrozenRows(1);
  products.setColumnWidths(1, 1, 100);
  products.setColumnWidths(2, 1, 150);
  products.setColumnWidths(3, 1, 200);
  products.setColumnWidths(4, 1, 120);
  products.setColumnWidths(5, 1, 100);
  products.setColumnWidths(6, 1, 100);

  // Seed default products if empty
  if (products.getLastRow() <= 1) {
    products.appendRow(["wp001", "wood_pine", "Wood (Treated Pine)", 35, "#e67e22", "fence"]);
    products.appendRow(["wc002", "wood_cedar", "Wood (Cedar)", 42, "#c0392b", "fence"]);
    products.appendRow(["vn003", "vinyl", "Vinyl Privacy", 67, "#27ae60", "fence"]);
    products.appendRow(["cl004", "chain_link", "Chain Link", 20, "#95a5a6", "fence"]);
    products.appendRow(["al005", "aluminum", "Aluminum Ornamental", 46, "#2980b9", "fence"]);
    products.appendRow(["gs006", "single_gate", "Single Gate", 700, "#f39c12", "gate"]);
    products.appendRow(["gd007", "double_gate", "Double/Drive Gate", 1400, "#e74c3c", "gate"]);
  }
}

// ── HELPERS ──
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
