//View that will drive the Students list page.

define(['modernizr', 'spin', 'plugins', 'cookie', 'carousel', 'swipe', '../app/service/DataService', '../app/Router'], function(modernizr, spin, plugins, cookie, carousel, swipe, service, router) {"use strict";

	var QuizView = ( function() {

			var PARMS = {
				"workBg" : "img\/classbg.png",
			};
			var TOTALQUESTIONS = 10;
			var COMPLETED = 0;
			var QUIZ;
			var QUOTEICON = '<i class="icon-quote-left"></i>';

			/**
			 * Constructor
			 */
			function QuizView() {

				function showBG() {
					jQuery.backstretch(PARMS.workBg);
				}

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
				}, n = document.getElementById("preloader"), r = (new Spinner(t)).spin(n);

				//Create the quiz panels on the fly (DB should send this info per user/teacher/quiz)
				//Testing with 10 Questions - completed ones
				function setCards(completed) {
					var quizboardtemplate = jQuery('#quizboard-template').remove().attr('id', '');
					var QUESTIONS = TOTALQUESTIONS - completed;
					for (var i = 1; i <= QUESTIONS; i++) {
						var newboard = quizboardtemplate.clone();
						jQuery('.qtnnumber', newboard).text('#' + (i + parseInt(completed)));
						jQuery('#carousel').append(newboard);
						if (i === QUESTIONS) {
							jQuery('#carousel').append('<div class="empty"></div>');
						}
					}
				}

				//List in the dropdown to switch between the quizes for this T3 user
				function populateAvailableQuizs() {
					service.getStudentObject(jQuery.cookie('subuser'), {
						success : function(StudentData) {
							console.log('Quiz View: Student Data for Quiz LIst : ' + StudentData);
							//Create the student panels on the fly (DB should send this info per user/univ)
							var template = jQuery('#quiz-option-template').remove().attr('id', '');
							var COUNT = StudentData[0].activeassignments.length;
							for (var i = 0; i < COUNT; i++) {
								jQuery('#quiz-option-active').text(StudentData[0].activeassignments[i].name);
								var newboard = template.clone();
								jQuery('.quiz-option', newboard).text(StudentData[0].activeassignments[i].name);
								jQuery('#quiz-options').append(newboard);

								if (i === COUNT - 1) {
									jQuery('#quiz-options').append('<li class="back"><a href="#/class">Back to Class</a></li>');
									jQuery('#quiz-option-active').text(jQuery.cookie('quiz'));
									setCards(COMPLETED);
									createPanels();
								}
							}
						}
					});
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
					if (Modernizr.touch) {
						buildSwipe();
					} else {
						buildCarousal(n, r);
					}
					ActivatePanelEvents();
				};

				function buildCarousal(n, r) {
					function t(e) {
						e.find("a").stop().fadeTo(500, 0);
						e.addClass("selected");
						e.find("a").stop().addClass("selected");
						e.unbind("click")
						generateQuiz();
						var totalobjects = (jQuery('.quizboard').length) + COMPLETED;
						var currentobject = ((jQuery('.selected > .qtnnumber').text()).split("#")[1]);
						progress(Math.round((100 / totalobjects) * currentobject), jQuery('#progressBar'));
					}


					jQuery("#wrapper").removeClass("hidden");
					jQuery("#wrapper-touch").remove();
					jQuery("#wrapper").waitForImages(function() {
						r.stop();
						jQuery("#wrapper").animate({
							opacity : 1
						}, 600)
					});

					jQuery("#carousel").carouFredSel({
						circular : !1,
						width : "100%",
						height : 490,
						items : 3,
						auto : !1,
						prev : {
							button : "#prev",
							key : "left"
						},
						next : {
							button : "#next",
							key : "right"
						},
						scroll : {
							items : 1,
							duration : 1e3,
							easing : "quadratic",
							onBefore : function(t, n) {
								t.find("a").stop().fadeTo(500, 1);
								t.removeClass("selected");
								t.find("a").removeClass("selected");
								t.prev().unbind("click");
								t.next().unbind("click");
								n.prev().click(function(t) {
									t.preventDefault();
									jQuery("#carousel").trigger("prev", 1)
								});
								n.next().click(function(t) {
									t.preventDefault();
									jQuery("#carousel").trigger("next", 1)
								})
							},
							onAfter : function(e, n) {
								t(n.eq(1))
							}
						},
						onCreate : function(n) {
							t(n.eq(1));
							jQuery("#carousel div.selected").next().click(function(t) {
								t.preventDefault();
								jQuery("#carousel").trigger("next", 1)
							})
						}
					})
				}

				function buildSwipe() {
					alert('swipe time');
				}

				function ActivatePanelEvents() {
					$('.answer-option').on('click', function() {

						if (jQuery(this).attr('data-id') === 'correct') {
							jQuery(this).addClass('correct');
							setTimeout(function() {
								jQuery('.qtn').parent(".quizboard").addClass('correct');
								$("#carousel").trigger("next", 1);
								generateQuiz();
							}, 1000);
						} else {
							jQuery(this).addClass('incorrect');
						}
					});

					$('.quiz-option').click(function() {
						var selectedQuiz = $(this).text();
						var progress = $('#progressBar > div').text().split("%")[0];
						quizChange(QUIZ, progress, selectedQuiz);
					});

					$('#chat-module').click(function() {
						$('#chatnav').toggleClass('active');
						$('#chat-input').val('Get me: ' + $('.quizboard.selected>.qtn').text() + ' now');
						$('#chat-input').focus();
					});
					$('#chat-send').click(function() {
						$('#chatnav').toggleClass('active');
						$('#chat-input').val('');
						$('#chat-module').removeClass('notify');
						$('#chat-input').removeAttr('readonly');
						$('#chat-send').val('send');
					});

				};

				setTimeout(function() {
					setNotification('Whats going on?', 'Venkat');
				}, 10000);
				//10seconds

				setInterval(function() {
					setNotification('Are you done with this bro?', 'Venkat');
				}, 500000);

				function setNotification(message, sender) {
					$('#chat-module').addClass('notify');
					$('#chatnav').addClass('active');
					$('#chat-input').val(sender + ' says : ' + message);
					$('#chat-input').attr('readonly', 'readonly');
					$('#chat-send').val('dismiss');
				}

				function quizChange(currentquiz, progress, newquiz) {
					// Accept the current info and progress
					// Push it to DB
					// Adjust the cookies.
					jQuery.cookie('quiz', newquiz, {
						path : '/',
						expires : 100
					});
					QUIZ = newquiz;
					jQuery('#quiz-option-active').text(jQuery.cookie('quiz'));
					generateQuiz();
				}

				function generateQuiz() {
					//jQuery('.quizboard .correct').removeClass('correct');
					jQuery('.answer-option').removeClass('correct');
					jQuery('.answer-option').removeClass('incorrect');
					jQuery('.answer-option').attr('data-id', '');
					var operands = ['+', '-', '*'];
					var activeoperand = operands[Math.floor((Math.random() * 2) + 1)];
					var number1 = Math.floor((Math.random() * 100) + 1);
					var number2 = Math.floor((Math.random() * 100) + 1);
					var answer;
					if (activeoperand == '+') {
						answer = number1 + number2;
					}
					if (activeoperand == '-') {
						answer = number1 - number2;
					}
					if (activeoperand == '*') {
						answer = number1 * number2;
					}
					jQuery('.qtn').text('Value of ' + number1 + ' ' + activeoperand + ' ' + number2 + ' = ?');
					var optionlocation = Math.floor((Math.random() * 4) + 1);
					for (var i = 1; i < 5; i++) {
						if (i === optionlocation) {
							jQuery(".option" + i).val(answer).attr('data-id', 'correct');
						} else {
							var randomize = Math.floor((Math.random() * 30) + 1);
							randomize = answer + randomize;
							jQuery(".option" + i).val(randomize);
						}
					}
				}

				function progress(percent, element) {
					percent = parseInt(percent);
					var progressBarWidth = percent * jQuery(element).width() / 100;
					element.find('div').animate({
						width : progressBarWidth
					}, 500).html(percent + "%&nbsp; ");
				}

				//http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
				Array.prototype.move = function(from, to) {
					this.splice(to, 0, this.splice(from, 1)[0]);
				};

				function checkForActiveCookie() {
					if (jQuery.cookie('user')) {
						jQuery('#loggedin-user').text(jQuery.cookie('user'));
						return true;
					} else {
						router.go('/home', '/quiz');
						return false;
					}
				}


				this.pause = function() {

				};

				this.resume = function() {
					showBG();
				};

				this.init = function() {
					//Check for Cookie before doing any thing.
					//Light weight DOM.
					if (checkForActiveCookie() === true) {
						//Rich Experience First.... Load BG
						showBG();
						//Get the active student info and create the panels.
						populateAvailableQuizs();
						//populateAvailableStudents();

						//Create panels ASYNC - After gathering data
						//Fool Proof + Latency Issue taken care.
						//createPanels();

						//HTML Event - Actions
						jQuery('#loggedin-user').on('click', function() {
							router.go('/admin', '/class');
						});

					} // Cookie Guider

				};

			}

			return QuizView;
		}());

	return new QuizView();
});
