var axios = require('axios');
var fs = require('fs');

var hooks = {};

function parse_repo_data_from_github_api(data, mapping) {
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
            if (name in mapping) {
                name = mapping[name];
            }
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


const modify_page = (url, mapping, page) => {
  return axios.request({
    responseType: 'arraybuffer',
    url: url,
    method: 'get',
  }).then((result) => {
    data = parse_repo_data_from_github_api(JSON.parse(result.data), mapping);
    page.content = data;
    return page;
  })
  .catch(e => {
    console.log(e)
    console.log('error saving url');
  });
}


module.exports = {
  hooks: {
    "page:before": function(page) {
        var urls = this.options.pluginsConfig && this.options.pluginsConfig.parseUrls && this.options.pluginsConfig.parseUrls.urls;
        for (var i = 0; i < urls.length; i++) {
            if (page.path == urls[i].dest) {
                var auth_extension;
                if (process.env.GITHUB_TOKEN == null) {
                    auth_extension = "";
                }
                else {
                    auth_extension = "/?access_token=" + process.env.GITHUB_TOKEN;
                }
                console.log(urls[i].url + auth_extension);
                page = modify_page(urls[i].url + auth_extension, JSON.parse(fs.readFileSync(urls[i].mapping)), page);
                return page;
            }
        }
        return page;
    }
  }
};
