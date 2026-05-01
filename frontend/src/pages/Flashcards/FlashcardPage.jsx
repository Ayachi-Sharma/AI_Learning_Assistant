import React,{useState, useEffect} from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2
 } from 'lucide-react'
import toast from 'react-hot-toast'

import flashcardService from '../../Services/fashcardService'
import aiService from '../../Services/aiService'
import PageHeader from '../../components/common/PageHeader'
import Spinner from '../../components/common/spinner'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Flashcard from '../../components/flashcards/Flashcard'

function FlashcardPage() {
  
  const {documentId} = useParams();
  
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false)

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      // Here earlier "getAllFlashcardForDocument" was written but when checked in "flashcardService" it was "getFlashcardForDocument"
      const response = await flashcardService.getFlashcardForDocument(
        documentId
      );
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      console.error(error.response);
      toast.error("Failed to fetch flashcards.")
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFlashcards()
  }, [documentId])

  const handleGenerateFlashcards = async () => {
    setGenerating(true)
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcards();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards")
    } finally{
      setGenerating(false)
    }
  }

  const handleNextCard = () => {
    handleReview(currentCardIndex)
    setCurrentCardIndex((prevIndex) => (prevIndex + 1 ) % flashcards.length)
  }

  const handlePrevCard = () => {
    handleReview(currentCardIndex)
    setCurrentCardIndex(
      (prevIndex)=> (prevIndex - 1 + flashcards.length)% flashcards.length 
    )
  }

  const handleReview = async (index) => {
    const currentCard= flashcards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      // toast.success("Flashcard reviewed!");
    } catch (error) {
      // toast.error("Failed to review flashcard.")
    }
  }

  const handleTogglerStar = async (cardId) => {
    try {
      await flashcardService.toggleStar(cardId);
      setFlashcards((prevFlashcards) => 
      prevFlashcards.map((card) => 
      card._id === cardId ? {...card, isStarred: !card.isStarred} : card
    )
  )
  toast.success("Flashcard starred status updated!")
    } catch (error) {
      toast.error("Failed to update star status.")
    }
  }

  const handleDeleteFlashcardSet = async () => {
    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(flashcardSets._id)
      toast.success("Flashcard set deleted successfully!")
      setIsDeleteModalOpen(false);
      fetchFlashcards(); //Refresh to show empty state
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set.")
    } finally {
      setDeleting(false)
    }
  }

  const renderFlashcardContent = () => {
    if (loading) {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
    )
  }

    if (flashcards.length === 0 ) {
      return (
        <EmptyState
        title="No flashcards yet"
        description="Generate flashcards from your document to start learning."
        />
      )
    }
  
    const currentCard = flashcards[currentCardIndex];

    return(
      <div className='flex flex-col items-center space-y-6'>
        <div className='w-full max-w-lg'>
          <Flashcard flashcard={currentCard} onToggleStar={handleTogglerStar} />
        </div>
        <div className='flex items-center gap-4'>
          <Button
          onClick={handlePrevCard}
          variant='secondary'
          disabled={flashcards.length <= 1}>
            <ChevronLeft size={16}/> Previous
          </Button>
          <span className='text-sm text-neutral-600'>
            {currentCardIndex + 1} / {flashcards.length}
          </span>
          <Button
          onClick={handleNextCard}
          variant='secondary'
          disabled={flashcards.length <= 1}>
            Next <ChevronRight size={16}/>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className='mb-4'>
        <Link
        to={`/document/${documentId}`}
        className='inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transoition-colors'>
        <ArrowLeft size={16}/>
        Back to Document
        </Link>
      </div>
        
      <div className='flex items-end justify-end mb-8'>
        {!loading && 
        (flashcards.length > 0 ? (
          <>
          <button
          onClick={() => setIsDeleteModalOpen(true)}
          disabled={deleting}
          className='inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 cursor-pointer'>
            <Trash2 size={16}/> Delete Set
          </button>
          </>
        ) : (
          <Button
          onClick={handleGenerateFlashcards}
          disabled={generating}>
            {generating ? (
              <Spinner/>
            ): (
              <>
              <Plus size={16}/> Gnerate Flashcards
              </>
            )}
          </Button>
        )
      )}
      </div>

      {renderFlashcardContent()}

      <Modal
      isOpen={isDeleteModalOpen}
      onClose={()=>setIsDeleteModalOpen(false)}
      title="Confirm Delete Flashcard Set">
        <div className='space-y-4'>
          <p className='text-sm text-neutral-600'>
            Are you sure you want to delete all flashcards for this document?
            This action cannot be undone.
          </p>
          <div className='flex justify-end gap-2 pt-2'>
            <Button
            type='button'
            variant='secondary'
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={deleting}>
              Cancel
            </Button>
            <button
            onClick={handleDeleteFlashcardSet}
            disabled={deleting}
            className='bg-red-500 cursor-pointer px-6 text-white rounded-xl hover:bg-red-600 active:bg-red-700 focus:ring-red-500'>
             {deleting ? "Deleting... " : "Delete"} 
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default FlashcardPage