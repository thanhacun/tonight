'use strict';

angular.module('tonightApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth, deviceDetector) {
    //using ng-devive-detector to detect client device to generate proper bar url: mobile or not
    $scope.device = deviceDetector.device;
    $scope.awesomeThings = [];
    $scope.businesses = [];
    $scope.location = $scope.location || 'Boston';

    $scope.getThing = function() {
      var apiUrl = '/api/things';
      if ($scope.location) {
        apiUrl = apiUrl + '/' + $scope.location;
      }
      $http.get(apiUrl).success(function(awesomeThings) {
        $scope.region = awesomeThings.region;
        $scope.businesses = awesomeThings.businesses;
        console.log(JSON.stringify(awesomeThings.businesses[0]));
        //socket.syncUpdates('thing', $scope.awesomeThings);
      });
    };

    $scope.getThing();
    $scope.toggleJoin = function(biz){
      //check user log in

      //initiate bar data
      var bar = {bar_id: biz.id, users: biz.users || []};
      //get user ids
      var user_ids = biz.users.map(function(user){
        return user._id;
      });

      if (biz.users.length === 0) {
        //bar NOT exist on database -- add new bar
        bar.users.push({_id: Auth.getCurrentUser()._id});
        $http.post('/api/things', bar);
      } else {
        //update bar
        //user NOT yet join
        if (user_ids.indexOf(Auth.getCurrentUser()._id) === -1) {
          bar.users.push({_id: Auth.getCurrentUser()._id});
        } else {
          //user already join
          bar.users.splice(user_ids.indexOf(Auth.getCurrentUser()._id), 1);
        }
        $http.put('/api/things/' + biz.id, bar)
      }
    };

    $scope.joinClass = function(biz) {
      //return true if current user already join
      //console.log(biz.users);
      biz.users.reduce(function(a, c){
        if (!a) {
          console.log(c === Auth.getCurrentUser()._id);
          return c === Auth.getCurrentUser()._id;
        }
        return true;
      }, false);
    };

    $scope.addThing = function(biz) {
      $http.post('/api/things', biz).success(function(addedBiz){
        console.log(addedBiz);
      });
      //$scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
