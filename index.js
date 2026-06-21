const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

const OWNER_ID = '1306034100544737461';
let monitoringEnabled = false;
let monitorChannel = null;

client.once('ready', () => {
    console.log(`✅ البوت جاهز: ${client.user.tag}`);
});

// التعامل مع الأوامر
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // تفعيل المراقبة
    if (message.content === '!احم') {
        if (message.author.id !== OWNER_ID) return;
        monitoringEnabled = true;
        monitorChannel = message.channel;
        message.reply('🛡️ **تم تفعيل وضع المراقبة. أنا الآن أراقب الشات...**');
        client.users.cache.get(OWNER_ID)?.send('🔔 **تم تفعيل مراقبة الشات بنجاح.**');
        return;
    }

    // إيقاف المراقبة
    if (message.content === '!احمم') {
        if (message.author.id !== OWNER_ID) return;
        monitoringEnabled = false;
        message.channel.send('🚫 **تم إيقاف وضع المراقبة.**');
        return;
    }

    // منطق المراقبة (إرسال الرسائل للخاص)
    if (monitoringEnabled && message.channel.id === monitorChannel?.id) {
        const user = await client.users.fetch(OWNER_ID);
        user.send(`⚠️ **تنبيه مراقبة:**\n👤 **الشخص:** ${message.author.tag} (${message.author.id})\n💬 **الرسالة:** ${message.content}\n🔗 **الرابط:** ${message.url}`);
    }

    // الرد من الخاص وإرساله للروم
    if (message.channel.isDMBased() && message.author.id === OWNER_ID && monitorChannel) {
        monitorChannel.send(`📢 **رسالة من المالك:**\n${message.content}`);
    }
});

client.login(process.env.DISCORD_TOKEN);

