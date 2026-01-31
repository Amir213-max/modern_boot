import React, { useState } from 'react';
import { db } from '../services/db';

interface RatingModalProps {
  chatId: string;
  onClose: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ chatId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    await db.addFeedback({
      id: Date.now().toString(),
      timestamp: Date.now(),
      chatId,
      rating
    });
    
    // Simulate slight delay for effect
    setTimeout(onClose, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center transform transition-all scale-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">إيه رأيك في مساعد؟</h3>
        <p className="text-gray-500 mb-6">ياريت تقيم تجربتك عشان نقدر نتحسن</p>
        
        <div className="flex justify-center space-x-2 space-x-reverse mb-8" dir="rtl">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`text-4xl transition-colors duration-200 ${
                star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
            >
              ★
            </button>
          ))}
        </div>

        <div className="flex space-x-3 space-x-reverse">
          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className={`flex-1 py-3 rounded-lg font-bold text-white transition ${
              rating === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
            }`}
          >
            إرسال التقييم
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition"
          >
            تخطي
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;