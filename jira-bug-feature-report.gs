// JIRA Platform Global Constants
const JIRA_API_USER = "<JIRA-USER-EMAIL>";
const JIRA_API_KEY = "<JIRA-API-KEY>";
const JIRA_API_ISSUE_URL = "https://<YOUR-ORG>.atlassian.net/rest/api/latest/issue";
const JIRA_BROWSING_URL = "https://<YOUR-ORG>.atlassian.net/browse/";

// JIRA Project Global Constants
const JIRA_TICKET_VISUAL_BUG_KEY = "<JIRA-VISUAL-BUG-EPIC-KEY>"; // e.g. "DEV-2"
const JIRA_TICKET_FUNCTIONAL_BUG_KEY = "<JIRA-FUNCTIONAL-BUG-EPIC-KEY>"; // e.g. "DEV-3"
const JIRA_TICKET_FEATURE_REQUEST_KEY = "<JIRA-FEATURE-REQUEST-EPIC-KEY>"; // e.g. "DEV-4"
const JIRA_TICKET_ID_JIRA_PROJECT_ID = "<JIRA-PROJECT-ID>"; // e.g. "10000"
const JIRA_TASK_ISSUE_TYPE = "<JIRA-TASK-TYPE-ID>"; // e.g. "10002"


// Other Global Constants
const RECIPIENT_EMAILS = [<EMAIL-1>, <EMAIL-2>];
const FORM_ID = "<FORM-ID>";


function setUpTrigger() {
  ScriptApp.newTrigger('handleForm')
  .forForm(FORM_ID)
  .onFormSubmit()
  .create();
}

// send emails to app recipients in RECIPENT_EMAILS with optional attachment blobs
function sendEmails(subject, body, attachments=[]) {
  for (i in RECIPIENT_EMAILS) {
    if (attachments.length) {
      GmailApp.sendEmail(
      RECIPIENT_EMAILS[i],
      subject,
      body,
      {
        attachments: attachments
      }
      );
    } else {
      GmailApp.sendEmail(RECIPIENT_EMAILS[i], subject, body);
    }
  }
}


// create autenticated header for JIRA tickets
function createAuthenticatedHeader() {
  const encodedAuthInformation =
  Utilities.base64Encode(JIRA_API_USER + ":" + JIRA_API_KEY);
  const headers = {"Authorization" : "Basic " + encodedAuthInformation};
  return headers;
}


// create a JIRA ticket for bug reports or feature requests
function createJiraTicket(shortDescription, detailedDescription, parentTicketKey) {

  var ticketLabel;

  if (parentTicketKey == JIRA_TICKET_FEATURE_REQUEST_KEY) {
    ticketLabel = "feature-request"
  } else if (parentTicketKey == JIRA_TICKET_VISUAL_BUG_KEY) {
    ticketLabel = "visual-bug"
  } else if (parentTicketKey == JIRA_TICKET_FUNCTIONAL_BUG_KEY) {
    ticketLabel = "functional-bug"
  }

  var payloadData = {
    "fields": {
      "project": {
        "id": JIRA_TICKET_ID_JIRA_PROJECT_ID
      },
      "issuetype": {
        "id": JIRA_TASK_ISSUE_TYPE
      },
      "summary": shortDescription,
      "description": detailedDescription,
      "parent": {
        "key": parentTicketKey
      },
      "labels": [
        ticketLabel
      ]
    }
  };

  // get authenticated header
  const headers = createAuthenticatedHeader();

  var options = {
    "method" : "post",
    "headers": headers,
    "contentType": "application/json",
    "payload" : JSON.stringify(payloadData),
    "muteHttpExceptions": true
  };

  // get ticket creation payload
  var ticketCreationPayload = UrlFetchApp.getRequest(JIRA_API_ISSUE_URL, options);
  console.info("Ticket Creation Payload: \n" + ticketCreationPayload.payload);

  // get ticket creation response
  var ticketCreationResponse = UrlFetchApp.fetch(JIRA_API_ISSUE_URL, options);
  console.info("Ticket Creation Response: \n" + ticketCreationResponse.getContentText());

  return JSON.parse(ticketCreationResponse.getContentText())["key"];
}


