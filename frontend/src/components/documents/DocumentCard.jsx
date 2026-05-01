import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, WalletCards, Sparkles, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';

const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while(size >= 1024 && unitIndex < units.length - 1){
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete, index = 0 }) => {
    if (!document) return null;
    const navigate = useNavigate();
    
    const handleNavigate = () => {
        navigate(`/document/${document._id}`, { state: { title: document.title } });
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(document);
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            delay: index * 0.1,
            ease: "easeOut"
          }
        },
        hover: {
          y: -8,
          scale: 1.02,
          transition: {
            duration: 0.3,
            ease: "easeOut"
          }
        },
        tap: { scale: 0.98 }
    };

    const statVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { 
        opacity: 1, 
        scale: 1,
        transition: { delay: 0.2 }
      }
    };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      className='glass-card bg-slate-300/10 rounded-xl p-6 cursor-pointer relative overflow-hidden group border-2 border-slate-200 rounded-2xl'
      onClick={handleNavigate}
    >

      {/* Header Section */}
      <div className='flex items-start justify-between gap-3 mb-4 relative z-10'>
        
        {/* Logo - No Animation */}
        <div className='flex-shrink-0 w-11 h-11 bg-linear-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30'>
          <FileText className='w-5 h-5 text-white' strokeWidth={2.5}/>
        </div>
        
        <motion.button
          onClick={handleDelete}
          className='opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200'
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className='w-4 h-4' strokeWidth={2.5}/>
        </motion.button>
      </div>

      {/* Title */}
      <motion.h3 
        className='text-lg font-bold text-gray-900 truncate mb-3 relative z-10' 
        title={document.title}
      >
        {document.title}
      </motion.h3>

      {/* File Size */}
      {document.fileSize !== undefined && (
        <motion.div 
          className='text-xs text-gray-500 font-medium mb-4 relative z-10'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {formatFileSize(document.fileSize)}
        </motion.div>
      )}

      {/* Stats */}
      <div className='flex items-center gap-4 flex-wrap mb-4 relative z-10'>
        {document.flashcardCount !== undefined && (
          <motion.div 
            className='flex items-center gap-2 px-5 py-2 bg-indigo-50 rounded-lg border border-indigo-100'
            variants={statVariants}
          >
            <WalletCards className='w-4 h-4 text-indigo-500' strokeWidth={2.5}/>
            <span className='text-sm font-bold text-indigo-600'>{document.flashcardCount}</span>
          </motion.div>
        )}
        {document.quizCount !== undefined && (
          <motion.div 
            className='flex items-center gap-2 px-5 py-2 bg-indigo-50 rounded-lg border border-indigo-100'
            variants={statVariants}
          >
            <Sparkles className='w-4 h-4 text-indigo-500' strokeWidth={2.5}/>
            <span className='text-sm font-bold text-indigo-600'>{document.quizCount}</span>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.div 
        className='pt-4 border-t-2 border-gray-200 relative z-10'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className='flex items-center gap-2 text-xs text-gray-500'>
          <Clock className='w-4 h-4' strokeWidth={2}/>
          <span>Uploaded {document.createdAt ? moment(document.createdAt).fromNow() : "recently"}</span>
        </div>
      </motion.div>

    </motion.div>
  );
}

export default DocumentCard;