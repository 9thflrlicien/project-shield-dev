
var ticketInfo = {} ;
var contactInfo = {} ;

$(document).ready(function() {
  var socket = io.connect();
  var ticket_content = $('#ticket-content');
  $(document).on('click', '#btn_test', check);
  $(document).on('click', '.ticket_content',moreInfo)

  socket.on('all tickets info', data => {
    $("#console").append('<b>Ticket</b></br>');
    for (i in data[0]) {$("#console").append(i+":"+data[0][i]+"</br>");}
    console.log('Ticket: ');
    console.log(data[0]);
    ticketInfo = data ;
    for(let i in data){
      ticket_content.append(
        '<tr id="'+i+'" class="ticket_content" data-toggle="modal" data-target="#ticketInfoModal">'+
        '<td>' + data[i].id + '</td>' +
        '<td>' + data[i].subject + '</td>' +
        '<td>' + statusMark(data[i].status) + '</td>' +
        '<td>' + priorityMark(data[i].priority) + '</td>' +
        '<td ></td>' +
        '</tr>'
      );
      // console.log(data[i].subject);
    }
  });

  socket.on('all agents info', data => {
    console.log('Agent: ');
    console.log(data[0]);
  });

  socket.on('all contacts info', data => {
    $("#console").append('<b>Contact</b></br>');
    for (i in data[0]) {$("#console").append(i+":"+data[0][i]+"</br>");}
    console.log('Contact: ');
    console.log(data[0]);
  });

  socket.on('clear ticket table', data => {
    ticket_content.html(' ') ;
  });

});


function moreInfo() {
  let i = $(this).attr('id');
  let Tinfo = ticketInfo[i];
  for(let j in contactInfo){
    if(contactInfo[j].id == Tinfo.requester_id) {
      var Cinfo = contactInfo[j] ;
      break ;
    }
  }
  alert(Cinfo) ;
  $(".modal-title").text(Tinfo.subject) ;
  $(".info_input_table").append(
    '<tr>'+
    '<th>ticket ID</th>'+
    '<td>'+Tinfo.id+'</td>'+
    '</tr><tr>'+
    '<th>priority</th>'+
    '<td>'+priorityMark(Tinfo.priority)+'</td>'+
    '</tr><tr>'+
    '<th>status</th>'+
    '<td>'+statusMark(Tinfo.status)+'</td>'+
    '</tr><tr>'+
    '<th>requester</th>'+
    '<td>'+Tinfo.requester_id+'</td>'+
    '</tr>'
  );
}

function check(){
  console.log('clicked');
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
    default:
        return 'Open';
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
    default:
        return 'Low';
  }
}
