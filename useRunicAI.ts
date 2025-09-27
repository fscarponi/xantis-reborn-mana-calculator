import { useState } from 'react';
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

    const generateSpell = async (prompt: string) => {
        if (!prompt.trim() || isLoadingAI) return;
        
        setIsLoadingAI(true);
        setAiError(null);
        setAiResponse(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: prompt,
                config: {
                    systemInstruction: process.env.MAGE_SYSTEM_PROMPT,
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
