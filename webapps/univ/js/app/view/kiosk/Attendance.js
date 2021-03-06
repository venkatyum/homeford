define(['jquery', 'cookie', '../../service/DataService', '../../service/BannerService', '../../Router', 'ellipsis', '../../view/kiosk/Attendance2'], function(jquery, cookie, service, banner, router, ellipsis, attendance2) {"use strict";

	var Attendance = ( function() {

			/**
			 * Constructor
			 *
			 */

			var validator;
			var membernames = [];
			var template;
			var TARGETVIEW;
			var KIOSKMODE = false;

			function Attendance() {

				function checkForActiveCookie() {
					if (jQuery.cookie('user') && jQuery.cookie('user') !== 'home') {
						banner.setBrand();
						return true;
					} else {
						//Paranoid Cookie Clearing
						jQuery.removeCookie('user', {
							path : '/univ'
						});
						jQuery.removeCookie('subuser', {
							path : '/univ'
						});
						router.go('/home', '/admin');
						return false;
					}
				}

				function populateData() {
					var activedomains = [];
					jQuery('.metadata').text(Date.now());
					activedomains.push(service.domainNametoID(jQuery.cookie('subuser')));
					getMembers(activedomains);
					setInterval(function() {
						GetClock();
					}, 1000);

				}

				//Thanks to http://www.ricocheting.com/code/javascript/html-generator/date-time-clock
				function GetClock() {
					var tday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
					var tmonth = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

					var d = new Date();
					var nday = d.getDay();
					var nmonth = d.getMonth();
					var ndate = d.getDate();
					var nyear = d.getYear();
					var nhour = d.getHours();
					var nmin = d.getMinutes();
					var nsec = d.getSeconds();
					var ap;

					if (nyear < 1000)
						nyear = nyear + 1900;

					if (nhour == 0) {
						ap = " AM";
						nhour = 12;
					} else if (nhour <= 11) {
						ap = " AM";
					} else if (nhour == 12) {
						ap = " PM";
					} else if (nhour >= 13) {
						ap = " PM";
						nhour -= 12;
					}

					if (nmin <= 9) {
						nmin = "0" + nmin;
					}
					if (nsec <= 9) {
						nsec = "0" + nsec;
					}

					jQuery('#currenttime').text("" + tday[nday] + ", " + tmonth[nmonth] + " " + ndate + ", " + nyear + " " + nhour + ":" + nmin + ":" + nsec + ap + "");
				}

				function getMembers(activedomains) {
					jQuery('.contentfull').empty();
					membernames = [];
					for (var i = 0; i < activedomains.length; i++) {
						service.getDomainMembers(activedomains[i], {
							success : function(data) {
								var thisitem = template.clone();
								jQuery('.cardsloading').fadeOut(200);
								for (var j = 0; j < data.length; j++) {
									for (var z = 0; z < data[j].domains.length; z++) {
										if (data[j].domains[z].id === parseInt(jQuery.cookie('_did')) && data[j].domains[z].roleStatus == 'ACTIVE') {
											jQuery('.metainfo').text(data.length + ' members');
											var thisitem = template.clone();
											if ((data[j].firstName === 'null' || data[j].firstName == null || data[j].firstName === "" ) && (data[j].lastName === 'null' || data[j].lastName == null || data[j].lastName === "")) {
												jQuery('.student-name', thisitem).text(data[j].email);
												jQuery('.student-select', thisitem).attr('name', data[j].email);
											} else {
												jQuery('.student-name', thisitem).text(data[j].firstName + ' ' + data[j].lastName);
												jQuery('.student-select', thisitem).attr('name', data[j].email);
											}
											membernames.push(jQuery('.kioskcard-name', thisitem).text());
											if (!data[j].image || data[j].image === null) {
												var _image = "img/noimg.png";
												jQuery('.kiosk-headshot', thisitem).attr('src', _image);
											} else {
												_image = '/zingoare/api/profileupload/picture/' + data[j].image.id;
												jQuery('.kiosk-headshot', thisitem).attr('src', _image);
											}
											jQuery(thisitem).attr('name', data[j].id);
											jQuery('.contentfull').append(thisitem);
											if (j === data.length - 1) {
												jQuery('.student-name').ellipsis({
													onlyFullWords : true
												});
												getCurrentStats(activedomains);
												activateEvents();
											}
										}
									}
								}
							}
						});
					}
				}

				function getCurrentStats(activedomains) {
					//defaulting to 0th index
					service.checkInStats(activedomains[0], {
						success : function(data) {
							var activestudentids = [];
							helperMediaQuiries();
							for (var j = 0; j < data.length; j++) {
								if (activestudentids.indexOf(data[j].kid.id) === -1) {
									activestudentids.push(data[j].kid.id);
									if (data[j].type === 'CHECKIN') {
										updatePanelIcons(data[j].kid.id, 'CHECKIN', data[j].id);
									} else {
										updatePanelIcons(data[j].kid.id, 'CHECKOUT', data[j].id);
									}
								} else {
									if (data[j].type === 'CHECKIN') {
										jQuery('.kioskboard[name=' + data[j].kid.id + ']').find('.icon-2x').removeClass('icon-ok-sign').removeClass('icon-smile').addClass('icon-question-sign').css('color', 'grey');
										jQuery('.kioskboard[name=' + data[j].kid.id + ']').find('.kiosk-flag-text').text('No Show Yet');
										updatePanelIcons(data[j].kid.id, 'CHECKIN', data[j].id);
									}
									// else {
									// updatePanelIcons(data[j].kid.id, 'CHECKOUT', data[j].id);
									// }
								}
							}
						}
					});
				}

				function updatePanelIcons(memberid, type, kioskactionid) {
					jQuery('.kioskboard[name=' + memberid + ']').attr('kioskactionid', kioskactionid);
					if (type === 'CHECKIN') {
						jQuery('.kioskboard[name=' + memberid + ']').find('.icon-2x').removeClass('icon-question-sign').removeClass('icon-ok-sign').removeClass('icon-smile').addClass('icon-ok-sign').css('color', 'green');
						jQuery('.kioskboard[name=' + memberid + ']').find('.kiosk-flag-text').text('Checked In');
					} else {
						jQuery('.kioskboard[name=' + memberid + ']').find('.icon-2x').removeClass('icon-question-sign').removeClass('icon-ok-sign').removeClass('icon-smile').addClass('icon-smile').css('color', '#0784E3');
						jQuery('.kioskboard[name=' + memberid + ']').find('.kiosk-flag-text').text('Checked Out');
					}

				}

				function activateEvents() {
					jQuery("#card-searchbox").val('').focus();

					jQuery("#card-searchbox").keyup(function() {
						var searchword = jQuery('#card-searchbox').val().toUpperCase();
						var cardlist = jQuery('.contentfull .student-name');
						for (var i = 0; i < cardlist.length; i++) {
							var thiscard = cardlist[i];
							thiscard.parentElement.style.display = '';
							if (thiscard.textContent.toUpperCase().indexOf(searchword) != -1) {
							} else {
								thiscard.parentElement.style.display = 'none';
							}
						}
					});

					jQuery('.kioskboard').on('click', function() {
						// successful selection of user for context, and create cookie
						var selectedUserName = $(this).find('.student-name').text();
						var selectedUserId = $(this).attr('name');
						var selectedUserimg = $(this).find('.kiosk-headshot').attr('src');
						var selectedUserState = $(this).find('.kiosk-flag-text').text();
						var selectedUserStateid = $(this).attr('kioskactionid');
						attendance2.activeStudent(selectedUserName, selectedUserId, selectedUserimg, selectedUserState, selectedUserStateid);
						router.go('/attendancekioskidentify', '/attendancekiosk');
					});
				}

				function helperMediaQuiries() {
					if ($('.kioskboard').length > 2) {
						var width = $('#action-canvas').width() - 30;
						var rowholds = Math.floor(width / 154);
						var fillerspace = width - (rowholds * 154);
						//var eachfiller = 300+fillerspace/rowholds;
						var newmargin = fillerspace / rowholds;
						if (newmargin < 20) {
							newmargin = 20;
						}
						$('.kioskboard').css('margin-left', newmargin / 2);
						$('.kioskboard').css('margin-right', newmargin / 2);
					}
				}


				this.pause = function() {

				};

				this.resume = function() {
					if (checkForActiveCookie() !== true) {
						router.go('/home', '/admin');
					}// Cookie Guider
					//$(".card-search").autocomplete("destroy");
					jQuery("#card-searchbox").val('').focus();
					jQuery('.kioskboard').show();
					GetClock();
					jQuery('#nopage-warning').fadeOut(500);
					jQuery('.main-content-header').fadeIn(400);
					jQuery('.main-content').fadeIn(400);
					jQuery('#project-nav').fadeIn(400);
					//populateData();
					var thisactivedomains = [service.domainNametoID(jQuery.cookie('subuser'))];
					getCurrentStats(thisactivedomains);
					banner.setBrand();
					document.title = 'Zingoare | Attendance Kiosk';
				};

				this.init = function(args) {
					//Check for Cooke before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Attendance Kiosk';
					if (KIOSKMODE == false && $('#nopage-warning').is(':visible') == false) {
						router.go('/admin');
					}

					if (checkForActiveCookie() === true) {
						template = jQuery('#member-template').remove().attr('id', '');
						//Preactivate Dependency
						//todoassign.init();
						GetClock();
						jQuery("#card-searchbox").val('').focus();
						//populateData();

						$(window).resize(helperMediaQuiries);
						// When the browser changes size

						//HTML Event - Actions
						jQuery('.launchkiosk').click(function() {
							KIOSKMODE = true;
							jQuery('#nopage-warning').fadeOut(500);
							jQuery('.main-content-header').fadeIn(400);
							jQuery('.main-content').fadeIn(400);
							jQuery('#project-nav').fadeIn(400);
							populateData();
						});

					} // Cookie Guider
				};

			}

			return Attendance;
		}());

	return new Attendance();
});
