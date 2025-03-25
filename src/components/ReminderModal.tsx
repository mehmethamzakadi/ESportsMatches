import React from 'react';
import { useSession } from 'next-auth/react';
import Modal from './ui/Modal';
import AuthButtons from './AuthButtons';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchTime: string;
}

const reminderOptions = [
  { label: '5 dakika önce', value: 5 },
  { label: '15 dakika önce', value: 15 },
  { label: '30 dakika önce', value: 30 },
  { label: '1 saat önce', value: 60 },
];

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, matchTime }) => {
  const { data: session } = useSession();
  const [selectedTime, setSelectedTime] = React.useState(15); // Varsayılan 15 dakika

  const handleCreateReminder = () => {
    // TODO: Hatırlatıcıyı veritabanına kaydet
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Maç Hatırlatıcısı">
      {!session ? (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Maç hatırlatıcısı oluşturabilmek için lütfen Google hesabınızla giriş yapın.
          </p>
          <div className="flex justify-center">
            <AuthButtons />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Maç başlangıç saati: {matchTime}
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Hatırlatma Zamanı
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-primary-500 focus:ring-primary-500 
                       dark:bg-gray-700 dark:text-gray-300 sm:text-sm"
            >
              {reminderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              onClick={handleCreateReminder}
              className="inline-flex w-full justify-center rounded-md border border-transparent 
                       bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm 
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 
                       focus:ring-offset-2 sm:text-sm"
            >
              Hatırlatıcı Oluştur
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReminderModal; 