$(function(){

	$('#step1').css('left', 0);
	$('#step2').css('left', 1 * $('body').width() + 'px');
	$('#step3').css('left', 2 * $('body').width() + 'px');
	$('#step4').css('left', 3 * $('body').width() + 'px');

	var stepNum = 0;

	$.slideSwitch = function(){
		
		stepNum = (stepNum+1)%4;
		
		$('#step1').animate({
			'left': (0-stepNum * $('body').width())+'px'
		}, $('body').width())
		$('#step2').animate({
			'left': ((1-stepNum) * $('body').width())+'px'
		}, $('body').width())
		$('#step3').animate({
			'left': ((2-stepNum) * $('body').width())+'px'
		}, $('body').width())
		$('#step4').animate({
			'left': ((3-stepNum) * $('body').width())+'px'
		}, $('body').width())

	}

	$.slideToStep = function(event){
		stepNum = $(event.target).attr('data-slideto')-1;
		
		$('#step1').animate({
			'left': (0-stepNum * $('body').width())+'px'
		}, $('body').width())
		$('#step2').animate({
			'left': ((1-stepNum) * $('body').width())+'px'
		}, $('body').width())
		$('#step3').animate({
			'left': ((2-stepNum) * $('body').width())+'px'
		}, $('body').width())
		$('#step4').animate({
			'left': ((3-stepNum) * $('body').width())+'px'
		}, $('body').width())

	}

	$('.nextButton').on('click', $.slideSwitch);
	$('.slideTo').on('click', $.slideToStep);

	$(window).on('resize', function() {stepNum--; $.slideSwitch();})

});