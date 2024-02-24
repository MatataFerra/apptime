import { devices, PlaywrightTestConfig } from "@playwright/test";
import path from "path";

// ignore test
const IGNORE_TEST_DESKTOP = [
  /.*login.spec.ts/,
  /.*register.spec.ts/,
  /.*home-form.spec.ts/,
  /.*shift-track.spec.ts/,
  /.*fast-charge.spec.ts/,
  /.*history-shift.spec.ts/,
];
const IGNORE_TEST_MOBILE = [/.*no-mobile.spec.ts/];

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT || 3000;

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`;

// Reference: https://playwright.dev/docs/test-configuration
const config: PlaywrightTestConfig = {
  // Timeout per test
  timeout: 30 * 1000,
  // Test directory
  testDir: path.join(__dirname, "e2e"),
  testMatch: /.*.spec.ts/,
  // If a test fails, retry it additional 2 times
  retries: 1,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: "test-results/",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
    ["html", { outputFile: "test-results/results.html" }],
  ],

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: "yarn dev",
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,
    video: "on",
    screenshot: "on",
    locale: "en",
    viewport: { width: 1600, height: 1200 },

    // Retry a test if its failing with enabled tracing. This allows you to analyse the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: "retry-with-trace",

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    // contextOptions: {
    //   ignoreHTTPSErrors: true,
    // },
  },

  projects: [
    {
      name: "Desktop Chrome",
      testIgnore: IGNORE_TEST_DESKTOP,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "Desktop Firefox",
      testIgnore: IGNORE_TEST_DESKTOP,
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "Desktop Safari",
      testIgnore: IGNORE_TEST_DESKTOP,
      use: {
        ...devices["Desktop Safari"],
      },
    },
    // Test against mobile viewports.
    {
      name: "Mobile Chrome",
      testIgnore: IGNORE_TEST_MOBILE,
      use: {
        ...devices["Pixel 5"],
      },
    },
    // {
    //   name: "Mobile Safari",
    //   testIgnore: /.*no-mobile.spec.ts/,
    //   use: devices["iPhone 12"],
    // },
  ],
};
export default config;
