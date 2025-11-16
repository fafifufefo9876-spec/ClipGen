import { GoogleGenAI, Type } from "@google/genai";
import { PromptItem } from '../types';

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      prompt: {
        type: Type.STRING,
        description: 'The detailed video prompt.'
      }
    },
    required: ['prompt']
  }
};

const makeGenerationApiCall = async (apiKey: string, category: string, description: string, clipCount: number): Promise<PromptItem[]> => {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `Anda adalah asisten kreatif ahli dalam menghasilkan rangkaian prompt video berkelanjutan untuk platform video AI. Tujuan Anda adalah menciptakan urutan klip sinematik yang mulus dan menyatu. Setiap prompt harus berdurasi 6 detik. Fokus pada kesinambungan visual, pergerakan kamera, dan palet warna yang konsisten. Prompt harus dalam Bahasa Indonesia.`;

  const userPrompt = `
    Buat rangkaian ${clipCount} prompt video, masing-masing untuk klip berdurasi 6 detik.

    Tema utama:
    - Kategori: "${category}"
    - Deskripsi Utama: "${description}"

    Instruksi Penting:
    1.  **Kesinambungan Mulus**: Setiap prompt harus melanjutkan adegan dari prompt sebelumnya tanpa jeda yang janggal. Pertahankan konsistensi karakter, lingkungan, palet warna, dan suasana.
    2.  **Jangkar Visual (Visual Anchor)**: Tentukan satu atau lebih elemen visual yang konsisten muncul di setiap klip untuk menyatukan rangkaian.
    3.  **Pergerakan Kamera**: Jelaskan pergerakan kamera secara spesifik di setiap prompt (contoh: pan kiri lambat, dolly zoom, bidikan statis, crane ke atas).
    4.  **Transisi Alami**: Pastikan transisi antar klip terasa disengaja dan mengalir secara alami.
    5.  **Bahasa**: Semua output prompt harus dalam Bahasa Indonesia.
  `;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.8,
    },
  });

  const jsonString = response.text.trim();
  const result = JSON.parse(jsonString);
  return result as PromptItem[];
};


export const generatePrompts = async (category: string, description: string, clipCount: number, userApiKey?: string): Promise<PromptItem[]> => {
  // Attempt 1: Use the default application key
  const defaultApiKey = process.env.API_KEY;
  if (defaultApiKey) {
    try {
      return await makeGenerationApiCall(defaultApiKey, category, description, clipCount);
    } catch (error) {
      console.warn("Default API key failed. Checking for user-provided fallback key.", error);
      // If default key fails and user key exists, fall through to try it.
      if (userApiKey) {
        // Continue to the next block
      } else {
        // If default key fails and there's NO user key, throw a specific error.
        throw new Error("API key bawaan aplikasi bermasalah. Silakan masukkan API Key Anda sebagai cadangan.");
      }
    }
  }

  // Attempt 2: Use the user-provided key as a fallback or if no default key exists
  if (userApiKey) {
    try {
      return await makeGenerationApiCall(userApiKey, category, description, clipCount);
    } catch (fallbackError) {
      console.error("User-provided API key also failed:", fallbackError);
      if (fallbackError instanceof Error && (fallbackError.message.includes('API key not valid') || fallbackError.message.includes('permission'))) {
        throw new Error("API Key yang Anda masukkan tidak valid atau tidak memiliki izin. Periksa kembali.");
      }
      // Throw a more generic error if the fallback also fails
      throw new Error("Gagal menghasilkan prompt. API bawaan dan API Anda keduanya gagal.");
    }
  }
  
  // If no keys are available or all attempts fail
  throw new Error("API Key tidak tersedia. Harap masukkan API Key yang valid di kolom yang disediakan.");
};


const makeTranslationApiCall = async (apiKey: string, prompts: PromptItem[]): Promise<PromptItem[]> => {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a professional translator. Translate the provided JSON object containing video prompts from Indonesian to English. Maintain the exact JSON structure. Only translate the value of the "prompt" key for each object in the array.`;

    const userPrompt = JSON.stringify(prompts);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    return result as PromptItem[];
};

export const translatePrompts = async (prompts: PromptItem[], userApiKey?: string): Promise<PromptItem[]> => {
    // Attempt 1: Use the default application key
    const defaultApiKey = process.env.API_KEY;
    if (defaultApiKey) {
        try {
            return await makeTranslationApiCall(defaultApiKey, prompts);
        } catch (error) {
            console.warn("Translation with default key failed. Checking for fallback.", error);
            if (userApiKey) {
                // Fall through
            } else {
                throw new Error("Gagal menerjemahkan prompt dengan API key bawaan.");
            }
        }
    }

    // Attempt 2: Use user-provided key
    if (userApiKey) {
        try {
            return await makeTranslationApiCall(userApiKey, prompts);
        } catch (fallbackError) {
            console.error("Translation with user key failed:", fallbackError);
            throw new Error("Gagal menerjemahkan prompt menggunakan API key Anda.");
        }
    }

    throw new Error("Tidak ada API key yang valid untuk menerjemahkan.");
};