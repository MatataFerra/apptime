import _ from "lodash";
import { NextRequestWithAuth } from "next-auth/middleware";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * @class Utilities
 * @description Utilities for the application. Using static methods.
 * @method isMobile() - Check if the user is using a mobile device SSR support.
 * @param {string} nextHeaders - Optional, if it's not given it will use the headers next function
 * @method isBrowser() - Check if the user is using a browser.
 * @method isServer() - Check if the user is using a server.
 * @method isTablet() - Check if the user is using a tablet device SSR support.
 * @method redirect() - Redirect the user to a specific page.
 *
 */
class Utilities {
  public static isMobile(nextHeaders?: string): boolean {
    let userAgent: string;
    if (nextHeaders) {
      userAgent = nextHeaders;
    } else {
      userAgent = headers().get("user-agent") ?? "";
    }

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Mobile Safari/i.test(
        userAgent
      );

    return isMobile;
  }

  public static isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  public static isServer(): boolean {
    return typeof window === "undefined";
  }

  public static isTablet(): boolean {
    const userAgent = headers().get("user-agent") ?? "";
    const isTablet =
      /iPad|Android (?!.*Mobile)|Tablet|Touch|(Nexus 7)|Surface/i.test(
        userAgent
      );

    return isTablet;
  }

  public static redirect(
    req: NextRequestWithAuth | NextRequest,
    destination: string
  ) {
    const url = req.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url);
  }
}

export default Utilities;
