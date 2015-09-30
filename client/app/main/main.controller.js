'use strict';

angular.module('tonightApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth, deviceDetector) {
    //using ng-devive-detector to detect client device to generate proper bar url: mobile or not
    $scope.device = deviceDetector.device;
    $scope.awesomeThings = [];
    $scope.businesses = [];
    //$scope.location = $scope.location || 'Boston';

    $scope.getThing = function() {
      var apiUrl = '/api/things';
      if ($scope.location) {
        apiUrl = apiUrl + '/' + $scope.location;
      }
      $http.get(apiUrl).success(function(awesomeThings) {
        $scope.region = awesomeThings.region;
        $scope.businesses = awesomeThings.businesses;
        //console.log(JSON.stringify(awesomeThings.businesses));
        //socket.syncUpdates('thing', $scope.awesomeThings);
      });
    };

    $scope.getThing();
    $scope.toggleJoin = function(biz){
      //initiate bar data for update/add new
      var bar = {bar_id: biz.id, users: [Auth.getCurrentUser()]};
      //console.log(biz.users);
      if (biz.users.indexOf(Auth.getCurrentUser()._id) === -1) {
        //user NOT yet join
        //bar.users.push(Auth.getCurrentUser());
        $http.put('/api/things/' + biz.id, bar);
      } else {
        //user already join
        //add 0 to the begining of the array
        bar.users.splice(0, 0, 0)
        console.log(bar)
        $http.put('/api/things/' + biz.id, bar);
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
