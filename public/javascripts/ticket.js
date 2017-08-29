
var ticketInfo = {} ;
var contactInfo = {} ;
var agentInfo = {} ;
var socket = io.connect();

$(document).ready(function() {

  var ticket_content = $('#ticket-content');
  $(document).on('click', '.ticket_content',moreInfo) ;
  $(document).on('click', "#ticketInfo-submit", updateStatus) ;
  $(document).on('click', '.edit', showInput) ;
  $(document).on('click','.inner', function (event) {
    event.stopPropagation();
  });
  $(document).on('focusout', '.inner', hideInput);
  $(document).on('keypress', '.inner',function (e) {
    if(e.which == 13) $(this).blur() ;
  });

  socket.on('all tickets info', data => {
    ticket_content.empty() ;
    //$("#console").append('<b>Ticket</b></br>');
    // for (i in data[0]) {$("#console").append(i+":"+data[0][i]+"</br>");}
    // for (i in data[1]) {$("#console").append(i+":"+data[1][i]+"</br>");}
    console.log('Ticket: ');
    console.log(data[0]);
    ticketInfo = data ;
    for(let i in data){
      ticket_content.append(
        '<tr id="'+i+'" class="ticket_content" data-toggle="modal" data-target="#ticketInfoModal">'+
        '<td style="border-left: 5px solid '+priorityColor(data[i].priority)+'">' + data[i].id + '</td>' +
        '<td>' + data[i].subject + '</td>' +
        '<td class="status">' + statusMark(data[i].status) + '</td>' +
        '<td class="priority">' + priorityMark(data[i].priority) + '</td>' +
        '<td>'+displayDate(data[i].due_by)+'</td>' +
        '<td>'+ dueDate(data[i].due_by)+'</td>' +
        '</tr>'

      );
      // console.log(data[i].subject);
    }
  });
  socket.on('all agents info', data => {
    //$("#console").append('<b>Agent</b></br>');
    // for (i in data) {$("#console").append(data[i].id+":"+responderName(data[i].id)+"</br>");}
    agentInfo = data ;
    console.log('Agent: ');
    console.log(data[1]);
  });
  socket.on('all contacts info', data => {
    //$("#console").append('<b>Contact</b></br>');
    //for (i in data[0]) {$("#console").append(i+":"+data[0][i]+"</br>");}
    contactInfo = data ;
    console.log('Contact: ');
    console.log(data[0]);
  });

});


function showInput() {
  let prop = $(this).parent().children("th").text() ;
  let original = $(this).text() ;
  if(prop.indexOf('due date') != -1 ){
    let day = new Date(original) ;
    day = Date.parse(day)+8*60*60*1000 ;
    day = new Date(day) ;
    // console.log(day);
    $(this).html(
      "<input type='datetime-local' class='inner' value='"+
      day.toJSON().substring(0,23)
      +"'></input>"
    );
  }
  else if(prop == 'description'){
    $(this).html(
      "<textarea  class='inner' rows=4' cols='50'>"+
      original+
      "</textarea>"
    );
  }
  else{
    $(this).html(
      "<input type='text' class='inner' value='"+
      original+
      "' autofocus>"
    );
  }
}
function hideInput() {
  let change = $(this).val();
  if($(this).attr('type')== 'datetime-local'){
    $(this).parent().html(displayDate(change)) ;
  }
  $(this).parent().html(change) ;
}

function updateStatus() {
  let select = $(".select"),
      editable = $(".edit"),
      input = $("input");
  let name, value, json = '{' ;
  let obj = {} ;
  let id = $(this).attr("val") ;

  input.each(function () {$(this).blur();});

  // alert(editable.length) ;
  for(let i=0;i<editable.length;i++){
    name = editable.eq(i).parent().children("th").text().split(" ") ;
    value = editable.eq(i).text() ;
    json += '"'+name[0]+'":"'+value+'",';
  }
  // alert(select.length) ;
  for(let i=0;i<select.length;i++){
    name = select.eq(i).parent().parent().children("th").text() ;
    value = select.eq(i).val() ;
    // alert(name+":"+value) ;
    json += '"'+name+'":'+value+',';
  }

  json += '"id":"'+id+'"}' ;
  console.log(json) ;
  obj = JSON.parse(json) ;

  if(confirm("Are you sure to change ticket?")) socket.emit('update ticket',obj);

}

function showSelect(prop,n) {
  // let prop = $(this).parent().children("th").text() ;
  // alert(prop) ;
  let html = "<select class='select'>" ;
  if(prop == 'priority'){
    html += "<option value="+n+">"+priorityMark(n)+"</option>" ;
    for(let i=1;i<5;i++){
      if(i == n) continue ;
      html += "<option value="+i+">"+priorityMark(i)+"</option>" ;
    }

  }
  else if(prop == 'status'){

    html += "<option value="+n+">"+statusMark(n)+"</option>" ;
    for(let i=2;i<6;i++){
      if(i == n) continue ;
      html += "<option value="+i+">"+statusMark(i)+"</option>" ;
    }
  }
  else if(prop == 'responder'){
    html += "<option value="+n+">"+responderName(n)+"</option>" ;
    for(let i in agentInfo){
      let id = agentInfo[i].id ;
      if( id == n) continue ;
      html += "<option value="+id+">"+responderName(id)+"</option>" ;
    }
  }
  html += "</select>" ;
  return html ;
  // $(this).html(html);
}

