# gitbook-plugin-parse-from-url

Add to the `book.json` the `urls` you want to save. Each _url_ is an object with the url and the destination file name.
The `url` from the object will be save to the `dest` specified.

### plugins

```json
"plugins" : [
  "parse-from-url"
]
```

### Plugins Config

```json
"parseUrls" : {
  "urls": [
    {
      "url": "https://api.github.com/orgs/BandwidthExamples/repos",
      "dest": "howto/deployableDemos.md",
      "mapping": "github-names.json"
    }
  ]
}
```
