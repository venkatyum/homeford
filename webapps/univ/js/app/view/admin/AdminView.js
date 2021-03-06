define(['raphael', 'cookie', 'elychart', '../../service/DataService', '../../service/BannerService', '../../Router', '../../view/invite/InviteView', '../../view/attendance/AttendanceListView', '../../Notify', 'timeago'], function(raphael, cookie, elychart, service, banner, router, invite, attendacelist, notify, timeago) {"use strict";

	var AdminView = ( function() {

			/**
			 * Constructor
			 *
			 */
			var PARMS = {
				"Bg" : "img\/4.jpg",
			};
			var MALEICON = '<i class="icon-male  icon-1x "></i>';
			var FEMALEICON = '<i class="icon-female  icon-1x "></i>';
			var EMAILICON = '<i class="icon-envelope-alt  icon-1x "></i>';
			var ACCEPTEDICON = '<i class="icon-check icon-1x "></i>';
			var PENDINGICON = '<i class="icon-spinner icon-1x "></i>';
			var ROLEMAP = {
				'ROLE_TIER1' : 'Owner',
				'ROLE_TIER2' : 'Admin',
				'ROLE_TIER3' : 'Member'
			};
			var ACTIVEDOMAINS = [];
			var ACTIVEDOMAINIDS = [];
			var PENDINGLIST = [];
			var DOMAINSTRENGTHDATA = {
				y : 0,
				b : 0
			};
			var POSITIONMAP = [];

			function AdminView() {

				function showBG() {
					//jQuery.backstretch(PARMS.Bg);
				}

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

				function getInfoByPrivilage() {
					helperMediaQuiries();
					var OWNERLEVEL = 0;
					var ADMINLEVEL = 0;
					$(".adminboard").each(function(i) {
						var item = $(this).find('.admin-donut').attr('name');
						POSITIONMAP.push(item);
					});
					// $(".adminboard").draggable({
					// scroll : true,
					// cursor : "move",
					// cursorAt : {
					// top : 150,
					// left : 125
					// },
					// snap : ".content",
					// snapMode : "outer",
					// });

					//Snap Feature
					// $(".adminboard").each(function(i) {
					// var item = $(this);
					// var item_clone = item.clone();
					// item.data("clone", item_clone);
					// var position = item.position();
					// if (position.left === 0) {
					// position.left = 55;
					// }
					// if (position.top === 0) {
					// position.top = 25;
					// }
					// item_clone.css({
					// left : position.left,
					// top : position.top,
					// visibility : "hidden"
					// }).attr("data-pos", i + 1);
					//
					// $("#cloned-slides").append(item_clone);
					// });
					//
					// $(".content").sortable({
					// revert : true,
					// scroll : false,
					// placeholder : "sortable-placeholder",
					// cursor : "move",
					// axis : 'x, y',
					//
					// start : function(e, ui) {
					// ui.helper.addClass("exclude-me");
					// $(".content .adminboard:not(.exclude-me)").css("visibility", "hidden");
					// ui.helper.data("clone").hide();
					// $(".cloned-slides .adminboard").css("visibility", "visible");
					// },
					//
					// stop : function(e, ui) {
					// $(".content .adminboard.exclude-me").each(function() {
					// var item = $(this);
					// var clone = item.data("clone");
					// var position = item.position();
					// clone.css("left", position.left);
					// clone.css("top", position.top);
					// clone.show();
					// item.removeClass("exclude-me");
					// });
					//
					// $(".content .adminboard").each(function() {
					// var item = $(this);
					// var clone = item.data("clone");
					// clone.attr("data-pos", item.index());
					// });
					// $(".content .adminboard").css("visibility", "visible");
					// $(".cloned-slides .adminboard").css("visibility", "hidden");
					// },
					//
					// change : function(e, ui) {
					// $(".content .adminboard:not(.exclude-me)").each(function() {
					// var item = $(this);
					// var clone = item.data("clone");
					// clone.stop(true, false);
					// var position = item.position();
					// clone.animate({
					// left : position.left,
					// top : position.top
					// }, 200);
					// });
					// }
					// });

					service.getUserProfile({
						success : function(UserProfile) {

							for (var i = 0; i < UserProfile.domains.length; i++) {
								if (UserProfile.domains[i].domainName === jQuery.cookie('subuser')) {
									if (ROLEMAP[UserProfile.domains[i].roleName] === 'Owner') {
										OWNERLEVEL = UserProfile.domains.length;
									} else {
										OWNERLEVEL = UserProfile.domains.length + 1;
									}
								}
							}
							if (OWNERLEVEL !== UserProfile.domains.length) {
								//User is not owner. Filter stuff.
								jQuery('.T1').hide();
								populateUserData();
								//populateInviteData();
								//Should clean memebr list out
								//Testing All Now
								// jQuery('.T1').show();
								// populateDomainData();
								// populateUserData();
							} else {
								setTimeout(function() {
									//console.log('donuts click active');
									activateDonutClicks();
								}, 1500);
								jQuery('.T1').show();
								populateDomainData();
								populateUserData();
								populateInviteData();
							}
						}
					});
				}

				function populateDomainData() {
					service.getDomainProfile(jQuery.cookie('_did'), {
						success : function(Profile) {
							var _addresses = 0;
							var _payments = 0;
							var _domaindata = [0, 0];
							//updatePanelValues('#domain-ids-value', '# ' + Profile.createdDate);
							jQuery('.timeago').attr('title', new Date(Profile.createdDate).toISOString());
							jQuery("abbr.timeago").timeago();
							setInterval(function() {
								if (jQuery('.timeago').text().indexOf(' ') !== -1){
									jQuery('.timeago').text(jQuery('.timeago').text().replace('about ', ''));
									var agoindex = jQuery('.timeago').text().indexOf(' ');
									var agonum = jQuery('.timeago').text().substring(0, agoindex);
									if (agonum === 'about') {
										agonum = '0';
									}
									if (agonum === 'less') {
										agonum = '0';
									}
									if (agonum === 'a' || agonum === 'an') {
										agonum = '1';
									}
									var agotext = jQuery('.timeago').text().substring(agoindex + 1);
									jQuery('.timeago').text(agonum);
									jQuery('#domain-from').text('active from ' + agotext);
								}
							}, 10);
							updatePanelValues('#domain-address-value', Profile.addresses.length);
							updatePanelValues('#domain-payement-value', 0);
							if (Profile.addresses[0]) {
								if (Profile.addresses[0].street1 && Profile.addresses[0].street1 !== null || Profile.addresses[0].street1 !== 'null' && Profile.addresses[0].street1.length > 1) {
									_addresses = _addresses + 1;
									updatePanelValues('#domain-address-value', _addresses);
									_domaindata[0] = _addresses;
								}
								if (Profile.addresses[1].street1 && Profile.addresses[1].street1 !== null || Profile.addresses[1].street1 !== 'null' && Profile.addresses[1].street1.length > 1) {
									_addresses = _addresses + 1;
									updatePanelValues('#domain-address-value', _addresses);
									_domaindata[0] = _addresses;
								}
							}
							if (Profile.billingInfo) {
								if (Profile.billingInfo.paypalemail && Profile.billingInfo.paypalemail !== null || Profile.billingInfo.paypalemail !== 'null' && Profile.billingInfo.paypalemail.length > 1) {
									_payments = _payments + 1;
									updatePanelValues('#domain-payment-value', _payments);
									_domaindata[1] = _payments;
								}
								if (Profile.billingInfo.checkpayable && Profile.billingInfo.checkpayable !== null || Profile.billingInfo.checkpayable !== 'null' && Profile.billingInfo.checkpayable.length > 1) {
									_payments = _payments + 1;
									updatePanelValues('#domain-payment-value', _payments);
									_domaindata[1] = _payments;
								}
							}
							updatePanelGraphs('#domain-donut', _domaindata);
						}
					});
				}

				function populateUserData() {
					//1 minutes
					setInterval(function() {
						timelyReloadAttendance();
					}, 60000);
					var _adminof = 0;
					var _ownerof = 0;
					var _profiledata = [0, 0];
					ACTIVEDOMAINS = [];
					ACTIVEDOMAINIDS = [];
					service.getUserProfile({
						success : function(UserProfile) {
							//updatePanelValues('#user-id-value', '# ' + UserProfile.id);
							updatePanelValues('#user-pendinginvites-value', UserProfile.pendingInvitees.length);
							if (UserProfile.domains.length > 0) {
								var activedomains = [];
								activedomains.push(service.domainNametoID(jQuery.cookie('subuser')));
								ACTIVEDOMAINIDS = activedomains;
								populateInviteData(ACTIVEDOMAINIDS);
								populateMembersData(ACTIVEDOMAINIDS);
								populateToDoData(ACTIVEDOMAINIDS);
								populateQuizData(ACTIVEDOMAINIDS);
								populateServicesData(ACTIVEDOMAINIDS);
								populateAttendanceKioskData(ACTIVEDOMAINIDS);
								populateInvoiceData(ACTIVEDOMAINIDS);
								if (ROLEMAP[UserProfile.domains[0].roleName] === 'Admin' || ROLEMAP[UserProfile.domains[0].roleName] === 'Member') {
									updatePanelValues('#user-admin-value', 1);
									_profiledata[1] = 1;
									updatePanelGraphs('#profile-donut', _profiledata);
								} else {
									updatePanelValues('#user-owner-value', 1);
									_profiledata[0] = 1;
									updatePanelGraphs('#profile-donut', _profiledata);
								}
							}
						}
					});
				}

				//Reload the attendance info during peak hours daily.
				//Morning 7-9 and evening 2-5 on weekdays.
				//every 5 mins
				function timelyReloadAttendance() {
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

					if (ap == " AM" && nhour >= 7 && nhour <= 9 && nday !== 'Saturday' && nday !== 'Sunday') {
						populateAttendanceKioskData();
					}
					if (ap == " PM" && nhour >= 4 && nhour <= 6 && nday !== 'Saturday' && nday !== 'Sunday') {
						populateAttendanceKioskData();
					}

				}

				function populateInviteData(activedomains) {
					var _inviteaccept = 0;
					var _invitepending = 0;
					var _invitetotal = 0;
					var _invitedata = [0, 0];
					//Catch Error
					if (activedomains) {
						for (var z = 0; z < activedomains.length; z++) {
							service.getInviteStatus(activedomains[z], {
								success : function(InviteList) {
									var INVITECOUNT = InviteList.length;
									_invitetotal = _invitetotal + INVITECOUNT;
									for (var i = 0; i < INVITECOUNT; i++) {
										updatePanelValues('#invite-total-value', _invitetotal);
										if (InviteList[i].status == 'ACCEPTED') {
											_inviteaccept = _inviteaccept + 1;
											_invitedata[0] = _inviteaccept;
											updatePanelValues('#invite-accept-value', _inviteaccept);
										} else {
											_invitepending = _invitepending + 1;
											updatePanelValues('#invite-pending-value', _invitepending);
											_invitedata[1] = _invitepending;
											PENDINGLIST.push(InviteList[i].email);
										}
										if (i === INVITECOUNT - 1) {
											invite.pendingList(PENDINGLIST);
											updatePanelGraphs('#invite-donut', _invitedata);
										}
									}
									updatePanelGraphs('#invite-donut', _invitedata);
								}
							});
						}
					}
				}

				function populateMembersData(activedomains) {
					var _memberst2 = 0;
					var _memberst3 = 0;
					var _memberstotal = 0;
					var _membersdata = [0, 0];
					for (var i = 0; i < activedomains.length; i++) {
						service.getDomainMembers(activedomains[i], {
							success : function(data) {
								for (var j = 0; j < data.length; j++) {
									for (var z = 0; z < data[j].domains.length; z++) {
										if (data[j].domains[z].id === parseInt(jQuery.cookie('_did')) && data[j].domains[z].roleStatus == 'ACTIVE') {
											_memberst3 = _memberst3 + 1;
											_memberst2 = _memberst2 + data[j].parents.length;
											_memberstotal = _memberst2 + _memberst3;
											updatePanelValues('#members-t3-value', _memberst3);
											updatePanelValues('#members-t2-value', _memberst2);
											updatePanelValues('#members-total-value', _memberstotal);
											_membersdata[0] = _memberst2;
											_membersdata[1] = _memberst3;
											if (j === data.length - 1) {
												updatePanelGraphs('#members-donut', _membersdata);
											}
										}
									}
								}
								updatePanelGraphs('#members-donut', _membersdata);
							}
						});
					}
				}

				function populateToDoData(activedomains) {
					var quizdata = [];
					var tododata = [];

					for (var i = 0; i < activedomains.length; i++) {
						service.DomainToDoList(activedomains[i], {
							success : function(data) {
								if (data.length === 0) {
									updatePanelGraphs('#todo-donut', [0, 0]);
									updatePanelGraphs('#activequiz-donut', [0, 0]);
								}
								for (var j = 0; j < data.length; j++) {
									if ((data[j].groupName).indexOf('@QUIZ') !== -1) {
										quizdata.push(data[j]);
									}
									if ((data[j].groupName).indexOf('@BILL') !== -1) {
										//quizdata.push(data[j]);
									} else {
										tododata.push(data[j]);
									}
									if (j === data.length - 1) {
										activetodos(tododata);
										activequiz(quizdata);
									}
								}
							}
						});
					}
				}

				function activetodos(data) {
					var _todototal = 0;
					var _tododone = 0;
					var _todopercentage = 0;
					var _tododata = [0, 0];
					_todototal = _todototal + data.length;
					_tododata[0] = _todototal;
					updatePanelValues('#todo-grouptotal-value', _todototal);
					var _todogross = 0;
					for (var j = 0; j < data.length; j++) {
						_todogross = _todogross + data[j].todos.length;
						_tododata[1] = _todogross;
						updatePanelValues('#todo-total-value', _todogross);
						for (var k = 0; k < data[j].todos.length; k++) {
							_todopercentage = (_todopercentage + data[j].todos[k].percentage);
							updatePanelValues('#todo-progress-value', _todopercentage + ' %');
						}
						if (j === data.length - 1) {
							updatePanelGraphs('#todo-donut', _tododata);
							var percentage = Math.ceil(_todopercentage / parseInt(jQuery('#todo-total-value').text()));
							updatePanelValues('#todo-progress-value', percentage + ' %');
						}
					}
					updatePanelGraphs('#todo-donut', _tododata);
				}

				function activequiz(data) {
					var _quiztotal = 0;
					var _quizdone = 0;
					var _quizpercentage = 0;
					var _quizdata = [0, 0];
					_quiztotal = _quiztotal + data.length;
					_quizdata[0] = _quiztotal;
					updatePanelValues('#activequiz-grouptotal-value', _quiztotal);
					var _quizgross = 0;
					for (var j = 0; j < data.length; j++) {
						_quizgross = _quizgross + data[j].todos.length;
						_quizdata[1] = _quizgross;
						updatePanelValues('#activequiz-total-value', _quizgross);
						for (var k = 0; k < data[j].todos.length; k++) {
							_quizpercentage = (_quizpercentage + data[j].todos[k].percentage);
							updatePanelValues('#activequiz-average-value', _quizpercentage + ' %');
						}
						if (j === data.length - 1) {
							updatePanelGraphs('#activequiz-donut', _quizdata);
							var percentage = Math.ceil(_quizpercentage / parseInt(jQuery('#activequiz-total-value').text()));
							updatePanelValues('#activequiz-average-value', percentage + ' %');
						}
					}
					updatePanelGraphs('#activequiz-donut', _quizdata);
				}

				function populateQuizData(activedomains) {
					var _quiztotal = 0;
					var _questioncount = 0;
					var _quizpercentage = 0;
					var _quizdata = [0, 0];
					for (var i = 0; i < activedomains.length; i++) {
						service.DomainQuizList(activedomains[i], {
							success : function(data) {
								_quiztotal = _quiztotal + data.length;
								for (var j = 0; j < data.length; j++) {
									_questioncount = _questioncount + parseInt(data[j].questionCount);
								}
								_quizdata[0] = _quiztotal;
								_quizdata[1] = _questioncount;
								updatePanelValues('#quiz-grouptotal-value', _quiztotal);
								updatePanelValues('#question-total-value', _questioncount);
								if (_quiztotal > 0) {
									updatePanelValues('#quiz-average-value', Math.ceil(_questioncount / _quiztotal));
								} else {
									updatePanelValues('#quiz-average-value', 0);
								}
								var _quizgross = 0;
								updatePanelGraphs('#quiz-donut', _quizdata);
								// for (var j = 0; j < data.length; j++) {
								// _todogross = _todogross + data[j].todos.length;
								// _tododata[1] = _todogross;
								// updatePanelValues('#todo-total-value', _todogross);
								// for (var k = 0; k < data[j].todos.length; k++) {
								// _todopercentage = (_todopercentage + data[j].todos[k].percentage);
								// updatePanelValues('#todo-progress-value', _todopercentage + ' %');
								// }
								// if (j === data.length - 1) {
								// updatePanelGraphs('#todo-donut', _tododata);
								// var percentage = Math.ceil(_todopercentage / parseInt(jQuery('#todo-total-value').text()));
								// updatePanelValues('#todo-progress-value', percentage + ' %');
								// }
								// }
							}
						});
					}
				}

				function populateServicesData(activedomains) {
					var _servicestotal = 0;
					var _servicesactive = 0;
					var _servicesinactive = 0;
					var _servicesdata = [0, 0];
					for (var i = 0; i < activedomains.length; i++) {
						service.ListAllServices(activedomains[i], {
							success : function(data) {
								_servicestotal = _servicestotal + data.length;
								for (var j = 0; j < data.length; j++) {
									if (data[j].status === 'Active') {
										_servicesactive = _servicesactive + 1;
										updatePanelValues('#services-active-value', _servicesactive);
										_servicesdata[0] = _servicesactive;
									} else {
										_servicesinactive = _servicesinactive + 1;
										updatePanelValues('#services-inactive-value', _servicesinactive);
										_servicesdata[1] = _servicesinactive;
									}
								}
								updatePanelValues('#services-total-value', _servicestotal);
								updatePanelGraphs('#services-donut', _servicesdata);
							}
						});
					}
				}

				function populateAttendanceKioskData(activedomains) {
					//To support autorefresh
					if (!activedomains || activedomains == null) {
						var activedomains = [];
						activedomains.push(jQuery.cookie('_did'));
						//Update alert counter
						if (notify.getNewNotificationsCount() > 0) {
							jQuery('#alert-value').text(notify.getNewNotificationsCount());
						} else {
							jQuery('#alert-value').text('');
						}
					}
					//defaulting to 0th index
					service.getDomainMembers(activedomains[0], {
						success : function(data) {
							var _noshow = data.length;
							var _checkin = 0;
							var _checkout = 0;
							var _checkindata = [0, 0];
							var studentids = [];
							for (var i = 0; i < activedomains.length; i++) {
								service.checkInStats(activedomains[0], {
									success : function(data) {
										for (var j = 0; j < data.length; j++) {
											if (data[j].type === 'CHECKIN') {
												if (studentids.indexOf(data[j].kid.id) === -1) {
													studentids.push(data[j].kid.id);
												}
												_checkin = _checkin + 1;
												updatePanelValues('#attendance-in-value', _checkin);
												_checkindata[0] = _checkin;
											} else {
												if (studentids.indexOf(data[j].kid.id) === -1) {
													studentids.push(data[j].kid.id);
												}
												_checkout = _checkout + 1;
												updatePanelValues('#attendance-out-value', _checkout);
												_checkindata[1] = (_checkout);
											}
										}
										updatePanelValues('#attendance-in-value', _checkin);
										updatePanelValues('#attendance-out-value', (studentids.length - _checkin));
										_checkindata[1] = (studentids.length - _checkin);
										updatePanelValues('#attendance-noshow-value', _noshow - (studentids.length));
										updatePanelGraphs('#attendance-donut', _checkindata);
									}
								});
							}
						}
					});
				}

				function populateInvoiceData(activedomains) {
					//defaulting to 0th index
					service.getAllInvoices(activedomains[0], {
						success : function(data) {
							var _invoicestotal = data.length;
							var _grandtotal = 0;
							var _invoicesoverdue = 0;
							var _itemcount = 0;
							var _invoicedata = [0, 0];
							var studentids = [];
							for (var j = 0; j < data.length; j++) {
								_grandtotal = _grandtotal + data[j].grandTotal;
								_itemcount = _itemcount + data[j].invoiceItems.length;
								_invoicedata[0] = _invoicestotal;
							}
							updatePanelValues('#invoice-total-value', _invoicestotal);
							updatePanelValues('#invoice-items-value', _itemcount);
							updatePanelValues('#invoice-grand-value', '$' + _grandtotal);
							_invoicedata[1] = _itemcount;
							updatePanelGraphs('#invoice-donut', _invoicedata);
						}
					});
				}

				function updatePanelValues(name, value) {
					$(name).text(value);
				}

				function updatePanelGraphs(name, data) {
					if (data[0] == 0 && data[1] == 0) {
						data[0] = 100;
						$(name).chart({
							template : "novalue_chart",
							values : {
								serie1 : data
							},
							labels : [],
							tooltips : {
								serie1 : data
							},
							defaultSeries : {
								r : -0.5,
								values : [{
									plotProps : {
										fill : "#e6e6e6"
									}
								}, {
									plotProps : {
										fill : "#e6e6e6"
									}
								}]
							}
						});
					} else {
						$(name).chart({
							template : "pie_basic_2",
							values : {
								serie1 : data
							},
							labels : [],
							tooltips : {
								serie1 : data
							},
							defaultSeries : {
								r : -0.5,
								values : [{
									plotProps : {
										fill : "green"
									}
								}, {
									plotProps : {
										fill : "#0784E3"
									}
								}]
							}
						});
					}
				}

				function setCanvas() {
					if (!jQuery.elycharts.templates || jQuery.elycharts.templates == undefined) {
						location.reload(false);
					}
					jQuery.elycharts.templates['pie_basic_2'] = {
						type : "pie",
						style : {
							"background-color" : "white"
						},
						defaultSeries : {
							plotProps : {
								stroke : "white",
								"stroke-width" : 2, //upto 3
								opacity : 1
							},
							highlight : {
								newProps : {
									opacity : 0.6
								}
							},
							tooltip : {
								active : true,
								frameProps : {
									opacity : 1,
									roundedCorners : 10,
									fill : "white",
								}
							},
							label : {
								active : true,
								props : {
									fill : "#f3f3f3"
								}
							},
							startAnimation : {
								active : true,
								type : "avg"
							}
						}
					};

					jQuery.elycharts.templates['novalue_chart'] = {
						type : "pie",
						style : {
							"background-color" : "white"
						},
						defaultSeries : {
							plotProps : {
								stroke : "#e6e6e6",
								"stroke-width" : 3, //upto 3
								opacity : 1
							},
							highlight : {
								newProps : {
									opacity : 1
								}
							},
							tooltip : {
								active : false,
								frameProps : {
									opacity : 1,
									roundedCorners : 10,
									fill : "white",
								}
							},
							label : {
								active : false,
								props : {
									fill : "#7f7f7f"
								}
							},
							startAnimation : {
								active : true,
								type : "avg"
							}
						}
					};
				}

				function displayAlert() {
					//This should never show up.
					alert('Error in Loading! Please Refresh the page!');
				}

				function helperMediaQuiries() {
					if ($('.adminboard').length > 3 && $('#card-canvas').width() > 480) {
						var width = $('#card-canvas').width() - 30;
						var rowholds = Math.floor(width / 264);
						var fillerspace = width - (rowholds * 264);
						//var eachfiller = 300+fillerspace/rowholds;
						var newmargin = fillerspace / rowholds;
						if (newmargin < 20) {
							newmargin = 20;
						}
						$('.adminboard').css('margin-left', newmargin / 2);
						$('.adminboard').css('margin-right', newmargin / 2);
					}
				}

				function activateDonutClicks() {
					jQuery('path').click(function() {
						var gotopage = $(this).parent().parent().parent().parent().parent().next().find('a').attr('href');
						var filter = $(this).attr('filter');
						//console.log('filter by  ' + filter);
						if (gotopage == '#/attendancesummary') {
							attendacelist.setFilter(filter);
						}
						router.go(gotopage.split('#')[1]);
					});
				}


				this.getActiveDomains = function() {
					return ACTIVEDOMAINS;
				};

				this.getActiveDomainsIDs = function() {
					return ACTIVEDOMAINIDS;
				};

				this.reloadData = function() {
					populateData();
				};

				this.pause = function() {

				};

				this.resume = function() {
					showBG();
					banner.setBrand();
					jQuery('.edit-notify').hide();
					banner.HideAlert();
					banner.HideUser();
					getInfoByPrivilage();
					document.title = 'Zingoare | Admin Dashboard';
					if (notify.getNewNotificationsCount() > 0) {
						jQuery('#alert-value').text(notify.getNewNotificationsCount());
					} else {
						jQuery('#alert-value').text('');
					}

				};

				this.init = function(args) {
					//Check for Cookoverview-manageie before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Admin Dashboard';

					if (checkForActiveCookie() === true) {
						//Rich Experience First.... Load BG
						showBG();
						jQuery('.T1').hide();
						var progressbar = $("#to-do-progressbar");
						var progressLabel = $(".to-do-progress-label");
						if (notify.getNewNotificationsCount() > 0) {
							jQuery('#alert-value').text(notify.getNewNotificationsCount());
						}
						// jQuery("#to-do-accordion").accordion({
						// collapsible : true,
						// active : false
						// });
						// Get Privilage
						setCanvas();
						getInfoByPrivilage();

						$(window).resize(helperMediaQuiries);
						// When the browser changes size

						jQuery('.adminboard').on('click', function() {

						});
						jQuery('#user-name').on('click', function(e) {
							banner.ShowUser();
							jQuery('#signout').on('click', function(e) {
								banner.logout();
							});
							jQuery('#banner-dashboard').on('click', function(e) {
								banner.HideUser();
								router.go('/admin');
							});
							jQuery('.userflyout').mouseleave(function() {
								setTimeout(function() {
									banner.HideUser();
								}, 500);
							});
						});

						jQuery('#alert').on('click', function(e) {
							banner.ShowAlert();
							jQuery('.alertflyout').mouseleave(function() {
								setTimeout(function() {
									banner.HideAlert();
								}, 500);
							});
							jQuery('.flyout-label').text(notify.getNotifications().length + ' Notifications');
						});
						jQuery('#admin-done').on('click', function() {
							router.returnToPrevious();
						});

						jQuery('.brandnames').change(function() {
							banner.updateBrand(jQuery('.brandnames').val());
						});

						jQuery('.subtitleinfo').click(function() {
							//router.returnToPrevious();
							router.go('/studentlist');
						});
						jQuery('.mainlogo').click(function() {
							router.go('/studentlist');
						});
						// jQuery('.admin-donut').click(function(){
						// var idname = $(this).attr('name');
						// var posi = POSITIONMAP.indexOf(idname);
						// var toolti = '#elycharts_tooltip_'+(posi+1)+'_content';
						// console.log(jQuery(toolti).text());
						// //alert(idname + '  ' + (posi+1));
						// });

					} // Cookie Guider
				};

			}

			return AdminView;
		}());

	return new AdminView();
});
