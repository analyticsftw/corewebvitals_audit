/** Support functions for the gutentag project repository
 *
*/

// for when you have to reference imported function *within* the import
var internal = module.exports = {
  addQuotes,
  logHit,
  hit2csv
};

/* FUNCTION DEFINITION */


/** Add quotes to string, esp. for CSVs/text lines
 * @param  {} string : the string being passed
 * @param  {} quote : quote delimiter character, defaults to double quote '"'
 */
 function addQuotes(string, quote='"'){
  var msg = quote + string + quote;
  return msg;
}


/**
 * cookie2csv: function to write message to file
 * @param {*} cookie
 * @param {*} filename
 * @param {*} phase
 */
   function cookie2csv  (cookie,filename,phase="phase_undefined") {
    const { Parser } = require('json2csv');
    const fields = [
      'date',
      'siteURL',
      'phase',
      'sameSite',
      'name',
      'value',
      'domain',
      'path',
      'expires',
      'httpOnly',
      'secure',
    ];
    const opts = { fields };

    // Inject cookie timestamp
    // callTime = Date.now();
    const now = new Date();
    const callTime = now.toISOString();

    var cl = 0; cl = cookie.length;
    for (i = 0; i < cl; i++) {
      cookie[i].date=callTime;
      cookie[i].phase=phase;
    }
    try {
      const parser = new Parser(opts);
      const csv = parser.parse(cookies)
      // remove headers, remove one line, starting at the first position, then join the array back into a single string
      var lines = csv.split('\n');
      lines.splice(0,1);
      var output = lines.join('\n');
      // Write to file
      internal.logHit(filename,output)
    } catch (err) {
      console.error(err);
    }
  }


/** function to log each server call routed from playwright to CSV, assuming it matches the list of predefined tags
 * @param  {} hit : the server call payload
 * @param  {} filename : the output file
 * @param  {} site : the URL being analyzed
 */
 function hit2csv(hit,filename,site){
  addquotes = internal.addQuotes();
  // Create timestamp for each call
  callTime = Date.now();
  // Sanitize inputs
  message = [addQuotes(callTime),addQuotes(site),addQuotes(hit)];
  line = message.join(";");
  // Log each call to CSV
  try {
    internal.logHit(filename,line);
  } catch (err) {
    console.error(err);
  }
}


/** function to log each server call routed from playwright to CSV, assuming it matches the list of predefined tags
 * @param  {} hit : the server call payload
 * @param  {} filename : the output file
 * @param  {} site : the URL being analyzed
 */
function error2csv(filename,url, errorMessage){
  const now = new Date();
  const callTime = now.toISOString();
  try {
    //removes commas and quotes from error message
    cleanError = errorMessage.replace(/,|"/g, '');
    // console.log('cleanError: ' + cleanError)
    //splits up error into lines
    const errorLines = cleanError.split('\n');
    //selects most useful lines and removes any quotes and commas
    const errorLineOne = errorLines[0];
    //error line two is not always available
    const errorLineTwo = errorLines[2] ? errorLines[2] : '';
    // Add quotes to strings
    const errorData = [callTime, addQuotes(url), addQuotes(errorLineOne), addQuotes(errorLineTwo)];
    const errorLine = errorData.join(',') + '\n';
    fs.appendFile(filename, errorLine, (err) => {
      if(err) throw err;
      console.log('Line appended to ' + filename);
    });
 } catch (err) {
   console.error(err);
 }
}

function source2csv(filename, sources){
  const { Parser } = require('json2csv');
  const newLine = '\r\n';
  const fields = ['site_scanned', 'cookie_siteURL', 'cookie_name', 'cookie_sources'];

  // Add the additional parameter to each source object
  // const updatedSources = sources.map(source => ({
  //   ...source,
  //   cookie_siteURL: siteURL
  // }));

  const json2csvParser = new Parser({ fields, header: false });
  const csv = json2csvParser.parse(sources) + newLine;

  try {
    fs.appendFileSync(filename, csv);
    console.log('Data was appended to file!');
  } catch (error) {
    console.error('Error appending data to file:', error);
  }
}


/**
 * logHit: function to write message to file
 * @param {*} file
 * @param {*} message
 */
function logHit (file, message) {
  const fs = require('fs');
  fs.appendFile(file, message+"\n", function (err) {
  // fs.appendFile(file, message, function (err) {
    if (err) {throw err; console.log(err);};
  });
}

/** Export functions
  * Make sure to reference in other scripts as:
  * `const sf = require('./support_functions.js');`

  * Then change references to functions as (for instance):
  `sf.cookie2csv($args)`
*/
module.exports = {
  addQuotes,
  cookie2csv,
  hit2csv,
  logHit,
  error2csv,
  source2csv,
}

