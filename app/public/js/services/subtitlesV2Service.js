'use strict';

daw.service('subtitlesV2Service', function($rootScope, $q, fileInfosService, imdbService, settingsService, theSubdbService, openSubtitlesService, yifyService, theTvDbService) {

	var that = this;
	var idCurrentList;
	var languageSubtitles;

	/*
	 * Get information and go works
	 *
	 * @param string name (FileName)
	 * @param string path (Path with fileName)
	 * @param string directory (Directory where the file is)
	 */
	that.get = function(name, path, directory) {

		var deferred = $q.defer();

		that.consoleEntry(name, path, directory);

		$rootScope.view = 'list';

		// 0. We display page List
		idCurrentList 		= $rootScope.list.length;
		languageSubtitles 	= settingsService.get('language');

		// 1. We add item in SCOPE with status loading
		$rootScope.list[idCurrentList] = {
			'status': 'loading',
			'filename': name
		};

		fileInfosService.parse(name).then(function(result) {

			// 2. Check type and go to the good function
			if (result['series']) {
				that.informationSeries(name, path, directory, result).then(function() {
					that.getSubtitlesSeries(name, path, directory, result, $rootScope.list[idCurrentList]['imdbId']).then(function(){
						deferred.resolve();
					});
				});
			} else {
				that.movies(name, path, directory, result).then(function() {
					deferred.resolve();
				});
			}

		});

		return deferred.promise;

	};

	that.movies = function(name, path, directory, fileInfos) {

		var deferred = $q.defer();

		$rootScope.list[idCurrentList]['type'] = 'movie';
		$rootScope.list[idCurrentList]['name'] = fileInfos['title'];

		imdbService.get(fileInfos['title']).then(function(imdb) {

			$rootScope.list[idCurrentList]['poster'] = imdb['Poster'];
			$rootScope.list[idCurrentList]['imdbId'] = imdb['imdbID'];

			yifyService.get(imdb['imdbID'], languageSubtitles, name, directory).then(function(){

				console.log('Subtitles found on Yify');

				$rootScope.list[idCurrentList]['status'] = 'done';

				deferred.resolve();

			}).catch(function() {

				$rootScope.list[idCurrentList]['status'] = 'fail';

				deferred.resolve();

			});

		}).catch(function() {

			$rootScope.list[idCurrentList]['status'] = 'fail';

			deferred.resolve();

		});

		return deferred.promise;
	};

	/*
	 * Add all Information in $rootScope
	 */
	that.informationSeries = function(name, path, directory, fileInfos) {

		var deferred = $q.defer();

		$rootScope.list[idCurrentList]['type']    = 'series';
		$rootScope.list[idCurrentList]['name']    = fileInfos['series'];
		$rootScope.list[idCurrentList]['episode'] = (fileInfos['episodeNumber'] < 10) ? '0' + fileInfos['episodeNumber'] : fileInfos['episodeNumber'];
		$rootScope.list[idCurrentList]['season']  = (fileInfos['season'] < 10) ? '0' + fileInfos['season'] : fileInfos['season'];

		imdbService.get(fileInfos['series']).then(function(imdb) {

			if(typeof(imdb['Response']) !== 'undefined' && imdb['Response'] === "False") {

				console.log('Movie not found in IMDB');

				theTvDbService.getImdbIdAndPoster(fileInfos['series']).then(function(result){

					$rootScope.list[idCurrentList]['poster'] = (result['Poster']) ? result['Poster'] : null;
					$rootScope.list[idCurrentList]['imdbId'] = (result['IMDB_ID']) ? result['IMDB_ID'] : null;

					deferred.resolve();

				});

			} else {

				console.log('Movie found in IMDB');

				$rootScope.list[idCurrentList]['poster'] = imdb['Poster'];
				$rootScope.list[idCurrentList]['imdbId'] = imdb['imdbID'];

				deferred.resolve();

			}

		});

		return deferred.promise;

	};

	/*
	 * Get subtitles
	 * 1. OpenSubtitles
	 */
	that.getSubtitlesSeries = function(name, path, directory, fileInfos, imdbId) {

		var deferred = $q.defer();

		openSubtitlesService.get(imdbId, fileInfos['season'], fileInfos['episodeNumber'], name, languageSubtitles, directory).then(function() {

			console.log('Subtitles found on OpenSubtitles');

			// 5. After download change the status to 'done'
			$rootScope.list[idCurrentList]['status'] = 'done';

			deferred.resolve();

		}).catch(function(){

			// 5. After download change the status to 'done'
			$rootScope.list[idCurrentList]['status'] = 'fail';

			deferred.resolve();

		});

		return deferred.promise;

	};

	/*
	 * Console Entry parameters
	 */
	that.consoleEntry = function(name, path, directory) {

		console.log('Name : ', name);
		console.log('Path : ', path);
		console.log('Directory : ', directory);

	};

});