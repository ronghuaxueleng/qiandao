// Generated by CoffeeScript 2.7.0
(function() {
  // vim: set et sw=2 ts=2 sts=2 ff=unix fenc=utf8:
  // Author: Binux<i@binux.me>
  //         http://binux.me
  // Created on 2014-08-06 21:12:48
  define(function(require, exports, module) {
    var analysis, remoteload, utils;
    analysis = require('/static/har/analysis');
    utils = require('/static/components/utils');
    remoteload = function() {
      var each, i, len, ref1;
      ref1 = [/\/har\/edit\/(\d+)/, /\/push\/\d+\/view/, /\/tpl\/\d+\/edit/];
      for (i = 0, len = ref1.length; i < len; i++) {
        each = ref1[i];
        if (location.pathname.match(each)) {
          return true;
        }
      }
      return false;
    };
    return angular.module('upload_ctrl', []).controller('UploadCtrl', function($scope, $rootScope, $http) {
      var data, element, reader;
      element = angular.element('#upload-har');
      element.modal('show').on('hide.bs.modal', function() {
        return $scope.is_loaded != null;
      });
      element.find('input[type=file]').on('change', function(ev) {
        return $scope.file = this.files[0];
      });
      if (utils.storage.get('har_har') != null) {
        $scope.local_har = utils.storage.get('har_filename');
      }
      $scope.alert = function(message) {
        return element.find('.alert-danger').text(message).show();
      };
      $scope.loaded = function(loaded) {
        $scope.is_loaded = true;
        $rootScope.$emit('har-loaded', loaded);
        angular.element('#upload-har').modal('hide');
        return true;
      };
      $scope.load_remote = function(url) {
        element.find('button').button('loading');
        return $http.post(url).then(function(res) {
          var config, data, headers, status;
          data = res.data;
          status = res.status;
          headers = res.headers;
          config = res.config;
          element.find('button').button('reset');
          return $scope.loaded(data);
        }, function(res) {
          var config, data, headers, status;
          data = res.data;
          status = res.status;
          headers = res.headers;
          config = res.config;
          $scope.alert(data);
          return element.find('button').button('reset');
        });
      };
      if (!$scope.local_har && remoteload()) {
        $scope.load_remote(location.href);
      }
      $scope.load_file = function(data) {
        var each, i, len, loaded, name, ref1, ref2;
        console.log(data);
        name = "";
        if (HARPATH !== "") {
          name = HARNAME;
        } else if (($scope.file == null) && ((ref1 = $scope.curl) != null ? ref1.length : void 0) > 0) {
          name = "curl2har";
        } else {
          name = $scope.file.name;
        }
        if (data.log) {
          loaded = {
            filename: name,
            har: analysis.analyze(data, {
              username: $scope.username,
              password: $scope.password
            }),
            upload: true
          };
        } else {
          loaded = {
            filename: name,
            har: utils.tpl2har(data),
            upload: true
          };
        }
        loaded.env = {};
        ref2 = analysis.find_variables(loaded.har);
        for (i = 0, len = ref2.length; i < len; i++) {
          each = ref2[i];
          loaded.env[each] = "";
        }
        console.log(analysis.find_variables(loaded.har));
        return $scope.loaded(loaded);
      };
      $scope.load_local_har = function() {
        var loaded;
        loaded = {
          filename: utils.storage.get('har_filename'),
          har: utils.storage.get('har_har'),
          env: utils.storage.get('har_env'),
          upload: true
        };
        return $scope.loaded(loaded);
      };
      $scope.delete_local = function() {
        utils.storage.del('har_har');
        utils.storage.del('har_env');
        utils.storage.del('har_filename');
        $scope.local_har = void 0;
        if (!$scope.local_har && remoteload()) {
          return $scope.load_remote(location.href);
        }
      };
      $scope.add_local = function() {
        var e, each, filename, har_file_upload, i, j, k, key, len, len1, len2, new_har, new_har_log_entry, old_har, reader, ref, ref1, ref2, ref3, target_har;
        if (($scope.file == null) && (((ref1 = $scope.curl) != null ? ref1.length : void 0) != null) > 0) {
          element.find('button').button('loading');
          old_har = {
            filename: utils.storage.get('har_filename'),
            har: utils.storage.get('har_har'),
            env: utils.storage.get('har_env'),
            upload: true
          };
          if (!old_har.har && typeof old_har.har !== "undefined" && old_har.har !== 0) {
            // if !old_har.har && typeof(old_har.har)!="undefined" && old_har.har != 0
            // 优先读取本地保存的，如果没有则读取全局的
            old_har = window.global_har;
          }
          try {
            har_file_upload = utils.curl2har($scope.curl);
          } catch (error1) {
            e = error1;
            console.error(e);
            $scope.alert('错误的 Curl 命令');
            return element.find('button').button('reset');
          }
          filename = "";
          if (HARPATH !== "") {
            filename = HARNAME;
          } else if (($scope.file == null) && (((ref2 = $scope.curl) != null ? ref2.length : void 0) != null) > 0) {
            filename = "curl2har";
          } else {
            filename = $scope.file.name;
          }
          new_har = {
            filename: filename,
            har: analysis.analyze(har_file_upload, {
              username: $scope.username,
              password: $scope.password
            }),
            upload: true
          };
          new_har.env = {};
          ref = analysis.find_variables(new_har.har);
          for (i = 0, len = ref.length; i < len; i++) {
            each = ref[i];
            new_har.env[each] = "";
          }
          if ($scope.is_loaded) {
            target_har = old_har;
            for (j = 0, len1 = new_har.length; j < len1; j++) {
              key = new_har[j];
              if (new_har.hasOwnProperty(key) === true) {
                target_har.env[key] = new_har.env[key];
              }
            }
            ref3 = new_har.har.log.entries;
            for (k = 0, len2 = ref3.length; k < len2; k++) {
              new_har_log_entry = ref3[k];
              target_har.har.log.entries.push(new_har_log_entry);
            }
          } else {
            target_har = new_har;
          }
          $scope.uploaded = true;
          $scope.loaded(target_har);
          return element.find('button').button('reset');
        }
        if ($scope.file == null) {
          $scope.alert('还没选择文件啊，亲');
          return false;
        }
        if ($scope.file.size > 50 * 1024 * 1024) {
          $scope.alert('文件大小超过50M');
          return false;
        }
        element.find('button').button('loading');
        reader = new FileReader();
        reader.onload = function(ev) {
          return $scope.$apply(function() {
            var l, len3, len4, len5, m, n, ref4;
            old_har = {
              filename: utils.storage.get('har_filename'),
              har: utils.storage.get('har_har'),
              env: utils.storage.get('har_env'),
              upload: true
            };
            if (!old_har.har && typeof old_har.har !== "undefined" && old_har.har !== 0) {
              // if !old_har.har && typeof(old_har.har)!="undefined" && old_har.har != 0
              // 优先读取本地保存的，如果没有则读取全局的
              old_har = window.global_har;
            }
            har_file_upload = angular.fromJson(ev.target.result);
            new_har = {};
            if (har_file_upload.log) {
              new_har = {
                filename: $scope.file.name,
                har: analysis.analyze(har_file_upload, {
                  username: $scope.username,
                  password: $scope.password
                }),
                upload: true
              };
            } else {
              new_har = {
                filename: $scope.file.name,
                har: utils.tpl2har(har_file_upload),
                upload: true
              };
            }
            new_har.env = {};
            ref = analysis.find_variables(new_har.har);
            for (l = 0, len3 = ref.length; l < len3; l++) {
              each = ref[l];
              new_har.env[each] = "";
            }
            if ($scope.is_loaded) {
              target_har = old_har;
              for (m = 0, len4 = new_har.length; m < len4; m++) {
                key = new_har[m];
                if (new_har.hasOwnProperty(key) === true) {
                  target_har.env[key] = new_har.env[key];
                }
              }
              ref4 = new_har.har.log.entries;
              for (n = 0, len5 = ref4.length; n < len5; n++) {
                new_har_log_entry = ref4[n];
                target_har.har.log.entries.push(new_har_log_entry);
              }
            } else {
              target_har = new_har;
            }
            $scope.uploaded = true;
            $scope.loaded(target_har);
            return element.find('button').button('reset');
          });
        };
        return reader.readAsText($scope.file);
      };
      if (HARDATA !== "") {
        element.find('button').button('loading');
        reader = new FileReader();
        data = Base64.decode(HARDATA); // 解码
        $scope.load_file(angular.fromJson(data));
        element.find('button').button('reset');
        return true;
      } else {
        return $scope.upload = function() {
          var error, ref1;
          if (($scope.file == null) && (((ref1 = $scope.curl) != null ? ref1.length : void 0) != null) > 0) {
            element.find('button').button('loading');
            try {
              $scope.load_file(utils.curl2har($scope.curl));
            } catch (error1) {
              error = error1;
              console.error(error);
              $scope.alert('错误的 Curl 命令');
            }
            return element.find('button').button('reset');
          }
          if ($scope.file == null) {
            $scope.alert('还没选择文件啊，亲');
            return false;
          }
          if ($scope.file.size > 50 * 1024 * 1024) {
            $scope.alert('文件大小超过50M');
            return false;
          }
          element.find('button').button('loading');
          reader = new FileReader();
          reader.onload = function(ev) {
            return $scope.$apply(function() {
              $scope.uploaded = true;
              try {
                $scope.load_file(angular.fromJson(ev.target.result));
              } catch (error1) {
                error = error1;
                console.error(error);
                $scope.alert('错误的 HAR 文件');
              }
              return element.find('button').button('reset');
            });
          };
          return reader.readAsText($scope.file);
        };
      }
    });
  });

}).call(this);
