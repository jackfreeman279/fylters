module.exports = {
  "tags": {
    "allowUnknownTags": true
  },
  "opts": {
    "destination": "./docs/developer"
  },
  "plugins": [
    "plugins/markdown"
  ],
  "templates": {
    "systemName": "Fylters",
    "cleverLinks": false,
    "monospaceLinks": false,
    "default": {
      "outputSourceFiles": true
    },
    "path": "ink-docstrap",
    "theme": "flatly",
    "navType": "inline",
    "linenums": true,
    "dateFormat": "MMMM Do YYYY, h:mm:ss a"
  }
}
