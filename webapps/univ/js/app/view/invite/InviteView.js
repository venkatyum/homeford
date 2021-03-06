define(['cookie', '../../service/DataService', 'validate', '../../Router', '../../Notify', '../../view/admin/AdminView'], function(cookie, service, validate, router, notify, admin) {"use strict";

	var InviteView = ( function() {

			/**
			 * Constructor
			 *
			 */

			var ROLEMAP = {
				'ROLE_TIER1' : 'Owner',
				'ROLE_TIER2' : 'Admin',
				'ROLE_TIER3' : 'Member'
			};
			var activeDomains = [];
			var pendingList;
			var validator;

			function InviteView() {

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
					jQuery('#invite-domain').empty();
					service.getUserProfile({
						success : function(UserProfile) {
							var activeDomains = [];
							for (var i = 0; i < UserProfile.domains.length; i++) {
								if (UserProfile.domains[i].roleName === 'ROLE_TIER2' || UserProfile.domains[i].roleName === 'ROLE_TIER1') {
									if (activeDomains.indexOf(UserProfile.domains[i].domainName) === -1) {
										activeDomains.push(UserProfile.domains[i].domainName);
										jQuery('#invite-domain').append('<option>' + UserProfile.domains[i].domainName + '</option>');
									}
								}

								if (UserProfile.domains.length === 1) {
									jQuery('#invite-domain').val(UserProfile.domains[i].domainName);
								}
								if (i == UserProfile.domains.length - 1) {
									jQuery.validator.addMethod("domainValidation", function(value, element) {
										if (activeDomains.indexOf(value) === -1) {
											return false;
										} else
											return true;
									}, "Oops! You canot send invite to this domain!");
								}
							}
						}
					});
				}

				function clearForm() {
					jQuery('.form-item > input').val("");
					jQuery('#member-role').prop('checked', false);
					jQuery('.edit-notify').hide();
					jQuery('.modal_close').show();
					jQuery('#invite-message').val('');
					jQuery('#invite-email').val('');
				}


				this.pendingList = function(pendinglist) {
					pendingList = pendinglist;
				};

				this.pause = function() {

				};

				this.resume = function() {
					clearForm();
					populateData();
					validator.resetForm();
					document.title = 'Zingoare | Admin Invite';
				};

				this.init = function(args) {
					//Check for Cooke before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Admin Invite';

					if (checkForActiveCookie() === true) {

						populateData();

						//HTML Event - Actions
						jQuery('.modal_close').on('click', function() {
							router.returnToPrevious();
						});

						jQuery('#invite-send').on('click', function() {
							var roles = [{
								"roleName" : "ROLE_TIER2"
							}];
							//Defaulting to T2 and T3.
							roles = [{
								"roleName" : "ROLE_TIER2"
							}, {
								"roleName" : "ROLE_TIER3"
							}];
							if ($("#invite-form").valid()) {
								if (jQuery('#invite-message').val() === null || jQuery('#invite-message').val() === "") {
									jQuery('#invite-message').val("Hi, I am adding you as an admin to this domain. Register and use!!");
								}
								if ($('#member-role').is(":checked")) {
									roles = [{
										"roleName" : "ROLE_TIER2"
									}, {
										"roleName" : "ROLE_TIER3"
									}];
								}
								service.sendInvite(jQuery('#invite-email').val(), jQuery('#invite-message').val(), jQuery.cookie('subuser'), roles, {
									success : function(response) {
										if (response !== 'error') {
											clearForm();
											notify.showNotification('OK', response.message);
										} else {
											notify.showNotification('ERROR', response.message);
										}
									}
								});
								setTimeout(function() {
									//router.returnToPrevious();
									//admin.reloadData();
								}, 2000);
							} else {
								notify.showNotification('ERROR', 'One or more fields in the form are not entered properly');
							}

							//Need to update to handler
						});

						jQuery('#profile-password').change(function() {
							jQuery('#password-reenter-item').show();
						});

						jQuery.validator.addMethod("notRepeated", function(value, element) {
							if (pendingList) {
								if (pendingList.indexOf(value) === -1) {
									return true;
								} else
									return false;
							} else
								return true;

						}, "This email already has a request pending.");

						validator = jQuery("#invite-form").validate({
							rules : {
								invitedomain : {
									required : true,
									domainValidation : true
								},
								inviteemail : {
									required : true,
									email : true,
									notRepeated : true
								},
								roles : {
									required : true
								}
							}
						});

					} // Cookie Guider
				};

			}

			return InviteView;
		}());

	return new InviteView();
});
