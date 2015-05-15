angular.module('getLostApp', ['ngMaterial']).
controller('MainCtrl', function($rootScope, $scope, $mdToast, $animate, $http, $timeout, $q, $log) {

  $scope.cities = $scope.cities || [];
  var self = this;
  self.simulateQuery = false;
  self.isDisabled    = false;
  self.states = [];
  // list of `state` value/display objects
  // self.states        = loadAll();
  loadAll();
  self.querySearch   = querySearch;
  self.selectedItemChange = selectedItemChange;
  self.searchTextChange   = searchTextChange;
  // ******************************
  // Internal methods
  // ******************************
  /**
   * Search for states... use $timeout to simulate
   * remote dataservice call.
   */
  function querySearch (query) {
    var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
        deferred;
    if (self.simulateQuery) {
      deferred = $q.defer();
      $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
      return deferred.promise;
    } else {
      return results;
    }
  }
  function searchTextChange(text) {
    $log.info('Text changed to ' + text);
  }
  function selectedItemChange(item) {
    $log.info('Item changed to ' + JSON.stringify(item));
  }
  /**
   * Build `states` list of key/value pairs
   */
  function loadAll() {

    $http.get('/api/v1/cities').success(function(data) {
      $scope.cities = (JSON.parse(data.info)).Cities;
      self.states =$scope.cities.map( function (state) {
        return {
          value: state.code,
          display: state.code + "-" + state.countryName
        };
      });
      console.log($scope.cities);
    }).error(function(err) {
      $scope.error = err;
    });
  }
  /**
   * Create filter function for a query string
   */
  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);
    return function filterFn(state) {
      return (state.value.indexOf(lowercaseQuery) === 0);
    };
  }


  $scope.prices = [
    {show:'$200', value:200},
    {show:'$300', value:300},
    {show:'$400', value:400},
    {show: '$500', value:500},
    {show: '$600', value:600},
    {show: '$700', value:700},
    {show: '$800', value:800},
    {show: '$900', value:900},
    {show: '$1000', value:1000},
    {show: '$1100', value:1100},
    {show: '$1200', value:1200},
    {show: '$1300', value:1300},
    {show: '$1400', value:1400},
    {show: '$1500', value:1500}
  ];

  $scope.info = {
    origin: {
      name: 'New York City',
      code: 'NYC'
    },
    maxfare: {
      show: '$500',
      value: 500
    },
    returndate: new Date(),
    departuredate: new Date()
  };

  $scope.submit = function() {
    $scope.error = null;
    $scope.fareinfo = null;

    $http.get('/api/v1/places?origin=' + $scope.ctrl.selectedItem.value +
      '&departuredate=' + formatDate($scope.info.departuredate) +
      '&returndate=' + formatDate($scope.info.returndate) +
      '&maxfare=' + $scope.info.maxfare).success(function(data) {
        console.log(data);
        $scope.results = data;
        $scope.data = data.info;
        if ($scope.results.status) {
          $scope.fareinfo = JSON.parse($scope.data).FareInfo;
          console.log($scope.fareinfo);
          $scope.showSimpleToast("Successfully got flight info");
        } else {
          $scope.error = JSON.parse($scope.data.data).message;
          $scope.showSimpleToast("Error: " + $scope.error + ". Try again!");
        }
    }).error(function(err) {
      console.log(err);
      $scope.error = JSON.parse(err.data).message;
      $scope.showSimpleToast("Error: " + $scope.error + ". Try again!");

    });
  };

  function formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) {
      month = '0' + month;
    }
    if (day.length < 2) {
      day = '0' + day;
    }

    return [year, month, day].join('-');
  }

  $scope.toastPosition = {
    bottom: false,
    top: true,
    left: false,
    right: true,
    fit: true
  };
  $scope.getToastPosition = function() {
    return Object.keys($scope.toastPosition)
      .filter(function(pos) { return $scope.toastPosition[pos]; })
      .join(' ');
  };

  $scope.showSimpleToast = function(msg) {
    $mdToast.show(
      $mdToast.simple()
        .content(msg)
        .position($scope.getToastPosition())
        .hideDelay(3000)
    );
  };
});
