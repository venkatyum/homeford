define(['cookie', '../../service/DataService', 'validate', 'tablesorter', '../../Router', '../../Notify', '../../view/admin/AdminView', '../../view/members/MembersEditView'], function(cookie, service, validate, tablesorter, router, notify, admin, membersedit) {"use strict";

	var ToDoListView = ( function() {

			/**
			 * Constructor
			 *
			 */

			function ToDoListView() {

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
					jQuery('.view-table  tbody').empty();
					jQuery('.view-table').tablesorter();
					//var activedomains = admin.getActiveDomainsIDs();
					var activedomains = [];
					activedomains.push(service.domainNametoID(jQuery.cookie('subuser')));
					if (!activedomains || activedomains.length == 0) {
						router.go('/admin', '/memberslist');
					} else {
						loadTable(activedomains);
					}

				}

				function loadTable(activedomains) {
					jQuery('.noinfo').show();
					jQuery('.view-table').hide();
					var rowtemplate = jQuery('#invoice-template').attr('id', '');
					//Backing the template
					jQuery('.div-template').append(rowtemplate.attr('id', 'invoice-template'));
					for (var i = 0; i < activedomains.length; i++) {
						var thisdomaininstance = activedomains[i];
						service.getAllInvoices(thisdomaininstance, {
							success : function(data) {
								for (var j = 0; j < data.length; j++) {
									jQuery('.noinfo').hide();
									jQuery('.view-table').show();
									var row = rowtemplate.clone();
									jQuery('.invoice-to', row).text(data[j].invoiceParties.length);
									jQuery('.invoice-senton', row).text(data[j].sendDate);
									jQuery('.invoice-dueby', row).text(data[j].dueDate);
									jQuery('.invoice-paidon', row).text(data[j].paidDate);
									jQuery('.invoice-items', row).text(data[j].invoiceItems.length + ' items');
									jQuery('.invoice-total', row).text('$' + data[j].grandTotal);
									jQuery('.view-table  tbody').append(row);
									if (j === data.length - 1) {
										jQuery('.view-table').trigger("update");
										activateTableClicks();
									}
								}
							}
						});
					}
				}

				function activateTableClicks() {
					jQuery('.view-table thead > tr > th').click(function() {
						if (jQuery(this).find('i').hasClass('icon-sort-by-attributes')) {
							jQuery('.tablesortcontrol').removeClass('active');
							jQuery(this).find('i').addClass('active');
							jQuery('.tablesortcontrol').addClass('icon-sort-by-attributes-alt ').removeClass('icon-sort-by-attributes ');
						} else {
							jQuery('.tablesortcontrol').removeClass('active');
							jQuery(this).find('i').addClass('active');
							jQuery('.tablesortcontrol').addClass('icon-sort-by-attributes ').removeClass('icon-sort-by-attributes-alt ');
						}
					});
				}

				function clearForm() {

				}


				this.pause = function() {

				};

				this.resume = function() {
					populateData();
					document.title = 'Zingoare | Invoice List';
				};

				this.init = function(args) {
					//Check for Cooke before doing any thing.
					//Light weight DOM.
					document.title = 'Zingoare | Invoice List';

					if (checkForActiveCookie() === true) {
						populateData();

						//HTML Event - Actions
						jQuery('.modal_close').on('click', function() {
							router.returnToPrevious();
						});

					} // Cookie Guider
				};

			}

			return ToDoListView;
		}());

	return new ToDoListView();
});
