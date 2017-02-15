# athousandwords
This bot watches a local directory for new images and posts them to a discord channel. 
The front end displays images posted to that channel to allow realtime sharing of screenshots. 
I wrote this to share screenshots of steam games in a group of players with multiple monitor configurations.

# Configuration
config.txt contains a json object with the following fields:

##### username - *string*
used to differentiate users posting screenshots 

##### screenshotFolder - *string*
local path to watch for new files (remember to use double \ on windows)

##### cleanupImage - *boolean*
whether or not delete file after posting to channel, 0 or 1

##### ignoreString - *string*
ignore files that contain this string, used to ignore thumbnails for instance (regex)

##### maxhistory - *int*
unused
 
##### botChannel - *string*
the name of the channel to watch on your discord server

##### webhookUrl - *string*
the webhook url that the bot posts images with (created through [discord developer site](https://discordapp.com/developers/applications/me) or in discord client)

##### botToken - *string*
your bot's token (created through discord developer site)
