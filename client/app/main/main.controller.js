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
        console.log(JSON.stringify(awesomeThings));
        //socket.syncUpdates('thing', $scope.awesomeThings);
      });
    };

    $scope.getThing();
    $scope.toggleJoin = function(biz_id){
      //check user log in

      //check bar exist on database

      //create bar data

      //update bar's users data

      //decide to join or no join
      //add current user to join
      $http.post('/api/things', {
        bar_id: biz_id,
        users: [{_id: Auth.getCurrentUser()._id}]
      });

      //remove current out of joinn
      //$scope.delete('/api/things');
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
