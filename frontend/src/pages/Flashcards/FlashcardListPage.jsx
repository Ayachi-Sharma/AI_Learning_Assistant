import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import flashcardService from '../../Services/fashcardService'
import Spinner from '../../components/common/spinner'
import EmptyState from '../../components/common/EmptyState'
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard'

function FlashcardListPage() {

  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();

        // console.log("fetchFlashcardSets___", response.data);`
        // GPT line
        const validSets = response.data.filter(
          set =>
            set?._id &&
            set?.documentId &&
            set?.documentId?.title
        );

        setFlashcardSets(validSets);

        // setFlashcardSets(response.data);

      } catch (error) {
        toast.error('Failed to fetch flashcard Sets.')
        console.error(error);
      } finally {
        setLoading(false)
      }
    }

    fetchFlashcardSets();
  }, [])

  const handleDeleteSet = (deletedId) => {
    setFlashcardSets(prev =>
      prev.filter(set => set._id !== deletedId)
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
    )
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No Flashcard Sets Found"
          description="You haven't generated any flashcard yet. Go to a document to create your first set "
        />
      )
    }

    return (
      <div className='cursor-pointer grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} onDelete={handleDeleteSet} />
        ))}
      </div>
    )
  }

  return (
    <div>
      {renderContent()}
    </div>
  )
}

export default FlashcardListPage