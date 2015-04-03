'use strict';

daw.service('guiService', function($rootScope) {

	var that = this;

	var win 			= gui.Window.get();
	var nativeMenuBar 	= new gui.Menu({ type: "menubar" });

	/*
	 * Init GUI
	 */
	that.init = function() {
		nativeMenuBar.createMacBuiltin("Dragand");
		win.menu = nativeMenuBar;
		that.listenResize();
	};

	/*
	 * Listen Resize and add new Width in RootScope
	 *
	 * Width : 320px -> 17 characters
	 *
	 * So for exemple Width : 400px -> 21.25 -> 21 characters
	 */
	that.listenResize = function() {
		window.addEventListener("resize", function() {
			$rootScope.width = win.width;
		});
	};

});