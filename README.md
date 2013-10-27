Command-line tool to query the [MixPanel Engage API](https://mixpanel.com/docs/api-documentation/data-export-api#engage-default) for People Data.

This was quickly put together for use of my own. But feel free to fork, submit pull requests or use if you find it useful.

## Installation

Clone the repository:
``git clone https://github.com/stpe/mixpanel-engage-query.git``

Install [Node.js](http://nodejs.org/).

Run ``npm install`` in the directory. That's it!

## Example

#### Get help

```
$ node engage.js
Usage: node ./engage.js -k [string] -s [string]

Options:
  -k, --key         MixPanel API key                                                  [required]
  -s, --secret      MixPanel API secret                                               [required]
  -q, --query       A segmentation expression
  -f, --format      Output format, json or csv                                        [default: "json"]
  -p, --properties  Properties to output. Outputs all properties if none specified.

Missing required arguments: k, s
```

#### Get everything

``node engage.js -k MIXPANEL_API_KEY -s MIXPANEL_API_SECRET``

#### Only output specific fields

``node engage.js -k MIXPANEL_API_KEY -s MIXPANEL_API_SECRET -p '$email $first_name'``

Example output:
```
{ '$email': 'jocke@bigcompany.se', '$first_name': 'Joakim' }
{ '$email': 'henrik@gmail.com', '$first_name': 'Henrik' }
{ '$email': 'theguy@gmail.com', '$first_name': 'Jonas' }
```

Note: one JSON entry per row.

#### Output as CVS instead of JSON

``node engage.js -k MIXPANEL_API_KEY -s MIXPANEL_API_SECRET -f 'csv'``

Example output:
```
jocke@bigcompany.se;Joakim
henrik@gmail.com;Henrik
theguy@gmail.com;Jonas
```

Note: currently no special escaping or similar is implemented, so depending on values csv may end up invalid.

#### Query using expression

This example returns people with $last_seen timestamp greater (later) than 29th of August (see the MixPanel documentation for [segmentation expressions](https://mixpanel.com/docs/api-documentation/data-export-api#segmentation-expressions)).

``node engage.js -k MIXPANEL_API_KEY -s MIXPANEL_API_SECRET -q 'properties["$last_seen"] > "2013-08-29T23:00:00"'``

