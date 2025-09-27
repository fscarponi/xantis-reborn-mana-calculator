import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

export interface AIResponse {
  runes: string;
  pronunciation: string;
  description: string;
  explanation: string;
}

export const useRunicAI = () => {
    const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [systemPrompt, setSystemPrompt] = useState<string>('');

    useEffect(() => {
        if (!process.env.MAGE_SYSTEM_PROMPT) {
            fetch('/system-prompt.txt')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(text => setSystemPrompt(text))
                .catch(error => {
                    console.error('Failed to fetch system prompt:', error);
                    setAiError("Impossibile caricare le istruzioni per il Mago. Controlla che il file system-prompt.txt sia presente.");
                });
        }
    }, []);

    const generateSpell = async (prompt: string) => {
        const finalSystemPrompt = process.env.MAGE_SYSTEM_PROMPT || systemPrompt;

        if (!prompt.trim() || isLoadingAI) return;

        if (!finalSystemPrompt) {
            setAiError("Le istruzioni per il Mago non sono ancora state caricate. Riprova tra un istante.");
            return;
        }
        
        setIsLoadingAI(true);
        setAiError(null);
        setAiResponse(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: finalSystemPrompt,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            runes: {
                                type: Type.STRING,
                                description: 'La formula magica completa, composta dalle rune scelte. Esempio: "VAS GRAU EX LOR"'
                            },
                            pronunciation: {
                                type: Type.STRING,
                                description: 'La pronuncia corretta dell\'incantesimo secondo le regole. Esempio: "VASRAU EXOR"'
                            },
                            description: {
                                type: Type.STRING,
                                description: 'Una descrizione scenica e suggestiva di ciò che accade quando l\'incantesimo viene lanciato.'
                            },
                            explanation: {
                                type: Type.STRING,
                                description: 'Una spiegazione dettagliata del perché sono state scelte quelle rune in base all\'intenzione dell\'utente e come contribuiscono all\'effetto finale.'
                            },
                        },
                        required: ['runes', 'pronunciation', 'description', 'explanation'],
                    },
                },
            });
            
            const responseText = response.text.trim();
            const parsedResponse = JSON.parse(responseText);
            setAiResponse(parsedResponse);

        } catch (error) {
            console.error("Gemini API error:", error);
            setAiError("Il Mago non è riuscito a completare l'incantesimo. Riprova con un'intenzione diversa.");
        } finally {
            setIsLoadingAI(false);
        }
    };

    return { aiResponse, isLoadingAI, aiError, generateSpell };
};