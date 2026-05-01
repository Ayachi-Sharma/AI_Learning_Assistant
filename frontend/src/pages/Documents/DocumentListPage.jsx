import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Trash2, FileText, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

import documentServices from '../../Services/documentService';
import Spinner from '../../components/common/spinner';
import DocumentCard from '../../components/documents/DocumentCard';
import Button from '../../components/common/Button'

function DocumentListPage() {

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUpLoading] = useState(false);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      //GPT line 
      const res = await documentServices.getDocuments();
      // const data = await documentServices.getDocuments();

      // GPT line
      setDocuments(res.data);
      // setDocuments(data);
      // console.log("documents:", documents);
    } catch (error) {
      toast.error("Failed to fetch docuemnts")
      console.error(error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }
    setUpLoading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentServices.uploadDocument(formData);
      // toast.success("Document uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setUpLoading(false)
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentServices.deleteDocument(selectedDoc._id);
      // toast.success(`'${selectedDoc.title}' deleted`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null)
      setDocuments(documents.filter((d) => d._id !== selectedDoc._id))
    } catch (error) {
      toast.error(error.message || "Failed to delete document.")
    } finally {
      setDeleting(false);
    }
  };

const filteredDocuments = documents.filter((doc) =>
  (doc.title || "").toLowerCase().includes(searchTerm.toLowerCase())
);

const renderContent = () => {
  if (loading) {
      return (
        <div className='flex items-center justify-center min-h-[400px]'>
          <Spinner />
        </div>
      );
    }


    if (documents.length === 0) {
      return (
        <div className='flex items-center justify-center min-h-[400px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:border-slate-500/70 transition-all duration-200'>
          <div className='text-center max-w-md'>
            <div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6'>
              <FileText
                className='w-10 h-10 text-slate-600'
                strokeWidth={1.5} />
            </div>
            <h3 className='text-xl font-medium text-slate-900 tracking-tight mb-2'>
              No documents Yet
            </h3>
            <p className='text-sm text-slate-500 mb-6'>
              Get Started by uploading your first PDF document to begin learning.
            </p>
            <Button
              onClick={() => setIsUploadModalOpen(true)}
              // className='inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-500 to-violet-600 text-white font-bold hover:bg-[#2563EB] rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]'
            >
              <Plus className='w-4 h-4' strokeWidth={2.5} />
              Upload Document
            </Button>
          </div>
        </div>
      )
    }

    
  if (filteredDocuments.length === 0) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <p className="text-slate-500 text-sm">
        No documents match your search.
      </p>
    </div>
  );
}

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {filteredDocuments?.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    )
  };

  return (
    <div className='min-h-screen bg-white p-8 rounded-xl'>
      {/* Subtle background pattern */}
      <div className='relative max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 '>

        {/* Search Bar */}
        <motion.div 
          className=''
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10' />
            <motion.input
              type='text'
              placeholder='Search documents...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-slate-600 focus:ring-4 focus:ring-slate-600/20'
              />
          </div>
        </motion.div>
          
          {documents.length > 0 && (
            <Button
            onClick={() => setIsUploadModalOpen(true)}
            >
              <Plus className='w-4 h-4' strokeWidth={2.5} />
              Upload Documents
            </Button>
          )}
        </div>
      </div>
      {renderContent()}

      {isUploadModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
        <div className='relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2x shadow-slate-900/20 p-8'>
          {/* Close button */}
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className='absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 transition-all duration-200'>
            <X className='w-5 h-5' strokeWidth={2} />
          </button>

          <div className='mb-6'>
            <h2 className='text-xl font-medium text-slate-900 tracking-tight'>
              Upload new document
            </h2>
            <p className='text-sm text-slate-500 mt-1'>
              Add a PDF document to your library
            </p>
          </div>

          {/* Form */}
          <form action="" onSubmit={handleUpload} className='space-y-5'>
            {/* Title Input */}
            <div className='space-y-2'>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Document Title
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                required
                className='w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/25'
                placeholder='e.g. , React Interview prep'
              />
            </div>

            {/* File upload */}
            <div className='space-y-2'>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                PDF File
              </label>
              <div className='relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:border-indigo-300 hover:bg-blue-50/30 transition-all duration-200'>
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept='.pdf'
                />
                <div className='flex flex-col items-center justify-center py-10 px-6'>
                  <div className='w-14 h-14 rounded-xl bg-gradient-to-r from-gray-300 to-violet-100 flex items-center justify-center mb-4'>
                    <Upload
                      className='w-7 h-7 text-slate-800'
                      strokeWidth={2}
                    />
                  </div>
                  <p className='text-sm font-medium text-slate-700 mb-1'>
                    {uploadFile ? (
                      <span className='text-slate-800'>
                        {uploadFile.name}
                      </span>
                    ) : (
                      <>
                        <span className='text-blue-600'>
                          Click to upload
                        </span>
                        {" "}
                        or drag and drop
                      </>
                    )}
                  </p>
                  <p className='text-xs text-slate-500'>PDF upto 10MB</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-2'>
              <Button
                type='button'
                variant='outline'
                className='flex-1'
                onClick={() => setIsUploadModalOpen(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <button
                type='submit'
                disabled={uploading}
                className='flex-1 h-11 px-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'>
                {uploading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                    Uploading...
                  </span>
                ) : (
                  "Upload"
                )}
              </button>
            </div>

          </form>
        </div>
      </div>)}

      {isDeleteModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm'>
        <div className='relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-8'>

          {/* Close button */}
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className='absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200'>
            <X className='w-5 h-5' strokeWidth={2} />
          </button>

          {/* Delete Modal Header */}
          <div className='mb-6'>
            <div className='w-12 h-12 rounded-xl bg-linear-to-r from-red-100 to-red-200 flex items-center justify-center mb-4'>
              <Trash2 className='w-6 h-6 text-red-600' strokeWidth={2} />
            </div>
            <h2 className='text-xl font-semibold text-slate-900 tracking-tight'>
              Confirm Deletion
            </h2>
          </div>

          {/* content */}
          <p className='text-sm text-slate-600 mb-6'>
            Are you sure you want to delete the document : {" "}
            <span className='font-semibold text-slate-900'>
              {selectedDoc?.title}
            </span>
            ? This action cannot be undone.
          </p>

          {/* Action buttons */}
          <div className='flex gap-3'>
            <button
              type='button'
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className='flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className='flex-1 h-11 px-4 bg-linear-to-r from-red-600 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'
            >
              {deleting ? (
                <span className='flex items-center justify-center'>
                  <div className='w-4 h-4 border-white/30 border-t-white rounded-full animate-spin' />
                  Deleting...
                  {/* </div> */}
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>

        </div>
      </div>)}
    </div>
    // </div> 
  )
}

export default DocumentListPage