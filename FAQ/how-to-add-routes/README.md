# Add new routes

1. create a folder in app directory such as you can read in Nextjs docs
2. create a page.tsx file in the created directory
3. go to **src/utils/constants/pathnames/index.ts** and add the created route. This is just a constant, it prevents that you hand write every time the route and prevents typing errors.
4. go to **src/middleware.ts** in the matcher object add the route with their locales, for instance:
   1. /test
   2. /es/test
   3. /en/test
   4. /fr/test
5. close the terminal and restart it
