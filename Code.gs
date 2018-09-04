//
// Finding subfolders and files v1.0  -- (C) 2018 Stefan van Aalst
//
// This script is designed to find all subfolders and files in a Google Drive
// of a particular folder. It will show:
// - name of the folder/file in an indented structure
// - type (folder or file)
// - the Id
// - the Url
// - the Owner
// - all the Editors
// - all the Viewers
// - the Sharing Access setting
// - the Sharing Permission setting
//
// Some subfolder structures can be large enough to cause a time out.
// A time-out occurs when the script is running for more than 5-6 minutes
// The script is designed to capture what it has before the time out occurs.
//
// Unfortunately this means that not all subfolders will be listed.
//
// Use:
// - copy/paste the script in a google drive spreadsheet
// - fill in the folder Id (copy the part after /FOLDERS/:
//      example: https://drive.google.com/drive/u/0/folders/<THIS YOU NEED TO COPY>
// - paste the Id below between quotes: e.g.  "0Badsfasdfasdfasdf"
var parentFolder = "<your ID>"


// put the number of indent space
var numberOfSpaces = 4

// change here the time-out in milli seconds
var timeOut = 200000


// this contains all the global variables used 
var thisSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
var targetSheet = thisSpreadsheet.getActiveSheet()
var i = 0
var j = 0
var ident
var numberOfSpaces = 4
var spaces=''
var fId
var fIdent
var fName
var fType
var fUrl
var fOwner
var fEditors
var fViewers
var sharingAccess
var sharingPermission
var fileSize
var fFolders = []
var output =[]
var start


// this function is checking if a time-out is near
function isTimeUp_(start) {
  var now = new Date();
  return now.getTime() - start.getTime() > timeOut;
}

// the function that starts everything
function run() {
  start = new Date()
  init_()
  var temp = DriveApp.getFolderById(parentFolder)
  fName = temp.getName()
  fType = "Folder"
  fId = temp.getId()
  fUrl = temp.getUrl()
  fSize = temp.getSize()
  fOwner = temp.getOwner().getEmail()
  fEditors = getPeople_(fId, 'Editors')
  fViewers = getPeople_(fId, 'Viewers')
  sharingAccess = temp.getSharingAccess()
  sharingPermission = temp.getSharingPermission()
  fIdent = ''
  addResults_()
  listFolders_(parentFolder)
  stopScript_()
}

// when the script is finished, or a time-out is near, the output will be written in the spreadsheet
function stopScript_() {
  targetSheet.getRange(1, 1,output.length,output[0].length).setValues(output);
}

// this function sets the number of ident spaces and creates the header
function init_() {
  for(var t=0; t<numberOfSpaces;t++) {spaces = spaces + ' '}
  changeIdent_(0)
  output[i] = []
  output[i][0] = "Name"
  output[i][1] = "Type"
  output[i][2] = "Size"
  output[i][3] = "Id"
  output[i][4] = "Url"
  output[i][5] = "Owner"
  output[i][6] = "Editors"
  output[i][7] = "Viewers"
  output[i][8] = "Sharing Access"
  output[i][9] = "Sharing Permission"
  i++
}

// this function adds the properties of a folder/file to the output
function addResults_() {
  output[i] = []
  output[i][0] = fIdent+fName
  output[i][1] = fType
  output[i][2] = fSize
  output[i][3] = fId
  output[i][4] = fUrl
  output[i][5] = fOwner
  output[i][6] = fEditors
  output[i][7] = fViewers
  output[i][8] = sharingAccess
  output[i][9] = sharingPermission
}

// This function ensures the indentation
function changeIdent_(x) {
  ident = ''
  j=j+x
  for(var t=0; t<j;t++) {
    ident=ident+ spaces
  }
}

// this function triggers the listing of subfolders if they exist
function listFolders_(id) {
  if (isTimeUp_(start)) {stopScript_()}
  var parent = DriveApp.getFolderById(id)
  listFiles_(id)
  if(parent.getFolders().hasNext()) {
    changeIdent_(1)
    fFolders = parent.getFolders()
    listSubFolders_(fFolders)
  }
}

// this function gets the Editors or Viewers
function getPeople_(id, type) {
  var target = DriveApp.getFileById(id)
  var emails = ""
  if(type == 'Editors') {
    people = target.getEditors()
  } else {
    people = target.getViewers()
  }
  for (var k=0; k< people.length;k++) {
    if (emails.length != "") {emails=emails+','} 
    emails = emails + people[k].getEmail()
  }
  return emails
}
  
// this function finds all the files in a folder and gets the properties
function listFiles_(id) {
  if (isTimeUp_(start)) {stopScript_()}
  var files = DriveApp.getFolderById(id).getFiles()
  while(files.hasNext()) {
    i=i+1
    var f = files.next()
    fName = f.getName()
    fSize = f.getSize()
    fType = 'File'
    fId = f.getId()
    fUrl= f.getUrl()
    fOwner = f.getOwner().getEmail()
    fEditors = getPeople_(fId, 'Editors')
    fViewers = getPeople_(fId, 'Viewers')
    sharingAccess = f.getSharingAccess()
    sharingPermission = f.getSharingPermission()
    fIdent = ident+spaces
    addResults_()
  }
}

// this fuction finds all the subfolder, gets the properties, and triggers a deeper search
function listSubFolders_(folders) {
  if (isTimeUp_(start)) {stopScript_()}
  while(folders.hasNext()) {
    i=i+1
    var f = folders.next()
    fName = f.getName()
    fType = 'Folder'
    fId = f.getId()
    fUrl= f.getUrl()
    fSize = f.getSize()
    fOwner = f.getOwner().getEmail()
    fEditors = getPeople_(fId, 'Editors')
    fViewers = getPeople_(fId, 'Viewers')
    sharingAccess = f.getSharingAccess()
    sharingPermission = f.getSharingPermission()
    fIdent = ident
    addResults_()
    listFolders_(fId)
  }
  changeIdent_(-1)
}  
