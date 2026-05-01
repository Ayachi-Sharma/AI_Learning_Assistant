import Flashcard from '../models/Flashcard.js'

// @desc   GET all falshcard for a document
// @Route GET /api/flashcards/:documentId
// @access Private
export const getFlashcards = async (req, res, next) => {
    try {
        const flashcards = await Flashcard.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards
        })
    } catch (error) {
        next(error);
        
    }
}
// @desc   GET all flashcards fro a user
// @Route GET /api/flashcards
// @access Private
export const getAllFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSets = await Flashcard.find({ userId: req.user._id })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets
        })
    } catch (error) {
        next(error);
    }
}

// @desc   Review flashcards
// @Route POST /api/flashcards/:cardId/review
// @access Private
export const reviewFlashcard = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user._id
        });

        if(!flashcardSet){
            return res.status(400).json({
                success: false,
                error: 'Flashcard set or card not found',
                statusCode: 404
            })
        }

        const cardIndex = flashcardSet.cards.findIndex(card =>card._id.toString() === req.params.cardId);

        if(cardIndex == -1 ){
            return res.status(404).join({
                success: false,
                error: 'Card not found in set',
                statusCode: 404
            })
        }

        // update review info
        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcard reviewed successfully'
        })
    } catch (error) {
        next(error);
        
    }
}

// @desc   Toggle star
// @Route PUT /api/flashcards/:cardId/star
// @access Private
export const toggleStarFlashcard = async (req, res, next) => {
    try {
        const flashcardSet  = await Flashcard.findOne({
            'cards._id' : req.params.cardId,
            userId: req.user._id
        })

        if(!flashcardSet){
            return res.status(404).json({
                success: false,
                error: 'Flashcard set or card not found',
                statusCode: 404
            })
        }

        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        if(cardIndex === -1){
            return res.status(404).json({
                success: false,
                error: 'Card not found in set',
                statusCode: 404
            })
        }

        // Toggle star
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;
        await flashcardSet.save();

        res.status(200).json({
            success: true,
            data: flashcardSet,
            message: `flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'instarred'}`
        });

    } catch (error) {
        next(error);
        
    }
}

// @desc   Delete a flashcard
// @Route DELETE /api/flashcards/:id
// @access Private
export const deleteFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user._id
        })

        if (!flashcardSet) {
            return res.status(404).json({
                success: false,
                error: 'Flashcard set not found',
                statusCode: 404
            })
        }

        await flashcardSet.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Flashcard set deleted succesfully'
        })
    } catch (error) {
        next(error);
        
    }
}