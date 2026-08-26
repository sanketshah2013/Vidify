import { createLogger, format, Logger, transports } from "winston";

const logFormat = format.combine(
  format.timestamp(),
  format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  }),
);

const fileTransport = new transports.File({
  filename: "appLogs.log",
  format: logFormat,
  handleExceptions: true,
  handleRejections: true,
});

const logger: Logger = createLogger({ transports: [fileTransport] });

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: logFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
  );
}

export default logger;
