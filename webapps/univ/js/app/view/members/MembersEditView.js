define(['modernizr', 'cookie', 'jquerywidget', 'transport', 'fileupload', '../../service/DataService', 'validate', '../../Router', '../../Notify', '../../view/admin/AdminView', '../../view/members/MembersRecordAddView','../../view/studentlist/StudentListView'], function(modernizr, cookie, jquerywidget, transport, fileupload, service, validate, router, notify, admin, memberrecord,studentlist) {"use strict";

	var MembersEditView = ( function() {

			/**
			 * Constructor
			 *
			 */

			var ACTIVEMEMBER;
			var formData_input;
			var leadtemplate;
			var followtemplate;
			var serviceIDs = [];
			var deleteItemServicesIds = [];
			var CHECKBOXSPAN = '<span class="checkbox-span"></span>';
			var DIALOGBODY = '<div id="note-dialog" title="Confirm!"> <p><span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 20px 0;"></span>Are you sure?</p></div>';

			function MembersEditView() {

				function populateData() {
					if (ACTIVEMEMBER) {
						$('input[type="checkbox"]').removeAttr('checked');
						if (ACTIVEMEMBER.relation === 'Student') {
							jQuery('.form-checkboxs').show();
							jQuery('.negative').show();
							var domainIDs = [];
							domainIDs.push(service.domainNametoID(jQuery.cookie('subuser')));
							getServices(domainIDs);
							jQuery('#member-record').show();
							jQuery('#member-email').removeAttr('readonly');
						} else {
							jQuery('.form-checkboxs').hide();
							jQuery('#member-record').hide();
							jQuery('.negative').hide();
							jQuery('#member-email').attr('readonly',"readonly");
						}
						jQuery('#member-first-name').val(ACTIVEMEMBER.firstname);
						jQuery('#member-last-name').val(ACTIVEMEMBER.lastname);
						jQuery('#member-id').val(ACTIVEMEMBER.id);
						memberrecord.setuser(ACTIVEMEMBER.id, ACTIVEMEMBER.firstname + ' ' + ACTIVEMEMBER.lastname);
						jQuery('#member-rel').val(ACTIVEMEMBER.relation);
						jQuery('#member-email').val(ACTIVEMEMBER.email);
						jQuery('#member-phone').val(ACTIVEMEMBER.phone);
						jQuery('#member-domains').val(ACTIVEMEMBER.domain);
						jQuery('#member-roles').val(ACTIVEMEMBER.roles);
						jQuery('#member-profile-image').attr('src', ACTIVEMEMBER.image);
						jQuery('#member-pin').val(ACTIVEMEMBER.kioskpin);
						jQuery('#new-member-profile-image').attr('data-url', '/zingoare/api/profileupload/' + ACTIVEMEMBER.id);
						setTimeout(function() {
							// if (ACTIVEMEMBER.services.length === 0) {
							// jQuery('#services-grid').hide();
							// }
							for (var j = 0; j < ACTIVEMEMBER.services.length; j++) {
								$('input[serviceid="' + ACTIVEMEMBER.services[j] + '"]').attr('checked', 'checked');
								generateServiceArray();
							}
						}, 250);
						ActivateClicks();
					} else {
						router.go('/membersgrid');
					}
				}

				function generateServiceArray() {
					serviceIDs = [];
					deleteItemServicesIds = [];
					$('input[type=checkbox]').each(function() {
						if (this.checked) {
							serviceIDs.push(jQuery(this).attr('serviceid'));
						} else {
							deleteItemServicesIds.push(jQuery(this).attr('serviceid'));
						}
					});
				}

				function initDialog() {
					jQuery('body').append(DIALOGBODY);
					$("#note-dialog").dialog({
						autoOpen : false,
						show : {
							effect : "blind",
							duration : 300
						},
						hide : {
							effect : "explode",
							duration : 300
						},
						modal : false,
						buttons : {
							"Yes " : toggleMemberStatus,
						},
						close : function() {
							$(this).dialog("close");
						}
					});
				}

				function toggleMemberStatus() {
					$(this).dialog("close");
					if ($('.negative').val() == 'Make Inactive') {
						service.disableUser(jQuery.cookie('_did'), jQuery('#member-id').val(), {
							success : function(response) {
								if (response.status !== 'error') {
									notify.showNotification('OK', response.message);
									$('.negative').val('Make Active');
									$('.negative').css('background-color', 'green');
									studentlist.reload();
								} else {
									notify.showNotification('ERROR', response.message);
								}
							}
						});
					} else {
						service.enableUser(jQuery.cookie('_did'), jQuery('#member-id').val(), {
							success : function(response) {
								if (response.status !== 'error') {
									notify.showNotification('OK', response.message);
									$('.negative').val('Make Inactive');
									$('.negative').css('background-color', 'red');
									studentlist.reload();
								} else {
									notify.showNotification('ERROR', response.message);
								}
							}
						});
					}
				}

				function getServices(activedomains) {
					jQuery('.servicetemplate').remove();
					//jQuery('.edit-select').empty();
					jQuery('#member-list').css('color', 'black');
					for (var i = 0; i < activedomains.length; i++) {
						var thisdomaininstance = activedomains[i];
						service.ListAllServices(thisdomaininstance, {
							success : function(data) {
								for (var j = 0; j < data.length; j++) {
									if (j === 0) {
										var thisservice = leadtemplate.clone();
										jQuery('.services-list', thisservice).parent().append(data[j].name);
										jQuery('.services-list', thisservice).attr('sname', data[j].name).attr('cost', data[j].unit_price).attr('tax', data[j].tax).attr('desc', data[j].description).attr('serviceid', data[j].id);
										jQuery('.services-list', thisservice).parent().append(CHECKBOXSPAN);
										jQuery('.checkbox-span', thisservice).text('Cost: $ ' + data[j].unit_price);
									} else {
										var thisservice = followtemplate.clone();
										jQuery('.services-list', thisservice).parent().append(data[j].name);
										jQuery('.services-list', thisservice).attr('sname', data[j].name).attr('cost', data[j].unit_price).attr('tax', data[j].tax).attr('desc', data[j].description).attr('serviceid', data[j].id);
										jQuery('.services-list', thisservice).parent().append(CHECKBOXSPAN);
										jQuery('.checkbox-span', thisservice).text('Cost: $ ' + data[j].unit_price);
									}

									if (data[j].status === 'Active' || data[j].status === 'ACTIVE') {
										jQuery('#services-grid').append(thisservice);
									}
								}
							}
						});
					}
				}

				function showCoords(c) {
					// variables can be accessed here as
					// c.x, c.y, c.x2, c.y2, c.w, c.h
				};

				function ActivateClicks() {
					$('#new-member-profile-image').fileupload({
						add : function(e, data) {
							var uploadErrors = [];
							var acceptFileTypes = /^image\/(gif|jpe?g|png)$/i;
							if (data.originalFiles[0]['type'].length && !acceptFileTypes.test(data.originalFiles[0]['type'])) {
								uploadErrors.push('Only .jpg, .gif and .png types are allowed');
							}
							if (data.originalFiles[0]['size'].length && data.originalFiles[0]['size'] > 5000000) {
								uploadErrors.push('Filesize is too big');
							}
							if (uploadErrors.length > 0) {
								alert(uploadErrors.join("\n"));
							} else {
								data.submit();
							}
						},
						dataType : 'json',
						formData : formData_input,
						submit : function(e, data) {
							jQuery('#member-profile-image').attr('src', 'img/loader.gif').addClass('loading');
						},
						done : function(e, data) {
							$.each(data.result.files, function(index, file) {
								jQuery('#member-profile-image').removeClass('loading').attr('src', '/zingoare/api/profileupload/picture/' + file.id);
								service.cleanUserProfile();
								$('#new-member-profile-image').fileupload('destroy');
							});
						}
					});
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


				this.setMemberInfo = function(MemberInfo) {
					ACTIVEMEMBER = MemberInfo;
				};

				this.pause = function() {

				};

				this.resume = function() {
					populateData();
					jQuery('.edit-notify').hide();
					document.title = 'Zingoare | Members Edit';
					initDialog();
					$('.negative').val('Make Inactive');
					$('.negative').css('background-color', '#e30716');
					//$('#new-member-profile-image').fileupload('destroy');
				};

				this.init = function(args) {
					//Check for Cookoverview-manageie before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Members Edit';

					if (checkForActiveCookie() === true) {
						leadtemplate = jQuery('#service-lead').remove().attr('id', '');
						followtemplate = jQuery('#service-follow').remove().attr('id', '');
						populateData();
						initDialog();

						//HTML Event - Actions
						jQuery('.modal_close').on('click', function() {
							router.returnToPrevious();
						});

						jQuery('.negative').click(function() {
							jQuery("#note-dialog").dialog("open");
						});

						jQuery('#member-edit').on('click', function() {
							generateServiceArray();
							if ($(".edit-form").valid()) {
								service.setUserProfileOnly(jQuery('#member-id').val(), jQuery('#member-first-name').val(), jQuery('#member-last-name').val(), jQuery('#member-email').val(), jQuery('#member-phone').val(), jQuery('#member-pin').val(), {
									success : function(response) {
										if (response.status !== 'error') {
											var kidid = [];
											kidid.push(jQuery('#member-id').val());
											service.AssignService(service.domainNametoID(jQuery.cookie('subuser')), kidid, serviceIDs, deleteItemServicesIds, {
												success : function(data) {
													if (data.status !== 'error') {
														notify.showNotification('OK', jQuery('#member-first-name').val() + ' profile updated!');
														setTimeout(function() {
															router.returnToPrevious();
														}, 2000);
													} else {
														notify.showNotification('ERROR', data.message);
													}
												}
											});
										} else {
											notify.showNotification('ERROR', response.message);
										}
									}
								});
							} else {
								notify.showNotification('ERROR', 'One or more fields in the form are not entered properly');
							}
						});

						jQuery('#member-record').on('click', function() {
							router.go('/membersrecordadd');
						});

						jQuery('#member-profile-image').click(function() {
							formData_input = $('#new-member-profile-image').serializeArray();
							$('input[type=file]').click();
						});

						jQuery(".edit-form").validate({
							rules : {
								memberfirstname : {
									required : true,
								},
								memberlastname : {
									required : true,
								},
								memberemail : {
									email : true
								},
								memberpin : {
									required : true,
									digits : true,
									maxlength : 4,
									minlength : 4
								},
								services : {
									required : true
								}
							},
							messages : {
								services : "You must check at least 1 service"
							}
						});

					} // Cookie Guider
				};

			}

			return MembersEditView;
		}());

	return new MembersEditView();
});
