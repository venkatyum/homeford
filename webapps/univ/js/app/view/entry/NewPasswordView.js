define(['cookie', '../../service/DataService', 'validate', '../../Router', '../../Notify'], function(cookie, service, validate, router, notify) {"use strict";

	var ResetPasswordView = ( function() {

			/**
			 * Constructor
			 *
			 */

			var validator;
			var info;
			var memberid;

			function ResetPasswordView() {

				function checkForActiveCookie() {
					if (jQuery.cookie('user')) {
						router.go('/studentlist', '/entry');
						return true;
					} else {
						return false;
					}
				}

				function clearForm() {
					jQuery('#new-user-password').val('').focus();
					jQuery('#new-user-password-repeat').val('');
					jQuery('#new-user-name').val('');
				}


				$.validator.addMethod("passwordvalid", function(value, element, param) {
					var ValidPwd = (/^[^<>;,"'&\\\/|+:= ]+$/.test(value));
					return (value.length == 0 || ValidPwd);
				}, 'Invalid Password Choice');

				this.resetinfo = function(email, id) {
					clearForm();
					info = email;
					memberid = id;
					jQuery('#new-user-name').val(email);
				};

				this.pause = function() {

				};

				this.resume = function() {
					clearForm();
					checkForActiveCookie();
					//validator.resetForm();
					document.title = 'Zingoare | New Password';
				};

				this.init = function() {
					//Check for Cooke before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | New Password';

					if (checkForActiveCookie() === false) {
						clearForm();
						jQuery('#new-user-name').val(info);

						//HTML Event - Actions
						jQuery('.modal_close').on('click', function() {
							router.returnToPrevious();
						});

						validator = jQuery("#invite-form").validate({
							rules : {
								Rusername : {
									required : true,
									email : true
								},
								Rpassword : {
									required : true,
									passwordvalid : '#new-user-password'
								},
								Rpasswordrepeat : {
									required : true,
									equalTo : "#new-user-password"
								}
							}
						});

						jQuery('#new-user-password-repeat').bind('keypress', function(e) {
							if (e.keyCode === 13) {
								e.preventDefault();
								if ($("#invite-form").valid()) {
									var email = jQuery('#new-user-name').val();
									var password = jQuery('#new-user-password').val();
									service.updatePassword(memberid, password, {
										success : function(response) {
											if (response.status !== 'error') {
												notify.showNotification('OK', 'New Password Set. Please login now', 'entry', 4000);
											} else {
												
												notify.showNotification('ERROR', response.message);
											}
										}
									});
								} else {
									notify.showNotification('ERROR', 'One or more fields in the form are not entered properly');
								}
							}
						});

						jQuery('#update-password').click(function() {
							if ($("#invite-form").valid()) {
								var email = jQuery('#new-user-name').val();
								var password = jQuery('#new-user-password').val();
								service.updatePassword(memberid, password, {
									success : function(response) {
										if (response.status !== 'error') {
											notify.showNotification('OK', 'New Password Set. Please login now', 'entry', 4000);
										} else {
											notify.showNotification('ERROR', response.message);
										}
									}
								});
							} else {
								notify.showNotification('ERROR', 'One or more fields in the form are not entered properly');
							}
						});

					} // Cookie Guider
				};

			}

			return ResetPasswordView;
		}());

	return new ResetPasswordView();
});
