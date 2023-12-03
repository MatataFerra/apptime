import { User } from "@prisma/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import ProfileService from "@/services/Profile";

import { FormErrors, FormStore, FormStoreData } from "@/types/store";

export const useFormStore = create(
  devtools<FormStore>(
    (set, get) => ({
      user: {
        name: "",
        surname: "",
      },
      profile: {
        startHour: 0,
        endHour: 0,
        extraNightShiftPay: 0,
        holidayPay: false,
        holidayPayRate: 0,
        hourlyRate: 0,
        nightShift: false,
        unpaidBreaks: 0,
      },

      formErrors: {
        endHour: false,
        hourlyRate: false,
        name: false,
        startHour: false,
      },

      isFormErrorsInitialized: false,

      setUser: (user: Partial<User>) => {
        set(
          (state) => ({
            user: {
              ...state.user,
              ...user,
            },
          }),
          false,
          "SET_USER"
        );
      },
      setProfile: (profile: Partial<FormStore["profile"]>) =>
        set(
          (state) => ({
            profile: {
              ...state.profile,
              ...profile,
            },
          }),
          false,
          "SET_PROFILE"
        ),

      detectInputType: (value: string) => {
        if (value.includes(":")) {
          return ProfileService.convertHourInFloat(value);
        }

        return Number(value);
      },

      setFormErrors: (formErrors: Partial<FormErrors> | { data: FormStoreData }) => {
        set(
          (state) => {
            if ("data" in formErrors) {
              const { user, profile } = formErrors.data;

              return {
                isFormErrorsInitialized: true,
                formErrors: {
                  ...state.formErrors,
                  name: user.name.length === 0,
                  startHour: profile.startHour === 0,
                  endHour: profile.endHour === 0,
                  hourlyRate: profile.hourlyRate === 0,
                },
              };
            }

            return {
              isFormErrorsInitialized: true,
              formErrors: {
                ...state.formErrors,
                ...formErrors,
              },
            };
          },
          false,
          "SET_FORM_ERRORS"
        );
      },

      hasErrors: () => {
        const { formErrors } = get();

        return Object.values(formErrors).some((value) => value);
      },
    }),
    {
      name: "formStore",
    }
  )
);
