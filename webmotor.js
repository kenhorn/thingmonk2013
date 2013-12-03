var five = require("johnny-five/lib/johnny-five.js"),
    board, motor, led;

var http=require('http')
board = new five.Board();

board.on("ready", function() {
  // Create a new `motor` hardware instance.
  motor = new five.Motor({
    pin: 10
  });

  board.repl.inject({
    motor: motor
  });

  // "start" events fire when the motor is started.
  motor.on("start", function( err, timestamp ) {
    console.log( "start", timestamp );

    // Demonstrate motor stop in 2 seconds
    board.wait( 5000, function() {
      motor.stop();
    });
  });

  // "stop" events fire when the motor is started.
  motor.on("stop", function( err, timestamp ) {
    console.log( "stop", timestamp );
  });

  //motor.start();
  web(motor);
  
});

function web(motor) {

var url = require('url');

http.createServer(function (req,res) { 
  var url_parts = url.parse(req.url, true);
  if (url_parts.query.action == "start") {
    console.log("got start action");
    motor.start();
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("");
  } else if (url_parts.query.action == "stop") {
    console.log("got stop action");
    motor.stop();
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end("");
  } else if (url_parts.query.action == "status") {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(motor.isOn+"");
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var html = "<html><head><script src='http://localhost:1338/jquery-2.0.3.min.js'></script></head><body>\n";
    html += "<style>";
    html += ".but { display: block; border: 10px dotted; margin: 1ex; width: 7em; padding: 1em; font-size: 30pt; text-align: center; } \n";
    html += "#start { border-color: green; } \n";
    html += "#stop  { border-color: red; } \n";
    html += "#motorStatus { border: 15px solid grey; padding: 2ex; font-size: 40pt;  width: 10em; text-align: center;} \n";
    html += "</style>";
    html += "Hello "+ url_parts.query.name +"\n"; 
    html += "<span class=but id=start  >Start</span> " +"\n";
    html += "<span class=but id=stop   >Stop</span> " +"\n";
    html += "<div id=motorStatus>"+motor.isOn+"</div>" +"\n";
    html += "<script>$(document).ready(function() { " +"\n";
    html += "$('#start').click(function(){console.log('#start');$.ajax('?action=start');});" +"\n";
    html += "$('#stop' ).click(function(){console.log('#stop' );$.ajax('?action=stop');});" +"\n";
    html += "setInterval(function(){$.ajax('?action=status').done(function(text){ text='Running: '+text; $('#motorStatus').html(text); });}, 500);" +"\n";
    html += "});</script>" +"\n";
    res.end(html);
  }
}).listen(1337, "127.0.0.1");

}
