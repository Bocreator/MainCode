## Overview

Quaver is a free and open-source discord music bot created by Discord user UnidentifiedX#6421. While not intending to compete against popular Discord music player bots such as [UnbelievaBoat](https://unbelievaboat.com/) or [FredBoat](https://fredboat.com/), Quaver aims to provide users with a transparent, completely cutomisable Discord music bot. As the source code can be forked by anyone, and used in situations conforming to the [GNU Affero General Public License v3.0](https://github.com/QuaverMaster/MainCode/blob/main/LICENSE), users are free to make changes to the source code and either use it for their own projects, or contribute to this repository for others to benefit from.

## Executing the code

1. Start by forking this repository
2. Ensure that [node.js](https://nodejs.org/) is installed on your runtime environment. Ensure that you have at least **node v16.6.0** installed. If not, update your node version.
3. Install modules by running `npm i` followed by:
    * [`discord.js`](https://discord.js.org/#/) ([guide](https://discordjs.guide/#before-you-begin))
    * [`@discordjs/voice`](https://www.npmjs.com/package/@discordjs/voice)
    * [`yt-search`](https://www.npmjs.com/package/yt-search)
    * [`ytdl-core`](https://www.npmjs.com/package/ytdl-core)

**Note: Remeber to install the modules `sodium`/`tweetnacl`/`libsodium-wrappers` for the required encryption libraries, `@discordjs/opus`/`opusscript` for the required opus libraries and `ffmpeg-static` for the required FFmpeg.**

4. Create an application in [Discord Developer Portal](https://discord.com/developers/applications). Go to **Settings > Bots** and create a new bot. Copy the bot token and paste it onto the `token` variable in the `index.js` file you have forked. 
5. Run the file by running `node .` or `node <file_name>`.

### Error Handling

As Quaver is still in its testing stages, there will be many instances where unhandled errors will cause Quaver to unexpectedly shut down or stop running. While still under development, one can still fork the repository and make their own changes to handle errors properly. There is no guarantee that Quaver will run smoothly and instances such as unexpected crashes can cause playlists to be lost.

## Hosting

Quaver is currently being hosted on [replit](https://replit.com/). However, it is in the process of being shifted to run on [Heroku](https://replit.com/). Currently, we are working on a Google Sheets Database using the [Google Sheets API](https://developers.google.com/sheets/api), though free alterntives such as [Supabase](https://supabase.io/) are being considered. You may also host on your own personal computer if you are just running the code for a small server and need not require it to operate 24/7.
