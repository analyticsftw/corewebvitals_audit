# Import and misc. libraries
import functions_framework
from google.cloud import bigquery
import datetime
from urllib.parse import urlencode
from urllib.parse import urlparse
from urllib.parse import parse_qs

# BigQuery setup
bq_client = bigquery.Client()
dataset_id = 'speed_meter'
table_id = 'scans'
table_ref = bq_client.dataset(dataset_id).table(table_id)
table = bq_client.get_table(table_ref)

# Function to store CWV data into BigQuery
def storeCWV(request):
    now = datetime.datetime.now()
    if (request.args):
        ts = request.args.get('ts')
        url = request.args.get('url')
        cwv_id = request.args.get('id')
        name = request.args.get('name')    
        cwv_value = request.args.get('value')
        delta = request.args.get('delta')    
        navigationType = request.args.get('navigationType')
        rating = request.args.get('rating')
        
        # insert rows into BigQuery using the request arguments
        try:
            # prep fields and values
            rows_to_insert = [
                {
                    'ts' : now,
                    'url' : url,
                    'id' : cwv_id,
                    'name' : name,
                    'value' : float(cwv_value),
                    'delta' : float(delta),
                    'navigationType': navigationType,
                    'rating' : rating
                }
            ]
            try:
                # actually insert into BQ
                errors = bq_client.insert_rows(table, rows_to_insert)
                return '200 OK'
            except AssertionError as msg:
                return 'Error 500: Could not insert into BigQuery --> '+msg
        except Exception as e:
            return '500 Internal Server Error: Issue with request data --> ' + e
    else:
        return '400 Bad Request: Missing request arguments'