# Google Form - JIRA Ticket Creation
Google Script written to collect Bug Report / Feature Request from Google Form responses and create bug report / feature request tickets in JIRA.

Attachments also work, woohoo!


# Setup

Firstly, we must declare some important global constants. These include
```
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
```

## JIRA Platform Constants

### User and API Key

   Once logged into JIRA, go to your personal account settings.
   
   ![image](https://github.com/pvico12/google-form-to-jira/assets/73671546/5718ad87-3b36-4717-ac4e-762be7c5bff8)

   Go to Security Tab, and click on "Create and manage API tokens".
   
   ![image](https://github.com/pvico12/google-form-to-jira/assets/73671546/28b6995e-0773-42d4-a5f3-e417b183f344)

   Create an API Token.
   
   ![image](https://github.com/pvico12/google-form-to-jira/assets/73671546/a9b72b4b-af59-4875-8d58-c09bfa510131)

   Note down the token, and add it to the JIRA constants as shown in example below:
   ```
   // Example
   const JIRA_API_USER = "jira-user-email@domain.org";
   const JIRA_API_KEY = "abcdefghijklmnopqrstuvwxyz";
   ```

### Issue and Browsing URL

   Replace ```<YOUR-ORG>``` with your own organization name that you see in the URL when your JIRA platform is opened
   ```
   // Example
   const JIRA_API_ISSUE_URL = "https://uber.atlassian.net/rest/api/latest/issue";
   const JIRA_BROWSING_URL = "https://uber.atlassian.net/browse/";
   ```

## JIRA Project Constants

### Ticket Keys

Go to your projects board/timeline and note down the keys of the 3 different Epic types
![image](https://github.com/pvico12/google-form-to-jira/assets/73671546/ae64b3a0-4b15-4b4c-8387-b6da0e38bc57)

```
// Example
const JIRA_TICKET_VISUAL_BUG_KEY = "DEV-56";
const JIRA_TICKET_FUNCTIONAL_BUG_KEY = "DEV-57";
const JIRA_TICKET_FEATURE_REQUEST_KEY = "DEV-58";
```

### Project and Task Issue Type IDs

Send a cURL GET request to ```https://<ORG-NAME>.atlassian.net/rest/api/latest/issuetype``` with Basic Authentication ```<JIRA_API_USER>:<JIRA_API_KEY>```.

Example:
![image](https://github.com/pvico12/google-form-to-jira/assets/73671546/c875fcfd-2d49-453d-97f9-6eae971ac2bc)

In this case we see that the JIRA_PROJECT_ID is "10000" and the JIRA_TASK_ISSUE_TYPE is "10001".

```
// Example
const JIRA_TICKET_ID_JIRA_PROJECT_ID = "10000";
const JIRA_TASK_ISSUE_TYPE = "10001"";
```


## Google Script Constants

You can create an array of recipient emails that will be notified every time someone submits a response to your form.
You must also note down the FORM_ID. **Note** Refer to the next section on form creation to retrieve the form ID.
```
// Example
const RECIPIENT_EMAILS = [<EMAIL-1>, <EMAIL-2>];
const FORM_ID = "<FORM-ID>";
```

## Create Form
Checkout this form template: ...

### Form ID Constant


# Deploy

## Setup Trigger