// add attachments to jira ticket by attachmentId list
function addAttachmentsToJiraTicket(ticketKey, attachmentIds) {

  // get authenticated header
  var headers = createAuthenticatedHeader();
  // add necessary header field for file upload to JIRA Atlassian
  headers["X-Atlassian-Token"] = "nocheck";

  var attachmentBlobs = [];

  // upload each attachment to payload one-by-one
  for (i in attachmentIds) {

    var payloadData = {
      file: DriveApp.getFileById(attachmentIds[i]).getBlob()
    };

    var options = {
      "method" : "post",
      "headers": headers,
      "payload" : payloadData,
      "muteHttpExceptions": true
    };

    const attachmentUploadUrl = JIRA_API_ISSUE_URL + "/" + ticketKey + "/attachments";

    console.log("Attachment is being uploaded to JIRA ticket: " + ticketKey);

    // get ticket attachment upload response
    var ticketAttachmentUploadResponse = UrlFetchApp.fetch(attachmentUploadUrl, options);
    console.info("Ticket Attachment Upload Response: \n" + ticketAttachmentUploadResponse.getContentText());

    attachmentBlobs.push(DriveApp.getFileById(attachmentIds[i]).getBlob());
  }

  return attachmentBlobs;
}


// handle the form response
function handleForm(e) {
  const responseItems = e.response.getItemResponses();

  // email variables
  var emailBody = "";
  var emailSubject = "";

  // bug report variables
  var isBugReport = false;
  var bugType = "";
  var bugSeverity = "";
  var attachmentIds = [];

  // feature request variables
  var isFeatureRequest = false;

  // common variables
  var shortDescription = "";
  var detailedDescription = "";
  var jiraParentTicketKey = "";


  // handle form response
  for (i in responseItems){
    const questionVal = responseItems[i].getItem().getTitle()
    const responseVal = responseItems[i].getResponse();

    console.log(questionVal + "\n" + responseVal);

    if (isBugReport || isFeatureRequest) {

      if (isBugReport) {
        
        // get bug type, severity, and attachments
        if (questionVal == "Type") {
          bugType = responseVal;
        } else if (questionVal == "Severity") {
          bugSeverity = responseVal;
        } else if (questionVal == "Upload any attachments you think can help us diagnose this issue") {
          attachmentIds = responseVal;
        }

      }

      // get descriptions
      if (questionVal == "Short Description") {
        shortDescription = responseVal;
      } else if (questionVal == "Detailed Description") {
        detailedDescription = responseVal;
      }
      
      // ignore attachments response in email body
      if (questionVal != "Upload any attachments you think can help us diagnose this issue") {
        emailBody += questionVal + ": \n" + responseVal + "\n \n";
      }

    } else {

        if (responseVal == "Bug Report") {
          isBugReport = true;
          emailSubject = "SerbLink Development: Incoming Bug Report";
          emailBody += "Details of the bug report: \n \n";
        } else {
          isFeatureRequest = true;
          emailSubject = "SerbLink Development: Incoming Feature Request";
          emailBody += "Details of the feature request: \n \n";
        }

    }
  }

  if (isBugReport) {

    // create jira bug description format
    const jiraBugDescription = "Severity: " + bugSeverity + "\n \n" + detailedDescription

    // update detailedDescription
    detailedDescription = jiraBugDescription;

    // assign parent ticket id
    if (bugType == "Visual Bug") {
      jiraParentTicketKey = JIRA_TICKET_VISUAL_BUG_KEY;
    } else {
      jiraParentTicketKey = JIRA_TICKET_FUNCTIONAL_BUG_KEY;
    }
  
  } else {

    jiraParentTicketKey = JIRA_TICKET_FEATURE_REQUEST_KEY;

  }

  // create the ticket
  const jiraTicketKey = createJiraTicket(shortDescription, detailedDescription, jiraParentTicketKey);
  console.log("A JIRA Ticket has been created with key: " + jiraTicketKey);

  // add attachments if they were added to bug report
  var attachmentBlobs = [];
  if (isBugReport) {
    attachmentBlobs = addAttachmentsToJiraTicket(jiraTicketKey, attachmentIds);
  }
  
  // send emails to all recipients of form responses
  emailBody += "\n Note. A ticket has been opening in JIRA and can be found at: \n" + JIRA_BROWSING_URL + jiraTicketKey
  sendEmails(emailSubject, emailBody, attachmentBlobs);
  
}

