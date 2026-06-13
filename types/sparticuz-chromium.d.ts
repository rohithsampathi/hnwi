declare module '@sparticuz/chromium' {
  const chromium: {
    args: string[];
    defaultViewport: any;
    executablePath: () => Promise<string>;
    headless: boolean | 'shell';
  };

  export default chromium;
}
