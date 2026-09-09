// logger.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import util from "node:util";

// Resolve __dirname in ES Modules (since it's not globally available)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, "./../../appLogs.log"); // At project level outside src
const logStream = fs.createWriteStream(logFilePath, { flags: "a" }); // 'a' appends to the file

// Keep references to the original console methods if you still want terminal output
const originalInfo = console.info;
const originalError = console.error;

type LogType = "INFO" | "ERROR";

// Helper to format arguments into a single string line
const formatArgs = (logType: LogType, args: any[]): string => {
  const timestamp = new Date().toISOString();

  // util.format handles string interpolation and object serialization smoothly
  const message = util.format(...args);
  return `${timestamp} [${logType}]: ${message}\n`;
};

// Override console.info
console.info = function (...args: any[]): void {
  logStream.write(formatArgs("INFO", args));
  originalInfo.apply(console, args); // Optional: keeps printing to the terminal
};

// Override console.error (captures console.warn as well depending on implementation)
console.error = function (...args: any[]): void {
  logStream.write(formatArgs("ERROR", args));
  originalError.apply(console, args); // Optional: keeps printing to the terminal
};
