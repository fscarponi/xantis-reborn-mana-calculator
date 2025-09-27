/**
 * The API endpoint for the Text-to-Speech service.
 * We use a CORS proxy to bypass browser-based cross-origin restrictions.
 */
const PROXIED_TTS_API_URL = 'https://corsproxy.io/?' + encodeURIComponent('https://www.openai.fm/api/generate');

/**
 * Generates audio from text using an external TTS API and returns an HTMLAudioElement.
 * This function encapsulates the logic for making the API request and creating an audio object
 * from the response.
 *
 * @param text The text to be converted into speech.
 * @param instructions Detailed instructions for the voice model to follow, affecting tone, pacing, etc.
 * @returns A promise that resolves with an `HTMLAudioElement` containing the generated speech.
 * @throws An error if the API request fails or if the response cannot be processed.
 */
export const generateAudio = async (text: string): Promise<HTMLAudioElement> => {
    try {
        const instructions = "Voice Affect: Potente, risonante, imbevuto di magia; trasmetti la forza dei mondi antichi.\n\nTone: Cupo, profetico, ancestrale; infondi nelle parole la saggezza dei secoli e un destino ineluttabile.\n\nPacing: Maestoso rapido e crescente.\n\nEmotion: Eroico, intriso di saggezza e potere arcano; esprimi il coraggio e la potenza che solo la vera magia può conferire.\n\nPronunciation: Articolazione chiara e potente, ogni sillaba risuona come un incantesimo; enfatizza le parole chiave come se fossero rune scoperte da poco.\n\nPauses: Pause drammatiche e cariche di potere, che segnano il passaggio tra le fasi di un rito o la rivelazione di un segreto profondo.";

        const formData = new FormData();
        formData.append('input', text);
        formData.append('prompt', instructions);
        formData.append('voice', 'nova');
        formData.append('vibe', 'null'); // Explicitly sending 'null' as a string to match the cURL example

        const response = await fetch(PROXIED_TTS_API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            // Attempt to get a more detailed error message from the response body.
            const errorText = await response.text().catch(() => `Request failed with status ${response.status}: ${response.statusText}`);
            throw new Error(errorText || 'Failed to generate audio.');
        }

        // The response is expected to be an audio file (e.g., audio/mpeg).
        const blob = await response.blob();

        // Create a temporary URL for the audio blob to be used by the HTMLAudioElement.
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        return audio;

    } catch (error) {
        // Log the detailed error for debugging purposes.
        console.error("Text-to-Speech Generation Error:", error);
        // Re-throw the error so the calling component's catch block can handle it (e.g., update UI state).
        throw error;
    }
};