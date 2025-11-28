 document.addEventListener('wpcf7submit', function(event) {

     if (event.detail.status == "validation_failed") {
         Swal.fire(
             '',
             event.detail.apiResponse.message,
             'error'
         );
     } else {
         Swal.fire(
             '',
             event.detail.apiResponse.message,
             'success'
         );
     }
 }, false);