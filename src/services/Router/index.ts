import { SUPPORTED_LOCALES } from "@/utils/constants";

class Router {
  routes: string[];
  constructor(routes: string[] = []) {
    this.routes = routes;
  }

  addRoute(route: string) {
    this.routes.push(route);
  }

  getRoutes() {
    return this.routes;
  }

  getRoute(route: string) {
    return this.routes.find((r) => r === route);
  }

  removeRoute(route: string) {
    this.routes = this.routes.filter((r) => r !== route);
  }

  clearRoutes() {
    this.routes = [];
  }

  isRoute(route: string) {
    return this.routes.includes(route);
  }

  addLocalesToRoutes() {
    if (!this.checkRoutesHaveRightFormat()) {
      const invalidRoute = this.routes.find((route) => !route.startsWith("/"));
      throw new Error("Routes must start with '/' " + `Invalid route: ${invalidRoute}`);
    }
    const routes = this.routes.reduce((acc, route) => {
      SUPPORTED_LOCALES.forEach((locale) => {
        acc.push(this.addLocaleToRoute(route, locale));
      });

      return acc;
    }, [] as string[]);

    this.routes = this.routes.concat(routes);

    return this;
  }

  isRouteWithLocaleSupported(routeWithLocale: string) {
    const pathnameWithoutLocale = routeWithLocale.replace(/^\/(en|es)/, "");
    const path = pathnameWithoutLocale === "" ? "/" : pathnameWithoutLocale;

    const route = this.getRoute(path);

    return route === path;
  }

  static isRouteSupported(route: string, pathname: string) {
    // first remove the locale from the pathname
    const pathnameWithoutLocale = pathname.replace(/^\/(en|es)/, "");
    const path = pathnameWithoutLocale === "" ? "/" : pathnameWithoutLocale;

    return route === path;
  }

  static addLocale(route: string, locale: string) {
    const regex = new RegExp(`^/(${locale})`);
    const endpoint = route.replace(regex, "");
    return `/${locale}${endpoint}`;
  }

  static isMissingLocale(route: string): boolean {
    return SUPPORTED_LOCALES.every(
      (locale) => !route.startsWith(`/${locale}/`) && route !== `/${locale}`
    );
  }

  static removeLocale(routeWithLocale: string) {
    const pathnameWithoutLocale = routeWithLocale.replace(/^\/(en|es)/, "");
    const path = pathnameWithoutLocale === "" ? "/" : pathnameWithoutLocale;

    return path;
  }
  private addLocaleToRoute(route: string, locale: string) {
    const regex = new RegExp(`^/(${locale})`);
    const endpoint = route.replace(regex, "");
    return `/${locale}${endpoint}`;
  }

  private checkRoutesHaveRightFormat() {
    return this.routes.every((route) => {
      return route.startsWith("/");
    });
  }
}

export default Router;
