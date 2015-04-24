/**
 * @ngdoc service
 * @name settingsService
 * @module daw
 *
 * @description
 * Service for manage information in localStorage (Use for user's settings)
 *
 */
daw.service('settingsService', function(configService, logService){

	var that = this;

	/**
	 * @ngdoc method
	 * @name init
	 *
	 * @description
	 * Init in the localStorage the default value
	 *
	 */
	that.init = function() {

		if(!localStorage['autoplay'] && !localStorage['player'] && !localStorage['language'] && !localStorage['notification'] && !localStorage['appLanguage'] && !localStorage['rules']) {
			that.set('autoplay', false);
			that.set('player', 'vlc');
			that.set('language', 'en');
			that.set('appLanguage', configService.get('defaultLanguage'));
			that.set('notification', true);
			that.set('rules', 'notAccepted');
		}
		
		that.consoleSettings();

	};

	/**
	 * @ngdoc method
	 * @name consoleSettings
	 *
	 * @description
	 * Add in Console informations from settings
	 *
	 */
	that.consoleSettings = function() {
		logService.success('============[SETTINGS]============');
		logService.info('Autoplay : ' + that.get('autoplay'));
		logService.info('Player : ' + that.get('player'));
		logService.info('language : ' + that.get('language'));
		logService.info('AppLanguage : ' + that.get('appLanguage'));
		logService.info('Notification : ' + that.get('notification'));
		logService.info('Rules : ' + that.get('rules'));
		logService.success('==========[END SETTINGS]==========');
	}

	/**
	 * @ngdoc method
	 * @name get
	 *
	 * @description
	 * Get Value from Database
	 *
	 */
	that.get = function(key) {
		if (localStorage.getItem(key)!=null) {
			return JSON.parse(localStorage.getItem(key));
		}
	};

	/**
	 * @ngdoc method
	 * @name set
	 *
	 * @description
	 * Set Value in Database
	 *
	 * @param {string} key 	 - Key
	 * @param {string} value - Value
	 *
	 */
	that.set = function(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	};

});