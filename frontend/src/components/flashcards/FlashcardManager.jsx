import React, { useState, useEffect } from 'react'
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    WalletCards,
    ArrowLeft,
    Sparkles,
    Brain,
    Delete,
    TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import moment from 'moment'

import { useNavigate } from "react-router-dom"
import flashcardService from '../../Services/fashcardService';
import aiService from '../../Services/aiService';
import Spinner from '../common/spinner';
import Modal from '../common/Modal';
import Flashcard from './Flashcard';

const FlashcardManager = ({ documentId }) => {

    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);
const navigate = useNavigate()

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardForDocument(documentId);
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error("Failed to fetch flashcard Sets.")
            console.error(error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully!");
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards")
        } finally {
            setGenerating(false);
        }
    }

    const handleNextCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length)
        }
    }

    const handlePrevCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length)
        }
    }

    // changes by GPT
    // const handleReview = async (index) => {
    //     const currentCard = selectedSet?.cards[currentCardIndex];
    //     if (!currentCard) return;

    //     try {
    //         await flashcardService.reviewFlashcard(currentCard._id, index);
    //     } catch (error) {
    //     }
    // }

    const handleReview = async (index) => {
    const card = selectedSet?.cards[index];
    if (!card) return;

    try {
        await flashcardService.reviewFlashcard(card._id);

        // ⭐ LOCAL STATE UPDATE (THIS IS MAIN MAGIC)

        const updatedSets = flashcardSets.map((set) => {
            if (set._id === selectedSet._id) {
                const updatedCards = set.cards.map((c, i) =>
                    i === index
                        ? { ...c, lastReviewed: new Date() }
                        : c
                );

                return { ...set, cards: updatedCards };
            }
            return set;
        });

        setFlashcardSets(updatedSets);

        // update selected set also
        const newSelected = updatedSets.find(
            (s) => s._id === selectedSet._id
        );

        setSelectedSet(newSelected);

    } catch (error) {
        console.log("review failed");
    }
};

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            const updatedSets = flashcardSets.map((set) => {
                if (set._id === selectedSet._id) {
                    const updatedCards = set.cards.map((card) =>
                        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                    );
                    return { ...set, cards: updatedCards };
                }
                return set;
            });
            setFlashcardSets(updatedSets);
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id))
            // toast.success("Flashcard starred status updated!");
        } catch (error) {
            toast.error("Failed to update star status.")
        }
    }

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!setToDelete) return;
        setDeleting(true);

        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            // toast.success("Flashcard set deleted successfully")
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            navigate("/flashcards");
            // fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to delete flashcard set.")
        } finally {
            setDeleting(false)
        }
    };

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        // setSelectedSet(set._id);
        setCurrentCardIndex(0);
    }

    const renderFlashcardViewer = () => {
        const currentCard = selectedSet.cards[currentCardIndex];

        return (
            <div className='space-y-8'>
                {/* Back button */}
                <button
                    onClick={() => setSelectedSet(null)}
                    className='group inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-600 transition-colors duration-200'>
                    <ArrowLeft
                        className='w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200'
                        strokeWidth={2}
                    />
                    Back to Sets
                </button>

                {/* Flashcard Display */}
                <div className='flex flex-col items-center space-y-8'>
                    <div className='w-full max-w-lg'>
                        <Flashcard
                            flashcard={currentCard}
                            onToggleStar={handleToggleStar}
                        />
                    </div>

                    {/* Navigation control */}
                    <div className='flex items-center gap-6'>
                        <button
                            onClick={handlePrevCard}
                            disabled={selectedSet.cards.length <= 1}
                            className='group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100'>
                            <ChevronLeft
                                className='w-4 h-4 group-hover:-translate-x-0.5 transition-transform furation-200'
                                strokeWidth={2.5} />
                            Previous
                        </button>

                        <div className='px-4 py-2 bg-slate-50 rounded-lg border border-slate-200'>
                            <span className='text-sm font-semibold text-slate-700'>
                                {currentCardIndex + 1}{" "}
                                <span className='text-slate-400 font-normal'>/</span> {" "}
                                {selectedSet.cards.length}
                            </span>
                        </div>

                        <button
                            onClick={handleNextCard}
                            disabled={selectedSet.cards.length <= 1}
                            className='group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100'>
                            Next
                            <ChevronRight
                                className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200'
                                strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const renderSetList = () => {
        if (loading) {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
    )
  }

        if (flashcardSets.length === 0) {
            return (
                <div className='flex flex-col items-center justify-center py-16 px-16'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-300 to-violet-100 mb-4'>
                        <Brain className='w-8 h-8 text-slate-600' strokeWidth={2} />
                    </div>
                    <h3 className='text-xl font-semibold text-slate-900 mb-2'>
                        No Flashcards Yet
                    </h3>
                    <p className='text-sm text-slate-500 mb-8 text-center max-w-sm'>
                        Generate flashcards from your document to start learning and reinforce your knowledge.
                    </p>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className='cursor-pointer group inline-flex items-center gap-2 px-6 py-2 bg-linear-to-r from-indigo-500 to-violet-400 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-100'>
                        {generating ? (
                            <>
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                Generating
                            </>
                        ) : (
                            <>
                                Generate Flashcards
                            </>
                        )
                        }
                    </button>
                </div>
            )
        }

        return (
            <div className='space-y-6'>
                {/* Header with generated button */}
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className='text-lg font-semibold text-slate-900'>
                            Your Flashcard Sets.
                        </h3>
                        <p className='text-sm text-slate-500 mt-1'>
                            {flashcardSets.length}{" "}
                            {flashcardSets.length === 1 ? "set" : "sets"} available
                        </p>
                    </div>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className='cursor-pointer group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-indigo-500 to-violet-400 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-100'>
                        {generating ? (
                            <>
                                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Plus className='w-4 h-4' strokeWidth={2.5} />
                                Generate New Set
                            </>
                        )}
                    </button>
                </div>

                {/* Flashcard Sets Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {flashcardSets.map((set) => {

                        const reviewedCount = set.cards.filter(card => card.lastReviewed).length;
                        const totalCards = set.cards.length;
                        const progressPercentage =
                            totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

                        return (
                            <div
                                key={set._id}
                                className='group relative bg-white/80 backdrop-blur-xl glass-card border-2 border-gray-200 hover:border-indigo-300 rounded-2xl p-6 transition-200 hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between'
                            >

                                {/* Delete Button */}
                                <button
                                    onClick={(e) => handleDeleteRequest(e, set)}
                                    className='absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer'>
                                    <Trash2 className='w-4 h-4' strokeWidth={2} />
                                </button>

                                {/* Set Content */}
                                <div className='space-y-4'>

                                    <div className='shrink-0 w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center'>
                                        <WalletCards className='w-5 h-5 text-white' strokeWidth={2} />
                                    </div>

                                    <div>
                                        <h4 className='text-base font-semibold text-gray-900 mb-1'>
                                            Flashcard Set
                                        </h4>

                                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
                                            Created {moment(set.createdAt).format("MMM D, YYYY")}
                                        </p>
                                    </div>

                                    {/* Card Count */}
                                    <div className='flex items-center gap-2 pt-2'>
                                        <div className='px-3 py-1.5 bg-slate-100 border-2 border-slate-200 rounded-lg'>
                                            <span className='text-sm font-semibold text-slate-700'>
                                                {totalCards} {totalCards === 1 ? "card" : "cards"}
                                            </span>
                                        </div>
                                        {reviewedCount > 0 && (
                                            <div className='flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border-2 border-emerald-400 rounded-lg w-fit'>
                                                <TrendingUp className='w-3.5 h-3.5 text-emerald-600' strokeWidth={2.5} />
                                                <span className='text-sm font-semibold text-emerald-700'>
                                                    {progressPercentage} %
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    {totalCards > 0 && (
                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xs font-medium text-slate-600'>
                                                    Progress
                                                </span>
                                                <span className='text-xs font-semibold text-slate-700'>
                                                    {reviewedCount}/{totalCards} reviewed
                                                </span>
                                            </div>

                                            <div className='relative h-2 bg-slate-100 rounded-full overflow-hidden'>
                                                <div
                                                    className='absolute inset-y-0 left-0 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500'
                                                    style={{ width: `${progressPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Study Now Button */}
                                <div className='mt-6 pt-4 border-t border-slate-100'>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelectSet(set);
                                        }}
                                        className=' cursor-pointer group/btn relative w-full h-11 bg-linear-to-r from-indigo-200 to-violet-100 hover:from-indigo-600 hover:to-violet-600 text-indigo-700 hover:text-white font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95 overflow-hidden tracking-wider'
                                    >
                                        Study Now

                                        <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700' />
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='border-2 border-gray-300 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 p-8'>
                {selectedSet ? renderFlashcardViewer() : renderSetList()}
            </div>

            {/* Delete confirmation modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Flashcard Set"
            >
                <div className='space-y-6'>
                    <p className='text-sm text-slate-600'>
                        Are you sure you want to delte flashcard set? This action can not be undone and all the cards will be permanently removed.
                    </p>
                    <div className='flex items-center justify-end gap-3 pt-2'>
                        <button
                            type='button'
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                            className='px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-0 disabled:cursor-not-allowed'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            className='px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 hover-rose-600 hover-to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 sahdow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-100'
                        >
                            {deleting ? (
                                <span className='flex items-center gap-2'>
                                    <div className='w-4 h-4 border-white/30 border-t-white rounded-full animate-spin' />
                                    Deleting
                                </span>
                            ) : (
                                "Delete Set"
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default FlashcardManager