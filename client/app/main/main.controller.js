'use strict';

angular.module('tonightApp')
  .controller('MainCtrl', function ($scope, $http, socket, deviceDetector) {
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
        $scope.awesomeThings = awesomeThings;
        $scope.businesses = awesomeThings.businesses;
        //TODO: return only not close biz is_closed
        //socket.syncUpdates('thing', $scope.awesomeThings);
      });
    };

    $scope.getThing();

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
