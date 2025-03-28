import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Modal from './ui/Modal';
import AuthButtons from './AuthButtons';
import toast from 'react-hot-toast';
import { Match } from '@/types/match';
import { formatDate } from '@/utils/dateUtils';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
}

const reminderOptions = [
  { label: '5 dakika önce', value: 5 },
  { label: '15 dakika önce', value: 15 },
  { label: '30 dakika önce', value: 30 },
  { label: '1 saat önce', value: 60 },
];

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, match }) => {
  const { data: session } = useSession();
  const [selectedTime, setSelectedTime] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateReminder = async () => {
    if (!session?.user?.email) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          matchId: match.id,
          matchStartTime: match.begin_at,
          reminderMinutes: selectedTime,
          team1Name: match.opponents[0]?.opponent.name,
          team2Name: match.opponents[1]?.opponent.name
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hatırlatıcı oluşturulamadı');
      }
      
      toast.success('Hatırlatıcı başarıyla oluşturuldu!');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      toast.error(errorMessage);
      console.error('Reminder creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Maç Bilgileri</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {match.opponents[0]?.opponent.name || 'TBD'} vs {match.opponents[1]?.opponent.name || 'TBD'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Başlangıç: {formatDate(match.begin_at)}
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ne Kadar Önce Hatırlatılsın?
            </label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                       shadow-sm focus:border-primary-500 focus:ring-primary-500 
                       dark:bg-gray-700 dark:text-gray-300 sm:text-sm"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="inline-flex w-full justify-center rounded-md border border-transparent 
                       bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm 
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 
                       focus:ring-offset-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Oluşturuluyor...' : 'Hatırlatıcı Oluştur'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReminderModal; 