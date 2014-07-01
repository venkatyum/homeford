define(['modernizr', 'cookie', '../../service/DataService', 'validate', '../../Router', '../../Notify', '../../view/admin/AdminView', '../../view/studentlist/StudentListView'], function(modernizr, cookie, service, validate, router, notify, admin, studentlist) {"use strict";

	var MembersAddAdvView = ( function() {

			/**
			 * Constructor
			 *
			 */

			var validator;

			function MembersAddAdvView() {

				function populateData() {

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

				function clearForm() {
					jQuery('input[type="text"]').val('');
					jQuery('input[type="email"]').val('');
					//Fall Back					
					jQuery('#member-first-name').val('');
					jQuery('#member-last-name').val('');
					jQuery('#mother-name').val('');
					jQuery('#father-name').val('');
					jQuery('#father-email').val('');
					jQuery('#mother-email').val('');
					jQuery('#g1-name').val('');
					jQuery('#g1-email').val('');
					jQuery('#g2-name').val('');
					jQuery('#g2-email').val('');
					jQuery('#g3-name').val('');
					jQuery('#g3-email').val('');
					jQuery('.g2').hide();
					jQuery('.g3').hide();
					jQuery('.formlink').show();
					jQuery('#member-first-name').removeAttr('readonly');
					jQuery('#member-last-name').removeAttr('readonly');
					jQuery('#member-email').removeAttr('readonly');
					jQuery('#member-email').val('');
					validator.resetForm();
					jQuery('#member-first-name').focus();
				};

				this.pause = function() {

				};

				this.resume = function() {
					populateData();
					clearForm();
					document.title = 'Zingoare | Member / Student Add';
				};

				this.init = function(args) {
					//Check for Cookie before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Member / Student Add';
					jQuery('.g2').hide();
					jQuery('.g3').hide();
					jQuery('.formlink').show();

					if (checkForActiveCookie() === true) {

						populateData();

						//HTML Event - Actions
						jQuery('.modal_close').on('click', function() {
							router.returnToPrevious();
						});

						jQuery('.formlink').on('click', function() {
							if (!$('.formlink').prev().find('li:visible').last().hasClass('g2')) {
								jQuery('.g2').show();
								jQuery('#g2-name').focus();

							} else if (!$('.formlink').prev().find('li:visible').last().hasClass('g3')) {
								jQuery('.g3').show();
								jQuery('.formlink').hide();
								jQuery('#g3-name').focus();
							}
						});

						jQuery('#member-add').on('click', function() {
							if ($('#regularadd').valid()) {
								var kidobject = [];
								if (jQuery('#member-first-name').val().length > 0) {
									var person = {};
									person.firstName = jQuery('#member-first-name').val();
									person.lastName = jQuery('#member-last-name').val();
									person.userType = 'KID';
									kidobject.push(person);
								}
								if (jQuery('#father-name').val().length > 0) {
									var person = {};
									person.firstName = jQuery('#father-name').val();
									person.lastName = '';
									person.email = jQuery('#father-email').val();
									person.userType = 'FATHER';
									kidobject.push(person);
								}
								if (jQuery('#mother-name').val().length > 0) {
									var person = {};
									person.firstName = jQuery('#mother-name').val();
									person.lastName = '';
									person.email = jQuery('#mother-email').val();
									person.userType = 'MOTHER';
									kidobject.push(person);
								}
								if (jQuery('#g1-name').val().length > 0) {
									var person = {};
									person.firstName = jQuery('#g1-name').val();
									person.lastName = '';
									person.email = jQuery('#g1-email').val();
									person.userType = 'GAURDIAN1';
									kidobject.push(person);
								}
								if (jQuery('#g2-name').length > 0 && jQuery('#g2-name').val().length > 0) {
									var person = {};
									person.firstName = jQuery('#g2-name').val();
									person.lastName = '';
									person.email = jQuery('#g2-email').val();
									person.userType = 'GAURDIAN2';
									kidobject.push(person);
								}
								if (jQuery('#g3-name').length > 0 && jQuery('#g3-name').val().length > 0) {
									var person = {};
									person.firstName = jQuery('#g3-name').val();
									person.lastName = '';
									person.email = jQuery('#g3-email').val();
									person.userType = 'GAURDIAN3';
									kidobject.push(person);
								}
								service.registerKids(service.domainNametoID(jQuery.cookie('subuser')), kidobject, {
									success : function(data) {
										if (data.status !== 'error') {
											notify.showNotification('OK', data.message);
										} else {
											notify.showNotification('ERROR', data.message);
										}
										setTimeout(function() {
											studentlist.reload();
											router.returnToPrevious();
										}, 2000);
									}
								});
							} else {
								notify.showNotification('ERROR', 'One or more fields in the form are not entered properly');
							}

						});

						jQuery('#form-reset').click(function() {
							clearForm();
						});

						validator = jQuery("#regularadd").validate({
							rules : {
								memberfirstname : {
									required : true,
								},
								memberlastname : {
									required : true,
								},
								fathername : {
									required : true,
								},
								mothername : {
									required : true,
								},
								fatheremail : {
									required : true,
									email : true
								},
								motheremail : {
									required : true,
									email : true
								},
								g1email : {
									email : true
								},
								g2email : {
									email : true
								},
								g3email : {
									email : true
								},
							}
						});

					} // Cookie Guider
				};

			}

			return MembersAddAdvView;
		}());

	return new MembersAddAdvView();
});
