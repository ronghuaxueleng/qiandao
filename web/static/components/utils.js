// Generated by CoffeeScript 2.7.0
(function() {
  // vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
  // Author: Binux<i@binux.me>
  //         http://binux.me
  // Created on 2014-08-03 07:42:45
  define(function(require) {
    var curl2har, exports, fix_encodeURIComponent, querystring, tough, url;
    require('/static/components/node_components');
    RegExp.escape = function(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    };
    url = node_url;
    tough = node_tough;
    querystring = node_querystring;
    curl2har = node_curl2har;
    fix_encodeURIComponent = function(obj) {
      return encodeURIComponent(obj).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase();
      });
    };
    exports = {
      cookie_parse: function(cookie_string) {
        var cookie, each, index, j, key, len, ref, value;
        cookie = {};
        ref = cookie_string != null ? cookie_string.split(';') : void 0;
        for (j = 0, len = ref.length; j < len; j++) {
          each = ref[j];
          index = each.indexOf('=');
          index = index < 0 ? each.length : index;
          key = each.slice(0, +index + 1 || 9e9);
          value = each.slice(index + 1);
          cookie[decodeURIComponent(key)] = decodeURIComponent(value);
        }
        return cookie;
      },
      cookie_unparse: function(cookie) {
        var key, value;
        return ((function() {
          var j, len, results;
          results = [];
          for (value = j = 0, len = cookie.length; j < len; value = ++j) {
            key = cookie[value];
            results.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
          }
          return results;
        })()).join(';');
      },
      url_parse: node_url.parse,
      url_unparse: node_url.format,
      path_unparse_with_variables: function(path) {
        var _path, key, m, re, replace_list, value;
        _path = decodeURIComponent(path);
        replace_list = {};
        re = /{{\s*([\w]+)[^}]*?\s*}}/g;
        while (m = re.exec(_path)) {
          replace_list[fix_encodeURIComponent(m[0])] = m[0];
        }
        for (key in replace_list) {
          value = replace_list[key];
          path = path.replace(new RegExp(RegExp.escape(key), 'g'), value);
        }
        return path;
      },
      querystring_parse: node_querystring.parse,
      querystring_unparse: node_querystring.stringify,
      querystring_unparse_with_variables: function(obj) {
        var key, m, query, re, replace_list, value;
        query = node_querystring.stringify(obj, {
          indices: false
        });
        replace_list = {};
        for (key in obj) {
          value = obj[key];
          re = /{{\s*([\w]+)[^}]*?\s*}}/g;
          while (m = re.exec(key)) {
            if (m[0].slice(-12) !== '|urlencode}}') {
              replace_list[fix_encodeURIComponent(m[0])] = m[0].slice(0, -2) + '|urlencode}}';
            } else {
              replace_list[fix_encodeURIComponent(m[0])] = m[0];
            }
          }
          re = /{{\s*([\w]+)[^}]*?\s*}}/g;
          while (m = re.exec(value)) {
            if (m[0].slice(-12) !== '|urlencode}}') {
              replace_list[fix_encodeURIComponent(m[0])] = m[0].slice(0, -2) + '|urlencode}}';
            } else {
              replace_list[fix_encodeURIComponent(m[0])] = m[0];
            }
          }
        }
        if (node_querystring.stringify(replace_list, {
          indices: false
        })) {
          console.log('The replace_list is', replace_list);
        }
        for (key in replace_list) {
          value = replace_list[key];
          query = query.replace(new RegExp(RegExp.escape(key), 'g'), value);
        }
        return query;
      },
      querystring_parse_with_variables: function(query) {
        var _query, key, m, re, replace_list, value;
        replace_list = {};
        re = /{{\s*([\w]+)[^}]*?\s*\|urlencode}}/g;
        _query = decodeURIComponent(query);
        while (m = re.exec(_query)) {
          replace_list[encodeURIComponent(m[0])] = m[0].slice(0, -12) + '}}';
        }
        for (key in replace_list) {
          value = replace_list[key];
          query = query.replace(new RegExp(RegExp.escape(key), 'g'), value);
        }
        return exports.querystring_parse(query);
      },
      CookieJar: node_tough.CookieJar,
      Cookie: node_tough.Cookie,
      dict2list: function(dict) {
        var k, results, v;
        results = [];
        for (k in dict) {
          v = dict[k];
          results.push({
            name: k,
            value: v
          });
        }
        return results;
      },
      list2dict: function(list) {
        var dict, each, j, len;
        dict = {};
        if (list) {
          for (j = 0, len = list.length; j < len; j++) {
            each = list[j];
            dict[each.name] = each.value;
          }
        }
        return dict;
      },
      get_public_suffix: node_tough.getPublicSuffix,
      get_domain: function(url) {
        return exports.get_public_suffix(exports.url_parse(url).hostname);
      },
      debounce: function(func, wait, immediate) {
        var timeout, timestamp;
        timestamp = 0;
        timeout = 0;
        return function() {
          var args, callNow, context, later, result;
          context = this;
          args = arguments;
          timestamp = new Date().getTime();
          later = function() {
            var last, result;
            last = (new Date().getTime()) - timestamp;
            if ((0 < last && last < wait)) {
              return timeout = setTimeout(later, wait - last);
            } else {
              timeout = null;
              if (!immediate) {
                result = func.apply(context, args);
                if (!timeout) {
                  return context = args = null;
                }
              }
            }
          };
          callNow = immediate && !timeout;
          if (!timeout) {
            timeout = setTimeout(later, wait);
          }
          if (callNow) {
            result = func.apply(context, args);
            context = args = null;
          }
          return result;
        };
      },
      storage: {
        set: function(key, value) {
          var error;
          if (window.localStorage == null) {
            return false;
          }
          try {
            return window.localStorage.setItem(key, angular.toJson(value));
          } catch (error1) {
            error = error1;
            return null;
          }
        },
        get: function(key) {
          var error;
          if (window.localStorage == null) {
            return null;
          }
          try {
            return angular.fromJson(window.localStorage.getItem(key));
          } catch (error1) {
            error = error1;
            return null;
          }
        },
        del: function(key) {
          var error;
          if (window.localStorage == null) {
            return false;
          }
          try {
            return window.localStorage.removeItem(key);
          } catch (error1) {
            error = error1;
            return null;
          }
        }
      },
      tpl2har: function(tpl) {
        var en, x;
        return {
          log: {
            creator: {
              name: 'binux',
              version: 'QD'
            },
            entries: (function() {
              var j, len, ref, ref1, ref2, results;
              results = [];
              for (j = 0, len = tpl.length; j < len; j++) {
                en = tpl[j];
                results.push({
                  comment: en.comment,
                  checked: true,
                  startedDateTime: (new Date()).toISOString(),
                  time: 1,
                  request: {
                    method: en.request.method,
                    url: en.request.url,
                    headers: (function() {
                      var l, len1, ref, results1;
                      ref = en.request.headers || [];
                      results1 = [];
                      for (l = 0, len1 = ref.length; l < len1; l++) {
                        x = ref[l];
                        results1.push({
                          name: x.name,
                          value: x.value,
                          checked: true
                        });
                      }
                      return results1;
                    })(),
                    queryString: [],
                    cookies: (function() {
                      var l, len1, ref, results1;
                      ref = en.request.cookies || [];
                      results1 = [];
                      for (l = 0, len1 = ref.length; l < len1; l++) {
                        x = ref[l];
                        results1.push({
                          name: x.name,
                          value: x.value,
                          checked: true
                        });
                      }
                      return results1;
                    })(),
                    headersSize: -1,
                    bodySize: en.request.data ? en.request.data.length : 0,
                    postData: {
                      mimeType: en.request.mimeType,
                      text: en.request.data
                    }
                  },
                  response: {},
                  cache: {},
                  timings: {},
                  connections: "0",
                  pageref: "page_0",
                  success_asserts: (ref = en.rule) != null ? ref.success_asserts : void 0,
                  failed_asserts: (ref1 = en.rule) != null ? ref1.failed_asserts : void 0,
                  extract_variables: (ref2 = en.rule) != null ? ref2.extract_variables : void 0
                });
              }
              return results;
            })(),
            pages: [],
            version: '1.2'
          }
        };
      },
      curl2har: function(curl) {
        var en, i, str_curl, tmp, x;
        if (((curl != null ? curl.length : void 0) != null) === 0) {
          console.error("Curl 命令为空");
        }
        str_curl = curl.split(/(?=curl )/g);
        tmp = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = str_curl.length; j < len; j++) {
            i = str_curl[j];
            results.push(curl2har(i));
          }
          return results;
        })();
        return {
          log: {
            creator: {
              name: 'curl',
              version: 'QD'
            },
            entries: (function() {
              var j, len, results;
              results = [];
              for (j = 0, len = tmp.length; j < len; j++) {
                en = tmp[j];
                if (en.status !== 'error') {
                  results.push({
                    comment: '',
                    checked: true,
                    startedDateTime: (new Date()).toISOString(),
                    time: 1,
                    request: {
                      method: en.data.method,
                      url: en.data.url,
                      headers: (function() {
                        var l, len1, ref, results1;
                        ref = en.data.headers || [];
                        results1 = [];
                        for (l = 0, len1 = ref.length; l < len1; l++) {
                          x = ref[l];
                          results1.push({
                            name: x.name,
                            value: x.value,
                            checked: true
                          });
                        }
                        return results1;
                      })(),
                      queryString: [],
                      cookies: (function() {
                        var l, len1, ref, results1;
                        ref = en.data.cookies || [];
                        results1 = [];
                        for (l = 0, len1 = ref.length; l < len1; l++) {
                          x = ref[l];
                          results1.push({
                            name: x.name,
                            value: x.value,
                            checked: true
                          });
                        }
                        return results1;
                      })(),
                      headersSize: -1,
                      bodySize: en.data.postData.text ? en.data.postData.text.length : 0,
                      postData: en.data.postData || {}
                    },
                    response: {},
                    cache: {},
                    timings: {},
                    connections: "0",
                    pageref: "page_0",
                    success_asserts: [],
                    failed_asserts: [],
                    extract_variables: []
                  });
                }
              }
              return results;
            })(),
            pages: [],
            version: '1.2'
          }
        };
      }
    };
    return exports;
  });

}).call(this);
