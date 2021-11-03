const Discord = require("discord.js");
const reply = require("discord-reply");
const spdl = require("spdl-core");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

const client = new Discord.Client();
const token = "<insert_your_token_here>";

var queue = new Map();

function MainTask()
{
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`);
    });

    client.on("message", async (message) => {
        const prefix = ">";
        const args = message.content.replace(/ +/g, " ").split(" ");

        var serverQueue = queue.get(message.guild.id);

        if(args[0].startsWith(prefix))
        {
            console.log(args);

            const voiceChannel = message.member.voice.channel;
            
            if(args[0].replace(prefix, "") === "play")
            {
                let song = {};

                if(!voiceChannel) return message.lineReply("You need to be in a voice channel to execute this command!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.lineReply("You need to be in the same voice channel as the bot to execute this command!");
                    // IMPORTANT: FIX THIS CODE NOT WORKING!!!
                }

                if(args.length >= 2)
                {
                    if(ytdl.validateURL(args[1]))
                    {
                        const songInfo = await ytdl.getInfo(args[1])
                        song = { title: songInfo.videoDetails.title, 
                            url: songInfo.videoDetails.video_url, 
                            duration: songInfo.videoDetails.lengthSeconds,
                            views: songInfo.videoDetails.viewCount,
                            likes: songInfo.videoDetails.likes,
                            dislikes: songInfo.videoDetails.dislikes };
                    }
                    else
                    {
                        // If the argument given is not a valid youtube link
                        const videoFinder = async (query) => {
                            const videoResult = await yts(query);
                            return (videoResult.videos.length > 1) ? videoResult.videos[0] : null;
                        }
                        
                        var video;

                        if(spdl.validateURL(args[1]))
                        {
                            const info = await spdl.getInfo(message.content.split(" ")[1]);
                            video = await videoFinder(`${info.title} - ${info.artist}`);
                        }
                        else video = await videoFinder(args.join(" ").replace(`${prefix}play`, ""))

                        if(video)
                        {
                            const songInfo = await ytdl.getInfo(video.url);
                            song = { title: songInfo.videoDetails.title, 
                                url: songInfo.videoDetails.video_url, 
                                duration: songInfo.videoDetails.lengthSeconds,
                                views: songInfo.videoDetails.viewCount,
                                likes: songInfo.videoDetails.likes,
                                dislikes: songInfo.videoDetails.dislikes };
                        }
                        else return message.lineReply("There was an error finding the video. Please try again.");
                    }
                }
                else return message.lineReply("You need to send in the correct arguments! To play, do `play <song_name or url>`. To learn more, do `help`.");

                if(!serverQueue)
                {
                    const queueConstructor = {
                        voice_channel: voiceChannel,
                        text_channel: message.channel,
                        connection: null,
                        dispatcher: null,
                        songs: [],
                        paused: false,
                        looped: false
                    }

                    queue.set(message.guild.id, queueConstructor);
                    queueConstructor.songs.push(song);

                    try{
                        const connection = await voiceChannel.join();

                        queueConstructor.connection = connection;
                        VideoPlayer(message.guild, queueConstructor.songs[0]);
                    }
                    catch (err)
                    {
                        queue.delete(message.guild.id);
                        message.lineReply("There was an error connecting!");
                        throw err;
                    }
                }
                else
                {
                    serverQueue.songs.push(song);
                    return message.lineReply(`**${song.title}** added to queue!`);
                }
            }

            if(args[0].replace(prefix, "") === "stop" || args[0].replace(prefix, "") === "disconnect")
            {
                if (serverQueue.voice_channel.id !== voiceChannel.id) return message.lineReply("You need to be in the same voice channel as the bot to execute this command!");

                queue.get(message.guild.id).connection.disconnect();
                queue.delete(message.guild.id);
                return message.lineReply("Successfully disconnected from voice channel 👌");
            }

            if(args[0].replace(prefix, "") === "pause")
            {
                if(queue.get(message.guild.id).paused) return message.lineReply("Song is already paused!");
                if(!voiceChannel) return message.lineReply("You need to be in a voice channel to use this command!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.lineReply("You need to be in the same voice channel as the bot to execute this command!");
                    // FIX THIS LINE
                }

                queue.get(message.guild.id).dispatcher.pause();
                queue.get(message.guild.id).paused = true;
                return message.lineReply("Song paused 👌")
            }

            if(args[0].replace(prefix, "") === "unpause" || args[0].replace(prefix, "") === "resume")
            {
                if(!queue.get(message.guild.id).paused) return message.lineReply("Song is already unpaused!");
                if(!voiceChannel) return message.lineReply("You need to be in a voice channel to use this command!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.lineReply("You need to be in the same voice channel as the bot to execute this command!");
                    // FIX THIS LINE
                }

                queue.get(message.guild.id).dispatcher.resume();
                queue.get(message.guild.id).paused = false;
                return message.lineReply("Song resumed 👌");
            }

            if(args[0].replace(prefix, "") === "playlist" || args[0].replace(prefix, "") === "queue")
            {
                var currentSong;
                var upcomingSongs;

                if(queue.get(message.guild.id) === undefined)
                {
                    currentSong = "No song currently playing!";
                    upcomingSongs = "No more songs left!";
                }
                else
                {
                    const list = queue.get(message.guild.id).songs; 

                    currentSong = list[0].title;

                    var upcomingSongs_ = [];
                    for(let i = 1; i < list.length; i++)
                    {
                        upcomingSongs_.push(list[i].title);
                    }

                    if(upcomingSongs_.length !== 0) upcomingSongs = upcomingSongs_.join("\n");
                    else upcomingSongs = "No more songs left!";
                }

                const embed = new Discord.MessageEmbed()
                    .setColor("#000E44")
                    .setTitle("Playlist")
                    .setDescription(`Playlist for **${message.guild.name}**`)
                    .addField("Currently playing:", currentSong)
                    .addField("Upcoming songs:", upcomingSongs)

                return message.lineReply(embed);
            }

            if(args[0].replace(prefix, "") === "loop")
            {
                if(!voiceChannel) return message.lineReply("You need to be in a voice channel to use this command!");
                if(queue.get(message.guild.id) === undefined) return message.lineReply("There are no songs currently playing!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.lineReply("You need to be in the same voice channel as the bot to execute this command!");
                    // FIX THIS LINE
                }

                if(queue.get(message.guild.id).looped === false)
                {
                    queue.get(message.guild.id).looped = true;
                    queue.get(message.guild.id).songs.unshift(queue.get(message.guild.id).songs[0]);
                    return message.lineReply("Loop enabled! 👌");
                }
                else
                {
                    queue.get(message.guild.id).looped = false;
                    queue.get(message.guild.id).songs.shift();
                    return message.lineReply("Loop disabled! 👌");
                }
            }

            if(args[0].replace(prefix, "") === "skip")
            {
                if(!voiceChannel) return message.lineReply("You need to be in a voice channel to use this command!");
                if(queue.get(message.guild.id) === undefined) return message.lineReply("There are no songs currently playing!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.lineReply("You need to be in the same voice channel as the bot to execute this command!");
                }

                if(queue.get(message.guild.id).looped)
                {
                    queue.get(message.guild.id).songs.shift();
                    queue.get(message.guild.id).songs.shift();
                    queue.get(message.guild.id).looped = false;
                }
                else queue.get(message.guild.id).songs.shift();

                if(queue.get(message.guild.id).songs.length === 0) 
                {
                    message.lineReply("There are no more songs left on the playlist! Skipping last song");
                    queue.get(message.guild.id).dispatcher.destroy();
                    return setTimeout(() => {
                        queue.get(message.guild.id).connection.disconnect();
                        queue.delete(message.guild.id);
                    }, 5000);                       
                }
                
                VideoPlayer(message.guild, queue.get(message.guild.id).songs[0]);

                return message.lineReply("Skipped! 👌");
            }

            if(args[0].replace(prefix, "") === "help")
            {
                const embed = new Discord.MessageEmbed()
                    .setColor("#000E44")
                    .setTitle("Help")
                    .setDescription("List of commands for Quaver")
                    .addField("Music commands:", "`>play`, `>skip`, `>pause`, `>resume`, `>unpause`, `>loop`")
                    .addField("Non-music commands:", "`>help`, `>about`, `>info`")
                    .addField("\u200B", "[Learn more](https://quavermaster.github.io/Pages/) • [Add to server](https://discord.com/oauth2/authorize?client_id=900522521093357619&scope=bot&permissions=4348800064) • [Source code](https://github.com/QuaverMaster/MainCode) • [Support Server](https://discord.gg/WdWzZKXen5)")

                return message.lineReply(embed);
            }

            if(args[0].replace(prefix, "") === "about")
            {
                const embed = new Discord.MessageEmbed()
                    .setColor("000E44")
                    .setTitle("About")
                    .setDescription("About Quaver")
                    .addField("For everyone, by everyone.", "Quaver is a music bot started by UnidentifiedX as a small coding project. However, he decided " + 
                    "to make the source code open-source so that others can also make their own discord bot with basic functions already included for a solid " + 
                    "start. Everyone is able to fork the code from the Github repository and either start their own bot or contribute. We pledge to make the " +
                    "source code free and open-source, forever.")
                    .addField("\u200B", "[Learn more](https://quavermaster.github.io/Pages/) • [Add to server](https://discord.com/oauth2/authorize?client_id=900522521093357619&scope=bot&permissions=4348800064) • [Source code](https://github.com/QuaverMaster/MainCode)")

                return message.lineReply(embed);
            }

            if(args[0].replace(prefix, "") === "info")
            {
                if(queue.get(message.guild.id) === undefined) return message.lineReply("There are no songs currently playing!");

                const videoLength = parseInt(queue.get(message.guild.id).songs[0].duration);

                const embed = new Discord.MessageEmbed()
                    .setColor("#000E44")
                    .setTitle("Song Info")
                    .setDescription(`Info about **${queue.get(message.guild.id).songs[0].title}**`)
                    .addField("Song Link", `[${queue.get(message.guild.id).songs[0].url}](${queue.get(message.guild.id).songs[0].url})`)
                    .addFields(
                        { name: "Views", value: `${queue.get(message.guild.id).songs[0].views}`, inline: true },
                        { name: "Length", value: `${Math.trunc(videoLength / 60)}:${videoLength % 60}`, inline: true},
                    )
                    .setFooter(`${queue.get(message.guild.id).songs[0].likes} 👍 | ${queue.get(message.guild.id).songs[0].dislikes} 👎`)

                return message.lineReply(embed);
            }
        }
    });
}

const VideoPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);

    if(song === undefined)
    {
        setTimeout(() => {
            songQueue.connection.disconnect();
            return queue.delete(guild.id);
        }, 5000);
    }
    else
    {
        const stream = ytdl(song.url, { filter: "audioonly" });
    
        songQueue.dispatcher = songQueue.connection.play(stream);
        
        songQueue.dispatcher.on("error", (error) => console.log(error));
        
        if(songQueue.looped)
        {
            songQueue.dispatcher.on("finish", () => {
                VideoPlayer(guild, songQueue.songs[0]);
            })
        }
        else
        {
            songQueue.dispatcher.on("finish", () => {
                songQueue.songs.shift();
                VideoPlayer(guild, songQueue.songs[0]);
            })
        }
    
        await songQueue.text_channel.send(`🎵 Now playing **${song.title}** 🎵`);
    }
}

MainTask();
client.login(token);
