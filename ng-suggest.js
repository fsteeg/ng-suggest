'use strict';
/**
 * @ngdoc overview
 * @name ng-suggest
 * @module ng-suggest
 * @description
 *
 * The AngularJS module <b>ngSuggest</b> provides access to {@link
 * http://www.opensearch.org/Specifications/OpenSearch/Extensions/Suggestions/1.0
 * OpenSearch Suggestions} and {@link http://www.gbv.de/wikis/cls/SeeAlso SeeAlso}
 * web services for search suggestion, typeahead, inclusion of context information 
 * and links etc.
 *
 * The module provides
 *
 * * service 
 *   {@link ng-suggest.service:OpenSearchSuggestions OpenSearchSuggestions}
 *   to query an OpenSearch server for search suggestions
 * * service
 *   {@link ng-suggest.service:SeeAlso SeeAlso}
 *   to query an SeeAlso server link suggestions
 * * directive 
 *   {@link ng-suggest.directive:suggest-typeahead suggest-typeahead} 
 *   to enable autosuggest via OpenSearch Suggest with ui.bootstrap.typeahead
 * * directive 
 *   {@link ng-suggest.directive:seealso-api seealso-api}
 *   to display link suggestions queried via SeeAlso
 */
angular.module('ngSuggest').value('version', '0.0.1-pre');
/**
 * @ngdoc directive
 * @name ng-suggest.directive:seealso-api
 * @restrict A
 * @description
 * 
 * This directive displaysy link suggestions queried via SeeAlso link
 * server protocol.
 *
 * The directive has not been implemented yet!
 *
 * <pre class="prettyprint linenums">
 * <!-- comma-separated -->
 * <span seealso-api="http://example.org/" seealso-id="123"/>
 * <!-- list -->
 * <ul seealso-api="http://example.org/" seealso-id="123"/>
 * <ol seealso-api="http://example.org/" seealso-id="123"/>
 * <!-- image -->
 * <img seealso-api="http://example.org/" seealso-id="123"/>
 * <!-- custom template -->
 * <div seealso-api="http://example.org/" seealso-id="123">
 * ...
 * </div>
 * <!-- custom template, referenced -->
 * <div seealso-api="http://example.org/" seealso-id="123" template-url="..." />
 * </pre>
 *
 * ## Source code
 *
 * The most recent 
 * [source code](https://github.com/gbv/ng-suggest/blob/master/src/directives/seealsoApi.js)
 * of this service is available at GitHub.
 *
 * @param {string} seealso-api Base URL of SeeAlso server to query from
 * @param {string} seealso-id Identifier to query for
 * @param {string} template-url Custom template to display result with
 */
angular.module('ngSuggest').directive('seealsoApi', [
  'SeeAlso',
  function (SeeAlso) {
    return {
      restrict: 'A',
      scope: {
        api: '@seealsoApi',
        id: '@seealsoId'
      },
      link: function (scope, element, attr) {
        function request() {
        }
        ;
        // TODO: don't call twice
        scope.$watch('api', function () {
          request();
        });
        scope.$watch('id', function () {
          request();
        });
      }
    };
  }
]);
/**
 * @ngdoc directive
 * @name ng-suggest.directive:suggest-typeahead
 * @restrict A
 * @description
 * 
 * This directive enables
 * [ui.bootstrap.typeahead](http://angular-ui.github.io/bootstrap/#typeahead)
 * search suggestions (aka autosuggest) from an OpenSearch Suggestions server.
 * Standard options of the typeahead directive (e.g. `typeahead-on-select` and
 * `typeahead-template-url`) can be used as well.
 *
 * # Source code
 * 
 * The most recent
 * [source code](https://github.com/gbv/ng-suggest/blob/master/src/directives/suggestTypeahead.js)
 * of this directive is available at GitHub.
 * 
 * @param {string} suggest-typeahead Angular expression with URL as string or 
 *      {@link ng-suggest.service:OpenSearchSuggestions OpenSearchSuggestions}
 *      object
 * @param {string} json enable JSONP (if service given as URL)
 *
 * @example
 * <example module="myApp">
 *  <file name="index.html">
 *    <div ng-controller="myController">
 *      <div>
 *        <input suggest-typeahead="//wikipedia.org/w/api.php?action=opensearch&namespace=0&search=" />
 *      </div>
 *    </div>
 *  </file>
 *  <file name="script.js">
 *    angular.module('myApp',['ngSuggest']);
 *  </file>
 * </example>
 */
