$(document).ready(function() {

  $(document).on('click', '#sub-btn', info)

  function info(){
    var subject = $('#subject').val();
    var email = $('#email').val();
    var status = $('#status option:selected').text();
    var priority = $('#priority option:selected').text();
    var description = $('#description').val();

    console.log(subject, email, statusMark(status), priorityMark(priority));
    console.log(description);

    var yourdomain = 'fongyu'; // Your freshdesk domain name. Ex., yourcompany
    var api_key = '4qydTzwnD7xRGaTt7Hqw'; // Ref: https://support.freshdesk.com/support/solutions/articles/215517-how-to-find-your-api-key
    ticket_data = '{ "description": "'+description+'", "subject": "'+subject+'", "email": "'+email+'", "priority": '+priorityMark(priority)+', "status": '+statusMark(status)+' }';
    // ticket_data = '{ "description": "Details about the issue...", "subject": "Support Needed...", "email": "tom@outerspace.com", "priority": 1, "status": 2, "cc_emails": ["ram@freshdesk.com","diana@freshdesk.com"] }';
    $.ajax(
      {
        url: "https://"+yourdomain+".freshdesk.com/api/v2/tickets",
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        headers: {
          "Authorization": "Basic " + btoa(api_key + ":x")
        },
        data: ticket_data,
        success: function(data, textStatus, jqXHR) {
          console.log('works');
        },
        error: function(jqXHR, tranStatus) {
          x_request_id = jqXHR.getResponseHeader('X-Request-Id');
          response_text = jqXHR.responseText;
        }
      }
    );

    $('#subject').val('');
    $('#email').val('');
    $('#description').val('');
  }
});


function statusMark(status){
  switch(status) {
    case 'Closed':
        return 5;
        break;
    case 'Resolved':
        return 4;
        break;
    case 'Pending':
        return 3;
        break;
    default:
        return 2;
  }
}

function priorityMark(priority){
  switch(priority) {
    case 'Urgent':
        return 4;
        break;
    case 'High':
        return 3;
        break;
    case 'Medium':
        return 2;
        break;
    default:
        return 1;
  }
}
