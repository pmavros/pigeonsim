// Generated by CoffeeScript 1.6.2
(function() {
  var box, load, mergeObj, oneEightyOverPi, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.load = load = function(opts, callback) {
    var k, kvps, url, v, xhr, _ref;

    url = opts.url;
    if ((_ref = opts.method) == null) {
      opts.method = 'GET';
    }
    if (opts.search != null) {
      kvps = (function() {
        var _ref1, _results;

        _ref1 = opts.search;
        _results = [];
        for (k in _ref1) {
          if (!__hasProp.call(_ref1, k)) continue;
          v = _ref1[k];
          _results.push("" + (escape(k)) + "=" + (escape(v)));
        }
        return _results;
      })();
      url += '?' + kvps.join('&');
    }
    xhr = new XMLHttpRequest();
    if (opts.type === 'xml') {
      xhr.overrideMimeType('text/xml');
    }
    xhr.onreadystatechange = function() {
      var obj;

      if (xhr.readyState === 4) {
        obj = opts.type === 'json' ? JSON.parse(xhr.responseText) : opts.type === 'xml' ? xhr.responseXML : xhr.responseText;
        return callback(obj);
      }
    };
    xhr.open(opts.method, url, true);
    return xhr.send(opts.data);
  };

  mergeObj = function(o1, o2) {
    var k, v;

    for (k in o2) {
      if (!__hasProp.call(o2, k)) continue;
      v = o2[k];
      o1[k] = v;
    }
    return o1;
  };

  oneEightyOverPi = 180 / Math.PI;

  box = null;

  this.FeatureManager = (function() {
    function FeatureManager(ge, lonRatio, cam, params) {
      this.ge = ge;
      this.lonRatio = lonRatio;
      this.cam = cam;
      this.params = params;
      this.featureTree = new RTree();
      this.visibleFeatures = {};
      this.updateMoment = 0;
    }

    FeatureManager.prototype.addFeature = function(f) {
      f.fm = this;
      return this.featureTree.insert(f.rect(), f);
    };

    FeatureManager.prototype.removeFeature = function(f) {
      this.hideFeature(f);
      this.featureTree.remove(f.rect(), f);
      return delete f.fm;
    };

    FeatureManager.prototype.showFeature = function(f) {
      if (this.visibleFeatures[f.id] != null) {
        return false;
      }
      this.visibleFeatures[f.id] = f;
      f.show();
      return true;
    };

    FeatureManager.prototype.hideFeature = function(f) {
      if (this.visibleFeatures[f.id] == null) {
        return false;
      }
      delete this.visibleFeatures[f.id];
      f.hide();
      return true;
    };

    FeatureManager.prototype.featuresInBBox = function(lat1, lon1, lat2, lon2) {
      return this.featureTree.search({
        x: lon1,
        y: lat1,
        w: lon2 - lon1,
        h: lat2 - lat1
      });
    };

    FeatureManager.prototype.reset = function() {
      var f, id, _ref;

      _ref = this.visibleFeatures;
      for (id in _ref) {
        if (!__hasProp.call(_ref, id)) continue;
        f = _ref[id];
        this.hideFeature(f);
      }
      return this.update();
    };

    FeatureManager.prototype.update = function() {
      var cam, f, id, kml, lat1, lat2, latDiff, latSize, lon1, lon2, lonDiff, lonSize, lookAt, lookLat, lookLon, midLat, midLon, sizeFactor, _i, _len, _ref, _ref1;

      cam = this.cam;
      lookAt = this.ge.getView().copyAsLookAt(ge.ALTITUDE_ABSOLUTE);
      lookLat = lookAt.getLatitude();
      lookLon = lookAt.getLongitude();
      midLat = (cam.lat + lookLat) / 2;
      midLon = (cam.lon + lookLon) / 2;
      latDiff = Math.abs(cam.lat - midLat);
      lonDiff = Math.abs(cam.lon - midLon);
      sizeFactor = 1.2;
      latSize = Math.max(latDiff, lonDiff / this.lonRatio) * sizeFactor;
      lonSize = latSize * this.lonRatio;
      lat1 = midLat - latSize;
      lat2 = midLat + latSize;
      lon1 = midLon - lonSize;
      lon2 = midLon + lonSize;
      if (this.params.debugBox) {
        if (box) {
          this.ge.getFeatures().removeChild(box);
        }
        kml = "<?xml version='1.0' encoding='UTF-8'?><kml xmlns='http://www.opengis.net/kml/2.2'><Document><Placemark><name>lookAt</name><Point><coordinates>" + lookLon + "," + lookLat + ",0</coordinates></Point></Placemark><Placemark><name>camera</name><Point><coordinates>" + cam.lon + "," + cam.lat + ",0</coordinates></Point></Placemark><Placemark><name>middle</name><Point><coordinates>" + midLon + "," + midLat + ",0</coordinates></Point></Placemark><Placemark><LineString><altitudeMode>absolute</altitudeMode><coordinates>" + lon1 + "," + lat1 + ",100 " + lon1 + "," + lat2 + ",100 " + lon2 + "," + lat2 + ",100 " + lon2 + "," + lat1 + ",50 " + lon1 + "," + lat1 + ",100</coordinates></LineString></Placemark></Document></kml>";
        box = this.ge.parseKml(kml);
        this.ge.getFeatures().appendChild(box);
      }
      _ref = this.featuresInBBox(lat1, lon1, lat2, lon2);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        this.showFeature(f);
        f.updateMoment = this.updateMoment;
      }
      _ref1 = this.visibleFeatures;
      for (id in _ref1) {
        if (!__hasProp.call(_ref1, id)) continue;
        f = _ref1[id];
        if (f.updateMoment < this.updateMoment) {
          this.hideFeature(f);
        }
      }
      return this.updateMoment += 1;
    };

    return FeatureManager;

  })();

  this.FeatureSet = (function() {
    function FeatureSet(featureManager) {
      this.featureManager = featureManager;
      this.features = {};
    }

    FeatureSet.prototype.addFeature = function(f) {
      this.features[f.id] = f;
      return this.featureManager.addFeature(f);
    };

    FeatureSet.prototype.removeFeature = function(f) {
      this.featureManager.removeFeature(f);
      return delete this.features[f.id];
    };

    FeatureSet.prototype.clearFeatures = function() {
      var f, k, _ref, _results;

      _ref = this.features;
      _results = [];
      for (k in _ref) {
        if (!__hasProp.call(_ref, k)) continue;
        f = _ref[k];
        _results.push(this.removeFeature(f));
      }
      return _results;
    };

    return FeatureSet;

  })();

  this.Feature = (function() {
    Feature.prototype.alt = 100;

    Feature.prototype.nameTextOpts = {};

    Feature.prototype.descTextOpts = {};

    function Feature(id, lat, lon, opts) {
      this.id = id;
      this.lat = lat;
      this.lon = lon;
      this.opts = opts;
    }

    Feature.prototype.rect = function() {
      return {
        x: this.lon,
        y: this.lat,
        w: 0,
        h: 0
      };
    };

    Feature.prototype.show = function() {
      var angleToCamDeg, angleToCamRad, cam, fm, ge, geNode, st;

      fm = this.fm;
      cam = fm.cam;
      ge = fm.ge;
      angleToCamRad = Math.atan2(this.lon - cam.lon, this.lat - cam.lat);
      angleToCamDeg = angleToCamRad * oneEightyOverPi;
      st = new SkyText(this.lat, this.lon, this.alt, this.opts);
      if (this.name) {
        st.text(this.name, mergeObj({
          bearing: angleToCamDeg
        }, this.nameTextOpts));
      }
      if (this.desc) {
        st.text(this.desc, mergeObj({
          bearing: angleToCamDeg
        }, this.descTextOpts));
      }
      geNode = ge.parseKml(st.kml());
      ge.getFeatures().appendChild(geNode);
      this.hide();
      return this.geNode = geNode;
    };

    Feature.prototype.hide = function() {
      if (this.geNode != null) {
        this.fm.ge.getFeatures().removeChild(this.geNode);
        return delete this.geNode;
      }
    };

    return Feature;

  })();

  this.RailStationSet = (function(_super) {
    __extends(RailStationSet, _super);

    function RailStationSet(featureManager) {
      var code, lat, lon, name, row, station, _i, _len, _ref, _ref1;

      RailStationSet.__super__.constructor.call(this, featureManager);
      _ref = this.csv.split("\n");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        _ref1 = row.split(','), code = _ref1[0], name = _ref1[1], lat = _ref1[2], lon = _ref1[3];
        if (lat < 51.253320526331336 || lat > 51.73383267274113 || lon < -0.61248779296875 || lon > 0.32684326171875) {
          continue;
        }
        station = new RailStation("rail-" + code, parseFloat(lat), parseFloat(lon));
        station.name = "\uF001 " + name;
        this.addFeature(station);
      }
    }

    return RailStationSet;

  })(FeatureSet);

  this.RailStation = (function(_super) {
    __extends(RailStation, _super);

    function RailStation() {
      _ref = RailStation.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    RailStation.prototype.alt = 130;

    RailStation.prototype.nameTextOpts = {
      size: 3
    };

    return RailStation;

  })(Feature);

  this.LeedsCitySet = (function(_super) {
    __extends(LeedsCitySet, _super);

    function LeedsCitySet(featureManager) {
      var bb, lat, lch, lfs, lon, name, railLeeds, row, unileeds, _i, _len, _ref1, _ref2;

      LeedsCitySet.__super__.constructor.call(this, featureManager);
      lch = new LeedsCivicHall("civic-hall", 53.80210025576234, -1.5485385060310364);
      this.addFeature(lch);
      unileeds = new UniLeeds("uni-of-leeds", 53.80786737971994, -1.5527737140655518);
      this.addFeature(unileeds);
      railLeeds = new RailLeeds("RailStation", 53.79437097083624, -1.5475326776504517);
      railLeeds.update();
      this.addFeature(railLeeds);
      bb = new LeedsTownHallClock('TownHallClock', 53.80005678340009, -1.5497106313705444);
      bb.update();
      this.addFeature(bb);
      _ref1 = this.csv.split("\n");
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        row = _ref1[_i];
        _ref2 = row.split(','), lat = _ref2[0], lon = _ref2[1], name = _ref2[2];
        lfs = new LeedsFeature(name, parseFloat(lat), parseFloat(lon));
        lfs.name = name;
        this.addFeature(lfs);
      }
    }

    return LeedsCitySet;

  })(FeatureSet);

  this.LeedsFeature = (function(_super) {
    __extends(LeedsFeature, _super);

    function LeedsFeature() {
      _ref1 = LeedsFeature.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    LeedsFeature.prototype.alt = Math.floor(Math.random() * (300 - 200 + 1) + 200);

    LeedsFeature.prototype.nameTextOpts = {
      size: 3,
      lineWidth: 2
    };

    LeedsFeature.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    return LeedsFeature;

  })(Feature);

  this.LeedsCivicHall = (function(_super) {
    __extends(LeedsCivicHall, _super);

    function LeedsCivicHall() {
      _ref2 = LeedsCivicHall.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    LeedsCivicHall.prototype.alt = 150;

    LeedsCivicHall.prototype.nameTextOpts = {
      size: 3,
      lineWidth: 2
    };

    LeedsCivicHall.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    LeedsCivicHall.prototype.name = "Leeds Civic Hall";

    LeedsCivicHall.prototype.desc = "";

    return LeedsCivicHall;

  })(Feature);

  this.RailLeeds = (function(_super) {
    __extends(RailLeeds, _super);

    function RailLeeds() {
      _ref3 = RailLeeds.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    RailLeeds.prototype.alt = 200;

    RailLeeds.prototype.nameTextOpts = {
      size: 3,
      lineWidth: 2
    };

    RailLeeds.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    RailLeeds.prototype.name = "\uF001 Leeds Rail Station";

    RailLeeds.prototype.desc = "Next Train: ";

    RailLeeds.prototype.update = function() {
      var self,
        _this = this;

      load({
        url: 'http://www.maptube.org/realtime/leedsdeparturesservice.svc/leeds',
        type: 'json'
      }, function(data) {
        _this.desc = "Next Train: " + data.text.replace("Platform \?\? ", "");
        if (_this.geNode != null) {
          return _this.show();
        }
      });
      self = arguments.callee.bind(this);
      if (this.interval == null) {
        return this.interval = setInterval(self, 3 * 60 * 1000);
      }
    };

    return RailLeeds;

  })(Feature);

  this.UniLeeds = (function(_super) {
    __extends(UniLeeds, _super);

    function UniLeeds() {
      _ref4 = UniLeeds.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    UniLeeds.prototype.alt = 200;

    UniLeeds.prototype.nameTextOpts = {
      size: 3,
      lineWidth: 2
    };

    UniLeeds.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    UniLeeds.prototype.name = "University of Leeds";

    UniLeeds.prototype.desc = "";

    return UniLeeds;

  })(Feature);

  this.LeedsTownHallClock = (function(_super) {
    __extends(LeedsTownHallClock, _super);

    function LeedsTownHallClock() {
      _ref5 = LeedsTownHallClock.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    LeedsTownHallClock.prototype.alt = 200;

    LeedsTownHallClock.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 2
    };

    LeedsTownHallClock.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    LeedsTownHallClock.prototype.update = function() {
      var self;

      this.name = new Date().strftime('%H.%M');
      this.desc = 'Leeds Town Hall';
      if (this.geNode != null) {
        this.show();
      }
      self = arguments.callee.bind(this);
      if (this.interval == null) {
        return this.interval = setInterval(self, 1 * 60 * 1000);
      }
    };

    return LeedsTownHallClock;

  })(Feature);

  this.LeedsTweetSet = (function(_super) {
    __extends(LeedsTweetSet, _super);

    LeedsTweetSet.prototype.maxTweets = 500;

    function LeedsTweetSet(featureManager) {
      LeedsTweetSet.__super__.constructor.call(this, featureManager);
      this.update();
    }

    LeedsTweetSet.prototype.update = function() {
      var self,
        _this = this;

      load({
        url: 'http://www.casa.ucl.ac.uk/tom/ajax-live/leeds_last_hour.json',
        type: 'json'
      }, function(data) {
        var dedupedTweets, i, k, lat, lon, t, tweet, _i, _len, _ref6, _results;

        _this.clearFeatures();
        dedupedTweets = {};
        _ref6 = data.results.slice(-_this.maxTweets);
        for (i = _i = 0, _len = _ref6.length; _i < _len; i = ++_i) {
          t = _ref6[i];
          dedupedTweets["" + (parseFloat(t.lat).toFixed(4)) + "/" + (parseFloat(t.lon).toFixed(4))] = t;
        }
        _results = [];
        for (k in dedupedTweets) {
          if (!__hasProp.call(dedupedTweets, k)) continue;
          t = dedupedTweets[k];
          lat = parseFloat(t.lat);
          lon = parseFloat(t.lon);
          if (isNaN(lat) || isNaN(lon)) {
            continue;
          }
          tweet = new Tweet("tweet-" + t.twitterID, lat, lon);
          tweet.name = "" + t.name + " — " + (t.dateT.match(/\d?\d:\d\d/));
          tweet.desc = t.twitterPost.replace(/&gt;/g, '>').replace(/&lt;/g, '<').match(/.{1,35}(\s|$)|\S+?(\s|$)/g).join('\n').replace(/\n+/g, '\n');
          _results.push(_this.addFeature(tweet));
        }
        return _results;
      });
      self = arguments.callee.bind(this);
      return setTimeout(self, 5 * 60 * 1000);
    };

    return LeedsTweetSet;

  })(FeatureSet);

  this.TubeStationSet = (function(_super) {
    __extends(TubeStationSet, _super);

    function TubeStationSet(featureManager) {
      var code, dummy, lat, lon, name, row, station, _i, _len, _ref6, _ref7;

      TubeStationSet.__super__.constructor.call(this, featureManager);
      _ref6 = this.csv.split("\n");
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        row = _ref6[_i];
        _ref7 = row.split(','), code = _ref7[0], dummy = _ref7[1], lon = _ref7[2], lat = _ref7[3], name = _ref7[4];
        station = new TubeStation("tube-" + code, parseFloat(lat), parseFloat(lon));
        station.name = "\uF000 " + name;
        this.addFeature(station);
      }
    }

    return TubeStationSet;

  })(FeatureSet);

  this.TubeStation = (function(_super) {
    __extends(TubeStation, _super);

    function TubeStation() {
      _ref6 = TubeStation.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    TubeStation.prototype.alt = 100;

    TubeStation.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 1
    };

    return TubeStation;

  })(Feature);

  this.MiscSet = (function(_super) {
    __extends(MiscSet, _super);

    function MiscSet(featureManager) {
      var bb, ch, logo, tb;

      MiscSet.__super__.constructor.call(this, featureManager);
      ch = new CityHall("city-hall", 51.50477580586208, -0.07864236831665039);
      this.addFeature(ch);
      logo = new CASALogo("casa-logo", 51.52192375643773, -0.13593167066574097);
      this.addFeature(logo);
      bb = new BigBen('big-ben', 51.5007286626542, -0.12459531426429749);
      bb.update();
      this.addFeature(bb);
      tb = new TowerBridge('twr-brdg', 51.50558385576479, -0.0754237174987793);
      tb.update();
      this.addFeature(tb);
    }

    return MiscSet;

  })(FeatureSet);

  this.CityHall = (function(_super) {
    __extends(CityHall, _super);

    function CityHall() {
      _ref7 = CityHall.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    CityHall.prototype.alt = 120;

    CityHall.prototype.nameTextOpts = {
      size: 3,
      lineWidth: 2
    };

    CityHall.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    CityHall.prototype.name = "City Hall";

    CityHall.prototype.desc = "More London";

    return CityHall;

  })(Feature);

  this.CASALogo = (function(_super) {
    __extends(CASALogo, _super);

    function CASALogo() {
      _ref8 = CASALogo.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    CASALogo.prototype.alt = 220;

    CASALogo.prototype.nameTextOpts = {
      size: 1,
      lineWidth: 1
    };

    CASALogo.prototype.name = "\uF002";

    return CASALogo;

  })(Feature);

  this.CASAConf = (function(_super) {
    __extends(CASAConf, _super);

    function CASAConf() {
      _ref9 = CASAConf.__super__.constructor.apply(this, arguments);
      return _ref9;
    }

    CASAConf.prototype.alt = 130;

    CASAConf.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 3
    };

    CASAConf.prototype.descTextOpts = {
      size: 1,
      lineWidth: 2
    };

    CASAConf.prototype.name = 'CASA Smart Cities';

    CASAConf.prototype.update = function() {
      var changed, d, d0, dayHrs, dayMs, desc, i, self, session, _i, _len, _ref10;

      d = new Date();
      d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      dayMs = d - d0;
      dayHrs = dayMs / 1000 / 60 / 60;
      _ref10 = this.schedule;
      for (i = _i = 0, _len = _ref10.length; _i < _len; i = ++_i) {
        session = _ref10[i];
        if (dayHrs < session[0]) {
          desc = "Now:\t" + this.schedule[i - 1][1] + "\nNext:\t" + session[1];
          break;
        }
      }
      changed = this.desc !== desc;
      this.desc = desc;
      if (changed && (this.geNode != null)) {
        this.show();
      }
      self = arguments.callee.bind(this);
      if (this.interval == null) {
        return this.interval = setInterval(self, 1 * 60 * 1000);
      }
    };

    return CASAConf;

  })(Feature);

  this.TubeStation = (function(_super) {
    __extends(TubeStation, _super);

    function TubeStation() {
      _ref10 = TubeStation.__super__.constructor.apply(this, arguments);
      return _ref10;
    }

    TubeStation.prototype.alt = 100;

    TubeStation.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 1
    };

    return TubeStation;

  })(Feature);

  this.BigBen = (function(_super) {
    __extends(BigBen, _super);

    function BigBen() {
      _ref11 = BigBen.__super__.constructor.apply(this, arguments);
      return _ref11;
    }

    BigBen.prototype.alt = 200;

    BigBen.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 2
    };

    BigBen.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    BigBen.prototype.update = function() {
      var self;

      this.name = new Date().strftime('%H.%M');
      this.desc = 'Big Ben';
      if (this.geNode != null) {
        this.show();
      }
      self = arguments.callee.bind(this);
      if (this.interval == null) {
        return this.interval = setInterval(self, 1 * 60 * 1000);
      }
    };

    return BigBen;

  })(Feature);

  this.TowerBridge = (function(_super) {
    __extends(TowerBridge, _super);

    function TowerBridge() {
      _ref12 = TowerBridge.__super__.constructor.apply(this, arguments);
      return _ref12;
    }

    TowerBridge.prototype.alt = 150;

    TowerBridge.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 3
    };

    TowerBridge.prototype.name = 'Tower Bridge';

    TowerBridge.prototype.update = function() {
      var self,
        _this = this;

      load({
        url: 'http://www.towerbridge.org.uk/TBE/EN/BridgeLiftTimes/',
        type: 'xml'
      }, function(data) {
        var cells, changed, desc, descs, i, x;

        cells = (function() {
          var _i, _len, _ref13, _results;

          _ref13 = data.querySelectorAll('td');
          _results = [];
          for (_i = 0, _len = _ref13.length; _i < _len; _i++) {
            x = _ref13[_i];
            _results.push(x.innerHTML);
          }
          return _results;
        })();
        descs = (function() {
          var _i, _results;

          _results = [];
          for (i = _i = 0; _i <= 5; i = _i += 5) {
            _results.push("" + cells[i + 4] + " on " + cells[i] + " " + cells[i + 1] + " at " + cells[i + 2] + " for vessel " + cells[i + 3]);
          }
          return _results;
        })();
        desc = descs.join('\n');
        changed = _this.desc !== desc;
        _this.desc = desc;
        if (changed && (_this.geNode != null)) {
          return _this.show();
        }
      });
      self = arguments.callee.bind(this);
      if (this.interval == null) {
        return this.interval = setInterval(self, 4 * 60 * 60 * 1000);
      }
    };

    return TowerBridge;

  })(Feature);

  this.LondonTweetSet = (function(_super) {
    __extends(LondonTweetSet, _super);

    LondonTweetSet.prototype.maxTweets = 500;

    function LondonTweetSet(featureManager) {
      LondonTweetSet.__super__.constructor.call(this, featureManager);
      this.update();
    }

    LondonTweetSet.prototype.update = function() {
      var self,
        _this = this;

      load({
        url: 'http://www.casa.ucl.ac.uk/tom/ajax-live/lon_last_hour.json',
        type: 'json'
      }, function(data) {
        var dedupedTweets, i, k, lat, lon, t, tweet, _i, _len, _ref13, _results;

        _this.clearFeatures();
        dedupedTweets = {};
        _ref13 = data.results.slice(-_this.maxTweets);
        for (i = _i = 0, _len = _ref13.length; _i < _len; i = ++_i) {
          t = _ref13[i];
          dedupedTweets["" + (parseFloat(t.lat).toFixed(4)) + "/" + (parseFloat(t.lon).toFixed(4))] = t;
        }
        _results = [];
        for (k in dedupedTweets) {
          if (!__hasProp.call(dedupedTweets, k)) continue;
          t = dedupedTweets[k];
          lat = parseFloat(t.lat);
          lon = parseFloat(t.lon);
          if (isNaN(lat) || isNaN(lon)) {
            continue;
          }
          tweet = new Tweet("tweet-" + t.twitterID, lat, lon);
          tweet.name = "" + t.name + " — " + (t.dateT.match(/\d?\d:\d\d/));
          tweet.desc = t.twitterPost.replace(/&gt;/g, '>').replace(/&lt;/g, '<').match(/.{1,35}(\s|$)|\S+?(\s|$)/g).join('\n').replace(/\n+/g, '\n');
          _results.push(_this.addFeature(tweet));
        }
        return _results;
      });
      self = arguments.callee.bind(this);
      return setTimeout(self, 5 * 60 * 1000);
    };

    return LondonTweetSet;

  })(FeatureSet);

  this.Tweet = (function(_super) {
    __extends(Tweet, _super);

    function Tweet() {
      _ref13 = Tweet.__super__.constructor.apply(this, arguments);
      return _ref13;
    }

    Tweet.prototype.alt = 160;

    Tweet.prototype.nameTextOpts = {
      size: 1
    };

    Tweet.prototype.descTextOpts = {
      size: 1,
      lineWidth: 1
    };

    return Tweet;

  })(Feature);

  this.LondonAirSet = (function(_super) {
    __extends(LondonAirSet, _super);

    function LondonAirSet(featureManager) {
      LondonAirSet.__super__.constructor.call(this, featureManager);
      this.update();
    }

    LondonAirSet.prototype.update = function() {
      var self,
        _this = this;

      load({
        url: 'http://www.citydashboard.org/modules/airquality.php?city=london&format=csv'
      }, function(csv) {
        var a, cells, desc, headers, line, lines, metadata, no2desc, no2ugm3, o3desc, o3ugm3, pm10desc, pm10ugm3, _i, _len, _results;

        _this.clearFeatures();
        lines = csv.split('\n');
        metadata = lines.shift();
        headers = lines.shift();
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          cells = line.split(',');
          if (cells.length < 10) {
            continue;
          }
          a = new LondonAir("air-" + cells[0], parseFloat(cells[3]), parseFloat(cells[4]));
          a.name = cells[1];
          desc = '';
          pm10ugm3 = cells[21];
          if (pm10ugm3 !== '') {
            pm10desc = cells[23];
            desc += "PM10:\t" + pm10ugm3 + " μg/m³ (" + pm10desc + ")\n";
          }
          no2ugm3 = cells[9];
          if (no2ugm3 !== '') {
            no2desc = cells[11];
            desc += "NO₂:\t" + no2ugm3 + " μg/m³ (" + no2desc + ")\n";
          }
          o3ugm3 = cells[5];
          if (o3ugm3 !== '') {
            o3desc = cells[7];
            desc += "O₃: \t" + o3ugm3 + " μg/m³ (" + o3desc + ")\n";
          }
          a.desc = desc;
          _results.push(_this.addFeature(a));
        }
        return _results;
      });
      self = arguments.callee.bind(this);
      return setTimeout(self, 10 * 60 * 1000);
    };

    return LondonAirSet;

  })(FeatureSet);

  this.LondonAir = (function(_super) {
    __extends(LondonAir, _super);

    function LondonAir() {
      _ref14 = LondonAir.__super__.constructor.apply(this, arguments);
      return _ref14;
    }

    LondonAir.prototype.alt = 180;

    LondonAir.prototype.nameTextOpts = {
      size: 2
    };

    LondonAir.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    return LondonAir;

  })(Feature);

  this.LondonTrafficSet = (function(_super) {
    __extends(LondonTrafficSet, _super);

    function LondonTrafficSet(featureManager) {
      LondonTrafficSet.__super__.constructor.call(this, featureManager);
      this.update();
    }

    LondonTrafficSet.prototype.update = function() {
      var self,
        _this = this;

      load({
        url: 'http://www.citydashboard.org/modules/roadsigns.php?city=london&format=csv'
      }, function(csv) {
        var a, cells, headers, line, lines, metadata, s, _i, _len, _results;

        _this.clearFeatures();
        lines = csv.split('\n');
        metadata = lines.shift();
        headers = lines.shift();
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          cells = line.split(',');
          if (cells.length < 5) {
            continue;
          }
          a = new LondonTraffic("trf-" + cells[0], parseFloat(cells[3]), parseFloat(cells[4]));
          a.name = cells[11];
          a.desc = ((function() {
            var _j, _len1, _ref15, _results1;

            _ref15 = cells.slice(5, 9);
            _results1 = [];
            for (_j = 0, _len1 = _ref15.length; _j < _len1; _j++) {
              s = _ref15[_j];
              _results1.push(s.match(/^\s*(.*?)\s*$/)[1]);
            }
            return _results1;
          })()).join('\n');
          _results.push(_this.addFeature(a));
        }
        return _results;
      });
      self = arguments.callee.bind(this);
      return setTimeout(self, 3 * 60 * 1000);
    };

    return LondonTrafficSet;

  })(FeatureSet);

  this.LondonTraffic = (function(_super) {
    __extends(LondonTraffic, _super);

    function LondonTraffic() {
      _ref15 = LondonTraffic.__super__.constructor.apply(this, arguments);
      return _ref15;
    }

    LondonTraffic.prototype.alt = 150;

    LondonTraffic.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 2
    };

    LondonTraffic.prototype.descTextOpts = {
      size: 2,
      lineWidth: 1
    };

    return LondonTraffic;

  })(Feature);

  this.TideGaugeSet = (function(_super) {
    __extends(TideGaugeSet, _super);

    function TideGaugeSet(featureManager) {
      TideGaugeSet.__super__.constructor.call(this, featureManager);
      this.update();
    }

    TideGaugeSet.prototype.update = function() {
      var self,
        _this = this;

      load({
        url: 'http://www.citydashboard.org/modules/tide.php?city=london&format=csv'
      }, function(csv) {
        var a, cells, headers, line, lines, metadata, _i, _len, _results;

        _this.clearFeatures();
        lines = csv.split('\n');
        metadata = lines.shift();
        headers = lines.shift();
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          cells = line.split(',');
          if (cells.length < 3) {
            continue;
          }
          a = new TideGauge("tide-" + cells[0], parseFloat(cells[3]), parseFloat(cells[4]));
          a.name = cells[1];
          a.desc = "Height:\t" + cells[5] + "m\nSurge:\t" + cells[6] + "m";
          _results.push(_this.addFeature(a));
        }
        return _results;
      });
      self = arguments.callee.bind(this);
      return setTimeout(self, 3 * 60 * 1000);
    };

    return TideGaugeSet;

  })(FeatureSet);

  this.TideGauge = (function(_super) {
    __extends(TideGauge, _super);

    function TideGauge() {
      _ref16 = TideGauge.__super__.constructor.apply(this, arguments);
      return _ref16;
    }

    TideGauge.prototype.alt = 80;

    TideGauge.prototype.nameTextOpts = {
      size: 2,
      lineWidth: 3
    };

    TideGauge.prototype.descTextOpts = {
      size: 2,
      lineWidth: 2
    };

    return TideGauge;

  })(Feature);

  this.OlympicSet = (function(_super) {
    __extends(OlympicSet, _super);

    function OlympicSet(featureManager) {
      var code, date, day, desc, end, lat, lon, name, row, sport, start, t1, t2, times, venue, _base, _i, _j, _len, _len1, _ref17, _ref18, _ref19, _ref20, _ref21, _ref22;

      OlympicSet.__super__.constructor.call(this, featureManager);
      this.venues = [];
      this.events = {};
      _ref17 = this.venueData.split("\n");
      for (_i = 0, _len = _ref17.length; _i < _len; _i++) {
        row = _ref17[_i];
        _ref18 = row.split("\t"), lat = _ref18[0], lon = _ref18[1], name = _ref18[2];
        if (name === 'Multiple Venues' || name === 'Olympic Park') {
          continue;
        }
        this.venues.push({
          name: name,
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        });
      }
      _ref19 = this.eventData.split("\n");
      for (_j = 0, _len1 = _ref19.length; _j < _len1; _j++) {
        row = _ref19[_j];
        _ref20 = row.split("\t"), day = _ref20[0], date = _ref20[1], times = _ref20[2], sport = _ref20[3], desc = _ref20[4], code = _ref20[5], venue = _ref20[6];
        _ref21 = times.split("-"), t1 = _ref21[0], t2 = _ref21[1];
        start = new Date("" + date + " " + t1);
        end = new Date("" + date + " " + t2);
        if ((_ref22 = (_base = this.events)[venue]) == null) {
          _base[venue] = [];
        }
        this.events[venue].push({
          start: start,
          end: end,
          sport: sport,
          desc: desc
        });
      }
      this.update();
    }

    OlympicSet.prototype.update = function() {
      var a, event, i, nextEvent, now, self, venue, _i, _j, _len, _len1, _ref17, _ref18, _ref19, _ref20;

      this.clearFeatures();
      _ref17 = this.venues;
      for (i = _i = 0, _len = _ref17.length; _i < _len; i = ++_i) {
        venue = _ref17[i];
        a = new OlympicVenue("oly-" + venue.name, venue.lat, venue.lon);
        a.name = "\uF003 " + venue.name;
        a.alt += (i % 5) * 30;
        if ((_ref18 = venue.name) !== 'Orbit') {
          now = new Date();
          nextEvent = null;
          _ref20 = (_ref19 = this.events[venue.name]) != null ? _ref19 : [];
          for (_j = 0, _len1 = _ref20.length; _j < _len1; _j++) {
            event = _ref20[_j];
            if (event.end > now) {
              nextEvent = event;
              break;
            }
          }
          if (nextEvent != null) {
            a.desc = nextEvent.start < now ? "Now: " + nextEvent.sport : "Next event: " + nextEvent.sport + ", " + (nextEvent.start.strftime("%a %d %b, %H:%M"));
          }
        }
        this.addFeature(a);
      }
      self = arguments.callee.bind(this);
      return setTimeout(self, 7 * 60 * 1000);
    };

    return OlympicSet;

  })(FeatureSet);

  this.OlympicVenue = (function(_super) {
    __extends(OlympicVenue, _super);

    function OlympicVenue() {
      _ref17 = OlympicVenue.__super__.constructor.apply(this, arguments);
      return _ref17;
    }

    OlympicVenue.prototype.alt = 120;

    OlympicVenue.prototype.nameTextOpts = {
      size: 3,
      lineWidth: 3
    };

    OlympicVenue.prototype.descTextOpts = {
      size: 2,
      lineWidth: 2
    };

    return OlympicVenue;

  })(Feature);

}).call(this);

/*
//@ sourceMappingURL=pigeon_features.map
*/
