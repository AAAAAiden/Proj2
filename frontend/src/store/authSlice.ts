import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  username: string;
  email: string;
  role: 'employee' | 'hr' | '';
  token: string;
  password: string;
  message: string;
  id: string| null;
}

const initialState: AuthState = {
  username: '',
  email: '',
  role: '',
  token: '',
  password: '',
  message: '',
  id: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<AuthState>) {
      return { ...action.payload };
    },
    clearAuth() {
      return initialState;
    },
    setAuthMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
  },
});

export const { setAuth, clearAuth, setAuthMessage } = authSlice.actions;
export default authSlice.reducer;
