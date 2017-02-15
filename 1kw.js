(function() { 'use strict';

	var fs = nw.require('fs'),
	    request = nw.require('request'),
	    watch = nw.require('watch');

	try {
		var config = JSON.parse(fs.readFileSync('config.txt'));
	} catch(ex) {
		document.body.innerHTML = 'config.txt is broken or missing.';
		console.log(ex);
		return;	
	}
/*  var history = [];
	function writeHistory(f) {
		history.append(f);
		if(history.length > config.maxhistory) // always cuts after some point
			history = hisotry.slice(0, config.maxhistory);
	}
*/
	function toggleHideScroll() {
		document.body.style.overflow = (document.body.style.overflow == 'hidden' ? '' : 'hidden');	
	}	
    function toggleFullscreen(evt) { 
        var win = nw.Window.get();
        if(win.isFullscreen) {
            win.leaveFullscreen();
        } else {
            win.enterFullscreen();
        }
      
      if(evt) evt.preventDefault();
      
      return false;
    }
    document.body.addEventListener('contextmenu', toggleFullscreen);
	document.body.addEventListener('keyup', function(evt) { 
//		console.log('keyup', evt);
		switch(evt.keyCode) {
			case 27: // ESC
				process.exit();
			break;
			case 72: // H
				toggleHideScroll();
			break;
			case 70: // F
				toggleFullscreen();
			break;
		}
	});
    
    // POST image to webhook
    function uploadImage(filename) {
        
        var req = request.post(config.webhookUrl, function (err, resp, body) {
            if(err) {
                console.log(err);
            }
            // console.log('sent image', fileName);
        });
        
        var form = req.form();
        form.append('file', fs.createReadStream(filename));
        form.append('content', config.username);
    }
    
    // watch for new images in folder
    watch.createMonitor(config.screenshotFolder, function (monitor) {
        monitor.on("created", function (f, stat) {
            // console.log('new file found', f);
            if(f.match(config.ignoreString) !== null) { 
                // console.log('ignoring '+config.ignoreString, f);
                return;
            }
			    
            uploadImage(f);

			if(config.cleanupImage) {
				fs.unlink(f);
			}
           
        });
    });
    
    var bot = new (nw.require('discord.js')).Client();
    bot.login(config.botToken);
    bot.on('message', function(message) {
        
        var imgurl = message.attachments.first().url;
        // console.log(message.channel.name, imgurl,message.content);
        if(message.channel.name == config.botChannel && imgurl != "") 
		{
            document.getElementById('output').setAttribute('src', imgurl);
     		// writeHistory(imgurl);
        }
     
    });
    
    console.log('a1kwords loaded.', config);

})();
