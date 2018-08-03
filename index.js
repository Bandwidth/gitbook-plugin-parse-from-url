var axios = require('axios');
var fs = require('fs-extra');
var path = require('path');

var hooks = {};

function parse_data(data) {
    var display_projects = {};
    for (var i in data) { //data is a list
        var repo = data[i];
        if (repo["archived"] == false) {
            var language = repo["language"];
            if (language == "C#") {
                language = "CSharp";
            }
            if (!(language in display_projects)) {
                display_projects[language] = [];
            }

            display_projects[language].push([repo["name"], repo["html_url"], repo["description"]]);

        }
    }

    var raw_markdown = "";
    for (var language in display_projects) { //display_projects is a dict
        raw_markdown += "### [](#" + language + ")" + language;
        raw_markdown += "\n\n* * *\n\n";
        for (var j = 0; j < display_projects[language].length; j++) { //make this do something like i in range(len(x))
            var repo = display_projects[language][j];
            var name = repo[0];
            var url = repo[1];
            var desc = repo[2];
            if (desc === null) {
                desc = "No description provided";
            }
            raw_markdown += "### [](#" + name + ")[" + name + "](" + url + ")";
            raw_markdown += "\n\n" + desc + "\n\n";
        }
    }

    return raw_markdown;
}

const download = (url, dest) => {
  return axios.request({
    responseType: 'arraybuffer',
    url: url,
    method: 'get',
  }).then((result) => {
    data = parse_data(JSON.parse(result.data));
    var bookPath = '_book/'+dest;
    fs.writeFileSync(dest, data);
    fs.ensureFileSync(bookPath);
    fs.copySync(dest, bookPath);
    return dest;
  })
  .catch(e => {
    console.log(e)
    console.log('error saving url');
  });
}

module.exports = {
  hooks: {
    "init": function() {
        var urls = this.options.pluginsConfig && this.options.pluginsConfig.parseUrls && this.options.pluginsConfig.parseUrls.urls;
        for (i = 0; i < urls.length; i++) {
          let fileName = download(urls[i].url, urls[i].dest);
        }
      }
    }
};

download("https://api.github.com/orgs/BandwidthExamples/repos", "test.txt");