angular.module('ngSuggest').directive('suggestTypeahead', [
  'OpenSearchSuggestions',
  '$injector',
  function (OpenSearchSuggestions, $injector) {
    return {
      restrict: 'A',
      scope: {
        api: '=suggestTypeahead',
        jsonp: '@jsonp'
      },
      require: 'ngModel',
      compile: function (element, attrs) {
        var suggestFunction = 'suggest_' + Math.random().toString(36).slice(2);
        // defines scope.service and scope.suggest
        function suggestLink(scope, element, attrs) {
          // create an OpenSearchSuggestions service instance
          scope.$watch('api', function (service) {
            if (angular.isObject(service)) {
              scope.service = service;
            } else {
              scope.service = new OpenSearchSuggestions({
                url: service,
                jsonp: scope.jsonp
              });
            }
          });
          // create suggest function that queries the service
          scope.$parent[suggestFunction] = function (value) {
            var s = scope.service.suggest(value);
            return s.then(function (suggestions) {
              return suggestions.values;
            });
          };
        }
        // insert typeahead directive, if not explicitly given
        var typeaheadLink = function () {
        };
        if (!attrs.typeahead) {
          if (!$injector.has('typeaheadDirective')) {
            throw new Error('ui.bootstrap.typehead directive required!');
          }
          var expr = 'item.label for item in ' + suggestFunction + '($viewValue) | filter:$viewValue';
          attrs.$set('typeahead', expr);
          var directive = $injector.get('typeaheadDirective')[0];
          typeaheadLink = directive.compile(element, attrs);
        }
        // call both link functions
        return function (scope, element, attrs, modelCtrl) {
          suggestLink(scope, element, attrs);
          // typeahead directive expects the original scope, that's
          // why the suggest function needs to be defined at parent
          typeaheadLink(scope.$parent, element, attrs, modelCtrl);
        };
      }
    };
  }
]);
// TODO: if api is URL => create oss
// if api is service object ... use it (support transform by this)
// if api is function
//   <input ng-model="input1" 
//          suggest-typeahead="http://..."
//          suggest-typeahead="{{service}}
/**
 * @ngdoc service
 * @name ng-suggest.service:OpenSearchSuggestions
 * @description
 * 
 * The <b>OpenSearchSuggestions</b> service can be used to query an OpenSearch 
 * server for search suggestions. The service is instanciated with an URL
 * template that includes the character sequence `{searchTerms}`:
 *
 * <pre class="prettyprint linenums">
 * var url = "http://example.org/?q={searchTerms}";
 * var suggestService = new OpenSearchSuggestions(url);
 * suggestService.suggest(search).then( function(suggestions) {
 *      ...
 * });
 * </pre>
 *
 * The method `suggest` returns a promise to get a suggestions object having
 * the following form:
 *
 * <pre class="prettyprint">
 * {
 *    query: "query string",
 *    values: [
 *        {
 *            label:       "completion",
 *            description: "optional description",
 *            url:         "optional URL"
 *        },
 *        ....
 *    ]
 * } 
 * </pre>
 *
 * Note that suggestions originally returned from an OpenSearch server have the
 * form `["query string"],["completion",...],["description",...],["url",...]]`,
 * so it is transformed to the form exemplified above. A custom transformation
 * function can be given as optional named parameter `transform`. Use 
 * `function(s) { return s; }` to get the original, untransformed response.
 * Transformation errors are catched and passed as rejection of the promise.
 *
 * The optional paramater `jsonp` (false by default) defines whether requests are 
 * done via JSONP.
 *
 * See {@link ng-suggest.service:SeeAlso SeeAlso} for a simplified subclass of 
 * this service.
 *
 * ## Source code
 * 
 * The most recent 
 * [source code](https://github.com/gbv/ng-suggest/blob/master/src/services/OpenSearchSuggestions.js)
 * of this service is available at GitHub.
 * 
 * @example
 <example module="myApp">
  <file name="index.html">
    <div ng-controller="myController">
      <div>
        <input ng-model="search" class="search-query"/> 
        <select ng-model="site" ng-options="s.name for s in sites">
        </select>
        <select ng-model="language" ng-options="l.name for l in languages">
        </select>
      </div>
      <ul>
        <li ng-repeat="s in suggestions.values">
          <a ng-if="s.url" href="{{s.url}}">{{s.label}}</a>
          <span ng-if="!s.url">{{s.label}}</span>
          <div ng-if="s.description">{{s.description}}</div>
        </li>
      </ul>
      <div><pre>{{suggestions | json}}</pre></div>
    </div>
  </file>
  <file name="script.js">
    angular.module('myApp',['ngSuggest']);
    function myController($scope, OpenSearchSuggestions) {

        function updateSearch(search) {
            $scope.suggestService.suggest(search).then(
                function(data) { $scope.suggestions = data; },
                function() { $scope.suggestions = null; }
            );
        }

        function updateSite() {
            var url = $scope.site.url.replace('{language}', $scope.language.code);
            $scope.suggestService = new OpenSearchSuggestions({
                url: url, 
                transform: $scope.site.transform,
                jsonp: 1,
            });
            updateSearch($scope.search);
        };

        $scope.sites = [{ 
            name: "Wikipedia",
            url:  "//{language}.wikipedia.org/w/api.php?action=opensearch&search={searchTerms}&namespace=0",
        },{ 
            name: "Wikidata", 
            url: "//www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language={language}&type=item&continue=0&search={searchTerms}",
            transform: function(data) {
                var suggestions = { 
                    query: data.searchinfo.search, 
                    values: [ ]
                };

                for(var i=0; i<data.search.length; i++) {
                    suggestions.values.push( data.search[i] );
                }

                return suggestions;                
            }
        }];
        $scope.site = $scope.sites[0];

        $scope.languages = [
            { code: "en", name: "English" },
            { code: "de", name: "Deutsch" },
        ];
        $scope.language = $scope.languages[0];

        $scope.search = "Wiki";
        $scope.$watch('site', updateSite);
        $scope.$watch('language', updateSite);
        $scope.$watch('search', updateSearch);
    }
  </file>
</example>
 */
