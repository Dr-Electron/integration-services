import axios from 'axios';
import { CONFIG } from '../config/config';
import { fetchAuth } from '../services/authentication.service';

const getBearerToken = async () => {
	const response = await fetchAuth(CONFIG.index);
	if (response.status === 200) {
		const bearerToken = 'Bearer ' + response.data?.jwt;
		return bearerToken;
	}
};

const errFunc = async (error: any) => {
	const originalRequest = error.config;
	if (error?.response?.status === 401 && !originalRequest._retry) {
		originalRequest._retry = true;
		const token = await getBearerToken();
		axiosClient.defaults.headers.common['Authorization'] = token;
		originalRequest.headers['Authorization'] = token;
		return axios(originalRequest);
	} else {
		if (error?.response?.data?.error) {
			console.log(`ERROR: ${error.response.data.error}`);
		} else if (error?.response?.status) {
			console.log(`ERROR: ${error?.response?.status}`, error);
		} else {
			console.log(`ERROR:`, error);
		}
	}
};

export const axiosClient = axios.create({
	headers: {
		'Content-Type': 'application/json'
	}
});

axiosClient.interceptors.response.use(
	(response) => response,
	(error) => errFunc(error)
);
