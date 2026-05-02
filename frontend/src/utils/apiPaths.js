// use env variable instead of localhost
export const BASE_URL = import.meta.env.VITE_API_URL;

console.log("ENV:", import.meta.env.VITE_API_URL);

export const API_PATHS = {
    AUTH : {
        REGISTER: `${BASE_URL}/api/auth/register`,
        LOGIN: `${BASE_URL}/api/auth/login`,
        GET_PROFILE: `${BASE_URL}/api/auth/profile`,
        UPDATE_PROFILE: `${BASE_URL}/api/auth/profile`,
        CHANGE_PASSWORD: `${BASE_URL}/api/auth/change-password`,
    },
    
    DOCUMENTS: {
        UPLOAD: `${BASE_URL}/api/documents/upload`,
        GET_DOCUMENTS: `${BASE_URL}/api/documents`,
        GET_DOCUMENT_BY_ID: (id) => `${BASE_URL}/api/documents/${id}`,
        UPDATE_DOCUMENT: (id) => `${BASE_URL}/api/documents/${id}`,
        DELETE_DOCUMENT: (id) => `${BASE_URL}/api/documents/${id}`,
    },

    AI:{
        GENERATE_FLASHCARDS: `${BASE_URL}/api/ai/generate-flashcards`,
        GENERATE_QUIZ: `${BASE_URL}/api/ai/generate-quiz`,
        GENERATE_SUMMARY: `${BASE_URL}/api/ai/generate-summary`,
        CHAT: `${BASE_URL}/api/ai/chat`,
        EXPLAIN_CONCEPT: `${BASE_URL}/api/ai/explain-concept`,
        GET_CHAT_HISTORY: (documentId) => `${BASE_URL}/api/ai/chat-history/${documentId}`
    },
    
    FLASHCARDS: {
        GET_ALL_FLASHCARD_SETS: `${BASE_URL}/api/flashcards`,
        GET_FLASHCARDS_FOR_DOC: (documentId) => `${BASE_URL}/api/flashcards/${documentId}`,
        REVIEW_FLASHCARD: (cardId) => `${BASE_URL}/api/flashcards/${cardId}/review`,
        TOGGLE_STAR: (cardId) => `${BASE_URL}/api/flashcards/${cardId}/star`,
        DELETE_FLASHCARD_SET: (id) => `${BASE_URL}/api/flashcards/${id}`,
    },

    QUIZZES: {
        GET_QUIZZES_FOR_DOC: (documentId) => `${BASE_URL}/api/quizzes/${documentId}`, 
        GET_QUIZ_BY_ID: (id) => `${BASE_URL}/api/quizzes/quiz/${id}`,
        SUBMIT_QUIZ: (id) => `${BASE_URL}/api/quizzes/${id}/submit`,
        GET_QUIZ_RESULTS: (id) => `${BASE_URL}/api/quizzes/${id}/results`,
        DELETE_QUIZ: (id) => `${BASE_URL}/api/quizzes/${id}`,
    },

    PROGRESS: {
        GET_DASHBOARD: `${BASE_URL}/api/progress/dashboard`,
    },
};