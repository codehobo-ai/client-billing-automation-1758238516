/**
 * Comprehensive Logging System
 * Provides structured logging with multiple outputs and log levels
 */

const fs = require('fs');
const path = require('path');

class Logger {
  constructor(context = 'automation', options = {}) {
    this.context = context;
    this.logLevel = options.logLevel || process.env.LOG_LEVEL || 'info';
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile || false;
    this.logDir = options.logDir || './logs';
    this.runId = options.runId || this.generateRunId();

    // Log levels (lower number = higher priority)
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };

    // Create logs directory if file logging enabled
    if (this.enableFile) {
      this.ensureLogDirectory();
    }

    // Session tracking
    this.session = {
      startTime: new Date(),
      runId: this.runId,
      context: this.context,
      events: []
    };

    this.info('Logger initialized', {
      context: this.context,
      runId: this.runId,
      logLevel: this.logLevel
    });
  }

  /**
   * Generate unique run ID
   */
  generateRunId() {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format log entry
   */
  formatLog(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      context: this.context,
      runId: this.runId,
      message,
      ...metadata
    };

    return logEntry;
  }

  /**
   * Output log to console
   */
  outputConsole(logEntry) {
    if (!this.enableConsole) return;

    const { timestamp, level, context, message } = logEntry;
    const timeStr = new Date(timestamp).toLocaleTimeString();

    // Color coding
    const colors = {
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      INFO: '\x1b[32m',    // Green
      DEBUG: '\x1b[36m',   // Cyan
      TRACE: '\x1b[90m'    // Gray
    };
    const resetColor = '\x1b[0m';

    const levelColor = colors[level] || '';
    const prefix = `${levelColor}[${timeStr}] ${level}${resetColor} [${context}]`;

    console.log(`${prefix} ${message}`);

    // Show metadata if present
    if (Object.keys(logEntry).length > 5) { // More than standard fields
      const metadata = { ...logEntry };
      delete metadata.timestamp;
      delete metadata.level;
      delete metadata.context;
      delete metadata.runId;
      delete metadata.message;

      if (Object.keys(metadata).length > 0) {
        console.log(`${' '.repeat(prefix.length - 10)} ${JSON.stringify(metadata, null, 2)}`);
      }
    }
  }

  /**
   * Output log to file
   */
  outputFile(logEntry) {
    if (!this.enableFile) return;

    const logFile = path.join(this.logDir, `${this.context}-${this.runId}.json`);
    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(logFile, logLine);
  }

  /**
   * Core logging method
   */
  log(level, message, metadata = {}) {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatLog(level, message, metadata);

    // Track event in session
    this.session.events.push(logEntry);

    // Output to configured destinations
    this.outputConsole(logEntry);
    this.outputFile(logEntry);

    return logEntry;
  }

  /**
   * Log levels
   */
  error(message, metadata = {}) {
    return this.log('error', message, metadata);
  }

  warn(message, metadata = {}) {
    return this.log('warn', message, metadata);
  }

  info(message, metadata = {}) {
    return this.log('info', message, metadata);
  }

  debug(message, metadata = {}) {
    return this.log('debug', message, metadata);
  }

  trace(message, metadata = {}) {
    return this.log('trace', message, metadata);
  }

  /**
   * Specialized logging methods
   */

  /**
   * Log service start
   */
  serviceStart(serviceName, config = {}) {
    return this.info(`🚀 Starting ${serviceName}`, {
      service: serviceName,
      type: 'service_start',
      config: this.sanitizeConfig(config)
    });
  }

  /**
   * Log service completion
   */
  serviceComplete(serviceName, result = {}) {
    return this.info(`✅ ${serviceName} completed`, {
      service: serviceName,
      type: 'service_complete',
      result
    });
  }

  /**
   * Log service error
   */
  serviceError(serviceName, error, context = {}) {
    return this.error(`❌ ${serviceName} failed`, {
      service: serviceName,
      type: 'service_error',
      error: error.message || error,
      stack: error.stack,
      context
    });
  }

  /**
   * Log API call
   */
  apiCall(method, url, status, duration, metadata = {}) {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    return this.log(level, `${method} ${url} - ${status}`, {
      type: 'api_call',
      method,
      url,
      status,
      duration,
      ...metadata
    });
  }

  /**
   * Log workflow step
   */
  workflowStep(step, status, metadata = {}) {
    const emoji = status === 'start' ? '🔄' : status === 'complete' ? '✅' : status === 'error' ? '❌' : '📝';
    return this.info(`${emoji} ${step} - ${status}`, {
      type: 'workflow_step',
      step,
      status,
      ...metadata
    });
  }

  /**
   * Log data operation
   */
  dataOperation(operation, resource, count, metadata = {}) {
    return this.info(`📊 ${operation} ${resource}`, {
      type: 'data_operation',
      operation,
      resource,
      count,
      ...metadata
    });
  }

  /**
   * Sanitize configuration to remove sensitive data
   */
  sanitizeConfig(config) {
    const sanitized = { ...config };
    const sensitiveKeys = ['password', 'key', 'secret', 'token', 'auth', 'credential'];

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  /**
   * Generate session summary
   */
  getSessionSummary() {
    const duration = Date.now() - this.session.startTime.getTime();
    const eventCounts = this.session.events.reduce((acc, event) => {
      acc[event.level] = (acc[event.level] || 0) + 1;
      return acc;
    }, {});

    return {
      runId: this.runId,
      context: this.context,
      startTime: this.session.startTime,
      duration,
      totalEvents: this.session.events.length,
      eventCounts,
      services: [...new Set(this.session.events
        .filter(e => e.service)
        .map(e => e.service)
      )]
    };
  }

  /**
   * Export session logs
   */
  exportSession(format = 'json') {
    const summary = this.getSessionSummary();

    if (format === 'json') {
      return {
        summary,
        events: this.session.events
      };
    }

    if (format === 'text') {
      let output = `=== Session Summary ===\n`;
      output += `Run ID: ${summary.runId}\n`;
      output += `Context: ${summary.context}\n`;
      output += `Duration: ${Math.round(summary.duration / 1000)}s\n`;
      output += `Total Events: ${summary.totalEvents}\n`;
      output += `Services: ${summary.services.join(', ')}\n\n`;

      output += `=== Event Counts ===\n`;
      Object.entries(summary.eventCounts).forEach(([level, count]) => {
        output += `${level.toUpperCase()}: ${count}\n`;
      });

      output += `\n=== Events ===\n`;
      this.session.events.forEach(event => {
        const time = new Date(event.timestamp).toLocaleTimeString();
        output += `[${time}] ${event.level} - ${event.message}\n`;
      });

      return output;
    }

    return summary;
  }

  /**
   * Save session to file
   */
  saveSession(filename = null) {
    if (!this.enableFile) {
      this.enableFile = true;
      this.ensureLogDirectory();
    }

    const sessionFile = filename || path.join(this.logDir, `session-${this.runId}.json`);
    const sessionData = this.exportSession('json');

    fs.writeFileSync(sessionFile, JSON.stringify(sessionData, null, 2));
    this.info('Session saved', { file: sessionFile });

    return sessionFile;
  }

  /**
   * Finalize logging session
   */
  finalize() {
    const summary = this.getSessionSummary();
    this.info('Session completed', summary);

    if (this.enableFile) {
      this.saveSession();
    }

    return summary;
  }
}

/**
 * Create logger instance with automatic GitHub Actions detection
 */
function createLogger(context, options = {}) {
  const defaultOptions = {
    enableConsole: true,
    enableFile: process.env.GITHUB_ACTIONS === 'true', // Auto-enable file logging in GitHub Actions
    logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    runId: process.env.GITHUB_RUN_ID || undefined
  };

  return new Logger(context, { ...defaultOptions, ...options });
}

module.exports = { Logger, createLogger };