angular.module('ngSuggest').factory('OpenSearchSuggestions', [
  '$http',
  '$q',
  function ($http, $q) {
    // transform suggestions array to object
    var transformSuggestions = function (data) {
      var suggestions = {
          query: data[0],
          values: []
        };
      if (!angular.isArray(data[2]))
        data[2] = [];
      if (!angular.isArray(data[3]))
        data[3] = [];
      for (var i = 0; i < data[1].length; i++) {
        suggestions.values.push({
          label: data[1][i],
          description: data[2][i],
          url: data[3][i]
        });
      }
      return suggestions;
    };
    // constructor
    var OpenSearchSuggestions = function (args) {
      if (!angular.isObject(args))
        args = { url: args };
      this.url = args.url;
      if (this.url && this.url.indexOf('{searchTerms}') == -1) {
        this.url += '{searchTerms}';
      }
      this.transform = args.transform ? args.transform : transformSuggestions;
      this.jsonp = args.jsonp;
      if (this.jsonp === true || this.jsonp.match(/^\d/)) {
        this.jsonp = 'callback';
      }
    };
    // method
    OpenSearchSuggestions.prototype = {
      suggest: function (searchTerms) {
        if (!this.url) {
          return $q.reject(null);
        }
        var url = this.url;
        var transform = this.transform;
        var get = $http.get;
        if (this.jsonp) {
          get = $http.jsonp;
          url += url.indexOf('?') == -1 ? '?' : '&';
          url += this.jsonp + '=JSON_CALLBACK';
        }
        url = url.replace('{searchTerms}', decodeURIComponent(searchTerms));
        return get(url).then(function (response) {
          try {
            return transform(response.data);
          } catch (e) {
            return $q.reject(e);
          }
        }, function (response) {
          return $q.reject(response.data);
        });
      }
    };
    return OpenSearchSuggestions;
  }
]);
/**
 * @ngdoc service
 * @name ng-suggest.service:SeeAlso
 * @description
 * 
 * The <b>SeeAlso</b> is a special kind of
 * {@link ng-suggest.service:OpenSearchSuggestions OpenSearchSuggestions}
 * service to query a [SeeAlso 
 * server](http://www.gbv.de/wikis/cls/SeeAlso_Simple_Specification) 
 * for link suggestions. A SeeAlso service is
 * instanciated with the server's base URL as first argument:
 *
 * <pre class="prettyprint linenums">
 * var seealso = new SeeAlso("http://example.org/seealso");
 * seealso.suggest(search).then( function(links) { ... });
 * </pre>
 *
 * ## Source code
 *
 * The most recent 
 * [source code](https://github.com/gbv/ng-suggest/blob/master/src/services/SeeAlso.js)
 * of this service is available at GitHub.
 *
 * @example
 <example module="myApp">
  <file name="index.html">
    <div ng-controller="myController">
      <div>
        <input ng-model="query" class="search-query"/> 
      </div>
      <div><pre>{{links | json}}</pre></div>
    </div>
  </file>
  <file name="script.js">
    angular.module('myApp',['ngSuggest']);
    function myController($scope, SeeAlso) {
        // TODO: use another SeeAlso server for demo
        $scope.seealso = new SeeAlso("http://kug.ub.uni-koeln.de/portal/kug/connector/seealso/isbn2wikipedia");
        $scope.$watch('query', function updateSearch(query) {
            console.log("query"+query);
            $scope.seealso.suggest(query).then(function(links) {
                $scope.links = links;
            });
        });
    }
  </file>
</example>
 * 
 */
angular.module('ngSuggest').factory('SeeAlso', [
  'OpenSearchSuggestions',
  function (OpenSearchSuggestions) {
    function SeeAlso(args) {
      if (!angular.isObject(args))
        args = { url: args };
      args.url += '?id={searchTerms}&format=seealso';
      OpenSearchSuggestions.call(this, args);
    }
    ;
    SeeAlso.prototype = new OpenSearchSuggestions();
    return SeeAlso;
  }
]);