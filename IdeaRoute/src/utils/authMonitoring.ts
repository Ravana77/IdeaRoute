interface ErrorLog {
  timestamp: Date;
  errorCode?: string;
  errorMessage: string;
  userAgent: string;
  url: string;
  userId?: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuthErrorLogger {
  private static instance: AuthErrorLogger;
  private errorQueue: ErrorLog[] = [];
  private readonly maxQueueSize = 100;

  static getInstance(): AuthErrorLogger {
    if (!AuthErrorLogger.instance) {
      AuthErrorLogger.instance = new AuthErrorLogger();
    }
    return AuthErrorLogger.instance;
  }

  /**
   * Log authentication errors for monitoring (production-safe)
   */
  logAuthError(
    action: string,
    error: any,
    userId?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    if (typeof window === 'undefined') return;

    const errorLog: ErrorLog = {
      timestamp: new Date(),
      errorCode: error?.code,
      errorMessage: this.sanitizeErrorMessage(error?.message || 'Unknown error'),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: userId,
      action,
      severity
    };

    this.addToQueue(errorLog);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AUTH_ERROR] ${action}:`, errorLog);
    }

    // In production, you would send to your logging service
    this.sendToLoggingService(errorLog);
  }

  /**
   * Log successful authentication events for analytics
   */
  logAuthSuccess(action: string, userId?: string, metadata?: Record<string, any>): void {
    if (typeof window === 'undefined') return;

    const successLog = {
      timestamp: new Date(),
      action,
      userId,
      url: window.location.href,
      metadata: this.sanitizeMetadata(metadata),
      type: 'success'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH_SUCCESS] ${action}:`, successLog);
    }

    // Send to analytics service
    this.sendToAnalytics(successLog);
  }

  /**
   * Get error statistics for monitoring dashboard
   */
  getErrorStats(): { total: number; bySeverity: Record<string, number>; byAction: Record<string, number> } {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: {} as Record<string, number>,
      byAction: {} as Record<string, number>
    };

    this.errorQueue.forEach(error => {
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      stats.byAction[error.action] = (stats.byAction[error.action] || 0) + 1;
    });

    return stats;
  }

  private addToQueue(errorLog: ErrorLog): void {
    this.errorQueue.push(errorLog);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    return message
      .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]') // Remove emails
      .replace(/\b\d{4,}\b/g, '[NUMBER]') // Remove long numbers
      .replace(/password/gi, '[PASSWORD]') // Remove password references
      .substring(0, 500); // Limit length
  }

  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
    if (!metadata) return {};
    
    const sanitized = { ...metadata };
    
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.credential;
    
    return sanitized;
  }

  private sendToLoggingService(errorLog: ErrorLog): void {
    // In production, implement your logging service integration
    // Examples: Sentry, LogRocket, DataDog, CloudWatch, etc.
    
    if (process.env.NODE_ENV === 'production') {
      // Example implementation:
      // Sentry.captureException(new Error(errorLog.errorMessage), {
      //   tags: { action: errorLog.action, severity: errorLog.severity },
      //   extra: errorLog
      // });
    }
  }

  private sendToAnalytics(successLog: any): void {
    // In production, implement your analytics service integration
    // Examples: Google Analytics, Mixpanel, Amplitude, etc.
    
    if (process.env.NODE_ENV === 'production') {
      // Example implementation:
      // gtag('event', successLog.action, {
      //   event_category: 'authentication',
      //   event_label: successLog.metadata?.provider
      // });
    }
  }
}

export const authErrorLogger = AuthErrorLogger.getInstance();

export const AuthMonitoring = {
  trackAuthFlow: (flowName: string, startTime: number, success: boolean) => {
    const duration = Date.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH_PERFORMANCE] ${flowName}: ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`);
    }

    // In production, send to performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`auth-${flowName}-${success ? 'success' : 'error'}`);
    }
  },

  /**
   * Track user engagement metrics
   */
  trackUserEngagement: (action: string, userId?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[USER_ENGAGEMENT] ${action} - User: ${userId || 'anonymous'}`);
    }

    // In production, send to analytics
  },

  /**
   * Monitor database operation performance
   */
  trackDatabaseOperation: (operation: string, success: boolean, duration: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB_OPERATION] ${operation}: ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`);
    }

    // Track slow operations
    if (duration > 5000) { // 5 seconds
      authErrorLogger.logAuthError(
        `slow-database-operation-${operation}`,
        new Error(`Database operation took ${duration}ms`),
        undefined,
        'high'
      );
    }
  }
};
