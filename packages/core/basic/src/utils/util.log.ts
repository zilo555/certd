import log4js, { LoggingEvent, Logger } from "log4js";

const OutputAppender = {
  configure: (config: any, layouts: any, findAppender: any, levels: any) => {
    let layout = layouts.basicLayout;
    if (config.layout) {
      layout = layouts.layout(config.layout.type, config.layout);
    }
    function customAppender(layout: any, timezoneOffset: any) {
      return (loggingEvent: LoggingEvent) => {
        if (loggingEvent.context.outputHandler?.write) {
          const text = `${layout(loggingEvent, timezoneOffset)}\n`;
          loggingEvent.context.outputHandler.write(text);
        }
      };
    }
    return customAppender(layout, config.timezoneOffset);
  },
};

let logFilePath = "./logs/app.log";
export function resetLogConfigure() {
  // @ts-ignore
  log4js.configure({
    appenders: {
      std: { type: "stdout" },
      output: { type: OutputAppender },
      file: {
        type: "dateFile",
        filename: logFilePath,
        keepFileExt: true,
        compress: true,
        numBackups: 3,
      },
    },
    categories: { default: { appenders: ["std", "file"], level: "info" }, pipeline: { appenders: ["std", "file", "output"], level: "info" } },
  });
}
resetLogConfigure();
export const logger = log4js.getLogger("default");

export function resetLogFilePath(filePath: string) {
  logFilePath = filePath;
  resetLogConfigure();
}
export function buildLogger(write: (text: string) => void) {
  const logger = log4js.getLogger("pipeline");
  const _secrets: string[] = [];
  //@ts-ignore
  logger.addSecret = (secret: string) => {
    _secrets.push(secret);
  };
  logger.addContext("outputHandler", {
    write: (text: string) => {
      for (const item of _secrets) {
        if (item == null) {
          continue;
        }
        //换成同长度的*号， item可能有多行
        text = text.replaceAll(item, "*".repeat(item.length));
      }
      write(text);
    },
  });
  return logger;
}

export type ILogger = Logger;
