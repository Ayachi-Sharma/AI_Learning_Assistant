import mongoose from "mongoose";
import fs from 'fs/promises';
import Quiz from '../models/Quiz.js'
import Document from '../models/Document.js'
import Flashcard from '../models/Flashcard.js'
import {extractTextFromPDF} from '../utils/pdfParser.js'
import {chunkText} from '../utils/textChunker.js'


// @desc upload PDF document
// route POST /api/doucments/upload
// access private
export const uploadDocument = async function (req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({
                success:"false",
                error: "Please upload a PDF file",
                statusCode: 400
            })
        }

        const {title} = req.body;

        if (!title) {
            // Delete ulpoaded file if no title provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                error: "Please provide document title",
                statusCode: 400
            })
        }

        // construct thr URL for the uploaded file
        const baseUrl = process.env.BASE_URL;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        // create document record
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: 'processing'
        });

        // process PDF in background (in production, use a queue like bull)
        processPDF(document._id, req.file.path).catch(err => {
            console.error('PDF processing error:', err);
        });

        res.status(201).json({
            success: true,
            data:document,
            message: 'Document uploaded successfully. Processing in process'
        });
         
    } catch (error) {
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {})
        }
        next(error);
    }
};

// Helper function to process pdf
const processPDF = async (documentId, filePath) => {
    try{
        const {text} = await extractTextFromPDF(filePath);

        // create chunks
        const chunks = chunkText(text, 500, 50);

        // upsate document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        console.log(`Document ${documentId} processed successfully`);
    }
    catch(error){
        console.error(`Error processing documents ${documentId}:`, error);
        
        await Document.findByIdAndUpdate(documentId, {
            status: 'failed'
        });
    }
};

// @desc Get all user documents
// route GET /api/documents
// access private
export const getDocuments = async function (req, res, next) {
    try {
        const documents = await Document.aggregate([
            {
                $match: {userId: new mongoose.Types.ObjectId(req.user._id)}
            },
            {
                $lookup:{
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup:{
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'document',
                    as: 'quizzes'
                }   
            },
            {
                $addFields: {
                    flashcardCount: {
                        $size:  { $ifNull: ['$flashcardSets', []] }
                    },
                    quizCount:{
                        $size: { $ifNull: ['$quizzes', []] }
                    }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: {uploadDate: -1}
            }
        ]);
    
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        })
    } catch (error) {
        next(error);
        
    }
};

// @desc get one doucment with chunks
// route GET api/documents/:id
// access private
export const getDocument = async function (req, res, next) {
    try {
        const document = await Document.findOne({
            _id:req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id});
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id});

        // update last accessed
        document.lastAccessed = Date.now();
        await document.save();

        // Combine document data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });

    } catch (error) {
        next(error);
        
    }
};

// @desc delete one document 
// route DELETE api/doucment/:id
// access Private
export const deleteDocument = async function (req, res, next) {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Delete file from filesystem
        await fs.unlink(document.filePath).catch(() => {});

        // delete document
        await document.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        next(error);
        
    }
};

// @desc update a document title
// route PUT api/documents/:id
// access Private
// export const updateDocuemnt = async function (req, res, next) {
//     try {
        
//     } catch (error) {
//         next(error);
        
//     }
// };