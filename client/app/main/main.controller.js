'use strict';

angular.module('tonightApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth, deviceDetector) {
    //using ng-devive-detector to detect client device to generate proper bar url: mobile or not
    $scope.device = deviceDetector.device;
    //$scope.businesses = [];
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.isLoggedInAsync = Auth.isLoggedInAsync;
    $scope.barSearching = false;

    /**
     * request bars information based on location
     * should using isLoggedInAsync to get user info correctly
     */
    $scope.getThing = function() {
      Auth.isLoggedInAsync(function(userLogged) {
        //wait until user information available
        if (userLogged) {
          $scope.searchLocation = $scope.searchLocation || Auth.getCurrentUser().lastLocation;
          $scope.apiUrl = '/api/things/' + $scope.searchLocation;
        } else {
          $scope.apiUrl = '/api/things/' + ($scope.searchLocation || '');
        }
        //getting bar information
        //show spinner
        $scope.barSearching = true;
        $http.get($scope.apiUrl)
          .success(function(awesomeThings) {
            $scope.businesses = awesomeThings.businesses;
            //TODO: sync update thing and user location
            socket.syncUpdates('thing', $scope.businesses);
          })
          .finally(function() {
            //hide spinner
            $scope.barSearching = false;
          });
      })

    };

    $scope.getThing();

    /**
     * Handle joining going to the bar or not
     * bar create --> user add | user remove
     * user location update
     * @param biz
     */
    $scope.toggleJoin = function(biz){
      //initiate bar data for update/add new
      var bar = {bar_id: biz.id, users: [Auth.getCurrentUser()]};
      var userIndex = biz.users.indexOf(Auth.getCurrentUser()._id);
      if (userIndex !== -1) {
        //user already join, add 0 to the begining of the array for preparing remove
        bar.users.splice(0, 0, 0);

        //remove user from biz.users to update users count
        biz.users.splice(userIndex, 1);
      } else {
        //add user to biz.users to update users count
        biz.users.push(Auth.getCurrentUser()._id);
      }

      //update bar
      $http.put('/api/things/' + biz.id, bar).then(function() {
        //update user last location
        $http.put('/api/users/' + Auth.getCurrentUser()._id, {lastLocation: $scope.searchLocation});
      })

    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
  });
