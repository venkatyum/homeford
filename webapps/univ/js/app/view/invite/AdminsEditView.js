define(['modernizr', 'cookie', '../../service/DataService', 'validate', '../../Router', '../../Notify', '../../view/admin/AdminView'], function(modernizr, cookie, service, validate, router, notify, admin) {"use strict";

	var AdminsEditView = ( function() {

			/**
			 * Constructor
			 *
			 */

			var ACTIVEINVITE;

			function AdminsEditView() {

				function populateData() {
					if (ACTIVEINVITE) {
						jQuery('#invite-email').val(ACTIVEINVITE.email);
						jQuery('#invite-status').val(ACTIVEINVITE.status);
						jQuery('#invite-domain').val(jQuery.cookie('subuser'));
						jQuery('#invite-roles').val(ACTIVEINVITE.roles);
						jQuery('#invite-sender').val(ACTIVEINVITE.invitedby);
					} else {
						router.go('/adminslist');
					}
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


				this.setInviteInfo = function(Info) {
					ACTIVEINVITE = Info;
				};

				this.pause = function() {

				};

				this.resume = function() {
					populateData();
					document.title = 'Zingoare | Admin Edit';
				};

				this.init = function(args) {
					//Check for Cookoverview-manageie before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Admin Edit';

					if (checkForActiveCookie() === true) {

						populateData();

						//HTML Event - Actions
						jQuery('.modal_close').on('click', function() {
							router.returnToPrevious();
						});

						jQuery('#invite-edit').on('click', function() {
							if ($(".edit-form").valid()) {
								alert('Feature Not Available yet!!!');
								setTimeout(function() {
									router.returnToPrevious();
								}, 1000);
							}
						});

						jQuery('.negative').click(function() {
							alert('Feature Not Available yet!!!');
							setTimeout(function() {
								router.returnToPrevious();
							}, 1000);
						});

					} // Cookie Guider
				};

			}

			return AdminsEditView;
		}());

	return new AdminsEditView();
});
