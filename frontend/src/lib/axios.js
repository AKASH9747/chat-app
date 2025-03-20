import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

// withCredentials: This setting, when set to true, allows the Axios instance to include
// credentials (like cookies or HTTP authentication) with requests. This is important
// when you want to send cookies between the client and the server,
// particularly in situations where your API is hosted on a different domain or port,
// or when handling user authentication sessions.
