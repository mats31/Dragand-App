'use strict';

// NPM Required
var opensubtitles = require("popcorn-opensubtitles");
var http 		  = require('http');
var fs 		  	  = require('fs');
var url 		  = require('url');

daw.service('subtitlesService', function($q, settingsService) {

	var that = this;

	/*
	 * Common search
	 * 1. OpenSubtitles
	 */
	that.find = function(imdbId, information, filename) {

		var deferred = $q.defer();

		if(information['series']) { // SERIE
			that.openSubtitles({
				imdbid	: imdbId,
				season	: information['season'],
				episode	: information['episodeNumber'],
				filename: filename
			}).then(function(result) {
				settingsService.get('language').then(function(language){
					if(result[language]['url']){
						deferred.resolve(result[language]['url']);
					} else {
						deferred.reject();
					}
				});
			}).catch(function() {
				deferred.reject();
			});
		} else { // MOVIE
			// TODO Call YifySubtitles
		}

		return deferred.promise;

	};

	/*
	 * Search in OpenSubtitles.org
	 */
	that.openSubtitles = function(information) {

		var deferred = $q.defer();

		console.log('Information Seed at OpenSubtitles.org : ', information);

		opensubtitles.searchEpisode(information, 'OSTestUserAgent')
			.then(function(result) {
				deferred.resolve(result);
			}).catch(function(error) {
				deferred.reject(error);
			});

		return deferred.promise;

	};

	/*
	 * Service for download file and put in good folder
	 */
	that.download = function(name, subUrl, path) {

		var deferred = $q.defer();
		var regex = /(.*)\.[^.]+$/;

		var file = fs.createWriteStream(path + '/' + regex.exec(name)[1] + '.str');

		http.get({
			host: url.parse(subUrl).host,
			port: 80,
			path: url.parse(subUrl).pathname
		}, function(res) {
			res.on('data', function(data) {
				deferred.resolve(file.write(data));
			}).on('end', function() {
				deferred.reject(file.end());
			});
		});

		return deferred.promise;

	};

});