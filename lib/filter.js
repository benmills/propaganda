(function() {
  var $, EventEmitter, Filter, ejs, pygmentize;
  ejs = require('ejs');
  $ = require('jquery');
  pygmentize = require('./pygmentize');
  EventEmitter = require('events').EventEmitter;
  Filter = (function() {
    function Filter() {}
    Filter.DONE = 'done';
    Filter.ejs = function(output) {
      var context;
      context = {
        content: output,
        stylesheet: this.css
      };
      return ejs.render(this.template, {
        locals: context
      });
    };
    Filter.header = function(output) {
      var b, blocksHtml, header, sel, _i, _len, _ref;
      if (!(this.options.headerSel != null)) {
        return output;
      }
      sel = this.options.headerSel;
      $('body').html('');
      $(output).appendTo('body');
      blocksHtml = '';
      header = '';
      $(sel).each(function() {
        return header += $(this).remove().clone().wrap('<div></div>').parent().html();
      });
      if (header.length) {
        if (this.options.blocks != null) {
          if (typeof this.options.blocks === 'string') {
            this.options.blocks = [this.options.blocks];
          }
          _ref = this.options.blocks;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            b = _ref[_i];
            blocksHtml += "<div>" + b + "</div>";
          }
        }
        $('div#main').before("<header><div class='center'>" + blocksHtml + header + "</div></header>");
        return $('body').html();
      } else {
        return output;
      }
    };
    Filter.footer = function(output) {
      var $elements, footer, i, length, sel, startIndex;
      if (!(this.options.footerSel != null)) {
        return output;
      }
      sel = this.options.footerSel;
      $('body').html('');
      $(output).appendTo('body');
      startIndex = $(sel).index();
      $elements = $('div#main').children();
      length = $elements.length;
      footer = '';
      for (i = startIndex; startIndex <= length ? i <= length : i >= length; startIndex <= length ? i++ : i--) {
        footer += $($elements[i]).remove().clone().wrap('<div></div>').parent().html();
      }
      if (footer.length) {
        $('div#main').after("<footer><div class='center'>" + footer + "</div></footer>");
        return $('body').html();
      } else {
        return output;
      }
    };
    Filter.highlight = function(output) {
      var $code, errors, finishHighlight, toColor, waiting;
      $('body').html('');
      $(output).appendTo('body');
      $code = $("code");
      toColor = $code.length;
      errors = '';
      waiting = new EventEmitter();
      finishHighlight = function() {
        if (toColor === 1) {
          return waiting.emit(Filter.DONE, $('body').html());
        } else {
          return toColor--;
        }
      };
      $code.each(function() {
        var $item;
        $item = $(this);
        return (function($item) {
          var lang, unescapedHtml;
          lang = $item.attr('class');
          if (lang.length > 0) {
            unescapedHtml = $("<div/>").html($item.html()).text();
            return pygmentize(unescapedHtml, $item.attr('class'), function(colorizeErrors, highlightedCode) {
              errors += colorizeErrors;
              $item.parent("pre").replaceWith(highlightedCode);
              return finishHighlight();
            });
          } else {
            return finishHighlight();
          }
        })($item);
      });
      return waiting;
    };
    return Filter;
  })();
  module.exports.Filter = Filter;
}).call(this);
