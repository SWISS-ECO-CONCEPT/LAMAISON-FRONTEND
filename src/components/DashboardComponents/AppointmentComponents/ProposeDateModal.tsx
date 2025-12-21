import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';

interface ProposeDateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    isLoading: boolean;
}

const ProposeDateModal: React.FC<ProposeDateModalProps> = ({ isOpen, onClose, onConfirm, isLoading }) => {
    const { t } = useTranslation();
    const [date, setDate] = useState<Date | null>(new Date());
    const [time, setTime] = useState<Date | null>(new Date());

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) return;

        const combinedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes()
        );

        onConfirm(combinedDate);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Fermer"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-xl font-bold mb-6 text-gray-800">
                    {t('proposeModal.title', 'Proposer un nouveau créneau')}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('proposeModal.chooseDate', 'Choisir une date')}
                        </label>
                        <DatePicker
                            selected={date}
                            onChange={(d) => setDate(d)}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {t('proposeModal.chooseTime', 'Choisir une heure')}
                        </label>
                        <DatePicker
                            selected={time}
                            onChange={(t) => setTime(t)}
                            showTimeSelect
                            showTimeSelectOnly
                            timeIntervals={15}
                            timeCaption={t('proposeModal.timeCaption', 'Heure')}
                            dateFormat="HH:mm"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                            {t('proposeModal.cancel', 'Annuler')}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t('proposeModal.sending', 'Envoi...') : t('proposeModal.confirm', 'Confirmer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProposeDateModal;
