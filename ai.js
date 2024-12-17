const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ApexChat, ApexImagine, ApexImageAnalyzer } = require('apexify.js');
const translate = require('@iamtraction/google-translate');

const IMAGE_GENERATION_OPTIONS = {
    count: 1,
    nsfw: false,
    deepCheck: false,
    nsfwWords: [],
    negative_prompt: "",
    sampler: "DPM++ 2M Karras",
    height: 512,
    width: 512,
    cfg_scale: 9,
    steps: 20,
    seed: -1,
    image_style: "cinematic"
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('Herramientas de IA interactivas')
        .addSubcommand(command => 
            command.setName('image-generate')
                .setDescription('Genera imágenes increíbles con IA')
                .addStringOption(option => 
                    option.setName('prompt')
                        .setDescription('Describe la imagen que quieres crear')
                        .setRequired(true)
                )
        )
        .addSubcommand(command => 
            command.setName('image-analyser')
                .setDescription('Analiza imágenes con inteligencia artificial')
                .addStringOption(option => 
                    option.setName('image-url')
                        .setDescription('URL de la imagen a analizar')
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option.setName("prompt")
                        .setDescription("Instrucciones adicionales para el análisis")
                        .setRequired(false)
                )
        )
        .addSubcommand(command => 
            command.setName('chat')
                .setDescription('Conversación con IA inteligente')
                .addStringOption(option => 
                    option.setName('prompt')
                        .setDescription('Escribe tu consulta para la IA')
                        .setRequired(true)
                )
        ),

    async execute(interaction, client) {
        await interaction.deferReply();
        
        const sub = interaction.options.getSubcommand();

        try {
            switch (sub) {
                case "image-generate":
                    await handleImageGeneration(interaction, client);
                    break;
                case "image-analyser":
                    await handleImageAnalysis(interaction);
                    break;
                case "chat":
                    await handleChatCompletion(interaction);
                    break;
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: `🚫 Error al procesar tu solicitud. Intenta de nuevo más tarde.`, 
                ephemeral: true 
            });
        }
    }
};

async function handleImageGeneration(interaction, client) {
    const prompt = interaction.options.getString('prompt');
    const model = 'flux-pro';

    const imageResponse = await ApexImagine(model, prompt, IMAGE_GENERATION_OPTIONS);
    const imageUrl = Array.isArray(imageResponse) ? imageResponse[0] : imageResponse;

    const embed = new EmbedBuilder()
        .setAuthor({ 
            name: `🎨 Generación de Imagen de IA`,
            iconURL: client.user.displayAvatarURL()
        })
        .setTitle(`🖌️ Imagen Generada por🌈`)
        .setDescription(('imagen Generada',prompt))
        .setImage(imageUrl)
        .setColor(client.config.embedAi)
        .setFooter({ 
            text: `Imagen generada con ${model} 🤖`, 
            iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

async function handleImageAnalysis(interaction) {
    const imageUrl = interaction.options.getString('image-url');
    const analysisResult = await ApexImageAnalyzer({ imgURL: imageUrl });
    const translatedAnalysis = await translate(analysisResult, { to: 'es' });

    await interaction.editReply(`🔍 Análisis de Imagen:\n\n${translatedAnalysis.text}`);
}

async function handleChatCompletion(interaction) {
    const prompt = interaction.options.getString('prompt');
    const chatModel = 'gpt-4o';
    const chatResponse = await ApexChat(chatModel, prompt, {
        userId: interaction.user.id,
        memory: false,
        limit: 0,
        instruction: 'You are a friendly assistant.',
    });

    await interaction.editReply(`💬 Respuesta de Chat:\n\n${chatResponse}`);
}
