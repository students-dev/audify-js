export class ProviderRegistry {
    constructor() {
        this.providers = new Map();
    }
    register(provider) {
        this.providers.set(provider.name, provider);
    }
    unregister(name) {
        this.providers.delete(name);
    }
    get(name) {
        return this.providers.get(name);
    }
    getAll() {
        return Array.from(this.providers.values());
    }
    has(name) {
        return this.providers.has(name);
    }
}
