define(['jqueryui', 'spin', 'plugins', 'cookie', 'carousel', 'swipe', '../../js/lib/Chart.min', '../../js/lib/raphael', '../../js/lib/morris.min', '../app/service/DataService', '../app/Router', '../app/SubUserEditView'], function(jqueryui, spin, plugins, cookie, carousel, swipe, chart, raphael, morris, service, router, subusereditview) {"use strict";

	var AdminView = ( function() {

			/**
			 * Constructor
			 *
			 */
			var PARMS = {
				"Bg" : "img\/classbg.png",
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
			}

			function AdminView() {

				function showBG() {
					jQuery.backstretch(PARMS.Bg);
				}

				function createPanels() {
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
						zIndex : 2e9,
						top : "auto",
						left : "auto"
					};
					var n = document.getElementById("preloader");
					var r = (new Spinner(t)).spin(n);
					var u = jQuery(".panel").width()
					var a = 560;
					var f = 40;
					jQuery("#wrapper-about").waitForImages(function() {
						r.stop();
						jQuery("#wrapper-about").animate({
							opacity : 1
						}, 600)
					});
					if (Modernizr.touch) {
						buildSwipe();
					} else {
						buildCarousal(u, f, t, n, r);
					}
					//ActivatePanelEvents();
				}

				function buildCarousal(u, f, t, n, r) {
					jQuery(".panel").each(function(t) {
						t === 0 ? jQuery(this).css({
							"margin-left" : f + "px"
						}) : t === 4 ? jQuery(this).css({
							"margin-left" : "1800px"
						}) : t === 5 ? jQuery(this).css({
							"margin-left" : "2240px"
						}) : jQuery(this).css({
							"margin-left" : f + t * (40 + u) + "px"
						});
						t === 5 && jQuery(this).css({
							"margin-right" : f + "px"
						})
					});

					var l = 0, c = function() {
						if (l === 0) {
							l++;
							jQuery("#subnav ul").children().removeClass("selected");
							jQuery("#nav-bios").addClass("selected");
							jQuery(".contain").animate({
								left : "-440px"
							}, 400)
						} else if (l === 1) {
							l++;
							jQuery(".contain").animate({
								left : "-880px"
							}, 400)
						} else if (l === 2) {
							l++;
							jQuery(".contain").animate({
								left : "-1320px"
							}, 400)
						} else if (l === 3) {
							l++;
							jQuery(".contain").animate({
								left : "-1760px"
							}, 400)
						} else if (l === 4) {
							l++;
							jQuery(".contain").animate({
								left : "-2200px"
							}, 400)
						} else if (l === 5) {
							l++;
							jQuery(".contain").animate({
								left : "-2640px"
							}, 400)
						} else if (l === 6) {
							l++;
							jQuery(".contain").animate({
								left : "-3080px"
							}, 400)
						} else if (l === 7) {
							l++;
							jQuery(".contain").animate({
								left : "-3520px"
							}, 400)
						} else if (l === 8) {
							l++;
							jQuery("#subnav ul").children().removeClass("selected");
							jQuery("#nav-connect").addClass("selected");
							jQuery(".contain").animate({
								left : "-3960px"
							}, 400)
						} else if (l === 9) {
							l++;
							jQuery("#subnav ul").children().removeClass("selected");
							jQuery("#nav-press").addClass("selected");
							jQuery(".contain").animate({
								left : "-4400px"
							}, 400)
						}
					}, h = function() {
						if (l === 1) {
							l--;
							jQuery("#subnav ul").children().removeClass("selected");
							jQuery("#nav-mgh").addClass("selected");
							jQuery(".contain").animate({
								left : "0px"
							}, 400)
						} else if (l === 2) {
							l--;
							jQuery(".contain").animate({
								left : "-440px"
							}, 400)
						} else if (l === 3) {
							l--;
							jQuery(".contain").animate({
								left : "-880px"
							}, 400)
						} else if (l === 4) {
							l--;
							jQuery(".contain").animate({
								left : "-1320px"
							}, 400)
						} else if (l === 5) {
							l--;
							jQuery(".contain").animate({
								left : "-1760px"
							}, 400)
						} else if (l === 6) {
							l--;
							jQuery(".contain").animate({
								left : "-2200px"
							}, 400)
						} else if (l === 7) {
							l--;
							jQuery(".contain").animate({
								left : "-2640px"
							}, 400)
						} else if (l === 8) {
							l--;
							jQuery("#subnav ul").children().removeClass("selected");
							jQuery("#nav-bios").addClass("selected");
							jQuery(".contain").animate({
								left : "-3080px"
							}, 400)
						} else if (l === 9) {
							l--;
							jQuery("#subnav ul").children().removeClass("selected");
							jQuery("#nav-connect").addClass("selected");
							jQuery(".contain").animate({
								left : "-3520px"
							}, 400)
						} else if (l === 10) {
							l--;
							jQuery("#subnav ul").children().removeClass("selected");
							jQuery("#nav-connect").addClass("selected");
							jQuery(".contain").animate({
								left : "-3960px"
							}, 400)
						}
					};
					jQuery("#next").bind("click", function() {
						c()
					});
					jQuery("#prev").bind("click", function() {
						h()
					});
					jQuery(document).bind("keyup", "right", function() {
						c()
					});
					jQuery(document).bind("keyup", "left", function() {
						h()
					})
					populateData();
					populateGraphs();
				}

				function populateGraphs() {
					//Class Progress Tracking.
					var studentdata = [{
						value : 30,
						color : "#F7464A"
					}, {
						value : 50,
						color : "#E2EAE9"
					}, {
						value : 100,
						color : "#D4CCC5"
					}];

					//Class Progress Tracking.
					var studentdata1 = [{
						value : 100,
						color : "#F7464A"
					}, {
						value : 100,
						color : "#E2EAE9"
					}, {
						value : 100,
						color : "#D4CCC5"
					}];

					var studentoptions = {
						segmentShowStroke : true,
						segmentStrokeColor : "#fff",
						segmentStrokeWidth : 2,
						percentageInnerCutout : 50,
						animation : false,
						animationSteps : 100,
						animationEasing : "easeOutBounce",
						animateRotate : true,
						animateScale : false,
						onAnimationComplete : null
					};

					var rankingdata = {
						labels : ["Maths", "Numbers", "Colors"],
						datasets : [{
							fillColor : "rgba(220,220,220,0.5)",
							strokeColor : "rgba(220,220,220,1)",
							data : [65, 59, 90]
						}, {
							fillColor : "rgba(151,187,205,0.5)",
							strokeColor : "rgba(151,187,205,1)",
							data : [28, 48, 40]
						}]
					};

					Morris.Line({
						element : 'accounts-chart',
						data : [{
							y : '2013-09',
							a : 13000,
							b : 11000
						}, {
							y : '2013-10',
							a : 15000,
							b : 14000
						}, {
							y : '2013-11',
							a : 9000,
							b : 8700
						}, {
							y : '2013-12',
							a : 9500,
							b : 9000
						}, {
							y : '2014-01',
							a : 14000,
							b : 11500
						}, {
							y : '2014-02',
							a : 17000,
							b : 13000
						}],
						xkey : 'y',
						xLabels : 'month',
						preUnits : '$',
						lineColors : ['#009ACD', '#e34a33'],
						lineWidth : 4,
						pointSize : 5,
						ykeys : ['a', 'b'],
						labels : ['Cash Inflow', 'Expenses']
					});

					Morris.Donut({
						element : 'student-donut-1',
						data : [{
							label : "October",
							value : 12
						}, {
							label : "Novemeber",
							value : 15
						}, {
							label : "December",
							value : 16
						}, {
							label : "January",
							value : 20
						}, {
							label : "Feburary",
							value : 19
						}, {
							label : "March",
							value : 25
						}]
					});
					Morris.Donut({
						element : 'student-donut-2',
						data : [{
							label : "October",
							value : 12
						}, {
							label : "Novemeber",
							value : 15
						}, {
							label : "January",
							value : 19
						}]
					});

					var rankingdata1 = {
						labels : ["Maths", "Numbers", "Colors"],
						datasets : [{
							fillColor : "rgba(220,220,220,0.5)",
							strokeColor : "rgba(220,220,220,1)",
							data : [80, 90, 90]
						}, {
							fillColor : "rgba(151,187,205,0.5)",
							strokeColor : "rgba(151,187,205,1)",
							data : [75, 98, 90]
						}]
					};
					var accountsData = {
						labels : ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
						datasets : [{
							fillColor : "rgba(220,220,220,0.5)",
							strokeColor : "rgba(220,220,220,1)",
							data : [1250, 1400, 1400, 1550, 2000, 1800],
						}, {
							fillColor : "rgba(151,187,205,0.5)",
							strokeColor : "rgba(151,187,205,1)",
							data : [1100, 1200, 1100, 1850, 1700, 1400]
						}]
					};
					var curentdata = [{
						value : 30,
						color : "#D97041"
					}, {
						value : 90,
						color : "#C7604C"
					}, {
						value : 64,
						color : "#21323D"
					}];
				}

				function checkForActiveCookie() {
					if (jQuery.cookie('user') && jQuery.cookie('user') !== 'home') {
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
					service.getUnivObject({
						success : function(UnivData) {
							//OverView Panel Load
							jQuery('.univ-name').text(UnivData[0].univname);
							jQuery('.univ-id').text(UnivData[0].id);
							jQuery('.univ-about').text(UnivData[0].about);
							jQuery('.univ-admin').text(UnivData[0].adminname);
							jQuery('.univ-created').text(UnivData[0].created);
							jQuery('.univ-email').text(UnivData[0].email);
							jQuery('.univ-phone').text(UnivData[0].phone);
							jQuery('.univ-address').text(UnivData[0].address);
							jQuery('.univ-faculty').text(UnivData[0].faculty.length);
							jQuery('.univ-students').text(UnivData[0].students.length);

							//Student Manage Panel Load
							var studentmintemplate = jQuery('#students-list-min-template').remove().attr('id', '');
							var COUNT = UnivData[0].students.length;
							for (var i = 0; i < COUNT; i++) {
								var newelement = studentmintemplate.clone();
								if (UnivData[0].students[i].gender === 'female') {
									jQuery('.students-list-min', newelement).html(FEMALEICON + '<strong>' + UnivData[0].students[i].name + '</strong>' + UnivData[0].students[i].id);
								} else {
									jQuery('.students-list-min', newelement).html(MALEICON + '<strong>' + UnivData[0].students[i].name + '</strong>' + UnivData[0].students[i].id);
								}
								jQuery('#students-list-min').append(newelement);
								jQuery("#students-list-min").sortable();
								jQuery('.students-list-min').on('click', function() {
									var userClicked = jQuery(this).find('strong').html();
									subusereditview.activeUser(userClicked);
									router.go('/admin/subuseredit', '/admin');
								});

							}
						}
					});
					service.getUserProfile({
						success : function(UserProfile) {
							//OverView Panel Load
							jQuery('.user-first-name').text(UserProfile.firstName);
							jQuery('.user-last-name').text(UserProfile.lastName);
							jQuery('.user-id').text(UserProfile.id);
							jQuery('.user-name').text(UserProfile.username);
							jQuery('.user-password').text('*******');
							jQuery('.user-email').text(UserProfile.email);
							jQuery('.user-phone').text(UserProfile.phoneNumber);
							if (UserProfile.domains.length === 1) {
								jQuery('#user-domain').text(UserProfile.domains[0].domainName + ' : ' + ROLEMAP[UserProfile.domains[0].roleName]);
							} else {
								for (var i = 0; i < UserProfile.domains.length; i++) {
									if (i === 0) {
										jQuery('#user-domain').text(UserProfile.domains[0].domainName + ' : ' + ROLEMAP[UserProfile.domains[0].roleName]);
									} else {
										var template = jQuery('#profile-domainview-template').attr('id', '');
										template.show();
										jQuery('#user-domain', template).text(UserProfile.domains[i].domainName + ' : ' + ROLEMAP[UserProfile.domains[0].roleName]);
										jQuery('#profileview-form').append(template);
									}
								}
							}
						}
					});
					service.getInviteStatus({
						success : function(InviteList) {
							jQuery('#admin-list-min').empty();
							var adminmintemplate = jQuery('#admin-list-min-template').remove().attr('id', '');
							//Forbackup
							var backupAdmintemplate = adminmintemplate.clone();
							backupAdmintemplate.attr('id', 'admin-list-min-template');
							jQuery('#manage-admin').append(backupAdmintemplate);
							adminmintemplate.show();
							var ADMINCOUNT = InviteList.length;
							for (var i = 0; i < ADMINCOUNT; i++) {
								var newadminelement = adminmintemplate.clone();
								if (InviteList[i].status == 'ACCEPTED') {
									jQuery('.admin-list-min', newadminelement).html(ACCEPTEDICON + '<strong>' + InviteList[i].email + '</strong>');
								} else {
									jQuery('.admin-list-min', newadminelement).html(PENDINGICON + '<strong>' + InviteList[i].email + '</strong>' + InviteList[i].status).addClass('pending');
								}
								jQuery('#admin-list-min').append(newadminelement);
								$("#admin-list-min").sortable();
								if (i === ADMINCOUNT - 1) {

								}
							}
						}
					});
				}

				function displayAlert() {
					//This should never show up.
					alert('Error in Loading! Please Refresh the page!');
				}


				this.reloadData = function() {
					populateData();
				}

				this.pause = function() {

				};

				this.resume = function() {
					showBG();
					//populateData();
				};

				this.init = function(args) {
					//Check for Cookoverview-manageie before doing any thing.
					//Light weight DOM.

					if (checkForActiveCookie() === true) {
						//Rich Experience First.... Load BG
						showBG();
						jQuery(".scroll-pane").jScrollPane();

						populateData();
						populateGraphs();

						//HTML Event - Actions
						jQuery('#signout-button').on('click', function(e) {
							service.Logout({
								success : function() {
									jQuery.removeCookie('user', {
										path : '/'
									});
									jQuery.removeCookie('subuser', {
										path : '/'
									});
									router.go('/home', 'admin');
									window.setTimeout('location.reload()', 500);
									// refresh after 1/2 sec
								},
							});

						});

						jQuery('#student-manage').on('click', function() {
							router.go('/admin/subuseradd', 'admin');
						});
						jQuery('.adminboard').on('click', function() {

						});
						jQuery('#admin-done').on('click', function() {
							router.go('/home', '/admin');
						});

					} // Cookie Guider
				};

			}

			return AdminView;
		}());

	return new AdminView();
});
