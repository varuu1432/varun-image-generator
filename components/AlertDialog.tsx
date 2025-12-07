// components/AlertDialog.tsx
import React from 'react';
import Button from './Button';

interface AlertDialogProps {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  title,
  message,
  type,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
}) => {
  const typeColors = {
    success: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', icon: 'text-green-500' },
    error: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', icon: 'text-red-500' },
    info: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200', icon: 'text-blue-500' },
  };

  const colors = typeColors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      <div
        className={`relative ${colors.bg} rounded-lg px-4 pt-5 pb-4 shadow-xl transform transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 text-gray-900 dark:text-gray-100`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div>
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${colors.icon}`}>
            {type === 'success' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {type === 'error' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.102 3.327 1.779 3.327h13.713c1.677 0 2.645-1.826 1.78-3.327L13.78 4.3c-.87-1.5-3.032-1.5-3.9.001L3.697 16.001zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
            {type === 'info' && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            )}
          </div>
          <div className="mt-3 text-center sm:mt-5">
            <h3 className={`text-lg leading-6 font-medium ${colors.text}`} id="modal-title">
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          {onConfirm && (
            <Button
              type="button"
              variant={type === 'error' ? 'danger' : 'primary'}
              className="w-full justify-center sm:col-start-2"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          )}
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              className="mt-3 w-full justify-center sm:mt-0 sm:col-start-1"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;