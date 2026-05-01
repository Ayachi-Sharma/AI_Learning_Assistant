import dotenv from "dotenv";

import { GoogleGenAI } from "@google/genai";

// GPT line

import { generateWithFallback } from "./aiProviderRouter.js";



dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});



if (!process.env.GEMINI_API_KEY) {

    console.error('FATAL ERROR: GEMINI_API_KEY is not set in the enviorment variables.');

    process.exit(1);  

}



/**

 * Generate faslhcards from text

 * @param {string} text - Docuemnt text

 * @param {number} count - Number of flashcards to generate

 * @return {promise<Array<{question: string, answer: string, difficulty: string}>>}

 */



export const generateFlashcards =  async (text, count = 10) => {

    const prompt = `Genrated exactly ${count} educational falshcards from the following text.
    Each flashcard must be different and unique each and every time you generate, even with the same input text. Avoid repeating questions or answers across different generations.
    Do not create flashcards from Index, table of content, or similar sections. Focus on the main content of the document.
    Donot make long answers, keep flashcard answers from word to phrase.
    Format each flashcard as :

    Q: [Clear, specific question]

    A: [Concise, accurate answer]

    D: [Difficulty level: easy, medium, or hard]

    Seperate each flashcard with "---"

    Text:

    ${text.substring(0, 15000)}`;



    try {

        // GPT line

        const generatedText = await generateWithFallback(prompt);



        // const response = await ai.models.generateContent({

        //     model: "gemini-2.5-flash-lite",

        //     contents: prompt,

        // });

        // const generateText = response.text;



        // parse the response

        const falshcards = [];

        const cards = generatedText.split('---').filter(c => c.trim());



        for (const card of cards){

            const lines = card.trim().split('\n');

            let question = '', answer = '', difficulty = 'medium';



            for (const line of lines){

                if (line.startsWith('Q:')) {

                    question = line.substring(2).trim();

                }else if (line.startsWith('A:')) {

                    answer = line.substring(2).trim();

                }else if (line.startsWith('D:')) {

                    const diff = line.substring(2).trim().toLowerCase();

                    if (['easy', 'medium', 'hard'].includes(diff)) {

                        difficulty = diff;

                    }

                }

            }



            if ( question && answer ) {

                falshcards.push({ question, answer, difficulty });

            }

        }



        return falshcards.slice(0, count)

    } catch (error) {

        console.error('Gemini API error:' ,error);

        // throw new Error('failed to generate flashcards');

        throw error

    }

}



/**

 * Generate quiz question 

 * @param {string} text - Docuemnt text

 * @param {number} numQuestions - Number of questions

 * @return {promise<Array<{question: string, answer: string, options: Array, correctAnswer: String, explaination: string, difficulty: string}>>}

*/



export const generateQuiz = async (text, numQuestions) => {

    const prompt = `Genrated exactly ${numQuestions} multiple choice questions from the following text.
    Each question must be unique each and every time you generate, even with the same input text. Avoid repeating questions or answer options across different generations.
    Do not ask questions from Index, table of content, or similar sections. Focus on the main content of the document.
    Ask from each part of the document, do not ask all questions from the same section.
    Format each question as: 

    Q: [Questions]

    1: 

    2: 

    3: 

    4: 

    Correct ans: [Correct option - exactly as written above]

    Explaination: [Brief explaination]

    Level: [Difficulty: easy, medium, or hard]

    

    Seperate questions with "---"



    Text: 

    ${text.substring(0, 15000)}`;



    try {

        // GPT line

        const generatedText = await generateWithFallback(prompt);



        // const response = await ai.models.generateContent({

        //     model: "gemini-2.5-flash-lite",

        //     contents: prompt,

        // });

        // const generatedText = response.text;

        

        const questions = [];

        const questionBlocks = generatedText.split('---').filter(q => q.trim());



        for(const block of questionBlocks){

            const lines = block.trim().split('\n');

            let question = '', options = [], correctAnswer = '', explaination = '', difficulty ='medium';

        

            // edited according to me coz of error

            for (const line of lines){

                const trimmed = line.trim();

                if (trimmed.startsWith('Q:')) {

                    question =  trimmed.substring(2).trim();

                }else if (/^[1-4]:/.test(trimmed)){

                    options.push(trimmed.substring(3).trim());

                }else if(trimmed.startsWith('Correct ans:')){

                    correctAnswer = trimmed.substring('Correct ans:'.length).trim();

                }else if(trimmed.startsWith('Explaination:')){

                    explaination = trimmed.substring('Explaination:'.length).trim();

                }else if(trimmed.startsWith('Level:')){

                    const diff = trimmed.substring(6).trim().toLowerCase();

                    if (['easy', 'medium', 'hard'].includes(diff)) {

                        difficulty =  diff

                    }

                }

            }



            if (question && options.length === 4 && correctAnswer) {

                questions.push({question, options, correctAnswer, explaination, difficulty});

            }

        }

    console.log('Generated Text:', generatedText);



        return questions.slice(0, numQuestions);

    } catch (error) {

        console.error('Gemini API error:', error);

        // throw new Error('Failed to generate quiz');

        throw error;

    }

}



