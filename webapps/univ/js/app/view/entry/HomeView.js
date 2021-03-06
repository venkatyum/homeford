define(['cookie', 'backstrech', '../../Router', '../../service/DataService', '../../Notify'], function(cookie, backstrech, router, service, notify) {"use strict";

	var HomeView = ( function() {

			var PARAM = {
				"Bg" : ["img\/z5.png", "img\/z2.png", "img\/z3.png"],
				"Static" : ["media\/bg1.png"]
			};

			var EDIT = '<i id="entity-edit" style="padding-left:10px;font-size:10px; display:none; vertical-align:super;" class="icon-gear  icon-1x ">Change</i>';
			var DIALOGBODY = '<div id="note-dialog" title="Welcome!"> <p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>Please select the kind of experience you want to tour?</p></div>';
			/**
			 * Constructor
			 */
			function HomeView() {
				//Variable Zone.
				var t = {
					lines : 17,
					length : 6,
					width : 4,
					radius : 12,
					rotate : 0,
					color : "#ccc",
					speed : 2.2,
					trail : 60,
					className : "spinner",
					zIndex : -2e9,
					top : "auto",
					left : "auto"
				};
				var n = document.getElementById("preloader");
				var i = PARAM.Bg;

				function startCoverShow() {
					//To start immediately
					jQuery.backstretch(i, {
						duration : 3000,
						fade : 500
					}, function() {
						r.stop();
						jQuery("#preloader").hide();
					});
					//Get geo location
					//http://freegeoip.net/json/

					service.getFlickList('zingoare', {
						success : function(list) {
							jQuery.backstretch("destroy");
							var fulllist = i.concat(list);
							jQuery.backstretch(fulllist, {
								duration : 3000,
								fade : 500
							}, function() {
								r.stop();
								jQuery("#preloader").hide();
							});
						},
						error : function() {
							jQuery.backstretch("destroy");
							jQuery.backstretch(i, {
								duration : 3000,
								fade : 500
							}, function() {
								r.stop();
								jQuery("#preloader").hide();
							});
						}
					});
				}

				function activateSuggestionSearch() {
					// var countries = new Bloodhound({
					// datumTokenizer : function(d) {
					// return Bloodhound.tokenizers.whitespace(d.name);
					// },
					// queryTokenizer : Bloodhound.tokenizers.whitespace,
					// limit : 5,
					// prefetch : {
					// url : '../univ/data/univslist.json',
					// filter : function(list) {
					// return jQuery.map(list, function(country) {
					// return {
					// name : country
					// };
					// });
					// }
					// }
					// });
					// countries.initialize();
					// //activateSuggestionSearch();
					// jQuery('#slogan-input').typeahead(null, {
					// name : 'countries',
					// displayKey : 'name',
					// source : countries.ttAdapter()
					// });
				}

				function checkForActiveCookie() {
					if (jQuery.cookie('user')) {
						router.go('/studentlist', '/home');
						return true;
					} else {
						return false;
					}
				}

				function initDialog() {
					jQuery('body').append(DIALOGBODY);
					$("#note-dialog").dialog({
						autoOpen : false,
						show : {
							effect : "blind",
							duration : 300
						},
						hide : {
							effect : "explode",
							duration : 300
						},
						modal : false,
						buttons : {
							"Administrator " : function() {
								$(this).dialog("close");
							},
							"Parent" : function() {
								$(this).dialog("close");
							}
						}
					});
				}

				function checkForActiveEntityCookie() {
					if (jQuery.cookie('entity')) {
						return true;
					} else {
						return false;
					}
				}


				this.pause = function() {

				};

				this.resume = function() {
					//Forcing to reload all view.
					//location.reload();
					initDialog();
					startCoverShow();
					checkForActiveCookie();
					document.title = 'Zingoare';
				};

				this.init = function(args) {
					//document.title = 'Zingoare';
					//Check for Cookie before doing any thing.
					//Light weight DOM.
					if (checkForActiveCookie() === false) {
						//Rich Experience First.. Load BG
						startCoverShow();
						initDialog();
						//Get the suggestions to search connected.
						if (checkForActiveEntityCookie()) {
							jQuery('#slogan-input').hide();
							jQuery('#knownentity').text(jQuery.cookie('entity'));
							jQuery('#knownentity').append(EDIT);

						} else {
							//activateSuggestionSearch();
							//Hack - Must be fixed in CSS
							//Alignment mismatch :(
							jQuery('#slogan-input').css('background-color', 'white');
							jQuery('#slogan-input').css('vertical-align', 'middle');
							jQuery('.tt-dropdown-menu').css('top', 'inherit');
							jQuery('#slogan-input').focus();

						}

						//HTML Event - Actions
						jQuery('#login-modal-link').click(function() {
							router.go('/entry', '/home');
						});

						jQuery('#trial-modal-link').click(function() {
							jQuery("#note-dialog").dialog("open");
						});

						// jQuery('#trial-modal-link').click(function() {
						// service.Login('tour@zingoare.com', 'tourzingoare', {
						// success : function(LoginData) {
						// if (LoginData !== 'error') {
						// notify.showNotification('OK', 'Login Success', 'studentlist', '0');
						// jQuery.cookie('user', 'tour@zingoare.com', {
						// expires : 100,
						// path : '/'
						// });
						// jQuery.cookie('subuser', 'TOUR', {
						// expires : 100,
						// path : '/'
						// });
						// } else {
						// notify.showNotification('ERROR', 'Username/Password Combination Invalid');
						// }
						// }
						// });
						// });

						jQuery('#slogan-input').keypress(function() {
							var keycode = (event.keyCode ? event.keyCode : event.which);
							if (keycode == '13') {
								var queryString = jQuery('#slogan-input').val();
								//prehomeview.setEntity(queryString);
								router.go('/' + queryString, '/home');
							}

						});

						jQuery('#entity-edit').click(function() {
							jQuery.removeCookie('entity', {
								path : '/'
							});
							jQuery('#knownentity').hide();
							jQuery('#slogan-input').fadeIn();
						});

						jQuery('#knownentity').on({
							mouseenter : function() {
								jQuery('#entity-edit').fadeIn(500);
							},
							mouseleave : function() {
								jQuery('#entity-edit').fadeOut(500);
							}
						});

					} // Cookie Guider
				};
			}

			return HomeView;
		}());

	return new HomeView();
});
