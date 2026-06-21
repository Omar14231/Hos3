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

// أضف كلماتك هنا، البوت سيكتشفها حتى لو كانت داخل كلمة أخرى
const alertWords = ['كلب', 'زق', 'حمار', ' زفت', 'غبي', 'وصخ', 'كل', 'سب', 'ريحه']; 

client.once('ready', () => {
    console.log(`✅ البوت جاهز ويعمل بكامل طاقته!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // 1. نظام التنبيه (يقرأ الكلمة حتى لو مدموجة)
    const msgContent = message.content.toLowerCase();
    
    // الفحص باستخدام .some() يضمن أنه بمجرد وجود جزء من الكلمة سيتم التنبيه
    if (alertWords.some(word => msgContent.includes(word))) {
        const owner = await client.users.fetch(OWNER_ID);
        // إضافة <@OWNER_ID> تجعلها "منشن" حقيقي يصلك به إشعار
        owner.send(`🔔 **تنبيه منشن!** <@${OWNER_ID}>\n👤 **الشخص:** ${message.author.tag}\n💬 **الرسالة:** ${message.content}\n📍 **في الروم:** ${message.channel.name}`);
    }

    // 2. أمر التفعيل
    if (message.content === '!احم') {
        if (message.author.id !== OWNER_ID) return;
        monitoringEnabled = true;
        monitorChannel = message.channel;
        message.reply('🛡️ **تم تفعيل وضع مراقبة الشات. انتبه!**');
        return;
    }

    // 3. أمر الإيقاف
    if (message.content === '!احمم') {
        if (message.author.id !== OWNER_ID) return;
        monitoringEnabled = false;
        message.channel.send('🚫 **تم إيقاف وضع المراقبة.**');
        return;
    }

    // 4. مراقبة الشات
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
