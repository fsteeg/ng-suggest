@ngdoc overview
@name index
@description

# <%= name %>

> <%= description %>

**<%= name %>** is a module for [AngularJS](http://angularjs.org/) to facilitate 
the use of [OpenSearch Suggestions](http://www.opensearch.org/Specifications/OpenSearch/Extensions/Suggestions/1.0) and [SeeAlso links](http://www.gbv.de/wikis/cls/SeeAlso) in web application.

The latest release of <%= name %> is version <%= version %>. Source code and issue tracker
can be found at <<%= repository.url.replace(/^git:/,'https:').replace(/.git$/,'') %>>.

## Download

The current release of <%= name %> is version <%= version %>, including:

* [ng-suggest.min.js](grunt-scripts/ng-suggest.min.js): minified version for production
* [ng-suggest.js](grunt-scripts/ng-suggest.js): original source code for development

## Getting started

For details and examples see the documentation of services and directives provided
by {@link ng-suggest ng-suggest}.

## Customization

To support APIs that do not strictly follow OpenSearch Suggest specification, the
{@link ng-suggest.service:OpenSearchSuggestions OpenSearchSuggestions} service
can be customized with a transformation function. The 
{@link ng-suggest.directive:suggest-typeahead suggest-typeahead} directive contains
a default template that can be replaced or styled with CSS.

## Author and Contributors

* <%= author %>
* <%= contributor %>

## License

Code licensed under the [AGPL](http://www.gnu.org/licenses/agpl-3.0.html).
Documentation licensed under [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/).

