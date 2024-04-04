# SpeedMeter
A fork of Consent Catcher (https://github.com/analyticsftw/consentcatcher), itself a fork Gutentag (https://github.com/analyticsftw/gutentag)

Comprises a Node.js script that uses Playwright to scan a website page for Core Web Vitals and sends the results to a Google Cloud Function and then Google BigQuery for storage and analysis.

## Scripts
* `cwv.js` : Opens a webpage and collects CWV metrics via script injection.
* `cwvStore.py` : the code for the Google Cloud Function that stores the CWV data in BigQuery.
* `support_functions.js` : provides... support functions to the various scripts, mostly formatting and file output functions
