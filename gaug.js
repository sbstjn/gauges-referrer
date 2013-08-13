#!/usr/bin/env node

// Load dependencies
var request = require('request');
var climate = require('climate');
var async = require('async');

// Handler for prompt for API Key/Token
var promptForToken = function(callback) {
  climate.prompt('Gaug.es API Token:');
  climate.fallback(callback);
};

// Handler for prompt for Gaug.es Site ID
var promptForSite = function(callback) {
  climate.prompt('Gaug.es Site ID:');
  climate.fallback(callback);
};

// Handler for prompt for Last Days
var promptForDays = function(callback) {
  climate.prompt('Days to fetch? [10]');
  climate.fallback(function(days) {
    callback(parseInt(days) || 10);
  })
};

// Handle request for Last Days of Site using Token
var handle = function(cfgToken, cfgSite, cfgDays, callback) {
  // Pull emergency trigger
  if (parseInt(cfgDays, 10) > 400) {
    console.log("");
    console.log("I don't know if we can do this. Remove gaug.js:31 at your own risk…"); 
    console.log("");
    
    return
  }
  
  var result = {};
  var now = new Date();
  var day = new Date();
  var days = [];
  
  // Create list of dates
  days.push(new Date());
  for (var i = 1, m = cfgDays; i <= m; i++) {
    var day = new Date();
    day.setTime(now.getTime() - ((24*60*60*1000) * i) );
        
    days.push(day);
  }
  
  // Fetch dates
  async.each(days, function(item, next) {
    getReferrers(item.getUTCFullYear() + '-' + (item.getUTCMonth()+1) + '-' + item.getUTCDate(), cfgToken, cfgSite, function(err, json) {
      if (err) {
        return next(err);
      }
      
      for (var i = 0, m = json.referrers.length; i<m; i++) {
        if (!result[json.referrers[i].url]) {
          result[json.referrers[i].url] = parseInt(json.referrers[i].views, 10); }
        else {
          result[json.referrers[i].url] += parseInt(json.referrers[i].views, 10); }
      }
      
      next();
    });
  }, function(err) {
    var data = [];

    // Transform data
    for (var n in result) {
      data.push({
        views: result[n],
        url: n
      });
    }
    
    // Sort by accumulated views
    data.sort(function(a,b) {
      return a.views > b.views ? -1 : 1;
    });

    callback(err, data);
  });
};

// Send Gaug.es API request
function getReferrers(date, cfgToken, cfgSite, callback) {
  request(
    {
      url: 'https://secure.gaug.es/gauges/' + cfgSite + '/referrers?date=' + date,
      headers: {'X-Gauges-Token': cfgToken}
    },
    function (err, opt, data) {
      try {
        callback(null, JSON.parse(data));
      } catch (e) {
        callback('Failed parsing JSON response');
      }
    }
  );
}

// Handle final callback
var handleResult = function(err, data) {
  if (!err && data) {
    console.log(JSON.stringify(data, ' ', 2));
  } else {
    console.log("Unable to fetch data!");
  }
  
  return process.kill();
}

// Parse arguments
var param = process.argv.slice(2);
var cfgToken = param.shift();
var cfgSite  = param.shift();
var cfgDays  = param.shift();

// Check for missing data
if (!cfgToken) {
  promptForToken(function(cfgToken) {
    promptForSite(function(cfgSite) {
      promptForDays(function(cfgDays) {
        handle(cfgToken, cfgSite, cfgDays);
      });
    });
  });
} else if (!cfgSite) {
  promptForSite(function(cfgSite) {
    promptForDays(function(cfgDays) {
      handle(cfgToken, cfgSite, cfgDays);
    });
  });
} else if (!cfgDays) {
  promptForDays(function(cfgDays) {
    handle(cfgToken, cfgSite, cfgDays, handleResult);
  });
} else {
  // Start the magic
  handle(cfgToken, cfgSite, cfgDays, handleResult);
}