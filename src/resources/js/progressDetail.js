/* JS will not correctly work when switching between desktop and mobile unless in debug mode */

$(function(){
	
	var timeline = $('#timeline').find('.line');
	var timelineDot = $(timeline).find('.dot');
	var numDots = $(timeline).find('.year.dot').length * 4 + 1;
	var mobileYear = $(timeline).find('.year.dot');
	var mobileDefault = $(timeline).find('.dot.js-mobile-default');
	
	$(mobileDefault).addClass('active');
	
	// CONTENT SWITCH
	$(timelineDot).each(function(){
		$(this).click(function(){
			var currentDesc = $('#description').find('.section-wrapper > div');
			$(currentDesc).hide();
			
			matchContent($(this)).fadeIn();
		});
	});

	var resizeTimer;
	var initialSize = $(window).width();
	
	$(window).resize(function(){
		
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function(){
			var delayedSize = $(window).width();
			// if we resize but not enough to change layout, proceed as usual
			if ((initialSize > 480 && delayedSize > 480) || (initialSize < 481 && delayedSize < 481)) {
				if (initialSize > 480 && delayedSize > 480) {
					desktopTimeline();
				} else if (initialSize < 481 && delayedSize < 481) {
					mobileTimeline();
				}
			}
					
			// if we resize the page and switch between desktop and mobile layouts, reload the page
			else {
				location.reload();
			}
			
			initialSize = delayedSize;
		}, 250);
		
	});
	
	// DESKTOP FUNCTIONALITY
	function desktopTimeline(){
		$(timelineDot).each(function(){

			// highlight the appropriate portion of the line as you click the dots
			var ind = Number(findIndex($(this)));
			var x = round((0.9 / numDots) * ind * 100, 4);
			var y = round(((0.9 / numDots) * 100 / 2), 4);
			var z = x + y;

			$(this).click(function(){
				$(timelineDot).removeClass('active complete');
				$(this).addClass('active');
				$(this).prevAll('.dot').addClass('complete');
				$(timeline).css({
					background: 'linear-gradient(to right, ' +
					'#C0392B ' + z + '%, ' +
					'#FBFCFC ' + z + '%)'
				});
			});
		});
	}
	
	// MOBILE FUNCTIONALITY
	function mobileTimeline() {
		$(timelineDot).click(function(){
			var mobileQuarter = $(this).nextUntil('.year.dot');

			if ($(this).hasClass('year')) {

				$(timelineDot).not($(this)).removeClass('active complete');
				$(this).addClass('complete');
				$(this).next().addClass('active');
				$(this).prevAll('.dot.year').addClass('complete');
				$('.dot.quarter').not(mobileQuarter).slideUp(500);
				$(mobileQuarter).slideDown(500);

			} else if ($(this).hasClass('quarter')) {

				var parentYear = $(this).prevUntil('.dot.year');

				$(this).addClass('active');
				$(timelineDot).not($(this)).removeClass('active');
				$(mobileQuarter).add(mobileYear).removeClass('complete');
				$(parentYear).add($(this)).add($(this).prevAll('.dot.year')).addClass('complete');
			}
		});
	}
	
	// RETRIEVE ELEMENT'S INDEX AMONG VISIBLE DOTS
	function findIndex(dataInd) {
		return $(dataInd).attr('data-index');
	}
	// FIND MATCHING CONTENT
	function matchContent(matchedContent){
		return $('#description').find('.section-wrapper > div[data-index="' + $(matchedContent).attr("data-index") + '"]');
	}
	
	// ROUND DECIMALS
	function round(value, decimals) {
		return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}

	
	$(window).resize();
});