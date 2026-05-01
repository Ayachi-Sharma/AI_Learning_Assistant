import React, {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import Spinner from '../../components/common/spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import documentService from '../../Services/documentService';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/AI/AIActions'
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';

const DocumentDetailPage = () => {

  const {id} = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error('failed to fetch document details')
        console.error(error);
      } finally {
        setLoading(false);
      }
    
    };

    fetchDocumentDetails();
    }, [id])

    // Helper function to get the full PDF URL
    const getPdfUrl = () => {
      if (!document?.data?.filePath) return null;

      const filePath = document.data.filePath;

      if (filePath.startsWith('http://') || filePath.startsWith('http://')) {
        return filePath;
      }

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      return `${baseUrl}${filePath.startWith('/') ? '' : '/'}${filePath}`;
    };

    const renderContent = () => {
      if (loading) {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
    )
  }
  
      if (!document || !document.data || !document.data.filePath) {
        return <div className='text-center p-8'>PDF not available</div>
      }

      const pdfUrl = getPdfUrl();
 
      return(
        <div className='bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm'>
        <div className='flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300'>
          <span className='text-sm font-medium text-gray-700'>
            Document Viewer
          </span>
          <a href={pdfUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors'>
            <ExternalLink size={16}/>
            Open in new Tab
          </a>
        </div>
        <div className='bg-gray-100 p-1'>
          <iframe 
          src={pdfUrl}  
          className='w-full h-[70vh] bg-white rounded border border-gray-300'
          title='PDF Viewer'
          style={{
            colorScheme: 'light',
          }}/>
        </div>
      </div>
    )
  }
  
  const renderChat = () => {
    return <ChatInterface/>
  };
  
  const renderAIActions = () => {
    return <AIActions/>
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id}/>
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={id}/>
  };

  const tabs = [
    {name: 'Content', label: 'Content', content: renderContent()},
    {name: 'Chat', label: 'Chat', content: renderChat()},
    {name: 'AI Actions', label: 'AI Actions', content: renderAIActions()},
    {name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab()},
    {name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab()},
  ];

  if (loading) {
    return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
    )
  }

  if (!document) {
    return <div className='text-center p-8'>Document not Found.</div>
  }

  return (
    <div>
      <div className='mb-8'>
        <Link 
        to="/documents"
        className='inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors'>
          <ArrowLeft/>
          Back to Documents
        </Link>
      </div>
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}/>
    </div>
  )
}


export default DocumentDetailPage