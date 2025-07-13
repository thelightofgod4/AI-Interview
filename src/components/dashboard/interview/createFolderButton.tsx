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

function CreateFolderButton({ folders, fetchFolders, big = false, modalOnly = false, setOpen }: { folders: any[], fetchFolders: () => void, big?: boolean, modalOnly?: boolean, setOpen?: (open: boolean) => void }) {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState(false);
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
    setOpenModal(false);
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

  if (modalOnly) {
    return (
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
          {setOpen && (
            <Button className="w-full mt-2" variant="outline" onClick={() => setOpen(false)}>{t('cancelButton')}</Button>
          )}
        </Card>
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-row gap-2">
        <Card className={`flex items-center border-dashed border-gray-700 border-2 cursor-pointer hover:scale-105 hover:border-indigo-500 hover:shadow-xl transition-all duration-200 ${big ? 'h-28 w-64 rounded-2xl' : 'h-16 w-44 rounded-xl'} ml-1 mr-3 mt-0 shrink-0 overflow-hidden shadow-md bg-white`}
          onClick={() => setOpen && setOpen(true)}>
          <CardContent className="flex items-center flex-col mx-auto p-0 w-full h-full justify-center">
            <div className="flex flex-col justify-center items-center w-full overflow-hidden">
              <FolderPlus size={big ? 48 : 32} strokeWidth={1.5} className="text-gray-700" />
            </div>
            <CardTitle className={`p-0 text-center ${big ? 'text-lg font-semibold' : 'text-sm'}`}> 
              {t('createFolderButton')}
            </CardTitle>
          </CardContent>
        </Card>
      </div>
      {/* Modal eski kullanım için bırakıldı */}
    </>
  );
}

export default CreateFolderButton; 
 