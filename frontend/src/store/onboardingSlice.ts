import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PersonalInfo } from '../types';

interface OnboardingState {
  form: PersonalInfo | null;
}

const initialState: OnboardingState = {
  form: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setForm(state, action: PayloadAction<PersonalInfo>) {
      state.form = action.payload;
    },
    clearForm(state) {
      state.form = null;
    },
  },
});

export const { setForm, clearForm } = onboardingSlice.actions;
export default onboardingSlice.reducer;
