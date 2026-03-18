const timestamp = () => new Date().toISOString();

const logger = {
  info: (message: string, ...args: any[]) =>
    console.log(`[${timestamp()}] INFO: ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[${timestamp()}] ERROR: ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[${timestamp()}] WARN: ${message}`, ...args),
};

export default logger;
