Command-line tool to query the [Mixpanel Engage API](https://mixpanel.com/docs/api-documentation/data-export-api#engage-default) for People Data. With other words, export list of Mixpanel users with selected properties, optionally filtered by query on property values.

This script is especially powerful in combination with [mixpanel-engage-post](https://github.com/stpe/mixpanel-engage-post), that allow you to batch post additions/updates/deletion of people profiles, and [jq](http://stedolan.github.io/jq) (a command-line JSON processor).

## Installation

Clone the repository:
`git clone https://github.com/stpe/mixpanel-engage-query.git`

Install [Node.js](http://nodejs.org/).

Type `npm install` in the directory. That's it!

Run using `node engage.js` or make it an executable script by doing `chmod +x engage.js`, then run it simply using `./engage.js`.

## Usage

To run the script you must specify your Mixpanel API key and secret either as parameters, as environment variables `MIXPANEL_API_KEY` and `MIXPANEL_API_SECRET` or in a [.env](https://github.com/motdotla/dotenv) file.

## Example

#### Get help

```
$ node engage.js

Usage: engage.js -k [string] -s [string]

Options:
  -k, --key         Mixpanel API key                                    [string]
  -s, --secret      Mixpanel API secret                                 [string]
  -f, --format      Output format, json or csv       [string]  [default: "json"]
  -t, --total       Only return total count of results
  -q, --query       A segmentation expression (see Mixpanel API doc)    [string]
  -p, --properties  Properties to output (e.g. '$email $first_name'). Outputs
                    all properties if none specified.
  -r, --required    Skip entries where the required properties are not set
                    (e.g. '$email $first_name').
  --na, --noarray   Output json as one entry per row, instead of an array of
                    entries.
  -u, --url         Only return the URL of query without making the actual
                    request.
  -h, --help        Help

Missing required arguments: k, s
```

#### Get everything

`node engage.js`

Example output:
```
[
  {
      "$browser": "Chrome",
      "$city": "Kathmandu",
      "$country_code": "NP",
      "$initial_referrer": "$direct",
      "$initial_referring_domain": "$direct",
      "$os": "Windows",
      "$timezone": "Asia/Katmandu",
      "id": "279267",
      "nickname": "bamigasectorone",
      "$last_seen": "2015-04-15T13:07:30",
      "$distinct_id": "15b9cba739b75-03c7e24a3-459c0418-101270-13d9bfa739ca6"
  }
]
```

Default behaviour is to output the result as an array of entries. Using the `noarray` flag will instead output one entry per row.

Note that `$distinct_id` is included as a property for convenience.

#### Get just the number of results

`node engage.js -t` (assumes Mixpanel key/secret set as environment variables)

Example output:
```
1138
```

#### Only output specific fields

`node engage.js -p '$email $first_name'`

Example output:
```
[
  { '$email': 'jocke@bigcompany.se', '$first_name': 'Joakim' },
  { '$email': 'henrik@gmail.com', '$first_name': 'Henrik' },
  { '$email': 'theguy@gmail.com', '$first_name': 'Jonas' }
]
```

#### Output as CVS instead of JSON

`node engage.js -f csv`

Example output:
```
jocke@bigcompany.se;Joakim
henrik@gmail.com;Henrik
theguy@gmail.com;Jonas
```

Note: currently no special escaping or similar is implemented, so depending on values csv may end up invalid.

#### Query using expression

This example returns people with $last_seen timestamp greater (later) than 24th of April (see the Mixpanel documentation for [segmentation expressions](https://mixpanel.com/docs/api-documentation/data-export-api#segmentation-expressions)).

`node engage.js -q 'properties["$last_seen"] > "2015-04-24T23:00:00"'`

##### Relative date parsing

Often you need a query with a condition relative to today's date. In order to avoid having to generate the command-line parameters dynamically you can use a placeholder as `[[DATE:<date string>]]` which will be replaced by a correctly formatted date for the Mixpanel API. The `<date string>` may be formatted according to what [Sugar Dates](http://sugarjs.com/dates) supports.

Examples:

`node engage.js -q 'properties["$last_seen"] > "[[DATE:yesterday]]"'`

`node engage.js -q 'properties["$last_seen"] > "[[DATE:the beginning of last month]]"'`





