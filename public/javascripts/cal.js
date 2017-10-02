var current_datetime = new Date();
var event_list;
var userId;

var calendar = $('#calendar');
var nowEventId = "invalid";

// jQuery
// $(document).ready(function() {
//
//
// });

$(document).on('click', '#signout-btn', logout); //登出
$(document).on('click', '#add-cal-btn', set_cal);
$(document).on('click', '#save-cal-btn', set_cal);
$(document).on('click', '#del-cal-btn', del_cal);

var getAuth = setInterval( function() {
  console.log("loading auth...");
  if( auth.currentUser ) {
    clearInterval(getAuth);

    userId = auth.currentUser.uid;
    database.ref('cal-events/' + userId).once('value', snap => {
      event_list = [];
      let data = snap.val();
      console.log(data);
      for( let prop in data ) {
        let obj = data[prop];
        obj.keyId = prop;
        event_list.push(obj);
      }
    });
  }
}, 1000 );

var loadCalTable = setInterval( function() {
  console.log("loading calendar...");
  if( !event_list ) return;
  clearInterval(loadCalTable);

  //Initialize fullCalendar.
	calendar.fullCalendar({
    theme: true,                  //fullcalendar的介面主題，啟用jQuery-UI
    buttonIcons:
    {
      prev: 'circle-triangle-w',
      next: 'circle-triangle-e'
    },
    //Defines the buttons and title position which is at the top of the calendar.
		header:
		{
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},

    defaultDate: current_datetime, //The initial date displayed when the calendar first loads.
    editable: true,                //true allow user to edit events.
    eventLimit: true,              // allow "more" link when too many events
		selectable: true,              //allows a user to highlight multiple days or timeslots by clicking and dragging.
		selectHelper: true,            //whether to draw a "placeholder" event while the user is dragging.

    //events is the main option for calendar.
		events: event_list,

    //execute after user select timeslots.
		select: (start, end, jsEvent, view) => {
      nowEventId = "invalid";
      let convert_start = convertTime(start._d);
      let convert_end = convertTime(end._d);

      $('#keyId').text('');
      $('#title').val('');
      $('#startDate').val(convert_start.date); // 日期input設定
      $('#startTime').val(convert_start.time); // 時間input設定
      $('#endDate').val(convert_end.date);     
      $('#endTime').val(convert_end.time); 
      $('#description').val('');
      $('#allday').prop('checked', false);

      // 隱藏錯誤訊息
      $('#cal-error-msg').hide();
      $('#tim-error-msg').hide();
      // 新增視窗
      $('#myModal').modal('show');
      // 按鈕設定
      $('#add-cal-btn').show();
      $('#save-cal-btn').hide();
      $('#del-cal-btn').hide();

			calendar.fullCalendar('unselect');
		},

    // edit after click.
    eventClick: function(event, jsEvent, view) {
      nowEventId = event._id;

      // 資料的值放進對應的input
      $('#keyId').text(event.keyId);
      $('#title').val(event.title);
      let start=convertShow(event.start._i); //轉換成輸出格式
      let end=convertShow(event.end._i);
      $('#startDate').val(start.date);
      $('#startTime').val(start.time);
      $('#endDate').val(end.date);
      $('#endTime').val(end.time);
      $('#description').val(event.description);
      $('#allday').prop('checked', event.allDay);

      // 隱藏錯誤訊息
      $('#cal-error-msg').hide();
      $('#tim-error-msg').hide();
      // 新增視窗
      $('#myModal').modal('show');
      // 按鈕設定
      $('#add-cal-btn').hide();
      $('#save-cal-btn').show();
      $('#del-cal-btn').show();

			calendar.fullCalendar('unselect');
    },

    //execute after user drag and drop an event.
    eventDrop: (event, delta, revertFunc, jsEvent, ui, view) => {
      let time_gap = delta.asMilliseconds();
      let start = Date.parse( event.start._i);
      start = ISODateTimeString( start + time_gap );
      let end = Date.parse( event.end._i );
      end = ISODateTimeString( end + time_gap );

      let keyId = event.keyId;
      let obj = {
        title: event.title,
        start: start,
        end: end,
        description: event.description,
        allDay: event.allDay
      };
      database.ref('cal-events/' + userId + '/' + keyId).set(obj);
    },

    eventDurationEditable: true
	});
}, 1000 );

function set_cal() {
  let keyId       = $('#keyId').text();
  let title       = $('#title').val();
  let start_date  = $('#startDate').val()+"T"+$('#startTime').val(); //把user輸入的日期和時間串起來
  let end_date    = $('#endDate').val()+"T"+$('#endTime').val();
  let description = $('#description').val();
  let allDay = $('#allday').prop('checked');

  let flag = true;
  if( !title || !start_date || !end_date ) {
    $('#cal-error-msg').show();
    flag = false;
  }
  else $('#cal-error-msg').hide();

  if( Date.parse(end_date) <= Date.parse(start_date) ) {
    $('#tim-error-msg').show();
    flag = false;
  }
  else $('#tim-error-msg').hide();

  if( !flag ) return;

  if( allDay ) {
    start_date = ISODateString( start_date );
    end_date = ISOEndDate( end_date );
  }
  let obj = {
    title: title,
    start: start_date,
    end: end_date,
    description: description,
    allDay: allDay
  };
  if( !keyId ) {
    let key = database.ref('cal-events/' + userId).push(obj).key;
    obj.keyId = key;
    calendar.fullCalendar('renderEvent', obj ,true ); // make the event "stick"
  }
  else {
    calendar.fullCalendar('removeEvents', nowEventId );
    calendar.fullCalendar('renderEvent', obj, true); // make the event "stick"
    database.ref('cal-events/' + userId + '/' + keyId).set(obj);
  }

  $('#myModal').modal('hide');
}; //end of set_cal

function del_cal() {
  calendar.fullCalendar('removeEvents', nowEventId );
  let keyId = $('#keyId').text();
  database.ref('cal-events/' + userId + '/' + keyId).remove();
  $('#myModal').modal('hide');
}

function ISOEndDate(d) {
  d = new Date(d);
  if( d.getHours()==0 && d.getMinutes()==0 ) {
    return ISODateString( d );
  }
  else {
    return ISODateString( moment(d).add('days', 1) );
  }
}

function ISODateString(d) {
  d = new Date(d);
  function pad(n) {return n<10 ? '0'+n : n}
  return d.getFullYear()+'-'
       + pad(d.getMonth()+1)+'-'
       + pad(d.getDate())+'T'
       + '00:00';
}

function ISODateTimeString(d) {
  d = new Date(d);
  function pad(n) {return n<10 ? '0'+n : n}
  let finalDate = new Object();                   //分割成日期和時間
  finalDate.date = d.getFullYear()+'-'
                  + pad(d.getMonth()+1)+'-'
                  + pad(d.getDate());
  finalDate.time = pad(d.getHours())+':'
                  + pad(d.getMinutes());
  return finalDate;
}

function convertTime(date) {
  let newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
  finalDate = ISODateTimeString(newDate);
  return finalDate;
}

function convertShow(dateString){                 //資料轉換成輸出格式
  let newDate = new Date(Date.parse(dateString));
  finalDate = ISODateTimeString(newDate);
  return finalDate;
}

function show_allday(){                          //勾選allday時，時間會hide
  if($('#allday').prop('checked')){
    $('#startTime').hide();
    $('#endTime').hide();
  }else{
    $('#startTime').show();
    $('#endTime').show();
  }  
}

$("#myModal").on("shown.bs.modal", function(){  //在show form之後做allday判斷
  show_allday();
});