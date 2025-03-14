// Coupon type definition
export interface Coupon {
	id: string;
	code: string;
	description: string;
	isUsed: boolean;
}

// Mock database of coupons
const coupons: Coupon[] = [
	{
		id: '1',
		code: 'SAVE10',
		description: '10% off your purchase',
		isUsed: false,
	},
	{
		id: '2',
		code: 'SAVE20',
		description: '20% off your purchase',
		isUsed: false,
	},
	{
		id: '3',
		code: 'FREESHIP',
		description: 'Free shipping on your order',
		isUsed: false,
	},
	{
		id: '4',
		code: 'BOGO50',
		description: 'Buy one get one 50% off',
		isUsed: false,
	},
	{
		id: '5',
		code: 'WELCOME15',
		description: '15% off for new customers',
		isUsed: false,
	},
];

// Store for tracking IP addresses and timestamps
interface IpTracker {
	[ip: string]: {
		lastClaimed: number;
		couponId: string;
	};
}

const ipTracker: IpTracker = {};

// Time restriction in milliseconds (e.g., 1 hour)
const TIME_RESTRICTION = 60 * 60 * 1000;

// Function to get the next available coupon in round-robin fashion
export const getNextAvailableCoupon = (): Coupon | null => {
	const availableCoupon = coupons.find((coupon) => !coupon.isUsed);

	if (availableCoupon) {
		// Mark as used temporarily (will be reset when all coupons are used)
		availableCoupon.isUsed = true;

		// If all coupons are used, reset them for the next round
		if (coupons.every((coupon) => coupon.isUsed)) {
			coupons.forEach((coupon) => (coupon.isUsed = false));
		}

		return availableCoupon;
	}

	return null;
};

// Function to check if an IP is allowed to claim a coupon
export const canIpClaimCoupon = (
	ip: string
): { allowed: boolean; timeRemaining?: number } => {
	const now = Date.now();

	if (ipTracker[ip]) {
		const timeSinceLastClaim = now - ipTracker[ip].lastClaimed;

		if (timeSinceLastClaim < TIME_RESTRICTION) {
			const timeRemaining = TIME_RESTRICTION - timeSinceLastClaim;
			return { allowed: false, timeRemaining };
		}
	}

	return { allowed: true };
};

// Function to claim a coupon
export const claimCoupon = (
	ip: string
): {
	success: boolean;
	coupon?: Coupon;
	message?: string;
	timeRemaining?: number;
} => {
	// Check if IP is allowed to claim
	const ipStatus = canIpClaimCoupon(ip);

	if (!ipStatus.allowed) {
		const minutes = Math.ceil(ipStatus.timeRemaining! / (60 * 1000));
		return {
			success: false,
			message: `You can claim another coupon in ${minutes} minutes.`,
			timeRemaining: ipStatus.timeRemaining,
		};
	}

	// Get next available coupon
	const coupon = getNextAvailableCoupon();

	if (!coupon) {
		return { success: false, message: 'No coupons available at the moment.' };
	}

	// Record the claim
	ipTracker[ip] = {
		lastClaimed: Date.now(),
		couponId: coupon.id,
	};

	return { success: true, coupon };
};
