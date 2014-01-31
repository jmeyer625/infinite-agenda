$(function(){
	var calendarView = false;
	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	

	//creates array used to populate select element in entry form
	var createTimeArray = function(startTime,endTime){
		var times = [];
		for (var i=startTime; i<endTime;i++){
			if (i<10) {
				times.push('0'+i+':00')
			} else {
			times.push(i+':00')
		}}
		return times;
	}

	//initializes master array of objects with today's date + one more week
	var init = function(){
		if(localStorage.schedule) {
			var storageSchedule = JSON.parse(localStorage.getItem("schedule"));
			storageSchedule = map(storageSchedule,function(item){
				item.dateObject = new Date(item.dateObject);
				return item;
			})
			return storageSchedule
		} else {
			var schedule = [];
			var firstObject = {};
			var today = new Date();
			firstObject.dateObject = today;
			firstObject.arrayRef = 0;
			firstObject.appointments = {};
			schedule.push(firstObject);
			schedule = appendNextDay(schedule,30);
			return schedule;
		}
	}
	
	//creates object for next day based on last item in master array
	var createNextDay = function(lastDay) {
		var returnObject = {};
		var newDate = new Date(lastDay.dateObject.toDateString());
		newDate.setDate(lastDay.dateObject.getDate()+1);
		returnObject.dateObject = newDate;
		returnObject.appointments = {};
		returnObject.arrayRef = lastDay.arrayRef+1;
		return returnObject;
	}
	
	//pushes object for next day onto master array
	var appendNextDay = function(schedule,numDays){
		for (var i=0; i<numDays; i++){
			var lastDay = schedule[schedule.length-1];
			var nextDay = createNextDay(lastDay);
			schedule.push(nextDay);
		}
		return schedule;
	}
	

	//appends date objects to DOM
	var renderSchedule = function(schedule){
		var week = $('<ul class="week"></ul>');
		map(schedule,function(item){
			week.append(drawDay(item));
		});
		return week;
	}

	var renderCalendarView = function(schedule){
		

		var newMonth = renderMonth(month);
	}

	var renderMonth = function(month) {
		var monthDiv = $('<div class="month-div"></div>');
		var monthHeader = $('<h1 class="month-title"></h1>');
		var monthTable = $('<table></table>');
		var newTHead = $('<thead></thead>');
		var tr = '<tr></tr>';
		var dayHeaders = $(tr).addClass('day-headers');
		monthDiv.append(monthHeader);
		monthDiv.append(monthTable)
		newTHead.append(dayHeaders);
		monthTable.append(newTHead);
		map(days,function(day){
			var thEl = $('<th></th>');
			thEl.text(day);
			dayHeaders.append(thEl);
		})
		return monthDiv;
	}

	//creates form element to enter appointments
	var makeForm = function(times){
		var newForm = $('<form class="edit-form"></form>');
		var newInput = $('<input type="text" placeholder="Appointment" id="appText">');
		var newSelect = $('<select></select>');
		var newCancel = $('<button id="cancel">Cancel</button>');
		map(times,function(item){
			var newOption = $('<option></option>');
			newOption.attr('value',item);
			newOption.text(item);
			newSelect.append(newOption);
		})
		var newSubmit = $('<input type="submit" id="submit">');
		newForm.append(newInput);
		newForm.append(newSelect);
		newForm.append(newSubmit);
		newForm.append(newCancel);
		newForm.hide();
		return newForm;
	}

	//clears appointment form, used in event handlers
	var clearEditForm = function(form){
		form.find('#appText').val('');
		form.remove();
	}


	//creates DOM element for day using object
	var drawDay = function(object){
		var dayText = days[object.dateObject.getDay()];
		var dateText = object.dateObject.getDate();
		var refValue = object.arrayRef;
		var dateMonth = object.dateObject.getMonth();
		var day = $('<li></li>');
		day.addClass(calendarView?'calendar-item':'');
		day.attr('data-arrayRef',refValue);
		day.html('<p class="day">'+dayText+', '+dateText+' '+months[dateMonth]+'</p>');
		var timeList = populateAppointments(object);
		day.append(timeList);
		return day;
	}

	//creates appointment list from object, uses sortAppointments to sort
	var populateAppointments = function(object){
		var timeList = $('<ul class="times"></ul>');
		for (var key in object.appointments) {
			var timeSlot = $('<li class="time-slot"></li>');
			timeSlot.attr('data-time',key.substring(0,2));
			var timeLabel = $('<p class="time"></p>');
			var taskList = $('<ul class="day-task-list"></ul>');
			timeLabel.text(key);
			timeSlot.append(timeLabel);
			timeSlot.append(taskList);
			timeList.append(timeSlot);
			var agendaItems = map(object.appointments[key],function(item){
				var agendaItem = $('<li class="agenda-item editable"></li>');
				var agendaDiv = $('<div class="agenda-div"></div>');
				var deleteButton = $('<button class="delete-item">Delete item</button>');
				agendaDiv.append(agendaItem);
				agendaDiv.append(deleteButton);
				agendaItem.text(item);
				return agendaDiv;		
			});
			timeSlot.append(agendaItems);
			timeList.append(timeSlot);
		}
		timeList.append(sortAppointments(timeList.find('.time-slot')));
		return timeList;
	}

	//sorts appointments based on data-time attribute
	var sortAppointments = function(agendaItems) {
		var sorted = agendaItems.sort(function (a, b) {
	      var contentA =parseInt( $(a).attr('data-time'));
	      var contentB =parseInt( $(b).attr('data-time'));
	      return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
   		})
   		return sorted;
	}

	//adds new agenda item to relevant date object
	var addAgendaItem = function(object,appointmentTime,appointmentText) {
		if (object.appointments[appointmentTime]) {
			object.appointments[appointmentTime].push(appointmentText);
		} else {
			object.appointments[appointmentTime] = [];
			object.appointments[appointmentTime].push(appointmentText);
		}
		return drawDay(object);
	}

	var removeAgendaItem = function(arrayRef,timeSlot,appointmentText, schedule){
		var day = schedule[arrayRef];
		var appointmentArray = day.appointments[timeSlot+':00'];
		appointmentArray.splice(appointmentArray.indexOf(appointmentText),1);
		if(appointmentArray.length) {	
			day.appointments[timeSlot] = appointmentArray;
		} else {
			delete day.appointments[timeSlot+':00'];
			$('[data-arrayRef='+arrayRef+']').find('[data-time='+timeSlot+']').remove();
		}
		schedule[arrayRef] = day;
		localStorage.setItem("schedule",JSON.stringify(schedule));
		return schedule
	}

	//next 5 functions enable edit-in-place functionality for agenda items using 'editable' class
	var editor = $('<textarea id="editor" autofocus style="resize:none">');

	//pass clicked element as parameter and return object with CSS properites; used to position textarea
	var getEditableCss = function(element) {
		var newHeight = element.height();
		var newWidth = element.width();
		var newPos = element.position();
		return {newHeight:newHeight, newWidth:newWidth, newPos:newPos};
	};

	//replaces clicked element with textarea
	var edit = function() {
		var cssObj = getEditableCss($(this));
		$(this).after(editor);
		$(editor).width(cssObj.newWidth).height(cssObj.newHeight).position(cssObj.newPos);
		$(editor).val($(this).text()).focus();
		$(this).addClass('editing').hide();
	};

	//resets textarea and shows clicked element
	var removeEditor = function() {
		$('#editor').val("").remove();
		$('.editing').show().removeClass('editing');
	};

	//replaces clicked element text with textarea value
	var writeText = function() {	
		if ($('#editor').val()) {
			var newText = $('#editor').val();
			$('.editing').text(newText);
			removeEditor();
		} else {
			$('.editing').remove();
			removeEditor();
		}
	};

	$(document).on('click','.editable', edit);
	
	$(document).on('blur','#editor',writeText);

	//shows list of appointments
	$(document).on('click','.day',function(){
		$(this).parent().find('.times').slideToggle();
		$(this).parent().toggleClass('showing');		
		if($(this).parent().hasClass('showing')){		
			var showForm = makeForm(createTimeArray(8,20));
			$(this).after(showForm);
			showForm.slideToggle();
		} else {
			clearEditForm($(this).parent().find('form'));
		}
	})

	//clears form on clicking cancel
	$(document).on('click','#cancel',function(e){
		e.preventDefault();
		clearEditForm($(this).parent());
	})

	//uses addAgendaItem to edit day object and redraws with new info
	$(document).on('click','#submit',function(e){
		e.preventDefault;
		var appointmentTime = $(this).parent().find('select').val();
		var appointmentText = $(this).parent().find('#appText').val();
		var arrayRef = schedule[$(this).parent().parent().attr('data-arrayRef')];
		var newDay = addAgendaItem(arrayRef,appointmentTime,appointmentText);
		$(this).parent().parent().after(newDay);
		$(this).parent().parent().remove();
		newDay.find('.times').show();
		newDay.toggleClass('showing');
		localStorage.setItem("schedule",JSON.stringify(schedule));
		var showForm = makeForm(createTimeArray(8,20));
		newDay.find('.day').after(showForm);
		showForm.slideToggle();		
		// $(this).parent().find('#appText').val('');
	})

	//user can submit using enter key
	$(document).on('keyup','#appText',function(e){
		if (e.keyCode===13) {
			var that = $('#submit');
			addAgendaItem(that);
		}
	})

	$(document).on('click','.delete-item',function(e){
		e.preventDefault();
		var appointmentText = $(this).prev().text();
		var arrayRef = $(this).closest('.times').parent().attr('data-arrayRef');
		var timeSlot = $(this).closest('.time-slot').attr('data-time');
		$(this).parent().remove();
		schedule = removeAgendaItem(arrayRef,timeSlot,appointmentText, schedule);
		var newHTML = renderSchedule(schedule)
		console.log(newHTML);
		$('.container').append(newHTML);
	})

	//infinte scroll
	$(window).scroll(function() {
  		if($(window).scrollTop() + $(window).height() == $(document).height()) {
    		$('.container').text('')
    		$('.container').append(renderSchedule(appendNextDay(schedule,7)));
   		}
	});

	$('#calendarToggle').click(function(e){
		e.preventDefault();
		calendarView = calendarView ? false:true;
		if ($('.calendar-item').length) {
			$('.calendar-item').removeClass('calendar-item');
		} else {
			$('.week li').addClass('calendar-item');
		}
	})

	var schedule = init();
	$('.container').append(renderSchedule(schedule));


});