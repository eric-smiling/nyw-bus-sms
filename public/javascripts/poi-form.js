(function($){
  $(document.body).on('submit', '.sms-form', function(evt) {
    var $form = $(evt.target);
    var $btn = $($form.find('input[type=submit]'));
    var interval = {
      id: null,
      sms_max: 3,
      sms_count: 0,
      frequency: 5000,
      pause_length: 120000,
      start: function(){
        var self = this;
        if(this.sms_count >= this.sms_max) {
          return;
        }
        self.id = setInterval(function(){
          $.ajax({
            type:  $form.attr('method'),
            url: $form.attr('action'),
            data: $form.serialize(),
            success: function(response) {
              if(response.vehicles && response.sms_sent) {
                self.sms_count++;
                self.stop();
                self.schedule();
              }
              else if(response.message) {
                alert(response.message);
              }
              console.log(response);
            }
          });
        }, self.frequency);
        self.onStart();
      },
      stop: function() {
        clearTimeout(this.id);
        this.onStop();
      },
      schedule: function() {
        setTimeout((function(){
          this.start();
        }).bind(this), this.pause_length);
      },
      // ui stuff.. move / use pub sub
      onStop: function() {
        $('#confirmation-modal').modal();
      },
      onStart: function() {
        // make it stoppable
        $form.addClass('started');
        $form.find('.loader').show();
      }
    };
    
    // stop the form submission
    evt.preventDefault();
    
    // start the interval
    interval.start();
  }); 
})(window.jQuery);