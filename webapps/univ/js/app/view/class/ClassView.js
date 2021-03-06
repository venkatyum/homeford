define(['modernizr', 'cookie', 'ellipsis', '../../service/DataService', '../../service/BannerService', '../../Router', '../../Notify', '../../view/ground/ToDoGroundView', '../../view/ground/QuizGroundView', '../../view/ground/BillGroundView', '../../view/todo/ToDoAssignView','timeago'], function(modernizr, cookie, ellipsis, service, banner, router, notify, todogroundview, quizgroundview, billgroundview, todoassign, timeago) {"use strict";

	var ClassView = ( function() {

			var PARMS = {
				"workBg" : "img\/classbg.png",
			};
			var ACTIVESTUDENTNAME;
			var ACTIVESTUDENTID;
			var HIGHPRIORITY = '<i name="High" style="margin-right:5px" class="icon-exclamation icon-1x "></i><i name="High" class="icon-exclamation icon-1x "></i><i name="High" class="icon-exclamation icon-1x "></i>';
			var LOWPRIORITY = '<i name="Low" style="margin-right:5px" class="icon-exclamation icon-1x "></i>';
			var NORMALPRIORITY = '<i name="Low" style="margin-right:5px" class="icon-exclamation icon-1x "></i><i name="Low" class="icon-exclamation icon-1x "></i>';
			var COLORBLOCKS = ['#4c8bff', '#ffcb05', '#5ca028', '#d2047d', '#c88562', '#09b1c1', '#b609c1', '#092fc1', '#abd838', '#49dd54'];

			/**
			 * Constructor
			 */
			function ClassView() {

				function showBG() {
					//jQuery.backstretch(PARMS.workBg);
				}

				//For Panels
				function populateClass() {
					jQuery('#class-canvas').empty();
					jQuery('.cardsloading').fadeIn(200);
					if (!ACTIVESTUDENTNAME || ACTIVESTUDENTNAME === "" || ACTIVESTUDENTNAME === null) {
						router.go('/studentlist');
					} else {
						jQuery('.subtitleinfo').text(ACTIVESTUDENTNAME);
						if (service.domainNametoID(jQuery.cookie('subuser'))) {
							CardsData();
						} else {
							setTimeout(function() {
								if (service.domainNametoID(jQuery.cookie('subuser'))) {
									CardsData();
								} else {
									setTimeout(function() {
										CardsData();
									}, 1000);
								}
							}, 500);
						}
					}
				}

				function CardsData() {
					service.MemberToDoList(service.domainNametoID(jQuery.cookie('subuser')), ACTIVESTUDENTID, {
						success : function(StudentData) {
							var _taskcount = 0;
							var _quizcount = 0;
							var _billcount = 0;
							var PanelTemplate = jQuery('#class-template').remove().attr('id', '');
							//BackingUp
							jQuery('.div-template').append(PanelTemplate.attr('id', 'class-template'));
							var COUNT = StudentData.length;
							if (COUNT === 0) {
								jQuery('#noinfo').fadeIn(1000);
								jQuery('.cardsloading').fadeOut(200);
								var selectedMembers = {};
								selectedMembers.text = 'User: ' + jQuery('.subtitleinfo').text();
								selectedMembers.list = [ACTIVESTUDENTID];
								todoassign.selectedMembers(selectedMembers);
								jQuery('.metainfo').text('0 Tasks');

							} else {
								jQuery('#noinfo').hide();

							}
							for (var i = 0; i < COUNT; i++) {
								jQuery('.cardsloading').fadeOut(200);
								var newboard = PanelTemplate.clone();
								if (StudentData[i].title.indexOf('@QUIZ') !== -1) {
									jQuery(newboard).addClass('quiz');
									newboard.attr('type', 'QUIZ');
									_quizcount = _quizcount + 1;
									jQuery('.metainfo').text(_taskcount + ' ToDo(s) / ' + _quizcount + ' Quiz(s) / ' + _billcount + ' Bills(s)');
									StudentData[i].title = (StudentData[i].title).split('@QUIZ')[1];
									jQuery('.class-header img', newboard).attr('src', 'img/quiztag.png');
								}
								else if (StudentData[i].title.indexOf('@BILL') !== -1) {
									jQuery(newboard).addClass('bill');
									newboard.attr('type', 'BILL');
									_billcount = _billcount + 1;
									jQuery('.metainfo').text(_taskcount + ' ToDo(s) / ' + _quizcount + ' Quiz(s) / ' + _billcount + ' Bills(s)');
									StudentData[i].title = (StudentData[i].title).split('@BILL')[1];
									jQuery('.class-header img', newboard).attr('src', 'img/billtag.png');
								} else {
									newboard.attr('type', 'TODO');
									_taskcount = _taskcount + 1;
									jQuery('.metainfo').text(_taskcount + ' ToDo(s) / ' + _quizcount + ' Quiz(s) / ' + _billcount + ' Bills(s)');
								}
								if (StudentData[i].title.length > 30) {
									var elipsisname = StudentData[i].title.substring(0, 30);
									elipsisname = elipsisname + '...';
									jQuery('.class-name', newboard).text(elipsisname);
								} else {
									jQuery('.class-name', newboard).text(StudentData[i].title);
								}
								jQuery('.class-desc', newboard).text(StudentData[i].desc);
								jQuery('.class-url', newboard).text(StudentData[i].helperUrl);
								jQuery('.class-youtube', newboard).text(StudentData[i].helperYoutube);
								if (StudentData[i].priority === 'High') {
									jQuery('.class-name', newboard).append(HIGHPRIORITY);
								} else if (StudentData[i].priority === 'Low') {
									jQuery('.class-name', newboard).append(LOWPRIORITY);
								} else {
									jQuery('.class-name', newboard).append(NORMALPRIORITY);
								}
								jQuery('.class-progress', newboard).progressbar();
								var value = parseInt(StudentData[i].percentage);
								jQuery('.class-progress', newboard).progressbar("value", value).removeClass("beginning middle end").addClass(value < 31 ? "beginning" : value < 71 ? "middle" : "end");
								jQuery('.class-progress-label', newboard).text(StudentData[i].percentage + '% Done');
								jQuery('.class-select', newboard).attr('name', StudentData[i].title);
								if (StudentData[i].todoEndDate) {
									jQuery('.due-date', newboard).text(StudentData[i].todoEndDate.split(' ')[0]);
								}
								if (StudentData[i].todoStartDate) {
									jQuery('.start-date', newboard).text(StudentData[i].todoStartDate.split(' ')[0]);
								}
								//jQuery('.class-anouncement', newboard).text(StudentData[i].desc);
								newboard.attr('name', StudentData[i].id);
								if (StudentData[i].comments[0]){
									newboard.attr('comments', StudentData[i].comments[0].text);
								}
								else {
									newboard.attr('comments', '');
								}
								//jQuery('.class-header',newboard).css('background-color','#'+(Math.random()*0xFFFFFF<<0).toString(16));
								jQuery('.class-header', newboard).css('background-color', COLORBLOCKS[i + 1]);
								if (i > 8) {
									jQuery('.class-header', newboard).css('background-color', COLORBLOCKS[i % 8]);
								}
								//jQuery('.footer', newboard).text('last worked on: ' + StudentData[i].lastUpdated);
								jQuery('.timeago', newboard).attr('title', new Date(StudentData[i].lastUpdated).toISOString());
								jQuery('#class-canvas').append(newboard);
								if (i === COUNT - 1) {
									jQuery("abbr.timeago").timeago();
									helperMediaQuiries();
									ActivatePanelEvents();
								}
							}
						}
					});
				}

				function ActivatePanelEvents() {
					jQuery('.classboard').on('click', function() {
						var selectedQuiz = {};
						selectedQuiz.name = $(this).find('.class-name').text();
						selectedQuiz.desc = $(this).find('.class-desc').text();
						selectedQuiz.progress = $(this).find('.class-progress-label').text().split("%")[0];
						selectedQuiz.priority = $(this).find('.icon-1x').attr('name');
						if (selectedQuiz.priority !== 'Low' && selectedQuiz.priority !== 'High') {
							selectedQuiz.priority = 'Normal';
						}
						selectedQuiz.id = $(this).attr('name');
						selectedQuiz.comments = $(this).attr('comments');
						selectedQuiz.dueby = $(this).find('.due-date').text();
						selectedQuiz.memberid = ACTIVESTUDENTID;
						selectedQuiz.membername = $('.subtitleinfo').text();
						selectedQuiz.url = $(this).find('.class-url').text();
						selectedQuiz.youtube = $(this).find('.class-youtube').text();
						if ($(this).attr('type') === 'TODO') {
							todogroundview.activeTask(selectedQuiz);
							router.go('/todoground', '/class');
						} else if ($(this).attr('type') === 'QUIZ') {
							quizgroundview.activeTask(selectedQuiz);
							router.go('/quizground', '/class');
						} else if ($(this).attr('type') === 'BILL') {
							billgroundview.activeTask(selectedQuiz);
							router.go('/billground', '/class');
						}
					});

				}

				function checkForActiveCookie() {
					if (jQuery.cookie('user')) {
						jQuery('#loggedin-user').text(jQuery.cookie('user'));
						banner.setBrand();
						return true;
					} else {
						router.go('/home', '/class');
						return false;
					}
				}

				function displayAlert() {
					//This should never show up.
					alert('Error in Loading! Please Refresh the page!');
				}

				function helperMediaQuiries() {
					if ($('.classboard').length > 2 && $('.main-content').width() > 480) {
						var width = $('.main-content').width() - 60;
						var rowholds = Math.floor(width / 254);
						var fillerspace = width - (rowholds * 254);
						//var eachfiller = 300+fillerspace/rowholds;
						var newmargin = fillerspace / rowholds;
						if (newmargin < 20) {
							newmargin = 20;
						}
						$('.classboard').css('margin-left', (newmargin / 2));
						$('.classboard').css('margin-right', newmargin / 2);
					}
				}


				this.activeStudent = function(activename, activeid) {
					ACTIVESTUDENTNAME = activename;
					ACTIVESTUDENTID = activeid;
				};

				this.pause = function() {

				};

				this.resume = function() {
					jQuery('.edit-notify').hide();
					banner.HideAlert();
					banner.setBrand();
					banner.HideUser();
					populateClass();
					document.title = 'Zingoare | Task Management';
					if (notify.getNewNotificationsCount() > 0) {
						jQuery('#alert-value').text(notify.getNewNotificationsCount());
					} else {
						jQuery('#alert-value').text('');
					}
				};

				this.init = function(args) {
					//Check for Cookie before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Task Management';

					if (checkForActiveCookie() === true) {
						//Rich Experience First.... Load BG
						showBG();
						//Rarely due to network latency if not loaded, just reload
						if (!$.ui) {
							location.reload();
						}
						populateClass();
						if (notify.getNewNotificationsCount() > 0) {
							jQuery('#alert-value').text(notify.getNewNotificationsCount());
						}
						//HTML Event - Actions
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

						$(window).resize(helperMediaQuiries);
						// When the browser changes size

						jQuery('#alert').on('click', function(e) {
							banner.ShowAlert();
							jQuery('.alertflyout').mouseleave(function() {
								setTimeout(function() {
									banner.HideAlert();
								}, 500);
							});
							jQuery('.flyout-label').text(notify.getNotifications().length + ' Notifications');
						});
						jQuery('.subtitleinfo-3').click(function() {
							router.go('/studentlist');
						});
						jQuery('.brandnames').change(function() {
							banner.updateBrand(jQuery('.brandnames').val());
						});
						jQuery('.mainlogo').click(function() {
							router.go('/studentlist');
						});
					} // Cookie Guider
				};

			}

			return ClassView;
		}());

	return new ClassView();
});
