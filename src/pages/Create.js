import { useState, useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import CreateSnippet from '../components/snippets/CreateSnippet';

const Create = () => {
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(true);
  const forkId = searchParams.get('fork');
  const editId = searchParams.get('edit');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleClose = () => {
    setCreateModalOpen(false);
    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      window.location.href = '/';
    }, 200);
  };

  const handleSuccess = () => {
    setCreateModalOpen(false);
    // Navigate back to dashboard
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CreateSnippet
        isOpen={createModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        forkId={forkId}
        editId={editId}
      />
    </div>
  );
};

export default Create;