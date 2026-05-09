import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transcript, template } = await req.json();

        if (!transcript) {
            return Response.json({ error: 'No transcript provided' }, { status: 400 });
        }

        // Build prompt with template if provided
        let prompt = `You are a medical scribe. Generate a structured SOAP note from the conversation transcript.

Based on the following doctor-patient conversation transcript, generate a comprehensive SOAP note.

TRANSCRIPT:
${transcript}

Generate a SOAP note with these sections:`;

        if (template) {
            prompt += `
- Subjective: ${template.subjective_prompt}
- Objective: ${template.objective_prompt}
- Assessment: ${template.assessment_prompt}
- Plan: ${template.plan_prompt}`;
        } else {
            prompt += `
- Subjective: Chief complaint, history of present illness, relevant past medical history
- Objective: Physical examination findings, vital signs if mentioned, lab results if any
- Assessment: Diagnosis or differential diagnoses based on the findings
- Plan: Treatment plan, medications, follow-up instructions, patient education`;
        }

        prompt += `

Be professional and thorough. Use medical terminology appropriately.`;

        // Call Base44's AI integration
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    subjective: { type: "string" },
                    objective: { type: "string" },
                    assessment: { type: "string" },
                    plan: { type: "string" }
                },
                required: ["subjective", "objective", "assessment", "plan"]
            }
        });

        return Response.json({ 
            soapNote: result,
            success: true 
        });

    } catch (error) {
        console.error('SOAP generation error:', error);
        return Response.json({ 
            error: error.message,
            success: false 
        }, { status: 500 });
    }
});