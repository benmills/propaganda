(function() {
  var Filter, Propaganda, fs, less, markdown, p;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  markdown = require('robotskirt');
  less = require('less');
  fs = require('fs');
  p = console.log;
  Filter = require('./filter').Filter;
  Propaganda = (function() {
    function Propaganda(options, parsedCallback) {
      this.options = options;
      this.parsedCallback = parsedCallback;
      this.filters = [Filter.ejs, Filter.header, Filter.footer];
      this.file = fs.readFileSync(this.options.file).toString();
      this.stylesheet = fs.readFileSync(this.options.stylesheet).toString();
      this.template = fs.readFileSync(this.options.template).toString();
      this.output = '';
      this.errors = '';
      this.preParse(__bind(function() {
        this.applyFilters();
        return this.postParse(__bind(function() {
          return this.parsedCallback(this.errors, this.output);
        }, this));
      }, this));
    }
    Propaganda.prototype.preParse = function(callback) {
      return markdown.toHtml(this.file, __bind(function(html) {
        this.output = html.toString();
        return less.render(this.stylesheet, __bind(function(err, css) {
          this.css = css.toString();
          return callback();
        }, this));
      }, this));
    };
    Propaganda.prototype.postParse = function(callback) {
      var waiting;
      waiting = Filter.highlight.call(this, this.output);
      return waiting.on(Filter.DONE, __bind(function(output) {
        this.output = output;
        return callback();
      }, this));
    };
    Propaganda.prototype.applyFilters = function() {
      var filter, _i, _len, _ref, _results;
      _ref = this.filters;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        filter = _ref[_i];
        _results.push(this.output = filter.call(this, this.output));
      }
      return _results;
    };
    return Propaganda;
  })();
  module.exports = function(options, callback) {
    return new Propaganda(options, function(err, output) {
      return fs.writeFileSync('index.html', output);
    });
  };
}).call(this);
