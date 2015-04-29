#!/usr/bin/env node

/*jshint node: true */

"use strict";

var needle      = require('needle'),
    crypto      = require('crypto'),
    fs          = require('fs'),

    // mixpanel
    base_url    = "http://mixpanel.com/api/2.0/",

    // according to mixpanel doc https://mixpanel.com/docs/api-documentation/data-export-api#engage-default
    // response should return page_size, but it doesn't, so we assume it is 1000 for now
    page_size = 1000;

// add environment variables from .env if present
if (fs.existsSync('.env')) {
    require('dotenv').load();
}

// options
var yargs = require('yargs')
    .usage('Usage: $0 -k [string] -s [string]')
    .options('k', {
        alias: 'key',
        describe: 'Mixpanel API key',
        nargs: 1,
        type: 'string'
    })
    .options('s', {
        alias: 'secret',
        describe: 'Mixpanel API secret',
        nargs: 1,
        type: 'string'
    })
    .options('q', {
        alias: 'query',
        // https://mixpanel.com/docs/api-documentation/data-export-api#segmentation-expressions
        // example: 'properties["$last_seen"] > "2013-08-29T23:00:00"'
        describe: 'A segmentation expression (see Mixpanel API doc)',
        type: 'string'
    })
    .example("$0 -q 'properties[\"$last_seen\"] > \"2015-04-24T23:00:00\"'", 'Query using expression')
    .options('f', {
        alias: 'format',
        default: 'json',
        describe: 'Output format, json or csv',
        type: 'string'
    })
    .options('p', {
        alias: 'properties',
        describe: "Properties to output (e.g. '$email $first_name'). Outputs all properties if none specified."
    })
    .example("$0 -p '$email $first_name'", 'Limit output to only given list of space delimited properties')
    .options('r', {
        alias: 'required',
        describe: "Skip entries where the required properties are not set (e.g. '$email $first_name')."
    })
    .help('h')
    .options('h', {
        alias: 'help',
        describe: 'Help'
    });

if (!process.env.MIXPANEL_API_KEY) {
    yargs.demand(['k']);
}

if (!process.env.MIXPANEL_API_SECRET) {
    yargs.demand(['s']);
}

var argv = yargs.argv;

var MIXPANEL_API_KEY = process.env.MIXPANEL_API_KEY || argv.key;
var MIXPANEL_API_SECRET = process.env.MIXPANEL_API_SECRET || argv.secret;

// get mp properties to output
var properties = typeof argv.properties === "string" ? argv.properties.split(" ") : [];

// get required mp properties
var required = typeof argv.required === "string" ? argv.required.split(" ") : [];

// do the stuff!
queryEngageApi({
    page: 0,
    where: argv.query || ""
});

// ------------------------------------------

function queryEngageApi(params) {
    var url = getUrl("engage", params);

    needle.get(url, {}, function(err, resp, data) {
        // request error
        if (err) {
            console.log("Error: " + err);
            return;
        }

        // Mixpanel API error
        if (data.error) {
            console.log('Mixpanel API error: ' + data.error);
            return;
        }

        processResults(data);

        // unless fewer results than page_size, keep querying for additional pages
        if (data.results.length >= page_size) {
            // get next page
            params.page++;
            // use session id in next query to speed up API response
            params.session_id = data.session_id;

            queryEngageApi(params);
        }
    });
}

function processResults(data) {
    var i, csv, entry, len = data.results.length;

    for (i = 0; i < len; i++) {
        if (required.length > 0) {
            // skip if not required properties present
            if (!required.every(function(r) {
                return typeof data.results[i].$properties[r] !== 'undefined';
            })) {
                continue;
            }
        }

        // include $distinct_id in property list for convenience
        if (data.results[i].$distinct_id) {
            data.results[i].$properties['$distinct_id'] = data.results[i].$distinct_id;
        }

        entry = {};
        if (properties.length === 0) {
            // output all
            entry = data.results[i].$properties;
        } else {
            // only include given properties
            properties.forEach(function(p) {
                entry[p] = data.results[i].$properties[p] || '';
            });
        }

        // skip if object is empty
        if (Object.keys(entry).length === 0) {
            continue;
        }

        if (argv.format === "csv") {
            // csv
            csv = [];
            Object.keys(entry).forEach(function(k) {
                csv.push(entry[k]);
            });
            console.log(csv.join(";"));
        } else {
            // json
            console.log(JSON.stringify(entry));
        }
    }
}

function getUrl(endpoint, args) {
    // add api_key and expire in EXPIRE_IN_MINUTES
    var EXPIRE_IN_MINUTES = 10;
    args.api_key = MIXPANEL_API_KEY;
    args.expire = Math.round(Date.now() / 1000) + 60 * EXPIRE_IN_MINUTES;

    // see https://mixpanel.com/docs/api-documentation/data-export-api#auth-implementation
    var arg_keys = Object.keys(args),
        sorted_keys = arg_keys.sort(),
        concat_keys = "",
        params = [];

    for (var i = 0; i < sorted_keys.length; i++) {
        params.push(sorted_keys[i] + "=" + args[sorted_keys[i]]);
        concat_keys += params[params.length - 1];
    }

    // sign
    var sig = crypto.createHash('md5').update(concat_keys + MIXPANEL_API_SECRET).digest("hex");

    // return request url
    return base_url + endpoint + "/?" + params.join("&") + "&sig=" + sig;
}