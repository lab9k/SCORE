function SpreadsheetDataService() {
  this.url =
    "https://spreadsheets.google.com/feeds/list/1adKrrgn-KxFe1mWHUXZEDvu23BIzHE2wLk2YfIQjzbM/o19znhx/public/values?alt=json";
  this.cityColors = Object.create(null);
}

/**
 *
 *
 * @callback sheetDataCallback
 * @param {Object} parsed_data
 */

/**
 *
 *
 * @param {sheetDataCallback} cb - The callback that handles the data collected from the spreadsheet.
 */
SpreadsheetDataService.prototype.fetch = function(cb) {
  var self = this;
  var cities = [];
  fetchJson(this.url, function(raw_data) {
    var parsed_json = Object.create({});
    if (raw_data.feed && raw_data.feed.entry) {
      parsed_json["name"] = "score";
      parsed_json["children"] = [];
      var rows = raw_data.feed.entry;
      rows.forEach(row => {
        var themeValue = row["gsx$theme"]["$t"];
        var kwValue = row["gsx$keyword"]["$t"];
        var titleValue = row["gsx$title"]["$t"];
        var descriptionValue = row["gsx$description"]["$t"];
        var contactValue = row["gsx$contact"]["$t"];
        var cityValue = row["gsx$city"]["$t"];

        if (!cities.includes(cityValue)) {
          cities.push(cityValue);
        }
        var rowObj = {
          name: titleValue,
          description: descriptionValue,
          contact: contactValue,
          city: cityValue,
          size: 256,
          leaf: true
        };

        var themeObj = parsed_json.children.find(el => {
          return el.name === themeValue;
        });
        if (!themeObj) {
          themeObj = { name: themeValue, children: [], kind: "THEME" };
          themeObj.children.push({ name: kwValue, children: [rowObj] });
          parsed_json.children.push(themeObj);
        } else {
          var kwObj = themeObj.children.find(el => {
            return el.name === kwValue;
          });
          if (!kwObj) {
            themeObj.children.push({
              name: kwValue,
              children: [rowObj],
              kind: "KEYWORD"
            });
          } else {
            kwObj.children.push(rowObj);
          }
        }
      });
    }
    self.createColors(cities);
    cb(parsed_json);
  });
};

SpreadsheetDataService.prototype.createColors = function(cities) {
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    const color = randomColor({ luminosity: "light" });
    this.cityColors[city] = color;
  }
  console.log(JSON.stringify(this.cityColors));
};

var fetchJson = function(url, cb) {
  var request = new Request(url);
  fetch(request)
    .then(status)
    .then(data => {
      data.json().then(d => {
        cb(d);
      });
    })
    .catch(console.error);
};

var status = function() {
  if (response.status == 200 && response.status == 300) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(new Error(response.statusText));
  }
};
