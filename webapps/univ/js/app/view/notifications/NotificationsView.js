define(['cookie', 'timeago', '../../service/DataService', '../../service/BannerService', '../../Notify', '../../Router'], function(cookie, timeago, service, banner, notify, router) {"use strict";

	var InviteView = ( function() {

			/**
			 * Constructor
			 */

			var NOTIFICATION;
			var pendingList;
			var validator;
			var ERROR = '<i style="padding:7px 20px; color:#e30716; float: left;" class="icon-exclamation icon-1x "></i>';
			var OK = '<i style="padding:7px 10px; color:#07e366; float: left;" class="icon-check icon-1x "></i>';
			var INFO = '<i style="padding:7px 10px; color:#0784E3; float: left;" class="icon-bell icon-1x "></i>';

			function InviteView() {

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
					jQuery('#card-canvas').empty();
					//jQuery('.cardsloading').fadeOut(200);
					jQuery('#noinfo').hide();
					NOTIFICATION = notify.getNotifications();
					var template = jQuery('#notify-template').attr('id', '');
					var mintemplate = jQuery('#notify-min-template').attr('id', '');
					var ackntemplate = jQuery('#ackn-notify-template').attr('id', '');
					//Backing the template
					jQuery('.div-template').append(template.attr('id', 'notify-template'));
					jQuery('.div-template').append(ackntemplate.attr('id', 'ackn-notify-template'));
					jQuery('.div-template').append(mintemplate.attr('id', 'notify-min-template'));
					jQuery('.metainfo').text(NOTIFICATION.length + ' Notification(s)');
					if (NOTIFICATION.length === 0) {
						jQuery('#noinfo').fadeIn(1000);
						jQuery('.cardsloading').fadeOut(200);
					}
					jQuery('.cardsloading').fadeOut(200);
					for (var i = NOTIFICATION.length - 1; i >= 0; i--) {
						var thistemplate = template.clone();
						jQuery('.title', thistemplate).text(NOTIFICATION[i].title);
						jQuery('.timeago', thistemplate).attr('title', NOTIFICATION[i].timestamp);
						if (NOTIFICATION[i].keyword && NOTIFICATION[i].keyword.length > 1 && NOTIFICATION[i].keyword !== 'ACKN') {
							if (NOTIFICATION[i].status == 'OK') {
								jQuery('.title', thistemplate).parent().prepend(OK);
							} else if (NOTIFICATION[i].status == 'INFO') {
								jQuery('.title', thistemplate).parent().prepend(INFO);
							} else {
								jQuery('.title', thistemplate).parent().prepend(ERROR);
							}
							jQuery('.inviteddomain', thistemplate).text(NOTIFICATION[i].domain);
							jQuery('.invitedby', thistemplate).text(NOTIFICATION[i].by);
							jQuery('.invitedmsg', thistemplate).text(NOTIFICATION[i].msg);
							jQuery('.action', thistemplate).text(NOTIFICATION[i].keyword);
							jQuery('.inviteid', thistemplate).text(NOTIFICATION[i].inviteid);
							thistemplate.attr('name', i);
							jQuery("abbr.timeago").timeago();
							jQuery('#card-canvas').append(thistemplate);
						} else if (NOTIFICATION[i].keyword === 'ACKN') {
							var thistemplate = ackntemplate.clone();
							jQuery('.inviteid', thistemplate).text(NOTIFICATION[i].title.split(':::')[2]);
							jQuery('.message', thistemplate).text(NOTIFICATION[i].title.split(':::')[0]);
							jQuery('.urgency', thistemplate).text(NOTIFICATION[i].title.split(':::')[1]);
							jQuery('.title', thistemplate).text('Access Update');
							if (NOTIFICATION[i].status == 'OK') {
								jQuery('.title', thistemplate).parent().prepend(OK);
							} else if (NOTIFICATION[i].status == 'INFO') {
								jQuery('.title', thistemplate).parent().prepend(INFO);
							} else {
								jQuery('.title', thistemplate).parent().prepend(ERROR);
							}
							jQuery('.timeago', thistemplate).attr('title', NOTIFICATION[i].timestamp);
							jQuery('.action', thistemplate).text('Acknowledge');
							thistemplate.attr('name', i);
							jQuery("abbr.timeago").timeago();
							jQuery('#card-canvas').append(thistemplate);
						} else {
							var thistemplate = mintemplate.clone();
							jQuery('.title', thistemplate).text(NOTIFICATION[i].title);
							if (NOTIFICATION[i].status == 'OK') {
								jQuery('.title', thistemplate).parent().prepend(OK);
							} else if (NOTIFICATION[i].status == 'INFO') {
								jQuery('.title', thistemplate).parent().prepend(INFO);
							} else {
								jQuery('.title', thistemplate).parent().prepend(ERROR);
							}
							jQuery('.timeago', thistemplate).attr('title', NOTIFICATION[i].timestamp);
							jQuery("abbr.timeago").timeago();
							jQuery('#card-canvas').append(thistemplate);
						}

						if (i === 0) {
							jQuery("abbr.timeago").timeago();
							jQuery('.action').click(function() {
								if (jQuery(this).text() !== 'Acknowledge') {
									var id = $(this).parent().parent().find('.inviteid').text();
									var indexof = $(this).parent().parent().attr('name');
									service.acceptInvite(id, {
										success : function(data) {
											notify.removeNotifications(indexof);
											populateData();
										}
									});
								}
								else {
									var id = $(this).parent().parent().find('.inviteid').text();
									var indexof = $(this).parent().parent().attr('name');
									service.acknNotification(id, {
										success : function(data) {
											notify.removeNotifications(indexof);
											populateData();
										}
									});
								}
							});
						}
					}
				}


				this.pause = function() {

				};

				this.resume = function() {
					jQuery('.edit-notify').hide();
					banner.HideAlert();
					banner.HideUser();
					banner.setBrand();
					populateData();
					document.title = 'Zingoare | Notifcations/Activity';
					notify.resetNewNotification();
				};

				this.init = function(args) {
					//Check for Cooke before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Notifcations/Activity';

					if (checkForActiveCookie() === true) {
						populateData();
						notify.resetNewNotification();
						//HTML Event - Actions

						jQuery('#notification-done').click(function() {
							router.returnToPrevious();
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
						jQuery('.brandnames').change(function() {
							banner.updateBrand(jQuery('.brandnames').val());
						});

						jQuery('.subtitleinfo').click(function() {
							router.returnToPrevious();
						});
						jQuery('.mainlogo').click(function() {
							router.go('/studentlist');
						});

					} // Cookie Guider
				};

			}

			return InviteView;
		}());

	return new InviteView();
});
