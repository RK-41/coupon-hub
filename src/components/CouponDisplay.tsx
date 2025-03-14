import { useState, useEffect } from 'react';
import { Coupon, claimCoupon } from '../api/coupons';
import { getClientIp } from '../utils/userTracking';

const CouponDisplay = () => {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [clientIp, setClientIp] = useState<string>('');

  // One hour in milliseconds
  const ONE_HOUR = 60 * 60 * 1000;

  useEffect(() => {
    // Get client IP on component mount
    const fetchClientIp = async () => {
      const ip = await getClientIp();
      setClientIp(ip);
    };

    fetchClientIp();

    // Load coupon data from localStorage
    const storedCouponData = localStorage.getItem('couponData');
    if (storedCouponData) {
      try {
        const couponData = JSON.parse(storedCouponData);
        const now = Date.now();

        // Check if the stored data is still valid
        if (couponData.expiryTime > now) {
          setCoupon(couponData.coupon);
          setTimeRemaining(couponData.expiryTime - now);
        } else {
          // Clear expired data
          localStorage.removeItem('couponData');
        }
      } catch (error) {
        console.error('Error parsing stored coupon data:', error);
        localStorage.removeItem('couponData');
      }
    }
  }, []);

  // Format time remaining in hours, minutes and seconds
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Update countdown timer
  useEffect(() => {
    if (!timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev > 1000) {
          return prev - 1000;
        } else {
          clearInterval(timer);
          setMessage('You can claim a new coupon now!');
          setCoupon(null);
          localStorage.removeItem('couponData');
          return null;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleClaimCoupon = async () => {
    // Check if timer is active
    if (timeRemaining !== null) {
      return;
    }

    setLoading(true);

    try {
      // In a real app, this would be a server request
      const result = await Promise.resolve(claimCoupon(clientIp));

      if (result.success && result.coupon) {
        setCoupon(result.coupon);
        setMessage('Coupon claimed successfully!');

        // Calculate expiry time (1 hour from now)
        const expiryTime = Date.now() + ONE_HOUR;
        setTimeRemaining(ONE_HOUR);

        // Store coupon data in localStorage
        const couponData = {
          coupon: result.coupon,
          claimedAt: Date.now(),
          expiryTime: expiryTime
        };

        localStorage.setItem('couponData', JSON.stringify(couponData));
      } else {
        setMessage(result.message || 'Failed to claim coupon.');
        if (result.timeRemaining) {
          setTimeRemaining(result.timeRemaining);
        }
      }
    } catch (error) {
      setMessage('An error occurred while claiming the coupon.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="mb-6 text-2xl font-bold text-slate-800">Coupon Hub</h2>

      {coupon ? (
        <div className="w-full max-w-md p-6 my-6 bg-blue-50 border-2 border-dashed border-blue-500 rounded-lg">
          <h3 className="text-xl font-semibold text-slate-700">Your Coupon</h3>
          <div className="relative flex items-center justify-center gap-2 p-2 my-4 text-2xl font-bold tracking-wider text-red-600 bg-white border border-gray-200 rounded">
            {coupon.code}
            <button
              className="p-1 text-blue-500 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(coupon.code);
                setMessage('Coupon code copied to clipboard!');
                setTimeout(() => {
                  setMessage('Coupon claimed successfully!');
                }, 2000);
              }}
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
          <p className="text-slate-600">{coupon.description}</p>
        </div>
      ) : (
        <div className="my-6">
          <p className="text-slate-600">Claim your exclusive coupon below!</p>
          <button
            onClick={handleClaimCoupon}
            disabled={loading || timeRemaining !== null}
            className="px-6 py-3 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Processing...' : 'Claim Coupon'}
          </button>
        </div>
      )}

      {message && (
        <div className="w-full max-w-md p-3 my-4 text-blue-700 bg-blue-50 rounded">
          {message}
        </div>
      )}

      {timeRemaining !== null && (
        <div className="mt-2 font-bold text-red-600">
          Claim your next coupon in: {formatTimeRemaining(timeRemaining)}
        </div>
      )}
    </div>
  );
};

export default CouponDisplay; 