/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import Suscribe from "@/components/Suscribe"; // Ajusta la ruta según sea necesario
import { NextIntlProvider } from "next-intl";

describe("Suscribe Component", () => {
  const useRouter = jest.spyOn(require("next/router"), "useRouter");

  test("displays component in english", () => {
    const locale = "en";
    const messages = require(`../../messages/${locale}.json`);
    useRouter.mockImplementationOnce(() => ({
      query: { locale: locale },
    }));
    render(
      <NextIntlProvider messages={messages} locale={locale}>
        <Suscribe />
      </NextIntlProvider>
    );

    // Assert
    const notifyMessage = screen.getByText(
      "Do you want to get notice when the app is available for desktop?"
    );
    expect(notifyMessage).toBeInTheDocument();
  });

  test("displays the input field", () => {
    const locale = "en";
    const messages = require(`../../messages/${locale}.json`);
    useRouter.mockImplementationOnce(() => ({
      query: { locale: locale },
    }));
    render(
      <NextIntlProvider messages={messages} locale={locale}>
        <Suscribe />
      </NextIntlProvider>
    );

    // Assert
    const inputElement = screen.getByPlaceholderText("username@email.com");
    expect(inputElement).toBeInTheDocument();
  });

  test("displays the button", () => {
    const locale = "en";
    const messages = require(`../../messages/${locale}.json`);
    useRouter.mockImplementationOnce(() => ({
      query: { locale: locale },
    }));
    render(
      <NextIntlProvider messages={messages} locale={locale}>
        <Suscribe />
      </NextIntlProvider>
    );

    // Assert
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toBeInTheDocument();
  });

  test("displays text in spanish", () => {
    const locale = "es";
    const messages = require(`../../messages/${locale}.json`);
    useRouter.mockImplementationOnce(() => ({
      query: { locale: locale },
    }));
    render(
      <NextIntlProvider messages={messages} locale={locale}>
        <Suscribe />
      </NextIntlProvider>
    );

    // Assert
    const notifyMessage = screen.getByText(
      "¿Quieres que te avisemos cuando la versión de escritorio esté disponible?"
    );
    expect(notifyMessage).toBeInTheDocument();
  });
});
