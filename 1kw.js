(function() { 'use strict';

	var fs = nw.require('fs'),
	    request = nw.require('request'),
	    watch = nw.require('watch');
    
    /// INIT
	try {
		var config = JSON.parse(fs.readFileSync('config.txt'));
	} catch(ex) {
		writeError('config.txt is broken or missing.');
		console.log(ex);
		return;	
	}
    nw.Window.get().height = 600;
    nw.Window.get().width = 540;
    configLoadUI(config);
    
    ///
    
/*  var history = [];
	function writeHistory(f) {
		history.append(f);
		if(history.length > config.maxhistory) // always cuts after some point
			history = hisotry.slice(0, config.maxhistory);
	}
*/
    function writeError(msg) {
        document.getElementById('errormessage').innerHTML = msg;
    }
    function configLoadUI(config) {
        var keys = Object.keys(config);
        for(var i = 0; i < keys.length; i++)  {
            var field = document.getElementById(keys[i]);
            if(field) {
                if(field.type === 'checkbox')
                    field.checked = config[keys[i]];
                else
                    field.value = config[keys[i]];
            }
        }
    }
    function configSave() {
        // validate
        // write to file, replace \ if necessary
        var keys = Object.keys(config);
        for(var i = 0; i < keys.length; i++)  {
            var field = document.getElementById(keys[i]);
            if(field) {
                if(field.type === 'checkbox')
                    config[keys[i]] = field.checked;
                else
                    config[keys[i]] = field.value;
            }
        }
        
        try {
            var configString = JSON.stringify(config);
        } catch(ex) {
            writeError('Unable to save config.txt');
            console.log(ex);
            return;
        }
        
        fs.writeFileSync('config.txt', configString);
        // console.log(config, configString, 'write to file ... ');
        
        var csave = document.getElementById('configsaved');
        csave.style.opacity = 1;
        setTimeout(function() {
            csave.style.opacity = 0;
        }, 6000);
        
        startup(); // restart everything
    }
    window.configbtn = function() {
        var img = document.getElementById('config');
        img.style.display = img.style.display === '' ? 'none' : '';
    }
    window.savebtn = function() {
        configSave();
    }
    window.chooseFolder = function(evt) {
        var path = '', 
            file = evt.target.files[0];
        
        if(file) 
            path = file.path.replace(file.name, '');
        if(path!=='')
            document.getElementById('screenshotFolder').value = path;
    }
    
    
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
    //document.body.addEventListener('contextmenu', toggleFullscreen);
	document.body.addEventListener('keyup', function(evt) { 
		//console.log('keyup', evt);
		switch(evt.keyCode) {
			case 27: // ESC
				process.exit();
			break;
			//case 72: // H
			//	toggleHideScroll();
			//break;
			case 122: // F11
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
    
    /// STARTUP
    var dirMonitor = null;
    var bot = null;
    
    function ensureImage(filename) {
        return !(filename.match(/.jpg|.jpeg|.png|.gif|.tga|.tif/) === null);
    }
    
    function startup() {
        
        if(dirMonitor) {
            dirMonitor.stop();
        }
        
        // watch for new images in folder
        watch.createMonitor(config.screenshotFolder, function (monitor) {
            
            dirMonitor = monitor;
            
            monitor.on("created", function (f, stat) {
                // console.log('new file found', f, stat);
                if(f.match(config.ignoreString) !== null) { 
                    // console.log('ignoring '+config.ignoreString, f);
                    return;
                }
                    
                uploadImage(f);

                if(config.cleanupImage && ensureImage(f)) {
                    fs.unlink(f);
                }
               
            });
        });

        if(bot && bot.status !== 5) { // no docs on this, an invalid config gives me a 5 on status and throws an error if you try to destroy the bot
            bot.destroy();
        }
        
        // create bot
        bot = new (nw.require('discord.js')).Client();
        bot.login(config.botToken);
        
        window.__debugbot = bot;
        
        bot.on('message', function(message) {
            
            var imgurl = message.attachments.first().url;
            // console.log(message.channel.name, imgurl,message.content);
            if(message.channel.name === config.botChannel && imgurl !== "") 
            {
                document.getElementById('output').setAttribute('src', imgurl);
                // writeHistory(imgurl);
            }
         
        });
        
    }
    
    startup();
    
    console.log('a1kwords loaded.', config);

})();
