// ActionDialog.jsx

import { XIcon } from '@heroicons/react/outline';
import { useEffect } from 'react';

const ActionDialog = ({
  isOpen,
  type = 'message', // 'message' or 'confirm'
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'موافق',
  cancelText = 'إلغاء',
  autoClose = true,
  autoCloseDuration = 3000, // in milliseconds
}) => {
  useEffect(() => {
    let timer;
    if (autoClose && type === 'message' && isOpen) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
    }
    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDuration, isOpen, onClose, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {type === 'confirm' ? 'تأكيد' : 'إشعار'}
          </h2>
          <button onClick={onClose}>
            <XIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        {type === 'confirm' ? (
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              {confirmText}
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            موافق
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionDialog;
