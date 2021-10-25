## Overview

Quaver is a free and open-source discord music bot created by Discord user UnidentifiedX#6421. While not intending to compete against popular Discord music player bots such as [UnbelievaBoat](https://unbelievaboat.com/) or [FredBoat](https://fredboat.com/), Quaver aims to provide users with a transparent, completely cutomisable Discord music bot. As the source code can be forked by anyone, and used in situations conforming to the [GNU Affero General Public License v3.0](https://github.com/QuaverMaster/MainCode/blob/main/LICENSE), users are free to make changes to the source code and either use it for their own projects, or contribute to this repository for others to benefit from.

## Executing the code

1. Start by forking this repository
2. Ensure that [node.js](https://nodejs.org/) is installed on your runtime environment. Ensure that you have at least **node v16.6.0** installed. If not, update your node version.
3. Install modules by running `npm i` followed by:
    * `discord.js` 
    * `@discordjs/voice` (more information can be found [here](https://www.npmjs.com/package/@discordjs/voice))
    * `yt-search`
    * `ytdl-core`

**Note: Remeber to install the modules `sodium`/`tweetnacl`/`libsodium-wrappers` for the required encryption libraries**
