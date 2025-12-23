import { IProvider } from '../interfaces';

export class ProviderRegistry {
  private providers: Map<string, IProvider>;

  constructor() {
    this.providers = new Map();
  }

  register(provider: IProvider): void {
    this.providers.set(provider.name, provider);
  }

  unregister(name: string): void {
    this.providers.delete(name);
  }

  get(name: string): IProvider | undefined {
    return this.providers.get(name);
  }

  getAll(): IProvider[] {
    return Array.from(this.providers.values());
  }

  has(name: string): boolean {
    return this.providers.has(name);
  }
}
