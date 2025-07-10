export interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export interface MetricsCollector {
  increment(metricName: string, tags?: Record<string, string>): void;
  gauge(metricName: string, value: number, tags?: Record<string, string>): void;
  histogram(metricName: string, value: number, tags?: Record<string, string>): void;
  timing(metricName: string, value: number, tags?: Record<string, string>): void;
}

export class InMemoryMetricsCollector implements MetricsCollector {
  private metrics: Metric[] = [];

  increment(metricName: string, tags?: Record<string, string>): void {
    this.metrics.push({
      name: metricName,
      value: 1,
      tags,
      timestamp: new Date()
    });
  }

  gauge(metricName: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name: metricName,
      value,
      tags,
      timestamp: new Date()
    });
  }

  histogram(metricName: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name: metricName,
      value,
      tags,
      timestamp: new Date()
    });
  }

  timing(metricName: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name: metricName,
      value,
      tags,
      timestamp: new Date()
    });
  }

  incrementCounter(metricName: string, tags?: Record<string, string>): void {
    this.increment(metricName, tags);
  }

  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
  }
}