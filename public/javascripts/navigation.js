$(document).ready(function() {
  $(document).on('mouseover', '#nav_message', subMessage); //Message 導覽標籤 subtags
  $(document).on('click', '#message', subMessage); //Message 導覽標籤 subtags
});
function subMessage() {
  if ($('.subTag').is(':visible')) {
    $('.subTag').fadeOut(1000, "swing");
  } else {
    $('.subTag').fadeIn(1000, "swing");
  }
} // end of subMessage
