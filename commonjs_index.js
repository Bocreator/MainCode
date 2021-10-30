const { Client, Intents, MessageEmbed } = require("discord.js");
const { getVoiceConnection, getVoiceChannel, joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require("@discordjs/voice");
const spdl = require("spdl-core");
const yts = require("yt-search");
const ytdl = require("ytdl-core");

const queue = new Map();

const token = "<insert_your_token_here>";
const discClient = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
}); 

function MainTask()
{
    discClient.on("ready", () => {
        console.log(`Logged in as ${discClient.user.tag}`);
    });

    discClient.on("messageCreate", async (message) => {
        var prefix = ">";
        var args = message.content.replace(/ +/g, " ").split(" ");

        var serverQueue = queue.get(message.guild.id); // Gets the server queue from the array of other server queues

        if(args[0].startsWith(prefix))
        {
            const voiceChannel = message.member.voice.channel;

            if(args[0].replace(prefix, "") === "play")
            {
                let song = {};

                if(!voiceChannel) return message.reply("You need to be in a voice channel to execute this command!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.reply("You need to be in the same voice channel as the bot to execute this command!");
                }
                
                console.log(args);
                if(args.length >= 2)
                {
                    if(ytdl.validateURL(args[1]))
                    {
                        const songInfo = await ytdl.getInfo(args[1])
                        song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url };
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
                        else return message.reply("There was an error finding the video. Please try again.");
                    }
                }
                else return message.reply("You need to send in the correct arguments! To play, do `play <song_name or url>`. To learn more, do `help`.");

                if(!serverQueue)
                {
                    const queueConstructor = {
                        voice_channel: voiceChannel,
                        text_channel: message.channel,
                        connection: null,
                        songs: [],
                        audioPlayer: createAudioPlayer(),
                        paused: false,
                        looped: false
                    }

                    queue.set(message.guild.id, queueConstructor);
                    queueConstructor.songs.push(song)

                    try{
                        const connection = joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: message.guild.id,
                            adapterCreator: message.guild.voiceAdapterCreator
                        })

                        queueConstructor.connection = connection;
                        VideoPlayer(message.guild, queueConstructor.songs[0]);
                    }
                    catch (err)
                    {
                        queue.delete(message.guild.id);
                        message.reply("There was an error connecting!");
                        throw err;
                    }
                }
                else
                {
                    serverQueue.songs.push(song);
                    return message.reply(`**${song.title}** added to queue!`);
                }
            }

            if(args[0].replace(prefix, "") === "stop" || args[0].replace(prefix, "") === "disconnect")
            {
                queue.delete(message.guild.id);
                getVoiceConnection(message.guild.id).disconnect();
                return message.reply("Successfully disconnected from voice channel 👌");
            }
            
            if(args[0].replace(prefix, "") === "pause")
            {
                if(queue.get(message.guild.id).paused) return message.reply("Song is already paused!");
                if(!voiceChannel) return message.reply("You need to be in a voice channel to use this command!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.reply("You need to be in the same voice channel as the bot to execute this command!");
                }

                queue.get(message.guild.id).audioPlayer.pause();
                queue.get(message.guild.id).paused = true;
                return message.reply("Song paused 👌")
            }

            if(args[0].replace(prefix, "") === "unpause" || args[0].replace(prefix, "") === "resume")
            {
                if(!queue.get(message.guild.id).paused) return message.reply("Song is already unpaused!");
                if(!voiceChannel) return message.reply("You need to be in a voice channel to use this command!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.reply("You need to be in the same voice channel as the bot to execute this command!");
                }

                queue.get(message.guild.id).audioPlayer.unpause();
                queue.get(message.guild.id).paused = false;
                return message.reply("Song resumed 👌");
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

                const embed = new MessageEmbed()
                    .setColor("#000E44")
                    .setTitle("Playlist")
                    .setDescription(`Playlist for **${message.guild.name}**`)
                    .addField("Currently playing:", currentSong)
                    .addField("Upcoming songs:", upcomingSongs)

                return message.reply({ embeds: [embed] });
            }

            if(args[0].replace(prefix, "") === "loop")
            {
                if(!voiceChannel) return message.reply("You need to be in a voice channel to use this command!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.reply("You need to be in the same voice channel as the bot to execute this command!");
                }

                if(queue.get(message.guild.id).looped === false)
                {
                    queue.get(message.guild.id).looped = true;
                    queue.get(message.guild.id).songs.unshift(queue.get(message.guild.id).songs[0]);
                    return message.reply("Loop enabled! 👌");
                }
                else
                {
                    queue.get(message.guild.id).looped = false;
                    queue.get(message.guild.id).songs.shift();
                    return message.reply("Loop disabled! 👌");
                }
            }

            if(args[0].replace(prefix, "") === "skip")
            {
                if(!voiceChannel) return message.reply("You need to be in a voice channel to use this command!");
                if(serverQueue)
                {
                    if (serverQueue.voice_channel.id !== voiceChannel.id) return message.reply("You need to be in the same voice channel as the bot to execute this command!");
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
                    queue.get(message.guild.id).audioPlayer.stop();
                    queue.delete(message.guild.id);
                    return message.reply("There are no more songs left on the playlist! Skipping last song")
                }
                
                VideoPlayer(message.guild, queue.get(message.guild.id).songs[0]);
                return message.reply("Skipped! 👌");
            }

            if(args[0].replace(prefix, "") === "help")
            {
                const embed = new MessageEmbed()
                    .setColor("#000E44")
                    .setTitle("Help")
                    .setDescription("List of commands for Quaver")
                    .addField("Music commands:", "`>play`, `>skip`, `>pause`, `>resume`, `>unpause`, `>loop`")
                    .addField("Non-music commands:", "`>help`, `>about`, `>info`")
                    .addField("\u200B", "[Learn more](https://quavermaster.github.io/Pages/) • [Add to server](https://discord.com/oauth2/authorize?client_id=900522521093357619&scope=bot&permissions=4348800064) • [Source code](https://github.com/QuaverMaster/MainCode)")
                // Remember to change the "Add to Server" link to invite your own bot
                return message.reply({ embeds: [embed] });
            }

            if(args[0].replace(prefix, "") === "about")
            {
                const embed = new MessageEmbed()
                    .setColor("000E44")
                    .setTitle("About")
                    .setDescription("About Quaver")
                    .addField("For everyone, by everyone.", "Quaver is a music bot started by UnidentifiedX as a small coding project. However, he decided " + 
                    "to make the source code open-source so that others can also make their own discord bot with basic functions already included for a solid " + 
                    "start. Everyone is able to fork the code from the Github repository and either start their own bot or contribute. We pledge to make the " +
                    "source code free and open-source, forever.")
                    .addField("\u200B", "[Learn more](https://quavermaster.github.io/Pages/) • [Add to server](https://discord.com/oauth2/authorize?client_id=900522521093357619&scope=bot&permissions=4348800064) • [Source code](https://github.com/QuaverMaster/MainCode)")
                // Remember to change the "Add to Server" link to invite your own bot
                return message.reply({ embeds: [embed] });
            }
            
            if(args[0].replace(prefix, "") === "info")
            {
                const videoLength = parseInt(queue.get(message.guild.id).songs[0].duration);

                const embed = new MessageEmbed()
                    .setColor("#000E44")
                    .setTitle("Song Info")
                    .setDescription(`Info about **${queue.get(message.guild.id).songs[0].title}**`)
                    .addField("Song Link", `[${queue.get(message.guild.id).songs[0].url}](${queue.get(message.guild.id).songs[0].url})`)
                    .addFields(
                        { name: "Views", value: `${queue.get(message.guild.id).songs[0].views}`, inline: true },
                        { name: "Length", value: `${Math.trunc(videoLength / 60)}:${videoLength % 60}`, inline: true},
                    )
                    .setFooter(`${queue.get(message.guild.id).songs[0].likes} 👍 | ${queue.get(message.guild.id).songs[0].dislikes} 👎`)

                return message.reply({ embeds: [embed] });
            }
        }
    })
}

const VideoPlayer = async (guild, song) => {
    const songQueue = queue.get(guild.id);

    if(song === undefined)
    {
        return queue.delete(guild.id);
    }
    else
    {
        const stream = ytdl(song.url, { filter: "audioonly" });
        const resource = createAudioResource(stream);
    
        songQueue.audioPlayer.play(resource);
        songQueue.connection.subscribe(songQueue.audioPlayer);
        
        songQueue.audioPlayer.on("error", async error => {
            console.log(error);
            await songQueue.text_channel.send("Something went wrong. Please try again.");
        })
        
        console.log(songQueue.looped);
        if(songQueue.looped)
        {
            songQueue.audioPlayer.on(AudioPlayerStatus.Idle, () => {
                VideoPlayer(guild, songQueue.songs[0]);
            })
        }
        else
        {
            songQueue.audioPlayer.on(AudioPlayerStatus.Idle, () => {
                songQueue.songs.shift();
                VideoPlayer(guild, songQueue.songs[0]);
            })
        }
    
        await songQueue.text_channel.send(`🎵 Now playing **${song.title}** 🎵`);
    }
}

discClient.login(token);
MainTask();
