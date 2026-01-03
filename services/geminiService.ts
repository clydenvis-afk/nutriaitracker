import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Recipe, UserProfile } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client strictly with the API key
const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeFoodInput = async (input: string): Promise<AnalysisResult> => {
    if (!apiKey) {
        throw new Error("API Key is missing. Please check your configuration.");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze the following food/drink input and estimate nutritional values. 
            The user might mention specific brands (e.g., Jollibee, Starbucks, Monster Energy) or generic foods.
            If the quantity is specified (e.g., 100g, 1 cup), calculate based on that. 
            If not specified, estimate a standard serving size.
            Input: "${input}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        foodItems: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "Short name of the food item" },
                                    description: { type: Type.STRING, description: "Portion size description (e.g., 1 cup, 100g, 1 burger)" },
                                    calories: { type: Type.NUMBER, description: "Estimated calories (kcal)" },
                                    protein: { type: Type.NUMBER, description: "Protein in grams" },
                                    carbs: { type: Type.NUMBER, description: "Carbohydrates in grams" },
                                    fat: { type: Type.NUMBER, description: "Fat in grams" },
                                },
                                required: ["name", "calories", "protein", "carbs", "fat", "description"],
                            },
                        },
                    },
                    required: ["foodItems"],
                },
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error("No response from AI");
        }
        
        return JSON.parse(text) as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw error;
    }
};

export const suggestRecipes = async (profile: UserProfile, recentMeals: string[]): Promise<Recipe[]> => {
    if (!apiKey) {
        throw new Error("API Key is missing.");
    }

    const context = recentMeals.length > 0 
        ? `The user is ${profile.age} years old. Recent meals: ${recentMeals.slice(0, 10).join(", ")}. Suggest something different or complementary.` 
        : `The user is ${profile.age} years old. Suggest generally healthy balanced meals.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a nutrition assistant. Create 3 distinct, healthy recipe suggestions for a user with a daily target of ${profile.targetCalories} calories.
            ${context}
            Each recipe should be practical to cook at home. 
            Provide estimated nutrition per serving.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        recipes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "Name of the dish" },
                                    description: { type: Type.STRING, description: "Brief appetizing description" },
                                    ingredients: { 
                                        type: Type.ARRAY, 
                                        items: { type: Type.STRING },
                                        description: "List of main ingredients"
                                    },
                                    calories: { type: Type.NUMBER },
                                    protein: { type: Type.NUMBER },
                                    carbs: { type: Type.NUMBER },
                                    fat: { type: Type.NUMBER },
                                },
                                required: ["name", "description", "ingredients", "calories", "protein", "carbs", "fat"],
                            },
                        },
                    },
                    required: ["recipes"],
                },
            },
        });

        const text = response.text;
        if (!text) return [];
        const result = JSON.parse(text) as { recipes: Recipe[] };
        return result.recipes;
    } catch (error) {
        console.error("Error generating recipes:", error);
        throw error;
    }
};

export const analyzeExerciseInput = async (input: string, userWeightKg: number): Promise<{ name: string, durationMinutes: number, caloriesBurned: number }[]> => {
    if (!apiKey) {
        throw new Error("API Key is missing.");
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze the following exercise input. The user weighs ${userWeightKg}kg.
            Estimate the calories burned.
            Input: "${input}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "Name of exercise (e.g. Running, Weight Lifting)" },
                                    durationMinutes: { type: Type.NUMBER, description: "Duration in minutes" },
                                    caloriesBurned: { type: Type.NUMBER, description: "Estimated calories burned" }
                                },
                                required: ["name", "durationMinutes", "caloriesBurned"]
                            }
                        }
                    },
                    required: ["exercises"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        const result = JSON.parse(text) as { exercises: { name: string, durationMinutes: number, caloriesBurned: number }[] };
        return result.exercises;
    } catch (error) {
        console.error("Error analyzing exercise:", error);
        throw error;
    }
};
