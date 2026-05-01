import React, { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

import quizService from '../../Services/quizService';
import aiService from '../../Services/aiService';
import Spinner from '../common/spinner';
import Button from '../common/Button'
import EmptyState from '../common/EmptyState';
import Modal from '../common/Modal';
import QuizCard from './QuizCard';

const QuizManager = ({ documentId }) => {

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const fetchQuizzes = async () => {
        setLoading(true)
        try {
            const data = await quizService.getQuizzesForDocument(documentId);

            if (data && data.data) {
                setQuizzes(data.data);
            } else {
                console.warn('No quiz data returned:', data);
                setQuizzes([]);
            }
        } catch (error) {
            console.error('Fetch quizzes error:', error);
            toast.error('Failed to fetch quizzes.');
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchQuizzes();
        }
    }, [documentId]);

    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        setGenerating(true);

        try {
            const result = await aiService.generateQuiz(documentId, { numQuestions });
            console.log('Quiz generated:', result);
            toast.success('Quiz generated successfully!');
            setIsGenerateModalOpen(false);

            // Add a small delay to ensure the quiz is saved before fetching
            setTimeout(() => {
                fetchQuizzes();
            }, 500);
        } catch (error) {
            console.error('Generate quiz error:', error);
            toast.error(error.message || 'Failed to generate quiz')
        } finally {
            setGenerating(false);
        }
    }

    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedQuiz) return;

        try {
            await quizService.deleteQuiz(selectedQuiz._id);
            toast.success(`'${selectedQuiz.title || 'Quiz'}' deleted`);
            setIsDeleteModalOpen(false);
            setSelectedQuiz(null);
            setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
        } catch (error) {
            toast.error(error.message || 'Failed to delete quiz.')
        } finally {
            setDeleting(false);
        }
    }

    const renderQuizContent = () => {
        if (loading) {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
    )
  }
        if (quizzes.length === 0) {
            return (
                <EmptyState
                    title="No Quizzes Yet"
                    description="Generate a quiz from your document to test your knowedge" />
            )
        }
        return (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {quizzes.map((quiz) => (
                    <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
                ))}
            </div>
        )
    };

    return (
        <div className='bg-white border-2 border-gray-300 rounded-3xl p-6 '>
            <div className='flex justify-between gap-2 mb-4'>
                <div className='flex-col'>
                    <h3 className='text-lg font-semibold text-slate-900'>
                        Quizzes
                    </h3>
                    <p className='text-sm text-slate-500 mt-1'>
                        {quizzes.length} {quizzes.length === 1 ? "Quiz" : "Quizzes"} Generated
                    </p>
                </div>

                <Button className='cursor-pointer' onClick={() => setIsGenerateModalOpen(true)}>
                    <Plus size={16} />
                    Generate Quiz
                </Button>
            </div>

            {renderQuizContent()}

            {/* Generate Quiz */}
            <Modal
                isOpen={isGenerateModalOpen}
                onClose={() => setIsGenerateModalOpen(false)}
                title="Generate new quiz"
            >
                <form onSubmit={handleGenerateQuiz} className='space-y-4'>
                    <div>
                        <label className="block text-xs font-medium tect-neutral-700 mb-1.5">
                            Number of Questions
                        </label>
                        <input
                            type="number"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            required
                            className='w-full h-9 px-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent'
                        />
                    </div>
                    <div className='flex justify-end gap-2 pt-2'>
                        <Button
                            type='button'
                            variant='secondary'
                            onClick={() => setIsGenerateModalOpen(false)}
                            disabled={generating}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' disabled={generating}>
                            {generating ? 'Generating...' : 'Generate'}
                        </Button>
                    </div>
                </form>

            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Delete Quiz">

                <div className='space-y-4'>
                    <p>
                        Are you sure you want to delete the quiz:
                        <span className='font-semibold text-neutral-900'>
                            {selectedQuiz?.title || 'this quiz'}
                        </span>
                        ? This action can not be undone.
                    </p>
                    <div className='flex justify-end gap-2 pt-2'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={deleting}
                            className='bg-red-500 px-5 py-2 rounded-xl text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500'>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default QuizManager