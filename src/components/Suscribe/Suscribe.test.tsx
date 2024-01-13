/**
 * @jest-environment jsdom
 */

import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, test, vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";

import Suscribe from "@/components/Suscribe";

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

describe("Suscribe Component", () => {
  const useRouter = vi.spyOn(require("next/router"), "useRouter");
  const queryClient = new QueryClient();

  function Providers({ children, locale = "en" }: { children: React.ReactNode; locale: string }) {
    const messages = require(`../../../messages/${locale}.json`);
    useRouter.mockImplementationOnce(() => ({
      query: { locale: locale },
    }));

    return (
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </QueryClientProvider>
    );
  }

  test("displays component in english", () => {
    render(
      <Providers locale="en">
        <Suscribe />
      </Providers>
    );

    // Assert
    const notifyMessage = screen.getByText(
      "Do you want to get notice when the app is available for desktop?"
    );
    expect(notifyMessage).toBeInTheDocument();
  });

  test("displays the input field", () => {
    render(
      <Providers locale="en">
        <Suscribe />
      </Providers>
    );

    // Assert
    const inputElement = screen.getByPlaceholderText("username@email.com");
    expect(inputElement).toBeInTheDocument();
  });

  test("displays the button", () => {
    render(
      <Providers locale="en">
        <Suscribe />
      </Providers>
    );

    // Assert
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toBeInTheDocument();
  });

  test("displays text in spanish", () => {
    render(
      <Providers locale="es">
        <Suscribe />
      </Providers>
    );

    // Assert
    const notifyMessage = screen.getByText(
      "¿Quieres que te avisemos cuando la versión de escritorio esté disponible?"
    );
    expect(notifyMessage).toBeInTheDocument();
  });

  // test("Suscribe to the waiting list", async () => {
  //   render(
  //     <Providers locale="en">
  //       <Suscribe />
  //     </Providers>
  //   );

  //   const emailInput = screen.getByPlaceholderText("username@email.com");
  //   fireEvent.input(emailInput, { target: { value: "test@example.com" } });

  //   const button = screen.getByText("Notify Me");
  //   fireEvent.click(button);

  //   expect(await screen.findByText("Thank you for subscribing!")).toBeInTheDocument();
  // });

  test("Suscribe to the waiting list with an invalid email", async () => {
    render(
      <Providers locale="en">
        <Suscribe />
      </Providers>
    );

    const emailInput = screen.getByPlaceholderText("username@email.com");

    fireEvent.input(emailInput, { target: { value: "test" } });

    const button = screen.getByText("Notify Me");
    fireEvent.click(button);

    expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
  });

  test("Suscribe to the waiting list with an empty email", async () => {
    render(
      <Providers locale="en">
        <Suscribe />
      </Providers>
    );

    // Simula la entrada de datos en el campo de correo electrónico
    const emailInput = screen.getByPlaceholderText("username@email.com");

    fireEvent.input(emailInput, { target: { value: "" } });

    // Simula hacer clic en el botón
    const button = screen.getByText("Notify Me");
    fireEvent.click(button);

    expect(await screen.findByText("Email is not valid")).toBeInTheDocument();
  });

  // test("Show loader when submitting", async () => {
  //   render(
  //     <Providers locale="en">
  //       <Suscribe />
  //     </Providers>
  //   );

  //   // Simula la entrada de datos en el campo de correo electrónico
  //   const emailInput = screen.getByPlaceholderText("username@email.com");
  //   fireEvent.input(emailInput, { target: { value: "username@email.com" } });

  //   // Simula hacer clic en el botón
  //   const button = screen.getByText("Notify Me");
  //   fireEvent.click(button);

  //   const loader = screen.getByRole("status");
  //   await waitFor(() => expect(loader).toBeInTheDocument());
  // });
});
