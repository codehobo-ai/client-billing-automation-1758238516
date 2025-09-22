/**
 * Logs API Endpoint
 * Provides access to automation logs and monitoring data
 */

const { getMonitor } = require('../utils/monitoring');
const { createLogger } = require('../utils/logger');

export default async function handler(req, res) {
  const logger = createLogger('logs-api');
  const monitor = getMonitor();

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action = 'status' } = req.query;

    switch (action) {
      case 'status':
        const health = monitor.getHealthStatus();
        logger.info('Health status requested', health);
        return res.status(200).json({
          status: 'ok',
          timestamp: new Date(),
          health
        });

      case 'report':
        const report = monitor.generateReport();
        logger.info('Monitoring report requested');
        return res.status(200).json({
          status: 'ok',
          report
        });

      case 'metrics':
        return res.status(200).json({
          status: 'ok',
          metrics: monitor.metrics,
          alerts: monitor.alerts.slice(-5) // Last 5 alerts
        });

      default:
        return res.status(400).json({
          error: 'Invalid action',
          available: ['status', 'report', 'metrics']
        });
    }

  } catch (error) {
    logger.error('Logs API error', { error: error.message });
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}