function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }),
    data.name || "",
    data.phone || "",
    data.email || "",
    data.service_requested || "",
    data.description || "",
    data.estimated_value || "",
    data.design && data.design.shareUrl ? data.design.shareUrl : ""
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

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.setName("Leads");
  var headers = ["Date", "Name", "Phone", "Email", "Service", "Description", "Estimated Value", "Design URL"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1a1a1a").setFontColor("#f4a818");
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, 1, 160);
  sheet.setColumnWidths(2, 1, 150);
  sheet.setColumnWidths(3, 1, 130);
  sheet.setColumnWidths(4, 1, 200);
  sheet.setColumnWidths(5, 1, 180);
  sheet.setColumnWidths(6, 1, 350);
  sheet.setColumnWidths(7, 1, 120);
  sheet.setColumnWidths(8, 1, 300);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
