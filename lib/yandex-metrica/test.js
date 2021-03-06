
var Analytics = require('analytics.js').constructor;
var integration = require('analytics.js-integration');
var tester = require('analytics.js-integration-tester');
var tick = require('next-tick');
var plugin = require('./');
var sandbox = require('clear-env');

describe('Yandex', function(){
  var Yandex = plugin;
  var yandex;
  var analytics;
  var options = {
    counterId: 22522351
  };

  beforeEach(function(){
    analytics = new Analytics;
    yandex = new Yandex(options);
    analytics.use(plugin);
    analytics.use(tester);
    analytics.add(yandex);
    window['yaCounter' + options.counterId] = undefined;
  });

  afterEach(function(){
    analytics.restore();
    analytics.reset();
    yandex.reset();
    sandbox();
  });

  it('should have the right settings', function(){
    analytics.compare(Yandex, integration('Yandex Metrica')
      .assumesPageview()
      .global('yandex_metrika_callbacks')
      .global('Ya')
      .option('counterId', null));
  });

  describe('before loading', function(){
    beforeEach(function(){
      analytics.stub(yandex, 'load');
    });

    describe('#initialize', function(){
      it('should push onto the yandex_metrica_callbacks', function(){
        analytics.assert(!window.yandex_metrika_callbacks);
        analytics.initialize();
        analytics.page();
        analytics.assert(window.yandex_metrika_callbacks.length === 1);
      });

      it('should call #load', function(){
        analytics.initialize();
        analytics.page();
        analytics.called(yandex.load);
      });
    });
  });

  describe('loading', function(){
    it('should load', function(done){
      analytics.load(yandex, done);
    });
  });

  describe('after loading', function(){
    beforeEach(function(done){
      analytics.once('ready', done);
      analytics.initialize();
      analytics.page();
    });
    
    it('should create a yaCounter object', function(){
      tick(function(){
        analytics.assert(window['yaCounter' + yandex.options.counterId]);
      });
    });
  });
});