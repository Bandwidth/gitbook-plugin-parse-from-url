var axios = require('axios');
var fs = require('fs');

var hooks = {};

function get_languages_ordered_by_priority(languages) {
    var priority_languages = new Set([
        'Java',
        'PHP',
        'CSharp',
        'JavaScript',
        'Python',
    ]);
    var ordered_languages = [];
    var i;
    for (i = 0; i < languages.length; i++) {
        language = languages[i];
        if (priority_languages.has(language)) {
            ordered_languages.unshift(language);
        }
        else {
            ordered_languages.push(language);
        }
    }
    return ordered_languages;
}

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

    var languages = get_languages_ordered_by_priority(Object.keys(display_projects));
    var i;
    var raw_markdown = "## Bandwidth Code Examples\n";
    
    for (i = 0; i < languages.length; i++) {
        var language = languages[i];
        raw_markdown += "[" + language + "](#" + language + "). ";
    }

    for (i = 0; i < languages.length; i++) { 
        var language = languages[i];
        raw_markdown += '<a id="' + language + '"></a>';
        raw_markdown += "<h3>" + language + "</h3>"; 
        raw_markdown += "\n\n* * *\n\n";
        for (var j = 0; j < display_projects[language].length; j++) {
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
                    auth_extension = "&access_token=" + process.env.GITHUB_TOKEN;
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
