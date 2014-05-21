angular.module('myApp', ['ui.bootstrap','ngSuggest']);

function myController($scope, OpenSearchSuggestions) {

    $scope.example = [
        {
            api: "http://ws.gbv.de/suggest/geonames/?country=&count=10&searchterm=",
        },
        {
            api: "http://ws.gbv.de/suggest/gn250/?count=10&searchterm=",
        },
        {
            api: "http://ws.gbv.de/suggest/gnd/index.php?count=10&type=&searchterm=",
        },
        {
            api: "https://en.wikipedia.org/w/api.php?action=opensearch&limit=10&namespace=0&format=json&search=",
        },
        {
            url: "http://rvk.uni-regensburg.de/api/json/register/{searchTerms}",
            transform: function(data) { 
                console.log(data); // TODO
                return data; 
            },
            jsonp: 'jsonp'
        }
    ];

    $scope.example[4].service = new OpenSearchSuggestions($scope.example[4]);

    for(var i=0; i<4; i++) {
        $scope.example[i].input = "";
        $scope.example[i].onSelect = selectFunction(i); 
    }

    function selectFunction(i) {
        return function (item) {
            $scope.example[i].item = item;
        }
    }
}
