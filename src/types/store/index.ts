import { Profile } from "@prisma/client";

import { UserType } from "@/types/services";

interface User {
  name: string;
  surname: string;
}

export type FormErrors = {
  endHour: boolean;
  hourlyRate: boolean;
  name: boolean;
  startHour: boolean;
};

export interface FormStore {
  user: User;
  profile: Omit<Profile, "id" | "userId">;
  formErrors: FormErrors;
  isFormErrorsInitialized: boolean;
  setUser: (user: Partial<User>) => void;
  setProfile: (profile: Partial<Omit<Profile, "id" | "userId">>) => void;
  detectInputType: (value: string) => number;
  setFormErrors: (formErrors: Partial<FormErrors> | { data: FormStoreData }) => void;
  hasErrors: () => boolean;
}

export type FormStoreData = {
  user: FormStore["user"];
  profile: FormStore["profile"];
};

export type UserStore = Partial<UserType> | null;
