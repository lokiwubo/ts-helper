import { FunctionLike } from "@/lib/like";

export class Observer<TSubscriber extends FunctionLike, TData> {
  private subscribers: TSubscriber[] = [];
  subscribe(callback: TSubscriber) {
    this.subscribers.push(callback);
  }
  unsubscribe(callback: TSubscriber) {
    this.subscribers = this.subscribers.filter(
      (subscriber) => subscriber !== callback
    );
  }
  notify(data: TData, preData: TData) {
    this.subscribers.forEach((callback) => callback(data, preData));
  }
}
