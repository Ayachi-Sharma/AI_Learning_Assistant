import Flashcard from '../models/Flashcard.js';
import Document from '../models/Document.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
// import * as aiService from '../utils/'
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

// @desc Gernerate flashcard from docuemnt
// @Route POST /api/ai/generate-flashcards
// @Access Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please Provide documentId',
                statusCode: 400
            })
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or ready',
                statuCode: 404
            });
        }

        // Generate Flashcard using gemini
        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );

        // console.log("RAW GEMINI RESPONSE:", cards);
        // console.log("FIRST CARD:", cards?.[0]);

        // Save to database
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer
                // card.ans ||
                // card.explanation ||
                // "No answer provided."
                ,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            }))
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully'
        })
    } catch (error) {
        next(error)
    }
}

// @desc Gernerate quiz from docuemnt
// @Route POST /api/ai/generate-quiz
// @Access Private
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions, title } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statusCode: 404
            });
        }

        // Generate quiz using Gemini
        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions)
        );

        // Save to database
        const quiz = await Quiz.create({
            userId: req.user._id,
            document: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestion: questions.length,
            userAnswers: [],
            score: 0
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully'
        });
    } catch (error) {
        next(error)
    }
}


// @desc Gernerate Summary from docuemnt
// @Route POST /api/ai/generate-summary
// @Access Private
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statuCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(400).json({
                success: false,
                error: 'Document not found or not ready',
                statuCode: 404
            });
        }

        // Generate summary using Gemini
        const summary = await geminiService.generateSummary(document.extractedText);

        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary
            },
            message: 'Summary generated successfully'
        });
    } catch (error) {
        next(error)
    }
}


// @desc Gernerate chat from docuemnt
// @Route POST /api/ai/chat
// @Access Private
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId and question',
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready',
                statuCode: 404
            });
        }

        // Find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        // Get or create chat history
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }

        // created this according to me coz of error
        if (!relevantChunks.length) {
            return res.status(200).json({
                success: true,
                data: {
                    question,
                    answer: "I couldn't find relevant information in the document.",
                    relevantChunks: []
                }
            });
        }

        // Generate response using Gemini
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        // Save Conversation
        chatHistory.messages.push(
            {
                role: 'user',
                content: question,
                timeStamp: new Date(),
                relevantChunks: []
            },
            {
                role: 'assistant',
                content: answer,
                timeStamp: new Date(),
                relevantChunks: chunkIndices
            }
        );

        await chatHistory.save();

        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Response genrated successfully'
        });
    } catch (error) {
        next(error)
    }
}

// @desc Gernerate explain concept from docuemnt
// @Route POST /api/ai/explain-concept
// @Access Private
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Please provide doucumentId and concept',
                statuCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'ready'
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not ready.',
                statuCode: 404
            });
        }

        // Find relevant chunks for the concept
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        // Generate explaination using Gemini
        const explaination = await geminiService.explainConcept(concept, context);

        res.status(200).json({
            success: true,
            data: {
                concept,
                explaination,
                relevantChunks: relevantChunks.map(c => c.chunkIndex)
            },
            message: 'Explaination generated successfully.'
        });
    } catch (error) {
        next(error)
    }
}

// @desc Gernerate chat from docuemnt
// @Route GET /api/ai/chat-history/:documentId
// @Access Private
export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Please provide documentId',
                statuCode: 400
            });
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId
        }).select('message');

        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [], //Return an empty array if no chat history found
                message: 'No chat history found for this document'
            });
        }

        res.status(200).json({
            success: true,
            data: chatHistory.messages,
            message: 'Chat history retrieved successfully.'
        })
    } catch (error) {
        next(error)
    }
}

