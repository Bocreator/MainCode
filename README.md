## Overview

Quaver is a free and open-source discord music bot created by Discord user UnidentifiedX#6421. While not intending to compete against popular Discord music player bots such as [UnbelievaBoat](https://unbelievaboat.com/) or [FredBoat](https://fredboat.com/), Quaver aims to provide users with a transparent, completely cutomisable Discord music bot. As the source code can be forked by anyone, and used in situations conforming to the [GNU Affero General Public License v3.0](https://github.com/QuaverMaster/MainCode/blob/main/LICENSE), users are free to make changes to the source code and either use it for their own projects, or contribute to this repository for others to benefit from.

## Executing the code

1. Start by forking this repository
2. Ensure that [node.js](https://nodejs.org/) is installed on your runtime environment. ~~Ensure that you have at least **node v16.6.0** installed. If not, update your node version~~ Choose which version of node to run: either v^16.6.0 for Discord.js 13 or v14.5.5 for Discord.js 12. **Important: I recommend you to use Discord.js 12 as ytdl-core runs more stably on v14.15.5.**
3. Install modules by running `npm i` followed by:
    * [`discord.js`](https://discord.js.org/#/) ([guide](https://discordjs.guide/#before-you-begin))
    * [`@discordjs/voice`](https://www.npmjs.com/package/@discordjs/voice) (If you're running Discord.js 13)
    * [`yt-search`](https://www.npmjs.com/package/yt-search)
    * [`ytdl-core`](https://www.npmjs.com/package/ytdl-core)
    * [`spdl-core`](https://www.npmjs.com/package/spdl-core)

**Note: Remeber to install the modules `sodium`/`tweetnacl`/`libsodium-wrappers` for the required encryption libraries, `@discordjs/opus`/`opusscript` for the required opus libraries and `ffmpeg-static` for the required FFmpeg.**

4. Create an application in [Discord Developer Portal](https://discord.com/developers/applications). Go to **Settings > Bots** and create a new bot. Copy the bot token and paste it onto the `token` variable in the `index.js` file you have forked. 
5. Run the file by running `node .` or `node <file_name>`.

### Error Handling

As Quaver is still in its testing stages, there will be many instances where unhandled errors will cause Quaver to unexpectedly shut down or stop running. While still under development, one can still fork the repository and make their own changes to handle errors properly. There is no guarantee that Quaver will run smoothly and instances such as unexpected crashes can cause playlists to be lost.

## Hosting

Quaver is currently being hosted ~~on [glitch](https://glitch.com/)~~ on my own personal computer. However, another alternative could be [Heroku](https://replit.com/). Currently, we are working on a Google Sheets Database using the [Google Sheets API](https://developers.google.com/sheets/api), though free alterntives such as [Supabase](https://supabase.io/) are being considered. You may also host on your own personal computer if you are just running the code for a small server and need not require it to operate 24/7.

## Bot commands

Quaver includes basic music commands, and more will be added along the way. 

Music commands:
   * `>play <url/song name>` Gets the song from YouTube (Edit: Quaver now supports Spotify! Enter the Spotify url to play your desired song!)
   * `>skip` Skips the current song on the playlist; If there are no more songs on the playlist, the last song will be skipped and no more songs will be played; If loop is on, `>skip` will skip the current song and go on to the next song on the playlist and loop is turned off
   * `>stop`/`>disconnect` Disconnects the bot from the music channel. This will delete the playlist of the server
   * `>pause` Pauses the current song as well as the playlist
   * `>unpause`/`>resume` Resumes/Unpauses the current song as well as the playlist
   * `>playlist` Shows the current song playing as well as upcoming songs
   * `>loop` Loops the current song. What this does is adding the current song to the top of the playlist to be played again; Doing `>skip` will disable `loop`

Non-music commands:
   * `>about` Shows information about the bot
   * `>help` Shows the list of functions of the bot
   * `>info` Gets information about the current song played

## Files

There are two folders currently in the repository, `NodeJS v14` and `NodeJS v16`. In the `NodeJS v16` folder, there are two files: `commonjs_index.js` and `index.js`. `index.js` 
imports modules via ES6 format, while `commonjs_index` imports modules via commonjs format. In the `NodeJS v14` folder, there is only `index.js` which imports modules via commonjs format. I won't be making an ES6 format because I'm kinda lazy but you can do it pretty easily.

## Support

As the bot no longer runs on NodeJS v16, I will stop updating the files for it. However, if ytdl-core updates their libraries to run on Node v16 stably, I will immediately stop using Discord.js 12 and resume support for Discord.js 13.