/** 

 * Generate Document Summary 

 * @param {string} text - Docuemnt text 

 * @returns {Promise<string>}

*/



export const generateSummary = async (text) => {

    const prompt = `Provide a concise summary of the following text, highlighting the key concepts , main ideas, and important points.
    Consider whole document and each heading of the document.
    Keep the summary clear and structured 



    Text: 

    ${text.substring(0, 8000)}`;



    try {

        // GPT line

        const generatedText = await generateWithFallback(prompt);



        // const response = await ai.models.generateContent({

        //     model: "gemini-2.5-flash-lite",

        //     contents: prompt,

        // });



        // // edited by me cause of error

        // const generatedText =  response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {

           throw new Error('Empty Gemini response');

        }



        return generatedText;



    } catch (error) {

        console.error('Gemini API error:', error);

        // throw new Error('Failed to generate summary');

        throw error;



    }

};



/** 

 * Chat with document context

 * @param {string} questions - User question

 * @param {Array<Object>} chunks - Relevant document chunks

 * @returns {Promise<String>} 

*/

export const chatWithContext = async (question, chunks) => {

    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');



    console.log("context_____", context);



    const prompt = `You are helping a user understand a document.

Use the context provided below to answer the question in a clear, natural and conversational way.
Explain the idea simply, as if you are talking to the user directly.

If the answer cannot be found in the context, be honest and say that the document does not contain enough information.

You may summarize, connect ideas, or clarify concepts — but do not make up facts that are not supported by the context.

    

    Context:

    ${context}



    Question: ${question} 

    

    Answer:`;

    try {

        // GPT line

        const generatedText = await generateWithFallback(prompt);



        // const response = await ai.models.generateContent({

        //     model: "gemini-2.5-flash-lite",

        //     contents: prompt,

        // });



        // const generatedText = response.text;

        return generatedText



    } catch (error) {

        console.error('Gemini API error:', error);

        // throw new Error('Failed to generate chat response');

        throw error;



    }    

}



/**

 * Eplain a specific concept

 * @param {string} concept - Concept to explain

 * @param {string} context - Relevant context

 * @retuens {Promise<string>} 

 */



export const explainConcept = async (concept, context) => {

    const prompt = `You are helping a user learn from an uploaded document.

Use the document context below to explain the concept the user is asking about.
The user may include phrases like "present in the document", "from the document",
or similar wording — treat these only as references to the context, not as part of the concept itself.

First understand the main topic or concept in the user’s question.
Then find the relevant information in the context and explain it in a clear,
natural and conversational teaching style.

You may summarise, simplify, connect steps, or add small intuitive examples
to make the idea easier to understand, but do not invent facts outside the context.
If the context truly does not contain relevant information, politely say so.

    context:
    ${context.substring(0, 10000)}

Clear Explanation:
    `;



    try {

        // GPT line

        const generatedText = await generateWithFallback(prompt);



        // const response = await ai.models.generateContent({

        //     model: "gemini-2.5-flash-lite",

        //     contents: prompt,

        // });



        // const generatedText = response.text;

        return generatedText

        

    } catch (error) {

        console.error('Gemini API error:', error);

        // throw new Error('Failed to generate summary'); 

        throw error;



    }

}



// GPT line to navigate prompt to other ai services

export const generateText = async (prompt) => {

  const response = await ai.models.generateContent({

    model: "gemini-2.5-flash-lite",

    contents: prompt,

  });



  return response.text;

};

