// Generated by CoffeeScript 1.12.7
(function() {
  var base, base1, jinja_globals,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.jinja_globals = ['md5', 'quote_chinese', 'utf8', 'unicode', 'timestamp', 'random', 'date_time', 'is_num', 'add', 'sub', 'multiply', 'divide', 'Faker', 'dict', 'lipsum'];

  jinja_globals = window.jinja_globals;

  if ((base = Array.prototype).some == null) {
    base.some = function(f) {
      var j, len, ref, x;
      ref = this;
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        if (f(x)) {
          return true;
        }
      }
      return false;
    };
  }

  if ((base1 = Array.prototype).every == null) {
    base1.every = function(f) {
      var j, len, ref, x;
      ref = this;
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        if (!f(x)) {
          return false;
        }
      }
      return true;
    };
  }

  define(function(require, exports, module) {
    var analyze_cookies, containSpecial, headers, mime_type, post_data, replace_variables, rm_content, sort, utils, xhr;
    utils = require('/static/components/utils');
    containSpecial = RegExp(/[(\ )(\~)(\!)(\@)(\#)(\$)(\%)(\^)(\&)(\*)(\()(\))(\-)(\+)(\=)(\[)(\])(\{)(\})(\|)(\\)(\;)(\:)(\')(\")(\,)(\.)(\/)(\<)(\>)(\?)(\)]+/);
    xhr = function(har) {
      var entry, h, j, len, ref;
      ref = har.log.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        if (((function() {
          var l, len1, ref1, results;
          ref1 = entry.request.headers;
          results = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            h = ref1[l];
            if (h.name === 'X-Requested-With' && h.value === 'XMLHttpRequest') {
              results.push(h);
            }
          }
          return results;
        })()).length > 0) {
          entry.filter_xhr = true;
        }
      }
      return har;
    };
    mime_type = function(har) {
      var entry, j, len, mt, ref, ref1, ref2;
      ref = har.log.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        mt = (ref1 = entry.response) != null ? (ref2 = ref1.content) != null ? ref2.mimeType : void 0 : void 0;
        entry.filter_mimeType = (function() {
          switch (false) {
            case !!mt:
              return 'other';
            case mt.indexOf('audio') !== 0:
              return 'media';
            case mt.indexOf('image') !== 0:
              return 'image';
            case mt.indexOf('javascript') === -1:
              return 'javascript';
            case mt !== 'text/html':
              return 'document';
            case mt !== 'text/css' && mt !== 'application/x-pointplus':
              return 'style';
            case mt.indexOf('application') !== 0:
              return 'media';
            default:
              return 'other';
          }
        })();
      }
      return har;
    };
    analyze_cookies = function(har) {
      var cookie, cookie_jar, cookies, entry, error, h, header, j, l, len, len1, len2, len3, n, o, ref, ref1, ref2, ref3;
      cookie_jar = new utils.CookieJar();
      ref = har.log.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        cookies = {};
        ref1 = cookie_jar.getCookiesSync(entry.request.url, {
          now: new Date(entry.startedDateTime)
        });
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          cookie = ref1[l];
          cookies[cookie.key] = cookie.value;
        }
        ref2 = entry.request.cookies;
        for (n = 0, len2 = ref2.length; n < len2; n++) {
          cookie = ref2[n];
          cookie.checked = false;
          if (cookie.name in cookies) {
            if (cookie.value === cookies[cookie.name]) {
              cookie.from_session = true;
              entry.filter_from_session = true;
            } else {
              cookie.cookie_changed = true;
              entry.filter_cookie_changed = true;
            }
          } else {
            cookie.cookie_added = true;
            entry.filter_cookie_added = true;
          }
        }
        ref3 = (function() {
          var len3, p, ref3, ref4, results;
          ref4 = (ref3 = entry.response) != null ? ref3.headers : void 0;
          results = [];
          for (p = 0, len3 = ref4.length; p < len3; p++) {
            h = ref4[p];
            if (h.name.toLowerCase() === 'set-cookie') {
              results.push(h);
            }
          }
          return results;
        })();
        for (o = 0, len3 = ref3.length; o < len3; o++) {
          header = ref3[o];
          entry.filter_set_cookie = true;
          try {
            cookie_jar.setCookieSync(header.value, entry.request.url, {
              now: new Date(entry.startedDateTime)
            });
          } catch (error1) {
            error = error1;
            console.error(error);
          }
        }
      }
      return har;
    };
    sort = function(har) {
      har.log.entries = har.log.entries.sort(function(a, b) {
        if (a.pageref > b.pageref) {
          return 1;
        } else if (a.pageref < b.pageref) {
          return -1;
        } else if (a.startedDateTime > b.startedDateTime) {
          return 1;
        } else if (a.startedDateTime < b.startedDateTime) {
          return -1;
        } else {
          return 0;
        }
      });
      return har;
    };
    headers = function(har) {
      var entry, header, i, j, l, len, len1, ref, ref1, ref2, to_remove_headers;
      to_remove_headers = ['x-devtools-emulate-network-conditions-client-id', 'cookie', 'host', 'content-length'];
      ref = har.log.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        ref1 = entry.request.headers;
        for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
          header = ref1[i];
          if (ref2 = header.name.toLowerCase(), indexOf.call(to_remove_headers, ref2) < 0) {
            header.checked = true;
          } else {
            header.checked = false;
          }
        }
      }
      return har;
    };
    post_data = function(har) {
      var entry, error, j, key, len, ref, ref1, ref2, ref3, ref4, result, value;
      ref = har.log.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        if (!((ref1 = entry.request.postData) != null ? ref1.text : void 0)) {
          continue;
        }
        if (!(((ref2 = entry.request.postData) != null ? (ref3 = ref2.mimeType) != null ? ref3.toLowerCase().indexOf("application/x-www-form-urlencoded") : void 0 : void 0) === 0)) {
          entry.request.postData.params = void 0;
          continue;
        }
        result = [];
        try {
          ref4 = utils.querystring_parse(entry.request.postData.text);
          for (key in ref4) {
            value = ref4[key];
            result.push({
              name: key,
              value: value
            });
          }
          entry.request.postData.params = result;
        } catch (error1) {
          error = error1;
          console.error(error);
          entry.request.postData.params = void 0;
          continue;
        }
      }
      return har;
    };
    replace_variables = function(har, variables) {
      var changed, each, entry, error, j, k, key, l, len, len1, len2, n, obj, query, ref, ref1, ref2, ref3, ref4, url, v, value, variables_vk;
      variables_vk = {};
      for (k in variables) {
        v = variables[k];
        if ((k != null ? k.length : void 0) && (v != null ? v.length : void 0)) {
          variables_vk[v] = k;
        }
      }
      ref = har.log.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        try {
          url = utils.url_parse(entry.request.url, true);
        } catch (error1) {
          error = error1;
          continue;
        }
        changed = false;
        ref1 = url.query;
        for (key in ref1) {
          value = ref1[key];
          if (value in variables_vk) {
            url.query[key] = "{{ " + variables_vk[value] + " }}";
            changed = true;
          }
        }
        if (changed) {
          query = utils.querystring_unparse_with_variables(url.query);
          if (query) {
            url.search = "?" + query;
          }
        }
        entry.request.url = utils.url_unparse(url);
        entry.request.queryString = utils.dict2list(url.query);
        ref2 = har.log.entries;
        for (l = 0, len1 = ref2.length; l < len1; l++) {
          entry = ref2[l];
          if (((ref3 = entry.request.postData) != null ? ref3.params : void 0) == null) {
            continue;
          }
          changed = false;
          ref4 = entry.request.postData.params;
          for (n = 0, len2 = ref4.length; n < len2; n++) {
            each = ref4[n];
            if (each.value in variables_vk) {
              each.value = "{{ " + variables_vk[each.value] + " }}";
              changed = true;
            }
          }
          if (changed) {
            obj = utils.list2dict(entry.request.postData.params);
            entry.request.postData.text = utils.querystring_unparse_with_variables(obj);
          }
        }
      }
      return har;
    };
    rm_content = function(har) {
      var entry, j, len, ref, ref1, ref2, ref3;
      ref = har.log.entries;
      for (j = 0, len = ref.length; j < len; j++) {
        entry = ref[j];
        if (((ref1 = entry.response) != null ? (ref2 = ref1.content) != null ? ref2.text : void 0 : void 0) != null) {
          if ((ref3 = entry.response) != null) {
            ref3.content.text = void 0;
          }
        }
      }
      return har;
    };
    exports = {
      analyze: function(har, variables) {
        if (variables == null) {
          variables = {};
        }
        if (har.log) {
          return replace_variables(xhr(mime_type(analyze_cookies(headers(sort(post_data(rm_content(har))))))), variables);
        } else {
          return har;
        }
      },
      recommend_default: function(har) {
        var domain, entry, j, len, ref, ref1, ref2, ref3, ref4, ref5;
        domain = null;
        ref = har.log.entries;
        for (j = 0, len = ref.length; j < len; j++) {
          entry = ref[j];
          if (!domain) {
            domain = utils.get_domain(entry.request.url);
          }
          if (exports.variables_in_entry(entry).length > 0) {
            entry.recommend = true;
          } else if (domain !== utils.get_domain(entry.request.url)) {
            entry.recommend = false;
          } else if ((ref1 = (ref2 = entry.response) != null ? ref2.status : void 0) === 304 || ref1 === 0) {
            entry.recommend = false;
          } else if (Math.floor(((ref3 = entry.response) != null ? ref3.status : void 0) / 100) === 3) {
            entry.recommend = true;
          } else if (((ref4 = entry.response) != null ? (ref5 = ref4.cookies) != null ? ref5.length : void 0 : void 0) > 0) {
            entry.recommend = true;
          } else if (entry.request.method === 'POST') {
            entry.recommend = true;
          } else {
            entry.recommend = false;
          }
        }
        return har;
      },
      recommend: function(har) {
        var _related_cookies, c, checked, cookie, e, entry, j, l, len, len1, len2, len3, n, o, p, ref, ref1, ref2, ref3, ref4, related_cookies, set_cookie, start_time, started;
        ref = har.log.entries;
        for (j = 0, len = ref.length; j < len; j++) {
          entry = ref[j];
          entry.recommend = entry.checked ? true : false;
        }
        checked = (function() {
          var l, len1, ref1, results;
          ref1 = har.log.entries;
          results = [];
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            e = ref1[l];
            if (e.checked) {
              results.push(e);
            }
          }
          return results;
        })();
        if (checked.length === 0) {
          return exports.recommend_default(har);
        }
        related_cookies = [];
        for (l = 0, len1 = checked.length; l < len1; l++) {
          entry = checked[l];
          ref1 = entry.request.cookies;
          for (n = 0, len2 = ref1.length; n < len2; n++) {
            cookie = ref1[n];
            related_cookies.push(cookie.name);
          }
        }
        started = false;
        ref2 = har.log.entries;
        for (o = ref2.length - 1; o >= 0; o += -1) {
          entry = ref2[o];
          if (!started) {
            started = entry.checked;
          }
          if (!started) {
            continue;
          }
          if (!((ref3 = entry.response) != null ? ref3.cookies : void 0)) {
            continue;
          }
          start_time = new Date(entry.startedDateTime);
          set_cookie = (function() {
            var len3, p, ref4, ref5, results;
            ref5 = (ref4 = entry.response) != null ? ref4.cookies : void 0;
            results = [];
            for (p = 0, len3 = ref5.length; p < len3; p++) {
              cookie = ref5[p];
              if (!cookie.expires || (new Date(cookie.expires)) > start_time) {
                results.push(cookie.name);
              }
            }
            return results;
          })();
          _related_cookies = (function() {
            var len3, p, results;
            results = [];
            for (p = 0, len3 = related_cookies.length; p < len3; p++) {
              c = related_cookies[p];
              if (indexOf.call(set_cookie, c) < 0) {
                results.push(c);
              }
            }
            return results;
          })();
          if (related_cookies.length > _related_cookies.length) {
            entry.recommend = true;
            related_cookies = _related_cookies;
            ref4 = entry.request.cookies;
            for (p = 0, len3 = ref4.length; p < len3; p++) {
              cookie = ref4[p];
              related_cookies.push(cookie.name);
            }
          }
        }
        return har;
      },
      variables: function(string) {
        var j, len, list_tmp, list_tmp_v, m, re, tmp, tmp1, tmp_v, variables_results;
        re = /{{\s*([\w]+)[^}]*?\s*}}/g;
        variables_results = [];
        while (m = re.exec(string)) {
          if (jQuery.inArray(m[1], jinja_globals) < 0) {
            variables_results.push(m[1]);
          } else {
            tmp = /{{\s*\w+\s*\((.*)\)[^}]*?\s*}}/;
            tmp = tmp.exec(m[0]);
            if ((tmp != null ? tmp.length : void 0) > 1) {
              list_tmp = tmp[1].split(",");
              for (j = 0, len = list_tmp.length; j < len; j++) {
                list_tmp_v = list_tmp[j];
                tmp1 = /(^[^\d\"\'][\w]+).*?/;
                tmp_v = tmp1.exec(list_tmp_v);
                if ((tmp_v != null) && !containSpecial.test(tmp_v[1]) && jQuery.inArray(tmp_v[1], jinja_globals) < 0) {
                  variables_results.push(tmp_v[1]);
                }
              }
            }
          }
        }
        return variables_results;
      },
      variables_in_entry: function(entry) {
        var c, h, ref, result;
        result = [];
        [
          [entry.request.url], (function() {
            var j, len, ref, results;
            ref = entry.request.headers;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              h = ref[j];
              if (h.checked) {
                results.push(h.name);
              }
            }
            return results;
          })(), (function() {
            var j, len, ref, results;
            ref = entry.request.headers;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              h = ref[j];
              if (h.checked) {
                results.push(h.value);
              }
            }
            return results;
          })(), (function() {
            var j, len, ref, results;
            ref = entry.request.cookies;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              c = ref[j];
              if (c.checked) {
                results.push(c.name);
              }
            }
            return results;
          })(), (function() {
            var j, len, ref, results;
            ref = entry.request.cookies;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              c = ref[j];
              if (c.checked) {
                results.push(c.value);
              }
            }
            return results;
          })(), [(ref = entry.request.postData) != null ? ref.text : void 0]
        ].map(function(list) {
          var each, j, len, results, string;
          results = [];
          for (j = 0, len = list.length; j < len; j++) {
            string = list[j];
            results.push((function() {
              var l, len1, ref, ref1, results1;
              ref = exports.variables(string);
              results1 = [];
              for (l = 0, len1 = ref.length; l < len1; l++) {
                each = ref[l];
                if (ref1 = each != null, indexOf.call(result, ref1) < 0) {
                  results1.push(result.push(each));
                } else {
                  results1.push(void 0);
                }
              }
              return results1;
            })());
          }
          return results;
        });
        if (result.length > 0) {
          entry.filter_variables = true;
        } else {
          entry.filter_variables = false;
        }
        return result;
      },
      find_variables: function(har) {
        var each, entry, j, l, len, len1, ref, ref1, result;
        result = [];
        ref = har.log.entries;
        for (j = 0, len = ref.length; j < len; j++) {
          entry = ref[j];
          ref1 = this.variables_in_entry(entry);
          for (l = 0, len1 = ref1.length; l < len1; l++) {
            each = ref1[l];
            result.push(each);
          }
        }
        return result;
      }
    };
    return exports;
  });

}).call(this);
