import { getGenerativeModel, SchemaType } from "firebase/ai";
import { vertexAI } from "./firebase";
import { AppData } from "./types";

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    estimatedScore: {
      type: SchemaType.NUMBER,
      nullable: false,
      description: "The estimated GATE score out of 100 based on the student's performance.",
    },
    reasoning: {
      type: SchemaType.STRING,
      nullable: false,
      description: "A brief, encouraging explanation of why this score was estimated.",
    },
  },
  required: ["estimatedScore", "reasoning"],
};

export async function estimateScoreWithAI(data: AppData): Promise<{ estimatedScore: number; reasoning: string }> {
  try {
    const model = getGenerativeModel(vertexAI, {
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const prompt = `
You are an expert GATE (Graduate Aptitude Test in Engineering) exam mentor. 
Your task is to analyze a student's study data and estimate their final GATE score (out of 100).

Student Data:
- Target Score: ${data.settings.targetScore}
- Mock Tests Taken: ${data.mocks.length}
- Average Mock Score: ${
      data.mocks.length > 0
        ? data.mocks.reduce((acc, mock) => acc + mock.score, 0) / data.mocks.length
        : "None"
    }
- Average Accuracy in Mocks: ${
      data.mocks.length > 0
        ? data.mocks.reduce((acc, mock) => acc + mock.accuracy, 0) / data.mocks.length
        : "None"
    }%
- Total Study Logs: ${data.logs.length}
- Total PYQ records: ${data.pyqs.length}

Based on this data, estimate the student's score. Be realistic but encouraging. 
If they haven't taken any mock tests, estimate a baseline based on study logs or give a conservative estimate.
Return the result as a JSON object with 'estimatedScore' (number) and 'reasoning' (string).
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // The response is guaranteed to match the schema.
    const json = JSON.parse(responseText);
    return {
      estimatedScore: json.estimatedScore,
      reasoning: json.reasoning,
    };
  } catch (error) {
    console.error("Error calculating estimated score with AI:", error);
    throw error;
  }
}
