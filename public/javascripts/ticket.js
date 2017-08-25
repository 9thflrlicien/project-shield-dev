
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
  $(document).on('click', '.edit-time', showTime) ;



    // $(document).on('click', '.edit', updateStatus) ;
  // $(document).on('click', '.select',function () {
  //   event.stopPropagation();
  // });


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
        '<td>'+dueDate(data[i].due_by)+'</td>' +
        '</tr>'
      );
      // console.log(data[i].subject);
    }
  });
  socket.on('all agents info', data => {
    //$("#console").append('<b>Agent</b></br>');
    //for (i in data[1]) {$("#console").append(i+":"+data[0][i]+"</br>");}
    agentInfo = data ;
    console.log('Agent: ');
    console.log(data[0]);
  });
  socket.on('all contacts info', data => {
    //$("#console").append('<b>Contact</b></br>');
    //for (i in data[0]) {$("#console").append(i+":"+data[0][i]+"</br>");}
    contactInfo = data ;
    console.log('Contact: ');
    console.log(data[0]);
  });
  // socket.on('clear ticket table', data => {
  //   ticket_content.html(' ') ;
  // });

});

function showTime() {
  let original = $(this).text() ;
  let day = original.split(" ") ;
  let date = day[0].split("/") ;
  $(this).html(
    "<input type='datetime-local' class='inner' value='"+
    date[0]+'-'+date[1]+'-'+date[2]+'T'+day[1]
    +"'></input>"
  );
}

function showInput() {
  let original = $(this).text() ;
  $(this).html(
    "<input type='text' class='inner' value='"+
    original+
    "' autofocus>"
  );

}
function hideInput() {
  let change = $(this).val();
  $(this).parent().html(change) ;
}

function updateStatus() {
  let select = $(".select") ;
  let name, value, json = '{' ;
  let obj = {} ;
  let id = $(this).attr("val") ;
  let subject = $(".modal-title").text() ;
  let description = $("td.edit").html() ;
  let due = $("td.edit-time").text() ;

  console.log(subject+":"+description);

  json += '"subject":"'+subject+'",' ;
  json += '"description":"'+description+'",' ;
  json += '"due":"'+due+'",' ;
  // alert(select.length) ;
  for(let i=0;i<select.length;i++){
    name = select.eq(i).parent().parent().children("th").text() ;
    value = select.eq(i).val() ;
    // alert(name+":"+value) ;
    json += '"'+name+'":'+value+',';
  }

  json += '"id":"'+id+'"}' ;
  // alert(json) ;
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
  // '<th>ticket ID</th>'+
  // '<td>'+Tinfo.id+'</td>'+
  // '</tr><tr>'+
  '<th>responder</th>'+
  '<td>'+responderName(Tinfo.responder_id)+'</td>'+
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
  '<td class="edit-time">'+displayDate(Tinfo.due_by)+'</td>'+
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
  let posA = date.indexOf('T'),
      posB = date.indexOf('Z');
  let day = date.substring(0,posA),
      time = date.substring(posA+1,posB) ;
  let arr = day.split("-"),
      brr = time.split(":") ;
  // arr[2] = Number(arr[2]) ;
  // brr[0] = Number(brr[0]) ;
  // brr[0] += 8 ;
  // if(brr[0] > 24){
  //   arr[2] += 1 ;
  //   brr[0] -= 24 ;
  // }
  for(let i in brr){
    brr[i] = Number(brr[i]);
    if(brr[i]<10) brr[i] = '0'+brr[i] ;
  }
  return arr[0]+"/"+arr[1]+"/"+arr[2]+" "+brr[0]+":"+brr[1]+":"+brr[2] ;
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
    else return "unassigned" ;
  }

}
