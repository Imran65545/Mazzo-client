const PROD_API_URL = 'https://mazzo-server.onrender.com';

export const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    PROD_API_URL;
