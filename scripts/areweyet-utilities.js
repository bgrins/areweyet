const fs = require("fs");
const fetch = require("node-fetch");

exports.downloadFile = async (url, path) => {
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(path);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", err => {
      reject(err);
    });
    fileStream.on("finish", function() {
      resolve();
    });
  });
};

// Convert "2019-10-21" to a Date object:
exports.dateFromDashedString = function(dateString) {
  let dateParts = dateString.split("-");
  return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
}

exports.dashedStringFromDate = function(dateObj) {
  return new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];
}

/*
This returns an object like:
{
  cf_last_resolved: "2019-12-12T04:27:46Z"
  summary: 'Migrate xul test files in js/ to .xhtml',
  assigned_to_detail: [Object],
  status: 'RESOLVED',
  assigned_to: 'emalysz@mozilla.com',
  id: 1589254 }
*/
exports.fetchMetaDataForBug = async function(bugID) {
  // https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status,cf_last_resolved,assigned_to&classification=Client%20Software&classification=Developer%20Infrastructure&classification=Components&classification=Server%20Software&classification=Other&f1=blocked&o1=equals&v1=1579952
  let bugzillaMetadataRequestURL = `https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status,assigned_to,cf_last_resolved&bug_id=${bugID}&bug_id_type=anyexact`;
  // let metadataRequest = await fetch(`https://bugzilla.mozilla.org/buglist.cgi?bug_id=${bugID}&bug_id_type=anyexact&classification=Client%20Software&classification=Developer%20Infrastructure&classification=Components&classification=Server%20Software&classification=Other&query_format=advanced&resolution=---&resolution=FIXED&resolution=INVALID&resolution=WONTFIX&resolution=INACTIVE&resolution=DUPLICATE&resolution=WORKSFORME&resolution=INCOMPLETE&resolution=SUPPORT&ctype=csv&human=1`);
  let metadataRequest = await fetch(bugzillaMetadataRequestURL);
  let metadata = await metadataRequest.json();

  if (!metadata || !metadata.bugs.length == 1) {
    throw new Error(`Unexpected data from ${bugzillaMetadataRequestURL}`);
  }

  return metadata.bugs[0];
}
