# gauges-referrer

[Gaug.es](http://gaug.es) offers neat statistics for your web sites, but is missing a accumulated referrers views. You can view all referrers for a special date, but what's about the last 30 days? Here it is!

### Usage

#### Dependencies

```bash
$ > npm install
```

### Usage

```bash
$ > ./gaug.js APIKEY SIDEID LASTDAY
```

```bash
$ > ./gaug.js 
Gaug.es API Token: aaf21da41766a3f7a73af49ff3dadf91
Gaug.es Site ID: 2a3310fcab34d33147a000032
Days to fetch? [10] 30
```

### Result

    [
      {
        "views": 320,
        "url": "https://github.com/semu/noduino"
      },
      {
        "views": 236,
        "url": "https://twitter.com/sbstjn"
      },
      {
        "views": 221,
        "url": "http://semu.mp"
      }
    }