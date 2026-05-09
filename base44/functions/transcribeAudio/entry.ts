import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai@4.28.0';

const openai = new OpenAI({
    apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const audioFile = formData.get('audio');
        const model = formData.get('model') || 'whisper-1';
        const language = formData.get('language') || 'en';

        if (!audioFile) {
            return Response.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Convert the file to the format OpenAI expects
        const file = new File([audioFile], 'audio.webm', { type: audioFile.type });

        const transcription = await openai.audio.transcriptions.create({
            file: file,
            model: model,
            language: language,
            response_format: 'text'
        });

        return Response.json({ 
            transcript: transcription,
            success: true 
        });

    } catch (error) {
        console.error('Transcription error:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});