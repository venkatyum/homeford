define(['cookie', '../../service/DataService', 'validate', '../../Router', '../../Notify'], function(cookie, service, validate, router, notify) {"use strict";

	var InvoiceGenerateView = ( function() {

			/**
			 * Constructor
			 *
			 */

			var ROLEMAP = {
				'ROLE_TIER1' : 'Owner',
				'ROLE_TIER2' : 'Admin',
				'ROLE_TIER3' : 'Member'
			}
			var activeDomains = [];
			var DATAOBJECT = null;
			var template;

			function InvoiceGenerateView() {

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
					var grandtotal = 0;
					if (DATAOBJECT !== null) {
						service.getUserProfile({
							success : function(UserProfile) {
								for (var i = 0; i < UserProfile.domains.length; i++) {
									jQuery('#inv-domain').text(UserProfile.domains[i].domainName);
									if (UserProfile.lastName === null && UserProfile.firstName === null) {
										UserProfile.lastName = "Billing Team";
										UserProfile.firstName = '';
									}
									jQuery('.inv-domain-info').text('Issued by ' + UserProfile.firstName + ' ' + UserProfile.lastName + ' for ' + UserProfile.domains[i].domainName);
								}
							}
						});
						jQuery('#inv-to-name').text(DATAOBJECT.toname);
						jQuery('#inv-to-contact').text(DATAOBJECT.toemail);
						jQuery('#inv-tbody').empty();
						for (var j = 0; j < DATAOBJECT.services.length; j++) {
							var thisrow = template.clone();
							jQuery('.sname', thisrow).text(DATAOBJECT.services[j].name);
							jQuery('.scost', thisrow).text('$' + DATAOBJECT.services[j].cost);
							jQuery('.stax', thisrow).text(DATAOBJECT.services[j].tax + '%');
							jQuery('.sdesc', thisrow).text(DATAOBJECT.services[j].desc);
							var total = parseInt(DATAOBJECT.services[j].cost) + parseInt((DATAOBJECT.services[j].cost) * (DATAOBJECT.services[j].tax) / 100);
							grandtotal = grandtotal + total;
							jQuery('.sprice', thisrow).text('$' + total);
							jQuery('#inv-tbody').append(thisrow);
							jQuery('.grand-total').text('$' + grandtotal);
						}
						var currentDate = new Date();
						var day = currentDate.getDate();
						var month = currentDate.getMonth() + 1;
						var year = currentDate.getFullYear();
						jQuery('#inv-date').text(day + "/" + month + "/" + year);
						jQuery('.thanks').text(DATAOBJECT.tomessage);
					} else {
						router.go('/invoicenew');
					}
				}


				this.setData = function(databject) {
					DATAOBJECT = databject;
				}

				this.pause = function() {

				};

				this.resume = function() {
					populateData();
					//validator.resetForm();
					document.title = 'Zingoare | Invoice Preview';
				};

				this.init = function(args) {
					//Check for Cooke before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Invoice Preview';

					if (checkForActiveCookie() === true) {
						template = jQuery('#inv-tbody-row').remove().attr('id', '');
						populateData();

						//HTML Event - Actions

						jQuery('.modal_close').on('click', function() {
							router.returnToPrevious();
						});
					} // Cookie Guider
				};

			}

			return InvoiceGenerateView;
		}());

	return new InvoiceGenerateView();
});