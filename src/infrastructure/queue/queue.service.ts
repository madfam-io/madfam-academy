export interface QueueJob {
  id: string;
  data: any;
  priority?: number;
  delay?: number;
}

export interface QueueService {
  add(queueName: string, job: QueueJob): Promise<void>;
  process(queueName: string, processor: (job: QueueJob) => Promise<void>): Promise<void>;
  getJobCount(queueName: string): Promise<number>;
  clean(queueName: string, grace?: number): Promise<void>;
}

export class MemoryQueueService implements QueueService {
  private queues: Map<string, QueueJob[]> = new Map();

  async add(queueName: string, job: QueueJob): Promise<void> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    this.queues.get(queueName)!.push(job);
  }

  async process(queueName: string, processor: (job: QueueJob) => Promise<void>): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) return;

    while (queue.length > 0) {
      const job = queue.shift()!;
      await processor(job);
    }
  }

  async getJobCount(queueName: string): Promise<number> {
    return this.queues.get(queueName)?.length || 0;
  }

  async clean(queueName: string, grace?: number): Promise<void> {
    this.queues.set(queueName, []);
  }

  async getHealth(): Promise<{ status: string }> {
    return { status: 'healthy' };
  }
}