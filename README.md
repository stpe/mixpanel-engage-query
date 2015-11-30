Command-line tool to query the [Mixpanel Engage API](https://mixpanel.com/docs/api-documentation/data-export-api#engage-default) for People Data. With other words, export list of Mixpanel users with selected properties, optionally filtered by query on property values.

This script is especially powerful in combination with [mixpanel-engage-post](https://github.com/stpe/mixpanel-engage-post), that allow you to batch post additions/updates/deletion of people profiles, and [jq](http://stedolan.github.io/jq) (a command-line JSON processor).

## Installation

Install [Node.js](http://nodejs.org/).

Type `npm install --global mixpanel-engage-query`

That's it! Run it by typing `engage` in your terminal.

## Usage

To run the script you must specify your Mixpanel API key and secret either as parameters, as environment variables `MIXPANEL_API_KEY` and `MIXPANEL_API_SECRET`, in a [.env](https://github.com/motdotla/dotenv) file located in the script's directory (typically useful if you check out the source from Github) or in a `.engagerc` file in your home directory.

Example of `.env` and `~/.engagerc` file:
```
MIXPANEL_API_KEY=f49785f7a0yourkey2019c6ba15d71f5
MIXPANEL_API_SECRET=a69ca325ayoursecret4f5ed45cafb66
```

## Example

#### Get help

```
$ engage --help

Usage: engage -k [string] -s [string]

Options:
  -k, --key         Mixpanel API key                                    [string]
  -s, --secret      Mixpanel API secret                                 [string]
  -f, --format      Output format, json or csv        [string] [default: "json"]
  -t, --total       Only return total count of results
  -q, --query       A segmentation expression (see Mixpanel API doc)    [string]
  -p, --properties  Properties to output (e.g. '$email $first_name'). Outputs
                    all properties if none specified.
  -r, --required    Skip entries where the required properties are not set (e.g.
                    '$email $first_name').
  --na, --noarray   Output json as one object per row, instead of one array of
                    objects.
  -u, --url         Only return the URL of query without making the actual
                    request.
  -h, --help        Help                                               [boolean]

Examples:
  engage -q 'properties["$last_seen"] >     Query using expression
  "2015-04-24T23:00:00"'
  engage -p '$email $first_name'            Limit output to only given list of
                                            space delimited properties

Note that Mixpanel API key/secret may also be set using environment variables.
For more information, see https://github.com/stpe/mixpanel-engage-query
```

#### Get everything

`$ engage`

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

`engage -t` (assumes Mixpanel key/secret set as environment variables)

Example output:
```
1138
```

#### Only output specific fields

`engage -p '$email $first_name'`

Example output:
```
[
  { '$email': 'jocke@bigcompany.se', '$first_name': 'Joakim' },
  { '$email': 'henke@gmail.com', '$first_name': 'Henrik' },
  { '$email': 'theguy@gmail.com', '$first_name': 'Jonas' }
]
```

#### Output as CSV instead of JSON

`engage -f csv`

Example output:
```
jocke@bigcompany.se;Joakim
henke@gmail.com;Henrik
theguy@gmail.com;Jonas
```

Note: currently no special escaping or similar is implemented, so depending on values CSV may end up invalid.

#### Query using expression

This example returns people with $last_seen timestamp greater (later) than 24th of April (see the Mixpanel documentation for [segmentation expressions](https://mixpanel.com/docs/api-documentation/data-export-api#segmentation-expressions)).

`engage -q 'properties["$last_seen"] > "2015-04-24T23:00:00"'`

##### Relative date parsing

Often you need a query with a condition relative to today's date. In order to avoid having to generate the command-line parameters dynamically you can use a placeholder as `[[DATE:<date string>]]` which will be replaced by a correctly formatted date for the Mixpanel API. The `<date string>` may be formatted according to what [Sugar Dates](http://sugarjs.com/dates) supports.

Examples:

`engage -q 'properties["$last_seen"] > "[[DATE:yesterday]]"'`

`engage -q 'properties["$last_seen"] > "[[DATE:the beginning of last month]]"'`





