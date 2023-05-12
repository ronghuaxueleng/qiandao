// Generated by CoffeeScript 2.7.0
(function() {
  // vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
  // Author: Binux<i@binux.me>
  //         http://binux.me
  // Created on 2014-08-06 21:14:54
  var indexOf = [].indexOf;

  define(function(require, exports, module) {
    var analysis, utils;
    analysis = require('/static/har/analysis');
    utils = require('/static/components/utils');
    return angular.module('entry_list', []).controller('EntryList', function($scope, $rootScope, $http) {
      var har2tpl;
      $scope.filter = {};
      // on uploaded event
      $rootScope.$on('har-loaded', function(ev, data) {
        var x;
        console.info(data);
        $scope.data = data;
        window.global_har = $scope.data;
        $scope.filename = data.filename;
        $scope.har = data.har;
        $scope.init_env = data.env;
        $scope.env = utils.dict2list(data.env);
        $scope.session = [];
        $scope.setting = data.setting;
        $scope.readonly = data.readonly || !HASUSER;
        $scope.is_check_all = false;
        $scope.update_checked_status();
        $scope.recommend();
        if (((function() {
          var i, len, ref, results;
          ref = $scope.har.log.entries;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            x = ref[i];
            if (x.recommend) {
              results.push(x);
            }
          }
          return results;
        })()).length > 0) {
          $scope.filter.recommend = true;
        }
        if (!$scope.readonly) {
          utils.storage.set('har_filename', $scope.filename);
          utils.storage.set('har_env', $scope.env);
          if (data.upload) {
            return utils.storage.set('har_har', $scope.har);
          } else {
            return utils.storage.del('har_har');
          }
        }
      });
      $scope.$on('har-change', function() {
        return $scope.save_change();
      });
      $scope.save_change_storage = utils.debounce((function() {
        if ($scope.filename && !$scope.readonly) {
          console.debug('local saved');
          resortEntryList();
          sortRequest($('#sortBtn')[0]);
          return utils.storage.set('har_har', $scope.har);
        }
      }), 1);
      $scope.save_change = function() {
        $scope.update_checked_status();
        return $scope.save_change_storage();
      };
      $scope.update_checked_status = utils.debounce((function() {
        var no_checked;
        no_checked = (function() {
          var e, i, len, ref;
          ref = $scope.har.log.entries;
          for (i = 0, len = ref.length; i < len; i++) {
            e = ref[i];
            if (!e.checked) {
              return e;
            }
          }
        })();
        $scope.is_check_all = no_checked === void 0;
        return $scope.$apply();
      }), 1);
      $scope.check_all = function() {
        var entry, i, len, ref;
        $scope.is_check_all = !$scope.is_check_all;
        ref = $scope.har.log.entries;
        for (i = 0, len = ref.length; i < len; i++) {
          entry = ref[i];
          if (entry.checked !== $scope.is_check_all) {
            entry.checked = $scope.is_check_all;
          }
        }
        return $scope.save_change_storage();
      };
      $scope.inverse = function() {
        var entry, i, len, ref;
        ref = $scope.har.log.entries;
        for (i = 0, len = ref.length; i < len; i++) {
          entry = ref[i];
          entry.checked = !entry.checked;
        }
        return $scope.save_change_storage();
      };
      $scope.status_label = function(status) {
        if (Math.floor(status / 100) === 2) {
          return 'label-success';
        } else if (Math.floor(status / 100) === 3) {
          return 'label-info';
        } else if (status === 0) {
          return 'label-danger';
        } else {
          return 'label-warning';
        }
      };
      $scope.variables_in_entry = analysis.variables_in_entry;
      $scope.badge_filter = function(update) {
        var filter, key, value;
        filter = angular.copy($scope.filter);
        for (key in update) {
          value = update[key];
          filter[key] = value;
        }
        return filter;
      };
      $scope.track_item = function() {
        $scope.filted = [];
        return function(item) {
          $scope.filted.push(item);
          return true;
        };
      };
      $scope.edit = function(entry) {
        $scope.$broadcast('edit-entry', entry);
        return false;
      };
      $scope.recommend = function() {
        return analysis.recommend($scope.har);
      };
      $scope.download = function() {
        $scope.pre_save();
        // tpl = btoa(unescape(encodeURIComponent(angular.toJson(har2tpl($scope.har)))))
        // angular.element('#download-har').attr('download', $scope.setting.sitename+'.har').attr('href', 'data:application/json;base64,'+tpl)
        $scope.export_add($scope.setting.sitename + '.har', decodeURIComponent(encodeURIComponent(angular.toJson(har2tpl($scope.har)))));
        return true;
      };
      $scope.ev_click = function(obj) {
        var ev;
        ev = document.createEvent("MouseEvents");
        ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        return obj.dispatchEvent(ev);
      };
      $scope.export_add = function(name, data) {
        var export_blob, save_link, urlObject;
        urlObject = window.URL || window.webkitURL || window;
        export_blob = new Blob([data], {
          type: "application/json"
        });
        save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = name;
        return $scope.ev_click(save_link);
      };
      $scope.pre_save = function() {
        var alert_elem, alert_info_elem, base, base1, base2, error, first_entry, parsed_url;
        alert_elem = angular.element('#save-har .alert-danger').hide();
        alert_info_elem = angular.element('#save-har .alert-info').hide();
        first_entry = (function() {
          var entry, i, len, ref, ref1, ref2, variables;
          ref = $scope.har.log.entries;
          for (i = 0, len = ref.length; i < len; i++) {
            entry = ref[i];
            if (!(entry.checked && ((ref1 = entry.request.url) != null ? ref1.indexOf('://') : void 0) !== -1 && ((ref2 = utils.url_parse(entry.request.url).protocol) != null ? ref2.indexOf('api:') : void 0) === -1)) {
              continue;
            }
            variables = analysis.variables_in_entry(entry);
            if (indexOf.call(variables, 'cookies') >= 0 || indexOf.call(variables, 'cookie') >= 0) {
              return entry;
            }
          }
        })();
        if (!first_entry) {
          if (first_entry == null) {
            first_entry = (function() {
              var entry, i, len, ref, ref1, ref2;
              ref = $scope.har.log.entries;
              for (i = 0, len = ref.length; i < len; i++) {
                entry = ref[i];
                if (entry.checked && ((ref1 = entry.request.url) != null ? ref1.indexOf('://') : void 0) !== -1 && ((ref2 = utils.url_parse(entry.request.url).protocol) != null ? ref2.indexOf('api:') : void 0) === -1) {
                  return entry;
                }
              }
            })();
          }
        }
        try {
          if ($scope.setting == null) {
            $scope.setting = {};
          }
          if ((base = $scope.setting).sitename == null) {
            base.sitename = first_entry && utils.get_domain(first_entry.request.url).split('.')[0];
          }
          parsed_url = first_entry && utils.url_parse(first_entry.request.url);
          if ((base1 = $scope.setting).siteurl == null) {
            base1.siteurl = parsed_url.protocol === 'https:' && `${parsed_url.protocol}//${parsed_url.host}` || parsed_url.host;
          }
          if (HARNOTE !== "") {
            if ((base2 = $scope.setting).note == null) {
              base2.note = HARNOTE.replaceAll("&lt;br&gt;", "\r\n");
            }
          }
        } catch (error1) {
          error = error1;
          return console.error(error);
        }
      };
      har2tpl = function(har) {
        var c, entry, h;
        return (function() {
          var i, len, ref, ref1, ref2, results;
          ref = har.log.entries;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            entry = ref[i];
            if (entry.checked) {
              results.push({
                comment: entry.comment,
                request: {
                  method: entry.request.method,
                  url: entry.request.url,
                  headers: (function() {
                    var j, len1, ref1, results1;
                    ref1 = entry.request.headers;
                    results1 = [];
                    for (j = 0, len1 = ref1.length; j < len1; j++) {
                      h = ref1[j];
                      if (h.checked) {
                        results1.push({
                          name: h.name,
                          value: h.value
                        });
                      }
                    }
                    return results1;
                  })(),
                  cookies: (function() {
                    var j, len1, ref1, results1;
                    ref1 = entry.request.cookies;
                    results1 = [];
                    for (j = 0, len1 = ref1.length; j < len1; j++) {
                      c = ref1[j];
                      if (c.checked) {
                        results1.push({
                          name: c.name,
                          value: c.value
                        });
                      }
                    }
                    return results1;
                  })(),
                  data: (ref1 = entry.request.postData) != null ? ref1.text : void 0,
                  mimeType: (ref2 = entry.request.postData) != null ? ref2.mimeType : void 0
                },
                rule: {
                  success_asserts: entry.success_asserts,
                  failed_asserts: entry.failed_asserts,
                  extract_variables: entry.extract_variables
                }
              });
            }
          }
          return results;
        })();
      };
      $scope.save = function() {
        var alert_elem, alert_info_elem, data, replace_text, save_btn;
        // 十六委托偷天修改，主要是HAR保存页面对自定义时间的支持
        $scope.setting.interval = angular.element('#jiange_second').val();
        // End
        data = {
          id: $scope.id,
          har: $scope.har,
          tpl: har2tpl($scope.har),
          setting: $scope.setting
        };
        save_btn = angular.element('#save-har .btn').button('loading');
        alert_elem = angular.element('#save-har .alert-danger').hide();
        alert_info_elem = angular.element('#save-har .alert-info').hide();
        replace_text = 'save?reponame=' + HARPATH + '&' + 'name=' + HARNAME;
        return $http.post(location.pathname.replace('edit', replace_text), data).then(function(res) {
          var config, headers, pathname, status;
          data = res.data;
          status = res.status;
          headers = res.headers;
          config = res.config;
          utils.storage.del('har_filename');
          utils.storage.del('har_har');
          utils.storage.del('har_env');
          save_btn.button('reset');
          pathname = `/tpl/${data.id}/edit`;
          if (pathname !== location.pathname) {
            location.pathname = pathname;
          }
          return alert_info_elem.text('保存成功').show();
        }, function(res) {
          var config, headers, status;
          data = res.data;
          status = res.status;
          headers = res.headers;
          config = res.config;
          alert_elem.text(data).show();
          return save_btn.button('reset');
        });
      };
      return $scope.test = function() {
        var btn, data, result;
        data = {
          env: {
            variables: utils.list2dict($scope.env),
            session: []
          },
          tpl: har2tpl($scope.har)
        };
        result = angular.element('#test-har .result').hide();
        btn = angular.element('#test-har .btn').button('loading');
        return $http.post('/tpl/run', data).then(function(res) {
          result.html(res.data).show();
          return btn.button('reset');
        }, function(res) {
          result.html('<h1 class="alert alert-danger text-center">运行失败</h1><div class="well"></div>').show().find('div').text(res.data);
          return btn.button('reset');
        });
      };
    });
  });

}).call(this);
