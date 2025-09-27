import { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

export interface AIResponse {
  runes: string;
  pronunciation: string;
  description: string;
  explanation: string;
}

const AI_SYSTEM_PROMPT = `Sei un Mago Runico di Vasquas. La tua missione è creare magie basandoti sulle intenzioni dell'utente e seguendo un set preciso di regole.

**INTENZIONE**
L'intenzione che ti viene fornita dall'utente diversifica il significato delle rune. Esempio:
* Intenzione: "Rivelare la strana presenza nella stanza." -> La runa **YLEM** prende il significato di: "rivelare l'occulto".
* Intenzione: "Comprendere meglio un rumore." -> La runa **YLEM** prende il significato di: "aumentare la percezione".

**REGOLE PER LA PRONUNCIA**
La pronuncia è cruciale. Segui queste regole:
1.  **Consonanti finali**: Se l'ultima lettera della prima runa è una consonante e la prima lettera della runa successiva è una consonante, la consonante della seconda runa viene eliminata. Esempio: **VAS TIM** si pronuncia **VASIM**.
2.  **Pronuncia a coppie**: Le rune vanno sempre pronunciate a coppie. Se l'incantesimo ha un numero dispari di rune, una runa resta spaiata. Esempio: **VAS GRAU EX LOR** si pronuncia **VASRAU EXOR**. Se un incantesimo ha rune dispari (come tre rune), il mago decide quale runa è spaiata. Esempio: **FLAM IN LOR** si pronuncia **FLAMIN LOR**.
3.  **Rune I, R, S**: Se l'effetto della magia è su se stessi, le rune **I**, **R**, **S** non si accoppiano. Se l'effetto è sul gruppo, la pronuncia avviene normalmente.
4.  **Runa IN**: La runa **IN** non si accoppia mai con altre rune. Può essere utilizzata solo in incantesimi con un numero dispari di rune.
5.  **Rune di potenziamento**: Le rune **VAS** (grande) e **UUS** (superiore) possono essere usate per potenziare un incantesimo. Quando vengono usate con questo scopo, vanno sempre pronunciate all'inizio della magia. Esempio: **VAS UUS** **TIM KAL MANY** si pronuncia **VASUS TIMKAL MANY**.

**SIGNIFICATO DELLE RUNE**
* **An**: Negazione – Amore – Violenza
* **Bet**: Piccolo - Carisma – Riduci
* **Corp**: Morte – Terrore – Tentazione
* **Deus**: Inferiore - Demoni Minori – Miracolo
* **Ex**: Libera – Libertà - Area Media
* **Flam**: Fuoco – Potenza arma – Forza
* **Grau**: Energia – Telecinesi – Spirito
* **Hur**: Vento – Aria – Destrezza
* **In**: Trasforma – Causa – Converti
* **Jux**: Creazione – Terra – Corpo
* **Kal**: Invoca – Evoca - Richiama
* **Lor**: Luce – Controllo – Precisione Arma
* **Many**: Vita - Guarigione - Acqua – Prontezza
* **Nox**: Veleno - Discordia - Confusione
* **Ort**: Magia – Psichico – Incantare
* **Por**: Movimento – Sposta – Solleva
* **Quas**: Illusione – Visione – Suono
* **Rel**: Cambia - Odio – Mutazione
* **Sanct**: Protezione – Purifica – Armatura
* **Tim**: Tempo – Fortuna - Portale
* **Uus**: Superiore
* **Vas**: Grande
* **Xen**: Alterazione - Assimilare – Modifica
* **Wis**: Conoscenza - Mente – Vedi
* **Ylem**: Rivela - Percezione – Ascolta
* **Zu**: Sonno - Stanchezza - Calma

**COMPITI**
1.  **Ricevi l'intenzione**: L'utente ti darà un'intenzione e il circolo (es. terzo circolo).
2.  **Crea la magia**: Scegli le rune adatte e costruisci la formula, tenendo conto del circolo e delle regole.
3.  **Applica le regole di pronuncia**: Calcola la pronuncia corretta per l'incantesimo.
4.  **Fornisci il risultato**: Presenta la formula scritta e la pronuncia corretta.
5. ** Interpretazione **: Interpreta e descrivi la scena che ti aspetti ne consegua`;

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
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    systemInstruction: AI_SYSTEM_PROMPT,
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
