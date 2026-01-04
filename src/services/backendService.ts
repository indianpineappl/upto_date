import axios from 'axios';
import { LocationData, Topic } from '../types';

type FeedResponse = {
  bucketId: string;
  snapshotDate: string;
  topics: Topic[];
};

type TrackEvent = {
  type: string;
  ts?: number;
  topicId?: string;
  subtopicId?: string;
  dwellMs?: number;
};

export class BackendService {
  private static instance: BackendService;

  private constructor() {}

  public static getInstance() {
    if (!BackendService.instance) {
      BackendService.instance = new BackendService();
    }
    return BackendService.instance;
  }

  public getOrCreateUserId(): string {
    const key = 'uptodate_user_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const id = `u_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    localStorage.setItem(key, id);
    return id;
  }

  public setLastFeedContext(ctx: { bucketId: string; snapshotDate: string }) {
    localStorage.setItem('uptodate_last_bucket_id', ctx.bucketId);
    localStorage.setItem('uptodate_last_snapshot_date', ctx.snapshotDate);
  }

  public getLastFeedContext(): { bucketId: string; snapshotDate: string } {
    return {
      bucketId: localStorage.getItem('uptodate_last_bucket_id') || 'global',
      snapshotDate: localStorage.getItem('uptodate_last_snapshot_date') || ''
    };
  }

  public async fetchFeed(location?: LocationData): Promise<FeedResponse> {
    const userId = this.getOrCreateUserId();

    const params: Record<string, string> = {
      userId
    };

    if (location) {
      params.lat = String(location.latitude);
      params.lng = String(location.longitude);
    }

    const res = await axios.get<FeedResponse>('/.netlify/functions/feed', { params });
    if (res.data?.bucketId && res.data?.snapshotDate) {
      this.setLastFeedContext({ bucketId: res.data.bucketId, snapshotDate: res.data.snapshotDate });
    }
    return res.data;
  }

  public async sendEvents(payload: {
    bucketId: string;
    snapshotDate: string;
    events: TrackEvent[];
  }): Promise<void> {
    const userId = this.getOrCreateUserId();

    const ctx = this.getLastFeedContext();
    const bucketId = payload.bucketId || ctx.bucketId;
    const snapshotDate = payload.snapshotDate || ctx.snapshotDate;

    await axios.post('/.netlify/functions/events', {
      userId,
      bucketId,
      snapshotDate,
      events: payload.events
    });
  }
}

export default BackendService.getInstance();
