angular.module('getLostApp', ['lumx']).
controller('MainCtrl', function($rootScope, $scope, $http) {
  $http.get('/api/v1/cities').success(function(data) {
    $scope.cities = (JSON.parse(data.info)).Cities;
    console.log($scope.cities);
  }).error(function(err) {
    $scope.error = err;
  });

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
    returndate: '2015-05-20',
    departuredate: '2015-05-15'
  };

  $scope.submit = function() {
    console.log($scope.info);
    $http.get('/api/v1/places?origin=' + $scope.info.origin.code +
      '&departuredate=' + formatDate($scope.info.departuredate) +
      '&returndate=' + formatDate($scope.info.returndate) +
      '&maxfare=' + $scope.info.maxfare.value).success(function(data) {
        $scope.results = data;
        $scope.data = data.info;
        if ($scope.results.status) {
          $scope.fareinfo = JSON.parse($scope.data).FareInfo;
        } else {
          $scope.error = JSON.parse($scope.data.data).message;
        }
    }).error(function(err) {
      $scope.error = JSON.parse(err.data).message;
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
});
