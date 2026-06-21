const { Client, GatewayIntentBits, Partials } = require('discord.js');
const express = require('express');
const app = express();

// --- جزء منع الخمول (HTTP) ---
app.get('/', (req, res) => res.send('البوت يعمل الآن! 🚀'));
app.listen(process.env.PORT || 3000);

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

// --- ضع كلماتك هنا (المناطق التي تمنشنك) ---
const alertWords = ['كلب', 'زق', 'حمار', ' زفت', 'غبي', 'وصخ', 'كل', 'سب', 'ريحه']; 

client.once('ready', () => {
    console.log(`✅ البوت جاهز: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // 1. نظام التنبيه بالكلمات (حتى لو مدموجة)
    const msgContent = message.content.toLowerCase();
    if (alertWords.some(word => msgContent.includes(word))) {
        const owner = await client.users.fetch(OWNER_ID);
        owner.send(`🔔 **تنبيه منشن!** <@${OWNER_ID}>\n👤 **الشخص:** ${message.author.tag}\n💬 **الرسالة:** ${message.content}\n📍 **الروم:** ${message.channel.name}`);
    }

        // 2. أمر التفعيل
    if (message.content === '!احم') {
        if (message.author.id !== OWNER_ID) return;
        monitoringEnabled = true;
        monitorChannel = message.channel;
        message.reply('🛡️ **تم تفعيل وضع المراقبة. أنا الآن أراقب الشات...**');
        // هنا تم إضافة المنشن لك في الخاص
        client.users.cache.get(OWNER_ID)?.send(`🔔 <@${OWNER_ID}> **تم تفعيل مراقبة الشات بنجاح.**`);
        return;
    }

    // 3. أمر الإيقاف
    if (message.content === '!احمم') {
        if (message.author.id !== OWNER_ID) return;
        monitoringEnabled = false;
        message.channel.send('🚫 **تم إيقاف وضع المراقبة.**');
        // هنا تم إضافة المنشن لك في الخاص
        client.users.cache.get(OWNER_ID)?.send(`🔔 <@${OWNER_ID}> **تم إيقاف وضع المراقبة.**`);
        return;
    }

    // 4. المراقبة العامة (إرسال للخاص)
    if (monitoringEnabled && message.channel.id === monitorChannel?.id) {
        const owner = await client.users.fetch(OWNER_ID);
        owner.send(`👁️ **مراقبة:** ${message.author.tag}: ${message.content}`);
    }

    // 5. الرد من الخاص للروم
    if (message.channel.isDMBased() && message.author.id === OWNER_ID && monitorChannel) {
        monitorChannel.send(`${message.content}`);
    }
});

client.login(process.env.DISCORD_TOKEN);
