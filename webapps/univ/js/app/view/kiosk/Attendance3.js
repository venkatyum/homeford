define(['jquery', 'cookie', '../../service/DataService', '../../service/BannerService', '../../Router', 'ellipsis'], function(jquery, cookie, service, banner, router, ellipsis) {"use strict";

	var Attendance3 = ( function() {

			/**
			 * Constructor
			 *
			 */

			var validator;
			var membernames = [];
			var template;
			var TARGETVIEW;
			var ACTIVEINFO = {};
			var KIOSKMODE = false;

			function Attendance3() {

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
					if (ACTIVEINFO.sname && ACTIVEINFO.sname !== null) {
						jQuery('#s-name').val(ACTIVEINFO.sname);
						//jQuery('#s-img').attr('src', ACTIVEINFO.simg);
						jQuery('#g-name').val(ACTIVEINFO.gname);
						//jQuery('#g-img').attr('src', ACTIVEINFO.gimg);
						jQuery('#checkin-notes').val('');
						jQuery('.edittextarea').focus();
						setInterval(function() {
							GetClock();
						}, 1000);
					} else {
						router.go('/attendancekiosk');
					}
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
					jQuery('#invite-domain').empty();
					jQuery('.contentfull').empty();
					jQuery('#checkbox-control').text('Un-Select All');
					membernames = [];
					var memberscount = 0;
					for (var i = 0; i < activedomains.length; i++) {
						service.getMembersOnly(activedomains[i], {
							success : function(data) {
								var thisitem = template.clone();
								for (var j = 0; j < data.length; j++) {
									var roles = JSON.stringify(data[j].roles);
									if (roles.indexOf('ROLE_TIER3') !== -1) {
										memberscount = memberscount + 1;
										jQuery('.metadata').text(new Date());
										var thisitem = template.clone();
										if ((data[j].firstName === 'null' || data[j].firstName == null || data[j].firstName === "" ) && (data[j].lastName === 'null' || data[j].lastName == null || data[j].lastName === "")) {
											jQuery('.kioskcard-name', thisitem).text(data[j].email);
										} else {
											jQuery('.kioskcard-name', thisitem).text(data[j].firstName + ' ' + data[j].lastName);
										}
										jQuery('.kioskcard-checkbox', thisitem).attr('checked', 'checked');
										membernames.push(jQuery('.kioskcard-name', thisitem).text());
										jQuery('.kioskcard-id', thisitem).text('Id# ' + data[j].id);
										jQuery('.contentfull').append(thisitem);
									}
									if (j === data.length - 1) {
										$(".card-search").autocomplete({
											source : function(request, response) {
												var results = $.ui.autocomplete.filter(membernames, request.term);
												response(results.slice(0, 5));
											}
										});
										jQuery('.kioskcard-name').ellipsis({
											onlyFullWords : true
										});
										activateEvents();
									}
								}
							}
						});
					}
				}

				function activateEvents() {

					jQuery('.card-search').change(function(event) {
						var searchword = jQuery('.card-search').val().toUpperCase();
						var cardlist = jQuery('.contentfull .kioskcard-name');
						for (var i = 0; i < cardlist.length; i++) {
							var thiscard = cardlist[i];
							thiscard.parentElement.style.display = '';
							if (thiscard.textContent.toUpperCase().indexOf(searchword) != -1) {
								//thiscard.parentElement.stlye.display = '';
							} else {
								thiscard.parentElement.style.display = 'none';
							}
						}
					});

					jQuery('.kioskcancel').click(function() {
						jQuery('.kioskcard.cardactive').find('.card-form-container').hide();
						jQuery('.kioskcard.cardactive').find('.kioskaction').hide();
						jQuery('.kioskcard').removeClass('cardinactive');
						jQuery('.kioskcard').removeClass('cardactive');
					});

					jQuery('.kioskok').click(function() {
						if ($(this).val() === 'Check-In') {
							if (validateSubmit() == true) {
								$(".kioskcard.cardactive  i").fadeOut(800);
								setTimeout(function() {
									$(".kioskcard.cardactive  i").removeClass('icon-thumbs-down').addClass('icon-thumbs-up').css('color', '#007DBA');
									$(".kioskcard.cardactive  i").fadeIn(700);
									$(this).attr('disabled', 'true');
									$('.kioskcard.cardactive').find('.kiosk-flag-text').text('Checked In');
									jQuery('.kioskcard.cardactive input[type="text"]').attr("disabled", "disabled");
									jQuery('.kioskcard.cardactive textarea').attr("disabled", "disabled");
									jQuery('.kioskcard.cardactive select').attr("disabled", "disabled");
									jQuery('.kioskcard.cardactive > .kioskaction').find('.kioskok').val('Checked In').css('background-color', '#007DBA');

									setTimeout(function() {
										jQuery('.kioskcard.cardactive').find('.card-form-container').hide();
										jQuery('.kioskcard.cardactive').find('.kioskaction').hide();
										jQuery('.kioskcard').removeClass('cardinactive');
										jQuery('.kioskcard').removeClass('cardactive');
									}, 2000);
								}, 700);
							}

						} else {

						}
					});

					jQuery('.ui-menu-item').click(function(event) {
						var searchword = jQuery('.card-search').val().toUpperCase();
						var cardlist = jQuery('.contentfull .kioskcard-name');
						for (var i = 0; i < cardlist.length; i++) {
							var thiscard = cardlist[i];
							thiscard.parentElement.style.display = '';
							if (thiscard.textContent.toUpperCase().indexOf(searchword) != -1) {
								//thiscard.parentElement.stlye.display = '';
							} else {
								thiscard.parentElement.style.display = 'none';
							}
						}
					});
					jQuery('.card-search').keyup(function(event) {
						var searchword = jQuery('.card-search').val().toUpperCase();
						var cardlist = jQuery('.contentfull .kioskcard-name');
						for (var i = 0; i < cardlist.length; i++) {
							var thiscard = cardlist[i];
							thiscard.parentElement.style.display = '';
							if (thiscard.textContent.toUpperCase().indexOf(searchword) != -1) {
								//thiscard.parentElement.stlye.display = '';
							} else {
								thiscard.parentElement.style.display = 'none';
							}
						}
					});

					jQuery('.kioskflag').click(function() {
						if (!jQuery(this).parent().hasClass('cardactive')) {
							jQuery('.kioskcard').removeClass('cardactive');
							jQuery('.kioskcard').addClass('cardinactive');
							jQuery(this).parent().find('.card-form-container').show();
							jQuery(this).parent().find('.kioskaction').show();
							jQuery(this).parent().removeClass('cardinactive').addClass('cardactive');
							if (jQuery(this).find('i').hasClass('icon-thumbs-up')) {
								jQuery('.kioskcard.cardactive input[type="text"]').attr("disabled", "disabled");
								jQuery('.kioskcard.cardactive textarea').attr("disabled", "disabled");
								jQuery('.kioskcard.cardactive select').attr("disabled", "disabled");
								jQuery('.kioskcard.cardactive > .kioskaction').find('.kioskok').val('Check Out').css('background-color', '#e36607');
								setInfo('checkout');

							} else {
								jQuery('.kioskcard.cardactive input[type="text"]').removeAttr("disabled");
								jQuery('.kioskcard.cardactive textarea').removeAttr("disabled");
								jQuery('.kioskcard.cardactive select').removeAttr("disabled");
								jQuery('.kioskcard.cardactive.kioskok').val("Check In").css('background-color', 'green');
								setInfo('checkin');
							}
						}
					});
				}

				function setInfo(action) {
					if (action === 'checkin') {
						jQuery('.kiosk-info-title').html('Checked In From');
						jQuery('.kiosk-info-value').html('7 hours');
						jQuery('.kiosk-info-footer').html('+1 more hours');
					} else {
						jQuery('.kiosk-info-title').html('Checkout Time');
						jQuery('.kiosk-info-value').html('5:00pm');
						jQuery('.kiosk-info-footer').html('7:34 hours');
					}
				}

				function validateSubmit() {
					//Validate Name
					if (jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-name').val().length == 0) {
						jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-name').addClass('error');
					}
					if (jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-name').val().length > 0) {
						jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-name').removeClass('error');
					}
					if (jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-rel').val() == 'Please Select') {
						jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-rel').addClass('error');
					}
					if (jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-rel').val() != 'Please Select') {
						jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-rel').removeClass('error');
					}
					// if (jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-notes').val().length == 0) {
					// jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-notes').addClass('error');
					// }
					// if (jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-notes').val().length > 0) {
					// jQuery('.kioskcard.cardactive').find('.Attendance3-dropoff-notes').removeClass('error');
					// }
					if (jQuery('.kioskcard.cardactive').find('.error').length > 0) {
						return false;
						console.log('errors');
					}
					if (jQuery('.kioskcard.cardactive').find('.error').length == 0) {
						return true;
						console.log('All Good');
					}
				}

				function Identify(indentificationcode) {
					jQuery('.identify-code').removeClass('error');
					if (indentificationcode.length === 4 && indentificationcode.indexOf(' ') === -1 && jQuery.isNumeric(indentificationcode)) {
						//Valid case
						jQuery('#nopage-warning').fadeOut(500);
						jQuery('.main-content-header').fadeIn(400);
						jQuery('.main-content').fadeIn(400);
						jQuery('#project-nav').fadeIn(400);
						populateData();
					} else {
						//Invalid Case
						jQuery('.identify-code').addClass('error');
					}
				}


				this.activeStudent = function(gname, gid, gimg, Studentobj) {
					ACTIVEINFO.gname = gname;
					ACTIVEINFO.gid = gid;
					ACTIVEINFO.gimg = gimg;
					ACTIVEINFO.sname = Studentobj.name;
					ACTIVEINFO.sid = Studentobj.sid;
					ACTIVEINFO.simg = Studentobj.img;
				};

				this.pause = function() {

				};

				this.resume = function() {
					GetClock();
					populateData();
					banner.setBrand();
					jQuery('#action-canvas').show();
					jQuery('#attendanceaction').val('Check In');
					document.title = 'Zingoare | Attendance Kiosk';
				};

				this.init = function(args) {
					//Check for Cooke before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Attendance Kiosk';

					if (checkForActiveCookie() === true) {
						template = jQuery('#member-template').remove().attr('id', '');
						GetClock();
						populateData();

						//HTML Event - Actions
						jQuery('.subtitleinfo').click(function() {
							router.go('/attendancekiosk');
						});
						jQuery('.subtitleinfo-2').click(function() {
							router.go('/attendancekioskidentify');
						});
						
						jQuery('#attendanceaction').click(function(){
							if (jQuery('#attendanceaction').val() === 'Check In') {
								jQuery('#attendanceaction').val('Checked In');
								setTimeout(function(){
									jQuery('#action-canvas').slideUp(1000);
								}, 500);
							}
						});
						
						jQuery('#attendancecancel').click(function(){
							router.go('/attendancekiosk');
						});

					} // Cookie Guider
				};

			}

			return Attendance3;
		}());

	return new Attendance3();
});
