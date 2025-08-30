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
    
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[AUTH_ERROR] ${action}:`, errorLog);
    }

    
    this.sendToLoggingService(errorLog);
  }


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

    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AUTH_SUCCESS] ${action}:`, successLog);
    }

    
    this.sendToAnalytics(successLog);
  }

  
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
    
    
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  private sanitizeErrorMessage(message: string): string {
   
    return message
      .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]') 
      .replace(/\b\d{4,}\b/g, '[NUMBER]') 
      .replace(/password/gi, '[PASSWORD]') 
      .substring(0, 500);
  }

  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
    if (!metadata) return {};
    
    const sanitized = { ...metadata };
    
  
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.credential;
    
    return sanitized;
  }

  private sendToLoggingService(errorLog: ErrorLog): void {
    
    
    if (process.env.NODE_ENV === 'production') {
     
    }
  }

  private sendToAnalytics(successLog: any): void {
   
    
    if (process.env.NODE_ENV === 'production') {
    
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

   
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`auth-${flowName}-${success ? 'success' : 'error'}`);
    }
  },

  
  trackUserEngagement: (action: string, userId?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[USER_ENGAGEMENT] ${action} - User: ${userId || 'anonymous'}`);
    }

    
  },

  
  trackDatabaseOperation: (operation: string, success: boolean, duration: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB_OPERATION] ${operation}: ${duration}ms - ${success ? 'SUCCESS' : 'FAILED'}`);
    }

   
    if (duration > 5000) { 
      authErrorLogger.logAuthError(
        `slow-database-operation-${operation}`,
        new Error(`Database operation took ${duration}ms`),
        undefined,
        'high'
      );
    }
  }
};
