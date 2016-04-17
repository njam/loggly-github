loggly-github
=============
Create GitHub tickets for Loggly alerts.

[![Build Status](https://img.shields.io/travis/cargomedia/loggly-github/master.svg)](https://travis-ci.org/cargomedia/loggly-github)
[![npm](https://img.shields.io/npm/v/loggly-github.svg)](https://www.npmjs.com/package/loggly-github)

*loggly-github* starts an HTTP server where Loggly can send [alert postbacks](https://www.loggly.com/docs/alert-endpoints/) to.
For each new alert postback it will open a GitHub ticket.

Configure & Run
---------------
Create a JSON configuration:
```json
{
  "port": "<HTTP port to listen on>",
  "github": {
    "token": "<GitHub access token>"
  }
}
```
When generating a [*personal access token*](https://github.com/settings/tokens) on GitHub, make sure to enable the "repo" scope.

