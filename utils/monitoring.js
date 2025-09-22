/**
 * Monitoring and Alerting System
 * Tracks automation health and sends notifications
 */

const { createLogger } = require('./logger');

class AutomationMonitor {
  constructor(options = {}) {
    this.logger = createLogger('monitor', options);
    this.metrics = {
      deployments: 0,
      successes: 0,
      failures: 0,
      services: {},
      startTime: Date.now()
    };
    this.alerts = [];
  }

  /**
   * Track deployment start
   */
  trackDeploymentStart(runId, services, clientName) {
    this.metrics.deployments++;

    this.logger.serviceStart('deployment', {
      runId,
      services,
      clientName,
      deploymentCount: this.metrics.deployments
    });

    // Track service usage
    services.forEach(service => {
      this.metrics.services[service] = (this.metrics.services[service] || 0) + 1;
    });

    return {
      runId,
      startTime: Date.now(),
      services,
      clientName
    };
  }

  /**
   * Track deployment completion
   */
  trackDeploymentComplete(runId, success, duration, details = {}) {
    if (success) {
      this.metrics.successes++;
      this.logger.serviceComplete('deployment', {
        runId,
        duration,
        success: true,
        ...details
      });
    } else {
      this.metrics.failures++;
      this.logger.serviceError('deployment', new Error('Deployment failed'), {
        runId,
        duration,
        ...details
      });

      // Create alert for failure
      this.createAlert('deployment_failure', {
        runId,
        duration,
        details
      });
    }
  }

  /**
   * Track service-specific metrics
   */
  trackServiceMetrics(service, operation, metadata = {}) {
    this.logger.dataOperation(operation, service, 1, metadata);

    // Track service health
    const serviceKey = `${service}_${operation}`;
    if (!this.metrics.services[serviceKey]) {
      this.metrics.services[serviceKey] = { count: 0, failures: 0 };
    }

    this.metrics.services[serviceKey].count++;

    if (metadata.error) {
      this.metrics.services[serviceKey].failures++;
    }
  }

  /**
   * Create alert
   */
  createAlert(type, data) {
    const alert = {
      id: `${type}_${Date.now()}`,
      type,
      timestamp: new Date(),
      data,
      severity: this.getAlertSeverity(type)
    };

    this.alerts.push(alert);
    this.logger.error(`🚨 Alert: ${type}`, alert);

    return alert;
  }

  /**
   * Get alert severity
   */
  getAlertSeverity(type) {
    const severityMap = {
      deployment_failure: 'high',
      service_unavailable: 'high',
      rate_limit: 'medium',
      validation_error: 'low'
    };

    return severityMap[type] || 'medium';
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    const total = this.metrics.successes + this.metrics.failures;
    const successRate = total > 0 ? (this.metrics.successes / total) * 100 : 100;

    const uptime = Date.now() - this.metrics.startTime;
    const recentFailures = this.alerts.filter(
      alert => Date.now() - alert.timestamp.getTime() < 300000 // Last 5 minutes
    ).length;

    let status = 'healthy';
    if (successRate < 50 || recentFailures > 3) {
      status = 'critical';
    } else if (successRate < 80 || recentFailures > 1) {
      status = 'warning';
    }

    return {
      status,
      successRate: Math.round(successRate),
      totalDeployments: this.metrics.deployments,
      successes: this.metrics.successes,
      failures: this.metrics.failures,
      uptime,
      recentFailures,
      services: this.metrics.services
    };
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    const health = this.getHealthStatus();
    const report = {
      timestamp: new Date(),
      health,
      metrics: this.metrics,
      recentAlerts: this.alerts.slice(-10) // Last 10 alerts
    };

    this.logger.info('📊 Monitoring Report Generated', report);
    return report;
  }

  /**
   * Send webhook notification
   */
  async sendWebhookNotification(webhookUrl, event, data) {
    if (!webhookUrl) return;

    try {
      const payload = {
        event,
        timestamp: new Date(),
        data,
        health: this.getHealthStatus()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      this.logger.info('📤 Webhook sent', {
        url: webhookUrl,
        event,
        status: response.status
      });

    } catch (error) {
      this.logger.error('❌ Webhook failed', { error: error.message });
    }
  }
}

/**
 * Global monitoring instance
 */
let globalMonitor = null;

function getMonitor() {
  if (!globalMonitor) {
    globalMonitor = new AutomationMonitor();
  }
  return globalMonitor;
}

module.exports = { AutomationMonitor, getMonitor };