// Function to get the client's IP address
// In a real application, this would be handled by the server
export const getClientIp = async (): Promise<string> => {
	try {
		// In a real application, we would get this from the server
		// For this demo, we'll use a public API to get the IP
		const response = await fetch('https://api.ipify.org?format=json');
		const data = await response.json();
		return data.ip;
	} catch (error) {
		console.error('Error getting IP:', error);
		// Fallback to a random ID if we can't get the real IP
		return `demo-${Math.random().toString(36).substring(2, 10)}`;
	}
};

// Function to set a cookie
export const setCookie = (
	name: string,
	value: string,
	expiryHours = 24
): void => {
	const date = new Date();
	date.setTime(date.getTime() + expiryHours * 60 * 60 * 1000);
	const expires = `expires=${date.toUTCString()}`;
	document.cookie = `${name}=${value};${expires};path=/`;
};

// Function to get a cookie value
export const getCookie = (name: string): string | null => {
	const cookieName = `${name}=`;
	const cookies = document.cookie.split(';');

	for (let i = 0; i < cookies.length; i++) {
		let cookie = cookies[i].trim();
		if (cookie.indexOf(cookieName) === 0) {
			return cookie.substring(cookieName.length, cookie.length);
		}
	}

	return null;
};

// Function to check if user has claimed a coupon based on cookies
export const hasClaimedCouponByCookie = (): boolean => {
	return getCookie('couponClaimed') === 'true';
};

// Function to mark that user has claimed a coupon
export const markCouponClaimedInCookie = (expiryHours = 1): void => {
	setCookie('couponClaimed', 'true', expiryHours);
};