function moreInfo() {
  let display ;
  let i = $(this).attr('id');
  let Tinfo = ticketInfo[i];
  let Cinfo ;
  let Ainfo ;

  $("#ID_num").text(Tinfo.id) ;
  $("#ID_num").css("background-color",priorityColor(Tinfo.priority)) ;

  display =
  '<tr>'+
  '<th>responder</th>'+
  '<td>'+showSelect('responder',Tinfo.responder_id)+'</td>'+
  '</tr><tr>'+
  '<th>priority</th>'+
  '<td>'+showSelect('priority',Tinfo.priority)+'</td>'+
  '</tr><tr>'+
  '<th>status</th>'+
  '<td>'+showSelect('status',Tinfo.status)+'</td>'+
  '</tr><tr>'+
  '<th>description</th>'+
  '<td class="edit">'+Tinfo.description+'</td>'+
  '</tr><tr>'+
  '<th>due date '+dueDate(Tinfo.due_by)+'</th>'+
  '<td class="edit">'+displayDate(Tinfo.due_by)+'</td>'+
  '</tr><tr>'+
  '<th>creat date</th>'+
  '<td>'+displayDate(Tinfo.created_at)+'</td>'+
  '</tr><tr>'+
  '<th>last update</th>'+
  '<td>'+displayDate(Tinfo.updated_at)+'</td>'+
  '</tr>' ;

  for(let j in contactInfo){
    if(contactInfo[j].id == Tinfo.requester_id) {
      Cinfo = contactInfo[j] ;
      display +=
      '<tr>'+
      '<th>requester</th>'+
      '<td>'+Cinfo.name+'</td>'+
      '</tr><tr>'+
      '<th>requester email</th>'+
      '<td>'+Cinfo.email+'</td>'+
      '</tr><tr>'+
      '<th>requester phone</th>'+
      '<td>'+Cinfo.phone+'</td>'+
      '</tr>'
      break ;
    }
  }

  for(let j in agentInfo){
    if(agentInfo[j].id == Tinfo.requester_id) {
      Ainfo = agentInfo[j] ;
      display +=
      '<tr>'+
      '<th>requester(<span style="color:red">agent</span>)</th>'+
      '<td>'+Ainfo.contact.name+'</td>'+
      '</tr><tr>'+
      '<th>requester email</th>'+
      '<td>'+Ainfo.contact.email+'</td>'+
      '</tr><tr>'+
      '<th>requester phone</th>'+
      '<td>'+Ainfo.contact.phone+'</td>'+
      '</tr>'
      break ;
    }
  }

  $(".info_input_table").html('') ;
  $(".modal-header").css("border-bottom","3px solid "+priorityColor(Tinfo.priority)) ;
  $(".modal-title").text(Tinfo.subject) ;
  $("#ticketInfo-submit").attr("val",Tinfo.id) ;
  $(".info_input_table").append(display);
}

function statusMark(status){
  switch(status) {
    case 5:
        return 'Closed';
        break;
    case 4:
        return 'Resolved';
        break;
    case 3:
        return 'Pending';
        break;
    case 2:
        return 'Open';
        break;
    default:
        return 'N/A';
  }
}
function priorityMark(priority){
  switch(priority) {
    case 4:
        return 'Urgent';
        break;
    case 3:
        return 'High';
        break;
    case 2:
        return 'Medium';
        break;
    case 1:
        return 'Low';
        break;
    default:
        return 'N/A';
  }
}
function displayDate(date) {
  let origin = new Date(date) ;
  origin = origin.getTime();
  let gmt8 = new Date(origin );

  let yy = gmt8.getFullYear(),
      mm = gmt8.getMonth()+1,
      dd = gmt8.getDate(),
      hr = gmt8.getHours(),
      min= gmt8.getMinutes(),
      sec= gmt8.getSeconds();

  return yy+"/"+mm+"/"+dd+" "+hr+":"+min+":"+sec ;
}
function priorityColor(priority) {
  switch(priority) {
    case 4:
        return 'rgb(230, 100, 100)';
        break;
    case 3:
        return 'rgb(233, 198, 13)';
        break;
    case 2:
        return 'rgb(113, 180, 209)';
        break;
    case 1:
        return 'rgb(126, 215, 170)';
        break;
    default:
        return 'N/A';
  }
}
function dueDate(day) {
  let html = '' ;
  let nowTime = new Date().getTime() ;
  let dueday = Date.parse(displayDate(day)) ;
  let hr = dueday - nowTime ;
  hr /= 1000*60*60 ;
  // hr = Math.round(hr) ;
  // return hr ;
  if(hr<0) html = '<span class="overdue">overdue</span>' ;
  else html = '<span class="non overdue">response due</span>' ;
  return html ;
}
function responderName(id) {
  for(let i in agentInfo){
    if(agentInfo[i].id == id) return agentInfo[i].contact.name ;
  }
  return "unassigned" ;
}
function addZero(n) {
  n = Number()
}
