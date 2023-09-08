import _ from "lodash";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { NextRequestWithAuth } from "next-auth/middleware";

/**
 * @class Utilities
 * @description Utilities for the application. Using static methods.
 */
class Utilities {
  /**
   * @description Check if the user is using a mobile device SSR support.
   * @param nextHeaders
   * @returns {boolean} - Returns true if the user is using a mobile device.
   */

  public static isMobile({
    request,
    headers,
  }: {
    request?: NextRequest;
    headers?: string;
  }): boolean {
    const nextHeaders = (request ? new Headers(request?.headers).get("user-agent") : headers) ?? "";
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Mobile Safari/i.test(
        nextHeaders
      );

    return isMobile;
  }

  /**
   * @description Check if the user is using a browser SSR support.
   * @returns {boolean} - Returns true if the user is using a browser.
   */

  public static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  /**
   * @description Check if the user is using a server SSR support.
   * @returns {boolean} - Returns true if the user is using a server.
   */
  public static isServer(): boolean {
    return typeof window === "undefined";
  }

  /**
   * @description Check if the user is using a tablet SSR support.
   * @returns {boolean} - Returns true if the user is using a tablet.
   */
  public static isTablet(): boolean {
    const userAgent = headers().get("user-agent") ?? "";
    const isTablet = /iPad|Android (?!.*Mobile)|Tablet|Touch|(Nexus 7)|Surface/i.test(userAgent);

    return isTablet;
  }

  /**
   * @description Redirect the user to a specific page, requires request object.
   * @param req { NextRequestWithAuth | NextRequest} - The request object.
   * @param destination - The destination to redirect the user to.
   * @returns {NextResponse} - Returns a NextResponse object.
   */
  public static redirect(req: NextRequestWithAuth | NextRequest, destination: string) {
    const url = req.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url);
  }

  /**
   * @description Redirect the user to a specific page, doesn't require request object
   * @param destination - The destination to redirect the user to.
   */

  public static redirectTo(destination: string) {
    return redirect(destination);
  }

  /**
   * @description Check if the value is a truty value.
   * @param value {string} - The value to check if it's a truty value.
   * @returns {boolean} - Returns true if the value is a truty value.
   */

  public static isTrutyValue(value: string) {
    const isTrue = /^true/i.test(value);

    return isTrue;
  }
}

export default Utilities;
