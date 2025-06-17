import { useState } from 'react';
import { FolderPlus, FolderMinus } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/dashboard/Modal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useClerk } from '@clerk/nextjs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function CreateFolderButton({ folders, fetchFolders }: { folders: any[], fetchFolders: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useClerk();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDeleteFolderId, setSelectedDeleteFolderId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleCreate = async () => {
    if (!folderName.trim() || !user?.id) return;
    setLoading(true);
    await supabase.from('folders').insert({
      name: folderName.trim(),
      user_id: user.id,
      is_default: false
    });
    setLoading(false);
    setFolderName('');
    setOpen(false);
    fetchFolders();
  };

  const handleDelete = async () => {
    if (!selectedDeleteFolderId) return;
    setDeleteLoading(true);
    await supabase.from('folders').delete().eq('id', selectedDeleteFolderId);
    setDeleteLoading(false);
    setSelectedDeleteFolderId('');
    setDeleteOpen(false);
    alert(t('folderDeleted'));
    fetchFolders();
  };

  return (
    <>
      <div className="flex flex-row gap-2">
        <Card className="flex items-center border-dashed border-gray-700 border-2 cursor-pointer hover:scale-105 ease-in-out duration-300 h-16 w-44 ml-1 mr-3 mt-0 rounded-xl shrink-0 overflow-hidden shadow-md"
          onClick={() => setOpen(true)}>
          <CardContent className="flex items-center flex-col mx-auto p-0">
            <div className="flex flex-col justify-center items-center w-full overflow-hidden">
              <FolderPlus size={32} strokeWidth={1.5} className="text-gray-700" />
            </div>
            <CardTitle className="p-0 text-center text-sm">
              {t('createFolderButton')}
            </CardTitle>
          </CardContent>
        </Card>
        <Card className="flex items-center border-dashed border-gray-700 border-2 cursor-pointer hover:scale-105 ease-in-out duration-300 h-16 w-44 ml-1 mr-3 mt-0 rounded-xl shrink-0 overflow-hidden shadow-md"
          onClick={() => setDeleteOpen(true)}>
          <CardContent className="flex items-center flex-col mx-auto p-0">
            <div className="flex flex-col justify-center items-center w-full overflow-hidden">
              <FolderMinus size={32} strokeWidth={1.5} className="text-gray-700" />
            </div>
            <CardTitle className="p-0 text-center text-sm">
              {t('deleteFolderButton')}
            </CardTitle>
          </CardContent>
        </Card>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="w-full max-w-xs mx-auto flex flex-col items-center justify-center p-4">
          <Card className="w-full flex flex-col items-center p-4">
            <FolderPlus size={40} className="text-indigo-600 mb-2" />
            <CardTitle className="text-base mb-2">{t('createFolderTitle')}</CardTitle>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('folderNamePlaceholder')}
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              maxLength={32}
            />
            <Button className="w-full" onClick={handleCreate} disabled={!folderName.trim() || loading}>
              {loading ? t('creating', 'Oluşturuluyor...') : t('createFolderButton')}
            </Button>
          </Card>
        </div>
      </Modal>
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="w-full max-w-xs mx-auto flex flex-col items-center justify-center p-4">
          <Card className="w-full flex flex-col items-center p-4">
            <FolderMinus size={40} className="text-red-600 mb-2" />
            <CardTitle className="text-base mb-2">{t('deleteFolderButton')}</CardTitle>
            <label className="mb-2 text-sm">{t('selectFolderToDelete')}</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={selectedDeleteFolderId}
              onChange={e => setSelectedDeleteFolderId(e.target.value)}
            >
              <option value="">--</option>
              {folders.map((folder: any) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
            <div className="text-xs text-red-600 mb-3 text-center">{t('deleteFolderConfirm')}</div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={!selectedDeleteFolderId || deleteLoading}>
                  {deleteLoading ? t('deleting', 'Siliniyor...') : t('deleteFolderButton')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('deleteFolderConfirm')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleteLoading}>
                    {deleteLoading ? t('deleting', 'Siliniyor...') : t('delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>
      </Modal>
    </>
  );
}

export default CreateFolderButton; 
