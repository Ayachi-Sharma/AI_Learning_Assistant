import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WalletCards, Sparkles, TrendingUp, Trash2, X } from 'lucide-react'
import moment from 'moment'
import { createPortal } from "react-dom"
import flashcardService from '../../Services/fashcardService'

const FlashcardSetCard = ({ flashcardSet, onDelete }) => {


    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);
    const [flashcardSets, setFlashcardSets] = useState([]);

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
            onDelete(setToDelete._id);   // ⭐ update parent UI

            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to delete flashcard set.")
        } finally {
            setDeleting(false)
        }
    };

    // console.log(flashcardSet);

    const handleStudyNow = () => {
        //  console.log('Navigating to:', flashcardSet?.documentId?._id);
        // navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);    
        //GPT line
        // if (!flashcardSet?.documentId?._id) {
        // toast.error("Document not linked to this flashcard set");
        // return;
        // }
        if (!flashcardSet?._id) {
            // toast.error("Invalid flashcard set");
            return;
        }
        // console.log(flashcardSet.documentId._id);

        // navigate(`/flashcards/${flashcardSet._id}`);
        navigate(`/flashcards/${flashcardSet.documentId._id}`);

    };

    const reviewedCount = flashcardSet.cards.filter(card => card.lastReviewed).length;
    const totalCards = flashcardSet.cards.length;
    const progressPercentage =
        totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

    // const progressPercentage = totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100);

    return (
        <div
            className='group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-indigo-300 rounded-2xl p-6 transition-all duration-200 hover:shadow-indigo-500/10 flex flex-col justify-between'
        >
            <div className='space-y-4'>
                {/* Icon and Title */}
                <div className='flex items-start justify-between gap-4'>
                    <div className='shrink-0 w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center'>
                        <WalletCards className='w-5 h-5 text-white' strokeWidth={2} />
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={(e) => handleDeleteRequest(e, flashcardSet)}
                        className='p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'>
                        <Trash2 className='w-4 h-4' strokeWidth={2} />
                    </button>
                </div>

                <div className='flex-1 min-w-0'>
                    <h3
                        className='text-base font-semibold text-slate-900 line-clamp-2 mb-1'
                        title={flashcardSet?.documentId?.title}
                    >
                        {flashcardSet?.documentId?.title}
                    </h3>
                    <p className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                        Created {moment(flashcardSet.createdAt).fromNow()}
                    </p>
                </div>
                {/* Stats */}
                <div className='flex items-center gap-3 pt-2'>
                    <div className='px-3 py-1.5 bg-slate-100 border-2 border-slate-300 rounded-lg'>
                        <span className='text-sm font-semibold text-slate-700'>
                            {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
                        </span>
                    </div>
                    {reviewedCount > 0 && (
                        <div className='flex items-center gap-1.5 p-3 py-1.5 bg-emerald-50 border-2 border-emerald-400 rounded-lg'>
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
                                {reviewedCount} /{totalCards} reviewed
                            </span>
                        </div>
                        <div className='relative h-2 bg-slate-100 rounded-full overflow-hidden'>
                            <div
                                className='absolute inset-y-0 left-0 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out'
                                style={{ width: `${progressPercentage}%` }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Status Button */}
            <div className='mt-6 pt-4 border-t border-slate-100'>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStudyNow();
                    }}
                    className='cursor-pointer group/btn relative w-full h-11 bg-linear-to-r from-indigo-200 to-violet-100 hover:from-indigo-600 hover:to-violet-600 text-indigo-700 hover:text-white font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95 overflow-hidden tracking-wider'>
                    Study Now
                    <div className='absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700' />
                </button>
            </div>


            {isDeleteModalOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center">

                        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative">

                            <h3 className="text-lg font-semibold mb-3">
                                Delete Flashcard Set
                            </h3>

                            <p className="text-sm text-slate-600 mb-6">
                                Are you sure you want to delete this flashcard set?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-4 h-10 bg-slate-100 rounded-lg"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2 min-w-[120px]"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete Set"
                                    )}
                                </button>
                            </div>

                        </div>

                    </div>,
                    document.body   // ⭐ THIS IS MAGIC
                )
            }
        </div>
    )
}
export default FlashcardSetCard