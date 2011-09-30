(function() {
  var Filter, Propaganda, fs, less, p;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  less = require('less');
  fs = require('fs');
  p = console.log;
  Filter = require('./filter').Filter;
  Propaganda = (function() {
    function Propaganda(options, parsedCallback) {
      this.options = options;
      this.parsedCallback = parsedCallback;
      this.output = fs.readFileSync(this.options.file).toString();
      this.stylesheet = fs.readFileSync(this.options.stylesheet).toString();
      this.template = fs.readFileSync(this.options.template).toString();
      this.pygmentizeCmd = this.options.pygmentizeCmd || 'pygmentize';
      this.errors = '';
      this.preParse(__bind(function() {
        return this.applyFilters([Filter.markdown, Filter.ejs, Filter.header, Filter.footer, Filter.highlight], __bind(function() {
          return this.parsedCallback(this.errors, this.output);
        }, this));
      }, this));
    }
    Propaganda.prototype.preParse = function(callback) {
      return less.render(this.stylesheet, __bind(function(err, css) {
        this.css = css.toString();
        return callback();
      }, this));
    };
    Propaganda.prototype.applyFilters = function(filters, callback) {
      var result;
      if (filters.length === 0) {
        return callback();
      } else {
        result = filters.shift().call(this, this.output);
        if (typeof result === 'string') {
          this.output = result;
          return this.applyFilters(filters, callback);
        } else {
          return result.on(Filter.DONE, __bind(function(output) {
            this.output = output;
            return this.applyFilters(filters, callback);
          }, this));
        }
      }
    };
    return Propaganda;
  })();
  module.exports = function(options, callback) {
    return new Propaganda(options, function(err, output) {
      return fs.writeFileSync('index.html', output);
    });
  };
}).call(this);
